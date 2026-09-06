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
  Minimize2,
  Sparkles,
  Download,
  RotateCcw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
  Film,
  TrendingDown,
  MessageSquare,
  Smartphone,
  Mail,
  Gauge,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

interface VideoCompressorComponentProps {
  tool?: ToolMetadata;
  initialPreset?: 'discord-free' | 'discord-nitro' | 'whatsapp' | 'custom' | 'crf';
}

type CompressionPreset = 'discord-free' | 'discord-nitro' | 'whatsapp' | 'email' | 'custom' | 'crf';

const PRESETS: {
  id: CompressionPreset;
  title: string;
  badge: string;
  desc: string;
  targetMb?: number;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}[] = [
  {
    id: 'discord-free',
    title: 'Discord Free',
    badge: 'Under 8 MB',
    desc: 'Guaranteed <= 7.9 MB for free Discord channel sharing',
    targetMb: 7.9,
    icon: MessageSquare,
    accentColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    id: 'discord-nitro',
    title: 'Discord Nitro',
    badge: 'Under 25 MB',
    desc: 'Target <= 24.8 MB for Nitro users with crisp 1080p',
    targetMb: 24.8,
    icon: MessageSquare,
    accentColor: 'text-purple-500 bg-purple-500/10 border-purple-500/30',
  },
  {
    id: 'whatsapp',
    title: 'WhatsApp FastStart',
    badge: 'Under 16 MB',
    desc: 'Target <= 15.8 MB with instant streaming web flags',
    targetMb: 15.8,
    icon: Smartphone,
    accentColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    id: 'email',
    title: 'Email Attachment',
    badge: 'Under 20 MB',
    desc: 'Fit inside Gmail & Outlook 25MB attachment bounds',
    targetMb: 19.5,
    icon: Mail,
    accentColor: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
  },
  {
    id: 'crf',
    title: 'Smart Quality (CRF)',
    badge: 'Lossless Perceptual',
    desc: 'Auto-compress by visual sharpness without fixed MB limit',
    icon: Sparkles,
    accentColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  },
  {
    id: 'custom',
    title: 'Custom Target Size',
    badge: 'Custom MB',
    desc: 'Specify exact file size in Megabytes',
    icon: Sliders,
    accentColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
  },
];

