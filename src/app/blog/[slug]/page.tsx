import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';
import {
  Clock,
  Calendar,
  User,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import {
  getAllBlogPosts,
  getBlogPostBySlug,
  getRelatedBlogPosts,
} from '@/lib/blog/posts';
import { generateBlogPostMetadata } from '@/lib/seo/metadata';
import { JsonLd } from '@/components/seo/JsonLd';
import { TableOfContents } from '@/components/blog/TableOfContents';
import { BlogToolCta } from '@/components/blog/BlogToolCta';
import { ShareButtons } from '@/components/blog/ShareButtons';
import { BlogCard } from '@/components/blog/BlogCard';
import { FAQAccordion } from '@/components/layout/FAQAccordion';
import { siteConfig } from '@/config/site';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug);
  if (!post) return {};

  return generateBlogPostMetadata({
    title: post.seoTitle || post.title,
    description: post.shortDescription,
    slug: post.slug,
    publishedTime: post.publishedDate,
    modifiedTime: post.updatedDate,
    authorName: post.author.name,
    category: post.category,
    tags: post.tags,
  });
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPostBySlug(params.slug);
  if (!post) notFound();

  const relatedPosts = getRelatedBlogPosts(post.slug, 3);
  const articleUrl = `${siteConfig.url}/blog/${post.slug}`;

  const breadcrumbs = [
    { name: 'Home', url: siteConfig.url },
    { name: 'Blog', url: `${siteConfig.url}/blog` },
    { name: post.category, url: `${siteConfig.url}/blog?category=${post.categorySlug}` },
    { name: post.title, url: articleUrl },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 text-slate-900 transition-colors antialiased dark:bg-[#090d16] dark:text-slate-100">
      {/* Schema.org Structured Data */}
      <JsonLd
        url={articleUrl}
        description={post.shortDescription}
        breadcrumbs={breadcrumbs}
        faqs={post.faqs}
        article={{
          headline: post.title,
          description: post.shortDescription,
          datePublished: post.publishedDate,
          dateModified: post.updatedDate,
          authorName: post.author.name,
        }}
      />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumbs" className="mb-6 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link href="/" className="transition-colors hover:text-slate-900 dark:hover:text-slate-200">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/blog" className="transition-colors hover:text-slate-900 dark:hover:text-slate-200">
            Blog
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span
            className="rounded px-1.5 py-0.5 font-medium"
            style={{
              backgroundColor: `${post.categoryColor}15`,
              color: post.categoryColor,
            }}
          >
            {post.category}
          </span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-slate-800 dark:text-slate-300 truncate max-w-xs sm:max-w-md">
            {post.title}
          </span>
        </nav>

        {/* Article Header */}
        <header className="relative mb-10 overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl sm:p-10 dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${post.coverGradient} blur-3xl opacity-50`} />

          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  backgroundColor: `${post.categoryColor}15`,
                  color: post.categoryColor,
                  border: `1px solid ${post.categoryColor}30`,
                }}
              >
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {post.readTime}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                Published {post.publishedDate}
              </span>
              {post.updatedDate !== post.publishedDate && (
                <span className="hidden sm:inline-flex text-xs text-slate-400">
                  (Updated {post.updatedDate})
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl leading-tight dark:text-white">
              {post.title}
            </h1>

            <p className="text-sm text-slate-600 sm:text-base dark:text-slate-300 leading-relaxed max-w-3xl">
              {post.shortDescription}
            </p>

            {/* Author & Share Bar */}
            <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{post.author.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{post.author.role}</p>
                </div>
              </div>

              <ShareButtons url={articleUrl} title={post.title} />
            </div>
          </div>
        </header>

        {/* Main Content Layout: Two Columns (Article + Sidebar) */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Article Column */}
          <main className="lg:col-span-8 space-y-8">
            {/* Key Takeaways Callout Box */}
            {post.keyTakeaways && post.keyTakeaways.length > 0 && (
              <div className="rounded-2xl border border-indigo-500/20 bg-indigo-50/50 p-6 backdrop-blur-md dark:border-indigo-500/30 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
                  <Sparkles className="h-4 w-4" />
                  <span>Key Takeaways & Summary</span>
                </div>
                <ul className="mt-3.5 space-y-2.5">
                  {post.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* In-Article Contextual Tool CTA Banner */}
            {post.relatedTool && <BlogToolCta tool={post.relatedTool} />}

            {/* Main HTML Content */}
            <article
              className="prose prose-slate max-w-none text-slate-700 dark:prose-invert dark:text-slate-300
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-b prose-h2:border-slate-200/80 dark:prose-h2:border-slate-800/80 prose-h2:pb-2
                prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                prose-p:text-sm sm:prose-p:text-base prose-p:leading-relaxed
                prose-li:text-sm sm:prose-li:text-base
                prose-code:text-indigo-600 dark:prose-code:text-indigo-400 prose-code:bg-slate-100 dark:prose-code:bg-slate-800/80 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                prose-table:text-xs sm:prose-table:text-sm"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {/* Article Tags */}
            <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 pt-6 dark:border-slate-800/80">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Related Tags:</span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* In-Article FAQ Accordion */}
            {post.faqs && post.faqs.length > 0 && (
              <section className="mt-12 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  <span>Frequently Asked Questions</span>
                </div>
                <FAQAccordion items={post.faqs} />
              </section>
            )}

            {/* Author Bio Box */}
            <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-xl sm:flex-row sm:items-center dark:border-slate-800/80 dark:bg-slate-900/60">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-xl font-bold text-white shadow-md">
                {post.author.name.charAt(0)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {post.author.name}
                  </span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {post.author.role}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {post.author.bio}
                </p>
              </div>
            </div>
          </main>

          {/* Sidebar Column */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Sticky Table of Contents */}
            {post.tableOfContents && post.tableOfContents.length > 0 && (
              <div className="sticky top-24 space-y-6">
                <TableOfContents items={post.tableOfContents} />

                {/* Sidebar Quick Converter Widget */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-slate-100 p-5 backdrop-blur-xl dark:border-slate-800/80 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Quick Tool
                  </span>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
                    {post.relatedTool.name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Fast, secure conversion in your browser without uploading to servers.
                  </p>
                  <Link
                    href={`/convert/${post.relatedTool.categorySlug}/${post.relatedTool.slug}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-indigo-500"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 border-t border-slate-200/80 pt-12 dark:border-slate-800/80">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Related Guides & Tutorials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Continue reading about modern media formats and document optimization.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                <span>View all posts</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((rel) => (
                <BlogCard key={rel.slug} post={rel} />
              ))}
            </div>
          </section>
        )}

        {/* Bottom Converter Callout */}
        <section className="mt-16 rounded-3xl border border-slate-200/80 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-8 text-center text-white shadow-xl sm:p-12">
          <h3 className="text-2xl font-black tracking-tight sm:text-3xl">
            Convert Any File Free in Seconds
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-indigo-100 leading-relaxed">
            Over 50+ free utilities for documents, images, audio, video, physical units, and developer data.
            Zero watermarks, no registration, and 100% private.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs sm:text-sm font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50"
            >
              <span>Explore All Converters</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
