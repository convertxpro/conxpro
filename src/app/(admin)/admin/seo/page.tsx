import React from 'react';
import { Metadata } from 'next';
import { CATEGORIES } from '@/config/categories';
import { getAllToolsSeoData } from '@/config/tool-seo-registry';
import { SeoDashboardClient } from '@/components/admin/SeoDashboardClient';
import { SearchCheck, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = {
  title: 'SEO & AEO Console — Technical Audit & Completeness Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSeoPage() {
  const allTools = getAllToolsSeoData();

  return (
    <div className="space-y-8 p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <SearchCheck className="h-4 w-4" />
            <span>Search & Answer Engine Readiness</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            SEO & AEO Completeness Console
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Internal completeness checklist auditing title tags, meta descriptions, AEO direct answers, formulas, structured data, canonical URLs, and internal link topologies across all {allTools.length} tools.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-1.5 text-xs font-medium text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Schema.org JSON-LD Clean</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Audit Dashboard */}
      <SeoDashboardClient initialTools={allTools} categories={CATEGORIES} />
    </div>
  );
}
