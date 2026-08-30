'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ScanText,
  FileText,
  Code2,
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
  Maximize2
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn } from '@/lib/utils';

interface OcrScannerComponentProps {
  tool?: ToolMetadata;
  initialLanguage?: string;
}

interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'eng', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'urd', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰' },
  { code: 'ara', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'spa', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fra', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'deu', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'hin', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'rus', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'jpn', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
];

const SAMPLE_PRESETS = [
  {
    id: 'receipt',
    title: 'Store Receipt Sample',
    desc: 'Itemized invoice receipt with prices and total',
    lang: 'eng',
    sampleText: `LAPVY TECH MART - INVOICE #8492
Date: 2026-08-30  14:32:00
Cashier: Station 04
--------------------------------------------
Item                     Qty    Price   Total
--------------------------------------------
Logitech MX Master 3S     1    $99.99  $99.99
Keychron Q1 Pro Wireless  1   $199.00 $199.00
USB-C Braided Cable 2M    2    $12.50  $25.00
4K UltraHD Monitor Stand  1    $45.00  $45.00
--------------------------------------------
Subtotal:                             $368.99
Tax (8.25%):                           $30.44
TOTAL PAID:                           $399.43
--------------------------------------------
Payment Method: VISA CREDIT **** 8821
Auth Code: 492019
Thank you for shopping at Lapvy Tech!`,
  },
  {
    id: 'urdu-doc',
    title: 'Urdu Notice Sample',
    desc: 'Formal Urdu notification and statement',
    lang: 'urd',
    sampleText: `دفتر حکومت - اہم اعلان و آگاہی
تاریخ: 30 اگست 2026

تمام معزز شہریوں کو مطلع کیا جاتا ہے کہ ڈیجیٹل سروسز پورٹل پر ٹیکس ریٹرن اور شناختی تصدیق کی تمام خدمات اب بغیر کسی فیس کے 24 گھنٹے دستیاب ہیں۔

اہم ہدایات:
1. اپنے شناختی کارڈ اور رجسٹرڈ موبائل نمبر کا اندراج بروقت یقینی بنائیں۔
2. کسی بھی غیر متعلقہ شخص سے پاس ورڈ یا او ٹی پی کوڈ شیئر نہ کریں۔
3. کسی بھی شکایت کی صورت میں ہیلپ لائن 111-222 پر رابطہ کریں۔

حکم بنام: ناظم اعلیٰ برائے ڈیجیٹل امور`,
  },
  {
    id: 'business-memo',
    title: 'Executive Meeting Memo',
    desc: 'Corporate quarterly strategy overview',
    lang: 'eng',
    sampleText: `CONVERTHUB PRODUCT EXPANSION MEMORANDUM
To: Executive Steering Committee
From: Engineering & Product Architecture
Date: Q3 2026 Roadmap

Executive Summary:
The deployment of client-side WebAssembly tools has reduced server bandwidth by 94.2% while achieving sub-200ms processing times across all media and document operations.

Key Milestones:
- 100% Client-Side OCR with Tesseract.js WebAssembly
- Zero-Upload AI Background Removal via ONNX Web Runtime
- Monaco-Grade Dual Pane Diff Engine with .patch generation
- Native MediaRecorder 4K/60fps Screen and Audio Engine

Next Actions:
Accelerate regional localization for Pakistan and GCC emerging markets.`,
  },
];

