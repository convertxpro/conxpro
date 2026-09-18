'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Layers, Sparkles } from 'lucide-react';
import { BlogPost } from '@/lib/blog/posts';
import { BlogCard } from './BlogCard';

interface BlogSearchFilterProps {
  posts: BlogPost[];
}

export const BlogSearchFilter: React.FC<BlogSearchFilterProps> = ({ posts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Compute category breakdown counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: posts.length };
    posts.forEach((p) => {
      counts[p.categorySlug] = (counts[p.categorySlug] || 0) + 1;
    });
    return counts;
  }, [posts]);

  // Unique categories
  const categories = useMemo(() => {
    const unique = new Map<string, { name: string; slug: string; color: string }>();
    posts.forEach((p) => {
      if (!unique.has(p.categorySlug)) {
        unique.set(p.categorySlug, {
          name: p.category,
          slug: p.categorySlug,
          color: p.categoryColor,
        });
      }
    });
    return Array.from(unique.values());
  }, [posts]);

  // Filtered posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'all' || post.categorySlug === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const inTitle = post.title.toLowerCase().includes(q);
      const inDesc = post.shortDescription.toLowerCase().includes(q);
      const inTags = post.tags.some((t) => t.toLowerCase().includes(q));
      const inAuthor = post.author.name.toLowerCase().includes(q);

      return inTitle || inDesc || inTags || inAuthor;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        {/* Search Input Bar */}
        <div className="relative mx-auto max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, format comparisons, and tutorials (e.g. WebP, PDF, OCR)..."
            className="w-full rounded-2xl border border-slate-200/80 bg-white/80 py-3.5 pl-11 pr-10 text-sm text-slate-900 shadow-sm backdrop-blur-md transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/80 dark:text-white dark:placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                : 'border border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Articles</span>
            <span
              className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                selectedCategory === 'all'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {categoryCounts.all || 0}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            const count = categoryCounts[cat.slug] || 0;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'border border-slate-200/80 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                />
                <span>{cat.name}</span>
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${
                    isSelected
                      ? 'bg-indigo-700 text-white'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result Counter & State */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 text-xs text-slate-500 dark:border-slate-800/80 dark:text-slate-400">
        <span>
          Showing <strong>{filteredPosts.length}</strong> {filteredPosts.length === 1 ? 'article' : 'articles'}
          {selectedCategory !== 'all' && (
            <span> in <span className="text-indigo-600 dark:text-indigo-400">{categories.find((c) => c.slug === selectedCategory)?.name}</span></span>
          )}
          {searchQuery && (
            <span> matching &ldquo;<span className="text-slate-900 dark:text-white">{searchQuery}</span>&rdquo;</span>
          )}
        </span>

        {(searchQuery || selectedCategory !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Articles Grid */}
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-800">
          <Sparkles className="h-10 w-10 text-slate-400 dark:text-slate-600" />
          <h3 className="mt-4 text-base font-bold text-slate-800 dark:text-slate-200">
            No articles found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            We couldn&apos;t find any tutorials matching your query. Try different keywords or browse all categories.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-500 transition"
          >
            Show All Articles
          </button>
        </div>
      )}
    </div>
  );
};
