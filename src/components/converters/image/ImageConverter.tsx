'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProcessingScreen } from '@/components/conversion/ProcessingScreen';
import { DownloadScreen } from '@/components/conversion/DownloadScreen';
import { formatBytes } from '@/lib/utils';
import { ImageComparisonSlider } from './ImageComparisonSlider';
import {
  Sliders,
  Maximize2,
  Lock,
  Unlock,
  Check,
  AlertCircle,
  FileImage,
  Layers,
  Sparkles,
  Zap,
  ArrowRight,
  Palette,
  Shield,
  Eye,
  Download,
  Trash2,
  RefreshCw,
  Plus,
  Compass,
} from 'lucide-react';

export interface ImageConverterProps {
  initialTargetFormat?: string;
  initialToolSlug?: string;
  defaultQuality?: number;
}

const POPULAR_FORMATS = [
  { id: 'avif', label: 'AVIF', badge: '50% Smaller', ext: '.avif', desc: 'Next-gen AV1 compression' },
  { id: 'webp', label: 'WebP', badge: '35% Smaller', ext: '.webp', desc: 'Google modern web standard' },
  { id: 'jpg', label: 'JPG / JPEG', badge: 'Universal', ext: '.jpg', desc: 'Compatible with all devices' },
  { id: 'png', label: 'PNG', badge: 'Transparent', ext: '.png', desc: 'Lossless alpha transparency' },
  { id: 'ico', label: 'ICO (Favicon)', badge: 'Multi-Pack', ext: '.ico', desc: '16, 32, 48, 64px pack' },
  { id: 'svg', label: 'SVG', badge: 'Vector', ext: '.svg', desc: 'Scalable vector container' },
  { id: 'gif', label: 'GIF', badge: 'Animated', ext: '.gif', desc: 'Standard animated frames' },
  { id: 'tiff', label: 'TIFF', badge: 'Print', ext: '.tiff', desc: 'High-fidelity publishing' },
];

const SVG_PRESET_DIMENSIONS = [
  { label: '512 × 512', w: 512, h: 512, desc: 'App Icon' },
  { label: '1024 × 1024', w: 1024, h: 1024, desc: 'HD Retina' },
  { label: '2048 × 2048', w: 2048, h: 2048, desc: '2K Vector' },
  { label: '4096 × 4096', w: 4096, h: 4096, desc: '4K Ultra-HD' },
];

const DPI_PRESETS = [
  { value: 72, label: '72 DPI', desc: 'Standard Screen' },
  { value: 150, label: '150 DPI', desc: 'High Density' },
  { value: 300, label: '300 DPI', desc: 'Retina / Print' },
  { value: 600, label: '600 DPI', desc: 'Ultra-HD' },
];

interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  originalDimensions?: { width: number; height: number };
  status: 'idle' | 'processing' | 'done' | 'error';
  progress: number;
  result?: {
    downloadUrl: string;
    targetFilename: string;
    originalSizeBytes: number;
    convertedSizeBytes: number;
    targetFormat: string;
    width?: number;
    height?: number;
    savedPercent: number;
  };
  errorMessage?: string;
}

