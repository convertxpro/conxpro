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
  Sparkles,
  Play,
  Pause,
  Download,
  RotateCcw,
  Sliders,
  Check,
  AlertCircle,
  Video,
  CheckCircle2,
  Copy,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

interface VideoAudioMuterComponentProps {
  tool?: ToolMetadata;
  initialMode?: 'mute' | 'replace' | 'extract';
}

type AudioMode = 'mute' | 'replace' | 'extract';

export const VideoAudioMuterComponent: React.FC<VideoAudioMuterComponentProps> = ({
  tool,
  initialMode = 'mute',
}) => {
  const [activeMode, setActiveMode] = useState<AudioMode>(initialMode);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Audio replacement state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(100);
  const [audioBitrate, setAudioBitrate] = useState<string>('320k');

  // Processing state
  const [status, setStatus] = useState<'idle' | 'configured' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleVideoSelect = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setVideoFile(file);
    setStatus('configured');
    setErrorMessage(null);
    setResultData(null);

    const url = URL.createObjectURL(file);
    setVideoUrl(url);
  };

  const handleAudioSelect = (files: File[]) => {
    if (!files || files.length === 0) return;
    setAudioFile(files[0]);
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

  const handleProcess = async () => {
    if (!videoFile) {
      setErrorMessage('Please upload a video file.');
      return;
    }

    if (activeMode === 'replace' && !audioFile) {
      setErrorMessage('Please upload a replacement audio track (.mp3, .wav, .m4a).');
      return;
    }

    setStatus('processing');
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      if (activeMode === 'replace' && audioFile) {
        formData.append('audioFile', audioFile);
      }

      if (activeMode === 'extract') {
        formData.append('toolType', 'audio-extract');
        formData.append('targetFormat', 'mp3');
      } else {
        formData.append('toolType', 'video-mute-replace');
        formData.append('targetFormat', 'mp4');
      }

      const options = {
        mode: activeMode,
        volume: audioVolume,
        bitrate: audioBitrate,
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
        throw new Error(data.error || 'Failed to start processing job');
      }

      setJobId(data.jobId);
    } catch (err: any) {
      console.error('Audio processing failed:', err);
      setErrorMessage(err.message || 'An error occurred while processing the audio.');
      setStatus('error');
    }
  };

  const handleJobComplete = (result: any) => {
    setResultData(result);
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
    setAudioFile(null);
    setStatus('idle');
    setErrorMessage(null);
    setJobId(null);
    setResultData(null);
    setCopied(false);
  };

  const handleCopyLink = () => {
    if (!resultData?.downloadUrl) return;
    const fullUrl = resultData.downloadUrl.startsWith('http')
      ? resultData.downloadUrl
      : `${window.location.origin}${resultData.downloadUrl}`;
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
            <VolumeX className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Mute Video & Replace Audio Track
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Lossless Video Copy
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Remove audio tracks instantly, swap background music without quality degradation, or extract 320kbps MP3 audio.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Mode Switcher */}
      <div className="grid grid-cols-3 gap-3 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveMode('mute')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'mute'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <VolumeX className="w-4 h-4" />
          <span>Mute Video (Silent)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('replace')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'replace'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Replace Soundtrack</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveMode('extract')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === 'extract'
              ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm border border-slate-200 dark:border-slate-700'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Extract MP3 Audio</span>
        </button>
      </div>

      {/* 3. Upload Workspace when idle */}
      {status === 'idle' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-white">
            <Video className="w-4 h-4 text-amber-500" />
            <span>Upload Video File (MP4, MOV, WebM, MKV, AVI)</span>
          </div>
          <Dropzone
            onFilesSelected={handleVideoSelect}
            accept="video/*, .mp4, .webm, .mov, .mkv, .avi"
            maxSizeMb={100}
            multiple={false}
          />
        </div>
      )}

      {/* 4. Configuration & Studio Workspace */}
      {(status === 'configured' || status === 'processing' || status === 'error') && videoFile && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Video Preview Player (6 cols) */}
          <div className="lg:col-span-6 space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[240px]">
                  {videoFile.name}
                </span>
                <span className="text-xs text-slate-500">
                  ({formatBytes(videoFile.size)})
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
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-inner group">
              {videoUrl && (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  onLoadedMetadata={onLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}

              {/* Play/Pause Button */}
              <button
                type="button"
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <div className="p-3.5 rounded-full bg-amber-500 text-slate-950 shadow-2xl">
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 translate-x-0.5" />}
                </div>
              </button>

              {/* Timestamp */}
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 text-white font-mono text-xs">
                {currentTime.toFixed(1)}s / {videoDuration.toFixed(1)}s
              </div>
            </div>
          </div>

          {/* Right Column: Audio Track Settings & Actions (6 cols) */}
          <div className="lg:col-span-6 space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Audio Track Settings</span>
              </h3>

              {/* Mode: Replace Background Music */}
              {activeMode === 'replace' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-amber-500" />
                      <span>Upload Replacement Audio (.mp3, .wav, .m4a, .aac)</span>
                    </label>
                    <Dropzone
                      onFilesSelected={handleAudioSelect}
                      accept="audio/*, .mp3, .wav, .m4a, .aac, .flac, .ogg"
                      multiple={false}
                      className="py-4"
                    />
                    {audioFile && (
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <span className="font-semibold truncate">{audioFile.name}</span>
                        <span className="text-[10px]">({formatBytes(audioFile.size)})</span>
                      </div>
                    )}
                  </div>

                  {/* Volume Slider & Bitrate */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                        <span>Audio Volume</span>
                        <span className="text-amber-500 font-mono font-bold">{audioVolume}%</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={200}
                        step={5}
                        value={audioVolume}
                        onChange={(e) => setAudioVolume(parseInt(e.target.value, 10))}
                        className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg mt-2"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Audio Bitrate
                      </label>
                      <select
                        value={audioBitrate}
                        onChange={(e) => setAudioBitrate(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="320k">320 kbps (High Fidelity)</option>
                        <option value="192k">192 kbps (Standard CD)</option>
                        <option value="128k">128 kbps (Lightweight)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode: Mute Video */}
              {activeMode === 'mute' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <VolumeX className="w-4 h-4" />
                    <span>Silent Video Mode Active</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    All existing audio channels (stereo, 5.1 surround) will be completely removed. Video stream will be copied losslessly without compression artifacts.
                  </p>
                </div>
              )}

              {/* Mode: Extract Audio */}
              {activeMode === 'extract' && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <Volume2 className="w-4 h-4" />
                    <span>Audio Extraction Mode Active</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Extracts and exports the embedded audio track into a standalone 320kbps MP3 audio file.
                  </p>
                </div>
              )}

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
              {status === 'processing' && jobId ? (
                <MediaProcessingView
                  jobId={jobId}
                  originalFilename={videoFile?.name || 'video.mp4'}
                  targetFormat={activeMode === 'extract' ? 'mp3' : 'mp4'}
                  onComplete={handleJobComplete}
                  onError={handleJobError}
                />
              ) : (
                <Button
                  onClick={handleProcess}
                  disabled={status === 'processing'}
                  className="w-full py-3.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {status === 'processing'
                      ? 'Processing...'
                      : activeMode === 'mute'
                      ? 'Remove Audio (Mute Video)'
                      : activeMode === 'replace'
                      ? 'Replace Audio Track'
                      : 'Extract MP3 Audio'}
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. Completed Result View */}
      {status === 'completed' && resultData?.downloadUrl && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activeMode === 'mute'
                    ? 'Video Muted Successfully!'
                    : activeMode === 'replace'
                    ? 'Soundtrack Replaced Successfully!'
                    : 'Audio Extracted Successfully!'}
                </h3>
                <p className="text-xs text-slate-500">
                  Ready for instant download and streaming.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Left Preview */}
            <div className="md:col-span-6 rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-2xl">
              {activeMode === 'extract' ? (
                <div className="p-6 text-center space-y-3">
                  <Volume2 className="w-12 h-12 mx-auto text-amber-500 animate-pulse" />
                  <audio src={resultData.downloadUrl} controls className="w-full" />
                </div>
              ) : (
                <video
                  src={resultData.downloadUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Right: Metrics & Download Actions */}
            <div className="md:col-span-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <span className="text-[11px] text-slate-400 font-medium">Original Size</span>
                  <div className="text-base font-bold text-slate-500 line-through mt-0.5 font-mono">
                    {formatBytes(videoFile?.size || 0)}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Output Size</span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                    {formatBytes(resultData.convertedSizeBytes || 0)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={resultData.downloadUrl}
                  download={
                    activeMode === 'extract'
                      ? `${videoFile?.name.replace(/\.[^/.]+$/, '') || 'audio'}.mp3`
                      : `${videoFile?.name.replace(/\.[^/.]+$/, '') || 'video'}-${activeMode}.mp4`
                  }
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    Download {activeMode === 'extract' ? 'MP3 Audio' : 'Processed MP4 Video'}
                  </span>
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
                    <span>Process Another</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Privacy Assurance Badge */}
      <PrivacyAssuranceBadge
        customTitle="Lossless Stream Demuxing & Audio Replacement"
        customDescription="Audio streams are demuxed and remuxed with zero video degradation and strict memory isolation."
      />

      {/* 7. Next Action Recommendations */}
      <NextActionRecommendations
        categorySlug="video"
        currentSlug={tool?.slug || 'mute-video-replace-audio'}
      />
    </div>
  );
};
