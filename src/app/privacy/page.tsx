import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, Eye, CheckCircle2, ArrowLeft } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Privacy Policy | ApexTools.app',
  description: 'Learn how ApexTools.app protects your privacy, manages files with zero retention, and works with advertising partners including Google AdSense.',
};

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Privacy Highlights */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Zero File Retention</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Uploaded files are processed securely in memory or deleted within 1 to 2 hours.
          </p>
        </div>

        <div className="rounded-2xl border border-indigo-200/80 bg-indigo-50/50 p-5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">Client-Side First</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            Many calculations and conversions occur 100% locally in your browser via WebAssembly.
          </p>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-purple-50/50 p-5 dark:border-purple-900/40 dark:bg-purple-950/20">
          <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No File Inspection</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
            We never inspect, index, sell, or share the contents of your converted files.
          </p>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700 dark:prose-invert dark:text-slate-300">
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Introduction</h2>
          <p>
            Welcome to <strong>ApexTools.app</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), operated by Lapvy Enterprises. We are committed to protecting your personal privacy while providing powerful, accessible, and fast file conversion, developer utility, and measurement tools.
          </p>
          <p>
            This Privacy Policy explains how we handle your information when you visit <code>https://apextools.app</code> and use any of our online converter services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Files and Processing Data</h2>
          <p>
            Our core architecture is built with a <strong>privacy-by-design</strong> model:
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><strong>Browser-Local Processing:</strong> Tools such as color converters, JSON formatters, text case tools, and unit converters execute entirely within your client browser using JavaScript / WebAssembly. No data leaves your computer.</li>
            <li><strong>Server-Side File Conversions:</strong> For tools requiring server-side rendering (such as complex document or media conversions), files are transferred via encrypted HTTPS (TLS 1.3), converted in isolated containers, and permanently auto-purged within 1 to 2 hours.</li>
            <li><strong>No Data Harvesting:</strong> We do not read, analyze, train AI models on, or distribute the content of any uploaded documents or media.</li>
          </ul>
        </section>

        {/* Google AdSense & Cookies Section (Mandatory for AdSense compliance) */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Advertising & Google AdSense Disclosures</h2>
          <p className="mt-2">
            To keep ApexTools.app 100% free for all users worldwide, we display non-intrusive advertisements served by third-party advertising networks, including <strong>Google AdSense</strong>.
          </p>
          <div className="mt-4 space-y-3 text-xs">
            <p>
              • <strong>Third-Party Vendors & Cookies:</strong> Google and other third-party vendors use cookies to serve ads based on a user&apos;s prior visits to ApexTools.app or other websites on the Internet.
            </p>
            <p>
              • <strong>Google DART & Advertising Cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our site and/or other sites on the Internet.
            </p>
            <p>
              • <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 underline dark:text-indigo-400"
              >
                Google Ads Settings
              </a>
              . Alternatively, you can opt out of third-party vendor cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-indigo-600 underline dark:text-indigo-400"
              >
                www.aboutads.info/choices
              </a>
              .
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Analytics & Log Files</h2>
          <p>
            Like standard web applications, ApexTools.app gathers standard server log information, including internet protocol (IP) addresses, browser type, internet service provider (ISP), referring/exit pages, platform type, and date/time stamps. This data is collected in anonymized form to monitor system uptime, prevent denial-of-service attacks, and improve application performance.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. GDPR & CCPA/CPRA Privacy Rights</h2>
          <p>
            Depending on your location, you may have specific rights regarding your personal data under the European General Data Protection Regulation (GDPR) or California Consumer Privacy Act (CCPA):
          </p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>The right to know what personal data is collected, used, or shared.</li>
            <li>The right to request deletion of personal information.</li>
            <li>The right to opt-out of the sale or sharing of personal data (we do not sell user data).</li>
            <li>The right to non-discrimination for exercising your privacy rights.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Contact Us</h2>
          <p>
            If you have questions or feedback regarding this Privacy Policy or our privacy practices, please contact us:
          </p>
          <p className="font-medium text-slate-900 dark:text-white">
            Email: <a href="mailto:support@apextools.app" className="text-indigo-600 dark:text-indigo-400">support@apextools.app</a><br />
            Website: <Link href="/contact" className="text-indigo-600 dark:text-indigo-400">https://apextools.app/contact</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
