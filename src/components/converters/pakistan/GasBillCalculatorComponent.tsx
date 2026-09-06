'use client';

import React, { useState } from 'react';
import {
  calculateGasBill,
  convertGasUnits,
  GasCompany,
  GAS_COMPANIES,
  PROTECTED_GAS_SLABS,
  NON_PROTECTED_GAS_SLABS,
} from '@/lib/converters/pakistan/gas-bill';
import { formatPakistaniNumber, formatLakhCrore } from '@/lib/converters/pakistan/formatters';
import { PakistaniMetricCard, PrivacyAssuranceBadge } from '@/components/converters/common';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Flame,
  ShieldCheck,
  AlertTriangle,
  Receipt,
  Printer,
  ChevronDown,
  ChevronUp,
  Percent,
  TrendingDown,
  Building2,
  Sparkles,
  HelpCircle,
  Gauge,
  Layers,
  Info,
  ArrowRightLeft,
} from 'lucide-react';

const PRESET_GAS_READINGS = [
  { label: '0.25 HM³', hm3: 0.25, mmbtu: 0.88, desc: 'Cooking Stove Only' },
  { label: '0.65 HM³', hm3: 0.65, mmbtu: 2.30, desc: 'Stove + Instant Geyser' },
  { label: '0.88 HM³', hm3: 0.88, mmbtu: 3.11, desc: 'Protected Max Limit' },
  { label: '1.50 HM³', hm3: 1.50, mmbtu: 5.30, desc: 'Stove + Storage Geyser' },
  { label: '2.80 HM³', hm3: 2.80, mmbtu: 9.89, desc: 'Winter (Stove + Heater + Geyser)' },
];

