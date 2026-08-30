import React from 'react';
import { Zap, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TrustBadgesProps {
  className?: string;
  compact?: boolean;
}

export const TrustBadges: React.FC<TrustBadgesProps> = ({ className, compact = false }) => {
  const badges = [
    {
      icon: Zap,
      label: 'Instant Conversion',
      desc: 'Sub-second speed',
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      icon: ShieldCheck,
      label: 'Privacy Auto-Delete',
      desc: 'Files purged in 1 hour',
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      icon: CheckCircle,
      label: '100% Free at Launch',
      desc: 'No credit card needed',
      color: 'text-indigo-500 bg-indigo-500/10',
    },
    {
      icon: Sparkles,
      label: 'Zero Signup Required',
      desc: 'Convert immediately',
      color: 'text-purple-500 bg-purple-500/10',
    },
  ];

  if (compact) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-center gap-3 text-xs text-slate-600 dark:text-slate-400',
          className
        )}
      >
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/60 px-3 py-1 shadow-sm backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/60"
            >
              <Icon className="h-3.5 w-3.5 text-indigo-500" />
              <span>{b.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4',
        className
      )}
    >
      {badges.map((b) => {
        const Icon = b.icon;
        return (
          <div
            key={b.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-3.5 shadow-sm backdrop-blur-sm transition-all hover:border-slate-300 dark:border-slate-800/70 dark:bg-slate-900/50 dark:hover:border-slate-700"
          >
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                b.color
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {b.label}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {b.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
