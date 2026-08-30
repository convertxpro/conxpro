'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type MetricStatus =
  | 'optimal'
  | 'good'
  | 'warning'
  | 'warn'
  | 'error'
  | 'bad'
  | 'info'
  | 'neutral';

export interface HardwareMetricCardProps {
  title: string;
  value: React.ReactNode;
  unit?: string;
  subtext?: string;
  icon?: React.ElementType | React.ReactNode;
  status?: MetricStatus;
  statusLabel?: string;
  trend?: 'up' | 'down' | 'stable';
  progress?: number; // 0 - 100
  progressColor?: string;
  badge?: string;
  copyable?: boolean;
  variant?: 'default' | 'compact' | 'hero';
  className?: string;
  children?: React.ReactNode;
}

const STATUS_THEME: Record<
  string,
  {
    border: string;
    bg: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    barBg: string;
    iconColor: string;
    defaultIcon: React.ElementType;
    defaultLabel: string;
  }
> = {
  optimal: {
    border: 'border-emerald-500/30 hover:border-emerald-500/50 dark:border-emerald-500/20',
    bg: 'from-emerald-500/10 via-slate-900/40 to-slate-900/60',
    text: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-300',
    barBg: 'from-emerald-500 to-teal-400',
    iconColor: 'text-emerald-400',
    defaultIcon: CheckCircle2,
    defaultLabel: 'Optimal',
  },
  good: {
    border: 'border-emerald-500/30 hover:border-emerald-500/50 dark:border-emerald-500/20',
    bg: 'from-emerald-500/10 via-slate-900/40 to-slate-900/60',
    text: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
    badgeText: 'text-emerald-300',
    barBg: 'from-emerald-500 to-teal-400',
    iconColor: 'text-emerald-400',
    defaultIcon: CheckCircle2,
    defaultLabel: 'Good',
  },
  warning: {
    border: 'border-amber-500/30 hover:border-amber-500/50 dark:border-amber-500/20',
    bg: 'from-amber-500/10 via-slate-900/40 to-slate-900/60',
    text: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-300',
    barBg: 'from-amber-500 to-orange-400',
    iconColor: 'text-amber-400',
    defaultIcon: AlertTriangle,
    defaultLabel: 'Warning',
  },
  warn: {
    border: 'border-amber-500/30 hover:border-amber-500/50 dark:border-amber-500/20',
    bg: 'from-amber-500/10 via-slate-900/40 to-slate-900/60',
    text: 'text-amber-400',
    badgeBg: 'bg-amber-500/15 border-amber-500/30',
    badgeText: 'text-amber-300',
    barBg: 'from-amber-500 to-orange-400',
    iconColor: 'text-amber-400',
    defaultIcon: AlertTriangle,
    defaultLabel: 'Warning',
  },
  error: {
    border: 'border-rose-500/30 hover:border-rose-500/50 dark:border-rose-500/20',
    bg: 'from-rose-500/10 via-slate-900/40 to-slate-900/60',
    text: 'text-rose-400',
    badgeBg: 'bg-rose-500/15 border-rose-500/30',
    badgeText: 'text-rose-300',
    barBg: 'from-rose-500 to-pink-500',
    iconColor: 'text-rose-400',
    defaultIcon: XCircle,
    defaultLabel: 'Fault Detected',
  },
  bad: {
    border: 'border-rose-500/30 hover:border-rose-500/50 dark:border-rose-500/20',
    bg: 'from-rose-500/10 via-slate-900/40 to-slate-900/60',
    text: 'text-rose-400',
    badgeBg: 'bg-rose-500/15 border-rose-500/30',
    badgeText: 'text-rose-300',
    barBg: 'from-rose-500 to-pink-500',
    iconColor: 'text-rose-400',
    defaultIcon: XCircle,
    defaultLabel: 'Fault Detected',
  },
  info: {
    border: 'border-cyan-500/30 hover:border-cyan-500/50 dark:border-cyan-500/20',
    bg: 'from-cyan-500/10 via-slate-900/40 to-slate-900/60',
    text: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/15 border-cyan-500/30',
    badgeText: 'text-cyan-300',
    barBg: 'from-cyan-500 to-blue-500',
    iconColor: 'text-cyan-400',
    defaultIcon: Info,
    defaultLabel: 'Active',
  },
  neutral: {
    border: 'border-slate-800 hover:border-slate-700 dark:border-slate-800',
    bg: 'from-slate-800/20 via-slate-900/40 to-slate-900/60',
    text: 'text-slate-200',
    badgeBg: 'bg-slate-800/60 border-slate-700',
    badgeText: 'text-slate-300',
    barBg: 'from-slate-600 to-slate-500',
    iconColor: 'text-slate-400',
    defaultIcon: Info,
    defaultLabel: 'Ready',
  },
};

