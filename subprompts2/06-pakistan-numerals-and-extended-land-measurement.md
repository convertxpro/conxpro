# SUB-PROMPT 06: Pakistan Regional Moat — Numerals & Extended Land Measurement Suite

## 1. Context & Objective
South Asian counting systems and agricultural land measurements are deeply entrenched across Pakistan, India, Bangladesh, and the global diaspora.
- **Numerals:** Financial transactions, real estate listings, and business balance sheets switch constantly between **Lakhs / Crores / Arabs** and **Millions / Billions / Trillions**. Cheque writing in banking requires exact verbal transliteration in both English and Urdu script.
- **Extended Land Units:** Beyond urban Marlas and Kanals, millions of acres of agricultural real estate are traded in **Murabba, Bigha, Acre (Qila / Killa), Biswa, Sarsahi, and Karam**, with distinct regional standards between Punjab, Sindh, and KPK.

Your objective in this sub-prompt is to build:
1. **Tool B3: South Asian Numeral Converter** (`lakh-crore-to-million-billion`).
2. **Tool B4: Extended Land Measurement Suite** (`murabba-bigha-to-acre`).
3. Dedicated interactive components in `src/components/converters/pakistan/` wired into `ConverterCanvas.tsx`.
4. High-ranking programmatic SEO with bilingual Urdu/English metadata, cheque writing tools, and land lookup tables.

---

## 2. Technical Stack & Dependencies

- **Precision Mathematics:** `decimal.js`
- **Urdu Script & Typography:** Google Fonts `Noto Nastaliq Urdu`
- **Number-to-Words Libraries / Utilities:** Custom zero-dependency South Asian and Western word transliterator

Install dependencies:
```bash
npm install decimal.js
```

---

## 3. Tool B3: South Asian Numeral Converter (Lakhs & Crores ↔ Millions & Billions)

