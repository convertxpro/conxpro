import React from 'react';
import { Metadata } from 'next';
import { CATEGORIES, ALL_TOOLS } from '@/config/categories';
import { siteConfig } from '@/config/site';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { JsonLd } from '@/components/seo/JsonLd';
import { ToolsDirectoryClient } from '@/components/tools/ToolsDirectoryClient';
import { AdSlot } from '@/components/ads/AdSlot';
import { Sparkles, Wrench } from 'lucide-react';

export const metadata: Metadata = {
  title: `All Online Conversion & Utility Tools (150+ Free Tools) | ${siteConfig.name}`,
  description: `Browse all ${ALL_TOOLS.length}+ free online conversion tools on ApexTools. Convert documents, images, video, audio, units, currency, developer code, and run hardware diagnostics.`,
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
  openGraph: {
    title: `All Free Online Tools Directory | ${siteConfig.name}`,
    description: `Complete searchable directory of ${ALL_TOOLS.length}+ free online conversion and utility tools on ApexTools.`,
    url: `${siteConfig.url}/tools`,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og?title=${encodeURIComponent('All Online Tools Directory')}&category=${encodeURIComponent('Complete Tool Catalog')}`,
        width: 1200,
        height: 630,
        alt: 'ApexTools Tools Directory',
      },
    ],
  },
};

export default function ToolsPage() {
  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'Tools Directory', url: `${siteConfig.url}/tools` },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Schema.org ItemList & BreadcrumbList for Directory Hub */}
      <JsonLd
        url={`${siteConfig.url}/tools`}
        description={`Complete searchable catalog of ${ALL_TOOLS.length}+ free online tools.`}
        breadcrumbs={breadcrumbs}
        itemList={{
          name: `${siteConfig.name} Complete Tools Directory`,
          description: `All ${ALL_TOOLS.length}+ free conversion and utility tools.`,
          items: ALL_TOOLS.map((t) => ({
            name: t.name,
            url: `${siteConfig.url}/convert/${t.categorySlug}/${t.slug}`,
          })),
        }}
      />

      {/* 1. Header Banner Ad */}
      <AdSlot placement="header_leaderboard" />

      {/* 2. Breadcrumbs */}
      <Breadcrumbs items={breadcrumbs} />

      {/* 3. Directory Header */}
      <div className="my-8 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Wrench className="h-3.5 w-3.5" />
          <span>Complete Utility Suite</span>
          <span className="opacity-40">•</span>
          <span>{ALL_TOOLS.length} Free Online Tools</span>
        </div>

        <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-white">
          All Online Tools & Converters
        </h1>
        <p className="mt-3 max-w-3xl text-sm sm:text-base text-slate-600 dark:text-slate-400">
          Explore our complete collection of fast, private, and zero-friction online utilities. Filter by category or search by unit names and format abbreviations to find the exact tool you need.
        </p>
      </div>

      {/* 4. Interactive Search & Directory Grid */}
      <ToolsDirectoryClient categories={CATEGORIES} tools={ALL_TOOLS} />

      {/* 5. In-Content Native Ad */}
      <div className="my-12">
        <AdSlot placement="in_content_native" />
      </div>
    </div>
  );
}
