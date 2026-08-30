import Decimal from 'decimal.js';

export interface TaxCalculationInput {
  monthlySalary?: number;
  annualSalary?: number;
  individualType: 'salaried' | 'non-salaried' | 'business';
  taxYear: '2024-2025' | '2025-2026';
  isFiler: boolean;
  zakatDeduction?: number;
  otherExemptions?: number;
}

export interface TaxSlabInfo {
  slabNumber: number;
  minAnnual: number;
  maxAnnual: number | null;
  minMonthly: number;
  maxMonthly: number | null;
  rateDescription: string;
  formulaDescription: string;
  fixedTax: number;
  variableRate: number; // e.g. 0.05 for 5%
  baseExceedingAmount: number;
}

export interface TaxSlabBreakdownItem {
  slabIndex: number;
  slabLabel: string;
  rate: string;
  taxableInSlab: number;
  taxAmount: number;
  isUserSlab: boolean;
}

export interface TaxCalculationResult {
  grossMonthlySalary: number;
  grossAnnualSalary: number;
  taxableAnnualIncome: number;
  taxableMonthlyIncome: number;
  monthlyTax: number;
  annualTax: number;
  baseAnnualTax: number;
  surchargeAmount: number;
  hasSurcharge: boolean;
  monthlyTakeHome: number;
  annualTakeHome: number;
  effectiveTaxRate: number;
  marginalTaxBracket: string;
  activeSlabNumber: number;
  taxSlabBreakdown: TaxSlabBreakdownItem[];
  nonFilerNote?: string;
}

// Statutory Slabs for Salaried Individuals (Tax Year 2024–2026 Finance Act)
export const SALARIED_TAX_SLABS: TaxSlabInfo[] = [
  {
    slabNumber: 1,
    minAnnual: 0,
    maxAnnual: 600000,
    minMonthly: 0,
    maxMonthly: 50000,
    rateDescription: '0% (Exempt)',
    formulaDescription: '0%',
    fixedTax: 0,
    variableRate: 0,
    baseExceedingAmount: 0,
  },
  {
    slabNumber: 2,
    minAnnual: 600001,
    maxAnnual: 1200000,
    minMonthly: 50000.08,
    maxMonthly: 100000,
    rateDescription: '5% of amount exceeding Rs. 600,000',
    formulaDescription: '5% > 600k',
    fixedTax: 0,
    variableRate: 0.05,
    baseExceedingAmount: 600000,
  },
  {
    slabNumber: 3,
    minAnnual: 1200001,
    maxAnnual: 2200000,
    minMonthly: 100000.08,
    maxMonthly: 183333.33,
    rateDescription: 'Rs. 30,000 + 15% of amount exceeding Rs. 1,200,000',
    formulaDescription: 'Rs. 30,000 + 15% > 1.2M',
    fixedTax: 30000,
    variableRate: 0.15,
    baseExceedingAmount: 1200000,
  },
  {
    slabNumber: 4,
    minAnnual: 2200001,
    maxAnnual: 3200000,
    minMonthly: 183333.41,
    maxMonthly: 266666.67,
    rateDescription: 'Rs. 180,000 + 25% of amount exceeding Rs. 2,200,000',
    formulaDescription: 'Rs. 180,000 + 25% > 2.2M',
    fixedTax: 180000,
    variableRate: 0.25,
    baseExceedingAmount: 2200000,
  },
  {
    slabNumber: 5,
    minAnnual: 3200001,
    maxAnnual: 4100000,
    minMonthly: 266666.75,
    maxMonthly: 341666.67,
    rateDescription: 'Rs. 430,000 + 30% of amount exceeding Rs. 3,200,000',
    formulaDescription: 'Rs. 430,000 + 30% > 3.2M',
    fixedTax: 430000,
    variableRate: 0.30,
    baseExceedingAmount: 3200000,
  },
  {
    slabNumber: 6,
    minAnnual: 4100001,
    maxAnnual: null,
    minMonthly: 341666.75,
    maxMonthly: null,
    rateDescription: 'Rs. 700,000 + 35% of amount exceeding Rs. 4,100,000 (+10% surcharge if > 10M)',
    formulaDescription: 'Rs. 700,000 + 35% > 4.1M',
    fixedTax: 700000,
    variableRate: 0.35,
    baseExceedingAmount: 4100000,
  },
];

