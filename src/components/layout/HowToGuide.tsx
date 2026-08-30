import React from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface HowToStep {
  title: string;
  description: string;
  tip?: string;
}

export interface HowToGuideProps {
  steps: HowToStep[];
  className?: string;
}

export const HowToGuide: React.FC<HowToGuideProps> = ({ steps, className }) => {
  return (
    <div className={cn('grid grid-cols-1 gap-4 md:grid-cols-3', className)}>
      {steps.map((step, index) => (
        <div
          key={`step-${index}`}
          className="relative flex flex-col justify-between rounded-3xl border border-slate-200/50 bg-white/60 p-8 shadow-lg backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
        >
          <div>
            {/* Step Number Badge */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-sm shadow-indigo-500/20">
                {index + 1}
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Step {index + 1} of {steps.length}
              </span>
            </div>

            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              {step.title}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {step.description}
            </p>
          </div>

          {step.tip && (
            <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-2.5 text-[11px] text-indigo-700 dark:border-indigo-950 dark:bg-indigo-950/30 dark:text-indigo-300">
              <span className="font-semibold">💡 Tip:</span> {step.tip}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
