import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Shield, Zap, Lock, Cpu, Globe, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: `About ApexTools — Fast, Private, Zero-Friction Web Utilities | ${siteConfig.name}`,
  description: `Learn about ApexTools.app, our privacy-first client-side utility architecture, automated ephemeral file processing, and precision engineering standards.`,
  alternates: {
    canonical: `${siteConfig.url}/about`,
  },
  openGraph: {
    title: `About ApexTools | ${siteConfig.name}`,
    description: `ApexTools provides 150+ free, instant, privacy-focused online conversion utilities with zero signup friction.`,
    url: `${siteConfig.url}/about`,
    siteName: siteConfig.name,
  },
};

export default function AboutPage() {
  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'About Us', url: `${siteConfig.url}/about` },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        url={`${siteConfig.url}/about`}
        description="About ApexTools - Fast, free, and secure online utility and conversion platform."
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} />

      <header className="my-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 p-1 shadow-lg shadow-indigo-500/25">
          <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-white dark:bg-slate-950 p-2 overflow-hidden">
            <Image
              src="/logo-256.png"
              alt="ApexTools Official Logo"
              width={72}
              height={72}
              className="h-full w-full object-contain"
              priority
            />
          </div>
        </div>
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Globe className="h-3.5 w-3.5" />
            <span>Our Mission & Architecture</span>
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            About ApexTools.app
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            ApexTools was engineered with a single guiding mission: to make everyday digital conversions and device diagnostics fast, accurate, and completely private without bloated paywalls, intrusive pop-ups, or compulsory account registrations.
          </p>
        </div>
      </header>

      {/* Core Pillars */}
      <section className="my-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-4">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Client-Side Speed
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Wherever mathematically possible, our converters run 100% locally in your browser using modern WebAssembly, Web Audio API, and Web Workers for zero-latency execution.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mb-4">
            <Lock className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1-Hour Auto-Purge
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            For document and media tools requiring background FFmpeg or LibreOffice rendering, uploaded files are processed in ephemeral storage and irrevocably purged within 60 minutes.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 mb-4">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Zero Signup Friction
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
            Every visitor receives free daily conversion quotas. You never have to share an email address, enter credit card details, or install third-party desktop software.
          </p>
        </div>
      </section>

      {/* Engineering Standards */}
      <section className="my-12 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-8 dark:border-slate-800/80 dark:bg-slate-900/30">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Precision Engineering Standards
        </h2>
        <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>
            All unit conversions on ApexTools adhere strictly to International System of Units (SI) definitions, NIST standard factors, and official regional land registries (such as Punjab Land Records Authority for Marla and Kanal calculations).
          </p>
          <p>
            Our currency converters pull live mid-market interbank exchange rates updated on an hourly schedule from reliable global foreign exchange feeds.
          </p>
          <p>
            To learn more about our numerical formulas, rounding rules, and mathematical implementation, please visit our dedicated{' '}
            <Link href="/how-we-calculate" className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
              How We Calculate
            </Link>{' '}
            transparency page.
          </p>
        </div>
      </section>

      {/* Platform & Team */}
      <section className="my-12">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Platform Information
        </h2>
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 text-xs sm:text-sm space-y-3 text-slate-600 dark:text-slate-400">
          <p>
            <strong className="text-slate-900 dark:text-white">Operator:</strong> {siteConfig.author}
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">Website:</strong>{' '}
            <a href={siteConfig.url} className="text-indigo-600 hover:underline dark:text-indigo-400">
              {siteConfig.url}
            </a>
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">Support & Contact:</strong>{' '}
            <Link href="/contact" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Visit our Contact Page
            </Link>
          </p>
          <p>
            <strong className="text-slate-900 dark:text-white">Privacy Policy:</strong>{' '}
            <Link href="/privacy" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Read our Privacy Policy
            </Link>
          </p>
        </div>
      </section>

      {/* Action CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <span>Explore All 150+ Free Tools</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
