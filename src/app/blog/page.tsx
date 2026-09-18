import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  BookOpen,
  ChevronRight,
  Rss,
  Sparkles,
  Zap,
  ArrowRight,
  Shield,
  FileText,
  Image as ImageIcon,
  Headphones,
  FileCode,
} from 'lucide-react';
import { getAllBlogPosts, getFeaturedBlogPosts } from '@/lib/blog/posts';
import { generateBlogIndexMetadata } from '@/lib/seo/metadata';
import { BlogSearchFilter } from '@/components/blog/BlogSearchFilter';
import { BlogCard } from '@/components/blog/BlogCard';
import { JsonLd } from '@/components/seo/JsonLd';
import { siteConfig } from '@/config/site';

export const metadata: Metadata = generateBlogIndexMetadata();

export default function BlogHubPage() {
  const allPosts = getAllBlogPosts();
  const featuredPost = getFeaturedBlogPosts()[0] || allPosts[0];
  const regularPosts = allPosts.filter((p) => p.slug !== featuredPost?.slug);

  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'Blog & Tutorials', url: `${siteConfig.url}/blog` },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 text-slate-900 transition-colors antialiased dark:bg-[#090d16] dark:text-slate-100">
      {/* Schema.org Breadcrumb JSON-LD */}
      <JsonLd
        url={`${siteConfig.url}/blog`}
        description={siteConfig.description}
        breadcrumbs={breadcrumbs}
      />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="mb-6 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-900 dark:hover:text-slate-200">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-indigo-600 dark:text-indigo-400">Blog & Tutorials</span>
        </nav>

        {/* Hero Section */}
        <div className="relative mb-12 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 lg:p-12 dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Engineering & Optimization Hub</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
              Tech, Productivity & Format Optimization{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400">
                Blog
              </span>
            </h1>

            <p className="text-sm text-slate-600 sm:text-base dark:text-slate-300 leading-relaxed">
              Deep dives, benchmark comparisons, and practical step-by-step tutorials from the
              ApexTools engineering team. Master modern image codecs, PDF optimization, audio bitrates,
              and client-side browser privacy.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Research-backed benchmarks
              </span>
              <span className="inline-flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-emerald-500" /> Zero data tracking
              </span>
              <Link
                href="/feed.xml"
                target="_blank"
                className="inline-flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <Rss className="h-3.5 w-3.5 text-orange-500" /> RSS Feed
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Post Hero */}
        {featuredPost && (
          <section className="mb-14">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Editor&apos;s Top Recommendation
              </h2>
            </div>
            <BlogCard post={featuredPost} featured />
          </section>
        )}

        {/* Search & All Posts Grid */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
              All Articles & Guides
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Filter by category or search for specific formats, codecs, and tutorials.
            </p>
          </div>

          <BlogSearchFilter posts={regularPosts.length > 0 ? allPosts : [featuredPost]} />
        </section>

        {/* Tools Spotlight Bento Banner */}
        <section className="my-16 rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Quick Access
              </span>
              <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Launch ApexTools Online Converters
              </h3>
            </div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
            >
              <span>View all 50+ tools</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/convert/image/png-to-webp"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5 dark:border-slate-800/60 dark:bg-slate-950/40"
            >
              <div className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  PNG to WebP
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cut image sizes by up to 80% while retaining transparency.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                Convert Image <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/convert/document/compress-pdf"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 transition-all hover:border-indigo-500/40 hover:bg-indigo-500/5 dark:border-slate-800/60 dark:bg-slate-950/40"
            >
              <div className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <FileText className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Compress PDF
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Shrink PDF files below 1MB or 500KB for application portals.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                Shrink PDF <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/convert/audio/wav-to-mp3"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 transition-all hover:border-amber-500/40 hover:bg-amber-500/5 dark:border-slate-800/60 dark:bg-slate-950/40"
            >
              <div className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Headphones className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  WAV to MP3
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Encode studio WAV files into 320kbps high-bitrate MP3.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                Encode Audio <ArrowRight className="h-3 w-3" />
              </span>
            </Link>

            <Link
              href="/convert/document/pdf-to-word"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-slate-50/60 p-4 transition-all hover:border-purple-500/40 hover:bg-purple-500/5 dark:border-slate-800/60 dark:bg-slate-950/40"
            >
              <div className="space-y-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <FileCode className="h-4 w-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  PDF to Word OCR
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Extract selectable text and layout into editable DOCX.
                </p>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                Extract Text <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </section>

        {/* RSS Feed Callout Banner */}
        <section className="mb-12 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-emerald-500/10 p-6 sm:flex-row sm:p-8 dark:border-slate-800/80">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
              <Rss className="h-4 w-4 text-orange-500" />
              Subscribe to the ApexTools RSS Feed
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Get notified when new engineering benchmarks, format tutorials, and security deep dives are published.
            </p>
          </div>
          <Link
            href="/feed.xml"
            target="_blank"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            <Rss className="h-3.5 w-3.5 text-orange-500" />
            <span>Open RSS Feed (XML)</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