### 3.1 Numeral Conversion & Word Transliterator Engine (`src/lib/converters/pakistan/numeral-converter.ts`)
```typescript
import Decimal from 'decimal.js';

export interface NumeralConversionResult {
  rawNumber: number;
  formattedSouthAsian: string; // 1,23,45,678
  formattedWestern: string;    // 12,345,678
  inLakhs: number;
  inCrores: number;
  inArabs: number;
  inKharabs: number;
  inMillions: number;
  inBillions: number;
  inTrillions: number;
  wordsEnglishWestern: string;
  wordsEnglishSouthAsian: string;
  wordsUrduScript: string;
  chequeTextRupees: string;
}

const URDU_ONES = ['', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو'];
const URDU_TEENS = ['دس', 'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس'];
const URDU_TENS = ['', 'دس', 'بیس', 'تیس', 'چالیس', 'پچاس', 'ساٹھ', 'ستر', 'اسی', 'نوے'];

export function convertNumerals(inputNumber: number | string): NumeralConversionResult {
  const cleanStr = String(inputNumber).replace(/,/g, '').trim();
  const num = new Decimal(cleanStr || 0);
  const n = num.toNumber();

  const inLakhs = num.dividedBy(100_000).toNumber();
  const inCrores = num.dividedBy(10_000_000).toNumber();
  const inArabs = num.dividedBy(1_000_000_000).toNumber();
  const inKharabs = num.dividedBy(100_000_000_000).toNumber();

  const inMillions = num.dividedBy(1_000_000).toNumber();
  const inBillions = num.dividedBy(1_000_000_000).toNumber();
  const inTrillions = num.dividedBy(1_000_000_000_000).toNumber();

  return {
    rawNumber: n,
    formattedSouthAsian: formatSouthAsianGrouping(n),
    formattedWestern: n.toLocaleString('en-US'),
    inLakhs: Number(inLakhs.toFixed(4)),
    inCrores: Number(inCrores.toFixed(4)),
    inArabs: Number(inArabs.toFixed(4)),
    inKharabs: Number(inKharabs.toFixed(4)),
    inMillions: Number(inMillions.toFixed(4)),
    inBillions: Number(inBillions.toFixed(4)),
    inTrillions: Number(inTrillions.toFixed(4)),
    wordsEnglishWestern: numberToEnglishWesternWords(n),
    wordsEnglishSouthAsian: numberToEnglishSouthAsianWords(n),
    wordsUrduScript: numberToUrduWords(n),
    chequeTextRupees: `${numberToEnglishSouthAsianWords(n)} Rupees Only`,
  };
}

export function formatSouthAsianGrouping(num: number): string {
  const parts = num.toString().split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return parts.length > 1 ? `${formatted}.${parts[1]}` : formatted;
}

export function numberToEnglishSouthAsianWords(num: number): string {
  if (num === 0) return 'Zero';
  // Breakdown into Kharab, Arab, Crore, Lakh, Thousand, Hundred, Units
  let remaining = Math.floor(num);
  const words: string[] = [];

  const kharab = Math.floor(remaining / 100_000_000_000);
  if (kharab > 0) {
    words.push(`${numberToEnglishWesternWords(kharab)} Kharab`);
    remaining %= 100_000_000_000;
  }

  const arab = Math.floor(remaining / 1_000_000_000);
  if (arab > 0) {
    words.push(`${numberToEnglishWesternWords(arab)} Arab`);
    remaining %= 1_000_000_000;
  }

  const crore = Math.floor(remaining / 10_000_000);
  if (crore > 0) {
    words.push(`${numberToEnglishWesternWords(crore)} Crore`);
    remaining %= 10_000_000;
  }

  const lakh = Math.floor(remaining / 100_000);
  if (lakh > 0) {
    words.push(`${numberToEnglishWesternWords(lakh)} Lakh`);
    remaining %= 100_000;
  }

  const thousand = Math.floor(remaining / 1_000);
  if (thousand > 0) {
    words.push(`${numberToEnglishWesternWords(thousand)} Thousand`);
    remaining %= 1_000;
  }

  const hundred = Math.floor(remaining / 100);
  if (hundred > 0) {
    words.push(`${numberToEnglishWesternWords(hundred)} Hundred`);
    remaining %= 100;
  }

  if (remaining > 0) {
    words.push(numberToEnglishWesternWords(remaining));
  }

  return words.join(' ');
}

export function numberToEnglishWesternWords(num: number): string {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if (num === 0) return 'Zero';
  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 1000000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 1000000000) return inWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + inWords(n % 1000000) : '');
    return inWords(Math.floor(n / 1000000000)) + ' Billion' + (n % 1000000000 !== 0 ? ' ' + inWords(n % 1000000000) : '');
  }
  return inWords(num);
}

export function numberToUrduWords(num: number): string {
  if (num === 0) return 'صفر';
  // Example Urdu transliteration representation
  const crore = Math.floor(num / 10_000_000);
  const lakh = Math.floor((num % 10_000_000) / 100_000);
  const thousand = Math.floor((num % 100_000) / 1000);

  const parts: string[] = [];
  if (crore > 0) parts.push(`${crore} کروڑ`);
  if (lakh > 0) parts.push(`${lakh} لاکھ`);
  if (thousand > 0) parts.push(`${thousand} ہزار`);
  const remainder = num % 1000;
  if (remainder > 0) parts.push(`${remainder}`);
  parts.push('روپے');

  return parts.join(' ');
}
```

### 3.2 UI Component (`src/components/converters/pakistan/NumeralConverterComponent.tsx`)
- **Interactive Multi-Denomination Display:**
  - Enter `55,000,000` $\rightarrow$ Instantly shows `5.5 Crore`, `550 Lakhs`, `55 Million`, `0.055 Billion`.
- **Urdu Callout Card:** Urdu script rendered in `Noto Nastaliq Urdu` font with one-click copy.
- **Cheque Writer Box:** Formats banking string (`"Fifty-Five Million Rupees Only"`) with instant copy for financial clerks.
- **Quick Preset Selector:** `1 Lakh`, `10 Lakhs (1 Million)`, `1 Crore (10 Million)`, `10 Crores (100 Million)`, `1 Arab (1 Billion)`.

---

## 4. Tool B4: Extended Land Measurement Suite (Murabba & Bigha ↔ Kanal ↔ Acre ↔ Sq Ft)

