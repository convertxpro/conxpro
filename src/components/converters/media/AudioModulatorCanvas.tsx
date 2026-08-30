/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { MediaProcessingView } from '@/components/conversion/MediaProcessingView';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { formatBytes } from '@/lib/utils';
import {
  Gauge,
  Layers,
  Music,
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
  ShieldCheck,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  GripVertical,
  SlidersHorizontal,
  Mic,
  Disc,
  Headphones,
  Check,
  Copy,
  Info,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

export interface AudioModulatorCanvasProps {
  initialMode?: 'speed-pitch' | 'joiner';
  initialToolSlug?: string;
}

export interface AudioTrackItem {
  id: string;
  file: File;
  name: string;
  size: number;
  durationSec?: number;
  url: string;
}

const SPEED_PRESETS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5];

const SEMITONE_LABELS: Record<number, string> = {
  '-12': '1 Octave Down (-12 st)',
  '-7': 'Perfect 5th Down (-7 st)',
  '-5': 'Perfect 4th Down (-5 st)',
  '-2': '1 Whole Step Down (-2 st)',
  '-1': '1 Half Step Down (-1 st)',
  '0': 'Original Key (0 st)',
  '1': '1 Half Step Up (+1 st)',
  '2': '1 Whole Step Up (+2 st)',
  '5': 'Perfect 4th Up (+5 st)',
  '7': 'Perfect 5th Up (+7 st)',
  '12': '1 Octave Up (+12 st)',
};

