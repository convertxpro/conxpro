'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Palette,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Eye,
  Sliders,
} from 'lucide-react';

interface RgbColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export const ColorConverter: React.FC = () => {
  const [rgb, setRgb] = useState<RgbColor>({ r: 99, g: 102, b: 241, a: 1 });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // RGB to HEX
  const hexValue = useMemo(() => {
    const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
    const base = `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    if (rgb.a < 1) {
      const alphaHex = Math.round(rgb.a * 255).toString(16).padStart(2, '0');
      return `${base}${alphaHex}`.toUpperCase();
    }
    return base.toUpperCase();
  }, [rgb]);

  // RGB to HSL
  const hslValue = useMemo(() => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

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

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    return {
      h: hDeg,
      s: sPct,
      l: lPct,
      css: rgb.a < 1 ? `hsla(${hDeg}, ${sPct}%, ${lPct}%, ${rgb.a})` : `hsl(${hDeg}, ${sPct}%, ${lPct}%)`,
    };
  }, [rgb]);

  // RGB to CMYK
  const cmykValue = useMemo(() => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const k = 1 - Math.max(r, g, b);
    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100, css: 'cmyk(0%, 0%, 0%, 100%)' };
    }

    const c = Math.round(((1 - r - k) / (1 - k)) * 100);
    const m = Math.round(((1 - g - k) / (1 - k)) * 100);
    const y = Math.round(((1 - b - k) / (1 - k)) * 100);
    const kPct = Math.round(k * 100);

    return {
      c,
      m,
      y,
      k: kPct,
      css: `cmyk(${c}%, ${m}%, ${y}%, ${kPct}%)`,
    };
  }, [rgb]);

  // RGB to HSV
  const hsvValue = useMemo(() => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
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

    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const vPct = Math.round(v * 100);

    return {
      h: hDeg,
      s: sPct,
      v: vPct,
      css: `hsv(${hDeg}, ${sPct}%, ${vPct}%)`,
    };
  }, [rgb]);

  // WCAG Relative Luminance & Contrast
  const contrastData = useMemo(() => {
    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const lum = getLuminance(rgb.r, rgb.g, rgb.b);
    const lumWhite = getLuminance(255, 255, 255);
    const lumBlack = getLuminance(0, 0, 0);

    const ratioWhite = (lumWhite + 0.05) / (lum + 0.05);
    const ratioBlack = (lum + 0.05) / (lumBlack + 0.05);

    const formatRatio = (r: number) => `${r.toFixed(2)}:1`;

    return {
      whiteRatio: ratioWhite,
      whiteRatioStr: formatRatio(ratioWhite),
      blackRatio: ratioBlack,
      blackRatioStr: formatRatio(ratioBlack),
      whiteAA: ratioWhite >= 4.5,
      whiteAAA: ratioWhite >= 7,
      blackAA: ratioBlack >= 4.5,
      blackAAA: ratioBlack >= 7,
    };
  }, [rgb]);

  // Update handlers
  const handleHexChange = (hexStr: string) => {
    let clean = hexStr.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    if (clean.length === 6 && /^[0-9a-fA-F]{6}$/.test(clean)) {
      const r = parseInt(clean.slice(0, 2), 16);
      const g = parseInt(clean.slice(2, 4), 16);
      const b = parseInt(clean.slice(4, 6), 16);
      setRgb((prev) => ({ ...prev, r, g, b }));
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const rgbCss = rgb.a < 1 ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})` : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  return (
    <div className="space-y-8">
      {/* Live Color Swatch Banner */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl transition-all border border-slate-200/50 dark:border-slate-800"
        style={{ backgroundColor: hexValue }}
      >
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="rounded-2xl bg-white/90 p-4 backdrop-blur-md dark:bg-slate-950/90 shadow-lg">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Active Color Swatch
            </p>
            <h3 className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {hexValue}
            </h3>
            <p className="font-mono text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              {rgbCss}
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/90 p-3.5 backdrop-blur-md dark:bg-slate-950/90 shadow-lg">
            <input
              type="color"
              value={hexValue.slice(0, 7)}
              onChange={(e) => handleHexChange(e.target.value)}
              className="h-10 w-10 cursor-pointer rounded-xl border-0 bg-transparent p-0"
            />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Click to pick color
            </span>
          </div>
        </div>
      </div>

      {/* Synchronized Format Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* HEX Input */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              HEX Code
            </label>
            <button
              type="button"
              onClick={() => handleCopy(hexValue, 'hex')}
              className="text-slate-400 hover:text-indigo-600"
            >
              {copiedKey === 'hex' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Input
            type="text"
            value={hexValue}
            onChange={(e) => handleHexChange(e.target.value)}
            className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400"
          />
          <p className="text-[10px] text-slate-400">Web & CSS Hexadecimal</p>
        </div>

        {/* RGB Input */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              RGB (Red, Green, Blue)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(rgbCss, 'rgb')}
              className="text-slate-400 hover:text-indigo-600"
            >
              {copiedKey === 'rgb' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1">
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.r}
              onChange={(e) => setRgb({ ...rgb, r: Number(e.target.value) })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.g}
              onChange={(e) => setRgb({ ...rgb, g: Number(e.target.value) })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            <input
              type="number"
              min={0}
              max={255}
              value={rgb.b}
              onChange={(e) => setRgb({ ...rgb, b: Number(e.target.value) })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 font-mono text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <p className="text-[10px] text-slate-400">0 - 255 digital channels</p>
        </div>

        {/* HSL */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              HSL (Hue, Sat, Light)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(hslValue.css, 'hsl')}
              className="text-slate-400 hover:text-indigo-600"
            >
              {copiedKey === 'hsl' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Input
            type="text"
            readOnly
            value={hslValue.css}
            className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200"
          />
          <p className="text-[10px] text-slate-400">Hue: {hslValue.h}° • Sat: {hslValue.s}% • Light: {hslValue.l}%</p>
        </div>

        {/* CMYK */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              CMYK (Print Color)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(cmykValue.css, 'cmyk')}
              className="text-slate-400 hover:text-indigo-600"
            >
              {copiedKey === 'cmyk' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Input
            type="text"
            readOnly
            value={cmykValue.css}
            className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200"
          />
          <p className="text-[10px] text-slate-400">Cyan, Magenta, Yellow, Key</p>
        </div>
      </div>

      {/* WCAG 2.1 Accessibility & Contrast Checker */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            WCAG 2.1 Color Contrast Ratio Analysis
          </h4>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Contrast on White */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Contrast on Pure White (#FFFFFF)
              </span>
              <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                {contrastData.whiteRatioStr}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  contrastData.whiteAA
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                AA Normal Text (4.5:1): {contrastData.whiteAA ? 'Pass' : 'Fail'}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  contrastData.whiteAAA
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                AAA (7.0:1): {contrastData.whiteAAA ? 'Pass' : 'Fail'}
              </span>
            </div>
          </div>

          {/* Contrast on Black */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Contrast on Pure Black (#000000)
              </span>
              <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-white">
                {contrastData.blackRatioStr}
              </span>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  contrastData.blackAA
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                }`}
              >
                AA Normal Text (4.5:1): {contrastData.blackAA ? 'Pass' : 'Fail'}
              </span>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                  contrastData.blackAAA
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                AAA (7.0:1): {contrastData.blackAAA ? 'Pass' : 'Fail'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
