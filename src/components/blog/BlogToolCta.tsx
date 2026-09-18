import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';
import { RelatedTool } from '@/lib/blog/posts';

interface BlogToolCtaProps {
  tool: RelatedTool;
}

export const BlogToolCta: React.FC<BlogToolCtaProps> = ({ tool }) => {
  return (
    <div className="relative my-10 overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 p-6 shadow-2xl backdrop-blur-xl sm:p-8 dark:border-indigo-500/40">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-3 py-1 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Interactive Tool Available
            </span>
            {tool.badge && (
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                {tool.badge}
              </span>
            )}
          </div>

          <h3 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            {tool.name}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {tool.description} Convert directly in your browser with zero data retention and instant high-speed rendering.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" /> Instant Processing
            </span>
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-emerald-400" /> 100% Private
            </span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" /> Zero Sign-up Required
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <Link
            href={`/convert/${tool.categorySlug}/${tool.slug}`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-indigo-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/50 hover:brightness-110 active:scale-95"
          >
            <span>{tool.ctaText}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
