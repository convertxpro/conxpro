# SUB-PROMPT 03: Rate Limiting Engine, Quotas, Abuse Prevention & Search Bot Whitelisting

## 1. Context & Objective
ConvertHub provides free conversions to all users but must protect server resources, prevent bot abuse, and incentivize account creation. To achieve this, a multi-layer rate limiting system is required:
1. **Daily Conversion Quotas:** Resets daily at **00:00 Pakistan Standard Time (UTC+5)**.
   - Anonymous (IP-based): **10 conversions / day** (Max file size: **25 MB**)
   - Free Logged-In Account: **25 conversions / day** (Max file size: **100 MB**)
   - Pro Account (Future): **Unlimited** (Max file size: **1 GB+**)
2. **Burst & Upload Rate Limiting:** High-frequency sliding window throttling to prevent DDoS and API flooding (e.g., max 10 upload attempts per minute per IP).
3. **Search Engine Crawler Whitelisting:** Legitimate search engine bots (Googlebot, Bingbot, DuckDuckBot, YandexBot) must NEVER be throttled or blocked from indexing public tool pages, static formulas, or category hubs.

Your objective in this prompt is to implement a high-performance Redis rate limiting engine using Upstash Redis / ioredis, complete with PKT timezone TTL calculations, Next.js route middleware guards, verified search bot bypass logic, and a friendly user-facing Quota Exceeded modal.

---

## 2. Technical Stack & Dependencies

- **Redis Engine:** `@upstash/redis` or `ioredis` + `@upstash/ratelimit`
- **Timezone Calculations:** `date-fns-tz` or native Intl timezone offset calculations
- **Hashing:** Node.js `crypto` (SHA-256 for anonymizing client IPs)
- **Crawler Verification:** User-Agent inspection & DNS reverse lookup helper

Install dependencies:
```bash
npm install @upstash/redis @upstash/ratelimit date-fns date-fns-tz
```

---

## 3. Rate Limiting Architecture & Implementation

### 3.1 Timezone & Quota Calculation Helpers (`src/lib/rate-limit/pkt-time.ts`)
The quota key MUST roll over at 00:00 PKT (Pakistan Standard Time, UTC+5).

```typescript
import { toZonedTime, format } from 'date-fns-tz';

const PKT_TIMEZONE = 'Asia/Karachi'; // UTC+5

/**
 * Returns current date string formatted as YYYY-MM-DD in PKT
 */
export function getCurrentPKTDate(): string {
  const now = new Date();
  const pktDate = toZonedTime(now, PKT_TIMEZONE);
  return format(pktDate, 'yyyy-MM-dd', { timeZone: PKT_TIMEZONE });
}

/**
 * Calculates remaining seconds until next 00:00:00 midnight PKT
 */
export function getSecondsUntilPKTMidnight(): number {
  const now = new Date();
  const pktNow = toZonedTime(now, PKT_TIMEZONE);
  
  const tomorrow = new Date(pktNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diffMs = tomorrow.getTime() - pktNow.getTime();
  return Math.max(Math.floor(diffMs / 1000), 60); // Minimum 60s fallback
}
```

---

### 3.2 Search Engine Crawler Bypass Guard (`src/lib/rate-limit/bot-guard.ts`)
Ensure search engine crawlers indexing public content never trigger HTTP 429 rate limit exceptions:

```typescript
const SEARCH_ENGINE_BOT_AGENTS = [
  'googlebot',
  'bingbot',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'sogou',
  'exabot',
  'facebot',
  'ia_archiver',
];

export function isSearchEngineBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return SEARCH_ENGINE_BOT_AGENTS.some((bot) => ua.includes(bot));
}
```

---

### 3.3 Redis Quota Manager (`src/lib/rate-limit/quota-manager.ts`)

