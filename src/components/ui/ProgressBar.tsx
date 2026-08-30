import React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  statusText?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  statusText,
  className,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || statusText) && (
        <div className="flex justify-between text-xs font-medium">
          <span className="text-slate-700 dark:text-slate-300">{label}</span>
          <span className="text-indigo-600 dark:text-indigo-400">
            {statusText || `${Math.round(clampedProgress)}%`}
          </span>
        </div>
      )}
      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