export const ImageConverter: React.FC<ImageConverterProps> = ({
  initialTargetFormat = 'avif',
  initialToolSlug,
  defaultQuality = 80,
}) => {
  const [stage, setStage] = useState<'upload' | 'processing' | 'download'>('upload');
  const [filesQueue, setFilesQueue] = useState<BatchItem[]>([]);
  const [activeItemIndex, setActiveItemIndex] = useState<number>(0);

  // General Format & Compression Settings
  const [targetFormat, setTargetFormat] = useState<string>(initialTargetFormat);
  const [quality, setQuality] = useState<number>(defaultQuality);

  // AVIF Next-Gen Specifics
  const [avifEffort, setAvifEffort] = useState<number>(4);
  const [chromaSubsampling, setChromaSubsampling] = useState<'4:2:0' | '4:4:4'>('4:2:0');
  const [stripExif, setStripExif] = useState<boolean>(true);

  // SVG / Favicon Specifics
  const [svgDpi, setSvgDpi] = useState<number>(300);
  const [svgTintColor, setSvgTintColor] = useState<string>('');
  const [isFaviconPack, setIsFaviconPack] = useState<boolean>(false);

  // Resize & Dimensions Settings
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [resizePreset, setResizePreset] = useState<number>(100);

  // Extra Color / Filter Options
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Setup initial settings based on slug
  useEffect(() => {
    if (initialToolSlug) {
      if (initialToolSlug === 'avif-to-jpg' || initialToolSlug.startsWith('avif-to-')) {
        const parts = initialToolSlug.split('-to-');
        if (parts[1]) setTargetFormat(parts[1].toLowerCase());
      } else if (initialToolSlug.endsWith('-to-avif')) {
        setTargetFormat('avif');
        setQuality(80);
      } else if (initialToolSlug === 'svg-to-ico' || initialToolSlug === 'png-to-ico') {
        setTargetFormat('ico');
        setIsFaviconPack(true);
      } else if (initialToolSlug === 'svg-to-png') {
        setTargetFormat('png');
        setSvgDpi(300);
      } else if (initialToolSlug.includes('-to-')) {
        const parts = initialToolSlug.split('-to-');
        if (parts[1]) setTargetFormat(parts[1].toLowerCase());
      } else if (initialToolSlug === 'compress-image') {
        setQuality(70);
      } else if (initialToolSlug === 'resize-image') {
        setResizePreset(75);
      }
    }
  }, [initialToolSlug]);

  // Handle new files dropped
  const handleFilesAdded = (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const items: BatchItem[] = newFiles.map((file) => {
      const pUrl = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: pUrl,
        status: 'idle',
        progress: 0,
      };
    });

    setFilesQueue((prev) => [...prev, ...items]);
    setErrorMessage(null);

    // Read natural dimensions of first item
    if (items[0]) {
      const img = new Image();
      img.onload = () => {
        setCustomWidth(img.naturalWidth.toString());
        setCustomHeight(img.naturalHeight.toString());
      };
      img.src = items[0].previewUrl;
    }
  };

  const activeItem = filesQueue[activeItemIndex] || filesQueue[0];

  // Handle Resize Preset Change
  const handlePresetScale = (percent: number) => {
    setResizePreset(percent);
    if (activeItem?.originalDimensions) {
      const w = Math.round((activeItem.originalDimensions.width * percent) / 100);
      const h = Math.round((activeItem.originalDimensions.height * percent) / 100);
      setCustomWidth(w.toString());
      setCustomHeight(h.toString());
    }
  };

  // Convert single item
  const convertSingleItem = async (item: BatchItem): Promise<BatchItem> => {
    const formData = new FormData();
    formData.append('file', item.file);
    formData.append('targetFormat', targetFormat);
    formData.append('quality', quality.toString());
    formData.append('effort', avifEffort.toString());
    formData.append('chromaSubsampling', chromaSubsampling);
    formData.append('stripExif', stripExif ? 'true' : 'false');
    formData.append('dpi', svgDpi.toString());
    if (svgTintColor) formData.append('tintColor', svgTintColor);
    if (targetFormat === 'ico' || isFaviconPack) formData.append('multiResolutionIco', 'true');

    if (customWidth && parseInt(customWidth, 10) > 0) formData.append('width', customWidth);
    if (customHeight && parseInt(customHeight, 10) > 0) formData.append('height', customHeight);
    if (grayscale) formData.append('grayscale', 'true');
    if (backgroundColor && (targetFormat === 'jpg' || targetFormat === 'jpeg')) {
      formData.append('flattenBackground', backgroundColor);
    }

    const response = await fetch('/api/convert/image', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Conversion failed');
    }

    return {
      ...item,
      status: 'done',
      progress: 100,
      result: {
        downloadUrl: data.downloadUrl,
        targetFilename: data.targetFilename,
        originalSizeBytes: data.originalSizeBytes,
        convertedSizeBytes: data.convertedSizeBytes,
        targetFormat: data.targetFormat,
        width: data.width,
        height: data.height,
        savedPercent: data.savedPercent,
      },
    };
  };

  // Convert all items in queue
  const handleConvertAll = async () => {
    if (filesQueue.length === 0) return;
    setErrorMessage(null);
    setStage('processing');

    const updated = [...filesQueue];
    for (let i = 0; i < updated.length; i++) {
      updated[i].status = 'processing';
      setFilesQueue([...updated]);

      try {
        const completed = await convertSingleItem(updated[i]);
        updated[i] = completed;
      } catch (err: any) {
        console.error('Conversion item error:', err);
        updated[i].status = 'error';
        updated[i].errorMessage = err.message || 'Conversion failed';
      }
      setFilesQueue([...updated]);
    }

    setStage('download');
  };

  const handleReset = () => {
    filesQueue.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setFilesQueue([]);
    setErrorMessage(null);
    setShowComparison(false);
    setStage('upload');
  };

  const removeQueueItem = (id: string) => {
    const item = filesQueue.find((i) => i.id === id);
    if (item) URL.revokeObjectURL(item.previewUrl);
    const filtered = filesQueue.filter((i) => i.id !== id);
    setFilesQueue(filtered);
    if (activeItemIndex >= filtered.length) {
      setActiveItemIndex(Math.max(0, filtered.length - 1));
    }
  };

  // Render processing screen
  if (stage === 'processing') {
    return (
      <ProcessingScreen
        filename={activeItem?.file.name}
        sourceFormat={activeItem?.file.name.split('.').pop()?.toUpperCase()}
        targetFormat={targetFormat.toUpperCase()}
      />
    );
  }

  // Render download screen for single or batch
  if (stage === 'download') {
    const singleDone = filesQueue.length === 1 ? filesQueue[0]?.result : null;

    if (singleDone && filesQueue[0]) {
      return (
        <div className="w-full space-y-6">
          <DownloadScreen
            downloadUrl={singleDone.downloadUrl}
            originalFilename={filesQueue[0].file.name}
            targetFilename={singleDone.targetFilename}
            originalSizeBytes={singleDone.originalSizeBytes}
            convertedSizeBytes={singleDone.convertedSizeBytes}
            targetFormat={singleDone.targetFormat}
            width={singleDone.width}
            height={singleDone.height}
            previewUrl={filesQueue[0].previewUrl}
            currentSlug={initialToolSlug || 'image-converter'}
            categorySlug="image"
            onReset={handleReset}
          />

          {/* Interactive Side-by-Side Comparison Slider */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Visual Fidelity & Compression Inspector
                </h3>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {singleDone.savedPercent > 0 ? `-${singleDone.savedPercent}% Smaller` : 'Optimized'}
              </span>
            </div>

            <div className="mt-4">
              <ImageComparisonSlider
                originalSrc={filesQueue[0].previewUrl}
                convertedSrc={singleDone.downloadUrl}
                originalLabel="Original Source"
                convertedLabel={`Converted (.${singleDone.targetFormat})`}
                originalSize={formatBytes(singleDone.originalSizeBytes)}
                convertedSize={formatBytes(singleDone.convertedSizeBytes)}
              />
            </div>
          </div>
        </div>
      );
    }

    // Batch Results Screen
    return (
      <div className="w-full space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Batch Image Conversion Complete
              </h3>
              <p className="text-xs text-slate-500">
                Processed {filesQueue.filter((i) => i.status === 'done').length} of {filesQueue.length} files successfully
              </p>
            </div>
            <Button size="sm" variant="secondary" onClick={handleReset} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
              Convert More
            </Button>
          </div>

          <div className="mt-6 divide-y divide-slate-100 dark:divide-slate-800">
            {filesQueue.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-12 w-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div className="overflow-hidden">
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200">{item.file.name}</p>
                    <p className="text-xs text-slate-400">
                      {formatBytes(item.file.size)}
                      {item.result && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {' '}→ {formatBytes(item.result.convertedSizeBytes)} ({item.result.savedPercent}% saved)
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {item.status === 'done' && item.result ? (
                  <a
                    href={item.result.downloadUrl}
                    download={item.result.targetFilename}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download .{item.result.targetFormat}
                  </a>
                ) : (
                  <span className="text-xs font-semibold text-red-500">{item.errorMessage || 'Failed'}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const isSvg = activeItem?.file.name.toLowerCase().endsWith('.svg');
  const isHeic =
    activeItem?.file.name.toLowerCase().endsWith('.heic') ||
    activeItem?.file.name.toLowerCase().endsWith('.heif');

  return (
    <div className="w-full space-y-6">
      {/* 1. Upload Dropzone */}
      {filesQueue.length === 0 ? (
        <Dropzone
          accept="image/*,.heic,.heif,.svg,.ico,.bmp,.tiff,.avif,.webp"
          maxSizeMb={25}
          multiple={true}
          onFilesSelected={handleFilesAdded}
          acceptedFormatsText="Supports AVIF, SVG, HEIC (iPhone), PNG, JPG, WebP, GIF, ICO, TIFF (Up to 10 files)"
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900 space-y-6">
          {/* Header Queue Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/60">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <FileImage className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    {filesQueue.length === 1 ? activeItem.file.name : `${filesQueue.length} Images Selected`}
                  </h4>
                  {isHeic && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      📱 Apple HEIC
                    </span>
                  )}
                  {isSvg && (
                    <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      ✨ Vector SVG
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Size: {formatBytes(filesQueue.reduce((acc, f) => acc + f.file.size, 0))}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleReset}>
                Clear All
              </Button>
            </div>
          </div>

          {/* Batch Thumbnails Carousel if multiple */}
          {filesQueue.length > 1 && (
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
              {filesQueue.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => setActiveItemIndex(idx)}
                  className={`group relative flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border p-2 transition ${
                    activeItemIndex === idx
                      ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/40'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/40'
                  }`}
                >
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-9 w-9 rounded-lg object-cover"
                  />
                  <div className="max-w-[100px] overflow-hidden text-left">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.file.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{formatBytes(item.file.size)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeQueueItem(item.id);
                    }}
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 2. Format Selection Matrix */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Target Output Format</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold lowercase">
                converting to .{targetFormat}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {POPULAR_FORMATS.map((fmt) => {
                const isSelected = targetFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setTargetFormat(fmt.id);
                      if (fmt.id === 'ico') setIsFaviconPack(true);
                    }}
                    className={`group flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/60'
                        : 'border-slate-200/80 bg-slate-50/50 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <p className={`text-sm font-bold ${isSelected ? 'text-indigo-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {fmt.label}
                      </p>
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                        {fmt.badge}
                      </span>
                    </div>
                    <span className="mt-1 text-[11px] text-slate-400 line-clamp-1">{fmt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. AVIF Next-Gen Settings Panel */}
          {targetFormat === 'avif' && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4.5 dark:border-indigo-900/50 dark:bg-indigo-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    AVIF Next-Gen Compression Engine
                  </span>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  Quality: {quality}% (Effort {avifEffort}/9)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Chroma Subsampling */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Chroma Subsampling
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setChromaSubsampling('4:2:0')}
                      className={`rounded-xl border p-2 text-xs font-medium transition ${
                        chromaSubsampling === '4:2:0'
                          ? 'border-indigo-600 bg-white font-bold text-indigo-600 shadow-xs dark:bg-slate-900'
                          : 'border-slate-200 text-slate-600 dark:border-slate-800'
                      }`}
                    >
                      4:2:0 (Smaller Size)
                    </button>
                    <button
                      type="button"
                      onClick={() => setChromaSubsampling('4:4:4')}
                      className={`rounded-xl border p-2 text-xs font-medium transition ${
                        chromaSubsampling === '4:4:4'
                          ? 'border-indigo-600 bg-white font-bold text-indigo-600 shadow-xs dark:bg-slate-900'
                          : 'border-slate-200 text-slate-600 dark:border-slate-800'
                      }`}
                    >
                      4:4:4 (Sharp Graphics)
                    </button>
                  </div>
                </div>

                {/* CPU Effort */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>CPU Effort Level</span>
                    <span>{avifEffort} / 9</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="9"
                    value={avifEffort}
                    onChange={(e) => setAvifEffort(parseInt(e.target.value, 10))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-700"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1 (Fastest)</span>
                    <span>4 (Balanced)</span>
                    <span>9 (Max Compression)</span>
                  </div>
                </div>
              </div>

              {/* Strip EXIF Toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={stripExif}
                    onChange={(e) => setStripExif(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Strip EXIF metadata (Protects privacy & saves file size)</span>
                </label>
              </div>
            </div>
          )}

          {/* 4. Favicon Multi-Resolution Pack Simulation Panel */}
          {(targetFormat === 'ico' || isFaviconPack) && (
            <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4.5 dark:border-purple-900/50 dark:bg-purple-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200">
                    Multi-Resolution Favicon Pack (.ICO)
                  </span>
                </div>
                <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                  4-Layer ICO Container
                </span>
              </div>

              <p className="text-xs text-purple-900/80 dark:text-purple-300">
                Packs standard Windows & Web favicon layers into a single binary: <strong>16×16</strong> (Tab), <strong>32×32</strong> (Retina), <strong>48×48</strong> (Taskbar), and <strong>64×64</strong> (High-DPI).
              </p>

              {/* Browser Tab Simulation Preview */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-100 p-2.5 dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 shadow-xs dark:bg-slate-900 max-w-xs">
                  <img
                    src={activeItem?.previewUrl}
                    alt="Favicon preview"
                    className="h-4 w-4 rounded-sm object-contain"
                  />
                  <span className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">
                    ApexTools • Fast Favicon Preview
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. SVG Vector Controls (when input is SVG or target is PNG) */}
          {isSvg && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4.5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Vector SVG Rasterization Controls
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* DPI Resolution */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Vector Density (DPI)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {DPI_PRESETS.map((dpi) => (
                      <button
                        key={dpi.value}
                        type="button"
                        onClick={() => setSvgDpi(dpi.value)}
                        className={`rounded-xl border p-2 text-center text-xs transition ${
                          svgDpi === dpi.value
                            ? 'border-indigo-600 bg-indigo-600 font-bold text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {dpi.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Preset Dimensions */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Dimension Presets
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SVG_PRESET_DIMENSIONS.map((dim) => (
                      <button
                        key={dim.label}
                        type="button"
                        onClick={() => {
                          setCustomWidth(dim.w.toString());
                          setCustomHeight(dim.h.toString());
                        }}
                        className="rounded-xl border border-slate-200 bg-white p-1.5 text-xs text-slate-700 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <strong>{dim.label}</strong> ({dim.desc})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tint color override */}
              <div className="flex items-center gap-3 pt-1">
                <Palette className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Recolor Vector Fill:
                </span>
                <input
                  type="color"
                  value={svgTintColor || '#3b82f6'}
                  onChange={(e) => setSvgTintColor(e.target.value)}
                  className="h-7 w-7 cursor-pointer rounded-lg border border-slate-200 bg-transparent"
                  title="Override SVG fill color"
                />
                {svgTintColor && (
                  <button
                    type="button"
                    onClick={() => setSvgTintColor('')}
                    className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Reset Original Colors
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 6. Quality & Compression Slider */}
          {targetFormat !== 'svg' && targetFormat !== 'ico' && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4.5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Quality & Compression
                  </span>
                </div>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {quality}% {quality >= 85 ? '(Recommended High-Res)' : quality >= 70 ? '(Web-Optimized)' : '(Max Compression)'}
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:bg-slate-700"
              />

              <div className="flex justify-between text-[10px] text-slate-400">
                <button type="button" onClick={() => setQuality(50)} className="hover:text-indigo-600">
                  50% (Smallest Size)
                </button>
                <button type="button" onClick={() => setQuality(75)} className="hover:text-indigo-600">
                  75% (Web Optimized)
                </button>
                <button type="button" onClick={() => setQuality(85)} className="hover:text-indigo-600 font-semibold">
                  85% (Balanced)
                </button>
                <button type="button" onClick={() => setQuality(100)} className="hover:text-indigo-600">
                  100% (Lossless)
                </button>
              </div>
            </div>
          )}

          {/* 7. Image Resizing Dimensions (Width / Height) */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4.5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 className="h-4 w-4 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Dimensions & Scaling (Optional)
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[25, 50, 75, 100, 150, 200].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePresetScale(pct)}
                    className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                      resizePreset === pct
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Width (Pixels)
                </label>
                <Input
                  type="number"
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  placeholder="Width in px"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Height (Pixels)
                  </label>
                  <button
                    type="button"
                    onClick={() => setLockAspectRatio(!lockAspectRatio)}
                    className="inline-flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {lockAspectRatio ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                    {lockAspectRatio ? 'Locked' : 'Free'}
                  </button>
                </div>
                <Input
                  type="number"
                  value={customHeight}
                  onChange={(e) => setCustomHeight(e.target.value)}
                  placeholder="Height in px"
                />
              </div>
            </div>
          </div>

          {/* 8. Extra Color Filters & Background */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={grayscale}
                onChange={(e) => setGrayscale(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Grayscale (Black & White)</span>
            </label>

            {(targetFormat === 'jpg' || targetFormat === 'jpeg') && (
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <Palette className="h-3.5 w-3.5 text-indigo-500" />
                <span>Matte Background Color:</span>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="h-6 w-6 cursor-pointer rounded border border-slate-200 bg-transparent"
                  title="Flatten transparent alpha with solid background"
                />
              </div>
            )}
          </div>

          {/* Error display */}
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Convert Button */}
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleConvertAll}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto min-w-[280px] py-4 text-base font-bold shadow-lg shadow-indigo-500/20"
            >
              {filesQueue.length > 1
                ? `Convert ${filesQueue.length} Images to .${targetFormat.toUpperCase()}`
                : `Convert to ${targetFormat.toUpperCase()} Now`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
