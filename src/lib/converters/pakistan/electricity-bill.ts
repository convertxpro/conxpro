import Decimal from 'decimal.js';

export type DiscoCompany =
  | 'LESCO'
  | 'IESCO'
  | 'MEPCO'
  | 'GEPCO'
  | 'FESCO'
  | 'PESCO'
  | 'HESCO'
  | 'SEPCO'
  | 'QESCO'
  | 'TESCO'
  | 'K-Electric';

export interface DiscoInfo {
  name: DiscoCompany;
  fullName: string;
  fullNameUrdu: string;
  headquarters: string;
  headquartersUrdu: string;
  coverageAreas: string[];
  coverageUrdu: string;
  website: string;
}

export const DISCO_COMPANIES: Record<DiscoCompany, DiscoInfo> = {
  LESCO: {
    name: 'LESCO',
    fullName: 'Lahore Electric Supply Company',
    fullNameUrdu: 'لاہور الیکٹرک سپلائی کمپنی',
    headquarters: 'Lahore',
    headquartersUrdu: 'لاہور',
    coverageAreas: ['Lahore', 'Kasur', 'Okara', 'Sheikhupura', 'Nankana Sahib'],
    coverageUrdu: 'لاہور، قصور، اوکاڑہ، شیخوپورہ، ننکانہ صاحب',
    website: 'https://www.lesco.gov.pk',
  },
  IESCO: {
    name: 'IESCO',
    fullName: 'Islamabad Electric Supply Company',
    fullNameUrdu: 'اسلام آباد الیکٹرک سپلائی کمپنی',
    headquarters: 'Islamabad',
    headquartersUrdu: 'اسلام آباد',
    coverageAreas: ['Islamabad', 'Rawalpindi', 'Attock', 'Jhelum', 'Chakwal'],
    coverageUrdu: 'اسلام آباد، راولپنڈی، اٹک، جہلم، چکوال',
    website: 'https://iesco.com.pk',
  },
  MEPCO: {
    name: 'MEPCO',
    fullName: 'Multan Electric Power Company',
    fullNameUrdu: 'ملتان الیکٹرک پاور کمپنی',
    headquarters: 'Multan',
    headquartersUrdu: 'ملتان',
    coverageAreas: ['Multan', 'Bahawalpur', 'DG Khan', 'Sahiwal', 'Rahim Yar Khan', 'Muzaffargarh', 'Vehari'],
    coverageUrdu: 'ملتان، بہاولپور، ڈیرہ غازی خان، ساہیوال، رحیم یار خان',
    website: 'https://mepco.com.pk',
  },
  GEPCO: {
    name: 'GEPCO',
    fullName: 'Gujranwala Electric Power Company',
    fullNameUrdu: 'گوجرانوالہ الیکٹرک پاور کمپنی',
    headquarters: 'Gujranwala',
    headquartersUrdu: 'گوجرانوالہ',
    coverageAreas: ['Gujranwala', 'Sialkot', 'Gujrat', 'Hafizabad', 'Narowal', 'Mandi Bahauddin'],
    coverageUrdu: 'گوجرانوالہ، سیالکوٹ، گجرات، حافظ آباد، نارووال',
    website: 'https://gepco.com.pk',
  },
  FESCO: {
    name: 'FESCO',
    fullName: 'Faisalabad Electric Supply Company',
    fullNameUrdu: 'فیصل آباد الیکٹرک سپلائی کمپنی',
    headquarters: 'Faisalabad',
    headquartersUrdu: 'فیصل آباد',
    coverageAreas: ['Faisalabad', 'Sargodha', 'Mianwali', 'Jhang', 'Chiniot', 'Toba Tek Singh', 'Khushab'],
    coverageUrdu: 'فیصل آباد، سرگودھا، میانوالی، جھنگ، چنیوٹ',
    website: 'https://fesco.com.pk',
  },
  PESCO: {
    name: 'PESCO',
    fullName: 'Peshawar Electric Supply Company',
    fullNameUrdu: 'پشاور الیکٹرک سپلائی کمپنی',
    headquarters: 'Peshawar',
    headquartersUrdu: 'پشاور',
    coverageAreas: ['Peshawar', 'Mardan', 'Swat', 'Abbottabad', 'Nowshera', 'Charsadda', 'Swabi', 'Kohat'],
    coverageUrdu: 'پشاور، مردان، سوات، ایبٹ آباد، نوشہرہ، صوابی',
    website: 'https://pesco.com.pk',
  },
  HESCO: {
    name: 'HESCO',
    fullName: 'Hyderabad Electric Supply Company',
    fullNameUrdu: 'حیدرآباد الیکٹرک سپلائی کمپنی',
    headquarters: 'Hyderabad',
    headquartersUrdu: 'حیدرآباد',
    coverageAreas: ['Hyderabad', 'Jamshoro', 'Mirpurkhas', 'Thatta', 'Badin', 'Nawabshah', 'Tando Allahyar'],
    coverageUrdu: 'حیدرآباد، جامشورو، میرپورخاص، ٹھٹھہ، بدین',
    website: 'https://hesco.gov.pk',
  },
  SEPCO: {
    name: 'SEPCO',
    fullName: 'Sukkur Electric Power Company',
    fullNameUrdu: 'سکھر الیکٹرک پاور کمپنی',
    headquarters: 'Sukkur',
    headquartersUrdu: 'سکھر',
    coverageAreas: ['Sukkur', 'Larkana', 'Shikarpur', 'Jacobabad', 'Ghotki', 'Khairpur', 'Kashmore'],
    coverageUrdu: 'سکھر، لاڑکانہ، شکارپور، جیکب آباد، خیرپور',
    website: 'https://sepco.com.pk',
  },
  QESCO: {
    name: 'QESCO',
    fullName: 'Quetta Electric Supply Company',
    fullNameUrdu: 'کوئٹہ الیکٹرک سپلائی کمپنی',
    headquarters: 'Quetta',
    headquartersUrdu: 'کوئٹہ',
    coverageAreas: ['Quetta', 'Gwadar', 'Turbat', 'Khuzdar', 'Pishin', 'Loralai', 'Sibi', 'Chaman'],
    coverageUrdu: 'کوئٹہ، گوادر، تربت، خضدار، پشین، لورالائی',
    website: 'https://qesco.com.pk',
  },
  TESCO: {
    name: 'TESCO',
    fullName: 'Tribal Electric Supply Company',
    fullNameUrdu: 'قبائلی الیکٹرک سپلائی کمپنی',
    headquarters: 'Peshawar / FATA',
    headquartersUrdu: 'پشاور / قبائلی اضلاع',
    coverageAreas: ['Khyber', 'Bajaur', 'Mohmand', 'Kurram', 'North Waziristan', 'South Waziristan', 'Orakzai'],
    coverageUrdu: 'خیبر، باجوڑ، مہمند، کرم، وزیرستان، اورکزئی',
    website: 'https://pesco.com.pk',
  },
  'K-Electric': {
    name: 'K-Electric',
    fullName: 'K-Electric Limited (Karachi)',
    fullNameUrdu: 'کے الیکٹرک لمیٹڈ کراچی',
    headquarters: 'Karachi',
    headquartersUrdu: 'کراچی',
    coverageAreas: ['Karachi Central', 'Karachi East', 'Karachi South', 'Karachi West', 'Malir', 'Korangi', 'Hub'],
    coverageUrdu: 'کراچی کے تمام اضلاع بشمول حب بلوچستان',
    website: 'https://www.ke.com.pk',
  },
};

