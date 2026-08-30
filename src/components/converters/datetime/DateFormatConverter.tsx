'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Calendar,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const DateFormatConverter: React.FC = () => {
  const [inputDateString, setInputDateString] = useState<string>(() => {
    return new Date().toISOString().slice(0, 16);
  });
  const [customFormat, setCustomFormat] = useState<string>('YYYY-MM-DD HH:mm:ss');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Parse date safely
  const parsedDate = useMemo(() => {
    if (!inputDateString.trim()) return null;
    const d = new Date(inputDateString);
    if (isNaN(d.getTime())) return null;
    return d;
  }, [inputDateString]);

  // Formatted variations
  const formats = useMemo(() => {
    if (!parsedDate) return null;

    const pad = (n: number) => n.toString().padStart(2, '0');

    const year = parsedDate.getFullYear();
    const month = pad(parsedDate.getMonth() + 1);
    const day = pad(parsedDate.getDate());
    const hours24 = pad(parsedDate.getHours());
    const hours12 = pad(parsedDate.getHours() % 12 || 12);
    const minutes = pad(parsedDate.getMinutes());
    const seconds = pad(parsedDate.getSeconds());
    const ampm = parsedDate.getHours() >= 12 ? 'PM' : 'AM';

    const iso = parsedDate.toISOString();
    const rfc = parsedDate.toUTCString();
    const usFormat = `${month}/${day}/${year} ${hours12}:${minutes}:${seconds} ${ampm}`;
    const ukFormat = `${day}/${month}/${year} ${hours24}:${minutes}:${seconds}`;
    const sqlFormat = `${year}-${month}-${day} ${hours24}:${minutes}:${seconds}`;
    const longDate = parsedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const shortDate = `${year}-${month}-${day}`;
    const epochSec = Math.floor(parsedDate.getTime() / 1000).toString();
    const epochMs = parsedDate.getTime().toString();

    // Custom format engine
    let customOutput = customFormat
      .replace(/YYYY/g, year.toString())
      .replace(/MM/g, month)
      .replace(/DD/g, day)
      .replace(/HH/g, hours24)
      .replace(/hh/g, hours12)
      .replace(/mm/g, minutes)
      .replace(/ss/g, seconds)
      .replace(/A/g, ampm);

    return {
      iso,
      rfc,
      usFormat,
      ukFormat,
      sqlFormat,
      longDate,
      shortDate,
      epochSec,
      epochMs,
      customOutput,
    };
  }, [parsedDate, customFormat]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSetNow = () => {
    setInputDateString(new Date().toISOString().slice(0, 16));
  };

  const formatList = formats
    ? [
        { key: 'iso', name: 'ISO 8601 (Universal Standard)', value: formats.iso, desc: 'YYYY-MM-DDTHH:mm:ss.sssZ' },
        { key: 'sql', name: 'SQL Database DateTime', value: formats.sqlFormat, desc: 'YYYY-MM-DD HH:mm:ss' },
        { key: 'us', name: 'US Standard (MM/DD/YYYY)', value: formats.usFormat, desc: 'Month/Day/Year with 12h AM/PM' },
        { key: 'uk', name: 'International / UK (DD/MM/YYYY)', value: formats.ukFormat, desc: 'Day/Month/Year with 24h' },
        { key: 'rfc', name: 'RFC 2822 / HTTP Header', value: formats.rfc, desc: 'Standard HTTP date protocol' },
        { key: 'long', name: 'Expanded Human Date', value: formats.longDate, desc: 'Full weekday, month, day, year' },
        { key: 'short', name: 'Short Date Only', value: formats.shortDate, desc: 'YYYY-MM-DD' },
        { key: 'epochSec', name: 'Unix Epoch (Seconds)', value: formats.epochSec, desc: '10-digit timestamp' },
        { key: 'epochMs', name: 'Unix Epoch (Milliseconds)', value: formats.epochMs, desc: '13-digit JavaScript timestamp' },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Input Selector */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Select Source Date & Time
          </label>
          <button
            type="button"
            onClick={handleSetNow}
            className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400"
          >
            Current Time
          </button>
        </div>

        <div className="mt-3">
          <Input
            type="datetime-local"
            value={inputDateString}
            onChange={(e) => setInputDateString(e.target.value)}
            className="text-base font-semibold"
          />
        </div>
      </div>

      {/* Custom Template Builder */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Custom Format Pattern Builder
          </h4>
          <span className="text-[11px] text-slate-400">Tokens: YYYY, MM, DD, HH, mm, ss, A</span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">Pattern</label>
            <Input
              type="text"
              value={customFormat}
              onChange={(e) => setCustomFormat(e.target.value)}
              placeholder="e.g. DD-MM-YYYY HH:mm"
              className="font-mono text-xs font-semibold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500">Rendered Output</label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                readOnly
                value={formats?.customOutput || '—'}
                className="bg-indigo-50/50 font-mono text-xs font-bold text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => formats && handleCopy(formats.customOutput, 'custom')}
                disabled={!formats}
                leftIcon={copiedKey === 'custom' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              >
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Formats Matrix */}
      {formats && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            <Layers className="h-4 w-4 text-indigo-500" />
            <span>Standard Format Outputs ({formatList.length})</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {formatList.map((item) => {
              const isCopied = copiedKey === item.key;
              return (
                <div
                  key={item.key}
                  className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-indigo-800"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </div>

                  <div className="mt-2 min-h-[38px] rounded-xl bg-slate-50 p-2.5 font-mono text-xs font-semibold text-slate-900 break-all dark:bg-slate-950 dark:text-slate-100">
                    {item.value}
                  </div>

                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleCopy(item.value, item.key)}
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
      )}
    </div>
  );
};
