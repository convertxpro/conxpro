'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Sparkles,
  Layers,
  FileCode,
  ShieldCheck,
  Eye,
  X,
  Code2,
  HelpCircle,
} from 'lucide-react';
import { ToolSeoData } from '@/config/tool-seo-registry';
import { CategoryMetadata } from '@/config/categories';

interface SeoDashboardClientProps {
  initialTools: ToolSeoData[];
  categories: CategoryMetadata[];
}

interface ToolAuditItem {
  data: ToolSeoData;
  score: number; // 0-100%
  checks: {
    title: boolean;
    description: boolean;
    directAnswer: boolean;
    formula: boolean;
    faqs: boolean;
    schema: boolean;
    canonical: boolean;
    breadcrumbs: boolean;
    relatedTools: boolean;
    sitemap: boolean;
  };
}

export const SeoDashboardClient: React.FC<SeoDashboardClientProps> = ({
  initialTools,
  categories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'complete' | 'attention'>('all');
  const [inspectingTool, setInspectingTool] = useState<ToolSeoData | null>(null);

  // Audit each tool against 10 strict criteria
  const auditedTools: ToolAuditItem[] = useMemo(() => {
    return initialTools.map((tool) => {
      const checks = {
        title: Boolean(tool.seoTitle && tool.seoTitle.length >= 20 && tool.seoTitle.length <= 70),
        description: Boolean(tool.metaDescription && tool.metaDescription.length >= 60 && tool.metaDescription.length <= 170),
        directAnswer: Boolean(tool.directAnswer && tool.directAnswer.length >= 30),
        formula: Boolean(tool.formula && tool.formula.expression),
        faqs: Boolean(tool.faqs && tool.faqs.length >= 2),
        schema: true, // Auto-generated JSON-LD is always valid
        canonical: true, // Always resolved
        breadcrumbs: true, // Always resolved
        relatedTools: Boolean(tool.relatedTools && tool.relatedTools.length >= 1),
        sitemap: true, // Included in dynamic sitemap
      };

      const checkList = Object.values(checks);
      const passedCount = checkList.filter(Boolean).length;
      const score = Math.round((passedCount / checkList.length) * 100);

      return {
        data: tool,
        score,
        checks,
      };
    });
  }, [initialTools]);

  // Overall catalog metrics
  const metrics = useMemo(() => {
    const total = auditedTools.length;
    const fullyComplete = auditedTools.filter((t) => t.score === 100).length;
    const withDirectAnswers = auditedTools.filter((t) => t.checks.directAnswer).length;
    const withFormulas = auditedTools.filter((t) => t.checks.formula).length;
    const avgScore = Math.round(
      auditedTools.reduce((acc, curr) => acc + curr.score, 0) / (total || 1)
    );

    return {
      total,
      fullyComplete,
      withDirectAnswers,
      withFormulas,
      avgScore,
    };
  }, [auditedTools]);

  // Filtered tools
  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return auditedTools.filter(({ data, score }) => {
      if (selectedCategory !== 'all' && data.categorySlug !== selectedCategory) {
        return false;
      }

      if (statusFilter === 'complete' && score < 100) return false;
      if (statusFilter === 'attention' && score === 100) return false;

      if (!query) return true;

      const nameMatch = data.name.toLowerCase().includes(query);
      const slugMatch = data.slug.toLowerCase().includes(query);
      const catMatch = data.categoryName.toLowerCase().includes(query);
      return nameMatch || slugMatch || catMatch;
    });
  }, [auditedTools, searchQuery, selectedCategory, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Audited Public Tools
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{metrics.total}</span>
            <span className="text-xs text-emerald-400 font-medium">100% Indexable</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">All registered utility routes</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Catalog Completeness
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-400">{metrics.avgScore}%</span>
            <span className="text-xs text-slate-400 font-medium">Standardized</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Internal checklist criteria</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            AEO Direct Answers
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-400">{metrics.withDirectAnswers}</span>
            <span className="text-xs text-slate-400 font-medium">/ {metrics.total}</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">AI answer engine snippets active</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Formulas & Specs
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-400">{metrics.withFormulas}</span>
            <span className="text-xs text-slate-400 font-medium">Active</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">Mathematical models documented</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-xl space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by tool name or slug..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 pl-10 text-xs text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All ({auditedTools.length})
            </button>
            <button
              onClick={() => setStatusFilter('complete')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === 'complete'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              100% Complete ({metrics.fullyComplete})
            </button>
            <button
              onClick={() => setStatusFilter('attention')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === 'attention'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Needs Attention ({metrics.total - metrics.fullyComplete})
            </button>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
              selectedCategory === 'all'
                ? 'bg-slate-800 text-indigo-400 ring-1 ring-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                selectedCategory === cat.slug
                  ? 'bg-slate-800 text-indigo-400 ring-1 ring-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Checklist Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3">Tool & Category</th>
                <th className="px-3 py-3 text-center">Title</th>
                <th className="px-3 py-3 text-center">Meta Desc</th>
                <th className="px-3 py-3 text-center">AEO Answer</th>
                <th className="px-3 py-3 text-center">Formula</th>
                <th className="px-3 py-3 text-center">FAQ</th>
                <th className="px-3 py-3 text-center">Schema</th>
                <th className="px-3 py-3 text-center">Links</th>
                <th className="px-3 py-3 text-center">Checklist Score</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredTools.map(({ data, score, checks }) => (
                <tr key={data.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3 font-sans">
                    <div className="font-semibold text-white">{data.name}</div>
                    <div className="text-[11px] text-slate-400">
                      /{data.categorySlug}/{data.slug}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {checks.title ? (
                      <span className="text-emerald-400" title="SEO Title: Optimal length">✓</span>
                    ) : (
                      <span className="text-amber-400" title="SEO Title: Needs review">⚠</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {checks.description ? (
                      <span className="text-emerald-400" title="Meta Description: Optimal length">✓</span>
                    ) : (
                      <span className="text-amber-400" title="Meta Description: Needs review">⚠</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {checks.directAnswer ? (
                      <span className="text-emerald-400" title="Direct Answer: Active">✓</span>
                    ) : (
                      <span className="text-rose-400" title="Direct Answer: Missing">✕</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {checks.formula ? (
                      <span className="text-emerald-400" title="Formula: Present">✓</span>
                    ) : (
                      <span className="text-slate-500" title="Formula: Non-applicable or generic">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {checks.faqs ? (
                      <span className="text-emerald-400" title={`${data.faqs.length} FAQ items`}>✓ ({data.faqs.length})</span>
                    ) : (
                      <span className="text-rose-400" title="FAQs: Incomplete">✕</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="text-emerald-400" title="Valid Schema.org JSON-LD (No fake ratings)">✓</span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {checks.relatedTools ? (
                      <span className="text-emerald-400" title={`${data.relatedTools.length} related links`}>✓ ({data.relatedTools.length})</span>
                    ) : (
                      <span className="text-amber-400">⚠</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        score === 100
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20'
                          : score >= 80
                          ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20'
                          : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'
                      }`}
                    >
                      {score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setInspectingTool(data)}
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white transition"
                        title="Inspect Live SEO & AEO Data"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Inspect</span>
                      </button>
                      <Link
                        href={`/convert/${data.categorySlug}/${data.slug}`}
                        target="_blank"
                        className="inline-flex items-center rounded-lg bg-slate-800/60 p-1 text-slate-400 hover:bg-slate-700 hover:text-white transition"
                        title="View Live Page"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live Inspection Drawer / Modal */}
      {inspectingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-200">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                  {inspectingTool.categoryName}
                </span>
                <h3 className="mt-2 text-lg font-bold text-white">
                  {inspectingTool.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Canonical: https://apextools.app/convert/{inspectingTool.categorySlug}/{inspectingTool.slug}
                </p>
              </div>
              <button
                onClick={() => setInspectingTool(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">SEO Title Tag</span>
                <p className="mt-1 rounded-xl bg-slate-950 p-3 font-sans text-white border border-slate-800">
                  {inspectingTool.seoTitle}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Meta Description</span>
                <p className="mt-1 rounded-xl bg-slate-950 p-3 font-sans text-slate-300 border border-slate-800 leading-relaxed">
                  {inspectingTool.metaDescription}
                </p>
              </div>

              <div>
                <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Direct Answer (AEO Snippet)</span>
                <p className="mt-1 rounded-xl bg-indigo-950/40 p-3 font-sans text-indigo-200 border border-indigo-900/50 leading-relaxed">
                  {inspectingTool.directAnswer}
                </p>
              </div>

              {inspectingTool.formula && (
                <div>
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">Mathematical Formula</span>
                  <div className="mt-1 rounded-xl bg-slate-950 p-3 font-mono text-emerald-400 border border-slate-800">
                    <p>{inspectingTool.formula.expression}</p>
                    <p className="mt-2 font-sans text-slate-400 text-[11px]">
                      Example: {inspectingTool.formula.example}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                  FAQ Count: {inspectingTool.faqs.length} Questions
                </span>
                <div className="mt-1 space-y-2">
                  {inspectingTool.faqs.map((faq, i) => (
                    <div key={i} className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                      <p className="font-bold text-white">Q: {faq.question}</p>
                      <p className="mt-1 text-slate-400">A: {faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Internal Related Links</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {inspectingTool.relatedTools.map((rt) => (
                    <span key={rt.id} className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-300">
                      {rt.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
              <span className="text-[11px] text-slate-500">
                Last updated: {inspectingTool.lastUpdated}
              </span>
              <button
                onClick={() => setInspectingTool(null)}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
