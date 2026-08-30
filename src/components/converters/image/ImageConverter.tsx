'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProcessingScreen } from '@/components/conversion/ProcessingScreen';
import { DownloadScreen } from '@/components/conversion/DownloadScreen';
import { formatBytes } from '@/lib/utils';
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
} from 'lucide-react';

export interface ImageConverterProps {
  initialTargetFormat?: string;
  initialToolSlug?: string;
  defaultQuality?: number;
}

const POPULAR_FORMATS = [
  { id: 'jpg', label: 'JPG / JPEG', badge: 'Universal', ext: '.jpg' },
  { id: 'png', label: 'PNG', badge: 'Transparent', ext: '.png' },
  { id: 'webp', label: 'WebP', badge: 'Fast Web', ext: '.webp' },
  { id: 'avif', label: 'AVIF', badge: 'Next-Gen', ext: '.avif' },
  { id: 'ico', label: 'ICO', badge: 'Favicon', ext: '.ico' },
  { id: 'svg', label: 'SVG', badge: 'Vector Wrap', ext: '.svg' },
  { id: 'gif', label: 'GIF', badge: 'Animated', ext: '.gif' },
  { id: 'tiff', label: 'TIFF', badge: 'Print', ext: '.tiff' },
];

export const ImageConverter: React.FC<ImageConverterProps> = ({
  initialTargetFormat = 'jpg',
  initialToolSlug,
  defaultQuality = 85,
}) => {
  const [stage, setStage] = useState<'upload' | 'processing' | 'download'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>(initialTargetFormat);
  const [quality, setQuality] = useState<number>(defaultQuality);

  // Resize state
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [customWidth, setCustomWidth] = useState<string>('');
  const [customHeight, setCustomHeight] = useState<string>('');
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
  const [resizePreset, setResizePreset] = useState<number>(100);

  // Special options
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [removeBackgroundMode, setRemoveBackgroundMode] = useState<boolean>(false);

  // Conversion result
  const [conversionResult, setConversionResult] = useState<{
    downloadUrl: string;
    originalFilename: string;
    targetFilename: string;
    originalSizeBytes: number;
    convertedSizeBytes: number;
    targetFormat: string;
    width?: number;
    height?: number;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Configure initial settings based on tool slug
  useEffect(() => {
    if (initialToolSlug) {
      if (initialToolSlug.includes('-to-')) {
        const parts = initialToolSlug.split('-to-');
        if (parts[1]) setTargetFormat(parts[1].toLowerCase());
      } else if (initialToolSlug === 'compress-image') {
        setQuality(70);
      } else if (initialToolSlug === 'resize-image') {
        setResizePreset(75);
      } else if (initialToolSlug === 'remove-background') {
        setTargetFormat('png');
        setRemoveBackgroundMode(true);
      }
    }
  }, [initialToolSlug]);

  // Load preview & inspect image dimensions
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setOriginalDimensions(null);
      setCustomWidth('');
      setCustomHeight('');
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Read natural image dimensions
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
      setCustomWidth(img.naturalWidth.toString());
      setCustomHeight(img.naturalHeight.toString());
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  // Handle Resize Preset Change (25%, 50%, 75%, 100%, 200%)
  const handlePresetScale = (percent: number) => {
    setResizePreset(percent);
    if (originalDimensions) {
      const w = Math.round((originalDimensions.width * percent) / 100);
      const h = Math.round((originalDimensions.height * percent) / 100);
      setCustomWidth(w.toString());
      setCustomHeight(h.toString());
    }
  };

  // Handle manual width input change
  const handleWidthChange = (val: string) => {
    setCustomWidth(val);
    const num = parseInt(val, 10);
    if (lockAspectRatio && originalDimensions && !isNaN(num) && num > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setCustomHeight(Math.round(num * ratio).toString());
    }
  };

  // Handle manual height input change
  const handleHeightChange = (val: string) => {
    setCustomHeight(val);
    const num = parseInt(val, 10);
    if (lockAspectRatio && originalDimensions && !isNaN(num) && num > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setCustomWidth(Math.round(num * ratio).toString());
    }
  };

  // Execute conversion API request
  const handleConvert = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    setStage('processing');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('targetFormat', targetFormat);
      formData.append('quality', quality.toString());

      if (customWidth && parseInt(customWidth, 10) > 0) {
        formData.append('width', customWidth);
      }
      if (customHeight && parseInt(customHeight, 10) > 0) {
        formData.append('height', customHeight);
      }
      if (grayscale) {
        formData.append('grayscale', 'true');
      }
      if (backgroundColor && (targetFormat === 'jpg' || targetFormat === 'jpeg')) {
        formData.append('flattenBackground', backgroundColor);
      }

      const response = await fetch('/api/convert/image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Image conversion failed. Please try again.');
      }

      setConversionResult({
        downloadUrl: data.downloadUrl,
        originalFilename: data.originalFilename,
        targetFilename: data.targetFilename,
        originalSizeBytes: data.originalSizeBytes,
        convertedSizeBytes: data.convertedSizeBytes,
        targetFormat: data.targetFormat,
        width: data.width,
        height: data.height,
      });

      setStage('download');
    } catch (err: any) {
      console.error('Conversion submission error:', err);
      setErrorMessage(err.message || 'An error occurred while converting your image.');
      setStage('upload');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setConversionResult(null);
    setErrorMessage(null);
    setStage('upload');
  };

  // Render Processing Screen
  if (stage === 'processing') {
    return (
      <ProcessingScreen
        filename={selectedFile?.name}
        sourceFormat={selectedFile?.name.split('.').pop()}
        targetFormat={targetFormat.toUpperCase()}
      />
    );
  }

  // Render Download Screen
  if (stage === 'download' && conversionResult) {
    return (
      <DownloadScreen
        downloadUrl={conversionResult.downloadUrl}
        originalFilename={conversionResult.originalFilename}
        targetFilename={conversionResult.targetFilename}
        originalSizeBytes={conversionResult.originalSizeBytes}
        convertedSizeBytes={conversionResult.convertedSizeBytes}
        targetFormat={conversionResult.targetFormat}
        width={conversionResult.width}
        height={conversionResult.height}
        previewUrl={previewUrl}
        onReset={handleReset}
      />
    );
  }

  const isHeicFile =
    selectedFile?.name.toLowerCase().endsWith('.heic') ||
    selectedFile?.name.toLowerCase().endsWith('.heif');

  return (
    <div className="w-full space-y-6">
      {/* 1. File Upload Dropzone */}
      {!selectedFile ? (
        <Dropzone
          accept="image/*,.heic,.heif,.svg,.ico,.bmp,.tiff"
          maxSizeMb={25}
          onFilesSelected={(files) => {
            if (files.length > 0) {
              setSelectedFile(files[0]);
              setErrorMessage(null);
            }
          }}
          acceptedFormatsText="Supports HEIC (iPhone), PNG, JPG, WebP, GIF, SVG, BMP, TIFF"
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          {/* Selected File Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/60">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                <FileImage className="h-7 w-7" />
              </div>
              <div className="text-left overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4 className="truncate font-bold text-slate-900 dark:text-white">
                    {selectedFile.name}
                  </h4>
                  {isHeicFile && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      📱 Apple HEIC
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Size: <strong>{formatBytes(selectedFile.size)}</strong>
                  {originalDimensions && (
                    <span>
                      {' '}
                      • Original: {originalDimensions.width} × {originalDimensions.height} px
                    </span>
                  )}
                </p>
              </div>
            </div>

            <Button size="sm" variant="secondary" onClick={handleReset}>
              Change Image
            </Button>
          </div>

          {/* 2. Format & Quality Controls */}
          <div className="mt-6 space-y-6">
            {/* Format Selection Pills */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
                <span>Select Target Format</span>
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
                      onClick={() => setTargetFormat(fmt.id)}
                      className={`group flex items-center justify-between rounded-2xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 shadow-sm ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/60'
                          : 'border-slate-200/80 bg-slate-50/50 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:border-indigo-800'
                      }`}
                    >
                      <div>
                        <p
                          className={`text-sm font-bold ${
                            isSelected
                              ? 'text-indigo-900 dark:text-white'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {fmt.label}
                        </p>
                        <span className="text-[10px] text-slate-400">{fmt.ext}</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {fmt.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality & Compression Slider */}
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
                    {quality}%{' '}
                    {quality >= 90
                      ? '(Maximum Quality)'
                      : quality >= 80
                      ? '(Balanced / Recommended)'
                      : quality >= 65
                      ? '(Web Optimized)'
                      : '(High Compression)'}
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
                  <button
                    type="button"
                    onClick={() => setQuality(50)}
                    className="hover:text-indigo-600"
                  >
                    50% (Smallest Size)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality(75)}
                    className="hover:text-indigo-600"
                  >
                    75% (Web Optimized)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality(85)}
                    className="hover:text-indigo-600 font-semibold"
                  >
                    85% (Balanced)
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuality(100)}
                    className="hover:text-indigo-600"
                  >
                    100% (Lossless/Max)
                  </button>
                </div>
              </div>
            )}

            {/* Resize & Dimensions Settings */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4.5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Image Resizing (Optional)
                  </span>
                </div>
                {/* Scale presets */}
                <div className="flex items-center gap-1.5">
                  {[25, 50, 75, 100, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handlePresetScale(pct)}
                      className={`rounded-lg px-2 py-1 text-[11px] font-semibold transition ${
                        resizePreset === pct
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-200/70 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
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
                    onChange={(e) => handleWidthChange(e.target.value)}
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
                      {lockAspectRatio ? (
                        <>
                          <Lock className="h-3 w-3" /> Aspect Ratio Locked
                        </>
                      ) : (
                        <>
                          <Unlock className="h-3 w-3" /> Free Aspect Ratio
                        </>
                      )}
                    </button>
                  </div>
                  <Input
                    type="number"
                    value={customHeight}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="Height in px"
                  />
                </div>
              </div>
            </div>

            {/* Background & Grayscale Options */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={grayscale}
                  onChange={(e) => setGrayscale(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Convert to Black & White (Grayscale)</span>
              </label>

              {(targetFormat === 'jpg' || targetFormat === 'jpeg') && (
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Palette className="h-3.5 w-3.5 text-indigo-500" />
                  <span>Matte Color:</span>
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
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action Convert Button */}
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleConvert}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto min-w-[240px] py-4 text-base font-bold shadow-lg shadow-indigo-500/20"
            >
              Convert to {targetFormat.toUpperCase()} Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
