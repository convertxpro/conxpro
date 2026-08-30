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
  VolumeX,
  Volume2,
  Music,
  Video,
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  Zap,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
  Sliders,
  CheckCircle2,
  Layers,
  Clock,
  Radio,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

interface VideoMuterComponentProps {
  tool?: ToolMetadata;
  initialMode?: 'mute' | 'replace';
}

export const VideoMuterComponent: React.FC<VideoMuterComponentProps> = ({
  tool,
  initialMode = 'mute',
}) => {
  const [activeMode, setActiveMode] = useState<'mute' | 'replace'>(initialMode);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio replacement state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [audioBitrate, setAudioBitrate] = useState<string>('192k');
  const audioRef = useRef<HTMLAudioElement>(null);

  // Conversion / Processing state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [videoUrl, audioUrl]);

  // Handle video upload
  const handleVideoSelect = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setConversionResult(null);
    setErrorMessage(null);
  };

  // Handle audio upload
  const handleAudioSelect = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioUrl(url);
  };

  // Submit to API
  const handleProcess = async () => {
    if (!videoFile) {
      setErrorMessage('Please upload a video file first.');
      return;
    }
    if (activeMode === 'replace' && !audioFile) {
      setErrorMessage('Please upload a replacement audio track (.mp3, .wav, etc.).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('toolType', 'mute-video-replace-audio');
      formData.append('targetFormat', 'mp4');
      formData.append('muteOnly', activeMode === 'mute' ? 'true' : 'false');

      if (activeMode === 'replace' && audioFile) {
        formData.append('audioFile', audioFile);
        formData.append('bitrate', audioBitrate);
      }

      const res = await fetch('/api/convert/media', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to initialize video processing task.');
      }

      setJobId(data.jobId);
    } catch (err: any) {
      console.error('Video muter/replacer submission error:', err);
      setErrorMessage(err?.message || 'Error processing video.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setAudioFile(null);
    setAudioUrl(null);
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
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-900/60 dark:bg-slate-800/80 text-slate-300 border border-slate-700/50 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                Lossless Stream Copy (0ms Re-encode)
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
              <VolumeX className="w-8 h-8 text-amber-500" />
              Lossless Video Muter & Audio Replacer
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Instantly strip audio tracks or replace background music in MP4, MOV, and WebM videos in under 2 seconds without re-encoding video streams or losing pixel quality.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <PrivacyAssuranceBadge variant="compact" customTitle="Encrypted Media Transcoding" />
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setActiveMode('mute')}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-4 ${
            activeMode === 'mute'
              ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 dark:bg-amber-500/15'
              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl shrink-0 ${activeMode === 'mute' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            <VolumeX className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Mode A: Instant Lossless Mute</h3>
              {activeMode === 'mute' && <Check className="w-4 h-4 text-amber-500" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Strips all audio streams in &lt; 2 seconds without re-encoding video frames. Preserves 100% 4K/60fps video quality.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('replace')}
          className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden flex items-start gap-4 ${
            activeMode === 'replace'
              ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 dark:bg-amber-500/15'
              : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl shrink-0 ${activeMode === 'replace' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
            <Music className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Mode B: Replace Background Audio</h3>
              {activeMode === 'replace' && <Check className="w-4 h-4 text-amber-500" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Swap original audio with new music or voiceover (.mp3, .wav) with instant stream multiplexing.
            </p>
          </div>
        </button>
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
                <h3 className="text-lg font-bold text-white">
                  {activeMode === 'mute' ? 'Video Audio Successfully Stripped!' : 'Audio Track Successfully Replaced!'}
                </h3>
                <p className="text-xs text-slate-400">
                  Lossless video stream copied with 100% original pixel clarity.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Process Another Video
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
                  Stream Performance Metrics
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Output File:</span>
                    <span className="font-semibold text-white truncate max-w-[180px]">
                      {conversionResult.targetFilename}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-700/50">
                    <span className="text-slate-400">Result File Size:</span>
                    <span className="font-bold text-emerald-400">
                      {formatBytes(conversionResult.convertedSizeBytes || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Video Encoding:</span>
                    <span className="font-semibold text-emerald-400">
                      Lossless Stream Copy (0 Quality Loss)
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
                  Download Output Video (MP4)
                </Button>
              </a>
            </div>
          </div>

          {/* Contextual Next Best Actions */}
          <NextActionRecommendations
            currentSlug="mute-video-replace-audio"
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
          toolType="mute-video-replace-audio"
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
          {/* Step 1: Video File */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-500" />
                Step 1: Upload Video File
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
                <div className="md:col-span-7 flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden min-h-[260px]">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    onLoadedMetadata={(e) => {
                      setVideoDuration(e.currentTarget.duration || 0);
                    }}
                    className="max-h-[320px] w-full rounded-xl object-contain"
                    controls
                  />
                </div>

                <div className="md:col-span-5 space-y-4">
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Target Video</p>
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
                    Change Video
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Audio Replacement Track (Only in Replace Mode) */}
          {activeMode === 'replace' && (
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Music className="w-5 h-5 text-amber-500" />
                  Step 2: Upload New Background Audio Track
                </h3>
                {audioFile && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    {audioFile.name} ({formatBytes(audioFile.size)})
                  </span>
                )}
              </div>

              {!audioUrl ? (
                <Dropzone
                  onFilesSelected={handleAudioSelect}
                  accept="audio/*,.mp3,.wav,.aac,.m4a,.flac,.ogg"
                  multiple={false}
                  maxSizeMb={50}
                  acceptedFormatsText="Supports MP3, WAV, AAC, M4A, FLAC, OGG"
                />
              ) : (
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{audioFile?.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {formatBytes(audioFile?.size || 0)} • High Quality AAC stream
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAudioFile(null);
                        setAudioUrl(null);
                      }}
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                    >
                      Change Audio
                    </Button>
                  </div>

                  <audio ref={audioRef} src={audioUrl} controls className="w-full" />

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">Output Audio Quality:</span>
                    <div className="flex gap-2">
                      {['128k', '192k', '256k', '320k'].map((br) => (
                        <button
                          key={br}
                          type="button"
                          onClick={() => setAudioBitrate(br)}
                          className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                            audioBitrate === br
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {br}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            <Button
              variant="gradient"
              size="lg"
              onClick={handleProcess}
              disabled={!videoFile || (activeMode === 'replace' && !audioFile)}
              className="w-full py-4 text-base font-bold shadow-xl shadow-amber-500/25"
              leftIcon={activeMode === 'mute' ? <VolumeX className="w-5 h-5" /> : <Music className="w-5 h-5" />}
            >
              {activeMode === 'mute'
                ? 'Mute Video Losslessly (< 2s)'
                : 'Replace Video Audio Stream Losslessly'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