export interface SlabTier {
  range: string;
  rangeUrdu: string;
  minUnits: number;
  maxUnits: number;
  ratePerUnit: number;
  isLifeline?: boolean;
}

export const PROTECTED_SLABS: SlabTier[] = [
  { range: '1 - 50 Units (Life-Line)', rangeUrdu: '1 تا 50 یونٹس (لائف لائن)', minUnits: 1, maxUnits: 50, ratePerUnit: 3.95, isLifeline: true },
  { range: '1 - 100 Units (Protected)', rangeUrdu: '1 تا 100 یونٹس (محفوظ)', minUnits: 1, maxUnits: 100, ratePerUnit: 7.74 },
  { range: '101 - 200 Units (Protected)', rangeUrdu: '101 تا 200 یونٹس (محفوظ)', minUnits: 101, maxUnits: 200, ratePerUnit: 14.16 },
];

export const UNPROTECTED_SLABS: SlabTier[] = [
  { range: '1 - 100 Units', rangeUrdu: '1 تا 100 یونٹس', minUnits: 1, maxUnits: 100, ratePerUnit: 16.48 },
  { range: '101 - 200 Units', rangeUrdu: '101 تا 200 یونٹس', minUnits: 101, maxUnits: 200, ratePerUnit: 22.95 },
  { range: '201 - 300 Units', rangeUrdu: '201 تا 300 یونٹس', minUnits: 201, maxUnits: 300, ratePerUnit: 27.14 },
  { range: '301 - 700 Units', rangeUrdu: '301 تا 700 یونٹس', minUnits: 301, maxUnits: 700, ratePerUnit: 35.57 },
  { range: 'Above 700 Units', rangeUrdu: '700 یونٹس سے زائد', minUnits: 701, maxUnits: Infinity, ratePerUnit: 42.72 },
];

