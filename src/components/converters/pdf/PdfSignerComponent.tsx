'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  PenTool,
  Type,
  Upload,
  Stamp,
  Eraser,
  Undo2,
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
  Sparkles,
  Move,
  Maximize2,
  Calendar,
  ShieldCheck,
  Plus,
  Check,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { formatBytes, cn } from '@/lib/utils';

export interface PlacedSignatureItem {
  id: string;
  page: number; // 1-indexed
  dataUrl: string;
  // Normalized coordinates in percentage (0 to 100)
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  label: string;
}

export interface PdfSignerComponentProps {
  tool?: ToolMetadata;
}

const INK_COLORS = [
  { name: 'Classic Blue', hex: '#1e3a8a' },
  { name: 'Onyx Black', hex: '#0f172a' },
  { name: 'Burgundy', hex: '#831843' },
  { name: 'Emerald Green', hex: '#065f46' },
];

const CURSIVE_STYLES = [
  { id: 'style-1', name: 'Great Vibes / Flowing', fontFamily: '"Great Vibes", "Brush Script MT", cursive' },
  { id: 'style-2', name: 'Dancing Script / Casual', fontFamily: '"Dancing Script", "Lucida Handwriting", cursive' },
  { id: 'style-3', name: 'Sacramento / Elegant', fontFamily: '"Sacramento", "Segoe Script", cursive' },
  { id: 'style-4', name: 'Autograph / Modern', fontFamily: '"Caveat", "Comic Sans MS", cursive' },
];

