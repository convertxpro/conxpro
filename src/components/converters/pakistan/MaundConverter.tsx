'use client';

import React, { useState } from 'react';
import {
  MAUND_STANDARDS,
  COMMODITY_PRESETS,
  MaundStandard,
  calculateMaundWeight,
  calculateCommodityTrade,
  MANDI_GLOSSARY,
} from '@/lib/converters/pakistan/maund-math';
import { formatLakhCrore, formatPakistaniNumber } from '@/lib/converters/pakistan/formatters';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Scale,
  Wheat,
  Calculator,
  BookOpen,
  Copy,
  Check,
  Package,
  Layers,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

export const MaundConverter: React.FC = () => {
  const [standard, setStandard] = useState<MaundStandard>('mandi_40kg');
  const [maunds, setMaunds] = useState<string>('45');
  const [seers, setSeers] = useState<string>('20');
  const [ratePerMaund, setRatePerMaund] = useState<string>('3900');
  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
  const [commissionPercent, setCommissionPercent] = useState<string>('1.5');
  const [bagFeePerBag, setBagFeePerBag] = useState<string>('0');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'trade_calculator' | 'quick_matrix' | 'glossary'>('trade_calculator');

  const trade = calculateCommodityTrade(
    maunds,
    seers,
    ratePerMaund,
    parseFloat(commissionPercent) || 0,
    parseFloat(bagFeePerBag) || 0,
    standard
  );

  const weightResult = calculateMaundWeight(maunds, seers, 0, standard);

  const handleCropSelect = (cropId: string) => {
    setSelectedCrop(cropId);
    const crop = COMMODITY_PRESETS.find((c) => c.id === cropId);
    if (crop) {
      setRatePerMaund(crop.typicalRatePkr.toString());
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Pre-calculated reference steps
  const maundSteps = [1, 2, 5, 10, 15, 20, 25, 40, 50, 75, 100];

  // WhatsApp Mandi Slip Text
  const currentCropObj = COMMODITY_PRESETS.find((c) => c.id === selectedCrop);
  const cropName = currentCropObj ? `${currentCropObj.name} (${currentCropObj.urduName})` : 'Agricultural Crop';

  const grossLakh = formatLakhCrore(trade.grossAmountPkr);
  const netLakh = formatLakhCrore(trade.netAmountPkr);

  const whatsAppSlip = `🌾 *Ghalla Mandi Crop Trade Slip (غلہ منڈی بل)*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🌱 *Commodity:* ${cropName}\n` +
    `⚖️ *Total Weight:* ${maunds} Maunds ${seers ? `${seers} Seers` : ''} (${trade.totalMaunds} Maunds)\n` +
    `📦 *Metric Weight:* ${trade.totalKg.toLocaleString()} Kilograms (${trade.totalMetricTons} Metric Tons)\n` +
    `🎒 *Estimated Bags (50kg):* ${trade.totalBags50Kg} Bags (بوری)\n` +
    `💰 *Rate per Maund:* Rs. ${formatPakistaniNumber(trade.ratePerMaund)} / 40 kg\n` +
    `\n💵 *Financial Summary:*\n` +
    `• *Gross Amount:* ${grossLakh.formatted} (${grossLakh.inWords})\n` +
    (trade.commissionAmount > 0 ? `• *Mandi Commission (${commissionPercent}%):* -Rs. ${formatPakistaniNumber(trade.commissionAmount)}\n` : '') +
    (trade.bagFeeTotal > 0 ? `• *Bag/Bardana Fee:* -Rs. ${formatPakistaniNumber(trade.bagFeeTotal)}\n` : '') +
    `• *Net Payable to Grower:* ${netLakh.formatted} (${netLakh.inWords})\n` +
    `\n📌 *Standard Applied:* ${MAUND_STANDARDS[standard].name}`;

  return (
    <div className="w-full space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('trade_calculator')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'trade_calculator'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Wheat className="h-3.5 w-3.5" />
            <span>Mandi Trade & Crop Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quick_matrix')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'quick_matrix'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Maund to KG Reference</span>
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
            <span>Mandi Glossary</span>
          </button>
        </div>

        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          🇵🇰 Wholesale Mandi Standard (1 Maund = 40 kg = 40 Seers)
        </span>
      </div>

      {/* Standard Selector Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950/60 dark:bg-emerald-950/20">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
            Standard Maund Factor:
          </span>
          <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
            {MAUND_STANDARDS[standard].description}
          </p>
        </div>

        <div className="flex gap-2">
          {(Object.keys(MAUND_STANDARDS) as MaundStandard[]).map((key) => {
            const std = MAUND_STANDARDS[key];
            const isSelected = standard === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStandard(key)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200'
                }`}
              >
                {std.kgPerMaund} kg ({key === 'mandi_40kg' ? 'Mandi Std' : 'Imperial'})
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: COMMODITY TRADE CALCULATOR */}
      {activeTab === 'trade_calculator' && (
        <div className="space-y-6">
          {/* Crop Selection Preset Pills */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Commodity Preset:
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMODITY_PRESETS.map((crop) => (
                <button
                  key={crop.id}
                  type="button"
                  onClick={() => handleCropSelect(crop.id)}
                  className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                    selectedCrop === crop.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-300 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <span>{crop.name.split('(')[0]}</span>
                  <span className="ml-1 opacity-70 font-urdu">({crop.urduName})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Weight in Maunds (من)
              </label>
              <Input
                type="number"
                step="any"
                value={maunds}
                onChange={(e) => setMaunds(e.target.value)}
                placeholder="45"
                className="text-lg font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Plus Seers (سیر)</span>
                <span className="text-[10px] text-slate-400">40 Seer = 1 Maund</span>
              </label>
              <Input
                type="number"
                step="any"
                value={seers}
                onChange={(e) => setSeers(e.target.value)}
                placeholder="0"
                className="text-lg font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Rate (PKR per Maund)
              </label>
              <Input
                type="number"
                step="any"
                value={ratePerMaund}
                onChange={(e) => setRatePerMaund(e.target.value)}
                placeholder="3900"
                className="text-lg font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* Deductions (Optional) */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Mandi Arhti Commission (%)</span>
                <span className="text-[10px] text-slate-400">Usually 1.0% - 2.0%</span>
              </label>
              <Input
                type="number"
                step="0.1"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(e.target.value)}
                placeholder="1.5"
                className="bg-white dark:bg-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Bardana / Bag Fee per Bori (PKR)</span>
                <span className="text-[10px] text-slate-400">Optional</span>
              </label>
              <Input
                type="number"
                value={bagFeePerBag}
                onChange={(e) => setBagFeePerBag(e.target.value)}
                placeholder="0"
                className="bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Results Summary Dashboard */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Weight Breakdown */}
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Weight Metrics
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {trade.totalMaunds} Maunds
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Kilograms</span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">
                    {trade.totalKg.toLocaleString()} kg
                  </div>
                  <span className="text-[10px] text-slate-400">Exact metric weight</span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Metric Tons</span>
                  <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {trade.totalMetricTons} MT
                  </div>
                  <span className="text-[10px] text-slate-400">1 Ton = 25 Maunds</span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Seers (سیر)</span>
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {(trade.totalMaunds * 40).toFixed(1)} Seers
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Estimated Bags (بوری)</span>
                  <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {trade.totalBags50Kg} Bags
                  </div>
                  <span className="text-[10px] text-slate-400">50 kg standard size</span>
                </div>
              </div>
            </div>

            {/* Financial Valuation */}
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/30 p-6 shadow-xs dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-teal-950/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Trade Financial Settlement
                </h3>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  PKR Currency
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl bg-white/80 p-4 dark:bg-slate-900/80 shadow-xs">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Net Payable Amount</span>
                  <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    {netLakh.formatted}
                  </div>
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">
                    {netLakh.inWords} • <span className="font-urdu">{netLakh.inUrdu}</span>
                  </div>
                </div>

                <div className="space-y-1.5 rounded-2xl bg-white/50 p-3.5 text-xs dark:bg-slate-900/50">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Gross Value ({trade.totalMaunds} Maund × Rs. {trade.ratePerMaund}):</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      Rs. {formatPakistaniNumber(trade.grossAmountPkr)}
                    </span>
                  </div>
                  {trade.commissionAmount > 0 && (
                    <div className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>Less Arhti Commission ({commissionPercent}%):</span>
                      <span>-Rs. {formatPakistaniNumber(trade.commissionAmount)}</span>
                    </div>
                  )}
                  {trade.bagFeeTotal > 0 && (
                    <div className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>Less Bardana / Bag Fee:</span>
                      <span>-Rs. {formatPakistaniNumber(trade.bagFeeTotal)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Mandi Slip */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                <Wheat className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Share Mandi Trading Slip
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Send complete crop weights, rates, and payments directly to commission agents or farmers.
                </p>
              </div>
            </div>
            <WhatsAppShareButton
              shareText={whatsAppSlip}
              buttonText="Share Mandi Slip on WhatsApp"
            />
          </div>
        </div>
      )}

      {/* TAB 2: MAUND TO KG REFERENCE */}
      {activeTab === 'quick_matrix' && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-2.5 px-3 font-bold">Maunds (من)</th>
                  <th className="py-2.5 px-3 font-bold">Kilograms (40 kg std)</th>
                  <th className="py-2.5 px-3 font-bold">Metric Tons</th>
                  <th className="py-2.5 px-3 font-bold">Seers (سیر)</th>
                  <th className="py-2.5 px-3 font-bold">Standard 50kg Bags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {maundSteps.map((m) => (
                  <tr
                    key={m}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                  >
                    <td className="py-2.5 px-3 font-extrabold text-slate-900 dark:text-white">
                      {m} Maund {m === 25 ? '(1 Metric Ton)' : m === 50 ? '(2 Metric Tons)' : ''}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      {(m * 40).toLocaleString()} kg
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-indigo-600 dark:text-indigo-400">
                      {((m * 40) / 1000).toFixed(2)} MT
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {(m * 40).toLocaleString()} Seers
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                      {((m * 40) / 50).toFixed(1)} Bags
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MANDI GLOSSARY */}
      {activeTab === 'glossary' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              Ghalla Mandi Trade Terminology Guide
            </h3>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-400/80">
              Common terms used in wholesale grain, cotton, and agricultural markets across Punjab, Sindh, and Pakistan.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {MANDI_GLOSSARY.map((item, idx) => (
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
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Mandi Context:</span>{' '}
                  {item.context}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
