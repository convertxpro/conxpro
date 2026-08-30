import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { hashIp } from './quota-manager';
import { isSearchEngineBot } from './bot-guard';

export interface BurstLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // UNIX timestamp in ms or seconds
  isBot?: boolean;
}

// 10 requests per 60 seconds sliding window
const BURST_LIMIT = 10;
const BURST_WINDOW_SECONDS = 60;

let ratelimitInstance: Ratelimit | null = null;

const isRedisConfigured = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('placeholder')
);

if (isRedisConfigured) {
  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    ratelimitInstance = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(BURST_LIMIT, `${BURST_WINDOW_SECONDS} s`),
      analytics: false,
      prefix: 'ratelimit:burst',
    });
  } catch (err) {
    console.warn('Failed to initialize Upstash Ratelimit, falling back to in-memory burst limiter:', err);
    ratelimitInstance = null;
  }
}

// In-memory sliding window timestamps array per IP
// Key: hashedIp -> Array of timestamp numbers (ms)
const memoryBurstStore = new Map<string, number[]>();

function checkInMemoryBurst(identifier: string): BurstLimitResult {
  const now = Date.now();
  const windowMs = BURST_WINDOW_SECONDS * 1000;
  const cutoff = now - windowMs;

  const timestamps = (memoryBurstStore.get(identifier) || []).filter((ts) => ts > cutoff);

  if (timestamps.length >= BURST_LIMIT) {
    const oldestTimestamp = timestamps[0];
    const resetTime = oldestTimestamp + windowMs;
    return {
      success: false,
      limit: BURST_LIMIT,
      remaining: 0,
      reset: resetTime,
    };
  }

  timestamps.push(now);
  memoryBurstStore.set(identifier, timestamps);

  return {
    success: true,
    limit: BURST_LIMIT,
    remaining: BURST_LIMIT - timestamps.length,
    reset: now + windowMs,
  };
}

/**
 * Checks sliding window burst rate limit (default: 10 requests / 60 seconds)
 */
export async function checkBurstLimit(
  clientIp: string,
  userAgent?: string | null
): Promise<BurstLimitResult> {
  // Always permit verified search engine crawlers
  if (isSearchEngineBot(userAgent)) {
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
      isBot: true,
    };
  }

  const hashedId = hashIp(clientIp);

  if (ratelimitInstance) {
    try {
      const result = await ratelimitInstance.limit(hashedId);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
        reset: result.reset,
        isBot: false,
      };
    } catch (err) {
      console.warn('Upstash Ratelimit error, falling back to in-memory limiter:', err);
      return checkInMemoryBurst(hashedId);
    }
  }

  return checkInMemoryBurst(hashedId);
}
