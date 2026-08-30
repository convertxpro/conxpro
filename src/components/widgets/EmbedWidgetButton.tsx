'use client';

import React, { useState } from 'react';
import { Code2 } from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { EmbedWidgetModal } from './EmbedWidgetModal';

export interface EmbedWidgetButtonProps {
  tool: ToolMetadata;
  className?: string;
}

export const EmbedWidgetButton: React.FC<EmbedWidgetButtonProps> = ({
  tool,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-white/90 px-3 py-1 text-xs font-semibold text-indigo-700 shadow-sm transition-all hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-800 dark:border-indigo-900/60 dark:bg-slate-900/90 dark:text-indigo-300 dark:hover:bg-indigo-950/50 dark:hover:border-indigo-700 ${className}`}
        title="Embed this interactive tool on your website"
      >
        <Code2 className="h-3.5 w-3.5 text-indigo-500" />
        <span>Embed Widget</span>
      </button>

      <EmbedWidgetModal
        tool={tool}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};
