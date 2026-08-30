import Decimal from 'decimal.js';

export type RegionalStandard = 'punjab' | 'sindh' | 'patwari' | 'urban' | 'cda';

export interface RegionalStandardInfo {
  id: RegionalStandard;
  name: string;
  urduName: string;
  sqFtPerMarla: number;
  bighaInKanals: number;
  murabbaInAcres: number;
  description: string;
  jurisdiction: string;
}

export const REGIONAL_STANDARDS: Record<RegionalStandard, RegionalStandardInfo> = {
  punjab: {
    id: 'punjab',
    name: 'Punjab Revenue (Official Patwari)',
    urduName: 'پنجاب ریونیو ریکارڈ (272.25 مربع فٹ)',
    sqFtPerMarla: 272.25,
    bighaInKanals: 4,
    murabbaInAcres: 25,
    description: '1 Marla = 272.25 Sq Ft (9 Sarsahi). 1 Bigha = 4 Kanals (80 Marlas). 1 Acre = 8 Kanals. 1 Murabba = 25 Acres (200 Kanals). Official Board of Revenue Punjab legal standard.',
    jurisdiction: 'Punjab Board of Revenue, KPK Revenue, Rural Agricultural Lands',
  },
  sindh: {
    id: 'sindh',
    name: 'Sindh Agriculture & Revenue',
    urduName: 'سندھ ایگریکلچر ریکارڈ (2 کنال فی بیگھہ)',
    sqFtPerMarla: 272.25,
    bighaInKanals: 2,
    murabbaInAcres: 25,
    description: '1 Bigha = 2 Kanals (40 Marlas = 0.5 Acre = 1 Jareeb). Standard for agricultural farm holdings and land deeds across rural Sindh.',
    jurisdiction: 'Sindh Board of Revenue, Hyderabad, Sukkur, Larkana, Mirpurkhas',
  },
  patwari: {
    id: 'patwari',
    name: 'National Patwari Standard',
    urduName: 'پٹواری سرکاری پیمائش (272.25 مربع فٹ)',
    sqFtPerMarla: 272.25,
    bighaInKanals: 4,
    murabbaInAcres: 25,
    description: 'Universal 272.25 sq ft/marla revenue record standard based on 1 Karam = 5.5 feet (Square Karam = 30.25 sq ft = 1 Sarsahi; 9 Sarsahi = 1 Marla).',
    jurisdiction: 'All Pakistan Revenue Departments & Settlement Records',
  },
  urban: {
    id: 'urban',
    name: 'Urban Housing (DHA / LDA / Bahria)',
    urduName: 'شہری ہاؤسنگ سوسائٹیز (225 مربع فٹ)',
    sqFtPerMarla: 225,
    bighaInKanals: 4,
    murabbaInAcres: 25,
    description: '1 Marla = 225 Sq Ft (25 Sq Yards). 1 Kanal = 4,500 Sq Ft (500 Sq Yards). Standard for DHA, Bahria Town, LDA, CDA private sectors.',
    jurisdiction: 'DHA, Bahria Town, LDA, FDA, RDA, Private Housing Societies',
  },
  cda: {
    id: 'cda',
    name: 'CDA Islamabad / Commercial',
    urduName: 'سی ڈی اے اسلام آباد (250 مربع فٹ)',
    sqFtPerMarla: 250,
    bighaInKanals: 4,
    murabbaInAcres: 25,
    description: '1 Marla = 250 Sq Ft. Used in specific sectors of Capital Development Authority (Islamabad) and select commercial layouts.',
    jurisdiction: 'CDA Islamabad Sectors, Rawalpindi Commercial Plazas',
  },
};

export interface LandUnitMatrix {
  murabba: number;
  acre: number; // Qila / Killa
  bigha: number;
  kanal: number;
  marla: number;
  sarsahi: number;
  biswa: number;
  sqGazz: number; // Square Yards
  sqFeet: number;
  sqMeters: number;
  sqKaram: number;
}

export type LandUnitKey = keyof LandUnitMatrix;

