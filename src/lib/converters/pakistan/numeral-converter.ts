import Decimal from 'decimal.js';

export interface NumeralConversionResult {
  rawNumber: number;
  formattedSouthAsian: string; // e.g. 1,23,45,678.50
  formattedWestern: string;    // e.g. 12,345,678.50
  inLakhs: number;
  inCrores: number;
  inArabs: number;
  inKharabs: number;
  inMillions: number;
  inBillions: number;
  inTrillions: number;
  inThousands: number;
  wordsEnglishWestern: string;
  wordsEnglishSouthAsian: string;
  wordsUrduScript: string;
  chequeTextRupees: string;
  chequeTextUrdu: string;
}

export type SouthAsianUnit =
  | 'raw'
  | 'thousand'
  | 'lakh'
  | 'crore'
  | 'arab'
  | 'kharab'
  | 'million'
  | 'billion'
  | 'trillion';

export const UNIT_MULTIPLIERS: Record<SouthAsianUnit, number> = {
  raw: 1,
  thousand: 1_000,
  lakh: 100_000,
  crore: 10_000_000,
  arab: 1_000_000_000,
  kharab: 100_000_000_000,
  million: 1_000_000,
  billion: 1_000_000_000,
  trillion: 1_000_000_000_000,
};

export function convertNumerals(
  inputNumber: number | string,
  inputUnit: SouthAsianUnit = 'raw'
): NumeralConversionResult {
  let cleanStr = String(inputNumber).replace(/,/g, '').trim();
  if (!cleanStr || isNaN(Number(cleanStr))) {
    cleanStr = '0';
  }

  let num = new Decimal(cleanStr);
  const multiplier = UNIT_MULTIPLIERS[inputUnit] || 1;
  if (multiplier !== 1) {
    num = num.times(multiplier);
  }

  const n = num.toNumber();

  const inThousands = num.dividedBy(1_000).toNumber();
  const inLakhs = num.dividedBy(100_000).toNumber();
  const inCrores = num.dividedBy(10_000_000).toNumber();
  const inArabs = num.dividedBy(1_000_000_000).toNumber();
  const inKharabs = num.dividedBy(100_000_000_000).toNumber();

  const inMillions = num.dividedBy(1_000_000).toNumber();
  const inBillions = num.dividedBy(1_000_000_000).toNumber();
  const inTrillions = num.dividedBy(1_000_000_000_000).toNumber();

  const engSouthAsian = numberToEnglishSouthAsianWords(n);
  const engWestern = numberToEnglishWesternWords(n);
  const urduWords = numberToUrduWords(n);

  return {
    rawNumber: n,
    formattedSouthAsian: formatSouthAsianGrouping(n),
    formattedWestern: formatWesternGrouping(n),
    inThousands: Number(inThousands.toFixed(4)),
    inLakhs: Number(inLakhs.toFixed(6)),
    inCrores: Number(inCrores.toFixed(6)),
    inArabs: Number(inArabs.toFixed(6)),
    inKharabs: Number(inKharabs.toFixed(6)),
    inMillions: Number(inMillions.toFixed(6)),
    inBillions: Number(inBillions.toFixed(6)),
    inTrillions: Number(inTrillions.toFixed(6)),
    wordsEnglishWestern: engWestern,
    wordsEnglishSouthAsian: engSouthAsian,
    wordsUrduScript: urduWords,
    chequeTextRupees: n === 0 ? 'Zero Rupees Only' : `${engSouthAsian} Rupees Only`,
    chequeTextUrdu: n === 0 ? 'صفر روپے فقط' : `${urduWords} فقط`,
  };
}

/**
 * Formats a number with South Asian grouping: 12,34,56,789.00
 */
export function formatSouthAsianGrouping(num: number): string {
  if (isNaN(num)) return '0';
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const str = absNum.toString();
  const parts = str.split('.');
  const intPart = parts[0];
  const decPart = parts.length > 1 ? `.${parts[1]}` : '';

  if (intPart.length <= 3) {
    return (isNegative ? '-' : '') + intPart + decPart;
  }

  const lastThree = intPart.substring(intPart.length - 3);
  const otherNumbers = intPart.substring(0, intPart.length - 3);
  const formattedOther = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return (isNegative ? '-' : '') + formattedOther + ',' + lastThree + decPart;
}

