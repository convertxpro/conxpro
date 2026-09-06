/**
 * CSS Units & Fluid Responsive Typography Engine
 * ApexTools Developer Productivity Suite
 */

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

export const DEFAULT_CSS_CONFIG: CssBaselineConfig = {
  rootFontSizePx: 16,
  parentFontSizePx: 16,
  viewportWidthPx: 1920,
  viewportHeightPx: 1080,
};

export function calculateCssMatrix(
  value: number,
  unit: keyof CssUnitMatrix,
  config: CssBaselineConfig = DEFAULT_CSS_CONFIG
): CssUnitMatrix {
  if (isNaN(value) || value === null) {
    return { px: 0, rem: 0, em: 0, vw: 0, vh: 0, pt: 0, percent: 0 };
  }

  // Convert any input unit to standard baseline PX first
  let basePx = 0;
  switch (unit) {
    case 'px':
      basePx = value;
      break;
    case 'rem':
      basePx = value * (config.rootFontSizePx || 16);
      break;
    case 'em':
      basePx = value * (config.parentFontSizePx || 16);
      break;
    case 'vw':
      basePx = (value / 100) * (config.viewportWidthPx || 1920);
      break;
    case 'vh':
      basePx = (value / 100) * (config.viewportHeightPx || 1080);
      break;
    case 'pt':
      basePx = value * (4 / 3); // 1pt = 1.3333px (96dpi / 72pt)
      break;
    case 'percent':
      basePx = (value / 100) * (config.parentFontSizePx || 16);
      break;
  }

  const rootSize = config.rootFontSizePx || 16;
  const parentSize = config.parentFontSizePx || 16;
  const vpWidth = config.viewportWidthPx || 1920;
  const vpHeight = config.viewportHeightPx || 1080;

  return {
    px: Number(basePx.toFixed(3)),
    rem: Number((basePx / rootSize).toFixed(4)),
    em: Number((basePx / parentSize).toFixed(4)),
    vw: Number(((basePx / vpWidth) * 100).toFixed(4)),
    vh: Number(((basePx / vpHeight) * 100).toFixed(4)),
    pt: Number((basePx * 0.75).toFixed(3)),
    percent: Number(((basePx / parentSize) * 100).toFixed(2)),
  };
}

export interface ClampResult {
  snippet: string;
  minRem: string;
  preferredRem: string;
  preferredVw: string;
  maxRem: string;
  formula: string;
}

export function generateClampDetails(
  minPx: number,
  maxPx: number,
  minViewportPx: number = 375,
  maxViewportPx: number = 1440,
  rootFontSize: number = 16
): ClampResult {
  const root = rootFontSize || 16;
  const minRem = (minPx / root).toFixed(4);
  const maxRem = (maxPx / root).toFixed(4);

  const slope = (maxPx - minPx) / (maxViewportPx - minViewportPx);
  const yAxisIntersection = -minViewportPx * slope + minPx;
  const preferredVw = (slope * 100).toFixed(4);
  const preferredRem = (yAxisIntersection / root).toFixed(4);

  const sign = Number(preferredRem) >= 0 ? '+' : '-';
  const absPreferredRem = Math.abs(Number(preferredRem)).toFixed(4);

  const preferredPart =
    Number(preferredRem) === 0
      ? `${preferredVw}vw`
      : `${preferredRem}rem + ${preferredVw}vw`;

  const snippet = `font-size: clamp(${minRem}rem, ${preferredPart}, ${maxRem}rem);`;

  return {
    snippet,
    minRem: `${minRem}rem`,
    preferredRem: `${preferredRem}rem`,
    preferredVw: `${preferredVw}vw`,
    maxRem: `${maxRem}rem`,
    formula: `clamp(${minRem}rem, ${preferredRem}rem ${sign} ${preferredVw}vw, ${maxRem}rem)`,
  };
}

export function generateClampSnippet(
  minPx: number,
  maxPx: number,
  minViewportPx: number = 375,
  maxViewportPx: number = 1440,
  rootFontSize: number = 16
): string {
  return generateClampDetails(minPx, maxPx, minViewportPx, maxViewportPx, rootFontSize).snippet;
}

export function calculateClampCurrentPx(
  minPx: number,
  maxPx: number,
  minViewportPx: number,
  maxViewportPx: number,
  currentViewportWidth: number
): number {
  if (currentViewportWidth <= minViewportPx) return minPx;
  if (currentViewportWidth >= maxViewportPx) return maxPx;
  const progress = (currentViewportWidth - minViewportPx) / (maxViewportPx - minViewportPx);
  return minPx + progress * (maxPx - minPx);
}

