import React from 'react';
import Link from 'next/link';
import { CATEGORIES } from '@/config/categories';
import { ArrowRight, Sparkles, Building, Building2, FileText, Image, Video, Ruler, DollarSign, Code, Clock, Palette, Archive, Smartphone, Laptop, Car, CreditCard, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Landmark: Building2,
  Building,
  Building2,
  FileText,
  Image,
  Video,
  Ruler,
  DollarSign,
  Code,
  Clock,
  Palette,
  Archive,
  Smartphone,
  Laptop,
  Car,
  CreditCard,
  Cpu,
};

export const CategoryBento: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {CATEGORIES.map((category, index) => {
        const IconComponent = ICON_MAP[category.iconName] || FileText;

        const isFeatured = index % 5 === 0;
        const bgPattern = category.slug.includes('developer') 
          ? 'bg-circuit-pattern' 
          : category.slug.includes('video') 
          ? 'bg-mesh-radial' 
          : 'bg-grid-dots';

        return (
          <div
            key={category.id}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-slate-300 hover:shadow-xl dark:border-slate-800/80 dark:bg-slate-900/40 dark:hover:border-slate-700",
              isFeatured && "sm:col-span-2 lg:col-span-2"
            )}
          >
            {/* Watermark Background */}
            <div className={cn("absolute -top-12 -right-12 h-40 w-40 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:rotate-12 group-hover:opacity-20", bgPattern)} />

            <div className="relative z-10">
              {/* Top header row */}
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)]',
                    `bg-gradient-to-tr ${category.gradient}`
                  )}
                >
                  <IconComponent className="h-6 w-6" />
                </div>

                {category.badge && (
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold tracking-widest text-indigo-700 uppercase dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
                    {category.badge}
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="mt-5 text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {category.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {category.description}
              </p>

              {/* Popular Tools Pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {category.tools.slice(0, isFeatured ? 6 : 4).map((tool) => (
                  <Link
                    key={tool.id}
                    href={`/convert/${tool.categorySlug}/${tool.slug}`}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200/70 bg-white/80 px-2.5 py-1.5 text-[11px] font-medium text-slate-700 transition-all hover:scale-105 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-300"
                  >
                    <span>{tool.name}</span>
                    <ArrowRight className="h-3 w-3 opacity-50" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Category Link */}
            <div className="relative z-10 mt-6 border-t border-slate-100 pt-4 dark:border-slate-800/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                {category.tools.length} Tools Available
              </span>
              <Link
                href={`/convert/${category.slug}`}
                className="flex items-center gap-1 text-sm font-bold text-slate-700 group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400 transition-colors"
              >
                <span>Explore Category</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
};
