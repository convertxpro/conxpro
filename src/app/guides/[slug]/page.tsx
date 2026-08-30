import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  BookOpen,
  Clock,
  Calendar,
  User,
  ChevronRight,
  Sparkles,
  ArrowRight,
  List,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { getGuideBySlug, getAllGuides } from '@/lib/guides/guides';
import { generateGuideMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { FAQAccordion } from '@/components/layout/FAQAccordion';
import { AdSlot } from '@/components/ads/AdSlot';
import { siteConfig } from '@/config/site';

interface GuidePageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const guides = getAllGuides();
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return {};

  return generateGuideMetadata({
    title: guide.title,
    description: guide.shortDescription,
    slug: guide.slug,
    publishedTime: guide.publishedDate,
    author: guide.author,
  });
}

export default function GuideArticlePage({ params }: GuidePageProps) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  const allGuides = getAllGuides();
  const relatedGuides = allGuides.filter((g) => g.slug !== guide.slug).slice(0, 2);

  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'Educational Guides', url: `${siteConfig.url}/guides` },
    { name: guide.title, url: `${siteConfig.url}/guides/${guide.slug}` },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-10 text-slate-100 antialiased">
      {/* Schema.org Structured Data */}
      <JsonLd
        url={`${siteConfig.url}/guides/${guide.slug}`}
        description={guide.shortDescription}
        breadcrumbs={breadcrumbs}
        faqs={guide.faqs}
        article={{
          headline: guide.title,
          description: guide.shortDescription,
          datePublished: guide.publishedDate,
          dateModified: guide.updatedDate,
          authorName: guide.author,
        }}
      />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-200">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/guides" className="transition-colors hover:text-slate-200">
            Guides
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-indigo-400 truncate max-w-xs">{guide.title}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              {guide.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              {guide.readTime}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5" />
              Published {guide.publishedDate}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight">
            {guide.title}
          </h1>

          <div className="flex items-center gap-3 border-y border-slate-800/80 py-3 text-xs text-slate-400">
            <User className="h-4 w-4 text-slate-400" />
            <span>Written by <strong className="text-slate-200">{guide.author}</strong></span>
          </div>
        </header>

        {/* Header Leaderboard Ad */}
        <AdSlot placement="header_leaderboard" className="my-6" />

        {/* Interactive Converter Widget Banner */}
        <div className="my-8 flex flex-col justify-between gap-4 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 p-5 sm:flex-row sm:items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Interactive Converter Tool</span>
            </div>
            <div className="text-sm font-semibold text-white">
              Try the online {guide.relatedTool.name} calculator right now
            </div>
          </div>
          <Link
            href={`/convert/${guide.relatedTool.categorySlug}/${guide.relatedTool.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500"
          >
            <span>{guide.relatedTool.ctaText}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Main Article Content */}
          <main className="lg:col-span-8 space-y-8">
            {/* Key Takeaways Callout */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Executive Summary & Key Takeaways</span>
              </div>
              <ul className="mt-3 space-y-2 text-xs text-slate-300">
                {guide.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                    <span className="leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* In-Content Native Ad */}
            <AdSlot placement="in_content_native" className="my-6" />

            {/* Article Prose HTML Body */}
            <article
              className="prose prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-sm prose-li:text-slate-300 prose-li:text-xs prose-strong:text-white prose-code:text-indigo-300 prose-code:bg-slate-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded"
              dangerouslySetInnerHTML={{ __html: guide.contentHtml }}
            />

            {/* In-Article Action Banner */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-center">
              <h3 className="text-lg font-bold text-white">Need to run this calculation now?</h3>
              <p className="mt-1 text-xs text-slate-400">
                ConvertHub provides instant, 100% free client-side converters with zero upload requirements.
              </p>
              <Link
                href={`/convert/${guide.relatedTool.categorySlug}/${guide.relatedTool.slug}`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500"
              >
                <span>Open {guide.relatedTool.name}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* FAQ Accordion Section */}
            {guide.faqs && guide.faqs.length > 0 && (
              <div className="pt-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
                  <p className="text-xs text-slate-400">Quick answers to common questions about this guide topic.</p>
                </div>
                <FAQAccordion items={guide.faqs} />
              </div>
            )}
          </main>

          {/* Sticky Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of Contents */}
            <div className="sticky top-20 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300">
                <List className="h-4 w-4 text-indigo-400" />
                <span>Table of Contents</span>
              </div>
              <nav className="space-y-1.5 text-xs">
                {guide.tableOfContents.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block rounded-lg px-2.5 py-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-indigo-400"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>

              {/* Sidebar Medium Rectangle Ad Slot */}
              <div className="pt-4 border-t border-slate-800">
                <AdSlot placement="sidebar_rectangle" />
              </div>

              {/* Related Guides List */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="text-xs font-bold text-white">More Educational Guides</div>
                {relatedGuides.map((rg) => (
                  <Link
                    key={rg.slug}
                    href={`/guides/${rg.slug}`}
                    className="group block rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 transition-colors hover:border-indigo-500/30"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-indigo-400">
                      {rg.title}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">{rg.readTime}</div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Footer Banner Ad */}
        <AdSlot placement="footer_banner" className="my-8" />
      </div>
    </div>
  );
}