export const TOU_RATES = {
  peakRate: 42.00,
  offPeakRate: 35.50,
  solarExportRate: 24.50, // Indicative NEPRA buyback rate
};

export interface ElectricityBillInput {
  company: DiscoCompany;
  connectionType: 'single_phase' | 'three_phase';
  isProtected: boolean; // Consumed <200 units consecutively for last 6 months
  unitsConsumed: number; // For single phase or total consumption
  peakUnitsConsumed?: number; // For three phase ToU
  offPeakUnitsConsumed?: number; // For three phase ToU
  fuelPriceAdjustmentPerUnit?: number; // FPA rate, default: Rs. 3.50
  isSolarNetMetering: boolean;
  solarExportedUnits?: number; // Exported to grid (kWh)
  solarExportPeakUnits?: number;
  solarExportOffPeakUnits?: number;
  isNonFiler?: boolean; // Section 235 advance tax for non-filers on bills > Rs 25,000
}

export interface ElectricityBillResult {
  company: DiscoCompany;
  companyInfo: DiscoInfo;
  connectionType: 'single_phase' | 'three_phase';
  isProtected: boolean;
  isSolarNetMetering: boolean;
  grossUnitsConsumed: number;
  solarExportedUnits: number;
  netUnitsBilled: number;
  surplusExportCreditsPkr: number;

  baseElectricityCost: number;
  fpaAmount: number;
  fcSurchargeAmount: number;
  electricityDutyAmount: number;
  generalSalesTaxAmount: number; // 18% GST
  tvFee: number; // Rs. 35 fixed
  incomeTaxAmount: number; // Section 235 (7.5% if bill > 25,000 for non-filers)
  totalEstimatedBillPkr: number;
  effectiveCostPerUnit: number;

  tariffSlabApplied: string;
  tariffSlabAppliedUrdu: string;
  solarSavingsPkr?: number;
  taxBreakdown: Array<{ taxName: string; taxNameUrdu: string; amountPkr: number; rateDesc: string }>;
  slabBreakdown: Array<{ slabName: string; unitsBilled: number; ratePerUnit: number; costPkr: number }>;
}