export interface LandUnitMetadata {
  id: LandUnitKey;
  name: string;
  urduName: string;
  symbol: string;
  category: 'agricultural' | 'urban' | 'metric' | 'traditional';
  description: string;
}

export const EXTENDED_LAND_UNITS: LandUnitMetadata[] = [
  {
    id: 'murabba',
    name: 'Murabba (مربع)',
    urduName: 'مربع',
    symbol: 'Murabba',
    category: 'agricultural',
    description: '1 Murabba = 25 Acres (200 Kanals = 4,000 Marlas). The highest tier agricultural block measurement in Pakistan.',
  },
  {
    id: 'acre',
    name: 'Acre / Qilla / Killa (ایکڑ / قلعہ)',
    urduName: 'ایکڑ / قلعہ',
    symbol: 'Acre',
    category: 'agricultural',
    description: '1 Acre = 8 Kanals = 160 Marlas. Standard agricultural field parcel.',
  },
  {
    id: 'bigha',
    name: 'Bigha (بیگھہ)',
    urduName: 'بیگھہ',
    symbol: 'Bigha',
    category: 'agricultural',
    description: 'Punjab: 1 Bigha = 4 Kanals (80 Marlas). Sindh: 1 Bigha = 2 Kanals (40 Marlas = 0.5 Acre).',
  },
  {
    id: 'kanal',
    name: 'Kanal (کنال)',
    urduName: 'کنال',
    symbol: 'Kanal',
    category: 'urban',
    description: '1 Kanal = 20 Marlas = 1/8th Acre.',
  },
  {
    id: 'marla',
    name: 'Marla (مرلہ)',
    urduName: 'مرلہ',
    symbol: 'Marla',
    category: 'urban',
    description: 'Standard residential land unit. 272.25 sq ft in revenue, 225 sq ft in modern societies.',
  },
  {
    id: 'biswa',
    name: 'Biswa (بسوہ)',
    urduName: 'بسوہ',
    symbol: 'Biswa',
    category: 'traditional',
    description: '1 Biswa = 1/20th of a Bigha. In Punjab 1 Biswa = 1 Marla (4 Kanals / 20 = 4 Marlas in some districts, 1 Marla standard).',
  },
  {
    id: 'sarsahi',
    name: 'Sarsahi (سرسائی)',
    urduName: 'سرسائی',
    symbol: 'Sarsahi',
    category: 'traditional',
    description: '1 Sarsahi = 1/9th of a Marla (30.25 Sq Ft in revenue standard = 1 Square Karam).',
  },
  {
    id: 'sqGazz',
    name: 'Square Yards / Gazz (مربع گز)',
    urduName: 'مربع گز',
    symbol: 'sq yd',
    category: 'urban',
    description: '1 Gazz = 3 Feet = 1 Yard. 1 Sq Gazz = 9 Sq Feet.',
  },
  {
    id: 'sqFeet',
    name: 'Square Feet (مربع فٹ)',
    urduName: 'مربع فٹ',
    symbol: 'sq ft',
    category: 'urban',
    description: 'Standard global imperial square footage measurement.',
  },
  {
    id: 'sqMeters',
    name: 'Square Meters (مربع میٹر)',
    urduName: 'مربع میٹر',
    symbol: 'm²',
    category: 'metric',
    description: 'International metric standard (1 m² ≈ 10.7639 sq ft).',
  },
  {
    id: 'sqKaram',
    name: 'Square Karam (مربع کرم)',
    urduName: 'مربع کرم',
    symbol: 'sq karam',
    category: 'traditional',
    description: '1 Karam = 5.5 feet (66 inches). 1 Square Karam = 30.25 Sq Ft (1 Sarsahi).',
  },
];

