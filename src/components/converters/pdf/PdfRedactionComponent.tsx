'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  Trash2,
  Download,
  FileText,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Layers,
  Square,
  Lock,
  Sparkles,
  Scissors,
  Check,
  Type,
  Plus,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Input } from '@/components/ui/Input';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { formatBytes, cn } from '@/lib/utils';

export type RedactionStyle = 'blackout' | 'whiteout' | 'stamped';

export interface RedactionBox {
  id: string;
  page: number; // 1-indexed
  // Coordinates in normalized percentage (0 to 100) relative to page dimensions
  x: number;
  y: number;
  width: number;
  height: number;
  style: RedactionStyle;
  label?: string;
}

export interface PdfRedactionComponentProps {
  tool?: ToolMetadata;
}

export const PdfRedactionComponent: React.FC<PdfRedactionComponentProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.25);

  // Redaction storage: pageNumber -> RedactionBox[]
  const [redactions, setRedactions] = useState<Record<number, RedactionBox[]>>({});
  const [activeStyle, setActiveStyle] = useState<RedactionStyle>('blackout');
  const [customStampText, setCustomStampText] = useState<string>('REDACTED');

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraftRect, setCurrentDraftRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  // Status & Progress
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [isFlattening, setIsFlattening] = useState(false);
  const [flattenProgress, setFlattenProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  // Download Output
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [downloadStats, setDownloadStats] = useState<{
    originalSize: number;
    newSize: number;
    totalRedactions: number;
    pageCount: number;
  } | null>(null);

  // Handle File Upload
  const handleFileAccepted = async (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please provide a valid PDF document.');
      return;
    }

    setFile(selected);
    setErrorMessage(null);
    setDownloadUrl(null);
    setDownloadStats(null);
    setRedactions({});
    setCurrentPage(1);
    setIsLoadingPdf(true);
    setLoadingStatus('Initializing PDF rasterizer engine...');

    try {
      const buffer = await selected.arrayBuffer();
      setPdfArrayBuffer(buffer);

      const pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.2.108'}/build/pdf.worker.min.mjs`;
      }

      setLoadingStatus('Loading PDF pages...');
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      setIsLoadingPdf(false);
    } catch (err: any) {
      console.error('PDF load error:', err);
      setErrorMessage(err?.message || 'Failed to load PDF. The file may be password-protected or corrupt.');
      setIsLoadingPdf(false);
    }
  };

  // Render Current Page to Canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDocRef.current || !canvasRef.current || currentPage < 1) return;

    try {
      const page = await pdfDocRef.current.getPage(currentPage);
      const viewport = page.getViewport({ scale: zoomScale });
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await (page.render as any)({
        canvasContext: context,
        viewport,
        canvas,
      }).promise;
    } catch (err) {
      console.error('Page render error:', err);
    }
  }, [currentPage, zoomScale]);

  useEffect(() => {
    if (pdfDocRef.current && !isLoadingPdf) {
      renderCurrentPage();
    }
  }, [currentPage, zoomScale, isLoadingPdf, renderCurrentPage]);

  // Drawing mouse handlers (Normalized coordinates 0 to 100%)
  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentDraftRect({ x, y, width: 0, height: 0 });
  };

  const handleOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart || !overlayRef.current) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const currentX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const currentY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const x = Math.min(drawStart.x, currentX);
    const y = Math.min(drawStart.y, currentY);
    const width = Math.abs(currentX - drawStart.x);
    const height = Math.abs(currentY - drawStart.y);

    setCurrentDraftRect({ x, y, width, height });
  };

  const handleOverlayMouseUp = () => {
    if (!isDrawing || !currentDraftRect) {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDraftRect(null);
      return;
    }

    // Ignore tiny accidental clicks (< 1% width/height)
    if (currentDraftRect.width > 1.2 && currentDraftRect.height > 1.2) {
      const newBox: RedactionBox = {
        id: `redact-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        page: currentPage,
        x: currentDraftRect.x,
        y: currentDraftRect.y,
        width: currentDraftRect.width,
        height: currentDraftRect.height,
        style: activeStyle,
        label: activeStyle === 'stamped' ? customStampText : undefined,
      };

      setRedactions((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newBox],
      }));
    }

    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraftRect(null);
  };

  // Delete a single redaction box
  const handleDeleteRedaction = (boxId: string) => {
    setRedactions((prev) => ({
      ...prev,
      [currentPage]: (prev[currentPage] || []).filter((b) => b.id !== boxId),
    }));
  };

  // Clear all redactions on current page
  const handleClearCurrentPage = () => {
    setRedactions((prev) => {
      const next = { ...prev };
      delete next[currentPage];
      return next;
    });
  };

  // Clear all in document
  const handleClearAll = () => {
    setRedactions({});
  };

  // Preset Redactions (Add quick template box in center)
  const handleAddPreset = (type: 'cnic' | 'signature' | 'contact' | 'bank') => {
    let w = 35;
    let h = 8;
    let lbl = 'REDACTED';

    if (type === 'cnic') {
      w = 32;
      h = 6;
      lbl = 'CNIC BLACKOUT';
    } else if (type === 'signature') {
      w = 28;
      h = 12;
      lbl = 'SIGNATURE';
    } else if (type === 'contact') {
      w = 40;
      h = 7;
      lbl = 'CONFIDENTIAL';
    } else if (type === 'bank') {
      w = 36;
      h = 8;
      lbl = 'ACCOUNT NUMBER';
    }

    const newBox: RedactionBox = {
      id: `redact-preset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      page: currentPage,
      x: 50 - w / 2,
      y: 50 - h / 2,
      width: w,
      height: h,
      style: activeStyle,
      label: activeStyle === 'stamped' ? (lbl || customStampText) : undefined,
    };

    setRedactions((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newBox],
    }));
  };

  // Total count of redactions across all pages
  const totalRedactionsCount = Object.values(redactions).reduce(
    (acc, boxes) => acc + (boxes?.length || 0),
    0
  );

  // Flatten and Compile PDF using canvas rasterization + pdf-lib
  const handleFlattenAndSavePdf = async () => {
    if (!pdfDocRef.current || !pdfArrayBuffer) return;

    setIsFlattening(true);
    setFlattenProgress(10);
    setErrorMessage(null);

    try {
      const newPdfDoc = await PDFDocument.create();
      const total = numPages;

      for (let p = 1; p <= total; p++) {
        setFlattenProgress(Math.round(15 + (p / total) * 75));

        const page = await pdfDocRef.current.getPage(p);
        // Use high-resolution scale 2.0 for razor-sharp text readability
        const viewport = page.getViewport({ scale: 2.0 });

        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = viewport.width;
        offscreenCanvas.height = viewport.height;
        const ctx = offscreenCanvas.getContext('2d');

        if (!ctx) continue;

        // 1. Render base PDF page to canvas
        await (page.render as any)({
          canvasContext: ctx,
          viewport,
          canvas: offscreenCanvas,
        }).promise;

        // 2. Permanently paint redaction boxes over canvas pixels
        const pageBoxes = redactions[p] || [];
        for (const box of pageBoxes) {
          const pxX = (box.x / 100) * offscreenCanvas.width;
          const pxY = (box.y / 100) * offscreenCanvas.height;
          const pxW = (box.width / 100) * offscreenCanvas.width;
          const pxH = (box.height / 100) * offscreenCanvas.height;

          if (box.style === 'blackout') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(pxX, pxY, pxW, pxH);
          } else if (box.style === 'whiteout') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(pxX, pxY, pxW, pxH);
          } else if (box.style === 'stamped') {
            // Black rectangle with crisp centered white text
            ctx.fillStyle = '#000000';
            ctx.fillRect(pxX, pxY, pxW, pxH);

            const fontSize = Math.max(12, Math.min(pxH * 0.55, pxW * 0.15));
            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(box.label || customStampText, pxX + pxW / 2, pxY + pxH / 2);
          }
        }

        // 3. Export flattened canvas as JPEG image (lossless quality 0.94)
        const imgDataUrl = offscreenCanvas.toDataURL('image/jpeg', 0.94);
        const embeddedImg = await newPdfDoc.embedJpg(imgDataUrl);

        // 4. Add new page matching original dimensions
        const newPage = newPdfDoc.addPage([
          embeddedImg.width / 2,
          embeddedImg.height / 2,
        ]);

        newPage.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: embeddedImg.width / 2,
          height: embeddedImg.height / 2,
        });
      }

      // 5. Scrubber: Strip all metadata to guarantee total privacy
      newPdfDoc.setTitle('');
      newPdfDoc.setAuthor('');
      newPdfDoc.setSubject('');
      newPdfDoc.setKeywords([]);
      newPdfDoc.setProducer('');
      newPdfDoc.setCreator('');

      setFlattenProgress(95);
      const outputBytes = await newPdfDoc.save();
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
      const outputFilename = `${baseName}_redacted_flattened.pdf`;

      setDownloadUrl(url);
      setDownloadFilename(outputFilename);
      setDownloadStats({
        originalSize: file?.size || 0,
        newSize: outputBytes.byteLength,
        totalRedactions: totalRedactionsCount,
        pageCount: numPages,
      });
      setFlattenProgress(100);
    } catch (err: any) {
      console.error('PDF Flattening failed:', err);
      setErrorMessage(err?.message || 'Failed to redact and flatten PDF document.');
    } finally {
      setIsFlattening(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfArrayBuffer(null);
    pdfDocRef.current = null;
    setNumPages(0);
    setCurrentPage(1);
    setRedactions({});
    setDownloadUrl(null);
    setDownloadStats(null);
    setErrorMessage(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="100% True Text Flattening & Metadata Scrubber"
        customDescription="Redacted areas are permanently baked into raster pixels and underlying text layers are completely destroyed. No data ever leaves your computer."
      />

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="flex-1">{errorMessage}</p>
          <Button size="sm" variant="ghost" onClick={() => setErrorMessage(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Stage 1: File Ingestion */}
      {!file && !isLoadingPdf && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              PDF Redaction & Privacy Blackout Tool
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
              Draw permanent blackout boxes over CNIC numbers, signatures, bank details, and personal data with total raster flattening and metadata purging.
            </p>
          </div>

          <Dropzone
            accept=".pdf"
            maxSizeMb={150}
            multiple={false}
            onFilesSelected={handleFileAccepted}
            acceptedFormatsText="100% In-Browser • Zero Searchable Under-layers After Export"
          />
        </div>
      )}

      {/* Stage 2: Loading State */}
      {isLoadingPdf && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-12 text-center shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-600/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Loading Document Canvas...
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {loadingStatus}
          </p>
        </div>
      )}

      {/* Stage 3: Interactive Redaction Canvas Studio */}
      {file && !isLoadingPdf && numPages > 0 && !downloadUrl && (
        <div className="space-y-4">
          {/* Top Master Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
            {/* File Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Page {currentPage} of {numPages}</span>
                  <span>•</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {totalRedactionsCount} Blackout Boxes
                  </span>
                </div>
              </div>
            </div>

            {/* Page Navigation & Zoom */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-white disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-bold text-slate-700 dark:text-slate-200">
                  {currentPage} / {numPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                  disabled={currentPage >= numPages}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-white disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Zoom */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => setZoomScale((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.25, Number((z + 0.25).toFixed(2))))}
                  className="rounded-lg p-1.5 text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetAll}
                className="text-xs text-slate-500 hover:text-rose-500"
              >
                Change PDF
              </Button>
            </div>
          </div>

          {/* Redaction Styling & Preset Toolbar */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800/70 dark:bg-slate-900/60">
            {/* Style Selector */}
            <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mask Style:
              </span>
              <div className="flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => setActiveStyle('blackout')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    activeStyle === 'blackout'
                      ? 'bg-slate-950 text-white shadow-sm dark:bg-black'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <div className="h-3 w-3 rounded-sm bg-black border border-white/30" />
                  Solid Blackout
                </button>
                <button
                  onClick={() => setActiveStyle('whiteout')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    activeStyle === 'whiteout'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <div className="h-3 w-3 rounded-sm bg-white border border-slate-400" />
                  Whiteout
                </button>
                <button
                  onClick={() => setActiveStyle('stamped')}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                    activeStyle === 'stamped'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <Type className="h-3.5 w-3.5" />
                  Stamped Label
                </button>
              </div>

              {activeStyle === 'stamped' && (
                <div className="flex items-center gap-2 mt-1 sm:mt-0">
                  <Input
                    value={customStampText}
                    onChange={(e) => setCustomStampText(e.target.value.toUpperCase())}
                    placeholder="STAMP TEXT"
                    className="h-8 max-w-[140px] text-xs font-bold uppercase tracking-wider"
                  />
                </div>
              )}
            </div>

            {/* Quick Preset Buttons */}
            <div className="lg:col-span-5 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1">
                Quick Presets:
              </span>
              <button
                onClick={() => handleAddPreset('cnic')}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-500 transition-colors"
              >
                + CNIC
              </button>
              <button
                onClick={() => handleAddPreset('signature')}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-500 transition-colors"
              >
                + Signature
              </button>
              <button
                onClick={() => handleAddPreset('contact')}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-500 transition-colors"
              >
                + Phone/Email
              </button>
              <button
                onClick={() => handleAddPreset('bank')}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-rose-500 transition-colors"
              >
                + Bank/IBAN
              </button>
            </div>

            {/* Clear Controls */}
            <div className="lg:col-span-2 flex items-center justify-end gap-2">
              {(redactions[currentPage]?.length || 0) > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearCurrentPage}
                  className="text-xs text-slate-500 hover:text-rose-600"
                >
                  Clear Page ({redactions[currentPage]?.length})
                </Button>
              )}
            </div>
          </div>

          {/* Main Visual Workstation Canvas */}
          <div className="relative flex min-h-[500px] items-center justify-center overflow-auto rounded-3xl border border-slate-200 bg-slate-200/50 p-6 dark:border-slate-800 dark:bg-slate-950/70">
            <div className="relative shadow-2xl rounded-lg overflow-hidden bg-white select-none">
              {/* Underlying Rendered PDF Canvas */}
              <canvas ref={canvasRef} className="block max-w-none" />

              {/* Interactive Drawing & Redaction Overlay */}
              <div
                ref={overlayRef}
                onMouseDown={handleOverlayMouseDown}
                onMouseMove={handleOverlayMouseMove}
                onMouseUp={handleOverlayMouseUp}
                className="absolute inset-0 cursor-crosshair"
                style={{ touchAction: 'none' }}
              >
                {/* Render Existing Redactions for this page */}
                {(redactions[currentPage] || []).map((box) => (
                  <div
                    key={box.id}
                    className={cn(
                      'group absolute border transition-all pointer-events-auto',
                      box.style === 'blackout' && 'bg-black border-black shadow-md',
                      box.style === 'whiteout' && 'bg-white border-dashed border-slate-300 shadow-sm',
                      box.style === 'stamped' && 'bg-black border-black flex items-center justify-center'
                    )}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                    }}
                  >
                    {box.style === 'stamped' && (
                      <span className="font-sans font-black text-white uppercase tracking-wider text-center pointer-events-none select-none text-[11px] sm:text-xs truncate px-1">
                        [{box.label || customStampText}]
                      </span>
                    )}

                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRedaction(box.id);
                      }}
                      className="absolute -top-3 -right-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg opacity-0 transition-opacity group-hover:opacity-100 hover:bg-rose-700"
                      title="Remove Redaction"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {/* Active Draft Rectangle while dragging */}
                {isDrawing && currentDraftRect && (
                  <div
                    className={cn(
                      'absolute border-2 border-rose-500 pointer-events-none',
                      activeStyle === 'blackout' && 'bg-black/80',
                      activeStyle === 'whiteout' && 'bg-white/80',
                      activeStyle === 'stamped' && 'bg-black/80 flex items-center justify-center text-white text-xs font-bold'
                    )}
                    style={{
                      left: `${currentDraftRect.x}%`,
                      top: `${currentDraftRect.y}%`,
                      width: `${currentDraftRect.width}%`,
                      height: `${currentDraftRect.height}%`,
                    }}
                  >
                    {activeStyle === 'stamped' && (
                      <span>[{customStampText}]</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Dock: Redaction Stats & Export Button */}
          <div className="sticky bottom-4 z-40 rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl shadow-rose-500/10 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/95">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <p className="font-bold text-slate-900 dark:text-white">
                    {totalRedactionsCount} Areas Redacted across {Object.keys(redactions).length} of {numPages} Pages
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click and drag anywhere on the document to redact • Text layer is irreversibly removed
                </p>
              </div>

              <div className="flex items-center gap-3">
                {totalRedactionsCount > 0 && (
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleClearAll}
                    className="text-slate-500 hover:text-rose-600"
                  >
                    Clear All
                  </Button>
                )}

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleFlattenAndSavePdf}
                  disabled={isFlattening}
                  leftIcon={isFlattening ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Lock className="h-5 w-5" />}
                  className="bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 shadow-lg shadow-rose-500/25 text-white font-bold"
                >
                  {isFlattening ? 'Flattening Document...' : 'Flatten & Save Redacted PDF'}
                </Button>
              </div>
            </div>

            {isFlattening && (
              <div className="mt-3">
                <ProgressBar progress={flattenProgress} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stage 4: Download Ready Screen */}
      {downloadUrl && downloadStats && (
        <div className="rounded-3xl border border-emerald-500/30 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-emerald-500/20 dark:bg-slate-900/80 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
              Document Permanently Redacted & Flattened!
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              All blackout areas have been rasterized directly into image layers. Underlying text, metadata, and OCR layers are completely unrecoverable.
            </p>
          </div>

          {/* Metrics summary */}
          <div className="mx-auto my-6 grid max-w-lg grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center dark:border-slate-800 dark:bg-slate-950/60">
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Redactions</p>
              <p className="mt-1 text-lg font-bold text-rose-600 dark:text-rose-400">
                {downloadStats.totalRedactions} Protected
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Pages</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {downloadStats.pageCount} Flattened
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Output Size</p>
              <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatBytes(downloadStats.newSize)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={downloadUrl}
              download={downloadFilename}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 via-red-600 to-pink-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-rose-500/25 hover:opacity-95 transition-opacity"
            >
              <Download className="h-5 w-5" />
              Download {downloadFilename}
            </a>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setDownloadUrl(null);
                setDownloadStats(null);
              }}
            >
              Back to Editor
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={resetAll}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Redact Another PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
