'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  Zap,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { useQuota } from '@/lib/rate-limit/use-quota';
import { useAuth } from '@/components/auth/AuthProvider';

export const QuotaLimitModal: React.FC = () => {
  const { isModalOpen, closeModal, modalDetails, quota } = useQuota();
  const { user } = useAuth();
  const [countdown, setCountdown] = useState<string>('');

  // Live PKT Midnight Countdown
  useEffect(() => {
    if (!isModalOpen) return;

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
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const isAnonymous = quota.tier === 'anonymous' || !user;
  const limit = modalDetails?.limit || quota.limit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={closeModal}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeModal}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-500 text-white shadow-lg shadow-rose-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Daily Limit Reached
            </h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAnonymous ? 'Anonymous Visitor Limit' : 'Free Account Quota'}
            </p>
          </div>
        </div>

        {/* Message */}
        <div className="mt-4 rounded-2xl bg-amber-50/80 border border-amber-200/60 p-4 dark:bg-amber-950/30 dark:border-amber-800/40">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
            {isAnonymous
              ? `You've reached your ${limit} free conversions for today as an anonymous visitor.`
              : `You've used all ${limit} conversions for today on your free account.`}
          </p>
        </div>

        {/* Midnight PKT Countdown */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>Automatic Reset at 00:00 PKT</span>
          </div>
          <div className="text-right">
            <span className="font-mono text-base font-black text-indigo-600 dark:text-indigo-400">
              {countdown || 'Midnight PKT'}
            </span>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining</p>
          </div>
        </div>

        {/* Tier Upgrade Benefits Card */}
        {isAnonymous ? (
          <div className="mt-5 rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 p-4 dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30">
            <div className="flex items-center gap-2 font-bold text-xs text-indigo-900 dark:text-indigo-200 mb-3">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Create a Free Account & Instantly Unlock:</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>25 conversions/day</strong> (2.5x more than anonymous)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>100 MB max file size</strong> (vs 25 MB)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                <span><strong>Personal conversion history</strong> & fast repeat actions</span>
              </li>
            </ul>

            <Link
              href="/auth/signup"
              onClick={closeModal}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
            >
              <span>Create Free Account (30 Seconds)</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-900 dark:text-emerald-200 mb-2">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Need Higher Limits or Batch Jobs?</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your 25 conversions will replenish at midnight PKT. For high-volume API access, unlimited batching, or files up to 1GB+, contact our team.
            </p>
          </div>
        )}

        {/* Secondary Dismiss Button */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={closeModal}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
          >
            I&apos;ll wait for midnight reset
          </button>
        </div>
      </div>
    </div>
  );
};
