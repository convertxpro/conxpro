'use client';

import React, { useState } from 'react';
import {
  GOLD_UNITS,
  GoldUnitKey,
  convertGoldWeight,
  calculateGoldValuation,
  SARAFA_GLOSSARY,
  KaratType,
} from '@/lib/converters/pakistan/gold-math';
import { formatLakhCrore, formatPakistaniNumber } from '@/lib/converters/pakistan/formatters';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Coins,
  Scale,
  Sparkles,
  Copy,
  Check,
  Calculator,
  BookOpen,
  TrendingUp,
  Percent,
} from 'lucide-react';

interface TolaConverterProps {
  initialUnit?: GoldUnitKey;
}

export const TolaConverter: React.FC<TolaConverterProps> = ({ initialUnit = 'tola' }) => {
  const [inputUnit, setInputUnit] = useState<GoldUnitKey>(initialUnit);
  const [inputValue, setInputValue] = useState<string>('1');
  const [ratePerTola24K, setRatePerTola24K] = useState<string>('275000');
  const [makingChargesPerTola, setMakingChargesPerTola] = useState<string>('0');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'weight_converter' | 'price_calculator' | 'glossary'>('price_calculator');

  const weightResult = convertGoldWeight(inputValue, inputUnit);
  const tolaNum = weightResult.totalTola.toNumber();
  const rateNum = parseFloat(ratePerTola24K) || 0;
  const makingNum = parseFloat(makingChargesPerTola) || 0;

  const valuation = calculateGoldValuation(tolaNum, rateNum, makingNum);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Pre-calculated reference steps
  const tolaSteps = [0.5, 1, 1.5, 2, 2.5, 3, 5, 10, 20];

  // WhatsApp Quotation Message
  const whatsAppQuotation = `🪙 *Sarafa Bazaar Gold Valuation Slip*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚖️ *Weight:* ${inputValue} ${GOLD_UNITS.find((u) => u.id === inputUnit)?.name || inputUnit} (${weightResult.totalGrams.toFixed(4)} Grams / ${tolaNum.toFixed(4)} Tola)\n` +
    `📈 *Benchmark 24K Rate:* Rs. ${formatPakistaniNumber(rateNum)} / Tola\n` +
    (makingNum > 0 ? `🛠️ *Making Charges:* Rs. ${formatPakistaniNumber(makingNum)} / Tola\n` : '') +
    `\n💎 *Calculated Purity Valuations:*\n` +
    `• *24K (99.9% Pure):* ${formatLakhCrore(valuation.grandTotal24K).formatted} (${formatLakhCrore(valuation.grandTotal24K).inWords})\n` +
    `• *22K (91.6% Jewelry):* ${formatLakhCrore(valuation.grandTotal22K).formatted} (${formatLakhCrore(valuation.grandTotal22K).inWords})\n` +
    `• *21K (87.5% Gulf):* ${formatLakhCrore(valuation.grandTotal21K).formatted} (${formatLakhCrore(valuation.grandTotal21K).inWords})\n` +
    `• *18K (75.0% Diamond):* ${formatLakhCrore(valuation.grandTotal18K).formatted} (${formatLakhCrore(valuation.grandTotal18K).inWords})\n\n` +
    `🔍 *Breakdown:* 1 Tola = 12 Masha = 96 Ratti = 11.6638g`;

  return (
    <div className="w-full space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100/80 p-1 dark:bg-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveTab('price_calculator')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'price_calculator'
                ? 'bg-white text-amber-600 shadow-sm dark:bg-slate-900 dark:text-amber-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Calculator className="h-3.5 w-3.5" />
            <span>Gold Price & Purity Calculator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('weight_converter')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'weight_converter'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Weight Units Converter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('glossary')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'glossary'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Sarafa Glossary</span>
          </button>
        </div>

        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          🇵🇰 Sarafa Association Benchmark (1 Tola = 11.6638g)
        </span>
      </div>

      {/* Main Input Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Gold Weight Amount
          </label>
          <Input
            type="number"
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 1, 2.5, 5"
            className="text-lg font-bold"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Weight Unit
          </label>
          <select
            value={inputUnit}
            onChange={(e) => setInputUnit(e.target.value as GoldUnitKey)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm focus:border-amber-500 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {GOLD_UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.urduName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TAB 1: GOLD PRICE & PURITY CALCULATOR */}
      {activeTab === 'price_calculator' && (
        <div className="space-y-6">
          {/* Rate & Making Charges Inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 rounded-2xl border border-amber-100 bg-amber-50/40 p-4 dark:border-amber-950/60 dark:bg-amber-950/20">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center justify-between">
                <span>24K Gold Rate (PKR per Tola)</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400">Customizable</span>
              </label>
              <Input
                type="number"
                value={ratePerTola24K}
                onChange={(e) => setRatePerTola24K(e.target.value)}
                placeholder="275000"
                className="bg-white dark:bg-slate-900 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center justify-between">
                <span>Making Charges / Jarrat (PKR per Tola)</span>
                <span className="text-[10px] text-amber-700 dark:text-amber-400">Optional</span>
              </label>
              <Input
                type="number"
                value={makingChargesPerTola}
                onChange={(e) => setMakingChargesPerTola(e.target.value)}
                placeholder="0"
                className="bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Karat Purity Cards Matrix */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(['24k', '22k', '21k', '18k'] as KaratType[]).map((k) => {
              const p = valuation.purities[k];
              const grand =
                k === '24k'
                  ? valuation.grandTotal24K
                  : k === '22k'
                  ? valuation.grandTotal22K
                  : k === '21k'
                  ? valuation.grandTotal21K
                  : valuation.grandTotal18K;

              const lakhInfo = formatLakhCrore(grand);

              return (
                <div
                  key={k}
                  className={`flex flex-col justify-between rounded-3xl border p-5 transition ${
                    k === '22k'
                      ? 'border-amber-300 bg-amber-50/50 shadow-md ring-1 ring-amber-400/30 dark:border-amber-800 dark:bg-amber-950/30'
                      : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {p.label}
                      </span>
                      {k === '22k' && (
                        <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                          Jewelry Std
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                      {p.urduLabel}
                    </p>

                    <div className="mb-2">
                      <span className="text-xs text-slate-400">Total Price:</span>
                      <div className="text-xl font-black text-slate-900 dark:text-white">
                        {lakhInfo.formatted}
                      </div>
                      <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                        {lakhInfo.inWords}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 border-t border-slate-100 pt-3 dark:border-slate-800/80 text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Rate / Tola:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Rs. {formatPakistaniNumber(p.perTolaPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Rate / Gram:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Rs. {formatPakistaniNumber(p.perGramPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp Quotation Share */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                <Coins className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Send Sarafa Gold Quotation
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Share exact weights, karat purities, and PKR valuations via WhatsApp.
                </p>
              </div>
            </div>
            <WhatsAppShareButton
              shareText={whatsAppQuotation}
              buttonText="Share Gold Quotation on WhatsApp"
            />
          </div>
        </div>
      )}

      {/* TAB 2: WEIGHT UNITS CONVERTER */}
      {activeTab === 'weight_converter' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {GOLD_UNITS.map((u) => {
              const conv = weightResult.conversions[u.id];
              const isSource = u.id === inputUnit;
              const isCopied = copiedKey === u.id;

              return (
                <div
                  key={u.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition ${
                    isSource
                      ? 'border-amber-300 bg-amber-50/50 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/30'
                      : 'border-slate-200/80 bg-white/70 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        {u.name}
                      </span>
                      <span className="text-xs text-slate-400 font-urdu">{u.urduName}</span>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-black text-slate-900 dark:text-white">
                        {conv.display}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {u.symbol}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400">
                      {u.id === 'tola'
                        ? '11.6638 Grams'
                        : u.id === 'masha'
                        ? '1/12 Tola'
                        : u.id === 'ratti'
                        ? '1/96 Tola'
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
        </div>
      )}

      {/* TAB 3: SARAFA GLOSSARY */}
      {activeTab === 'glossary' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 dark:border-amber-950 dark:bg-amber-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
              Sarafa Jewelry Market Vocabulary Guide
            </h3>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-400/80">
              Understand terms used by goldsmiths and jewelers across Karachi, Lahore, Rawalpindi, and Peshawar Sarafa bazaars.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SARAFA_GLOSSARY.map((item, idx) => (
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
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Sarafa Context:</span>{' '}
                  {item.context}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Calculated Tola-to-Grams Reference Matrix (Always indexable below canvas) */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-6 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pre-Calculated Tola to Grams Reference Matrix
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exact weights in Grams, Masha, Ratti and standard bullion equivalents.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-2.5 px-3 font-bold">Tola Weight</th>
                <th className="py-2.5 px-3 font-bold">Exact Grams</th>
                <th className="py-2.5 px-3 font-bold">Masha (ماشہ)</th>
                <th className="py-2.5 px-3 font-bold">Ratti (رتی)</th>
                <th className="py-2.5 px-3 font-bold">Troy Ounces (oz t)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {tolaSteps.map((t) => (
                <tr
                  key={t}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300"
                >
                  <td className="py-2 px-3 font-extrabold text-slate-900 dark:text-white">
                    {t} Tola
                  </td>
                  <td className="py-2 px-3 font-semibold text-amber-600 dark:text-amber-400">
                    {(t * 11.6638038).toFixed(4)} g
                  </td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                    {(t * 12).toFixed(1)} Masha
                  </td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                    {(t * 96).toFixed(0)} Ratti
                  </td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400">
                    {((t * 11.6638038) / 31.1034768).toFixed(4)} oz t
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
