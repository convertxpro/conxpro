'use client';

import React, { useState } from 'react';
import {
  calculatePtaTax,
  DEVICE_PRESETS,
  DEFAULT_USD_PKR_RATE,
  RegistrationMode,
  DevicePreset,
} from '@/lib/converters/pakistan/pta-tax';
import { formatPakistaniNumber, formatLakhCrore } from '@/lib/converters/pakistan/formatters';
import { PakistaniMetricCard } from '@/components/converters/common';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Smartphone,
  ShieldCheck,
  Receipt,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Percent,
  Sparkles,
  Printer,
  Copy,
  Check,
  Info,
  DollarSign,
  Building2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

interface PtaTaxCalculatorComponentProps {
  tool?: ToolMetadata;
}

export const PtaTaxCalculatorComponent: React.FC<PtaTaxCalculatorComponentProps> = () => {
  const [mode, setMode] = useState<RegistrationMode>('passport');
  const [usdInput, setUsdInput] = useState<string>('1199');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('iphone-16-pro-max');
  const [exchangeRate, setExchangeRate] = useState<string>(DEFAULT_USD_PKR_RATE.toString());
  const [showAdvancedRates, setShowAdvancedRates] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const rawUsd = parseFloat(usdInput) || 0;
  const rawRate = parseFloat(exchangeRate) || DEFAULT_USD_PKR_RATE;

  const result = calculatePtaTax(rawUsd, mode, rawRate);
  const totalFormatted = formatLakhCrore(result.totalTax);
  const deviceTotalFormatted = formatLakhCrore(result.totalPhoneCostPkr);

  const handlePresetSelect = (preset: DevicePreset) => {
    setSelectedPresetId(preset.id);
    setUsdInput(preset.usdPrice.toString());
  };

  const handleCustomUsdChange = (val: string) => {
    setUsdInput(val);
    setSelectedPresetId('');
  };

  const shareText = `📱 *PTA Mobile DIRBS Tax Calculation (Tax Year 2024-2026)*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📌 *Device:* ${selectedPresetId ? DEVICE_PRESETS.find(p => p.id === selectedPresetId)?.name : `$${rawUsd} Custom Device`}\n` +
    `🛂 *Registration Mode:* ${mode === 'passport' ? 'Passport (Overseas Traveler ✈️)' : 'CNIC (Local Purchase/Import 🇵🇰)'}\n` +
    `💵 *C&F Device Value:* $${result.usdValue} (Rs. ${formatPakistaniNumber(result.cnfPkrValue)})\n` +
    `📊 *Tax Slab:* Slab ${result.slabNumber} (${result.slabRange})\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏛️ *Customs Duty:* Rs. ${formatPakistaniNumber(result.customsDuty)}\n` +
    `🛡️ *Regulatory Duty (RD):* Rs. ${formatPakistaniNumber(result.regulatoryDuty)}\n` +
    `📈 *Sales Tax:* Rs. ${formatPakistaniNumber(result.salesTax)}\n` +
    `💼 *Advance Income Tax (WHT):* Rs. ${formatPakistaniNumber(result.withholdingTax)}\n` +
    `🏷️ *Mobile Phone Levy:* Rs. ${formatPakistaniNumber(result.mobileLevy)}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *TOTAL PTA PSID AMOUNT:* Rs. ${formatPakistaniNumber(result.totalTax)} (${totalFormatted.inWords})\n` +
    `🏷️ *Total Phone Landed Cost:* Rs. ${formatPakistaniNumber(result.totalPhoneCostPkr)}\n` +
    (result.passportSavings > 0 ? `💡 *Passport Savings:* Save Rs. ${formatPakistaniNumber(result.passportSavings)} vs CNIC!\n` : '') +
    `\n🔗 *Calculated free via ConvertHub Pakistan*`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const faqs = [
    {
      q: 'What is the difference between Passport and CNIC PTA registration?',
      qUrdu: 'پاسپورٹ اور شناختی کارڈ رجسٹریشن میں کیا فرق ہے؟',
      a: 'Registering on a foreign passport (with recent travel within 60 days) provides lower customs duty and reduced sales tax slabs compared to CNIC registration, saving between Rs. 15,000 and Rs. 35,000 on flagship smartphones like iPhone 16 Pro Max and Samsung S24 Ultra.',
    },
    {
      q: 'How do I generate official PTA PSID on DIRBS portal?',
      qUrdu: 'پی ٹی اے ڈی آئی آر بی ایس پر پی ایس آئی ڈی کیسے بنائیں؟',
      a: '1. Visit dirbs.pta.gov.pk or dial *8484# from any phone in Pakistan.\n2. Select "Individual COC" -> Apply for COC.\n3. Enter Passport or CNIC number and both IMEI numbers (dial *#06# to get IMEI).\n4. A 17-digit PSID code will be generated via SMS.\n5. Pay via 1Link, ATM, Mobile Banking App, Easypaisa, JazzCash or Bank Branch.',
    },
    {
      q: 'How long do I have before an unregistered mobile is blocked in Pakistan?',
      qUrdu: 'غیر تصدیق شدہ فون کتنے دن بعد بند ہو جاتا ہے؟',
      a: 'All imported devices receive 60 days of free cellular usage with local Pakistani SIM cards upon arrival. After 60 days, cellular networks are suspended until the official PTA DIRBS PSID tax is cleared.',
    },
    {
      q: 'Can I pay the PTA tax in installments?',
      qUrdu: 'کیا پی ٹی اے ٹیکس اقساط میں ادا ہو سکتا ہے؟',
      a: 'Yes! Several Pakistani banks (Silkbank, MCB, Bank Alfalah) and fintech apps (KTrade, Alfa) offer credit card installment plans (0% markup for 3 to 6 months) for PTA mobile registration taxes.',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/40 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PTA DIRBS Customs SRO & Finance Act 2024–2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              PTA Mobile Phone Tax & Duty Calculator
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Calculate official Pakistan Telecommunication Authority (DIRBS) customs duty, regulatory duty, sales tax, and total PSID payable amount for iPhone, Samsung, and imported devices.
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
              Print Slip
            </Button>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Controls & Presets */}
        <div className="lg:col-span-7 space-y-6">
          {/* Registration Mode Selector */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              1. Select Registration Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('passport')}
                className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                  mode === 'passport'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    ✈️ Passport Registration
                  </span>
                  {mode === 'passport' && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  For overseas travelers with travel history within 60 days. Reduced customs rates.
                </p>
                <span className="mt-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
                  Save up to Rs. 24,000+
                </span>
              </button>

              <button
                type="button"
                onClick={() => setMode('cnic')}
                className={`relative flex flex-col items-start p-4 rounded-2xl border transition-all text-left ${
                  mode === 'cnic'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    🇵🇰 CNIC Registration
                  </span>
                  {mode === 'cnic' && (
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  For local Pakistani citizens, commercial imports, or without recent foreign travel.
                </p>
                <span className="mt-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                  Standard Commercial Slabs
                </span>
              </button>
            </div>
          </div>

          {/* Quick Preset Devices */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                2. Popular Device Presets
              </label>
              <span className="text-xs text-slate-400">Click to calculate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {DEVICE_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold ring-2 ring-emerald-500/20'
                        : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900/40 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {preset.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between w-full text-[11px] text-slate-500 dark:text-slate-400">
                      <span>${preset.usdPrice}</span>
                      {preset.badge && (
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-bold">
                          {preset.badge}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom USD Value & Exchange Rate */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Custom C&F Phone Valuation (USD)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-slate-500 mb-1 block">Device Price (USD $)</span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={usdInput}
                    onChange={(e) => handleCustomUsdChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="1199"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 mb-1 block">Assessed Value in PKR</span>
                <div className="w-full px-4 py-2.5 rounded-xl border border-slate-200/70 bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/60 text-slate-900 dark:text-white font-bold">
                  Rs. {formatPakistaniNumber(result.cnfPkrValue)}
                </div>
              </div>
            </div>

            {/* Advanced FX Rate Toggle */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowAdvancedRates(!showAdvancedRates)}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
              >
                {showAdvancedRates ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showAdvancedRates ? 'Hide Exchange Rate Settings' : 'Customize USD/PKR Exchange Rate (Default: 278.50)'}
              </button>

              {showAdvancedRates && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 dark:bg-slate-800/50 dark:border-slate-700/60">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Interbank Customs USD Exchange Rate:
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      step="0.1"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="w-40 px-3 py-1.5 rounded-lg border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-700 text-sm font-semibold"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExchangeRate(DEFAULT_USD_PKR_RATE.toString())}
                    >
                      Reset Default
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Tax Breakdown & PSID Slip */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Grand Total Card */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 -mr-8 -mt-8 h-40 w-40 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-200 flex items-center gap-1.5">
                <Receipt className="h-4 w-4" />
                Total PTA PSID Payable
              </span>
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-100">
                Slab {result.slabNumber}
              </span>
            </div>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Rs. {formatPakistaniNumber(result.totalTax)}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {totalFormatted.inWords} ({totalFormatted.inUrdu})
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-emerald-500/30 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-emerald-200/80 block">Total Landed Price:</span>
                <span className="font-bold text-white text-sm">Rs. {formatPakistaniNumber(result.totalPhoneCostPkr)}</span>
              </div>
              <div>
                <span className="text-emerald-200/80 block">Tax Ratio:</span>
                <span className="font-bold text-emerald-300 text-sm">{result.taxPercentageOfDevice}% of value</span>
              </div>
            </div>

            {/* Passport Saving Callout */}
            {mode === 'passport' && result.passportSavings > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-400/10 border border-emerald-300/20 flex items-center gap-2 text-xs text-emerald-100">
                <Sparkles className="h-4 w-4 text-emerald-300 shrink-0" />
                <span>You are saving <strong>Rs. {formatPakistaniNumber(result.passportSavings)}</strong> by registering on Passport!</span>
              </div>
            )}

            <div className="mt-6 flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold"
                onClick={handleCopySummary}
                leftIcon={copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              >
                {copied ? 'Summary Copied!' : 'Copy PSID Summary'}
              </Button>
            </div>
          </div>

          {/* Itemized Line Items Breakdown */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Itemized FBR & Customs Breakdown
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Customs Duty</span>
                <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.customsDuty)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Regulatory Duty (RD)</span>
                <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.regulatoryDuty)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Sales Tax</span>
                <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.salesTax)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Advance Income Tax (WHT)</span>
                <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.withholdingTax)}</span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-600 dark:text-slate-400">Mobile Phone Levy</span>
                <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.mobileLevy)}</span>
              </div>

              <div className="flex items-center justify-between pt-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                <span>Total Payable PSID</span>
                <span>Rs. {formatPakistaniNumber(result.totalTax)}</span>
              </div>
            </div>
          </div>

          {/* Step-by-Step PSID Guide */}
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Zap className="h-4 w-4 text-emerald-500" />
              How to Pay & Generate PSID
            </div>
            <ol className="space-y-2 text-xs text-slate-600 dark:text-slate-400 list-decimal pl-4">
              <li>Visit <strong>dirbs.pta.gov.pk</strong> or dial <strong>*8484#</strong> on your phone.</li>
              <li>Select <em>Individual COC</em> and input your Passport/CNIC and device IMEI.</li>
              <li>A 17-digit <strong>PSID</strong> number will be issued.</li>
              <li>Open your Banking app or Easypaisa/JazzCash -&gt; 1Bill / PSID Payment.</li>
              <li>Your device will be officially PTA approved within 15 minutes of payment.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-500" />
          Frequently Asked Questions (PTA & DIRBS 2024–2026)
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
