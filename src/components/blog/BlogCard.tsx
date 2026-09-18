import React from 'react';
import Link from 'next/link';
import { Clock, Calendar, ArrowRight, Sparkles } from 'lucide-react';
import { BlogPost } from '@/lib/blog/posts';

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
}

export const BlogCard: React.FC<BlogCardProps> = ({ post, featured = false }) => {
  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/10 sm:p-8 lg:p-10 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${post.coverGradient} blur-3xl opacity-50 group-hover:opacity-80 transition-opacity`} />

        <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                FEATURED PILLAR
              </span>
              <span
                className="rounded-full px-3 py-0.5 text-xs font-semibold"
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
            </div>

            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>

            <p className="text-sm text-slate-600 sm:text-base dark:text-slate-300 leading-relaxed">
              {post.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40"
              >
                <span>Read Full Article</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={`/convert/${post.relatedTool.categorySlug}/${post.relatedTool.slug}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Launch {post.relatedTool.name}</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white/40 p-5 backdrop-blur-md lg:w-72 dark:border-slate-800/60 dark:bg-slate-950/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Author
            </span>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-sm">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{post.author.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{post.author.role}</p>
              </div>
            </div>
            <div className="border-t border-slate-200/60 pt-3 dark:border-slate-800/60">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Updated {post.updatedDate}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 dark:border-slate-800/80 dark:bg-slate-900/60">
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: `${post.categoryColor}15`,
              color: post.categoryColor,
              border: `1px solid ${post.categoryColor}30`,
            }}
          >
            {post.category}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock className="h-3 w-3" />
            {post.readTime}
          </span>
        </div>

        <h3 className="text-lg font-bold tracking-tight text-slate-900 line-clamp-2 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {post.shortDescription}
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800/80 dark:text-slate-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {post.author.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {post.author.name}
            </span>
            <span className="text-[10px] text-slate-400">{post.publishedDate}</span>
          </div>
        </div>

        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
          aria-label={`Read article: ${post.title}`}
        >
          <span>Read</span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
};
