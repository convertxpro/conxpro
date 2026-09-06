'use client';

import React, { useState } from 'react';
import {
  calculatePropertyTax,
  Jurisdiction,
  PropertyType,
  FilerStatus,
  PROPERTY_PRESETS,
} from '@/lib/converters/pakistan/property-tax';
import { formatPakistaniNumber, formatLakhCrore } from '@/lib/converters/pakistan/formatters';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Button } from '@/components/ui/Button';
import {
  Building2,
  Receipt,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Scale,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

interface PropertyTaxCalculatorComponentProps {
  tool?: ToolMetadata;
}

export const PropertyTaxCalculatorComponent: React.FC<PropertyTaxCalculatorComponentProps> = () => {
  const [propertyValueInput, setPropertyValueInput] = useState<string>('10000000');
  const [purchasePriceInput, setPurchasePriceInput] = useState<string>('7500000');
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>('punjab');
  const [propertyType, setPropertyType] = useState<PropertyType>('house');
  const [buyerStatus, setBuyerStatus] = useState<FilerStatus>('filer');
  const [sellerStatus, setSellerStatus] = useState<FilerStatus>('filer');
  const [holdingPeriod, setHoldingPeriod] = useState<number>(2);
  const [isRural, setIsRural] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const rawValue = parseFloat(propertyValueInput.replace(/,/g, '')) || 0;
  const rawPurchase = parseFloat(purchasePriceInput.replace(/,/g, '')) || 0;

  const result = calculatePropertyTax({
    propertyValue: rawValue,
    originalPurchasePrice: rawPurchase,
    jurisdiction,
    propertyType,
    buyerStatus,
    sellerStatus,
    holdingPeriodYears: holdingPeriod,
    isRural,
  });

  const valueFormatted = formatLakhCrore(rawValue);
  const buyerFormatted = formatLakhCrore(result.buyer.totalBuyerPayable);
  const sellerFormatted = formatLakhCrore(result.seller.totalSellerPayable);
  const totalRevenueFormatted = formatLakhCrore(result.totalGovernmentRevenue);

  const handlePresetSelect = (val: number) => {
    setPropertyValueInput(val.toString());
    setPurchasePriceInput(Math.round(val * 0.75).toString());
  };

  const shareText = `🏠 *Pakistan Property Transfer & Tax Breakdown (Finance Act 2024-2026)*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 *Jurisdiction:* ${jurisdiction.toUpperCase()} (${jurisdiction === 'punjab' ? 'e-Stamping' : 'Excise/Revenue'})\n` +
    `🏗️ *Property Type:* ${propertyType.replace('_', ' ').toUpperCase()}\n` +
    `💰 *Declared Valuation:* Rs. ${formatPakistaniNumber(rawValue)} (${valueFormatted.inWords})\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *BUYER EXPENSES (${buyerStatus.toUpperCase()}):*\n` +
    `  • FBR Sec 236K (${result.buyer.section236KRate}%): Rs. ${formatPakistaniNumber(result.buyer.section236KAmount)}\n` +
    `  • Stamp Duty (${result.buyer.stampDutyRate}%): Rs. ${formatPakistaniNumber(result.buyer.stampDutyAmount)}\n` +
    `  • TMA Transfer Fee (${result.buyer.tmaFeeRate}%): Rs. ${formatPakistaniNumber(result.buyer.tmaFeeAmount)}\n` +
    `  • Mutation / Reg Charges: Rs. ${formatPakistaniNumber(result.buyer.mutationRegistrationFee)}\n` +
    `  ➡️ *Total Buyer Payable:* Rs. ${formatPakistaniNumber(result.buyer.totalBuyerPayable)} (${result.buyer.effectiveBuyerPercentage}%)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *SELLER DEDUCTIONS (${sellerStatus.toUpperCase()}):*\n` +
    `  • FBR Sec 236C (${result.seller.section236CRate}%): Rs. ${formatPakistaniNumber(result.seller.section236CAmount)}\n` +
    `  • Capital Gains Tax CGT (${result.seller.cgtRate}%): Rs. ${formatPakistaniNumber(result.seller.cgtAmount)}\n` +
    `  ➡️ *Total Seller Deductions:* Rs. ${formatPakistaniNumber(result.seller.totalSellerPayable)} (${result.seller.effectiveSellerPercentage}%)\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏛️ *Total Govt Transfer Cost:* Rs. ${formatPakistaniNumber(result.totalGovernmentRevenue)} (${result.totalTransactionFrictionPct}%)\n` +
    (result.filerSavingsBuyer > 0 ? `💡 *Buyer Filer Savings:* Save Rs. ${formatPakistaniNumber(result.filerSavingsBuyer)} vs Non-Filer!\n` : '') +
    `\n🔗 *Calculated free via ApexTools Pakistan*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const faqs = [
    {
      q: 'What is FBR Section 236K advance tax on property purchase?',
      qUrdu: 'پراپرٹی خریدنے پر سیکشن 236K کیا ہے؟',
      a: 'Section 236K is the advance income tax collected from the purchaser/buyer at the time of property registration. Under the Finance Act 2024–2026, Active Taxpayers (Filers) pay 3%, Late-Filers pay 6%, and Non-Filers pay a punitive rate of 10.5% on the declared or FBR valuation table rate.',
    },
    {
      q: 'What is FBR Section 236C and how can sellers get exemption?',
      qUrdu: 'پراپرٹی فروخت کرنے پر سیکشن 236C اور اس پر چھوٹ کیسے ملتی ہے؟',
      a: 'Section 236C is advance income tax collected from the seller/transferor (3% for Filers and 10.5% for Non-Filers). Active Filers are 100% exempt from Section 236C if the property holding period exceeds 6 years for open plots, 4 years for constructed houses, or 2 years for residential flats.',
    },
    {
      q: 'How does Punjab e-Stamping work for property registration?',
      qUrdu: 'پنجاب ای اسٹیمپنگ سسٹم کیسے کام کرتا ہے؟',
      a: 'The Punjab e-Stamping system generates electronic 32-A Challan forms. Stamp Duty is 1% in urban municipal areas and 2% in rural areas. The challan can be paid directly at any National Bank of Pakistan (NBP) or Bank of Punjab (BOP) branch.',
    },
    {
      q: 'How is Capital Gains Tax (CGT) calculated under Section 37 in Pakistan?',
      qUrdu: 'پاکستان میں کیپیٹل گین ٹیکس (CGT) کا حساب کیسے ہوتا ہے؟',
      a: 'CGT is calculated solely on the profit/gain (Sale Value minus Original Purchase Cost). For Filers, it starts at 15% in Year 1 and reduces by 2.5% per year until it becomes 0% after 6 years of holding.',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/40 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>FBR Section 236K / 236C & Provincial e-Stamping 2024–2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pakistan Property Transfer & Stamp Duty Calculator
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Complete property transaction breakdown: FBR Advance Withholding Taxes (3% vs 10.5%), Provincial Stamp Duty, TMA Municipal Fees, Mutation charges, and Capital Gains Tax (CGT).
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <WhatsAppShareButton shareText={shareText} />
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-4 w-4" />}
            >
              Print Receipt
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Inputs */}
        <div className="lg:col-span-7 space-y-6">
          {/* Quick Presets */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Property Valuation Presets
              </label>
              <span className="text-xs text-slate-400">Click to set</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROPERTY_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handlePresetSelect(p.value)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    rawValue === p.value
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                      : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Property Value Input & Purchase Cost */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Transaction Valuation (PKR)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 mb-1 block">Current Declared / FBR Value (PKR)</span>
                <input
                  type="number"
                  step="100000"
                  value={propertyValueInput}
                  onChange={(e) => setPropertyValueInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="10000000"
                />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 block font-medium">
                  {valueFormatted.inWords} ({valueFormatted.inUrdu})
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 mb-1 block">Original Purchase Cost (for CGT)</span>
                <input
                  type="number"
                  step="100000"
                  value={purchasePriceInput}
                  onChange={(e) => setPurchasePriceInput(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="7500000"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Net Gain: Rs. {formatPakistaniNumber(result.seller.capitalGain)}
                </span>
              </div>
            </div>
          </div>

          {/* Jurisdiction & Property Type */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Jurisdiction & Property Classification
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'punjab', label: 'Punjab (e-Stamping)' },
                { id: 'sindh', label: 'Sindh (SRB/BOR)' },
                { id: 'islamabad', label: 'Islamabad (CDA)' },
                { id: 'kpk', label: 'KPK (Excise)' },
              ].map((j) => (
                <button
                  key={j.id}
                  type="button"
                  onClick={() => setJurisdiction(j.id as Jurisdiction)}
                  className={`p-2.5 text-xs rounded-xl border font-bold transition-all ${
                    jurisdiction === j.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {j.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
              {[
                { id: 'house', label: 'Built House / Villa' },
                { id: 'residential_plot', label: 'Residential Plot' },
                { id: 'commercial_plot', label: 'Commercial Plot' },
                { id: 'apartment', label: 'Flat / High-Rise' },
                { id: 'agricultural', label: 'Agricultural Land' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setPropertyType(t.id as PropertyType)}
                  className={`p-2.5 text-xs rounded-xl border font-semibold transition-all ${
                    propertyType === t.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Buyer & Seller Status Toggles */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              4. FBR Taxpayer Status (Buyer vs Seller)
            </label>

            {/* Buyer Status */}
            <div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Buyer / Purchaser Tax Status (Section 236K):
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'filer', label: 'Active Filer (3%)', color: 'emerald' },
                  { id: 'late_filer', label: 'Late Filer (6%)', color: 'amber' },
                  { id: 'non_filer', label: 'Non-Filer (10.5%)', color: 'rose' },
                ].map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBuyerStatus(b.id as FilerStatus)}
                    className={`py-2 px-3 text-xs rounded-xl border font-bold transition-all ${
                      buyerStatus === b.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller Status & Holding Period */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                Seller / Transferor Tax Status (Section 236C):
              </span>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {[
                  { id: 'filer', label: 'Active Filer (3% or Exempt)' },
                  { id: 'non_filer', label: 'Non-Filer (10.5%)' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSellerStatus(s.id as FilerStatus)}
                    className={`py-2 px-3 text-xs rounded-xl border font-bold transition-all ${
                      sellerStatus === s.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Holding Period Slider */}
              <div className="mt-3 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">Property Holding Period:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {holdingPeriod === 0 ? 'Less than 1 Year' : holdingPeriod >= 6 ? '6+ Years (Exempt CGT)' : `${holdingPeriod} to ${holdingPeriod + 1} Years`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={holdingPeriod}
                  onChange={(e) => setHoldingPeriod(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>&lt; 1 Year</span>
                  <span>2 Yrs</span>
                  <span>4 Yrs</span>
                  <span>6+ Yrs (0% CGT)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Calculations & e-Stamping Receipt */}
        <div className="lg:col-span-5 space-y-6">
          {/* Summary Box */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-white shadow-2xl relative overflow-hidden">
            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-200 flex items-center gap-1.5">
              <Receipt className="h-4 w-4" />
              Total Government Transaction Cost
            </span>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Rs. {formatPakistaniNumber(result.totalGovernmentRevenue)}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {totalRevenueFormatted.inWords} ({totalRevenueFormatted.inUrdu})
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-emerald-500/30 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-emerald-200/80 block">Buyer Share:</span>
                <span className="font-bold text-white text-sm">Rs. {formatPakistaniNumber(result.buyer.totalBuyerPayable)}</span>
                <span className="text-[10px] text-emerald-300 block">({result.buyer.effectiveBuyerPercentage}%)</span>
              </div>
              <div>
                <span className="text-emerald-200/80 block">Seller Share:</span>
                <span className="font-bold text-white text-sm">Rs. {formatPakistaniNumber(result.seller.totalSellerPayable)}</span>
                <span className="text-[10px] text-emerald-300 block">({result.seller.effectiveSellerPercentage}%)</span>
              </div>
            </div>

            {/* Filer Savings */}
            {result.filerSavingsBuyer > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-400/10 border border-emerald-300/20 text-xs text-emerald-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-300 shrink-0" />
                <span>Buyer saves <strong>Rs. {formatPakistaniNumber(result.filerSavingsBuyer)}</strong> as Active Filer!</span>
              </div>
            )}

            <div className="mt-6">
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              >
                {copied ? 'Receipt Copied!' : 'Copy Transfer Receipt'}
              </Button>
            </div>
          </div>

          {/* Detailed Itemized Receipt */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Official e-Stamping Itemized Receipt
            </h3>

            {/* Buyer Section */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-emerald-600 dark:text-emerald-400">A. Buyer / Purchaser Costs</span>
                <span>Rs. {formatPakistaniNumber(result.buyer.totalBuyerPayable)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2">
                <span>FBR Advance Tax (Sec 236K - {result.buyer.section236KRate}%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.buyer.section236KAmount)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2">
                <span>Provincial Stamp Duty ({result.buyer.stampDutyRate}%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.buyer.stampDutyAmount)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2">
                <span>TMA / Municipal Transfer Fee ({result.buyer.tmaFeeRate}%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.buyer.tmaFeeAmount)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2">
                <span>Mutation (Intiqal) & Processing Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.buyer.mutationRegistrationFee)}</span>
              </div>
            </div>

            {/* Seller Section */}
            <div className="space-y-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-teal-600 dark:text-teal-400">B. Seller / Transferor Deductions</span>
                <span>Rs. {formatPakistaniNumber(result.seller.totalSellerPayable)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2">
                <span>FBR Advance Tax (Sec 236C - {result.seller.section236CRate}%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.seller.section236CAmount)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400 pl-2">
                <span>Capital Gains Tax (CGT Sec 37 - {result.seller.cgtRate}%)</span>
                <span className="font-semibold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.seller.cgtAmount)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-500" />
          Frequently Asked Questions (Property Taxes in Pakistan 2024–2026)
        </h2>

        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="flex items-center justify-between w-full text-left font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <div>
                  <span>{faq.q}</span>
                  <span className="block text-xs font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">{faq.qUrdu}</span>
                </div>
                {activeFaq === idx ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>

              {activeFaq === idx && (
                <div className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line pl-2 border-l-2 border-emerald-500">
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
