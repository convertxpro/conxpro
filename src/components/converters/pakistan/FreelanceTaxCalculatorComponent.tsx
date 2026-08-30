'use client';

import React, { useState } from 'react';
import {
  calculateFreelanceTax,
  FREELANCE_CURRENCIES,
  ForeignCurrency,
  FreelancerTaxStatus,
  EarningsFrequency,
} from '@/lib/converters/pakistan/freelance-tax';
import { formatPakistaniNumber, formatLakhCrore } from '@/lib/converters/pakistan/formatters';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Button } from '@/components/ui/Button';
import {
  Laptop,
  Receipt,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Building,
  CreditCard,
  Zap,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

interface FreelanceTaxCalculatorComponentProps {
  tool?: ToolMetadata;
}

export const FreelanceTaxCalculatorComponent: React.FC<FreelanceTaxCalculatorComponentProps> = () => {
  const [earningsInput, setEarningsInput] = useState<string>('2500');
  const [currency, setCurrency] = useState<ForeignCurrency>('USD');
  const [frequency, setFrequency] = useState<EarningsFrequency>('monthly');
  const [status, setStatus] = useState<FreelancerTaxStatus>('pseb_filer');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const rawAmount = parseFloat(earningsInput.replace(/,/g, '')) || 0;
  const result = calculateFreelanceTax(rawAmount, currency, frequency, status);

  const grossMonthlyFormatted = formatLakhCrore(result.grossMonthlyPkr);
  const netMonthlyFormatted = formatLakhCrore(result.netMonthlyTakeHomePkr);
  const netAnnualFormatted = formatLakhCrore(result.netAnnualTakeHomePkr);

  const shareText = `💻 *Pakistan Freelancer IT Export Tax & Remittance Slip (Finance Act 2024-2026)*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *Foreign Earnings:* ${result.currencySymbol}${formatPakistaniNumber(result.grossMonthlyForeign)} / month\n` +
    `💵 *Gross Monthly PKR:* Rs. ${formatPakistaniNumber(result.grossMonthlyPkr)} (@ Rs. ${result.fxRate}/${result.foreignCurrency})\n` +
    `👤 *Tax Category:* ${status === 'pseb_filer' ? 'PSEB Registered Filer (0.25% Sec 154A 🟢)' : status === 'unregistered_filer' ? 'Unregistered Active Filer (1.0% Sec 154A)' : 'Non-Filer (Punitive Slabs 🔴)'}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📉 *Monthly Tax Withheld at Source:* Rs. ${formatPakistaniNumber(result.monthlyTaxPkr)} (${result.taxRatePct}%)\n` +
    `🏛️ *Annual Tax Liability:* Rs. ${formatPakistaniNumber(result.annualTaxPkr)}\n` +
    `💵 *Net Monthly Bank Take-Home:* Rs. ${formatPakistaniNumber(result.netMonthlyTakeHomePkr)} (${netMonthlyFormatted.inWords})\n` +
    `📈 *Net Annual Income:* Rs. ${formatPakistaniNumber(result.netAnnualTakeHomePkr)} (${netAnnualFormatted.inWords})\n` +
    (result.psebTaxSavingsAnnual > 0 ? `💡 *PSEB Registration Savings:* Saves Rs. ${formatPakistaniNumber(result.psebTaxSavingsAnnual)}/year vs standard rate!\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏆 *Top Recommended Channel:* ${result.recommendedChannel.channel.name} (Net: Rs. ${formatPakistaniNumber(result.recommendedChannel.netRealizedPkr)})\n` +
    `\n🔗 *Calculated free via ConvertHub Pakistan*`;

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
      q: 'What is the 0.25% PSEB tax rate under Section 154A?',
      qUrdu: 'سیکشن 154A کے تحت 0.25 فیصد پی ایس ای بی ٹیکس کیا ہے؟',
      a: 'Under Section 154A of the Income Tax Ordinance (Finance Act 2024–2026), export proceeds of IT and IT-enabled services (software, web dev, design, digital marketing, AI services) are subject to a final withholding tax of only 0.25%, provided the exporter is registered with Pakistan Software Export Board (PSEB) and the proceeds are received via banking channels with an electronic PRC (Proceeds Realization Certificate).',
    },
    {
      q: 'How can a freelancer register with PSEB to get the 0.25% rate?',
      qUrdu: 'فری لانسر 0.25 فیصد ٹیکس کے لیے پی ایس ای بی میں کیسے رجسٹر ہو؟',
      a: '1. Register online at pseb.org.pk under "Individual / Freelancer Registration".\n2. Submit your CNIC, active NTN on FBR Active Taxpayer List (ATL), and proof of freelance work (Upwork/Fiverr profile, bank statement).\n3. Pay the annual nominal registration fee (approx Rs. 2,000–5,000).\n4. Download your official PSEB Certificate and provide a copy to your Pakistani bank for Section 154A 0.25% tax deduction code.',
    },
    {
      q: 'What is a PRC (Proceeds Realization Certificate) and why is it mandatory?',
      qUrdu: 'پی آر سی (PRC) سرٹیفکیٹ کیا ہے اور یہ کیوں ضروری ہے؟',
      a: 'A PRC is an official certificate issued by your Pakistani receiving bank confirming foreign currency was brought into Pakistan as IT export remittances. You need your PRC numbers when filing annual FBR income tax returns (Form 114) under Section 154A Final Tax Regime.',
    },
    {
      q: 'Can freelancers keep 50% of their earnings in foreign currency in Pakistan?',
      qUrdu: 'کیا فری لانسرز ڈالر اکاؤنٹ میں 50 فیصد رقم رکھ سکتے ہیں؟',
      a: 'Yes! Under SBP regulations, IT freelancers and companies can retain up to 50% of their export proceeds in a dedicated Exporters Special Foreign Currency Account (ESFCA) in USD/EUR/GBP for international software subscriptions, server costs, and global payments without currency conversion losses.',
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
              <span>Section 154A IT Export 0.25% Final Tax & Remittance Comparator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Freelancer IT Export Tax & Remittance Calculator
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Calculate official Section 154A 0.25% PSEB tax vs 1.0% standard rate, and compare net take-home PKR across Direct Bank Wire (PRC), Payoneer, Wise, and freelance platforms.
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

      {/* Main Form & Calculation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Inputs & Status */}
        <div className="lg:col-span-7 space-y-6">
          {/* Earnings Amount & Currency */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                1. Foreign Export Earnings
              </label>
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                <button
                  type="button"
                  onClick={() => setFrequency('monthly')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    frequency === 'monthly' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('annual')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                    frequency === 'annual' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Annual
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 mb-1 block">Earnings Amount</span>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    {result.currencySymbol}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="100"
                    value={earningsInput}
                    onChange={(e) => setEarningsInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="2500"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 mb-1 block">Currency</span>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as ForeignCurrency)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {FREELANCE_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol}) - Rs. {c.pkrRate}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {['500', '1000', '2500', '5000', '10000'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setEarningsInput(preset)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    earningsInput === preset
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {result.currencySymbol}{preset} / mo
                </button>
              ))}
            </div>
          </div>

          {/* FBR & PSEB Status Toggle */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. FBR Taxpayer & PSEB Registration Status
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'pseb_filer',
                  label: 'PSEB Registered Filer',
                  tax: '0.25% Final Tax',
                  desc: 'Section 154A lowest final tax with official PSEB certificate & bank PRC.',
                  badge: 'Recommended',
                },
                {
                  id: 'unregistered_filer',
                  label: 'Unregistered Active Filer',
                  tax: '1.0% Final Tax',
                  desc: 'Active Filer on ATL but not registered with PSEB.',
                  badge: 'Standard',
                },
                {
                  id: 'non_filer',
                  label: 'Non-Filer Individual',
                  tax: 'Up to 35% Slabs',
                  desc: 'Subject to normal progressive individual income tax slabs.',
                  badge: 'High Tax',
                },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatus(s.id as FreelancerTaxStatus)}
                  className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    status === s.id
                      ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/30'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{s.label}</span>
                    </div>
                    <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{s.tax}</div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{s.desc}</p>
                  </div>
                  <span className="mt-3 text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 inline-block w-max">
                    {s.badge}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Remittance Channels Comparison Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                3. Remittance Channels Ranked by Net PKR
              </label>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Ranked Best to Worst
              </span>
            </div>

            <div className="space-y-3">
              {result.channels.map((ch, idx) => {
                const isTop = idx === 0;
                return (
                  <div
                    key={ch.channel.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isTop
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                        : 'border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {idx + 1}. {ch.channel.name}
                          </span>
                          {isTop && (
                            <span className="px-2 py-0.2 bg-emerald-500 text-white text-[9px] font-extrabold rounded-full">
                              Highest Payout 🏆
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {ch.channel.description} • Speed: {ch.channel.speed}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                          Rs. {formatPakistaniNumber(ch.netRealizedPkr)}
                        </div>
                        <span className="text-[10px] text-slate-500">
                          Fee + Tax Loss: {ch.effectiveLossPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Take-Home Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Net PKR Card */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-white shadow-2xl relative overflow-hidden">
            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-200 flex items-center gap-1.5">
              <Receipt className="h-4 w-4" />
              Net Monthly Take-Home in PKR
            </span>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Rs. {formatPakistaniNumber(result.netMonthlyTakeHomePkr)}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {netMonthlyFormatted.inWords} ({netMonthlyFormatted.inUrdu})
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-emerald-500/30 grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-emerald-200/80 block">Monthly Tax (Sec 154A):</span>
                <span className="font-bold text-white text-sm">Rs. {formatPakistaniNumber(result.monthlyTaxPkr)}</span>
                <span className="text-[10px] text-emerald-300 block">({result.taxRatePct}% final rate)</span>
              </div>
              <div>
                <span className="text-emerald-200/80 block">Annual Take-Home:</span>
                <span className="font-bold text-white text-sm">Rs. {formatPakistaniNumber(result.netAnnualTakeHomePkr)}</span>
                <span className="text-[10px] text-emerald-300 block">{netAnnualFormatted.inWords}</span>
              </div>
            </div>

            {result.psebTaxSavingsAnnual > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-400/10 border border-emerald-300/20 text-xs text-emerald-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-300 shrink-0" />
                <span>You save <strong>Rs. {formatPakistaniNumber(result.psebTaxSavingsAnnual)}/year</strong> with PSEB registration!</span>
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
                {copied ? 'Slip Copied!' : 'Copy Freelancer Tax Slip'}
              </Button>
            </div>
          </div>

          {/* Form 114 Filing Checklist */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              FBR Form 114 Return Filing Guide
            </h3>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                <span>File under <strong>Section 154A (Final Tax Regime)</strong> in FBR Iris portal.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                <span>Collect all bank <strong>Proceeds Realization Certificates (PRCs)</strong> for foreign remittances.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">3.</span>
                <span>Attach your active <strong>PSEB Registration Certificate</strong> to lock in the 0.25% rate.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">4.</span>
                <span>Reconcile bank account credits with your annual foreign remittance totals.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-500" />
          Frequently Asked Questions (Freelance IT Export Tax 2024–2026)
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