export function calculateElectricityBill(input: ElectricityBillInput): ElectricityBillResult {
  const companyInfo = DISCO_COMPANIES[input.company] || DISCO_COMPANIES.LESCO;
  const isThreePhase = input.connectionType === 'three_phase';
  const fpaRate = input.fuelPriceAdjustmentPerUnit !== undefined ? input.fuelPriceAdjustmentPerUnit : 3.5;

  let grossUnits = 0;
  let netUnits = 0;
  let solarExportUnits = input.isSolarNetMetering ? (input.solarExportedUnits || 0) : 0;
  let surplusCredits = new Decimal(0);

  let baseCost = new Decimal(0);
  let slabDesc = '';
  let slabDescUrdu = '';
  const slabBreakdown: Array<{ slabName: string; unitsBilled: number; ratePerUnit: number; costPkr: number }> = [];

  if (isThreePhase) {
    const peak = input.peakUnitsConsumed || 0;
    const offPeak = input.offPeakUnitsConsumed || 0;
    grossUnits = peak + offPeak;

    let netPeak = peak;
    let netOffPeak = offPeak;

    if (input.isSolarNetMetering) {
      const expPeak = input.solarExportPeakUnits || 0;
      const expOffPeak = input.solarExportOffPeakUnits || (solarExportUnits > 0 ? solarExportUnits : 0);

      netPeak = Math.max(0, peak - expPeak);
      netOffPeak = Math.max(0, offPeak - expOffPeak);

      const surplusTotal = Math.max(0, (expPeak + expOffPeak) - grossUnits);
      if (surplusTotal > 0) {
        surplusCredits = new Decimal(surplusTotal).times(TOU_RATES.solarExportRate);
      }
    }

    netUnits = netPeak + netOffPeak;

    const peakCost = new Decimal(netPeak).times(TOU_RATES.peakRate);
    const offPeakCost = new Decimal(netOffPeak).times(TOU_RATES.offPeakRate);
    baseCost = peakCost.plus(offPeakCost);

    slabDesc = `Three-Phase ToU (Peak @ Rs. ${TOU_RATES.peakRate}, Off-Peak @ Rs. ${TOU_RATES.offPeakRate})`;
    slabDescUrdu = `تھری فیز ٹی او یو (پیک ریٹ: ${TOU_RATES.peakRate}، آف پیک: ${TOU_RATES.offPeakRate})`;

    if (netPeak > 0) {
      slabBreakdown.push({
        slabName: `Peak Hours (${netPeak} Units @ Rs. ${TOU_RATES.peakRate})`,
        unitsBilled: netPeak,
        ratePerUnit: TOU_RATES.peakRate,
        costPkr: Math.round(peakCost.toNumber()),
      });
    }
    if (netOffPeak > 0) {
      slabBreakdown.push({
        slabName: `Off-Peak Hours (${netOffPeak} Units @ Rs. ${TOU_RATES.offPeakRate})`,
        unitsBilled: netOffPeak,
        ratePerUnit: TOU_RATES.offPeakRate,
        costPkr: Math.round(offPeakCost.toNumber()),
      });
    }
  } else {
    // Single Phase Domestic
    grossUnits = Math.max(0, input.unitsConsumed || 0);

    if (input.isSolarNetMetering) {
      netUnits = Math.max(0, grossUnits - solarExportUnits);
      if (solarExportUnits > grossUnits) {
        surplusCredits = new Decimal(solarExportUnits - grossUnits).times(TOU_RATES.solarExportRate);
      }
    } else {
      netUnits = grossUnits;
    }

    if (input.isProtected) {
      if (netUnits <= 50) {
        baseCost = new Decimal(netUnits).times(3.95);
        slabDesc = 'Protected (1 - 50 Units Life-Line @ Rs. 3.95)';
        slabDescUrdu = 'محفوظ کیٹیگری (1 تا 50 یونٹس لائف لائن @ 3.95 روپے)';
        slabBreakdown.push({ slabName: '1 - 50 Units (Life-Line)', unitsBilled: netUnits, ratePerUnit: 3.95, costPkr: Math.round(baseCost.toNumber()) });
      } else if (netUnits <= 100) {
        baseCost = new Decimal(netUnits).times(7.74);
        slabDesc = 'Protected (1 - 100 Units @ Rs. 7.74)';
        slabDescUrdu = 'محفوظ کیٹیگری (1 تا 100 یونٹس @ 7.74 روپے)';
        slabBreakdown.push({ slabName: '1 - 100 Units (Protected)', unitsBilled: netUnits, ratePerUnit: 7.74, costPkr: Math.round(baseCost.toNumber()) });
      } else {
        baseCost = new Decimal(netUnits).times(14.16);
        slabDesc = 'Protected (101 - 200 Units @ Rs. 14.16)';
        slabDescUrdu = 'محفوظ کیٹیگری (101 تا 200 یونٹس @ 14.16 روپے)';
        slabBreakdown.push({ slabName: '101 - 200 Units (Protected)', unitsBilled: netUnits, ratePerUnit: 14.16, costPkr: Math.round(baseCost.toNumber()) });
      }
    } else {
      // Unprotected Domestic Slabs
      if (netUnits <= 100) {
        baseCost = new Decimal(netUnits).times(16.48);
        slabDesc = 'Unprotected (1 - 100 Units @ Rs. 16.48)';
        slabDescUrdu = 'غیر محفوظ کیٹیگری (1 تا 100 یونٹس @ 16.48 روپے)';
        slabBreakdown.push({ slabName: '1 - 100 Units', unitsBilled: netUnits, ratePerUnit: 16.48, costPkr: Math.round(baseCost.toNumber()) });
      } else if (netUnits <= 200) {
        baseCost = new Decimal(netUnits).times(22.95);
        slabDesc = 'Unprotected (101 - 200 Units @ Rs. 22.95)';
        slabDescUrdu = 'غیر محفوظ کیٹیگری (101 تا 200 یونٹس @ 22.95 روپے)';
        slabBreakdown.push({ slabName: '101 - 200 Units', unitsBilled: netUnits, ratePerUnit: 22.95, costPkr: Math.round(baseCost.toNumber()) });
      } else if (netUnits <= 300) {
        baseCost = new Decimal(netUnits).times(27.14);
        slabDesc = 'Unprotected (201 - 300 Units @ Rs. 27.14)';
        slabDescUrdu = 'غیر محفوظ کیٹیگری (201 تا 300 یونٹس @ 27.14 روپے)';
        slabBreakdown.push({ slabName: '201 - 300 Units', unitsBilled: netUnits, ratePerUnit: 27.14, costPkr: Math.round(baseCost.toNumber()) });
      } else if (netUnits <= 700) {
        baseCost = new Decimal(netUnits).times(35.57);
        slabDesc = 'Unprotected (301 - 700 Units @ Rs. 35.57)';
        slabDescUrdu = 'غیر محفوظ کیٹیگری (301 تا 700 یونٹس @ 35.57 روپے)';
        slabBreakdown.push({ slabName: '301 - 700 Units', unitsBilled: netUnits, ratePerUnit: 35.57, costPkr: Math.round(baseCost.toNumber()) });
      } else {
        baseCost = new Decimal(netUnits).times(42.72);
        slabDesc = 'Unprotected (>700 Units @ Rs. 42.72)';
        slabDescUrdu = 'غیر محفوظ کیٹیگری (700 سے زائد یونٹس @ 42.72 روپے)';
        slabBreakdown.push({ slabName: 'Above 700 Units', unitsBilled: netUnits, ratePerUnit: 42.72, costPkr: Math.round(baseCost.toNumber()) });
      }
    }
  }

  const fpaAmount = new Decimal(netUnits).times(fpaRate);
  const fcSurcharge = new Decimal(netUnits).times(3.23); // Financing Cost Surcharge (Rs. 3.23/kWh)
  const electricityDuty = baseCost.times(0.015); // 1.5% ED on base cost
  const subtotalBeforeGst = baseCost.plus(fpaAmount).plus(fcSurcharge).plus(electricityDuty);
  const gst = subtotalBeforeGst.times(0.18); // 18% General Sales Tax
  const tvFee = netUnits > 0 ? new Decimal(35) : new Decimal(0);

  const preliminaryBill = subtotalBeforeGst.plus(gst).plus(tvFee);

  // Income Tax under Section 235 for Non-Filers on domestic electricity bills exceeding Rs. 25,000 (7.5%)
  let incomeTax = new Decimal(0);
  if (input.isNonFiler && preliminaryBill.toNumber() > 25000) {
    incomeTax = preliminaryBill.times(0.075);
  }

  const rawTotalBill = preliminaryBill.plus(incomeTax).minus(surplusCredits);
  const totalBillPkr = Math.max(0, Math.round(rawTotalBill.toNumber()));
  const effectivePerUnit = netUnits > 0 ? (totalBillPkr / netUnits) : 0;

  // Solar Savings Calculation
  let solarSavings: number | undefined;
  if (input.isSolarNetMetering && solarExportUnits > 0) {
    const billWithoutSolar = calculateElectricityBill({
      ...input,
      isSolarNetMetering: false,
      solarExportedUnits: 0,
      solarExportPeakUnits: 0,
      solarExportOffPeakUnits: 0,
    });
    solarSavings = Math.max(0, billWithoutSolar.totalEstimatedBillPkr - totalBillPkr);
  }

  const taxBreakdown = [
    {
      taxName: 'Base Energy Cost',
      taxNameUrdu: 'بنیادی بجلی کا خرچ',
      amountPkr: Math.round(baseCost.toNumber()),
      rateDesc: slabDesc,
    },
    {
      taxName: `Fuel Price Adjustment (FPA)`,
      taxNameUrdu: 'فیول پرائس ایڈجسٹمنٹ (ایف پی اے)',
      amountPkr: Math.round(fpaAmount.toNumber()),
      rateDesc: `@ Rs. ${fpaRate.toFixed(2)}/unit`,
    },
    {
      taxName: 'Financing Cost (FC) Surcharge',
      taxNameUrdu: 'فنانسنگ کاسٹ سرچارج',
      amountPkr: Math.round(fcSurcharge.toNumber()),
      rateDesc: '@ Rs. 3.23/unit',
    },
    {
      taxName: 'Electricity Duty (ED)',
      taxNameUrdu: 'الیکٹرسٹی ڈیوٹی',
      amountPkr: Math.round(electricityDuty.toNumber()),
      rateDesc: '1.5% of base energy cost',
    },
    {
      taxName: 'General Sales Tax (GST)',
      taxNameUrdu: 'جنرل سیلز ٹیکس (جی ایس ٹی)',
      amountPkr: Math.round(gst.toNumber()),
      rateDesc: '18% statutory sales tax',
    },
    {
      taxName: 'PTV / Radio Fee',
      taxNameUrdu: 'پی ٹی وی فیس',
      amountPkr: tvFee.toNumber(),
      rateDesc: 'Rs. 35 fixed monthly fee',
    },
  ];

  if (incomeTax.toNumber() > 0) {
    taxBreakdown.push({
      taxName: 'Advance Income Tax (Sec 235)',
      taxNameUrdu: 'انکم ٹیکس سیکشن 235 (نان فائلر)',
      amountPkr: Math.round(incomeTax.toNumber()),
      rateDesc: '7.5% on bills > Rs. 25,000 for Non-Filers',
    });
  }

  if (surplusCredits.toNumber() > 0) {
    taxBreakdown.push({
      taxName: 'Solar Grid Export Credit (Surplus)',
      taxNameUrdu: 'اضافی سولر کریڈٹ (گرڈ ریفنڈ)',
      amountPkr: -Math.round(surplusCredits.toNumber()),
      rateDesc: `@ Rs. ${TOU_RATES.solarExportRate}/unit surplus buyback`,
    });
  }

  return {
    company: input.company,
    companyInfo,
    connectionType: input.connectionType,
    isProtected: input.isProtected,
    isSolarNetMetering: input.isSolarNetMetering,
    grossUnitsConsumed: grossUnits,
    solarExportedUnits: solarExportUnits,
    netUnitsBilled: netUnits,
    surplusExportCreditsPkr: Math.round(surplusCredits.toNumber()),
    baseElectricityCost: Math.round(baseCost.toNumber()),
    fpaAmount: Math.round(fpaAmount.toNumber()),
    fcSurchargeAmount: Math.round(fcSurcharge.toNumber()),
    electricityDutyAmount: Math.round(electricityDuty.toNumber()),
    generalSalesTaxAmount: Math.round(gst.toNumber()),
    tvFee: tvFee.toNumber(),
    incomeTaxAmount: Math.round(incomeTax.toNumber()),
    totalEstimatedBillPkr: totalBillPkr,
    effectiveCostPerUnit: Number(effectivePerUnit.toFixed(2)),
    tariffSlabApplied: slabDesc,
    tariffSlabAppliedUrdu: slabDescUrdu,
    solarSavingsPkr: solarSavings ? Math.round(solarSavings) : undefined,
    taxBreakdown,
    slabBreakdown,
  };
}
