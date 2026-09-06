/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ScanText,
  FileText,
  Copy,
  Download,
  Search,
  Replace,
  Sparkles,
  RefreshCw,
  Check,
  AlertCircle,
  FileCode,
  Languages,
  Sliders,
  Image as ImageIcon,
  Layers,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn } from '@/lib/utils';

interface ImageOcrComponentProps {
  tool?: ToolMetadata;
  initialLanguage?: string;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction?: 'ltr' | 'rtl';
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'eng', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr' },
  { code: 'urd', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', direction: 'rtl' },
  { code: 'ara', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'spa', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'fra', name: 'French', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'deu', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳', direction: 'ltr' },
  { code: 'hin', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
  { code: 'rus', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', direction: 'ltr' },
  { code: 'jpn', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', direction: 'ltr' },
  { code: 'por', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', direction: 'ltr' },
  { code: 'ita', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', direction: 'ltr' },
];

const SAMPLE_PRESETS = [
  {
    id: 'receipt',
    title: 'Store Receipt',
    desc: 'Itemized purchase invoice with prices and totals',
    lang: 'eng',
    sampleText: `TECH STORE OFFICIAL INVOICE #89421
Date: 2026-09-01  14:32:00
Cashier: Counter 02
--------------------------------------------
Item                     Qty    Price    Total
--------------------------------------------
UltraHD 4K Monitor        1   $349.99  $349.99
Wireless Mechanical Keys  1   $129.50  $129.50
Ergonomic Mouse           1    $69.00   $69.00
USB-C Thunderbolt 4 Cable 2    $18.00   $36.00
--------------------------------------------
Subtotal:                              $584.49
Tax (8.25%):                            $48.22
TOTAL AMOUNT:                          $632.71
--------------------------------------------
Payment Method: VISA CREDIT (**** 4419)
Auth Code: 991204
Thank you for shopping with us!`,
  },
  {
    id: 'urdu-doc',
    title: 'Urdu Government Notice',
    desc: 'Official Urdu statement and announcement',
    lang: 'urd',
    sampleText: `حکومت پاکستان - اہم پریس ریلیز اور عوامی آگاہی
تاریخ: یکم ستمبر 2026

تمام معزز شہریوں کو مطلع کیا جاتا ہے کہ ڈیجیٹل سروسز پورٹل پر ٹیکس ریٹرن، لینڈ ریکارڈ اور تصدیقی خدمات اب بغیر کسی فیس کے 24 گھنٹے دستیاب ہیں۔

اہم ہدایات:
1. اپنے شناختی کارڈ اور رجسٹرڈ موبائل نمبر کا اندراج بروقت یقینی بنائیں۔
2. کسی بھی غیر متعلقہ شخص سے پاس ورڈ یا او ٹی پی کوڈ شیئر نہ کریں۔
3. کسی بھی شکایت یا رہنمائی کی صورت میں ہیلپ لائن 111-222 پر رابطہ کریں۔

حکم بنام: ناظم اعلیٰ برائے ڈیجیٹل و پبلک سروسز`,
  },
  {
    id: 'arabic-invoice',
    title: 'Arabic Tax Invoice',
    desc: 'Bilingual VAT tax invoice format',
    lang: 'ara',
    sampleText: `فاتورة ضريبية مبسطة - SIMPLIFIED TAX INVOICE
رقم الفاتورة: INV-2026-00912
التاريخ: 2026-09-01

اسم العميل: شركة التقنية الحديثة
الرقم الضريبي: 300123456700003
--------------------------------------------
الوصف               الكمية     السعر     المجموع
--------------------------------------------
خدمات استضافة سحابية    1      500.00    500.00
دعم فني واستشارات      1      250.00    250.00
--------------------------------------------
المجموع الفرعي:                         750.00 ر.س
ضريبة القيمة المضافة (15%):             112.50 ر.س
الإجمالي المستحق:                       862.50 ر.س
--------------------------------------------
شكراً لتعاملكم معنا!`,
  },
  {
    id: 'business-memo',
    title: 'Executive Roadmap Memo',
    desc: 'Corporate quarterly strategy & client-side metrics',
    lang: 'eng',
    sampleText: `APEXTOOLS ARCHITECTURE MEMORANDUM
To: Executive Technical Committee
From: Head of Client Engineering
Date: Q3 2026

Executive Summary:
The full rollout of browser-native WebAssembly neural models and Tesseract OCR engines has reduced remote server bandwidth costs by 95.8% while guaranteeing zero data retention.

Core Performance Indicators:
- Client-Side WASM OCR: <1.8s average recognition latency
- Zero-Server Upload Privacy: 100% confidential data integrity
- Memory Footprint: Peak 85MB sandbox usage
- Multi-Language Lexicon: English, Urdu, Arabic, Spanish, German, French

Next Phase: Expand offline progressive web app (PWA) cache bundles.`,
  },
];

export const ImageOcrComponent: React.FC<ImageOcrComponentProps> = ({
  tool,
  initialLanguage = 'eng',
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [extractedText, setExtractedText] = useState<string>('');
  const [markdownText, setMarkdownText] = useState<string>('');
  const [jsonData, setJsonData] = useState<string>('');
  const [confidenceScore, setConfidenceScore] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'markdown' | 'json'>('text');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Search & Replace state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [matchCount, setMatchCount] = useState<number>(0);

  // Calculate search match count
  useEffect(() => {
    if (!searchQuery || !extractedText) {
      setMatchCount(0);
      return;
    }
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = extractedText.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } catch {
      setMatchCount(0);
    }
  }, [searchQuery, extractedText, caseSensitive]);

  const handleFiles = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setSelectedFile(file);
    setErrorMessage(null);
    setExtractedText('');
    setMarkdownText('');
    setJsonData('');
    setConfidenceScore(null);

    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const runOcr = async () => {
    if (!selectedFile && !previewUrl) {
      setErrorMessage('Please select or drop an image or PDF file to run OCR.');
      return;
    }

    setIsProcessing(true);
    setProgressPercent(10);
    setProgressStatus('Initializing WebAssembly Tesseract Worker...');
    setErrorMessage(null);

    try {
      // Dynamic import to support SSR and browser WebAssembly execution
      const { createWorker } = await import('tesseract.js');

      setProgressPercent(25);
      setProgressStatus(`Loading ${selectedLanguage.toUpperCase()} trained model weights...`);

      const worker = await createWorker(selectedLanguage, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round(30 + (m.progress || 0) * 65);
            setProgressPercent(pct);
            setProgressStatus(`Recognizing text characters... ${Math.round((m.progress || 0) * 100)}%`);
          } else if (m.status) {
            setProgressStatus(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
          }
        },
      });

      setProgressPercent(45);
      setProgressStatus('Processing image raster and recognizing characters...');

      let targetSource: any = selectedFile;

      // Handle PDF rendering if PDF file
      if (selectedFile && selectedFile.type === 'application/pdf') {
        setProgressStatus('Rendering PDF page to raster canvas...');
        try {
          const pdfjsLib = await import('pdfjs-dist');
          const arrayBuffer = await selectedFile.arrayBuffer();
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          if (context) {
            await (page.render as any)({ canvasContext: context, viewport, canvas }).promise;
            targetSource = canvas;
          }
        } catch (pdfErr) {
          console.warn('PDF.js rendering fallback, attempting direct pass:', pdfErr);
        }
      }

      const ret = await worker.recognize(targetSource);

      const rawText = ret.data.text || '';
      const confidence = ret.data.confidence || 0;
      setConfidenceScore(Math.round(confidence));

      // Construct plain text
      setExtractedText(rawText);

      // Construct Markdown
      const lines = rawText.split('\n');
      const mdLines = lines.map((line, idx) => {
        const trimmed = line.trim();
        if (idx === 0 && trimmed.length > 0) return `# ${trimmed}`;
        if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed)) return trimmed;
        if (trimmed.includes(':') && trimmed.length < 60) return `**${trimmed}**`;
        return trimmed;
      });
      setMarkdownText(mdLines.join('\n'));

      // Construct JSON structured payload
      const jsonPayload = {
        metadata: {
          language: selectedLanguage,
          confidence: Math.round(confidence),
          linesCount: lines.length,
          timestamp: new Date().toISOString(),
          engine: 'Tesseract.js WASM On-Device',
        },
        extractedText: rawText,
        lines: lines.map((l, i) => ({ lineNumber: i + 1, text: l })),
      };
      setJsonData(JSON.stringify(jsonPayload, null, 2));

      setProgressPercent(100);
      setProgressStatus('OCR Extraction Complete!');

      await worker.terminate();
    } catch (err: any) {
      console.error('OCR Extraction Error:', err);
      setErrorMessage(
        err?.message || 'Failed to process OCR on the selected file. Please try another image.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_PRESETS[0]) => {
    setSelectedLanguage(sample.lang);
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedText(sample.sampleText);
    setConfidenceScore(98);

    const lines = sample.sampleText.split('\n');
    const mdLines = lines.map((line, idx) => {
      const trimmed = line.trim();
      if (idx === 0 && trimmed.length > 0) return `# ${trimmed}`;
      if (trimmed.startsWith('-') || trimmed.startsWith('•') || /^\d+\./.test(trimmed)) return trimmed;
      if (trimmed.includes(':') && trimmed.length < 60) return `**${trimmed}**`;
      return trimmed;
    });
    setMarkdownText(mdLines.join('\n'));

    const jsonPayload = {
      metadata: {
        language: sample.lang,
        confidence: 98,
        linesCount: lines.length,
        timestamp: new Date().toISOString(),
        engine: 'Sample Preset Simulation',
      },
      extractedText: sample.sampleText,
      lines: lines.map((l, i) => ({ lineNumber: i + 1, text: l })),
    };
    setJsonData(JSON.stringify(jsonPayload, null, 2));
    setErrorMessage(null);
  };

  const handleCopy = () => {
    let content = extractedText;
    if (activeTab === 'markdown') content = markdownText;
    if (activeTab === 'json') content = jsonData;

    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'txt' | 'md' | 'json') => {
    let content = extractedText;
    let mimeType = 'text/plain';
    let extension = 'txt';

    if (format === 'md') {
      content = markdownText;
      mimeType = 'text/markdown';
      extension = 'md';
    } else if (format === 'json') {
      content = jsonData;
      mimeType = 'application/json';
      extension = 'json';
    }

    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ocr-extracted-${Date.now()}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleReplace = (replaceAll: boolean = false) => {
    if (!searchQuery) return;
    try {
      const flags = caseSensitive ? (replaceAll ? 'g' : '') : (replaceAll ? 'gi' : 'i');
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const updated = extractedText.replace(regex, replaceQuery);
      setExtractedText(updated);
    } catch (e) {
      console.error(e);
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];
  const isRtl = currentLangObj.direction === 'rtl';

  return (
    <div className="w-full space-y-8">
      {/* Header & Feature Badges */}
      <div className="rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/50 p-6 sm:p-8 dark:border-purple-950/60 dark:bg-gradient-to-br dark:from-purple-950/20 dark:via-slate-900/60 dark:to-indigo-950/20 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700 dark:bg-purple-900/60 dark:text-purple-300">
                <Sparkles className="h-3.5 w-3.5" />
                100% On-Device WebAssembly AI
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                Zero Server Uploads
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tool?.name || 'Image & Scanned PDF to Text (OCR)'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Extract editable text, receipts, contracts, and Urdu/Arabic documents instantly with high-accuracy character recognition inside your browser.
            </p>
          </div>

          <PrivacyAssuranceBadge />
        </div>

        {/* Language Selection Bar */}
        <div className="mt-6 pt-6 border-t border-purple-100/80 dark:border-purple-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Languages className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              Document Language
            </label>
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-purple-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name} ({lang.nativeName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-1 lg:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Zap className="h-4 w-4 text-amber-500" />
              Quick Test Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PRESETS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-purple-300 hover:bg-purple-50/50 hover:text-purple-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:bg-purple-950/40 dark:hover:text-purple-300"
                >
                  <span>{sample.lang === 'urd' ? '🇵🇰' : sample.lang === 'ara' ? '🇸🇦' : '📄'}</span>
                  <span>{sample.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="space-y-4">
        <Dropzone
          onFilesSelected={handleFiles}
          acceptedFormatsText="Drop receipts, scanned documents, contracts, PNG, JPG, WebP, or PDF files"
          className="min-h-[160px]"
        />

        {selectedFile && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-900/60 dark:bg-purple-950/30">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white font-bold text-xs shadow-sm">
                {selectedFile.name.split('.').pop()?.toUpperCase() || 'IMG'}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready for client-side OCR
                </p>
              </div>
            </div>

            <Button
              variant="gradient"
              size="md"
              onClick={runOcr}
              disabled={isProcessing}
              leftIcon={
                isProcessing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <ScanText className="h-4 w-4" />
                )
              }
            >
              {isProcessing ? 'Processing OCR...' : 'Start OCR Text Recognition'}
            </Button>
          </div>
        )}
      </div>

      {/* Processing Progress Bar */}
      {isProcessing && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-6 dark:border-purple-900/60 dark:bg-purple-950/30 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin text-purple-600 dark:text-purple-400" />
              {progressStatus}
            </span>
            <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
              {progressPercent}%
            </span>
          </div>
          <ProgressBar progress={progressPercent} />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Running WebAssembly neural worker thread without leaving your browser.
          </p>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* Main Dual-Pane Results Area */}
      {extractedText && (
        <div className="space-y-6">
          {/* Top Bar with Confidence and Export Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  OCR Extraction Success
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {confidenceScore !== null && (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {confidenceScore}% Accuracy Score
                    </span>
                  )}
                  <span>•</span>
                  <span>{extractedText.split(/\s+/).filter(Boolean).length} Words</span>
                  <span>•</span>
                  <span>{extractedText.length} Characters</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Text'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload('txt')}
                leftIcon={<Download className="h-3.5 w-3.5" />}
              >
                .TXT
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload('md')}
                leftIcon={<FileText className="h-3.5 w-3.5" />}
              >
                .MD (Markdown)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload('json')}
                leftIcon={<FileCode className="h-3.5 w-3.5" />}
              >
                JSON
              </Button>
            </div>
          </div>

          {/* Dual Pane Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Image Source Preview */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4" />
                  Source Document Preview
                </span>
                {previewUrl && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setZoomLevel((prev) => Math.max(50, prev - 25))}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-mono text-slate-500 px-1">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel((prev) => Math.min(200, prev + 25))}
                      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="relative min-h-[360px] max-h-[540px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60 flex items-center justify-center">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="OCR Preview"
                    style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top left' }}
                    className="max-w-full rounded-lg shadow-sm transition-transform duration-150"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Interactive Sample Mode
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Using synthesized test document vector for OCR demo.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Editable Recognized Text / Markdown / JSON Editor */}
            <div className="lg:col-span-7 space-y-4">
              {/* Tab Navigation */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-800">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('text')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-lg transition',
                      activeTab === 'text'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    Editable Text
                  </button>
                  <button
                    onClick={() => setActiveTab('markdown')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-lg transition',
                      activeTab === 'markdown'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    Markdown (.MD)
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold rounded-lg transition',
                      activeTab === 'json'
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    )}
                  >
                    JSON Payload
                  </button>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {isRtl ? 'RTL Mode (Urdu/Arabic)' : 'LTR Mode'}
                </span>
              </div>

              {/* Find and Replace Bar */}
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 p-2 text-xs dark:border-slate-800 dark:bg-slate-900/50">
                <div className="flex items-center gap-1.5 flex-1 min-w-[120px]">
                  <Search className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Find text..."
                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                  />
                  {matchCount > 0 && (
                    <span className="rounded bg-purple-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      {matchCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-1 min-w-[120px] border-l border-slate-200 pl-2 dark:border-slate-800">
                  <Replace className="h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    placeholder="Replace with..."
                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleReplace(false)}
                    disabled={!searchQuery}
                    className="rounded-lg bg-white px-2 py-1 font-semibold text-slate-700 shadow-sm transition hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Replace
                  </button>
                  <button
                    onClick={() => handleReplace(true)}
                    disabled={!searchQuery}
                    className="rounded-lg bg-white px-2 py-1 font-semibold text-slate-700 shadow-sm transition hover:bg-purple-50 hover:text-purple-700 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                  >
                    All
                  </button>
                </div>
              </div>

              {/* Active Tab View */}
              {activeTab === 'text' && (
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  dir={isRtl ? 'rtl' : 'ltr'}
                  rows={16}
                  className={cn(
                    'w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-900 shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100',
                    isRtl ? 'font-serif text-base' : ''
                  )}
                  placeholder="Recognized OCR text will appear here..."
                />
              )}

              {activeTab === 'markdown' && (
                <textarea
                  value={markdownText}
                  onChange={(e) => setMarkdownText(e.target.value)}
                  rows={16}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-sm leading-relaxed text-slate-900 shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />
              )}

              {activeTab === 'json' && (
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={16}
                  className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs leading-relaxed text-slate-900 shadow-inner focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-indigo-300"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
