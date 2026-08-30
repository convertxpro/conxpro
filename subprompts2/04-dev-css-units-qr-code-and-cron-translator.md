# SUB-PROMPT 04: Developer Productivity Utilities — CSS Units, QR Codes & Cron Translator

## 1. Context & Objective
Frontend developers, system administrators, and digital marketers constantly rely on lightweight web utilities:
- Converting typography and layout dimensions (`px` ↔ `rem` ↔ `em` ↔ `vw` ↔ `vh`) with responsive `clamp()` CSS formulas.
- Generating branded QR codes for URLs, Wi-Fi auto-connect, vCards, and WhatsApp messaging (+92 phone support).
- Translating and scheduling complex 5-field and 6-field cron expressions with plain English humanization and exact upcoming run times.

Your objective in this sub-prompt is to build:
1. **Tool A5: CSS Units Converter** (`css-unit-converter`).
2. **Tool A6: Smart QR Code & Barcode Generator** (`qr-code-generator`).
3. **Tool A7: Cron Expression Translator & Crontab Builder** (`cron-expression-decoder`).
4. Wire all tools into `src/components/converters/dev/` and `ConverterCanvas.tsx`.

---

## 2. Technical Stack & Dependencies

- **QR Code Generation:** `qrcode` + `@types/qrcode` (Canvas, SVG, DataURL)
- **Cron Parsing & Humanization:** `cronstrue` and `cron-parser`
- **Math & Precision:** Standard high-precision JS math

Install dependencies:
```bash
npm install qrcode cronstrue cron-parser
npm install @types/qrcode @types/cron-parser --save-dev
```

---

## 3. Tool A5: CSS Units Converter & Clamp() Generator

### 3.1 CSS Unit Engine (`src/lib/converters/dev/css-units.ts`)
```typescript
export interface CssBaselineConfig {
  rootFontSizePx: number; // default: 16
  parentFontSizePx: number; // default: 16
  viewportWidthPx: number; // default: 1920
  viewportHeightPx: number; // default: 1080
}

export interface CssUnitMatrix {
  px: number;
  rem: number;
  em: number;
  vw: number;
  vh: number;
  pt: number;
  percent: number;
}

export function calculateCssMatrix(value: number, unit: keyof CssUnitMatrix, config: CssBaselineConfig): CssUnitMatrix {
  // Convert any input unit to standard baseline PX first
  let basePx = 0;
  switch (unit) {
    case 'px':
      basePx = value;
      break;
    case 'rem':
      basePx = value * config.rootFontSizePx;
      break;
    case 'em':
      basePx = value * config.parentFontSizePx;
      break;
    case 'vw':
      basePx = (value / 100) * config.viewportWidthPx;
      break;
    case 'vh':
      basePx = (value / 100) * config.viewportHeightPx;
      break;
    case 'pt':
      basePx = value * (4 / 3); // 1pt = 1.333px (96dpi / 72pt)
      break;
    case 'percent':
      basePx = (value / 100) * config.parentFontSizePx;
      break;
  }

  return {
    px: Number(basePx.toFixed(3)),
    rem: Number((basePx / config.rootFontSizePx).toFixed(4)),
    em: Number((basePx / config.parentFontSizePx).toFixed(4)),
    vw: Number(((basePx / config.viewportWidthPx) * 100).toFixed(4)),
    vh: Number(((basePx / config.viewportHeightPx) * 100).toFixed(4)),
    pt: Number((basePx * 0.75).toFixed(3)),
    percent: Number(((basePx / config.parentFontSizePx) * 100).toFixed(2)),
  };
}

export function generateClampSnippet(
  minPx: number,
  maxPx: number,
  minViewportPx: number = 375,
  maxViewportPx: number = 1440,
  rootFontSize: number = 16
): string {
  const minRem = (minPx / rootFontSize).toFixed(4);
  const maxRem = (maxPx / rootFontSize).toFixed(4);

  const slope = (maxPx - minPx) / (maxViewportPx - minViewportPx);
  const yAxisIntersection = -minViewportPx * slope + minPx;
  const preferredVw = (slope * 100).toFixed(4);
  const preferredRem = (yAxisIntersection / rootFontSize).toFixed(4);

  return `font-size: clamp(${minRem}rem, ${preferredRem}rem + ${preferredVw}vw, ${maxRem}rem);`;
}

export function getTailwindMatch(pxValue: number): string | null {
  const map: Record<number, string> = {
    12: 'text-xs (0.75rem / 12px)',
    14: 'text-sm (0.875rem / 14px)',
    16: 'text-base (1rem / 16px)',
    18: 'text-lg (1.125rem / 18px)',
    20: 'text-xl (1.25rem / 20px)',
    24: 'text-2xl (1.5rem / 24px)',
    30: 'text-3xl (1.875rem / 30px)',
    36: 'text-4xl (2.25rem / 36px)',
    48: 'text-5xl (3rem / 48px)',
    64: 'text-6xl (4rem / 64px)',
  };
  return map[Math.round(pxValue)] || null;
}
```

