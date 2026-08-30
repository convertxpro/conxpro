'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/80 bg-white/60 dark:border-slate-800/80 dark:bg-slate-900/60',
          className
        )}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'group relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/50 bg-white/40 text-slate-600 backdrop-blur-md shadow-sm transition-all hover:border-indigo-300 hover:bg-white/60 hover:text-indigo-600 dark:border-slate-700/50 dark:bg-slate-800/40 dark:text-slate-400 dark:hover:border-indigo-500/50 dark:hover:bg-slate-800/60 dark:hover:text-indigo-300 dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]',
        className
      )}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[135deg] text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-500 group-hover:-rotate-90 text-indigo-600 drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" />
      )}
    </button>
  );
};
