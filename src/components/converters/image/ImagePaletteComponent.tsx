/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Copy,
  Check,
  Code,
  Eye,
  Sliders,
  RefreshCw,
  Zap,
  CheckCircle2,
  FileCode,
  Layers,
  ShieldCheck,
  Maximize2,
  Share2,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn } from '@/lib/utils';

interface ImagePaletteComponentProps {
  tool?: ToolMetadata;
}

export interface ExtractedColor {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  cmyk: { c: number; m: number; y: number; k: number };
  name: string;
  percentage: number;
  contrastWhite: number; // Ratio against #FFFFFF
  contrastBlack: number; // Ratio against #000000
  wcagWhite: 'AAA' | 'AA' | 'Fail';
  wcagBlack: 'AAA' | 'AA' | 'Fail';
}

const SAMPLE_PHOTOS = [
  {
    id: 'sunset',
    name: 'Maldives Golden Sunset',
    desc: 'Vibrant oranges, deep violets, and warm ocean amber',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  },
  {
    id: 'cyberpunk',
    name: 'Tokyo Neon Cyberpunk',
    desc: 'Electric magenta, cyan, and deep midnight slate',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
  },
  {
    id: 'minimalist',
    name: 'Nordic Minimalist Interior',
    desc: 'Warm beige, muted terracotta, sage olive, and slate',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
  },
];

// Helper: Color Math & Luminance
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function rgbToCmyk(r: number, g: number, b: number) {
  const c1 = 1 - r / 255;
  const m1 = 1 - g / 255;
  const y1 = 1 - b / 255;
  const k = Math.min(c1, Math.min(m1, y1));
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((c1 - k) / (1 - k)) * 100),
    m: Math.round(((m1 - k) / (1 - k)) * 100),
    y: Math.round(((y1 - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function approximateColorName(h: number, s: number, l: number): string {
  if (l < 12) return 'Midnight Black';
  if (l > 90 && s < 15) return 'Pure White / Mist';
  if (s < 12) return 'Slate Charcoal';

  if (h < 15 || h >= 345) return l < 40 ? 'Crimson Burgundy' : 'Vibrant Coral';
  if (h < 45) return l < 50 ? 'Warm Terracotta' : 'Amber Gold';
  if (h < 70) return 'Sun Yellow';
  if (h < 150) return l < 45 ? 'Deep Forest Green' : 'Emerald Mint';
  if (h < 200) return 'Electric Cyan';
  if (h < 260) return l < 40 ? 'Royal Navy' : 'Electric Indigo';
  if (h < 300) return 'Violet Orchid';
  return 'Neon Magenta';
}

// Client-Side Canvas Color Quantization
function extractDominantColorsFromImage(
  img: HTMLImageElement,
  colorCount: number = 8
): ExtractedColor[] {
  const canvas = document.createElement('canvas');
  const maxDim = 150;
  let w = img.naturalWidth;
  let h = img.naturalHeight;

  if (w > h && w > maxDim) {
    h = Math.round((h * maxDim) / w);
    w = maxDim;
  } else if (h > maxDim) {
    w = Math.round((w * maxDim) / h);
    h = maxDim;
  }

  canvas.width = Math.max(1, w);
  canvas.height = Math.max(1, h);
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  ctx.drawImage(img, 0, 0, w, h);
  const imageData = ctx.getImageData(0, 0, w, h).data;
  const totalPixels = w * h;

  // Histogram binning with color quantization
  const colorMap = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < imageData.length; i += 4) {
    const a = imageData[i + 3];
    if (a < 128) continue; // Skip transparent

    // Quantize 8-bit into 5-bit clusters
    const r = Math.round(imageData[i] / 8) * 8;
    const g = Math.round(imageData[i + 1] / 8) * 8;
    const b = Math.round(imageData[i + 2] / 8) * 8;

    const key = `${r},${g},${b}`;
    const existing = colorMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorMap.set(key, { r, g, b, count: 1 });
    }
  }

  // Sort by popularity and cluster nearby colors
  const sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count);
  const filtered: { r: number; g: number; b: number; count: number }[] = [];

  for (const c of sorted) {
    // Avoid too close colors (Euclidean distance threshold)
    const tooClose = filtered.some((f) => {
      const dr = f.r - c.r;
      const dg = f.g - c.g;
      const db = f.b - c.b;
      return Math.sqrt(dr * dr + dg * dg + db * db) < 38;
    });

    if (!tooClose) {
      filtered.push(c);
      if (filtered.length >= colorCount) break;
    }
  }

  const whiteLum = getRelativeLuminance(255, 255, 255);
  const blackLum = getRelativeLuminance(0, 0, 0);

  return filtered.map((c) => {
    const hex = rgbToHex(c.r, c.g, c.b);
    const hsl = rgbToHsl(c.r, c.g, c.b);
    const cmyk = rgbToCmyk(c.r, c.g, c.b);
    const name = approximateColorName(hsl.h, hsl.s, hsl.l);
    const percentage = Math.round((c.count / totalPixels) * 100);

    const lum = getRelativeLuminance(c.r, c.g, c.b);
    const contrastWhite = Number(getContrastRatio(lum, whiteLum).toFixed(2));
    const contrastBlack = Number(getContrastRatio(lum, blackLum).toFixed(2));

    const wcagWhite = contrastWhite >= 7.0 ? 'AAA' : contrastWhite >= 4.5 ? 'AA' : 'Fail';
    const wcagBlack = contrastBlack >= 7.0 ? 'AAA' : contrastBlack >= 4.5 ? 'AA' : 'Fail';

    return {
      hex,
      rgb: { r: c.r, g: c.g, b: c.b },
      hsl,
      cmyk,
      name,
      percentage: Math.max(5, percentage),
      contrastWhite,
      contrastBlack,
      wcagWhite,
      wcagBlack,
    };
  });
}

