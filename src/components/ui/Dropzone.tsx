'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import { cn, formatBytes } from '@/lib/utils';

export interface DropzoneProps {
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  acceptedFormatsText?: string;
  className?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  accept,
  maxSizeMb = 25,
  multiple = false,
  onFilesSelected,
  disabled = false,
  acceptedFormatsText = 'All common file formats supported',
  className,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMb * 1024 * 1024;

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorMessage(null);

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `File "${file.name}" exceeds the maximum free size of ${maxSizeMb} MB.`
        );
        return;
      }
      validFiles.push(file);
      if (!multiple) break;
    }

    setSelectedFiles(validFiles);
    onFilesSelected(validFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (index: number) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected(updated);
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          'group relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden',
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/80 dark:border-indigo-400 dark:bg-indigo-950/50 scale-[1.02] shadow-2xl'
            : 'border-slate-300/80 bg-slate-50/50 hover:border-indigo-400 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/30 dark:hover:border-indigo-500/80 dark:hover:bg-slate-900/60',
          disabled && 'pointer-events-none opacity-50'
        )}
      >
        {/* Animated Dashed Border Effect (visible on hover/drag) */}
        <div className="absolute inset-0 pointer-events-none rounded-3xl border-2 border-transparent group-hover:animate-[spin_10s_linear_infinite] group-hover:border-t-indigo-500/30 dark:group-hover:border-t-indigo-400/30 transition-all duration-500" />
        
        {/* Background glow on drag over */}
        <div className={cn("absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/5 to-emerald-500/10 opacity-0 transition-opacity duration-500 pointer-events-none", isDragOver && "opacity-100")} />

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div className={cn("relative mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-lg group-hover:shadow-indigo-500/20 dark:bg-indigo-950/60 dark:text-indigo-400", isDragOver && "animate-bounce")}>
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl animate-pulse" />
          <UploadCloud className="h-10 w-10 relative z-10" />
        </div>

        <h3 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white relative z-10">
          Drag & drop your file{multiple ? 's' : ''} here, or{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 border-b-2 border-indigo-200 dark:border-indigo-900/50 hover:border-indigo-600 dark:hover:border-indigo-400 transition-colors">
            browse
          </span>
        </h3>

        <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400 relative z-10">
          Max file size: <span className="font-bold text-slate-700 dark:text-slate-300">{maxSizeMb}MB</span> (Free Tier)
        </p>

        {/* Supported Format Pill Cloud */}
        <div className="mt-6 flex flex-wrap justify-center gap-1.5 relative z-10 opacity-80 group-hover:opacity-100 transition-opacity">
          {acceptedFormatsText.split(',').map((format, i) => (
            <span key={i} className="inline-flex items-center rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
              {format.trim() || 'ALL FORMATS'}
            </span>
          ))}
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <File className="h-5 w-5" />
                </div>
                <div className="truncate text-left">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
