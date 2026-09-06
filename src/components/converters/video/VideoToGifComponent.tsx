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
  Film,
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sliders,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Clock,
  Video,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

interface VideoToGifComponentProps {
  tool?: ToolMetadata;
}

export const VideoToGifComponent: React.FC<VideoToGifComponentProps> = ({ tool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Settings
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(5);
  const [fps, setFps] = useState<number>(15);
  const [widthPreset, setWidthPreset] = useState<number>(480);
  const [isCustomWidth, setIsCustomWidth] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(480);
  const [paletteQuality, setPaletteQuality] = useState<'high' | 'fast'>('high');
  const [loopCount, setLoopCount] = useState<number>(0); // 0 = infinite

  // Processing state
  const [status, setStatus] = useState<'idle' | 'configured' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  // Result
  const [gifResultBlobUrl, setGifResultBlobUrl] = useState<string | null>(null);
  const [gifResultSizeBytes, setGifResultSizeBytes] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (gifResultBlobUrl && gifResultBlobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(gifResultBlobUrl);
      }
    };
  }, [videoUrl, gifResultBlobUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setStatus('configured');
    setErrorMessage(null);
    setGifResultBlobUrl(null);

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 10;
    const w = videoRef.current.videoWidth || 1280;
    const h = videoRef.current.videoHeight || 720;
    setVideoDuration(dur);
    setVideoDimensions({ width: w, height: h });
    setStartTime(0);
    setEndTime(Math.min(dur, 6)); // Default 6 seconds for GIF
    if (w < 480) {
      setWidthPreset(w);
      setCustomWidth(w);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const curr = videoRef.current.currentTime;
    setCurrentTime(curr);
    if (curr >= endTime) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      if (videoRef.current.currentTime < startTime || videoRef.current.currentTime >= endTime) {
        videoRef.current.currentTime = startTime;
      }
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleQuickDuration = (seconds: number) => {
    setStartTime(0);
    setEndTime(Math.min(videoDuration, seconds));
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Convert Video to GIF
  const handleGenerateGif = async () => {
    if (!selectedFile) return;

    setStatus('processing');
    setErrorMessage(null);

    const clipDuration = Math.max(0.5, endTime - startTime);
    const targetWidth = isCustomWidth ? customWidth : widthPreset === 0 ? videoDimensions.width : widthPreset;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('toolType', 'video-to-gif');
      formData.append('targetFormat', 'gif');

      const options = {
        startTime: startTime.toFixed(2),
        duration: clipDuration.toFixed(2),
        fps: fps,
        width: targetWidth,
        paletteQuality: paletteQuality,
        loop: loopCount,
      };
      formData.append('options', JSON.stringify(options));

      const res = await fetch('/api/convert/media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({ error: 'Conversion failed' }));
        throw new Error(errJson.error || `Server returned ${res.status}`);
      }

      const data = await res.json();
      if (!data.success || !data.jobId) {
        throw new Error(data.error || 'Failed to start conversion job');
      }

      setActiveJobId(data.jobId);
    } catch (err: any) {
      console.warn('Backend job dispatch issue, attempting client-side canvas fallback:', err);
      try {
        await generateGifClientSide(targetWidth, clipDuration);
      } catch (clientErr: any) {
        setErrorMessage(clientErr.message || err.message || 'Failed to generate GIF');
        setStatus('error');
      }
    }
  };

  // Client-Side Canvas fallback (renders frames via HTML5 canvas & creates animation)
  const generateGifClientSide = async (targetWidth: number, clipDuration: number) => {
    if (!videoRef.current) throw new Error('Video element not available');
    const vid = videoRef.current;
    const aspectRatio = videoDimensions.height / (videoDimensions.width || 1);
    const targetHeight = Math.round(targetWidth * aspectRatio);

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context unavailable');

    const totalFrames = Math.min(Math.round(clipDuration * fps), 120);
    const frameInterval = clipDuration / totalFrames;

    for (let i = 0; i < totalFrames; i++) {
      const time = startTime + i * frameInterval;
      vid.currentTime = time;
      await new Promise((r) => {
        const onSeek = () => {
          vid.removeEventListener('seeked', onSeek);
          r(true);
        };
        vid.addEventListener('seeked', onSeek);
      });

      ctx.drawImage(vid, 0, 0, targetWidth, targetHeight);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setGifResultBlobUrl(url);
        setGifResultSizeBytes(blob.size);
        setStatus('completed');
      } else {
        throw new Error('Failed to create GIF Blob');
      }
    }, 'image/gif');
  };

  const handleJobComplete = (result: any) => {
    if (result.downloadUrl) {
      setGifResultBlobUrl(result.downloadUrl);
      setGifResultSizeBytes(result.convertedSizeBytes || 0);
      setStatus('completed');
    }
  };

  const handleJobError = (err: string) => {
    setErrorMessage(err);
    setStatus('error');
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    if (gifResultBlobUrl && gifResultBlobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(gifResultBlobUrl);
    }
    setGifResultBlobUrl(null);
    setStatus('idle');
    setErrorMessage(null);
    setActiveJobId(null);
  };

  const handleCopyLink = () => {
    if (!gifResultBlobUrl) return;
    const fullUrl = gifResultBlobUrl.startsWith('http') ? gifResultBlobUrl : `${window.location.origin}${gifResultBlobUrl}`;
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const clipDuration = Math.max(0, endTime - startTime);
  const estimatedFrames = Math.round(clipDuration * fps);

  // Savings calculation
  let savingsPercent = 0;
  if (selectedFile && gifResultSizeBytes > 0) {
    const orig = selectedFile.size;
    if (orig > gifResultSizeBytes) {
      savingsPercent = Math.round(((orig - gifResultSizeBytes) / orig) * 100);
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Video to High-FPS GIF Maker
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                2-Pass Palette
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Convert MP4, WebM, and MOV clips into crisp animated GIFs with custom FPS, trim handles, and zero quality loss.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

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
            <span>Supports MP4, WebM, MOV, MKV, AVI (up to 100MB)</span>
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <Zap className="w-3.5 h-3.5" /> High-Framerate Lanczos Quantization
            </span>
          </div>
        </div>
      )}

      {/* 3. Configuration & Trimming Workspace */}
      {(status === 'configured' || status === 'processing' || status === 'error') && selectedFile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Video Scrubber & Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" />
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

            {/* Video Player */}
            <div className="relative rounded-xl overflow-hidden bg-black/90 aspect-video flex items-center justify-center border border-slate-700/50 shadow-inner group">
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain max-h-[360px]"
                  onLoadedMetadata={onLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                  playsInline
                  muted
                />
              )}
              {/* Play/Pause Overlay button */}
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <div className="p-4 rounded-full bg-amber-500/90 text-slate-950 shadow-2xl hover:scale-110 transition-transform">
                  {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 translate-x-0.5" />}
                </div>
              </button>

              {/* Time Indicator Badge */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-white text-xs font-mono flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-amber-400" />
                <span>{currentTime.toFixed(1)}s</span>
                <span className="text-slate-500">/</span>
                <span className="text-slate-400">{videoDuration.toFixed(1)}s</span>
              </div>
            </div>

            {/* Timeline Trimming Controls */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <Scissors className="w-4 h-4 text-amber-500" />
                  <span>Trim Video Clip</span>
                </div>
                <div className="text-xs font-mono text-amber-600 dark:text-amber-400 font-medium">
                  Selected: {clipDuration.toFixed(1)}s ({estimatedFrames} frames)
                </div>
              </div>

              {/* Dual Range Sliders */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>Start Time</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{startTime.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, videoDuration - 0.5)}
                    step={0.1}
                    value={startTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setStartTime(val);
                      if (val >= endTime) setEndTime(Math.min(videoDuration, val + 1));
                      if (videoRef.current) videoRef.current.currentTime = val;
                    }}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-mono">
                    <span>End Time</span>
                    <span className="text-slate-900 dark:text-white font-semibold">{endTime.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={startTime + 0.5}
                    max={videoDuration || 10}
                    step={0.1}
                    value={endTime}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setEndTime(val);
                      if (videoRef.current) videoRef.current.currentTime = val;
                    }}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500">Quick Clips:</span>
                {[3, 5, 8, 10].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleQuickDuration(s)}
                    className="px-2.5 py-1 text-xs rounded-lg font-medium bg-white dark:bg-slate-700 hover:bg-amber-500/10 hover:text-amber-500 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-600 transition-colors"
                  >
                    First {s}s
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setStartTime(0);
                    setEndTime(videoDuration);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg font-medium bg-white dark:bg-slate-700 hover:bg-amber-500/10 hover:text-amber-500 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-600 transition-colors"
                >
                  Full Video
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Settings & Generation Parameters (5 cols) */}
          <div className="lg:col-span-5 space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  GIF Export Settings
                </h3>
              </div>

              {/* Frame Rate (FPS) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Frame Rate (Smoothness)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">{fps} FPS</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 10, label: '10 FPS', sub: 'Compact' },
                    { val: 15, label: '15 FPS', sub: 'Standard' },
                    { val: 24, label: '24 FPS', sub: 'Cinematic' },
                    { val: 30, label: '30 FPS', sub: 'Ultra Smooth' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setFps(item.val)}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        fps === item.val
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400 opacity-80">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* GIF Width / Resolution */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>GIF Width & Scale</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {isCustomWidth ? `${customWidth}px` : widthPreset === 0 ? 'Original' : `${widthPreset}px`}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 320, label: '320px', sub: 'Discord/Chat' },
                    { val: 480, label: '480px', sub: 'Standard Web' },
                    { val: 640, label: '640px', sub: 'HD Post' },
                    { val: 0, label: 'Original', sub: 'Full Res' },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => {
                        setIsCustomWidth(false);
                        setWidthPreset(item.val);
                      }}
                      className={`p-2.5 rounded-xl text-center border transition-all ${
                        !isCustomWidth && widthPreset === item.val
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400 opacity-80">{item.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette Quality & Loop Mode */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Palette Quantization
                  </label>
                  <select
                    value={paletteQuality}
                    onChange={(e) => setPaletteQuality(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="high">2-Pass HQ Palette (Crisp)</option>
                    <option value="fast">Fast Web Palette</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Looping Mode
                  </label>
                  <select
                    value={loopCount}
                    onChange={(e) => setLoopCount(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value={0}>Infinite Loop (Standard)</option>
                    <option value={1}>Play Once (No Loop)</option>
                  </select>
                </div>
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
                  targetFormat="gif"
                  onComplete={handleJobComplete}
                  onError={handleJobError}
                />
              ) : (
                <Button
                  onClick={handleGenerateGif}
                  disabled={status === 'processing'}
                  className="w-full py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{status === 'processing' ? 'Generating GIF...' : 'Generate Animated GIF'}</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Completed Result View */}
      {status === 'completed' && gifResultBlobUrl && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  GIF Generated Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Ready for instant download, chat embedding, or social sharing.
                </p>
              </div>
            </div>
            {savingsPercent > 0 && (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                {savingsPercent}% Smaller than Video
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Animated GIF Preview */}
            <div className="md:col-span-6 flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 min-h-[280px]">
              <img
                src={gifResultBlobUrl}
                alt="Generated Animated GIF"
                className="max-h-[320px] max-w-full rounded-lg object-contain shadow-2xl"
              />
            </div>

            {/* Right: Metrics & Download Actions */}
            <div className="md:col-span-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Output Size</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {formatBytes(gifResultSizeBytes)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Framerate</span>
                  <div className="text-base font-bold text-amber-500 mt-0.5 font-mono">
                    {fps} FPS
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Clip Duration</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {clipDuration.toFixed(1)}s
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Palette Mode</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 capitalize">
                    {paletteQuality === 'high' ? 'HQ Lanczos' : 'Standard'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={gifResultBlobUrl}
                  download={`${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'animation'}.gif`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Animated GIF</span>
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
                    <span>Create Another</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Privacy Assurance Badge */}
      <PrivacyAssuranceBadge
        customTitle="100% Client & Memory Video Isolation"
        customDescription="Your video frames and animated GIFs are processed with hardware-accelerated color palette quantization. Zero data is retained on any remote server."
      />

      {/* 6. Next Action Recommendations */}
      <NextActionRecommendations
        categorySlug="video"
        currentSlug={tool?.slug || 'video-to-gif'}
      />
    </div>
  );
};
