import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { Calculator, Scale, RefreshCw, CheckCircle2, ShieldAlert, Binary } from 'lucide-react';

export const metadata: Metadata = {
  title: `How We Calculate — Mathematical Formulas, Rounding & Accuracy | ${siteConfig.name}`,
  description: `Understand the mathematical precision, standard conversion factors, IEEE 754 floating-point handling, and rounding methodologies used across ApexTools calculators.`,
  alternates: {
    canonical: `${siteConfig.url}/how-we-calculate`,
  },
  openGraph: {
    title: `How We Calculate — Mathematical Accuracy & Methodology | ${siteConfig.name}`,
    description: `Transparency and accuracy breakdown of conversion factors, rounding logic, and automated calculations on ApexTools.`,
    url: `${siteConfig.url}/how-we-calculate`,
    siteName: siteConfig.name,
  },
};

export default function HowWeCalculatePage() {
  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'How We Calculate', url: `${siteConfig.url}/how-we-calculate` },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <JsonLd
        url={`${siteConfig.url}/how-we-calculate`}
        description="Detailed mathematical documentation on conversion formulas, precision, rounding logic, and unit standards."
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} />

      <header className="my-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Calculator className="h-3.5 w-3.5" />
          <span>Calculation Methodology & Accuracy</span>
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          How We Calculate
        </h1>
        <p className="mt-3 text-base text-slate-600 sm:text-lg dark:text-slate-400 leading-relaxed">
          At ApexTools, accuracy and transparency are our highest technical priorities. This page documents the mathematical standards, precision arithmetic engines, rounding rules, and unit definition sources behind every calculation on our platform.
        </p>
      </header>

      {/* Principle Cards */}
      <div className="my-10 space-y-8">
        {/* 1. International Standards */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Scale className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              1. Authoritative International Standards (SI & NIST)
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Physical measurement conversions utilize the definitions established by the <strong>International System of Units (SI)</strong> and the <strong>National Institute of Standards and Technology (NIST)</strong>.
          </p>
          <ul className="mt-3 list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
            <li><strong>Length:</strong> 1 inch is defined as exactly 25.4 millimeters (0.0254 meters).</li>
            <li><strong>Mass:</strong> 1 avoirdupois pound is defined as exactly 0.45359237 kilograms.</li>
            <li><strong>Temperature:</strong> Exact linear offset formulas (e.g. °F = °C × 9/5 + 32; K = °C + 273.15).</li>
            <li><strong>Data Storage:</strong> Both decimal powers of ten (1 KB = 1,000 Bytes) and binary powers of two (1 KiB = 1,024 Bytes) are clearly distinguished.</li>
          </ul>
        </section>

        {/* 2. Floating-Point Arithmetic */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <Binary className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              2. Floating-Point Precision & Error Mitigation
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Standard binary floating-point computation (IEEE 754) can introduce microscopic inaccuracies (such as <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono dark:bg-slate-800">0.1 + 0.2 = 0.30000000000000004</code>).
          </p>
          <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            To prevent these artifacts, ApexTools employs arbitrary-precision decimal libraries and smart epsilon epsilon-clamping for all financial, gold weight (Tola), and high-precision scientific calculations.
          </p>
        </section>

        {/* 3. Rounding Logic */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Calculator className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              3. Rounding Rules & Display Precision
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Calculations maintain up to 16 significant decimal places internally during intermediate operations. For final presentation:
          </p>
          <ul className="mt-3 list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
            <li><strong>Unit Converters:</strong> Default to 4 to 6 decimal places, with user-selectable precision controls.</li>
            <li><strong>Currency & Forex:</strong> Rounded to 2 decimal places for major currencies, or 4 decimal places for high-precision remittance spreads.</li>
            <li><strong>Significant Digits:</strong> Trailing zeros are stripped for clarity unless exact fixed currency formatting is requested.</li>
          </ul>
        </section>

        {/* 4. Why Tools May Differ Slightly */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              4. Why Results May Differ Between Platforms
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            You may occasionally notice slight discrepancies when comparing results between ApexTools and other websites or mobile apps. These typically arise from:
          </p>
          <ul className="mt-3 list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-2">
            <li><strong>Intermediate Rounding:</strong> Some tools round early in the calculation chain, compounding errors. ApexTools rounds only at the final presentation layer.</li>
            <li><strong>Regional Land Definitions:</strong> A &ldquo;Marla&rdquo; in Pakistan is officially 225 sq ft in Lahore/DHA housing authorities, 250 sq ft in Islamabad CDA, or 272.25 sq ft in rural Revenue records. ApexTools allows you to explicitly choose which standard to apply.</li>
            <li><strong>Forex Rates Timing:</strong> Foreign exchange rates fluctuate constantly. ApexTools syncs hourly mid-market interbank feeds; different services may quote buy, sell, or delayed cash rates.</li>
          </ul>
        </section>

        {/* 5. Automated Calculations */}
        <section className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 sm:p-8 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              5. 100% Automated Computations
            </h2>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            All calculations, tables, and formula representations are executed programmatically by deterministic algorithms. No calculations are manually keyed, and no user inputs are logged or analyzed.
          </p>
        </section>
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <span>Explore All Verified Calculators</span>
        </Link>
      </div>
    </div>
  );
}
