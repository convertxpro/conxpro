'use client';

import React, { useState } from 'react';
import {
  Copy,
  Check,
  Download,
  Trash2,
  Minimize2,
  Maximize2,
  FileCode,
  WrapText,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CodeActionToolbarProps {
  content: string;
  filename?: string;
  fileExtension?: string;
  onClear?: () => void;
  onBeautify?: () => void;
  onMinify?: () => void;
  isMinified?: boolean;
  wrapLines?: boolean;
  onToggleWrap?: () => void;
  showFormatButtons?: boolean;
  showStats?: boolean;
  customActions?: React.ReactNode;
  className?: string;
}

export const CodeActionToolbar: React.FC<CodeActionToolbarProps> = ({
  content,
  filename = 'output',
  fileExtension = 'txt',
  onClear,
  onBeautify,
  onMinify,
  isMinified,
  wrapLines,
  onToggleWrap,
  showFormatButtons = true,
  showStats = true,
  customActions,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const cleanExt = fileExtension.replace(/^\./, '');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${cleanExt}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const lines = content ? content.split('\n').length : 0;
  const chars = content ? content.length : 0;
  const bytes = new Blob([content]).size;
  const formattedSize =
    bytes < 1024
      ? `${bytes} B`
      : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50/90 px-3 py-2 text-xs dark:border-slate-800/80 dark:bg-slate-900/90 backdrop-blur-sm',
        className
      )}
    >
      {/* Left side: Stats & Info */}
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
        {showStats && content && (
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span>{lines} {lines === 1 ? 'line' : 'lines'}</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>{chars} chars</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{formattedSize}</span>
          </div>
        )}
      </div>

      {/* Right side: Action Buttons */}
      <div className="flex items-center gap-1">
        {customActions}

        {onToggleWrap && (
          <button
            type="button"
            onClick={onToggleWrap}
            title={wrapLines ? 'Disable Word Wrap' : 'Enable Word Wrap'}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors',
              wrapLines
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
          >
            <WrapText className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Wrap</span>
          </button>
        )}

        {showFormatButtons && onBeautify && (
          <button
            type="button"
            onClick={onBeautify}
            title="Prettify / Format"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-600 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden sm:inline">Beautify</span>
          </button>
        )}

        {showFormatButtons && onMinify && (
          <button
            type="button"
            onClick={onMinify}
            title={isMinified ? 'Expand / Un-minify' : 'Minify'}
            className={cn(
              'inline-flex items-center gap-1 rounded-md px-2 py-1 transition-colors',
              isMinified
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:bg-slate-800'
            )}
          >
            <Minimize2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Minify</span>
          </button>
        )}

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={!content}
            title="Clear text"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-slate-600 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        <button
          type="button"
          onClick={handleCopy}
          disabled={!content}
          title="Copy content to clipboard"
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition-all disabled:opacity-40',
            copied
              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
              : 'bg-slate-200/70 text-slate-800 hover:bg-slate-300/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownload}
          disabled={!content}
          title="Download as file"
          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 font-semibold text-white shadow-sm shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-40 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Download</span>
        </button>
      </div>
    </div>
  );
};
