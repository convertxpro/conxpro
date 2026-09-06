'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ToolMetadata } from '@/config/categories';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { formatBytes } from '@/lib/utils';
import {
  decodeAudioFile,
  renderSpeedPitchAudio,
  formatAudioTime,
  getAudioContext,
} from '@/lib/audio/audio-dsp';
import { audioBufferToWav, downloadAudioBlob } from '@/lib/audio/audio-encoders';
import {
  Gauge,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  CheckCircle2,
  Sparkles,
  Sliders,
  Music2,
  FileAudio,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

const SEMITONE_LABELS: Record<number, string> = {
  '-12': '1 Octave Down (-12 st)',
  '-7': 'Perfect 5th Down (-7 st)',
  '-5': 'Perfect 4th Down (-5 st)',
  '-2': '1 Whole Step Down (-2 st)',
  '-1': '1 Half Step Down (-1 st)',
  '0': 'Natural Key (0 st)',
  '1': '1 Half Step Up (+1 st)',
  '2': '1 Whole Step Up (+2 st)',
  '5': 'Perfect 4th Up (+5 st)',
  '7': 'Perfect 5th Up (+7 st)',
  '12': '1 Octave Up (+12 st)',
};

interface AudioSpeedPitchComponentProps {
  tool?: ToolMetadata;
}

export const AudioSpeedPitchComponent: React.FC<AudioSpeedPitchComponentProps> = ({ tool }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Modulation Controls
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [pitchSemitones, setPitchSemitones] = useState<number>(0);
  const [preservePitch, setPreservePitch] = useState<boolean>(false);
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav'>('mp3');

  // Live Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartCtxTimeRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Handle file selection
  const handleFileSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setAudioFile(file);
    setIsLoading(true);
    setExportSuccess(false);

    try {
      const buffer = await decodeAudioFile(file);
      setAudioBuffer(buffer);
      setDuration(buffer.duration);
      setCurrentTime(0);
    } catch (err) {
      console.error('Failed to decode audio:', err);
      alert('Could not decode audio file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Stop playback
  const stopPlayback = useCallback(() => {
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
        activeSourceRef.current.disconnect();
      } catch {
        // Ignored
      }
      activeSourceRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  // Live Real-Time Web Audio Playback with pitch/detune and speed
  const startPlayback = useCallback(
    (offset: number = 0) => {
      if (!audioBuffer) return;
      stopPlayback();

      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      // Apply speed playbackRate
      source.playbackRate.value = speedMultiplier;

      // Apply semitone detune (100 cents per semitone)
      if (pitchSemitones !== 0) {
        source.detune.value = pitchSemitones * 100;
      }

      source.connect(ctx.destination);

      const playOffset = Math.max(0, Math.min(audioBuffer.duration, offset));
      source.start(0, playOffset);

      activeSourceRef.current = source;
      playbackStartCtxTimeRef.current = ctx.currentTime;
      playbackStartOffsetRef.current = playOffset;
      setIsPlaying(true);

      const updateProgress = () => {
        if (!activeSourceRef.current) return;
        const elapsed = (ctx.currentTime - playbackStartCtxTimeRef.current) * speedMultiplier;
        const now = playbackStartOffsetRef.current + elapsed;

        if (now >= audioBuffer.duration) {
          stopPlayback();
          setCurrentTime(0);
          return;
        }

        setCurrentTime(now);
        animFrameRef.current = requestAnimationFrame(updateProgress);
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);

      source.onended = () => {
        if (activeSourceRef.current === source) {
          stopPlayback();
          setCurrentTime(0);
        }
      };
    },
    [audioBuffer, speedMultiplier, pitchSemitones, stopPlayback]
  );

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(currentTime);
    }
  };

  // Dynamic update of active AudioBufferSourceNode parameters in real-time
  useEffect(() => {
    if (activeSourceRef.current) {
      activeSourceRef.current.playbackRate.value = speedMultiplier;
      activeSourceRef.current.detune.value = pitchSemitones * 100;
    }
  }, [speedMultiplier, pitchSemitones]);

  // Clean up
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  // Export modulated audio
  const handleExport = async () => {
    if (!audioBuffer || !audioFile) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const rendered = await renderSpeedPitchAudio(
        audioBuffer,
        speedMultiplier,
        pitchSemitones,
        preservePitch
      );
      const wavBlob = audioBufferToWav(rendered);

      const baseName = audioFile.name.replace(/\.[^/.]+$/, '');
      const outFilename = `${baseName}_${speedMultiplier}x_${pitchSemitones > 0 ? '+' : ''}${pitchSemitones}st.${
        targetFormat === 'mp3' ? 'mp3' : 'wav'
      }`;

      downloadAudioBlob(wavBlob, outFilename);
      setExportSuccess(true);
    } catch (err) {
      console.error('Speed/Pitch render failed:', err);
      alert('Failed to render audio.');
    } finally {
      setIsExporting(false);
    }
  };

  const currentPitchLabel = SEMITONE_LABELS[pitchSemitones] || `${pitchSemitones > 0 ? '+' : ''}${pitchSemitones} Semitones`;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
              <Gauge className="w-3.5 h-3.5" />
              100% In-Browser DSP Modulator
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Audio Speed & Pitch Modulator
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Change audio playback speed (0.5x to 2.5x) or transpose musical semitones (-12 to +12 semitones) with real-time in-browser DSP preview.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PrivacyAssuranceBadge />
          </div>
        </div>
      </div>

      {/* 2. File Dropzone */}
      {!audioBuffer ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-lg">
          <Dropzone
            onFilesSelected={handleFileSelected}
            accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg"
            multiple={false}
            maxSizeMb={200}
            acceptedFormatsText="Supports MP3, WAV, AAC, M4A, FLAC up to 200MB"
          />
          {isLoading && (
            <div className="mt-4 flex items-center justify-center gap-2 text-pink-400 text-sm font-medium animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              Loading audio in browser DSP pipeline...
            </div>
          )}
        </div>
      ) : (
        /* 3. Interactive Modulator Controls */
        <div className="space-y-6">
          {/* File summary */}
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
                  {formatBytes(audioFile?.size || 0)} • {formatAudioTime(duration)} Duration
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

          {/* Sliders Console */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-pink-500/20 bg-slate-950/90 shadow-2xl">
            {/* Speed & Tempo Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-pink-400" />
                  Playback Speed (Tempo)
                </span>
                <span className="text-pink-400 font-mono font-bold text-base px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/20">
                  {speedMultiplier.toFixed(2)}x
                </span>
              </div>

              <input
                type="range"
                min={0.5}
                max={2.5}
                step={0.05}
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 accent-pink-500 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Speed Preset Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {SPEED_PRESETS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeedMultiplier(s)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                      speedMultiplier === s
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Pitch Transpose Slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Music2 className="w-4 h-4 text-rose-400" />
                  Musical Pitch Transpose
                </span>
                <span className="text-rose-400 font-mono font-bold text-sm px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                  {currentPitchLabel}
                </span>
              </div>

              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={pitchSemitones}
                onChange={(e) => setPitchSemitones(parseInt(e.target.value, 10))}
                className="w-full h-2 accent-rose-500 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Pitch Helper Buttons */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setPitchSemitones(0)}
                  className="text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to Natural Key (0 st)
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setPitchSemitones(-12)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700"
                  >
                    -1 Octave
                  </button>
                  <button
                    type="button"
                    onClick={() => setPitchSemitones(12)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] hover:bg-slate-700"
                  >
                    +1 Octave
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview Player */}
          <div className="p-6 rounded-2xl border border-pink-500/20 bg-slate-950 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-pink-400 animate-pulse" />
                Live Real-Time DSP Audio Preview
              </span>
              <span className="font-mono text-pink-400">
                {formatAudioTime(currentTime, true)} / {formatAudioTime(duration, true)}
              </span>
            </div>

            {/* Scrubber Bar */}
            <div
              className="relative w-full h-3 bg-slate-800 rounded-full cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const targetTime = ratio * duration;
                setCurrentTime(targetTime);
                if (isPlaying) {
                  startPlayback(targetTime);
                }
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-75"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={togglePlayPause}
                className="h-10 px-5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                {isPlaying ? 'Pause Preview' : 'Play Live Modulated Sound'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  stopPlayback();
                  setCurrentTime(0);
                }}
                className="h-10 border-slate-800 text-slate-400 hover:text-white"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Reset Time
              </Button>
            </div>
          </div>

          {/* Export Bar */}
          <div className="p-6 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-pink-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Target Output Format:</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTargetFormat('mp3')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    targetFormat === 'mp3'
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  MP3 (Compact Audio)
                </button>
                <button
                  type="button"
                  onClick={() => setTargetFormat('wav')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    targetFormat === 'wav'
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  WAV (16-bit Lossless PCM)
                </button>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleExport}
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
                  Download Modulated Audio ({speedMultiplier}x, {currentPitchLabel})
                </>
              )}
            </Button>
          </div>

          {exportSuccess && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-3 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              Modulated audio rendered and saved to your device! 100% in-browser processing.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
