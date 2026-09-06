'use client';

import React, { useState } from 'react';
import {
  calculateZakat,
  ZakatAssetsInput,
  GOLD_PURITY_MAP,
  DEFAULT_GOLD_RATE_PKR,
  DEFAULT_SILVER_RATE_PKR,
} from '@/lib/converters/pakistan/zakat-engine';
import { formatLakhCrore, formatPakistaniNumber } from '@/lib/converters/pakistan/formatters';
import { PakistaniMetricCard } from '@/components/converters/common';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  HeartHandshake,
  Coins,
  Scale,
  Sparkles,
  Printer,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Building,
  Wallet,
  Landmark,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const ZakatCalculatorComponent: React.FC = () => {
  // Nisab and live rate states
  const [nisabStandard, setNisabStandard] = useState<'silver' | 'gold'>('silver');
  const [goldRatePkr, setGoldRatePkr] = useState<string>(DEFAULT_GOLD_RATE_PKR.toString());
  const [silverRatePkr, setSilverRatePkr] = useState<string>(DEFAULT_SILVER_RATE_PKR.toString());
  const [showRateSettings, setShowRateSettings] = useState<boolean>(false);

  // Asset inputs
  const [cashInHand, setCashInHand] = useState<string>('250000');
  const [goldUnit, setGoldUnit] = useState<'tola' | 'grams'>('tola');
  const [goldWeight, setGoldWeight] = useState<string>('3');
  const [goldPurity, setGoldPurity] = useState<24 | 22 | 21 | 18>(22);
  const [silverUnit, setSilverUnit] = useState<'tola' | 'grams'>('tola');
  const [silverWeight, setSilverWeight] = useState<string>('0');
  const [businessStock, setBusinessStock] = useState<string>('0');
  const [sharesReceivables, setSharesReceivables] = useState<string>('0');
  const [debtsLiabilities, setDebtsLiabilities] = useState<string>('50000');

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Convert weight to Tolas if user inputs in Grams (1 Tola = 11.6638 Grams)
  const parsedGoldRate = parseFloat(goldRatePkr) || DEFAULT_GOLD_RATE_PKR;
  const parsedSilverRate = parseFloat(silverRatePkr) || DEFAULT_SILVER_RATE_PKR;

  const rawGoldWeight = parseFloat(goldWeight) || 0;
  const goldTolas = goldUnit === 'grams' ? rawGoldWeight / 11.6638 : rawGoldWeight;

  const rawSilverWeight = parseFloat(silverWeight) || 0;
  const silverTolas = silverUnit === 'grams' ? rawSilverWeight / 11.6638 : rawSilverWeight;

  const zakatInput: ZakatAssetsInput = {
    cashInHandAndBank: parseFloat(cashInHand.replace(/,/g, '')) || 0,
    goldWeightTolas: Number(goldTolas.toFixed(4)),
    goldPurityKarat: goldPurity,
    goldRatePerTolaPkr: parsedGoldRate,
    silverWeightTolas: Number(silverTolas.toFixed(4)),
    silverRatePerTolaPkr: parsedSilverRate,
    businessInventoryValue: parseFloat(businessStock.replace(/,/g, '')) || 0,
    sharesMutualFundsReceivables: parseFloat(sharesReceivables.replace(/,/g, '')) || 0,
    immediateDebtsAndLiabilities: parseFloat(debtsLiabilities.replace(/,/g, '')) || 0,
    nisabStandard,
  };

  const result = calculateZakat(zakatInput);
  const zakatFormatted = formatLakhCrore(result.totalZakatDuePkr);
  const netWealthFormatted = formatLakhCrore(result.netZakatableWealthPkr);

  // Preset Handlers
  const handleLoadPreset = (preset: 'salaried_gold' | 'business_merchant' | 'average_family' | 'reset') => {
    if (preset === 'salaried_gold') {
      setCashInHand('350000');
      setGoldUnit('tola');
      setGoldWeight('5');
      setGoldPurity(22);
      setSilverWeight('0');
      setBusinessStock('0');
      setSharesReceivables('100000');
      setDebtsLiabilities('40000');
    } else if (preset === 'business_merchant') {
      setCashInHand('1000000');
      setGoldWeight('0');
      setSilverWeight('0');
      setBusinessStock('3500000');
      setSharesReceivables('500000');
      setDebtsLiabilities('800000');
    } else if (preset === 'average_family') {
      setCashInHand('150000');
      setGoldUnit('tola');
      setGoldWeight('2.5');
      setGoldPurity(22);
      setSilverWeight('0');
      setBusinessStock('0');
      setSharesReceivables('0');
      setDebtsLiabilities('20000');
    } else {
      setCashInHand('0');
      setGoldWeight('0');
      setSilverWeight('0');
      setBusinessStock('0');
      setSharesReceivables('0');
      setDebtsLiabilities('0');
    }
  };

  // WhatsApp Slip
  const shareSlip = `🌙 *Islamic Zakat Calculation Slip (2.5% Obligation)*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `⚖️ *Nisab Standard:* ${nisabStandard === 'silver' ? 'Silver (52.5 Tola $\\approx$ Rs. ' + formatPakistaniNumber(result.silverNisabThresholdPkr) + ')' : 'Gold (7.5 Tola $\\approx$ Rs. ' + formatPakistaniNumber(result.goldNisabThresholdPkr) + ')'}\n` +
    `📊 *Total Zakatable Assets:* Rs. ${formatPakistaniNumber(result.totalAssetsPkr)}\n` +
    `🧾 *Total Debts & Liabilities:* Rs. ${formatPakistaniNumber(result.totalLiabilitiesPkr)}\n` +
    `💎 *Net Zakatable Wealth:* Rs. ${formatPakistaniNumber(result.netZakatableWealthPkr)} (${netWealthFormatted.inWords})\n` +
    `\n🟢 *Status:* ${result.isEligibleToPayZakat ? 'Zakat is Farz (Obligatory) 🟢' : 'Wealth is below Nisab threshold ⚪'}\n` +
    `✨ *Total Zakat Due (2.5%):* Rs. ${formatPakistaniNumber(result.totalZakatDuePkr)} (${zakatFormatted.inWords} / ${zakatFormatted.inUrdu})\n\n` +
    `\n🔗 *Calculated via ApexTools Pakistan Islamic Finance*`;

  const handlePrint = () => {
    window.print();
  };

  const faqs = [
    {
      q: 'What is the Nisab threshold for Zakat in Pakistan (2024–2026)?',
      qUrdu: 'پاکستان میں زکوٰۃ کا نصاب کتنا ہے؟',
      a: 'The Nisab threshold is 7.5 Tolas (87.48 grams) for Gold or 52.5 Tolas (612.36 grams) for Silver. If your net zakatable wealth (cash, gold, silver, business inventory, minus short-term debts) meets or exceeds the silver Nisab threshold for one lunar year (Hawl), 2.5% Zakat is obligatory.',
    },
    {
      q: 'Why is Silver Nisab recommended over Gold Nisab by majority scholars?',
      qUrdu: 'چاندی کے نصاب کو سونے کے نصاب پر ترجیح کیوں دی جاتی ہے؟',
      a: 'In the Hanafi school and classical jurisprudence, when assets consist of mixed wealth (cash + gold + silver + merchandise), the lower Nisab threshold (Silver ~52.5 Tola) is adopted because it maximizes charity for the poor and ensures greater social welfare.',
    },
    {
      q: 'Are personal use items like homes, personal cars, and clothing subject to Zakat?',
      qUrdu: 'کیا ذاتی رہائش گاہ اور زیر استعمال گاڑی پر زکوٰۃ ہے؟',
      a: 'No. Primary residential houses, personal family vehicles, everyday clothing, household furniture, and essential tools of trade are 100% exempt from Zakat as they are categorized as essential living necessities (Hajat-e-Asliyya).',
    },
    {
      q: 'How is Zakat calculated on 22K and 21K Gold Jewelry?',
      qUrdu: '22 قیراط اور 21 قیراط سونے کے زیورات پر زکوٰۃ کا حساب کیسے ہوگا؟',
      a: 'Convert the weight of 22K gold (91.66% pure) or 21K gold (87.5% pure) into pure 24K equivalent by multiplying with the purity ratio, multiply by today’s 24K gold rate, and calculate 2.5% on the net value.',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* JSON-LD Schema for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: faq.a,
              },
            })),
          }),
        }}
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-600/10 via-teal-500/5 to-slate-900/10 p-6 sm:p-8 backdrop-blur-xl dark:border-emerald-500/30">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                <HeartHandshake className="h-3.5 w-3.5" />
                <span>Islamic Financial Obligations</span>
              </span>
              <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                2.5% Rate (1/40th)
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Zakat Calculator (Gold & Silver Nisab in PKR)
            </h1>
            <p
              className="text-base text-slate-600 dark:text-slate-300 font-medium"
              dir="rtl"
              style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', system-ui, sans-serif" }}
            >
              اسلامی زکوٰۃ کیلکولیٹر بمع سونے اور چاندی کا نصاب (شرح ۲.۵ فیصد)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
              className="print:hidden border-slate-300 dark:border-slate-700"
            >
              Print Statement
            </Button>
          </div>
        </div>
      </div>

      {/* Preset Profiles */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-100/80 p-3 dark:bg-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
          <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
          <span>Quick Sample Profiles:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleLoadPreset('salaried_gold')}
            className="rounded-xl bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Salaried + Gold Jewelry
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('business_merchant')}
            className="rounded-xl bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Business Merchant
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('average_family')}
            className="rounded-xl bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Average Household
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset('reset')}
            className="inline-flex items-center gap-1 rounded-xl bg-slate-200/80 px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Input Form on Left (7 cols), Results and Summary on Right (5 cols) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Asset & Liability Inputs (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Nisab Selector & Benchmark Rates Bar */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Select Nisab Threshold Standard
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Silver Nisab is recommended by the majority of scholars for mixed assets.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowRateSettings((p) => !p)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
              >
                {showRateSettings ? 'Hide Metal Rates' : 'Adjust Metal Rates'}
              </button>
            </div>

            {/* Nisab Selector Tabs */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setNisabStandard('silver')}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition ${
                  nisabStandard === 'silver'
                    ? 'bg-white text-slate-900 shadow-md dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Coins className="h-4 w-4 text-slate-400" />
                  <span>Silver Nisab (52.5 Tola)</span>
                </div>
                <span className="mt-1 font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                  Rs. {formatPakistaniNumber(result.silverNisabThresholdPkr)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  612.36g — Hanafi / Majority standard
                </span>
              </button>

              <button
                type="button"
                onClick={() => setNisabStandard('gold')}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition ${
                  nisabStandard === 'gold'
                    ? 'bg-white text-slate-900 shadow-md dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span>Gold Nisab (7.5 Tola)</span>
                </div>
                <span className="mt-1 font-mono text-sm font-black text-amber-600 dark:text-amber-400">
                  Rs. {formatPakistaniNumber(result.goldNisabThresholdPkr)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  87.48g — Gold-only threshold
                </span>
              </button>
            </div>

            {/* Collapsible Rate Settings */}
            {showRateSettings && (
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/60 dark:border-slate-800 dark:bg-slate-800/50">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      24K Gold Rate (Rs. / Tola)
                    </label>
                    <Input
                      type="number"
                      value={goldRatePkr}
                      onChange={(e) => setGoldRatePkr(e.target.value)}
                      className="mt-1 text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Silver Rate (Rs. / Tola)
                    </label>
                    <Input
                      type="number"
                      value={silverRatePkr}
                      onChange={(e) => setSilverRatePkr(e.target.value)}
                      className="mt-1 text-sm font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 1: Cash & Bank Accounts */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Cash &amp; Bank Balances (نقد رقم اور بینک بیلنس)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Cash in hand, savings accounts, checking accounts, foreign currency, prize bonds.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rs.
              </span>
              <Input
                type="number"
                min="0"
                value={cashInHand}
                onChange={(e) => setCashInHand(e.target.value)}
                placeholder="0"
                className="pl-12 text-base font-bold"
              />
            </div>
          </div>

          {/* Section 2: Gold Jewelry & Bullion */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    2. Gold Jewelry &amp; Bullion (سونا اور زیورات)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Net gold weight with automatic Karat purity deduction.
                  </p>
                </div>
              </div>

              {/* Unit Selector */}
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setGoldUnit('tola')}
                  className={`rounded-lg px-2 py-1 ${goldUnit === 'tola' ? 'bg-white shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}
                >
                  Tola
                </button>
                <button
                  type="button"
                  onClick={() => setGoldUnit('grams')}
                  className={`rounded-lg px-2 py-1 ${goldUnit === 'grams' ? 'bg-white shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}
                >
                  Grams
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Gold Weight ({goldUnit === 'tola' ? 'Tolas' : 'Grams'})
                </label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={goldWeight}
                  onChange={(e) => setGoldWeight(e.target.value)}
                  placeholder="0"
                  className="mt-1 text-base font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Gold Karat Purity
                </label>
                <select
                  value={goldPurity}
                  onChange={(e) => setGoldPurity(Number(e.target.value) as 24 | 22 | 21 | 18)}
                  aria-label="Gold Karat Purity"
                  className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
                >
                  <option value={24}>24K (99.9% Bullion / Bars)</option>
                  <option value={22}>22K (91.6% Pakistani Jewelry)</option>
                  <option value={21}>21K (87.5% Gulf Jewelry)</option>
                  <option value={18}>18K (75.0% Diamond Jewelry)</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-amber-500/10 p-2.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
              <span>Calculated Pure Gold Value:</span>
              <span className="font-mono font-bold">Rs. {formatPakistaniNumber(result.goldValuationPkr)}</span>
            </div>
          </div>

          {/* Section 3: Silver */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                  <Coins className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    3. Silver (چاندی)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Silver jewelry, coins, and utensils.
                  </p>
                </div>
              </div>

              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setSilverUnit('tola')}
                  className={`rounded-lg px-2 py-1 ${silverUnit === 'tola' ? 'bg-white shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}
                >
                  Tola
                </button>
                <button
                  type="button"
                  onClick={() => setSilverUnit('grams')}
                  className={`rounded-lg px-2 py-1 ${silverUnit === 'grams' ? 'bg-white shadow-sm dark:bg-slate-900' : 'text-slate-500'}`}
                >
                  Grams
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Silver Weight ({silverUnit === 'tola' ? 'Tolas' : 'Grams'})
              </label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={silverWeight}
                onChange={(e) => setSilverWeight(e.target.value)}
                placeholder="0"
                className="mt-1 text-base font-bold"
              />
            </div>

            {result.silverValuationPkr > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-100 p-2.5 text-xs font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                <span>Calculated Silver Value:</span>
                <span className="font-mono font-bold">Rs. {formatPakistaniNumber(result.silverValuationPkr)}</span>
              </div>
            )}
          </div>

          {/* Section 4: Business Stock & Receivables */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400">
                <Building className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  4. Business Merchandise &amp; Investments (مالِ تجارت و سرمایہ کاری)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Stock in trade, trade merchandise for sale, mutual fund units, tradable shares.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Trade Merchandise / Stock Value (PKR)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={businessStock}
                  onChange={(e) => setBusinessStock(e.target.value)}
                  placeholder="0"
                  className="mt-1 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Shares, Mutual Funds &amp; Receivables (PKR)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={sharesReceivables}
                  onChange={(e) => setSharesReceivables(e.target.value)}
                  placeholder="0"
                  className="mt-1 text-sm font-bold"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Deductible Debts & Liabilities */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400">
                <Landmark className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  5. Deductible Immediate Debts &amp; Liabilities (قرض و واجب الادا اخراجات)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Short-term debts due now or within the lunar year, unpaid bills, staff salaries due.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rs.
              </span>
              <Input
                type="number"
                min="0"
                value={debtsLiabilities}
                onChange={(e) => setDebtsLiabilities(e.target.value)}
                placeholder="0"
                className="pl-12 text-base font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Zakat Obligation & Detailed Calculation Summary (5 cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Eligibility Banner */}
          <div
            className={`rounded-3xl border p-6 text-center shadow-lg transition-all ${
              result.isEligibleToPayZakat
                ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-600/15 via-white/95 to-teal-600/10 dark:border-emerald-500/30 dark:from-emerald-950/60 dark:via-slate-900/90 dark:to-teal-950/40'
                : 'border-slate-200 bg-white/90 dark:border-slate-800 dark:bg-slate-900/80'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              {result.isEligibleToPayZakat ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <AlertCircle className="h-6 w-6" />
                </div>
              )}
            </div>

            <h3 className="mt-3 text-base font-black text-slate-900 dark:text-white">
              {result.isEligibleToPayZakat
                ? 'Zakat is Obligatory (Farz) on Your Wealth'
                : 'Wealth is Below Nisab Threshold'}
            </h3>

            <p
              className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300"
              dir="rtl"
              style={{ fontFamily: "'Noto Nastaliq Urdu', system-ui, sans-serif" }}
            >
              {result.isEligibleToPayZakat
                ? 'آپ کے مال پر زکوٰۃ واجب الادا ہے'
                : 'آپ کا قابلِ زکوٰۃ مال نصاب سے کم ہے'}
            </p>

            {/* Total Zakat Due Highlight */}
            <div className="mt-5 rounded-2xl bg-emerald-600 p-5 text-white shadow-md">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">
                Total Zakat Payable (2.5% Rate)
              </span>
              <div className="mt-1 text-3xl sm:text-4xl font-black tracking-tight">
                Rs. {formatPakistaniNumber(result.totalZakatDuePkr)}
              </div>
              <div className="mt-2 text-xs font-medium text-emerald-100">
                {zakatFormatted.inWords} &bull; {zakatFormatted.inUrdu}
              </div>
            </div>

            {/* Comparison with Nisab */}
            <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Net Zakatable:</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  Rs. {formatPakistaniNumber(result.netZakatableWealthPkr)}
                </div>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Active Nisab:</span>
                <div className="font-bold text-slate-900 dark:text-white">
                  Rs. {formatPakistaniNumber(result.activeNisabThresholdPkr)}
                </div>
              </div>
            </div>
          </div>

          {/* Key Metric Cards */}
          <PakistaniMetricCard
            titleEn="Net Zakatable Wealth"
            titleUr="خالص قابلِ زکوٰۃ مال"
            value={`Rs. ${formatPakistaniNumber(result.netZakatableWealthPkr)}`}
            secondaryValue={`Total Assets: Rs. ${formatPakistaniNumber(result.totalAssetsPkr)}`}
            badge="Assets - Debts"
            isHighlighted={result.isEligibleToPayZakat}
            southAsianNumeralText={netWealthFormatted.inWords}
            statutoryBasis="Net wealth calculated after subtracting immediate debt liabilities from total zakatable assets."
            statutoryReference="Al-Quran (Surah At-Tawbah 9:60) & Fiqh Academy"
          />

          {/* Itemized Asset Breakdown */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-emerald-500" />
              <span>Zakatable Assets Breakdown</span>
            </h4>

            <div className="space-y-2">
              {result.assetBreakdown.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs dark:bg-slate-800/50"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {item.item}
                    </span>
                    <div
                      className="text-[11px] text-slate-500 dark:text-slate-400"
                      dir="rtl"
                      style={{ fontFamily: "'Noto Nastaliq Urdu', system-ui, sans-serif" }}
                    >
                      {item.itemUrdu}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    Rs. {formatPakistaniNumber(item.valuePkr)}
                  </span>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-xl bg-rose-50 p-2.5 text-xs text-rose-900 dark:bg-rose-950/40 dark:text-rose-200 font-semibold">
                <span>Less Liabilities &amp; Debts:</span>
                <span className="font-mono">- Rs. {formatPakistaniNumber(result.totalLiabilitiesPkr)}</span>
              </div>
            </div>
          </div>

          {/* Share Slip on WhatsApp */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Share Zakat Record
            </h5>
            <WhatsAppShareButton
              shareText={shareSlip}
              buttonText="Share Summary on WhatsApp"
            />
          </div>
        </div>
      </div>

      {/* Islamic Jurisprudence & Exempt Assets Guide */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-emerald-600" />
          <span>Islamic Principles &amp; Exempt Assets (زکوٰۃ کے شرعی اصول)</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <h4 className="font-bold text-slate-900 dark:text-white">🏠 100% Exempt Assets</h4>
            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              Personal primary residence, personal family cars, everyday clothes, furniture, and tools used for daily profession have zero Zakat obligation.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <h4 className="font-bold text-slate-900 dark:text-white">⏳ The Hawl (1 Lunar Year) Condition</h4>
            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              Zakat becomes due once your net wealth has remained equal to or above the Nisab threshold continuously for one full Islamic lunar year.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <h4 className="font-bold text-slate-900 dark:text-white">🤲 Eligible Beneficiaries (Masarif)</h4>
            <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">
              Zakat is distributed strictly to the 8 categories defined in Surah At-Tawbah (9:60), including the poor (Fuqara), the needy (Masakeen), and debtors.
            </p>
          </div>
        </div>
      </div>

      {/* Bilingual Urdu / English FAQ Accordion */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <span>Frequently Asked Questions (زکوٰۃ کے مسائل اور احکام)</span>
        </h3>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-100 bg-slate-50/80 overflow-hidden dark:border-slate-800 dark:bg-slate-800/40"
            >
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <div>
                  <div>{faq.q}</div>
                  <div
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5"
                    dir="rtl"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', system-ui, sans-serif" }}
                  >
                    {faq.qUrdu}
                  </div>
                </div>
                {activeFaq === idx ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>
              {activeFaq === idx && (
                <div className="border-t border-slate-100 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-300">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
