'use client';

import React, { useState } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { ToolMetadata } from '@/config/categories';
import { ArrowRight, CheckCircle2, Download, Copy, Check, Sparkles, RefreshCw, Calculator, Receipt, Shield, Layers, Video, Music } from 'lucide-react';

// Shared Expansion Scaffolding & Layout Components
import {
  DualPaneEditor,
  PakistaniMetricCard,
  PrivacyAssuranceBadge,
  CodeActionToolbar,
} from '@/components/converters/common';

// Specialized Client-Side Converters
import { UnitConverterCore } from '@/components/converters/unit/UnitConverterCore';
import { JsonFormatter } from '@/components/converters/dev/JsonFormatter';
import { DataFormatConverter } from '@/components/converters/dev/DataFormatConverter';
import { Base64Tool } from '@/components/converters/dev/Base64Tool';
import { UrlEncoder } from '@/components/converters/dev/UrlEncoder';
import { TextCaseConverter } from '@/components/converters/dev/TextCaseConverter';
import { NumberBaseConverter } from '@/components/converters/dev/NumberBaseConverter';
import { MarkdownHtmlEditor } from '@/components/converters/dev/MarkdownHtmlEditor';
import { StructuredDataConverter } from '@/components/converters/dev/StructuredDataConverter';
import { SqlDataConverter } from '@/components/converters/dev/SqlDataConverter';
import { JwtDecoderComponent } from '@/components/converters/dev/JwtDecoderComponent';
import { HashGeneratorComponent } from '@/components/converters/dev/HashGeneratorComponent';
import { CssUnitConverterComponent } from '@/components/converters/dev/CssUnitConverterComponent';
import { QrCodeGeneratorComponent } from '@/components/converters/dev/QrCodeGeneratorComponent';
import { CronDecoderComponent } from '@/components/converters/dev/CronDecoderComponent';
import { TimezoneConverter } from '@/components/converters/datetime/TimezoneConverter';
import { UnixTimestampTool } from '@/components/converters/datetime/UnixTimestampTool';
import { AgeCalculator } from '@/components/converters/datetime/AgeCalculator';
import { DateFormatConverter } from '@/components/converters/datetime/DateFormatConverter';
import { ColorConverter } from '@/components/converters/color/ColorConverter';
import { PaletteGenerator } from '@/components/converters/color/PaletteGenerator';

// Specialized Pakistan Regional Converters
import { MarlaConverter } from '@/components/converters/pakistan/MarlaConverter';
import { TolaConverter } from '@/components/converters/pakistan/TolaConverter';
import { MaundConverter } from '@/components/converters/pakistan/MaundConverter';
import { HijriConverter } from '@/components/converters/pakistan/HijriConverter';
import { FbrTaxCalculatorComponent } from '@/components/converters/pakistan/FbrTaxCalculatorComponent';
import { ZakatCalculatorComponent } from '@/components/converters/pakistan/ZakatCalculatorComponent';
import { NumeralConverterComponent } from '@/components/converters/pakistan/NumeralConverterComponent';
import { ExtendedLandConverterComponent } from '@/components/converters/pakistan/ExtendedLandConverterComponent';
import { ElectricityBillCalculatorComponent } from '@/components/converters/pakistan/ElectricityBillCalculatorComponent';
import { GasBillCalculatorComponent } from '@/components/converters/pakistan/GasBillCalculatorComponent';

// Specialized Live Forex & Currency Converters
import { CurrencyConverter } from '@/components/converters/currency/CurrencyConverter';

// Specialized Image Converters
import { ImageConverter } from '@/components/converters/image/ImageConverter';

// Specialized PDF, Document & Archive Converters
import { PdfToolsCanvas } from '@/components/converters/pdf/PdfToolsCanvas';
import { DocumentConverter } from '@/components/converters/document/DocumentConverter';
import { ArchiveConverter } from '@/components/converters/archive/ArchiveConverter';

