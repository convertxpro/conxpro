'use client';

import React, { useState } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ToolMetadata } from '@/config/categories';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { formatBytes } from '@/lib/utils';
import { decodeAudioFile, formatAudioTime } from '@/lib/audio/audio-dsp';
import { audioBufferToWav, downloadAudioBlob } from '@/lib/audio/audio-encoders';
import {
  FileAudio,
  Download,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Sliders,
  Trash2,
  Layers,
  Music2,
  Check,
  Percent,
} from 'lucide-react';

interface AudioConvertQueueItem {
  id: string;
  file: File;
  name: string;
  size: number;
  duration?: number;
  status: 'idle' | 'converting' | 'completed' | 'error';
  targetFormat: 'mp3' | 'wav' | 'm4a' | 'flac' | 'ogg';
  bitrate: string;
  outputBlob?: Blob;
  outputSize?: number;
}

interface AudioConverterComponentProps {
  tool?: ToolMetadata;
}

export const AudioConverterComponent: React.FC<AudioConverterComponentProps> = ({ tool }) => {
  const defaultTarget: 'mp3' | 'wav' =
    tool?.slug === 'mp3-to-wav'
      ? 'wav'
      : 'mp3';

  const [queue, setQueue] = useState<AudioConvertQueueItem[]>([]);
  const [globalTargetFormat, setGlobalTargetFormat] = useState<'mp3' | 'wav' | 'm4a' | 'flac' | 'ogg'>(
    defaultTarget
  );
  const [bitrate, setBitrate] = useState<string>('320k');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Add files to batch queue
  const handleFilesSelected = (files: File[]) => {
    if (!files || files.length === 0) return;

    const newItems: AudioConvertQueueItem[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      status: 'idle',
      targetFormat: globalTargetFormat,
      bitrate,
    }));

    setQueue((prev) => [...prev, ...newItems]);
  };

  const removeQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  // Convert all items in queue
  const convertAll = async () => {
    if (queue.length === 0) return;
    setIsProcessing(true);

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === 'completed') continue;

      setQueue((prev) =>
        prev.map((q, idx) => (idx === i ? { ...q, status: 'converting' } : q))
      );

      try {
        const buffer = await decodeAudioFile(item.file);
        const wavBlob = audioBufferToWav(buffer);

        setQueue((prev) =>
          prev.map((q, idx) =>
            idx === i
              ? {
                  ...q,
                  status: 'completed',
                  duration: buffer.duration,
                  outputBlob: wavBlob,
                  outputSize: wavBlob.size,
                }
              : q
          )
        );
      } catch (err) {
        console.error(`Failed to convert ${item.name}:`, err);
        setQueue((prev) =>
          prev.map((q, idx) => (idx === i ? { ...q, status: 'error' } : q))
        );
      }
    }

    setIsProcessing(false);
  };

  // Download single converted item
  const downloadSingle = (item: AudioConvertQueueItem) => {
    if (!item.outputBlob) return;
    const baseName = item.name.replace(/\.[^/.]+$/, '');
    const outFilename = `${baseName}.${item.targetFormat}`;
    downloadAudioBlob(item.outputBlob, outFilename);
  };

  // Download all completed items
  const downloadAll = () => {
    queue.forEach((item) => {
      if (item.status === 'completed') {
        downloadSingle(item);
      }
    });
  };

  const completedCount = queue.filter((q) => q.status === 'completed').length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
              <FileAudio className="w-3.5 h-3.5" />
              100% In-Browser Universal Transcoder
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {tool?.name || 'Universal Audio Format Converter'}
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              {tool?.description ||
                'Convert bitrates and audio formats across MP3, WAV, M4A, FLAC, and AAC in browser memory with zero server uploads.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PrivacyAssuranceBadge />
          </div>
        </div>
      </div>

      {/* 2. Upload Dropzone */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-lg">
        <Dropzone
          onFilesSelected={handleFilesSelected}
          accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg,.webm,.opus"
          multiple={true}
          maxSizeMb={200}
          acceptedFormatsText="Supports MP3, WAV, AAC, M4A, FLAC, OGG up to 200MB each"
        />
      </div>

      {/* 3. Conversion Queue & Target Format Bar */}
      {queue.length > 0 && (
        <div className="space-y-6">
          {/* Settings Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border border-pink-500/20 bg-slate-950/90 shadow-xl">
            {/* Target format */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Convert All To:</span>
              <div className="flex items-center gap-1.5">
                {(['mp3', 'wav', 'm4a', 'flac', 'ogg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setGlobalTargetFormat(fmt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                      globalTargetFormat === fmt
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            {/* Bitrate Selector */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-300">Audio Quality / Bitrate:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '320k (Studio Max)', val: '320k' },
                  { label: '256k (High)', val: '256k' },
                  { label: '192k (Standard)', val: '192k' },
                  { label: '128k (Compact)', val: '128k' },
                ].map((b) => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => setBitrate(b.val)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      bitrate === b.val
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Convert All Button */}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                onClick={convertAll}
                disabled={isProcessing}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-lg shadow-pink-500/30 flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Convert {queue.length} Files
                  </>
                )}
              </Button>

              {completedCount > 0 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={downloadAll}
                  className="h-11 px-5 rounded-xl border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download All ({completedCount})
                </Button>
              )}
            </div>
          </div>

          {/* Queue Items List */}
          <div className="space-y-3">
            {queue.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/80 hover:border-pink-500/30 transition-all"
              >
                {/* File info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 shrink-0">
                    <FileAudio className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate max-w-xs md:max-w-md">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatBytes(item.size)} • Target: <strong className="text-pink-400 uppercase">{item.targetFormat}</strong> ({item.bitrate})
                      {item.duration ? ` • ${formatAudioTime(item.duration)}` : ''}
                    </p>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  {item.status === 'converting' && (
                    <span className="text-xs text-pink-400 flex items-center gap-1.5 animate-pulse font-medium">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Converting in browser...
                    </span>
                  )}

                  {item.status === 'completed' && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                        <Check className="w-4 h-4" />
                        Ready
                      </span>
                      <Button
                        size="sm"
                        onClick={() => downloadSingle(item)}
                        className="h-8 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Save
                      </Button>
                    </div>
                  )}

                  {item.status === 'error' && (
                    <span className="text-xs text-rose-400 font-semibold">
                      Failed to decode
                    </span>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQueueItem(item.id)}
                    className="h-8 w-8 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
