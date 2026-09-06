/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { MediaProcessingView } from '@/components/conversion/MediaProcessingView';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { ToolMetadata } from '@/config/categories';
import { formatBytes } from '@/lib/utils';
import {
  Maximize2,
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
  Zap,
  Check,
  Copy,
  Palette,
  AlertCircle,
  Film,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

export type AspectRatioPreset = '9:16' | '16:9' | '1:1' | '4:5';
export type BackgroundStyle = 'blur' | 'black' | 'white' | 'color' | 'crop';

interface VideoResizerComponentProps {
  tool?: ToolMetadata;
}

const PRESETS: {
  id: AspectRatioPreset;
  name: string;
  sub: string;
  icon: React.ComponentType<{ className?: string }>;
  ratio: string;
  width: number;
  height: number;
  previewClass: string;
}[] = [
  {
    id: '9:16',
    name: '9:16 Vertical',
    sub: 'TikTok, Reels, Shorts',
    icon: Smartphone,
    ratio: '9:16',
    width: 1080,
    height: 1920,
    previewClass: 'aspect-[9/16] max-h-[380px]',
  },
  {
    id: '16:9',
    name: '16:9 Landscape',
    sub: 'YouTube, Desktop TV',
    icon: Monitor,
    ratio: '16:9',
    width: 1920,
    height: 1080,
    previewClass: 'aspect-[16/9] max-w-[480px]',
  },
  {
    id: '1:1',
    name: '1:1 Square',
    sub: 'Instagram Feed, Facebook',
    icon: Square,
    ratio: '1:1',
    width: 1080,
    height: 1080,
    previewClass: 'aspect-square max-h-[340px]',
  },
  {
    id: '4:5',
    name: '4:5 Portrait',
    sub: 'Instagram Feed Post',
    icon: ImageIcon,
    ratio: '4:5',
    width: 1080,
    height: 1350,
    previewClass: 'aspect-[4/5] max-h-[360px]',
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

export const VideoResizerComponent: React.FC<VideoResizerComponentProps> = ({ tool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Resize Options
  const [preset, setPreset] = useState<AspectRatioPreset>('9:16');
  const [backgroundStyle, setBackgroundStyle] = useState<BackgroundStyle>('blur');
  const [customColorHex, setCustomColorHex] = useState<string>('#0f172a');

  // Processing state
  const [status, setStatus] = useState<'idle' | 'configured' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setStatus('configured');
    setErrorMessage(null);
    setConversionResult(null);

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setVideoDimensions({
      width: videoRef.current.videoWidth || 1920,
      height: videoRef.current.videoHeight || 1080,
    });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      if (bgVideoRef.current) bgVideoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      if (bgVideoRef.current) bgVideoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setStatus('processing');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('toolType', 'video-aspect-ratio-resizer');
      formData.append('targetFormat', 'mp4');

      const options = {
        preset,
        backgroundStyle,
        customColorHex,
      };
      formData.append('options', JSON.stringify(options));

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
      console.error('Video resizing failed:', err);
      setErrorMessage(err.message || 'An error occurred while starting the resize conversion.');
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
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setStatus('idle');
    setErrorMessage(null);
    setActiveJobId(null);
    setConversionResult(null);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (!conversionResult?.downloadUrl) return;
    const fullUrl = conversionResult.downloadUrl.startsWith('http')
      ? conversionResult.downloadUrl
      : `${window.location.origin}${conversionResult.downloadUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const selectedPresetObj = PRESETS.find((p) => p.id === preset) || PRESETS[0];

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            <Maximize2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Video Aspect Ratio & Social Canvas Resizer
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Blurred Background Mirror
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Instantly frame landscape or square videos for TikTok (9:16), Reels, YouTube Shorts, and Instagram with intelligent backdrop blur.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Upload Dropzone when idle */}
      {status === 'idle' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept="video/*, .mp4, .webm, .mov, .mkv, .avi"
            maxSizeMb={100}
            multiple={false}
          />
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <span>Supports MP4, MOV, WebM, MKV, AVI (up to 100MB)</span>
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Zap className="w-3.5 h-3.5" /> Social Media Native Canvas Presets
            </span>
          </div>
        </div>
      )}

      {/* 3. Interactive Social Framing Studio */}
      {(status === 'configured' || status === 'processing' || status === 'error') && selectedFile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Canvas Live Framing Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[280px]">
                  {selectedFile.name}
                </span>
                <span className="text-xs text-slate-500">
                  ({formatBytes(selectedFile.size)})
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-rose-500 hover:bg-rose-500/10"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Choose Other
              </Button>
            </div>

            {/* Canvas Frame Container */}
            <div className="flex items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-800 min-h-[420px] overflow-hidden">
              <div
                className={`relative rounded-xl overflow-hidden shadow-2xl flex items-center justify-center transition-all duration-300 ${selectedPresetObj.previewClass}`}
                style={{
                  backgroundColor:
                    backgroundStyle === 'white'
                      ? '#ffffff'
                      : backgroundStyle === 'color'
                      ? customColorHex
                      : '#000000',
                }}
              >
                {/* Background Blurred Layer */}
                {backgroundStyle === 'blur' && videoUrl && (
                  <video
                    ref={bgVideoRef}
                    src={videoUrl}
                    className="absolute inset-0 w-full h-full object-cover blur-2xl scale-125 opacity-70"
                    loop
                    muted
                    playsInline
                  />
                )}

                {/* Foreground Video Player */}
                {videoUrl && (
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={onLoadedMetadata}
                    loop
                    muted
                    playsInline
                    className={`relative z-10 w-full h-full transition-all duration-300 ${
                      backgroundStyle === 'crop' ? 'object-cover' : 'object-contain'
                    }`}
                  />
                )}

                {/* Play/Pause Button */}
                <button
                  type="button"
                  onClick={togglePlay}
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/25 hover:bg-black/15 transition-all group"
                >
                  <div className="p-3.5 rounded-full bg-amber-500 text-slate-950 shadow-2xl group-hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
                  </div>
                </button>

                {/* Aspect Ratio Badge Overlay */}
                <div className="absolute top-2.5 left-2.5 z-30 px-2 py-1 rounded-md bg-black/75 backdrop-blur-md text-amber-400 font-mono text-[10px] font-bold">
                  {selectedPresetObj.name} ({selectedPresetObj.width}x{selectedPresetObj.height})
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Original Video: {videoDimensions.width} x {videoDimensions.height} px</span>
              <span className="text-amber-500 font-medium">Target Output: {selectedPresetObj.width} x {selectedPresetObj.height} px (1080p Social Ready)</span>
            </div>
          </div>

          {/* Right Column: Aspect Ratio & Styling Presets (5 cols) */}
          <div className="lg:col-span-5 space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-5">
              {/* 1. Aspect Ratio Presets */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Maximize2 className="w-4 h-4 text-amber-500" />
                    <span>Target Social Aspect Ratio</span>
                  </label>
                  <span className="text-xs font-mono text-amber-500 font-bold">{selectedPresetObj.ratio}</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {PRESETS.map((p) => {
                    const IconComp = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPreset(p.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          preset === p.id
                            ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IconComp className="w-4 h-4 text-amber-500 shrink-0" />
                          <span className="text-xs font-bold">{p.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">
                          {p.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Background Fill Style */}
              <div className="space-y-2.5">
                <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span>Background Padding Style</span>
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {BACKGROUND_OPTIONS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBackgroundStyle(bg.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-left transition-all ${
                        backgroundStyle === bg.id
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm">{bg.icon}</span>
                        <div>
                          <div className="text-xs font-semibold">{bg.label}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{bg.desc}</div>
                        </div>
                      </div>
                      {backgroundStyle === bg.id && <Check className="w-4 h-4 text-amber-500" />}
                    </button>
                  ))}
                </div>

                {/* Custom Color Palette picker if 'color' selected */}
                {backgroundStyle === 'color' && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[11px] text-slate-500 font-medium">Select Canvas Color</span>
                    <div className="flex items-center gap-2">
                      {COLOR_SWATCHES.map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setCustomColorHex(hex)}
                          className={`w-6 h-6 rounded-full border border-white/20 transition-transform ${
                            customColorHex === hex ? 'scale-125 ring-2 ring-amber-500' : ''
                          }`}
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              {status === 'processing' && activeJobId ? (
                <MediaProcessingView
                  jobId={activeJobId}
                  originalFilename={selectedFile?.name || 'video.mp4'}
                  targetFormat="mp4"
                  onComplete={handleJobComplete}
                  onError={handleJobError}
                />
              ) : (
                <Button
                  onClick={handleStartConversion}
                  disabled={status === 'processing'}
                  className="w-full py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{status === 'processing' ? 'Resizing Canvas...' : `Resize Video to ${selectedPresetObj.name}`}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Completed Result View */}
      {status === 'completed' && conversionResult?.downloadUrl && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Social Canvas Resized Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Framed for {selectedPresetObj.name} with high-definition audio & video retention.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              {selectedPresetObj.ratio} ({selectedPresetObj.width}x{selectedPresetObj.height})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Video Player */}
            <div className="md:col-span-6 rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-2xl">
              <video
                src={conversionResult.downloadUrl}
                controls
                autoPlay
                loop
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right: Metrics & Download Actions */}
            <div className="md:col-span-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Preset</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedPresetObj.name}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Background</span>
                  <div className="text-base font-bold text-amber-500 mt-0.5 capitalize">
                    {backgroundStyle === 'blur' ? 'Blurred Mirror' : backgroundStyle}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Output Dimensions</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {selectedPresetObj.width}x{selectedPresetObj.height}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Output Size</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {formatBytes(conversionResult.convertedSizeBytes || 0)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={conversionResult.downloadUrl}
                  download={`${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'video'}-${preset}.mp4`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Resized MP4 Video</span>
                </a>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="flex-1 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resize Another</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Privacy Assurance Badge */}
      <PrivacyAssuranceBadge
        customTitle="Hardware-Accelerated Canvas Scaling"
        customDescription="Videos are framed with high-performance H.264 yuv420p output for flawless rendering on TikTok, Instagram Reels, and YouTube Shorts."
      />

      {/* 6. Next Action Recommendations */}
      <NextActionRecommendations
        categorySlug="video"
        currentSlug="video-aspect-ratio-resizer"
      />
    </div>
  );
};