/**
 * Formats a number with Western standard grouping: 123,456,789.00
 */
export function formatWesternGrouping(num: number): string {
  if (isNaN(num)) return '0';
  const parts = num.toString().split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
}

const ONES_ENGLISH = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS_ENGLISH = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function smallNumberToEnglish(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES_ENGLISH[n];
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return `${TENS_ENGLISH[tens]}${ones > 0 ? ' ' + ONES_ENGLISH[ones] : ''}`;
}

function threeDigitToEnglish(n: number): string {
  const hundred = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];
  if (hundred > 0) {
    parts.push(`${ONES_ENGLISH[hundred]} Hundred`);
  }
  if (rem > 0) {
    parts.push(smallNumberToEnglish(rem));
  }
  return parts.join(' ');
}

/**
 * Converts any number to English words in South Asian notation (Kharab, Arab, Crore, Lakh, Thousand, Hundred).
 */
export function numberToEnglishSouthAsianWords(num: number): string {
  if (isNaN(num)) return 'Zero';
  if (num === 0) return 'Zero';

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  let integerPart = Math.floor(absNum);
  const decimalPart = Math.round((absNum - integerPart) * 100);

  if (integerPart === 0 && decimalPart > 0) {
    return `${smallNumberToEnglish(decimalPart)} Paisa`;
  }

  const words: string[] = [];

  // Kharab (100 Billion)
  const kharab = Math.floor(integerPart / 100_000_000_000);
  if (kharab > 0) {
    words.push(`${threeDigitToEnglish(kharab)} Kharab`);
    integerPart %= 100_000_000_000;
  }

  // Arab (1 Billion)
  const arab = Math.floor(integerPart / 1_000_000_000);
  if (arab > 0) {
    words.push(`${threeDigitToEnglish(arab)} Arab`);
    integerPart %= 1_000_000_000;
  }

  // Crore (10 Million)
  const crore = Math.floor(integerPart / 10_000_000);
  if (crore > 0) {
    words.push(`${threeDigitToEnglish(crore)} Crore`);
    integerPart %= 10_000_000;
  }

  // Lakh (100 Thousand)
  const lakh = Math.floor(integerPart / 100_000);
  if (lakh > 0) {
    words.push(`${threeDigitToEnglish(lakh)} Lakh`);
    integerPart %= 100_000;
  }

  // Thousand
  const thousand = Math.floor(integerPart / 1_000);
  if (thousand > 0) {
    words.push(`${threeDigitToEnglish(thousand)} Thousand`);
    integerPart %= 1_000;
  }

  // Hundred
  const hundred = Math.floor(integerPart / 100);
  if (hundred > 0) {
    words.push(`${ONES_ENGLISH[hundred]} Hundred`);
    integerPart %= 100;
  }

  // Remaining Units (<100)
  if (integerPart > 0) {
    words.push(smallNumberToEnglish(integerPart));
  }

  let result = words.join(' ');
  if (decimalPart > 0) {
    result += ` and ${smallNumberToEnglish(decimalPart)} Paisa`;
  }

  return (isNegative ? 'Minus ' : '') + result;
}

/**
 * Converts any number to English words in Western notation (Trillion, Billion, Million, Thousand, Hundred).
 */
export function numberToEnglishWesternWords(num: number): string {
  if (isNaN(num)) return 'Zero';
  if (num === 0) return 'Zero';

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  let integerPart = Math.floor(absNum);
  const decimalPart = Math.round((absNum - integerPart) * 100);

  if (integerPart === 0 && decimalPart > 0) {
    return `${smallNumberToEnglish(decimalPart)} Cents`;
  }

  const words: string[] = [];

  // Trillions (10^12)
  const trillion = Math.floor(integerPart / 1_000_000_000_000);
  if (trillion > 0) {
    words.push(`${threeDigitToEnglish(trillion)} Trillion`);
    integerPart %= 1_000_000_000_000;
  }

  // Billions (10^9)
  const billion = Math.floor(integerPart / 1_000_000_000);
  if (billion > 0) {
    words.push(`${threeDigitToEnglish(billion)} Billion`);
    integerPart %= 1_000_000_000;
  }

  // Millions (10^6)
  const million = Math.floor(integerPart / 1_000_000);
  if (million > 0) {
    words.push(`${threeDigitToEnglish(million)} Million`);
    integerPart %= 1_000_000;
  }

  // Thousands (10^3)
  const thousand = Math.floor(integerPart / 1_000);
  if (thousand > 0) {
    words.push(`${threeDigitToEnglish(thousand)} Thousand`);
    integerPart %= 1_000;
  }

  // Hundreds & units
  if (integerPart > 0) {
    words.push(threeDigitToEnglish(integerPart));
  }

  let result = words.join(' ');
  if (decimalPart > 0) {
    result += ` and ${smallNumberToEnglish(decimalPart)} Cents`;
  }

  return (isNegative ? 'Minus ' : '') + result;
}

