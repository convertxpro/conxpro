'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateCssMatrix,
  generateClampDetails,
  calculateClampCurrentPx,
  getTailwindMatch,
  CssBaselineConfig,
  DEFAULT_CSS_CONFIG,
  CssUnitMatrix,
  TYPOGRAPHY_PRESETS,
} from '@/lib/converters/dev/css-units';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Copy,
  Check,
  Sparkles,
  Settings2,
  Sliders,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Layers,
  Code2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

export interface CssUnitConverterComponentProps {
  tool?: ToolMetadata;
}

export const CssUnitConverterComponent: React.FC<CssUnitConverterComponentProps> = () => {
  // Baseline configuration
  const [config, setConfig] = useState<CssBaselineConfig>(DEFAULT_CSS_CONFIG);
  const [showConfig, setShowConfig] = useState(false);

  // Active matrix unit and value
  const [activeUnit, setActiveUnit] = useState<keyof CssUnitMatrix>('px');
  const [activeValue, setActiveValue] = useState<number>(16);
  const [copiedUnit, setCopiedUnit] = useState<string | null>(null);

  // Fluid clamp generator state
  const [clampMinPx, setClampMinPx] = useState<number>(16);
  const [clampMaxPx, setClampMaxPx] = useState<number>(32);
  const [clampMinVp, setClampMinVp] = useState<number>(375);
  const [clampMaxVp, setClampMaxVp] = useState<number>(1440);
  const [previewViewport, setPreviewViewport] = useState<number>(800);
  const [clampCopied, setClampCopied] = useState<string | null>(null);

  // Compute matrix
  const matrix = useMemo(() => {
    return calculateCssMatrix(activeValue, activeUnit, config);
  }, [activeValue, activeUnit, config]);

  // Compute clamp snippet
  const clampResult = useMemo(() => {
    return generateClampDetails(
      clampMinPx,
      clampMaxPx,
      clampMinVp,
      clampMaxVp,
      config.rootFontSizePx
    );
  }, [clampMinPx, clampMaxPx, clampMinVp, clampMaxVp, config.rootFontSizePx]);

  // Compute preview font size under the current slider viewport
  const currentPreviewPx = useMemo(() => {
    return calculateClampCurrentPx(
      clampMinPx,
      clampMaxPx,
      clampMinVp,
      clampMaxVp,
      previewViewport
    );
  }, [clampMinPx, clampMaxPx, clampMinVp, clampMaxVp, previewViewport]);

  // Tailwind match
  const tailwindMatch = useMemo(() => {
    return getTailwindMatch(matrix.px);
  }, [matrix.px]);

  const handleUnitChange = (unit: keyof CssUnitMatrix, rawVal: string) => {
    const num = parseFloat(rawVal);
    setActiveUnit(unit);
    setActiveValue(isNaN(num) ? 0 : num);
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUnit(id);
    setTimeout(() => setCopiedUnit(null), 2000);
  };

  const copyClamp = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setClampCopied(id);
    setTimeout(() => setClampCopied(null), 2000);
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CSS_CONFIG);
  };

  const unitCards: {
    key: keyof CssUnitMatrix;
    label: string;
    symbol: string;
    desc: string;
    formula: string;
  }[] = [
    {
      key: 'px',
      label: 'Pixels',
      symbol: 'px',
      desc: 'Absolute screen pixels (CSS 96 DPI)',
      formula: '1px = 1 screen pixel',
    },
    {
      key: 'rem',
      label: 'Root EM',
      symbol: 'rem',
      desc: `Relative to root <html> font-size (${config.rootFontSizePx}px)`,
      formula: `value = px ÷ ${config.rootFontSizePx}`,
    },
    {
      key: 'em',
      label: 'Element EM',
      symbol: 'em',
      desc: `Relative to parent element font-size (${config.parentFontSizePx}px)`,
      formula: `value = px ÷ ${config.parentFontSizePx}`,
    },
    {
      key: 'vw',
      label: 'Viewport Width',
      symbol: 'vw',
      desc: `1% of screen width (${config.viewportWidthPx}px)`,
      formula: `value = (px ÷ ${config.viewportWidthPx}) × 100`,
    },
    {
      key: 'vh',
      label: 'Viewport Height',
      symbol: 'vh',
      desc: `1% of screen height (${config.viewportHeightPx}px)`,
      formula: `value = (px ÷ ${config.viewportHeightPx}) × 100`,
    },
    {
      key: 'pt',
      label: 'Points',
      symbol: 'pt',
      desc: 'Traditional print typography point (1pt = 1.333px)',
      formula: 'value = px × 0.75',
    },
    {
      key: 'percent',
      label: 'Percentage',
      symbol: '%',
      desc: `Relative percent of parent (${config.parentFontSizePx}px)`,
      formula: `value = (px ÷ ${config.parentFontSizePx}) × 100`,
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Privacy & Engine Badge */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="⚡ 100% Client-Side CSS Math • Instant Zero Latency"
      />

      {/* ======================================================== */}
      {/* 1. BASELINE CONFIGURATION BAR */}
      {/* ======================================================== */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Settings2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                CSS Baseline Context
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Root: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{config.rootFontSizePx}px</span> • Parent: {config.parentFontSizePx}px • Viewport: {config.viewportWidthPx}×{config.viewportHeightPx}px
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfig(!showConfig)}
              leftIcon={<Sliders className="h-3.5 w-3.5" />}
            >
              {showConfig ? 'Hide Settings' : 'Customize Baselines'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={resetConfig}
              title="Reset to 16px root & 1920x1080 viewport"
              leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
            >
              Reset
            </Button>
          </div>
        </div>

        {showConfig && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Root Font Size (HTML)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  min={8}
                  max={64}
                  value={config.rootFontSizePx}
                  onChange={(e) =>
                    setConfig({ ...config, rootFontSizePx: parseFloat(e.target.value) || 16 })
                  }
                  className="font-mono text-sm"
                />
                <span className="text-xs font-bold text-slate-400">px</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Parent Element Font Size
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  min={8}
                  max={128}
                  value={config.parentFontSizePx}
                  onChange={(e) =>
                    setConfig({ ...config, parentFontSizePx: parseFloat(e.target.value) || 16 })
                  }
                  className="font-mono text-sm"
                />
                <span className="text-xs font-bold text-slate-400">px</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Viewport Width (for VW)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  min={320}
                  max={3840}
                  value={config.viewportWidthPx}
                  onChange={(e) =>
                    setConfig({ ...config, viewportWidthPx: parseFloat(e.target.value) || 1920 })
                  }
                  className="font-mono text-sm"
                />
                <span className="text-xs font-bold text-slate-400">px</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Viewport Height (for VH)
              </label>
              <div className="mt-1 flex items-center gap-2">
                <Input
                  type="number"
                  min={320}
                  max={2160}
                  value={config.viewportHeightPx}
                  onChange={(e) =>
                    setConfig({ ...config, viewportHeightPx: parseFloat(e.target.value) || 1080 })
                  }
                  className="font-mono text-sm"
                />
                <span className="text-xs font-bold text-slate-400">px</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. SYNCHRONIZED REAL-TIME UNIT MATRIX */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Synchronized CSS Unit Matrix
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Edit any unit field below — all other units recalculate instantaneously.
            </p>
          </div>

          {tailwindMatch.fontSizeClass && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-teal-200/80 bg-teal-50/70 px-3 py-1.5 text-xs font-semibold text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              Tailwind: <code className="font-mono">{tailwindMatch.fontSizeClass}</code>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {unitCards.map((card) => {
            const isEditing = activeUnit === card.key;
            const displayVal = matrix[card.key];
            const cssString = `${displayVal}${card.symbol === 'percent' ? '%' : card.symbol}`;

            return (
              <div
                key={card.key}
                className={`group relative rounded-2xl border p-4 transition-all duration-200 ${
                  isEditing
                    ? 'border-indigo-500 bg-indigo-50/40 shadow-md ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    {card.label}
                  </span>
                  <button
                    onClick={() => copyText(cssString, card.key)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title={`Copy ${cssString}`}
                  >
                    {copiedUnit === card.key ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    value={isEditing ? activeValue : displayVal}
                    onChange={(e) => handleUnitChange(card.key, e.target.value)}
                    onFocus={() => {
                      setActiveUnit(card.key);
                      setActiveValue(matrix[card.key]);
                    }}
                    className={`w-full rounded-xl border px-3 py-2 text-lg font-bold font-mono transition-all ${
                      isEditing
                        ? 'border-indigo-400 bg-white text-indigo-700 dark:border-indigo-600 dark:bg-slate-950 dark:text-indigo-300'
                        : 'border-slate-200 bg-slate-50/50 text-slate-900 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-100'
                    } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                  />
                  <span className="min-w-[40px] text-sm font-bold text-slate-400">
                    {card.symbol === 'percent' ? '%' : card.symbol}
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                  {card.desc}
                </p>
                <div className="mt-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  {card.formula}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. FLUID RESPONSIVE CLAMP() GENERATOR */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 p-6 shadow-sm dark:border-indigo-950 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-100/80 pb-4 dark:border-indigo-950">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                CSS Fluid Typography & <code className="font-mono text-indigo-600 dark:text-indigo-400">clamp()</code> Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Smooth mathematical interpolation between mobile and desktop screen sizes.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1">
              Presets:
            </span>
            {TYPOGRAPHY_PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  setClampMinPx(preset.minPx);
                  setClampMaxPx(preset.maxPx);
                  setClampMinVp(preset.minVp);
                  setClampMaxVp(preset.maxVp);
                }}
                className="rounded-lg border border-indigo-200/80 bg-white/90 px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-slate-800 dark:text-indigo-300 dark:hover:bg-slate-700"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Parameters Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-indigo-500" />
                Min Font Size
              </label>
              <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                {(clampMinPx / config.rootFontSizePx).toFixed(2)}rem
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                min={8}
                max={200}
                value={clampMinPx}
                onChange={(e) => setClampMinPx(parseFloat(e.target.value) || 12)}
                className="font-mono font-bold"
              />
              <span className="text-xs font-bold text-slate-400">px</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Target size at mobile viewport</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5 text-purple-500" />
                Max Font Size
              </label>
              <span className="text-xs font-mono text-purple-600 dark:text-purple-400 font-semibold">
                {(clampMaxPx / config.rootFontSizePx).toFixed(2)}rem
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                min={8}
                max={300}
                value={clampMaxPx}
                onChange={(e) => setClampMaxPx(parseFloat(e.target.value) || 32)}
                className="font-mono font-bold"
              />
              <span className="text-xs font-bold text-slate-400">px</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Target size at desktop viewport</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Minimize2 className="h-3.5 w-3.5 text-slate-400" />
              Min Viewport Width
            </label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                min={280}
                max={1200}
                value={clampMinVp}
                onChange={(e) => setClampMinVp(parseFloat(e.target.value) || 375)}
                className="font-mono font-bold"
              />
              <span className="text-xs font-bold text-slate-400">px</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Mobile benchmark (e.g. 375px)</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-slate-800 dark:bg-slate-950/60">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
              Max Viewport Width
            </label>
            <div className="mt-2 flex items-center gap-2">
              <Input
                type="number"
                min={800}
                max={3840}
                value={clampMaxVp}
                onChange={(e) => setClampMaxVp(parseFloat(e.target.value) || 1440)}
                className="font-mono font-bold"
              />
              <span className="text-xs font-bold text-slate-400">px</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400">Desktop benchmark (e.g. 1440px)</p>
          </div>
        </div>

        {/* Generated CSS Snippet Output */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Generated CSS Output
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="gradient"
                onClick={() => copyClamp(clampResult.snippet, 'css')}
                leftIcon={
                  clampCopied === 'css' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-300" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
              >
                {clampCopied === 'css' ? 'Copied CSS!' : 'Copy CSS Snippet'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyClamp(clampResult.formula, 'formula')}
                leftIcon={
                  clampCopied === 'formula' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )
                }
              >
                {clampCopied === 'formula' ? 'Copied Formula!' : 'Copy clamp() Only'}
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-sm shadow-inner dark:border-slate-800">
            <pre className="overflow-x-auto text-emerald-400">
              <code>{clampResult.snippet}</code>
            </pre>
            <div className="mt-2 border-t border-slate-800 pt-2 flex flex-wrap items-center justify-between text-xs text-slate-400">
              <span>
                Min: <strong className="text-white">{clampResult.minRem}</strong> ({clampMinPx}px)
              </span>
              <span>
                Preferred Rate: <strong className="text-white">{clampResult.preferredRem} + {clampResult.preferredVw}</strong>
              </span>
              <span>
                Max: <strong className="text-white">{clampResult.maxRem}</strong> ({clampMaxPx}px)
              </span>
            </div>
          </div>
        </div>

        {/* Live Interactive Viewport Simulator & Typography Preview */}
        <div className="mt-6 rounded-2xl border border-indigo-200/80 bg-white/95 p-5 shadow-sm dark:border-indigo-950 dark:bg-slate-950/70">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Viewport Scale Simulator
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Simulated Screen: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{previewViewport}px</strong>
              </span>
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold font-mono text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Yields: {currentPreviewPx.toFixed(1)}px ({(currentPreviewPx / config.rootFontSizePx).toFixed(2)}rem)
              </span>
            </div>
          </div>

          <div className="mt-3">
            <input
              type="range"
              min={clampMinVp}
              max={clampMaxVp}
              value={previewViewport}
              onChange={(e) => setPreviewViewport(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-800"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Mobile ({clampMinVp}px)</span>
              <span>Tablet (768px)</span>
              <span>Laptop (1024px)</span>
              <span>Desktop ({clampMaxVp}px)</span>
            </div>
          </div>

          {/* Rendered Text Preview Box */}
          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-6 text-center dark:border-slate-800/80 dark:bg-slate-900/50">
            <p
              style={{ fontSize: `${currentPreviewPx}px`, lineHeight: 1.2 }}
              className="font-bold text-slate-900 transition-all duration-75 dark:text-white"
            >
              Responsive Fluid Typography
            </p>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Drag the slider above to see this headline scale continuously without rigid media query breakpoints.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
