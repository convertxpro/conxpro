'use client';

import React, { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProcessingScreen } from '@/components/conversion/ProcessingScreen';
import { DownloadScreen } from '@/components/conversion/DownloadScreen';
import { formatBytes } from '@/lib/utils';
import {
  Archive,
  FolderArchive,
  ArrowRight,
  AlertCircle,
  Plus,
  Trash2,
  File,
  Folder,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export interface ArchiveConverterProps {
  initialMode?: 'create' | 'extract';
  initialToolSlug?: string;
}

export const ArchiveConverter: React.FC<ArchiveConverterProps> = ({
  initialMode = 'create',
  initialToolSlug,
}) => {
  const [mode, setMode] = useState<'create' | 'extract'>(initialMode);
  const [stage, setStage] = useState<'upload' | 'processing' | 'download'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [archiveName, setArchiveName] = useState<string>('archive.zip');
  const [compressionLevel, setCompressionLevel] = useState<number>(9);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Extracted preview entries
  const [extractedEntries, setExtractedEntries] = useState<
    { entryName: string; size: number; isDirectory: boolean }[]
  >([]);

  const [conversionResult, setConversionResult] = useState<{
    downloadUrl: string;
    originalFilename: string;
    targetFilename: string;
    originalSizeBytes: number;
    convertedSizeBytes: number;
    savedBytes?: number;
    savedPercent?: number;
    targetFormat: string;
  } | null>(null);

  useEffect(() => {
    if (initialToolSlug) {
      if (initialToolSlug === 'create-zip' || initialToolSlug === 'zip-compressor') {
        setMode('create');
      } else if (initialToolSlug === 'extract-zip') {
        setMode('extract');
      }
    }
  }, [initialToolSlug]);

  const handleAddFiles = (newFiles: File[]) => {
    if (mode === 'create') {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setErrorMessage('Please upload files to proceed.');
      return;
    }

    setErrorMessage(null);
    setStage('processing');

    try {
      const formData = new FormData();
      formData.append('action', mode === 'create' ? 'create-zip' : 'extract-zip');

      if (mode === 'create') {
        files.forEach((file) => formData.append('files', file));
        formData.append('archiveName', archiveName);
        formData.append('level', compressionLevel.toString());
      } else {
        formData.append('file', files[0]);
      }

      const response = await fetch('/api/convert/archive', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Archive operation failed. Please try again.');
      }

      if (data.entries) {
        setExtractedEntries(data.entries);
      }

      setConversionResult({
        downloadUrl: data.downloadUrl,
        originalFilename: data.originalFilename,
        targetFilename: data.targetFilename,
        originalSizeBytes: data.originalSizeBytes,
        convertedSizeBytes: data.convertedSizeBytes,
        savedBytes: data.savedBytes,
        savedPercent: data.savedPercent,
        targetFormat: data.targetFormat || 'zip',
      });

      setStage('download');
    } catch (err: any) {
      console.error('Archive operation error:', err);
      setErrorMessage(err.message || 'An error occurred during archive operation.');
      setStage('upload');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setExtractedEntries([]);
    setConversionResult(null);
    setErrorMessage(null);
    setStage('upload');
  };

  if (stage === 'processing') {
    return (
      <ProcessingScreen
        filename={mode === 'create' ? archiveName : files[0]?.name || 'Archive'}
        sourceFormat={mode === 'create' ? 'Files' : 'ZIP'}
        targetFormat={mode === 'create' ? 'ZIP' : 'Extracted'}
      />
    );
  }

  if (stage === 'download' && conversionResult) {
    return (
      <DownloadScreen
        downloadUrl={conversionResult.downloadUrl}
        originalFilename={conversionResult.originalFilename}
        targetFilename={conversionResult.targetFilename}
        originalSizeBytes={conversionResult.originalSizeBytes}
        convertedSizeBytes={conversionResult.convertedSizeBytes}
        targetFormat={conversionResult.targetFormat}
        currentSlug={initialToolSlug || (mode === 'create' ? 'zip-compressor' : 'zip-extractor')}
        categorySlug="archive"
        onReset={handleReset}
      />
    );
  }

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full space-y-6">
      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => {
              setMode('create');
              setFiles([]);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              mode === 'create'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Archive className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>Create ZIP Archive</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('extract');
              setFiles([]);
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
              mode === 'extract'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FolderArchive className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <span>Extract & Inspect ZIP</span>
          </button>
        </div>
      </div>

      {files.length === 0 ? (
        <Dropzone
          accept={mode === 'create' ? undefined : '.zip,.7z,.tar,.gz,.rar,application/zip'}
          multiple={mode === 'create'}
          maxSizeMb={50}
          onFilesSelected={handleAddFiles}
          acceptedFormatsText={
            mode === 'create'
              ? 'Select any files or folders to compress into a high-efficiency ZIP'
              : 'Upload a ZIP, 7Z, or TAR archive to extract (up to 50MB free)'
          }
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/60">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {mode === 'create' ? <Archive className="h-6 w-6" /> : <FolderArchive className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {mode === 'create' ? `${files.length} Files Ready to Bundle` : files[0]?.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Size: <strong>{formatBytes(totalSize)}</strong> • 256-bit Secure Stream
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {mode === 'create' && (
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Files</span>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) handleAddFiles(Array.from(e.target.files));
                    }}
                    className="hidden"
                  />
                </label>
              )}
              <Button size="sm" variant="secondary" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </div>

          {/* Files List in Create Mode */}
          {mode === 'create' && (
            <div className="mt-5 space-y-4">
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <File className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{formatBytes(file.size)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded-lg dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Archive Name & Compression Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    ZIP Archive Name
                  </label>
                  <Input
                    value={archiveName}
                    onChange={(e) => setArchiveName(e.target.value)}
                    placeholder="archive.zip"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Compression Level
                  </label>
                  <select
                    value={compressionLevel}
                    onChange={(e) => setCompressionLevel(parseInt(e.target.value, 10))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-slate-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                  >
                    <option value={9}>Maximum Deflate (Smallest File Size)</option>
                    <option value={6}>Standard Compression (Balanced)</option>
                    <option value={1}>Fast Compression (Speed Priority)</option>
                    <option value={0}>Store / No Compression (Fastest)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Extract info */}
          {mode === 'extract' && (
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs text-slate-600 dark:border-slate-800/60 dark:bg-slate-800/30 dark:text-slate-400 space-y-2">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                ⚡ Deep Inspection & Extraction:
              </p>
              <p>
                ApexTools scans the internal directory tree, verifies CRC checksums, and decompresses all packaged assets securely.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Convert Button */}
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleConvert}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto min-w-[240px] py-4 text-base font-bold shadow-lg shadow-slate-500/20 bg-gradient-to-r from-slate-700 to-zinc-600 hover:from-slate-800 hover:to-zinc-700 text-white"
            >
              {mode === 'create' ? `Create ${archiveName} Now` : 'Extract ZIP Archive Now'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
