import Decimal from 'decimal.js';

export type GasCompany = 'SNGPL' | 'SSGC';

export interface GasCompanyInfo {
  name: GasCompany;
  fullName: string;
  fullNameUrdu: string;
  coverageAreas: string[];
  coverageUrdu: string;
  defaultGcv: number; // BTU/Scf
  headquarters: string;
}

export const GAS_COMPANIES: Record<GasCompany, GasCompanyInfo> = {
  SNGPL: {
    name: 'SNGPL',
    fullName: 'Sui Northern Gas Pipelines Limited',
    fullNameUrdu: 'سوئی ناردرن گیس پائپ لائنز لمیٹڈ',
    coverageAreas: ['Punjab', 'Khyber Pakhtunkhwa', 'Islamabad Capital Territory', 'Azad Jammu & Kashmir'],
    coverageUrdu: 'پنجاب، خیبر پختونخوا، اسلام آباد اور آزاد کشمیر',
    defaultGcv: 1050,
    headquarters: 'Lahore, Pakistan',
  },
  SSGC: {
    name: 'SSGC',
    fullName: 'Sui Southern Gas Company',
    fullNameUrdu: 'سوئی سدرن گیس کمپنی',
    coverageAreas: ['Sindh', 'Balochistan'],
    coverageUrdu: 'سندھ اور بلوچستان کے تمام اضلاع بشمول کراچی اور کوئٹہ',
    defaultGcv: 1020,
    headquarters: 'Karachi, Pakistan',
  },
};

export interface GasSlabTier {
  category: 'Protected' | 'Non-Protected';
  slabName: string;
  slabNameUrdu: string;
  minMmbtu: number;
  maxMmbtu: number;
  ratePerMmbtu: number;
  meterRent: number;
}

export const PROTECTED_GAS_SLABS: GasSlabTier[] = [
  {
    category: 'Protected',
    slabName: 'Protected Slab 1 (Up to 0.5 MMBTU)',
    slabNameUrdu: 'محفوظ سلیب 1 (0.5 ایم ایم بی ٹی یو تک)',
    minMmbtu: 0,
    maxMmbtu: 0.5,
    ratePerMmbtu: 200,
    meterRent: 40,
  },
  {
    category: 'Protected',
    slabName: 'Protected Slab 2 (0.5 - 1.0 MMBTU)',
    slabNameUrdu: 'محفوظ سلیب 2 (0.5 تا 1.0 ایم ایم بی ٹی یو)',
    minMmbtu: 0.5001,
    maxMmbtu: 1.0,
    ratePerMmbtu: 300,
    meterRent: 40,
  },
  {
    category: 'Protected',
    slabName: 'Protected Slab 3 (1.0 - 1.5 MMBTU)',
    slabNameUrdu: 'محفوظ سلیب 3 (1.0 تا 1.5 ایم ایم بی ٹی یو)',
    minMmbtu: 1.0001,
    maxMmbtu: 1.5,
    ratePerMmbtu: 400,
    meterRent: 40,
  },
];

export const NON_PROTECTED_GAS_SLABS: GasSlabTier[] = [
  {
    category: 'Non-Protected',
    slabName: 'Non-Protected Slab 1 (Up to 0.5 MMBTU)',
    slabNameUrdu: 'غیر محفوظ سلیب 1 (0.5 ایم ایم بی ٹی یو تک)',
    minMmbtu: 0,
    maxMmbtu: 0.5,
    ratePerMmbtu: 500,
    meterRent: 500,
  },
  {
    category: 'Non-Protected',
    slabName: 'Non-Protected Slab 2 (0.5 - 1.5 MMBTU)',
    slabNameUrdu: 'غیر محفوظ سلیب 2 (0.5 تا 1.5 ایم ایم بی ٹی یو)',
    minMmbtu: 0.5001,
    maxMmbtu: 1.5,
    ratePerMmbtu: 1000,
    meterRent: 500,
  },
  {
    category: 'Non-Protected',
    slabName: 'Non-Protected Slab 3 (1.5 - 3.0 MMBTU)',
    slabNameUrdu: 'غیر محفوظ سلیب 3 (1.5 تا 3.0 ایم ایم بی ٹی یو)',
    minMmbtu: 1.5001,
    maxMmbtu: 3.0,
    ratePerMmbtu: 2000,
    meterRent: 500,
  },
  {
    category: 'Non-Protected',
    slabName: 'Non-Protected Slab 4 (Above 3.0 MMBTU)',
    slabNameUrdu: 'غیر محفوظ سلیب 4 (3.0 ایم ایم بی ٹی یو سے زائد)',
    minMmbtu: 3.0001,
    maxMmbtu: Infinity,
    ratePerMmbtu: 3500,
    meterRent: 500,
  },
];

