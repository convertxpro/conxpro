import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { BookOpen, Clock, ArrowRight, Sparkles, ChevronRight, Tag, HelpCircle } from 'lucide-react';
import { getAllGuides } from '@/lib/guides/guides';
import { siteConfig } from '@/config/site';
import { AdSlot } from '@/components/ads/AdSlot';

export const metadata: Metadata = {
  title: `Conversion & Measurement Guides | ${siteConfig.name}`,
  description:
    'Comprehensive evergreen guides on Pakistani land measurement (Marla/Kanal), Gold bullion Tola purity, iPhone HEIC vs JPG, and government PDF compression.',
  alternates: {
    canonical: `${siteConfig.url}/guides`,
  },
  openGraph: {
    title: `Conversion & Measurement Guides — ${siteConfig.name}`,
    description:
      'In-depth guides on Pakistani land measurement, gold purity calculation, document compression, and currency remittance.',
    url: `${siteConfig.url}/guides`,
    siteName: siteConfig.name,
  },
};

export default function GuidesHubPage() {
  const guides = getAllGuides();
  const featuredGuide = guides.find((g) => g.featured) || guides[0];
  const regularGuides = guides.filter((g) => g.slug !== featuredGuide?.slug);

  return (
    <div className="min-h-screen bg-slate-950 py-12 text-slate-100 antialiased">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumbs */}
        <div className="mb-6 flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-200">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-indigo-400">Topical Educational Guides</span>
        </div>

        {/* Hero Header */}
        <div className="mb-12 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-400">
            <BookOpen className="h-3.5 w-3.5" />
            Topical Authority Hub
          </div>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Guides, Calculations & Measurement Standards
          </h1>
          <p className="mt-3 max-w-3xl text-base text-slate-400 leading-relaxed">
            In-depth references and practical tutorials written by industry specialists. Demystify
            Pakistani real estate units, bullion gold standards, and digital file workflows.
          </p>
        </div>

        {/* Header Leaderboard Ad */}
        <AdSlot placement="header_leaderboard" className="my-6" />

        {/* Featured Guide Banner */}
        {featuredGuide && (
          <div className="relative mb-12 overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/80 to-slate-950 p-6 shadow-2xl backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-bold text-white shadow-sm">
                    FEATURED PILLAR GUIDE
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {featuredGuide.readTime}
                  </span>
                </div>

                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {featuredGuide.title}
                </h2>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {featuredGuide.shortDescription}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={`/guides/${featuredGuide.slug}`}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/50"
                  >
                    <span>Read Complete Guide</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>

                  <Link
                    href={`/convert/${featuredGuide.relatedTool.categorySlug}/${featuredGuide.relatedTool.slug}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 transition-all hover:bg-slate-700 hover:text-white"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>Launch {featuredGuide.relatedTool.name}</span>
                  </Link>
                </div>
              </div>

              {/* Key takeaways sidebar */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 lg:w-80">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  Key Takeaways
                </div>
                <ul className="mt-3 space-y-2 text-xs text-slate-300">
                  {featuredGuide.keyTakeaways.slice(0, 3).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Regular Guides Grid */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">All Educational Guides</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {regularGuides.map((guide) => (
              <div
                key={guide.slug}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg backdrop-blur-sm transition-all hover:border-indigo-500/40 hover:bg-slate-900/90 hover:shadow-indigo-500/5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-indigo-300">
                      {guide.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {guide.readTime}
                    </span>
                  </div>

                  <Link href={`/guides/${guide.slug}`} className="group block">
                    <h3 className="text-lg font-bold text-white transition-colors group-hover:text-indigo-400">
                      {guide.title}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {guide.shortDescription}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <span className="text-[11px] text-slate-400">By {guide.author.split(',')[0]}</span>
                  <Link
                    href={`/guides/${guide.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Read Article</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In-Content Native Ad */}
        <AdSlot placement="in_content_native" className="my-8" />
      </div>
    </div>
  );
}
