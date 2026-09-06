import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, ShieldCheck } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Disclaimer & Advertising Policy | ApexTools.app',
  description: 'Disclaimer and Advertising transparency statement for ApexTools.app.',
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          Disclaimer & Advertising Disclosure
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700 dark:prose-invert dark:text-slate-300">
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. General Information & Calculation Accuracy</h2>
          <p>
            The information, unit conversion factors, currency exchange values, and utility computations provided on <strong>ApexTools.app</strong> are intended for general educational, personal, and professional assistance. While formulas and conversions are rigorously verified against international standards (SI, NIST, ISO), rates and factors may change and should be independently validated before critical architectural, engineering, medical, or high-stakes financial operations.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Currency & Financial Data Disclaimer</h2>
          <p>
            Foreign exchange (forex) rates displayed on ApexTools.app are updated periodically from open public exchange feeds. They do not constitute financial advice, investment recommendations, or firm trading quotes.
          </p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Advertising & Sponsorship Policy</h2>
          <p className="mt-2">
            To fund high-performance cloud processing, GPU bandwidth, and ongoing software development, ApexTools.app partners with advertising programs including <strong>Google AdSense</strong>.
          </p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-xs">
            <li>Ads are clearly demarcated with &quot;Advertisement&quot; or &quot;Sponsored&quot; labels in compliance with advertising standards.</li>
            <li>Advertisements do not influence tool algorithms, accuracy, or converter output.</li>
            <li>We do not endorse specific third-party products advertised through automated ad networks.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Contacting Us</h2>
          <p>
            If you identify a data inaccuracy or have questions concerning our disclosures, please contact us at <Link href="/contact" className="text-indigo-600 underline dark:text-indigo-400">our Contact Page</Link> or email <code>support@apextools.app</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
