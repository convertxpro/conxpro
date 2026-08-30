# SUB-PROMPT 05: Pakistan Financial Calculators — FBR Salary Tax & Zakat Calculator Suite

## 1. Context & Objective
In Pakistan, salary tax and Islamic financial obligations generate massive seasonal and monthly search queries:
- **Salary Tax:** Every salaried professional, HR manager, and business individual in Pakistan searches for *"FBR salary tax calculator 2024-2025"*, *"Income tax slabs Pakistan"*, *"Filer vs Non-Filer salary deduction"*.
- **Zakat:** Tens of millions of Pakistanis calculate their annual Zakat obligations, especially before and during Ramadan, needing dynamic gold/silver Nisab threshold calculations in PKR and multi-asset wealth deductions.

Your objective in this sub-prompt is to build:
1. **Tool B1: FBR Salary & Income Tax Calculator (Tax Year 2024–2026)** (`fbr-salary-tax-calculator`).
2. **Tool B2: Zakat Calculator with Dynamic Gold/Silver Nisab** (`zakat-calculator`).
3. Dedicated interactive components in `src/components/converters/pakistan/` wired into `ConverterCanvas.tsx`.
4. High-ranking programmatic SEO with bilingual Urdu/English metadata, tax slab reference tables, and printable/shareable summaries.

---

## 2. Technical Stack & Dependencies

- **Precision Mathematics:** `decimal.js` for zero-rounding error currency math
- **Urdu Typography:** Google Fonts `Noto Nastaliq Urdu`
- **Charts & Visuals:** Lightweight SVG chart breakdown or `recharts` / `chart.js`
- **Export & Print:** Native browser print CSS styling

Install dependencies:
```bash
npm install decimal.js
```

---

## 3. Tool B1: FBR Salary & Income Tax Calculator (Tax Year 2024–2026)

### 3.1 Statutory Tax Slabs & Calculation Engine (`src/lib/converters/pakistan/fbr-tax.ts`)
Under the Government of Pakistan Finance Act for Salaried Individuals:

| Annual Taxable Income (PKR) | Tax Rate Formula |
|---|---|
| **0 – 600,000** (Up to Rs. 50,000/mo) | **0%** (Exempt) |
| **600,001 – 1,200,000** (Rs. 50k – 100k/mo) | **5%** of the amount exceeding Rs. 600,000 |
| **1,200,001 – 2,200,000** (Rs. 100k – 183.3k/mo) | **Rs. 30,000 + 15%** of the amount exceeding Rs. 1,200,000 |
| **2,200,001 – 3,200,000** (Rs. 183.3k – 266.6k/mo) | **Rs. 180,000 + 25%** of the amount exceeding Rs. 2,200,000 |
| **3,200,001 – 4,100,000** (Rs. 266.6k – 341.6k/mo) | **Rs. 430,000 + 30%** of the amount exceeding Rs. 3,200,000 |
| **Above 4,100,000** (> Rs. 341.6k/mo) | **Rs. 700,000 + 35%** of the amount exceeding Rs. 4,100,000 |

*Note: Surcharge of 10% applies to taxable income exceeding Rs. 10,000,000 per annum.*

