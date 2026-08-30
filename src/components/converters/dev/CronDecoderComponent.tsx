'use client';

import React, { useState, useMemo } from 'react';
import {
  analyzeCronExpression,
  CRON_PRESETS,
  CronAnalysis,
  CrontabPreset,
} from '@/lib/converters/dev/cron-tools';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Clock,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  Terminal,
  Bookmark,
  Layers,
  Globe,
  Timer,
  ChevronRight,
} from 'lucide-react';

export const CronDecoderComponent: React.FC = () => {
  const [expression, setExpression] = useState<string>('*/15 * * * *');
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  // Visual builder active tab
  const [builderTab, setBuilderTab] = useState<'minutes' | 'daily' | 'weekly' | 'monthly' | 'presets'>('presets');

  // Visual builder local states
  const [builderMinuteInterval, setBuilderMinuteInterval] = useState('15');
  const [builderDailyHour, setBuilderDailyHour] = useState('09');
  const [builderDailyMinute, setBuilderDailyMinute] = useState('00');
  const [builderWeeklyDays, setBuilderWeeklyDays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [builderWeeklyHour, setBuilderWeeklyHour] = useState('09');
  const [builderWeeklyMinute, setBuilderWeeklyMinute] = useState('00');
  const [builderMonthlyDay, setBuilderMonthlyDay] = useState('1');
  const [builderMonthlyHour, setBuilderMonthlyHour] = useState('00');
  const [builderMonthlyMinute, setBuilderMonthlyMinute] = useState('00');

  // Analyze the expression
  const analysis: CronAnalysis = useMemo(() => {
    return analyzeCronExpression(expression);
  }, [expression]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(id);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  // Visual builder generators
  const applyMinuteInterval = (mins: string) => {
    setBuilderMinuteInterval(mins);
    if (mins === '1') setExpression('* * * * *');
    else setExpression(`*/${mins} * * * *`);
  };

  const applyDailyTime = (h: string, m: string) => {
    setBuilderDailyHour(h);
    setBuilderDailyMinute(m);
    setExpression(`${parseInt(m, 10)} ${parseInt(h, 10)} * * *`);
  };

  const applyWeeklyDays = (days: number[], h: string, m: string) => {
    setBuilderWeeklyDays(days);
    const dayStr = days.length === 7 || days.length === 0 ? '*' : days.sort((a, b) => a - b).join(',');
    setExpression(`${parseInt(m, 10)} ${parseInt(h, 10)} * * ${dayStr}`);
  };

  const applyMonthlySchedule = (day: string, h: string, m: string) => {
    setBuilderMonthlyDay(day);
    setBuilderMonthlyHour(h);
    setBuilderMonthlyMinute(m);
    setExpression(`${parseInt(m, 10)} ${parseInt(h, 10)} ${day} * *`);
  };

  const toggleWeeklyDay = (day: number) => {
    let nextDays: number[];
    if (builderWeeklyDays.includes(day)) {
      nextDays = builderWeeklyDays.filter((d) => d !== day);
      if (nextDays.length === 0) nextDays = [day]; // Keep at least one
    } else {
      nextDays = [...builderWeeklyDays, day];
    }
    applyWeeklyDays(nextDays, builderWeeklyHour, builderWeeklyMinute);
  };

  const weekDayButtons = [
    { day: 1, label: 'Mon' },
    { day: 2, label: 'Tue' },
    { day: 3, label: 'Wed' },
    { day: 4, label: 'Thu' },
    { day: 5, label: 'Fri' },
    { day: 6, label: 'Sat' },
    { day: 0, label: 'Sun' },
  ];

  return (
    <div className="w-full space-y-8">
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="⚡ Real-Time Cron Translation & High-Precision Next Run Calculations"
      />

      {/* ======================================================== */}
      {/* 1. MAIN CRON EXPRESSION INPUT & HERO TRANSLATION */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/30 p-6 shadow-sm dark:border-indigo-950 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Terminal className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Cron Expression (5 or 6 Fields)
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setExpression('* * * * *')}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          </div>

          <div className="mt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full">
              <input
                type="text"
                value={expression}
                onChange={(e) => setExpression(e.target.value)}
                placeholder="e.g. */15 * * * *"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3.5 text-xl font-bold font-mono tracking-wider text-indigo-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-indigo-300"
              />
            </div>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => copyToClipboard(expression, 'expr')}
              className="w-full sm:w-auto min-w-[140px]"
              leftIcon={
                copiedStatus === 'expr' ? (
                  <Check className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Copy className="h-4 w-4" />
                )
              }
            >
              {copiedStatus === 'expr' ? 'Copied!' : 'Copy Cron'}
            </Button>
          </div>
        </div>

        {/* Human Readable Translation Display */}
        <div
          className={`rounded-2xl border p-5 transition-all ${
            analysis.isValid
              ? 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-950 dark:bg-emerald-950/30'
              : 'border-rose-200 bg-rose-50/70 dark:border-rose-950 dark:bg-rose-950/30'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                analysis.isValid
                  ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                  : 'bg-rose-500 text-white'
              }`}
            >
              {analysis.isValid ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    analysis.isValid
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-rose-700 dark:text-rose-300'
                  }`}
                >
                  {analysis.isValid ? 'Plain English Translation' : 'Syntax Error'}
                </span>
                {analysis.isValid && (
                  <button
                    onClick={() => copyToClipboard(analysis.humanDescription, 'human')}
                    className="text-xs text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 flex items-center gap-1 font-semibold"
                  >
                    {copiedStatus === 'human' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copiedStatus === 'human' ? 'Copied' : 'Copy Description'}
                  </button>
                )}
              </div>

              <p
                className={`mt-1 text-base sm:text-lg font-bold ${
                  analysis.isValid
                    ? 'text-slate-900 dark:text-white'
                    : 'text-rose-900 dark:text-rose-200'
                }`}
              >
                “{analysis.humanDescription}”
              </p>

              {!analysis.isValid && analysis.error && (
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-mono">
                  {analysis.error}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Field Breakdown Cards */}
        {analysis.fields.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {analysis.fields.map((field) => (
              <div
                key={field.name}
                className="rounded-xl border border-slate-200/80 bg-white/90 p-3 dark:border-slate-800 dark:bg-slate-950/70"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {field.name}
                  </span>
                  <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold font-mono text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                    {field.value}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                  {field.meaning}
                </p>
                <p className="mt-0.5 text-[10px] text-slate-400 font-mono">
                  Range: {field.allowedRange}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. VISUAL CRONTAB BUILDER & PRESETS */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Visual Schedule Builder & Presets
            </h3>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'presets', label: 'Preset Library' },
              { id: 'minutes', label: 'Minutes' },
              { id: 'daily', label: 'Daily' },
              { id: 'weekly', label: 'Weekly' },
              { id: 'monthly', label: 'Monthly' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBuilderTab(tab.id as any)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  builderTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Preset Library */}
        {builderTab === 'presets' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {CRON_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setExpression(preset.expression)}
                className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all hover:border-indigo-400 hover:shadow-sm ${
                  expression === preset.expression
                    ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30 ring-2 ring-indigo-500/20'
                    : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {preset.name}
                    </span>
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      {preset.category}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/80">
                  <code className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {preset.expression}
                  </code>
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center">
                    Apply <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tab 2: Minute Intervals */}
        {builderTab === 'minutes' && (
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Minute Frequency
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
              {['1', '5', '10', '15', '20', '30'].map((mins) => (
                <button
                  key={mins}
                  onClick={() => applyMinuteInterval(mins)}
                  className={`rounded-2xl border p-4 text-center transition-all ${
                    builderMinuteInterval === mins
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                  }`}
                >
                  <p className="text-lg font-bold">
                    {mins === '1' ? 'Every min' : `Every ${mins}m`}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {mins === '1' ? '* * * * *' : `*/${mins} * * * *`}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Daily Builder */}
        {builderTab === 'daily' && (
          <div className="space-y-4 max-w-lg">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Run Every Day At Specific Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500">Hour (00–23)</label>
                <select
                  value={builderDailyHour}
                  onChange={(e) => applyDailyTime(e.target.value, builderDailyMinute)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = i.toString().padStart(2, '0');
                    return (
                      <option key={h} value={h}>
                        {h}:00 ({i >= 12 ? (i === 12 ? '12 PM' : `${i - 12} PM`) : i === 0 ? '12 AM' : `${i} AM`})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500">Minute (00–59)</label>
                <select
                  value={builderDailyMinute}
                  onChange={(e) => applyDailyTime(builderDailyHour, e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {['00', '05', '10', '15', '20', '30', '45', '50'].map((m) => (
                    <option key={m} value={m}>
                      :{m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Weekly Builder */}
        {builderTab === 'weekly' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Active Days of the Week
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {weekDayButtons.map((btn) => (
                  <button
                    key={btn.day}
                    onClick={() => toggleWeeklyDay(btn.day)}
                    className={`h-10 min-w-[48px] rounded-xl px-3 text-xs font-bold transition-all ${
                      builderWeeklyDays.includes(btn.day)
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm">
              <div>
                <label className="text-[11px] text-slate-500">Execution Hour</label>
                <select
                  value={builderWeeklyHour}
                  onChange={(e) => {
                    setBuilderWeeklyHour(e.target.value);
                    applyWeeklyDays(builderWeeklyDays, e.target.value, builderWeeklyMinute);
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = i.toString().padStart(2, '0');
                    return (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500">Execution Minute</label>
                <select
                  value={builderWeeklyMinute}
                  onChange={(e) => {
                    setBuilderWeeklyMinute(e.target.value);
                    applyWeeklyDays(builderWeeklyDays, builderWeeklyHour, e.target.value);
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m}>
                      :{m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Monthly Builder */}
        {builderTab === 'monthly' && (
          <div className="space-y-4 max-w-lg">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Run Monthly On Specific Day
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-500">Day of Month</label>
                <select
                  value={builderMonthlyDay}
                  onChange={(e) => applyMonthlySchedule(e.target.value, builderMonthlyHour, builderMonthlyMinute)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {Array.from({ length: 31 }).map((_, i) => {
                    const d = (i + 1).toString();
                    return (
                      <option key={d} value={d}>
                        Day {d}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500">Hour</label>
                <select
                  value={builderMonthlyHour}
                  onChange={(e) => applyMonthlySchedule(builderMonthlyDay, e.target.value, builderMonthlyMinute)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const h = i.toString().padStart(2, '0');
                    return (
                      <option key={h} value={h}>
                        {h}:00
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-500">Minute</label>
                <select
                  value={builderMonthlyMinute}
                  onChange={(e) => applyMonthlySchedule(builderMonthlyDay, builderMonthlyHour, e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                >
                  {['00', '15', '30', '45'].map((m) => (
                    <option key={m} value={m}>
                      :{m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. UPCOMING EXECUTIONS TIMELINE TABLE (NEXT 10 RUNS) */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Upcoming 10 Scheduled Executions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated chronologically across Pakistan Standard Time (PKT, UTC+5) and Coordinated Universal Time (UTC).
              </p>
            </div>
          </div>

          {analysis.nextExecutions.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                const text = analysis.nextExecutions
                  .map((e) => `#${e.index} (${e.relative}): ${e.pkt} | ${e.utc}`)
                  .join('\n');
                copyToClipboard(text, 'next-runs');
              }}
              leftIcon={
                copiedStatus === 'next-runs' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              {copiedStatus === 'next-runs' ? 'Timeline Copied!' : 'Copy Next Runs'}
            </Button>
          )}
        </div>

        {analysis.isValid && analysis.nextExecutions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="py-2.5 px-3">Run #</th>
                  <th className="py-2.5 px-3">Countdown</th>
                  <th className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1">
                      🇵🇰 Pakistan Time (PKT)
                    </span>
                  </th>
                  <th className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1">
                      🌐 UTC Timestamp
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs dark:divide-slate-800/60">
                {analysis.nextExecutions.map((run) => (
                  <tr
                    key={run.index}
                    className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-400">
                      #{run.index}
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span
                        className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold ${
                          run.index === 1
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {run.relative}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-700 dark:text-indigo-300">
                      {run.pkt}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                      {run.utc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            Enter a valid cron expression above to view upcoming execution runtimes.
          </div>
        )}
      </div>
    </div>
  );
};
