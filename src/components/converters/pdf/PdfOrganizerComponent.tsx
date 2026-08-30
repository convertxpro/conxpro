'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { PDFDocument, degrees, PageSizes } from 'pdf-lib';
import {
  LayoutGrid,
  RotateCw,
  RotateCcw,
  Copy,
  Trash2,
  Plus,
  Undo2,
  CheckSquare,
  Square,
  Download,
  FileText,
  Sparkles,
  RefreshCw,
  Eye,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Scissors,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  ArrowRight,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { formatBytes, cn } from '@/lib/utils';

export interface PageItem {
  id: string;
  originalIndex: number;
  rotation: number; // 0, 90, 180, 270
  thumbnail: string;
  isBlank?: boolean;
}

interface DeletedPageHistoryItem {
  page: PageItem;
  index: number;
}

export interface PdfOrganizerComponentProps {
  tool?: ToolMetadata;
}

export const PdfOrganizerComponent: React.FC<PdfOrganizerComponentProps> = ({ tool }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [originalPages, setOriginalPages] = useState<PageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletedHistory, setDeletedHistory] = useState<DeletedPageHistoryItem[]>([]);
  const [undoToast, setUndoToast] = useState<string | null>(null);

  // Status & Progress
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseStatus, setParseStatus] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // View Controls
  const [gridDensity, setGridDensity] = useState<'compact' | 'standard' | 'large'>('standard');
  const [previewPage, setPreviewPage] = useState<PageItem | null>(null);

  // Export Results
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [downloadStats, setDownloadStats] = useState<{
    originalSize: number;
    newSize: number;
    pageCount: number;
  } | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle File Ingestion and PDF.js thumbnail generation
  const handleFileAccepted = async (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file.');
      return;
    }

    setFile(selected);
    setErrorMessage(null);
    setDownloadUrl(null);
    setDownloadStats(null);
    setDeletedHistory([]);
    setSelectedIds(new Set());
    setIsParsing(true);
    setParseProgress(5);
    setParseStatus('Loading PDF engine...');

    try {
      const buffer = await selected.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      setPdfBytes(bytes);

      // Load pdfjs-dist dynamically
      const pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.2.108'}/build/pdf.worker.min.mjs`;
      }

      setParseStatus('Reading PDF document structure...');
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;

      if (totalPages === 0) {
        throw new Error('This PDF has 0 pages.');
      }

      const generatedPages: PageItem[] = [];

      for (let i = 1; i <= totalPages; i++) {
        setParseStatus(`Rendering page ${i} of ${totalPages}...`);
        setParseProgress(Math.round(10 + (i / totalPages) * 85));

        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.6 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await (page.render as any)({
            canvasContext: context,
            viewport,
            canvas,
          }).promise;

          const thumbnail = canvas.toDataURL('image/jpeg', 0.85);
          generatedPages.push({
            id: `page-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            originalIndex: i - 1,
            rotation: 0,
            thumbnail,
          });
        }
      }

      setPages(generatedPages);
      setOriginalPages(generatedPages);
      setParseProgress(100);
      setParseStatus('Document ready!');
    } catch (err: any) {
      console.error('PDF parsing error:', err);
      setErrorMessage(err?.message || 'Failed to load and render PDF pages. The file might be encrypted or corrupted.');
    } finally {
      setIsParsing(false);
    }
  };

  // Drag and drop reordering handler
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(pages);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setPages(items);
  };

  // Single page rotation
  const handleRotatePage = (id: string, direction: 'cw' | 'ccw') => {
    setPages((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const delta = direction === 'cw' ? 90 : 270;
        return { ...p, rotation: (p.rotation + delta) % 360 };
      })
    );
  };

  // Global rotate all pages
  const handleRotateAll = (direction: 'cw' | 'ccw') => {
    const delta = direction === 'cw' ? 90 : 270;
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + delta) % 360 }))
    );
  };

  // Duplicate page
  const handleDuplicatePage = (id: string) => {
    const index = pages.findIndex((p) => p.id === id);
    if (index === -1) return;
    const target = pages[index];
    const duplicate: PageItem = {
      ...target,
      id: `page-dup-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    };
    const nextPages = [...pages];
    nextPages.splice(index + 1, 0, duplicate);
    setPages(nextPages);
  };

  // Insert Blank Page
  const handleInsertBlankPage = (index?: number) => {
    // Generate a simple white placeholder thumbnail
    const canvas = document.createElement('canvas');
    canvas.width = 180;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 180, 250);
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, 172, 242);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('[ Blank Page ]', 90, 130);
    }
    const blankThumb = canvas.toDataURL('image/png');
    const newBlank: PageItem = {
      id: `blank-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      originalIndex: -1,
      rotation: 0,
      thumbnail: blankThumb,
      isBlank: true,
    };

    const targetIdx = index !== undefined ? index : pages.length;
    const nextPages = [...pages];
    nextPages.splice(targetIdx, 0, newBlank);
    setPages(nextPages);
  };

  // Delete page with undo history
  const handleDeletePage = (id: string) => {
    const index = pages.findIndex((p) => p.id === id);
    if (index === -1) return;
    const deletedItem = pages[index];

    setDeletedHistory((prev) => [{ page: deletedItem, index }, ...prev.slice(0, 9)]);
    setPages((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    setUndoToast(`Page ${index + 1} deleted`);
    setTimeout(() => {
      setUndoToast(null);
    }, 4500);
  };

  // Undo last delete
  const handleUndoDelete = () => {
    if (deletedHistory.length === 0) return;
    const [lastDeleted, ...remaining] = deletedHistory;
    setDeletedHistory(remaining);

    const nextPages = [...pages];
    const insertIdx = Math.min(lastDeleted.index, nextPages.length);
    nextPages.splice(insertIdx, 0, lastDeleted.page);
    setPages(nextPages);
    setUndoToast(null);
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === pages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pages.map((p) => p.id)));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    const remaining = pages.filter((p) => !selectedIds.has(p.id));
    setPages(remaining);
    setSelectedIds(new Set());
  };

  const handleResetOrder = () => {
    setPages(originalPages);
    setSelectedIds(new Set());
    setDeletedHistory([]);
  };

  // Save / Compile PDF using pdf-lib
  const handleCompilePdf = async (extractSelectedOnly = false) => {
    if (!pdfBytes) return;

    const targetPages = extractSelectedOnly
      ? pages.filter((p) => selectedIds.has(p.id))
      : pages;

    if (targetPages.length === 0) {
      setErrorMessage('No pages selected to compile.');
      return;
    }

    setIsCompiling(true);
    setCompileProgress(15);
    setErrorMessage(null);

    try {
      const sourceDoc = await PDFDocument.load(pdfBytes);
      const newDoc = await PDFDocument.create();

      const total = targetPages.length;
      for (let i = 0; i < total; i++) {
        const item = targetPages[i];
        setCompileProgress(Math.round(20 + (i / total) * 70));

        if (item.isBlank) {
          newDoc.addPage(PageSizes.A4);
        } else {
          const [copiedPage] = await newDoc.copyPages(sourceDoc, [item.originalIndex]);
          const currentRotation = copiedPage.getRotation().angle;
          const finalRotation = (currentRotation + item.rotation) % 360;
          copiedPage.setRotation(degrees(finalRotation));
          newDoc.addPage(copiedPage);
        }
      }

      setCompileProgress(95);
      const outputBytes = await newDoc.save();
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
      const outputFilename = extractSelectedOnly
        ? `${baseName}_extracted_${targetPages.length}pages.pdf`
        : `${baseName}_organized.pdf`;

      setDownloadUrl(url);
      setDownloadFilename(outputFilename);
      setDownloadStats({
        originalSize: file?.size || 0,
        newSize: outputBytes.byteLength,
        pageCount: targetPages.length,
      });
      setCompileProgress(100);
    } catch (err: any) {
      console.error('PDF compilation failed:', err);
      setErrorMessage(err?.message || 'Failed to compile organized PDF.');
    } finally {
      setIsCompiling(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfBytes(null);
    setPages([]);
    setOriginalPages([]);
    setSelectedIds(new Set());
    setDeletedHistory([]);
    setDownloadUrl(null);
    setErrorMessage(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="100% In-Browser PDF Visual Workstation"
        customDescription="Your PDF pages are parsed and compiled directly in your browser using WebAssembly. No documents are uploaded to any server."
      />

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-400 animate-in fade-in duration-200">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="flex-1">{errorMessage}</p>
          <Button size="sm" variant="ghost" onClick={() => setErrorMessage(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Undo Toast Notification */}
      {undoToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/95 px-5 py-3.5 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-5">
          <Trash2 className="h-4 w-4 text-rose-400" />
          <span>{undoToast}</span>
          <button
            onClick={handleUndoDelete}
            className="ml-2 flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-500 transition-colors"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </button>
        </div>
      )}

      {/* Stage 1: File Ingestion */}
      {!file && !isParsing && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <LayoutGrid className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Visual PDF Page Organizer
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
              Drag and drop pages, rotate individual or all pages, delete unwanted sheets, duplicate layouts, or extract custom page selections instantly.
            </p>
          </div>

          <Dropzone
            accept=".pdf"
            maxSizeMb={150}
            multiple={false}
            onFilesSelected={handleFileAccepted}
            acceptedFormatsText="Supports multi-page documents up to 150MB • 100% Client-Side"
          />
        </div>
      )}

      {/* Stage 2: Parsing Progress Screen */}
      {isParsing && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-12 text-center shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Rendering Page Thumbnails...
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {parseStatus}
          </p>
          <div className="mx-auto mt-6 max-w-md">
            <ProgressBar progress={parseProgress} />
          </div>
        </div>
      )}

      {/* Stage 3: Interactive Visual Workstation */}
      {file && !isParsing && pages.length > 0 && !downloadUrl && (
        <div className="space-y-5">
          {/* Workstation Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
            {/* File Info & Stats */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-xs" title={file.name}>
                  {file.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {pages.length} Pages Active
                  </span>
                  <span>•</span>
                  <span>{formatBytes(file.size)}</span>
                  {selectedIds.size > 0 && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {selectedIds.size} selected
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* View & Density Controls */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => setGridDensity('compact')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                    gridDensity === 'compact'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Compact
                </button>
                <button
                  onClick={() => setGridDensity('standard')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                    gridDensity === 'standard'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Standard
                </button>
                <button
                  onClick={() => setGridDensity('large')}
                  className={cn(
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all',
                    gridDensity === 'large'
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  Large
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetAll}
                className="text-xs text-slate-500 hover:text-red-500"
              >
                Change PDF
              </Button>
            </div>
          </div>

          {/* Quick Action Operations Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-slate-50/80 px-4 py-3 dark:border-slate-800/60 dark:bg-slate-900/50">
            {/* Selection & Batch Tools */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSelectAll}
                leftIcon={selectedIds.size === pages.length ? <CheckSquare className="h-3.5 w-3.5 text-indigo-600" /> : <Square className="h-3.5 w-3.5" />}
              >
                {selectedIds.size === pages.length ? 'Deselect All' : 'Select All'}
              </Button>

              {selectedIds.size > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDeleteSelected}
                    className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                    leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                  >
                    Delete Selected ({selectedIds.size})
                  </Button>

                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => handleCompilePdf(true)}
                    leftIcon={<Scissors className="h-3.5 w-3.5" />}
                  >
                    Extract Selected Only
                  </Button>
                </>
              )}

              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleInsertBlankPage()}
                leftIcon={<Plus className="h-3.5 w-3.5 text-emerald-600" />}
              >
                Insert Blank Page
              </Button>

              {deletedHistory.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleUndoDelete}
                  leftIcon={<Undo2 className="h-3.5 w-3.5" />}
                  className="text-indigo-600 dark:text-indigo-400"
                >
                  Undo Delete ({deletedHistory.length})
                </Button>
              )}
            </div>

            {/* Global Rotation & Reset */}
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleRotateAll('ccw')}
                title="Rotate All 90° Counter-Clockwise"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Rotate All Left
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleRotateAll('cw')}
                title="Rotate All 90° Clockwise"
                leftIcon={<RotateCw className="h-3.5 w-3.5" />}
              >
                Rotate All Right
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleResetOrder}
                title="Revert to original document structure"
                leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
              >
                Reset Order
              </Button>
            </div>
          </div>

          {/* Interactive Drag & Drop Thumbnail Grid */}
          {isMounted && (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="pdf-pages-grid" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'grid gap-4 p-2 transition-all',
                      gridDensity === 'compact' && 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8',
                      gridDensity === 'standard' && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
                      gridDensity === 'large' && 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    )}
                  >
                    {pages.map((page, index) => {
                      const isSelected = selectedIds.has(page.id);
                      return (
                        <Draggable key={page.id} draggableId={page.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              className={cn(
                                'group relative flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all dark:bg-slate-900',
                                isSelected
                                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 dark:border-indigo-400'
                                  : 'border-slate-200/90 hover:border-indigo-400/80 dark:border-slate-800 dark:hover:border-indigo-500/60',
                                dragSnapshot.isDragging && 'z-50 shadow-2xl scale-105 rotate-1 border-indigo-500'
                              )}
                            >
                              {/* Card Header Toolbar */}
                              <div
                                {...dragProvided.dragHandleProps}
                                className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 px-3 py-2 text-xs font-bold text-slate-700 cursor-grab active:cursor-grabbing dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                              >
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelect(page.id)}
                                    className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                    #{index + 1}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  {page.isBlank ? (
                                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                      Blank
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-slate-400" title="Original Page Number">
                                      (Orig #{page.originalIndex + 1})
                                    </span>
                                  )}
                                  {page.rotation !== 0 && (
                                    <span className="rounded bg-indigo-100 px-1 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                      {page.rotation}°
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Thumbnail Canvas / Image Area */}
                              <div className="relative flex flex-1 items-center justify-center bg-slate-100/60 p-3 dark:bg-slate-950/50 min-h-[160px]">
                                <div
                                  className="transition-transform duration-300 ease-out"
                                  style={{ transform: `rotate(${page.rotation}deg)` }}
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={page.thumbnail}
                                    alt={`Page ${index + 1}`}
                                    className="max-h-48 w-auto rounded shadow-sm object-contain"
                                  />
                                </div>

                                {/* Hover Action Toolbar */}
                                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-slate-900/60 opacity-0 backdrop-blur-[2px] transition-opacity group-hover:opacity-100 p-2">
                                  <button
                                    onClick={() => handleRotatePage(page.id, 'ccw')}
                                    title="Rotate 90° CCW"
                                    className="rounded-lg bg-white/90 p-1.5 text-slate-800 shadow hover:bg-white hover:text-indigo-600 transition-colors"
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRotatePage(page.id, 'cw')}
                                    title="Rotate 90° CW"
                                    className="rounded-lg bg-white/90 p-1.5 text-slate-800 shadow hover:bg-white hover:text-indigo-600 transition-colors"
                                  >
                                    <RotateCw className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDuplicatePage(page.id)}
                                    title="Duplicate Page"
                                    className="rounded-lg bg-white/90 p-1.5 text-slate-800 shadow hover:bg-white hover:text-emerald-600 transition-colors"
                                  >
                                    <Copy className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => setPreviewPage(page)}
                                    title="Preview Full Page"
                                    className="rounded-lg bg-white/90 p-1.5 text-slate-800 shadow hover:bg-white hover:text-blue-600 transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePage(page.id)}
                                    title="Delete Page"
                                    className="rounded-lg bg-rose-600 p-1.5 text-white shadow hover:bg-rose-500 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Card Bottom Mini Bar */}
                              <div className="flex items-center justify-between border-t border-slate-100 bg-white px-2.5 py-1.5 text-[11px] text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                                <button
                                  onClick={() => handleRotatePage(page.id, 'cw')}
                                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
                                >
                                  <RotateCw className="h-3 w-3" />
                                  <span>Rotate</span>
                                </button>
                                <button
                                  onClick={() => handleDeletePage(page.id)}
                                  className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Delete</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}

          {/* Compilation Bottom Action Dock */}
          <div className="sticky bottom-4 z-40 rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/95">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900 dark:text-white">
                  Ready to compile {pages.length} organized pages
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Instant compilation in your browser • No server transmission
                </p>
              </div>

              <div className="flex items-center gap-3">
                {selectedIds.size > 0 && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleCompilePdf(true)}
                    disabled={isCompiling}
                    leftIcon={<Scissors className="h-4 w-4" />}
                  >
                    Extract {selectedIds.size} Selected
                  </Button>
                )}

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => handleCompilePdf(false)}
                  disabled={isCompiling || pages.length === 0}
                  leftIcon={isCompiling ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                  className="shadow-lg shadow-indigo-500/20"
                >
                  {isCompiling ? 'Compiling PDF...' : 'Compile & Save PDF'}
                </Button>
              </div>
            </div>

            {isCompiling && (
              <div className="mt-3">
                <ProgressBar progress={compileProgress} />
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
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
              Your PDF is Reorganized & Ready!
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              All page orders, rotations, and custom additions compiled with 100% vector fidelity.
            </p>
          </div>

          {/* Metrics summary */}
          <div className="mx-auto my-6 grid max-w-lg grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center dark:border-slate-800 dark:bg-slate-950/60">
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Total Pages</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {downloadStats.pageCount}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Compiled Size</p>
              <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatBytes(downloadStats.newSize)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Source Size</p>
              <p className="mt-1 text-lg font-bold text-slate-700 dark:text-slate-300">
                {formatBytes(downloadStats.originalSize)}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href={downloadUrl}
              download={downloadFilename}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-indigo-500/25 hover:opacity-95 transition-opacity"
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
              Continue Editing
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={resetAll}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Organize Another PDF
            </Button>
          </div>
        </div>
      )}

      {/* Modal: Full Page Preview */}
      {previewPage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h4 className="font-bold text-white">
                Page Preview (Original #{previewPage.originalIndex + 1})
              </h4>
              <button
                onClick={() => setPreviewPage(null)}
                className="rounded-lg bg-slate-800 p-2 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 flex items-center justify-center overflow-auto max-h-[70vh] p-4 bg-slate-950/70 rounded-2xl">
              <div style={{ transform: `rotate(${previewPage.rotation}deg)` }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewPage.thumbnail}
                  alt="Full preview"
                  className="max-h-[60vh] w-auto rounded shadow-lg object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
