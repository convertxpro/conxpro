'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Clock,
  Play,
  Pause,
  Copy,
  Check,
  Calendar,
  Sparkles,
  ArrowDownUp,
} from 'lucide-react';

export const UnixTimestampTool: React.FC = () => {
  // Live epoch state
  const [currentEpochMs, setCurrentEpochMs] = useState<number>(Date.now());
  const [isTicking, setIsTicking] = useState<boolean>(true);

  // Converter 1: Epoch to Human Date
  const [inputEpoch, setInputEpoch] = useState<string>(Math.floor(Date.now() / 1000).toString());
  const [epochUnit, setEpochUnit] = useState<'seconds' | 'milliseconds'>('seconds');

  // Converter 2: Human Date to Epoch
  const [dateInput, setDateInput] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  });

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Live ticking
  useEffect(() => {
    if (!isTicking) return;
    const interval = setInterval(() => {
      setCurrentEpochMs(Date.now());
    }, 100);
    return () => clearInterval(interval);
  }, [isTicking]);

  // Calculations for Epoch -> Human Date
  const humanDateOutputs = useMemo(() => {
    const rawNum = parseFloat(inputEpoch);
    if (isNaN(rawNum)) {
      return { isValid: false, utc: '—', local: '—', iso: '—', rfc: '—', relative: '—' };
    }

    const ms = epochUnit === 'seconds' ? rawNum * 1000 : rawNum;
    const dateObj = new Date(ms);

    if (isNaN(dateObj.getTime())) {
      return { isValid: false, utc: 'Invalid Date', local: 'Invalid Date', iso: 'Invalid', rfc: 'Invalid', relative: '—' };
    }

    const utc = dateObj.toUTCString();
    const local = dateObj.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short',
    });
    const iso = dateObj.toISOString();
    const rfc = dateObj.toUTCString();

    // Calculate relative time
    const diffSec = Math.floor((Date.now() - dateObj.getTime()) / 1000);
    let relative = '';
    const absDiff = Math.abs(diffSec);
    const suffix = diffSec > 0 ? 'ago' : 'from now';

    if (absDiff < 60) relative = `${absDiff} seconds ${suffix}`;
    else if (absDiff < 3600) relative = `${Math.floor(absDiff / 60)} minutes ${suffix}`;
    else if (absDiff < 86400) relative = `${Math.floor(absDiff / 3600)} hours ${suffix}`;
    else if (absDiff < 2592000) relative = `${Math.floor(absDiff / 86400)} days ${suffix}`;
    else relative = `${Math.floor(absDiff / 2592000)} months ${suffix}`;

    return {
      isValid: true,
      utc,
      local,
      iso,
      rfc,
      relative,
    };
  }, [inputEpoch, epochUnit]);

  // Calculations for Human Date -> Epoch
  const epochFromDateOutputs = useMemo(() => {
    if (!dateInput) return { sec: 0, ms: 0 };
    const dateObj = new Date(dateInput);
    if (isNaN(dateObj.getTime())) return { sec: 0, ms: 0 };
    const ms = dateObj.getTime();
    return { sec: Math.floor(ms / 1000), ms };
  }, [dateInput]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Preset offsets for Epoch Input
  const applyOffset = (secondsDelta: number) => {
    const current = parseFloat(inputEpoch) || Math.floor(Date.now() / 1000);
    const multiplier = epochUnit === 'seconds' ? 1 : 1000;
    setInputEpoch((current + secondsDelta * multiplier).toString());
  };

  const handleSetToCurrent = () => {
    const now = Date.now();
    setInputEpoch(epochUnit === 'seconds' ? Math.floor(now / 1000).toString() : now.toString());
  };

  return (
    <div className="space-y-8">
      {/* Live Master Epoch Clock Banner */}
      <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-500 to-indigo-700 p-6 text-white shadow-xl sm:p-8 dark:border-indigo-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-200">
              <Clock className="h-4 w-4" />
              <span>Current Unix Epoch Timestamp</span>
            </div>
            <div className="mt-2 font-mono text-3xl font-extrabold tracking-tight sm:text-5xl">
              {Math.floor(currentEpochMs / 1000)}
            </div>
            <p className="mt-1 font-mono text-xs text-indigo-200">
              Milliseconds: {currentEpochMs}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsTicking(!isTicking)}
              className="flex items-center gap-1.5 rounded-xl bg-white/20 px-3.5 py-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/30"
            >
              {isTicking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span>{isTicking ? 'Pause Clock' : 'Resume Clock'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleCopy(Math.floor(currentEpochMs / 1000).toString(), 'live_sec')}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-md transition hover:bg-indigo-50"
            >
              {copiedKey === 'live_sec' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              <span>Copy Timestamp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tool 1: Unix Timestamp to Human Date */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Convert Unix Timestamp to Human Date
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSetToCurrent}
              className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400"
            >
              Now
            </button>
            <select
              value={epochUnit}
              onChange={(e) => setEpochUnit(e.target.value as any)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="seconds">Seconds (10 digits)</option>
              <option value="milliseconds">Milliseconds (13 digits)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Enter Unix Timestamp
            </label>
            <Input
              type="number"
              value={inputEpoch}
              onChange={(e) => setInputEpoch(e.target.value)}
              placeholder="e.g. 1772121600"
              className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400"
            />
          </div>

          {/* Quick Offset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-semibold mr-1">Offsets:</span>
            <button
              type="button"
              onClick={() => applyOffset(3600)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              +1 Hour
            </button>
            <button
              type="button"
              onClick={() => applyOffset(86400)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              +1 Day
            </button>
            <button
              type="button"
              onClick={() => applyOffset(604800)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              +1 Week
            </button>
            <button
              type="button"
              onClick={() => applyOffset(2592000)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              +1 Month
            </button>
            <button
              type="button"
              onClick={() => applyOffset(-86400)}
              className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              -1 Day
            </button>
          </div>

          {/* Formatted Date Outputs */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">UTC Time</span>
                <button
                  type="button"
                  onClick={() => handleCopy(humanDateOutputs.utc, 'utc')}
                  className="hover:text-indigo-600"
                >
                  {copiedKey === 'utc' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="mt-1 font-mono text-xs font-bold text-slate-900 dark:text-white">
                {humanDateOutputs.utc}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">Your Local Time</span>
                <button
                  type="button"
                  onClick={() => handleCopy(humanDateOutputs.local, 'local')}
                  className="hover:text-indigo-600"
                >
                  {copiedKey === 'local' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="mt-1 font-mono text-xs font-bold text-slate-900 dark:text-white">
                {humanDateOutputs.local}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">ISO 8601 String</span>
                <button
                  type="button"
                  onClick={() => handleCopy(humanDateOutputs.iso, 'iso')}
                  className="hover:text-indigo-600"
                >
                  {copiedKey === 'iso' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
              <p className="mt-1 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 break-all">
                {humanDateOutputs.iso}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold">Relative Delta</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Calculated</span>
              </div>
              <p className="mt-1 font-mono text-xs font-bold text-slate-900 dark:text-white">
                {humanDateOutputs.relative}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tool 2: Human Date to Unix Timestamp */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
          <ArrowDownUp className="h-5 w-5 text-indigo-500" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Convert Human Date to Unix Timestamp
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Select Date & Time
            </label>
            <Input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="text-sm font-semibold"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-[11px] font-bold text-slate-500">Epoch Seconds (Unix Time)</p>
                <p className="font-mono text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                  {epochFromDateOutputs.sec}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopy(epochFromDateOutputs.sec.toString(), 'h_sec')}
                leftIcon={copiedKey === 'h_sec' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              >
                {copiedKey === 'h_sec' ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
              <div>
                <p className="text-[11px] font-bold text-slate-500">Epoch Milliseconds</p>
                <p className="font-mono text-base font-extrabold text-slate-800 dark:text-slate-200">
                  {epochFromDateOutputs.ms}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopy(epochFromDateOutputs.ms.toString(), 'h_ms')}
                leftIcon={copiedKey === 'h_ms' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              >
                {copiedKey === 'h_ms' ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
