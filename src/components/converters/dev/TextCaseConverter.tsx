'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Type,
  Copy,
  Check,
  FileText,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

const SAMPLE_TEXT = 'ApexTools makes fast, free, client-side developer converters.';

export const TextCaseConverter: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SAMPLE_TEXT);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Helper words splitter
  const words = useMemo(() => {
    return inputText
      .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
      .replace(/[_\-.]+/g, ' ') // split snake/kebab/dot
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }, [inputText]);

  // Case transforms
  const transformations = useMemo(() => {
    if (!inputText) {
      return {
        uppercase: '',
        lowercase: '',
        titleCase: '',
        sentenceCase: '',
        camelCase: '',
        snakeCase: '',
        kebabCase: '',
        pascalCase: '',
        constantCase: '',
        dotCase: '',
        alternatingCase: '',
      };
    }

    const lowerWords = words.map((w) => w.toLowerCase());

    const uppercase = inputText.toUpperCase();
    const lowercase = inputText.toLowerCase();

    // Title Case (capitalize first letter of each word)
    const titleCase = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    // Sentence case (capitalize first letter after period/start)
    const sentenceCase = inputText.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());

    // camelCase
    const camelCase = lowerWords
      .map((w, idx) => (idx === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
      .join('');

    // PascalCase
    const pascalCase = lowerWords.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

    // snake_case
    const snakeCase = lowerWords.join('_');

    // kebab-case
    const kebabCase = lowerWords.join('-');

    // CONSTANT_CASE
    const constantCase = lowerWords.map((w) => w.toUpperCase()).join('_');

    // dot.case
    const dotCase = lowerWords.join('.');

    // aLtErNaTiNg cAsE
    const alternatingCase = inputText
      .split('')
      .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
      .join('');

    return {
      uppercase,
      lowercase,
      titleCase,
      sentenceCase,
      camelCase,
      snakeCase,
      kebabCase,
      pascalCase,
      constantCase,
      dotCase,
      alternatingCase,
    };
  }, [inputText, words]);

  // Text statistics
  const stats = useMemo(() => {
    const chars = inputText.length;
    const charsNoSpace = inputText.replace(/\s+/g, '').length;
    const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
    const lines = inputText ? inputText.split('\n').length : 0;
    const sentences = inputText ? (inputText.match(/[.!?]+(\s+|$)/g) || []).length || (wordCount > 0 ? 1 : 0) : 0;
    const readTimeMinutes = (wordCount / 200).toFixed(1);

    return {
      chars,
      charsNoSpace,
      wordCount,
      lines,
      sentences,
      readTimeMinutes,
    };
  }, [inputText]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const caseCards = [
    { key: 'titleCase', name: 'Title Case', val: transformations.titleCase, desc: 'Capitalize Every Word' },
    { key: 'sentenceCase', name: 'Sentence case', val: transformations.sentenceCase, desc: 'Capitalize first letter' },
    { key: 'camelCase', name: 'camelCase', val: transformations.camelCase, desc: 'JavaScript identifier' },
    { key: 'pascalCase', name: 'PascalCase', val: transformations.pascalCase, desc: 'Class & Type names' },
    { key: 'snakeCase', name: 'snake_case', val: transformations.snakeCase, desc: 'Python & DB columns' },
    { key: 'kebabCase', name: 'kebab-case', val: transformations.kebabCase, desc: 'URLs & CSS classes' },
    { key: 'constantCase', name: 'CONSTANT_CASE', val: transformations.constantCase, desc: 'Constants & Enums' },
    { key: 'uppercase', name: 'UPPERCASE', val: transformations.uppercase, desc: 'ALL CAPS' },
    { key: 'lowercase', name: 'lowercase', val: transformations.lowercase, desc: 'all small letters' },
    { key: 'dotCase', name: 'dot.case', val: transformations.dotCase, desc: 'Dot separated' },
    { key: 'alternatingCase', name: 'aLtErNaTiNg cAsE', val: transformations.alternatingCase, desc: 'Mocking meme case' },
  ];

  return (
    <div className="space-y-6">
      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Enter Source Text
          </label>
          <button
            type="button"
            onClick={() => setInputText('')}
            className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Clear Text
          </button>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste your text to convert into all cases..."
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.wordCount}</p>
          <p className="text-[11px] text-slate-500">Words</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.chars}</p>
          <p className="text-[11px] text-slate-500">Characters</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.charsNoSpace}</p>
          <p className="text-[11px] text-slate-500">Without Spaces</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-lg font-extrabold text-slate-900 dark:text-white">{stats.sentences}</p>
          <p className="text-[11px] text-slate-500">Sentences</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-3 text-center dark:border-slate-800 dark:bg-slate-900/40 col-span-2 sm:col-span-1">
          <p className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">~{stats.readTimeMinutes}m</p>
          <p className="text-[11px] text-slate-500">Reading Time</p>
        </div>
      </div>

      {/* Transformed Case Cards */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <Layers className="h-4 w-4 text-indigo-500" />
          <span>Converted Case Results ({caseCards.length})</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {caseCards.map((card) => {
            const isCopied = copiedKey === card.key;
            return (
              <div
                key={card.key}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {card.name}
                  </span>
                  <span className="text-[10px] text-slate-400">{card.desc}</span>
                </div>

                <div className="mt-2 min-h-[40px] rounded-xl bg-slate-50 p-2.5 font-mono text-xs text-slate-900 break-all dark:bg-slate-950 dark:text-slate-100">
                  {card.val || <span className="text-slate-400 italic">No text</span>}
                </div>

                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCopy(card.val, card.key)}
                    disabled={!card.val}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40"
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
