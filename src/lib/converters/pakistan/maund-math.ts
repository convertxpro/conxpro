import Decimal from 'decimal.js';

export type MaundStandard = 'mandi_40kg' | 'imperial_37kg';

export interface MaundStandardInfo {
  id: MaundStandard;
  name: string;
  urduName: string;
  kgPerMaund: number;
  description: string;
}

export const MAUND_STANDARDS: Record<MaundStandard, MaundStandardInfo> = {
  mandi_40kg: {
    id: 'mandi_40kg',
    name: 'Mandi Standard (40 kg / Maund)',
    urduName: 'مارکیٹ منڈی اسٹینڈرڈ (40 کلوگرام فی من)',
    kgPerMaund: 40,
    description: 'Universal standard used across all Pakistani grain markets (Ghalla Mandi), cotton factories, sugar mills, and agricultural trade.',
  },
  imperial_37kg: {
    id: 'imperial_37kg',
    name: 'Imperial / Historical (37.3242 kg)',
    urduName: 'قدیم امپیریل من (37.32 کلوگرام)',
    kgPerMaund: 37.3242,
    description: 'Colonial benchmark equivalent to 80 lbs or 82 2/7 lbs historically used in pre-metric land settlement records.',
  },
};

export interface CommodityPreset {
  id: string;
  name: string;
  urduName: string;
  typicalRatePkr: number;
  standardUnit: string;
  season: string;
}

export const COMMODITY_PRESETS: CommodityPreset[] = [
  {
    id: 'wheat',
    name: 'Wheat (Gandum)',
    urduName: 'گندم',
    typicalRatePkr: 3900,
    standardUnit: 'per 40 kg Maund',
    season: 'Rabi (April - May)',
  },
  {
    id: 'basmati_rice',
    name: 'Super Basmati Paddy (Dhan)',
    urduName: 'سپر باسمتی دھان (چاول)',
    typicalRatePkr: 4600,
    standardUnit: 'per 40 kg Maund',
    season: 'Kharif (Oct - Nov)',
  },
  {
    id: 'cotton',
    name: 'Seed Cotton (Phutti)',
    urduName: 'کپاس / پھٹی',
    typicalRatePkr: 8500,
    standardUnit: 'per 40 kg Maund',
    season: 'Kharif (Aug - Dec)',
  },
  {
    id: 'sugarcane',
    name: 'Sugarcane (Kamad)',
    urduName: 'کماد / گنا',
    typicalRatePkr: 450,
    standardUnit: 'per 40 kg Maund',
    season: 'Winter (Nov - March)',
  },
  {
    id: 'maize',
    name: 'Maize / Corn (Makai)',
    urduName: 'مکئی',
    typicalRatePkr: 2400,
    standardUnit: 'per 40 kg Maund',
    season: 'Spring / Autumn',
  },
  {
    id: 'mustard',
    name: 'Mustard / Canola (Sarson)',
    urduName: 'سرسوں / کینولا',
    typicalRatePkr: 7200,
    standardUnit: 'per 40 kg Maund',
    season: 'Rabi (March - April)',
  },
  {
    id: 'urea',
    name: 'Urea Fertilizer Bag',
    urduName: 'یوریا کھاد',
    typicalRatePkr: 4500,
    standardUnit: 'per 50 kg Bag',
    season: 'All Year',
  },
];

export interface MaundConversionResult {
  standard: MaundStandard;
  kgPerMaund: number;
  totalMaunds: Decimal;
  totalKg: Decimal;
  totalMetricTons: Decimal;
  totalSeers: Decimal;
  totalChhataks: Decimal;
  totalBags50Kg: Decimal;
}

export function calculateMaundWeight(
  maunds: number | string,
  seers: number | string = 0,
  chhataks: number | string = 0,
  standard: MaundStandard = 'mandi_40kg'
): MaundConversionResult {
  const std = MAUND_STANDARDS[standard] || MAUND_STANDARDS.mandi_40kg;
  const kgPerM = new Decimal(std.kgPerMaund);

  const m = new Decimal(parseFloat(maunds.toString()) || 0);
  const s = new Decimal(parseFloat(seers.toString()) || 0);
  const c = new Decimal(parseFloat(chhataks.toString()) || 0);

  // 1 Maund = 40 Seers = 640 Chhataks (16 Chhataks per Seer)
  const totalMaunds = m.plus(s.div(40)).plus(c.div(640));
  const totalKg = totalMaunds.times(kgPerM);
  const totalMetricTons = totalKg.div(1000);
  const totalSeers = totalMaunds.times(40);
  const totalChhataks = totalMaunds.times(640);
  const totalBags50Kg = totalKg.div(50);

  return {
    standard,
    kgPerMaund: std.kgPerMaund,
    totalMaunds,
    totalKg,
    totalMetricTons,
    totalSeers,
    totalChhataks,
    totalBags50Kg,
  };
}

