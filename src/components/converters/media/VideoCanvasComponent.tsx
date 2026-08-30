/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { MediaProcessingView } from '@/components/conversion/MediaProcessingView';
import { formatBytes } from '@/lib/utils';
import {
  Film,
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  Smartphone,
  Monitor,
  Square,
  Image as ImageIcon,
  CheckCircle2,
  Sliders,
  Maximize2,
  Zap,
  Info,
  Check,
  Copy,
  Scissors,
  Layers,
  Palette,
  ShieldCheck,
  AlertCircle,
  Video,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

export type AspectRatioPreset = '9:16' | '16:9' | '1:1' | '4:5';
export type BackgroundStyle = 'blur' | 'black' | 'white' | 'color' | 'crop';

export interface VideoCanvasComponentProps {
  initialMode?: 'social-resizer' | 'gif-to-video';
  initialToolSlug?: string;
}

const PRESETS: {
  id: AspectRatioPreset;
  name: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  ratio: string;
  width: number;
  height: number;
  previewAspect: string;
}[] = [
  {
    id: '9:16',
    name: '9:16 Vertical',
    sub: 'TikTok, Reels, Shorts',
    icon: Smartphone,
    ratio: '9:16',
    width: 1080,
    height: 1920,
    previewAspect: 'aspect-[9/16] max-h-[380px]',
  },
  {
    id: '16:9',
    name: '16:9 Landscape',
    sub: 'YouTube, Desktop Widescreen',
    icon: Monitor,
    ratio: '16:9',
    width: 1920,
    height: 1080,
    previewAspect: 'aspect-[16/9] max-w-[500px]',
  },
  {
    id: '1:1',
    name: '1:1 Square',
    sub: 'Instagram Feed, Facebook',
    icon: Square,
    ratio: '1:1',
    width: 1080,
    height: 1080,
    previewAspect: 'aspect-square max-h-[340px]',
  },
  {
    id: '4:5',
    name: '4:5 Portrait',
    sub: 'Instagram Feed Post',
    icon: ImageIcon,
    ratio: '4:5',
    width: 1080,
    height: 1350,
    previewAspect: 'aspect-[4/5] max-h-[360px]',
  },
];

const BACKGROUND_OPTIONS: {
  id: BackgroundStyle;
  label: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: 'blur',
    label: 'Blurred Mirror',
    desc: 'Smart aesthetic video backdrop blur',
    icon: '✨',
  },
  {
    id: 'crop',
    label: 'Center Crop',
    desc: 'Fill frame without padding',
    icon: '✂️',
  },
  {
    id: 'black',
    label: 'Black Letterbox',
    desc: 'Classic cinema-style padding',
    icon: '⬛',
  },
  {
    id: 'white',
    label: 'White Border',
    desc: 'Clean minimal border styling',
    icon: '⬜',
  },
  {
    id: 'color',
    label: 'Custom Color',
    desc: 'Branded background backdrop',
    icon: '🎨',
  },
];

const COLOR_SWATCHES = [
  '#0f172a',
  '#1e1b4b',
  '#312e81',
  '#064e3b',
  '#701a75',
  '#831843',
  '#18181b',
];