export const HardwareMetricCard: React.FC<HardwareMetricCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon,
  status = 'neutral',
  statusLabel,
  trend,
  progress,
  progressColor,
  badge,
  copyable = false,
  variant = 'default',
  className,
  children,
}) => {
  const [copied, setCopied] = useState(false);
  const theme = STATUS_THEME[status] || STATUS_THEME.neutral;
  const StatusIcon = theme.defaultIcon;

  const handleCopy = () => {
    if (!copyable) return;
    const textToCopy = `${value}${unit ? ` ${unit}` : ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    const IconComp = icon as React.ElementType;
    return <IconComp className={cn('h-4 w-4', theme.iconColor)} />;
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'group relative flex items-center justify-between rounded-2xl border bg-gradient-to-br p-3.5 shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5',
          theme.border,
          theme.bg,
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {renderIcon() && (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800/80">
              {renderIcon()}
            </div>
          )}
          <div className="min-w-0">
            <span className="block truncate text-xs font-medium text-slate-400">{title}</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="font-mono text-base font-bold text-white truncate">{value}</span>
              {unit && <span className="text-xs text-slate-400 font-mono">{unit}</span>}
            </div>
          </div>
        </div>

        {statusLabel && (
          <span
            className={cn(
              'shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
              theme.badgeBg,
              theme.badgeText
            )}
          >
            {statusLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-3xl border bg-gradient-to-br p-5 sm:p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        theme.border,
        theme.bg,
        className
      )}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            {renderIcon() && (
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-800/80">
                {renderIcon()}
              </div>
            )}
            <span className="truncate">{title}</span>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                {badge}
              </span>
            )}
            {(statusLabel || status !== 'neutral') && (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                  theme.badgeBg,
                  theme.badgeText
                )}
              >
                <StatusIcon className="h-3 w-3" />
                <span>{statusLabel || theme.defaultLabel}</span>
              </span>
            )}
          </div>
        </div>

        {/* Big Numerals Display */}
        <div className="mt-4 flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-1.5 min-w-0">
            <span className="font-mono text-2xl sm:text-3xl font-extrabold tracking-tight text-white truncate">
              {value}
            </span>
            {unit && (
              <span className="text-xs sm:text-sm font-semibold text-slate-400 font-mono shrink-0">
                {unit}
              </span>
            )}
          </div>

          {/* Trend or Copy Button */}
          <div className="flex items-center gap-1 shrink-0">
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-0.5 text-xs font-medium',
                  trend === 'up' && 'text-emerald-400',
                  trend === 'down' && 'text-rose-400',
                  trend === 'stable' && 'text-slate-400'
                )}
              >
                {trend === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
                {trend === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
                {trend === 'stable' && <Minus className="h-3.5 w-3.5" />}
              </div>
            )}

            {copyable && (
              <button
                type="button"
                onClick={handleCopy}
                title="Copy value"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-400 transition hover:border-slate-700 hover:text-white"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar (Optional) */}
        {typeof progress === 'number' && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
              <span>Utilization</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={cn('h-full transition-all duration-300 bg-gradient-to-r', progressColor || theme.barBg)}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}

        {/* Subtext description */}
        {subtext && (
          <p className="mt-2 text-xs text-slate-400 leading-relaxed truncate">
            {subtext}
          </p>
        )}
      </div>

      {children && <div className="mt-3 pt-3 border-t border-slate-800/80">{children}</div>}
    </div>
  );
};
