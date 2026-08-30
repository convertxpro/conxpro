import { NextRequest, NextResponse } from 'next/server';
import { QuotaCheckResult } from './quota-manager';
import { BurstLimitResult } from './burst-limiter';

/**
 * Extracts normalized client IP address from request headers
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

/**
 * Attaches RFC-compliant rate limiting headers to a Next.js NextResponse
 */
export function applyRateLimitHeaders(
  response: NextResponse,
  limitInfo: {
    limit: number;
    remaining: number;
    reset: number | string;
  }
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(limitInfo.limit));
  response.headers.set('X-RateLimit-Remaining', String(Math.max(0, limitInfo.remaining)));
  response.headers.set('X-RateLimit-Reset', String(limitInfo.reset));
  return response;
}

/**
 * Creates a structured HTTP 429 Too Many Requests response for Daily Quota Exceeded
 */
export function createQuotaExceededResponse(quota: QuotaCheckResult): NextResponse {
  const isAnonymous = quota.tier === 'anonymous';
  const responseBody = {
    error: 'DAILY_QUOTA_EXCEEDED',
    message: isAnonymous
      ? `You have reached your free daily conversion limit (${quota.used}/${quota.limit}). Create a free account to unlock 25 conversions/day.`
      : `You have reached your daily account conversion limit (${quota.used}/${quota.limit}). Resets at 00:00 PKT.`,
    tier: quota.tier,
    used: quota.used,
    limit: quota.limit,
    resetsAt: quota.resetsAt,
    resetsInSeconds: quota.resetsInSeconds,
    signupUrl: '/auth/signup',
  };

  const res = NextResponse.json(responseBody, { status: 429 });
  return applyRateLimitHeaders(res, {
    limit: quota.limit,
    remaining: quota.remaining,
    reset: quota.resetsInSeconds,
  });
}

/**
 * Creates a structured HTTP 429 Too Many Requests response for Burst Limit Exceeded
 */
export function createBurstLimitResponse(burst: BurstLimitResult): NextResponse {
  const resetSeconds = Math.ceil((burst.reset - Date.now()) / 1000);
  const responseBody = {
    error: 'BURST_LIMIT_EXCEEDED',
    message: `Too many requests sent in a short period. Please slow down and try again in ${Math.max(1, resetSeconds)} seconds.`,
    limit: burst.limit,
    remaining: burst.remaining,
    retryAfterSeconds: Math.max(1, resetSeconds),
  };

  const res = NextResponse.json(responseBody, {
    status: 429,
    headers: {
      'Retry-After': String(Math.max(1, resetSeconds)),
    },
  });

  return applyRateLimitHeaders(res, {
    limit: burst.limit,
    remaining: burst.remaining,
    reset: burst.reset,
  });
}

/**
 * Creates a structured HTTP 413 Payload Too Large response for File Size limits
 */
export function createPayloadTooLargeResponse(fileSize: number, maxBytes: number, maxDisplay: string): NextResponse {
  return NextResponse.json(
    {
      error: 'FILE_SIZE_LIMIT_EXCEEDED',
      message: `File size exceeds the allowed limit of ${maxDisplay} for your current tier.`,
      uploadedBytes: fileSize,
      maxAllowedBytes: maxBytes,
      maxAllowedDisplay: maxDisplay,
      signupUrl: '/auth/signup',
    },
    { status: 413 }
  );
}
