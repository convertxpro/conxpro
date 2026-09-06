'use client';

import React, { useState, useId } from 'react';
import {
  calculateFbrTax,
  TaxCalculationInput,
  SALARIED_TAX_SLABS,
  BUSINESS_TAX_SLABS,
} from '@/lib/converters/pakistan/fbr-tax';
import { formatLakhCrore, formatPakistaniNumber } from '@/lib/converters/pakistan/formatters';
import { PakistaniMetricCard } from '@/components/converters/common';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Receipt,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  Building2,
  UserCheck,
  Printer,
  ChevronDown,
  ChevronUp,
  Percent,
  TrendingDown,
  Sparkles,
  Info,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';

const PRESET_SALARIES_MONTHLY = [
  { label: '50k / mo', value: 50000, desc: 'Tax Exempt Tier' },
  { label: '100k / mo', value: 100000, desc: '5% Bracket' },
  { label: '150k / mo', value: 150000, desc: '15% Bracket' },
  { label: '250k / mo', value: 250000, desc: '25% Bracket' },
  { label: '400k / mo', value: 400000, desc: '35% Bracket' },
  { label: '1.0M / mo', value: 1000000, desc: 'Executive / Surcharge' },
];

export const FbrTaxCalculatorComponent: React.FC = () => {
  const [inputMode, setInputMode] = useState<'monthly' | 'annual'>('monthly');
  const [salaryInput, setSalaryInput] = useState<string>('150000');
  const [individualType, setIndividualType] = useState<'salaried' | 'business'>('salaried');
  const [taxYear, setTaxYear] = useState<'2024-2025' | '2025-2026'>('2024-2025');
  const [isFiler, setIsFiler] = useState<boolean>(true);
  const [zakatDeduction, setZakatDeduction] = useState<string>('0');
  const [showAdvancedDeductions, setShowAdvancedDeductions] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const rawAmount = parseFloat(salaryInput.replace(/,/g, '')) || 0;
  const rawZakat = parseFloat(zakatDeduction.replace(/,/g, '')) || 0;

  const calculationInput: TaxCalculationInput = {
    monthlySalary: inputMode === 'monthly' ? rawAmount : undefined,
    annualSalary: inputMode === 'annual' ? rawAmount : undefined,
    individualType,
    taxYear,
    isFiler,
    zakatDeduction: rawZakat,
  };

  const result = calculateFbrTax(calculationInput);
  const activeSlabs = individualType === 'salaried' ? SALARIED_TAX_SLABS : BUSINESS_TAX_SLABS;

  const takeHomePct = result.grossMonthlySalary > 0
    ? ((result.monthlyTakeHome / result.grossMonthlySalary) * 100).toFixed(1)
    : '100';
  const taxPct = result.grossMonthlySalary > 0
    ? ((result.monthlyTax / result.grossMonthlySalary) * 100).toFixed(1)
    : '0';

  const monthlyTakeHomeFormatted = formatLakhCrore(result.monthlyTakeHome);
  const monthlyTaxFormatted = formatLakhCrore(result.monthlyTax);
  const annualTaxFormatted = formatLakhCrore(result.annualTax);
  const annualTakeHomeFormatted = formatLakhCrore(result.annualTakeHome);

  // WhatsApp Share text
  const shareSlip = `📄 *FBR Pakistan Income Tax Slip (Tax Year ${taxYear})*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💼 *Category:* ${individualType === 'salaried' ? 'Salaried Individual' : 'Business / AOP'}\n` +
    `👤 *Status:* ${isFiler ? 'Active Taxpayer (Filer 🟢)' : 'Non-Filer (Punitive Rates 🔴)'}\n` +
    `💰 *Gross Monthly Salary:* Rs. ${formatPakistaniNumber(result.grossMonthlySalary)}\n` +
    `💵 *Net Monthly Take-Home:* Rs. ${formatPakistaniNumber(result.monthlyTakeHome)} (${monthlyTakeHomeFormatted.inWords})\n` +
    `📉 *Monthly Tax Deduction:* Rs. ${formatPakistaniNumber(result.monthlyTax)}\n` +
    `📊 *Effective Tax Rate:* ${result.effectiveTaxRate}%\n` +
    `📌 *Marginal Bracket:* ${result.marginalTaxBracket}\n` +
    `🏛️ *Total Annual Tax Liability:* Rs. ${formatPakistaniNumber(result.annualTax)}\n` +
    (result.hasSurcharge ? `⚠️ *Includes 10% Super Surcharge:* Rs. ${formatPakistaniNumber(result.surchargeAmount)}\n` : '') +
    `\n🔗 *Calculated free via ApexTools Pakistan*`;

  const handlePrint = () => {
    window.print();
  };

  const faqs = [
    {
      q: 'What are the FBR Income Tax Slabs for Tax Year 2024–2026 in Pakistan?',
      qUrdu: 'پاکستان میں تنخواہ پر انکم ٹیکس کے قانونی سلیب کیا ہیں؟',
      a: 'Under the Finance Act 2024-2026, salaried individuals earning up to Rs. 600,000 annually (Rs. 50,000/month) are 100% tax exempt. Progressive slabs apply thereafter from 5% up to 35%, plus a 10% super surcharge for taxable annual income exceeding Rs. 10 Million.',
    },
    {
      q: 'What is the penalty difference between Filer and Non-Filer in Pakistan?',
      qUrdu: 'فائلر اور نان فائلر کے ٹیکس کٹوتی میں کیا فرق ہے؟',
      a: 'Active Taxpayers (Filers) on the FBR Active Taxpayer List (ATL) enjoy standard statutory rates and lower withholding tax on banking cash withdrawals, vehicle purchases, and property registrations. Non-Filers face 100% to 200% punitive withholding taxes under Section 231AB and 236K.',
    },
    {
      q: 'How does Zakat deducted at source reduce taxable income under Section 60?',
      qUrdu: 'کیا زکوٰۃ کی ادائیگی سے انکم ٹیکس میں چھوٹ ملتی ہے؟',
      a: 'Yes. Under Section 60 of the Income Tax Ordinance 2001, any Zakat paid under the Zakat and Ushr Ordinance 1980 is an allowable straight deduction from gross taxable income, directly reducing your annual tax liability.',
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
                <Receipt className="h-3.5 w-3.5" />
                <span>Finance Act 2024–2026 Slabs</span>
              </span>
              <span className="rounded-full bg-slate-200/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Tax Year {taxYear}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              FBR Salary & Income Tax Calculator
            </h1>
            <p
              className="text-base text-slate-600 dark:text-slate-300 font-medium"
              dir="rtl"
              style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', system-ui, sans-serif" }}
            >
              ایف بی آر انکم ٹیکس و خالص تنخواہ کیلکولیٹر (سال 2024–2026)
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
              className="print:hidden border-slate-300 dark:border-slate-700"
            >
              Print Slip
            </Button>
          </div>
        </div>
      </div>

      {/* Main Interactive Controls Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Input Form & Controls (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            {/* Category and Tax Year Toggles */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Individual Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Taxpayer Category
                </label>
                <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setIndividualType('salaried')}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                      individualType === 'salaried'
                        ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Salaried Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setIndividualType('business')}
                    className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                      individualType === 'business'
                        ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Business / AOP
                  </button>
                </div>
              </div>

              {/* Filer Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  FBR Active Taxpayer Status
                </label>
                <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFiler(true)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                      isFiler
                        ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-600'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Active Filer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsFiler(false)}
                    className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                      !isFiler
                        ? 'bg-rose-600 text-white shadow-sm dark:bg-rose-600'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Non-Filer</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Income Input Mode Toggle & Input */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {inputMode === 'monthly' ? 'Monthly Gross Salary / Income' : 'Annual Gross Salary / Income'} (PKR)
                </label>
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setInputMode('monthly')}
                    className={`rounded-lg px-2.5 py-1 transition ${
                      inputMode === 'monthly'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('annual')}
                    className={`rounded-lg px-2.5 py-1 transition ${
                      inputMode === 'annual'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Annual
                  </button>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Rs.
                </span>
                <Input
                  type="number"
                  min="0"
                  step="5000"
                  value={salaryInput}
                  onChange={(e) => setSalaryInput(e.target.value)}
                  placeholder="e.g. 150000"
                  className="pl-12 text-lg font-bold text-slate-900 dark:text-white"
                />
              </div>

              {/* South Asian Numerical Representation in Words */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatLakhCrore(rawAmount).inWords}
                </span>
                <span
                  className="text-slate-500 dark:text-slate-400"
                  dir="rtl"
                  style={{ fontFamily: "'Noto Nastaliq Urdu', system-ui, sans-serif" }}
                >
                  {formatLakhCrore(rawAmount).inUrdu}
                </span>
              </div>
            </div>

            {/* Quick Preset Salary Chips */}
            <div className="mt-4 space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Quick Benchmarks:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SALARIES_MONTHLY.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      setInputMode('monthly');
                      setSalaryInput(preset.value.toString());
                    }}
                    className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                      inputMode === 'monthly' && rawAmount === preset.value
                        ? 'bg-emerald-600 text-white shadow-sm dark:bg-emerald-600'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Deductions (Zakat Section 60) */}
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAdvancedDeductions((p) => !p)}
                className="flex w-full items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Tax Deductible Zakat (Section 60 Exemption)</span>
                </div>
                {showAdvancedDeductions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showAdvancedDeductions && (
                <div className="mt-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Annual Zakat Deducted under Zakat & Ushr Ordinance (PKR)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={zakatDeduction}
                    onChange={(e) => setZakatDeduction(e.target.value)}
                    placeholder="0"
                    className="mt-1 text-sm font-semibold"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Direct deduction from gross annual income allowed under Section 60 of Income Tax Ordinance.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Non-Filer Warning Banner if applicable */}
          {!isFiler && (
            <div className="flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-900 dark:text-rose-200">
              <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
              <div>
                <h5 className="font-bold">Non-Filer Alert (FBR 100% Tax Surcharge)</h5>
                <p className="mt-0.5 text-rose-800 dark:text-rose-300">
                  As a Non-Filer, you are subject to 100% higher withholding tax on bank cash withdrawals above Rs. 50k, 250% higher tax on motor vehicle registration, and double withholding on property transfers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Take-Home & Deduction Metric Cards (5 Cols) */}
        <div className="space-y-4 lg:col-span-5">
          {/* Net Monthly Take-Home Card */}
          <PakistaniMetricCard
            titleEn="Net Monthly Take-Home Pay"
            titleUr="ماہانہ خالص تنخواہ (بعد از ٹیکس)"
            value={`Rs. ${formatPakistaniNumber(result.monthlyTakeHome)}`}
            secondaryValue={`Annual: Rs. ${formatPakistaniNumber(result.annualTakeHome)}`}
            badge="After Tax"
            isHighlighted={true}
            southAsianNumeralText={monthlyTakeHomeFormatted.inWords}
            statutoryBasis="Net take-home amount credited to your bank account after statutory FBR income tax deduction."
            statutoryReference="Finance Act 2024 (First Schedule, Division I)"
          />

          {/* Monthly Tax Deduction Card */}
          <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-white/90 to-rose-500/5 p-5 shadow-sm backdrop-blur-md dark:border-rose-500/20 dark:from-rose-950/40 dark:via-slate-900/80 dark:to-rose-950/20">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  Monthly Tax Deduction
                </h4>
                <p
                  className="text-sm font-medium text-slate-500 dark:text-slate-400"
                  dir="rtl"
                  style={{ fontFamily: "'Noto Nastaliq Urdu', system-ui, sans-serif" }}
                >
                  ماہانہ انکم ٹیکس کٹوتی
                </p>
              </div>
              <span className="rounded-full bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                {result.effectiveTaxRate}% Effective
              </span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400">
                Rs. {formatPakistaniNumber(result.monthlyTax)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ month</span>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-rose-100 pt-2.5 dark:border-rose-900/40 text-xs">
              <span className="font-semibold text-rose-700 dark:text-rose-400">
                Annual Tax: Rs. {formatPakistaniNumber(result.annualTax)}
              </span>
              <span className="text-slate-500 dark:text-slate-400">
                Bracket: {result.marginalTaxBracket}
              </span>
            </div>

            {result.hasSurcharge && (
              <div className="mt-2 rounded-lg bg-amber-500/15 p-2 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                ⚠️ Includes 10% Super Surcharge (Rs. {formatPakistaniNumber(result.surchargeAmount)}/yr) on income &gt; Rs. 1 Crore.
              </div>
            )}
          </div>

          {/* WhatsApp & Social Share Slip */}
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-900/80">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Share Tax Computation Slip
            </h5>
            <WhatsAppShareButton
              shareText={shareSlip}
              buttonText="Share Slip on WhatsApp"
            />
          </div>
        </div>
      </div>

      {/* Visual Salary Distribution Progress Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Visual Salary Distribution Breakdown
          </h3>
          <span className="text-xs font-bold text-slate-500">
            Gross: Rs. {formatPakistaniNumber(result.grossMonthlySalary)} / mo
          </span>
        </div>

        {/* Bar */}
        <div className="relative h-6 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 flex">
          <div
            style={{ width: `${takeHomePct}%` }}
            className="h-full bg-emerald-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner"
            title={`Take-Home: ${takeHomePct}%`}
          >
            {parseFloat(takeHomePct) > 15 && `Take-Home (${takeHomePct}%)`}
          </div>
          <div
            style={{ width: `${taxPct}%` }}
            className="h-full bg-rose-500 transition-all duration-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner"
            title={`Tax: ${taxPct}%`}
          >
            {parseFloat(taxPct) > 8 && `Tax (${taxPct}%)`}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span className="text-slate-700 dark:text-slate-300">
              Net Take-Home ({takeHomePct}%): Rs. {formatPakistaniNumber(result.monthlyTakeHome)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-rose-500" />
            <span className="text-slate-700 dark:text-slate-300">
              FBR Tax Deduction ({taxPct}%): Rs. {formatPakistaniNumber(result.monthlyTax)}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 2024–2026 Statutory Slab Reference Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <div className="border-b border-slate-200/80 p-5 sm:p-6 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Official FBR Tax Slabs (Tax Year 2024–2026)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Statutory schedule for {individualType === 'salaried' ? 'Salaried Individuals' : 'Business & AOP'}. Your active slab is highlighted below.
            </p>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            Active Tier: Slab {result.activeSlabNumber}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 sm:px-6">Slab</th>
                <th className="px-4 py-3 sm:px-6">Annual Taxable Income</th>
                <th className="px-4 py-3 sm:px-6">Monthly Equivalent</th>
                <th className="px-4 py-3 sm:px-6">Tax Rate Formula</th>
                <th className="px-4 py-3 sm:px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {activeSlabs.map((slab) => {
                const isUserSlab = slab.slabNumber === result.activeSlabNumber;
                return (
                  <tr
                    key={slab.slabNumber}
                    className={`transition-colors ${
                      isUserSlab
                        ? 'bg-emerald-500/10 font-bold text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200'
                        : 'text-slate-700 hover:bg-slate-50/80 dark:text-slate-300 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="px-4 py-3.5 sm:px-6">
                      <div className="flex items-center gap-2">
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                          isUserSlab
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {slab.slabNumber}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 sm:px-6 font-mono">
                      Rs. {formatPakistaniNumber(slab.minAnnual)} {slab.maxAnnual ? `– ${formatPakistaniNumber(slab.maxAnnual)}` : 'and above'}
                    </td>
                    <td className="px-4 py-3.5 sm:px-6 font-mono text-slate-500 dark:text-slate-400">
                      Rs. {formatPakistaniNumber(Math.round(slab.minMonthly))} {slab.maxMonthly ? `– ${formatPakistaniNumber(Math.round(slab.maxMonthly))}` : '+'}
                    </td>
                    <td className="px-4 py-3.5 sm:px-6">
                      {slab.rateDescription}
                    </td>
                    <td className="px-4 py-3.5 sm:px-6 text-right">
                      {isUserSlab ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                          <Sparkles className="h-3 w-3" />
                          <span>Your Slab</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Standard</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tax Slabs Cumulative Breakdown Card */}
      {result.taxSlabBreakdown.length > 0 && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
            Itemized Slab-by-Slab Calculation for Your Income
          </h3>
          <div className="space-y-2">
            {result.taxSlabBreakdown.map((item) => (
              <div
                key={item.slabIndex}
                className={`flex flex-wrap items-center justify-between gap-2 rounded-xl p-3 text-xs ${
                  item.isUserSlab
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 font-semibold'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div>
                  <span className="font-bold">Slab {item.slabIndex} ({item.slabLabel}):</span>{' '}
                  <span>Taxable: Rs. {formatPakistaniNumber(item.taxableInSlab)} @ {item.rate}</span>
                </div>
                <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                  Tax: Rs. {formatPakistaniNumber(item.taxAmount)}
                </span>
              </div>
            ))}

            {result.hasSurcharge && (
              <div className="flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs font-semibold text-amber-900 dark:text-amber-200">
                <span>10% Super Surcharge (&gt; Rs. 10M Annual Income):</span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  + Rs. {formatPakistaniNumber(result.surchargeAmount)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filer Benefits & Legal Optimization Guide */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <span>FBR Active Taxpayer (Filer) Benefits in Pakistan</span>
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">🏦 Banking Transactions</h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              0% withholding tax on cash withdrawals &amp; bank transfers. Non-filers pay 0.6% on cash withdrawals &gt; Rs. 50,000/day.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">🚗 Motor Vehicle Purchase</h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Standard advance tax on vehicle registration. Non-filers face punitive 200% to 300% advance tax rates under Section 231B.
            </p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">🏡 Property Transactions</h4>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              3% advance tax for filers on buying immovable property vs up to 12%-15% heavy withholding for non-filers under Section 236K.
            </p>
          </div>
        </div>
      </div>

      {/* Bilingual Urdu / English FAQ Accordion */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-emerald-600" />
          <span>Frequently Asked Questions (پاکستان انکم ٹیکس سوالات)</span>
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