export function getTailwindMatch(pxValue: number): {
  fontSizeClass: string | null;
  spacingClass: string | null;
} {
  const rounded = Math.round(pxValue);

  const fontMap: Record<number, string> = {
    12: 'text-xs (0.75rem / 12px)',
    14: 'text-sm (0.875rem / 14px)',
    16: 'text-base (1rem / 16px)',
    18: 'text-lg (1.125rem / 18px)',
    20: 'text-xl (1.25rem / 20px)',
    24: 'text-2xl (1.5rem / 24px)',
    30: 'text-3xl (1.875rem / 30px)',
    36: 'text-4xl (2.25rem / 36px)',
    48: 'text-5xl (3rem / 48px)',
    60: 'text-6xl (3.75rem / 60px)',
    64: 'text-6xl (4rem / 64px)',
    72: 'text-7xl (4.5rem / 72px)',
    96: 'text-8xl (6rem / 96px)',
    128: 'text-9xl (8rem / 128px)',
  };

  const spacingMap: Record<number, string> = {
    0: 'p-0 / m-0 (0px)',
    1: 'p-px / m-px (1px)',
    2: 'p-0.5 / m-0.5 (0.125rem / 2px)',
    4: 'p-1 / m-1 (0.25rem / 4px)',
    6: 'p-1.5 / m-1.5 (0.375rem / 6px)',
    8: 'p-2 / m-2 (0.5rem / 8px)',
    10: 'p-2.5 / m-2.5 (0.625rem / 10px)',
    12: 'p-3 / m-3 (0.75rem / 12px)',
    14: 'p-3.5 / m-3.5 (0.875rem / 14px)',
    16: 'p-4 / m-4 (1rem / 16px)',
    20: 'p-5 / m-5 (1.25rem / 20px)',
    24: 'p-6 / m-6 (1.5rem / 24px)',
    28: 'p-7 / m-7 (1.75rem / 28px)',
    32: 'p-8 / m-8 (2rem / 32px)',
    36: 'p-9 / m-9 (2.25rem / 36px)',
    40: 'p-10 / m-10 (2.5rem / 40px)',
    44: 'p-11 / m-11 (2.75rem / 44px)',
    48: 'p-12 / m-12 (3rem / 48px)',
    56: 'p-14 / m-14 (3.5rem / 56px)',
    64: 'p-16 / m-16 (4rem / 64px)',
    80: 'p-20 / m-20 (5rem / 80px)',
    96: 'p-24 / m-24 (6rem / 96px)',
  };

  // Find exact or closest match within 1px
  const fontSizeClass =
    fontMap[rounded] ||
    fontMap[rounded - 1] ||
    fontMap[rounded + 1] ||
    null;

  const spacingClass =
    spacingMap[rounded] ||
    spacingMap[rounded - 1] ||
    spacingMap[rounded + 1] ||
    null;

  return { fontSizeClass, spacingClass };
}

export interface TypographyPreset {
  id: string;
  name: string;
  minPx: number;
  maxPx: number;
  minVp: number;
  maxVp: number;
  description: string;
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'hero-title',
    name: 'Hero Display Title',
    minPx: 32,
    maxPx: 64,
    minVp: 375,
    maxVp: 1440,
    description: 'Impactful main page headings (H1) scaling from mobile to large desktop',
  },
  {
    id: 'section-heading',
    name: 'Section Heading (H2)',
    minPx: 24,
    maxPx: 40,
    minVp: 375,
    maxVp: 1440,
    description: 'Sub-headers and card section titles',
  },
  {
    id: 'sub-title',
    name: 'Sub-Heading (H3)',
    minPx: 20,
    maxPx: 28,
    minVp: 375,
    maxVp: 1440,
    description: 'Module titles and prominent callouts',
  },
  {
    id: 'body-lead',
    name: 'Lead Paragraph / Subtext',
    minPx: 16,
    maxPx: 20,
    minVp: 375,
    maxVp: 1440,
    description: 'Introductory paragraphs and lead copy',
  },
  {
    id: 'body-standard',
    name: 'Standard Body Text',
    minPx: 15,
    maxPx: 18,
    minVp: 375,
    maxVp: 1440,
    description: 'Long-form editorial articles and blog content',
  },
];
