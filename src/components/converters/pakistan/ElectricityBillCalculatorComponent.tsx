'use client';

import React, { useState, useId } from 'react';
import {
  calculateElectricityBill,
  DiscoCompany,
  DISCO_COMPANIES,
  PROTECTED_SLABS,
  UNPROTECTED_SLABS,
  TOU_RATES,
} from '@/lib/converters/pakistan/electricity-bill';
import { formatPakistaniNumber, formatLakhCrore } from '@/lib/converters/pakistan/formatters';
import { PakistaniMetricCard, PrivacyAssuranceBadge } from '@/components/converters/common';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  Zap,
  Sun,
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
  Clock,
  BatteryCharging,
  Info,
  DollarSign,
} from 'lucide-react';

const PRESET_UNITS_DOMESTIC = [
  { label: '50 Units', value: 50, desc: 'Life-Line' },
  { label: '100 Units', value: 100, desc: 'Subsidized' },
  { label: '195 Units', value: 195, desc: 'Protected Cap' },
  { label: '300 Units', value: 300, desc: 'Middle Class' },
  { label: '550 Units', value: 550, desc: 'Summer 1 AC' },
  { label: '900 Units', value: 900, desc: '2+ AC Usage' },
];

const SOLAR_SYSTEM_PRESETS = [
  { label: '3 kW System', kw: 3, estMonthlyUnits: 360 },
  { label: '5 kW System', kw: 5, estMonthlyUnits: 600 },
  { label: '7 kW System', kw: 7, estMonthlyUnits: 840 },
  { label: '10 kW System', kw: 10, estMonthlyUnits: 1200 },
  { label: '15 kW System', kw: 15, estMonthlyUnits: 1800 },
];

