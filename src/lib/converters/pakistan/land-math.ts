import Decimal from 'decimal.js';

export type LandStandardKey = 'urban' | 'patwari' | 'cda';

export interface LandStandardInfo {
  id: LandStandardKey;
  name: string;
  urduName: string;
  sqFtPerMarla: number;
  description: string;
  popularAuthorities: string[];
}

export const LAND_STANDARDS: Record<LandStandardKey, LandStandardInfo> = {
  urban: {
    id: 'urban',
    name: 'Urban / Lahore / DHA / Bahria',
    urduName: 'شہری / لاہور / ڈی ایچ اے (225 مربع فٹ)',
    sqFtPerMarla: 225,
    description: '1 Marla = 225 Sq Ft. Standardized across modern housing societies including DHA, Bahria Town, LDA, and private developments.',
    popularAuthorities: ['DHA', 'Bahria Town', 'LDA Lahore', 'Gulberg Greens', 'Lake City'],
  },
  patwari: {
    id: 'patwari',
    name: 'Official Revenue / Patwari Standard',
    urduName: 'سرکاری پٹواری ریکارڈ (272.25 مربع فٹ)',
    sqFtPerMarla: 272.25,
    description: '1 Marla = 272.25 Sq Ft (30.25 Sq Yards, 9 Sarsahi). Official government legal record standard used in Punjab, Sindh, KPK & Balochistan revenue departments.',
    popularAuthorities: ['Board of Revenue Punjab', 'KPK Land Record Authority', 'Sindh Revenue Board', 'Rural Land Records'],
  },
  cda: {
    id: 'cda',
    name: 'CDA Islamabad / Commercial',
    urduName: 'سی ڈی اے اسلام آباد (250 مربع فٹ)',
    sqFtPerMarla: 250,
    description: '1 Marla = 250 Sq Ft. Standard used in certain sectors of Capital Development Authority (Islamabad) and commercial plazas.',
    popularAuthorities: ['CDA Islamabad', 'Capital Smart City', 'Rawalpindi Commercial'],
  },
};

export type LandUnitKey =
  | 'marla'
  | 'kanal'
  | 'square_feet'
  | 'square_yards'
  | 'square_meters'
  | 'acre'
  | 'murabba'
  | 'sarsahi';

export interface LandUnitMetadata {
  id: LandUnitKey;
  name: string;
  urduName: string;
  symbol: string;
  description: string;
}

export const LAND_UNITS: LandUnitMetadata[] = [
  {
    id: 'marla',
    name: 'Marla',
    urduName: 'مرلہ',
    symbol: 'Marla',
    description: 'Standard unit of residential land in Pakistan.',
  },
  {
    id: 'kanal',
    name: 'Kanal',
    urduName: 'کنال',
    symbol: 'Kanal',
    description: '1 Kanal = 20 Marlas.',
  },
  {
    id: 'square_feet',
    name: 'Square Feet',
    urduName: 'مربع فٹ',
    symbol: 'sq ft',
    description: 'Standard imperial area measurement.',
  },
  {
    id: 'square_yards',
    name: 'Square Yards (Gazz)',
    urduName: 'مربع گز',
    symbol: 'sq yd',
    description: '1 Gazz = 1 Yard = 3 Feet (1 Sq Yard = 9 Sq Ft).',
  },
  {
    id: 'square_meters',
    name: 'Square Meters',
    urduName: 'مربع میٹر',
    symbol: 'm²',
    description: 'Metric system standard (1 m² ≈ 10.7639 sq ft).',
  },
  {
    id: 'acre',
    name: 'Acre (Qilla / Killa)',
    urduName: 'ایکڑ / قلعہ',
    symbol: 'Acre',
    description: '1 Acre = 8 Kanal = 160 Marlas.',
  },
  {
    id: 'murabba',
    name: 'Murabba',
    urduName: 'مربع',
    symbol: 'Murabba',
    description: '1 Murabba = 25 Acres = 200 Kanal.',
  },
  {
    id: 'sarsahi',
    name: 'Sarsahi',
    urduName: 'سرسائی',
    symbol: 'Sarsahi',
    description: 'Traditional revenue micro-unit (9 Sarsahi = 1 Marla).',
  },
];

