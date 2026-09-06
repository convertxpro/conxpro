/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { ToolMetadata } from '@/config/categories';
import { formatBytes } from '@/lib/utils';
import JSZip from 'jszip';
import {
  Stamp,
  Image as ImageIcon,
  Type,
  Sparkles,
  Download,
  RotateCcw,
  Sliders,
  Grid,
  Layers,
  Palette,
  ShieldCheck,
  Check,
  AlertCircle,
  Trash2,
  Plus,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  FileArchive,
  RefreshCw,
} from 'lucide-react';

interface BatchWatermarkerComponentProps {
  tool?: ToolMetadata;
}

export type WatermarkMode = 'text' | 'logo';
export type AnchorPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface BatchItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  processedBlob?: Blob;
  processedUrl?: string;
}

const TEXT_PRESETS = [
  'CONFIDENTIAL',
  'COPYRIGHT © 2026',
  'DRAFT',
  'SAMPLE',
  'DO NOT DISTRIBUTE',
  'PROTOTYPE',
];

const FONT_FAMILIES = [
  { label: 'Inter / Modern Sans', value: 'Inter, sans-serif' },
  { label: 'Impact (Heavy Viral)', value: 'Impact, sans-serif' },
  { label: 'Arial (Clean Standard)', value: 'Arial, sans-serif' },
  { label: 'Georgia (Editorial Serif)', value: 'Georgia, serif' },
  { label: 'Courier New (Monospace)', value: '"Courier New", monospace' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
];

export const BatchWatermarkerComponent: React.FC<BatchWatermarkerComponentProps> = ({ tool }) => {
  // Batch files list
  const [items, setItems] = useState<BatchItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Watermark type
  const [watermarkMode, setWatermarkMode] = useState<WatermarkMode>('text');

  // Text watermark state
  const [watermarkText, setWatermarkText] = useState<string>('ApexTools © 2026');
  const [fontFamily, setFontFamily] = useState<string>('Inter, sans-serif');
  const [fontSizeRatio, setFontSizeRatio] = useState<number>(5); // percent of image width
  const [textColor, setTextColor] = useState<string>('#ffffff');
  const [textOpacity, setTextOpacity] = useState<number>(75); // 10% - 100%
  const [rotationAngle, setRotationAngle] = useState<number>(-30); // -90 to +90
  const [enableStroke, setEnableStroke] = useState<boolean>(true);
  const [strokeColor, setStrokeColor] = useState<string>('#000000');

  // Logo watermark state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoImage, setLogoImage] = useState<HTMLImageElement | null>(null);
  const [logoScale, setLogoScale] = useState<number>(20); // percent of image width
  const [logoOpacity, setLogoOpacity] = useState<number>(85);
  const [logoRotation, setLogoRotation] = useState<number>(0);

  // Position & Layout
  const [anchor, setAnchor] = useState<AnchorPosition>('bottom-right');
  const [marginPercent, setMarginPercent] = useState<number>(4);
  const [isTiled, setIsTiled] = useState<boolean>(false);
  const [tileDensity, setTileDensity] = useState<number>(3); // 2 - 6 grid density

  // Output settings
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [outputQuality, setOutputQuality] = useState<number>(92); // 60 - 100

  // Batch execution state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedCount, setProcessedCount] = useState<number>(0);
  const [zipBlobUrl, setZipBlobUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Preview canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Add files to batch
  const handleFilesAdded = useCallback((files: File[]) => {
    if (!files || files.length === 0) return;

    const newItems: BatchItem[] = [];
    let loadedCount = 0;

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: url,
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
        });
        loadedCount++;
        if (loadedCount === files.length) {
          setItems((prev) => [...prev, ...newItems]);
          setErrorMessage(null);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === files.length && newItems.length > 0) {
          setItems((prev) => [...prev, ...newItems]);
        }
      };
      img.src = url;
    });
  }, []);

  // Handle logo upload
  const handleLogoUpload = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setLogoFile(file);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setLogoImage(img);
    };
    img.src = url;
  };

  // Remove single item
  const handleRemoveItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id);
      if (selectedIndex >= filtered.length) {
        setSelectedIndex(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
  };

  // Clear all items
  const handleClearAll = () => {
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    if (zipBlobUrl) URL.revokeObjectURL(zipBlobUrl);
    setItems([]);
    setSelectedIndex(0);
    setZipBlobUrl(null);
    setProcessedCount(0);
  };

  // Draw watermark on a canvas for a given image
  const drawWatermark = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      img: CanvasImageSource,
      imgWidth: number,
      imgHeight: number
    ) => {
      // 1. Draw base image
      ctx.clearRect(0, 0, imgWidth, imgHeight);
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight);

      // 2. Draw Tiled Pattern or Single Anchored Watermark
      if (isTiled) {
        ctx.save();
        const angleRad = (rotationAngle * Math.PI) / 180;
        const alpha = (watermarkMode === 'text' ? textOpacity : logoOpacity) / 100;
        ctx.globalAlpha = alpha;

        const cellW = imgWidth / tileDensity;
        const cellH = imgHeight / tileDensity;

        if (watermarkMode === 'text') {
          const fontSize = Math.max(12, Math.round((imgWidth * (fontSizeRatio / 100)) * 0.7));
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          for (let x = 0; x < imgWidth + cellW; x += cellW) {
            for (let y = 0; y < imgHeight + cellH; y += cellH) {
              ctx.save();
              ctx.translate(x + cellW / 2, y + cellH / 2);
              ctx.rotate(angleRad);

              if (enableStroke) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = Math.max(1, Math.round(fontSize * 0.08));
                ctx.strokeText(watermarkText, 0, 0);
              }

              ctx.fillStyle = textColor;
              ctx.fillText(watermarkText, 0, 0);
              ctx.restore();
            }
          }
        } else if (watermarkMode === 'logo' && logoImage) {
          const targetLogoW = (imgWidth * (logoScale / 100)) * 0.6;
          const targetLogoH = targetLogoW * (logoImage.naturalHeight / logoImage.naturalWidth);

          for (let x = 0; x < imgWidth + cellW; x += cellW) {
            for (let y = 0; y < imgHeight + cellH; y += cellH) {
              ctx.save();
              ctx.translate(x + cellW / 2, y + cellH / 2);
              ctx.rotate((logoRotation * Math.PI) / 180);
              ctx.drawImage(
                logoImage,
                -targetLogoW / 2,
                -targetLogoH / 2,
                targetLogoW,
                targetLogoH
              );
              ctx.restore();
            }
          }
        }
        ctx.restore();
      } else {
        // Single anchored placement
        ctx.save();
        const marginX = imgWidth * (marginPercent / 100);
        const marginY = imgHeight * (marginPercent / 100);

        let anchorX = marginX;
        let anchorY = marginY;
        let alignH: CanvasTextAlign = 'left';
        let alignV: CanvasTextBaseline = 'top';

        if (anchor.includes('left')) {
          anchorX = marginX;
          alignH = 'left';
        } else if (anchor.includes('right')) {
          anchorX = imgWidth - marginX;
          alignH = 'right';
        } else {
          anchorX = imgWidth / 2;
          alignH = 'center';
        }

        if (anchor.includes('top')) {
          anchorY = marginY;
          alignV = 'top';
        } else if (anchor.includes('bottom')) {
          anchorY = imgHeight - marginY;
          alignV = 'bottom';
        } else {
          anchorY = imgHeight / 2;
          alignV = 'middle';
        }

        ctx.translate(anchorX, anchorY);

        if (watermarkMode === 'text') {
          const angleRad = (rotationAngle * Math.PI) / 180;
          ctx.rotate(angleRad);
          ctx.globalAlpha = textOpacity / 100;

          const fontSize = Math.max(12, Math.round(imgWidth * (fontSizeRatio / 100)));
          ctx.font = `bold ${fontSize}px ${fontFamily}`;
          ctx.textAlign = alignH;
          ctx.textBaseline = alignV;

          if (enableStroke) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = Math.max(1, Math.round(fontSize * 0.08));
            ctx.strokeText(watermarkText, 0, 0);
          }

          ctx.fillStyle = textColor;
          ctx.fillText(watermarkText, 0, 0);
        } else if (watermarkMode === 'logo' && logoImage) {
          ctx.rotate((logoRotation * Math.PI) / 180);
          ctx.globalAlpha = logoOpacity / 100;

          const targetLogoW = imgWidth * (logoScale / 100);
          const targetLogoH = targetLogoW * (logoImage.naturalHeight / logoImage.naturalWidth);

          let drawX = 0;
          let drawY = 0;

          if (alignH === 'right') drawX = -targetLogoW;
          else if (alignH === 'center') drawX = -targetLogoW / 2;

          if (alignV === 'bottom') drawY = -targetLogoH;
          else if (alignV === 'middle') drawY = -targetLogoH / 2;

          ctx.drawImage(logoImage, drawX, drawY, targetLogoW, targetLogoH);
        }

        ctx.restore();
      }
    },
    [
      isTiled,
      rotationAngle,
      watermarkMode,
      textOpacity,
      logoOpacity,
      tileDensity,
      fontSizeRatio,
      fontFamily,
      enableStroke,
      strokeColor,
      watermarkText,
      textColor,
      logoImage,
      logoScale,
      logoRotation,
      marginPercent,
      anchor,
    ]
  );

  // Render live preview on canvas for selected item
  useEffect(() => {
    if (items.length === 0 || !items[selectedIndex]) return;
    const item = items[selectedIndex];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      drawWatermark(ctx, img, img.naturalWidth, img.naturalHeight);
    };
    img.src = item.previewUrl;
  }, [items, selectedIndex, drawWatermark]);

  // Execute Batch Watermarking on all items
  const handleProcessBatch = async () => {
    if (items.length === 0) {
      setErrorMessage('Please upload at least one image to watermark.');
      return;
    }
    if (watermarkMode === 'logo' && !logoImage) {
      setErrorMessage('Please upload a logo image first.');
      return;
    }

    setIsProcessing(true);
    setProcessedCount(0);
    setErrorMessage(null);

    try {
      const zip = new JSZip();
      const updatedItems = [...items];
      const offscreenCanvas = document.createElement('canvas');
      const ctx = offscreenCanvas.getContext('2d');

      if (!ctx) throw new Error('Could not create Canvas context.');

      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            offscreenCanvas.width = img.naturalWidth;
            offscreenCanvas.height = img.naturalHeight;
            drawWatermark(ctx, img, img.naturalWidth, img.naturalHeight);

            offscreenCanvas.toBlob(
              (blob) => {
                if (blob) {
                  const ext = outputFormat === 'image/png' ? 'png' : outputFormat === 'image/webp' ? 'webp' : 'jpg';
                  const baseName = item.file.name.replace(/\.[^/.]+$/, '');
                  const targetName = `watermarked_${baseName}.${ext}`;

                  zip.file(targetName, blob);
                  const processedUrl = URL.createObjectURL(blob);
                  updatedItems[i] = {
                    ...updatedItems[i],
                    processedBlob: blob,
                    processedUrl,
                  };
                }
                setProcessedCount(i + 1);
                resolve();
              },
              outputFormat,
              outputQuality / 100
            );
          };
          img.onerror = () => reject(new Error(`Failed to load image: ${item.file.name}`));
          img.src = item.previewUrl;
        });
      }

      setItems(updatedItems);

      // Generate zip archive
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const zipUrl = URL.createObjectURL(zipBlob);
      setZipBlobUrl(zipUrl);
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Batch processing error:', err);
      setErrorMessage(err?.message || 'Error processing batch images.');
      setIsProcessing(false);
    }
  };

  const selectedItem = items[selectedIndex];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 border border-amber-500/20 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-amber-500 text-slate-950">
                Phase 4 Creator Suite
              </span>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-900/60 dark:bg-slate-800/80 text-slate-300 border border-slate-700/50">
                Batch Canvas Engine (50+ Files)
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Stamp className="w-8 h-8 text-amber-500" />
              Batch Image Watermarker
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Apply customizable text or transparent logo watermarks to 50+ photos simultaneously with 9-point grid positioning, angle rotation, tiled repeat patterns, and instant ZIP download.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <PrivacyAssuranceBadge variant="compact" customTitle="100% Private (Browser-Only)" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Upload Dropzone (if empty) */}
      {items.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <Dropzone
            onFilesSelected={handleFilesAdded}
            accept="image/*,.jpg,.jpeg,.png,.webp,.svg"
            multiple={true}
            maxSizeMb={50}
            acceptedFormatsText="Upload up to 50+ photos (JPG, PNG, WebP) to watermark at once"
          />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Batch Strip & Controls Header */}
          <div className="p-4 md:p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
                {items.length} Images in Batch
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Active: <strong className="text-slate-900 dark:text-white">{selectedItem?.file.name}</strong> ({selectedItem?.width}×{selectedItem?.height}px)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <label className="cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) handleFilesAdded(Array.from(e.target.files));
                  }}
                  className="hidden"
                />
                <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Add More Photos
                </Button>
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Thumbnail Carousel Bar */}
          <div className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin">
            {items.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedIndex(idx)}
                  className={`relative shrink-0 w-24 h-24 rounded-2xl overflow-hidden cursor-pointer border-2 transition-all group ${
                    isSelected
                      ? 'border-amber-500 ring-4 ring-amber-500/20 shadow-lg scale-105'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={item.processedUrl || item.previewUrl}
                    alt={item.file.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                    #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveItem(item.id, e)}
                    className="absolute top-1 right-1 p-1 rounded-full bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {item.processedUrl && (
                    <span className="absolute top-1 left-1 p-0.5 rounded-full bg-emerald-500 text-white">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Studio Workspace: Canvas Preview (Left) + Controls (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Live Canvas Preview Card */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden">
              <div className="w-full flex justify-between items-center mb-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-amber-500" />
                  Live Real-Time Watermark Preview
                </span>
                <span className="font-mono text-[11px]">
                  {selectedItem?.width} × {selectedItem?.height} px
                </span>
              </div>

              <div className="max-w-full max-h-[440px] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl bg-slate-950 p-2 border border-slate-800">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-[400px] object-contain rounded-lg shadow-inner"
                />
              </div>

              <span className="text-[11px] text-slate-500 mt-3 text-center">
                Watermark updates automatically across all batch items upon processing.
              </span>
            </div>

            {/* Right: Studio Controls Panel */}
            <div className="lg:col-span-5 space-y-6">
              {/* Type Switcher */}
              <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex">
                <button
                  type="button"
                  onClick={() => setWatermarkMode('text')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    watermarkMode === 'text'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Type className="w-4 h-4 text-amber-500" />
                  Text Watermark
                </button>
                <button
                  type="button"
                  onClick={() => setWatermarkMode('logo')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    watermarkMode === 'logo'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 text-amber-500" />
                  Logo Image Watermark
                </button>
              </div>

              {/* Text Watermark Controls */}
              {watermarkMode === 'text' ? (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Watermark Text</label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full mt-1.5 px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="e.g. Copyright © 2026"
                    />
                  </div>

                  {/* Preset Chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {TEXT_PRESETS.map((txt) => (
                      <button
                        key={txt}
                        type="button"
                        onClick={() => setWatermarkText(txt)}
                        className="px-2 py-1 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                      >
                        {txt}
                      </button>
                    ))}
                  </div>

                  {/* Typography & Size */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Font</label>
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="w-full mt-1 px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                      >
                        {FONT_FAMILIES.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">Size</span>
                        <span className="text-amber-500 font-mono">{fontSizeRatio}%</span>
                      </div>
                      <input
                        type="range"
                        min={1}
                        max={16}
                        value={fontSizeRatio}
                        onChange={(e) => setFontSizeRatio(parseInt(e.target.value, 10))}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>
                  </div>

                  {/* Color, Opacity & Rotation */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Color</label>
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">Opacity</span>
                        <span className="text-amber-500 font-mono">{textOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={textOpacity}
                        onChange={(e) => setTextOpacity(parseInt(e.target.value, 10))}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">Angle</span>
                        <span className="text-amber-500 font-mono">{rotationAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min={-90}
                        max={90}
                        value={rotationAngle}
                        onChange={(e) => setRotationAngle(parseInt(e.target.value, 10))}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Logo Watermark Controls */
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Upload Logo (PNG/SVG with Transparency)</label>
                    <div className="mt-2">
                      <Dropzone
                        onFilesSelected={handleLogoUpload}
                        accept="image/*,.png,.svg,.jpg,.webp"
                        multiple={false}
                        maxSizeMb={20}
                        acceptedFormatsText="Transparent PNG recommended"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">Logo Scale</span>
                        <span className="text-amber-500 font-mono">{logoScale}%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={60}
                        value={logoScale}
                        onChange={(e) => setLogoScale(parseInt(e.target.value, 10))}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">Opacity</span>
                        <span className="text-amber-500 font-mono">{logoOpacity}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={100}
                        value={logoOpacity}
                        onChange={(e) => setLogoOpacity(parseInt(e.target.value, 10))}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Position & Anchor Grid */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-amber-500" />
                    Positioning & Layout
                  </h4>

                  {/* Tile Toggle */}
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isTiled}
                      onChange={(e) => setIsTiled(e.target.checked)}
                      className="rounded accent-amber-500 w-4 h-4"
                    />
                    Tile Diagonal Pattern
                  </label>
                </div>

                {!isTiled ? (
                  <div className="grid grid-cols-2 gap-6 items-center">
                    {/* 9-point radio grid */}
                    <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                      {(
                        [
                          'top-left',
                          'top-center',
                          'top-right',
                          'center-left',
                          'center',
                          'center-right',
                          'bottom-left',
                          'bottom-center',
                          'bottom-right',
                        ] as AnchorPosition[]
                      ).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setAnchor(pos)}
                          className={`w-9 h-9 rounded-xl border transition-all flex items-center justify-center ${
                            anchor === pos
                              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 hover:border-slate-400'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${anchor === pos ? 'bg-slate-950' : 'bg-slate-400'}`} />
                        </button>
                      ))}
                    </div>

                    {/* Margin Slider */}
                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">Edge Margin</span>
                        <span className="text-amber-500 font-mono">{marginPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={15}
                        value={marginPercent}
                        onChange={(e) => setMarginPercent(parseInt(e.target.value, 10))}
                        className="w-full mt-2 accent-amber-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">Tile Grid Density</span>
                      <span className="text-amber-500 font-mono">{tileDensity}×{tileDensity}</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={6}
                      value={tileDensity}
                      onChange={(e) => setTileDensity(parseInt(e.target.value, 10))}
                      className="w-full mt-2 accent-amber-500"
                    />
                  </div>
                )}
              </div>

              {/* Output Settings */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Target Output Format:</span>
                  <div className="flex gap-1.5">
                    {(
                      [
                        { id: 'image/jpeg', label: 'JPG' },
                        { id: 'image/png', label: 'PNG' },
                        { id: 'image/webp', label: 'WebP' },
                      ] as const
                    ).map((fmt) => (
                      <button
                        key={fmt.id}
                        type="button"
                        onClick={() => setOutputFormat(fmt.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          outputFormat === fmt.id
                            ? 'bg-amber-500 text-slate-950 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Batch Progress */}
              {isProcessing ? (
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-center">
                  <ProgressBar
                    progress={Math.round((processedCount / items.length) * 100)}
                    label={`Watermarking Image ${processedCount} of ${items.length}...`}
                  />
                </div>
              ) : zipBlobUrl ? (
                <div className="space-y-3 animate-fadeIn">
                  <a
                    href={zipBlobUrl}
                    download="watermarked_images.zip"
                    className="block w-full"
                  >
                    <Button
                      variant="gradient"
                      size="lg"
                      className="w-full py-4 text-base font-bold shadow-xl shadow-amber-500/25"
                      leftIcon={<FileArchive className="w-5 h-5" />}
                    >
                      Download All as ZIP Archive ({items.length} Photos)
                    </Button>
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleProcessBatch}
                    leftIcon={<RefreshCw className="w-4 h-4" />}
                  >
                    Re-apply Watermark with New Settings
                  </Button>
                </div>
              ) : (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleProcessBatch}
                  className="w-full py-4 text-base font-bold shadow-xl shadow-amber-500/25"
                  leftIcon={<Stamp className="w-5 h-5" />}
                >
                  Apply Watermark to All {items.length} Photos
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
