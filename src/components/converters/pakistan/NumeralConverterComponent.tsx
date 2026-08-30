'use client';

import React, { useState, useId } from 'react';
import {
  convertNumerals,
  SouthAsianUnit,
  NUMERAL_LOOKUP_TABLE,
  UNIT_MULTIPLIERS,
} from '@/lib/converters/pakistan/numeral-converter';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Coins,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  FileCheck2,
  Table,
  HelpCircle,
  TrendingUp,
  Building2,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface NumeralConverterProps {
  initialValue?: string;
  initialUnit?: SouthAsianUnit;
}

export const NumeralConverterComponent: React.FC<NumeralConverterProps> = ({
  initialValue = '55000000',
  initialUnit = 'raw',
}) => {
  const [inputValue, setInputValue] = useState<string>(initialValue);
  const [inputUnit, setInputUnit] = useState<SouthAsianUnit>(initialUnit);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'matrix' | 'cheque_writer' | 'lookup_table'>('matrix');

  // Cheque customization fields
  const [payeeName, setPayeeName] = useState<string>('Self / Bearer');
  const [chequeDate, setChequeDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const rawInputId = useId();
  const payeeInputId = useId();
  const chequeDateId = useId();

  const result = convertNumerals(inputValue, inputUnit);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePreset = (val: string, unit: SouthAsianUnit = 'raw') => {
    setInputValue(val);
    setInputUnit(unit);
  };

  const handleReset = () => {
    setInputValue('1000000');
    setInputUnit('raw');
    setPayeeName('Self / Bearer');
  };

  // Preset buttons
  const PRESETS = [
    { label: '1 Lakh (100K)', val: '100000', unit: 'raw' as SouthAsianUnit },
    { label: '10 Lakhs (1M)', val: '1000000', unit: 'raw' as SouthAsianUnit },
    { label: '50 Lakhs (5M)', val: '5000000', unit: 'raw' as SouthAsianUnit },
    { label: '1 Crore (10M)', val: '10000000', unit: 'raw' as SouthAsianUnit },
    { label: '5 Crores (50M)', val: '50000000', unit: 'raw' as SouthAsianUnit },
    { label: '10 Crores (100M)', val: '100000000', unit: 'raw' as SouthAsianUnit },
    { label: '1 Arab (1B)', val: '1000000000', unit: 'raw' as SouthAsianUnit },
    { label: '1 Kharab (100B)', val: '100000000000', unit: 'raw' as SouthAsianUnit },
  ];

  // WhatsApp share payload
  const whatsAppSummary =
    `💰 *South Asian Numeral & Cheque Summary*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💵 *Numerical Amount:* Rs. ${result.formattedSouthAsian} (PKR)\n` +
    `🌍 *Western Standard:* ${result.formattedWestern}\n\n` +
    `📊 *Denomination Breakdown:*\n` +
    `• *Lakhs:* ${result.inLakhs.toLocaleString()} Lakh\n` +
    `• *Crores:* ${result.inCrores.toLocaleString()} Crore\n` +
    `• *Arabs:* ${result.inArabs.toLocaleString()} Arab\n` +
    `• *Millions:* ${result.inMillions.toLocaleString()} Million\n` +
    `• *Billions:* ${result.inBillions.toLocaleString()} Billion\n\n` +
    `📝 *Cheque Text (English):*\n"${result.chequeTextRupees}"\n\n` +
    `🇵🇰 *اردو الفاظ (Urdu Words):*\n${result.chequeTextUrdu}\n\n` +
    `⚡ Converted via ConvertHub.pk`;

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              Lakhs & Crores ↔ Millions & Billions
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bilingual South Asian & Western Numeral Transliterator & Cheque Writer
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'matrix'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            Conversion Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cheque_writer')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'cheque_writer'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            Cheque Writer
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lookup_table')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'lookup_table'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Table className="h-3.5 w-3.5" />
            Lookup Slabs
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-slate-50/50 p-4 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          {/* Input Amount */}
          <div className="sm:col-span-8">
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor={rawInputId}
                className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Enter Numerical Value or Amount (PKR / INR)
              </label>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            </div>
            <div className="relative">
              <Input
                id={rawInputId}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. 55000000 or 5.5"
                className="h-12 text-lg font-bold text-slate-900 dark:text-white"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                {result.rawNumber > 0 ? `Rs. ${result.formattedSouthAsian}` : ''}
              </div>
            </div>
          </div>

          {/* Unit Selector */}
          <div className="sm:col-span-4">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Input Unit Denomination
            </label>
            <select
              value={inputUnit}
              onChange={(e) => setInputUnit(e.target.value as SouthAsianUnit)}
              aria-label="Input Unit Denomination"
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="raw">Exact Number / Rupee (1)</option>
              <option value="thousand">Thousand (1,000)</option>
              <option value="lakh">Lakh (1,00,000)</option>
              <option value="crore">Crore (1,00,00,000)</option>
              <option value="arab">Arab (1,00,00,00,000)</option>
              <option value="kharab">Kharab (1,00,00,00,00,000)</option>
              <option value="million">Million (1,000,000)</option>
              <option value="billion">Billion (1,000,000,000)</option>
              <option value="trillion">Trillion (1,000,000,000,000)</option>
            </select>
          </div>
        </div>

        {/* Quick Presets Carousel */}
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Presets:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => handlePreset(p.val, p.unit)}
              className="rounded-lg border border-slate-200/80 bg-slate-100/70 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Urdu Nastaliq Banner Card */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/[0.07] via-teal-500/[0.04] to-transparent p-5 dark:border-emerald-500/30 dark:from-emerald-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                🇵🇰 اردو تلفظ و تحریر
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Noto Nastaliq Urdu Script
              </span>
            </div>
            <div
              dir="rtl"
              className="font-urdu pt-1 text-2xl font-bold leading-relaxed text-slate-900 dark:text-emerald-300 sm:text-3xl"
            >
              {result.wordsUrduScript}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleCopy(result.wordsUrduScript, 'urdu_script')}
              className="h-9 gap-1.5 border-emerald-500/30 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
            >
              {copiedKey === 'urdu_script' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  کاپی ہو گیا
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  اردو کاپی کریں
                </>
              )}
            </Button>
            <WhatsAppShareButton
              shareText={whatsAppSummary}
              title="Share Conversion"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: CONVERSION MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-5">
          {/* Main 2-Column Denomination Comparison */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* South Asian Numbering System */}
            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    South Asian Numbering (پاکستانی نظام)
                  </h3>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {result.formattedSouthAsian}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Lakhs (لاکھ)</div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {result.inLakhs.toLocaleString()} <span className="text-xs font-semibold text-emerald-600">Lakh</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">1 Lakh = 100,000</div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Crores (کروڑ)</div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {result.inCrores.toLocaleString()} <span className="text-xs font-semibold text-emerald-600">Crore</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">1 Crore = 100 Lakhs</div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Arabs (ارب)</div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {result.inArabs.toLocaleString()} <span className="text-xs font-semibold text-emerald-600">Arab</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">1 Arab = 100 Crores</div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Kharabs (کھرب)</div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {result.inKharabs.toLocaleString()} <span className="text-xs font-semibold text-emerald-600">Kharab</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">1 Kharab = 100 Arabs</div>
                </div>
              </div>

              {/* South Asian Words Callout */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 p-3 dark:border-emerald-500/30 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                    South Asian Words (English)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(result.wordsEnglishSouthAsian, 'words_sa')}
                    className="text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-400"
                  >
                    {copiedKey === 'words_sa' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                  {result.wordsEnglishSouthAsian}
                </div>
              </div>
            </div>

            {/* Western International System */}
            <div className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Western International System (بین الاقوامی نظام)
                  </h3>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {result.formattedWestern}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Thousands (K)</div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {result.inThousands.toLocaleString()} <span className="text-xs font-semibold text-indigo-600">Thousand</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">1K = 1,000</div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Millions (M)</div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {result.inMillions.toLocaleString()} <span className="text-xs font-semibold text-indigo-600">Million</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">1 Million = 10 Lakhs</div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Billions (B)</div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {result.inBillions.toLocaleString()} <span className="text-xs font-semibold text-indigo-600">Billion</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">1 Billion = 1 Arab (100 Cr)</div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-slate-800/80 dark:bg-slate-950/50">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Trillions (T)</div>
                  <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {result.inTrillions.toLocaleString()} <span className="text-xs font-semibold text-indigo-600">Trillion</span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">1 Trillion = 10 Kharabs</div>
                </div>
              </div>

              {/* Western Words Callout */}
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-50/50 p-3 dark:border-indigo-500/30 dark:bg-indigo-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
                    Western Words (Standard)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(result.wordsEnglishWestern, 'words_west')}
                    className="text-[11px] font-semibold text-indigo-700 hover:underline dark:text-indigo-400"
                  >
                    {copiedKey === 'words_west' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="mt-1 text-xs font-bold text-slate-900 dark:text-white">
                  {result.wordsEnglishWestern}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BANKING CHEQUE WRITER */}
      {activeTab === 'cheque_writer' && (
        <div className="space-y-5">
          {/* Customization bar */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor={payeeInputId}
                className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Payee Name / Party
              </label>
              <Input
                id={payeeInputId}
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="e.g. ABC Pvt Ltd / Cash"
                className="h-10 text-sm font-semibold"
              />
            </div>
            <div>
              <label
                htmlFor={chequeDateId}
                className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
              >
                Cheque Date
              </label>
              <Input
                id={chequeDateId}
                type="date"
                value={chequeDate}
                onChange={(e) => setChequeDate(e.target.value)}
                className="h-10 text-sm font-semibold"
              />
            </div>
          </div>

          {/* Interactive Cheque Card Mockup */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-600/30 bg-[#fdfbf7] p-6 shadow-md dark:border-emerald-500/40 dark:bg-slate-950">
            {/* Watermark / Pattern */}
            <div className="absolute right-4 top-4 text-xs font-black uppercase tracking-widest text-slate-300 dark:text-slate-800">
              STATE BANK OF PAKISTAN STANDARD
            </div>

            <div className="space-y-4">
              {/* Top Row: Payee & Date */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-slate-300 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pay To:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white underline decoration-dotted">
                    {payeeName || 'Self / Bearer'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Date:</span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                    {chequeDate}
                  </span>
                </div>
              </div>

              {/* Middle Row: Rupees in Words (English South Asian) */}
              <div className="rounded-xl bg-emerald-50/70 p-4 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    Rupees in Words (South Asian Legal Format)
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(result.chequeTextRupees, 'cheque_en')}
                    className="h-7 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:text-emerald-300 dark:hover:bg-emerald-900/50"
                  >
                    {copiedKey === 'cheque_en' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy Words
                  </Button>
                </div>
                <div className="mt-1.5 text-base font-black tracking-wide text-slate-900 dark:text-white">
                  *** {result.chequeTextRupees} ***
                </div>
              </div>

              {/* Middle Row: Rupees in Words (Urdu Script) */}
              <div className="rounded-xl bg-teal-50/70 p-4 dark:bg-teal-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-400">
                    روپے الفاظ میں (اردو رسم الخط)
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopy(result.chequeTextUrdu, 'cheque_ur')}
                    className="h-7 text-xs font-bold text-teal-700 hover:bg-teal-100 dark:text-teal-300 dark:hover:bg-teal-900/50"
                  >
                    {copiedKey === 'cheque_ur' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    کاپی کریں
                  </Button>
                </div>
                <div dir="rtl" className="font-urdu mt-1.5 text-xl font-black text-slate-900 dark:text-teal-300">
                  *** {result.chequeTextUrdu} ***
                </div>
              </div>

              {/* Bottom Row: Amount in Figures Box */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">PKR:</span>
                <div className="flex items-center gap-2 rounded-xl border-2 border-emerald-600/40 bg-white px-4 py-2 shadow-inner dark:bg-slate-900">
                  <span className="text-xs font-bold text-emerald-600">Rs. =</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {result.formattedSouthAsian}/-
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`Rs. =${result.formattedSouthAsian}/-`, 'cheque_fig')}
                    className="ml-2 text-slate-400 hover:text-emerald-600"
                    title="Copy Figure"
                  >
                    {copiedKey === 'cheque_fig' ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LOOKUP TABLE */}
      {activeTab === 'lookup_table' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                South Asian ↔ Western Denomination Scale Reference
              </h3>
              <span className="text-xs text-slate-500">Official Standards Matrix</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    <th className="py-2.5 px-3">South Asian Term</th>
                    <th className="py-2.5 px-3 text-right">اردو نام</th>
                    <th className="py-2.5 px-3">Numerical Value</th>
                    <th className="py-2.5 px-3">Western Equivalent</th>
                    <th className="py-2.5 px-3 text-center">Zeros</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {NUMERAL_LOOKUP_TABLE.map((row) => (
                    <tr
                      key={row.southAsianName}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        {row.southAsianName}
                      </td>
                      <td className="py-2.5 px-3 text-right font-urdu text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {row.urduName}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {row.southAsianFormatted}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                        {row.westernEquivalent}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {row.zeros}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
