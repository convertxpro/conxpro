import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/config/categories';
import { ArrowRight, Sparkles, Building, FileText, Image, Video, Ruler, DollarSign, Code, Clock, Palette, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Landmark: Building,
  FileText,
  Image,
  Video,
  Ruler,
  DollarSign,
  Code,
  Clock,
  Palette,
  Archive,
};

export const CategoryBento: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {CATEGORIES.map((category, index) => {
        const IconComponent = ICON_MAP[category.iconName] || FileText;
        const isFeatured = index === 0; // Pakistan Regional highlighted

        return (
          <div
            key={category.id}
            className={cn(
              'group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700',
              isFeatured && 'sm:col-span-2 bg-gradient-to-br from-emerald-500/5 via-white/80 to-teal-500/5 dark:from-emerald-950/20 dark:via-slate-900/60 dark:to-teal-950/20 border-emerald-500/30'
            )}
          >
            <div>
              {/* Top header row */}
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110',
                    `bg-gradient-to-tr ${category.gradient}`
                  )}
                >
                  <IconComponent className="h-6 w-6" />
                </div>

                {category.badge && (
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      isFeatured
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300'
                        : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    )}
                  >
                    {category.badge}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {category.name}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {category.description}
              </p>

              {/* Popular Tools Pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {category.tools.slice(0, isFeatured ? 5 : 3).map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/convert/${tool.categorySlug}/${tool.slug}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white/80 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                  >
                    <span>{tool.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Category Link */}
            <div className="mt-6 border-t border-slate-100 pt-3 dark:border-slate-800/60">
              <Link
                href={`/convert/${category.slug}`}
                className="flex items-center justify-between text-xs font-semibold text-slate-700 group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400"
              >
                <span>View all {category.tools.length} converters</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