export const ImagePaletteComponent: React.FC<ImagePaletteComponentProps> = ({ tool }) => {
  const [sourceImage, setSourceImage] = useState<string>(SAMPLE_PHOTOS[0].url);
  const [palette, setPalette] = useState<ExtractedColor[]>([]);
  const [colorCount, setColorCount] = useState<number>(8);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [gradientAngle, setGradientAngle] = useState<number>(135);
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'mesh'>('linear');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState<boolean>(false);
  const [exportTab, setExportTab] = useState<'tailwind' | 'css' | 'json'>('tailwind');

  const processImage = useCallback((url: string, count: number) => {
    setIsExtracting(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;

    img.onload = () => {
      try {
        const colors = extractDominantColorsFromImage(img, count);
        setPalette(colors);
      } catch (e) {
        console.error('Failed to extract colors:', e);
      } finally {
        setIsExtracting(false);
      }
    };

    img.onerror = () => {
      setIsExtracting(false);
    };
  }, []);

  useEffect(() => {
    processImage(sourceImage, colorCount);
  }, [sourceImage, colorCount, processImage]);

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setSourceImage(url);
  }, []);

  const copyToClipboard = (text: string, hexKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHex(hexKey);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  // Gradient CSS Strings
  const linearGradientCss =
    palette.length >= 2
      ? `linear-gradient(${gradientAngle}deg, ${palette
          .slice(0, 4)
          .map((c) => c.hex)
          .join(', ')})`
      : 'linear-gradient(135deg, #6366f1, #3b82f6)';

  const radialGradientCss =
    palette.length >= 2
      ? `radial-gradient(circle at center, ${palette
          .slice(0, 4)
          .map((c) => c.hex)
          .join(', ')})`
      : 'radial-gradient(circle at center, #6366f1, #3b82f6)';

  const meshGradientCss =
    palette.length >= 4
      ? `conic-gradient(from ${gradientAngle}deg at 50% 50%, ${palette[0].hex}, ${palette[1].hex}, ${palette[2].hex}, ${palette[3].hex}, ${palette[0].hex})`
      : linearGradientCss;

  const currentGradientStyle =
    gradientType === 'linear'
      ? linearGradientCss
      : gradientType === 'radial'
      ? radialGradientCss
      : meshGradientCss;

  // Code Snippets
  const tailwindSnippet = `// Tailwind CSS theme.extend.colors config
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
${palette.map((c, i) => `          ${(i + 1) * 100}: '${c.hex}', // ${c.name}`).join('\n')}
        }
      }
    }
  }
};`;

  const cssVariablesSnippet = `:root {
${palette.map((c, i) => `  --color-palette-${i + 1}: ${c.hex}; /* ${c.name} */`).join('\n')}
  --gradient-brand: ${linearGradientCss};
}`;

  const jsonSnippet = JSON.stringify(
    palette.map((c) => ({
      hex: c.hex,
      rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      hsl: `hsl(${c.hsl.h}, ${c.hsl.s}%, ${c.hsl.l}%)`,
      name: c.name,
      wcagWhite: c.wcagWhite,
      wcagBlack: c.wcagBlack,
    })),
    null,
    2
  );

  const downloadSwatchCard = () => {
    if (palette.length === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 1200, 630);

    // Header Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Inter, sans-serif';
    ctx.fillText('Color Palette Card', 60, 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Inter, sans-serif';
    ctx.fillText('Extracted with ApexTools Client-Side AI', 60, 120);

    // Color Swatches
    const swatchWidth = (1200 - 120 - (palette.length - 1) * 16) / palette.length;
    palette.forEach((color, i) => {
      const x = 60 + i * (swatchWidth + 16);
      const y = 170;

      // Swatch rect
      ctx.fillStyle = color.hex;
      ctx.beginPath();
      ctx.roundRect(x, y, swatchWidth, 300, 16);
      ctx.fill();

      // Labels
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(color.hex, x + 8, y + 340);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(color.name, x + 8, y + 370);
    });

    // Watermark footer
    ctx.fillStyle = '#64748b';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText('⚡ 100% Client-Side Privacy • ApexTools.app', 60, 580);

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `color-palette-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/70 via-white to-pink-50/50 p-6 sm:p-8 dark:border-purple-950/60 dark:bg-gradient-to-br dark:from-purple-950/20 dark:via-slate-900/60 dark:to-pink-950/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                <Palette className="h-3.5 w-3.5" />
                Color Quantization & Gradient Studio
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                WCAG 2.1 Accessibility Tested
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tool?.name || 'Image Color Palette & Gradient Extractor'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Upload any photo or illustration to extract dominant color schemes, WCAG contrast ratios, and copy CSS linear/radial gradients in 1-click.
            </p>
          </div>

          <PrivacyAssuranceBadge />
        </div>

        {/* Preset Photo Selector */}
        <div className="mt-6 pt-6 border-t border-purple-100/80 dark:border-purple-900/40 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select an aesthetic photography preset for instant color analysis:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PHOTOS.map((p) => (
              <Button
                key={p.id}
                size="sm"
                variant="outline"
                onClick={() => setSourceImage(p.url)}
                leftIcon={<Zap className="h-3.5 w-3.5 text-purple-600" />}
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <Dropzone
        onFilesSelected={handleFiles}
        acceptedFormatsText="Drop photos, screenshots, UI mockups, PNG, JPG, or WebP"
        className="min-h-[140px]"
      />

      {/* Main Studio Area */}
      {palette.length > 0 && (
        <div className="space-y-8">
          {/* Swatch Grid Cards */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Extracted Palette Swatches ({palette.length})
                </h3>
                <span className="text-xs text-slate-400">• Click any value to copy</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Colors:</span>
                {[6, 8, 10, 12].map((cnt) => (
                  <button
                    key={cnt}
                    onClick={() => setColorCount(cnt)}
                    className={cn(
                      'px-2.5 py-1 text-xs font-bold rounded-lg transition',
                      colorCount === cnt
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    {cnt}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
              {palette.map((color) => (
                <div
                  key={color.hex}
                  className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2.5 group hover:shadow-md transition"
                >
                  {/* Swatch color box */}
                  <div
                    style={{ backgroundColor: color.hex }}
                    onClick={() => copyToClipboard(color.hex, color.hex)}
                    className="h-24 w-full rounded-xl cursor-pointer shadow-inner flex items-center justify-center relative overflow-hidden transition-transform group-hover:scale-[1.02]"
                  >
                    <span className="opacity-0 group-hover:opacity-100 transition rounded-md bg-black/60 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                      {copiedHex === color.hex ? 'Copied!' : 'Copy'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {color.name}
                    </p>
                    <button
                      onClick={() => copyToClipboard(color.hex, color.hex)}
                      className="font-mono text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline block text-left"
                    >
                      {color.hex.toUpperCase()}
                    </button>
                    <p className="text-[10px] font-mono text-slate-400">
                      {color.rgb.r}, {color.rgb.g}, {color.rgb.b}
                    </p>

                    {/* WCAG Badges */}
                    <div className="flex items-center gap-1 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                      <span
                        className={cn(
                          'px-1 py-0.2 rounded text-[9px] font-bold',
                          color.wcagWhite === 'AAA'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : color.wcagWhite === 'AA'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        )}
                        title={`White text contrast: ${color.contrastWhite}:1 (${color.wcagWhite})`}
                      >
                        W:{color.wcagWhite}
                      </span>
                      <span
                        className={cn(
                          'px-1 py-0.2 rounded text-[9px] font-bold',
                          color.wcagBlack === 'AAA'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : color.wcagBlack === 'AA'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        )}
                        title={`Black text contrast: ${color.contrastBlack}:1 (${color.wcagBlack})`}
                      >
                        B:{color.wcagBlack}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Gradient Playground & Export Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Live Gradient Showcase */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Auto-Generated CSS Gradient
                </h4>
                <div className="flex gap-1.5">
                  {(['linear', 'radial', 'mesh'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setGradientType(t)}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-lg font-bold capitalize transition',
                        gradientType === t
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gradient Preview Canvas */}
              <div
                style={{ background: currentGradientStyle }}
                className="h-[240px] rounded-3xl shadow-xl flex items-center justify-center text-white p-6 relative overflow-hidden transition-all duration-300"
              >
                <div className="text-center backdrop-blur-md bg-black/30 p-4 rounded-2xl border border-white/20 shadow-2xl">
                  <p className="text-xs uppercase tracking-widest font-bold text-white/80">
                    {gradientType.toUpperCase()} PALETTE GRADIENT
                  </p>
                  <p className="text-lg font-black tracking-tight mt-1">ApexTools Pro Theme</p>
                </div>
              </div>

              {/* Angle Slider if linear or mesh */}
              {gradientType !== 'radial' && (
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    Gradient Angle: {gradientAngle}°
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="15"
                    value={gradientAngle}
                    onChange={(e) => setGradientAngle(parseInt(e.target.value))}
                    className="w-44 accent-purple-600"
                  />
                </div>
              )}

              <Button
                variant="gradient"
                size="md"
                onClick={() =>
                  copyToClipboard(`background: ${currentGradientStyle};`, 'gradient-css')
                }
                leftIcon={
                  copiedHex === 'gradient-css' ? (
                    <Check className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )
                }
                className="w-full"
              >
                {copiedHex === 'gradient-css' ? 'Copied Gradient Rule!' : 'Copy CSS Gradient'}
              </Button>
            </div>

            {/* Right Column: Developer Export Formats */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                <div className="flex gap-2">
                  <button
                    onClick={() => setExportTab('tailwind')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-lg transition',
                      exportTab === 'tailwind'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    Tailwind Config
                  </button>
                  <button
                    onClick={() => setExportTab('css')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-lg transition',
                      exportTab === 'css'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    CSS Variables
                  </button>
                  <button
                    onClick={() => setExportTab('json')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-lg transition',
                      exportTab === 'json'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    JSON Array
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadSwatchCard}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                >
                  Export PNG Card
                </Button>
              </div>

              {/* Code Views */}
              <div className="relative">
                <textarea
                  value={
                    exportTab === 'tailwind'
                      ? tailwindSnippet
                      : exportTab === 'css'
                      ? cssVariablesSnippet
                      : jsonSnippet
                  }
                  readOnly
                  rows={10}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-purple-300 shadow-inner focus:outline-none dark:border-slate-800"
                />

                <button
                  onClick={() => {
                    const text =
                      exportTab === 'tailwind'
                        ? tailwindSnippet
                        : exportTab === 'css'
                        ? cssVariablesSnippet
                        : jsonSnippet;
                    navigator.clipboard.writeText(text);
                    setCopiedSnippet(true);
                    setTimeout(() => setCopiedSnippet(false), 2000);
                  }}
                  className="absolute right-3 top-3 rounded-lg bg-slate-800/80 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm hover:bg-purple-600 transition flex items-center gap-1.5"
                >
                  {copiedSnippet ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy Snippet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