export const VideoCanvasComponent: React.FC<VideoCanvasComponentProps> = ({
  initialMode,
  initialToolSlug = 'video-aspect-ratio-resizer',
}) => {
  // Determine mode
  const mode =
    initialMode ||
    (initialToolSlug === 'gif-to-mp4' || initialToolSlug === 'gif-to-webm'
      ? 'gif-to-video'
      : 'social-resizer');

  // File and state management
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'configured' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Social Canvas Resizer Options
  const [preset, setPreset] = useState<AspectRatioPreset>('9:16');
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('blur');
  const [customColorHex, setCustomColorHex] = useState<string>('#0f172a');

  // GIF to Video Options
  const [targetFormat, setTargetFormat] = useState<'mp4' | 'webm'>(
    initialToolSlug === 'gif-to-webm' ? 'webm' : 'mp4'
  );
  const [qualityCrf, setQualityCrf] = useState<number>(23);
  const [fpsLimit, setFpsLimit] = useState<number | undefined>(undefined);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setStatus('configured');
    setErrorMessage(null);
    setConversionResult(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setStatus('processing');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      if (mode === 'gif-to-video') {
        formData.append('toolType', targetFormat === 'webm' ? 'gif-to-webm' : 'gif-to-mp4');
        formData.append('targetFormat', targetFormat);
        const options: Record<string, any> = {
          qualityCrf,
        };
        if (fpsLimit) options.fps = fpsLimit;
        formData.append('options', JSON.stringify(options));
      } else {
        formData.append('toolType', 'video-aspect-ratio-resizer');
        formData.append('targetFormat', 'mp4');
        const options: Record<string, any> = {
          preset,
          backgroundStyle,
          customColorHex,
        };
        formData.append('options', JSON.stringify(options));
      }

      const response = await fetch('/api/convert/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.jobId) {
        throw new Error(data.error || 'Failed to start conversion job');
      }

      setActiveJobId(data.jobId);
    } catch (err: any) {
      console.error('Failed to submit conversion:', err);
      setErrorMessage(err.message || 'An error occurred while starting the conversion.');
      setStatus('error');
    }
  };

  const handleJobComplete = (result: any) => {
    setConversionResult(result);
    setStatus('completed');
  };

  const handleJobError = (err: string) => {
    setErrorMessage(err);
    setStatus('error');
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setStatus('idle');
    setErrorMessage(null);
    setActiveJobId(null);
    setConversionResult(null);
    setCopiedLink(false);
  };

  const handleCopyLink = () => {
    if (!conversionResult?.downloadUrl) return;
    const fullUrl = `${window.location.origin}${conversionResult.downloadUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const selectedPresetObj = PRESETS.find((p) => p.id === preset) || PRESETS[0];

  // Calculate size reduction percentage if completed
  let savingsPercent = 0;
  if (conversionResult && conversionResult.originalSizeBytes && conversionResult.convertedSizeBytes) {
    savingsPercent = Math.max(
      0,
      Math.round(
        ((conversionResult.originalSizeBytes - conversionResult.convertedSizeBytes) /
          conversionResult.originalSizeBytes) *
          100
      )
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner & Mode Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            {mode === 'gif-to-video' ? (
              <Film className="w-6 h-6" />
            ) : (
              <Maximize2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {mode === 'gif-to-video'
                ? 'High-Efficiency GIF ↔ MP4 / WebM Converter'
                : 'Social Media Canvas & Aspect Ratio Resizer'}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {mode === 'gif-to-video' ? '90%+ Size Reduction' : 'H.264 FastStart'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'gif-to-video'
                ? 'Convert heavy animated GIFs into lightweight 60fps MP4/WebM videos with instant mobile streaming.'
                : 'Reformat landscape 16:9 videos into 9:16 TikTok, Reels, Shorts, and 1:1 Square with blurred backdrops.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Zero Data Retention • 2-Hour Auto Delete
          </span>
        </div>
      </div>

      {/* 2. File Upload / Selection Area */}
      {status === 'idle' && (
        <div className="space-y-4">
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept={mode === 'gif-to-video' ? '.gif,image/gif' : 'video/*,.mp4,.mov,.webm,.mkv,.avi,.flv,.gif'}
            maxSizeMb={100}
            acceptedFormatsText={
              mode === 'gif-to-video'
                ? 'Supports .gif animated graphics up to 100 MB'
                : 'Supports MP4, MOV, WebM, MKV, AVI & animated GIFs up to 100 MB'
            }
          />

          {/* Quick Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left">
              <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs mb-1">
                <Zap className="w-4 h-4" />
                <span>90%+ Bandwidth Savings</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Replace 40MB GIFs with 2MB looping MP4 videos that load instantly on all smartphones.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left">
              <div className="flex items-center gap-2 text-indigo-500 font-semibold text-xs mb-1">
                <Smartphone className="w-4 h-4" />
                <span>TikTok & Reels Ready</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Intelligent blurred mirror background padding keeps your original video uncropped and centered.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-left">
              <div className="flex items-center gap-2 text-emerald-500 font-semibold text-xs mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Lossless Quality Standard</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Native FFmpeg multi-threaded rendering preserves crisp text and vibrant color gamuts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Configuration & Live Canvas Preview (When file is selected) */}
      {status === 'configured' && selectedFile && (
        <div className="space-y-6">
          {/* File summary pill */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatBytes(selectedFile.size)} • Ready for processing
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Choose Different File
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Interactive Settings Panel */}
            <div className="lg:col-span-7 space-y-6">
              {mode === 'social-resizer' ? (
                <>
                  {/* Aspect Ratio Preset Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>1. Select Target Social Aspect Ratio</span>
                      <span className="text-amber-500 font-mono text-[11px]">
                        {selectedPresetObj.width} × {selectedPresetObj.height} px
                      </span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                      {PRESETS.map((p) => {
                        const Icon = p.icon;
                        const isSelected = preset === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setPreset(p.id)}
                            className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-md ring-2 ring-amber-500/20'
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                <Icon className="w-5 h-5" />
                              </div>
                              {isSelected && (
                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {p.sub}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Background Style Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      2. Choose Canvas Background Style
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {BACKGROUND_OPTIONS.map((bg) => {
                        const isSelected = backgroundStyle === bg.id;
                        return (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() => setBackgroundStyle(bg.id)}
                            className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                              isSelected
                                ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-sm'
                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            <span className="text-xl">{bg.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {bg.label}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {bg.desc}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Color Palette Picker (When 'color' background selected) */}
                    {backgroundStyle === 'color' && (
                      <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5 animate-fadeIn">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Custom Backdrop Color:
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-500 uppercase">
                            {customColorHex}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {COLOR_SWATCHES.map((swatch) => (
                            <button
                              key={swatch}
                              type="button"
                              onClick={() => setCustomColorHex(swatch)}
                              style={{ backgroundColor: swatch }}
                              className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                                customColorHex.toLowerCase() === swatch.toLowerCase()
                                  ? 'border-amber-500 shadow-md scale-105'
                                  : 'border-transparent'
                              }`}
                              title={swatch}
                            />
                          ))}

                          {/* Native Color Picker */}
                          <div className="flex items-center gap-2 ml-auto">
                            <input
                              type="color"
                              value={customColorHex}
                              onChange={(e) => setCustomColorHex(e.target.value)}
                              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                            />
                            <input
                              type="text"
                              value={customColorHex}
                              onChange={(e) => setCustomColorHex(e.target.value)}
                              className="w-24 px-2 py-1 text-xs font-mono rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 uppercase"
                              placeholder="#000000"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* GIF to Video Controls */}
                  <div className="space-y-4">
                    {/* Target Format */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        1. Target Video Format
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTargetFormat('mp4')}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            targetFormat === 'mp4'
                              ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-md'
                              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold">MP4 (H.264 / AVC)</span>
                            {targetFormat === 'mp4' && (
                              <CheckCircle2 className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            100% universal playback on Apple iPhone, Safari, Android & Chrome.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTargetFormat('webm')}
                          className={`p-3.5 rounded-xl border text-left transition-all ${
                            targetFormat === 'webm'
                              ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-md'
                              : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold">WebM (VP9)</span>
                            {targetFormat === 'webm' && (
                              <CheckCircle2 className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Maximum compression for modern HTML5 web apps and Firefox/Edge.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Quality CRF Slider */}
                    <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-amber-500" />
                          <span>Quality Tuning (CRF: {qualityCrf})</span>
                        </label>
                        <span className="text-xs font-semibold text-amber-500">
                          {qualityCrf <= 20
                            ? 'High Quality / Lossless'
                            : qualityCrf <= 24
                            ? 'Balanced (Recommended)'
                            : 'Maximum Compression'}
                        </span>
                      </div>

                      <input
                        type="range"
                        min={18}
                        max={30}
                        step={1}
                        value={qualityCrf}
                        onChange={(e) => setQualityCrf(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />

                      <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                        <span>CRF 18 (Crisp)</span>
                        <span>CRF 23 (Default)</span>
                        <span>CRF 30 (Compact)</span>
                      </div>
                    </div>

                    {/* Frame Rate Clamp */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        Frame Rate (FPS)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { label: 'Original', val: undefined },
                          { label: '30 FPS', val: 30 },
                          { label: '24 FPS', val: 24 },
                          { label: '15 FPS', val: 15 },
                        ].map((item) => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setFpsLimit(item.val)}
                            className={`py-2 px-3 rounded-lg text-xs font-medium border transition-colors ${
                              fpsLimit === item.val
                                ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Button */}
              <Button
                variant="gradient"
                size="lg"
                className="w-full py-4 text-base font-bold shadow-lg shadow-amber-500/20"
                onClick={handleStartConversion}
                leftIcon={<Sparkles className="w-5 h-5" />}
              >
                {mode === 'gif-to-video'
                  ? `Convert GIF to ${targetFormat.toUpperCase()} Video`
                  : `Render Video to ${preset} Social Canvas`}
              </Button>
            </div>

            {/* Right Column: Live Simulated Preview Frame */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner relative overflow-hidden min-h-[380px]">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md text-[11px] font-mono text-slate-300 border border-white/10">
                <span>Preview: {mode === 'social-resizer' ? preset : 'Source'}</span>
              </div>

              {/* Simulated Frame Container */}
              <div
                className={`relative w-full flex items-center justify-center overflow-hidden rounded-xl border border-slate-800 ${
                  mode === 'social-resizer' ? selectedPresetObj.previewAspect : 'aspect-video max-h-[360px]'
                }`}
                style={{
                  backgroundColor:
                    mode === 'social-resizer' && backgroundStyle === 'color'
                      ? customColorHex
                      : mode === 'social-resizer' && backgroundStyle === 'white'
                      ? '#ffffff'
                      : '#000000',
                }}
              >
                {/* Simulated Blurred Background Layer */}
                {mode === 'social-resizer' && backgroundStyle === 'blur' && previewUrl && (
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {selectedFile.type.includes('gif') ? (
                      <img
                        src={previewUrl}
                        alt="Background blur"
                        className="w-full h-full object-cover scale-125 filter blur-xl opacity-70"
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover scale-125 filter blur-xl opacity-70"
                      />
                    )}
                  </div>
                )}

                {/* Foreground Video/GIF */}
                {previewUrl && (
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    {selectedFile.type.includes('gif') ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className={`max-w-full max-h-full ${
                          mode === 'social-resizer' && backgroundStyle === 'crop'
                            ? 'w-full h-full object-cover'
                            : 'object-contain'
                        }`}
                      />
                    ) : (
                      <video
                        src={previewUrl}
                        controls
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`max-w-full max-h-full ${
                          mode === 'social-resizer' && backgroundStyle === 'crop'
                            ? 'w-full h-full object-cover'
                            : 'object-contain'
                        }`}
                      />
                    )}
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mt-3 text-center">
                {mode === 'social-resizer'
                  ? `Simulated ${preset} output canvas with ${backgroundStyle} styling.`
                  : 'Interactive preview of uploaded animated GIF source.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Processing State View */}
      {status === 'processing' && activeJobId && selectedFile && (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <MediaProcessingView
            jobId={activeJobId}
            originalFilename={selectedFile.name}
            targetFormat={mode === 'gif-to-video' ? targetFormat : 'mp4'}
            toolType={mode === 'gif-to-video' ? 'gif-to-video' : 'video-aspect-ratio-resizer'}
            onComplete={handleJobComplete}
            onError={handleJobError}
          />
        </div>
      )}

      {/* 5. Completed Result State */}
      {status === 'completed' && conversionResult && (
        <div className="space-y-6 animate-fadeIn">
          {/* Success Banner */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Conversion Rendered Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Encoded with H.264 FastStart streaming headers and universal YUV420p color matrix.
                </p>
              </div>
            </div>

            {savingsPercent > 0 && (
              <span className="px-3 py-1.5 rounded-full bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 animate-bounce">
                🎉 -{savingsPercent}% Smaller File Size
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Output HTML5 Video Player */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden min-h-[360px]">
              <video
                src={conversionResult.downloadUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-w-full max-h-[440px] rounded-lg shadow-2xl object-contain"
              />
              <span className="text-[11px] font-mono text-slate-400 mt-2">
                Infinite Loop • Native HTML5 Video Stream
              </span>
            </div>

            {/* Right Action & Stats Box */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  File Metrics & Bandwidth Report
                </h4>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Output Filename:</span>
                    <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                      {conversionResult.targetFilename}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Original File Size:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {formatBytes(conversionResult.originalSizeBytes || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500">Converted Size:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {formatBytes(conversionResult.convertedSizeBytes || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Container / Codec:</span>
                    <span className="font-mono text-[11px] text-amber-500 font-semibold">
                      {conversionResult.format?.toUpperCase() || 'MP4'} (H.264/AAC)
                    </span>
                  </div>
                </div>

                {/* Main Download Button */}
                <a
                  href={conversionResult.downloadUrl}
                  download={conversionResult.targetFilename}
                  className="block w-full"
                >
                  <Button
                    variant="gradient"
                    size="lg"
                    className="w-full py-3.5 text-base font-bold shadow-lg shadow-amber-500/25"
                    leftIcon={<Download className="w-5 h-5" />}
                  >
                    Download {conversionResult.format?.toUpperCase() || 'Video'}
                  </Button>
                </a>

                {/* Secondary Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyLink}
                    leftIcon={
                      copiedLink ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {copiedLink ? 'Link Copied!' : 'Copy Link'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Convert Another
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Next Best Actions */}
          <NextActionRecommendations
            currentSlug={initialToolSlug || (mode === 'gif-to-video' ? 'gif-to-mp4' : 'video-aspect-ratio-resizer')}
            categorySlug="video"
          />
        </div>
      )}

      {/* 6. Error State */}
      {status === 'error' && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <div className="inline-flex p-3 rounded-full bg-rose-500/20 text-rose-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-rose-600 dark:text-rose-400">
            Conversion Process Failed
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {errorMessage || 'Unable to transcode media file. Please ensure the file is not corrupted.'}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
