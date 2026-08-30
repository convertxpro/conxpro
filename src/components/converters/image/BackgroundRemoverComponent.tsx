'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ImageMinus,
  Sparkles,
  RefreshCw,
  Download,
  UploadCloud,
  Check,
  AlertCircle,
  Sliders,
  Palette,
  Image as ImageIcon,
  Eye,
  Layers,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Lock,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn, formatBytes } from '@/lib/utils';

interface BackgroundRemoverComponentProps {
  tool?: ToolMetadata;
}

type BackgroundMode = 'transparent' | 'color' | 'blur' | 'custom-image';

interface ColorPreset {
  name: string;
  hex: string;
  badge?: string;
}

const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Pure White', hex: '#FFFFFF', badge: 'E-Commerce / Amazon' },
  { name: 'Pure Black', hex: '#000000' },
  { name: 'Studio Slate', hex: '#1E293B' },
  { name: 'Soft Gray', hex: '#F1F5F9' },
  { name: 'Electric Indigo', hex: '#4F46E5' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Sunset Coral', hex: '#F43F5E' },
  { name: 'Warm Amber', hex: '#D97706' },
  { name: 'Cyan Tech', hex: '#0284C7' },
];

const SAMPLE_IMAGES = [
  {
    id: 'product',
    title: 'E-Commerce Sneaker',
    desc: 'Product cutout for Amazon/Shopify listing',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'portrait',
    title: 'Professional Headshot',
    desc: 'Studio portrait photo cutout',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'car',
    title: 'Automotive Showcase',
    desc: 'Vehicle foreground isolation',
    url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&auto=format&fit=crop&q=80',
  },
];

