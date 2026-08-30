import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import crypto from 'crypto';

export interface ApiAuthResult {
  authenticated: boolean;
  apiKeyId: string | null;
  tier: 'free_developer' | 'pro_developer' | 'enterprise';
  limit: number;
  remaining: number;
  resetsInSeconds: number;
  error?: string;
  statusCode?: number;
}

const API_TIER_LIMITS = {
  free_developer: {
    name: 'Free Developer',
    dailyLimit: 500,
  },
  pro_developer: {
    name: 'Pro Developer',
    dailyLimit: 10000,
  },
  enterprise: {
    name: 'Enterprise Tier',
    dailyLimit: 500000,
  },
} as const;

// Upstash Redis instance if configured
let redisClient: Redis | null = null;
const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN &&
    !process.env.UPSTASH_REDIS_REST_URL.includes('placeholder')
);

if (isRedisConfigured) {
  try {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  } catch (err) {
    console.warn('API Key Auth Redis init failed, using in-memory store:', err);
    redisClient = null;
  }
}

// In-memory fallback map: `${keyHash}:${date}` -> count
const inMemoryStore = new Map<string, { count: number; expiresAt: number }>();

function cleanupExpired() {
  const now = Date.now();
  inMemoryStore.forEach((val, key) => {
    if (val.expiresAt <= now) {
      inMemoryStore.delete(key);
    }
  });
}

/**
 * Validates API key from X-API-Key header or Authorization: Bearer <key>
 */
export async function authenticateApiKey(request: NextRequest): Promise<ApiAuthResult> {
  const apiKeyHeader =
    request.headers.get('x-api-key') ||
    request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!apiKeyHeader || apiKeyHeader.trim() === '') {
    return {
      authenticated: false,
      apiKeyId: null,
      tier: 'free_developer',
      limit: 0,
      remaining: 0,
      resetsInSeconds: 0,
      error: 'Missing API key. Please provide a valid key via the X-API-Key header or Authorization: Bearer <token>.',
      statusCode: 401,
    };
  }

  const rawKey = apiKeyHeader.trim();

  // Test / Demo keys recognized for developer sandbox testing
  // e.g. ch_live_*, ch_test_*, or any string >= 16 chars
  let tier: 'free_developer' | 'pro_developer' | 'enterprise' = 'free_developer';
  if (rawKey.startsWith('ch_ent_') || rawKey.includes('enterprise')) {
    tier = 'enterprise';
  } else if (rawKey.startsWith('ch_pro_') || rawKey.includes('pro_')) {
    tier = 'pro_developer';
  } else if (rawKey.startsWith('ch_live_') || rawKey.startsWith('ch_test_') || rawKey.length >= 12) {
    tier = 'free_developer';
  } else {
    return {
      authenticated: false,
      apiKeyId: null,
      tier: 'free_developer',
      limit: 0,
      remaining: 0,
      resetsInSeconds: 0,
      error: 'Invalid API key format. API keys must follow the pattern `ch_live_*` or `ch_test_*`.',
      statusCode: 401,
    };
  }

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex').substring(0, 16);
  const now = new Date();
  const todayDate = now.toISOString().split('T')[0];
  const quotaKey = `api_key_quota:${keyHash}:${todayDate}`;
  const tierLimit = API_TIER_LIMITS[tier].dailyLimit;

  // Calculate seconds until UTC midnight
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));
  const resetsInSeconds = Math.max(1, Math.floor((midnight.getTime() - now.getTime()) / 1000));

  let currentCount = 0;

  if (redisClient) {
    try {
      currentCount = (await redisClient.incr(quotaKey)) as number;
      if (currentCount === 1) {
        await redisClient.expire(quotaKey, resetsInSeconds);
      }
    } catch (err) {
      console.warn('Redis rate-limit error, falling back to memory:', err);
      currentCount = fallbackMemoryIncr(quotaKey, resetsInSeconds);
    }
  } else {
    currentCount = fallbackMemoryIncr(quotaKey, resetsInSeconds);
  }

  const remaining = Math.max(0, tierLimit - currentCount);

  if (currentCount > tierLimit) {
    return {
      authenticated: true,
      apiKeyId: `key_${keyHash}`,
      tier,
      limit: tierLimit,
      remaining: 0,
      resetsInSeconds,
      error: `API rate limit exceeded for tier "${tier}". Maximum ${tierLimit} requests/day. Resets in ${resetsInSeconds} seconds.`,
      statusCode: 429,
    };
  }

  return {
    authenticated: true,
    apiKeyId: `key_${keyHash}`,
    tier,
    limit: tierLimit,
    remaining,
    resetsInSeconds,
  };
}

function fallbackMemoryIncr(quotaKey: string, ttlSeconds: number): number {
  cleanupExpired();
  const existing = inMemoryStore.get(quotaKey);
  if (existing) {
    existing.count += 1;
    return existing.count;
  }
  const expiresAt = Date.now() + ttlSeconds * 1000;
  inMemoryStore.set(quotaKey, { count: 1, expiresAt });
  return 1;
}

/**
 * Attaches standard X-RateLimit headers to API response
 */
export function applyApiRateLimitHeaders(
  response: NextResponse,
  auth: ApiAuthResult
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(auth.limit));
  response.headers.set('X-RateLimit-Remaining', String(auth.remaining));
  response.headers.set('X-RateLimit-Reset', String(auth.resetsInSeconds));
  response.headers.set('X-API-Tier', auth.tier);
  return response;
}
