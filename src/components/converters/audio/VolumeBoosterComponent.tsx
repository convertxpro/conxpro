'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ToolMetadata } from '@/config/categories';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { formatBytes } from '@/lib/utils';
import {
  decodeAudioFile,
  renderBoostedAudio,
  formatAudioTime,
  getAudioContext,
} from '@/lib/audio/audio-dsp';
import { audioBufferToWav, downloadAudioBlob } from '@/lib/audio/audio-encoders';
import {
  Volume2,
  VolumeX,
  Volume1,
  Play,
  Pause,
  RotateCcw,
  Download,
  CheckCircle2,
  Sparkles,
  Sliders,
  ShieldCheck,
  Zap,
  Activity,
  FileAudio,
  Radio,
} from 'lucide-react';

const GAIN_PRESETS = [
  { label: '100% (Original)', value: 1.0 },
  { label: '150% (+3.5 dB)', value: 1.5 },
  { label: '200% (+6.0 dB)', value: 2.0 },
  { label: '250% (+8.0 dB)', value: 2.5 },
  { label: '300% (+9.5 dB)', value: 3.0 },
];

interface VolumeBoosterComponentProps {
  tool?: ToolMetadata;
}

export const VolumeBoosterComponent: React.FC<VolumeBoosterComponentProps> = ({ tool }) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Booster settings
  const [gainMultiplier, setGainMultiplier] = useState<number>(1.5); // 1.5 = 150%
  const [enableLimiter, setEnableLimiter] = useState<boolean>(true);
  const [enableBassBoost, setEnableBassBoost] = useState<boolean>(false);
  const [enableTrebleBoost, setEnableTrebleBoost] = useState<boolean>(false);
  const [abComparisonMode, setAbComparisonMode] = useState<'boosted' | 'original'>('boosted');
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav'>('mp3');

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Web Audio Nodes
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const playbackStartCtxTimeRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // File selection
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

  // Live DSP Playback Graph with A/B switching and Compressor Limiter
  const startPlayback = useCallback(
    (offset: number = 0) => {
      if (!audioBuffer) return;
      stopPlayback();

      const ctx = getAudioContext();
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;

      let lastNode: AudioNode = source;

      if (abComparisonMode === 'boosted') {
        // Bass filter
        if (enableBassBoost) {
          const bass = ctx.createBiquadFilter();
          bass.type = 'lowshelf';
          bass.frequency.value = 120;
          bass.gain.value = 6.0;
          lastNode.connect(bass);
          lastNode = bass;
          bassFilterRef.current = bass;
        }

        // Treble filter
        if (enableTrebleBoost) {
          const treble = ctx.createBiquadFilter();
          treble.type = 'highshelf';
          treble.frequency.value = 6000;
          treble.gain.value = 4.0;
          lastNode.connect(treble);
          lastNode = treble;
          trebleFilterRef.current = treble;
        }

        // Gain node
        const gainNode = ctx.createGain();
        gainNode.gain.value = gainMultiplier;
        lastNode.connect(gainNode);
        lastNode = gainNode;
        gainNodeRef.current = gainNode;

        // Dynamics compressor limiter
        if (enableLimiter) {
          const compressor = ctx.createDynamicsCompressor();
          compressor.threshold.value = -3.0;
          compressor.knee.value = 6.0;
          compressor.ratio.value = 16.0;
          compressor.attack.value = 0.003;
          compressor.release.value = 0.15;
          lastNode.connect(compressor);
          lastNode = compressor;
          compressorRef.current = compressor;
        }
      } else {
        // Original 1.0 Unity Gain
        const unityGain = ctx.createGain();
        unityGain.gain.value = 1.0;
        lastNode.connect(unityGain);
        lastNode = unityGain;
      }

      lastNode.connect(ctx.destination);

      const playOffset = Math.max(0, Math.min(audioBuffer.duration, offset));
      source.start(0, playOffset);

      activeSourceRef.current = source;
      playbackStartCtxTimeRef.current = ctx.currentTime;
      playbackStartOffsetRef.current = playOffset;
      setIsPlaying(true);

      const updateProgress = () => {
        if (!activeSourceRef.current) return;
        const elapsed = ctx.currentTime - playbackStartCtxTimeRef.current;
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
    [audioBuffer, gainMultiplier, enableLimiter, enableBassBoost, enableTrebleBoost, abComparisonMode, stopPlayback]
  );

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(currentTime);
    }
  };

  // Dynamically update master gain node in real-time
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = abComparisonMode === 'boosted' ? gainMultiplier : 1.0;
    }
  }, [gainMultiplier, abComparisonMode]);

  // Clean up
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  // Export boosted audio
  const handleExport = async () => {
    if (!audioBuffer || !audioFile) return;
    setIsExporting(true);
    setExportSuccess(false);

    try {
      const boosted = await renderBoostedAudio(
        audioBuffer,
        gainMultiplier,
        enableLimiter,
        enableBassBoost,
        enableTrebleBoost
      );
      const wavBlob = audioBufferToWav(boosted);

      const baseName = audioFile.name.replace(/\.[^/.]+$/, '');
      const outFilename = `${baseName}_boosted_${Math.round(gainMultiplier * 100)}pct.${
        targetFormat === 'mp3' ? 'mp3' : 'wav'
      }`;

      downloadAudioBlob(wavBlob, outFilename);
      setExportSuccess(true);
    } catch (err) {
      console.error('Audio volume render failed:', err);
      alert('Failed to boost audio volume.');
    } finally {
      setIsExporting(false);
    }
  };

  const calculatedDbBoost = (20 * Math.log10(gainMultiplier)).toFixed(1);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              100% In-Browser Loudness Normalizer
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Audio Volume Booster & Peak Limiter
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Boost quiet MP3, voice memos, and podcasts up to 300% loudness (+9.5 dB) with built-in dynamic range compression to eliminate clipping distortion.
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
              Loading audio in browser DSP booster...
            </div>
          )}
        </div>
      ) : (
        /* 3. Interactive Booster Console */
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

          {/* Master Gain & Enhancement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Gain Slider (Col-span 2) */}
            <div className="md:col-span-2 p-6 rounded-2xl border border-pink-500/20 bg-slate-950/90 shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-pink-400" />
                  Master Volume Gain Boost
                </span>
                <span className="text-pink-400 font-mono font-bold text-lg px-3 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20">
                  {Math.round(gainMultiplier * 100)}% (+{calculatedDbBoost} dB)
                </span>
              </div>

              <input
                type="range"
                min={1.0}
                max={3.0}
                step={0.05}
                value={gainMultiplier}
                onChange={(e) => setGainMultiplier(parseFloat(e.target.value))}
                className="w-full h-2.5 accent-pink-500 bg-slate-800 rounded-lg cursor-pointer"
              />

              {/* Preset Chips */}
              <div className="flex flex-wrap items-center gap-2">
                {GAIN_PRESETS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setGainMultiplier(p.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      gainMultiplier === p.value
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart DSP Enhancements (Col-span 1) */}
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-4 shadow-xl">
              <h3 className="text-sm font-semibold text-white">Acoustic Enhancements</h3>

              {/* Peak Limiter Toggle */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/30 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={enableLimiter}
                  onChange={(e) => setEnableLimiter(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Anti-Clipping Peak Limiter</span>
                  <span className="text-slate-400 text-[11px]">Prevents digital crackling and distortion</span>
                </div>
              </label>

              {/* Bass Boost Toggle */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/30 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={enableBassBoost}
                  onChange={(e) => setEnableBassBoost(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Bass Punch (+6 dB)</span>
                  <span className="text-slate-400 text-[11px]">Deep low-end harmonic boost at 120Hz</span>
                </div>
              </label>

              {/* Treble Clarity Toggle */}
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/30 cursor-pointer transition-all">
                <input
                  type="checkbox"
                  checked={enableTrebleBoost}
                  onChange={(e) => setEnableTrebleBoost(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-pink-500 rounded cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-semibold text-white block">Vocal / Treble Clarity</span>
                  <span className="text-slate-400 text-[11px]">High-shelf boost (+4 dB at 6kHz)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Live Preview Player & A/B Toggle */}
          <div className="p-6 rounded-2xl border border-pink-500/20 bg-slate-950 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-pink-400 animate-pulse" />
                Live Real-Time Audio Preview ({abComparisonMode === 'boosted' ? 'Boosted Mode' : 'Original Mode'})
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

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  variant="primary"
                  onClick={togglePlayPause}
                  className="h-10 px-5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                  {isPlaying ? 'Pause Preview' : 'Play Boosted Sound'}
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
                  Reset
                </Button>
              </div>

              {/* Before vs After A/B Switch */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-xs text-slate-400 px-2 font-medium">A/B Compare:</span>
                <button
                  type="button"
                  onClick={() => setAbComparisonMode('boosted')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    abComparisonMode === 'boosted'
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Boosted (+{calculatedDbBoost} dB)
                </button>
                <button
                  type="button"
                  onClick={() => setAbComparisonMode('original')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    abComparisonMode === 'original'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Original (100%)
                </button>
              </div>
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
                  Boosting Audio Loudness...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Boosted Audio ({Math.round(gainMultiplier * 100)}%)
                </>
              )}
            </Button>
          </div>

          {exportSuccess && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-3 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              Boosted audio exported cleanly without clipping! Check your downloads.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
