/**
 * Pakistan Property Transfer, Stamp Duty & FBR Section 236K / 236C Engine
 * Updated for Finance Act 2024-2026, Punjab e-Stamping, Sindh, ICT Islamabad, KPK
 */

export type Jurisdiction = 'punjab' | 'sindh' | 'islamabad' | 'kpk';
export type PropertyType = 'residential_plot' | 'commercial_plot' | 'house' | 'apartment' | 'agricultural';
export type FilerStatus = 'filer' | 'late_filer' | 'non_filer';

export interface PropertyTaxInput {
  propertyValue: number;
  originalPurchasePrice?: number;
  jurisdiction: Jurisdiction;
  propertyType: PropertyType;
  buyerStatus: FilerStatus;
  sellerStatus: FilerStatus;
  holdingPeriodYears: number; // 0 for < 1 year, 1 for 1-2 years, up to 7+
  isRural?: boolean;
}

export interface BuyerTaxBreakdown {
  section236KRate: number;
  section236KAmount: number;
  stampDutyRate: number;
  stampDutyAmount: number;
  tmaFeeRate: number;
  tmaFeeAmount: number;
  mutationRegistrationFee: number;
  totalBuyerPayable: number;
  effectiveBuyerPercentage: number;
}

export interface SellerTaxBreakdown {
  section236CRate: number;
  section236CAmount: number;
  capitalGain: number;
  cgtRate: number;
  cgtAmount: number;
  totalSellerPayable: number;
  effectiveSellerPercentage: number;
}

export interface PropertyTaxResult {
  propertyValue: number;
  jurisdiction: Jurisdiction;
  propertyType: PropertyType;
  buyer: BuyerTaxBreakdown;
  seller: SellerTaxBreakdown;
  totalGovernmentRevenue: number;
  totalTransactionFrictionPct: number;
  filerSavingsBuyer: number; // How much buyer saves by being a filer
  filerSavingsSeller: number; // How much seller saves by being a filer
}

export const PROPERTY_PRESETS = [
  { label: '50 Lakh (Rs. 5M)', value: 5000000, desc: 'Starter 5 Marla / Flat' },
  { label: '1 Crore (Rs. 10M)', value: 10000000, desc: '10 Marla / Suburban House' },
  { label: '2.5 Crore (Rs. 25M)', value: 25000000, desc: '1 Kanal Urban House' },
  { label: '5 Crore (Rs. 50M)', value: 50000000, desc: 'Prime Commercial / Luxury' },
  { label: '10 Crore (Rs. 100M)', value: 100000000, desc: 'High-Value Commercial' },
];