export const OcrScannerComponent: React.FC<OcrScannerComponentProps> = ({
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
    setProgressPercent(5);
    setProgressStatus('Initializing WebAssembly Tesseract Worker...');
    setErrorMessage(null);

    try {
      // Dynamic import to support SSR and client-only WebAssembly execution
      const { createWorker } = await import('tesseract.js');

      setProgressPercent(20);
      setProgressStatus(`Loading ${selectedLanguage.toUpperCase()} trained model weights...`);

      const worker = await createWorker(selectedLanguage, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            const pct = Math.round(30 + (m.progress || 0) * 65);
            setProgressPercent(pct);
            setProgressStatus(`Extracting text from image... ${Math.round((m.progress || 0) * 100)}%`);
          } else if (m.status) {
            setProgressStatus(`${m.status.charAt(0).toUpperCase() + m.status.slice(1)}...`);
          }
        },
      });

      setProgressPercent(40);
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

      // Construct formatted Markdown
      const mdFormatted = rawText
        .split('\n')
        .map((line) => {
          const trimmed = line.trim();
          if (!trimmed) return '';
          if (trimmed.length < 35 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
            return `## ${trimmed}`;
          }
          if (/^[-*•]\s+/.test(trimmed)) {
            return `- ${trimmed.replace(/^[-*•]\s+/, '')}`;
          }
          if (/^\d+[\.\)]\s+/.test(trimmed)) {
            return trimmed;
          }
          return trimmed;
        })
        .join('\n');
      setMarkdownText(mdFormatted);

      // Construct detailed JSON
      const pageData = ret.data as any;
      const jsonStructure = {
        confidence: ret.data.confidence,
        language: selectedLanguage,
        page_count: 1,
        total_words: pageData.words?.length || 0,
        total_lines: pageData.lines?.length || 0,
        text: rawText,
        paragraphs: (pageData.paragraphs || []).map((p: any) => ({
          text: p.text?.trim() || '',
          confidence: p.confidence,
          bbox: p.bbox,
        })),
        words: (pageData.words || []).slice(0, 150).map((w: any) => ({
          text: w.text,
          confidence: w.confidence,
          bbox: w.bbox,
        })),
      };
      setJsonData(JSON.stringify(jsonStructure, null, 2));

      await worker.terminate();
      setProgressPercent(100);
      setProgressStatus('Recognition Complete!');
    } catch (err: any) {
      console.error('OCR Processing Error:', err);
      setErrorMessage(
        err?.message ||
          'Failed to process OCR. Ensure the uploaded file is a valid image or PDF.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const loadPreset = (preset: (typeof SAMPLE_PRESETS)[0]) => {
    setSelectedLanguage(preset.lang);
    setExtractedText(preset.sampleText);
    setConfidenceScore(98);
    setErrorMessage(null);

    const mdFormatted = preset.sampleText
      .split('\n')
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return '';
        if (trimmed.length < 35 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) {
          return `## ${trimmed}`;
        }
        return trimmed;
      })
      .join('\n');
    setMarkdownText(mdFormatted);

    setJsonData(
      JSON.stringify(
        {
          preset: preset.id,
          language: preset.lang,
          confidence: 98.4,
          sample: true,
          text: preset.sampleText,
        },
        null,
        2
      )
    );
  };

  const handleCopy = () => {
    const textToCopy =
      activeTab === 'text'
        ? extractedText
        : activeTab === 'markdown'
        ? markdownText
        : jsonData;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content =
      activeTab === 'text'
        ? extractedText
        : activeTab === 'markdown'
        ? markdownText
        : jsonData;
    if (!content) return;

    const ext = activeTab === 'text' ? 'txt' : activeTab === 'markdown' ? 'md' : 'json';
    const mime =
      activeTab === 'json' ? 'application/json' : 'text/plain;charset=utf-8';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-extracted-text.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReplace = (replaceAll: boolean = false) => {
    if (!searchQuery) return;
    const flags = caseSensitive ? (replaceAll ? 'g' : '') : replaceAll ? 'gi' : 'i';
    const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    const updated = extractedText.replace(regex, replaceQuery);
    setExtractedText(updated);
  };

  const wordCount = extractedText ? extractedText.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = extractedText ? extractedText.length : 0;
  const lineCount = extractedText ? extractedText.split('\n').length : 0;

  return (
    <div className="w-full space-y-6">
      {/* Header Controls & Language Selection */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            <ScanText className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              WebAssembly In-Browser OCR Engine
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              100% client-side recognition • Zero server upload • Tesseract WASM
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Languages className="h-4 w-4 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 shrink-0">
            OCR Language:
          </span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isProcessing}
            aria-label="OCR Language Selector"
            className="w-full sm:w-48 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name} ({lang.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Upload & Image Preview on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dropzone & Image Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Source Document / Image
              </span>
              {selectedFile && (
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  {selectedFile.name}
                </span>
              )}
            </div>

            <Dropzone
              accept="image/png,image/jpeg,image/webp,image/tiff,image/bmp,application/pdf"
              maxSizeMb={30}
              onFilesSelected={handleFiles}
              disabled={isProcessing}
              acceptedFormatsText="PNG, JPG, WebP, TIFF, BMP, PDF (Multi-Page)"
            />

            {previewUrl && (
              <div className="relative rounded-xl border border-slate-200/80 bg-slate-950/90 p-2 overflow-hidden max-h-64 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="OCR Preview"
                  className="max-h-56 w-auto object-contain rounded-lg shadow"
                />
                <div className="absolute top-3 right-3 rounded-lg bg-black/70 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                  Preview Active
                </div>
              </div>
            )}

            {/* Run Action Button */}
            <Button
              onClick={runOcr}
              disabled={isProcessing || (!selectedFile && !previewUrl)}
              className="w-full py-3 text-sm font-semibold shadow-md bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Recognizing Text ({progressPercent}%)...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>Run Client-Side OCR Now</span>
                </div>
              )}
            </Button>

            {/* Live Progress Bar */}
            {isProcessing && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <span>{progressStatus}</span>
                  <span>{progressPercent}%</span>
                </div>
                <ProgressBar progress={progressPercent} />
              </div>
            )}

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Quick Presets for Demo / Instant Test */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileCode className="h-4 w-4 text-blue-500" />
                Quick Sample Presets
              </span>
              <span className="text-[10px] text-slate-400">Click to load</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadPreset(preset)}
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-blue-400 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-500/50"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {preset.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {preset.desc}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: OCR Results & Formatting Toolbar */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col min-h-[520px]">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90 gap-2">
              {/* Output Format Tabs */}
              <div className="flex items-center gap-1 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-semibold transition',
                    activeTab === 'text'
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  )}
                >
                  Plain Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('markdown')}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-semibold transition',
                    activeTab === 'markdown'
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  )}
                >
                  Markdown
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('json')}
                  className={cn(
                    'rounded-lg px-3 py-1 text-xs font-semibold transition',
                    activeTab === 'json'
                      ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-900 dark:text-blue-400'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  )}
                >
                  JSON (Coordinates)
                </button>
              </div>

              {/* Action Buttons: Copy & Download */}
              <div className="flex items-center gap-2">
                {confidenceScore !== null && (
                  <span className="hidden sm:inline-flex items-center rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Confidence: {confidenceScore}%
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleCopy}
                  disabled={!extractedText}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!extractedText}
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .{activeTab === 'text' ? 'txt' : activeTab === 'markdown' ? 'md' : 'json'}</span>
                </button>
              </div>
            </div>

            {/* In-Editor Search & Replace Bar */}
            {activeTab === 'text' && extractedText && (
              <div className="border-b border-slate-200 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/50 flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[140px]">
                  <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search text..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <div className="relative flex-1 min-w-[140px]">
                  <Replace className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Replace with..."
                    value={replaceQuery}
                    onChange={(e) => setReplaceQuery(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-2 py-1 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleReplace(false)}
                  disabled={!searchQuery}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Replace Next
                </button>
                <button
                  type="button"
                  onClick={() => handleReplace(true)}
                  disabled={!searchQuery}
                  className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300"
                >
                  Replace All
                </button>
                {searchQuery && (
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {matchCount} match{matchCount === 1 ? '' : 'es'}
                  </span>
                )}
              </div>
            )}

            {/* Editor Area */}
            <div className="relative flex-1 p-4">
              {activeTab === 'text' && (
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  placeholder="Extracted text will appear here automatically after running OCR..."
                  className="h-full min-h-[380px] w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                  dir={selectedLanguage === 'urd' || selectedLanguage === 'ara' ? 'rtl' : 'ltr'}
                />
              )}

              {activeTab === 'markdown' && (
                <textarea
                  value={markdownText}
                  onChange={(e) => setMarkdownText(e.target.value)}
                  placeholder="Markdown structured output with auto-detected headings and lists..."
                  className="h-full min-h-[380px] w-full resize-none bg-transparent font-mono text-sm leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100"
                />
              )}

              {activeTab === 'json' && (
                <textarea
                  value={jsonData}
                  readOnly
                  placeholder="JSON bounding boxes and confidence metrics..."
                  className="h-full min-h-[380px] w-full resize-none bg-transparent font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 focus:outline-none"
                />
              )}

              {!extractedText && !isProcessing && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-600">
                  <ScanText className="h-12 w-12 stroke-[1.5] mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                    No OCR Result Yet
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Upload an image or document, select your language, and click &quot;Run Client-Side OCR Now&quot; to extract text.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Status & Metrics Bar */}
            <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>Lines: <strong>{lineCount}</strong></span>
                <span>Words: <strong>{wordCount}</strong></span>
                <span>Characters: <strong>{charCount}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
                <span>100% In-Memory Browser Execution</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Guarantee Badge */}
      <PrivacyAssuranceBadge />
    </div>
  );
};
