import React from 'react';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AdSlot } from '@/components/ads/AdSlot';
import { HowToGuide, HowToStep } from '@/components/layout/HowToGuide';
import { FAQAccordion, FaqItem } from '@/components/layout/FAQAccordion';
import { RelatedTools, RelatedToolItem } from '@/components/layout/RelatedTools';
import { ConversionTable, ConversionRow } from '@/components/layout/ConversionTable';
import { JsonLd } from '@/components/seo/JsonLd';
import { ToolMetadata } from '@/config/categories';
import { ArrowLeftRight, Sparkles, Shield, Zap } from 'lucide-react';
import Link from 'next/link';

export interface ToolLayoutProps {
  toolName: string;
  category: string;
  categorySlug: string;
  slug: string;
  description: string;
  badgeText?: string;
  children: React.ReactNode;
  howToSteps: HowToStep[];
  formula?: {
    title: string;
    expression: string;
    example: string;
  };
  conversionTable?: {
    title: string;
    headers: [string, string] | [string, string, string];
    rows: ConversionRow[];
    caption?: string;
  };
  faqs: FaqItem[];
  relatedTools: (RelatedToolItem | ToolMetadata)[];
  reverseTool?: {
    name: string;
    url: string;
  };
  financialProduct?: {
    name: string;
    description: string;
    baseCurrency?: string;
    targetCurrency?: string;
    currentRate?: number;
  };
}

export const ToolLayout: React.FC<ToolLayoutProps> = ({
  toolName,
  category,
  categorySlug,
  slug,
  description,
  badgeText = '100% Free & Instant',
  children,
  howToSteps,
  formula,
  conversionTable,
  faqs,
  relatedTools,
  reverseTool,
  financialProduct,
}) => {
  const currentUrl = `https://converthub.com/convert/${categorySlug}/${slug}`;
  const breadcrumbItems = [
    { name: 'Home', url: 'https://converthub.com' },
    { name: category, url: `https://converthub.com/convert/${categorySlug}` },
    { name: toolName, url: currentUrl },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Schema.org Structured Data Injector */}
      <JsonLd
        toolName={toolName}
        url={currentUrl}
        description={description}
        faqs={faqs}
        howToSteps={howToSteps}
        breadcrumbs={breadcrumbItems}
        financialProduct={financialProduct}
      />

      {/* 1. Header Banner Ad (Reserved 728x90) */}
      <AdSlot placement="header_leaderboard" />

      {/* 2. Breadcrumb Navigation Hierarchy */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* 3. Hero Header Section */}
      <header className="mb-8 text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700 backdrop-blur-sm dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{badgeText}</span>
          <span className="text-indigo-400">•</span>
          <span>No Registration Required</span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
          {toolName}
        </h1>

        <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-400 max-w-3xl">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" /> Instant browser processing
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-emerald-500" /> Private & Auto-Purged
          </span>
        </div>
      </header>

      {/* 4. Interactive Converter Canvas */}
      <main className="mb-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-slate-800/80 dark:bg-slate-900/80">
        {children}
      </main>

      {/* Reverse Tool Quick Switch */}
      {reverseTool && (
        <div className="mb-8 flex items-center justify-center">
          <Link
            href={reverseTool.url}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-500" />
            <span>Looking for the opposite? Switch to <strong>{reverseTool.name}</strong></span>
          </Link>
        </div>
      )}

      {/* 5. In-Content Native Ad */}
      <AdSlot placement="in_content_native" />

      {/* 6. Visual How to Convert Guide */}
      <section className="my-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            How to Convert with {toolName}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Follow these 3 simple steps to complete your conversion in seconds.
          </p>
        </div>
        <HowToGuide steps={howToSteps} />
      </section>

      {/* 7. Mathematical Formula & Step-by-Step Example */}
      {formula && (
        <section className="my-12 rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-indigo-50/30 p-6 sm:p-8 dark:border-slate-800/80 dark:from-slate-900/60 dark:to-indigo-950/20">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {formula.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Formula representation used for accurate calculations:
          </p>
          <div className="my-4 rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm text-emerald-400 shadow-inner">
            {formula.expression}
          </div>
          <div className="rounded-xl bg-white/80 p-4 text-xs text-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">Calculation Example:</span>{' '}
            {formula.example}
          </div>
        </section>
      )}

      {/* 8. Pre-Calculated Conversion Reference Table */}
      {conversionTable && (
        <section className="my-12">
          <div className="mb-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {conversionTable.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Quick reference lookup table for standard unit calculations.
            </p>
          </div>
          <ConversionTable
            headers={conversionTable.headers}
            rows={conversionTable.rows}
            caption={conversionTable.caption}
          />
        </section>
      )}

      {/* 9. Comprehensive SEO FAQ Accordion */}
      <section className="my-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Common questions and answers about {toolName}.
          </p>
        </div>
        <FAQAccordion items={faqs} />
      </section>

      {/* 10. Bidirectional Internal Linking / Related Converters */}
      <section className="my-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Related Converters
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Discover additional free conversion utilities in {category} and other categories.
          </p>
        </div>
        <RelatedTools tools={relatedTools} />
      </section>
    </div>
  );
};
