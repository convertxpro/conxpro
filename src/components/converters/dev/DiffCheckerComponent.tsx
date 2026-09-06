'use client';

import React, { useState, useMemo, useRef } from 'react';
import {
  GitCompare,
  ArrowLeftRight,
  Copy,
  Download,
  Trash2,
  Settings2,
  FileCode,
  Check,
  Split,
  Layers,
  Sparkles,
  AlignLeft,
  Search,
  Eye,
  FileText
} from 'lucide-react';
import * as Diff from 'diff';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn } from '@/lib/utils';

interface DiffCheckerComponentProps {
  tool?: ToolMetadata;
}

type ViewMode = 'split' | 'unified';
type Granularity = 'lines' | 'words' | 'chars';

interface PresetItem {
  id: string;
  name: string;
  desc: string;
  original: string;
  modified: string;
}

const SAMPLE_DIFF_PRESETS: PresetItem[] = [
  {
    id: 'code-refactor',
    name: 'TypeScript Code Optimization',
    desc: 'Promise-based syntax refactored to async/await with error boundaries',
    original: `// Legacy Data Fetcher v1.0
function fetchUserProfile(userId: string) {
  return fetch('/api/v1/users/' + userId)
    .then(function(res) {
      if (!res.ok) {
        throw new Error('Network error: ' + res.status);
      }
      return res.json();
    })
    .then(function(data) {
      console.log('Fetched user:', data.name);
      return data;
    })
    .catch(function(err) {
      console.error('Fetch failed:', err);
      return null;
    });
}`,
    modified: `// Optimized NextGen Data Fetcher v2.0
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const response = await fetch(\`/api/v2/users/\${encodeURIComponent(userId)}\`, {
      headers: { 'Cache-Control': 'no-cache', 'Accept': 'application/json' },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(\`API HTTP error status \${response.status}\`);
    }

    const data: UserProfile = await response.json();
    console.info('[UserSync] Profile loaded successfully:', data.name);
    return data;
  } catch (error) {
    console.error('[UserSync] Data fetch error:', error);
    return null;
  }
}`,
  },
  {
    id: 'json-config',
    name: 'JSON API Configuration Diff',
    desc: 'Kubernetes environment parameters and service settings',
    original: `{
  "apiVersion": "apps/v1",
  "name": "apextools-worker",
  "replicas": 3,
  "env": {
    "NODE_ENV": "development",
    "REDIS_PORT": 6379,
    "MAX_FILE_SIZE_MB": 10,
    "ENABLE_RATE_LIMIT": false
  },
  "features": [
    "json-converter",
    "yaml-parser"
  ]
}`,
    modified: `{
  "apiVersion": "apps/v2",
  "name": "apextools-worker-production",
  "replicas": 8,
  "env": {
    "NODE_ENV": "production",
    "REDIS_PORT": 6379,
    "REDIS_TLS": true,
    "MAX_FILE_SIZE_MB": 50,
    "ENABLE_RATE_LIMIT": true,
    "WASM_CONCURRENCY": 4
  },
  "features": [
    "json-converter",
    "yaml-parser",
    "ai-ocr-scanner",
    "ai-background-remover",
    "screen-recorder"
  ]
}`,
  },
  {
    id: 'editorial',
    name: 'Editorial Article Revisions',
    desc: 'Copywriting polishing and grammar enhancement',
    original: `ApexTools is a simple online tool for converting files.
It supports PDF files, image resizing, and some developer utilities.
All tasks are processed online and you can download files directly.
We hope you enjoy using this application.`,
    modified: `ApexTools is a lightning-fast, privacy-first conversion suite.
It seamlessly executes WebAssembly OCR, AI background removal, media transcoding, and deep Pakistan financial calculations.
All operations process 100% in-browser with zero server uploads and instant latency.
Start converting your files with complete confidence and privacy.`,
  },
];

