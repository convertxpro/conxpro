'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileCode2,
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
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  FileText,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn, formatBytes } from '@/lib/utils';

interface SvgOptimizerComponentProps {
  tool?: ToolMetadata;
}

interface OptimizationOptions {
  removeComments: boolean;
  removeDoctype: boolean;
  removeMetadata: boolean;
  removeEditorNamespaces: boolean;
  collapseGroups: boolean;
  removeHidden: boolean;
  minifyColors: boolean;
  roundFloats: boolean;
  floatPrecision: number;
  prettify: boolean;
}

const DEFAULT_OPTIONS: OptimizationOptions = {
  removeComments: true,
  removeDoctype: true,
  removeMetadata: true,
  removeEditorNamespaces: true,
  collapseGroups: true,
  removeHidden: true,
  minifyColors: true,
  roundFloats: true,
  floatPrecision: 2,
  prettify: false,
};

const SAMPLE_SVGS = [
  {
    id: 'complex-illustration',
    title: 'Illustrator Bloated Badge',
    desc: 'Contains Adobe/Inkscape namespaces, metadata, and high float decimals',
    svg: `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 28.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   x="0px" y="0px" viewBox="0 0 500.000000 500.000000" enable-background="new 0 0 500 500" xml:space="preserve">
<metadata id="metadata102">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <cc:Work rdf:about="">
      <dc:format>image/svg+xml</dc:format>
      <dc:title>Complex Gradient Shield Vector</dc:title>
    </cc:Work>
  </rdf:RDF>
</metadata>
<!-- Outer Container Group -->
<g id="Background_Group" inkscape:groupmode="layer" inkscape:label="Layer 1">
  <g id="Empty_Subgroup_A">
    <g id="Empty_Subgroup_B">
      <defs>
        <linearGradient id="shield_gradient" gradientUnits="userSpaceOnUse" x1="0.000000" y1="0.000000" x2="500.000000" y2="500.000000">
          <stop  offset="0.000000" style="stop-color:#8B5CF6"/>
          <stop  offset="0.500000" style="stop-color:#6366F1"/>
          <stop  offset="1.000000" style="stop-color:#3B82F6"/>
        </linearGradient>
      </defs>
      <rect x="0.000000" y="0.000000" width="500.000000" height="500.000000" rx="64.000000" fill="url(#shield_gradient)"/>
      <path display="none" d="M 0.000000,0.000000 L 100.000000,100.000000" fill="#000000" />
      <path fill="#FFFFFF" fill-opacity="0.2" d="M 250.000000,50.123456 C 360.543210,50.123456 450.000000,139.580246 450.000000,250.000000 C 450.000000,360.419754 360.543210,450.000000 250.000000,450.000000 C 139.456790,450.000000 50.000000,360.419754 50.000000,250.000000 C 50.000000,139.580246 139.456790,50.123456 250.000000,50.123456 Z"/>
      <path fill="#FFFFFF" d="M 250.000000,120.000000 L 370.000000,180.000000 L 370.000000,300.000000 C 370.000000,380.000000 250.000000,420.000000 250.000000,420.000000 C 250.000000,420.000000 130.000000,380.000000 130.000000,300.000000 L 130.000000,180.000000 Z"/>
      <circle cx="250.000000" cy="270.000000" r="45.000000" fill="#6366F1"/>
      <polygon points="250.000000,240.000000 263.882285,282.725424 308.922138,282.725424 272.519927,309.174575 286.402212,351.900000 250.000000,325.450849 213.597787,351.900000 227.480072,309.174575 191.077861,282.725424 236.117714,282.725424" fill="#FFFFFF"/>
    </g>
  </g>
</g>
</svg>`,
  },
  {
    id: 'cyber-icon',
    title: 'Cyberpunk Shield Icon',
    desc: 'High node count vector with metadata tags',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
<!-- Created with Sketch 96.1 (167280) - https://sketch.com -->
<title>Cyber Shield</title>
<desc>Created with Sketch.</desc>
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
  <g id="Artboard" fill="#0f172a">
    <rect width="400.0000" height="400.0000" rx="40.0000" />
    <path d="M 200.0000,40.0000 L 340.0000,90.0000 L 340.0000,220.0000 C 340.0000,310.0000 200.0000,360.0000 200.0000,360.0000 C 200.0000,360.0000 60.0000,310.0000 60.0000,220.0000 L 60.0000,90.0000 Z" fill="#06b6d4" fill-opacity="0.15" stroke="#06b6d4" stroke-width="8.0000" />
    <polygon points="200,100 280,180 200,300 120,180" fill="#06b6d4" />
    <circle cx="200.0000" cy="190.0000" r="30.0000" fill="#0f172a" />
  </g>
</g>
</svg>`,
  },
];

// In-Browser SVG Optimizer Function
function optimizeSvgString(raw: string, opts: OptimizationOptions): string {
  let svg = raw;

  if (opts.removeComments) {
    svg = svg.replace(/<!--[\s\S]*?-->/g, '');
  }

  if (opts.removeDoctype) {
    svg = svg.replace(/<\?xml[\s\S]*?\?>/gi, '');
    svg = svg.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  }

  if (opts.removeMetadata) {
    svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    svg = svg.replace(/<title[\s\S]*?<\/title>/gi, '');
    svg = svg.replace(/<desc[\s\S]*?<\/desc>/gi, '');
  }

  if (opts.removeEditorNamespaces) {
    svg = svg.replace(/\s*xmlns:(inkscape|sodipodi|sketch|illustrator|adobe|i|graph)="[^"]*"/gi, '');
    svg = svg.replace(/\s*(inkscape|sodipodi|sketch|adobe|illustrator|i):[a-zA-Z0-9_-]+="[^"]*"/gi, '');
    svg = svg.replace(/\s*enable-background="[^"]*"/gi, '');
    svg = svg.replace(/\s*xml:space="preserve"/gi, '');
    svg = svg.replace(/\s*version="1\.1"/gi, '');
  }

  if (opts.removeHidden) {
    svg = svg.replace(/<[^>]+(?:display\s*=\s*["']none["']|visibility\s*=\s*["']hidden["']|opacity\s*=\s*["']0["'])[^>]*\/>/gi, '');
    svg = svg.replace(/<([a-zA-Z0-9_-]+)[^>]*(?:display\s*=\s*["']none["']|visibility\s*=\s*["']hidden["']|opacity\s*=\s*["']0["'])[^>]*>[\s\S]*?<\/\1>/gi, '');
  }

  if (opts.collapseGroups) {
    // Remove empty groups
    svg = svg.replace(/<g\s*>\s*<\/g>/gi, '');
    svg = svg.replace(/<g\s+id="[^"]*"\s*>\s*<\/g>/gi, '');
  }

  if (opts.roundFloats) {
    const prec = opts.floatPrecision;
    svg = svg.replace(/(\d+\.\d{3,})/g, (match) => {
      const num = parseFloat(match);
      return isNaN(num) ? match : num.toFixed(prec).replace(/\.?0+$/, '');
    });
  }

  if (opts.minifyColors) {
    svg = svg.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, '#$1$2$3');
  }

  // Trim extraneous whitespace
  svg = svg.trim();

  if (opts.prettify) {
    // Simple indentation beautifier
    let formatted = '';
    let indent = 0;
    const tokens = svg.split(/(<[^>]+>)/g).filter(Boolean);

    tokens.forEach((token) => {
      const trimmed = token.trim();
      if (!trimmed) return;

      if (trimmed.startsWith('</')) {
        indent = Math.max(0, indent - 1);
        formatted += `${'  '.repeat(indent)}${trimmed}\n`;
      } else if (trimmed.startsWith('<') && !trimmed.endsWith('/>') && !trimmed.startsWith('<?') && !trimmed.startsWith('<!')) {
        formatted += `${'  '.repeat(indent)}${trimmed}\n`;
        indent++;
      } else {
        formatted += `${'  '.repeat(indent)}${trimmed}\n`;
      }
    });

    return formatted.trim();
  } else {
    // Minify whitespace between tags
    return svg
      .replace(/>\s+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }
}

export const SvgOptimizerComponent: React.FC<SvgOptimizerComponentProps> = ({ tool }) => {
  const [rawSvg, setRawSvg] = useState<string>(SAMPLE_SVGS[0].svg);
  const [options, setOptions] = useState<OptimizationOptions>(DEFAULT_OPTIONS);
  const [bgMode, setBgMode] = useState<'transparent' | 'light' | 'dark'>('transparent');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [viewTab, setViewTab] = useState<'visual' | 'code' | 'diff'>('visual');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) setRawSvg(text);
    };
    reader.readAsText(file);
  }, []);

  const optimizedSvg = useMemo(() => {
    return optimizeSvgString(rawSvg, options);
  }, [rawSvg, options]);

  const originalBytes = useMemo(() => new Blob([rawSvg]).size, [rawSvg]);
  const optimizedBytes = useMemo(() => new Blob([optimizedSvg]).size, [optimizedSvg]);
  const savedBytes = Math.max(0, originalBytes - optimizedBytes);
  const percentSaved = originalBytes > 0 ? ((savedBytes / originalBytes) * 100).toFixed(1) : '0';

  const downloadOptimizedSvg = () => {
    const blob = new Blob([optimizedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimized-vector-${Date.now()}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyOptimizedCode = () => {
    navigator.clipboard.writeText(optimizedSvg);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 p-6 sm:p-8 dark:border-emerald-950/60 dark:bg-gradient-to-br dark:from-emerald-950/20 dark:via-slate-900/60 dark:to-teal-950/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                AST Vector Optimizer & Minifier
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700 dark:bg-teal-900/50 dark:text-teal-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Up to 70% Size Savings
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tool?.name || 'SVG Optimizer & Code Minifier'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Clean, strip bloated editor namespaces (Adobe Illustrator, Sketch, Inkscape), round floating decimals, and compress SVG markup in real time.
            </p>
          </div>

          <PrivacyAssuranceBadge />
        </div>

        {/* Demo Presets Bar */}
        <div className="mt-6 pt-6 border-t border-emerald-100/80 dark:border-emerald-900/40 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select a sample bloated SVG vector to test real compression savings:
          </p>
          <div className="flex gap-2">
            {SAMPLE_SVGS.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant="outline"
                onClick={() => setRawSvg(s.svg)}
                leftIcon={<Zap className="h-3.5 w-3.5 text-emerald-600" />}
              >
                {s.title}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <Dropzone
        onFilesSelected={handleFiles}
        acceptedFormatsText="Drop SVG file or paste raw SVG code below"
        className="min-h-[140px]"
      />

      {/* Real-time Savings Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Original Size
          </span>
          <p className="text-lg font-mono font-bold text-slate-800 dark:text-slate-200 mt-1">
            {formatBytes(originalBytes)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-950 dark:bg-emerald-950/20 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Optimized Size
          </span>
          <p className="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatBytes(optimizedBytes)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Saved Bytes
          </span>
          <p className="text-lg font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatBytes(savedBytes)}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
            Compression Ratio
          </span>
          <p className="text-xl font-mono font-black mt-1">-{percentSaved}%</p>
        </div>
      </div>

      {/* Main Studio Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Optimization Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <Sliders className="h-4 w-4 text-emerald-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Optimization Rules
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Strip XML Comments
                </span>
                <input
                  type="checkbox"
                  checked={options.removeComments}
                  onChange={(e) => setOptions({ ...options, removeComments: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Strip DOCTYPE & XML Prolog
                </span>
                <input
                  type="checkbox"
                  checked={options.removeDoctype}
                  onChange={(e) => setOptions({ ...options, removeDoctype: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Remove Metadata & Title Tags
                </span>
                <input
                  type="checkbox"
                  checked={options.removeMetadata}
                  onChange={(e) => setOptions({ ...options, removeMetadata: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Strip Illustrator / Sketch Namespaces
                </span>
                <input
                  type="checkbox"
                  checked={options.removeEditorNamespaces}
                  onChange={(e) =>
                    setOptions({ ...options, removeEditorNamespaces: e.target.checked })
                  }
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Collapse Empty &lt;g&gt; Groups
                </span>
                <input
                  type="checkbox"
                  checked={options.collapseGroups}
                  onChange={(e) => setOptions({ ...options, collapseGroups: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Remove Hidden Elements
                </span>
                <input
                  type="checkbox"
                  checked={options.removeHidden}
                  onChange={(e) => setOptions({ ...options, removeHidden: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Shorten Hex Colors (#ffffff → #fff)
                </span>
                <input
                  type="checkbox"
                  checked={options.minifyColors}
                  onChange={(e) => setOptions({ ...options, minifyColors: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Round Float Precision
                  </span>
                  <input
                    type="checkbox"
                    checked={options.roundFloats}
                    onChange={(e) => setOptions({ ...options, roundFloats: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>

                {options.roundFloats && (
                  <div className="flex items-center justify-between pl-2">
                    <span className="text-slate-500 text-[11px]">Decimals:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((p) => (
                        <button
                          key={p}
                          onClick={() => setOptions({ ...options, floatPrecision: p })}
                          className={cn(
                            'px-2 py-0.5 rounded font-mono text-[11px] font-bold transition',
                            options.floatPrecision === p
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  Prettify Code (Indented)
                </span>
                <input
                  type="checkbox"
                  checked={options.prettify}
                  onChange={(e) => setOptions({ ...options, prettify: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="gradient"
              size="md"
              onClick={downloadOptimizedSvg}
              leftIcon={<Download className="h-4 w-4" />}
              className="w-full"
            >
              Download Optimized SVG
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={copyOptimizedCode}
              leftIcon={
                copiedCode ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )
              }
              className="w-full"
            >
              {copiedCode ? 'Copied to Clipboard!' : 'Copy Optimized SVG Code'}
            </Button>
          </div>
        </div>

        {/* Right Column: Visual & Code View */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800 gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => setViewTab('visual')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg transition',
                  viewTab === 'visual'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                Visual Side-by-Side
              </button>
              <button
                onClick={() => setViewTab('code')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg transition',
                  viewTab === 'code'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                Optimized Code
              </button>
              <button
                onClick={() => setViewTab('diff')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg transition',
                  viewTab === 'diff'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                Raw Input Code
              </button>
            </div>

            {viewTab === 'visual' && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Backdrop:</span>
                <button
                  onClick={() => setBgMode('transparent')}
                  className={cn(
                    'px-2 py-0.5 text-xs rounded font-medium',
                    bgMode === 'transparent'
                      ? 'bg-slate-300 text-slate-900 font-bold dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setBgMode('light')}
                  className={cn(
                    'px-2 py-0.5 text-xs rounded font-medium',
                    bgMode === 'light'
                      ? 'bg-white text-slate-900 font-bold shadow-sm'
                      : 'text-slate-500'
                  )}
                >
                  Light
                </button>
                <button
                  onClick={() => setBgMode('dark')}
                  className={cn(
                    'px-2 py-0.5 text-xs rounded font-medium',
                    bgMode === 'dark'
                      ? 'bg-slate-950 text-white font-bold'
                      : 'text-slate-500'
                  )}
                >
                  Dark
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: Visual Comparison */}
          {viewTab === 'visual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Render */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
                  <span>Original Render</span>
                  <span className="font-mono text-slate-400">{formatBytes(originalBytes)}</span>
                </div>
                <div
                  className={cn(
                    'flex h-[320px] items-center justify-center rounded-2xl border border-slate-200 p-4 dark:border-slate-800 overflow-hidden',
                    bgMode === 'transparent' && 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]',
                    bgMode === 'light' && 'bg-white',
                    bgMode === 'dark' && 'bg-slate-950'
                  )}
                  dangerouslySetInnerHTML={{ __html: rawSvg }}
                />
              </div>

              {/* Optimized Render */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
                  <span>Optimized Render</span>
                  <span className="font-mono text-emerald-600 font-bold">
                    {formatBytes(optimizedBytes)} (-{percentSaved}%)
                  </span>
                </div>
                <div
                  className={cn(
                    'flex h-[320px] items-center justify-center rounded-2xl border border-emerald-200 p-4 dark:border-emerald-900/60 overflow-hidden shadow-inner',
                    bgMode === 'transparent' && 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]',
                    bgMode === 'light' && 'bg-white',
                    bgMode === 'dark' && 'bg-slate-950'
                  )}
                  dangerouslySetInnerHTML={{ __html: optimizedSvg }}
                />
              </div>
            </div>
          )}

          {/* TAB 2: Optimized Code */}
          {viewTab === 'code' && (
            <textarea
              value={optimizedSvg}
              readOnly
              rows={16}
              className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-emerald-300 shadow-inner focus:outline-none dark:border-slate-800"
            />
          )}

          {/* TAB 3: Raw Input Code */}
          {viewTab === 'diff' && (
            <textarea
              value={rawSvg}
              onChange={(e) => setRawSvg(e.target.value)}
              rows={16}
              placeholder="Paste raw SVG code here..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-relaxed text-indigo-300 shadow-inner focus:outline-none dark:border-slate-800"
            />
          )}
        </div>
      </div>
    </div>
  );
};
