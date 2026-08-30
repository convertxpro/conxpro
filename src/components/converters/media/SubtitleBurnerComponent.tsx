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
  Type,
  Palette,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
  Video,
  Layers,
  Smartphone,
  Tv,
  Eye,
  CheckCircle2,
  FileCode,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

interface SubtitleBurnerComponentProps {
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
    desc: 'Bold yellow & white font with heavy black stroke optimized for mobile social feeds.',
    icon: Smartphone,
    fontName: 'Impact',
    fontSize: 32,
    primaryColor: '#FFE600',
    outlineColor: '#000000',
    outlineThickness: 4,
    alignment: 2,
    marginV: 50,
  },
  cinematic: {
    id: 'cinematic',
    name: 'Cinematic Movie',
    badge: 'Film / 16:9',
    desc: 'Classic clean serif typography with subtle black outline for documentary and narrative video.',
    icon: Tv,
    fontName: 'Georgia',
    fontSize: 22,
    primaryColor: '#FFFFFF',
    outlineColor: '#000000',
    outlineThickness: 2,
    alignment: 2,
    marginV: 35,
  },
  minimalist: {
    id: 'minimalist',
    name: 'Clean Minimalist',
    badge: 'Modern Sans',
    desc: 'Sleek neutral sans-serif with subtle contrast for corporate and educational content.',
    icon: Type,
    fontName: 'Arial',
    fontSize: 20,
    primaryColor: '#FFFFFF',
    outlineColor: '#000000',
    outlineThickness: 1,
    alignment: 2,
    marginV: 25,
  },
  custom: {
    id: 'custom',
    name: 'Custom Styling',
    badge: 'Pro Studio',
    desc: 'Full manual control over typography, color palettes, border thickness, and margins.',
    icon: Sliders,
    fontName: 'Arial',
    fontSize: 24,
    primaryColor: '#FFFFFF',
    outlineColor: '#000000',
    outlineThickness: 2,
    alignment: 2,
    marginV: 30,
  },
};

const SAMPLE_SUBTITLE = `1
00:00:00,500 --> 00:00:03,000
Transform your video with baked-in subtitles!

2
00:00:03,200 --> 00:00:06,500
Perfect for TikTok, Instagram Reels & YouTube Shorts.

3
00:00:06,800 --> 00:00:10,000
100% synced with custom fonts, colors & outlines.`;

const FONT_OPTIONS = [
  { label: 'Impact (Viral / Heavy)', value: 'Impact' },
  { label: 'Arial (Clean Sans)', value: 'Arial' },
  { label: 'Montserrat / Trebuchet', value: 'Trebuchet MS' },
  { label: 'Georgia (Cinematic Serif)', value: 'Georgia' },
  { label: 'Verdana (High Legibility)', value: 'Verdana' },
  { label: 'Courier New (Monospace)', value: 'Courier New' },
];

