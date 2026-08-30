'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AdSlot } from '@/components/ads/AdSlot';
import { Loader2, Sparkles, ShieldCheck, Film, Music, Cpu } from 'lucide-react';

export interface MediaProcessingViewProps {
  jobId: string;
  originalFilename: string;
  targetFormat: string;
  toolType?: string;
  onComplete: (result: any) => void;
  onError: (error: string) => void;
}

const DEFAULT_STAGES = [
  'Initializing media conversion environment...',
  'Demuxing video/audio container & streams...',
  'Transcoding frames with FFmpeg acceleration...',
  'Applying compression matrices & audio filters...',
  'Muxing output stream into high-fidelity container...',
  'Finalizing secure download package...',
];

export const MediaProcessingView: React.FC<MediaProcessingViewProps> = ({
  jobId,
  originalFilename,
  targetFormat,
  toolType,
  onComplete,
  onError,
}) => {
  const [progress, setProgress] = useState(10);
  const [stageText, setStageText] = useState('Starting conversion...');
  const [statusMessage, setStatusMessage] = useState('Connecting to transcoding worker...');
  const completedRef = useRef(false);

  useEffect(() => {
    if (!jobId) return;
    completedRef.current = false;

    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    // 1. Try Server-Sent Events (SSE) first for real-time push updates
    try {
      eventSource = new EventSource(`/api/jobs/${jobId}/progress`);

      eventSource.onmessage = (event) => {
        if (completedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }
          if (data.stage) setStageText(data.stage);
          if (data.message) setStatusMessage(data.message);

          if (data.status === 'completed' && data.result) {
            completedRef.current = true;
            if (eventSource) eventSource.close();
            onComplete(data.result);
          } else if (data.status === 'failed') {
            completedRef.current = true;
            if (eventSource) eventSource.close();
            onError(data.error || data.message || 'Media conversion failed.');
          }
        } catch (e) {
          console.warn('SSE parse error:', e);
        }
      };

      eventSource.onerror = () => {
        // If SSE fails, fallback to polling
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        startPolling();
      };
    } catch {
      startPolling();
    }

    // 2. Polling fallback function
    function startPolling() {
      if (pollInterval || completedRef.current) return;

      pollInterval = setInterval(async () => {
        if (completedRef.current) {
          if (pollInterval) clearInterval(pollInterval);
          return;
        }

        try {
          const res = await fetch(`/api/jobs/${jobId}/progress`, {
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) return;

          const data = await res.json();
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }
          if (data.stage) setStageText(data.stage);
          if (data.message) setStatusMessage(data.message);

          if (data.status === 'completed' && data.result) {
            completedRef.current = true;
            if (pollInterval) clearInterval(pollInterval);
            onComplete(data.result);
          } else if (data.status === 'failed') {
            completedRef.current = true;
            if (pollInterval) clearInterval(pollInterval);
            onError(data.error || data.message || 'Media conversion failed.');
          }
        } catch (e) {
          // ignore transient poll error
        }
      }, 500);
    }

    return () => {
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [jobId, onComplete, onError]);

  const isAudioTool = toolType?.includes('audio') || toolType === 'video-to-mp3';

  return (
    <div className="w-full space-y-6">
      {/* 1. Main Processing Glassmorphism Card */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-orange-50/50 p-6 sm:p-8 shadow-sm dark:border-amber-950/80 dark:from-slate-900/90 dark:via-amber-950/20 dark:to-slate-900/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25">
              {isAudioTool ? (
                <Music className="h-8 w-8 animate-pulse" />
              ) : (
                <Film className="h-8 w-8 animate-pulse" />
              )}
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Transcoding Media...
                </h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold uppercase text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  Target: .{targetFormat}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
                Processing &quot;{originalFilename}&quot; with native FFmpeg engine
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>High-Speed BullMQ Queue</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-6 space-y-2">
          <ProgressBar progress={progress} label={statusMessage} />
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium">{stageText}</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {Math.round(progress)}%
            </span>
          </div>
        </div>

        {/* Transcoding Highlights */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-amber-100/80 pt-4 dark:border-amber-950/60 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-amber-500" />
            <span>Multi-threaded FFmpeg</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>Lossless Color / Audio fidelity</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-500" />
            <span>Auto-deleted in 2 hours</span>
          </div>
        </div>
      </div>

      {/* Honest Processing Screen Native Ad Slot */}
      <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/30">
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Advertisement
        </p>
        <AdSlot placement="processing_screen" />
      </div>
    </div>
  );
};
