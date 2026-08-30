'use client';

import React, { useState, useEffect } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProcessingScreen } from '@/components/conversion/ProcessingScreen';
import { DownloadScreen } from '@/components/conversion/DownloadScreen';
import { formatBytes } from '@/lib/utils';
import {
  FileText,
  Layers,
  Scissors,
  RotateCw,
  Minimize2,
  Lock,
  Unlock,
  Images,
  ArrowRight,
  AlertCircle,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export interface PdfToolsCanvasProps {
  initialAction?: 'merge' | 'split' | 'rotate' | 'compress' | 'protect' | 'unlock' | 'images-to-pdf' | 'pdf-to-images';
  initialToolSlug?: string;
}

export const PdfToolsCanvas: React.FC<PdfToolsCanvasProps> = ({
  initialAction = 'merge',
  initialToolSlug,
}) => {
  const [action, setAction] = useState<string>(initialAction);
  const [stage, setStage] = useState<'upload' | 'processing' | 'download'>('upload');
  const [files, setFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Split settings
  const [splitRange, setSplitRange] = useState<string>('1-3');
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');

  // Rotate settings
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);

  // Compress settings
  const [compressionTier, setCompressionTier] = useState<'extreme' | 'recommended' | 'less'>('recommended');

  // Protect / Unlock settings
  const [pdfPassword, setPdfPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Images to PDF settings
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Fit'>('A4');
  const [pageOrientation, setPageOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');

  // PDF to Images settings
  const [imageFormat, setImageFormat] = useState<'jpg' | 'png'>('jpg');
  const [imageDpi, setImageDpi] = useState<number>(150);

  // Conversion result
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

  // Detect tool from initialToolSlug
  useEffect(() => {
    if (initialToolSlug) {
      if (initialToolSlug === 'merge-pdf') setAction('merge');
      else if (initialToolSlug === 'split-pdf') setAction('split');
      else if (initialToolSlug === 'rotate-pdf') setAction('rotate');
      else if (initialToolSlug === 'compress-pdf') setAction('compress');
      else if (initialToolSlug === 'protect-pdf') setAction('protect');
      else if (initialToolSlug === 'unlock-pdf') setAction('unlock');
      else if (initialToolSlug === 'jpg-to-pdf' || initialToolSlug === 'images-to-pdf') setAction('images-to-pdf');
      else if (initialToolSlug === 'pdf-to-jpg' || initialToolSlug === 'pdf-to-images' || initialToolSlug === 'pdf-to-png') {
        setAction('pdf-to-images');
        if (initialToolSlug === 'pdf-to-png') setImageFormat('png');
      }
    }
  }, [initialToolSlug]);

  const handleAddFiles = (newFiles: File[]) => {
    if (action === 'merge' || action === 'images-to-pdf') {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
    setErrorMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    setFiles((prev) => {
      const copy = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const handleConvert = async () => {
    if (files.length === 0) {
      setErrorMessage('Please upload at least one file to continue.');
      return;
    }

    setErrorMessage(null);
    setStage('processing');

    try {
      const formData = new FormData();
      formData.append('action', action);

      files.forEach((file) => {
        formData.append('files', file);
      });

      if (action === 'split') {
        formData.append('range', splitMode === 'all' ? 'all' : splitRange);
        formData.append('bundleAsZip', splitMode === 'all' ? 'true' : 'false');
      } else if (action === 'rotate') {
        formData.append('angle', rotationAngle.toString());
      } else if (action === 'compress') {
        formData.append('tier', compressionTier);
      } else if (action === 'protect' || action === 'unlock') {
        formData.append('password', pdfPassword);
      } else if (action === 'images-to-pdf') {
        formData.append('pageSize', pageSize);
        formData.append('orientation', pageOrientation);
      } else if (action === 'pdf-to-images') {
        formData.append('format', imageFormat);
        formData.append('dpi', imageDpi.toString());
      }

      const response = await fetch('/api/convert/pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'PDF operation failed. Please try again.');
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
      console.error('PDF Action error:', err);
      setErrorMessage(err.message || 'An error occurred during PDF processing.');
      setStage('upload');
    }
  };

  const handleReset = () => {
    setFiles([]);
    setConversionResult(null);
    setErrorMessage(null);
    setPdfPassword('');
    setStage('upload');
  };

  if (stage === 'processing') {
    return (
      <ProcessingScreen
        filename={files[0]?.name || 'PDF Document'}
        sourceFormat="PDF"
        targetFormat={action === 'pdf-to-images' ? imageFormat.toUpperCase() : 'PDF'}
      />
    );
  }

  if (stage === 'download' && conversionResult) {
    const slug = initialToolSlug || (
      action === 'merge' ? 'merge-pdf' :
      action === 'compress' ? 'compress-pdf' :
      action === 'split' ? 'split-pdf' :
      action === 'protect' ? 'protect-pdf' :
      action === 'images-to-pdf' ? 'jpg-to-pdf' : 'organize-pdf'
    );

    return (
      <DownloadScreen
        downloadUrl={conversionResult.downloadUrl}
        originalFilename={conversionResult.originalFilename}
        targetFilename={conversionResult.targetFilename}
        originalSizeBytes={conversionResult.originalSizeBytes}
        convertedSizeBytes={conversionResult.convertedSizeBytes}
        targetFormat={conversionResult.targetFormat}
        currentSlug={slug}
        categorySlug="document"
        onReset={handleReset}
      />
    );
  }

  const isMultiFileUpload = action === 'merge' || action === 'images-to-pdf';
  const totalUploadedBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="w-full space-y-6">
      {/* 1. Upload Dropzone */}
      {files.length === 0 ? (
        <Dropzone
          accept={action === 'images-to-pdf' ? 'image/*,.jpg,.jpeg,.png,.webp,.heic' : '.pdf,application/pdf'}
          multiple={isMultiFileUpload}
          maxSizeMb={30}
          onFilesSelected={handleAddFiles}
          acceptedFormatsText={
            action === 'images-to-pdf'
              ? 'Select multiple JPG, PNG, WebP or HEIC images to combine into PDF'
              : action === 'merge'
              ? 'Select multiple PDF documents to merge in order'
              : 'Select your PDF document (up to 30MB)'
          }
        />
      ) : (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
          {/* Header Card / File List */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 dark:border-slate-800/60">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400">
                {action === 'merge' && <Layers className="h-6 w-6" />}
                {action === 'split' && <Scissors className="h-6 w-6" />}
                {action === 'rotate' && <RotateCw className="h-6 w-6" />}
                {action === 'compress' && <Minimize2 className="h-6 w-6" />}
                {action === 'protect' && <Lock className="h-6 w-6" />}
                {action === 'unlock' && <Unlock className="h-6 w-6" />}
                {action === 'images-to-pdf' && <Images className="h-6 w-6" />}
                {action === 'pdf-to-images' && <Images className="h-6 w-6" />}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">
                  {files.length === 1 ? files[0].name : `${files.length} Files Selected`}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Total Size: <strong>{formatBytes(totalUploadedBytes)}</strong> • Isolated 256-bit SSL Session
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isMultiFileUpload && (
                <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add More Files</span>
                  <input
                    type="file"
                    multiple
                    accept={action === 'images-to-pdf' ? 'image/*' : '.pdf'}
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

          {/* Multi-file reorder list for Merge & Images to PDF */}
          {isMultiFileUpload && files.length > 0 && (
            <div className="mt-5 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Page Sequence (Drag or use arrows to reorder)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-sm dark:border-slate-800 dark:bg-slate-800/40"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700 dark:bg-red-950 dark:text-red-300">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="truncate font-medium text-slate-800 dark:text-slate-200">
                          {file.name}
                        </p>
                        <span className="text-[11px] text-slate-400">{formatBytes(file.size)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveFile(idx, 'up')}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-700"
                        title="Move Up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === files.length - 1}
                        onClick={() => handleMoveFile(idx, 'down')}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 disabled:opacity-30 dark:hover:bg-slate-700"
                        title="Move Down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Tool Specific Parameter Controls */}
          <div className="mt-6 space-y-6">
            {/* Split Options */}
            {action === 'split' && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Split Method
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSplitMode('range')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      splitMode === 'range'
                        ? 'border-red-600 bg-red-50/80 ring-2 ring-red-500/20 dark:border-red-500 dark:bg-red-950/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <p className="font-bold text-slate-900 dark:text-white">Extract Page Range</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Extract specific pages or intervals into a single PDF.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSplitMode('all')}
                    className={`rounded-2xl border p-4 text-left transition ${
                      splitMode === 'all'
                        ? 'border-red-600 bg-red-50/80 ring-2 ring-red-500/20 dark:border-red-500 dark:bg-red-950/50'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                    }`}
                  >
                    <p className="font-bold text-slate-900 dark:text-white">Split All Pages to ZIP</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Extract every single page into individual numbered PDFs bundled in a ZIP.
                    </p>
                  </button>
                </div>

                {splitMode === 'range' && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Page Ranges (e.g. 1, 3-5, 8)
                    </label>
                    <Input
                      value={splitRange}
                      onChange={(e) => setSplitRange(e.target.value)}
                      placeholder="e.g. 1, 3-5, 8"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Rotate Options */}
            {action === 'rotate' && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center gap-2">
                  <RotateCw className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Rotation Orientation
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { angle: 90, label: '90° Clockwise', desc: 'Right Turn' },
                    { angle: 180, label: '180° Invert', desc: 'Upside Down' },
                    { angle: 270, label: '270° Counter-CW', desc: 'Left Turn' },
                  ].map((item) => (
                    <button
                      key={item.angle}
                      type="button"
                      onClick={() => setRotationAngle(item.angle as any)}
                      className={`rounded-2xl border p-4 text-center transition ${
                        rotationAngle === item.angle
                          ? 'border-red-600 bg-red-50/80 ring-2 ring-red-500/20 dark:border-red-500 dark:bg-red-950/50'
                          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <RotateCw className="h-5 w-5 mx-auto text-red-500 mb-1" />
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{item.label}</p>
                      <span className="text-[10px] text-slate-400">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Compress Options */}
            {action === 'compress' && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Minimize2 className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Compression Level
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'extreme', title: 'Extreme Compression', reduction: 'Up to 80% Reduction', badge: 'Smallest Size' },
                    { id: 'recommended', title: 'Recommended', reduction: '50–65% Reduction', badge: 'Balanced Quality' },
                    { id: 'less', title: 'Less Compression', reduction: '20–30% Reduction', badge: 'High Definition' },
                  ].map((tier) => {
                    const isSelected = compressionTier === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => setCompressionTier(tier.id as any)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? 'border-red-600 bg-red-50/80 ring-2 ring-red-500/20 dark:border-red-500 dark:bg-red-950/50'
                            : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{tier.title}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isSelected ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                            {tier.badge}
                          </span>
                        </div>
                        <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{tier.reduction}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Protect / Unlock Options */}
            {(action === 'protect' || action === 'unlock') && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center gap-2">
                  {action === 'protect' ? <Lock className="h-4 w-4 text-red-500" /> : <Unlock className="h-4 w-4 text-emerald-500" />}
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {action === 'protect' ? 'Set Document Password' : 'Enter Decryption Password'}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    placeholder={action === 'protect' ? 'Choose a strong password...' : 'Enter existing password...'}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {action === 'protect' && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>256-bit AES encryption standard applied. Password is never logged or stored.</span>
                  </p>
                )}
              </div>
            )}

            {/* Images to PDF Settings */}
            {action === 'images-to-pdf' && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Images className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Page Layout & Document Size
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Page Standard
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="A4">A4 (210 × 297 mm) — Standard</option>
                      <option value="Letter">US Letter (8.5 × 11 in)</option>
                      <option value="Fit">Fit to Image (Original Aspect)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Orientation
                    </label>
                    <select
                      value={pageOrientation}
                      onChange={(e) => setPageOrientation(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value="auto">Automatic (Matches Photo Aspect)</option>
                      <option value="portrait">Portrait</option>
                      <option value="landscape">Landscape</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PDF to Images Settings */}
            {action === 'pdf-to-images' && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5 dark:border-slate-800/60 dark:bg-slate-800/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Images className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Output Image Format & Quality
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Target Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setImageFormat('jpg')}
                        className={`rounded-xl border p-2.5 text-center font-bold text-sm transition ${
                          imageFormat === 'jpg'
                            ? 'border-red-600 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-white'
                            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        JPG (Lightweight)
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageFormat('png')}
                        className={`rounded-xl border p-2.5 text-center font-bold text-sm transition ${
                          imageFormat === 'png'
                            ? 'border-red-600 bg-red-50 text-red-900 dark:bg-red-950/60 dark:text-white'
                            : 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                        }`}
                      >
                        PNG (Lossless)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Render Resolution (DPI)
                    </label>
                    <select
                      value={imageDpi}
                      onChange={(e) => setImageDpi(parseInt(e.target.value, 10))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-red-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                    >
                      <option value={72}>72 DPI (Web Speed / Compact)</option>
                      <option value={150}>150 DPI (Balanced / Recommended)</option>
                      <option value={300}>300 DPI (High Definition Print)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Convert Action Button */}
          <div className="mt-8 flex justify-center">
            <Button
              size="lg"
              variant="gradient"
              onClick={handleConvert}
              rightIcon={<ArrowRight className="h-4 w-4" />}
              className="w-full sm:w-auto min-w-[240px] py-4 text-base font-bold shadow-lg shadow-red-500/20 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600"
            >
              {action === 'merge' && `Merge ${files.length} PDFs Now`}
              {action === 'split' && 'Split PDF Pages Now'}
              {action === 'rotate' && `Rotate PDF by ${rotationAngle}°`}
              {action === 'compress' && 'Compress PDF Now'}
              {action === 'protect' && 'Encrypt & Protect PDF'}
              {action === 'unlock' && 'Unlock PDF Document'}
              {action === 'images-to-pdf' && `Compile ${files.length} Images to PDF`}
              {action === 'pdf-to-images' && `Extract Pages as ${imageFormat.toUpperCase()}`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
