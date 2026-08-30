'use client';

import React, { useState } from 'react';
import {
  LAND_STANDARDS,
  LAND_UNITS,
  LandStandardKey,
  LandUnitKey,
  convertLandArea,
  calculatePlotDimensions,
  LAND_REVENUE_GLOSSARY,
} from '@/lib/converters/pakistan/land-math';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Building,
  Building2,
  Scale,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Layers,
  BookOpen,
  Info,
  Maximize2,
} from 'lucide-react';

interface MarlaConverterProps {
  initialUnit?: LandUnitKey;
  initialStandard?: LandStandardKey;
}

export const MarlaConverter: React.FC<MarlaConverterProps> = ({
  initialUnit = 'marla',
  initialStandard = 'urban',
}) => {
  const [standard, setStandard] = useState<LandStandardKey>(initialStandard);
  const [inputUnit, setInputUnit] = useState<LandUnitKey>(initialUnit);
  const [inputValue, setInputValue] = useState<string>('5');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Plot Dimension Visualizer State
  const [plotWidth, setPlotWidth] = useState<string>('25');
  const [plotLength, setPlotLength] = useState<string>('45');
  const [activeTab, setActiveTab] = useState<'calculator' | 'plot_visualizer' | 'glossary'>('calculator');

  // Common housing society plot dimension presets (width × length)
  const PLOT_PRESETS = [
    { label: '3 Marla (20×34 ft)', width: '20', length: '34' },
    { label: '5 Marla (25×45 ft - 225)', width: '25', length: '45' },
    { label: '5 Marla (25×54.5 ft - 272)', width: '25', length: '54.45' },
    { label: '7 Marla (30×53 ft)', width: '30', length: '53' },
    { label: '10 Marla (35×65 ft)', width: '35', length: '65' },
    { label: '1 Kanal (50×90 ft)', width: '50', length: '90' },
    { label: '2 Kanal (75×120 ft)', width: '75', length: '120' },
  ];

  const result = convertLandArea(inputValue, inputUnit, standard);
  const plotResult = calculatePlotDimensions(plotWidth, plotLength, standard);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Pre-calculated comparison rows
  const marlaSteps = [1, 2, 3, 4, 5, 7, 10, 15, 20, 40, 80, 160];

  // WhatsApp Message Generator
  const whatsAppText = `🏡 *Pakistan Property Land Measurement Summary*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📐 *Area:* ${inputValue} ${LAND_UNITS.find((u) => u.id === inputUnit)?.name || inputUnit}\n` +
    `⚖️ *Standard Applied:* ${LAND_STANDARDS[standard].name} (${LAND_STANDARDS[standard].sqFtPerMarla} sq ft / Marla)\n\n` +
    `📊 *Equivalent Measurements:*\n` +
    `• *Square Feet:* ${result.conversions.square_feet.display} sq ft\n` +
    `• *Marla:* ${result.conversions.marla.display} Marla\n` +
    `• *Kanal:* ${result.conversions.kanal.display} Kanal\n` +
    `• *Square Yards (Gazz):* ${result.conversions.square_yards.display} Sq Yd\n` +
    `• *Square Meters:* ${result.conversions.square_meters.display} m²\n` +
    `• *Acre (Qilla):* ${result.conversions.acre.display} Acre\n` +
    `• *Sarsahi:* ${result.conversions.sarsahi.display} Sarsahi`;

  const plotWhatsAppText = `📐 *Property Plot Dimension Calculation*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📏 *Plot Size:* ${plotWidth} ft (Width) × ${plotLength} ft (Length)\n` +
    `🏢 *Standard:* ${LAND_STANDARDS[standard].name} (${LAND_STANDARDS[standard].sqFtPerMarla} sq ft / Marla)\n\n` +
    `✨ *Calculated Yield:*\n` +
    `• *Total Area:* ${plotResult.totalSqFt.toLocaleString()} sq ft\n` +
    `• *Marla Equivalent:* ${plotResult.marla.toFixed(3)} Marla\n` +
    `• *Kanal Equivalent:* ${plotResult.kanal.toFixed(4)} Kanal\n` +
    `• *Square Yards (Gazz):* ${plotResult.sqYards.toFixed(2)} Sq Yd\n` +
    `• *Aspect Ratio:* ${plotResult.aspectRatio}`;

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('calculator')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'calculator'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Unit Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plot_visualizer')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'plot_visualizer'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Maximize2 className="h-3.5 w-3.5" />
            <span>Plot Dimension Visualizer</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'glossary'
                ? 'bg-white text-amber-600 shadow-sm dark:bg-slate-900 dark:text-amber-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Revenue Glossary</span>
          </button>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            🇵🇰 Pakistan Land Standard Engine
          </span>
        </div>
      </div>

      {/* Regional Standard Selector Pill Bar */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950/60 dark:bg-emerald-950/20">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <label className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              Select Regional Marla Standard:
            </label>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              {LAND_STANDARDS[standard].description}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(LAND_STANDARDS) as LandStandardKey[]).map((key) => {
              const std = LAND_STANDARDS[key];
              const isSelected = standard === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setStandard(key)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20'
                      : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{std.sqFtPerMarla} sq ft</span>
                  <span className="ml-1 opacity-75">({std.name.split('/')[0].trim()})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: BIDIRECTIONAL CALCULATOR */}
      {activeTab === 'calculator' && (
        <div className="space-y-6">
          {/* Main Input Controls */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Enter Amount</span>
                <span className="text-[11px] font-normal text-slate-400">
                  Calculates across all land units simultaneously
                </span>
              </label>
              <Input
                type="number"
                step="any"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. 5, 10, 20"
                className="text-lg font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Source Unit
              </label>
              <select
                value={inputUnit}
                onChange={(e) => setInputUnit(e.target.value as LandUnitKey)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                {LAND_UNITS.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.urduName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-Time Conversion Cards Matrix */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {LAND_UNITS.map((u) => {
              const conv = result.conversions[u.id];
              const isSource = u.id === inputUnit;
              const isCopied = copiedKey === u.id;

              return (
                <div
                  key={u.id}
                  className={`group relative flex flex-col justify-between rounded-2xl border p-4 transition ${
                    isSource
                      ? 'border-indigo-300 bg-indigo-50/50 shadow-sm dark:border-indigo-900/60 dark:bg-indigo-950/30'
                      : 'border-slate-200/80 bg-white/70 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {u.name}
                      </span>
                      <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                        {u.urduName}
                      </p>
                    </div>
                    {isSource && (
                      <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                        Active Input
                      </span>
                    )}
                  </div>

                  <div className="my-2">
                    <div className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {conv.display}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {u.symbol}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400">
                      {u.id === 'marla'
                        ? `@ ${LAND_STANDARDS[standard].sqFtPerMarla} sq ft`
                        : u.id === 'kanal'
                        ? '20 Marla'
                        : u.id === 'acre'
                        ? '8 Kanal (160 Marla)'
                        : u.symbol}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`${conv.display} ${u.name}`, u.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp Share & Formula Highlights */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Share Land Measurement Report
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send property calculation directly to WhatsApp groups or clients.
                </p>
              </div>
            </div>
            <WhatsAppShareButton
              shareText={whatsAppText}
              buttonText="Share Property on WhatsApp"
            />
          </div>
        </div>
      )}

      {/* TAB 2: PLOT DIMENSION VISUALIZER */}
      {activeTab === 'plot_visualizer' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 dark:border-indigo-950 dark:bg-indigo-950/20">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 dark:text-indigo-300 mb-1">
              <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span>Interactive Plot Dimension Visualizer</span>
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80">
              Enter the plot front width and length in feet to compute total square footage, exact Marla yield, and visualize the boundary proportions.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Popular Society Plot Presets:
            </label>
            <div className="flex flex-wrap gap-2">
              {PLOT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPlotWidth(p.width);
                    setPlotLength(p.length);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs transition hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/40"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Plot Front Width (Feet)
              </label>
              <Input
                type="number"
                step="any"
                value={plotWidth}
                onChange={(e) => setPlotWidth(e.target.value)}
                placeholder="e.g. 25"
                className="text-lg font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Plot Depth / Length (Feet)
              </label>
              <Input
                type="number"
                step="any"
                value={plotLength}
                onChange={(e) => setPlotLength(e.target.value)}
                placeholder="e.g. 45"
                className="text-lg font-bold"
              />
            </div>
          </div>

          {/* Interactive Plot Preview Box */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
            {/* Visualizer Canvas Box */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white dark:border-slate-800 shadow-inner">
              <div className="text-center mb-3">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
                  Front {plotWidth} ft (چوڑائی)
                </span>
              </div>

              {/* Dynamic SVG / Box Visualizer */}
              <div
                className="relative flex items-center justify-center rounded-xl border-2 border-dashed border-emerald-400/80 bg-emerald-500/10 p-6 transition-all duration-300"
                style={{
                  width: Math.min(240, Math.max(140, (parseFloat(plotWidth) || 25) * 6)),
                  height: Math.min(220, Math.max(120, (parseFloat(plotLength) || 45) * 3)),
                }}
              >
                <div className="text-center">
                  <div className="text-xl font-extrabold text-emerald-300">
                    {plotResult.totalSqFt.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-300">Square Feet</div>
                  <div className="mt-1 inline-block rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    {plotResult.marla.toFixed(2)} Marla
                  </div>
                </div>
              </div>

              <div className="text-center mt-3">
                <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-widest">
                  Length {plotLength} ft (لمبائی)
                </span>
              </div>
            </div>

            {/* Calculated Breakdown Cards */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Marla</span>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {plotResult.marla.toFixed(3)}
                </p>
                <span className="text-[10px] text-slate-400">
                  Based on {LAND_STANDARDS[standard].sqFtPerMarla} sq ft standard
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs text-slate-500 dark:text-slate-400">Total Kanal</span>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {plotResult.kanal.toFixed(4)}
                </p>
                <span className="text-[10px] text-slate-400">20 Marla = 1 Kanal</span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs text-slate-500 dark:text-slate-400">Square Yards (Gazz)</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {plotResult.sqYards.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-400">1 Sq Yard = 9 Sq Ft</span>
              </div>

              <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                <span className="text-xs text-slate-500 dark:text-slate-400">Square Meters (m²)</span>
                <p className="text-2xl font-black text-slate-900 dark:text-white">
                  {plotResult.sqMeters.toFixed(2)}
                </p>
                <span className="text-[10px] text-slate-400">1 m² ≈ 10.764 sq ft</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <WhatsAppShareButton
              shareText={plotWhatsAppText}
              buttonText="Share Plot Calculation on WhatsApp"
            />
          </div>
        </div>
      )}

      {/* TAB 3: REVENUE TERMS GLOSSARY */}
      {activeTab === 'glossary' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-950 dark:bg-amber-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Pakistan Land Revenue (Patwari) Terms Guide
            </h3>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
              Essential legal vocabulary for buying, selling, and verifying property in Punjab, KPK, Sindh, and Islamabad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LAND_REVENUE_GLOSSARY.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between mb-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {item.term}
                  </h4>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-urdu">
                    {item.urdu}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                  {item.meaning}
                </p>
                <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Legal Context:</span>{' '}
                  {item.context}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Calculated SEO Matrix Table (Always visible below main canvas) */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pre-Calculated Marla to Square Feet Quick Reference
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Compare land areas across Lahore Urban (225 sq ft), Patwari Legal (272.25 sq ft), and CDA (250 sq ft).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-3 font-bold">Marla Units</th>
                <th className="py-2.5 px-3 font-bold">Urban / DHA (225 sq ft)</th>
                <th className="py-2.5 px-3 font-bold">Revenue / Patwari (272.25 sq ft)</th>
                <th className="py-2.5 px-3 font-bold">CDA Islamabad (250 sq ft)</th>
                <th className="py-2.5 px-3 font-bold">Kanal Equivalent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {marlaSteps.map((m) => (
                <tr
                  key={m}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                >
                  <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-white">
                    {m} Marla {m === 20 ? '(1 Kanal)' : m === 160 ? '(1 Acre / Qilla)' : ''}
                  </td>
                  <td className="py-2 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                    {(m * 225).toLocaleString()} sq ft
                  </td>
                  <td className="py-2 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                    {(m * 272.25).toLocaleString()} sq ft
                  </td>
                  <td className="py-2 px-3 font-semibold text-amber-600 dark:text-amber-400">
                    {(m * 250).toLocaleString()} sq ft
                  </td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                    {(m / 20).toFixed(2)} Kanal
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
