/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  EyeOff,
  Sparkles,
  Download,
  Trash2,
  Undo2,
  Redo2,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Square,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Layers,
  Zap,
  Info,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn } from '@/lib/utils';

interface ImageRedactComponentProps {
  tool?: ToolMetadata;
}

export type RedactMode = 'pixelate' | 'blur' | 'blackout' | 'whiteout';

export interface RedactZone {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  mode: RedactMode;
  intensity: number; // e.g. pixel block size (8, 16, 24) or blur radius (10, 20)
}

const SAMPLE_IMAGES = [
  {
    id: 'cnic-sample',
    title: 'Identity & ID Card Document',
    desc: 'Sample CNIC / Passport with sensitive names & numbers',
    url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
  },
  {
    id: 'credit-card',
    title: 'Financial Invoice & Payment Receipt',
    desc: 'Credit card numbers and confidential banking information',
    url: 'https://images.unsplash.com/photo-1554415707-9e4966a604f7?w=800&q=80',
  },
];

export const ImageRedactComponent: React.FC<ImageRedactComponentProps> = ({ tool }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeMode, setActiveMode] = useState<RedactMode>('pixelate');
  const [intensity, setIntensity] = useState<number>(16);
  const [zones, setZones] = useState<RedactZone[]>([]);
  const [history, setHistory] = useState<RedactZone[][]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Zoom & Viewport
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setSourceImage(url);
    setZones([]);
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  const loadSample = (sample: typeof SAMPLE_IMAGES[0]) => {
    setSelectedFile(null);
    setSourceImage(sample.url);
    setZones([]);
    setHistory([]);
    setHistoryIndex(-1);
  };

  // Push to undo history
  const pushHistory = useCallback((newZones: RedactZone[]) => {
    setHistory((prev) => {
      const updated = prev.slice(0, historyIndex + 1);
      return [...updated, newZones];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      const prevZones = history[historyIndex - 1];
      setZones(prevZones);
      setHistoryIndex(historyIndex - 1);
    } else if (historyIndex === 0) {
      setZones([]);
      setHistoryIndex(-1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextZones = history[historyIndex + 1];
      setZones(nextZones);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const clearAllZones = () => {
    if (zones.length === 0) return;
    pushHistory([]);
    setZones([]);
  };

  // Render canvas with redaction zones
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw base original image
    ctx.drawImage(img, 0, 0);

    // Render each redaction zone
    zones.forEach((zone) => {
      const { x, y, width, height, mode, intensity: intVal } = zone;
      if (width <= 0 || height <= 0) return;

      if (mode === 'blackout') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, y, width, height);
      } else if (mode === 'whiteout') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x, y, width, height);
      } else if (mode === 'pixelate') {
        // Pixelation effect
        const blockSize = Math.max(4, intVal);
        const zoneData = ctx.getImageData(x, y, width, height);
        const data = zoneData.data;

        for (let py = 0; py < height; py += blockSize) {
          for (let px = 0; px < width; px += blockSize) {
            // Calculate average color in block
            let r = 0,
              g = 0,
              b = 0,
              count = 0;

            for (let dy = 0; dy < blockSize && py + dy < height; dy++) {
              for (let dx = 0; dx < blockSize && px + dx < width; dx++) {
                const idx = ((py + dy) * width + (px + dx)) * 4;
                r += data[idx];
                g += data[idx + 1];
                b += data[idx + 2];
                count++;
              }
            }

            if (count > 0) {
              r = Math.round(r / count);
              g = Math.round(g / count);
              b = Math.round(b / count);

              // Fill block
              for (let dy = 0; dy < blockSize && py + dy < height; dy++) {
                for (let dx = 0; dx < blockSize && px + dx < width; dx++) {
                  const idx = ((py + dy) * width + (px + dx)) * 4;
                  data[idx] = r;
                  data[idx + 1] = g;
                  data[idx + 2] = b;
                }
              }
            }
          }
        }
        ctx.putImageData(zoneData, x, y);
      } else if (mode === 'blur') {
        // Multi-pass blur simulation
        const blurRadius = Math.max(4, intVal);
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');

        if (tempCtx) {
          tempCtx.filter = `blur(${blurRadius / 2}px)`;
          tempCtx.drawImage(canvas, x, y, width, height, 0, 0, width, height);
          ctx.drawImage(tempCanvas, x, y);
        }
      }
    });

    // Draw active drawing drag box overlay
    if (currentBox && currentBox.w > 0 && currentBox.h > 0) {
      ctx.strokeStyle = activeMode === 'blackout' ? '#f43f5e' : '#6366f1';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
      ctx.fillStyle =
        activeMode === 'blackout'
          ? 'rgba(0, 0, 0, 0.4)'
          : activeMode === 'whiteout'
          ? 'rgba(255, 255, 255, 0.5)'
          : 'rgba(99, 102, 241, 0.25)';
      ctx.fillRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
      ctx.setLineDash([]);
    }
  }, [zones, currentBox, activeMode]);

  // Load image element
  useEffect(() => {
    if (!sourceImage) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceImage;
    img.onload = () => {
      imageObjRef.current = img;
      renderCanvas();
    };
  }, [sourceImage, renderCanvas]);

  useEffect(() => {
    renderCanvas();
  }, [zones, currentBox, renderCanvas]);

  // Mouse interaction handlers
  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);
    setIsDrawing(true);
    setStartPos(coords);
    setCurrentBox({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPos) return;
    const coords = getCanvasCoordinates(e);

    const x = Math.min(startPos.x, coords.x);
    const y = Math.min(startPos.y, coords.y);
    const w = Math.abs(coords.x - startPos.x);
    const h = Math.abs(coords.y - startPos.y);

    setCurrentBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox || currentBox.w < 6 || currentBox.h < 6) {
      setIsDrawing(false);
      setCurrentBox(null);
      return;
    }

    const newZone: RedactZone = {
      id: `zone-${Date.now()}`,
      x: currentBox.x,
      y: currentBox.y,
      width: currentBox.w,
      height: currentBox.h,
      mode: activeMode,
      intensity: intensity,
    };

    const updated = [...zones, newZone];
    setZones(updated);
    pushHistory(updated);

    setIsDrawing(false);
    setCurrentBox(null);
  };

  const deleteZone = (id: string) => {
    const updated = zones.filter((z) => z.id !== id);
    setZones(updated);
    pushHistory(updated);
  };

  const downloadRedactedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const baseName = selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'photo-redacted';
        link.download = `${baseName}-censor-blurred.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, 'image/png');
  };

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-purple-50/50 p-6 sm:p-8 dark:border-rose-950/60 dark:bg-gradient-to-br dark:from-rose-950/20 dark:via-slate-900/60 dark:to-purple-950/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-900/60 dark:text-rose-300">
                <EyeOff className="h-3.5 w-3.5" />
                Image Redactor & Censor Studio
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Irreversible Pixel Flattening
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tool?.name || 'Image Redactor & Face Blurring Tool'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Selectively blur, pixelate, or black out confidential CNIC numbers, faces, credit card details, and sensitive signatures on screenshots and photos.
            </p>
          </div>

          <PrivacyAssuranceBadge />
        </div>

        {/* Demo Preset Selector */}
        <div className="mt-6 pt-6 border-t border-rose-100/80 dark:border-rose-900/40 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Need a test document? Load an instant demo:
          </p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_IMAGES.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant="outline"
                onClick={() => loadSample(s)}
                leftIcon={<Zap className="h-3.5 w-3.5 text-rose-600" />}
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
        acceptedFormatsText="Drop ID scans, screenshots, contracts, PNG, JPG, or WebP"
        className="min-h-[140px]"
      />

      {/* Main Interactive Studio */}
      {sourceImage && (
        <div className="space-y-6">
          {/* Censor Toolbar Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            {/* Redaction Mode Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
                Censor Tool:
              </span>
              <button
                onClick={() => setActiveMode('pixelate')}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold rounded-xl transition',
                  activeMode === 'pixelate'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                Pixelate (Mosaic)
              </button>
              <button
                onClick={() => setActiveMode('blur')}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold rounded-xl transition',
                  activeMode === 'blur'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                Smooth Blur
              </button>
              <button
                onClick={() => setActiveMode('blackout')}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold rounded-xl transition',
                  activeMode === 'blackout'
                    ? 'bg-slate-900 text-white ring-2 ring-rose-500 dark:bg-black'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                Blackout Bar
              </button>
              <button
                onClick={() => setActiveMode('whiteout')}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold rounded-xl transition',
                  activeMode === 'whiteout'
                    ? 'bg-white text-slate-900 border border-slate-300 shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                Whiteout Bar
              </button>
            </div>

            {/* Undo / Redo / Clear Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex < 0}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                title="Redo"
              >
                <Redo2 className="h-4 w-4" />
              </button>
              <button
                onClick={clearAllZones}
                disabled={zones.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-40 dark:bg-rose-950/50 dark:text-rose-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Clear All
              </button>
            </div>
          </div>

          {/* Canvas Viewport Area */}
          <div className="relative overflow-auto rounded-3xl border border-slate-200 bg-slate-950 p-6 dark:border-slate-800 shadow-inner flex items-center justify-center min-h-[460px]">
            <div className="relative inline-block cursor-crosshair select-none">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className="max-w-full rounded-xl shadow-2xl transition-transform"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              />
            </div>
          </div>

          {/* Quick Guide & Download Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {zones.length} Active Redaction Zone{zones.length === 1 ? '' : 's'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click & drag anywhere on the image to place censor boxes. Exported pixels are completely flat and non-recoverable.
              </p>
            </div>

            <Button
              variant="gradient"
              size="lg"
              onClick={downloadRedactedImage}
              leftIcon={<Download className="h-4 w-4" />}
              className="w-full sm:w-auto"
            >
              Download Redacted Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