export function calculateLandUnits(
  value: number | string,
  unit: LandUnitKey,
  standard: RegionalStandard = 'punjab'
): LandUnitMatrix {
  const cleanVal = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, '')) || 0;
  const std = REGIONAL_STANDARDS[standard] || REGIONAL_STANDARDS.punjab;
  const sqFtPerMarla = std.sqFtPerMarla;
  const bighaInKanals = std.bighaInKanals;

  // Convert input unit to base Square Feet
  let baseSqFt = new Decimal(0);
  const v = new Decimal(cleanVal);

  switch (unit) {
    case 'sqFeet':
      baseSqFt = v;
      break;
    case 'sqMeters':
      baseSqFt = v.times(10.7639104);
      break;
    case 'sqGazz':
      baseSqFt = v.times(9);
      break;
    case 'sqKaram':
      baseSqFt = v.times(30.25);
      break;
    case 'sarsahi':
      baseSqFt = v.times(sqFtPerMarla / 9);
      break;
    case 'biswa':
      // 1 Bigha = 20 Biswa => 1 Biswa = (Bigha in Kanals * 20 Marlas) / 20 = Bigha in Kanals Marlas
      // In Punjab standard: 1 Bigha = 4 Kanals = 80 Marlas => 1 Biswa = 4 Marlas (or 1 Marla depending on district, revenue formula uses 1/20 Bigha)
      baseSqFt = v.times((bighaInKanals * 20 * sqFtPerMarla) / 20);
      break;
    case 'marla':
      baseSqFt = v.times(sqFtPerMarla);
      break;
    case 'kanal':
      baseSqFt = v.times(sqFtPerMarla * 20);
      break;
    case 'bigha':
      baseSqFt = v.times(sqFtPerMarla * 20 * bighaInKanals);
      break;
    case 'acre':
      baseSqFt = v.times(sqFtPerMarla * 20 * 8); // 1 Acre = 8 Kanals
      break;
    case 'murabba':
      baseSqFt = v.times(sqFtPerMarla * 20 * 8 * 25); // 1 Murabba = 25 Acres = 200 Kanals
      break;
  }

  const baseNum = baseSqFt.toNumber();
  const marlaVal = baseNum / sqFtPerMarla;
  const kanalVal = marlaVal / 20;
  const acreVal = kanalVal / 8;
  const murabbaVal = acreVal / 25;
  const bighaVal = kanalVal / bighaInKanals;

  return {
    sqFeet: Number(baseNum.toFixed(2)),
    sqMeters: Number((baseNum / 10.7639104).toFixed(2)),
    sqGazz: Number((baseNum / 9).toFixed(2)),
    sqKaram: Number((baseNum / 30.25).toFixed(2)),
    sarsahi: Number((marlaVal * 9).toFixed(2)),
    biswa: Number((bighaVal * 20).toFixed(3)),
    marla: Number(marlaVal.toFixed(3)),
    kanal: Number(kanalVal.toFixed(4)),
    bigha: Number(bighaVal.toFixed(4)),
    acre: Number(acreVal.toFixed(5)),
    murabba: Number(murabbaVal.toFixed(5)),
  };
}

export interface PlotDimensionResult {
  widthFt: number;
  lengthFt: number;
  totalSqFt: number;
  totalSqGazz: number;
  totalSqMeters: number;
  marla: number;
  kanal: number;
  acre: number;
  murabba: number;
  perimeterFt: number;
  aspectRatio: string;
}

export function calculatePlotDimensions(
  widthFt: number | string,
  lengthFt: number | string,
  standard: RegionalStandard = 'punjab'
): PlotDimensionResult {
  const w = parseFloat(String(widthFt).replace(/,/g, '')) || 0;
  const l = parseFloat(String(lengthFt).replace(/,/g, '')) || 0;
  const totalSqFt = w * l;
  const perimeterFt = 2 * (w + l);

  const units = calculateLandUnits(totalSqFt, 'sqFeet', standard);

  let gcdVal = 1;
  const a = Math.round(w);
  const b = Math.round(l);
  const gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
  if (a > 0 && b > 0) {
    gcdVal = gcd(a, b);
  }
  const aspectRatio = a > 0 && b > 0 ? `${Math.round(a / gcdVal)}:${Math.round(b / gcdVal)}` : '1:1';

  return {
    widthFt: w,
    lengthFt: l,
    totalSqFt,
    totalSqGazz: units.sqGazz,
    totalSqMeters: units.sqMeters,
    marla: units.marla,
    kanal: units.kanal,
    acre: units.acre,
    murabba: units.murabba,
    perimeterFt,
    aspectRatio,
  };
}