export interface GasBillInput {
  company: GasCompany;
  meterReadingHm3: number; // Meter difference in Hundred Cubic Meters (HM³)
  grossCalorificValueGcv?: number; // Default: ~1050 BTU/Scf for SNGPL, 1020 for SSGC
  isProtectedConsumer: boolean;
}

export interface GasBillResult {
  company: GasCompany;
  companyInfo: GasCompanyInfo;
  meterReadingHm3: number;
  consumedScm: number; // Standard Cubic Meters
  consumedScf: number; // Standard Cubic Feet
  consumedMmbtu: number; // Million British Thermal Units
  grossCalorificValueGcv: number;

  isProtectedConsumer: boolean;
  activeSlab: string;
  activeSlabUrdu: string;
  gasRatePerMmbtu: number;

  gasChargesPkr: number;
  meterRentPkr: number; // Rs. 40 protected, Rs. 500 non-protected
  gstAmount: number; // 18%
  totalEstimatedBillPkr: number;

  costBreakdown: Array<{ item: string; itemUrdu: string; amountPkr: number; desc: string }>;
  protectedComparisonDiffPkr?: number;
}

/**
 * Converts between different Gas measurement units
 */
export function convertGasUnits(
  value: number,
  fromUnit: 'HM3' | 'SCM' | 'SCF' | 'MMBTU',
  gcv: number = 1050
): {
  hm3: number;
  scm: number;
  scf: number;
  mmbtu: number;
} {
  const decVal = new Decimal(Math.max(0, value));
  let hm3 = new Decimal(0);

  if (fromUnit === 'HM3') {
    hm3 = decVal;
  } else if (fromUnit === 'SCM') {
    hm3 = decVal.dividedBy(100);
  } else if (fromUnit === 'SCF') {
    hm3 = decVal.dividedBy(3531.47);
  } else if (fromUnit === 'MMBTU') {
    // MMBTU = (HM3 * 100 * 35.3147 * GCV) / 1,000,000
    // HM3 = (MMBTU * 1,000,000) / (100 * 35.3147 * GCV)
    hm3 = decVal.times(1_000_000).dividedBy(new Decimal(3531.47).times(gcv));
  }

  const scm = hm3.times(100);
  const scf = hm3.times(3531.47);
  const mmbtu = scf.times(gcv).dividedBy(1_000_000);

  return {
    hm3: Number(hm3.toFixed(4)),
    scm: Number(scm.toFixed(2)),
    scf: Number(scf.toFixed(2)),
    mmbtu: Number(mmbtu.toFixed(4)),
  };
}

/**
 * Calculates SNGPL & SSGC Domestic Gas Bill with Protected & Non-Protected OGRA Tariffs
 */
