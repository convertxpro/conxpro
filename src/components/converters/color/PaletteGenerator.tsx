'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Palette,
  RefreshCw,
  Lock,
  Unlock,
  Copy,
  Check,
  Download,
  Code,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

type HarmonyScheme = 'analogous' | 'monochromatic' | 'triadic' | 'complementary' | 'splitComplementary' | 'tetradic';

interface PaletteColor {
  hex: string;
  name: string;
  isLocked: boolean;
}

// Convert HSL to HEX
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Random HSL color generator
function getRandomHsl(): { h: number; s: number; l: number } {
  return {
    h: Math.floor(Math.random() * 360),
    s: Math.floor(Math.random() * 40) + 50, // 50-90%
    l: Math.floor(Math.random() * 30) + 40, // 40-70%
  };
}

export const PaletteGenerator: React.FC = () => {
  const [baseHsl, setBaseHsl] = useState<{ h: number; s: number; l: number }>({ h: 243, s: 75, l: 59 });
  const [scheme, setScheme] = useState<HarmonyScheme>('analogous');
  const [lockedIndices, setLockedIndices] = useState<Set<number>>(new Set());
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false);
  const [copiedExport, setCopiedExport] = useState<boolean>(false);

  // Generate 5 harmonious colors based on scheme
  const paletteColors: PaletteColor[] = useMemo(() => {
    const { h, s, l } = baseHsl;
    let hexes: string[] = [];

    if (scheme === 'monochromatic') {
      hexes = [
        hslToHex(h, s, Math.max(15, l - 35)),
        hslToHex(h, s, Math.max(25, l - 18)),
        hslToHex(h, s, l),
        hslToHex(h, s, Math.min(85, l + 18)),
        hslToHex(h, s, Math.min(95, l + 32)),
      ];
    } else if (scheme === 'analogous') {
      hexes = [
        hslToHex((h + 300) % 360, s, l),
        hslToHex((h + 330) % 360, s, l),
        hslToHex(h, s, l),
        hslToHex((h + 30) % 360, s, l),
        hslToHex((h + 60) % 360, s, l),
      ];
    } else if (scheme === 'complementary') {
      hexes = [
        hslToHex(h, s, Math.max(20, l - 20)),
        hslToHex(h, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 180) % 360, s, Math.max(20, l - 20)),
        hslToHex((h + 180) % 360, s, Math.min(90, l + 20)),
      ];
    } else if (scheme === 'triadic') {
      hexes = [
        hslToHex((h + 240) % 360, s, l),
        hslToHex(h, s, l),
        hslToHex((h + 120) % 360, s, l),
        hslToHex(h, s, Math.min(85, l + 20)),
        hslToHex((h + 120) % 360, s, Math.max(25, l - 20)),
      ];
    } else if (scheme === 'splitComplementary') {
      hexes = [
        hslToHex(h, s, l),
        hslToHex((h + 150) % 360, s, l),
        hslToHex((h + 210) % 360, s, l),
        hslToHex((h + 150) % 360, s, Math.max(20, l - 20)),
        hslToHex((h + 210) % 360, s, Math.min(85, l + 20)),
      ];
    } else {
      // Tetradic
      hexes = [
        hslToHex(h, s, l),
        hslToHex((h + 90) % 360, s, l),
        hslToHex((h + 180) % 360, s, l),
        hslToHex((h + 270) % 360, s, l),
        hslToHex(h, s, Math.max(20, l - 25)),
      ];
    }

    return hexes.map((hex, idx) => ({
      hex,
      name: `Color ${idx + 1}`,
      isLocked: lockedIndices.has(idx),
    }));
  }, [baseHsl, scheme, lockedIndices]);

  // Randomize unlocked colors
  const handleRandomize = () => {
    setBaseHsl(getRandomHsl());
  };

  // Toggle lock
  const handleToggleLock = (index: number) => {
    setLockedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Copy single color
  const handleCopyColor = (hex: string, index: number) => {
    navigator.clipboard.writeText(hex);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Export string
  const cssVariablesExport = useMemo(() => {
    return `:root {\n${paletteColors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`;
  }, [paletteColors]);

  const jsonExport = useMemo(() => {
    return JSON.stringify(paletteColors.map((c) => c.hex), null, 2);
  }, [paletteColors]);

  const handleCopyExport = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Harmony Scheme Picker & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Harmony:</span>
          {(['analogous', 'monochromatic', 'triadic', 'complementary', 'splitComplementary', 'tetradic'] as HarmonyScheme[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScheme(s)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold capitalize transition ${
                scheme === s
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
              }`}
            >
              {s.replace(/([A-Z])/g, ' $1')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="gradient"
            onClick={handleRandomize}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Generate Random
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setExportModalOpen(!exportModalOpen)}
            leftIcon={<Code className="h-3.5 w-3.5" />}
          >
            Export Palette
          </Button>
        </div>
      </div>

      {/* 5-Color Palette Swatch Showcase */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5 min-h-[220px]">
        {paletteColors.map((color, idx) => {
          const isCopied = copiedIndex === idx;
          const isLocked = lockedIndices.has(idx);

          return (
            <div
              key={`palette-${idx}`}
              className="group relative flex flex-col justify-between rounded-3xl p-5 shadow-lg transition-all hover:scale-[1.02] border border-black/10 dark:border-white/10"
              style={{ backgroundColor: color.hex }}
            >
              {/* Top Controls */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleLock(idx)}
                  className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-white/40"
                  title={isLocked ? 'Unlock color' : 'Lock color'}
                >
                  {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleCopyColor(color.hex, idx)}
                  className="rounded-full bg-white/20 p-2 text-white backdrop-blur-md transition hover:bg-white/40"
                  title="Copy HEX"
                >
                  {isCopied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Bottom Label */}
              <div className="rounded-2xl bg-slate-950/80 p-3 text-center text-white backdrop-blur-md">
                <p className="font-mono text-sm font-extrabold tracking-wider">{color.hex}</p>
                <p className="text-[10px] text-slate-300 mt-0.5">{color.name}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Panel (if open) */}
      {exportModalOpen && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              CSS Variables & JSON Export
            </h4>
            <span className="text-xs text-slate-400">Ready for Tailwind, CSS, or Figma</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-bold text-slate-500">CSS Custom Properties</label>
              <textarea
                readOnly
                value={cssVariablesExport}
                rows={7}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:outline-none"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopyExport(cssVariablesExport)}
                className="mt-2 w-full"
                leftIcon={<Copy className="h-3 w-3" />}
              >
                Copy CSS
              </Button>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500">JSON Hex Array</label>
              <textarea
                readOnly
                value={jsonExport}
                rows={7}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 focus:outline-none"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleCopyExport(jsonExport)}
                className="mt-2 w-full"
                leftIcon={<Copy className="h-3 w-3" />}
              >
                Copy JSON
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