// Full Urdu vocabulary for accurate numbering 0-99
const URDU_NUMBERS_0_TO_99: string[] = [
  'صفر', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو',
  'دس', 'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس',
  'بیس', 'اکیس', 'بائیس', 'تئیس', 'چوبیس', 'پچیس', 'چھبیس', 'ستائیس', 'اٹھائیس', 'انتیس',
  'تیس', 'اکتیس', 'بتیس', 'تینتیس', 'چونتیس', 'پینتیس', 'چھتیس', 'سینتیس', 'اڑتیس', 'انتالیس',
  'چالیس', 'اکتالیس', 'بیالیس', 'تینتالیس', 'چوالیس', 'پینتالیس', 'چھیاالیس', 'سینتالیس', 'اڑتالیس', 'انچاس',
  'پچاس', 'اکیاون', 'باون', 'ترپن', 'چون', 'پچپن', 'چھپن', 'ستاون', 'اٹاون', 'انسٹھ',
  'ساٹھ', 'اکسٹھ', 'باسٹھ', 'تریسٹھ', 'چونسٹھ', 'پینسٹھ', 'چھیاسٹھ', 'سڑسٹھ', 'اڑسٹھ', 'انتر',
  'ستر', 'اکہتر', 'بہتر', 'تہتر', 'چوہتر', 'پچہتر', 'چھہتر', 'ستتر', 'اٹھہتر', 'اناسی',
  'اسی', 'اکیاسی', 'بیاسی', 'تراسی', 'چوراسی', 'پچاسی', 'چھیاسی', 'ستاسی', 'اٹاسی', 'نواسی',
  'نوے', 'اکیانوے', 'بانوے', 'ترانوے', 'چورانوے', 'پچانوے', 'چھیانوے', 'ستانوے', 'اٹانوے', 'ننانوے'
];

function smallUrduToWords(n: number): string {
  if (n >= 0 && n <= 99) {
    return URDU_NUMBERS_0_TO_99[n];
  }
  return String(n);
}

function threeDigitUrdu(n: number): string {
  const hundred = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];

  if (hundred > 0) {
    parts.push(`${smallUrduToWords(hundred)} سو`);
  }
  if (rem > 0) {
    parts.push(smallUrduToWords(rem));
  }
  return parts.join(' ');
}

/**
 * Converts any number to full authentic Urdu script words:
 * e.g. 5,50,00,000 -> پانچ کروڑ پچاس لاکھ روپے
 */
