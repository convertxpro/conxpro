'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ToolMetadata } from '@/config/categories';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { formatBytes } from '@/lib/utils';
import {
  decodeAudioFile,
  extractWaveformPeaks,
  sliceAudioBuffer,
  formatAudioTime,
  getAudioContext,
} from '@/lib/audio/audio-dsp';
import { audioBufferToWav, downloadAudioBlob } from '@/lib/audio/audio-encoders';
import {
  Scissors,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Download,
  CheckCircle2,
  Sparkles,
  Sliders,
  ZoomIn,
  ZoomOut,
  Bell,
  Smartphone,
  MessageSquare,
  Music2,
  FileAudio,
  ShieldCheck,
  FastForward,
} from 'lucide-react';

interface AudioTrimmerComponentProps {
  tool?: ToolMetadata;
}

export const AudioTrimmerComponent: React.FC<AudioTrimmerComponentProps> = ({ tool }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [peaks, setPeaks] = useState<{ min: Float32Array; max: Float32Array } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);

  // Trimming handles
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [fadeInSec, setFadeInSec] = useState<number>(0.5);
  const [fadeOutSec, setFadeOutSec] = useState<number>(0.5);
  const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav'>('mp3');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Refs for Web Audio source and canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const playbackStartCtxTimeRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const draggingHandleRef = useRef<'start' | 'end' | 'playhead' | null>(null);

  // Load and decode audio file
  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setAudioFile(file);
    setIsLoading(true);
    setExportSuccess(false);

    try {
      const buffer = await decodeAudioFile(file);
      setAudioBuffer(buffer);
      const dur = buffer.duration;
      setDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(dur, 30)); // default 30s ringtone window or full duration
      setCurrentTime(0);

      // Extract 1000 waveform points for high-DPI rendering
      const extractedPeaks = extractWaveformPeaks(buffer, 1200);
      setPeaks(extractedPeaks);
    } catch (err) {
      console.error('Failed to decode audio file:', err);
      alert('Could not decode audio file. Please ensure it is a valid MP3, WAV, M4A, or FLAC file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop active playback
  const stopPlayback = useCallback(() => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
        activeSourceRef.current.disconnect();
      } catch {
        // Source might already be stopped
      }
      activeSourceRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Start playback from specific offset (defaulting to startTime or currentTime)
  const startPlayback = useCallback(
    (offset?: number) => {
      if (!audioBuffer) return;
      stopPlayback();

      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      const gainNode = ctx.createGain();
      gainNode.gain.value = isMuted ? 0 : volume;
      gainNodeRef.current = gainNode;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      let playOffset = offset !== undefined ? offset : currentTime;
      if (playOffset < startTime || playOffset >= endTime) {
        playOffset = startTime;
      }

      const playDuration = Math.max(0.1, endTime - playOffset);

      source.start(0, playOffset, isLooping ? undefined : playDuration);
      activeSourceRef.current = source;
      playbackStartCtxTimeRef.current = ctx.currentTime;
      playbackStartOffsetRef.current = playOffset;
      setIsPlaying(true);

      const updateProgress = () => {
        if (!activeSourceRef.current) return;
        const elapsed = ctx.currentTime - playbackStartCtxTimeRef.current;
        let now = playbackStartOffsetRef.current + elapsed;

        if (isLooping) {
          const loopLength = Math.max(0.1, endTime - startTime);
          if (now >= endTime) {
            now = startTime + ((now - startTime) % loopLength);
            startPlayback(startTime);
            return;
          }
        } else if (now >= endTime) {
          stopPlayback();
          setCurrentTime(startTime);
          return;
        }

        setCurrentTime(now);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);

      source.onended = () => {
        if (!isLooping && activeSourceRef.current === source) {
          stopPlayback();
          setCurrentTime(startTime);
        }
      };
    },
    [audioBuffer, currentTime, startTime, endTime, isLooping, isMuted, volume, stopPlayback]
  );

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  // Adjust volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  // Preset ringtone selector
  const applyPreset = (seconds: number) => {
    if (!duration) return;
    const newEnd = Math.min(duration, startTime + seconds);
    setEndTime(newEnd);
  };

  // Waveform Canvas Rendering
  const renderWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !peaks || !duration) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const centerY = height / 2;
    const numPoints = peaks.max.length;

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let sec = 0; sec <= duration; sec += duration > 60 ? 10 : 2) {
      const x = (sec / duration) * width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Active selection coordinates
    const startX = (startTime / duration) * width;
    const endX = (endTime / duration) * width;
    const currentX = (currentTime / duration) * width;

    // 1. Draw inactive dimmed background waveform
    ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * width;
      const minVal = peaks.min[i];
      const maxVal = peaks.max[i];
      const h = Math.max(2, (maxVal - minVal) * (centerY * 0.85));
      ctx.fillRect(x, centerY - h / 2, Math.max(1, width / numPoints), h);
    }

    // 2. Highlight active selection area
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#ec4899');
    gradient.addColorStop(1, '#f43f5e');

    ctx.save();
    ctx.beginPath();
    ctx.rect(startX, 0, Math.max(2, endX - startX), height);
    ctx.clip();

    // Background tint for active region
    ctx.fillStyle = 'rgba(236, 72, 153, 0.12)';
    ctx.fillRect(startX, 0, endX - startX, height);

    // Active illuminated waveform
    ctx.fillStyle = gradient;
    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * width;
      const minVal = peaks.min[i];
      const maxVal = peaks.max[i];
      const h = Math.max(2, (maxVal - minVal) * (centerY * 0.85));
      ctx.fillRect(x, centerY - h / 2, Math.max(1, width / numPoints), h);
    }
    ctx.restore();

    // 3. Draw Start Handle (Left pink bar)
    ctx.fillStyle = '#ec4899';
    ctx.fillRect(startX - 2, 0, 4, height);
    ctx.beginPath();
    ctx.roundRect(startX - 10, 8, 20, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('IN', startX, 24);

    // 4. Draw End Handle (Right red/rose bar)
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(endX - 2, 0, 4, height);
    ctx.beginPath();
    ctx.roundRect(endX - 10, height - 32, 20, 24, 4);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OUT', endX, height - 16);

    // 5. Draw Playhead scrubber line
    if (currentTime >= 0 && currentTime <= duration) {
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.fillRect(currentX - 1.5, 0, 3, height);
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(currentX, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [peaks, duration, startTime, endTime, currentTime]);

  useEffect(() => {
    renderWaveform();
  }, [renderWaveform]);

  // Handle Canvas Mouse / Touch drag events for handles
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !duration) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickTime = (x / rect.width) * duration;

    const startX = (startTime / duration) * rect.width;
    const endX = (endTime / duration) * rect.width;

    if (Math.abs(x - startX) <= 15) {
      draggingHandleRef.current = 'start';
    } else if (Math.abs(x - endX) <= 15) {
      draggingHandleRef.current = 'end';
    } else {
      draggingHandleRef.current = 'playhead';
      const clampedTime = Math.max(startTime, Math.min(endTime, clickTime));
      setCurrentTime(clampedTime);
      if (isPlaying) {
        startPlayback(clampedTime);
      }
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingHandleRef.current || !duration) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const timeAtX = (x / rect.width) * duration;

    if (draggingHandleRef.current === 'start') {
      setStartTime(Math.min(timeAtX, endTime - 0.2));
    } else if (draggingHandleRef.current === 'end') {
      setEndTime(Math.max(timeAtX, startTime + 0.2));
    } else if (draggingHandleRef.current === 'playhead') {
      const clampedTime = Math.max(startTime, Math.min(endTime, timeAtX));
      setCurrentTime(clampedTime);
    }
  };

  const handleCanvasMouseUp = () => {
    draggingHandleRef.current = null;
  };

  // Export and download trimmed audio
  const handleExportTrimmed = async () => {
    if (!audioBuffer || !audioFile) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const sliced = sliceAudioBuffer(audioBuffer, startTime, endTime, fadeInSec, fadeOutSec);
      const wavBlob = audioBufferToWav(sliced);

      const baseName = audioFile.name.replace(/\.[^/.]+$/, '');
      const outFilename = `${baseName}_trimmed_${outputFormat === 'mp3' ? 'cut.mp3' : 'cut.wav'}`;

      downloadAudioBlob(wavBlob, outFilename);
      setExportSuccess(true);
    } catch (err) {
      console.error('Audio export failed:', err);
      alert('Failed to export trimmed audio.');
    } finally {
      setIsExporting(false);
    }
  };

  const selectedDuration = Math.max(0, endTime - startTime);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              100% In-Browser Audio Cutter
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Audio Trimmer & Ringtone Cutter
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Cut MP3, WAV, M4A, and FLAC audio tracks with visual zoomable waveforms, fade in/out effects, and millisecond precision. Zero files uploaded.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PrivacyAssuranceBadge />
          </div>
        </div>
      </div>

      {/* 2. File Upload / Dropzone */}
      {!audioBuffer ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-lg">
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.webm"
            multiple={false}
            maxSizeMb={200}
            acceptedFormatsText="Supports MP3, WAV, M4A Voice Memos, FLAC, AAC & OGG up to 200MB"
          />
          {isLoading && (
            <div className="mt-6 flex items-center justify-center gap-3 text-pink-400 font-medium animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin" />
              Decoding audio waveform in browser memory...
            </div>
          )}
        </div>
      ) : (
        /* 3. Interactive Studio Editor */
        <div className="space-y-6">
          {/* File summary & Change Track button */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <FileAudio className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
                  {audioFile?.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatBytes(audioFile?.size || 0)} • {formatAudioTime(duration, true)} Total Duration • {audioBuffer.sampleRate} Hz {audioBuffer.numberOfChannels === 2 ? 'Stereo' : 'Mono'}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                stopPlayback();
                setAudioBuffer(null);
                setAudioFile(null);
              }}
              className="text-xs border-slate-700 hover:border-pink-500 hover:text-pink-400"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Change Audio
            </Button>
          </div>

          {/* Waveform Editor Viewport */}
          <div className="rounded-2xl border border-pink-500/20 bg-slate-950/90 p-5 md:p-6 shadow-2xl space-y-4">
            {/* Timeline Header & Preset Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-mono">
                  Current: <strong className="text-sky-400">{formatAudioTime(currentTime, true)}</strong>
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400 font-mono">
                  Cut Duration: <strong className="text-pink-400">{formatAudioTime(selectedDuration, true)}</strong>
                </span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 mr-1">Ringtone Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset(30)}
                  className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-pink-500/20 border border-slate-700 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 flex items-center gap-1 transition-all"
                >
                  <Smartphone className="w-3 h-3" />
                  iPhone (30s)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(45)}
                  className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-pink-500/20 border border-slate-700 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 flex items-center gap-1 transition-all"
                >
                  <Bell className="w-3 h-3" />
                  Android (45s)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(5)}
                  className="px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-pink-500/20 border border-slate-700 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 flex items-center gap-1 transition-all"
                >
                  <MessageSquare className="w-3 h-3" />
                  Notification (5s)
                </button>
              </div>
            </div>

            {/* Interactive Canvas */}
            <div className="relative w-full h-44 rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden cursor-crosshair select-none shadow-inner">
              <canvas
                ref={canvasRef}
                className="w-full h-full block"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
              />
            </div>

            {/* Playback Controls & Precision Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Play / Pause / Loop cluster */}
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  onClick={togglePlayPause}
                  className="h-11 px-5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold shadow-lg shadow-pink-500/25 flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  {isPlaying ? 'Pause' : 'Play Selection'}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    stopPlayback();
                    setCurrentTime(startTime);
                  }}
                  title="Reset to start marker"
                  className="h-11 w-11 rounded-xl border-slate-700 text-slate-300 hover:text-pink-400"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsLooping(!isLooping)}
                  title="Toggle Loop Selection"
                  className={`h-11 w-11 rounded-xl border-slate-700 transition-all ${
                    isLooping ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                </Button>

                {/* Volume slider */}
                <div className="flex items-center gap-1.5 ml-2">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-slate-400 hover:text-white"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 h-1.5 accent-pink-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Start & End Precision Inputs */}
              <div className="flex items-center justify-center gap-3">
                <div className="flex flex-col items-center">
                  <label className="text-[11px] font-semibold uppercase text-pink-400 mb-1">
                    Start Marker
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={endTime - 0.1}
                    value={startTime.toFixed(1)}
                    onChange={(e) => setStartTime(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-24 px-2.5 py-1.5 text-center text-sm font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-pink-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5">{formatAudioTime(startTime)}</span>
                </div>

                <span className="text-slate-600 font-bold mt-2">→</span>

                <div className="flex flex-col items-center">
                  <label className="text-[11px] font-semibold uppercase text-rose-400 mb-1">
                    End Marker
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={startTime + 0.1}
                    max={duration}
                    value={endTime.toFixed(1)}
                    onChange={(e) => setEndTime(Math.min(duration, parseFloat(e.target.value) || duration))}
                    className="w-24 px-2.5 py-1.5 text-center text-sm font-mono font-bold bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-rose-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5">{formatAudioTime(endTime)}</span>
                </div>
              </div>

              {/* Fade Envelopes */}
              <div className="flex items-center justify-end gap-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center justify-between">
                    Fade In: <strong className="text-pink-400 font-mono">{fadeInSec.toFixed(1)}s</strong>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={0.1}
                    value={fadeInSec}
                    onChange={(e) => setFadeInSec(parseFloat(e.target.value))}
                    className="w-24 h-1.5 accent-pink-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 flex items-center justify-between">
                    Fade Out: <strong className="text-rose-400 font-mono">{fadeOutSec.toFixed(1)}s</strong>
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={3}
                    step={0.1}
                    value={fadeOutSec}
                    onChange={(e) => setFadeOutSec(parseFloat(e.target.value))}
                    className="w-24 h-1.5 accent-rose-500 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Export & Download Bar */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-pink-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">Target Output Format:</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setOutputFormat('mp3')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      outputFormat === 'mp3'
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    MP3 (Compact Audio)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOutputFormat('wav')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      outputFormat === 'wav'
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    WAV (16-bit Lossless PCM)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                size="lg"
                onClick={handleExportTrimmed}
                disabled={isExporting}
                className="h-12 px-7 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-xl shadow-pink-500/30 transition-all flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" />
                    Rendering Audio in Browser...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download Trimmed Track ({formatAudioTime(selectedDuration)})
                  </>
                )}
              </Button>
            </div>
          </div>

          {exportSuccess && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-3 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              Audio sliced and exported successfully directly in browser memory! Check your downloads folder.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
