'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { Mail, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, History, Lock, ArrowLeft, RefreshCw } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { signInWithOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    const { error } = await signInWithOtp(email.trim());

    setIsLoading(false);

    if (error) {
      setErrorMessage(error.message || 'Failed to send login link. Please try again.');
    } else {
      setIsSubmitted(true);
      // Auto-redirect if in demo/local mode
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
        setTimeout(() => {
          router.push(redirectTarget);
        }, 1200);
      }
    }
  };

  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
      {/* Brand Header */}
      <div className="text-center">
        <Link href="/" className="inline-flex items-center gap-2 group mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-0.5 shadow-lg shadow-indigo-500/25 transition-transform duration-200 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950 text-white font-black text-base tracking-wider">
              CX
            </div>
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Convert<span className="text-indigo-600 dark:text-indigo-400">Hub</span>
          </span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Welcome to ApexTools
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Sign in or create your free account in seconds with a passwordless magic link.
        </p>
      </div>

      {/* Main Card */}
      <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Work or Personal Email
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-400 dark:focus:bg-slate-800"
                />
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:brightness-110 hover:shadow-lg hover:shadow-indigo-500/30 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Sending secure link...</span>
                </>
              ) : (
                <>
                  <span>Continue with Magic Link</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Check your inbox
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                We sent a secure sign-in link to <span className="font-semibold text-slate-900 dark:text-slate-200">{email}</span>. Click the link to instantly log in.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSubmitted(false)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Use a different email</span>
            </button>
          </div>
        )}

        {/* Free Plan Perks Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
            Free Account Benefits (100% Free Forever):
          </p>
          <div className="grid grid-cols-1 gap-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Zap className="h-3 w-3" />
              </div>
              <span><strong>25 Conversions/day</strong> (vs. 10 for guests)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Sparkles className="h-3 w-3" />
              </div>
              <span><strong>100 MB Max File Size</strong> (vs. 25 MB for guests)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
                <History className="h-3 w-3" />
              </div>
              <span><strong>Personal Conversion History</strong> for 30 days</span>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            No credit card
          </span>
          <span className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-indigo-500" />
            Auto-purged files
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-purple-500" />
            Zero spam
          </span>
        </div>
      </div>

      {/* Alternative links */}
      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
        By signing in, you agree to our{' '}
        <Link href="/terms" className="underline hover:text-slate-700 dark:hover:text-slate-300">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline hover:text-slate-700 dark:hover:text-slate-300">
          Privacy Policy
        </Link>.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