export const AudioModulatorCanvas: React.FC<AudioModulatorCanvasProps> = ({
  initialMode = 'speed-pitch',
  initialToolSlug,
}) => {
  const mode =
    initialToolSlug === 'audio-joiner'
      ? 'joiner'
      : initialToolSlug === 'audio-speed-pitch-changer'
      ? 'speed-pitch'
      : initialMode;

  const [activeTab, setActiveTab] = useState<'speed-pitch' | 'joiner'>(mode);

  // ==========================================
  // 1. SPEED & PITCH MODULATOR STATE
  // ==========================================
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);

  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [preservePitch, setPreservePitch] = useState<boolean>(true);
  const [pitchSemitones, setPitchSemitones] = useState<number>(0);
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav'>('mp3');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ==========================================
  // 2. AUDIO JOINER STATE
  // ==========================================
  const [tracks, setTracks] = useState<AudioTrackItem[]>([]);
  const [crossfadeDuration, setCrossfadeDuration] = useState<number>(1.5);
  const [joinTargetFormat, setJoinTargetFormat] = useState<'mp3' | 'wav'>('mp3');

  // ==========================================
  // 3. SERVER PROCESSING & JOB STATE
  // ==========================================
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [conversionResult, setConversionResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Synchronize initial mode when props change
  useEffect(() => {
    if (initialToolSlug === 'audio-joiner') setActiveTab('joiner');
    else if (initialToolSlug === 'audio-speed-pitch-changer') setActiveTab('speed-pitch');
  }, [initialToolSlug]);

  // Handle single audio upload
  const handleSingleFileDrop = (files: File[]) => {
    if (files.length === 0) return;
    const f = files[0];
    setSingleFile(f);
    setConversionResult(null);
    setErrorMessage(null);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    const url = URL.createObjectURL(f);
    setAudioUrl(url);
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Handle multi-track audio join drop
  const handleJoinerFilesDrop = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    setConversionResult(null);
    setErrorMessage(null);

    const newTracks: AudioTrackItem[] = newFiles.map((file, idx) => ({
      id: `${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }));

    setTracks((prev) => [...prev, ...newTracks]);
  };

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.playbackRate = speedMultiplier;
    // Set webkit / standard preservesPitch attribute
    if ('preservesPitch' in audio) {
      (audio as any).preservesPitch = preservePitch;
    } else if ('webkitPreservesPitch' in audio) {
      (audio as any).webkitPreservesPitch = preservePitch;
    }
  }, [speedMultiplier, preservePitch]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleResetSpeed = () => {
    setSpeedMultiplier(1.0);
    setPitchSemitones(0);
    setPreservePitch(true);
  };

  // Reordering tracks in Joiner
  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    const updated = [...tracks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setTracks(updated);
  };

  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
  };

  // Submit Speed & Pitch Modulator Job
  const handleStartSpeedModulation = async () => {
    if (!singleFile) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setConversionResult(null);

    try {
      const formData = new FormData();
      formData.append('file', singleFile);
      formData.append('speedMultiplier', speedMultiplier.toString());
      formData.append('preservePitch', preservePitch.toString());
      formData.append('pitchSemitones', pitchSemitones.toString());
      formData.append('targetFormat', targetFormat);
      formData.append('bitrate', '320k');

      const res = await fetch('/api/convert/audio-modulate', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start audio modulation.');
      }

      setActiveJobId(data.jobId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initiate audio modulation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Multi-Track Joiner Job
  const handleStartAudioJoin = async () => {
    if (tracks.length < 2) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    setConversionResult(null);

    try {
      const formData = new FormData();
      tracks.forEach((track, idx) => {
        formData.append(`file_${idx}`, track.file);
      });
      formData.append('crossfadeDurationSec', crossfadeDuration.toString());
      formData.append('targetFormat', joinTargetFormat);
      formData.append('bitrate', '320k');

      const res = await fetch('/api/convert/audio-join', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to start multi-track audio join.');
      }

      setActiveJobId(data.jobId);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to initiate audio merge.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('speed-pitch');
              setConversionResult(null);
              setActiveJobId(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'speed-pitch'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Gauge className="h-4 w-4" />
            Audio Speed & Pitch Modulator
          </button>
          <button
            onClick={() => {
              setActiveTab('joiner');
              setConversionResult(null);
              setActiveJobId(null);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'joiner'
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            Multi-Track Audio Joiner & Merger
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>High-Fidelity 320kbps MP3 / Lossless PCM WAV</span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 1. SPEED & PITCH MODULATOR VIEW                     */}
      {/* ==================================================== */}
      {activeTab === 'speed-pitch' && (
        <div className="space-y-6">
          {!singleFile ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
              <Dropzone
                onFilesSelected={handleSingleFileDrop}
                accept=".mp3,.wav,.m4a,.flac,.ogg,.aac,.wma,audio/*"
                maxSizeMb={50}
                acceptedFormatsText="Supported Audio: MP3, WAV, M4A, FLAC, OGG, AAC (Max 50MB)"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Interactive Player Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md">
                      <Music className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">{singleFile.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatBytes(singleFile.size)} • {duration ? `${formatSeconds(duration)} total` : 'Ready to play'}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSingleFile(null);
                      setAudioUrl(null);
                      setActiveJobId(null);
                      setConversionResult(null);
                    }}
                    leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                  >
                    Change File
                  </Button>
                </div>

                {/* Hidden Native Audio Element */}
                {audioUrl && (
                  <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                    loop={isLooping}
                  />
                )}

                {/* Scrubber Timeline */}
                <div className="mt-6 space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={(e) => handleSeek(parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-pink-500 dark:bg-slate-700"
                  />
                  <div className="flex justify-between text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                    <span>{formatSeconds(currentTime)}</span>
                    <span>{formatSeconds(duration)}</span>
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePlayPause}
                      className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md transition-transform hover:scale-105"
                    >
                      {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="ml-0.5 h-5 w-5" />}
                    </button>

                    <button
                      onClick={() => setIsLooping(!isLooping)}
                      className={`rounded-xl p-2.5 transition-colors ${
                        isLooping
                          ? 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300'
                          : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={isLooping ? 'Looping enabled' : 'Loop playback'}
                    >
                      <Repeat className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const newMute = !isMuted;
                        setIsMuted(newMute);
                        if (audioRef.current) audioRef.current.muted = newMute;
                      }}
                      className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        const v = parseFloat(e.target.value);
                        setVolume(v);
                        setIsMuted(false);
                        if (audioRef.current) {
                          audioRef.current.volume = v;
                          audioRef.current.muted = false;
                        }
                      }}
                      className="h-1.5 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-pink-500 dark:bg-slate-700"
                    />
                  </div>
                </div>
              </div>

              {/* Modulation Controls */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Speed Slider & Pitch Lock */}
                <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-5 w-5 text-pink-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Playback Speed Multiplier
                      </h4>
                    </div>
                    <span className="rounded-full bg-pink-100 px-3 py-0.5 text-xs font-bold text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                      {speedMultiplier.toFixed(2)}x Speed
                    </span>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {SPEED_PRESETS.map((preset) => (
                      <button
                        key={`preset-${preset}`}
                        onClick={() => setSpeedMultiplier(preset)}
                        className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                          speedMultiplier === preset
                            ? 'bg-pink-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                        }`}
                      >
                        {preset}x
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.05"
                    value={speedMultiplier}
                    onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-pink-500 dark:bg-slate-700"
                  />

                  {/* Preserve Voice Pitch Lock Switch */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
                    <label className="flex cursor-pointer items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Mic className="h-4 w-4 text-pink-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Preserve Natural Voice Pitch (atempo)
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {preservePitch
                            ? 'Natural vocal tone is maintained without chipmunk or demon distortion.'
                            : 'Analog tape/vinyl speed: pitch rises when sped up and drops when slowed.'}
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={preservePitch}
                        onChange={(e) => setPreservePitch(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-pink-600 focus:ring-pink-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Pitch Transposition & Musical Semitones */}
                <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Disc className="h-5 w-5 text-rose-500" />
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Musical Pitch & Key Shift
                      </h4>
                    </div>
                    <span className="rounded-full bg-rose-100 px-3 py-0.5 text-xs font-bold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
                      {pitchSemitones > 0 ? `+${pitchSemitones}` : pitchSemitones} Semitones
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {SEMITONE_LABELS[pitchSemitones] || `${pitchSemitones} semitones relative to original key`}
                  </p>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPitchSemitones(Math.max(-12, pitchSemitones - 1))}
                    >
                      -1 st
                    </Button>
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="1"
                      value={pitchSemitones}
                      onChange={(e) => setPitchSemitones(parseInt(e.target.value, 10))}
                      className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-rose-500 dark:bg-slate-700"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPitchSemitones(Math.min(12, pitchSemitones + 1))}
                    >
                      +1 st
                    </Button>
                  </div>

                  {/* Target Format & Reset */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">Output:</span>
                      <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                        <button
                          onClick={() => setTargetFormat('mp3')}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                            targetFormat === 'mp3' ? 'bg-pink-500 text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          MP3 (320k)
                        </button>
                        <button
                          onClick={() => setTargetFormat('wav')}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                            targetFormat === 'wav' ? 'bg-pink-500 text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          Lossless WAV
                        </button>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm" onClick={handleResetSpeed} leftIcon={<RotateCcw className="h-3 w-3" />}>
                      Reset Settings
                    </Button>
                  </div>
                </div>
              </div>

              {/* Render Action Button */}
              {!activeJobId && !conversionResult && (
                <div className="flex justify-end">
                  <Button
                    variant="gradient"
                    size="lg"
                    isLoading={isSubmitting}
                    onClick={handleStartSpeedModulation}
                    leftIcon={<Sparkles className="h-5 w-5" />}
                    className="bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg"
                  >
                    Render & Export Master Audio
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. MULTI-TRACK AUDIO JOINER VIEW                    */}
      {/* ==================================================== */}
      {activeTab === 'joiner' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
            <Dropzone
              onFilesSelected={handleJoinerFilesDrop}
              accept=".mp3,.wav,.m4a,.flac,.ogg,.aac,audio/*"
              multiple={true}
              maxSizeMb={100}
              acceptedFormatsText="Drop 2 or more MP3, WAV, M4A, FLAC tracks to merge (Max 100MB total)"
            />
          </div>

          {tracks.length > 0 && (
            <div className="space-y-6">
              {/* Tracks List */}
              <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-pink-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Track Sequence ({tracks.length} Files)
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Total Size: {formatBytes(tracks.reduce((acc, t) => acc + t.size, 0))}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {tracks.map((track, idx) => (
                    <div
                      key={track.id}
                      className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs font-bold text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{track.name}</p>
                          <p className="text-[10px] text-slate-400">{formatBytes(track.size)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveTrack(idx, 'up')}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="Move Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          disabled={idx === tracks.length - 1}
                          onClick={() => moveTrack(idx, 'down')}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-30 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="Move Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeTrack(track.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40"
                          title="Remove Track"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Crossfade Settings */}
                <div className="mt-6 grid grid-cols-1 gap-6 border-t border-slate-100 pt-6 dark:border-slate-800 sm:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>Crossfade Transition:</span>
                      <span className="text-pink-600 dark:text-pink-400">
                        {crossfadeDuration === 0 ? 'Seamless Cut (0.0s)' : `${crossfadeDuration.toFixed(1)} Seconds`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.5"
                      value={crossfadeDuration}
                      onChange={(e) => setCrossfadeDuration(parseFloat(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-pink-500 dark:bg-slate-700"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0.0s (Cut)</span>
                      <span>2.5s (DJ Fade)</span>
                      <span>5.0s (Slow Ambient)</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Master Target Format:
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setJoinTargetFormat('mp3')}
                        className={`flex-1 rounded-xl p-2.5 text-xs font-bold transition-all ${
                          joinTargetFormat === 'mp3'
                            ? 'bg-pink-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        MP3 (320kbps)
                      </button>
                      <button
                        onClick={() => setJoinTargetFormat('wav')}
                        className={`flex-1 rounded-xl p-2.5 text-xs font-bold transition-all ${
                          joinTargetFormat === 'wav'
                            ? 'bg-pink-500 text-white shadow-md'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        WAV (16-bit Lossless)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Merge Action Button */}
                {!activeJobId && !conversionResult && (
                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="gradient"
                      size="lg"
                      disabled={tracks.length < 2}
                      isLoading={isSubmitting}
                      onClick={handleStartAudioJoin}
                      leftIcon={<Sparkles className="h-5 w-5" />}
                      className="bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg"
                    >
                      Merge {tracks.length} Audio Tracks
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. ASYNC TRANSCODING PROGRESS VIEW                  */}
      {/* ==================================================== */}
      {activeJobId && !conversionResult && (
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
          <MediaProcessingView
            jobId={activeJobId}
            originalFilename={singleFile?.name || 'audio-master'}
            targetFormat={activeTab === 'speed-pitch' ? targetFormat : joinTargetFormat}
            toolType={activeTab === 'speed-pitch' ? 'audio-speed-pitch-changer' : 'audio-joiner'}
            onComplete={(result) => {
              setConversionResult(result);
              setActiveJobId(null);
            }}
            onError={(err) => {
              setErrorMessage(err);
              setActiveJobId(null);
            }}
          />
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. COMPLETED DOWNLOAD CARD                          */}
      {/* ==================================================== */}
      {conversionResult && (
        <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent p-6 shadow-md dark:border-emerald-500/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-md">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {conversionResult.targetFilename || 'Audio processing complete!'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Size: {formatBytes(conversionResult.convertedSizeBytes || 0)} • Format:{' '}
                  {(conversionResult.format || 'mp3').toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {conversionResult.downloadUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(conversionResult.downloadUrl)}
                  leftIcon={copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                >
                  {copiedLink ? 'Copied Link!' : 'Copy Link'}
                </Button>
              )}

              <a
                href={conversionResult.downloadUrl}
                download={conversionResult.targetFilename}
                className="inline-flex"
              >
                <Button
                  variant="gradient"
                  size="md"
                  leftIcon={<Download className="h-4 w-4" />}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Download Audio Master
                </Button>
              </a>
            </div>
          </div>

          {/* Contextual Next Best Actions */}
          <NextActionRecommendations
            currentSlug={initialToolSlug || (activeTab === 'speed-pitch' ? 'audio-speed-pitch-changer' : 'audio-joiner')}
            categorySlug="audio"
            className="mt-6"
          />
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-700 dark:text-rose-300">
          ⚠️ {errorMessage}
        </div>
      )}
    </div>
  );
};