export interface LandValuationResult {
  totalPrice: number;
  pricePerAcre: number;
  pricePerKanal: number;
  pricePerMarla: number;
  pricePerMurabba: number;
  pricePerSqFt: number;
  pricePerSqGazz: number;
  pricePerBigha: number;
  formattedTotalPrice: string;
  wordsTotalPrice: string;
}

export function calculateLandValuation(
  price: number | string,
  priceBasis: LandUnitKey | 'total',
  areaValue: number | string,
  areaUnit: LandUnitKey,
  standard: RegionalStandard = 'punjab'
): LandValuationResult {
  const p = parseFloat(String(price).replace(/,/g, '')) || 0;
  const a = parseFloat(String(areaValue).replace(/,/g, '')) || 0;

  const areaMatrix = calculateLandUnits(a, areaUnit, standard);
  const totalSqFt = areaMatrix.sqFeet;

  let computedTotalPrice = 0;

  if (priceBasis === 'total') {
    computedTotalPrice = p;
  } else {
    // Determine unit price per single unit
    const singleUnitMatrix = calculateLandUnits(1, priceBasis, standard);
    const sqFtInBasisUnit = singleUnitMatrix.sqFeet;
    const pricePerSqFt = sqFtInBasisUnit > 0 ? p / sqFtInBasisUnit : 0;
    computedTotalPrice = pricePerSqFt * totalSqFt;
  }

  const pricePerSqFt = totalSqFt > 0 ? computedTotalPrice / totalSqFt : 0;

  // Single unit sqFt references
  const oneMurabbaSqFt = calculateLandUnits(1, 'murabba', standard).sqFeet;
  const oneAcreSqFt = calculateLandUnits(1, 'acre', standard).sqFeet;
  const oneBighaSqFt = calculateLandUnits(1, 'bigha', standard).sqFeet;
  const oneKanalSqFt = calculateLandUnits(1, 'kanal', standard).sqFeet;
  const oneMarlaSqFt = calculateLandUnits(1, 'marla', standard).sqFeet;
  const oneGazzSqFt = 9;

  return {
    totalPrice: Math.round(computedTotalPrice),
    pricePerAcre: Math.round(pricePerSqFt * oneAcreSqFt),
    pricePerKanal: Math.round(pricePerSqFt * oneKanalSqFt),
    pricePerMarla: Math.round(pricePerSqFt * oneMarlaSqFt),
    pricePerMurabba: Math.round(pricePerSqFt * oneMurabbaSqFt),
    pricePerBigha: Math.round(pricePerSqFt * oneBighaSqFt),
    pricePerSqFt: Number(pricePerSqFt.toFixed(2)),
    pricePerSqGazz: Number((pricePerSqFt * oneGazzSqFt).toFixed(2)),
    formattedTotalPrice: formatLakhsAndCrores(computedTotalPrice),
    wordsTotalPrice: formatPriceWords(computedTotalPrice),
  };
}

function formatLakhsAndCrores(num: number): string {
  if (num >= 10_000_000) {
    return `Rs. ${(num / 10_000_000).toFixed(2)} Crore`;
  }
  if (num >= 100_000) {
    return `Rs. ${(num / 100_000).toFixed(2)} Lakh`;
  }
  return `Rs. ${num.toLocaleString('en-US')}`;
}

function formatPriceWords(num: number): string {
  if (num >= 10_000_000) {
    const cr = (num / 10_000_000).toFixed(2);
    return `${cr} Crore Rupees`;
  }
  if (num >= 100_000) {
    const lk = (num / 100_000).toFixed(2);
    return `${lk} Lakh Rupees`;
  }
  return `${num.toLocaleString()} Rupees`;
}

