'use client';

import React, { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import {
  FileSpreadsheet,
  Trash2,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  RefreshCw,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  Sliders,
  CheckSquare,
  Square,
  FileArchive,
  Eye,
  Zap,
} from 'lucide-react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { formatBytes, cn } from '@/lib/utils';

export interface CsvDeduplicatorComponentProps {
  tool?: ToolMetadata;
}

export type DedupeStrategy = 'keep-first' | 'keep-last' | 'remove-all-dupes';
export type SplitMode = 'rows' | 'size' | 'column';

export const CsvDeduplicatorComponent: React.FC<CsvDeduplicatorComponentProps> = ({ tool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [activeMode, setActiveMode] = useState<'dedupe' | 'splitter'>('dedupe');

  // Parsed Raw Data
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Mode A: Deduplication Settings
  const [selectedKeyColumns, setSelectedKeyColumns] = useState<Set<string>>(new Set());
  const [dedupeStrategy, setDedupeStrategy] = useState<DedupeStrategy>('keep-first');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);
  const [trimWhitespace, setTrimWhitespace] = useState<boolean>(true);
  const [ignoreEmptyKeys, setIgnoreEmptyKeys] = useState<boolean>(true);
  const [removeBlankRows, setRemoveBlankRows] = useState<boolean>(true);

  // Mode B: Chunk Splitter Settings
  const [splitMethod, setSplitMethod] = useState<SplitMode>('rows');
  const [rowsPerChunk, setRowsPerChunk] = useState<number>(5000);
  const [sizePerChunkMb, setSizePerChunkMb] = useState<number>(5);
  const [splitGroupByColumn, setSplitGroupByColumn] = useState<string>('');
  const [includeHeaderInChunks, setIncludeHeaderInChunks] = useState<boolean>(true);

  // Status & Progress for heavy operations
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processProgress, setProcessProgress] = useState<number>(0);
  const [processStatus, setProcessStatus] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Preview & Table Search
  const [previewTab, setPreviewTab] = useState<'clean' | 'duplicates'>('clean');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const PREVIEW_PAGE_SIZE = 50;

  // Processed Output Cache
  const [processedCleanRows, setProcessedCleanRows] = useState<Record<string, string>[]>([]);
  const [removedDuplicateRows, setRemovedDuplicateRows] = useState<Record<string, string>[]>([]);
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(0);

  // Parse Uploaded CSV / TSV File
  const handleFileAccepted = (acceptedFiles: File[]) => {
    const selected = acceptedFiles[0];
    if (!selected) return;

    setFile(selected);
    setParseError(null);
    setIsParsing(true);

    Papa.parse(selected, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        if (results.errors && results.errors.length > 0 && results.data.length === 0) {
          setParseError(`Failed to parse CSV: ${results.errors[0].message}`);
          setIsParsing(false);
          return;
        }

        const detectedHeaders = results.meta.fields || [];
        const dataRows = (results.data as Record<string, string>[]).filter((r) =>
          Object.values(r).some((v) => v && v.toString().trim() !== '')
        );

        setHeaders(detectedHeaders);
        setRawRows(dataRows);
        setSplitGroupByColumn(detectedHeaders[0] || '');

        // Pre-select all columns for default full-row deduplication
        setSelectedKeyColumns(new Set(detectedHeaders));

        // Perform initial deduplication run
        runDeduplication(dataRows, detectedHeaders, new Set(detectedHeaders), 'keep-first', false, true, true, true);
        setIsParsing(false);
      },
      error: (error) => {
        setParseError(`CSV Parsing Error: ${error.message}`);
        setIsParsing(false);
      },
    });
  };

  // High-Performance In-Memory Deduplication Engine
  const runDeduplication = (
    rows = rawRows,
    hdrs = headers,
    keys = selectedKeyColumns,
    strat = dedupeStrategy,
    caseSens = caseSensitive,
    trimWs = trimWhitespace,
    ignEmpties = ignoreEmptyKeys,
    rmBlank = removeBlankRows
  ) => {
    const startTime = performance.now();

    const cleanList: Record<string, string>[] = [];
    const duplicateList: Record<string, string>[] = [];

    // Grouping map: compoundKey -> Array<Record<string, string>>
    const groups = new Map<string, Record<string, string>[]>();
    const activeKeys = keys.size > 0 ? Array.from(keys) : hdrs;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Check if blank row
      if (rmBlank) {
        const isAllEmpty = Object.values(row).every((val) => !val || val.toString().trim() === '');
        if (isAllEmpty) continue;
      }

      // Generate compound hash key from selected columns
      const keyParts: string[] = [];
      let allPartsEmpty = true;

      for (const col of activeKeys) {
        let val = (row[col] ?? '').toString();
        if (trimWs) val = val.trim();
        if (!caseSens) val = val.toLowerCase();
        if (val !== '') allPartsEmpty = false;
        keyParts.push(val);
      }

      // If all key parts are empty and ignoreEmptyKeys is true, treat as unique item
      if (allPartsEmpty && ignEmpties) {
        cleanList.push(row);
        continue;
      }

      const compoundKey = keyParts.join('§§_');
      const existing = groups.get(compoundKey);
      if (existing) {
        existing.push(row);
      } else {
        groups.set(compoundKey, [row]);
      }
    }

    // Apply retention strategy across all grouped records
    groups.forEach((bucket) => {
      if (bucket.length === 1) {
        cleanList.push(bucket[0]);
      } else {
        if (strat === 'keep-first') {
          cleanList.push(bucket[0]);
          for (let k = 1; k < bucket.length; k++) {
            duplicateList.push(bucket[k]);
          }
        } else if (strat === 'keep-last') {
          cleanList.push(bucket[bucket.length - 1]);
          for (let k = 0; k < bucket.length - 1; k++) {
            duplicateList.push(bucket[k]);
          }
        } else if (strat === 'remove-all-dupes') {
          // Remove all instances of duplicate keys
          for (let k = 0; k < bucket.length; k++) {
            duplicateList.push(bucket[k]);
          }
        }
      }
    });

    const endTime = performance.now();
    setProcessedCleanRows(cleanList);
    setRemovedDuplicateRows(duplicateList);
    setExecutionTimeMs(Math.round(endTime - startTime));
    setPreviewPage(1);
  };

  // Re-run deduplication when user toggles settings
  const handleApplyDedupeChanges = (
    newKeys = selectedKeyColumns,
    newStrat = dedupeStrategy,
    newCase = caseSensitive,
    newTrim = trimWhitespace,
    newIgnEmpty = ignoreEmptyKeys,
    newRmBlank = removeBlankRows
  ) => {
    runDeduplication(rawRows, headers, newKeys, newStrat, newCase, newTrim, newIgnEmpty, newRmBlank);
  };

  // Toggle Key Column Checkbox
  const handleToggleKeyColumn = (col: string) => {
    const next = new Set(selectedKeyColumns);
    if (next.has(col)) {
      if (next.size > 1) next.delete(col); // Keep at least one
    } else {
      next.add(col);
    }
    setSelectedKeyColumns(next);
    handleApplyDedupeChanges(next);
  };

  const handleSelectAllColumns = () => {
    const next = new Set(headers);
    setSelectedKeyColumns(next);
    handleApplyDedupeChanges(next);
  };

  const handleDeselectAllColumns = () => {
    if (headers.length > 0) {
      const next = new Set([headers[0]]);
      setSelectedKeyColumns(next);
      handleApplyDedupeChanges(next);
    }
  };

  // Quick preset column selectors
  const handleSelectIdentitiesOnly = () => {
    const idKeywords = ['id', 'email', 'phone', 'mobile', 'cnic', 'user', 'sku', 'code', 'uuid'];
    const matching = headers.filter((h) =>
      idKeywords.some((k) => h.toLowerCase().includes(k))
    );
    const next = new Set(matching.length > 0 ? matching : headers);
    setSelectedKeyColumns(next);
    handleApplyDedupeChanges(next);
  };

  // Download Cleaned File (CSV / TSV / JSON)
  const handleDownloadCleanFile = (format: 'csv' | 'tsv' | 'json') => {
    if (processedCleanRows.length === 0) return;

    let content = '';
    let mimeType = 'text/csv';
    let ext = 'csv';

    if (format === 'csv') {
      content = Papa.unparse(processedCleanRows, { header: true });
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
    } else if (format === 'tsv') {
      content = Papa.unparse(processedCleanRows, { header: true, delimiter: '\t' });
      mimeType = 'text/tab-separated-values;charset=utf-8;';
      ext = 'tsv';
    } else if (format === 'json') {
      content = JSON.stringify(processedCleanRows, null, 2);
      mimeType = 'application/json;charset=utf-8;';
      ext = 'json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'dataset';

    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_cleaned_${processedCleanRows.length}rows.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download Removed Duplicates for Audit
  const handleDownloadDuplicates = () => {
    if (removedDuplicateRows.length === 0) return;
    const content = Papa.unparse(removedDuplicateRows, { header: true });
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'dataset';

    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}_removed_duplicates_${removedDuplicateRows.length}rows.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy Clean Data to Clipboard
  const handleCopyCleanCsv = () => {
    if (processedCleanRows.length === 0) return;
    const csvString = Papa.unparse(processedCleanRows, { header: true });
    navigator.clipboard.writeText(csvString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Mode B: Chunk Splitter & In-Browser ZIP Builder using JSZip
  const handleSplitAndZip = async () => {
    if (rawRows.length === 0) return;

    setIsProcessing(true);
    setProcessProgress(10);
    setProcessStatus('Preparing dataset chunks...');

    try {
      const zip = new JSZip();
      const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'dataset';

      if (splitMethod === 'rows') {
        // Split by row count
        const chunkSize = Math.max(10, rowsPerChunk);
        const totalChunks = Math.ceil(rawRows.length / chunkSize);

        for (let c = 0; c < totalChunks; c++) {
          setProcessProgress(Math.round(15 + (c / totalChunks) * 75));
          setProcessStatus(`Generating chunk ${c + 1} of ${totalChunks}...`);

          const startIdx = c * chunkSize;
          const endIdx = Math.min(rawRows.length, startIdx + chunkSize);
          const chunkData = rawRows.slice(startIdx, endIdx);

          const csvString = Papa.unparse(chunkData, { header: includeHeaderInChunks });
          const paddedIndex = String(c + 1).padStart(3, '0');
          zip.file(`${baseName}_part_${paddedIndex}.csv`, csvString);
        }
      } else if (splitMethod === 'size') {
        // Split by estimated file size
        const targetBytes = Math.max(0.5, sizePerChunkMb) * 1024 * 1024;
        let currentChunkRows: Record<string, string>[] = [];
        let currentEstimatedBytes = 0;
        let chunkIndex = 1;

        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          currentChunkRows.push(row);
          currentEstimatedBytes += JSON.stringify(row).length;

          if (currentEstimatedBytes >= targetBytes || i === rawRows.length - 1) {
            const csvString = Papa.unparse(currentChunkRows, { header: includeHeaderInChunks });
            const paddedIndex = String(chunkIndex).padStart(3, '0');
            zip.file(`${baseName}_size_${paddedIndex}.csv`, csvString);

            chunkIndex++;
            currentChunkRows = [];
            currentEstimatedBytes = 0;
          }
        }
      } else if (splitMethod === 'column') {
        // Split by column grouping
        const col = splitGroupByColumn || headers[0];
        const groups = new Map<string, Record<string, string>[]>();

        for (const row of rawRows) {
          const rawVal = (row[col] ?? 'unassigned').toString().trim();
          // Sanitize filename
          const safeKey = rawVal.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40) || 'empty';
          const arr = groups.get(safeKey) || [];
          arr.push(row);
          groups.set(safeKey, arr);
        }

        groups.forEach((groupedRows, keyName) => {
          const csvString = Papa.unparse(groupedRows, { header: includeHeaderInChunks });
          zip.file(`${baseName}_${col}_${keyName}.csv`, csvString);
        });
      }

      setProcessProgress(92);
      setProcessStatus('Compressing chunks into ZIP archive...');

      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setProcessProgress(Math.round(92 + (metadata.percent / 100) * 8));
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${baseName}_split_chunks.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setProcessProgress(100);
      setProcessStatus('ZIP download complete!');
    } catch (err: any) {
      console.error('Split and Zip error:', err);
      setParseError(err?.message || 'Failed to split and zip files.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered Preview Rows for Table Inspector
  const displayedPreviewRows = useMemo(() => {
    const source = previewTab === 'clean' ? processedCleanRows : removedDuplicateRows;
    if (!searchQuery.trim()) return source;

    const q = searchQuery.toLowerCase();
    return source.filter((r) =>
      Object.values(r).some((v) => v && v.toString().toLowerCase().includes(q))
    );
  }, [previewTab, processedCleanRows, removedDuplicateRows, searchQuery]);

  const totalPreviewPages = Math.ceil(displayedPreviewRows.length / PREVIEW_PAGE_SIZE) || 1;
  const paginatedRows = useMemo(() => {
    const start = (previewPage - 1) * PREVIEW_PAGE_SIZE;
    return displayedPreviewRows.slice(start, start + PREVIEW_PAGE_SIZE);
  }, [displayedPreviewRows, previewPage]);

  const duplicateRate = rawRows.length > 0
    ? ((removedDuplicateRows.length / rawRows.length) * 100).toFixed(1)
    : '0';

  const resetAll = () => {
    setFile(null);
    setHeaders([]);
    setRawRows([]);
    setProcessedCleanRows([]);
    setRemovedDuplicateRows([]);
    setSelectedKeyColumns(new Set());
    setParseError(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Privacy Banner */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="100% In-Browser Data Processing"
        customDescription="Your CSV and Excel datasets are parsed, cleaned, deduplicated, and split completely in your browser RAM with zero server transfers."
      />

      {/* Error Banner */}
      {parseError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-950/30 dark:text-red-400 animate-in fade-in">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="flex-1">{parseError}</p>
          <Button size="sm" variant="ghost" onClick={() => setParseError(null)}>
            Dismiss
          </Button>
        </div>
      )}

      {/* Stage 1: File Ingestion Dropzone */}
      {!file && !isParsing && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
              <FileSpreadsheet className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              CSV & Excel Deduplicator & Chunk Splitter
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 dark:text-slate-400">
              Deduplicate millions of records by custom primary keys or full rows, filter data, and split massive sheets into smaller chunks bundled in a single ZIP.
            </p>
          </div>

          <Dropzone
            accept=".csv,.tsv,.txt"
            maxSizeMb={100}
            multiple={false}
            onFilesSelected={handleFileAccepted}
            acceptedFormatsText="Handles up to 500,000+ rows directly in browser memory • 100% Secure"
          />
        </div>
      )}

      {/* Stage 2: Parsing Progress */}
      {isParsing && (
        <div className="rounded-3xl border border-slate-200/80 bg-white/70 p-12 text-center shadow-xl backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Parsing Tabular Dataset...
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Streaming columns and indexing rows into high-speed memory maps...
          </p>
        </div>
      )}

      {/* Stage 3: Interactive Workstation */}
      {file && !isParsing && rawRows.length > 0 && (
        <div className="space-y-6">
          {/* Top Master Summary & Mode Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
            {/* File Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base truncate max-w-[220px] sm:max-w-md" title={file.name}>
                  {file.name}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {rawRows.length.toLocaleString()} Total Rows
                  </span>
                  <span>•</span>
                  <span>{headers.length} Columns</span>
                  <span>•</span>
                  <span>{formatBytes(file.size)}</span>
                  <span>•</span>
                  <span>Speed: {executionTimeMs}ms</span>
                </div>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-2">
              <div className="flex rounded-2xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                <button
                  onClick={() => setActiveMode('dedupe')}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
                    activeMode === 'dedupe'
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  Deduplicator & Cleaner
                </button>
                <button
                  onClick={() => setActiveMode('splitter')}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all',
                    activeMode === 'splitter'
                      ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                  )}
                >
                  <Scissors className="h-4 w-4" />
                  Chunk Splitter & ZIP
                </button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={resetAll}
                className="text-xs text-slate-500 hover:text-rose-500"
              >
                Change File
              </Button>
            </div>
          </div>

          {/* Metric KPI Cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-400">Original Rows</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                {rawRows.length.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Total input records</p>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-50/50 p-4 shadow-sm dark:border-rose-900/30 dark:bg-rose-950/20">
              <p className="text-xs font-semibold uppercase text-rose-500">Duplicates Removed</p>
              <p className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">
                {removedDuplicateRows.length.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-rose-500/80">{duplicateRate}% redundancy rate</p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-950/20">
              <p className="text-xs font-semibold uppercase text-emerald-600 dark:text-emerald-400">Clean Unique Rows</p>
              <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {processedCleanRows.length.toLocaleString()}
              </p>
              <p className="mt-0.5 text-[11px] text-emerald-600/80">Ready for export</p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs font-semibold uppercase text-slate-400">Engine Speed</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                {executionTimeMs} ms
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">Zero latency in-RAM</p>
            </div>
          </div>

          {/* MODE A: Deduplicator Studio Controls */}
          {activeMode === 'dedupe' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Settings Configuration Sidebar (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Primary Key Columns Selector */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Primary Key Columns
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Select fields to match duplicate records
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={handleSelectAllColumns}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        All
                      </button>
                      <span className="text-slate-300">|</span>
                      <button
                        onClick={handleSelectIdentitiesOnly}
                        className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Auto-IDs
                      </button>
                    </div>
                  </div>

                  {/* Header Checkboxes Grid */}
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 border rounded-2xl p-2.5 bg-slate-50/70 border-slate-200 dark:border-slate-800 dark:bg-slate-950/40">
                    {headers.map((hdr) => {
                      const isChecked = selectedKeyColumns.has(hdr);
                      return (
                        <label
                          key={hdr}
                          className={cn(
                            'flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium cursor-pointer transition-all',
                            isChecked
                              ? 'bg-indigo-50 text-indigo-900 border border-indigo-200/80 dark:bg-indigo-950/50 dark:text-indigo-200 dark:border-indigo-800'
                              : 'hover:bg-slate-100 text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                          )}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleKeyColumn(hdr)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="truncate">{hdr}</span>
                          </div>
                          {isChecked && (
                            <span className="rounded bg-indigo-200/60 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300">
                              Active Key
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Retention Strategy & Matching Rules */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Duplicate Retention Strategy
                    </label>
                    <div className="mt-2 space-y-1.5">
                      {[
                        { id: 'keep-first', title: 'Keep First Occurrence', desc: 'Retains first record, removes subsequent duplicates' },
                        { id: 'keep-last', title: 'Keep Last Occurrence', desc: 'Retains most recent record, removes prior entries' },
                        { id: 'remove-all-dupes', title: 'Remove All Duplicates', desc: 'Strict singleton filter (purges any recurring key)' },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={cn(
                            'flex items-start gap-2.5 rounded-2xl border p-3 cursor-pointer transition-all',
                            dedupeStrategy === item.id
                              ? 'border-indigo-500 bg-indigo-50/60 dark:border-indigo-400 dark:bg-indigo-950/40'
                              : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                          )}
                        >
                          <input
                            type="radio"
                            name="dedupe-strat"
                            checked={dedupeStrategy === item.id}
                            onChange={() => {
                              setDedupeStrategy(item.id as DedupeStrategy);
                              handleApplyDedupeChanges(selectedKeyColumns, item.id as DedupeStrategy);
                            }}
                            className="mt-0.5 h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {item.desc}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                    <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      <span>Case Sensitive Matching</span>
                      <input
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={(e) => {
                          setCaseSensitive(e.target.checked);
                          handleApplyDedupeChanges(selectedKeyColumns, dedupeStrategy, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      <span>Trim Cell Whitespace</span>
                      <input
                        type="checkbox"
                        checked={trimWhitespace}
                        onChange={(e) => {
                          setTrimWhitespace(e.target.checked);
                          handleApplyDedupeChanges(selectedKeyColumns, dedupeStrategy, caseSensitive, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      <span>Ignore Empty Key Matches</span>
                      <input
                        type="checkbox"
                        checked={ignoreEmptyKeys}
                        onChange={(e) => {
                          setIgnoreEmptyKeys(e.target.checked);
                          handleApplyDedupeChanges(selectedKeyColumns, dedupeStrategy, caseSensitive, trimWhitespace, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>

                    <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                      <span>Remove 100% Blank Rows</span>
                      <input
                        type="checkbox"
                        checked={removeBlankRows}
                        onChange={(e) => {
                          setRemoveBlankRows(e.target.checked);
                          handleApplyDedupeChanges(selectedKeyColumns, dedupeStrategy, caseSensitive, trimWhitespace, ignoreEmptyKeys, e.target.checked);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Export Cleaned Dataset
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="gradient"
                      size="md"
                      onClick={() => handleDownloadCleanFile('csv')}
                      leftIcon={<Download className="h-4 w-4" />}
                      className="w-full font-bold shadow-md shadow-indigo-500/20"
                    >
                      Download CSV
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() => handleDownloadCleanFile('tsv')}
                      leftIcon={<Download className="h-4 w-4" />}
                      className="w-full font-semibold"
                    >
                      Download TSV
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadCleanFile('json')}
                      className="w-full text-xs"
                    >
                      JSON Array
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyCleanCsv}
                      leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      className="w-full text-xs"
                    >
                      {copied ? 'Copied CSV!' : 'Copy to Clipboard'}
                    </Button>
                  </div>

                  {removedDuplicateRows.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDownloadDuplicates}
                      leftIcon={<Download className="h-3.5 w-3.5 text-rose-500" />}
                      className="w-full text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    >
                      Download Purged Duplicates Only ({removedDuplicateRows.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Data Table Inspector Preview (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {/* Table Header Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    {/* View Tabs */}
                    <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                      <button
                        onClick={() => {
                          setPreviewTab('clean');
                          setPreviewPage(1);
                        }}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                          previewTab === 'clean'
                            ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                        )}
                      >
                        Clean Output ({processedCleanRows.length.toLocaleString()})
                      </button>
                      <button
                        onClick={() => {
                          setPreviewTab('duplicates');
                          setPreviewPage(1);
                        }}
                        className={cn(
                          'rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
                          previewTab === 'duplicates'
                            ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-rose-400'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                        )}
                      >
                        Duplicates Found ({removedDuplicateRows.length.toLocaleString()})
                      </button>
                    </div>

                    {/* Table Search Input */}
                    <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                      <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setPreviewPage(1);
                        }}
                        placeholder="Search preview rows..."
                        className="pl-8 h-8 text-xs"
                      />
                    </div>
                  </div>

                  {/* Responsive Scrollable Table */}
                  <div className="relative overflow-x-auto rounded-2xl border border-slate-200/80 bg-slate-50/50 max-h-[520px] dark:border-slate-800 dark:bg-slate-950/50">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 z-10 bg-slate-100/95 font-bold uppercase tracking-wider text-slate-700 backdrop-blur-md dark:bg-slate-800/95 dark:text-slate-200">
                        <tr>
                          <th className="p-3 border-b border-slate-200 dark:border-slate-700 w-12 text-center">
                            #
                          </th>
                          {headers.map((h) => (
                            <th
                              key={h}
                              className={cn(
                                'p-3 border-b border-slate-200 dark:border-slate-700 whitespace-nowrap',
                                selectedKeyColumns.has(h) && 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                              )}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                        {paginatedRows.length === 0 ? (
                          <tr>
                            <td colSpan={headers.length + 1} className="p-8 text-center text-slate-400">
                              No records found matching your filters.
                            </td>
                          </tr>
                        ) : (
                          paginatedRows.map((row, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors"
                            >
                              <td className="p-2.5 text-center font-mono text-[11px] text-slate-400">
                                {(previewPage - 1) * PREVIEW_PAGE_SIZE + idx + 1}
                              </td>
                              {headers.map((h) => (
                                <td
                                  key={h}
                                  className={cn(
                                    'p-2.5 whitespace-nowrap truncate max-w-xs text-slate-800 dark:text-slate-200',
                                    selectedKeyColumns.has(h) && 'font-semibold'
                                  )}
                                >
                                  {row[h] || <span className="text-slate-300 dark:text-slate-600">null</span>}
                                </td>
                              ))}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  <div className="flex items-center justify-between pt-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Showing {paginatedRows.length} of {displayedPreviewRows.length.toLocaleString()} rows
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                        disabled={previewPage <= 1}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Prev
                      </button>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Page {previewPage} / {totalPreviewPages}
                      </span>
                      <button
                        onClick={() => setPreviewPage((p) => Math.min(totalPreviewPages, p + 1))}
                        disabled={previewPage >= totalPreviewPages}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 disabled:opacity-40 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODE B: Dataset Chunk Splitter Studio */}
          {activeMode === 'splitter' && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Dataset Chunk Splitter & ZIP Packager
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Split massive CSV/Excel sheets into smaller manageable files and bundle them into a single compressed ZIP archive.
                </p>
              </div>

              {/* Split Strategy Choice */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  { id: 'rows', title: 'Split by Row Count', desc: 'e.g. 5,000 or 10,000 rows per file' },
                  { id: 'size', title: 'Split by Target File Size', desc: 'e.g. 5 MB or 10 MB per chunk' },
                  { id: 'column', title: 'Split by Column Grouping', desc: 'e.g. Separate CSV per Country or Category' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={cn(
                      'flex flex-col justify-between rounded-2xl border p-4 cursor-pointer transition-all',
                      splitMethod === item.id
                        ? 'border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-indigo-950/40'
                        : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.title}
                      </span>
                      <input
                        type="radio"
                        name="split-method"
                        checked={splitMethod === item.id}
                        onChange={() => setSplitMethod(item.id as SplitMode)}
                        className="h-4 w-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </label>
                ))}
              </div>

              {/* Dynamic Parameter Controls */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60 max-w-xl">
                {splitMethod === 'rows' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Rows per Output File
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[1000, 2500, 5000, 10000, 25000].map((count) => (
                        <button
                          key={count}
                          onClick={() => setRowsPerChunk(count)}
                          className={cn(
                            'rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                            rowsPerChunk === count
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          )}
                        >
                          {count.toLocaleString()} rows
                        </button>
                      ))}
                    </div>
                    <Input
                      type="number"
                      value={rowsPerChunk}
                      onChange={(e) => setRowsPerChunk(Math.max(10, parseInt(e.target.value) || 1000))}
                      placeholder="Custom row count"
                      className="mt-2"
                    />
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                      Will produce ~{Math.ceil(rawRows.length / rowsPerChunk)} CSV files in ZIP
                    </p>
                  </div>
                )}

                {splitMethod === 'size' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Target File Size (MB per Chunk)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {[1, 2, 5, 10, 25].map((mb) => (
                        <button
                          key={mb}
                          onClick={() => setSizePerChunkMb(mb)}
                          className={cn(
                            'rounded-xl px-3 py-1.5 text-xs font-bold transition-all',
                            sizePerChunkMb === mb
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          )}
                        >
                          {mb} MB
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {splitMethod === 'column' && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Group and Split By Column
                    </label>
                    <select
                      value={splitGroupByColumn}
                      onChange={(e) => setSplitGroupByColumn(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="inc-hdr-chk"
                    checked={includeHeaderInChunks}
                    onChange={(e) => setIncludeHeaderInChunks(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="inc-hdr-chk" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    Include column header row in every split chunk
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleSplitAndZip}
                  disabled={isProcessing}
                  leftIcon={isProcessing ? <RefreshCw className="h-5 w-5 animate-spin" /> : <FileArchive className="h-5 w-5" />}
                  className="font-bold shadow-xl shadow-indigo-500/20"
                >
                  {isProcessing ? 'Generating ZIP Chunks...' : 'Split Dataset & Download ZIP'}
                </Button>
              </div>

              {isProcessing && (
                <div className="space-y-2 max-w-md">
                  <p className="text-xs text-slate-500 dark:text-slate-400">{processStatus}</p>
                  <ProgressBar progress={processProgress} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
