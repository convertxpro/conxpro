# SUB-PROMPT 04: Client-Side Instant Converters (Units, Dev, Date & Color) with Programmatic SEO Tables

## 1. Context & Objective
Client-side instant converters provide instant gratification to visitors, consume minimal server resources, and generate massive, evergreen organic search traffic (e.g., "meters to feet", "kg to lbs", "celsius to fahrenheit", "unix timestamp to date", "json to csv").

Your objective in this prompt is to build the comprehensive suite of 100% client-side instant calculators covering:
1. **13 Classic Unit Categories & 40+ Exact-Match Pair Landing Pages** (Length, Weight, Temp, Area, Volume, Speed, Time, Pressure, Energy, Power, Data, Angle, Fuel).
2. **7 Data & Developer Utilities** (JSON/CSV/XML, Base64, URL, Text Case, Binary/Hex/Dec, Markdown↔HTML, JSON Formatter).
3. **4 Date & Time Utilities** (Timezone Converter, Unix Timestamp, Age Calculator, Date Formatter).
4. **2 Color Converters** (HEX/RGB/HSL/CMYK, Color Picker & Palette Generator).

Every converter must be integrated with the **10-part Programmatic SEO `<ToolLayout />`**, complete with pre-calculated conversion lookup tables (e.g., 1 to 100 unit matrices), step-by-step mathematical formulas, and `FAQPage` + `HowTo` + `SoftwareApplication` JSON-LD schema markup.

---

## 2. Technical Architecture & Component Tree

```
src/
├── components/converters/
│   ├── unit/
│   │   ├── UnitConverterCore.tsx    # Generic modular unit calculation engine
│   │   └── unit-definitions.ts     # Conversion ratios, SI formulas, lookup table generators
│   ├── dev/
│   │   ├── JsonFormatter.tsx        # Syntax highlighter + minifier + validator
│   │   ├── DataFormatConverter.tsx  # CSV ↔ JSON ↔ XML parser
│   │   ├── Base64Tool.tsx           # Text & file to base64
│   │   ├── UrlEncoder.tsx           # URI component encoder/decoder
│   │   ├── TextCaseConverter.tsx    # Title, Sentence, Camel, Snake, Kebab
│   │   ├── NumberBaseConverter.tsx  # Binary, Decimal, Hex, Octal
│   │   └── MarkdownHtmlEditor.tsx   # Live dual-pane markdown preview
│   ├── datetime/
│   │   ├── TimezoneConverter.tsx    # Multi-city world clock & comparison
│   │   ├── UnixTimestampTool.tsx    # Live epoch converter & human date parser
│   │   ├── AgeCalculator.tsx        # Precise years/months/days/hours age output
│   │   └── DateFormatConverter.tsx  # ISO, RFC, DD/MM/YYYY, MM/DD/YYYY
│   └── color/
│       ├── ColorConverter.tsx       # HEX ↔ RGB ↔ HSL ↔ CMYK live sync
│       └── PaletteGenerator.tsx     # Harmonious palette creator + WCAG contrast
└── app/(converters)/
    ├── unit/
    │   ├── [slug]/page.tsx          # Programmatic SSG page for all unit pairs (e.g. /unit/meters-to-feet)
    │   └── page.tsx                 # Master Unit Converter Category Hub
    ├── dev/[slug]/page.tsx          # Dev tool landing pages
    ├── time/[slug]/page.tsx         # Date & time tool landing pages
    └── color/[slug]/page.tsx        # Color tool landing pages
```

---

## 3. Specifications & Programmatic SEO Enhancements

### 3.1 Modular Unit Conversion Engine & Pre-Calculated Tables (`unit-definitions.ts`)
Define high-precision conversion ratios and automated lookup table matrix generators:

```typescript
export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  plural: string;
  toBase: (val: number) => number;
  fromBase: (val: number) => number;
}

export interface UnitCategory {
  id: string;
  title: string;
  baseUnit: string;
  description: string;
  formulaTemplate: (from: string, to: string) => { title: string; expression: string; example: string };
  units: Record<string, UnitDefinition>;
  popularPairs: Array<[string, string]>; // e.g. [['meter', 'foot'], ['kilometer', 'mile']]
}

export const UNIT_CATEGORIES: Record<string, UnitCategory> = {
  length: {
    id: 'length',
    title: 'Length & Distance',
    baseUnit: 'meter',
    description: 'Convert between metric and imperial length units including meters, feet, inches, kilometers, and miles.',
    popularPairs: [
      ['meter', 'foot'],
      ['foot', 'meter'],
      ['kilometer', 'mile'],
      ['mile', 'kilometer'],
      ['centimeter', 'inch'],
      ['inch', 'centimeter'],
    ],
    formulaTemplate: (from, to) => ({
      title: `${from} to ${to} Conversion Formula`,
      expression: `1 ${from} = X ${to}`,
      example: `Multiply value in ${from} by conversion factor to obtain ${to}.`,
    }),
    units: {
      meter: { id: 'meter', name: 'Meter', plural: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      kilometer: { id: 'kilometer', name: 'Kilometer', plural: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      centimeter: { id: 'centimeter', name: 'Centimeter', plural: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      millimeter: { id: 'millimeter', name: 'Millimeter', plural: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      inch: { id: 'inch', name: 'Inch', plural: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      foot: { id: 'foot', name: 'Foot', plural: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      yard: { id: 'yard', name: 'Yard', plural: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      mile: { id: 'mile', name: 'Mile', plural: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
    },
  },
  // Implement remaining 12 categories: weight, temperature, area, volume, speed, time, pressure, energy, power, storage, angle, fuel
};

/**
 * Generates programmatic lookup tables for search engine indexing
 */
export function generateConversionTableData(
  category: UnitCategory,
  fromUnitId: string,
  toUnitId: string,
  values: number[] = [1, 2, 5, 10, 15, 20, 25, 50, 75, 100, 250, 500, 1000]
) {
  const fromUnit = category.units[fromUnitId];
  const toUnit = category.units[toUnitId];

  return {
    title: `${fromUnit.name} to ${toUnit.name} Conversion Reference Table`,
    headers: [`${fromUnit.name} (${fromUnit.symbol})`, `${toUnit.name} (${toUnit.symbol})`] as [string, string],
    rows: values.map((val) => {
      const baseVal = fromUnit.toBase(val);
      const converted = toUnit.fromBase(baseVal);
      return {
        from: `${val} ${fromUnit.symbol}`,
        to: `${Number(converted.toFixed(4))} ${toUnit.symbol}`,
      };
    }),
  };
}
```

