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
  Video,
  Film,
  Sparkles,
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Repeat,
  TrendingDown,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

interface GifToVideoComponentProps {
  tool?: ToolMetadata;
  initialFormat?: 'mp4' | 'webm';
}

export const GifToVideoComponent: React.FC<GifToVideoComponentProps> = ({
  tool,
  initialFormat = 'mp4',
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'mp4' | 'webm'>(
    tool?.slug === 'gif-to-webm' ? 'webm' : initialFormat
  );
  const [qualityCrf, setQualityCrf] = useState<number>(23);
  const [loopCount, setLoopCount] = useState<number>(1);
  const [fpsLimit, setFpsLimit] = useState<number | undefined>(undefined);
  const [resolutionScale, setResolutionScale] = useState<'original' | '720p' | '1080p'>('original');

  // Processing state
  const [status, setStatus] = useState<'idle' | 'configured' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (gifUrl) URL.revokeObjectURL(gifUrl);
    };
  }, [gifUrl]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setStatus('configured');
    setErrorMessage(null);
    setConversionResult(null);

    const url = URL.createObjectURL(file);
    setGifUrl(url);
  };

  const handleStartConversion = async () => {
    if (!selectedFile) return;

    setStatus('processing');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('toolType', targetFormat === 'webm' ? 'gif-to-webm' : 'gif-to-mp4');
      formData.append('targetFormat', targetFormat);

      const options: Record<string, any> = {
        qualityCrf,
        loopCount,
        resolution: resolutionScale,
      };
      if (fpsLimit) options.fps = fpsLimit;

      formData.append('options', JSON.stringify(options));

      const response = await fetch('/api/convert/media', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errData.error || `Server error ${response.status}`);
      }

      const data = await response.json();
      if (!data.success || !data.jobId) {
        throw new Error(data.error || 'Failed to start conversion job');
      }

      setActiveJobId(data.jobId);
    } catch (err: any) {
      console.error('GIF to Video conversion failed:', err);
      setErrorMessage(err.message || 'An error occurred while converting the GIF.');
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
    if (gifUrl) URL.revokeObjectURL(gifUrl);
    setGifUrl(null);
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

  // Calculate size reduction percentage
  let savingsPercent = 0;
  if (selectedFile && conversionResult && conversionResult.convertedSizeBytes) {
    const orig = selectedFile.size;
    const converted = conversionResult.convertedSizeBytes;
    if (orig > converted) {
      savingsPercent = Math.max(0, Math.round(((orig - converted) / orig) * 100));
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                GIF to MP4 & WebM Converter
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> 90%+ Size Reduction
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Transform heavy animated GIFs into smooth, lightweight looping MP4 and WebM videos with universal iOS/Android compatibility.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Upload Dropzone when idle */}
      {status === 'idle' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <Dropzone
            onFilesSelected={handleFilesSelected}
            accept="image/gif, image/webp, .gif, .webp"
            maxSizeMb={100}
            multiple={false}
          />
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <span>Supports animated GIF & WebP (up to 100MB)</span>
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Zap className="w-3.5 h-3.5" /> Hardware-Accelerated H.264 FastStart Encoding
            </span>
          </div>
        </div>
      )}

      {/* 3. Configuration Workspace */}
      {(status === 'configured' || status === 'processing' || status === 'error') && selectedFile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: GIF Preview (6 cols) */}
          <div className="lg:col-span-6 space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
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

            {/* Live GIF preview */}
            <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950/80 border border-slate-800 min-h-[300px]">
              {gifUrl && (
                <img
                  src={gifUrl}
                  alt="Original Animated GIF"
                  className="max-h-[280px] max-w-full rounded-lg object-contain shadow-2xl"
                />
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2.5">
              <Zap className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                Converting this GIF to MP4 will reduce file size by ~90% while improving playback smoothness and battery efficiency.
              </span>
            </div>
          </div>

          {/* Right Column: Output Options (6 cols) */}
          <div className="lg:col-span-6 space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Output Video Settings
                </h3>
              </div>

              {/* Target Format */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Output Video Container
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTargetFormat('mp4')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetFormat === 'mp4'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <span>MP4 (H.264)</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-500/20">Universal</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                      Plays everywhere: iPhone, Android, Discord, WhatsApp, Web.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetFormat('webm')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      targetFormat === 'webm'
                        ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-sm font-bold flex items-center gap-1.5">
                      <span>WebM (VP9)</span>
                      <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">Web</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                      Modern Google WebM format for high compression on web.
                    </p>
                  </button>
                </div>
              </div>

              {/* Loop Multiplier (for Instagram / TikTok / Shorts) */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                  <span className="flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-amber-500" />
                    <span>Loop Multiplier (Clip Extension)</span>
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {loopCount === 1 ? '1x (Original)' : `${loopCount}x Loop`}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { count: 1, label: '1x', desc: 'Single' },
                    { count: 2, label: '2x', desc: 'Double' },
                    { count: 3, label: '3x', desc: 'Shorts (6s+)' },
                    { count: 5, label: '5x', desc: 'Reels (10s+)' },
                  ].map((item) => (
                    <button
                      key={item.count}
                      type="button"
                      onClick={() => setLoopCount(item.count)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        loopCount === item.count
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Quality CRF Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Compression Quality (CRF)</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono font-bold">
                    {qualityCrf === 18 ? 'Ultra HQ (18)' : qualityCrf === 23 ? 'Balanced (23)' : 'Compact (28)'}
                  </span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={30}
                  step={1}
                  value={qualityCrf}
                  onChange={(e) => setQualityCrf(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Crisp Quality (Larger)</span>
                  <span>Recommended</span>
                  <span>Maximum Compression</span>
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
                  originalFilename={selectedFile?.name || 'animation.gif'}
                  targetFormat={targetFormat}
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
                  <span>{status === 'processing' ? 'Converting to Video...' : `Convert GIF to ${targetFormat.toUpperCase()}`}</span>
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
                  Conversion Complete!
                </h3>
                <p className="text-xs text-slate-500">
                  Your video is ready for high-speed streaming and social posting.
                </p>
              </div>
            </div>
            {savingsPercent > 0 && (
              <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <TrendingDown className="w-3.5 h-3.5" />
                {savingsPercent}% File Size Saved
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left: Video Player */}
            <div className="md:col-span-6 rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-2xl">
              <video
                src={conversionResult.downloadUrl}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right: Metrics & Download Actions */}
            <div className="md:col-span-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Original GIF Size</span>
                  <div className="text-base font-bold text-slate-500 line-through mt-0.5 font-mono">
                    {formatBytes(selectedFile?.size || 0)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">New Video Size</span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                    {formatBytes(conversionResult.convertedSizeBytes || 0)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Format</span>
                  <div className="text-base font-bold text-amber-500 mt-0.5 uppercase font-mono">
                    {targetFormat} (H.264)
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Loop Mode</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {loopCount}x Loop
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={conversionResult.downloadUrl}
                  download={`${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'video'}.${targetFormat}`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {targetFormat.toUpperCase()} Video</span>
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
                    <span>Convert Another</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Privacy Assurance Badge */}
      <PrivacyAssuranceBadge
        customTitle="100% In-Memory Hardware Video Conversion"
        customDescription="Videos are encoded with universal H.264 faststart flags for immediate web streaming. Files are processed with strict isolation."
      />

      {/* 6. Next Action Recommendations */}
      <NextActionRecommendations
        categorySlug="video"
        currentSlug={targetFormat === 'webm' ? 'gif-to-webm' : 'gif-to-mp4'}
      />
    </div>
  );
};