```typescript
import Decimal from 'decimal.js';

export interface TaxCalculationInput {
  monthlySalary?: number;
  annualSalary?: number;
  individualType: 'salaried' | 'non-salaried' | 'business';
  taxYear: '2024-2025' | '2025-2026';
  isFiler: boolean;
}

export interface TaxCalculationResult {
  grossMonthlySalary: number;
  grossAnnualSalary: number;
  monthlyTax: number;
  annualTax: number;
  monthlyTakeHome: number;
  annualTakeHome: number;
  effectiveTaxRate: number;
  marginalTaxBracket: string;
  taxSlabBreakdown: Array<{ slab: string; rate: string; taxableInSlab: number; taxAmount: number }>;
}

export function calculateFbrTax(input: TaxCalculationInput): TaxCalculationResult {
  const grossMonthly = input.monthlySalary
    ? new Decimal(input.monthlySalary)
    : new Decimal(input.annualSalary || 0).dividedBy(12);

  const grossAnnual = grossMonthly.times(12);
  const annualAmount = grossAnnual.toNumber();

  let annualTax = new Decimal(0);
  let marginalBracket = '0% (Exempt)';
  const breakdown: TaxCalculationResult['taxSlabBreakdown'] = [];

  if (input.individualType === 'salaried') {
    if (annualAmount <= 600000) {
      marginalBracket = '0% (Exempt)';
      breakdown.push({ slab: 'Up to Rs. 600,000', rate: '0%', taxableInSlab: annualAmount, taxAmount: 0 });
    } else if (annualAmount <= 1200000) {
      marginalBracket = '5%';
      const taxable = annualAmount - 600000;
      const tax = new Decimal(taxable).times(0.05);
      annualTax = tax;
      breakdown.push({ slab: 'Rs. 600,001 - 1,200,000', rate: '5%', taxableInSlab: taxable, taxAmount: tax.toNumber() });
    } else if (annualAmount <= 2200000) {
      marginalBracket = '15%';
      const taxable = annualAmount - 1200000;
      const tax = new Decimal(30000).plus(new Decimal(taxable).times(0.15));
      annualTax = tax;
      breakdown.push({ slab: 'Rs. 1,200,001 - 2,200,000', rate: '15%', taxableInSlab: taxable, taxAmount: tax.toNumber() });
    } else if (annualAmount <= 3200000) {
      marginalBracket = '25%';
      const taxable = annualAmount - 2200000;
      const tax = new Decimal(180000).plus(new Decimal(taxable).times(0.25));
      annualTax = tax;
      breakdown.push({ slab: 'Rs. 2,200,001 - 3,200,000', rate: '25%', taxableInSlab: taxable, taxAmount: tax.toNumber() });
    } else if (annualAmount <= 4100000) {
      marginalBracket = '30%';
      const taxable = annualAmount - 3200000;
      const tax = new Decimal(430000).plus(new Decimal(taxable).times(0.30));
      annualTax = tax;
      breakdown.push({ slab: 'Rs. 3,200,001 - 4,100,000', rate: '30%', taxableInSlab: taxable, taxAmount: tax.toNumber() });
    } else {
      marginalBracket = '35%';
      const taxable = annualAmount - 4100000;
      let tax = new Decimal(700000).plus(new Decimal(taxable).times(0.35));
      // 10% super surcharge for income > 10 million
      if (annualAmount > 10000000) {
        tax = tax.times(1.10);
        marginalBracket = '35% + 10% Surcharge';
      }
      annualTax = tax;
      breakdown.push({ slab: 'Above Rs. 4,100,000', rate: '35%', taxableInSlab: taxable, taxAmount: tax.toNumber() });
    }
  } else {
    // Business / Non-Salaried Slabs (Starts taxing at Rs. 600,000 with 15% rate)
    if (annualAmount > 600000) {
      const taxable = annualAmount - 600000;
      annualTax = new Decimal(taxable).times(0.15);
      marginalBracket = '15% (Business Individual)';
    }
  }

  const monthlyTax = annualTax.dividedBy(12);
  const monthlyTakeHome = grossMonthly.minus(monthlyTax);
  const annualTakeHome = grossAnnual.minus(annualTax);
  const effectiveRate = grossAnnual.isZero() ? 0 : annualTax.dividedBy(grossAnnual).times(100).toNumber();

  return {
    grossMonthlySalary: grossMonthly.toNumber(),
    grossAnnualSalary: grossAnnual.toNumber(),
    monthlyTax: Math.round(monthlyTax.toNumber()),
    annualTax: Math.round(annualTax.toNumber()),
    monthlyTakeHome: Math.round(monthlyTakeHome.toNumber()),
    annualTakeHome: Math.round(annualTakeHome.toNumber()),
    effectiveTaxRate: Number(effectiveRate.toFixed(2)),
    marginalTaxBracket: marginalBracket,
    taxSlabBreakdown: breakdown,
  };
}
```

### 3.2 UI Component (`src/components/converters/pakistan/FbrTaxCalculatorComponent.tsx`)
- **Interactive Inputs:** Toggle between Monthly and Annual input modes; Filer vs Non-Filer badge; Salaried vs Business category.
- **Metric Cards:**
  - 💵 **Net Monthly Take-Home:** Highlighted in emerald green with South Asian format (e.g., `Rs. 1,85,000 / month`).
  - 📉 **Monthly Tax Deduction:** Highlighted in rose red (e.g., `Rs. 15,000 / month`).
  - 📊 **Effective Tax Rate:** Percentage badge (e.g., `7.5%`).
- **Visual Salary Distribution Bar:** Visual bar showing Take-Home Pay vs FBR Tax.
- **Interactive 2024–2026 Slab Reference Table:** Full statutory schedule with currently active user tier highlighted.

---

## 4. Tool B2: Zakat Calculator (PKR / Gold / Silver Nisab)

