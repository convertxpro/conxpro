/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Smartphone,
  Globe,
  Layers,
  FileArchive,
  RefreshCw,
  Code,
  Sliders,
  Maximize2,
  CheckCircle2,
  Zap,
  LayoutGrid,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import JSZip from 'jszip';
import { cn } from '@/lib/utils';

interface FaviconGeneratorComponentProps {
  tool?: ToolMetadata;
}

interface GeneratedIcon {
  name: string;
  size: number;
  width: number;
  height: number;
  dataUrl: string;
  blob: Blob;
  type: string;
  label: string;
}

const REQUIRED_RESOLUTIONS = [
  { name: 'favicon-16x16.png', size: 16, label: 'Standard Browser Tab' },
  { name: 'favicon-32x32.png', size: 32, label: 'Retina / High-DPI Tab' },
  { name: 'favicon-48x48.png', size: 48, label: 'Windows Desktop Shortcut' },
  { name: 'apple-touch-icon.png', size: 180, label: 'Apple iOS Home Screen' },
  { name: 'android-chrome-192x192.png', size: 192, label: 'Android PWA Icon' },
  { name: 'android-chrome-512x512.png', size: 512, label: 'PWA Splash Screen' },
];

const SAMPLE_SVGS = [
  {
    id: 'apextools',
    name: 'Modern Gradient Hexagon',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="50%" stop-color="#6366f1" />
          <stop offset="100%" stop-color="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="url(#grad1)" />
      <path d="M256 120L380 192V336L256 408L132 336V192L256 120Z" fill="white" fill-opacity="0.15" />
      <path d="M256 160L340 208V304L256 352L172 304V208L256 160Z" fill="white" />
      <circle cx="256" cy="256" r="32" fill="#6366f1" />
    </svg>`,
  },
  {
    id: 'rocket',
    name: 'Neon Rocket Launch',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
      <defs>
        <linearGradient id="rocketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f43f5e" />
          <stop offset="100%" stop-color="#fb923c" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx="128" fill="#0f172a" />
      <path d="M256 100C256 100 340 140 340 280C340 340 300 370 300 370L212 370C212 370 172 340 172 280C172 140 256 100 256 100Z" fill="url(#rocketGrad)" />
      <circle cx="256" cy="230" r="30" fill="#ffffff" />
      <path d="M172 280L120 340V390L190 370" stroke="#f43f5e" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M340 280L392 340V390L322 370" stroke="#f43f5e" stroke-width="24" stroke-linecap="round" stroke-linejoin="round" />
    </svg>`,
  },
];

// Binary ICO pack encoder in JS
async function createIcoBinary(icons: { size: number; blob: Blob }[]): Promise<Blob> {
  const icoEntries = await Promise.all(
    icons.map(async (icon) => {
      const buffer = await icon.blob.arrayBuffer();
      return {
        size: icon.size,
        buffer,
      };
    })
  );

  const numImages = icoEntries.length;
  const headerLength = 6;
  const entryLength = 16;
  const dirLength = headerLength + numImages * entryLength;

  let totalLength = dirLength;
  icoEntries.forEach((entry) => {
    totalLength += entry.buffer.byteLength;
  });

  const icoBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(icoBuffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type 1 = Icon
  view.setUint16(4, numImages, true); // Count

  let currentOffset = dirLength;

  icoEntries.forEach((entry, idx) => {
    const entryOffset = headerLength + idx * entryLength;
    const w = entry.size >= 256 ? 0 : entry.size;
    const h = entry.size >= 256 ? 0 : entry.size;

    view.setUint8(entryOffset + 0, w); // Width
    view.setUint8(entryOffset + 1, h); // Height
    view.setUint8(entryOffset + 2, 0); // Palette count
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, entry.buffer.byteLength, true); // Image data bytes
    view.setUint32(entryOffset + 12, currentOffset, true); // Offset of image data

    // Copy PNG bytes into ICO payload
    new Uint8Array(icoBuffer, currentOffset, entry.buffer.byteLength).set(
      new Uint8Array(entry.buffer)
    );

    currentOffset += entry.buffer.byteLength;
  });

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}

export const FaviconGeneratorComponent: React.FC<FaviconGeneratorComponentProps> = ({ tool }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [appName, setAppName] = useState<string>('My Awesome App');
  const [appThemeColor, setAppThemeColor] = useState<string>('#6366f1');
  const [appBgColor, setAppBgColor] = useState<string>('#ffffff');
  const [generatedIcons, setGeneratedIcons] = useState<GeneratedIcon[]>([]);
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null);
  const [icoUrl, setIcoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'preview' | 'assets' | 'html' | 'manifest'>('preview');

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    const url = URL.createObjectURL(file);
    setSourceImage(url);
  }, []);

  const loadSampleSvg = (sample: typeof SAMPLE_SVGS[0]) => {
    const blob = new Blob([sample.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    setSourceImage(url);
  };

  const generateAllFavicons = useCallback(async () => {
    if (!sourceImage) return;

    setIsGenerating(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = sourceImage;

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const icons: GeneratedIcon[] = [];

      for (const res of REQUIRED_RESOLUTIONS) {
        const canvas = document.createElement('canvas');
        canvas.width = res.size;
        canvas.height = res.size;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, res.size, res.size);

          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), 'image/png');
          });

          const dataUrl = canvas.toDataURL('image/png');
          icons.push({
            name: res.name,
            size: res.size,
            width: res.size,
            height: res.size,
            dataUrl,
            blob,
            type: 'image/png',
            label: res.label,
          });
        }
      }

      setGeneratedIcons(icons);

      // Create multi-layer ICO containing 16, 32, and 48 px
      const icoSources = icons.filter((i) => i.size === 16 || i.size === 32 || i.size === 48);
      const binaryIco = await createIcoBinary(icoSources);
      setIcoBlob(binaryIco);
      setIcoUrl(URL.createObjectURL(binaryIco));
    } catch (e) {
      console.error('Failed to generate favicons:', e);
    } finally {
      setIsGenerating(false);
    }
  }, [sourceImage]);

  useEffect(() => {
    if (sourceImage) {
      generateAllFavicons();
    }
  }, [sourceImage, generateAllFavicons]);

  const htmlHeadSnippet = `<!-- Favicon & PWA Icons Generated by ApexTools -->
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="${appThemeColor}">`;

  const webManifestSnippet = JSON.stringify(
    {
      name: appName,
      short_name: appName.slice(0, 12),
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      theme_color: appThemeColor,
      background_color: appBgColor,
      display: 'standalone',
    },
    null,
    2
  );

  const downloadZipPack = async () => {
    if (generatedIcons.length === 0 || !icoBlob) return;

    const zip = new JSZip();

    // Add PNG icons
    generatedIcons.forEach((icon) => {
      zip.file(icon.name, icon.blob);
    });

    // Add favicon.ico
    zip.file('favicon.ico', icoBlob);

    // Add manifest.json & site.webmanifest
    zip.file('site.webmanifest', webManifestSnippet);

    // Add HTML instructions readme
    const readmeContent = `Favicon and Web App Manifest Package
Generated securely on-device with ApexTools.

INSTRUCTIONS:
1. Place all icon files and 'site.webmanifest' in your website's public/ root directory.
2. Insert the following code into your HTML <head> section:

${htmlHeadSnippet}
`;
    zip.file('README.txt', readmeContent);

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `favicon-pwa-pack-${appName.toLowerCase().replace(/\s+/g, '-')}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyHtmlSnippet = () => {
    navigator.clipboard.writeText(htmlHeadSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-6 sm:p-8 dark:border-indigo-950/60 dark:bg-gradient-to-br dark:from-indigo-950/20 dark:via-slate-900/60 dark:to-purple-950/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Multi-Pack Favicon & PWA Generator
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <FileArchive className="h-3.5 w-3.5" />
                True Binary .ICO Encoder
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tool?.name || 'SVG to Multi-Resolution Favicon (.ICO) & PNG'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Convert SVG vectors or high-res logos into a complete multi-layered Windows `.ico`, Apple Touch iOS icons, Android PWA assets, and `manifest.json` bundle.
            </p>
          </div>

          <PrivacyAssuranceBadge />
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-6 pt-6 border-t border-indigo-100/80 dark:border-indigo-900/40 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Don&apos;t have an SVG logo on hand? Test with an instant vector preset:
          </p>
          <div className="flex gap-2">
            {SAMPLE_SVGS.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant="outline"
                onClick={() => loadSampleSvg(s)}
                leftIcon={<Zap className="h-3.5 w-3.5 text-indigo-600" />}
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="space-y-4">
        <Dropzone
          onFilesSelected={handleFiles}
          acceptedFormatsText="Drop SVG vector graphics, transparent PNG, or high-res JPG logo"
          className="min-h-[150px]"
        />
      </div>

      {/* Main Studio Area */}
      {sourceImage && (
        <div className="space-y-6">
          {/* Customization Settings Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 block">
                Web App / Brand Name
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="My Brand App"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 block">
                Theme Color (Mobile Bar)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={appThemeColor}
                  onChange={(e) => setAppThemeColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950"
                />
                <input
                  type="text"
                  value={appThemeColor}
                  onChange={(e) => setAppThemeColor(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-xs font-semibold text-slate-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-end">
              <Button
                variant="gradient"
                size="md"
                onClick={downloadZipPack}
                disabled={isGenerating || generatedIcons.length === 0}
                leftIcon={
                  isGenerating ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )
                }
                className="w-full"
              >
                Download All Assets (.ZIP)
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800 gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTab('preview')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg transition',
                  selectedTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                Device Mockups
              </button>
              <button
                onClick={() => setSelectedTab('assets')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg transition',
                  selectedTab === 'assets'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                Generated Icon Files ({generatedIcons.length + 1})
              </button>
              <button
                onClick={() => setSelectedTab('html')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg transition',
                  selectedTab === 'html'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                HTML Head Code
              </button>
              <button
                onClick={() => setSelectedTab('manifest')}
                className={cn(
                  'px-3.5 py-1.5 text-xs font-bold rounded-lg transition',
                  selectedTab === 'manifest'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )}
              >
                site.webmanifest
              </button>
            </div>

            {icoUrl && (
              <a
                href={icoUrl}
                download="favicon.ico"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <Download className="h-3.5 w-3.5" />
                Direct Download favicon.ico
              </a>
            )}
          </div>

          {/* TAB 1: Real-time Device Mockups */}
          {selectedTab === 'preview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* 1. Chrome / Safari Desktop Browser Tab */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Globe className="h-4 w-4 text-indigo-600" />
                  Desktop Browser Tab
                </div>

                <div className="rounded-xl border border-slate-300 bg-slate-200/80 p-2.5 dark:border-slate-700 dark:bg-slate-800">
                  <div className="inline-flex items-center gap-2 rounded-t-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm dark:bg-slate-900 dark:text-white max-w-[200px] truncate">
                    {icoUrl ? (
                      <img src={icoUrl} alt="Favicon" className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 bg-indigo-500 rounded-sm" />
                    )}
                    <span className="truncate">{appName}</span>
                  </div>
                </div>
              </div>

              {/* 2. Apple iOS Home Screen App Icon */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Smartphone className="h-4 w-4 text-rose-500" />
                  Apple iOS Home Screen
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-800 to-slate-950 rounded-2xl text-white">
                  <div className="relative h-16 w-16 overflow-hidden rounded-[18px] bg-white p-1.5 shadow-xl ring-1 ring-white/20">
                    {sourceImage && (
                      <img src={sourceImage} alt="iOS Icon" className="h-full w-full object-contain" />
                    )}
                  </div>
                  <span className="mt-2 text-xs font-medium text-slate-200">{appName}</span>
                </div>
              </div>

              {/* 3. Android Adaptive Circle App Icon */}
              <div className="rounded-2xl border border-slate-200 bg-slate-100 p-5 dark:border-slate-800 dark:bg-slate-900/70 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Smartphone className="h-4 w-4 text-emerald-500" />
                  Android Adaptive Circle
                </div>

                <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-800 to-slate-950 rounded-2xl text-white">
                  <div className="relative h-16 w-16 overflow-hidden rounded-full bg-white p-2 shadow-xl ring-2 ring-emerald-500/30">
                    {sourceImage && (
                      <img src={sourceImage} alt="Android Icon" className="h-full w-full object-contain" />
                    )}
                  </div>
                  <span className="mt-2 text-xs font-medium text-slate-200">{appName}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Generated Asset Files Grid */}
          {selectedTab === 'assets' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {/* favicon.ico card */}
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/60 dark:bg-indigo-950/30 flex flex-col items-center justify-between gap-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white p-2 shadow-sm dark:bg-slate-900">
                  {icoUrl && <img src={icoUrl} alt="ICO" className="h-8 w-8 object-contain" />}
                </div>
                <div>
                  <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    favicon.ico
                  </p>
                  <p className="text-[11px] text-slate-500">Multi-layer (16, 32, 48px)</p>
                </div>
                {icoUrl && (
                  <a
                    href={icoUrl}
                    download="favicon.ico"
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                  >
                    Download .ICO
                  </a>
                )}
              </div>

              {/* PNG Cards */}
              {generatedIcons.map((icon) => (
                <div
                  key={icon.name}
                  className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 flex flex-col items-center justify-between gap-3 text-center shadow-sm"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 p-2 dark:bg-slate-950">
                    <img src={icon.dataUrl} alt={icon.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      {icon.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {icon.width} × {icon.height} px
                    </p>
                  </div>
                  <a
                    href={icon.dataUrl}
                    download={icon.name}
                    className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Download PNG
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Copyable HTML Snippet */}
          {selectedTab === 'html' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Code className="h-4 w-4 text-indigo-400" />
                  Paste in your &lt;head&gt; tags
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={copyHtmlSnippet}
                  leftIcon={
                    copiedCode ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {copiedCode ? 'Copied HTML!' : 'Copy Code'}
                </Button>
              </div>
              <pre className="font-mono text-xs text-indigo-300 overflow-x-auto p-3 rounded-xl bg-slate-900 leading-relaxed">
                {htmlHeadSnippet}
              </pre>
            </div>
          )}

          {/* TAB 4: site.webmanifest */}
          {selectedTab === 'manifest' && (
            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileArchive className="h-4 w-4 text-emerald-400" />
                  site.webmanifest JSON Structure
                </span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(webManifestSnippet);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  leftIcon={
                    copiedCode ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {copiedCode ? 'Copied JSON!' : 'Copy Manifest'}
                </Button>
              </div>
              <pre className="font-mono text-xs text-emerald-300 overflow-x-auto p-3 rounded-xl bg-slate-900 leading-relaxed">
                {webManifestSnippet}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
