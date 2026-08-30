'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { AdSlot } from '@/components/ads/AdSlot';
import { formatBytes } from '@/lib/utils';
import {
  Download,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface DownloadScreenProps {
  downloadUrl: string;
  originalFilename: string;
  targetFilename: string;
  originalSizeBytes: number;
  convertedSizeBytes: number;
  targetFormat: string;
  width?: number;
  height?: number;
  previewUrl?: string | null;
  onReset: () => void;
}

export const DownloadScreen: React.FC<DownloadScreenProps> = ({
  downloadUrl,
  originalFilename,
  targetFilename,
  originalSizeBytes,
  convertedSizeBytes,
  targetFormat,
  width,
  height,
  previewUrl,
  onReset,
}) => {
  const savedBytes = Math.max(0, originalSizeBytes - convertedSizeBytes);
  const savedPercent =
    originalSizeBytes > 0 ? Math.round((savedBytes / originalSizeBytes) * 100) : 0;
  const isSmaller = convertedSizeBytes < originalSizeBytes;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = targetFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Main Success Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 p-6 sm:p-8 shadow-sm dark:border-emerald-900/60 dark:from-slate-900/90 dark:via-emerald-950/20 dark:to-slate-900/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="h-9 w-9" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Conversion Complete!
                </h3>
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  .{targetFormat} Ready
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                <strong className="text-slate-800 dark:text-slate-200">{targetFilename}</strong>
              </p>
              {width && height && (
                <p className="text-xs text-slate-400">
                  Resolution: {width} × {height} px
                </p>
              )}
            </div>
          </div>

          {/* Savings Metric */}
          {isSmaller && savedPercent > 0 && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-300/80 bg-white/90 px-4 py-3 shadow-sm dark:border-emerald-800/80 dark:bg-slate-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">
                  Size Reduced
                </p>
                <p className="text-lg font-black text-slate-900 dark:text-white">
                  -{savedPercent}%{' '}
                  <span className="text-xs font-normal text-slate-500">
                    ({formatBytes(originalSizeBytes)} → {formatBytes(convertedSizeBytes)})
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <Button
            size="lg"
            variant="gradient"
            onClick={handleDownload}
            leftIcon={<Download className="h-5 w-5" />}
            className="flex-1 py-4 text-base font-bold shadow-lg shadow-indigo-500/20"
          >
            Download {targetFilename} ({formatBytes(convertedSizeBytes)})
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={onReset}
            leftIcon={<RotateCcw className="h-4 w-4" />}
            className="py-4"
          >
            Convert Another Image
          </Button>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 flex items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-emerald-100/80 pt-4 dark:border-emerald-900/40">
          <Clock className="h-3.5 w-3.5 text-amber-500" />
          <span>
            Privacy Guarantee: Your file will be <strong>automatically deleted</strong> from our
            server in 2 hours.
          </span>
        </div>
      </div>

      {/* 2. Download Page Header Ad Unit */}
      <div className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-800/60 dark:bg-slate-900/30">
        <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Advertisement
        </p>
        <AdSlot placement="download_page" />
      </div>
    </div>
  );
};