// Statutory Slabs for Business Individuals & AOPs (Tax Year 2024–2026)
export const BUSINESS_TAX_SLABS: TaxSlabInfo[] = [
  {
    slabNumber: 1,
    minAnnual: 0,
    maxAnnual: 600000,
    minMonthly: 0,
    maxMonthly: 50000,
    rateDescription: '0% (Exempt)',
    formulaDescription: '0%',
    fixedTax: 0,
    variableRate: 0,
    baseExceedingAmount: 0,
  },
  {
    slabNumber: 2,
    minAnnual: 600001,
    maxAnnual: 1200000,
    minMonthly: 50000.08,
    maxMonthly: 100000,
    rateDescription: '15% of amount exceeding Rs. 600,000',
    formulaDescription: '15% > 600k',
    fixedTax: 0,
    variableRate: 0.15,
    baseExceedingAmount: 600000,
  },
  {
    slabNumber: 3,
    minAnnual: 1200001,
    maxAnnual: 1600000,
    minMonthly: 100000.08,
    maxMonthly: 133333.33,
    rateDescription: 'Rs. 90,000 + 20% of amount exceeding Rs. 1,200,000',
    formulaDescription: 'Rs. 90,000 + 20% > 1.2M',
    fixedTax: 90000,
    variableRate: 0.20,
    baseExceedingAmount: 1200000,
  },
  {
    slabNumber: 4,
    minAnnual: 1600001,
    maxAnnual: 3200000,
    minMonthly: 133333.41,
    maxMonthly: 266666.67,
    rateDescription: 'Rs. 170,000 + 30% of amount exceeding Rs. 1,600,000',
    formulaDescription: 'Rs. 170,000 + 30% > 1.6M',
    fixedTax: 170000,
    variableRate: 0.30,
    baseExceedingAmount: 1600000,
  },
  {
    slabNumber: 5,
    minAnnual: 3200001,
    maxAnnual: 5600000,
    minMonthly: 266666.75,
    maxMonthly: 466666.67,
    rateDescription: 'Rs. 650,000 + 40% of amount exceeding Rs. 3,200,000',
    formulaDescription: 'Rs. 650,000 + 40% > 3.2M',
    fixedTax: 650000,
    variableRate: 0.40,
    baseExceedingAmount: 3200000,
  },
  {
    slabNumber: 6,
    minAnnual: 5600001,
    maxAnnual: null,
    minMonthly: 466666.75,
    maxMonthly: null,
    rateDescription: 'Rs. 1,610,000 + 45% of amount exceeding Rs. 5,600,000 (+10% surcharge if > 10M)',
    formulaDescription: 'Rs. 1,610,000 + 45% > 5.6M',
    fixedTax: 1610000,
    variableRate: 0.45,
    baseExceedingAmount: 5600000,
  },
];