export interface CommodityTradeCalculation {
  totalMaunds: number;
  totalKg: number;
  totalMetricTons: number;
  totalBags50Kg: number;
  ratePerMaund: number;
  grossAmountPkr: number;
  netAmountPkr: number;
  commissionAmount: number;
  bagFeeTotal: number;
}

export function calculateCommodityTrade(
  maunds: number | string,
  seers: number | string = 0,
  ratePerMaund: number | string = 0,
  commissionPercent = 0,
  bagFeePerBag = 0,
  standard: MaundStandard = 'mandi_40kg'
): CommodityTradeCalculation {
  const weight = calculateMaundWeight(maunds, seers, 0, standard);
  const totalM = weight.totalMaunds.toNumber();
  const totalKg = weight.totalKg.toNumber();
  const totalTons = weight.totalMetricTons.toNumber();
  const bags = weight.totalBags50Kg.toNumber();

  const rate = parseFloat(ratePerMaund.toString()) || 0;
  const gross = totalM * rate;
  const comm = (gross * (commissionPercent || 0)) / 100;
  const bagFee = (bags || 0) * (bagFeePerBag || 0);
  const net = gross - comm - bagFee;

  return {
    totalMaunds: +totalM.toFixed(4),
    totalKg: +totalKg.toFixed(2),
    totalMetricTons: +totalTons.toFixed(4),
    totalBags50Kg: +bags.toFixed(2),
    ratePerMaund: rate,
    grossAmountPkr: Math.round(gross),
    commissionAmount: Math.round(comm),
    bagFeeTotal: Math.round(bagFee),
    netAmountPkr: Math.round(net),
  };
}

export const MANDI_GLOSSARY = [
  {
    term: 'Maund / Mann (من)',
    urdu: 'من',
    meaning: 'Standard wholesale trading weight unit in Pakistan. 1 Maund = 40 Kilograms = 40 Seers.',
    context: 'All commodity market prices for wheat, rice, cotton, and oilseeds are quoted per Maund.',
  },
  {
    term: 'Seer / Ser (سیر)',
    urdu: 'سیر',
    meaning: '1/40th of a Maund. In modern metric Mandi trade, 1 Seer is standardized exactly to 1.0 Kilogram.',
    context: 'Used for retail weighing and fractional Maund calculation in grain markets.',
  },
  {
    term: 'Chhatak (چھٹاک)',
    urdu: 'چھٹاک',
    meaning: '1/16th of a Seer (62.5 grams in Mandi standard, or 58.32 grams under historical tola standard).',
    context: 'Traditional spice and oil weighing unit in local village Kiryana and Mandi stores.',
  },
  {
    term: 'Dhadhi / Panj-Seri (دھڑی / پنج سیری)',
    urdu: 'دھڑی (5 کلو)',
    meaning: 'A batch weight of 5 Seers (5 Kilograms) commonly used in Sabzi & Fruit Mandis.',
    context: 'Potatoes, onions, and seasonal vegetables are auctioned in multiples of Dhadhi.',
  },
  {
    term: 'Arhti / Commission Agent (آڑھتی)',
    urdu: 'آڑھتی',
    meaning: 'Licensed middleman commission agent in the wholesale Ghalla Mandi connecting farmers with commercial millers.',
    context: 'Facilitates auctions, advances crop financing, and charges 1% to 2% Mandi commission.',
  },
  {
    term: 'Kanta / Weighbridge (کنڈا / تول)',
    urdu: 'الیکٹرانک کنڈا',
    meaning: 'Commercial digital weighbridge used to record gross tractor-trolley and truck weights.',
    context: 'The official weight slip (Kanta Parchi) determines the final payment settlement.',
  },
  {
    term: 'Bardana / Bag (باردانہ / بوری)',
    urdu: 'باردانہ',
    meaning: 'Jute or polypropylene gunny bags supplied for bagging grain, usually 50 kg or 100 kg capacity.',
    context: 'Government procurement centers distribute Bardana quotas to wheat growers every harvesting season.',
  },
];