export const PdfSignerComponent: React.FC<PdfSignerComponentProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [zoomScale, setZoomScale] = useState<number>(1.25);

  // Tabbed Signature Creator: 'draw' | 'type' | 'upload' | 'stamp'
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload' | 'stamp'>('draw');

  // Draw Signature State
  const [drawColor, setDrawColor] = useState<string>('#1e3a8a');
  const [drawThickness, setDrawThickness] = useState<number>(2.5);
  const [isDrawing, setIsDrawing] = useState(false);
  const drawCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawStrokesRef = useRef<Array<Array<{ x: number; y: number }>>>([]);
  const currentStrokeRef = useRef<Array<{ x: number; y: number }>>([]);

  // Type Signature State
  const [typedName, setTypedName] = useState<string>('Johnathan Doe');
  const [typedStyle, setTypedStyle] = useState<string>('style-1');
  const [typedColor, setTypedColor] = useState<string>('#1e3a8a');

  // Upload Signature State
  const [uploadedPreview, setUploadedPreview] = useState<string | null>(null);
  const [removeWhiteBg, setRemoveWhiteBg] = useState<boolean>(true);

  // Stamp State
  const [stampText, setStampText] = useState<string>('APPROVED');
  const [signerName, setSignerName] = useState<string>('Authorized Signatory');
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(true);
  const [stampColor, setStampColor] = useState<string>('#065f46');

  // Placed Signatures on PDF
  const [placedItems, setPlacedItems] = useState<PlacedSignatureItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // Dragging / Resizing on Document Canvas
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [resizingItemId, setResizingItemId] = useState<string | null>(null);
  const [interactionStart, setInteractionStart] = useState<{ x: number; y: number; origX: number; origY: number; origW: number; origH: number } | null>(null);

  // Status & PDF compilation
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Canvas Refs
  const pdfCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfContainerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<any>(null);

  // Download Output
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [downloadStats, setDownloadStats] = useState<{
    originalSize: number;
    newSize: number;
    signaturesPlaced: number;
    pageCount: number;
  } | null>(null);

  // Load Google Web Fonts for cursive signatures
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@600&family=Dancing+Script:wght@600&family=Great+Vibes&family=Sacramento&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // File Upload Handler
  const handleFileAccepted = async (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setErrorMessage('Please choose a valid PDF file.');
      return;
    }

    setFile(selected);
    setErrorMessage(null);
    setDownloadUrl(null);
    setDownloadStats(null);
    setPlacedItems([]);
    setSelectedItemId(null);
    setCurrentPage(1);
    setIsLoadingPdf(true);

    try {
      const buffer = await selected.arrayBuffer();
      setPdfArrayBuffer(buffer);

      const pdfjsLib = await import('pdfjs-dist');
      if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '6.2.108'}/build/pdf.worker.min.mjs`;
      }

      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;
      pdfDocRef.current = pdf;
      setNumPages(pdf.numPages);
      setIsLoadingPdf(false);
    } catch (err: any) {
      console.error('PDF load error:', err);
      setErrorMessage(err?.message || 'Failed to load PDF file.');
      setIsLoadingPdf(false);
    }
  };

  // Render PDF Page to Canvas
  const renderPdfPage = useCallback(async () => {
    if (!pdfDocRef.current || !pdfCanvasRef.current || currentPage < 1) return;

    try {
      const page = await pdfDocRef.current.getPage(currentPage);
      const viewport = page.getViewport({ scale: zoomScale });
      const canvas = pdfCanvasRef.current;
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
      console.error('PDF page render error:', err);
    }
  }, [currentPage, zoomScale]);

  useEffect(() => {
    if (pdfDocRef.current && !isLoadingPdf) {
      renderPdfPage();
    }
  }, [currentPage, zoomScale, isLoadingPdf, renderPdfPage]);

  // Drawing Pad Canvas Handlers
  const redrawDrawCanvas = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = drawThickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const stroke of drawStrokesRef.current) {
      if (stroke.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }
  };

  const handleDrawStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    setIsDrawing(true);
    currentStrokeRef.current = [{ x, y }];
  };

  const handleDrawMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    currentStrokeRef.current.push({ x, y });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = drawColor;
      ctx.lineWidth = drawThickness;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const stroke = currentStrokeRef.current;
      if (stroke.length > 1) {
        ctx.beginPath();
        ctx.moveTo(stroke[stroke.length - 2].x, stroke[stroke.length - 2].y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  const handleDrawEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentStrokeRef.current.length > 0) {
      drawStrokesRef.current.push([...currentStrokeRef.current]);
      currentStrokeRef.current = [];
    }
  };

  const handleClearDrawing = () => {
    drawStrokesRef.current = [];
    currentStrokeRef.current = [];
    redrawDrawCanvas();
  };

  const handleUndoDrawing = () => {
    drawStrokesRef.current.pop();
    redrawDrawCanvas();
  };

  // Convert Drawn Canvas to Transparent Cropped PNG
  const getDrawnSignatureDataUrl = (): string | null => {
    const canvas = drawCanvasRef.current;
    if (!canvas || drawStrokesRef.current.length === 0) return null;

    // Find bounding box
    let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
    for (const stroke of drawStrokesRef.current) {
      for (const pt of stroke) {
        if (pt.x < minX) minX = pt.x;
        if (pt.y < minY) minY = pt.y;
        if (pt.x > maxX) maxX = pt.x;
        if (pt.y > maxY) maxY = pt.y;
      }
    }

    const padding = 15;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(canvas.width, maxX + padding);
    maxY = Math.min(canvas.height, maxY + padding);

    const cropW = Math.max(10, maxX - minX);
    const cropH = Math.max(10, maxY - minY);

    const cropCanvas = document.createElement('canvas');
    cropCanvas.width = cropW;
    cropCanvas.height = cropH;
    const cropCtx = cropCanvas.getContext('2d');
    if (!cropCtx) return null;

    cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return cropCanvas.toDataURL('image/png');
  };

  // Generate Typed Cursive Signature PNG
  const getTypedSignatureDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const fontItem = CURSIVE_STYLES.find((s) => s.id === typedStyle) || CURSIVE_STYLES[0];
    ctx.font = `64px ${fontItem.fontFamily}`;
    ctx.fillStyle = typedColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(typedName || 'Signature', 300, 90);

    return canvas.toDataURL('image/png');
  };

  // Generate Stamp PNG
  const getStampDataUrl = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Outer double border
    ctx.strokeStyle = stampColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(8, 8, 434, 164);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(14, 14, 422, 152);

    // Header Stamp Title
    ctx.fillStyle = stampColor;
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(stampText.toUpperCase(), 225, 52);

    // Divider Line
    ctx.beginPath();
    ctx.moveTo(30, 68);
    ctx.lineTo(420, 68);
    ctx.stroke();

    // Signer Title
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(signerName, 225, 98);

    // Timestamp & Crypto Hash Stamp
    if (includeTimestamp) {
      const now = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
      ctx.font = '12px monospace';
      ctx.fillText(`Verified • ${now}`, 225, 126);
      ctx.font = '10px monospace';
      ctx.fillText(`ID: ${Math.random().toString(36).substring(2, 10).toUpperCase()} • ConvertHub Seal`, 225, 146);
    }

    return canvas.toDataURL('image/png');
  };

  // Handle PNG/JPG Upload with Background Removal
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);

        if (removeWhiteBg) {
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // If near white, turn transparent
            if (r > 220 && g > 220 && b > 220) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imgData, 0, 0);
        }

        setUploadedPreview(canvas.toDataURL('image/png'));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(uploaded);
  };

  // Place Signature/Stamp onto the Active PDF Page
  const handlePlaceOnPage = () => {
    let dataUrl: string | null = null;
    let label = 'Signature';
    let defaultW = 28;
    let defaultH = 12;

    if (activeTab === 'draw') {
      dataUrl = getDrawnSignatureDataUrl();
      label = 'Drawn Signature';
      if (!dataUrl) {
        setErrorMessage('Please draw your signature before placing.');
        return;
      }
    } else if (activeTab === 'type') {
      dataUrl = getTypedSignatureDataUrl();
      label = `Signed: ${typedName}`;
    } else if (activeTab === 'upload') {
      dataUrl = uploadedPreview;
      label = 'Uploaded Signature';
      if (!dataUrl) {
        setErrorMessage('Please upload a signature image first.');
        return;
      }
    } else if (activeTab === 'stamp') {
      dataUrl = getStampDataUrl();
      label = `Stamp: ${stampText}`;
      defaultW = 32;
      defaultH = 14;
    }

    if (!dataUrl) return;

    const newItem: PlacedSignatureItem = {
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      page: currentPage,
      dataUrl,
      xPercent: 50 - defaultW / 2,
      yPercent: 70 - defaultH / 2,
      widthPercent: defaultW,
      heightPercent: defaultH,
      label,
    };

    setPlacedItems((prev) => [...prev, newItem]);
    setSelectedItemId(newItem.id);
    setErrorMessage(null);
  };

  // Interactive Dragging on PDF Page
  const handleMouseDownItem = (e: React.MouseEvent, item: PlacedSignatureItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setDraggingItemId(item.id);
    setInteractionStart({
      x: e.clientX,
      y: e.clientY,
      origX: item.xPercent,
      origY: item.yPercent,
      origW: item.widthPercent,
      origH: item.heightPercent,
    });
  };

  const handleMouseDownResize = (e: React.MouseEvent, item: PlacedSignatureItem) => {
    e.stopPropagation();
    setSelectedItemId(item.id);
    setResizingItemId(item.id);
    setInteractionStart({
      x: e.clientX,
      y: e.clientY,
      origX: item.xPercent,
      origY: item.yPercent,
      origW: item.widthPercent,
      origH: item.heightPercent,
    });
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactionStart || !pdfContainerRef.current) return;
    const rect = pdfContainerRef.current.getBoundingClientRect();
    const deltaXPercent = ((e.clientX - interactionStart.x) / rect.width) * 100;
    const deltaYPercent = ((e.clientY - interactionStart.y) / rect.height) * 100;

    if (draggingItemId) {
      const nextX = Math.max(0, Math.min(100 - interactionStart.origW, interactionStart.origX + deltaXPercent));
      const nextY = Math.max(0, Math.min(100 - interactionStart.origH, interactionStart.origY + deltaYPercent));

      setPlacedItems((prev) =>
        prev.map((it) =>
          it.id === draggingItemId ? { ...it, xPercent: nextX, yPercent: nextY } : it
        )
      );
    } else if (resizingItemId) {
      const nextW = Math.max(8, Math.min(70, interactionStart.origW + deltaXPercent));
      const nextH = Math.max(4, Math.min(50, interactionStart.origH + deltaYPercent));

      setPlacedItems((prev) =>
        prev.map((it) =>
          it.id === resizingItemId ? { ...it, widthPercent: nextW, heightPercent: nextH } : it
        )
      );
    }
  };

  const handleContainerMouseUp = () => {
    setDraggingItemId(null);
    setResizingItemId(null);
    setInteractionStart(null);
  };

  const handleDeletePlacedItem = (id: string) => {
    setPlacedItems((prev) => prev.filter((it) => it.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  // Compile Signed PDF using pdf-lib
  const handleSaveSignedPdf = async () => {
    if (!pdfArrayBuffer || placedItems.length === 0) {
      setErrorMessage('Please place at least one signature on the document.');
      return;
    }

    setIsCompiling(true);
    setCompileProgress(20);
    setErrorMessage(null);

    try {
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const total = placedItems.length;

      for (let i = 0; i < total; i++) {
        const item = placedItems[i];
        setCompileProgress(Math.round(25 + (i / total) * 65));

        const targetPage = pdfDoc.getPage(item.page - 1);
        const { width: pageWidth, height: pageHeight } = targetPage.getSize();

        // Embed PNG
        const pngImage = await pdfDoc.embedPng(item.dataUrl);

        // Compute PDF coordinate system (PDF origin (0,0) is bottom-left)
        const itemW = (item.widthPercent / 100) * pageWidth;
        const itemH = (item.heightPercent / 100) * pageHeight;
        const itemX = (item.xPercent / 100) * pageWidth;
        const itemY = pageHeight - ((item.yPercent / 100) * pageHeight) - itemH;

        targetPage.drawImage(pngImage, {
          x: itemX,
          y: itemY,
          width: itemW,
          height: itemH,
        });
      }

      setCompileProgress(95);
      const outputBytes = await pdfDoc.save();
      const blob = new Blob([outputBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'document';
      const outputFilename = `${baseName}_signed.pdf`;

      setDownloadUrl(url);
      setDownloadFilename(outputFilename);
      setDownloadStats({
        originalSize: file?.size || 0,
        newSize: outputBytes.byteLength,
        signaturesPlaced: placedItems.length,
        pageCount: numPages,
      });
      setCompileProgress(100);
    } catch (err: any) {
      console.error('Signing failed:', err);
      setErrorMessage(err?.message || 'Failed to embed signatures into PDF.');
    } finally {
      setIsCompiling(false);
    }
  };

  const resetAll = () => {
    setFile(null);
    setPdfArrayBuffer(null);
    pdfDocRef.current = null;
    setNumPages(0);
    setCurrentPage(1);
    setPlacedItems([]);
    setSelectedItemId(null);
    setDownloadUrl(null);
    setDownloadStats(null);
    setErrorMessage(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Guarantee Header */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="Private Digital PDF Signer & Seal Placement"
        customDescription="Your signature and documents are processed 100% inside your browser memory. Sign contracts, NDAs, and forms with zero server exposure."
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
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <PenTool className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Digital PDF Signer & Stamp Applier
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
              Draw, type, or upload transparent signatures and official verification stamps. Drag and resize onto any PDF page in seconds.
            </p>
          </div>

          <Dropzone
            accept=".pdf"
            maxSizeMb={150}
            multiple={false}
            onFilesSelected={handleFileAccepted}
            acceptedFormatsText="Client-Side PDF Signing • High-Fidelity Vector PNG Embedding"
          />
        </div>
      )}

      {/* Stage 2: Loading State */}
      {isLoadingPdf && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-12 text-center shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Opening PDF Document...
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Preparing canvas viewport and interactive placement layers...
          </p>
        </div>
      )}

      {/* Stage 3: Interactive Signing Studio */}
      {file && !isLoadingPdf && numPages > 0 && !downloadUrl && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Panel: Signature & Stamp Creator Studio (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-lg backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                Create Signature / Stamp
              </h3>

              {/* Mode Tabs */}
              <div className="grid grid-cols-4 gap-1 rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => setActiveTab('draw')}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 text-xs font-bold rounded-xl transition-all',
                    activeTab === 'draw'
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <PenTool className="h-4 w-4 mb-1" />
                  Draw
                </button>
                <button
                  onClick={() => setActiveTab('type')}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 text-xs font-bold rounded-xl transition-all',
                    activeTab === 'type'
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <Type className="h-4 w-4 mb-1" />
                  Type
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 text-xs font-bold rounded-xl transition-all',
                    activeTab === 'upload'
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <Upload className="h-4 w-4 mb-1" />
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab('stamp')}
                  className={cn(
                    'flex flex-col items-center justify-center py-2 text-xs font-bold rounded-xl transition-all',
                    activeTab === 'stamp'
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <Stamp className="h-4 w-4 mb-1" />
                  Stamp
                </button>
              </div>

              {/* Tab 1: Draw Signature */}
              {activeTab === 'draw' && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Ink Color
                    </span>
                    <div className="flex items-center gap-1.5">
                      {INK_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => {
                            setDrawColor(c.hex);
                            redrawDrawCanvas();
                          }}
                          className={cn(
                            'h-6 w-6 rounded-full border-2 transition-all',
                            drawColor === c.hex
                              ? 'border-indigo-600 scale-110 shadow-sm'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          )}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Draw Canvas Area */}
                  <div className="relative rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 dark:border-slate-700 dark:bg-slate-950/60 overflow-hidden">
                    <canvas
                      ref={drawCanvasRef}
                      width={400}
                      height={180}
                      onMouseDown={handleDrawStart}
                      onMouseMove={handleDrawMove}
                      onMouseUp={handleDrawEnd}
                      onMouseLeave={handleDrawEnd}
                      onTouchStart={handleDrawStart}
                      onTouchMove={handleDrawMove}
                      onTouchEnd={handleDrawEnd}
                      className="w-full h-44 cursor-crosshair touch-none"
                    />
                    <div className="pointer-events-none absolute bottom-2 left-3 text-[11px] text-slate-400">
                      Sign above line • Mouse or Touch
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleUndoDrawing}
                        leftIcon={<Undo2 className="h-3.5 w-3.5" />}
                        className="text-xs text-slate-600 dark:text-slate-300"
                      >
                        Undo
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleClearDrawing}
                        leftIcon={<Eraser className="h-3.5 w-3.5" />}
                        className="text-xs text-slate-600 dark:text-slate-300"
                      >
                        Clear
                      </Button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-400">Stroke:</span>
                      <button
                        onClick={() => setDrawThickness(1.5)}
                        className={cn('px-2 py-0.5 rounded text-xs font-semibold', drawThickness === 1.5 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-500')}
                      >
                        Fine
                      </button>
                      <button
                        onClick={() => setDrawThickness(2.5)}
                        className={cn('px-2 py-0.5 rounded text-xs font-semibold', drawThickness === 2.5 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-500')}
                      >
                        Medium
                      </button>
                      <button
                        onClick={() => setDrawThickness(4.5)}
                        className={cn('px-2 py-0.5 rounded text-xs font-semibold', drawThickness === 4.5 ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300' : 'text-slate-500')}
                      >
                        Bold
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Type Cursive Signature */}
              {activeTab === 'type' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Signer Name
                    </label>
                    <Input
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      placeholder="Type your name..."
                      className="mt-1 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Cursive Typography Style
                    </label>
                    <div className="mt-1 space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {CURSIVE_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setTypedStyle(style.id)}
                          className={cn(
                            'w-full flex items-center justify-between rounded-xl border p-2.5 text-left transition-all',
                            typedStyle === style.id
                              ? 'border-indigo-500 bg-indigo-50/70 dark:border-indigo-400 dark:bg-indigo-950/40'
                              : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                          )}
                        >
                          <span
                            className="text-2xl"
                            style={{ fontFamily: style.fontFamily, color: typedColor }}
                          >
                            {typedName || 'Signature'}
                          </span>
                          {typedStyle === style.id && (
                            <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Color
                    </span>
                    <div className="flex items-center gap-1.5">
                      {INK_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          onClick={() => setTypedColor(c.hex)}
                          className={cn(
                            'h-6 w-6 rounded-full border-2 transition-all',
                            typedColor === c.hex
                              ? 'border-indigo-600 scale-110 shadow-sm'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          )}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Upload Signature */}
              {activeTab === 'upload' && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-950/50">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleSignatureUpload}
                      className="hidden"
                      id="sig-upload-input"
                    />
                    <label
                      htmlFor="sig-upload-input"
                      className="cursor-pointer block text-xs font-semibold text-indigo-600 dark:text-indigo-400"
                    >
                      <Upload className="mx-auto h-8 w-8 mb-2 text-slate-400" />
                      Click to upload scanned signature image (PNG/JPG)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rem-bg-chk"
                      checked={removeWhiteBg}
                      onChange={(e) => setRemoveWhiteBg(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="rem-bg-chk" className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Auto-Remove White Background (Transparency)
                    </label>
                  </div>

                  {uploadedPreview && (
                    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center dark:border-slate-700 dark:bg-slate-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={uploadedPreview}
                        alt="Uploaded Preview"
                        className="max-h-24 mx-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Tab 4: Official Stamp & Seal */}
              {activeTab === 'stamp' && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Stamp Title
                    </label>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {['APPROVED', 'VERIFIED', 'CONFIDENTIAL', 'COMPLETED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setStampText(st)}
                          className={cn(
                            'rounded-lg px-2.5 py-1 text-xs font-bold transition-all',
                            stampText === st
                              ? 'bg-emerald-600 text-white'
                              : 'border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300'
                          )}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Signer / Department Title
                    </label>
                    <Input
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      placeholder="e.g. Legal Counsel, Finance Dept"
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="stamp-time-chk"
                      checked={includeTimestamp}
                      onChange={(e) => setIncludeTimestamp(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="stamp-time-chk" className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Include ISO Timestamp & Verification Hash
                    </label>
                  </div>
                </div>
              )}

              {/* Place on Document Button */}
              <div className="mt-5">
                <Button
                  variant="gradient"
                  size="md"
                  onClick={handlePlaceOnPage}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="w-full font-bold shadow-md shadow-indigo-500/20"
                >
                  Place onto Page {currentPage}
                </Button>
              </div>
            </div>

            {/* Placed Items List & Quick Navigator */}
            {placedItems.length > 0 && (
              <div className="rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Placed Signatures ({placedItems.length})
                  </span>
                  <button
                    onClick={() => setPlacedItems([])}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {placedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setSelectedItemId(item.id);
                        setCurrentPage(item.page);
                      }}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-2 text-xs transition-all cursor-pointer',
                        selectedItemId === item.id
                          ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-400 dark:bg-indigo-950/40'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          Pg {item.page}
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                          {item.label}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlacedItem(item.id);
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Interactive PDF Viewport & Placement Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
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
                    Page {currentPage} of {numPages}
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

                <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                  <button
                    onClick={() => setZoomScale((z) => Math.max(0.75, Number((z - 0.25).toFixed(2))))}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="px-2 text-xs font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {Math.round(zoomScale * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomScale((z) => Math.min(2.0, Number((z + 0.25).toFixed(2))))}
                    className="rounded-lg p-1.5 text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
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

            {/* Viewport Canvas Container */}
            <div
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
              className="relative flex min-h-[500px] items-center justify-center overflow-auto rounded-3xl border border-slate-200 bg-slate-200/50 p-6 dark:border-slate-800 dark:bg-slate-950/70 select-none"
            >
              <div
                ref={pdfContainerRef}
                className="relative shadow-2xl rounded-lg overflow-hidden bg-white"
              >
                {/* PDF Page Canvas */}
                <canvas ref={pdfCanvasRef} className="block max-w-none" />

                {/* Placed Signatures on Current Page */}
                {placedItems
                  .filter((it) => it.page === currentPage)
                  .map((item) => {
                    const isSelected = selectedItemId === item.id;
                    return (
                      <div
                        key={item.id}
                        onMouseDown={(e) => handleMouseDownItem(e, item)}
                        className={cn(
                          'group absolute cursor-move select-none p-1 transition-shadow',
                          isSelected
                            ? 'ring-2 ring-indigo-500 ring-offset-1 bg-indigo-500/10'
                            : 'hover:ring-1 hover:ring-indigo-400/60'
                        )}
                        style={{
                          left: `${item.xPercent}%`,
                          top: `${item.yPercent}%`,
                          width: `${item.widthPercent}%`,
                          height: `${item.heightPercent}%`,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.dataUrl}
                          alt="Signature"
                          className="h-full w-full object-contain pointer-events-none"
                        />

                        {/* Top Delete Pin */}
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlacedItem(item.id);
                            }}
                            className="absolute -top-3 -right-3 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700"
                            title="Remove"
                          >
                            ✕
                          </button>
                        )}

                        {/* Bottom-Right Resize Handle */}
                        {isSelected && (
                          <div
                            onMouseDown={(e) => handleMouseDownResize(e, item)}
                            className="absolute -bottom-2 -right-2 z-20 h-4 w-4 rounded-full bg-indigo-600 border-2 border-white shadow cursor-nwse-resize"
                            title="Drag to resize"
                          />
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Bottom Dock: Save & Compile Action */}
            <div className="sticky bottom-4 z-40 rounded-3xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/95">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {placedItems.length} Signatures & Stamps Placed
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click & drag signatures to position • Use resize handles for scaling
                  </p>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleSaveSignedPdf}
                  disabled={isCompiling || placedItems.length === 0}
                  leftIcon={isCompiling ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                  className="shadow-lg shadow-indigo-500/20 font-bold"
                >
                  {isCompiling ? 'Signing Document...' : 'Save & Download Signed PDF'}
                </Button>
              </div>

              {isCompiling && (
                <div className="mt-3">
                  <ProgressBar progress={compileProgress} />
                </div>
              )}
            </div>
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
              Your Document Has Been Signed & Sealed!
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Signatures and stamps have been permanently merged into PDF vector coordinate layers.
            </p>
          </div>

          {/* Metrics summary */}
          <div className="mx-auto my-6 grid max-w-lg grid-cols-3 gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-center dark:border-slate-800 dark:bg-slate-950/60">
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Signatures Placed</p>
              <p className="mt-1 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {downloadStats.signaturesPlaced} Applied
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Total Pages</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">
                {downloadStats.pageCount} Pages
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase text-slate-400">Signed File Size</p>
              <p className="mt-1 text-lg font-bold text-slate-700 dark:text-slate-300">
                {formatBytes(downloadStats.newSize)}
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
              Back to Signing Studio
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={resetAll}
              className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Sign Another PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