---

### 3.2 Programmatic Unit Dynamic Page (`src/app/(converters)/unit/[slug]/page.tsx`)
Statically generate all high-volume unit pair pages using `generateStaticParams()`:

```tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UNIT_CATEGORIES, generateConversionTableData } from '@/components/converters/unit/unit-definitions';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { UnitConverterCore } from '@/components/converters/unit/UnitConverterCore';
import { generateToolMetadata } from '@/lib/seo/metadata';

export async function generateStaticParams() {
  const params: { slug: string }[] = [];
  Object.values(UNIT_CATEGORIES).forEach((category) => {
    category.popularPairs.forEach(([from, to]) => {
      params.push({ slug: `${from}-to-${to}` });
    });
  });
  return params;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Parses slug (e.g. "meter-to-foot") -> Generates rich title, description, and canonical URL
  const [fromUnit, , toUnit] = params.slug.split('-');
  const title = `Convert ${fromUnit} to ${toUnit} Free Online`;
  const description = `Free online ${fromUnit} to ${toUnit} calculator. Live instant conversion, mathematical formula, step-by-step guide, and complete reference table.`;

  return generateToolMetadata({
    toolName: `${fromUnit} to ${toUnit}`,
    category: 'unit-converters',
    slug: params.slug,
    customDescription: description,
  });
}
```

---

### 3.3 Data & Developer Converters Suite
1. **JSON Formatter & Validator (`/convert/dev/json-formatter`):**
   - Live syntax validation, line/column error callout, beautifier & minifier.
   - Comprehensive FAQ: *"Why is my JSON invalid?"*, *"How to format nested JSON arrays?"*.
2. **CSV ↔ JSON ↔ XML Converter (`/convert/dev/csv-to-json`):**
   - Auto-detects delimiters (`,` `;` `\t`), exports formatted JSON array or valid XML.
3. **Base64 Tool (`/convert/dev/base64-encode-decode`):**
   - Encodes/decodes text and handles drag-and-drop file to Base64 URI.
4. **Text Case Converter (`/convert/dev/text-case-converter`):**
   - UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, kebab-case.
5. **Number Base Converter (`/convert/dev/binary-to-decimal`):**
   - Syncs Binary (base 2), Octal (base 8), Decimal (base 10), and Hexadecimal (base 16).

---

### 3.4 Date, Time & Color Converters Suite
1. **Timezone Converter (`/convert/time/timezone-converter`):**
   - World clock comparator across major business hubs (Karachi, Dubai, London, New York, Tokyo).
2. **Unix Timestamp Tool (`/convert/time/unix-timestamp`):**
   - Live ticking epoch clock with milliseconds and UTC/Local ISO 8601 parser.
3. **Age Calculator (`/convert/time/age-calculator`):**
   - Calculates exact age in years, months, days, hours, and next birthday milestone.
4. **Color Converter & Palette Generator (`/convert/color/hex-to-rgb`):**
   - Real-time conversion across HEX, RGB, HSL, and CMYK with WCAG 2.1 contrast ratio checker.

---

## 4. Acceptance Criteria & Verification Checklist

- [ ] All 13 unit categories calculate bidirectional values with high floating-point precision.
- [ ] Programmatic unit pair pages (`/unit/meter-to-foot`, `/unit/kg-to-lbs`, etc.) pre-render via SSG with distinct metadata.
- [ ] Every unit converter page renders a pre-calculated conversion lookup table (1 to 1000 units) for crawler indexing.
- [ ] JSON Formatter, CSV parser, and Base64 tools validate syntax and copy outputs seamlessly.
- [ ] Unix timestamp and timezone tools display live clocks and accurate localized offsets.
- [ ] Color converter synchronizes across HEX, RGB, HSL, and CMYK inputs with zero jitter.
- [ ] Structured data (`SoftwareApplication`, `FAQPage`, `HowTo`, `BreadcrumbList`) validates without errors in Google Rich Results Test.
