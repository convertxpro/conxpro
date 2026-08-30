'use client';

import React, { useEffect, useState } from 'react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { AdSlot } from '@/components/ads/AdSlot';
import { Loader2, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';

export interface ProcessingScreenProps {
  filename?: string;
  sourceFormat?: string;
  targetFormat?: string;
  progress?: number;
  statusMessage?: string;
}

const STAGES = [
  'Verifying magic bytes & file integrity...',
  'Decoding image buffer & color profiles...',
  'Applying high-definition format transformation...',
  'Finalizing MozJPEG / WebP compression...',
  'Generating secure 1-time download package...',
];

export const ProcessingScreen: React.FC<ProcessingScreenProps> = ({
  filename,
  sourceFormat,
  targetFormat,
  progress: externalProgress,
  statusMessage,
}) => {
  const [internalProgress, setInternalProgress] = useState(15);
  const [stageIndex, setStageIndex] = useState(0);

  // Smooth realistic progress animation (typically 2-3 seconds)
  useEffect(() => {
    if (externalProgress !== undefined) {
      setInternalProgress(externalProgress);
      return;
    }

    const interval = setInterval(() => {
      setInternalProgress((prev) => {
        if (prev >= 92) return prev;
        const inc = Math.floor(Math.random() * 15) + 8;
        const nextVal = Math.min(prev + inc, 92);
        const nextStage = Math.min(
          Math.floor((nextVal / 100) * STAGES.length),
          STAGES.length - 1
        );
        setStageIndex(nextStage);
        return nextVal;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [externalProgress]);

  const activeStageText = statusMessage || STAGES[stageIndex];

  return (
    <div className="w-full space-y-6">
      {/* Top Processing Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 p-6 sm:p-8 shadow-sm dark:border-indigo-950/80 dark:from-slate-900/90 dark:via-indigo-950/30 dark:to-slate-900/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
              <Loader2 className="h-7 w-7 animate-spin" />
              <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-white dark:ring-slate-900">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Converting your image...
                </h3>
                {targetFormat && (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold uppercase text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                    To {targetFormat}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {filename ? `Processing "${filename}"` : 'Converting image with high-definition rendering...'}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>End-to-End Encrypted Session</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="mt-6 space-y-2">
          <ProgressBar progress={internalProgress} label={activeStageText} />
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>{activeStageText}</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {Math.round(internalProgress)}%
            </span>
          </div>
        </div>
      </div>

      {/* Processing Screen Ad Slot (Adjacently situated) */}
      <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/30">
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Advertisement
        </p>
        <AdSlot placement="processing_screen" />
      </div>
    </div>
  );
};