export const ElectricityBillCalculatorComponent: React.FC = () => {
  const [company, setCompany] = useState<DiscoCompany>('LESCO');
  const [connectionType, setConnectionType] = useState<'single_phase' | 'three_phase'>('single_phase');
  const [isProtected, setIsProtected] = useState<boolean>(false);
  const [unitsInput, setUnitsInput] = useState<string>('350');
  const [peakUnitsInput, setPeakUnitsInput] = useState<string>('120');
  const [offPeakUnitsInput, setOffPeakUnitsInput] = useState<string>('450');
  const [fpaRateInput, setFpaRateInput] = useState<string>('3.50');
  const [isNonFiler, setIsNonFiler] = useState<boolean>(false);

  // Solar Net-Metering States
  const [isSolarNetMetering, setIsSolarNetMetering] = useState<boolean>(false);
  const [solarExportUnitsInput, setSolarExportUnitsInput] = useState<string>('400');
  const [solarExportPeakUnitsInput, setSolarExportPeakUnitsInput] = useState<string>('50');
  const [solarExportOffPeakUnitsInput, setSolarExportOffPeakUnitsInput] = useState<string>('350');

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const unitsVal = parseFloat(unitsInput.replace(/,/g, '')) || 0;
  const peakUnitsVal = parseFloat(peakUnitsInput.replace(/,/g, '')) || 0;
  const offPeakUnitsVal = parseFloat(offPeakUnitsInput.replace(/,/g, '')) || 0;
  const fpaRateVal = parseFloat(fpaRateInput.replace(/,/g, '')) || 0;
  const solarExportVal = parseFloat(solarExportUnitsInput.replace(/,/g, '')) || 0;
  const solarExpPeakVal = parseFloat(solarExportPeakUnitsInput.replace(/,/g, '')) || 0;
  const solarExpOffPeakVal = parseFloat(solarExportOffPeakUnitsInput.replace(/,/g, '')) || 0;

  const result = calculateElectricityBill({
    company,
    connectionType,
    isProtected: connectionType === 'three_phase' ? false : isProtected,
    unitsConsumed: unitsVal,
    peakUnitsConsumed: peakUnitsVal,
    offPeakUnitsConsumed: offPeakUnitsVal,
    fuelPriceAdjustmentPerUnit: fpaRateVal,
    isSolarNetMetering,
    solarExportedUnits: solarExportVal,
    solarExportPeakUnits: solarExpPeakVal,
    solarExportOffPeakUnits: solarExpOffPeakVal,
    isNonFiler,
  });

  const totalBillFormatted = formatLakhCrore(result.totalEstimatedBillPkr);
  const baseCostFormatted = formatLakhCrore(result.baseElectricityCost);
  const solarSavingsFormatted = result.solarSavingsPkr ? formatLakhCrore(result.solarSavingsPkr) : null;

  // Percentage distribution for visual bar
  const totalForBar = Math.max(1, result.totalEstimatedBillPkr + (result.surplusExportCreditsPkr || 0));
  const basePct = Math.min(100, Math.round((result.baseElectricityCost / totalForBar) * 100));
  const fpaPct = Math.min(100, Math.round((result.fpaAmount / totalForBar) * 100));
  const fcPct = Math.min(100, Math.round((result.fcSurchargeAmount / totalForBar) * 100));
  const taxesPct = Math.max(0, 100 - (basePct + fpaPct + fcPct));

  // WhatsApp share template
  const shareSlip =
    `⚡ *${company} Electricity Bill Estimate (WAPDA / NEPRA)*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🏢 *DISCO Provider:* ${result.companyInfo.fullName} (${result.companyInfo.headquarters})\n` +
    `🔌 *Connection:* ${connectionType === 'three_phase' ? 'Three-Phase ToU' : `Single-Phase Domestic (${isProtected ? 'Protected' : 'Unprotected'})`}\n` +
    `🔢 *Gross Consumption:* ${connectionType === 'three_phase' ? `${peakUnitsVal + offPeakUnitsVal} Units (${peakUnitsVal} Peak / ${offPeakUnitsVal} Off-Peak)` : `${unitsVal} Units`}\n` +
    (isSolarNetMetering ? `☀️ *Solar Exported to Grid:* ${solarExportVal} Units\n` : '') +
    (isSolarNetMetering ? `🔋 *Net Units Billed:* ${result.netUnitsBilled} Units\n` : '') +
    `💵 *Total Estimated Bill:* Rs. ${formatPakistaniNumber(result.totalEstimatedBillPkr)} (${totalBillFormatted.inWords})\n` +
    `📊 *Effective Cost Per Unit:* Rs. ${result.effectiveCostPerUnit} / kWh\n` +
    `🏷️ *Applied Tariff Slab:* ${result.tariffSlabApplied}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📝 *Cost Breakdown:*\n` +
    `• Base Energy Charges: Rs. ${formatPakistaniNumber(result.baseElectricityCost)}\n` +
    `• Fuel Price Adjustment (FPA): Rs. ${formatPakistaniNumber(result.fpaAmount)}\n` +
    `• Financing Cost (FC) Surcharge: Rs. ${formatPakistaniNumber(result.fcSurchargeAmount)}\n` +
    `• Electricity Duty (1.5%): Rs. ${formatPakistaniNumber(result.electricityDutyAmount)}\n` +
    `• General Sales Tax (18% GST): Rs. ${formatPakistaniNumber(result.generalSalesTaxAmount)}\n` +
    `• PTV Fee: Rs. 35\n` +
    (result.incomeTaxAmount > 0 ? `• Advance Income Tax (7.5%): Rs. ${formatPakistaniNumber(result.incomeTaxAmount)}\n` : '') +
    (result.surplusExportCreditsPkr > 0 ? `• Solar Surplus Buyback Credit: -Rs. ${formatPakistaniNumber(result.surplusExportCreditsPkr)}\n` : '') +
    (result.solarSavingsPkr ? `💰 *Estimated Solar Monthly Savings:* Rs. ${formatPakistaniNumber(result.solarSavingsPkr)}\n` : '') +
    `\n🔗 *Calculated free via ConvertHub Pakistan*`;

  const handlePrint = () => {
    window.print();
  };

  const faqs = [
    {
      q: 'What is the exact criteria for a Protected Consumer on LESCO, IESCO, and K-Electric?',
      qUrdu: 'بجلی کے بل میں پروٹیکٹڈ (محفوظ) صارف بننے کی کیا شرائط ہیں؟',
      a: 'A residential consumer is classified as "Protected" if their electricity consumption has remained 200 units or less per month for the last 6 consecutive billing cycles. Even a single month exceeding 200 units instantly pushes you into the Unprotected tier for the next 6 months, almost doubling the per-unit cost.',
    },
    {
      q: 'How is Fuel Price Adjustment (FPA) calculated on Pakistani electricity bills?',
      qUrdu: 'بجلی کے بل میں فیول پرائس ایڈجسٹمنٹ (FPA) کا حساب کیسے ہوتا ہے؟',
      a: 'NEPRA determines FPA on a monthly basis based on the actual cost of generation fuels (coal, RLNG, furnace oil, hydro) compared to the reference tariff. The approved FPA rate (e.g. Rs. 3.50/unit) is multiplied directly by your total billed units in that month.',
    },
    {
      q: 'How does Solar Net-Metering bi-directional credit billing work with WAPDA DISCOs?',
      qUrdu: 'واپڈا اور ڈسکوز کے ساتھ سولر نیٹ میٹرنگ کا حساب کیسے کیا جاتا ہے؟',
      a: 'Your three-phase green bi-directional meter records imported units (consumed from grid) and exported units (sent from solar panels). At the end of the month, exported units offset imported units. Any surplus units left over are credited at NEPRA buyback rates (~Rs. 24.50/unit) or rolled over to the next billing cycle.',
    },
    {
      q: 'What is the Advance Income Tax under Section 235 on electricity bills?',
      qUrdu: 'کیا نان فائلرز پر بجلی کے بل پر انکم ٹیکس لاگو ہوتا ہے؟',
      a: 'Under Section 235 of the Income Tax Ordinance, if a domestic electricity bill exceeds Rs. 25,000 in a month and the consumer CNIC/meter is registered as a Non-Filer with FBR, an advance withholding income tax of 7.5% is levied on the entire bill amount.',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Privacy Banner */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="🔒 100% Client-Side Utility Computation • NEPRA 2024-2025 Tariff Schedules"
      />

      {/* 2. Main Configuration Panel */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                WAPDA / DISCOs Electricity Bill & Solar Net-Metering Estimator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official NEPRA Domestic Slabs, FPA, Taxes, and Green Solar ROI Calculator
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
          {/* DISCO Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Select DISCO / Electricity Provider
            </label>
            <select
              value={company}
              onChange={(e) => setCompany(e.target.value as DiscoCompany)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {Object.keys(DISCO_COMPANIES).map((key) => {
                const info = DISCO_COMPANIES[key as DiscoCompany];
                return (
                  <option key={key} value={key}>
                    {info.name} — {info.fullName} ({info.headquarters})
                  </option>
                );
              })}
            </select>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Coverage: {result.companyInfo.coverageAreas.slice(0, 4).join(', ')}
            </p>
          </div>

          {/* Connection Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Connection Type
            </label>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setConnectionType('single_phase')}
                className={`rounded-lg py-2 text-xs font-bold transition ${
                  connectionType === 'single_phase'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Single-Phase (Domestic)
              </button>
              <button
                type="button"
                onClick={() => setConnectionType('three_phase')}
                className={`rounded-lg py-2 text-xs font-bold transition ${
                  connectionType === 'three_phase'
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
              >
                Three-Phase (ToU)
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {connectionType === 'single_phase'
                ? 'Standard progressive slab tariff (1 to >700 units)'
                : 'Time of Use (Peak & Off-Peak separate meters)'}
            </p>
          </div>

          {/* Protected Consumer Status (Single Phase only) */}
          {connectionType === 'single_phase' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Consumer Protected Status
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProtected(true)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                    isProtected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Protected (&le;200 Units)
                </button>
                <button
                  type="button"
                  onClick={() => setIsProtected(false)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition ${
                    !isProtected
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  Unprotected
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isProtected
                  ? 'Subsidized rate for &le;200 units consecutively for 6 months'
                  : 'Normal residential slabs (16.48 to 42.72 Rs/unit)'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                FBR Taxpayer Status
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNonFiler(false)}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    !isNonFiler
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Active Filer (0% Tax)
                </button>
                <button
                  type="button"
                  onClick={() => setIsNonFiler(true)}
                  className={`rounded-lg py-2 text-xs font-bold transition ${
                    isNonFiler
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  }`}
                >
                  Non-Filer (7.5% Tax)
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Section 235 tax on bills &gt; Rs. 25,000 for Non-Filers
              </p>
            </div>
          )}
        </div>

        {/* Consumption Inputs & Presets */}
        <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
          {connectionType === 'single_phase' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Total Units Consumed (kWh)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={unitsInput}
                      onChange={(e) => setUnitsInput(e.target.value)}
                      placeholder="e.g. 350"
                      className="text-lg font-bold text-slate-900 dark:text-white pr-16"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      kWh / Units
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    FPA Rate (Rs./Unit)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    value={fpaRateInput}
                    onChange={(e) => setFpaRateInput(e.target.value)}
                    placeholder="3.50"
                    className="font-semibold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Quick Presets:
                </span>
                {PRESET_UNITS_DOMESTIC.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setUnitsInput(p.value.toString());
                      if (p.value <= 200) {
                        setIsProtected(p.value <= 200);
                      }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      unitsVal === p.value
                        ? 'bg-amber-500 text-white font-bold shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    {p.label} ({p.desc})
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Three Phase ToU Inputs */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Peak Hours Units (kWh)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={peakUnitsInput}
                    onChange={(e) => setPeakUnitsInput(e.target.value)}
                    placeholder="120"
                    className="font-bold text-rose-600 dark:text-rose-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    @ Rs. {TOU_RATES.peakRate}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">6 PM – 10 PM (Winter) / 7 PM – 11 PM (Summer)</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Off-Peak Hours Units (kWh)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={offPeakUnitsInput}
                    onChange={(e) => setOffPeakUnitsInput(e.target.value)}
                    placeholder="450"
                    className="font-bold text-indigo-600 dark:text-indigo-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                    @ Rs. {TOU_RATES.offPeakRate}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Remaining 20 Hours of the Day</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  FPA Rate (Rs./Unit)
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={fpaRateInput}
                  onChange={(e) => setFpaRateInput(e.target.value)}
                  placeholder="3.50"
                  className="font-semibold text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-400">Fuel Price Adjustment Surcharge</p>
              </div>
            </div>
          )}
        </div>

        {/* Solar Net Metering Toggle & Options */}
        <div className="mt-6 rounded-2xl border border-amber-200/60 bg-amber-50/40 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm">
                <Sun className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Solar Net-Metering & Green Energy Offset
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Simulate excess solar kWh exported to grid and net billing deductions
                </p>
              </div>
            </div>

            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isSolarNetMetering}
                onChange={(e) => setIsSolarNetMetering(e.target.checked)}
                className="peer sr-only"
              />
              <div className="peer h-6 w-11 rounded-full bg-slate-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-amber-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-slate-700"></div>
              <span className="ml-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
                {isSolarNetMetering ? 'Solar Active 🟢' : 'Enable Solar ☀️'}
              </span>
            </label>
          </div>

          {isSolarNetMetering && (
            <div className="mt-5 space-y-4 border-t border-amber-200/60 pt-4 dark:border-amber-900/40">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Solar Exported to Grid (kWh)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={solarExportUnitsInput}
                    onChange={(e) => setSolarExportUnitsInput(e.target.value)}
                    placeholder="400"
                    className="font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Quick Solar System Size Calculator
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SOLAR_SYSTEM_PRESETS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSolarExportUnitsInput(s.estMonthlyUnits.toString())}
                        className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-amber-700 shadow-sm border border-amber-200 hover:bg-amber-100 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-400 dark:hover:bg-slate-800"
                      >
                        {s.label} (~{s.estMonthlyUnits} units)
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {solarExportVal > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-100/70 p-3 text-xs font-medium text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
                  <span>
                    ☀️ Exporting <strong>{solarExportVal} kWh</strong> reduces your billed units from{' '}
                    <strong>{result.grossUnitsConsumed}</strong> to <strong>{result.netUnitsBilled}</strong>.
                  </span>
                  {result.surplusExportCreditsPkr > 0 && (
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">
                      🎉 Surplus Export Credit: Rs. {formatPakistaniNumber(result.surplusExportCreditsPkr)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 3. Output Key Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PakistaniMetricCard
          titleEn="Estimated Total Bill"
          titleUr="کل تخمینہ شدہ بجلی کا بل"
          value={`Rs. ${formatPakistaniNumber(result.totalEstimatedBillPkr)}`}
          badge={company}
          isHighlighted={true}
          statutoryBasis="Calculated strictly according to NEPRA FY 2024-25 domestic tariff schedules and disco surcharges."
          statutoryReference="NEPRA Tariff Schedule / FPA / GST"
        />

        <PakistaniMetricCard
          titleEn="Effective Rate per Unit"
          titleUr="اوسط فی یونٹ لاگت"
          value={`Rs. ${result.effectiveCostPerUnit} / kWh`}
          badge="All Taxes Included"
          statutoryBasis="Average cost of 1 electricity unit including energy charges, FPA, FC surcharge, ED, and 18% GST."
        />

        <PakistaniMetricCard
          titleEn={isSolarNetMetering ? 'Monthly Solar Savings' : 'Base Energy Charges'}
          titleUr={isSolarNetMetering ? 'سولر سے ماہانہ بچت' : 'بنیادی بجلی کا خرچ'}
          value={
            isSolarNetMetering && result.solarSavingsPkr
              ? `Rs. ${formatPakistaniNumber(result.solarSavingsPkr)}`
              : `Rs. ${formatPakistaniNumber(result.baseElectricityCost)}`
          }
          badge={isSolarNetMetering ? 'Solar ROI ☀️' : result.tariffSlabApplied.split(' ')[0]}
          statutoryBasis={
            isSolarNetMetering
              ? 'Estimated direct monthly cash savings compared to non-solar grid consumption.'
              : 'Pure energy component before taxes, duties, and fuel adjustments.'
          }
        />

        <PakistaniMetricCard
          titleEn="Active Tariff Slab"
          titleUr="لاگو شدہ ٹیرف سلیب"
          value={
            connectionType === 'three_phase'
              ? 'Three-Phase ToU'
              : isProtected
              ? 'Protected Slab'
              : 'Unprotected Slab'
          }
          badge={connectionType === 'single_phase' ? (isProtected ? 'Protected 🟢' : 'Unprotected 🔴') : 'ToU Peak/Off-Peak'}
          statutoryBasis={result.tariffSlabApplied}
        />
      </div>

      {/* 4. Visual Cost Composition Bar */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            WAPDA Bill Cost Composition & Tax Breakdown
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            Total: Rs. {formatPakistaniNumber(result.totalEstimatedBillPkr)}
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="mt-3 flex h-4 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            style={{ width: `${basePct}%` }}
            className="bg-amber-500 transition-all duration-300"
            title={`Base Energy: ${basePct}%`}
          />
          <div
            style={{ width: `${fpaPct}%` }}
            className="bg-sky-500 transition-all duration-300"
            title={`Fuel Price Adjustment: ${fpaPct}%`}
          />
          <div
            style={{ width: `${fcPct}%` }}
            className="bg-indigo-500 transition-all duration-300"
            title={`FC Surcharge: ${fcPct}%`}
          />
          <div
            style={{ width: `${taxesPct}%` }}
            className="bg-rose-500 transition-all duration-300"
            title={`GST & Duties: ${taxesPct}%`}
          />
        </div>

        {/* Legend */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500"></span>
            <span className="text-slate-600 dark:text-slate-400">
              Base Energy: <strong>Rs. {formatPakistaniNumber(result.baseElectricityCost)}</strong> ({basePct}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-500"></span>
            <span className="text-slate-600 dark:text-slate-400">
              FPA Surcharge: <strong>Rs. {formatPakistaniNumber(result.fpaAmount)}</strong> ({fpaPct}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-indigo-500"></span>
            <span className="text-slate-600 dark:text-slate-400">
              FC Surcharge: <strong>Rs. {formatPakistaniNumber(result.fcSurchargeAmount)}</strong> ({fcPct}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500"></span>
            <span className="text-slate-600 dark:text-slate-400">
              GST & Taxes: <strong>Rs. {formatPakistaniNumber(result.generalSalesTaxAmount + result.electricityDutyAmount + result.tvFee + result.incomeTaxAmount)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 5. Detailed Itemized Bill Slip */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Printable/Copyable Bill Slip */}
        <div className="lg:col-span-2 space-y-4">
          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-slate-50/70 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official Itemized Bill Charges Breakdown
                </h3>
              </div>
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                {company}
              </span>
            </div>

            <div className="divide-y divide-slate-100 px-6 dark:divide-slate-800 text-xs">
              {result.taxBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.taxName}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {item.taxNameUrdu} • {item.rateDesc}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold ${
                        item.amountPkr < 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.amountPkr < 0 ? '-' : ''}Rs. {formatPakistaniNumber(Math.abs(item.amountPkr))}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total Line */}
              <div className="flex items-center justify-between py-4 bg-amber-50/40 -mx-6 px-6 dark:bg-amber-950/20">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Net Estimated Payable Bill (PKR)
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    {totalBillFormatted.inWords} • {totalBillFormatted.inUrdu}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">
                    Rs. {formatPakistaniNumber(result.totalEstimatedBillPkr)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp and Social Sharing */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Share electricity bill breakdown with family or tenants:
            </div>
            <WhatsAppShareButton
              shareText={shareSlip}
              buttonText="Share Bill Slip on WhatsApp"
            />
          </div>
        </div>

        {/* Reference Tariff Slabs Matrix */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-sky-500" />
              NEPRA 2024–2025 Tariff Slab Rates
            </h4>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                <p className="font-bold text-emerald-800 dark:text-emerald-300 mb-1.5">
                  Protected Domestic Slabs
                </p>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  {PROTECTED_SLABS.map((s) => (
                    <div key={s.range} className="flex justify-between">
                      <span>{s.range}</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">Rs. {s.ratePerUnit.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="font-bold text-amber-800 dark:text-amber-300 mb-1.5">
                  Unprotected Domestic Slabs
                </p>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  {UNPROTECTED_SLABS.map((s) => (
                    <div key={s.range} className="flex justify-between">
                      <span>{s.range}</span>
                      <strong className="text-amber-700 dark:text-amber-400">Rs. {s.ratePerUnit.toFixed(2)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <p className="font-bold text-indigo-800 dark:text-indigo-300 mb-1.5">
                  Three-Phase Time of Use (ToU)
                </p>
                <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Peak Hours (4 hrs daily)</span>
                    <strong className="text-rose-600 dark:text-rose-400">Rs. {TOU_RATES.peakRate.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Off-Peak Hours (20 hrs daily)</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">Rs. {TOU_RATES.offPeakRate.toFixed(2)}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Solar Export Buyback Rate</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">Rs. {TOU_RATES.solarExportRate.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Comprehensive FAQ Accordion */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <HelpCircle className="h-5 w-5 text-amber-500" />
          Frequently Asked Questions (Electricity Billing & Solar Net-Metering in Pakistan)
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
                    <span className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
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
