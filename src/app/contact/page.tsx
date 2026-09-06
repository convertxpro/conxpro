import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Mail, Clock } from 'lucide-react';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact & Support | ApexTools.app',
  description: 'Get in touch with the ApexTools.app engineering and support team for tool suggestions, technical support, or partnership inquiries.',
};

export default function ContactPage() {
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
          Contact & Support
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Have a question, feedback, or a new tool request? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Contact Info Sidebar */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Email Support</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              For general inquiries, bug reports, and feedback:
            </p>
            <a
              href="mailto:support@apextools.app"
              className="mt-2 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              support@apextools.app
            </a>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">Response Time</h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Our engineering team typically reviews all developer and user queries within 24 hours.
            </p>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Send Us a Direct Message</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Fill out the form below and we will get back to you promptly.
          </p>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
