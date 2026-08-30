'use client';

import React, { useState, useEffect } from 'react';
import {
  Code2,
  Copy,
  Check,
  X,
  ExternalLink,
  Eye,
  Settings2,
  Sun,
  Moon,
  Laptop,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ToolMetadata } from '@/config/categories';

export interface EmbedWidgetModalProps {
  tool: ToolMetadata;
  isOpen: boolean;
  onClose: () => void;
}

export const EmbedWidgetModal: React.FC<EmbedWidgetModalProps> = ({
  tool,
  isOpen,
  onClose,
}) => {
  const [theme, setTheme] = useState<'auto' | 'light' | 'dark'>('auto');
  const [width, setWidth] = useState<'100%' | '650px' | '500px' | '420px'>('100%');
  const [height, setHeight] = useState<number>(650);
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://converthub.com';
  const embedUrl = `${origin}/embed/${tool.slug}${theme !== 'auto' ? `?theme=${theme}` : ''}`;
  const toolCanonicalUrl = `${origin}/convert/${tool.categorySlug}/${tool.slug}`;

  const iframeSnippet = `<iframe 
  src="${embedUrl}" 
  width="${width}" 
  height="${height}" 
  frameborder="0" 
  style="${showBorder ? 'border: 1px solid #e2e8f0; ' : 'border: none; '}border-radius: 16px; overflow: hidden; width: 100%; max-width: ${width};"
  title="${tool.name} - Free Online Converter"
  loading="lazy"
></iframe>
<div style="font-size: 12px; color: #64748b; margin-top: 6px; font-family: system-ui, -apple-system, sans-serif; text-align: right;">
  Powered by <a href="${toolCanonicalUrl}" target="_blank" rel="noopener" style="color: #4f46e5; text-decoration: none; font-weight: 600;">ConvertHub ${tool.name}</a>
</div>`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy iframe snippet', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl dark:border-slate-800/80 dark:bg-slate-900 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Embed {tool.name} Widget
                </h3>
                <span className="rounded-full bg-indigo-100/70 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Responsive iFrame
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Embed this interactive tool directly on your website or blog for free.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Customization Options Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800/80 dark:bg-slate-950/50">
            {/* 1. Theme Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Settings2 className="h-3.5 w-3.5 text-indigo-500" />
                Color Theme
              </label>
              <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => setTheme('auto')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    theme === 'auto'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Laptop className="h-3 w-3" /> Auto
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Sun className="h-3 w-3" /> Light
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Moon className="h-3 w-3" /> Dark
                </button>
              </div>
            </div>

            {/* 2. Width Preset */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Maximize2 className="h-3.5 w-3.5 text-indigo-500" />
                Widget Width
              </label>
              <select
                value={width}
                onChange={(e) => setWidth(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="100%">100% (Full Responsive)</option>
                <option value="650px">650px (Standard Column)</option>
                <option value="500px">500px (Medium Sidebar)</option>
                <option value="420px">420px (Compact Mobile)</option>
              </select>
            </div>

            {/* 3. Height Preset */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                Widget Height
              </label>
              <select
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={550}>550 px (Compact)</option>
                <option value={650}>650 px (Recommended)</option>
                <option value={750}>750 px (Spacious)</option>
              </select>
            </div>
          </div>

          {/* Tab Switcher: Code vs Preview */}
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'code'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Embed HTML Code
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                activeTab === 'preview'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Interactive Live Preview
            </button>
          </div>

          {/* Tab 1: Embed Code */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-emerald-400 shadow-inner overflow-x-auto">
                <pre className="whitespace-pre-wrap break-all leading-relaxed">
                  {iframeSnippet}
                </pre>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span>
                  💡 Paste this HTML snippet anywhere in your CMS (WordPress, Webflow, React, HTML).
                </span>
                <a
                  href={embedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  <span>Open standalone URL</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {/* Tab 2: Live Iframe Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-2">
              <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 dark:border-slate-800 dark:bg-slate-950 p-2">
                <iframe
                  src={embedUrl}
                  width="100%"
                  height={Math.min(height, 500)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  title="Live Embed Preview"
                />
              </div>
              <p className="text-center text-[11px] text-slate-400">
                Preview reflects live widget behavior in requested theme.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-950/80">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Free forever • 100% Attribution Compliant
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={onClose}
              className="flex-1 sm:flex-initial"
            >
              Close
            </Button>
            <Button
              variant="gradient"
              size="md"
              onClick={handleCopyCode}
              leftIcon={copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
              className="flex-1 sm:flex-initial shadow-md shadow-indigo-500/20"
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Embed Code'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