export const VideoCompressorComponent: React.FC<VideoCompressorComponentProps> = ({
  tool,
  initialPreset,
}) => {
  // Determine default preset from tool slug
  const getDefaultPreset = (): CompressionPreset => {
    if (initialPreset) return initialPreset;
    if (tool?.slug === 'compress-video-for-discord') return 'discord-free';
    if (tool?.slug === 'compress-video-for-whatsapp') return 'whatsapp';
    return 'discord-free';
  };

  const [preset, setPreset] = useState<CompressionPreset>(getDefaultPreset());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Compression parameters
  const [customTargetMb, setCustomTargetMb] = useState<number>(8);
  const [crfValue, setCrfValue] = useState<number>(28);
  const [resolutionDownscale, setResolutionDownscale] = useState<'auto' | 'original' | '1080p' | '720p' | '480p'>('auto');
  const [audioBitrate, setAudioBitrate] = useState<'128k' | '96k' | '64k' | 'mute'>('128k');

  // Processing state
  const [status, setStatus] = useState<'idle' | 'configured' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

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
    const dur = videoRef.current.duration || 10;
    setVideoDuration(dur);
    setVideoDimensions({
      width: videoRef.current.videoWidth || 1920,
      height: videoRef.current.videoHeight || 1080,
    });
  };

  const handleStartCompression = async () => {
    if (!selectedFile) return;

    setStatus('processing');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('toolType', 'video-compress');
      formData.append('targetFormat', 'mp4');

      let targetMb: number | undefined = undefined;
      const presetObj = PRESETS.find((p) => p.id === preset);
      if (presetObj && presetObj.targetMb) {
        targetMb = presetObj.targetMb;
      } else if (preset === 'custom') {
        targetMb = customTargetMb;
      }

      const options: Record<string, any> = {
        resolution: resolutionDownscale,
      };

      if (targetMb !== undefined) {
        options.targetSizeMb = targetMb;
      } else {
        options.crf = crfValue;
      }

      if (audioBitrate === 'mute') {
        options.muteOnly = true;
      } else {
        options.bitrate = audioBitrate;
      }

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
      console.error('Video compression failed:', err);
      setErrorMessage(err.message || 'An error occurred while compressing the video.');
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

  // Calculate size reduction percentage
  let savingsPercent = 0;
  if (selectedFile && conversionResult && conversionResult.convertedSizeBytes) {
    const orig = selectedFile.size;
    const converted = conversionResult.convertedSizeBytes;
    if (orig > converted) {
      savingsPercent = Math.max(0, Math.round(((orig - converted) / orig) * 100));
    }
  }

  // Calculate estimated target bitrate in kbps
  let estimatedBitrateKbps = 0;
  if (videoDuration > 0) {
    const selectedPresetObj = PRESETS.find((p) => p.id === preset);
    const targetMegabytes = selectedPresetObj?.targetMb || (preset === 'custom' ? customTargetMb : 0);
    if (targetMegabytes > 0) {
      const totalBits = targetMegabytes * 8 * 1024 * 1024;
      const audioBits = audioBitrate === 'mute' ? 0 : 128 * 1024;
      estimatedBitrateKbps = Math.max(100, Math.round((totalBits / videoDuration - audioBits) / 1024));
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            <Minimize2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Video Compressor & Bitrate Optimizer
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Discord & WhatsApp Presets
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Shrink large video files to fit Discord (8MB/25MB), WhatsApp (16MB), and email attachments without visible quality loss.
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
              <Zap className="w-3.5 h-3.5" /> Two-Pass Adaptive Bitrate Compression
            </span>
          </div>
        </div>
      )}

      {/* 3. Configuration Workspace */}
      {(status === 'configured' || status === 'processing' || status === 'error') && selectedFile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Video Preview & Stats (6 cols) */}
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

            {/* Video Player Preview */}
            <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner">
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onLoadedMetadata={onLoadedMetadata}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Video Stats Card */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-medium">Original Size</span>
                <div className="text-sm font-bold text-rose-500 font-mono mt-0.5">
                  {formatBytes(selectedFile.size)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-medium">Duration</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  {videoDuration.toFixed(1)}s
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 font-medium">Resolution</span>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono mt-0.5">
                  {videoDimensions.width}x{videoDimensions.height}
                </div>
              </div>
            </div>

            {estimatedBitrateKbps > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium">
                  <Gauge className="w-3.5 h-3.5 text-amber-500" />
                  Auto Bitrate Allocation:
                </span>
                <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                  ~{estimatedBitrateKbps} kbps
                </span>
              </div>
            )}
          </div>

          {/* Right Column: Platform Presets & Quality Settings (6 cols) */}
          <div className="lg:col-span-6 space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Target Platform & Limits
                </h3>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {PRESETS.map((p) => {
                  const isSelected = preset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreset(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold">{p.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          {p.badge}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-1 truncate">
                        {p.desc}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Custom Target MB Input */}
              {preset === 'custom' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span>Target Max File Size</span>
                    <span className="text-amber-500 font-bold font-mono">{customTargetMb} MB</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={50}
                    step={1}
                    value={customTargetMb}
                    onChange={(e) => setCustomTargetMb(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>1 MB (Tiny)</span>
                    <span>10 MB (Social)</span>
                    <span>50 MB (High Quality)</span>
                  </div>
                </div>
              )}

              {/* Quality CRF Mode Slider */}
              {preset === 'crf' && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                    <span>Quality Level (CRF)</span>
                    <span className="text-amber-500 font-bold font-mono">
                      {crfValue === 24 ? 'High Quality (24)' : crfValue === 28 ? 'Balanced (28)' : 'Max Compress (32)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={22}
                    max={34}
                    step={1}
                    value={crfValue}
                    onChange={(e) => setCrfValue(parseInt(e.target.value, 10))}
                    className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>CRF 22 (Crisp)</span>
                    <span>CRF 28 (Standard)</span>
                    <span>CRF 34 (Smallest)</span>
                  </div>
                </div>
              )}

              {/* Resolution Downscale & Audio Bitrate */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Resolution Scaling
                  </label>
                  <select
                    value={resolutionDownscale}
                    onChange={(e) => setResolutionDownscale(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="auto">Auto (Smart Fit)</option>
                    <option value="original">Keep Original</option>
                    <option value="1080p">1080p Full HD</option>
                    <option value="720p">720p HD</option>
                    <option value="480p">480p SD (High Compress)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Audio Bitrate
                  </label>
                  <select
                    value={audioBitrate}
                    onChange={(e) => setAudioBitrate(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="128k">128 kbps (Standard)</option>
                    <option value="96k">96 kbps (Speech/Web)</option>
                    <option value="64k">64 kbps (Max Savings)</option>
                    <option value="mute">Mute Audio (Silent)</option>
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
                  targetFormat="mp4"
                  onComplete={handleJobComplete}
                  onError={handleJobError}
                />
              ) : (
                <Button
                  onClick={handleStartCompression}
                  disabled={status === 'processing'}
                  className="w-full py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{status === 'processing' ? 'Compressing Video...' : 'Start Compression'}</span>
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
                  Video Compressed Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Ready to send on Discord, WhatsApp, or email attachments.
                </p>
              </div>
            </div>
            {savingsPercent > 0 && (
              <span className="px-3 py-1.5 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <TrendingDown className="w-3.5 h-3.5" />
                {savingsPercent}% Smaller File Size
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
                playsInline
                className="w-full h-full object-contain"
              />
            </div>

            {/* Right: Metrics & Download Actions */}
            <div className="md:col-span-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Original File Size</span>
                  <div className="text-base font-bold text-slate-500 line-through mt-0.5 font-mono">
                    {formatBytes(selectedFile?.size || 0)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Compressed Size</span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                    {formatBytes(conversionResult.convertedSizeBytes || 0)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Target Preset</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 capitalize">
                    {preset.replace('-', ' ')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Savings</span>
                  <div className="text-base font-bold text-emerald-500 mt-0.5 font-mono">
                    {savingsPercent}% Saved
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={conversionResult.downloadUrl}
                  download={`${selectedFile?.name.replace(/\.[^/.]+$/, '') || 'video'}-compressed.mp4`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Compressed Video</span>
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
                    <span>Compress Another</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Privacy Assurance Badge */}
      <PrivacyAssuranceBadge
        customTitle="Hardware H.264 FastStart Bitrate Optimization"
        customDescription="Two-pass rate control and audio stream optimization guarantee compliance with Discord (8MB/25MB) and WhatsApp (16MB) limits."
      />

      {/* 6. Next Action Recommendations */}
      <NextActionRecommendations
        categorySlug="video"
        currentSlug={tool?.slug || 'compress-video'}
      />
    </div>
  );
};
