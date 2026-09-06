'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export const ContactForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/20">
        <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
        <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Message Sent Successfully!</h3>
        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Thank you for reaching out. Our engineering and support team will review your inquiry and respond within 24 hours.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-6 inline-flex items-center text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Your Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          placeholder="Alex Morgan"
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          placeholder="alex@example.com"
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Subject / Tool Category
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          required
          placeholder="e.g., Suggestion for PDF Converter or Bug Report"
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          placeholder="Describe your question, request, or issue in detail..."
          className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
      >
        <Send className="h-4 w-4" /> Send Message
      </button>
    </form>
  );
};
