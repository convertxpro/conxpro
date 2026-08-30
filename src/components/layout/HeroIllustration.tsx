'use client';

import React from 'react';
import { FileText, Image as ImageIcon, ArrowRight, Download, Sparkles, FileOutput } from 'lucide-react';
import { cn } from '@/lib/utils';

export const HeroIllustration: React.FC = () => {
  return (
    <div className="relative mx-auto mt-16 mb-8 max-w-4xl flex flex-col md:flex-row items-center justify-center gap-6 p-4">
      
      {/* Left Card: Input File */}
      <div className="relative z-10 w-64 glass-card-elevated rounded-3xl p-6 flex flex-col items-center shadow-lg border border-slate-200/50 dark:border-slate-700/50">
        <div className="absolute -top-3 -left-3 rounded-full bg-slate-900 dark:bg-slate-100 p-2 shadow-lg">
          <FileText className="h-5 w-5 text-white dark:text-slate-900" />
        </div>
        <div className="h-24 w-20 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-4 flex items-center justify-center">
          <span className="font-bold text-slate-400 dark:text-slate-500">.PDF</span>
        </div>
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full text-center">contract_final.pdf</h3>
        <span className="mt-1 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          2.4 MB
        </span>
      </div>

      {/* Center Flow: Transformation Beam */}
      <div className="relative flex-1 hidden md:flex flex-col items-center justify-center min-w-[150px]">
        {/* Animated Line */}
        <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden">
          <div className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 animate-[shimmer-slide_1.5s_infinite]" />
        </div>
        
        {/* Status Indicator */}
        <div className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="h-10 w-10 rounded-full bg-white dark:bg-slate-900 shadow-xl border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-center z-10 animate-pulse-glow">
            <ArrowRight className="h-5 w-5 text-indigo-500" />
          </div>
          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 drop-shadow-sm">
            Converting...
          </span>
        </div>
      </div>
      
      {/* Mobile arrow */}
      <div className="md:hidden flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/30">
        <ArrowRight className="h-5 w-5 text-indigo-500" />
      </div>

      {/* Right Card: Output File */}
      <div className="relative z-10 w-64 glass-card-elevated rounded-3xl p-6 flex flex-col items-center shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
        {/* Glowing border effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="absolute -top-3 -right-3 rounded-full bg-emerald-500 p-2 shadow-lg shadow-emerald-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        
        <div className="h-24 w-20 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 mb-4 flex items-center justify-center relative group">
          <FileOutput className="h-8 w-8 text-emerald-500" />
        </div>
        
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full text-center">contract_final.docx</h3>
        
        <button className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:brightness-110">
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </div>

    </div>
  );
};