export interface RevenueGlossaryItem {
  term: string;
  urduTerm: string;
  category: 'Measurement' | 'Document' | 'Official' | 'Record';
  meaning: string;
  urduMeaning: string;
  relevance: string;
}

export const REVENUE_TERMS_GLOSSARY: RevenueGlossaryItem[] = [
  {
    term: 'Murabba (مربع)',
    urduTerm: 'مربع',
    category: 'Measurement',
    meaning: 'Agricultural block of 25 Acres (200 Kanals = 4,000 Marlas). Formed of 25 square Killas.',
    urduMeaning: '25 ایکڑ یا 200 کنال پر مشتمل زرعی رقبے کا بڑا بلاک۔',
    relevance: 'Primary unit in canal colony agricultural records (Chak numbers) across Punjab & Sindh.',
  },
  {
    term: 'Qilla / Killa / Acre (قلعہ / ایکڑ)',
    urduTerm: 'قلعہ / ایکڑ',
    category: 'Measurement',
    meaning: '1 Acre of agricultural land (8 Kanals = 160 Marlas = 43,560 Sq Ft in Patwari standard). Formed of 40 Karams × 36 Karams rectangular grid.',
    urduMeaning: '8 کنال یا 160 مرلہ پر مشتمل زرعی رقبے کی بنیادی اکائی۔',
    relevance: 'Standard legal agricultural sale and crop yield pricing unit.',
  },
  {
    term: 'Bigha (بیگھہ)',
    urduTerm: 'بیگھہ',
    category: 'Measurement',
    meaning: 'Traditional unit. In Punjab = 4 Kanals (80 Marlas = 0.5 Acre). In Sindh = 2 Kanals (40 Marlas = 0.5 Acre).',
    urduMeaning: 'پنجاب میں 4 کنال اور سندھ میں 2 کنال کے برابر زرعی زمین کی اکائی۔',
    relevance: 'Traditional farmland leasing, water distribution (Warabandi), and tube-well contracts.',
  },
  {
    term: 'Kanal (کنال)',
    urduTerm: 'کنال',
    category: 'Measurement',
    meaning: '1 Kanal = 20 Marlas = 5,445 Sq Ft (Revenue) or 4,500 Sq Ft (Urban DHA). 1/8th of an Acre.',
    urduMeaning: '20 مرلہ پر مشتمل رقبہ (شہری سوسائٹیز میں 4500 اور پٹواری ریکارڈ میں 5445 مربع فٹ)۔',
    relevance: 'Standard measure for luxury residential plots and suburban farmhouses.',
  },
  {
    term: 'Marla (مرلہ)',
    urduTerm: 'مرلہ',
    category: 'Measurement',
    meaning: 'Standard residential property unit. 272.25 Sq Ft in government revenue records, 225 Sq Ft in urban housing.',
    urduMeaning: 'رہائشی پلاٹوں کی سب سے زیادہ استعمال ہونے والی اکائی۔',
    relevance: 'Used in 3, 5, 7, 10, and 20 Marla plot classifications across all cities.',
  },
  {
    term: 'Sarsahi (سرسائی)',
    urduTerm: 'سرسائی',
    category: 'Measurement',
    meaning: '1/9th of a Marla (30.25 Sq Ft = 1 Square Karam). Smallest traditional Patwari measurement.',
    urduMeaning: 'ایک مرلہ کا نواں حصہ یعنی 30.25 مربع فٹ (ایک مربع کرم)۔',
    relevance: 'Used for exact fractional boundary demarcations in family inheritance partitions.',
  },
  {
    term: 'Karam (کرم)',
    urduTerm: 'کرم',
    category: 'Measurement',
    meaning: 'Traditional linear revenue step pace = 5.5 Feet (66 inches = 1.6764 meters). 1 Square Karam = 30.25 Sq Ft = 1 Sarsahi.',
    urduMeaning: 'ساڑھے پانچ فٹ (66 انچ) لمبائی کا روایتی پٹواری پیمائشی قدم۔',
    relevance: 'Basis of all field cadastral surveys and Aks Shajra map dimensions.',
  },
  {
    term: 'Fard / Fard Malkiat (فرد ملکیت)',
    urduTerm: 'فرد ملکیت',
    category: 'Document',
    meaning: 'Certified copy of land ownership record issued by the Land Record Authority (PLRA / Arazi Record Center).',
    urduMeaning: 'اراضی ریکارڈ سنٹر سے جاری کردہ ملکیتی حقوق کی سرکاری مصدقہ نقل۔',
    relevance: 'Mandatory document for property sale, banking mortgage, or registry execution.',
  },
  {
    term: 'Khasra (خسرہ نمبر)',
    urduTerm: 'خسرہ نمبر',
    category: 'Record',
    meaning: 'Specific cadastral survey parcel/plot number designated on government agricultural map.',
    urduMeaning: 'سرکاری سروے نقشے پر ہر مخصوص پلاٹ یا کھیت کو دیا گیا مخصوص ہندسہ۔',
    relevance: 'Uniquely identifies physical land location on village map (Shajra).',
  },
  {
    term: 'Khewat (کھیوٹ نمبر)',
    urduTerm: 'کھیوٹ نمبر',
    category: 'Record',
    meaning: 'Account number of joint landowners in a revenue estate (Mauza / Village).',
    urduMeaning: 'ایک موضع یا گاؤں میں مشترکہ مالکان کے کھاتے کا سرکاری نمبر۔',
    relevance: 'Determines the total joint holding of family members or co-sharers.',
  },
  {
    term: 'Khatooni (کھتونی نمبر)',
    urduTerm: 'کھتونی نمبر',
    category: 'Record',
    meaning: 'Holding number assigned to the cultivator or tenant of specific Khasra numbers within a Khewat.',
    urduMeaning: 'کاشتکار یا قبضہ رکھنے والے شخص کا سرکاری رجسٹر نمبر۔',
    relevance: 'Documents tenancy rights, cultivation status, and tenant shares.',
  },
  {
    term: 'Aks Shajra / Latha (عکس شجرہ / لٹھا)',
    urduTerm: 'عکس شجرہ / لٹھا',
    category: 'Document',
    meaning: 'Cadastral cloth village map illustrating exact physical layout, boundary lines, roads, and watercourses.',
    urduMeaning: 'کپڑے پر بنا ہوا گاؤں یا موضع کا تفصیلی ماسٹر پلان اور زمینی نقشہ۔',
    relevance: 'Used during physical on-ground demarcation (Nishandehi) with measuring chains (Jareeb).',
  },
  {
    term: 'Intiqal / Mutation (انتقال)',
    urduTerm: 'انتقال',
    category: 'Document',
    meaning: 'Official mutation/transfer of land title from seller/deceased to new owner in the revenue register.',
    urduMeaning: 'زمین کی ملکیت کا سرکاری رجسٹر میں ایک شخص سے دوسرے کے نام تبادلہ۔',
    relevance: 'Completes legal registration process after Registry / Bayana.',
  },
  {
    term: 'Jareeb (جریب)',
    urduTerm: 'جریب',
    category: 'Measurement',
    meaning: 'Surveyor steel chain of 10 Karams (55 feet) or 20 Karams (110 feet) used for land surveying. Also denotes 0.5 Acre in Sindh.',
    urduMeaning: 'زمین کی پیمائش والی روایتی لوہے کی زنجیر، سندھ میں ادھا ایکڑ رقبہ۔',
    relevance: 'Standard revenue surveying tool for field demarcation.',
  },
  {
    term: 'Girdawari (گردآوری)',
    urduTerm: 'گردآوری',
    category: 'Record',
    meaning: 'Bi-annual field inspection conducted by the Patwari to record harvest crops, cultivators, and tree count.',
    urduMeaning: 'پٹواری کی طرف سے سال میں دو مرتبہ فصل اور کاشتکاری کا سرکاری معائنہ۔',
    relevance: 'Determines agricultural tax liability, crop damage relief, and proof of possession.',
  },
];
