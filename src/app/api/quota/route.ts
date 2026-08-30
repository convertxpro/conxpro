import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getQuotaStatus,
  checkAndIncrementQuota,
  validateFileSize,
  UserTier,
} from '@/lib/rate-limit/quota-manager';
import { checkBurstLimit } from '@/lib/rate-limit/burst-limiter';
import {
  applyRateLimitHeaders,
  createQuotaExceededResponse,
  createBurstLimitResponse,
  createPayloadTooLargeResponse,
} from '@/lib/rate-limit/headers';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

async function getUserAuthContext(): Promise<{ userId: string | null; tier: UserTier }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { userId: null, tier: 'anonymous' };
    }

    // Attempt to fetch user's plan from database
    const { data: profile } = await supabase
      .from('users')
      .select('plan')
      .eq('id', user.id)
      .maybeSingle();

    const plan = (profile && typeof profile === 'object' && 'plan' in profile 
      ? (profile as { plan: UserTier }).plan 
      : 'free') as UserTier;
    return { userId: user.id, tier: plan };
  } catch {
    return { userId: null, tier: 'anonymous' };
  }
}

/**
 * GET /api/quota - Returns current daily quota status for the visitor/user
 */
export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const userAgent = request.headers.get('user-agent');
  const { userId, tier } = await getUserAuthContext();

  const status = await getQuotaStatus({
    userId,
    clientIp,
    tier,
    userAgent,
  });

  const response = NextResponse.json({
    status: 'ok',
    ...status,
    authenticated: Boolean(userId),
    userId: userId || null,
  });

  return applyRateLimitHeaders(response, {
    limit: status.limit,
    remaining: status.remaining,
    reset: status.resetsInSeconds,
  });
}

/**
 * POST /api/quota - Check or increment quota for an upcoming conversion
 * Body JSON: { action?: 'check' | 'increment', fileSize?: number }
 */
export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const userAgent = request.headers.get('user-agent');
  const { userId, tier } = await getUserAuthContext();

  // 1. Sliding window burst rate check
  const burst = await checkBurstLimit(clientIp, userAgent);
  if (!burst.success) {
    return createBurstLimitResponse(burst);
  }

  let body: { action?: string; fileSize?: number } = {};
  try {
    body = await request.json();
  } catch {
    // Empty body is allowed
  }

  const { action = 'increment', fileSize } = body;

  // 2. File Size Validation
  if (typeof fileSize === 'number' && fileSize > 0) {
    const sizeValidation = validateFileSize(fileSize, tier);
    if (!sizeValidation.valid) {
      return createPayloadTooLargeResponse(
        fileSize,
        sizeValidation.maxBytes,
        sizeValidation.maxDisplay
      );
    }
  }

  // 3. Quota check or increment
  if (action === 'check') {
    const status = await getQuotaStatus({
      userId,
      clientIp,
      tier,
      userAgent,
    });

    const allowed = status.remaining > 0;
    if (!allowed) {
      return createQuotaExceededResponse({
        allowed: false,
        ...status,
      });
    }

    const response = NextResponse.json({
      allowed: true,
      ...status,
    });

    return applyRateLimitHeaders(response, {
      limit: status.limit,
      remaining: status.remaining,
      reset: status.resetsInSeconds,
    });
  }

  // Action is increment
  const quotaResult = await checkAndIncrementQuota({
    userId,
    clientIp,
    tier,
    userAgent,
  });

  if (!quotaResult.allowed) {
    return createQuotaExceededResponse(quotaResult);
  }

  const response = NextResponse.json({
    status: 'ok',
    ...quotaResult,
  });

  return applyRateLimitHeaders(response, {
    limit: quotaResult.limit,
    remaining: quotaResult.remaining,
    reset: quotaResult.resetsInSeconds,
  });
}