export interface LandConversionResult {
  standard: LandStandardKey;
  sqFtPerMarla: number;
  inputUnit: LandUnitKey;
  inputValue: string;
  totalSquareFeet: Decimal;
  conversions: Record<LandUnitKey, { value: string; display: string }>;
}

export function convertLandArea(
  value: string | number,
  fromUnit: LandUnitKey,
  standardKey: LandStandardKey = 'urban'
): LandConversionResult {
  const standard = LAND_STANDARDS[standardKey] || LAND_STANDARDS.urban;
  const sqFtPerMarla = new Decimal(standard.sqFtPerMarla);

  let numVal: Decimal;
  try {
    const cleanStr = typeof value === 'string' ? value.replace(/,/g, '').trim() : value.toString();
    numVal = new Decimal(cleanStr || '0');
  } catch {
    numVal = new Decimal(0);
  }

  // Convert input unit to total Square Feet first
  let sqFt: Decimal;
  switch (fromUnit) {
    case 'marla':
      sqFt = numVal.times(sqFtPerMarla);
      break;
    case 'kanal':
      sqFt = numVal.times(20).times(sqFtPerMarla);
      break;
    case 'square_feet':
      sqFt = numVal;
      break;
    case 'square_yards':
      sqFt = numVal.times(9);
      break;
    case 'square_meters':
      sqFt = numVal.times('10.76391041671');
      break;
    case 'acre':
      sqFt = numVal.times(160).times(sqFtPerMarla);
      break;
    case 'murabba':
      sqFt = numVal.times(4000).times(sqFtPerMarla);
      break;
    case 'sarsahi':
      sqFt = numVal.div(9).times(sqFtPerMarla);
      break;
    default:
      sqFt = numVal;
  }

  // Calculate all other units from total Sq Ft
  const marla = sqFt.div(sqFtPerMarla);
  const kanal = marla.div(20);
  const sqYards = sqFt.div(9);
  const sqMeters = sqFt.div('10.76391041671');
  const acre = marla.div(160);
  const murabba = marla.div(4000);
  const sarsahi = marla.times(9);

  const formatDec = (d: Decimal, precision = 4): string => {
    if (d.isZero()) return '0';
    if (d.abs().lessThan(0.0001)) return d.toExponential(4);
    // Trim trailing zeros after decimal
    const str = d.toFixed(precision);
    return str.includes('.') ? str.replace(/\.?0+$/, '') : str;
  };

  return {
    standard: standardKey,
    sqFtPerMarla: standard.sqFtPerMarla,
    inputUnit: fromUnit,
    inputValue: numVal.toString(),
    totalSquareFeet: sqFt,
    conversions: {
      marla: { value: marla.toString(), display: formatDec(marla, 4) },
      kanal: { value: kanal.toString(), display: formatDec(kanal, 4) },
      square_feet: { value: sqFt.toString(), display: formatDec(sqFt, 2) },
      square_yards: { value: sqYards.toString(), display: formatDec(sqYards, 2) },
      square_meters: { value: sqMeters.toString(), display: formatDec(sqMeters, 2) },
      acre: { value: acre.toString(), display: formatDec(acre, 4) },
      murabba: { value: murabba.toString(), display: formatDec(murabba, 4) },
      sarsahi: { value: sarsahi.toString(), display: formatDec(sarsahi, 2) },
    },
  };
}

export interface PlotDimensionCalculation {
  widthFt: number;
  lengthFt: number;
  totalSqFt: number;
  marla: number;
  kanal: number;
  sqYards: number;
  sqMeters: number;
  aspectRatio: string;
}

