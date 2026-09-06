'use client';

import React, { useState } from 'react';
import {
  calculateVehicleTax,
  ENGINE_SLABS,
  VehicleProvince,
  VehicleCategory,
  EngineDisplacement,
  CalculationType,
  VehicleFilerStatus,
} from '@/lib/converters/pakistan/vehicle-tax';
import { formatPakistaniNumber, formatLakhCrore } from '@/lib/converters/pakistan/formatters';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Button } from '@/components/ui/Button';
import {
  Car,
  Receipt,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Zap,
  ExternalLink,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

interface VehicleTaxCalculatorComponentProps {
  tool?: ToolMetadata;
}

export const VehicleTaxCalculatorComponent: React.FC<VehicleTaxCalculatorComponentProps> = () => {
  const [province, setProvince] = useState<VehicleProvince>('punjab');
  const [vehicleCategory, setVehicleCategory] = useState<VehicleCategory>('car');
  const [engineDisplacement, setEngineDisplacement] = useState<EngineDisplacement>('1001_1300');
  const [calculationType, setCalculationType] = useState<CalculationType>('annual_token');
  const [filerStatus, setFilerStatus] = useState<VehicleFilerStatus>('filer');
  const [invoicePrice, setInvoicePrice] = useState<string>('4500000');
  const [isLatePayment, setIsLatePayment] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const rawInvoice = parseFloat(invoicePrice.replace(/,/g, '')) || 4500000;

  const result = calculateVehicleTax({
    province,
    vehicleCategory,
    engineDisplacement,
    calculationType,
    filerStatus,
    vehicleInvoicePrice: rawInvoice,
    isLatePayment,
  });

  const totalFormatted = formatLakhCrore(result.totalPayable);

  const handleSlabSelect = (slabId: EngineDisplacement, defaultPrice: number) => {
    setEngineDisplacement(slabId);
    setInvoicePrice(defaultPrice.toString());
  };

  const shareText = `🚗 *Pakistan Vehicle Token Tax & Registration Slip (Finance Act 2024-2026)*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📍 *Excise Department:* ${province.toUpperCase()} (${province === 'punjab' ? 'e-Pay Punjab / MTMIS' : 'Excise Portal'})\n` +
    `🚙 *Vehicle Category:* ${vehicleCategory.toUpperCase()} • ${ENGINE_SLABS.find(s => s.id === engineDisplacement)?.label}\n` +
    `⚙️ *Operation:* ${calculationType === 'annual_token' ? 'Annual Token Tax Renewal' : calculationType === 'new_registration' ? 'New Vehicle Registration' : 'Transfer of Ownership'}\n` +
    `👤 *Taxpayer Status:* ${filerStatus === 'filer' ? 'Active Taxpayer (Filer 🟢)' : 'Non-Filer (Punitive Advance Tax 🔴)'}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    (result.motorVehicleTax > 0 ? `🏛️ *Motor Vehicle Tax (MVT):* Rs. ${formatPakistaniNumber(result.motorVehicleTax)}\n` : '') +
    (result.advanceIncomeTax > 0 ? `💼 *Advance Income Tax (Sec 231B/234):* Rs. ${formatPakistaniNumber(result.advanceIncomeTax)}\n` : '') +
    (result.registrationFee > 0 ? `📋 *Registration Fee:* Rs. ${formatPakistaniNumber(result.registrationFee)}\n` : '') +
    (result.smartCardPlateFee > 0 ? `💳 *Smart Card & Number Plates:* Rs. ${formatPakistaniNumber(result.smartCardPlateFee)}\n` : '') +
    (result.transferDuty > 0 ? `🔄 *Transfer Fee:* Rs. ${formatPakistaniNumber(result.transferDuty)}\n` : '') +
    (result.professionalTax > 0 ? `🏷️ *Professional Tax:* Rs. ${formatPakistaniNumber(result.professionalTax)}\n` : '') +
    (result.latePenalty > 0 ? `⚠️ *Late Penalty:* Rs. ${formatPakistaniNumber(result.latePenalty)}\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 *TOTAL PAYABLE AMOUNT:* Rs. ${formatPakistaniNumber(result.totalPayable)} (${totalFormatted.inWords})\n` +
    (result.filerSavings > 0 ? `💡 *Filer Savings:* Save Rs. ${formatPakistaniNumber(result.filerSavings)} vs Non-Filer!\n` : '') +
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
      q: 'Why are cars under 1000cc exempt from annual token tax renewal in Punjab?',
      qUrdu: 'پنجاب میں 1000 سی سی سے کم گاڑیوں کا سالانہ ٹوکن ٹیکس کیوں نہیں ہوتا؟',
      a: 'Vehicles with engine capacity up to 1000cc (e.g. Suzuki Alto 660cc, Cultus, WagonR) pay a one-time Lifetime Token Tax during initial registration. Therefore, they do not require annual token tax payment stickers unless ownership is transferred.',
    },
    {
      q: 'How does Filer vs Non-Filer status affect vehicle registration (Section 231B)?',
      qUrdu: 'گاڑی کی رجسٹریشن پر فائلر اور نان فائلر میں کیا فرق ہے؟',
      a: 'Under Section 231B of the Income Tax Ordinance (Finance Act 2024–2026), Non-Filers are charged 3x higher Advance Withholding Tax upon new vehicle purchase and registration compared to Active Filers (e.g. Rs. 150,000 for Filer vs Rs. 450,000 for Non-Filer on a 1800cc/2000cc vehicle).',
    },
    {
      q: 'How can I pay my vehicle token tax online via e-Pay Punjab or Sindh?',
      qUrdu: 'گاڑی کا ٹوکن ٹیکس آن لائن ای پے کے ذریعے کیسے جمع کروائیں؟',
      a: '1. Download the ePay Punjab / Sindh Excise mobile app or open your online banking portal.\n2. Select "Excise & Taxation" -> Token Tax.\n3. Enter your vehicle registration number (e.g. LEA-24-1234).\n4. The system will generate a 1-Link PSID challan.\n5. Pay via any banking app, ATM, or Easypaisa/JazzCash.',
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
              <span>Provincial Excise Schedules & Section 231B/234 FBR 2024–2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Vehicle Token Tax & Registration Calculator
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Estimate annual token tax renewal, initial registration fees, smart card charges, and transfer duties across Punjab, Sindh, Islamabad, and KPK.
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Operation & Province Selector */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              1. Calculation Type & Province
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'annual_token', label: 'Annual Token Renewal' },
                { id: 'new_registration', label: 'New Registration' },
                { id: 'transfer_ownership', label: 'Transfer Ownership' },
              ].map((op) => (
                <button
                  key={op.id}
                  type="button"
                  onClick={() => setCalculationType(op.id as CalculationType)}
                  className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${
                    calculationType === op.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {[
                { id: 'punjab', label: 'Punjab (e-Pay)' },
                { id: 'sindh', label: 'Sindh Excise' },
                { id: 'islamabad', label: 'Islamabad (ICT)' },
                { id: 'kpk', label: 'KPK Excise' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setProvince(p.id as VehicleProvince)}
                  className={`p-2 text-xs font-semibold rounded-xl border transition-all ${
                    province === p.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Category & Engine CC Slabs */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              2. Vehicle Category & Engine Displacement
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'car', label: '🚗 Car / Sedan', icon: Car },
                { id: 'suv', label: '🚙 SUV / 4x4', icon: Car },
                { id: 'ev', label: '⚡ Electric (EV)', icon: Zap },
                { id: 'motorcycle', label: '🏍️ Bike', icon: Car },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setVehicleCategory(cat.id as VehicleCategory)}
                  className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${
                    vehicleCategory === cat.id
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Engine Slabs Grid */}
            {vehicleCategory !== 'motorcycle' && vehicleCategory !== 'ev' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {ENGINE_SLABS.map((slab) => (
                  <button
                    key={slab.id}
                    type="button"
                    onClick={() => handleSlabSelect(slab.id as EngineDisplacement, slab.defaultPrice)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      engineDisplacement === slab.id
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20'
                        : 'border-slate-200/80 bg-slate-50/50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/40'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{slab.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{slab.desc}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filer Status & Invoice Value */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              3. Taxpayer Status (Filer vs Non-Filer)
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFilerStatus('filer')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  filerStatus === 'filer'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">Active Taxpayer (Filer 🟢)</div>
                <p className="text-[11px] text-slate-500 mt-1">Lowest Advance Income Tax (Section 231B/234).</p>
              </button>

              <button
                type="button"
                onClick={() => setFilerStatus('non_filer')}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  filerStatus === 'non_filer'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/30'
                }`}
              >
                <div className="font-bold text-xs text-slate-900 dark:text-white">Non-Filer (Punitive 🔴)</div>
                <p className="text-[11px] text-slate-500 mt-1">3x higher advance withholding tax on registration.</p>
              </button>
            </div>

            {/* Invoice Input if New Registration */}
            {calculationType === 'new_registration' && (
              <div className="pt-2">
                <span className="text-xs text-slate-500 mb-1 block">Vehicle Invoice / Showroom Price (PKR)</span>
                <input
                  type="number"
                  step="100000"
                  value={invoicePrice}
                  onChange={(e) => setInvoicePrice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="4500000"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Payable Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Total Card */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-white shadow-2xl relative overflow-hidden">
            <span className="text-xs uppercase tracking-widest font-extrabold text-emerald-200 flex items-center gap-1.5">
              <Receipt className="h-4 w-4" />
              Total Excise & Tax Payable
            </span>

            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                Rs. {formatPakistaniNumber(result.totalPayable)}
              </div>
              <p className="text-xs text-emerald-200 mt-1">
                {totalFormatted.inWords} ({totalFormatted.inUrdu})
              </p>
            </div>

            {result.filerSavings > 0 && (
              <div className="mt-5 p-3 rounded-xl bg-emerald-400/10 border border-emerald-300/20 text-xs text-emerald-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-300 shrink-0" />
                <span>You save <strong>Rs. {formatPakistaniNumber(result.filerSavings)}</strong> by being an Active Filer!</span>
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
                {copied ? 'Slip Copied!' : 'Copy Vehicle Tax Slip'}
              </Button>
            </div>
          </div>

          {/* Itemized Line Items */}
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
              Itemized Excise Charges
            </h3>

            <div className="space-y-2.5 text-xs">
              {result.motorVehicleTax > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Motor Vehicle Tax (MVT)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.motorVehicleTax)}</span>
                </div>
              )}

              {result.advanceIncomeTax > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Advance Income Tax (Sec 231B/234)</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.advanceIncomeTax)}</span>
                </div>
              )}

              {result.registrationFee > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Registration Fee</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.registrationFee)}</span>
                </div>
              )}

              {result.smartCardPlateFee > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Smart Card & Plate Charges</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.smartCardPlateFee)}</span>
                </div>
              )}

              {result.transferDuty > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Transfer of Ownership Fee</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.transferDuty)}</span>
                </div>
              )}

              {result.professionalTax > 0 && (
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Professional Tax</span>
                  <span className="font-bold text-slate-900 dark:text-white">Rs. {formatPakistaniNumber(result.professionalTax)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                <span>Total Amount Payable</span>
                <span>Rs. {formatPakistaniNumber(result.totalPayable)}</span>
              </div>
            </div>

            {/* Notes */}
            {result.notes.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-500 space-y-1">
                {result.notes.map((n, i) => (
                  <p key={i}>• {n}</p>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-500" />
          Frequently Asked Questions (Vehicle Taxes in Pakistan 2024–2026)
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