export function calculateGasBill(input: GasBillInput): GasBillResult {
  const compInfo = GAS_COMPANIES[input.company] || GAS_COMPANIES.SNGPL;
  const gcv = input.grossCalorificValueGcv || compInfo.defaultGcv;

  const hm3 = new Decimal(Math.max(0, input.meterReadingHm3 || 0));
  // 1 HM³ = 100 SCM = 3,531.47 Scf
  const scm = hm3.times(100);
  const scf = hm3.times(3531.47);
  const mmbtu = scf.times(gcv).dividedBy(1_000_000);
  const mmbtuVal = mmbtu.toNumber();

  let gasRatePerMmbtu = 0;
  let slabName = '';
  let slabNameUrdu = '';

  if (input.isProtectedConsumer) {
    if (mmbtuVal <= 0.5) {
      gasRatePerMmbtu = 200;
      slabName = 'Protected Slab 1 (Up to 0.5 MMBTU @ Rs. 200/MMBTU)';
      slabNameUrdu = 'محفوظ سلیب 1 (0.5 ایم ایم بی ٹی یو تک @ 200 روپے)';
    } else if (mmbtuVal <= 1.0) {
      gasRatePerMmbtu = 300;
      slabName = 'Protected Slab 2 (0.5 - 1.0 MMBTU @ Rs. 300/MMBTU)';
      slabNameUrdu = 'محفوظ سلیب 2 (0.5 تا 1.0 ایم ایم بی ٹی یو @ 300 روپے)';
    } else {
      gasRatePerMmbtu = 400;
      slabName = 'Protected Slab 3 (1.0 - 1.5 MMBTU @ Rs. 400/MMBTU)';
      slabNameUrdu = 'محفوظ سلیب 3 (1.0 تا 1.5 ایم ایم بی ٹی یو @ 400 روپے)';
    }
  } else {
    // Non-Protected Domestic Slabs (OGRA 2024-2025)
    if (mmbtuVal <= 0.5) {
      gasRatePerMmbtu = 500;
      slabName = 'Non-Protected Slab 1 (Up to 0.5 MMBTU @ Rs. 500/MMBTU)';
      slabNameUrdu = 'غیر محفوظ سلیب 1 (0.5 ایم ایم بی ٹی یو تک @ 500 روپے)';
    } else if (mmbtuVal <= 1.5) {
      gasRatePerMmbtu = 1000;
      slabName = 'Non-Protected Slab 2 (0.5 - 1.5 MMBTU @ Rs. 1,000/MMBTU)';
      slabNameUrdu = 'غیر محفوظ سلیب 2 (0.5 تا 1.5 ایم ایم بی ٹی یو @ 1,000 روپے)';
    } else if (mmbtuVal <= 3.0) {
      gasRatePerMmbtu = 2000;
      slabName = 'Non-Protected Slab 3 (1.5 - 3.0 MMBTU @ Rs. 2,000/MMBTU)';
      slabNameUrdu = 'غیر محفوظ سلیب 3 (1.5 تا 3.0 ایم ایم بی ٹی یو @ 2,000 روپے)';
    } else {
      gasRatePerMmbtu = 3500;
      slabName = 'Non-Protected Slab 4 (>3.0 MMBTU @ Rs. 3,500/MMBTU)';
      slabNameUrdu = 'غیر محفوظ سلیب 4 (3.0 ایم ایم بی ٹی یو سے زائد @ 3,500 روپے)';
    }
  }

  const gasCharges = mmbtu.times(gasRatePerMmbtu);
  const meterRent = input.isProtectedConsumer ? new Decimal(40) : new Decimal(500);
  const subtotal = gasCharges.plus(meterRent);
  const gst = subtotal.times(0.18);
  const total = subtotal.plus(gst);

  const costBreakdown = [
    {
      item: 'Gas Commodity Charges',
      itemUrdu: 'گیس کموڈٹی چارجز',
      amountPkr: Math.round(gasCharges.toNumber()),
      desc: `${mmbtu.toFixed(4)} MMBTU × Rs. ${gasRatePerMmbtu}`,
    },
    {
      item: 'Monthly Meter Rent',
      itemUrdu: 'ماہانہ میٹر کا کرایہ',
      amountPkr: meterRent.toNumber(),
      desc: input.isProtectedConsumer ? 'Rs. 40 (Protected Subsidized)' : 'Rs. 500 (Non-Protected Standard)',
    },
    {
      item: 'General Sales Tax (18% GST)',
      itemUrdu: 'سیلز ٹیکس (18 فیصد جی ایس ٹی)',
      amountPkr: Math.round(gst.toNumber()),
      desc: '18% of Commodity + Meter Rent',
    },
  ];

  // Calculate comparative difference if consumer was non-protected
  let protectedComparisonDiffPkr: number | undefined;
  if (input.isProtectedConsumer) {
    const nonProtectedVersion = calculateGasBill({
      ...input,
      isProtectedConsumer: false,
    });
    protectedComparisonDiffPkr = Math.max(0, nonProtectedVersion.totalEstimatedBillPkr - Math.round(total.toNumber()));
  }

  return {
    company: input.company,
    companyInfo: compInfo,
    meterReadingHm3: Number(hm3.toFixed(4)),
    consumedScm: Number(scm.toFixed(2)),
    consumedScf: Number(scf.toFixed(2)),
    consumedMmbtu: Number(mmbtuVal.toFixed(4)),
    grossCalorificValueGcv: gcv,
    isProtectedConsumer: input.isProtectedConsumer,
    activeSlab: slabName,
    activeSlabUrdu: slabNameUrdu,
    gasRatePerMmbtu,
    gasChargesPkr: Math.round(gasCharges.toNumber()),
    meterRentPkr: meterRent.toNumber(),
    gstAmount: Math.round(gst.toNumber()),
    totalEstimatedBillPkr: Math.round(total.toNumber()),
    costBreakdown,
    protectedComparisonDiffPkr,
  };
}