### 3.2 UI Component (`src/components/converters/dev/CssUnitConverterComponent.tsx`)
- **Real-Time Input Matrix:** Inputs for `px`, `rem`, `em`, `vw`, `vh`, `pt`, `%` that synchronize dynamically.
- **Baseline Configuration Bar:** Root Font Size (default `16px`), Parent Font Size (`16px`), Viewport Width (`1920px`), Viewport Height (`1080px`).
- **Responsive `clamp()` Generator Card:** Enter Min Font Size (`16px` at `375px`) and Max Font Size (`32px` at `1440px`) $\rightarrow$ generates instant production-ready CSS snippet with copy button.
- **Tailwind Helper Badge:** Displays matching Tailwind CSS typography/spacing classes.

---

## 4. Tool A6: Smart QR Code & Barcode Generator

### 4.1 QR Code Generator Engine (`src/lib/converters/dev/qr-generator.ts`)
```typescript
import QRCode from 'qrcode';

export type QrPayloadType = 'url' | 'wifi' | 'whatsapp' | 'vcard' | 'text' | 'email';

export interface QrCodeOptions {
  type: QrPayloadType;
  content: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  width: number;
  darkColor: string;
  lightColor: string;
  logoDataUrl?: string;
  wifiConfig?: { ssid: string; password: string; encryption: 'WPA' | 'WEP' | 'nopass'; hidden: boolean };
  whatsappConfig?: { phone: string; message: string };
  vcardConfig?: { name: string; org: string; phone: string; email: string; url: string };
}

export function formatQrPayload(options: QrCodeOptions): string {
  switch (options.type) {
    case 'url':
      return options.content.startsWith('http') ? options.content : `https://${options.content}`;
    case 'wifi':
      if (!options.wifiConfig) return options.content;
      const { ssid, password, encryption, hidden } = options.wifiConfig;
      return `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden ? 'true' : 'false'};;`;
    case 'whatsapp':
      if (!options.whatsappConfig) return options.content;
      const cleanPhone = options.whatsappConfig.phone.replace(/[^0-9]/g, '');
      return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(options.whatsappConfig.message)}`;
    case 'vcard':
      if (!options.vcardConfig) return options.content;
      const { name, org, phone, email, url } = options.vcardConfig;
      return `BEGIN:VCARD\nVERSION:3.0\nN:${name}\nFN:${name}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nURL:${url}\nEND:VCARD`;
    case 'email':
      return `mailto:${options.content}`;
    default:
      return options.content;
  }
}

export async function generateQrDataUrl(options: QrCodeOptions): Promise<string> {
  const payload = formatQrPayload(options);
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: options.errorCorrectionLevel,
    width: options.width,
    margin: 2,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#ffffff',
    },
  });
}

export async function generateQrSvgString(options: QrCodeOptions): Promise<string> {
  const payload = formatQrPayload(options);
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrectionLevel,
    width: options.width,
    margin: 2,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#ffffff',
    },
  });
}
```

