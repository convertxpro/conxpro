/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { MediaProcessingView } from '@/components/conversion/MediaProcessingView';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { ToolMetadata } from '@/config/categories';
import { formatBytes } from '@/lib/utils';
import { parseSubtitles, SubtitleCue } from '@/lib/converters/media/subtitles-engine';
import {
  Captions,
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sliders,
  Palette,
  Check,
  AlertCircle,
  Video,
  Layers,
  Smartphone,
  CheckCircle2,
  FileCode,
  Copy,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

interface BurnSubtitlesComponentProps {
  tool?: ToolMetadata;
}

export type SubtitlePreset = 'viral-reels' | 'cinematic' | 'minimalist' | 'custom';

interface PresetConfig {
  id: SubtitlePreset;
  name: string;
  badge: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  fontName: string;
  fontSize: number;
  primaryColor: string;
  outlineColor: string;
  outlineThickness: number;
  alignment: number; // 2 = bottom center, 6 = top center, 10 = middle
  marginV: number;
}

const PRESET_CONFIGS: Record<SubtitlePreset, PresetConfig> = {
  'viral-reels': {
    id: 'viral-reels',
    name: 'Viral Reels & Shorts',
    badge: 'TikTok / Reels',
    desc: 'Bold yellow text with thick black outline centered at bottom',
    icon: Smartphone,
    fontName: 'Outfit',
    fontSize: 28,
    primaryColor: '#facc15',
    outlineColor: '#000000',
    outlineThickness: 4,
    alignment: 2,
    marginV: 60,
  },
  'cinematic': {
    id: 'cinematic',
    name: 'Cinematic Movie',
    badge: 'Standard Film',
    desc: 'Clean white typography with soft outline for films & docs',
    icon: Video,
    fontName: 'Inter',
    fontSize: 22,
    primaryColor: '#ffffff',
    outlineColor: '#0f172a',
    outlineThickness: 2,
    alignment: 2,
    marginV: 40,
  },
  'minimalist': {
    id: 'minimalist',
    name: 'Modern Minimalist',
    badge: 'Clean UI',
    desc: 'High-contrast white font with subtle translucent backing',
    icon: Layers,
    fontName: 'Montserrat',
    fontSize: 20,
    primaryColor: '#f8fafc',
    outlineColor: '#1e293b',
    outlineThickness: 1,
    alignment: 2,
    marginV: 35,
  },
  'custom': {
    id: 'custom',
    name: 'Custom Studio Style',
    badge: 'Full Control',
    desc: 'Customize typography, color, stroke weight, and position',
    icon: Sliders,
    fontName: 'Outfit',
    fontSize: 26,
    primaryColor: '#facc15',
    outlineColor: '#000000',
    outlineThickness: 3,
    alignment: 2,
    marginV: 50,
  },
};

const SAMPLE_CAPTIONS = `1
00:00:00,500 --> 00:00:03,000
Turn viewers into followers with <b>hardcoded captions</b>!

2
00:00:03,200 --> 00:00:06,500
85% of social media videos are watched with the sound muted.

3
00:00:06,800 --> 00:00:10,000
Burn subtitles permanently into your MP4 video in seconds.`;

export const BurnSubtitlesComponent: React.FC<BurnSubtitlesComponentProps> = ({ tool }) => {
  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Subtitle state
  const [subtitleContent, setSubtitleContent] = useState<string>(SAMPLE_CAPTIONS);
  const [selectedPreset, setSelectedPreset] = useState<SubtitlePreset>('viral-reels');

  // Custom styling attributes
  const [fontName, setFontName] = useState<string>('Outfit');
  const [fontSize, setFontSize] = useState<number>(28);
  const [primaryColor, setPrimaryColor] = useState<string>('#facc15');
  const [outlineColor, setOutlineColor] = useState<string>('#000000');
  const [outlineThickness, setOutlineThickness] = useState<number>(4);
  const [alignment, setAlignment] = useState<number>(2); // 2: bottom, 6: top, 10: middle
  const [marginV, setMarginV] = useState<number>(60);

  // Processing state
  const [status, setStatus] = useState<'idle' | 'configured' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // Apply preset changes
  const applyPreset = (presetId: SubtitlePreset) => {
    setSelectedPreset(presetId);
    const cfg = PRESET_CONFIGS[presetId];
    if (cfg) {
      setFontName(cfg.fontName);
      setFontSize(cfg.fontSize);
      setPrimaryColor(cfg.primaryColor);
      setOutlineColor(cfg.outlineColor);
      setOutlineThickness(cfg.outlineThickness);
      setAlignment(cfg.alignment);
      setMarginV(cfg.marginV);
    }
  };

  // Parse cues for live overlay preview
  const parsedCues = useMemo<SubtitleCue[]>(() => {
    try {
      return parseSubtitles(subtitleContent);
    } catch {
      return [];
    }
  }, [subtitleContent]);

  // Find active cue at current playback time
  const activeCue = useMemo(() => {
    const timeMs = currentTime * 1000;
    return parsedCues.find((c) => timeMs >= c.startMs && timeMs <= c.endMs);
  }, [parsedCues, currentTime]);

  const handleVideoSelect = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setVideoFile(file);
    setStatus('configured');
    setErrorMessage(null);
    setConversionResult(null);

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleSubtitleSelect = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) setSubtitleContent(content);
    };
    reader.readAsText(file);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current) return;
    setVideoDuration(videoRef.current.duration || 10);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  // Submit burn subtitles job
  const handleStartBurn = async () => {
    if (!videoFile) {
      setErrorMessage('Please upload a video file first.');
      return;
    }
    if (!subtitleContent.trim()) {
      setErrorMessage('Please provide subtitle text or an SRT/VTT file.');
      return;
    }

    setStatus('processing');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('toolType', 'burn-subtitles-to-video');
      formData.append('targetFormat', 'mp4');

      const options = {
        subtitleContent: subtitleContent,
        fontName: fontName,
        fontSize: fontSize,
        primaryColorHex: primaryColor,
        outlineColorHex: outlineColor,
        outlineThickness: outlineThickness,
        alignment: alignment,
        marginV: marginV,
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
        throw new Error(data.error || 'Failed to start burning subtitles job');
      }

      setActiveJobId(data.jobId);
    } catch (err: any) {
      console.error('Hardcoding subtitles failed:', err);
      setErrorMessage(err.message || 'An error occurred while burning subtitles.');
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
    setVideoFile(null);
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

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            <Captions className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Hardcode Subtitles to Video
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                TikTok & Reels Ready
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Burn SRT and VTT subtitles permanently into video frames with custom typography, viral styling presets, and live in-browser preview.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Upload Workspace when idle */}
      {status === 'idle' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Video Dropzone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <Video className="w-4 h-4 text-amber-500" />
              <span>1. Upload Video File (MP4, MOV, WebM)</span>
            </div>
            <Dropzone
              onFilesSelected={handleVideoSelect}
              accept="video/*, .mp4, .webm, .mov"
              maxSizeMb={100}
              multiple={false}
            />
          </div>

          {/* Subtitle Dropzone */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
              <FileCode className="w-4 h-4 text-amber-500" />
              <span>2. Upload Subtitles (.SRT or .VTT)</span>
            </div>
            <Dropzone
              onFilesSelected={handleSubtitleSelect}
              accept=".srt, .vtt, text/plain"
              multiple={false}
            />
            <p className="text-[11px] text-slate-500">
              Tip: You can also edit and fine-tune captions directly in the live editor on the next step.
            </p>
          </div>
        </div>
      )}

      {/* 3. Studio Workspace & Synchronized Live Overlay */}
      {(status === 'configured' || status === 'processing' || status === 'error') && videoUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Synchronized Video Preview Player (7 cols) */}
          <div className="lg:col-span-7 space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                  {videoFile?.name}
                </span>
                <span className="text-xs text-slate-500">
                  ({formatBytes(videoFile?.size || 0)})
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

            {/* Video Player with Live Subtitle Overlay */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner group">
              <video
                ref={videoRef}
                src={videoUrl}
                onLoadedMetadata={onLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                playsInline
                className="w-full h-full object-contain"
              />

              {/* Live Rendered Subtitle Overlay on top of video */}
              {activeCue && (
                <div
                  className="absolute z-20 px-4 text-center pointer-events-none transition-all duration-75"
                  style={{
                    bottom: alignment === 2 ? `${marginV}px` : undefined,
                    top: alignment === 6 ? `${marginV}px` : undefined,
                    left: 0,
                    right: 0,
                    fontFamily: fontName,
                    fontSize: `${fontSize}px`,
                    fontWeight: 'bold',
                    color: primaryColor,
                    textShadow:
                      outlineThickness > 0
                        ? `-${outlineThickness}px -${outlineThickness}px 0 ${outlineColor}, ${outlineThickness}px -${outlineThickness}px 0 ${outlineColor}, -${outlineThickness}px ${outlineThickness}px 0 ${outlineColor}, ${outlineThickness}px ${outlineThickness}px 0 ${outlineColor}, 0 2px 8px rgba(0,0,0,0.8)`
                        : '0 2px 6px rgba(0,0,0,0.8)',
                    lineHeight: 1.25,
                  }}
                  dangerouslySetInnerHTML={{ __html: activeCue.text }}
                />
              )}

              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 hover:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="p-3.5 rounded-full bg-amber-500 text-slate-950 shadow-2xl">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
                </div>
              </button>

              {/* Playback time */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 text-white font-mono text-xs">
                {currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
              </div>
            </div>

            {/* Captions Textarea Editor */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Subtitle Script (SRT / VTT Format)
                </span>
                <span>{parsedCues.length} Cues Detected</span>
              </div>
              <textarea
                value={subtitleContent}
                onChange={(e) => setSubtitleContent(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Paste SRT or VTT captions here..."
              />
            </div>
          </div>

          {/* Right Column: Styling Controls & Preset Options (5 cols) */}
          <div className="lg:col-span-5 space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Palette className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Subtitle Styling Presets
                </h3>
              </div>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-2.5">
                {Object.values(PRESET_CONFIGS).map((cfg) => {
                  const IconComp = cfg.icon;
                  const isSelected = selectedPreset === cfg.id;
                  return (
                    <button
                      key={cfg.id}
                      type="button"
                      onClick={() => applyPreset(cfg.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IconComp className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-xs font-bold">{cfg.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5 truncate">
                        {cfg.badge}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Typography Controls */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Font Family
                    </label>
                    <select
                      value={fontName}
                      onChange={(e) => setFontName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      <option value="Outfit">Outfit (Bold Sans)</option>
                      <option value="Inter">Inter (Clean)</option>
                      <option value="Montserrat">Montserrat (Modern)</option>
                      <option value="Arial">Arial (Standard)</option>
                      <option value="Impact">Impact (Heavy)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                      <span>Font Size</span>
                      <span className="text-amber-500 font-mono">{fontSize}px</span>
                    </label>
                    <input
                      type="range"
                      min={16}
                      max={48}
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg mt-2"
                    />
                  </div>
                </div>

                {/* Color & Stroke Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Text Color
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono">{primaryColor}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Outline Color
                    </label>
                    <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <input
                        type="color"
                        value={outlineColor}
                        onChange={(e) => setOutlineColor(e.target.value)}
                        className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <span className="text-xs font-mono">{outlineColor}</span>
                    </div>
                  </div>
                </div>

                {/* Outline Thickness & Position */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                      <span>Outline Stroke</span>
                      <span className="text-amber-500 font-mono">{outlineThickness}px</span>
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      value={outlineThickness}
                      onChange={(e) => setOutlineThickness(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg mt-2"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                      <span>Bottom Margin</span>
                      <span className="text-amber-500 font-mono">{marginV}px</span>
                    </label>
                    <input
                      type="range"
                      min={20}
                      max={120}
                      value={marginV}
                      onChange={(e) => setMarginV(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg mt-2"
                    />
                  </div>
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
                  originalFilename={videoFile?.name || 'video.mp4'}
                  targetFormat="mp4"
                  onComplete={handleJobComplete}
                  onError={handleJobError}
                />
              ) : (
                <Button
                  onClick={handleStartBurn}
                  disabled={status === 'processing'}
                  className="w-full py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{status === 'processing' ? 'Burning Subtitles...' : 'Burn Subtitles to MP4'}</span>
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
                  Subtitles Hardcoded Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Your video is permanently burned with styled captions for social media platforms.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              H.264 Hardcoded MP4
            </span>
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
                  <span className="text-[11px] text-slate-400 font-medium">Style Preset</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {PRESET_CONFIGS[selectedPreset]?.name || 'Custom'}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Font Family</span>
                  <div className="text-base font-bold text-amber-500 mt-0.5">
                    {fontName}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Cues Burned</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {parsedCues.length} Lines
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">File Size</span>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5 font-mono">
                    {formatBytes(conversionResult.convertedSizeBytes || 0)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={conversionResult.downloadUrl}
                  download={`${videoFile?.name.replace(/\.[^/.]+$/, '') || 'video'}-captioned.mp4`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Hardcoded Video</span>
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
                    <span>Burn Another Video</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Privacy Assurance Badge */}
      <PrivacyAssuranceBadge
        customTitle="Frame-Accurate Subtitle Burning"
        customDescription="Subtitles are rendered and burned frame-by-frame with hardware-accelerated video rendering. Your media files remain strictly private."
      />

      {/* 6. Next Action Recommendations */}
      <NextActionRecommendations
        categorySlug="video"
        currentSlug="burn-subtitles-to-video"
      />
    </div>
  );
};
