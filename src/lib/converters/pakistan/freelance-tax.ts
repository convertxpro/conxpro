/**
 * Freelancer IT Export Tax & Remittance Optimizer Engine
 * Finance Act 2024-2026 Section 154A & SBP Foreign Exchange Regulations
 */

export type FreelancerTaxStatus = 'pseb_filer' | 'unregistered_filer' | 'non_filer';
export type EarningsFrequency = 'monthly' | 'annual';
export type ForeignCurrency = 'USD' | 'GBP' | 'EUR' | 'AED' | 'CAD' | 'AUD' | 'SAR';

export interface CurrencyRate {
  code: ForeignCurrency;
  symbol: string;
  name: string;
  pkrRate: number;
}

export const FREELANCE_CURRENCIES: CurrencyRate[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', pkrRate: 278.50 },
  { code: 'GBP', symbol: '£', name: 'British Pound', pkrRate: 365.00 },
  { code: 'EUR', symbol: '€', name: 'Euro', pkrRate: 305.00 },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', pkrRate: 75.85 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', pkrRate: 205.00 },
  { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', pkrRate: 182.00 },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', pkrRate: 74.20 },
];

export interface RemittanceChannel {
  id: string;
  name: string;
  category: 'direct' | 'wallet' | 'platform' | 'fcy';
  description: string;
  fxMarginPct: number;
  fixedFeeUsd: number;
  platformCutPct: number;
  providesPrc: boolean;
  speed: string;
}

export const REMITTANCE_CHANNELS: RemittanceChannel[] = [
  {
    id: 'bank-wire-prc',
    name: 'Direct SBP Home Remittance (PRC)',
    category: 'direct',
    description: 'Bank wire with official automated PRC certificate. 0% conversion penalty.',
    fxMarginPct: 0.0,
    fixedFeeUsd: 0.0,
    platformCutPct: 0.0,
    providesPrc: true,
    speed: '1–2 Business Days',
  },
  {
    id: 'wise-bank',
    name: 'Wise (Mid-Market Transfer)',
    category: 'wallet',
    description: 'Direct mid-market real rate with transparent 0.65% transfer fee.',
    fxMarginPct: 0.0,
    fixedFeeUsd: 1.80,
    platformCutPct: 0.65,
    providesPrc: true,
    speed: 'Instant to 2 Hours',
  },
  {
    id: 'payoneer-bank',
    name: 'Payoneer → Local PKR Bank',
    category: 'wallet',
    description: 'Standard Payoneer transfer to Pakistani bank or JazzCash/Nayapay (2% FX spread).',
    fxMarginPct: 2.0,
    fixedFeeUsd: 1.50,
    platformCutPct: 0.0,
    providesPrc: true,
    speed: 'Within 24 Hours',
  },
  {
    id: 'upwork-direct',
    name: 'Upwork (Direct Local Bank)',
    category: 'platform',
    description: 'Upwork 10% platform fee + $0.99 withdrawal + ~2.5% local bank conversion spread.',
    fxMarginPct: 2.5,
    fixedFeeUsd: 0.99,
    platformCutPct: 10.0,
    providesPrc: true,
    speed: '2–3 Business Days',
  },
  {
    id: 'fiverr-bank',
    name: 'Fiverr (Direct Bank / Payoneer)',
    category: 'platform',
    description: 'Fiverr 20% platform cut + $3.00 payout fee + 2.0% FX markup.',
    fxMarginPct: 2.0,
    fixedFeeUsd: 3.00,
    platformCutPct: 20.0,
    providesPrc: true,
    speed: '1–3 Business Days',
  },
];

export interface ChannelCalculation {
  channel: RemittanceChannel;
  grossForeign: number;
  platformFeePkr: number;
  fixedFeePkr: number;
  fxLossPkr: number;
  totalFeesPkr: number;
  taxWithheldPkr: number;
  netRealizedPkr: number;
  effectiveLossPercentage: number;
}

export interface FreelanceTaxResult {
  foreignCurrency: ForeignCurrency;
  currencySymbol: string;
  fxRate: number;
  grossMonthlyForeign: number;
  grossAnnualForeign: number;
  grossMonthlyPkr: number;
  grossAnnualPkr: number;
  status: FreelancerTaxStatus;
  taxRatePct: number;
  monthlyTaxPkr: number;
  annualTaxPkr: number;
  netMonthlyTakeHomePkr: number;
  netAnnualTakeHomePkr: number;
  psebTaxSavingsAnnual: number;
  channels: ChannelCalculation[];
  recommendedChannel: ChannelCalculation;
}

