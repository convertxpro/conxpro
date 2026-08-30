'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, Clock, ShieldCheck, ArrowRight, Info, AlertTriangle } from 'lucide-react';
import { useQuota } from '@/lib/rate-limit/use-quota';
import { useAuth } from '@/components/auth/AuthProvider';
import { cn } from '@/lib/utils';

export const QuotaIndicator: React.FC<{ className?: string; compact?: boolean }> = ({
  className,
  compact = false,
}) => {
  const { quota, isLoading, openModal } = useQuota();
  const { user } = useAuth();
  const [showTooltip, setShowTooltip] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  // Live PKT Midnight Countdown
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // PKT is UTC+5
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const pktNow = new Date(utc + 5 * 3600000);

      const midnight = new Date(pktNow);
      midnight.setDate(midnight.getDate() + 1);
      midnight.setHours(0, 0, 0, 0);

      const diffMs = midnight.getTime() - pktNow.getTime();
      const hours = Math.floor(diffMs / 3600000);
      const minutes = Math.floor((diffMs % 3600000) / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      setCountdown(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={cn('h-8 w-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800', className)} />
    );
  }

  const isLow = quota.remaining <= 2 && quota.remaining > 0;
  const isExhausted = quota.remaining === 0;

  const badgeColor = isExhausted
    ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300'
    : isLow
    ? 'border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300'
    : 'border-slate-200/80 bg-slate-50/90 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800';

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        onClick={() => {
          if (isExhausted) {
            openModal();
          } else {
            setShowTooltip((prev) => !prev);
          }
        }}
        className={cn(
          'flex h-9 items-center gap-2 rounded-xl border px-2.5 text-xs font-semibold backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          badgeColor
        )}
        aria-label="Conversion Quota Status"
      >
        <Zap
          className={cn(
            'h-3.5 w-3.5',
            isExhausted
              ? 'text-rose-500 animate-pulse'
              : isLow
              ? 'text-amber-500'
              : 'text-indigo-500'
          )}
        />

        {compact ? (
          <span>{quota.remaining} left</span>
        ) : (
          <span className="hidden sm:inline">
            <span className="font-bold text-slate-900 dark:text-white">{quota.remaining}</span> / {quota.limit} free left today
          </span>
        )}

        <span className="sm:hidden font-bold">{quota.remaining} / {quota.limit}</span>

        {isExhausted && (
          <span className="flex h-2 w-2 rounded-full bg-rose-500" />
        )}
      </button>

      {/* Rich Informational Tooltip */}
      {showTooltip && (
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 dark:text-white">
              <Zap className="h-4 w-4 text-indigo-500" />
              <span>Daily Conversion Quota</span>
            </div>
            <span
              className={cn(
                'rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                user
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {quota.tier} Tier
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>{quota.used} used</span>
              <span className="font-semibold text-slate-900 dark:text-white">{quota.remaining} remaining</span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  isExhausted
                    ? 'bg-rose-500'
                    : isLow
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-emerald-500'
                )}
                style={{ width: `${Math.min(100, (quota.used / quota.limit) * 100)}%` }}
              />
            </div>
          </div>

          {/* Time until PKT reset */}
          <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>Resets at 00:00 PKT</span>
            </div>
            <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {countdown || 'Midnight'}
            </span>
          </div>

          {/* Max File Size */}
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
            <span>Max file size:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{quota.maxFileSizeDisplay}</span>
          </div>

          {/* Upgrade / Register Callout if anonymous */}
          {!user && (
            <div className="mt-3 border-t border-slate-100 pt-3 dark:border-slate-800">
              <div className="rounded-xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-2.5 text-xs dark:from-indigo-950/40 dark:to-purple-950/40">
                <p className="font-semibold text-indigo-900 dark:text-indigo-200">
                  Want 25 conversions/day & 100MB files?
                </p>
                <Link
                  href="/auth/signup"
                  className="mt-2 flex items-center justify-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
                >
                  <span>Sign Up Free (Instant)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
