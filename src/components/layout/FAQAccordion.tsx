'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FaqItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FaqItem[];
  className?: string;
}

export const FAQAccordion: React.FC<FAQAccordionProps> = ({ items, className }) => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]); // Open first item by default

  const toggleIndex = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);

        return (
          <div
            key={`faq-${index}`}
            className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 shadow-lg backdrop-blur-xl transition-all duration-300 dark:border-slate-700/50 dark:bg-slate-900/50 hover:shadow-xl hover:-translate-y-0.5"
          >
            <button
              type="button"
              onClick={() => toggleIndex(index)}
              className="flex w-full items-center justify-between p-5 text-left transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold text-slate-900 dark:text-white pr-4">
                {item.question}
              </span>
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-transform duration-200 dark:bg-slate-800 dark:text-slate-400',
                  isOpen && 'rotate-180 bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'
                )}
              >
                <ChevronDown className="h-4 w-4" />
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-slate-100 px-5 py-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800/60 dark:text-slate-300 animate-fadeIn">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
