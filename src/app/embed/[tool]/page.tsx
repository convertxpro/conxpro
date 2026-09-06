import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { ALL_TOOLS } from '@/config/categories';
import { ConverterCanvas } from '@/components/converters/ConverterCanvas';
import { ExternalLink, Sparkles, Shield, Zap } from 'lucide-react';

interface EmbedPageProps {
  params: {
    tool: string;
  };
  searchParams?: {
    theme?: string;
  };
}

export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    tool: tool.slug,
  }));
}

export async function generateMetadata({ params }: EmbedPageProps): Promise<Metadata> {
  const tool = ALL_TOOLS.find((t) => t.slug === params.tool);
  if (!tool) return {};

  return {
    title: `${tool.name} (Embed Widget) — ApexTools`,
    description: `Embeddable responsive widget for ${tool.name}.`,
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default function EmbedToolPage({ params, searchParams }: EmbedPageProps) {
  const tool = ALL_TOOLS.find((t) => t.slug === params.tool);
  if (!tool) {
    notFound();
  }

  const requestedTheme = searchParams?.theme;
  const themeClass = requestedTheme === 'dark' ? 'dark' : requestedTheme === 'light' ? 'light' : '';

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-3 sm:p-4 font-sans antialiased ${themeClass}`}>
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 p-4 sm:p-6 shadow-md dark:border-slate-800/80 dark:bg-slate-900/95">
        {/* Minimal Embedded Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/25">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight">
                {tool.name}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                {tool.description}
              </p>
            </div>
          </div>

          <Link
            href={`/convert/${tool.categorySlug}/${tool.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg transition-colors"
          >
            <span>Full Tool</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        {/* Interactive Tool Canvas */}
        <div className="w-full">
          <ConverterCanvas tool={tool} />
        </div>

        {/* Minimal Embed Footer Attribution */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Shield className="h-3 w-3" /> 100% Private
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-500" /> Instant
            </span>
          </div>

          <div>
            Powered by{' '}
            <Link
              href={`/convert/${tool.categorySlug}/${tool.slug}`}
              target="_blank"
              rel="noopener"
              className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ApexTools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