export function numberToUrduWords(num: number): string {
  if (isNaN(num)) return 'صفر';
  if (num === 0) return 'صفر روپے';

  const isNegative = num < 0;
  const absNum = Math.abs(num);
  let integerPart = Math.floor(absNum);
  const decimalPart = Math.round((absNum - integerPart) * 100);

  const parts: string[] = [];

  // Kharab (کھرب)
  const kharab = Math.floor(integerPart / 100_000_000_000);
  if (kharab > 0) {
    parts.push(`${threeDigitUrdu(kharab)} کھرب`);
    integerPart %= 100_000_000_000;
  }

  // Arab (ارب)
  const arab = Math.floor(integerPart / 1_000_000_000);
  if (arab > 0) {
    parts.push(`${threeDigitUrdu(arab)} ارب`);
    integerPart %= 1_000_000_000;
  }

  // Crore (کروڑ)
  const crore = Math.floor(integerPart / 10_000_000);
  if (crore > 0) {
    parts.push(`${threeDigitUrdu(crore)} کروڑ`);
    integerPart %= 10_000_000;
  }

  // Lakh (لاکھ)
  const lakh = Math.floor(integerPart / 100_000);
  if (lakh > 0) {
    parts.push(`${threeDigitUrdu(lakh)} لاکھ`);
    integerPart %= 100_000;
  }

  // Thousand (ہزار)
  const thousand = Math.floor(integerPart / 1_000);
  if (thousand > 0) {
    parts.push(`${threeDigitUrdu(thousand)} ہزار`);
    integerPart %= 1_000;
  }

  // Hundreds & units
  if (integerPart > 0) {
    parts.push(threeDigitUrdu(integerPart));
  }

  let finalWords = parts.join(' ');
  if (!finalWords) finalWords = 'صفر';

  finalWords += ' روپے';

  if (decimalPart > 0) {
    finalWords += ` اور ${smallUrduToWords(decimalPart)} پیسے`;
  }

  return (isNegative ? 'منفی ' : '') + finalWords;
}

export interface NumeralLookupRow {
  southAsianName: string;
  urduName: string;
  numericalValue: number;
  westernEquivalent: string;
  southAsianFormatted: string;
  zeros: number;
}

export const NUMERAL_LOOKUP_TABLE: NumeralLookupRow[] = [
  {
    southAsianName: '1 Hazar (Thousand)',
    urduName: 'ایک ہزار',
    numericalValue: 1_000,
    westernEquivalent: '1 Thousand (1K)',
    southAsianFormatted: '1,000',
    zeros: 3,
  },
  {
    southAsianName: '10 Hazar',
    urduName: 'دس ہزار',
    numericalValue: 10_000,
    westernEquivalent: '10 Thousand (10K)',
    southAsianFormatted: '10,000',
    zeros: 4,
  },
  {
    southAsianName: '1 Lakh',
    urduName: 'ایک لاکھ',
    numericalValue: 100_000,
    westernEquivalent: '100 Thousand (0.1 Million)',
    southAsianFormatted: '1,00,000',
    zeros: 5,
  },
  {
    southAsianName: '10 Lakhs',
    urduName: 'دس لاکھ',
    numericalValue: 1_000_000,
    westernEquivalent: '1 Million (1M)',
    southAsianFormatted: '10,00,000',
    zeros: 6,
  },
  {
    southAsianName: '50 Lakhs',
    urduName: 'پچاس لاکھ',
    numericalValue: 5_000_000,
    westernEquivalent: '5 Million (5M)',
    southAsianFormatted: '50,00,000',
    zeros: 6,
  },
  {
    southAsianName: '1 Crore',
    urduName: 'ایک کروڑ',
    numericalValue: 10_000_000,
    westernEquivalent: '10 Million (10M)',
    southAsianFormatted: '1,00,00,000',
    zeros: 7,
  },
  {
    southAsianName: '10 Crores',
    urduName: 'دس کروڑ',
    numericalValue: 100_000_000,
    westernEquivalent: '100 Million (100M)',
    southAsianFormatted: '10,00,00,000',
    zeros: 8,
  },
  {
    southAsianName: '1 Arab',
    urduName: 'ایک ارب',
    numericalValue: 1_000_000_000,
    westernEquivalent: '1 Billion (1B)',
    southAsianFormatted: '1,00,00,00,000',
    zeros: 9,
  },
  {
    southAsianName: '10 Arabs',
    urduName: 'دس ارب',
    numericalValue: 10_000_000_000,
    westernEquivalent: '10 Billion (10B)',
    southAsianFormatted: '10,00,00,00,000',
    zeros: 10,
  },
  {
    southAsianName: '1 Kharab',
    urduName: 'ایک کھرب',
    numericalValue: 100_000_000_000,
    westernEquivalent: '100 Billion (100B)',
    southAsianFormatted: '1,00,00,00,00,000',
    zeros: 11,
  },
  {
    southAsianName: '10 Kharabs',
    urduName: 'دس کھرب',
    numericalValue: 1_000_000_000_000,
    westernEquivalent: '1 Trillion (1T)',
    southAsianFormatted: '10,00,00,00,00,000',
    zeros: 12,
  },
];
