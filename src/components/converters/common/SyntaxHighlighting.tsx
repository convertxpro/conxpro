'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SyntaxHighlightingProps {
  code: string;
  language: 'json' | 'yaml' | 'toml' | 'sql' | 'html' | 'text' | 'css' | 'javascript';
  showLineNumbers?: boolean;
  wrapLines?: boolean;
  className?: string;
}

export const SyntaxHighlighting: React.FC<SyntaxHighlightingProps> = ({
  code,
  language,
  showLineNumbers = true,
  wrapLines = false,
  className,
}) => {
  if (!code) {
    return (
      <div className="flex h-48 items-center justify-center p-4 text-xs text-slate-400 dark:text-slate-600 italic">
        Output will appear here...
      </div>
    );
  }

  const lines = code.split('\n');

  // Simple, fast client-side syntax token colorizer for JSON/YAML/SQL/TOML
  const formatLineTokens = (line: string, lang: string): React.ReactNode => {
    if (lang === 'json') {
      // Colorize JSON keys, strings, numbers, booleans
      const parts = line.split(/("(?:\\.|[^"\\])*"|true|false|null|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[{}\[\],:])/g);
      return parts.map((part, idx) => {
        if (!part) return null;
        if (/^"(?:\\.|[^"\\])*"$/.test(part)) {
          // Check if followed by colon in original context or key
          const isKey = line.includes(`${part}:`);
          return (
            <span
              key={idx}
              className={isKey ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400'}
            >
              {part}
            </span>
          );
        }
        if (/^(true|false|null)$/.test(part)) {
          return <span key={idx} className="text-amber-600 dark:text-amber-400 font-bold">{part}</span>;
        }
        if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(part)) {
          return <span key={idx} className="text-cyan-600 dark:text-cyan-400 font-mono">{part}</span>;
        }
        if (/^[{}\[\],:]$/.test(part)) {
          return <span key={idx} className="text-slate-400 dark:text-slate-500">{part}</span>;
        }
        return <span key={idx}>{part}</span>;
      });
    }

    if (lang === 'yaml' || lang === 'toml') {
      // Comments
      if (line.trim().startsWith('#')) {
        return <span className="text-slate-400 italic dark:text-slate-500">{line}</span>;
      }
      // Section headers [header]
      if (/^\s*\[.+\]\s*$/.test(line)) {
        return <span className="text-purple-600 dark:text-purple-400 font-bold">{line}</span>;
      }
      // Key: value or Key = value
      const match = line.match(/^(\s*)([a-zA-Z0-9_.-]+)(\s*[:=]\s*)(.*)$/);
      if (match) {
        const [, indent, key, separator, val] = match;
        return (
          <>
            <span>{indent}</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{key}</span>
            <span className="text-slate-400 dark:text-slate-500">{separator}</span>
            <span className="text-emerald-600 dark:text-emerald-400">{val}</span>
          </>
        );
      }
    }

    if (lang === 'sql') {
      const sqlKeywords = /\b(SELECT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|FROM|WHERE|AND|OR|NOT|CREATE|TABLE|PRIMARY|KEY|DEFAULT|NULL|VARCHAR|INT|BIGINT|BOOLEAN|TIMESTAMP|ORDER|BY|GROUP|JOIN|LEFT|RIGHT|INNER|OUTER|LIMIT|OFFSET)\b/gi;
      const parts = line.split(sqlKeywords);
      return parts.map((part, idx) => {
        if (sqlKeywords.test(part)) {
          return <span key={idx} className="text-indigo-600 dark:text-indigo-400 font-bold uppercase">{part}</span>;
        }
        if (part.startsWith('--')) {
          return <span key={idx} className="text-slate-400 italic dark:text-slate-500">{part}</span>;
        }
        return <span key={idx}>{part}</span>;
      });
    }

    return <span>{line}</span>;
  };

  return (
    <pre
      className={cn(
        'm-0 overflow-x-auto p-3 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200',
        wrapLines ? 'whitespace-pre-wrap break-all' : 'whitespace-pre',
        className
      )}
    >
      <code>
        {lines.map((line, index) => (
          <div key={index} className="flex hover:bg-slate-100/50 dark:hover:bg-slate-800/30 px-1 rounded">
            {showLineNumbers && (
              <span className="mr-3 inline-block w-8 shrink-0 select-none text-right font-mono text-[11px] text-slate-400 dark:text-slate-600">
                {index + 1}
              </span>
            )}
            <span className="flex-1">{formatLineTokens(line, language)}</span>
          </div>
        ))}
      </code>
    </pre>
  );
};