export const GasBillCalculatorComponent: React.FC = () => {
  const [company, setCompany] = useState<GasCompany>('SNGPL');
  const [isProtectedConsumer, setIsProtectedConsumer] = useState<boolean>(true);
  const [inputUnit, setInputUnit] = useState<'HM3' | 'SCM' | 'MMBTU'>('HM3');
  const [inputValue, setInputValue] = useState<string>('0.65');
  const [gcvInput, setGCVInput] = useState<string>('1050');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const rawInput = parseFloat(inputValue.replace(/,/g, '')) || 0;
  const gcvVal = parseFloat(gcvInput) || (company === 'SNGPL' ? 1050 : 1020);

  // Convert input to HM3 if entered in SCM or MMBTU
  const unitConversion = convertGasUnits(rawInput, inputUnit, gcvVal);
  const hm3ForCalculation = unitConversion.hm3;

  const result = calculateGasBill({
    company,
    meterReadingHm3: hm3ForCalculation,
    grossCalorificValueGcv: gcvVal,
    isProtectedConsumer,
  });

  const totalBillFormatted = formatLakhCrore(result.totalEstimatedBillPkr);
  const gasChargesFormatted = formatLakhCrore(result.gasChargesPkr);

  // WhatsApp share template
  const shareSlip =
    `🔥 *${company} Domestic Gas Bill Estimate (OGRA Pakistan)*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏢 *Gas Provider:* ${result.companyInfo.fullName}\n` +
    `📍 *Coverage:* ${result.companyInfo.coverageUrdu}\n` +
    `🛡️ *Consumer Category:* ${isProtectedConsumer ? 'Protected Consumer (Subsidized 🟢)' : 'Non-Protected Consumer (Standard 🔴)'}\n` +
    `📊 *Meter Consumption:* ${result.meterReadingHm3} HM³ (${result.consumedScm} SCM / ${result.consumedMmbtu} MMBTU)\n` +
    `💰 *Total Estimated Bill:* Rs. ${formatPakistaniNumber(result.totalEstimatedBillPkr)} (${totalBillFormatted.inWords})\n` +
    `🏷️ *Active Slab Rate:* ${result.activeSlab}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📝 *Cost Breakdown:*\n` +
    `• Gas Commodity Charges: Rs. ${formatPakistaniNumber(result.gasChargesPkr)}\n` +
    `• Monthly Meter Rent: Rs. ${result.meterRentPkr} (${isProtectedConsumer ? 'Subsidized' : 'Standard'})\n` +
    `• General Sales Tax (18% GST): Rs. ${formatPakistaniNumber(result.gstAmount)}\n` +
    (result.protectedComparisonDiffPkr ? `💡 *Protected Subsidized Savings:* Rs. ${formatPakistaniNumber(result.protectedComparisonDiffPkr)} / month\n` : '') +
    `\n🔗 *Calculated free via ApexTools Pakistan*`;

  const handlePrint = () => {
    window.print();
  };

  const faqs = [
    {
      q: 'How do I read my gas meter difference in HM³ on SNGPL and SSGC bills?',
      qUrdu: 'سوئی گیس میٹر سے HM³ میں ریڈنگ کیسے معلوم کی جائے؟',
      a: 'Your gas meter displays volume in cubic meters. The difference between your Current Reading and Previous Reading is divided by 100 to determine HM³ (Hundreds of Cubic Meters). For example, 65 cubic meters used = 0.65 HM³ on your monthly invoice.',
    },
    {
      q: 'What is the difference between Protected and Non-Protected gas consumers in Pakistan?',
      qUrdu: 'گیس کے بل میں محفوظ اور غیر محفوظ صارفین میں کیا فرق ہے؟',
      a: 'Protected consumers are domestic users consuming up to 0.9 HM³ per month in winter (November–February), paying subsidized rates (Rs. 200–400 per MMBTU and Rs. 40 meter rent). Non-Protected consumers pay Rs. 500 to Rs. 3,500 per MMBTU plus Rs. 500 monthly meter rent.',
    },
    {
      q: 'What is Gross Calorific Value (GCV) and why does it change my gas bill?',
      qUrdu: 'گراس کیلوریفک ویلیو (GCV) کیا ہے اور یہ گیس بل پر کیسے اثر انداز ہوتی ہے؟',
      a: 'GCV measures the heating energy content per standard cubic foot of gas (typically ~1050 BTU/Scf for SNGPL in north and ~1020 BTU/Scf for SSGC in south). A higher GCV means higher energy delivered per volume, slightly adjusting the resulting MMBTU billing units.',
    },
    {
      q: 'How much gas does a domestic stove or instant water geyser consume in Pakistan?',
      qUrdu: 'ایک گھریلو چولہا یا گیزر ماہانہ کتنی گیس خرچ کرتا ہے؟',
      a: 'A standard domestic 2-burner cooking stove consumes approximately 0.20 to 0.35 HM³ per month. An instant gas water geyser consumes around 0.30 to 0.50 HM³ monthly, while a large 35-gallon storage tank geyser or room heater can consume 1.0 to 2.5 HM³ per month in peak winter.',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Privacy Banner */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="🔒 100% Client-Side Gas Math • OGRA FY 2024-2025 SNGPL & SSGC Domestic Tariffs"
      />

      {/* 2. Main Configuration Panel */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <Flame className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Gas Bill Units & OGRA Tariff Calculator (MMBTU ↔ SCM ↔ HM³ ↔ PKR)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official SNGPL & SSGC Domestic Slab Rates, Protected Subsidies, and Meter Rent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Print Bill Slip
            </Button>
          </div>
        </div>

        {/* Form Controls Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Gas Company Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Select Gas Utility Provider
            </label>
            <select
              value={company}
              onChange={(e) => {
                const c = e.target.value as GasCompany;
                setCompany(c);
                setGCVInput(c === 'SNGPL' ? '1050' : '1020');
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {Object.keys(GAS_COMPANIES).map((key) => {
                const info = GAS_COMPANIES[key as GasCompany];
                return (
                  <option key={key} value={key}>
                    {info.name} — {info.fullName}
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Coverage: {result.companyInfo.coverageAreas.join(', ')}
            </p>
          </div>

          {/* Protected Consumer Status Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Consumer Category
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setIsProtectedConsumer(true)}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                  isProtectedConsumer
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected (&le;0.9 HM³)
              </button>
              <button
                type="button"
                onClick={() => setIsProtectedConsumer(false)}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                  !isProtectedConsumer
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Non-Protected
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isProtectedConsumer
                ? 'Subsidized rate (Rs. 200–400/MMBTU + Rs. 40 meter rent)'
                : 'Standard rate (Rs. 500–3,500/MMBTU + Rs. 500 meter rent)'}
            </p>
          </div>

          {/* Gross Calorific Value (GCV) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Gross Calorific Value (GCV)
            </label>
            <div className="relative">
              <Input
                type="number"
                value={gcvInput}
                onChange={(e) => setGCVInput(e.target.value)}
                placeholder={company === 'SNGPL' ? '1050' : '1020'}
                className="font-semibold text-slate-900 dark:text-white pr-20"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                BTU / Scf
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Standard: 1,050 for SNGPL • 1,020 for SSGC
            </p>
          </div>
        </div>

        {/* Input Unit Selector & Values */}
        <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Input Gas Consumption Reading
            </label>

            {/* Unit Tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  setInputUnit('HM3');
                  setInputValue(unitConversion.hm3.toString());
                }}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  inputUnit === 'HM3'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                HM³ (Meter Diff)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputUnit('SCM');
                  setInputValue(unitConversion.scm.toString());
                }}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  inputUnit === 'SCM'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                SCM (Cubic Meters)
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputUnit('MMBTU');
                  setInputValue(unitConversion.mmbtu.toString());
                }}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                  inputUnit === 'MMBTU'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                MMBTU (Energy Units)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2 relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. 0.65"
                className="text-xl font-extrabold text-slate-900 dark:text-white pr-20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-rose-500">
                {inputUnit === 'HM3' ? 'HM³' : inputUnit === 'SCM' ? 'm³ (SCM)' : 'MMBTU'}
              </span>
            </div>

            <div className="flex items-center rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
              <span>
                Equivalent: <strong>{result.consumedMmbtu} MMBTU</strong> • <strong>{result.consumedScm} SCM</strong> • <strong>{result.consumedScf} Scf</strong>
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Household Presets:
            </span>
            {PRESET_GAS_READINGS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setInputUnit('HM3');
                  setInputValue(p.hm3.toString());
                  setIsProtectedConsumer(p.hm3 <= 0.9);
                }}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                  rawInput === p.hm3 && inputUnit === 'HM3'
                    ? 'bg-rose-500 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                {p.label} ({p.desc})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Output Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PakistaniMetricCard
          titleEn="Estimated Gas Bill"
          titleUr="کل تخمینہ شدہ گیس کا بل"
          value={`Rs. ${formatPakistaniNumber(result.totalEstimatedBillPkr)}`}
          badge={company}
          isHighlighted={true}
          statutoryBasis="Calculated per OGRA FY 2024-25 domestic consumer tariff notification with 18% GST and meter rent."
          statutoryReference="OGRA Tariff Schedule / SNGPL / SSGC"
        />

        <PakistaniMetricCard
          titleEn="Billing Energy (MMBTU)"
          titleUr="بلنگ یونٹس (ایم ایم بی ٹی یو)"
          value={`${result.consumedMmbtu} MMBTU`}
          badge={`${result.consumedScm} SCM`}
          statutoryBasis="Standard formula: HM³ × 100 × 35.3147 × GCV / 1,000,000"
        />

        <PakistaniMetricCard
          titleEn="Gas Commodity Charges"
          titleUr="گیس کموڈٹی چارجز"
          value={`Rs. ${formatPakistaniNumber(result.gasChargesPkr)}`}
          badge={`@ Rs. ${result.gasRatePerMmbtu}/MMBTU`}
          statutoryBasis="Pure gas volume charges before meter rent and 18% GST."
        />

        <PakistaniMetricCard
          titleEn="Active Tariff Category"
          titleUr="لاگو شدہ ٹیرف کیٹیگری"
          value={isProtectedConsumer ? 'Protected Category' : 'Non-Protected'}
          badge={isProtectedConsumer ? 'Protected Subsidized 🟢' : 'Non-Protected 🔴'}
          statutoryBasis={result.activeSlab}
        />
      </div>

      {/* 4. Protected vs Non-Protected Comparative Warning Card */}
      {isProtectedConsumer && result.protectedComparisonDiffPkr && result.protectedComparisonDiffPkr > 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>
              🎉 <strong>Protected Subsidy Active:</strong> You are saving approximately{' '}
              <strong>Rs. {formatPakistaniNumber(result.protectedComparisonDiffPkr)}</strong> on this bill compared
              to the non-protected category (Meter rent: Rs. 40 vs Rs. 500).
            </span>
          </div>
          <span className="font-bold text-emerald-700 dark:text-emerald-400">
            Keep under 0.9 HM³ to stay protected!
          </span>
        </div>
      ) : !isProtectedConsumer && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <span>
              ⚠️ <strong>Non-Protected Category:</strong> Rates are up to 5x higher (Rs. 500–3,500/MMBTU) plus Rs. 500 monthly meter rent.
            </span>
          </div>
          <span className="font-bold text-amber-700 dark:text-amber-400">
            Standard OGRA Commercial Rate
          </span>
        </div>
      )}

      {/* 5. Detailed Itemized Bill Slip & Slabs Table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Printable/Copyable Bill Slip */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official Itemized Gas Bill Breakdown
                </h3>
              </div>
              <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                {company}
              </span>
            </div>

            <div className="divide-y divide-slate-100 px-6 dark:divide-slate-800 text-xs">
              {result.costBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.item}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {item.itemUrdu} • {item.desc}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      Rs. {formatPakistaniNumber(item.amountPkr)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total Line */}
              <div className="flex items-center justify-between py-4 bg-rose-50/40 -mx-6 px-6 dark:bg-rose-950/20">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Net Estimated Gas Bill (PKR)
                  </p>
                  <p className="text-xs text-rose-700 dark:text-rose-400">
                    {totalBillFormatted.inWords} • {totalBillFormatted.inUrdu}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">
                    Rs. {formatPakistaniNumber(result.totalEstimatedBillPkr)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bi-Directional Gas Conversion Summary */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-rose-500" />
              Share gas bill estimate on WhatsApp:
            </div>
            <WhatsAppShareButton
              shareText={shareSlip}
              buttonText="Share Gas Bill Slip on WhatsApp"
            />
          </div>
        </div>

        {/* Reference OGRA Tariff Slabs Matrix */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-rose-500" />
              Official OGRA Domestic Gas Slabs
            </h4>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="font-bold text-emerald-800 dark:text-emerald-300">
                    Protected Slabs (Meter Rent: Rs. 40)
                  </p>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  {PROTECTED_GAS_SLABS.map((s) => (
                    <div key={s.slabName} className="flex justify-between">
                      <span>{s.slabName.split('(')[1].replace(')', '')}</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">Rs. {s.ratePerMmbtu} / MMBTU</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="font-bold text-rose-800 dark:text-rose-300">
                    Non-Protected Slabs (Meter Rent: Rs. 500)
                  </p>
                </div>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  {NON_PROTECTED_GAS_SLABS.map((s) => (
                    <div key={s.slabName} className="flex justify-between">
                      <span>{s.slabName.split('(')[1].replace(')', '')}</span>
                      <strong className="text-rose-700 dark:text-rose-400">Rs. {s.ratePerMmbtu} / MMBTU</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-400">
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">Unit Equivalencies:</p>
                <p>• 1 HM³ = 100 SCM = 3,531.47 Scf</p>
                <p>• 1 HM³ ≈ 3.53 MMBTU (at standard 1050 GCV)</p>
                <p>• 1 MMBTU ≈ 0.283 HM³ ≈ 28.32 SCM</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Comprehensive FAQ Accordion */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-rose-500" />
          Frequently Asked Questions (SNGPL & SSGC Gas Billing in Pakistan)
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {faqs.map((faq, index) => {
            const isOpen = activeFaq === index;
            return (
              <div key={index} className="py-4">
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                  className="flex w-full items-center justify-between text-left focus:outline-none"
                >
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {faq.q}
                    </span>
                    <span className="block text-xs font-semibold text-rose-600 dark:text-rose-400 mt-0.5">
                      {faq.qUrdu}
                    </span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
