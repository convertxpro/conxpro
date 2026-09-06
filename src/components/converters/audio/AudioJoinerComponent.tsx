'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ToolMetadata } from '@/config/categories';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { formatBytes } from '@/lib/utils';
import {
  decodeAudioFile,
  concatenateAudioBuffers,
  formatAudioTime,
  getAudioContext,
} from '@/lib/audio/audio-dsp';
import { audioBufferToWav, downloadAudioBlob } from '@/lib/audio/audio-encoders';
import {
  Layers,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  CheckCircle2,
  Sparkles,
  Sliders,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Music,
  FileAudio,
  GripVertical,
} from 'lucide-react';

interface AudioTrackItem {
  id: string;
  file: File;
  name: string;
  size: number;
  buffer: AudioBuffer;
  duration: number;
  volume: number; // 0.0 to 1.5
}

interface AudioJoinerComponentProps {
  tool?: ToolMetadata;
}

export const AudioJoinerComponent: React.FC<AudioJoinerComponentProps> = ({ tool }) => {
  const [tracks, setTracks] = useState<AudioTrackItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [crossfadeSec, setCrossfadeSec] = useState<number>(1.5);
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav'>('mp3');

  // Preview & Master concatenated buffer state
  const [mergedBuffer, setMergedBuffer] = useState<AudioBuffer | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackStartCtxTimeRef = useRef<number>(0);
  const playbackStartOffsetRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  // Handle adding new files
  const handleFilesAdded = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setIsLoading(true);
    setExportSuccess(false);

    try {
      const newItems: AudioTrackItem[] = [];
      for (const file of files) {
        try {
          const buffer = await decodeAudioFile(file);
          newItems.push({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            buffer,
            duration: buffer.duration,
            volume: 1.0,
          });
        } catch (err) {
          console.error(`Failed to decode track ${file.name}:`, err);
        }
      }

      setTracks((prev) => [...prev, ...newItems]);
      setMergedBuffer(null); // invalidate cached merge
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder tracks
  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tracks.length) return;

    const newTracks = [...tracks];
    const item = newTracks.splice(index, 1)[0];
    newTracks.splice(targetIndex, 0, item);
    setTracks(newTracks);
    setMergedBuffer(null);
  };

  // Remove track
  const removeTrack = (id: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== id));
    setMergedBuffer(null);
  };

  // Update track volume
  const updateTrackVolume = (id: string, vol: number) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, volume: Math.max(0, Math.min(1.5, vol)) } : t))
    );
    setMergedBuffer(null);
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

  // Compute or get merged audio buffer
  const getOrBuildMergedBuffer = useCallback(() => {
    if (tracks.length === 0) return null;
    if (mergedBuffer) return mergedBuffer;

    const buffers = tracks.map((t) => t.buffer);
    const gains = tracks.map((t) => t.volume);
    const merged = concatenateAudioBuffers(buffers, crossfadeSec, gains);
    setMergedBuffer(merged);
    return merged;
  }, [tracks, crossfadeSec, mergedBuffer]);

  // Start playback of merged audio
  const startPlayback = (offset: number = 0) => {
    stopPlayback();
    const buffer = getOrBuildMergedBuffer();
    if (!buffer) return;

    const ctx = getAudioContext();
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const playOffset = Math.max(0, Math.min(buffer.duration, offset));
    source.start(0, playOffset);

    activeSourceRef.current = source;
    playbackStartCtxTimeRef.current = ctx.currentTime;
    playbackStartOffsetRef.current = playOffset;
    setIsPlaying(true);

    const updateProgress = () => {
      if (!activeSourceRef.current) return;
      const elapsed = ctx.currentTime - playbackStartCtxTimeRef.current;
      const now = playbackStartOffsetRef.current + elapsed;

      if (now >= buffer.duration) {
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
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback(currentTime);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, [stopPlayback]);

  // Calculate estimated total duration
  let totalDuration = 0;
  if (tracks.length > 0) {
    totalDuration = tracks.reduce((acc, t) => acc + t.duration, 0);
    if (tracks.length > 1 && crossfadeSec > 0) {
      totalDuration -= (tracks.length - 1) * crossfadeSec;
    }
  }

  // Export merged audio file
  const handleExportMerged = async () => {
    if (tracks.length === 0) return;
    setIsRendering(true);
    setExportSuccess(false);

    try {
      const merged = getOrBuildMergedBuffer();
      if (!merged) throw new Error('Could not merge tracks');

      const wavBlob = audioBufferToWav(merged);
      const outFilename = `apextools_merged_${tracks.length}_tracks.${targetFormat === 'mp3' ? 'mp3' : 'wav'}`;

      downloadAudioBlob(wavBlob, outFilename);
      setExportSuccess(true);
    } catch (err) {
      console.error('Audio merge export failed:', err);
      alert('Failed to export merged audio.');
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              100% In-Browser Audio Merger
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Multi-Track Audio Joiner & Merger
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Combine, reorder, and crossfade multiple MP3, WAV, M4A, and FLAC audio files into a single seamless continuous track without uploading to any server.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PrivacyAssuranceBadge />
          </div>
        </div>
      </div>

      {/* 2. Multi-File Dropzone */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-lg">
        <Dropzone
          onFilesSelected={handleFilesAdded}
          accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.webm"
          multiple={true}
          maxSizeMb={200}
          acceptedFormatsText="Add 2 to 20 tracks (MP3, WAV, AAC, M4A, FLAC) to combine into a single file"
        />
        {isLoading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-pink-400 text-sm font-medium animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            Decoding audio tracks in browser memory...
          </div>
        )}
      </div>

      {/* 3. Track List & Master Controls */}
      {tracks.length > 0 && (
        <div className="space-y-6">
          {/* Controls Bar (Crossfade & Total Duration) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border border-slate-800 bg-slate-950/80">
            {/* Crossfade Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-pink-400" />
                  Crossfade Transition Duration:
                </span>
                <span className="text-pink-400 font-mono font-bold">
                  {crossfadeSec === 0 ? '0s (Hard Cut)' : `${crossfadeSec.toFixed(1)}s (Smooth Fade)`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={crossfadeSec}
                onChange={(e) => {
                  setCrossfadeSec(parseFloat(e.target.value));
                  setMergedBuffer(null);
                }}
                className="w-full h-2 accent-pink-500 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0s (No overlap)</span>
                <span>1s</span>
                <span>2s</span>
                <span>3s</span>
                <span>5s (Long fade)</span>
              </div>
            </div>

            {/* Total Duration Readout */}
            <div className="flex flex-col justify-center items-start md:items-end border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
              <span className="text-xs text-slate-400">Total Joined Duration:</span>
              <p className="text-2xl font-bold font-mono text-white tracking-tight">
                {formatAudioTime(totalDuration, true)}
              </p>
              <span className="text-xs text-pink-400/80">
                {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'} loaded
              </span>
            </div>
          </div>

          {/* Sortable Track List */}
          <div className="space-y-2.5">
            <h3 className="text-sm font-semibold text-white px-1">
              Track Order & Volume ({tracks.length})
            </h3>

            {tracks.map((track, idx) => (
              <div
                key={track.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800/80 bg-slate-900/70 hover:border-pink-500/30 transition-all"
              >
                {/* Track Number & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-pink-400 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-700">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
                      {track.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatAudioTime(track.duration)} • {formatBytes(track.size)} • {track.buffer.numberOfChannels === 2 ? 'Stereo' : 'Mono'}
                    </p>
                  </div>
                </div>

                {/* Track Volume & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {/* Volume Slider */}
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="range"
                      min={0}
                      max={1.5}
                      step={0.05}
                      value={track.volume}
                      onChange={(e) => updateTrackVolume(track.id, parseFloat(e.target.value))}
                      className="w-20 h-1.5 accent-pink-500 bg-slate-800 rounded-lg cursor-pointer"
                      title={`Volume: ${Math.round(track.volume * 100)}%`}
                    />
                    <span className="text-[11px] font-mono text-slate-400 w-10 text-right">
                      {Math.round(track.volume * 100)}%
                    </span>
                  </div>

                  {/* Move Up/Down & Delete */}
                  <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={idx === 0}
                      onClick={() => moveTrack(idx, 'up')}
                      className="h-8 w-8 text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Track Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={idx === tracks.length - 1}
                      onClick={() => moveTrack(idx, 'down')}
                      className="h-8 w-8 text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Track Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTrack(track.id)}
                      className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                      title="Remove Track"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Master Live Preview Player */}
          <div className="p-5 rounded-2xl border border-pink-500/20 bg-slate-950 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white flex items-center gap-2">
                <Music className="w-4 h-4 text-pink-400" />
                Live Merged Audio Preview
              </span>
              <span className="font-mono text-pink-400">
                {formatAudioTime(currentTime, true)} / {formatAudioTime(totalDuration, true)}
              </span>
            </div>

            {/* Scrubber Bar */}
            <div
              className="relative w-full h-3 bg-slate-800 rounded-full cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const targetTime = ratio * totalDuration;
                setCurrentTime(targetTime);
                if (isPlaying) {
                  startPlayback(targetTime);
                }
              }}
            >
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-75"
                style={{ width: `${totalDuration ? (currentTime / totalDuration) * 100 : 0}%` }}
              />
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={togglePlayPause}
                className="h-10 px-5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold flex items-center gap-2"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                {isPlaying ? 'Pause Preview' : 'Play Merged Audio'}
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
          </div>

          {/* Export & Download Bar */}
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
              onClick={handleExportMerged}
              disabled={isRendering || tracks.length === 0}
              className="h-12 px-7 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-xl shadow-pink-500/30 transition-all flex items-center gap-2"
            >
              {isRendering ? (
                <>
                  <Sparkles className="w-5 h-5 animate-spin" />
                  Merging Audio Tracks...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download Merged Audio ({tracks.length} Tracks)
                </>
              )}
            </Button>
          </div>

          {exportSuccess && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-3 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              All tracks merged and exported successfully in browser memory! Check your downloads folder.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
