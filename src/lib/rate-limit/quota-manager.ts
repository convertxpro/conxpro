import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { getCurrentPKTDate, getSecondsUntilPKTMidnight, getPKTResetISOString } from './pkt-time';
import { isSearchEngineBot } from './bot-guard';

export const QUOTA_TIERS = {
  anonymous: { 
    name: 'Anonymous Visitor',
    dailyLimit: 10, 
    maxFileSizeBytes: 25 * 1024 * 1024, // 25 MB
    maxFileSizeDisplay: '25 MB'
  },
  free: { 
    name: 'Free Account',
    dailyLimit: 25, 
    maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB
    maxFileSizeDisplay: '100 MB'
  },
  pro: { 
    name: 'Pro Account',
    dailyLimit: 999999, 
    maxFileSizeBytes: 1024 * 1024 * 1024, // 1 GB+
    maxFileSizeDisplay: '1 GB+'
  },
} as const;

export type UserTier = keyof typeof QUOTA_TIERS;

// Initialize Upstash Redis if environment credentials are present
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
    console.warn('Failed to initialize Upstash Redis, falling back to memory store:', err);
    redisClient = null;
  }
}

// In-memory fallback map for offline development or missing Redis credentials
// Key format: `${quotaKey}` -> { count: number, expiresAt: number }
const inMemoryQuotaStore = new Map<string, { count: number; expiresAt: number }>();

function cleanupExpiredInMemoryKeys(): void {
  const now = Date.now();
  inMemoryQuotaStore.forEach((val, key) => {
    if (val.expiresAt <= now) {
      inMemoryQuotaStore.delete(key);
    }
  });
}

/**
 * Anonymizes client IP addresses using SHA-256 HMAC
 */
export function hashIp(ip: string): string {
  const cleanIp = ip.replace(/^::ffff:/, '').trim();
  const salt = process.env.IP_HASH_SALT || 'apextools_secure_pkt_salt_2026';
  return crypto.createHmac('sha256', salt).update(cleanIp).digest('hex').substring(0, 32);
}

export interface QuotaCheckResult {
  allowed: boolean;
  tier: UserTier;
  limit: number;
  used: number;
  remaining: number;
  maxFileSizeBytes: number;
  maxFileSizeDisplay: string;
  resetsInSeconds: number;
  resetsAt: string;
  isBot?: boolean;
}

/**
 * Checks and increments the conversion quota for the given user ID or client IP
 */
export async function checkAndIncrementQuota(params: {
  userId?: string | null;
  clientIp: string;
  tier?: UserTier;
  userAgent?: string | null;
}): Promise<QuotaCheckResult> {
  const { userId, clientIp, userAgent } = params;
  const tier: UserTier = params.tier || (userId ? 'free' : 'anonymous');
  const pktDate = getCurrentPKTDate();
  const ttlSeconds = getSecondsUntilPKTMidnight();
  const resetsAt = getPKTResetISOString();
  const config = QUOTA_TIERS[tier] || QUOTA_TIERS.anonymous;

  // 1. Unhindered access for verified search engine crawlers
  if (isSearchEngineBot(userAgent)) {
    return {
      allowed: true,
      tier: 'pro',
      limit: 999999,
      used: 0,
      remaining: 999999,
      maxFileSizeBytes: QUOTA_TIERS.pro.maxFileSizeBytes,
      maxFileSizeDisplay: QUOTA_TIERS.pro.maxFileSizeDisplay,
      resetsInSeconds: ttlSeconds,
      resetsAt,
      isBot: true,
    };
  }

  // 2. Formulate storage key
  const quotaKey = userId
    ? `quota:user:${pktDate}:${userId}`
    : `quota:ip:${pktDate}:${hashIp(clientIp)}`;

  let count = 1;

  // 3. Increment counter (Upstash Redis or In-Memory fallback)
  if (redisClient) {
    try {
      count = await redisClient.incr(quotaKey);
      if (count === 1) {
        await redisClient.expire(quotaKey, ttlSeconds);
      }
    } catch (redisErr) {
      console.warn('Redis increment error, using in-memory fallback:', redisErr);
      count = incrementInMemory(quotaKey, ttlSeconds);
    }
  } else {
    count = incrementInMemory(quotaKey, ttlSeconds);
  }

  const allowed = count <= config.dailyLimit;
  const remaining = Math.max(0, config.dailyLimit - count);

  return {
    allowed,
    tier,
    limit: config.dailyLimit,
    used: count,
    remaining,
    maxFileSizeBytes: config.maxFileSizeBytes,
    maxFileSizeDisplay: config.maxFileSizeDisplay,
    resetsInSeconds: ttlSeconds,
    resetsAt,
    isBot: false,
  };
}

