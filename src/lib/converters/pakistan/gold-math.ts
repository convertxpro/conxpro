import Decimal from 'decimal.js';

export type GoldUnitKey = 'tola' | 'grams' | 'masha' | 'ratti' | 'troy_ounce' | 'ten_grams';

export interface GoldUnitMetadata {
  id: GoldUnitKey;
  name: string;
  urduName: string;
  symbol: string;
  gramsPerUnit: string;
  description: string;
}

export const GOLD_UNITS: GoldUnitMetadata[] = [
  {
    id: 'tola',
    name: 'Tola',
    urduName: 'تولہ',
    symbol: 'Tola',
    gramsPerUnit: '11.6638',
    description: 'Traditional South Asian gold standard weight. 1 Tola = 12 Masha = 96 Ratti = 11.6638 Grams.',
  },
  {
    id: 'grams',
    name: 'Grams',
    urduName: 'گرام',
    symbol: 'g',
    gramsPerUnit: '1.0',
    description: 'International metric standard for precious metals.',
  },
  {
    id: 'masha',
    name: 'Masha',
    urduName: 'ماشہ',
    symbol: 'Masha',
    gramsPerUnit: '0.9719833',
    description: '1 Tola = 12 Masha. 1 Masha = 8 Ratti = 0.972 Grams.',
  },
  {
    id: 'ratti',
    name: 'Ratti',
    urduName: 'رتی',
    symbol: 'Ratti',
    gramsPerUnit: '0.1214979',
    description: '1 Masha = 8 Ratti (1 Tola = 96 Ratti = 0.1215 Grams).',
  },
  {
    id: 'troy_ounce',
    name: 'Troy Ounce (oz t)',
    urduName: 'ٹرائے اونس',
    symbol: 'oz t',
    gramsPerUnit: '31.1034768',
    description: 'Global benchmark trading unit (1 Troy Oz = 31.1035g ≈ 2.6667 Tola).',
  },
  {
    id: 'ten_grams',
    name: '10 Grams (دس گرام)',
    urduName: 'دس گرام',
    symbol: '10g',
    gramsPerUnit: '10.0',
    description: 'Standard bar weight unit traded on the Sarafa and international bullion markets.',
  },
];

export interface GoldConversionResult {
  inputUnit: GoldUnitKey;
  inputValue: string;
  totalGrams: Decimal;
  totalTola: Decimal;
  conversions: Record<GoldUnitKey, { value: string; display: string }>;
}

export function convertGoldWeight(value: string | number, fromUnit: GoldUnitKey): GoldConversionResult {
  let numVal: Decimal;
  try {
    const cleanStr = typeof value === 'string' ? value.replace(/,/g, '').trim() : value.toString();
    numVal = new Decimal(cleanStr || '0');
  } catch {
    numVal = new Decimal(0);
  }

  // Grams per unit
  const GRAMS_PER_TOLA = new Decimal('11.6638038');
  const GRAMS_PER_MASHA = GRAMS_PER_TOLA.div(12);
  const GRAMS_PER_RATTI = GRAMS_PER_MASHA.div(8);
  const GRAMS_PER_OUNCE = new Decimal('31.1034768');
  const GRAMS_PER_10G = new Decimal('10');

  let totalGrams: Decimal;
  switch (fromUnit) {
    case 'tola':
      totalGrams = numVal.times(GRAMS_PER_TOLA);
      break;
    case 'grams':
      totalGrams = numVal;
      break;
    case 'masha':
      totalGrams = numVal.times(GRAMS_PER_MASHA);
      break;
    case 'ratti':
      totalGrams = numVal.times(GRAMS_PER_RATTI);
      break;
    case 'troy_ounce':
      totalGrams = numVal.times(GRAMS_PER_OUNCE);
      break;
    case 'ten_grams':
      totalGrams = numVal.times(GRAMS_PER_10G);
      break;
    default:
      totalGrams = numVal;
  }

  const tola = totalGrams.div(GRAMS_PER_TOLA);
  const masha = tola.times(12);
  const ratti = tola.times(96);
  const ounces = totalGrams.div(GRAMS_PER_OUNCE);
  const tenGrams = totalGrams.div(GRAMS_PER_10G);

  const formatDec = (d: Decimal, precision = 4): string => {
    if (d.isZero()) return '0';
    if (d.abs().lessThan(0.0001)) return d.toExponential(4);
    const str = d.toFixed(precision);
    return str.includes('.') ? str.replace(/\.?0+$/, '') : str;
  };

  return {
    inputUnit: fromUnit,
    inputValue: numVal.toString(),
    totalGrams,
    totalTola: tola,
    conversions: {
      tola: { value: tola.toString(), display: formatDec(tola, 4) },
      grams: { value: totalGrams.toString(), display: formatDec(totalGrams, 4) },
      masha: { value: masha.toString(), display: formatDec(masha, 3) },
      ratti: { value: ratti.toString(), display: formatDec(ratti, 2) },
      troy_ounce: { value: ounces.toString(), display: formatDec(ounces, 4) },
      ten_grams: { value: tenGrams.toString(), display: formatDec(tenGrams, 4) },
    },
  };
}

export type KaratType = '24k' | '22k' | '21k' | '18k' | '14k';

export interface PurityValuation {
  karat: KaratType;
  purityPercent: number;
  label: string;
  urduLabel: string;
  perTolaPrice: number;
  perGramPrice: number;
  totalWeightPrice: number;
  description: string;
}