export const DiffCheckerComponent: React.FC<DiffCheckerComponentProps> = ({
  tool,
}) => {
  const [originalText, setOriginalText] = useState<string>(SAMPLE_DIFF_PRESETS[0].original);
  const [modifiedText, setModifiedText] = useState<string>(SAMPLE_DIFF_PRESETS[0].modified);

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [granularity, setGranularity] = useState<Granularity>('lines');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [stripEmptyLines, setStripEmptyLines] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const originalFileInputRef = useRef<HTMLInputElement>(null);
  const modifiedFileInputRef = useRef<HTMLInputElement>(null);

  // Compute normalized texts based on toggles
  const { normOriginal, normModified } = useMemo(() => {
    let orig = originalText;
    let mod = modifiedText;

    if (stripEmptyLines) {
      orig = orig.split('\n').filter((l) => l.trim().length > 0).join('\n');
      mod = mod.split('\n').filter((l) => l.trim().length > 0).join('\n');
    }

    if (ignoreCase) {
      orig = orig.toLowerCase();
      mod = mod.toLowerCase();
    }

    return { normOriginal: orig, normModified: mod };
  }, [originalText, modifiedText, stripEmptyLines, ignoreCase]);

  // Compute diff parts
  const diffResult = useMemo(() => {
    if (granularity === 'words') {
      return ignoreWhitespace
        ? Diff.diffWords(normOriginal, normModified)
        : Diff.diffWordsWithSpace(normOriginal, normModified);
    } else if (granularity === 'chars') {
      return Diff.diffChars(normOriginal, normModified);
    } else {
      return Diff.diffLines(normOriginal, normModified, {
        ignoreWhitespace,
      });
    }
  }, [normOriginal, normModified, granularity, ignoreWhitespace]);

  // Compute metrics
  const stats = useMemo(() => {
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;

    diffResult.forEach((part) => {
      const count = part.count || (part.value.match(/\n/g) || []).length + 1;
      if (part.added) additions += count;
      else if (part.removed) deletions += count;
      else unchanged += count;
    });

    const total = additions + deletions + unchanged;
    const similarity = total > 0 ? Math.round((unchanged / total) * 100) : 100;

    return { additions, deletions, unchanged, similarity };
  }, [diffResult]);

  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  const handleClear = () => {
    setOriginalText('');
    setModifiedText('');
  };

  const handleExportPatch = () => {
    const patch = Diff.createPatch(
      'file.txt',
      originalText,
      modifiedText,
      'Original',
      'Modified'
    );
    const blob = new Blob([patch], { type: 'text/x-diff;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'changes.patch';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyDiff = () => {
    const patch = Diff.createPatch(
      'file.txt',
      originalText,
      modifiedText,
      'Original',
      'Modified'
    );
    navigator.clipboard.writeText(patch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'original' | 'modified'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        if (target === 'original') setOriginalText(content);
        else setModifiedText(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Split lines calculation for side-by-side view
  const splitRows = useMemo(() => {
    const origLines = originalText.split('\n');
    const modLines = modifiedText.split('\n');
    const lineDiff = Diff.diffLines(normOriginal, normModified, {
      ignoreWhitespace,
    });

    interface RowItem {
      leftNum?: number;
      leftText?: string;
      leftType?: 'removed' | 'normal';
      rightNum?: number;
      rightText?: string;
      rightType?: 'added' | 'normal';
    }

    const rows: RowItem[] = [];
    let lIdx = 1;
    let rIdx = 1;

    lineDiff.forEach((part) => {
      const lines = part.value.replace(/\n$/, '').split('\n');
      if (part.added) {
        lines.forEach((line) => {
          rows.push({
            rightNum: rIdx++,
            rightText: line,
            rightType: 'added',
          });
        });
      } else if (part.removed) {
        lines.forEach((line) => {
          rows.push({
            leftNum: lIdx++,
            leftText: line,
            leftType: 'removed',
          });
        });
      } else {
        lines.forEach((line) => {
          rows.push({
            leftNum: lIdx++,
            leftText: line,
            leftType: 'normal',
            rightNum: rIdx++,
            rightText: line,
            rightType: 'normal',
          });
        });
      }
    });

    return rows;
  }, [originalText, modifiedText, normOriginal, normModified, ignoreWhitespace]);

  return (
    <div className="w-full space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <GitCompare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Interactive Text & Code Diff Checker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Side-by-Side & Unified comparison with character-level accuracy and .patch export
            </p>
          </div>
        </div>

        {/* Diff Statistics Summary */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
            +{stats.additions} Additions
          </span>
          <span className="inline-flex items-center rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
            -{stats.deletions} Deletions
          </span>
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {stats.similarity}% Similarity
          </span>
        </div>
      </div>

      {/* Mode, Granularity & Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/90">
        {/* Left: View Mode & Granularity */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                viewMode === 'split'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <Split className="h-3.5 w-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                viewMode === 'unified'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              <AlignLeft className="h-3.5 w-3.5" />
              <span>Unified Inline</span>
            </button>
          </div>

          {/* Granularity */}
          <div className="flex items-center rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setGranularity('lines')}
              className={cn(
                'rounded-lg px-2.5 py-1.5 transition',
                granularity === 'lines'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              Line Diff
            </button>
            <button
              type="button"
              onClick={() => setGranularity('words')}
              className={cn(
                'rounded-lg px-2.5 py-1.5 transition',
                granularity === 'words'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              Word Diff
            </button>
            <button
              type="button"
              onClick={() => setGranularity('chars')}
              className={cn(
                'rounded-lg px-2.5 py-1.5 transition',
                granularity === 'chars'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              )}
            >
              Character Diff
            </button>
          </div>
        </div>

        {/* Right: Filters & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggles */}
          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium select-none">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Ignore Whitespace</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium select-none ml-2">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Ignore Case</span>
          </label>

          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

          <button
            type="button"
            onClick={handleSwap}
            title="Swap Original and Modified"
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Swap</span>
          </button>

          <button
            type="button"
            onClick={handleCopyDiff}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-slate-500" />
            )}
            <span>Copy Diff</span>
          </button>

          <button
            type="button"
            onClick={handleExportPatch}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export .patch</span>
          </button>
        </div>
      </div>

      {/* Dual Inputs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Input: Original */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-rose-500" />
              <span>Original Source Text</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={originalFileInputRef}
                type="file"
                onChange={(e) => handleFileUpload(e, 'original')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => originalFileInputRef.current?.click()}
                className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setOriginalText('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste original text or code here..."
            className="h-44 w-full resize-none p-3 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100 bg-transparent"
          />
        </div>

        {/* Right Input: Modified */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-3.5 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              <span>Modified / New Text</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                ref={modifiedFileInputRef}
                type="file"
                onChange={(e) => handleFileUpload(e, 'modified')}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => modifiedFileInputRef.current?.click()}
                className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setModifiedText('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <textarea
            value={modifiedText}
            onChange={(e) => setModifiedText(e.target.value)}
            placeholder="Paste modified text or revised code here..."
            className="h-44 w-full resize-none p-3 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100 bg-transparent"
          />
        </div>
      </div>

      {/* Visual Diff Output Viewer */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/90">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Eye className="h-4 w-4 text-indigo-500" />
            Computed Diff Result ({viewMode === 'split' ? 'Split View' : 'Unified View'})
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            Mode: {granularity.toUpperCase()}
          </span>
        </div>

        {/* View Content */}
        <div className="max-h-[500px] overflow-auto p-2 font-mono text-xs leading-relaxed">
          {viewMode === 'split' ? (
            /* Split View Table */
            <table className="w-full border-collapse select-text">
              <tbody>
                {splitRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30">
                    {/* Left Side: Original Line */}
                    <td className="w-10 select-none pr-2 text-right text-[10px] text-slate-400 border-r border-slate-200 dark:border-slate-800">
                      {row.leftNum || ''}
                    </td>
                    <td
                      className={cn(
                        'w-1/2 px-2 py-0.5 whitespace-pre-wrap break-all border-r border-slate-200 dark:border-slate-800',
                        row.leftType === 'removed' &&
                          'bg-rose-100/80 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200 font-semibold'
                      )}
                    >
                      {row.leftText || ''}
                    </td>

                    {/* Right Side: Modified Line */}
                    <td className="w-10 select-none pr-2 pl-2 text-right text-[10px] text-slate-400 border-r border-slate-200 dark:border-slate-800">
                      {row.rightNum || ''}
                    </td>
                    <td
                      className={cn(
                        'w-1/2 px-2 py-0.5 whitespace-pre-wrap break-all',
                        row.rightType === 'added' &&
                          'bg-emerald-100/80 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200 font-semibold'
                      )}
                    >
                      {row.rightText || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            /* Unified View */
            <div className="space-y-0.5 select-text">
              {diffResult.map((part, idx) => {
                const colorClass = part.added
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200 font-semibold'
                  : part.removed
                  ? 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200 line-through'
                  : 'text-slate-800 dark:text-slate-200';

                return (
                  <span
                    key={idx}
                    className={cn('inline whitespace-pre-wrap', colorClass)}
                  >
                    {part.value}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Presets Demo Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-3">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Load Sample Comparison Scenarios
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_DIFF_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                setOriginalText(preset.original);
                setModifiedText(preset.modified);
              }}
              className="flex flex-col items-start justify-between rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 shadow-sm"
            >
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {preset.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  {preset.desc}
                </p>
              </div>
              <span className="mt-2 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                Click to load →
              </span>
            </button>
          ))}
        </div>
      </div>

      <PrivacyAssuranceBadge />
    </div>
  );
};
