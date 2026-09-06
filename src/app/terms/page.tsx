import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = {
  title: 'Terms of Service | ApexTools.app',
  description: 'Terms of Service and conditions for using ApexTools.app online file, unit, currency, and developer utilities.',
};

export default function TermsOfServicePage() {
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
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-700 dark:prose-invert dark:text-slate-300">
        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Agreement to Terms</h2>
          <p>
            By accessing or using <strong>ApexTools.app</strong>, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Permitted Use & Service License</h2>
          <p>
            ApexTools.app provides online conversion, formatting, calculation, and diagnostic tools free of charge for personal and commercial use. You agree to use the service in compliance with all relevant copyright, intellectual property, and cybersecurity standards.
          </p>
          <p>You agree NOT to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Use the services to upload, process, or distribute illegal material, viruses, or malicious payloads.</li>
            <li>Attempt to reverse-engineer, overwhelm, or launch Denial of Service (DoS) attacks against the API infrastructure.</li>
            <li>Use automated scrapers or bots in a manner that degrades service availability for normal users.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Disclaimer of Warranties</h2>
          <p>
            The services on ApexTools.app are provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind, either express or implied. While we strive for absolute accuracy in all unit conversions, file transformations, and financial exchange rates, we do not warrant that results are free from error or suitable for critical structural, legal, or financial trading operations without independent verification.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Limitation of Liability</h2>
          <p>
            In no event shall ApexTools.app, its developers, or Lapvy Enterprises be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the tools on this website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Third-Party Advertisements</h2>
          <p>
            ApexTools.app displays advertisements provided by Google AdSense and third-party advertising partners. We are not responsible for the content of external websites linked within advertisements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Inquiries & Contact</h2>
          <p>
            For questions regarding our Terms of Service, please reach out via our <Link href="/contact" className="text-indigo-600 underline dark:text-indigo-400">Contact Page</Link> or email us at <code>support@apextools.app</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