export function calculateFbrTax(input: TaxCalculationInput): TaxCalculationResult {
  const isSalaried = input.individualType === 'salaried';
  const grossMonthly = input.monthlySalary !== undefined
    ? new Decimal(input.monthlySalary)
    : new Decimal(input.annualSalary || 0).dividedBy(12);

  const grossAnnual = grossMonthly.times(12);
  const grossAnnualNum = grossAnnual.toNumber();

  const deductions = new Decimal(input.zakatDeduction || 0).plus(input.otherExemptions || 0);
  const taxableAnnual = Decimal.max(0, grossAnnual.minus(deductions));
  const taxableAnnualNum = taxableAnnual.toNumber();
  const taxableMonthlyNum = taxableAnnual.dividedBy(12).toNumber();

  let baseAnnualTax = new Decimal(0);
  let marginalBracket = '0% (Exempt)';
  let activeSlabNumber = 1;
  const breakdown: TaxSlabBreakdownItem[] = [];

  if (isSalaried) {
    if (taxableAnnualNum <= 600000) {
      activeSlabNumber = 1;
      marginalBracket = '0% (Exempt)';
      breakdown.push({
        slabIndex: 1,
        slabLabel: 'Up to Rs. 600,000',
        rate: '0%',
        taxableInSlab: taxableAnnualNum,
        taxAmount: 0,
        isUserSlab: true,
      });
    } else if (taxableAnnualNum <= 1200000) {
      activeSlabNumber = 2;
      marginalBracket = '5%';
      const taxableInSlab = taxableAnnualNum - 600000;
      const tax = new Decimal(taxableInSlab).times(0.05);
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 1,
        slabLabel: 'Up to Rs. 600,000',
        rate: '0%',
        taxableInSlab: 600000,
        taxAmount: 0,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 2,
        slabLabel: 'Rs. 600,001 - 1,200,000',
        rate: '5%',
        taxableInSlab,
        taxAmount: tax.toNumber(),
        isUserSlab: true,
      });
    } else if (taxableAnnualNum <= 2200000) {
      activeSlabNumber = 3;
      marginalBracket = '15%';
      const taxableInSlab = taxableAnnualNum - 1200000;
      const tax = new Decimal(30000).plus(new Decimal(taxableInSlab).times(0.15));
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 1,
        slabLabel: 'Up to Rs. 600,000',
        rate: '0%',
        taxableInSlab: 600000,
        taxAmount: 0,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 2,
        slabLabel: 'Rs. 600,001 - 1,200,000',
        rate: '5%',
        taxableInSlab: 600000,
        taxAmount: 30000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 3,
        slabLabel: 'Rs. 1,200,001 - 2,200,000',
        rate: '15%',
        taxableInSlab,
        taxAmount: new Decimal(taxableInSlab).times(0.15).toNumber(),
        isUserSlab: true,
      });
    } else if (taxableAnnualNum <= 3200000) {
      activeSlabNumber = 4;
      marginalBracket = '25%';
      const taxableInSlab = taxableAnnualNum - 2200000;
      const tax = new Decimal(180000).plus(new Decimal(taxableInSlab).times(0.25));
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 1,
        slabLabel: 'Up to Rs. 600,000',
        rate: '0%',
        taxableInSlab: 600000,
        taxAmount: 0,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 2,
        slabLabel: 'Rs. 600,001 - 1,200,000',
        rate: '5%',
        taxableInSlab: 600000,
        taxAmount: 30000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 3,
        slabLabel: 'Rs. 1,200,001 - 2,200,000',
        rate: '15%',
        taxableInSlab: 1000000,
        taxAmount: 150000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 4,
        slabLabel: 'Rs. 2,200,001 - 3,200,000',
        rate: '25%',
        taxableInSlab,
        taxAmount: new Decimal(taxableInSlab).times(0.25).toNumber(),
        isUserSlab: true,
      });
    } else if (taxableAnnualNum <= 4100000) {
      activeSlabNumber = 5;
      marginalBracket = '30%';
      const taxableInSlab = taxableAnnualNum - 3200000;
      const tax = new Decimal(430000).plus(new Decimal(taxableInSlab).times(0.30));
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 1,
        slabLabel: 'Up to Rs. 600,000',
        rate: '0%',
        taxableInSlab: 600000,
        taxAmount: 0,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 2,
        slabLabel: 'Rs. 600,001 - 1,200,000',
        rate: '5%',
        taxableInSlab: 600000,
        taxAmount: 30000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 3,
        slabLabel: 'Rs. 1,200,001 - 2,200,000',
        rate: '15%',
        taxableInSlab: 1000000,
        taxAmount: 150000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 4,
        slabLabel: 'Rs. 2,200,001 - 3,200,000',
        rate: '25%',
        taxableInSlab: 1000000,
        taxAmount: 250000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 5,
        slabLabel: 'Rs. 3,200,001 - 4,100,000',
        rate: '30%',
        taxableInSlab,
        taxAmount: new Decimal(taxableInSlab).times(0.30).toNumber(),
        isUserSlab: true,
      });
    } else {
      activeSlabNumber = 6;
      marginalBracket = '35%';
      const taxableInSlab = taxableAnnualNum - 4100000;
      const tax = new Decimal(700000).plus(new Decimal(taxableInSlab).times(0.35));
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 1,
        slabLabel: 'Up to Rs. 600,000',
        rate: '0%',
        taxableInSlab: 600000,
        taxAmount: 0,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 2,
        slabLabel: 'Rs. 600,001 - 1,200,000',
        rate: '5%',
        taxableInSlab: 600000,
        taxAmount: 30000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 3,
        slabLabel: 'Rs. 1,200,001 - 2,200,000',
        rate: '15%',
        taxableInSlab: 1000000,
        taxAmount: 150000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 4,
        slabLabel: 'Rs. 2,200,001 - 3,200,000',
        rate: '25%',
        taxableInSlab: 1000000,
        taxAmount: 250000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 5,
        slabLabel: 'Rs. 3,200,001 - 4,100,000',
        rate: '30%',
        taxableInSlab: 900000,
        taxAmount: 270000,
        isUserSlab: false,
      });
      breakdown.push({
        slabIndex: 6,
        slabLabel: 'Above Rs. 4,100,000',
        rate: '35%',
        taxableInSlab,
        taxAmount: new Decimal(taxableInSlab).times(0.35).toNumber(),
        isUserSlab: true,
      });
    }
  } else {
    // Business / Non-Salaried Individual / AOP
    if (taxableAnnualNum <= 600000) {
      activeSlabNumber = 1;
      marginalBracket = '0% (Exempt)';
      breakdown.push({
        slabIndex: 1,
        slabLabel: 'Up to Rs. 600,000',
        rate: '0%',
        taxableInSlab: taxableAnnualNum,
        taxAmount: 0,
        isUserSlab: true,
      });
    } else if (taxableAnnualNum <= 1200000) {
      activeSlabNumber = 2;
      marginalBracket = '15%';
      const taxableInSlab = taxableAnnualNum - 600000;
      const tax = new Decimal(taxableInSlab).times(0.15);
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 2,
        slabLabel: 'Rs. 600,001 - 1,200,000',
        rate: '15%',
        taxableInSlab,
        taxAmount: tax.toNumber(),
        isUserSlab: true,
      });
    } else if (taxableAnnualNum <= 1600000) {
      activeSlabNumber = 3;
      marginalBracket = '20%';
      const taxableInSlab = taxableAnnualNum - 1200000;
      const tax = new Decimal(90000).plus(new Decimal(taxableInSlab).times(0.20));
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 3,
        slabLabel: 'Rs. 1,200,001 - 1,600,000',
        rate: '20%',
        taxableInSlab,
        taxAmount: tax.toNumber(),
        isUserSlab: true,
      });
    } else if (taxableAnnualNum <= 3200000) {
      activeSlabNumber = 4;
      marginalBracket = '30%';
      const taxableInSlab = taxableAnnualNum - 1600000;
      const tax = new Decimal(170000).plus(new Decimal(taxableInSlab).times(0.30));
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 4,
        slabLabel: 'Rs. 1,600,001 - 3,200,000',
        rate: '30%',
        taxableInSlab,
        taxAmount: tax.toNumber(),
        isUserSlab: true,
      });
    } else if (taxableAnnualNum <= 5600000) {
      activeSlabNumber = 5;
      marginalBracket = '40%';
      const taxableInSlab = taxableAnnualNum - 3200000;
      const tax = new Decimal(650000).plus(new Decimal(taxableInSlab).times(0.40));
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 5,
        slabLabel: 'Rs. 3,200,001 - 5,600,000',
        rate: '40%',
        taxableInSlab,
        taxAmount: tax.toNumber(),
        isUserSlab: true,
      });
    } else {
      activeSlabNumber = 6;
      marginalBracket = '45%';
      const taxableInSlab = taxableAnnualNum - 5600000;
      const tax = new Decimal(1610000).plus(new Decimal(taxableInSlab).times(0.45));
      baseAnnualTax = tax;
      breakdown.push({
        slabIndex: 6,
        slabLabel: 'Above Rs. 5,600,000',
        rate: '45%',
        taxableInSlab,
        taxAmount: tax.toNumber(),
        isUserSlab: true,
      });
    }
  }

  // 10% Super Surcharge for high income (> Rs. 10,000,000 / 1 Crore per annum)
  let totalAnnualTax = baseAnnualTax;
  let surchargeAmount = new Decimal(0);
  let hasSurcharge = false;

  if (taxableAnnualNum > 10000000) {
    hasSurcharge = true;
    surchargeAmount = baseAnnualTax.times(0.10);
    totalAnnualTax = baseAnnualTax.plus(surchargeAmount);
    marginalBracket = `${marginalBracket} + 10% Surcharge`;
  }

  const monthlyTax = totalAnnualTax.dividedBy(12);
  const monthlyTakeHome = grossMonthly.minus(monthlyTax);
  const annualTakeHome = grossAnnual.minus(totalAnnualTax);
  const effectiveRate = grossAnnual.isZero()
    ? 0
    : totalAnnualTax.dividedBy(grossAnnual).times(100).toNumber();

  const nonFilerNote = !input.isFiler
    ? 'Non-Filers in Pakistan face 100% to 200% higher withholding tax on bank cash withdrawals (>Rs. 50k/day), vehicle registrations, and property transactions.'
    : undefined;

  return {
    grossMonthlySalary: grossMonthly.toNumber(),
    grossAnnualSalary: grossAnnualNum,
    taxableAnnualIncome: taxableAnnualNum,
    taxableMonthlyIncome: taxableMonthlyNum,
    monthlyTax: Math.round(monthlyTax.toNumber()),
    annualTax: Math.round(totalAnnualTax.toNumber()),
    baseAnnualTax: Math.round(baseAnnualTax.toNumber()),
    surchargeAmount: Math.round(surchargeAmount.toNumber()),
    hasSurcharge,
    monthlyTakeHome: Math.round(monthlyTakeHome.toNumber()),
    annualTakeHome: Math.round(annualTakeHome.toNumber()),
    effectiveTaxRate: Number(effectiveRate.toFixed(2)),
    marginalTaxBracket: marginalBracket,
    activeSlabNumber,
    taxSlabBreakdown: breakdown,
    nonFilerNote,
  };
}