### 4.1 Land Measurement Calculation Engine (`src/lib/converters/pakistan/land-units.ts`)
```typescript
import Decimal from 'decimal.js';

export type RegionalStandard = 'punjab' | 'sindh' | 'patwari' | 'cda';

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
}

export function calculateLandUnits(
  value: number,
  unit: keyof LandUnitMatrix,
  standard: RegionalStandard = 'punjab'
): LandUnitMatrix {
  // Determine Sq Feet per Marla based on regional standard
  let sqFtPerMarla = 225; // Default Urban Punjab
  if (standard === 'patwari' || standard === 'punjab') sqFtPerMarla = 272.25; // Official Revenue
  if (standard === 'cda') sqFtPerMarla = 250;

  // Convert input unit to total Square Feet baseline
  let baseSqFt = 0;
  switch (unit) {
    case 'sqFeet':
      baseSqFt = value;
      break;
    case 'sqMeters':
      baseSqFt = value * 10.7639;
      break;
    case 'sqGazz':
      baseSqFt = value * 9;
      break;
    case 'sarsahi':
      baseSqFt = value * (sqFtPerMarla / 9);
      break;
    case 'marla':
      baseSqFt = value * sqFtPerMarla;
      break;
    case 'biswa':
      baseSqFt = value * (sqFtPerMarla * 1); // 1 Biswa = 1 Marla in standard Punjab
      break;
    case 'kanal':
      baseSqFt = value * sqFtPerMarla * 20;
      break;
    case 'bigha':
      // In Punjab: 1 Bigha = 4 Kanals; in Sindh: 1 Bigha = 2 Kanals
      baseSqFt = standard === 'sindh' ? value * sqFtPerMarla * 20 * 2 : value * sqFtPerMarla * 20 * 4;
      break;
    case 'acre':
      baseSqFt = value * sqFtPerMarla * 20 * 8; // 1 Acre = 8 Kanals
      break;
    case 'murabba':
      baseSqFt = value * sqFtPerMarla * 20 * 8 * 25; // 1 Murabba = 25 Acres
      break;
  }

  const marlaVal = baseSqFt / sqFtPerMarla;
  const kanalVal = marlaVal / 20;
  const acreVal = kanalVal / 8;
  const murabbaVal = acreVal / 25;

  return {
    sqFeet: Number(baseSqFt.toFixed(2)),
    sqMeters: Number((baseSqFt / 10.7639).toFixed(2)),
    sqGazz: Number((baseSqFt / 9).toFixed(2)),
    sarsahi: Number((marlaVal * 9).toFixed(2)),
    marla: Number(marlaVal.toFixed(3)),
    biswa: Number(marlaVal.toFixed(3)),
    kanal: Number(kanalVal.toFixed(3)),
    bigha: Number((standard === 'sindh' ? kanalVal / 2 : kanalVal / 4).toFixed(3)),
    acre: Number(acreVal.toFixed(4)),
    murabba: Number(murabbaVal.toFixed(4)),
  };
}
```

### 4.2 UI Component (`src/components/converters/pakistan/ExtendedLandConverterComponent.tsx`)
- **Regional Standard Toggle:** `Punjab Revenue (272.25 sq ft / Marla, 1 Murabba = 25 Acres)` | `Sindh (1 Bigha = 2 Kanals)` | `Urban Housing (225 sq ft / Marla)`.
- **Plot Dimension Visualizer:** Enter Length & Width in feet $\rightarrow$ shows exact area in Murabba, Acres, Kanals, Marlas, and Square Feet.
- **Land Valuation Calculator:** Enter Total Price or Price per Acre $\rightarrow$ dynamically computes Price per Kanal, Price per Marla, and Price per Sq Ft.
- **Revenue Terms Glossary:** Explains *Murabba, Qilla, Bigha, Kanal, Marla, Sarsahi, Karam, Fard, Khasra*.

---

## 5. Programmatic SEO & Verification Checklist

Add FAQ schemas for:
- *"How many Lakhs or Crores are in 1 Million and 1 Billion?"*
- *"How many Kanals and Acres are in 1 Murabba in Punjab Pakistan?"*
- *"What is the difference between Bigha in Punjab vs Sindh?"*

### Acceptance Checklist:
- [ ] Numeral converter accurately translates numbers into Lakhs, Crores, Millions, Billions, and Urdu script.
- [ ] Cheque writer generates grammatically accurate English and Urdu financial text.
- [ ] Murabba and Bigha accurately scale based on selected regional standard (Punjab 25 Acres vs Sindh 2 Kanals).
- [ ] Real estate price per unit converts without precision loss.
