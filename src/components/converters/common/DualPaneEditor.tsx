'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  FileCode,
  AlertCircle,
  CheckCircle2,
  Settings2,
  RefreshCw,
  Copy,
  Download,
  Trash2,
  Maximize2,
  Minimize2,
  Check,
} from 'lucide-react';
import { CodeActionToolbar } from './CodeActionToolbar';
import { PresetsSelector, PresetItem } from './PresetsSelector';
import { SyntaxHighlighting } from './SyntaxHighlighting';
import { PrivacyAssuranceBadge } from './PrivacyAssuranceBadge';
import { cn } from '@/lib/utils';

export interface DualPaneEditorProps {
  inputTitle?: string;
  outputTitle?: string;
  inputLanguage?: 'json' | 'yaml' | 'toml' | 'sql' | 'html' | 'text' | 'css' | 'javascript';
  outputLanguage?: 'json' | 'yaml' | 'toml' | 'sql' | 'html' | 'text' | 'css' | 'javascript';
  inputValue: string;
  outputValue: string;
  onInputChange: (val: string) => void;
  error?: string | null;
  presets?: PresetItem[];
  activePresetId?: string;
  onSelectPreset?: (preset: PresetItem) => void;
  onBeautify?: () => void;
  onMinify?: () => void;
  isMinified?: boolean;
  outputFilename?: string;
  outputFileExt?: string;
  acceptedFileTypes?: string;
  controls?: React.ReactNode;
  showPrivacyBanner?: boolean;
  className?: string;
}

export const DualPaneEditor: React.FC<DualPaneEditorProps> = ({
  inputTitle = 'Input Code / Data',
  outputTitle = 'Converted Output',
  inputLanguage = 'text',
  outputLanguage = 'text',
  inputValue,
  outputValue,
  onInputChange,
  error,
  presets,
  activePresetId,
  onSelectPreset,
  onBeautify,
  onMinify,
  isMinified,
  outputFilename = 'converted-output',
  outputFileExt = 'txt',
  acceptedFileTypes,
  controls,
  showPrivacyBanner = true,
  className,
}) => {
  const [wrapInput, setWrapInput] = useState(true);
  const [wrapOutput, setWrapOutput] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onInputChange(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content !== undefined) {
        onInputChange(content);
      }
    };
    reader.readAsText(file);
  };

  const inputLines = inputValue ? inputValue.split('\n').length : 0;
  const inputChars = inputValue ? inputValue.length : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* 1. Privacy Banner at Top */}
      {showPrivacyBanner && <PrivacyAssuranceBadge variant="detailed" />}

      {/* 2. Top Presets & Controls Bar */}
      {(presets || controls) && (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-900/60 backdrop-blur-sm">
          {presets && onSelectPreset ? (
            <PresetsSelector
              presets={presets}
              activePresetId={activePresetId}
              onSelect={onSelectPreset}
            />
          ) : (
            <div />
          )}

          {controls && <div className="flex items-center gap-2">{controls}</div>}
        </div>
      )}

      {/* 3. Dual Pane Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* LEFT PANE: INPUT */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            'flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all dark:bg-slate-900',
            isDragOver
              ? 'border-indigo-500 ring-2 ring-indigo-500/20'
              : 'border-slate-200/80 dark:border-slate-800/80'
          )}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {inputTitle}
              </h3>
              <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                {inputLanguage}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload file"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upload</span>
              </button>

              {inputValue && (
                <button
                  type="button"
                  onClick={() => onInputChange('')}
                  title="Clear input"
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-300 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Text Area Body with Line Numbers */}
          <div className="relative flex-1 min-h-[360px] bg-slate-950/5 dark:bg-slate-950/50">
            <textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={`Paste or type ${inputLanguage.toUpperCase()} code here, or drop a file...`}
              spellCheck={false}
              className={cn(
                'w-full h-full min-h-[360px] resize-y bg-transparent p-4 font-mono text-xs leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-600',
                wrapInput ? 'whitespace-pre-wrap break-all' : 'whitespace-pre overflow-x-auto'
              )}
            />

            {isDragOver && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-indigo-600/10 backdrop-blur-xs border-2 border-dashed border-indigo-500 rounded-b-2xl">
                <Upload className="h-8 w-8 text-indigo-600 animate-bounce" />
                <p className="mt-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                  Drop file to load content
                </p>
              </div>
            )}
          </div>

          {/* Footer stats */}
          <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/90 px-4 py-1.5 text-[11px] text-slate-500 dark:border-slate-800/80 dark:bg-slate-900/90 dark:text-slate-400">
            <span>{inputLines} {inputLines === 1 ? 'line' : 'lines'} • {inputChars} chars</span>
            <button
              type="button"
              onClick={() => setWrapInput((p) => !p)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              {wrapInput ? 'Wrap: ON' : 'Wrap: OFF'}
            </button>
          </div>
        </div>

        {/* RIGHT PANE: OUTPUT */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-4 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/90">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                {outputTitle}
              </h3>
              <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                {outputLanguage}
              </span>
            </div>
          </div>

          {/* Toolbar */}
          <CodeActionToolbar
            content={outputValue}
            filename={outputFilename}
            fileExtension={outputFileExt}
            onBeautify={onBeautify}
            onMinify={onMinify}
            isMinified={isMinified}
            wrapLines={wrapOutput}
            onToggleWrap={() => setWrapOutput((p) => !p)}
            showFormatButtons={Boolean(onBeautify || onMinify)}
          />

          {/* Error Message Alert */}
          {error && (
            <div className="m-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/90 p-3 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Syntax Parsing Error:</span>
                <p className="mt-0.5 font-mono text-[11px] whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          )}

          {/* Syntax Display Area */}
          <div className="flex-1 min-h-[320px] max-h-[500px] overflow-y-auto bg-slate-950/5 dark:bg-slate-950/60">
            <SyntaxHighlighting
              code={outputValue}
              language={outputLanguage}
              wrapLines={wrapOutput}
              showLineNumbers={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
