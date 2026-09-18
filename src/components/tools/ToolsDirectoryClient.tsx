'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { ToolMetadata, CategoryMetadata } from '@/config/categories';

interface ToolsDirectoryClientProps {
  categories: CategoryMetadata[];
  tools: ToolMetadata[];
}

export const ToolsDirectoryClient: React.FC<ToolsDirectoryClientProps> = ({
  categories,
  tools,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      // Category filter
      if (selectedCategory !== 'all' && tool.categorySlug !== selectedCategory) {
        return false;
      }

      // Query filter
      if (!query) return true;

      const nameMatch = tool.name.toLowerCase().includes(query);
      const descMatch = tool.description.toLowerCase().includes(query);
      const slugMatch = tool.slug.toLowerCase().includes(query);
      const catMatch = tool.categoryName.toLowerCase().includes(query);
      const aliasMatch = tool.aliases?.some((a) => a.toLowerCase().includes(query));

      return nameMatch || descMatch || slugMatch || catMatch || aliasMatch;
    });
  }, [tools, searchQuery, selectedCategory]);

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools by name, unit, format, or abbreviation (e.g., pounds, heic, pdf, marla, json)..."
            aria-label="Search all tools"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-950/50 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            All Tools ({tools.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {cat.name} ({cat.tools.length})
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredTools.length}</span> tools
          {selectedCategory !== 'all' && (
            <span> in <span className="font-semibold text-indigo-600 dark:text-indigo-400">{categories.find(c => c.slug === selectedCategory)?.name}</span></span>
          )}
          {searchQuery && (
            <span> matching &ldquo;<span className="font-semibold text-slate-900 dark:text-white">{searchQuery}</span>&rdquo;</span>
          )}
        </p>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <Link
              key={tool.id}
              href={`/convert/${tool.categorySlug}/${tool.slug}`}
              className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-xs backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/50 dark:hover:border-indigo-800"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {tool.categoryName}
                  </span>
                  {tool.badge && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h2 className="mt-3 text-base font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                  {tool.name}
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {tool.description}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-indigo-600 dark:border-slate-800/60 dark:text-indigo-400">
                <span className="inline-flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free & Instant
                </span>
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">No tools found</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
