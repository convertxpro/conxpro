import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ALL_TOOLS, CATEGORIES } from '@/config/categories';
import { siteConfig } from '@/config/site';
import { Code2, Sparkles, Shield, Zap, ExternalLink, Copy, CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Free Embeddable Web Utilities & Calculator Widgets — ApexTools',
  description: 'Embed high-speed, interactive file converters, Pakistani real estate & gold calculators, and hardware testing widgets on your website or blog for free.',
  alternates: {
    canonical: `${siteConfig.url}/embed`,
  },
  openGraph: {
    title: 'Free Embeddable Calculators & Tool Widgets — ApexTools',
    description: '1-click responsive widgets for your blog or website. Gold tola calculator, currency rates, mic test, and unit converters.',
    url: `${siteConfig.url}/embed`,
  },
};

export default function EmbedDirectoryPage() {
  // Highlight top embeddable utility tools
  const popularEmbedTools = ALL_TOOLS.filter(
    (t) =>
      t.popular ||
      t.pakistanSpecific ||
      ['tola-to-grams', 'marla-to-square-feet', 'usd-to-pkr', 'webcam-test', 'mic-test', 'heic-to-jpg', 'wav-to-mp3'].includes(t.slug)
  ).slice(0, 16);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800/60 dark:text-indigo-300 text-xs font-semibold mb-4">
            <Code2 className="h-4 w-4" />
            <span>Webmaster & Developer Widgets</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Embed Interactive Tools on Your Website
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400">
            Boost user engagement on your blog, financial portal, or real estate site. Free, responsive, lightning-fast, and styled with automatic dark mode.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-4">
              <Zap className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Zero Configuration</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Copy a single line of standard HTML iframe snippet. Works immediately in WordPress, Webflow, Wix, Squarespace, or custom code.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-4">
              <Shield className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">100% Client-Side Privacy</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Calculations and media checks run locally in the visitor&apos;s browser. Zero intrusive tracking, zero popups, and secure execution.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Adaptive Theming</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Supports automatic theme detection, light mode, or dark mode URL parameters to match your website styling seamlessly.
            </p>
          </div>
        </div>

        {/* Available Embeds Catalog */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular Embeddable Widgets</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Select any tool to get instant embed code and preview</p>
            </div>
            <Link
              href="/"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All 150+ Tools</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularEmbedTools.map((tool) => (
              <div
                key={tool.id}
                className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      {tool.categoryName}
                    </span>
                    {tool.badge && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-medium">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/embed/${tool.slug}`}
                    target="_blank"
                    className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                  >
                    <span>Preview Widget</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>

                  <Link
                    href={`/convert/${tool.categorySlug}/${tool.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg"
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>Get Code</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Embed Instructions Box */}
        <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 p-6 sm:p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Example Embed Snippet
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Paste this snippet into your HTML page or CMS editor to embed the live <b>Tola to Grams Gold Converter</b>:
          </p>
          <div className="relative rounded-xl bg-slate-900 p-4 text-xs font-mono text-slate-200 overflow-x-auto border border-slate-800">
            <code>
              {`<iframe src="https://apextools.app/embed/tola-to-grams" width="100%" height="600" frameborder="0" style="border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; width: 100%;" title="Tola to Grams Converter - ApexTools" loading="lazy"></iframe>`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