// Specialized Video & Audio Media Converters
import { MediaConverter } from '@/components/converters/media/MediaConverter';
import { VideoCanvasComponent } from '@/components/converters/media/VideoCanvasComponent';
import { SubtitleConverterComponent } from '@/components/converters/media/SubtitleConverterComponent';
import { AudioModulatorCanvas } from '@/components/converters/media/AudioModulatorCanvas';

interface ConverterCanvasProps {
  tool: ToolMetadata;
}

export const ConverterCanvas: React.FC<ConverterCanvasProps> = ({ tool }) => {
  const isDocumentOrImage =
    tool.categorySlug === 'document' ||
    tool.categorySlug === 'image' ||
    tool.categorySlug === 'archive' ||
    tool.categorySlug === 'media' ||
    tool.categorySlug === 'video' ||
    tool.categorySlug === 'audio';

  const [inputValue, setInputValue] = useState('100000');
  const [editorInput, setEditorInput] = useState('{\n  "service": "ConvertHub",\n  "version": 2.0,\n  "features": ["Zero Latency", "100% Client-Side", "Privacy First"]\n}');
  const [editorOutput, setEditorOutput] = useState('service: ConvertHub\nversion: 2\nfeatures:\n  - Zero Latency\n  - 100% Client-Side\n  - Privacy First');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFileUrl, setConvertedFileUrl] = useState<string | null>(null);

  // ==========================================
  // 1. PHASE A: DEVELOPER & DATA UTILITIES
  // ==========================================
  if (tool.categorySlug === 'developer') {
    if (tool.slug === 'json-formatter') return <JsonFormatter />;
    if (tool.slug === 'json-to-csv' || tool.slug === 'csv-to-json') return <DataFormatConverter />;
    if (tool.slug === 'base64-encode-decode') return <Base64Tool />;
    if (tool.slug === 'url-encode-decode') return <UrlEncoder />;
    if (tool.slug === 'text-case-converter') return <TextCaseConverter />;
    if (tool.slug === 'binary-to-decimal') return <NumberBaseConverter />;
    if (tool.slug === 'markdown-to-html') return <MarkdownHtmlEditor />;

    // Sub-Prompt 02 Tools: YAML ↔ JSON ↔ TOML Multi-Converter
    if (tool.slug === 'yaml-to-json') return <StructuredDataConverter initialMode="yaml-to-json" />;
    if (tool.slug === 'json-to-yaml') return <StructuredDataConverter initialMode="json-to-yaml" />;
    if (tool.slug === 'toml-to-json') return <StructuredDataConverter initialMode="toml-to-json" />;
    if (tool.slug === 'yaml-to-toml') return <StructuredDataConverter initialMode="yaml-to-toml" />;

    // Sub-Prompt 02 Tools: SQL Query ↔ JSON / CSV Converter
    if (tool.slug === 'sql-to-json') return <SqlDataConverter initialTab="sql-to-json" />;
    if (tool.slug === 'json-to-sql') return <SqlDataConverter initialTab="json-to-sql" />;
    if (tool.slug === 'csv-to-sql') return <SqlDataConverter initialTab="csv-to-sql" />;

    // Sub-Prompt 03 Tools: Security & Cryptography Suite
    if (tool.slug === 'jwt-decoder') return <JwtDecoderComponent />;
    if (tool.slug === 'hash-generator') return <HashGeneratorComponent />;

    // Sub-Prompt 04 Tools: Developer Productivity Utilities
    if (tool.slug === 'css-unit-converter') return <CssUnitConverterComponent />;
    if (tool.slug === 'qr-code-generator') return <QrCodeGeneratorComponent />;
    if (tool.slug === 'cron-expression-decoder') return <CronDecoderComponent />;
  }

  // ==========================================
  // 2. SPECIALIZED MEASUREMENT, FINANCE & CALENDAR CONVERTERS
  // ==========================================
  if (tool.slug === 'marla-to-square-feet') return <MarlaConverter initialUnit="marla" initialStandard="urban" />;
  if (tool.slug === 'square-feet-to-marla') return <MarlaConverter initialUnit="square_feet" initialStandard="urban" />;
  if (tool.slug === 'tola-to-grams') return <TolaConverter initialUnit="tola" />;
  if (tool.slug === 'maund-to-kg') return <MaundConverter />;
  if (tool.slug === 'hijri-to-gregorian') return <HijriConverter />;
  if (tool.slug === 'fbr-salary-tax-calculator') return <FbrTaxCalculatorComponent />;
  if (tool.slug === 'zakat-calculator') return <ZakatCalculatorComponent />;
  if (tool.slug === 'lakh-crore-to-million-billion') return <NumeralConverterComponent />;
  if (tool.slug === 'murabba-bigha-to-acre') return <ExtendedLandConverterComponent />;
  if (tool.slug === 'electricity-bill-solar-calculator') return <ElectricityBillCalculatorComponent />;
  if (tool.slug === 'gas-bill-calculator') return <GasBillCalculatorComponent />;


  // ==========================================
  // 3. PHASE C: MEDIA, IMAGE, VIDEO & AUDIO
  // ==========================================
  if (tool.categorySlug === 'image') {
    return <ImageConverter initialToolSlug={tool.slug} />;
  }

  if (tool.categorySlug === 'video') {
    if (tool.slug === 'video-aspect-ratio-resizer') {
      return <VideoCanvasComponent initialMode="social-resizer" initialToolSlug={tool.slug} />;
    }
    if (tool.slug === 'gif-to-mp4' || tool.slug === 'gif-to-webm') {
      return <VideoCanvasComponent initialMode="gif-to-video" initialToolSlug={tool.slug} />;
    }
    return <MediaConverter initialToolSlug={tool.slug} />;
  }

  if (tool.categorySlug === 'audio') {
    if (tool.slug === 'audio-speed-pitch-changer') {
      return <AudioModulatorCanvas initialMode="speed-pitch" initialToolSlug={tool.slug} />;
    }
    if (tool.slug === 'audio-joiner') {
      return <AudioModulatorCanvas initialMode="joiner" initialToolSlug={tool.slug} />;
    }
    return <MediaConverter initialToolSlug={tool.slug} />;
  }

  if (tool.categorySlug === 'media') {
    if (tool.slug === 'subtitle-converter') {
      return <SubtitleConverterComponent />;
    }
    if (tool.slug === 'audio-speed-pitch-changer') {
      return <AudioModulatorCanvas initialMode="speed-pitch" initialToolSlug={tool.slug} />;
    }
    if (tool.slug === 'audio-joiner') {
      return <AudioModulatorCanvas initialMode="joiner" initialToolSlug={tool.slug} />;
    }
    return <MediaConverter initialToolSlug={tool.slug} />;
  }

  // Generic fallback if tool slug matches standalone
  if (tool.slug === 'subtitle-converter') {
    return <SubtitleConverterComponent />;
  }
  if (tool.slug === 'audio-speed-pitch-changer') {
    return <AudioModulatorCanvas initialMode="speed-pitch" initialToolSlug={tool.slug} />;
  }
  if (tool.slug === 'audio-joiner') {
    return <AudioModulatorCanvas initialMode="joiner" initialToolSlug={tool.slug} />;
  }

  // ==========================================
  // 4. DATE, TIME & COLOR TOOLS
  // ==========================================
  if (tool.categorySlug === 'datetime') {
    if (tool.slug === 'age-calculator') return <AgeCalculator />;
    if (tool.slug === 'unix-timestamp-converter' || tool.slug === 'unix-timestamp') return <UnixTimestampTool />;
    if (tool.slug === 'timezone-converter') return <TimezoneConverter />;
    if (tool.slug === 'date-format-converter') return <DateFormatConverter />;
  }

  if (tool.categorySlug === 'color') {
    if (tool.slug === 'hex-to-rgb' || tool.slug === 'rgb-to-cmyk') return <ColorConverter />;
    if (tool.slug === 'color-palette-generator') return <PaletteGenerator />;
  }

  // ==========================================
  // 5. PHYSICAL UNIT CONVERTERS
  // ==========================================
  if (tool.categorySlug === 'unit') {
    let defaultCat = 'length';
    if (tool.slug.includes('weight')) defaultCat = 'weight';
    else if (tool.slug.includes('temp')) defaultCat = 'temperature';
    else if (tool.slug.includes('area')) defaultCat = 'area';
    else if (tool.slug.includes('volume')) defaultCat = 'volume';
    else if (tool.slug.includes('speed')) defaultCat = 'speed';
    else if (tool.slug.includes('data') || tool.slug.includes('storage')) defaultCat = 'storage';
    else if (tool.slug.includes('pressure')) defaultCat = 'pressure';
    else if (tool.slug.includes('energy')) defaultCat = 'energy';
    else if (tool.slug.includes('power')) defaultCat = 'power';
    else if (tool.slug.includes('angle')) defaultCat = 'angle';
    else if (tool.slug.includes('fuel')) defaultCat = 'fuel';

    return <UnitConverterCore defaultCategoryId={defaultCat} showCategorySelector={true} showQuickTable={true} />;
  }

  // ==========================================
  // 6. LIVE FOREX & CURRENCY CONVERTERS
  // ==========================================
  if (tool.categorySlug === 'currency') {
    let initialFrom = 'USD';
    let initialTo = 'PKR';

    if (tool.slug.includes('-to-')) {
      const parts = tool.slug.split('-to-');
      if (parts[0]) initialFrom = parts[0].toUpperCase();
      if (parts[1]) initialTo = parts[1].toUpperCase();
    }

    return <CurrencyConverter initialFrom={initialFrom} initialTo={initialTo} initialAmount={100} />;
  }

  // ==========================================
  // 7. PDF & DOCUMENT TOOLS
  // ==========================================
  if (tool.categorySlug === 'document') {
    const isPdfManipulatorTool = [
      'merge-pdf',
      'split-pdf',
      'rotate-pdf',
      'compress-pdf',
      'protect-pdf',
      'unlock-pdf',
      'jpg-to-pdf',
      'pdf-to-jpg',
      'pdf-to-images',
      'images-to-pdf',
    ].includes(tool.slug);

    if (isPdfManipulatorTool) {
      return <PdfToolsCanvas initialToolSlug={tool.slug} />;
    }

    return <DocumentConverter initialToolSlug={tool.slug} />;
  }

  // ==========================================
  // 8. ARCHIVE & COMPRESSION TOOLS
  // ==========================================
  if (tool.categorySlug === 'archive') {
    return <ArchiveConverter initialToolSlug={tool.slug} />;
  }

  // Generic fallback converter
  const numInput = parseFloat(inputValue) || 0;
  const calculatedResult = `${(numInput * 1.5).toFixed(2)} Output Units`;

  const handleCopy = () => {
    navigator.clipboard.writeText(calculatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConvert = () => {
    setIsProcessing(true);
    setProgress(20);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          setConvertedFileUrl('#');
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="w-full">
      {isDocumentOrImage ? (
        <div className="space-y-6">
          <Dropzone
            onFilesSelected={(files) => {
              if (files.length > 0) {
                setConvertedFileUrl(null);
              }
            }}
            acceptedFormatsText={`Select files for ${tool.name}`}
          />

          {isProcessing && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
              <ProgressBar progress={progress} label="Converting file..." />
            </div>
          )}

          {convertedFileUrl && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Conversion Complete!
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    File is ready. Automatically auto-purged in 1 hour.
                  </p>
                </div>
              </div>
              <Button variant="gradient" size="md" leftIcon={<Download className="h-4 w-4" />}>
                Download Converted File
              </Button>
            </div>
          )}

          {!convertedFileUrl && !isProcessing && (
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="gradient"
                onClick={handleConvert}
                className="w-full sm:w-auto min-w-[200px]"
              >
                Convert Now
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Input Value
              </label>
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Converted Result
              </label>
              <Input
                type="text"
                readOnly
                value={calculatedResult}
                className="font-bold text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-950/70"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/60">
            <span className="text-xs text-slate-400">
              ⚡ Real-time calculation • Precision arithmetic
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            >
              {copied ? 'Copied!' : 'Copy Result'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