export function calculatePropertyTax(input: PropertyTaxInput): PropertyTaxResult {
  const value = Math.max(0, Number(input.propertyValue) || 0);
  const purchasePrice = Math.max(0, Number(input.originalPurchasePrice) || Math.round(value * 0.75));
  const gain = Math.max(0, value - purchasePrice);

  // 1. BUYER TAXES
  // Section 236K (Advance tax on purchase)
  let section236KRate = 0.03; // 3% for active filer
  if (input.buyerStatus === 'late_filer') {
    section236KRate = 0.06; // 6% for late filers
  } else if (input.buyerStatus === 'non_filer') {
    section236KRate = 0.105; // 10.5% punitive rate for non-filers under FA 2024
  }
  const section236KAmount = Math.round(value * section236KRate);

  // Provincial Stamp Duty
  let stampDutyRate = 0.01;
  if (input.jurisdiction === 'punjab') {
    stampDutyRate = input.isRural ? 0.02 : 0.01; // Punjab e-Stamping 1% urban, 2% rural
  } else if (input.jurisdiction === 'sindh') {
    stampDutyRate = 0.02; // Sindh Board of Revenue
  } else if (input.jurisdiction === 'islamabad') {
    stampDutyRate = 0.015; // CDA ICT
  } else if (input.jurisdiction === 'kpk') {
    stampDutyRate = 0.02;
  }
  const stampDutyAmount = Math.round(value * stampDutyRate);

  // TMA / Local Government Fee
  const tmaFeeRate = 0.01; // 1%
  const tmaFeeAmount = Math.round(value * tmaFeeRate);

  // Mutation & District Council Processing Charges
  let mutationRegistrationFee = 2500;
  if (value > 20000000) {
    mutationRegistrationFee = 10000;
  } else if (value > 5000000) {
    mutationRegistrationFee = 5000;
  }
  if (input.jurisdiction === 'sindh') {
    mutationRegistrationFee += Math.round(value * 0.005); // Sindh registration surcharge
  }

  const totalBuyerPayable = section236KAmount + stampDutyAmount + tmaFeeAmount + mutationRegistrationFee;
  const effectiveBuyerPercentage = value > 0 ? (totalBuyerPayable / value) * 100 : 0;

  // 2. SELLER TAXES
  // Section 236C (Advance tax on sale)
  let section236CRate = 0.03; // 3% for filer
  if (input.sellerStatus === 'non_filer') {
    section236CRate = 0.105; // 10.5% for non-filer
  }

  // Check holding period threshold for 236C exemption
  let exemptYears = 6; // default open plot
  if (input.propertyType === 'house') exemptYears = 4;
  if (input.propertyType === 'apartment') exemptYears = 2;

  let final236CRate = section236CRate;
  if (input.sellerStatus === 'filer' && input.holdingPeriodYears >= exemptYears) {
    final236CRate = 0; // Exemption after holding period for filers
  }
  const section236CAmount = Math.round(value * final236CRate);

  // Capital Gains Tax (CGT) under Section 37
  let cgtRate = 0;
  if (input.holdingPeriodYears === 0) cgtRate = input.sellerStatus === 'filer' ? 0.15 : 0.30;
  else if (input.holdingPeriodYears === 1) cgtRate = input.sellerStatus === 'filer' ? 0.125 : 0.25;
  else if (input.holdingPeriodYears === 2) cgtRate = input.sellerStatus === 'filer' ? 0.10 : 0.20;
  else if (input.holdingPeriodYears === 3) cgtRate = input.sellerStatus === 'filer' ? 0.075 : 0.15;
  else if (input.holdingPeriodYears === 4) cgtRate = input.sellerStatus === 'filer' ? 0.05 : 0.10;
  else if (input.holdingPeriodYears === 5) cgtRate = input.sellerStatus === 'filer' ? 0.025 : 0.05;
  else cgtRate = 0; // > 6 years exempt

  const cgtAmount = Math.round(gain * cgtRate);
  const totalSellerPayable = section236CAmount + cgtAmount;
  const effectiveSellerPercentage = value > 0 ? (totalSellerPayable / value) * 100 : 0;

  // 3. COMBINED TOTALS & FILER SAVINGS
  const totalGovernmentRevenue = totalBuyerPayable + totalSellerPayable;
  const totalTransactionFrictionPct = value > 0 ? (totalGovernmentRevenue / value) * 100 : 0;

  const buyerNonFiler236K = Math.round(value * 0.105);
  const filerSavingsBuyer = Math.max(0, buyerNonFiler236K - Math.round(value * 0.03));

  const sellerNonFiler236C = Math.round(value * 0.105);
  const filerSavingsSeller = Math.max(0, sellerNonFiler236C - Math.round(value * 0.03));

  return {
    propertyValue: value,
    jurisdiction: input.jurisdiction,
    propertyType: input.propertyType,
    buyer: {
      section236KRate: Number((section236KRate * 100).toFixed(1)),
      section236KAmount,
      stampDutyRate: Number((stampDutyRate * 100).toFixed(1)),
      stampDutyAmount,
      tmaFeeRate: Number((tmaFeeRate * 100).toFixed(1)),
      tmaFeeAmount,
      mutationRegistrationFee,
      totalBuyerPayable,
      effectiveBuyerPercentage: Number(effectiveBuyerPercentage.toFixed(2)),
    },
    seller: {
      section236CRate: Number((final236CRate * 100).toFixed(1)),
      section236CAmount,
      capitalGain: gain,
      cgtRate: Number((cgtRate * 100).toFixed(1)),
      cgtAmount,
      totalSellerPayable,
      effectiveSellerPercentage: Number(effectiveSellerPercentage.toFixed(2)),
    },
    totalGovernmentRevenue,
    totalTransactionFrictionPct: Number(totalTransactionFrictionPct.toFixed(2)),
    filerSavingsBuyer,
    filerSavingsSeller,
  };
}