export function calculatePlotDimensions(
  width: number | string,
  length: number | string,
  standardKey: LandStandardKey = 'urban'
): PlotDimensionCalculation {
  const w = parseFloat(width.toString()) || 0;
  const l = parseFloat(length.toString()) || 0;
  const standard = LAND_STANDARDS[standardKey] || LAND_STANDARDS.urban;

  const totalSqFt = w * l;
  const marla = standard.sqFtPerMarla > 0 ? totalSqFt / standard.sqFtPerMarla : 0;
  const kanal = marla / 20;
  const sqYards = totalSqFt / 9;
  const sqMeters = totalSqFt / 10.7639104;

  let gcdVal = 1;
  if (w > 0 && l > 0 && Number.isInteger(w) && Number.isInteger(l)) {
    const calcGcd = (a: number, b: number): number => (b === 0 ? a : calcGcd(b, a % b));
    gcdVal = calcGcd(w, l);
  }
  const aspectRatio = w > 0 && l > 0 ? `${(w / gcdVal)}:${(l / gcdVal)}` : '1:1';

  return {
    widthFt: w,
    lengthFt: l,
    totalSqFt,
    marla,
    kanal,
    sqYards,
    sqMeters,
    aspectRatio,
  };
}

export interface LandGlossaryTerm {
  term: string;
  urdu: string;
  meaning: string;
  context: string;
}

export const LAND_REVENUE_GLOSSARY: LandGlossaryTerm[] = [
  {
    term: 'Fard (فرد)',
    urdu: 'فرد ملکیت',
    meaning: 'Official record of property ownership certificate issued by Land Revenue or Punjab Land Records Authority (PLRA).',
    context: 'Required for property verification, selling, applying for gas/electricity meters, or bank loans.',
  },
  {
    term: 'Khasra (خسرہ)',
    urdu: 'خسرہ نمبر',
    meaning: 'A specific survey number assigned to a parcel of land in revenue village records.',
    context: 'Every individual plot or agricultural field in Pakistan has a unique Khasra number on the cadastral map.',
  },
  {
    term: 'Khatauni (کھتونی)',
    urdu: 'کھتونی',
    meaning: 'Register of persons holding or cultivating land in a village, showing their respective shares.',
    context: 'Lists the legal cultivators, tenants, or co-owners within a specific land holding.',
  },
  {
    term: 'Intiqal / Mutation (انتقال)',
    urdu: 'انتقال اراضی',
    meaning: 'Official transfer of title/ownership from seller to buyer in government revenue records.',
    context: 'Without Mutation (Intiqal), a sale deed (Registry) remains incomplete in government revenue records.',
  },
  {
    term: 'Aks Shajra (عکس شجرہ)',
    urdu: 'عکس شجرہ / نقشہ',
    meaning: 'The official cadastral map showing exact spatial boundaries, shapes, and Khasra layouts of land parcels.',
    context: 'Used during demarcation (Nishandahi) to prevent property encroachment disputes.',
  },
  {
    term: 'Sarsahi (سرسائی)',
    urdu: 'سرسائی',
    meaning: 'Traditional micro land unit. 1 Sarsahi = 1 Karam × 1 Karam = 30.25 sq ft (Patwari) or 25 sq ft (Urban). 9 Sarsahi = 1 Marla.',
    context: 'Used in precise revenue court proceedings and village land partitioning.',
  },
  {
    term: 'Karam (کرم)',
    urdu: 'کرم',
    meaning: 'Traditional unit of length used by Patwaris. 1 Karam = 5.5 Feet (66 Inches).',
    context: 'Formed the foundation of historical Mughal and British-era Punjab land measurement.',
  },
  {
    term: 'Girdawari (گردآوری)',
    urdu: 'گردآوری',
    meaning: 'Bi-annual field harvest and land status inspection conducted by the Patwari (Rabi & Kharif seasons).',
    context: 'Determines crop yield records and legal tenancy possession on agricultural lands.',
  },
];
