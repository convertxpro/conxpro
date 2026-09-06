'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Download,
  Trash2,
  Minimize2,
  Maximize2,
  Sparkles,
  FileCode,
} from 'lucide-react';

const SAMPLES = {
  user: `{
  "id": "usr_94821",
  "name": "Sarah Connor",
  "email": "sarah@example.com",
  "roles": ["admin", "editor"],
  "profile": {
    "age": 29,
    "location": "San Francisco, CA",
    "verified": true
  }
}`,
  ecommerce: `{
  "orderId": "ORD-2026-8812",
  "status": "processing",
  "currency": "USD",
  "items": [
    { "id": "p_01", "name": "Wireless Mechanical Keyboard", "qty": 1, "price": 129.99 },
    { "id": "p_02", "name": "Ergonomic Mouse", "qty": 2, "price": 49.50 }
  ],
  "total": 228.99
}`,
  config: `{
  "appName": "ApexTools",
  "version": "1.0.0",
  "features": {
    "clientConversion": true,
    "cloudStorage": false,
    "darkMode": true
  },
  "maxFileSizeMB": 50
}`,
};

export const JsonFormatter: React.FC = () => {
  const [inputJson, setInputJson] = useState<string>(SAMPLES.user);
  const [indentSize, setIndentSize] = useState<number>(2);
  const [copied, setCopied] = useState<boolean>(false);

  // Validation & formatting state
  const validationResult = useMemo(() => {
    if (!inputJson.trim()) {
      return { isValid: true, error: null, formatted: '', line: null, col: null };
    }
    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSize === 0 ? undefined : indentSize);
      return { isValid: true, error: null, formatted, parsed };
    } catch (err: any) {
      let line: number | null = null;
      let col: number | null = null;
      const match = err.message.match(/position (\d+)/);
      if (match && match[1]) {
        const pos = parseInt(match[1], 10);
        const upToPos = inputJson.slice(0, pos);
        const lines = upToPos.split('\n');
        line = lines.length;
        col = lines[lines.length - 1].length + 1;
      }
      return {
        isValid: false,
        error: err.message,
        line,
        col,
        formatted: inputJson,
      };
    }
  }, [inputJson, indentSize]);

  // Beautify
  const handleBeautify = (spaces: number = 2) => {
    setIndentSize(spaces);
    if (validationResult.isValid && validationResult.parsed) {
      setInputJson(JSON.stringify(validationResult.parsed, null, spaces));
    }
  };

  // Minify
  const handleMinify = () => {
    if (validationResult.isValid && validationResult.parsed) {
      setInputJson(JSON.stringify(validationResult.parsed));
    }
  };

  // Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(inputJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download
  const handleDownload = () => {
    const blob = new Blob([inputJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load sample
  const handleLoadSample = (key: keyof typeof SAMPLES) => {
    setInputJson(SAMPLES[key]);
  };

  // Stats
  const charCount = inputJson.length;
  const lineCount = inputJson ? inputJson.split('\n').length : 0;
  const byteSize = new Blob([inputJson]).size;

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleBeautify(2)}
            leftIcon={<Maximize2 className="h-3.5 w-3.5" />}
          >
            Beautify (2 Spaces)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleBeautify(4)}
          >
            4 Spaces
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleMinify}
            leftIcon={<Minimize2 className="h-3.5 w-3.5" />}
          >
            Minify / Compact
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>Sample:</span>
            <button
              type="button"
              onClick={() => handleLoadSample('user')}
              className="rounded px-2 py-0.5 font-medium hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              User
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('ecommerce')}
              className="rounded px-2 py-0.5 font-medium hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Order
            </button>
            <button
              type="button"
              onClick={() => handleLoadSample('config')}
              className="rounded px-2 py-0.5 font-medium hover:bg-slate-200 dark:hover:bg-slate-800"
            >
              Config
            </button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setInputJson('')}
            leftIcon={<Trash2 className="h-3.5 w-3.5 text-rose-500" />}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Editor & Validation State */}
      <div className="relative rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-100 shadow-inner dark:border-slate-800">
        <div className="mb-2 flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-indigo-400" />
            <span>JSON Editor & Live Syntax Tree</span>
          </div>
          {validationResult.isValid ? (
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Valid JSON
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-semibold text-rose-400">
              <AlertCircle className="h-3.5 w-3.5" /> Syntax Error
              {validationResult.line && ` (Line ${validationResult.line}, Col ${validationResult.col})`}
            </span>
          )}
        </div>

        <textarea
          value={inputJson}
          onChange={(e) => setInputJson(e.target.value)}
          placeholder="Paste or type raw JSON here..."
          rows={14}
          spellCheck={false}
          className="w-full resize-y bg-transparent font-mono text-xs leading-relaxed text-slate-100 placeholder-slate-600 focus:outline-none"
        />

        {/* Error Callout if Invalid */}
        {!validationResult.isValid && validationResult.error && (
          <div className="mt-3 rounded-xl border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              Parsing Error:
            </p>
            <p className="mt-1 font-mono text-[11px] text-rose-200">{validationResult.error}</p>
          </div>
        )}
      </div>

      {/* Output Footer & Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs dark:border-slate-800/80">
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          <span><strong>{lineCount}</strong> lines</span>
          <span><strong>{charCount.toLocaleString()}</strong> chars</span>
          <span><strong>{(byteSize / 1024).toFixed(2)}</strong> KB</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownload}
            disabled={!inputJson.trim() || !validationResult.isValid}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Download .json
          </Button>
          <Button
            size="sm"
            variant="gradient"
            onClick={handleCopy}
            disabled={!inputJson.trim()}
            leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          >
            {copied ? 'Copied!' : 'Copy Formatted JSON'}
          </Button>
        </div>
      </div>
    </div>
  );
};
