import React from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/seo/Breadcrumbs';
import { AdSlot } from '@/components/ads/AdSlot';
import { HowToGuide, HowToStep } from '@/components/layout/HowToGuide';
import { FAQAccordion, FaqItem } from '@/components/layout/FAQAccordion';
import { RelatedTools, RelatedToolItem } from '@/components/layout/RelatedTools';
import { ConversionTable, ConversionRow } from '@/components/layout/ConversionTable';
import { JsonLd, DefinedTermData } from '@/components/seo/JsonLd';
import { ArrowLeftRight, Sparkles, Shield, Zap, FileText, Image, Video, Code, Ruler, DollarSign, Clock, Palette, Archive, Smartphone, Laptop, Car, CreditCard, Cpu, Building2 } from 'lucide-react';
import Link from 'next/link';
import { EmbedWidgetButton } from '@/components/widgets/EmbedWidgetButton';
import { CATEGORIES, ToolMetadata } from '@/config/categories';
import { siteConfig } from '@/config/site';

const ICON_MAP: Record<string, any> = {
  FileText, Image, Video, Code, Ruler, DollarSign, Clock, Palette, Archive, Smartphone, Laptop, Car, CreditCard, Cpu, Building2
};

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
  /** Direct-Answer Paragraph for AEO snippet extraction (50-80 words) */
  dap?: string;
  /** DefinedTerm schemas for unit/format knowledge graph entries */
  definedTerms?: DefinedTermData[];
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
  dap,
  definedTerms = [],
}) => {
  const currentUrl = `${siteConfig.url}/convert/${categorySlug}/${slug}`;
  const breadcrumbItems = [
    { name: 'Home', url: siteConfig.url },
    { name: category, url: `${siteConfig.url}/convert/${categorySlug}` },
    { name: toolName, url: currentUrl },
  ];

  const categoryData = CATEGORIES.find(c => c.slug === categorySlug);
  const CategoryIcon = categoryData && ICON_MAP[categoryData.iconName] ? ICON_MAP[categoryData.iconName] : Sparkles;

  return (
    <div
      className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8"
      data-tool-name={toolName}
      data-tool-category={category}
      data-tool-slug={slug}
      data-tool-price="free"
    >
      {/* Schema.org Structured Data Injector (SEO + AEO) */}
      <JsonLd
        toolName={toolName}
        url={currentUrl}
        description={description}
        faqs={faqs}
        howToSteps={howToSteps}
        breadcrumbs={breadcrumbItems}
        financialProduct={financialProduct}
        speakableSelectors={['h1', '.seo-speakable-summary', '.faq-answer']}
        definedTerms={definedTerms}
        dataset={
          conversionTable
            ? {
                name: `${toolName} Reference Conversion Dataset`,
                description: `${conversionTable.title} — Verified lookup table and conversion factors for ${toolName}.`,
                keywords: [toolName, category, 'conversion table', 'reference matrix'],
              }
            : undefined
        }
      />

      {/* 1. Header Banner Ad (Reserved 728x90) */}
      <AdSlot placement="header_leaderboard" />

      {/* 2. Breadcrumb Navigation Hierarchy */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* 3. Hero Header Section */}
      <header className="mb-8 text-center sm:text-left">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className={cn(
            "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-bold backdrop-blur-sm shadow-sm",
            categoryData ? `border-${categoryData.color.replace('#', '')}/30 bg-gradient-to-r ${categoryData.gradient} text-white` : "border-indigo-200/80 bg-indigo-50/80 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
          )}>
            <CategoryIcon className="h-4 w-4" />
            <span className="uppercase tracking-wider">{category}</span>
            <span className="opacity-60">•</span>
            <span>{badgeText}</span>
          </div>

          <EmbedWidgetButton
            tool={{
              id: slug,
              name: toolName,
              slug: slug,
              categorySlug: categorySlug,
              categoryName: category,
              description: description,
              iconName: 'Code',
            }}
          />
        </div>

        <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 sm:text-5xl lg:text-6xl dark:from-white dark:via-slate-200 dark:to-slate-400 drop-shadow-sm mt-2">
          {toolName}
        </h1>

        <p className="mt-3 text-sm text-slate-600 sm:text-base dark:text-slate-400 max-w-3xl">
          {description}
        </p>

        {/* AEO: Direct-Answer Paragraph for AI snippet extraction */}
        {dap && (
          <p className="seo-speakable-summary mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300 max-w-3xl border-l-4 border-indigo-400 pl-4 bg-indigo-50/40 dark:bg-indigo-950/20 py-2 rounded-r-lg">
            {dap}
          </p>
        )}

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
      <section role="region" aria-label="Converter Tool" className="mb-8 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-xl backdrop-blur-md sm:p-8 dark:border-slate-800/80 dark:bg-slate-900/80">
        {children}
      </section>

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
      <section role="region" aria-label="How to Use" className="my-12">
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
      <section role="region" aria-label="Frequently Asked Questions" className="my-12">
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
      <aside role="complementary" aria-label="Related Tools" className="my-12">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Explore Related Converters
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Discover additional free conversion utilities in {category} and other categories.
          </p>
        </div>
        <RelatedTools tools={relatedTools} />
      </aside>
    </div>
  );
};
