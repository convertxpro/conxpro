'use client';

import React, { useState, useId } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { MediaProcessingView } from '@/components/conversion/MediaProcessingView';
import { AdSlot } from '@/components/ads/AdSlot';
import { formatBytes } from '@/lib/utils';
import {
  Film,
  Music,
  Download,
  RotateCcw,
  Sparkles,
  Sliders,
  Play,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  FileVideo,
  FileAudio,
} from 'lucide-react';

export interface MediaConverterProps {
  initialToolSlug?: string;
}

type ConversionState = 'idle' | 'selected' | 'processing' | 'completed' | 'error';

export const MediaConverter: React.FC<MediaConverterProps> = ({
  initialToolSlug = 'mp4-to-mp3',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, setState] = useState<ConversionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);

  // Derive initial tool settings from initialToolSlug
  const getDefaultsFromSlug = (slug: string) => {
    if (slug === 'video-to-mp3' || slug === 'mp4-to-mp3') {
      return { toolType: 'video-to-mp3', targetFormat: 'mp3', bitrate: '192k' };
    }
    if (slug === 'video-to-gif') {
      return { toolType: 'video-to-gif', targetFormat: 'gif', fps: 15, width: 480 };
    }
    if (slug === 'compress-video-for-discord') {
      return { toolType: 'video-compress', targetFormat: 'mp4', targetSizeMb: 8 };
    }
    if (slug === 'compress-video-for-whatsapp') {
      return { toolType: 'video-compress', targetFormat: 'mp4', targetSizeMb: 16 };
    }
    if (slug === 'compress-video') {
      return { toolType: 'video-compress', targetFormat: 'mp4', crf: 28 };
    }
    if (slug === 'mp4-to-webm') {
      return { toolType: 'video-convert', targetFormat: 'webm', resolution: 'original' };
    }
    if (slug === 'webm-to-mp4' || slug === 'mov-to-mp4' || slug === 'mkv-to-mp4' || slug === 'avi-to-mp4') {
      return { toolType: 'video-convert', targetFormat: 'mp4', resolution: 'original' };
    }
    if (slug === 'gif-to-mp4') {
      return { toolType: 'gif-to-mp4', targetFormat: 'mp4' };
    }
    if (slug === 'gif-to-webm') {
      return { toolType: 'gif-to-webm', targetFormat: 'webm' };
    }
    if (slug === 'video-aspect-ratio-resizer') {
      return { toolType: 'video-aspect-ratio-resizer', targetFormat: 'mp4' };
    }
    if (slug === 'wav-to-mp3' || slug === 'm4a-to-mp3' || slug === 'flac-to-mp3') {
      return { toolType: 'audio-convert', targetFormat: 'mp3', bitrate: '192k' };
    }
    if (slug === 'mp3-to-wav') {
      return { toolType: 'audio-convert', targetFormat: 'wav' };
    }
    if (slug === 'video-trim') {
      return { toolType: 'video-trim', targetFormat: 'mp4' };
    }
    return { toolType: 'video-convert', targetFormat: 'mp4', resolution: 'original' };
  };

  const defaults = getDefaultsFromSlug(initialToolSlug);

  // Conversion options state
  const [toolType, setToolType] = useState<string>(defaults.toolType);
  const [targetFormat, setTargetFormat] = useState<string>(defaults.targetFormat);
  const [bitrate, setBitrate] = useState<string>(defaults.bitrate || '192k');
  const [resolution, setResolution] = useState<string>(defaults.resolution || 'original');
  const [targetSizeMb, setTargetSizeMb] = useState<number | undefined>(defaults.targetSizeMb);
  const [fps, setFps] = useState<number>(defaults.fps || 15);
  const [gifWidth, setGifWidth] = useState<number>(defaults.width || 480);
  const [crf, setCrf] = useState<number>(defaults.crf || 28);
  const [startTime, setStartTime] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

  const startTimeId = useId();
  const durationId = useId();

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setState('selected');
    setErrorMessage(null);
    setConversionResult(null);

    // Create local object URL for preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setState('processing');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('toolType', toolType);
      formData.append('targetFormat', targetFormat);

      const options: Record<string, any> = {};
      if (bitrate) options.bitrate = bitrate;
      if (resolution && resolution !== 'original') options.resolution = resolution;
      if (targetSizeMb) options.targetSizeMb = targetSizeMb;
      if (toolType === 'video-to-gif') {
        options.fps = fps;
        options.width = gifWidth;
      }
      if (toolType === 'video-compress' && !targetSizeMb) {
        options.crf = crf;
      }
      if (startTime) options.startTime = startTime;
      if (duration) options.duration = duration;

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
      console.error('Conversion trigger failed:', err);
      setState('error');
      setErrorMessage(err?.message || 'Failed to start media conversion.');
    }
  };

  const handleProcessingComplete = (result: any) => {
    setConversionResult(result);
    setState('completed');
  };

  const handleProcessingError = (error: string) => {
    setErrorMessage(error);
    setState('error');
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setState('idle');
    setErrorMessage(null);
    setActiveJobId(null);
    setConversionResult(null);
  };

  const isAudioTool = toolType.includes('audio') || toolType === 'video-to-mp3';
  const isVideoToGif = toolType === 'video-to-gif';
  const isVideoCompress = toolType === 'video-compress';

  return (
    <div className="w-full space-y-6">
      {/* State: IDLE or SELECTED */}
      {(state === 'idle' || state === 'selected') && (
        <div className="space-y-6">
          <Dropzone
            onFilesSelected={handleFilesSelected}
            acceptedFormatsText="MP4, WebM, MOV, AVI, MKV, FLV, MP3, WAV, AAC, FLAC, M4A (Max 100MB)"
            maxSizeMb={100}
          />

          {selectedFile && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/60 space-y-6">
              {/* Selected File Details & Preview */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    {selectedFile.type.startsWith('audio') ? (
                      <FileAudio className="h-6 w-6" />
                    ) : (
                      <FileVideo className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatBytes(selectedFile.size)} • {selectedFile.type || 'Media Container'}
                    </p>
                  </div>
                </div>

                <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw className="h-3.5 w-3.5" />}>
                  Change File
                </Button>
              </div>

              {/* Conversion Options Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Target Format Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-amber-500" />
                    Target Output Format
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {isAudioTool ? (
                      ['mp3', 'wav', 'aac', 'flac', 'm4a', 'ogg'].map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setTargetFormat(fmt)}
                          className={`rounded-xl border py-2 text-xs font-bold uppercase transition-all ${
                            targetFormat === fmt
                              ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
                          }`}
                        >
                          .{fmt}
                        </button>
                      ))
                    ) : isVideoToGif ? (
                      <button
                        type="button"
                        className="col-span-3 rounded-xl border border-amber-500 bg-amber-50 py-2.5 text-xs font-bold uppercase text-amber-700 dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300"
                      >
                        Animated GIF (.gif)
                      </button>
                    ) : (
                      ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv'].map((fmt) => (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => setTargetFormat(fmt)}
                          className={`rounded-xl border py-2 text-xs font-bold uppercase transition-all ${
                            targetFormat === fmt
                              ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-300'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
                          }`}
                        >
                          .{fmt}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* 2. Tool-Specific Parameters */}
                {isAudioTool ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Radio className="h-3.5 w-3.5 text-amber-500" />
                      Audio Quality & Bitrate
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { rate: '320k', label: '320 kbps (Studio)' },
                        { rate: '256k', label: '256 kbps (HD)' },
                        { rate: '192k', label: '192 kbps (Standard)' },
                        { rate: '128k', label: '128 kbps (Voice)' },
                      ].map((item) => (
                        <button
                          key={item.rate}
                          type="button"
                          onClick={() => setBitrate(item.rate)}
                          className={`rounded-xl border p-2 text-left text-xs font-medium transition-all ${
                            bitrate === item.rate
                              ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : isVideoToGif ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Film className="h-3.5 w-3.5 text-amber-500" />
                      GIF Frame Rate & Scaling
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { fps: 15, label: '15 FPS (Smooth Balanced)' },
                        { fps: 24, label: '24 FPS (Cinematic High-Res)' },
                        { fps: 10, label: '10 FPS (Compact Size)' },
                        { fps: 30, label: '30 FPS (Maximum Smoothness)' },
                      ].map((item) => (
                        <button
                          key={item.fps}
                          type="button"
                          onClick={() => setFps(item.fps)}
                          className={`rounded-xl border p-2 text-left text-xs font-medium transition-all ${
                            fps === item.fps
                              ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : isVideoCompress ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                      Compression Target Preset
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { size: 8, label: 'Discord Free (8 MB)' },
                        { size: 16, label: 'WhatsApp (16 MB)' },
                        { size: 25, label: 'Discord Nitro / Email (25 MB)' },
                        { size: 50, label: 'HD Medium (50 MB)' },
                      ].map((item) => (
                        <button
                          key={item.size}
                          type="button"
                          onClick={() => setTargetSizeMb(item.size)}
                          className={`rounded-xl border p-2 text-left text-xs font-medium transition-all ${
                            targetSizeMb === item.size
                              ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Film className="h-3.5 w-3.5 text-amber-500" />
                      Video Resolution
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { res: 'original', label: 'Original Resolution' },
                        { res: '1080p', label: '1080p Full HD (1920×1080)' },
                        { res: '720p', label: '720p HD (1280×720)' },
                        { res: '480p', label: '480p SD (854×480)' },
                      ].map((item) => (
                        <button
                          key={item.res}
                          type="button"
                          onClick={() => setResolution(item.res)}
                          className={`rounded-xl border p-2 text-left text-xs font-medium transition-all ${
                            resolution === item.res
                              ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200'
                              : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Optional Trimming Controls */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <Scissors className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Optional Clip Trimming (Start / Duration)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor={startTimeId} className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Start Time (e.g. 00:00:05 or seconds)
                    </label>
                    <input
                      id={startTimeId}
                      type="text"
                      placeholder="00:00:00"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor={durationId} className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                      Duration / Length (e.g. 00:00:30 or seconds)
                    </label>
                    <input
                      id={durationId}
                      type="text"
                      placeholder="Full length"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Start Conversion CTA Button */}
              <div className="flex justify-center pt-2">
                <Button
                  size="lg"
                  variant="gradient"
                  onClick={handleStartConversion}
                  leftIcon={<Play className="h-5 w-5" />}
                  className="w-full sm:w-auto min-w-[240px] py-4 text-base font-bold shadow-lg shadow-amber-500/20"
                >
                  Start Conversion ({targetFormat.toUpperCase()})
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* State: PROCESSING */}
      {state === 'processing' && activeJobId && selectedFile && (
        <MediaProcessingView
          jobId={activeJobId}
          originalFilename={selectedFile.name}
          targetFormat={targetFormat}
          toolType={toolType}
          onComplete={handleProcessingComplete}
          onError={handleProcessingError}
        />
      )}

      {/* State: COMPLETED */}
      {state === 'completed' && conversionResult && (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 p-6 sm:p-8 shadow-sm dark:border-emerald-900/60 dark:from-slate-900/90 dark:via-emerald-950/20 dark:to-slate-900/80">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Transcoding Complete!
                    </h3>
                    <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                      .{conversionResult.format || targetFormat} Ready
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {conversionResult.targetFilename}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Converted Size: {formatBytes(conversionResult.convertedSizeBytes)}
                  </p>
                </div>
              </div>

              {/* Compression Reduction Metric */}
              {conversionResult.originalSizeBytes > conversionResult.convertedSizeBytes && (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/80 bg-white/90 px-4 py-3 shadow-sm dark:border-emerald-800/80 dark:bg-slate-800/80">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                      Size Reduced
                    </p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      -{Math.round(((conversionResult.originalSizeBytes - conversionResult.convertedSizeBytes) / conversionResult.originalSizeBytes) * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Media Player Preview */}
            <div className="mt-6 rounded-2xl overflow-hidden bg-slate-950 p-2 shadow-inner">
              {isAudioTool || conversionResult.format === 'mp3' || conversionResult.format === 'wav' || conversionResult.format === 'aac' || conversionResult.format === 'flac' ? (
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Music className="h-5 w-5 text-amber-400" />
                    <span className="text-xs text-slate-300 font-medium">Audio Output Preview</span>
                  </div>
                  <audio controls className="w-full" src={conversionResult.downloadUrl} />
                </div>
              ) : conversionResult.format === 'gif' ? (
                <div className="flex justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={conversionResult.downloadUrl}
                    alt="Converted GIF preview"
                    className="max-h-80 rounded-xl object-contain"
                  />
                </div>
              ) : (
                <div className="p-2">
                  <video
                    controls
                    playsInline
                    className="w-full max-h-80 rounded-xl bg-black"
                    src={conversionResult.downloadUrl}
                  />
                </div>
              )}
            </div>

            {/* Download and Reset Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <a
                href={conversionResult.downloadUrl}
                download={conversionResult.targetFilename}
                className="flex-1"
              >
                <Button
                  size="lg"
                  variant="gradient"
                  leftIcon={<Download className="h-5 w-5" />}
                  className="w-full py-4 text-base font-bold shadow-lg shadow-emerald-500/20"
                >
                  Download {conversionResult.targetFilename} ({formatBytes(conversionResult.convertedSizeBytes)})
                </Button>
              </a>

              <Button
                size="lg"
                variant="secondary"
                onClick={handleReset}
                leftIcon={<RotateCcw className="h-4 w-4" />}
                className="py-4"
              >
                Convert Another Media
              </Button>
            </div>

            {/* Privacy Guarantee */}
            <div className="mt-6 flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-emerald-100/80 pt-4 dark:border-emerald-900/40">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>
                Privacy Guarantee: Media files are stored securely and <strong>auto-purged after 2 hours</strong>.
              </span>
            </div>
          </div>

          {/* Download Page Ad Slot */}
          <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/30">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Advertisement
            </p>
            <AdSlot placement="download_page" />
          </div>
        </div>
      )}

      {/* State: ERROR */}
      {state === 'error' && (
        <div className="rounded-3xl border border-red-200 bg-red-50/70 p-6 dark:border-red-950 dark:bg-red-950/30 space-y-4">
          <div className="flex items-center gap-3 text-red-700 dark:text-red-300">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <div>
              <h4 className="font-bold">Conversion Failed</h4>
              <p className="text-xs">{errorMessage || 'An error occurred during transcoding.'}</p>
            </div>
          </div>

          <div className="flex justify-start">
            <Button variant="secondary" size="md" onClick={handleReset} leftIcon={<RotateCcw className="h-4 w-4" />}>
              Try Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
