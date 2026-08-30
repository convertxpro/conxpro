'use client';

import React, { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ProcessingScreen } from '@/components/conversion/ProcessingScreen';
import { DownloadScreen } from '@/components/conversion/DownloadScreen';
import { formatBytes } from '@/lib/utils';
import {
  FileText,
  ArrowRight,
  AlertCircle,
  FileEdit,
  Table,
  Presentation,
  CheckCircle2,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface DocumentConverterProps {
  initialTargetFormat?: string;
  initialToolSlug?: string;
}

const DOCUMENT_FORMATS = [
  { id: 'pdf', label: 'PDF Document', ext: '.pdf', badge: 'Universal' },
  { id: 'docx', label: 'Word (DOCX)', ext: '.docx', badge: 'Editable' },
  { id: 'xlsx', label: 'Excel (XLSX)', ext: '.xlsx', badge: 'Spreadsheet' },
  { id: 'pptx', label: 'PowerPoint', ext: '.pptx', badge: 'Presentation' },
  { id: 'txt', label: 'Plain Text', ext: '.txt', badge: 'Lightweight' },
  { id: 'html', label: 'HTML Web', ext: '.html', badge: 'Web Page' },
];

export const DocumentConverter: React.FC<DocumentConverterProps> = ({
  initialTargetFormat = 'docx',
  initialToolSlug,
}) => {
  const [stage, setStage] = useState<'upload' | 'processing' | 'download'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>(initialTargetFormat);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
      if (initialToolSlug === 'pdf-to-word') setTargetFormat('docx');
      else if (initialToolSlug === 'word-to-pdf') setTargetFormat('pdf');
      else if (initialToolSlug === 'pdf-to-excel') setTargetFormat('xlsx');
      else if (initialToolSlug === 'excel-to-pdf') setTargetFormat('pdf');
      else if (initialToolSlug === 'pdf-to-powerpoint') setTargetFormat('pptx');
      else if (initialToolSlug === 'powerpoint-to-pdf') setTargetFormat('pdf');
      else if (initialToolSlug.includes('-to-')) {
        const parts = initialToolSlug.split('-to-');
        if (parts[1]) setTargetFormat(parts[1].toLowerCase());
      }
    }
  }, [initialToolSlug]);

  const handleConvert = async () => {
    if (!selectedFile) return;

    setErrorMessage(null);
    setStage('processing');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('targetFormat', targetFormat);

      const response = await fetch('/api/convert/document', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Document conversion failed. Please try again.');
      }

      setConversionResult({
        downloadUrl: data.downloadUrl,
        originalFilename: data.originalFilename,
        targetFilename: data.targetFilename,
        originalSizeBytes: data.originalSizeBytes,
        convertedSizeBytes: data.convertedSizeBytes,
        savedBytes: data.savedBytes,
        savedPercent: data.savedPercent,
        targetFormat: data.targetFormat,
      });

      setStage('download');
    } catch (err: any) {
      console.error('Document conversion error:', err);
      setErrorMessage(err.message || 'An error occurred during document conversion.');
      setStage('upload');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setConversionResult(null);
    setErrorMessage(null);
    setStage('upload');
  };

  if (stage === 'processing') {
    return (
      <ProcessingScreen
        filename={selectedFile?.name || 'Document'}
        sourceFormat={selectedFile?.name.split('.').pop()?.toUpperCase() || 'DOC'}
        targetFormat={targetFormat.toUpperCase()}
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
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {!selectedFile ? (
        <Dropzone
          accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.html,.rtf,.epub,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          maxSizeMb={25}
          onFilesSelected={(files) => {
            if (files.length > 0) {
              setSelectedFile(files[0]);
              setErrorMessage(null);
            }
          }}
          acceptedFormatsText="Upload PDF, DOCX, XLSX, PPTX, TXT, or HTML (Up to 25MB free)"
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          {/* File Information Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/60">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                <FileText className="h-7 w-7" />
              </div>
              <div className="text-left overflow-hidden">
                <h4 className="truncate font-bold text-slate-900 dark:text-white">
                  {selectedFile.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Size: <strong>{formatBytes(selectedFile.size)}</strong> • Bank-Grade 256-bit Encryption
                </p>
              </div>
            </div>

            <Button size="sm" variant="secondary" onClick={handleReset}>
              Change File
            </Button>
          </div>

          {/* Target Format Selector */}
          <div className="mt-6 space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>Convert Document To</span>
              <span className="text-red-600 dark:text-red-400 font-semibold lowercase">
                saving as .{targetFormat}
              </span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {DOCUMENT_FORMATS.map((fmt) => {
                const isSelected = targetFormat === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setTargetFormat(fmt.id)}
                    className={`flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-red-600 bg-red-50/80 shadow-sm ring-2 ring-red-500/20 dark:border-red-500 dark:bg-red-950/50'
                        : 'border-slate-200/80 bg-slate-50/50 hover:border-red-300 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:border-red-800'
                    }`}
                  >
                    <div>
                      <p className={`text-sm font-bold ${isSelected ? 'text-red-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {fmt.label}
                      </p>
                      <span className="text-[10px] text-slate-400">{fmt.ext}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                        isSelected
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {fmt.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Privacy & Speed Badges */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600 dark:border-slate-800/60 dark:bg-slate-800/30 dark:text-slate-400">
              <Shield className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>256-bit SSL Transfer</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600 dark:border-slate-800/60 dark:bg-slate-800/30 dark:text-slate-400">
              <Clock className="h-4 w-4 text-indigo-500 shrink-0" />
              <span>Auto-Purge in 2 Hours</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-xs text-slate-600 dark:border-slate-800/60 dark:bg-slate-800/30 dark:text-slate-400">
              <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Formatting Preserved</span>
            </div>
          </div>

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
              className="w-full sm:w-auto min-w-[240px] py-4 text-base font-bold shadow-lg shadow-red-500/20 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600"
            >
              Convert to {targetFormat.toUpperCase()} Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