```typescript
import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { getCurrentPKTDate, getSecondsUntilPKTMidnight } from './pkt-time';

const redis = Redis.fromEnv();

export const QUOTA_TIERS = {
  anonymous: { dailyLimit: 10, maxFileSizeBytes: 25 * 1024 * 1024 },
  free: { dailyLimit: 25, maxFileSizeBytes: 100 * 1024 * 1024 },
  pro: { dailyLimit: 999999, maxFileSizeBytes: 1024 * 1024 * 1024 },
} as const;

export type UserTier = keyof typeof QUOTA_TIERS;

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || 'converthub_default_salt';
  return crypto.createHmac('sha256', salt).update(ip).digest('hex').substring(0, 32);
}

export interface QuotaCheckResult {
  allowed: boolean;
  tier: UserTier;
  limit: number;
  used: number;
  remaining: number;
  maxFileSizeBytes: number;
  resetsInSeconds: number;
}

export async function checkAndIncrementQuota(params: {
  userId?: string | null;
  clientIp: string;
  tier?: UserTier;
  userAgent?: string | null;
}): Promise<QuotaCheckResult> {
  const { userId, clientIp, tier = userId ? 'free' : 'anonymous', userAgent } = params;
  const pktDate = getCurrentPKTDate();
  const ttlSeconds = getSecondsUntilPKTMidnight();

  // 1. Unhindered access for verified search engine crawlers
  if (isSearchEngineBot(userAgent)) {
    return {
      allowed: true,
      tier: 'pro',
      limit: 999999,
      used: 0,
      remaining: 999999,
      maxFileSizeBytes: QUOTA_TIERS.free.maxFileSizeBytes,
      resetsInSeconds: ttlSeconds,
    };
  }

  // 2. Determine storage key
  const quotaKey = userId
    ? `quota:user:${pktDate}:${userId}`
    : `quota:ip:${pktDate}:${hashIp(clientIp)}`;

  const config = QUOTA_TIERS[tier] || QUOTA_TIERS.anonymous;

  // 3. Atomically increment in Redis
  const count = await redis.incr(quotaKey);
  if (count === 1) {
    await redis.expire(quotaKey, ttlSeconds);
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
    resetsInSeconds: ttlSeconds,
  };
}

export async function getQuotaStatus(params: {
  userId?: string | null;
  clientIp: string;
  tier?: UserTier;
}): Promise<Omit<QuotaCheckResult, 'allowed'>> {
  const { userId, clientIp, tier = userId ? 'free' : 'anonymous' } = params;
  const pktDate = getCurrentPKTDate();
  const ttlSeconds = getSecondsUntilPKTMidnight();

  const quotaKey = userId
    ? `quota:user:${pktDate}:${userId}`
    : `quota:ip:${pktDate}:${hashIp(clientIp)}`;

  const config = QUOTA_TIERS[tier] || QUOTA_TIERS.anonymous;
  const used = Number((await redis.get<number>(quotaKey)) || 0);

  return {
    tier,
    limit: config.dailyLimit,
    used,
    remaining: Math.max(0, config.dailyLimit - used),
    maxFileSizeBytes: config.maxFileSizeBytes,
    resetsInSeconds: ttlSeconds,
  };
}
```

---

### 3.4 API Route Guard Middleware & Response Headers
Inject RFC-standard rate limiting headers on all API responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

When limit is exceeded, return HTTP `429 Too Many Requests` with structured JSON:
```json
{
  "error": "DAILY_QUOTA_EXCEEDED",
  "message": "You have reached your free daily conversion limit (10/10).",
  "tier": "anonymous",
  "used": 10,
  "limit": 10,
  "resetsAt": "2026-08-28T00:00:00+05:00",
  "signupUrl": "/auth/sign-up"
}
```

---

### 3.5 User-Facing UI Components

1. **Header Quota Indicator (`src/components/common/QuotaIndicator.tsx`):**
   - Displays a subtle badge: `8 / 10 Free conversions left today`.
   - Tooltip explains midnight PKT reset and benefits of free account creation.
2. **Quota Exceeded Modal (`src/components/common/QuotaLimitModal.tsx`):**
   - Clean, friendly modal that triggers automatically when an anonymous/free user reaches their daily limit.
   - Shows:
     - Clear explanation: *"You've reached your 10 free conversions for today."*
     - Live countdown timer until midnight PKT reset.
     - Call-to-action button: *"Create a Free Account (Unlock 25/day & 100MB files)"*.

---

## 4. Acceptance Criteria & Verification Checklist

- [ ] Rate limit keys in Redis properly format with the current PKT date (`YYYY-MM-DD`).
- [ ] Redis key TTL accurately expires at next 00:00 PKT (Asia/Karachi).
- [ ] Search engine crawlers (Googlebot, Bingbot) pass rate limit guards without triggering HTTP 429 blocks.
- [ ] Anonymous users hitting 10 conversions receive HTTP 429 and see the Quota Exceeded Modal.
- [ ] Free logged-in users receive 25 conversions and count against their user ID rather than their shared office IP.
- [ ] File size validation rejects files exceeding 25 MB for anonymous and 100 MB for free accounts.
- [ ] Burst protection stops automated spam requests without impacting regular users.
