'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, ChevronDown, CheckCircle2, ServerOff, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PrivacyAssuranceBadgeProps {
  className?: string;
  variant?: 'compact' | 'detailed' | 'banner';
  customTitle?: string;
  customDescription?: string;
}

export const PrivacyAssuranceBadge: React.FC<PrivacyAssuranceBadgeProps> = ({
  className,
  variant = 'detailed',
  customTitle,
  customDescription,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 backdrop-blur-sm',
          className
        )}
      >
        <Lock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>100% Private (Browser-Only)</span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 p-4 shadow-sm backdrop-blur-md dark:border-emerald-900/60 dark:from-emerald-950/40 dark:via-slate-900/60 dark:to-emerald-950/40',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:bg-emerald-500/30 dark:text-emerald-300">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {customTitle || '🔒 100% Client-Side Privacy Guarantee'}
            </h4>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
              {customDescription ||
                "Your data is computed entirely inside your browser's JavaScript engine and is never sent to our servers."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white/80 to-teal-50/40 p-4 shadow-sm backdrop-blur-md transition-all duration-200 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:via-slate-900/70 dark:to-teal-950/20',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {customTitle || '100% Client-Side Privacy Guaranteed'}
              </span>
              <span className="hidden sm:inline-flex rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-500/25 dark:text-emerald-300">
                Zero Cloud Latency
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {customDescription ||
                "Your data is computed entirely inside your browser's JavaScript engine and is never transmitted across the network."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1.5 self-end sm:self-center text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
        >
          <span>{isExpanded ? 'Hide Security Details' : 'Verify Privacy'}</span>
          <ChevronDown
            className={cn('h-3.5 w-3.5 transition-transform duration-200', isExpanded && 'rotate-180')}
          />
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-emerald-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <ServerOff className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Zero Server Ingestion</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Tokens, JSON, code, or formulas are never logged or stored remotely.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <Cpu className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Local Web Engine</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Powered by WebAssembly, Web Crypto & local V8 JavaScript VM.</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">Offline Operational</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Functions continuously even with network disconnected after page load.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