export const BackgroundRemoverComponent: React.FC<BackgroundRemoverComponentProps> = ({
  tool,
}) => {
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [cutoutBlobUrl, setCutoutBlobUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Background customization state
  const [bgMode, setBgMode] = useState<BackgroundMode>('transparent');
  const [selectedColor, setSelectedColor] = useState<string>('#FFFFFF');
  const [customHex, setCustomHex] = useState<string>('#FFFFFF');
  const [blurRadius, setBlurRadius] = useState<number>(14);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [exportQuality, setExportQuality] = useState<number>(92);

  // Comparison slider position (0 - 100)
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const canvasCompositeRef = useRef<HTMLCanvasElement>(null);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setOriginalFile(file);
    const url = URL.createObjectURL(file);
    setOriginalImageUrl(url);
    setCutoutBlobUrl(null);
    setErrorMessage(null);
  };

  const loadSample = (sample: (typeof SAMPLE_IMAGES)[0]) => {
    setOriginalImageUrl(sample.url);
    setOriginalFile(null);
    setCutoutBlobUrl(null);
    setErrorMessage(null);
  };

  const removeBackground = async () => {
    if (!originalImageUrl && !originalFile) {
      setErrorMessage('Please upload or select an image first.');
      return;
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressMessage('Initializing neural network segmentation weights...');
    setErrorMessage(null);

    try {
      // Dynamic client-side import with webpackIgnore to prevent Next.js Terser onnxruntime bundling errors
      let removeBg: any = null;
      try {
        const imgly = await (Function('return import("https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0/+esm")'))();
        removeBg = imgly.default || imgly.removeBackground;
      } catch (cdnErr) {
        console.warn('CDN dynamic import fallback, trying local module:', cdnErr);
        const imgly = await (Function('return import("@imgly/background-removal")'))();
        removeBg = imgly.default || imgly.removeBackground;
      }

      if (!removeBg) {
        throw new Error('Background removal engine failed to initialize in browser.');
      }

      setProgressPercent(25);
      setProgressMessage('Loading AI model in browser memory (Zero Server Upload)...');

      const targetInput: any = originalFile || originalImageUrl;

      const blobResult = await removeBg(targetInput, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            const pct = Math.min(95, Math.round(25 + (current / total) * 70));
            setProgressPercent(pct);
            setProgressMessage(`Segmenting subject pixels (${Math.round((current / total) * 100)}%)...`);
          } else {
            setProgressMessage(`Processing AI tensor layers: ${key}...`);
          }
        },
      });

      const cutoutUrl = URL.createObjectURL(blobResult);
      setCutoutBlobUrl(cutoutUrl);
      setProgressPercent(100);
      setProgressMessage('Subject Isolated Successfully!');
    } catch (err: any) {
      console.error('Background removal error:', err);
      setErrorMessage(
        err?.message ||
          'Failed to remove background. Please try a different high-contrast image.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Slider dragging logic
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(rect.width, x));
    setSliderPosition((clamped / rect.width) * 100);
  }, []);

  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBgUrl(url);
      setBgMode('custom-image');
    }
  };

  // Render composite canvas for download
  const handleDownload = async () => {
    if (!cutoutBlobUrl) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const cutoutImg = new Image();
      cutoutImg.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        cutoutImg.onload = resolve;
        cutoutImg.onerror = reject;
        cutoutImg.src = cutoutBlobUrl;
      });

      canvas.width = cutoutImg.naturalWidth || 1200;
      canvas.height = cutoutImg.naturalHeight || 900;

      // 1. Draw Background
      if (bgMode === 'transparent') {
        // Leave canvas empty / transparent
      } else if (bgMode === 'color') {
        ctx.fillStyle = selectedColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (bgMode === 'blur' && originalImageUrl) {
        const origImg = new Image();
        origImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          origImg.onload = resolve;
          origImg.onerror = reject;
          origImg.src = originalImageUrl;
        });
        ctx.save();
        ctx.filter = `blur(${blurRadius * 2}px)`;
        ctx.drawImage(origImg, -20, -20, canvas.width + 40, canvas.height + 40);
        ctx.restore();
      } else if (bgMode === 'custom-image' && customBgUrl) {
        const customImg = new Image();
        customImg.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          customImg.onload = resolve;
          customImg.onerror = reject;
          customImg.src = customBgUrl;
        });
        ctx.drawImage(customImg, 0, 0, canvas.width, canvas.height);
      }

      // 2. Draw Isolated Cutout Subject
      ctx.drawImage(cutoutImg, 0, 0, canvas.width, canvas.height);

      // 3. Export
      const mimeType =
        exportFormat === 'png'
          ? 'image/png'
          : exportFormat === 'webp'
          ? 'image/webp'
          : 'image/jpeg';

      const dataUrl = canvas.toDataURL(mimeType, exportQuality / 100);
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `converthub-bg-removed.${exportFormat}`;
      a.click();
    } catch (e) {
      console.error('Export composite error:', e);
      // Fallback direct download
      const a = document.createElement('a');
      a.href = cutoutBlobUrl;
      a.download = `converthub-cutout.png`;
      a.click();
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
            <ImageMinus className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Client-Side AI Background Remover
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              100% in-browser neural network • Zero server upload • High-res transparent output
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
          <Zap className="h-4 w-4" />
          <span>ONNX WebAssembly Accelerated</span>
        </div>
      </div>

      {/* Main Grid: Upload & Controls on Left, Split Viewer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Background Modifiers */}
        <div className="lg:col-span-5 space-y-5">
          {/* Upload Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Upload Photo / Graphic
            </span>

            <Dropzone
              accept="image/png,image/jpeg,image/webp,image/avif"
              maxSizeMb={25}
              onFilesSelected={handleFiles}
              disabled={isProcessing}
              acceptedFormatsText="PNG, JPG, WebP, AVIF (Portraits, Products, Cars)"
            />

            {/* Run Background Removal Button */}
            <Button
              onClick={removeBackground}
              disabled={isProcessing || !originalImageUrl}
              className="w-full py-3 text-sm font-semibold shadow-md bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Isolating Foreground ({progressPercent}%)...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Remove Background with AI</span>
                </div>
              )}
            </Button>

            {isProcessing && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>{progressMessage}</span>
                  <span>{progressPercent}%</span>
                </div>
                <ProgressBar progress={progressPercent} />
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Background Replacement Customizer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              2. Canvas Background Replacement
            </span>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setBgMode('transparent')}
                className={cn(
                  'rounded-lg py-1.5 px-2 transition',
                  bgMode === 'transparent'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                )}
              >
                Transparent
              </button>
              <button
                type="button"
                onClick={() => setBgMode('color')}
                className={cn(
                  'rounded-lg py-1.5 px-2 transition',
                  bgMode === 'color'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                )}
              >
                Solid Color
              </button>
              <button
                type="button"
                onClick={() => setBgMode('blur')}
                className={cn(
                  'rounded-lg py-1.5 px-2 transition',
                  bgMode === 'blur'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                )}
              >
                Blur Original
              </button>
              <button
                type="button"
                onClick={() => setBgMode('custom-image')}
                className={cn(
                  'rounded-lg py-1.5 px-2 transition',
                  bgMode === 'custom-image'
                    ? 'bg-white text-purple-600 shadow-sm dark:bg-slate-900 dark:text-purple-400'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                )}
              >
                Custom Image
              </button>
            </div>

            {/* Color Palette Swatches */}
            {bgMode === 'color' && (
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setSelectedColor(preset.hex);
                        setCustomHex(preset.hex);
                      }}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm transition-transform hover:scale-110',
                        selectedColor === preset.hex
                          ? 'border-purple-600 ring-2 ring-purple-400'
                          : 'border-slate-300 dark:border-slate-600'
                      )}
                      style={{ backgroundColor: preset.hex }}
                      title={preset.name + (preset.badge ? ` (${preset.badge})` : '')}
                    >
                      {selectedColor === preset.hex && (
                        <Check
                          className={cn(
                            'h-3.5 w-3.5',
                            preset.hex === '#FFFFFF' ? 'text-black' : 'text-white'
                          )}
                        />
                      )}
                    </button>
                  ))}
                  {/* Custom Hex input */}
                  <div className="flex items-center gap-2 ml-auto">
                    <input
                      type="color"
                      value={customHex}
                      onChange={(e) => {
                        setCustomHex(e.target.value);
                        setSelectedColor(e.target.value);
                      }}
                      className="h-7 w-7 rounded-lg border border-slate-300 cursor-pointer overflow-hidden p-0"
                    />
                    <input
                      type="text"
                      value={customHex}
                      onChange={(e) => {
                        setCustomHex(e.target.value);
                        setSelectedColor(e.target.value);
                      }}
                      className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-xs font-mono dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Blur Intensity Slider */}
            {bgMode === 'blur' && (
              <div className="space-y-2 pt-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span>Background Blur Radius</span>
                  <span className="font-semibold">{blurRadius}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="35"
                  value={blurRadius}
                  onChange={(e) => setBlurRadius(Number(e.target.value))}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>
            )}

            {/* Custom Image Upload */}
            {bgMode === 'custom-image' && (
              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-3 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  <UploadCloud className="h-4 w-4 text-purple-600" />
                  <span>Choose Background Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomBgUpload}
                    className="hidden"
                  />
                </label>
                {customBgUrl && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    ✓ Custom background image applied
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Quick Presets Demo */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sample Demo Presets
            </span>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => loadSample(sample)}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-purple-400 hover:bg-purple-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-500/50"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={sample.url}
                      alt={sample.title}
                      className="h-9 w-9 rounded-lg object-cover shadow-sm"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {sample.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {sample.desc}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Split Slider & Export Toolbar */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col min-h-[520px]">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Interactive Before & After Inspection
                </span>
                {cutoutBlobUrl && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Ready to Export
                  </span>
                )}
              </div>

              {/* Export Selector & Download Button */}
              <div className="flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as any)}
                  aria-label="Export Format Selector"
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="png">PNG (Lossless Alpha)</option>
                  <option value="webp">WebP (Transparent)</option>
                  <option value="jpeg">JPG (Solid Background)</option>
                </select>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!cutoutBlobUrl}
                  className="flex items-center gap-1.5 rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-purple-700 transition disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download Image</span>
                </button>
              </div>
            </div>

            {/* Split Comparison Canvas Area */}
            <div className="relative flex-1 p-4 flex items-center justify-center bg-slate-950/90 select-none min-h-[440px]">
              {originalImageUrl ? (
                <div
                  ref={sliderContainerRef}
                  onMouseDown={(e) => {
                    setIsDraggingSlider(true);
                    handleSliderMove(e.clientX);
                  }}
                  onMouseMove={(e) => {
                    if (isDraggingSlider) handleSliderMove(e.clientX);
                  }}
                  onMouseUp={() => setIsDraggingSlider(false)}
                  onMouseLeave={() => setIsDraggingSlider(false)}
                  onTouchMove={(e) => {
                    if (e.touches.length > 0) handleSliderMove(e.touches[0].clientX);
                  }}
                  className="relative h-[380px] sm:h-[460px] w-full overflow-hidden rounded-xl border border-slate-800 cursor-ew-resize"
                >
                  {/* Background Layer: Output Cutout Composite */}
                  <div
                    className={cn(
                      'absolute inset-0 flex items-center justify-center p-2',
                      bgMode === 'transparent' && 'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]'
                    )}
                    style={{
                      backgroundColor:
                        bgMode === 'color' ? selectedColor : undefined,
                    }}
                  >
                    {/* Render blurred original or custom bg if selected */}
                    {bgMode === 'blur' && originalImageUrl && (
                      <img
                        src={originalImageUrl}
                        alt="Blurred Background"
                        className="absolute inset-0 h-full w-full object-cover"
                        style={{ filter: `blur(${blurRadius}px)` }}
                      />
                    )}
                    {bgMode === 'custom-image' && customBgUrl && (
                      <img
                        src={customBgUrl}
                        alt="Custom Background"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}

                    {/* Cutout Image or Original Fallback */}
                    <img
                      src={cutoutBlobUrl || originalImageUrl}
                      alt="Output"
                      className="relative max-h-full max-w-full object-contain pointer-events-none drop-shadow-xl"
                    />
                  </div>

                  {/* Foreground Layer: Original Source Clipped */}
                  {cutoutBlobUrl && (
                    <div
                      className="absolute inset-0 overflow-hidden bg-slate-950"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <div
                        className="relative h-full"
                        style={{
                          width: sliderContainerRef.current
                            ? `${sliderContainerRef.current.clientWidth}px`
                            : '100%',
                        }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center p-2">
                          <img
                            src={originalImageUrl}
                            alt="Original Source"
                            className="max-h-full max-w-full object-contain pointer-events-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Split Divider Handle */}
                  {cutoutBlobUrl && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-10"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg ring-2 ring-white">
                        <span className="text-[10px] font-bold">↔</span>
                      </div>
                    </div>
                  )}

                  {/* Floating Badges */}
                  <div className="absolute bottom-3 left-3 pointer-events-none rounded-lg bg-black/70 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    Original Photo
                  </div>
                  <div className="absolute bottom-3 right-3 pointer-events-none rounded-lg bg-purple-600/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                    Isolated Subject ({cutoutBlobUrl ? `${Math.round(sliderPosition)}%` : 'Click Remove BG'})
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <ImageMinus className="h-14 w-14 stroke-[1.5] mb-3 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-300">
                    No Image Loaded
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Upload an image or pick a demo preset on the left to see the AI background removal preview.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <span>Drag the slider horizontally to compare before/after cutout edges.</span>
              <span className="flex items-center gap-1 font-semibold text-purple-600 dark:text-purple-400">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% In-Memory Privacy
              </span>
            </div>
          </div>
        </div>
      </div>

      <PrivacyAssuranceBadge />
    </div>
  );
};