export function calculateFreelanceTax(
  amount: number,
  currency: ForeignCurrency = 'USD',
  frequency: EarningsFrequency = 'monthly',
  status: FreelancerTaxStatus = 'pseb_filer',
  customFxRate?: number
): FreelanceTaxResult {
  const safeAmount = Math.max(0, Number(amount) || 0);
  const curObj = FREELANCE_CURRENCIES.find((c) => c.code === currency) || FREELANCE_CURRENCIES[0];
  const fxRate = customFxRate && customFxRate > 0 ? customFxRate : curObj.pkrRate;

  const grossMonthlyForeign = frequency === 'monthly' ? safeAmount : safeAmount / 12;
  const grossAnnualForeign = frequency === 'annual' ? safeAmount : safeAmount * 12;

  const grossMonthlyPkr = Math.round(grossMonthlyForeign * fxRate);
  const grossAnnualPkr = Math.round(grossAnnualForeign * fxRate);

  // Calculate Tax Rate under Section 154A
  let taxRatePct = 0.25; // 0.25% PSEB Registered Filer
  if (status === 'unregistered_filer') {
    taxRatePct = 1.0; // 1.0% Unregistered Active Filer
  } else if (status === 'non_filer') {
    // Non-Filer progressive individual slabs (approx 20% effective up to 35%)
    if (grossAnnualPkr <= 600000) taxRatePct = 0;
    else if (grossAnnualPkr <= 1200000) taxRatePct = 5.0;
    else if (grossAnnualPkr <= 2200000) taxRatePct = 15.0;
    else if (grossAnnualPkr <= 3200000) taxRatePct = 25.0;
    else taxRatePct = 32.0;
  }

  const monthlyTaxPkr = Math.round(grossMonthlyPkr * (taxRatePct / 100));
  const annualTaxPkr = Math.round(grossAnnualPkr * (taxRatePct / 100));

  const netMonthlyTakeHomePkr = Math.max(0, grossMonthlyPkr - monthlyTaxPkr);
  const netAnnualTakeHomePkr = Math.max(0, grossAnnualPkr - annualTaxPkr);

  // PSEB Savings compared to 1% or non-filer
  const standardAnnualTax = Math.round(grossAnnualPkr * 0.01);
  const psebAnnualTax = Math.round(grossAnnualPkr * 0.0025);
  const psebTaxSavingsAnnual = Math.max(0, standardAnnualTax - psebAnnualTax);

  // Compute channels breakdown for monthly earnings in USD equivalent
  const usdAmount = currency === 'USD' ? grossMonthlyForeign : (grossMonthlyPkr / (FREELANCE_CURRENCIES[0].pkrRate));

  const channels: ChannelCalculation[] = REMITTANCE_CHANNELS.map((ch) => {
    const platformCutUsd = usdAmount * (ch.platformCutPct / 100);
    const amountAfterPlatform = Math.max(0, usdAmount - platformCutUsd);
    const fixedFeeUsd = ch.fixedFeeUsd;
    const amountAfterFixed = Math.max(0, amountAfterPlatform - fixedFeeUsd);
    
    // FX spread loss
    const fxLossUsd = amountAfterFixed * (ch.fxMarginPct / 100);
    const netUsdToConvert = Math.max(0, amountAfterFixed - fxLossUsd);

    const platformFeePkr = Math.round(platformCutUsd * fxRate);
    const fixedFeePkr = Math.round(fixedFeeUsd * fxRate);
    const fxLossPkr = Math.round(fxLossUsd * fxRate);
    const totalFeesPkr = platformFeePkr + fixedFeePkr + fxLossPkr;

    const grossRealizedPkr = Math.round(netUsdToConvert * fxRate);
    const taxWithheldPkr = Math.round(grossRealizedPkr * (taxRatePct / 100));
    const netRealizedPkr = Math.max(0, grossRealizedPkr - taxWithheldPkr);

    const effectiveLossPct = grossMonthlyPkr > 0 ? ((grossMonthlyPkr - netRealizedPkr) / grossMonthlyPkr) * 100 : 0;

    return {
      channel: ch,
      grossForeign: grossMonthlyForeign,
      platformFeePkr,
      fixedFeePkr,
      fxLossPkr,
      totalFeesPkr,
      taxWithheldPkr,
      netRealizedPkr,
      effectiveLossPercentage: Number(effectiveLossPct.toFixed(2)),
    };
  });

  channels.sort((a, b) => b.netRealizedPkr - a.netRealizedPkr);

  return {
    foreignCurrency: currency,
    currencySymbol: curObj.symbol,
    fxRate,
    grossMonthlyForeign,
    grossAnnualForeign,
    grossMonthlyPkr,
    grossAnnualPkr,
    status,
    taxRatePct,
    monthlyTaxPkr,
    annualTaxPkr,
    netMonthlyTakeHomePkr,
    netAnnualTakeHomePkr,
    psebTaxSavingsAnnual,
    channels,
    recommendedChannel: channels[0],
  };
}