export const SubtitleBurnerComponent: React.FC<SubtitleBurnerComponentProps> = ({ tool }) => {
  // Video file & preview
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Subtitle file & content
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null);
  const [subtitleText, setSubtitleText] = useState<string>(SAMPLE_SUBTITLE);
  const [subtitleTab, setSubtitleTab] = useState<'upload' | 'editor'>('upload');

  // Styling settings
  const [selectedPreset, setSelectedPreset] = useState<SubtitlePreset>('viral-reels');
  const [fontName, setFontName] = useState<string>(PRESET_CONFIGS['viral-reels'].fontName);
  const [fontSize, setFontSize] = useState<number>(PRESET_CONFIGS['viral-reels'].fontSize);
  const [primaryColor, setPrimaryColor] = useState<string>(PRESET_CONFIGS['viral-reels'].primaryColor);
  const [outlineColor, setOutlineColor] = useState<string>(PRESET_CONFIGS['viral-reels'].outlineColor);
  const [outlineThickness, setOutlineThickness] = useState<number>(PRESET_CONFIGS['viral-reels'].outlineThickness);
  const [alignment, setAlignment] = useState<number>(PRESET_CONFIGS['viral-reels'].alignment);
  const [marginV, setMarginV] = useState<number>(PRESET_CONFIGS['viral-reels'].marginV);

  // Processing state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  // When a preset is chosen, update style variables
  const applyPreset = (presetId: SubtitlePreset) => {
    setSelectedPreset(presetId);
    const cfg = PRESET_CONFIGS[presetId];
    setFontName(cfg.fontName);
    setFontSize(cfg.fontSize);
    setPrimaryColor(cfg.primaryColor);
    setOutlineColor(cfg.outlineColor);
    setOutlineThickness(cfg.outlineThickness);
    setAlignment(cfg.alignment);
    setMarginV(cfg.marginV);
  };

  // Parse cues for real-time video overlay preview
  const parsedCues = useMemo<SubtitleCue[]>(() => {
    try {
      return parseSubtitles(subtitleText);
    } catch {
      return [];
    }
  }, [subtitleText]);

  // Find active cue at current playback timestamp
  const activeCueText = useMemo(() => {
    if (parsedCues.length === 0) return '';
    const currentMs = currentTime * 1000;
    const match = parsedCues.find((c) => currentMs >= c.startMs && currentMs <= c.endMs);
    if (match) return match.text;
    // If paused at 0 or outside range, display first cue as a preview sample
    if (currentTime <= 0.2 && parsedCues.length > 0) {
      return parsedCues[0].text;
    }
    return '';
  }, [parsedCues, currentTime]);

  // Handle video selection
  const handleVideoSelect = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setCurrentTime(0);
    setIsPlaying(false);
    setConversionResult(null);
    setErrorMessage(null);
  };

  // Handle subtitle file upload
  const handleSubtitleUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setSubtitleFile(file);
    try {
      const text = await file.text();
      setSubtitleText(text);
      setSubtitleTab('editor');
    } catch (err) {
      console.error('Error reading subtitle file:', err);
    }
  };

  // Play/Pause toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Video timeupdate handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Submit to conversion API
  const handleStartBurnIn = async () => {
    if (!videoFile) {
      setErrorMessage('Please upload a video file first.');
      return;
    }
    if (!subtitleText.trim() && !subtitleFile) {
      setErrorMessage('Please provide subtitles to burn into the video.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('toolType', 'burn-subtitles-to-video');
      formData.append('targetFormat', 'mp4');

      if (subtitleFile) {
        formData.append('subtitleFile', subtitleFile);
      }
      formData.append('subtitleContent', subtitleText);
      formData.append('fontName', fontName);
      formData.append('fontSize', fontSize.toString());
      formData.append('primaryColorHex', primaryColor);
      formData.append('outlineColorHex', outlineColor);
      formData.append('outlineThickness', outlineThickness.toString());
      formData.append('alignment', alignment.toString());
      formData.append('marginV', marginV.toString());

      const res = await fetch('/api/convert/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start subtitle burn-in task.');
      }

      setJobId(data.jobId);
    } catch (err: any) {
      console.error('Burn-in submission error:', err);
      setErrorMessage(err?.message || 'Error submitting video for subtitle burn-in.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setSubtitleFile(null);
    setSubtitleText(SAMPLE_SUBTITLE);
    setJobId(null);
    setConversionResult(null);
    setIsSubmitting(false);
    setErrorMessage(null);
  };

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
                FFmpeg Subtitles Engine
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <Captions className="w-8 h-8 text-amber-500" />
              Hardcode Subtitles to Video
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Burn SRT, WebVTT, and ASS subtitles permanently into video frames with custom viral styling, fonts, and strokes for TikTok, YouTube Shorts, and Instagram Reels.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <PrivacyAssuranceBadge variant="compact" customTitle="Encrypted Media Transcoding" />
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-start gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Processing Notice</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Conversion Lifecycle */}
      {conversionResult ? (
        /* Result Screen */
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Subtitles Burned Successfully!</h3>
                <p className="text-xs text-slate-400">
                  Ready to publish directly to TikTok, Reels, Shorts, or web players.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Burn Another Video
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Output Video Player */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl overflow-hidden min-h-[340px]">
              <video
                src={conversionResult.downloadUrl}
                controls
                autoPlay
                loop
                playsInline
                className="max-w-full max-h-[460px] rounded-xl shadow-2xl object-contain"
              />
            </div>

            {/* Output Meta & Download */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  File Summary
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Output File:</span>
                    <span className="font-semibold text-white truncate max-w-[180px]">
                      {conversionResult.targetFilename}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">File Size:</span>
                    <span className="font-bold text-emerald-400">
                      {formatBytes(conversionResult.convertedSizeBytes || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Preset Applied:</span>
                    <span className="font-semibold text-amber-400 uppercase">
                      {PRESET_CONFIGS[selectedPreset]?.name || 'Custom'}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={conversionResult.downloadUrl}
                download={conversionResult.targetFilename}
                className="block w-full"
              >
                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full py-4 text-base font-bold shadow-xl shadow-amber-500/25"
                  leftIcon={<Download className="w-5 h-5" />}
                >
                  Download Subtitled Video (MP4)
                </Button>
              </a>
            </div>
          </div>

          {/* Contextual Next Best Actions */}
          <NextActionRecommendations
            currentSlug="burn-subtitles-to-video"
            categorySlug="video"
            className="mt-6"
          />
        </div>
      ) : isSubmitting && jobId ? (
        /* Progress View */
        <MediaProcessingView
          jobId={jobId}
          originalFilename={videoFile?.name || 'video.mp4'}
          targetFormat="mp4"
          toolType="burn-subtitles-to-video"
          onComplete={(result) => {
            setConversionResult(result);
            setIsSubmitting(false);
          }}
          onError={(err) => {
            setErrorMessage(err);
            setIsSubmitting(false);
          }}
        />
      ) : (
        /* Setup / Upload View */
        <div className="space-y-8">
          {/* Top Step 1: Upload Video */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-500" />
                Step 1: Upload Base Video
              </h3>
              {videoFile && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {videoFile.name} ({formatBytes(videoFile.size)})
                </span>
              )}
            </div>

            {!videoUrl ? (
              <Dropzone
                onFilesSelected={handleVideoSelect}
                accept="video/*,.mp4,.mov,.webm,.mkv,.avi"
                multiple={false}
                maxSizeMb={100}
                acceptedFormatsText="Supports MP4, MOV, WebM, MKV, AVI (up to 100MB)"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Live Video Preview Box with Synced Subtitle Overlay */}
                <div className="md:col-span-7 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden min-h-[300px]">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={(e) => {
                      setVideoDuration(e.currentTarget.duration || 0);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="max-h-[360px] w-full rounded-xl object-contain"
                    controls
                  />

                  {/* Simulated Subtitle Overlay */}
                  {activeCueText && (
                    <div
                      className="absolute pointer-events-none px-4 text-center max-w-[90%] transition-all duration-150"
                      style={{
                        bottom: `${Math.min(marginV * 0.8, 80)}px`,
                        fontFamily: fontName,
                        fontSize: `${Math.max(14, fontSize * 0.75)}px`,
                        color: primaryColor,
                        textShadow:
                          outlineThickness > 0
                            ? `-${outlineThickness}px -${outlineThickness}px 0 ${outlineColor}, ${outlineThickness}px -${outlineThickness}px 0 ${outlineColor}, -${outlineThickness}px ${outlineThickness}px 0 ${outlineColor}, ${outlineThickness}px ${outlineThickness}px 0 ${outlineColor}, 0px 2px 4px rgba(0,0,0,0.8)`
                            : '0px 2px 4px rgba(0,0,0,0.8)',
                        fontWeight: selectedPreset === 'viral-reels' ? '900' : '700',
                        lineHeight: 1.25,
                      }}
                    >
                      {activeCueText}
                    </div>
                  )}
                </div>

                {/* Video Info & Replace */}
                <div className="md:col-span-5 space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Video Stream</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{videoFile?.name}</p>
                    <div className="flex gap-4 text-xs text-slate-500">
                      <span>Size: {formatBytes(videoFile?.size || 0)}</span>
                      <span>Duration: {Math.round(videoDuration)}s</span>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setVideoFile(null);
                      setVideoUrl(null);
                    }}
                    leftIcon={<RotateCcw className="w-4 h-4" />}
                  >
                    Change Video File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Subtitle Source (Upload or Edit) */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-500" />
                Step 2: Subtitle File / Script
              </h3>

              <div className="flex gap-1 p-1 rounded-xl bg-slate-200 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setSubtitleTab('upload')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    subtitleTab === 'upload'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Upload File (.srt, .vtt)
                </button>
                <button
                  type="button"
                  onClick={() => setSubtitleTab('editor')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    subtitleTab === 'editor'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Subtitle Script Editor ({parsedCues.length} Cues)
                </button>
              </div>
            </div>

            {subtitleTab === 'upload' ? (
              <Dropzone
                onFilesSelected={handleSubtitleUpload}
                accept=".srt,.vtt,.ass,.txt"
                multiple={false}
                maxSizeMb={10}
                acceptedFormatsText="Drop subtitle file (.srt, .vtt, .ass) here, or switch to Editor"
              />
            ) : (
              <div className="space-y-2">
                <textarea
                  value={subtitleText}
                  onChange={(e) => setSubtitleText(e.target.value)}
                  rows={7}
                  className="w-full font-mono text-xs p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Paste SRT or WebVTT content here..."
                />
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
                  <span>Parsed {parsedCues.length} subtitle cues</span>
                  <button
                    type="button"
                    onClick={() => setSubtitleText(SAMPLE_SUBTITLE)}
                    className="text-amber-600 dark:text-amber-400 font-semibold hover:underline"
                  >
                    Reset to Sample Script
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Styling Presets & Typography Engine */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-amber-500" />
                Step 3: Styling Presets & Typography
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose a viral platform preset or customize fonts, stroke outlines, and vertical alignment.
              </p>
            </div>

            {/* Preset Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(PRESET_CONFIGS) as SubtitlePreset[]).map((presetKey) => {
                const cfg = PRESET_CONFIGS[presetKey];
                const IconComponent = cfg.icon;
                const isSelected = selectedPreset === presetKey;

                return (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => applyPreset(presetKey)}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 dark:bg-amber-500/15'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <IconComponent className="w-5 h-5" />
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {cfg.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cfg.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{cfg.desc}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/40 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-400">{cfg.fontName} • {cfg.fontSize}px</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Style Sliders & Color Controls */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Advanced Typography & Layout Controls
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Font Family */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Font Family</label>
                  <select
                    value={fontName}
                    onChange={(e) => {
                      setFontName(e.target.value);
                      setSelectedPreset('custom');
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Font Size Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Font Size</span>
                    <span className="text-amber-500 font-mono">{fontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={16}
                    max={54}
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(parseInt(e.target.value, 10));
                      setSelectedPreset('custom');
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Vertical Margin Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Vertical Offset (Margin)</span>
                    <span className="text-amber-500 font-mono">{marginV}px</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={120}
                    value={marginV}
                    onChange={(e) => {
                      setMarginV(parseInt(e.target.value, 10));
                      setSelectedPreset('custom');
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                {/* Primary Text Color */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Text Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setSelectedPreset('custom');
                      }}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setSelectedPreset('custom');
                      }}
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Outline Stroke Color */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Stroke Outline Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={outlineColor}
                      onChange={(e) => {
                        setOutlineColor(e.target.value);
                        setSelectedPreset('custom');
                      }}
                      className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={outlineColor}
                      onChange={(e) => {
                        setOutlineColor(e.target.value);
                        setSelectedPreset('custom');
                      }}
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Outline Thickness */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">Stroke Outline Thickness</span>
                    <span className="text-amber-500 font-mono">{outlineThickness}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={6}
                    value={outlineThickness}
                    onChange={(e) => {
                      setOutlineThickness(parseInt(e.target.value, 10));
                      setSelectedPreset('custom');
                    }}
                    className="w-full accent-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleStartBurnIn}
              disabled={!videoFile || (!subtitleText.trim() && !subtitleFile)}
              className="w-full py-4 text-base font-bold shadow-xl shadow-amber-500/25"
              leftIcon={<Captions className="w-5 h-5" />}
            >
              Burn Subtitles into Video (FFmpeg Accelerated)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
