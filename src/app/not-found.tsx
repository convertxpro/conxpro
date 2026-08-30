import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Sparkles, FileText, Image as ImageIcon, DollarSign, Building } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:px-8">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-6">
        <Sparkles className="h-8 w-8" />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
        404 — Converter Not Found
      </h1>

      <p className="mx-auto mt-4 max-w-md text-base text-slate-600 dark:text-slate-400">
        The tool or page you requested might have been moved, renamed, or is currently being upgraded.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Homepage</span>
        </Link>
      </div>

      <div className="mt-16 border-t border-slate-200 pt-10 dark:border-slate-800 text-left">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
          Popular Converters You Might Be Looking For:
        </h2>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/convert/unit/marla-to-square-feet"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <Building className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Marla to SqFt
              </p>
              <p className="text-[11px] text-slate-400">Land & Area</p>
            </div>
          </Link>

          <Link
            href="/convert/document/pdf-to-word"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <FileText className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                PDF to Word
              </p>
              <p className="text-[11px] text-slate-400">Preserve Layout</p>
            </div>
          </Link>

          <Link
            href="/convert/image/heic-to-jpg"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <ImageIcon className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                HEIC to JPG
              </p>
              <p className="text-[11px] text-slate-400">iPhone Photos</p>
            </div>
          </Link>

          <Link
            href="/convert/currency/usd-to-pkr"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
          >
            <DollarSign className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                USD to PKR
              </p>
              <p className="text-[11px] text-slate-400">Live Forex Rate</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