### 4.2 UI Component (`src/components/converters/dev/QrCodeGeneratorComponent.tsx`)
- **Mode Selector Tabs:** URL / Link, Wi-Fi Network (SSID, Password, Encryption), WhatsApp Direct (+92 Pakistan prefill), Contact vCard, Plain Text.
- **Visual Customizer:** Foreground and background color pickers, Error Correction dropdown (7% Low to 30% High for logos), Logo image upload (places icon in center).
- **Download Suite:** Instant high-res export buttons: **Download PNG (2048px)**, **Download Vector SVG**, **Download WebP**.

---

## 5. Tool A7: Cron Expression Translator & Builder

### 5.1 Cron Engine (`src/lib/converters/dev/cron-tools.ts`)
```typescript
import cronstrue from 'cronstrue';
import { parseExpression } from 'cron-parser';

export interface CronAnalysis {
  expression: string;
  humanDescription: string;
  isValid: boolean;
  error?: string;
  nextExecutionsUtc: string[];
  nextExecutionsPkt: string[];
}

export function analyzeCronExpression(expression: string): CronAnalysis {
  const trimmed = expression.trim();
  try {
    const humanDescription = cronstrue.toString(trimmed, { use24HourTimeFormat: true, verbose: true });
    
    // Calculate next 10 executions
    const interval = parseExpression(trimmed);
    const nextExecutionsUtc: string[] = [];
    const nextExecutionsPkt: string[] = [];

    for (let i = 0; i < 10; i++) {
      const date = interval.next().toDate();
      nextExecutionsUtc.push(date.toUTCString());
      nextExecutionsPkt.push(
        date.toLocaleString('en-US', { timeZone: 'Asia/Karachi', dateStyle: 'medium', timeStyle: 'medium' }) + ' (PKT)'
      );
    }

    return {
      expression: trimmed,
      humanDescription,
      isValid: true,
      nextExecutionsUtc,
      nextExecutionsPkt,
    };
  } catch (err: any) {
    return {
      expression: trimmed,
      humanDescription: '',
      isValid: false,
      error: err.message || 'Invalid cron expression format',
      nextExecutionsUtc: [],
      nextExecutionsPkt: [],
    };
  }
}
```

### 5.2 UI Component (`src/components/converters/dev/CronDecoderComponent.tsx`)
- **Human Translation Card:** Translates `*/15 * * * *` $\rightarrow$ *"Every 15 minutes, every hour, every day"*.
- **Interactive Visual Crontab Builder:** Dropdown pickers for Minute (`*`, `0, 15, 30, 45`, `*/5`), Hour, Day of Month, Month, Day of Week.
- **Upcoming Execution Timeline:** Displays the next 10 exact trigger dates and times in UTC and Pakistan Standard Time (PKT).
- **Crontab Cheat Sheet Drawer:** Reference list of standard expressions (`0 0 * * *` daily at midnight, `0 12 * * 1-5` weekdays at noon).

---

## 6. Programmatic SEO & Acceptance Criteria

Add FAQ schemas for:
- *"How to calculate responsive CSS font size with clamp()?"*
- *"How to create a Wi-Fi or WhatsApp direct message QR Code?"*
- *"How does a 5-part crontab expression work?"*

### Acceptance Checklist:
- [ ] CSS converter recalculates all unit fields dynamically on user input.
- [ ] `clamp()` generator creates valid CSS with custom viewport parameters.
- [ ] QR code generator exports sharp PNG, SVG, and WebP images with custom colors and logo embedding.
- [ ] Cron translator accurately describes 5-field and 6-field schedules and displays 10 upcoming execution timestamps in PKT and UTC.