export interface GoldValuationResult {
  weightInTola: number;
  weightInGrams: number;
  baseRatePerTola24K: number;
  makingChargesTotal: number;
  purities: Record<KaratType, PurityValuation>;
  grandTotal24K: number;
  grandTotal22K: number;
  grandTotal21K: number;
  grandTotal18K: number;
}

export function calculateGoldValuation(
  weightTola: number,
  rate24KPerTola: number,
  makingChargesPerTola = 0
): GoldValuationResult {
  const t = Math.max(0, weightTola);
  const rate24K = Math.max(0, rate24KPerTola);
  const makingTotal = t * Math.max(0, makingChargesPerTola);
  const weightGrams = t * 11.6638038;

  const karatConfigs: Record<KaratType, { purity: number; label: string; urdu: string; desc: string }> = {
    '24k': {
      purity: 1.0,
      label: '24 Karat (99.9% Pure)',
      urdu: '24 قیراط خالص سونا',
      desc: 'Raw gold bullion, bars, and pure coins. Standard benchmark.',
    },
    '22k': {
      purity: 22 / 24, // 91.67%
      label: '22 Karat (91.6% Pure / 916)',
      urdu: '22 قیراط زیورات',
      desc: 'Standard jewelry alloy in Pakistan with high durability and rich luster.',
    },
    '21k': {
      purity: 21 / 24, // 87.50%
      label: '21 Karat (87.5% Pure / 875)',
      urdu: '21 قیراط گولڈ',
      desc: 'Popular Arabian and Gulf jewelry standard widely preferred in Pakistan.',
    },
    '18k': {
      purity: 18 / 24, // 75.00%
      label: '18 Karat (75.0% Pure / 750)',
      urdu: '18 قیراط ڈائمنڈ جیولری',
      desc: 'Used for diamond jewelry settings and white/rose gold designer pieces.',
    },
    '14k': {
      purity: 14 / 24, // 58.33%
      label: '14 Karat (58.3% Pure)',
      urdu: '14 قیراط گولڈ',
      desc: 'Affordable commercial and fashion jewelry grade.',
    },
  };

  const purities = {} as Record<KaratType, PurityValuation>;

  (Object.keys(karatConfigs) as KaratType[]).forEach((k) => {
    const cfg = karatConfigs[k];
    const perTola = rate24K * cfg.purity;
    const perGram = perTola / 11.6638038;
    const totalWeightPrice = t * perTola;

    purities[k] = {
      karat: k,
      purityPercent: +(cfg.purity * 100).toFixed(2),
      label: cfg.label,
      urduLabel: cfg.urdu,
      perTolaPrice: Math.round(perTola),
      perGramPrice: Math.round(perGram),
      totalWeightPrice: Math.round(totalWeightPrice),
      description: cfg.desc,
    };
  });

  return {
    weightInTola: t,
    weightInGrams: weightGrams,
    baseRatePerTola24K: rate24K,
    makingChargesTotal: Math.round(makingTotal),
    purities,
    grandTotal24K: Math.round(purities['24k'].totalWeightPrice + makingTotal),
    grandTotal22K: Math.round(purities['22k'].totalWeightPrice + makingTotal),
    grandTotal21K: Math.round(purities['21k'].totalWeightPrice + makingTotal),
    grandTotal18K: Math.round(purities['18k'].totalWeightPrice + makingTotal),
  };
}

export const SARAFA_GLOSSARY = [
  {
    term: 'Tola (تولہ)',
    urdu: 'تولہ',
    meaning: 'The primary weight unit for gold in Pakistan. 1 Tola = 12 Masha = 96 Ratti = 11.6638 grams.',
    context: 'All Pakistan Sarafa Jewelers Association daily gold rates are quoted per tola.',
  },
  {
    term: 'Masha (ماشہ)',
    urdu: 'ماشہ',
    meaning: '1/12th of a tola (0.972 grams). 1 Masha equals 8 Ratti.',
    context: 'Used for smaller jewelry items like earrings, nose pins, and lightweight rings.',
  },
  {
    term: 'Ratti (رتی)',
    urdu: 'رتی',
    meaning: '1/96th of a tola (0.1215 grams). Derived from the traditional red Abrus precatorius seed.',
    context: 'Used for weighing precious gemstones (rubies, emeralds) and fine gold adjustments.',
  },
  {
    term: 'Tanch / Purity (ٹانچ / خالص پن)',
    urdu: 'ٹانچ',
    meaning: 'The assay certificate or laboratory percentage test confirming gold fineness (e.g. 91.6% for 22K).',
    context: 'Sarafa testing laboratories burn and assay samples to establish exact pure gold content.',
  },
  {
    term: 'Jarrat / Making Charges (جڑت / مزدوری)',
    urdu: 'جڑت / بنائی مزدوری',
    meaning: 'Craftsmanship fee charged by the jeweler for designing and fabricating the ornament.',
    context: 'Calculated separately per tola or as a fixed design cost added to the base gold weight price.',
  },
  {
    term: 'Katt / Wastage (کاٹ / کھوٹ)',
    urdu: 'کاٹ',
    meaning: 'Deduction made when exchanging or selling old used jewelry to account for soldering alloys.',
    context: 'Jewelers typically deduct 2% to 10% on old scrap gold before evaluating cash value.',
  },
];