### 4.1 Islamic Zakat Calculation Engine (`src/lib/converters/pakistan/zakat-engine.ts`)
```typescript
import Decimal from 'decimal.js';

export interface ZakatAssetsInput {
  cashInHandAndBank: number;
  goldWeightTolas: number;
  goldPurityKarat: 24 | 22 | 21 | 18;
  goldRatePerTolaPkr: number; // default: ~Rs. 275,000
  silverWeightTolas: number;
  silverRatePerTolaPkr: number; // default: ~Rs. 3,200
  businessInventoryValue: number;
  sharesMutualFundsReceivables: number;
  immediateDebtsAndLiabilities: number;
  nisabStandard: 'gold' | 'silver'; // Silver is recommended by majority scholars for maximum charity benefit
}

export interface ZakatResult {
  totalAssetsPkr: number;
  totalLiabilitiesPkr: number;
  netZakatableWealthPkr: number;
  goldNisabThresholdPkr: number; // 7.5 Tolas * Gold Rate
  silverNisabThresholdPkr: number; // 52.5 Tolas * Silver Rate
  activeNisabThresholdPkr: number;
  isEligibleToPayZakat: boolean;
  totalZakatDuePkr: number; // Exactly 2.5% (1/40th)
  assetBreakdown: Array<{ item: string; valuePkr: number }>;
}

export function calculateZakat(input: ZakatAssetsInput): ZakatResult {
  const goldPurityMultiplier = input.goldPurityKarat / 24;
  const goldValue = new Decimal(input.goldWeightTolas)
    .times(input.goldRatePerTolaPkr)
    .times(goldPurityMultiplier);

  const silverValue = new Decimal(input.silverWeightTolas).times(input.silverRatePerTolaPkr);
  const cash = new Decimal(input.cashInHandAndBank);
  const inventory = new Decimal(input.businessInventoryValue);
  const receivables = new Decimal(input.sharesMutualFundsReceivables);
  const liabilities = new Decimal(input.immediateDebtsAndLiabilities);

  const totalAssets = cash.plus(goldValue).plus(silverValue).plus(inventory).plus(receivables);
  const netZakatableWealth = Decimal.max(0, totalAssets.minus(liabilities));

  const goldNisab = new Decimal(7.5).times(input.goldRatePerTolaPkr);
  const silverNisab = new Decimal(52.5).times(input.silverRatePerTolaPkr);
  const activeNisab = input.nisabStandard === 'gold' ? goldNisab : silverNisab;

  const isEligible = netZakatableWealth.greaterThanOrEqualTo(activeNisab);
  const totalZakatDue = isEligible ? netZakatableWealth.times(0.025) : new Decimal(0);

  return {
    totalAssetsPkr: Math.round(totalAssets.toNumber()),
    totalLiabilitiesPkr: Math.round(liabilities.toNumber()),
    netZakatableWealthPkr: Math.round(netZakatableWealth.toNumber()),
    goldNisabThresholdPkr: Math.round(goldNisab.toNumber()),
    silverNisabThresholdPkr: Math.round(silverNisab.toNumber()),
    activeNisabThresholdPkr: Math.round(activeNisab.toNumber()),
    isEligibleToPayZakat: isEligible,
    totalZakatDuePkr: Math.round(totalZakatDue.toNumber()),
    assetBreakdown: [
      { item: 'Cash in Hand & Bank Accounts', valuePkr: Math.round(cash.toNumber()) },
      { item: `Gold (${input.goldWeightTolas} Tola, ${input.goldPurityKarat}K)`, valuePkr: Math.round(goldValue.toNumber()) },
      { item: `Silver (${input.silverWeightTolas} Tola)`, valuePkr: Math.round(silverValue.toNumber()) },
      { item: 'Business Merchandise & Stock', valuePkr: Math.round(inventory.toNumber()) },
      { item: 'Receivables & Mutual Funds', valuePkr: Math.round(receivables.toNumber()) },
    ],
  };
}
```

### 4.2 UI Component (`src/components/converters/pakistan/ZakatCalculatorComponent.tsx`)
- **Nisab Standard Selector:** Silver Nisab (52.5 Tola $\approx$ Rs. 168,000 — Hanafi / Majority recommendation) vs Gold Nisab (7.5 Tola $\approx$ Rs. 2,060,000).
- **Asset Accordion Sections:** Cash & Savings, Gold Jewelry (with Tola input & 24K/22K/21K/18K purity dropdown), Silver, Trade Merchandise, Liabilities.
- **Results Banner:**
  - 🟢 **"Zakat is Obligatory (Farz) on your wealth"** or ⚪ **"Wealth is below Nisab threshold"**.
  - **Net Zakat Payable (2.5%):** Displayed in large numerals with Urdu words (`دس ہزار روپے`).
- **Action Buttons:** "Print / Save PDF Record", "Share Summary via WhatsApp".

---

## 5. Programmatic SEO & Structured Data

Add FAQ schemas for:
- *"How is income tax calculated on salary in Pakistan for tax year 2024–2025?"*
- *"What is the current Nisab for Zakat in PKR on Gold and Silver?"*
- *"Are personal use items like houses and cars subject to Zakat?"*

---

## 6. Acceptance Criteria & Verification Checklist

- [ ] FBR Tax calculator computes exact monthly and annual tax for both salaried and business individuals based on official 2024–2026 finance act brackets.
- [ ] 10% super surcharge is applied to salaries above Rs. 10 million.
- [ ] Zakat calculator calculates Gold purity deductions (22K = 91.6%, 21K = 87.5%, 18K = 75%) accurately.
- [ ] Silver Nisab (52.5 Tola) and Gold Nisab (7.5 Tola) thresholds reflect live user rates.
- [ ] Net Zakat is calculated as exactly 2.5% of net wealth above Nisab.
- [ ] Print view renders a clean distribution statement suitable for tax/charity records.