/**
 * Returns the current quota status without incrementing the counter
 */
export async function getQuotaStatus(params: {
  userId?: string | null;
  clientIp: string;
  tier?: UserTier;
  userAgent?: string | null;
}): Promise<Omit<QuotaCheckResult, 'allowed'>> {
  const { userId, clientIp, userAgent } = params;
  const tier: UserTier = params.tier || (userId ? 'free' : 'anonymous');
  const pktDate = getCurrentPKTDate();
  const ttlSeconds = getSecondsUntilPKTMidnight();
  const resetsAt = getPKTResetISOString();
  const config = QUOTA_TIERS[tier] || QUOTA_TIERS.anonymous;

  if (isSearchEngineBot(userAgent)) {
    return {
      tier: 'pro',
      limit: 999999,
      used: 0,
      remaining: 999999,
      maxFileSizeBytes: QUOTA_TIERS.pro.maxFileSizeBytes,
      maxFileSizeDisplay: QUOTA_TIERS.pro.maxFileSizeDisplay,
      resetsInSeconds: ttlSeconds,
      resetsAt,
      isBot: true,
    };
  }

  const quotaKey = userId
    ? `quota:user:${pktDate}:${userId}`
    : `quota:ip:${pktDate}:${hashIp(clientIp)}`;

  let used = 0;

  if (redisClient) {
    try {
      const val = await redisClient.get<number | string>(quotaKey);
      used = val ? Number(val) : 0;
    } catch (redisErr) {
      console.warn('Redis get error, reading memory store:', redisErr);
      used = getFromMemory(quotaKey);
    }
  } else {
    used = getFromMemory(quotaKey);
  }

  const remaining = Math.max(0, config.dailyLimit - used);

  return {
    tier,
    limit: config.dailyLimit,
    used,
    remaining,
    maxFileSizeBytes: config.maxFileSizeBytes,
    maxFileSizeDisplay: config.maxFileSizeDisplay,
    resetsInSeconds: ttlSeconds,
    resetsAt,
    isBot: false,
  };
}

/**
 * Helper to validate if an uploaded file exceeds the tier limit
 */
export function validateFileSize(fileSizeBytes: number, tier: UserTier = 'anonymous'): {
  valid: boolean;
  maxBytes: number;
  maxDisplay: string;
} {
  const config = QUOTA_TIERS[tier] || QUOTA_TIERS.anonymous;
  return {
    valid: fileSizeBytes <= config.maxFileSizeBytes,
    maxBytes: config.maxFileSizeBytes,
    maxDisplay: config.maxFileSizeDisplay,
  };
}

// In-Memory Helper Functions
function incrementInMemory(key: string, ttlSeconds: number): number {
  cleanupExpiredInMemoryKeys();
  const now = Date.now();
  const entry = inMemoryQuotaStore.get(key);

  if (!entry || entry.expiresAt <= now) {
    inMemoryQuotaStore.set(key, { count: 1, expiresAt: now + ttlSeconds * 1000 });
    return 1;
  }

  entry.count += 1;
  return entry.count;
}

function getFromMemory(key: string): number {
  cleanupExpiredInMemoryKeys();
  const entry = inMemoryQuotaStore.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    return 0;
  }
  return entry.count;
}
