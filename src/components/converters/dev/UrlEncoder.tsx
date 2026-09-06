'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Link as LinkIcon,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  ArrowLeftRight,
  Sliders,
} from 'lucide-react';

interface QueryParam {
  key: string;
  value: string;
}

const SAMPLE_URL =
  'https://apextools.app/convert/developer/json-formatter?utm_source=google&utm_medium=cpc&query=quick%20convert%202026#section';

export const UrlEncoder: React.FC = () => {
  const [inputText, setInputText] = useState<string>(SAMPLE_URL);
  const [mode, setMode] = useState<'component' | 'fullUrl'>('component');
  const [action, setAction] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState<boolean>(false);

  // Result calculation
  const outputResult = useMemo(() => {
    if (!inputText) return { success: true, result: '', error: null };
    try {
      if (action === 'encode') {
        const encoded =
          mode === 'component'
            ? encodeURIComponent(inputText)
            : encodeURI(inputText);
        return { success: true, result: encoded, error: null };
      } else {
        const decoded =
          mode === 'component'
            ? decodeURIComponent(inputText)
            : decodeURI(inputText);
        return { success: true, result: decoded, error: null };
      }
    } catch (err: any) {
      return {
        success: false,
        result: '',
        error: 'Malformed URI sequence detected.',
      };
    }
  }, [inputText, mode, action]);

  // Query parameter table parser
  const parsedQueryParams = useMemo(() => {
    try {
      const qIndex = inputText.indexOf('?');
      if (qIndex === -1) return [];
      const hashIndex = inputText.indexOf('#');
      const queryString =
        hashIndex !== -1
          ? inputText.slice(qIndex + 1, hashIndex)
          : inputText.slice(qIndex + 1);

      const params = new URLSearchParams(queryString);
      const list: QueryParam[] = [];
      params.forEach((val, key) => {
        list.push({ key, value: val });
      });
      return list;
    } catch {
      return [];
    }
  }, [inputText]);

  // Update query params in input text
  const handleUpdateParam = (index: number, newKey: string, newVal: string) => {
    try {
      const qIndex = inputText.indexOf('?');
      const base = qIndex !== -1 ? inputText.slice(0, qIndex) : inputText;
      const hashIndex = inputText.indexOf('#');
      const hash = hashIndex !== -1 ? inputText.slice(hashIndex) : '';

      const updated = [...parsedQueryParams];
      updated[index] = { key: newKey, value: newVal };

      const sp = new URLSearchParams();
      updated.forEach((p) => {
        if (p.key.trim()) sp.append(p.key.trim(), p.value);
      });

      const newQuery = sp.toString();
      setInputText(newQuery ? `${base}?${newQuery}${hash}` : `${base}${hash}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteParam = (index: number) => {
    const updated = parsedQueryParams.filter((_, i) => i !== index);
    const qIndex = inputText.indexOf('?');
    const base = qIndex !== -1 ? inputText.slice(0, qIndex) : inputText;
    const hashIndex = inputText.indexOf('#');
    const hash = hashIndex !== -1 ? inputText.slice(hashIndex) : '';

    const sp = new URLSearchParams();
    updated.forEach((p) => {
      if (p.key.trim()) sp.append(p.key.trim(), p.value);
    });

    const newQuery = sp.toString();
    setInputText(newQuery ? `${base}?${newQuery}${hash}` : `${base}${hash}`);
  };

  const handleAddParam = () => {
    const qIndex = inputText.indexOf('?');
    const hasQuery = qIndex !== -1;
    const hashIndex = inputText.indexOf('#');
    const hash = hashIndex !== -1 ? inputText.slice(hashIndex) : '';
    const base = hasQuery ? inputText.slice(0, hashIndex !== -1 ? hashIndex : undefined) : inputText;

    const newUrl = hasQuery
      ? `${base}&new_param=value${hash}`
      : `${base}?new_param=value${hash}`;
    setInputText(newUrl);
  };

  const handleCopy = () => {
    if (!outputResult.result) return;
    navigator.clipboard.writeText(outputResult.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setAction('encode')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                action === 'encode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => setAction('decode')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                action === 'decode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Decode
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="urlMode"
                checked={mode === 'component'}
                onChange={() => setMode('component')}
                className="text-indigo-600"
              />
              <span>Component (`encodeURIComponent`)</span>
            </label>
            <label className="flex items-center gap-1.5 ml-3 cursor-pointer">
              <input
                type="radio"
                name="urlMode"
                checked={mode === 'fullUrl'}
                onChange={() => setMode('fullUrl')}
                className="text-indigo-600"
              />
              <span>Full URL (`encodeURI`)</span>
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setInputText('')}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          Clear
        </button>
      </div>

      {/* Inputs & Outputs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {action === 'encode' ? 'Raw URL / Query String Input' : 'Encoded URI String'}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste URL here..."
            rows={6}
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            {action === 'encode' ? 'Encoded Output (Percent-Encoded)' : 'Decoded URL Output'}
          </label>
          <textarea
            readOnly
            value={
              outputResult.success
                ? outputResult.result
                : `Error: ${outputResult.error}`
            }
            rows={6}
            className={`w-full rounded-2xl border p-4 font-mono text-xs shadow-xs focus:outline-none ${
              outputResult.success
                ? 'border-indigo-200 bg-indigo-50/40 text-indigo-900 dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-200'
                : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
            }`}
          />
        </div>
      </div>

      {/* Query String Parameter Inspector */}
      {parsedQueryParams.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Interactive Query Parameter Table ({parsedQueryParams.length})
              </h4>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleAddParam}
              leftIcon={<Plus className="h-3 w-3" />}
            >
              Add Parameter
            </Button>
          </div>

          <div className="mt-3 space-y-2">
            {parsedQueryParams.map((param, idx) => (
              <div key={`param-${idx}`} className="flex items-center gap-2">
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => handleUpdateParam(idx, e.target.value, param.value)}
                  placeholder="Key"
                  className="w-1/3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <span className="text-slate-400 font-bold">=</span>
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => handleUpdateParam(idx, param.key, e.target.value)}
                  placeholder="Value"
                  className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteParam(idx)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <span className="text-xs text-slate-400">
          RFC 3986 compliant • Encodes spaces, ampersands, slashes, unicode
        </span>

        <Button
          size="sm"
          variant="gradient"
          onClick={handleCopy}
          disabled={!outputResult.success || !outputResult.result}
          leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        >
          {copied ? 'Copied!' : 'Copy Result'}
        </Button>
      </div>
    </div>
  );
};
