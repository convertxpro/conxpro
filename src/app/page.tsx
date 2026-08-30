import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Shield, Zap, Lock, Search, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { CategoryBento } from '@/components/layout/CategoryBento';
import { TrustBadges } from '@/components/common/TrustBadges';
import { AdSlot } from '@/components/ads/AdSlot';

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-emerald-500/15 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* 1. Header Banner Ad */}
        <AdSlot placement="header_leaderboard" />

        {/* 2. Hero Section */}
        <section className="relative my-8 text-center sm:my-12">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 backdrop-blur-md dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            <span>The All-In-One Free Conversion Hub</span>
            <span className="text-indigo-400">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              100% Free & Private
            </span>
          </div>

          {/* Main Title */}
          <h1 className="mx-auto mt-6 max-w-4xl font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl dark:text-white">
            Convert <span className="gradient-text">Anything</span> Online.
            <br />
            Instant, Free & Private.
          </h1>

          {/* Subtitle */}
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-lg dark:text-slate-400">
            Transform documents, images, videos, audio, physical measurement units, live forex rates, and developer data formats with zero sign-up.
          </p>

          {/* Quick Trending Converters Pills */}
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-medium text-slate-400 mr-1">Trending:</span>
            {[
              { name: '📄 PDF to Word', href: '/convert/document/pdf-to-word' },
              { name: '📸 HEIC to JPG', href: '/convert/image/heic-to-jpg' },
              { name: '💵 USD to PKR', href: '/convert/currency/usd-to-pkr' },
              { name: '📐 Marla to SqFt', href: '/convert/unit/marla-to-square-feet' },
              { name: '🪙 Tola to Grams', href: '/convert/unit/tola-to-grams' },
              { name: '⚡ Compress PDF', href: '/convert/document/compress-pdf' },
              { name: '💻 JSON to CSV', href: '/convert/developer/json-to-csv' },
            ].map((tool) => (
              <Link
                key={tool.name}
                href={tool.href}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs backdrop-blur-sm transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
              >
                <span>{tool.name}</span>
                <ArrowUpRight className="h-3 w-3 text-slate-400" />
              </Link>
            ))}
          </div>
        </section>

        {/* 3. Value Proposition & Trust Badges */}
        <section className="my-10">
          <TrustBadges />
        </section>

        {/* 5. Category Bento Grid */}
        <section className="my-12">
          <div className="mb-8 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
                Explore Conversion Categories
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Select a category below to browse all specialized conversion utilities.
              </p>
            </div>
          </div>

          <CategoryBento />
        </section>

        {/* 6. Native In-Content Ad */}
        <AdSlot placement="in_content_native" />

        {/* 7. Why Choose ConvertHub Feature Strip */}
        <section className="my-16 rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/40 sm:p-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Why ConvertHub is Built Different
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Designed from the ground up for maximum privacy, zero lag, and search engine performance.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800/60 dark:bg-slate-950/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Bank-Grade Privacy & Auto-Purge
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Uploaded files are stored only temporarily and automatically deleted within 1 hour. We never sell or inspect your files.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800/60 dark:bg-slate-950/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sub-Second Client-Side Calculations
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                All unit, date, color, and developer conversions process instantly in your browser without contacting a remote server.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-6 dark:border-slate-800/60 dark:bg-slate-950/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Zero Signup Friction
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                No credit card, no email confirmation required to use your daily free quota. Convert and download immediately.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Bottom Footer Banner Ad */}
        <AdSlot placement="footer_banner" />
      </div>
    </div>
  );
}
