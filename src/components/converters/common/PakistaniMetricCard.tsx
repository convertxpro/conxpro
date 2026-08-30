'use client';

import React, { useState } from 'react';
import { Info, HelpCircle, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PakistaniMetricCardProps {
  titleEn: string;
  titleUr?: string;
  value: string | number;
  secondaryValue?: string;
  unit?: string;
  badge?: string;
  statutoryBasis?: string;
  statutoryReference?: string;
  isHighlighted?: boolean;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  southAsianNumeralText?: string;
  className?: string;
}

export const PakistaniMetricCard: React.FC<PakistaniMetricCardProps> = ({
  titleEn,
  titleUr,
  value,
  secondaryValue,
  unit,
  badge,
  statutoryBasis,
  statutoryReference,
  isHighlighted = false,
  icon,
  trend,
  southAsianNumeralText,
  className,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md',
        isHighlighted
          ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-white/90 to-teal-500/10 shadow-lg dark:border-emerald-500/30 dark:from-emerald-950/40 dark:via-slate-900/80 dark:to-teal-950/30 dark:shadow-emerald-950/20'
          : 'border-slate-200/80 bg-white/80 hover:border-slate-300 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700',
        className
      )}
    >
      {/* Top Row: Title, Urdu Subtitle, Tooltip and Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {titleEn}
            </h4>
            {statutoryBasis && (
              <div className="relative inline-block">
                <button
                  type="button"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={() => setShowTooltip((p) => !p)}
                  aria-label="Statutory Information"
                  className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                >
                  <Info className="h-3.5 w-3.5" />
                </button>

                {showTooltip && (
                  <div className="absolute left-0 top-5 z-30 w-64 rounded-xl border border-slate-200 bg-white/95 p-3 text-xs text-slate-700 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-200 animate-in fade-in zoom-in-95 duration-150">
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                      <Sparkles className="h-3 w-3 text-emerald-500" />
                      <span>Statutory & Legal Basis</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                      {statutoryBasis}
                    </p>
                    {statutoryReference && (
                      <p className="mt-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 border-t border-slate-100 dark:border-slate-800 pt-1">
                        Ref: {statutoryReference}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {titleUr && (
            <p
              className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-snug"
              dir="rtl"
              style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', system-ui, sans-serif" }}
            >
              {titleUr}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {badge && (
            <span
              className={cn(
                'rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
                isHighlighted
                  ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 dark:bg-emerald-500/25 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {badge}
            </span>
          )}

          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/80 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
              {icon}
            </div>
          )}
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline gap-2">
        <span
          className={cn(
            'text-2xl sm:text-3xl font-extrabold tracking-tight',
            isHighlighted
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white'
          )}
        >
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {/* Secondary Values & South Asian numeral format (Lakhs/Crores) */}
      {(secondaryValue || southAsianNumeralText || trend) && (
        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100/80 pt-2.5 dark:border-slate-800/60">
          {southAsianNumeralText ? (
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/50 px-2 py-0.5 rounded-md">
              <span>🇵🇰</span>
              <span>{southAsianNumeralText}</span>
            </div>
          ) : secondaryValue ? (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {secondaryValue}
            </span>
          ) : (
            <div />
          )}

          {trend && (
            <div
              className={cn(
                'inline-flex items-center gap-1 text-xs font-semibold',
                trend.direction === 'up' && 'text-emerald-600 dark:text-emerald-400',
                trend.direction === 'down' && 'text-rose-600 dark:text-rose-400',
                trend.direction === 'neutral' && 'text-slate-500'
              )}
            >
              {trend.direction === 'up' && <TrendingUp className="h-3.5 w-3.5" />}
              {trend.direction === 'down' && <TrendingDown className="h-3.5 w-3.5" />}
              <span>{trend.label}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
