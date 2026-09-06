'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  computeTextHashes,
  computeFileChecksumStreaming,
  SupportedFileHashAlgorithm,
  HashResult,
} from '@/lib/converters/dev/hash-engine';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/ProgressBar';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  FileCheck,
  FileText,
  Upload,
  Copy,
  Check,
  Sparkles,
  Lock,
  RefreshCw,
  CaseUpper,
  CaseLower,
  CheckCircle2,
  AlertCircle,
  FileCode,
  HardDrive,
  Cpu,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

export interface HashGeneratorComponentProps {
  tool?: ToolMetadata;
}

export const HashGeneratorComponent: React.FC<HashGeneratorComponentProps> = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');

  // Text Hashing State
  const [inputText, setInputText] = useState('ApexTools — Ultra Fast Client-Side Developer Suite');
  const [enableHmac, setEnableHmac] = useState(false);
  const [hmacSecret, setHmacSecret] = useState('');
  const [isUppercase, setIsUppercase] = useState(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // File Hashing State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileAlgorithm, setFileAlgorithm] = useState<SupportedFileHashAlgorithm>('SHA-256');
  const [fileHash, setFileHash] = useState<string>('');
  const [isHashingFile, setIsHashingFile] = useState(false);
  const [hashProgress, setHashProgress] = useState(0);
  const [processedBytes, setProcessedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [fileHashError, setFileHashError] = useState<string | null>(null);

  // Hash Comparator State
  const [targetHash, setTargetHash] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute text hashes
  const textHashes = useMemo(() => {
    const hashes = computeTextHashes(inputText, enableHmac ? hmacSecret : undefined);
    if (!isUppercase) return hashes;
    return hashes.map((h) => ({ ...h, hash: h.hash.toUpperCase() }));
  }, [inputText, enableHmac, hmacSecret, isUppercase]);

  // Handle file selection and streaming calculation
  const handleFileChange = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setFileHash('');
      setHashProgress(0);
      return;
    }

    setSelectedFile(file);
    setFileHash('');
    setFileHashError(null);
    setIsHashingFile(true);
    setHashProgress(0);
    setProcessedBytes(0);
    setTotalBytes(file.size);

    try {
      const hash = await computeFileChecksumStreaming(
        file,
        fileAlgorithm,
        (percent, processed, total) => {
          setHashProgress(percent);
          setProcessedBytes(processed);
          setTotalBytes(total);
        }
      );
      setFileHash(isUppercase ? hash.toUpperCase() : hash.toLowerCase());
    } catch (err: any) {
      setFileHashError(err.message || 'Failed to compute file checksum');
    } finally {
      setIsHashingFile(false);
    }
  };

  // Re-hash file if algorithm changes
  useEffect(() => {
    if (selectedFile) {
      handleFileChange(selectedFile);
    }
  }, [fileAlgorithm]);

  // Adjust case on toggle for file hash
  useEffect(() => {
    if (fileHash) {
      setFileHash(isUppercase ? fileHash.toUpperCase() : fileHash.toLowerCase());
    }
  }, [isUppercase]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  // Active hash for comparator (either from file, or selected text hash like SHA-256)
  const activeComputedHash = useMemo(() => {
    if (activeTab === 'file') {
      return fileHash.trim();
    }
    const defaultSha256 = textHashes.find((h) => h.algorithm.includes('SHA-256'))?.hash || '';
    return defaultSha256.trim();
  }, [activeTab, fileHash, textHashes]);

  // Hash comparison evaluation
  const comparisonResult = useMemo(() => {
    const target = targetHash.trim().toLowerCase().replace(/\s+/g, '');
    if (!target) return 'idle';

    if (activeTab === 'file') {
      const current = fileHash.trim().toLowerCase();
      if (!current) return 'idle';
      return current === target ? 'match' : 'mismatch';
    } else {
      // In text tab, check if target matches ANY of the computed hashes
      const matchesAny = textHashes.some(
        (h) => h.hash.toLowerCase().trim() === target
      );
      return matchesAny ? 'match' : 'mismatch';
    }
  }, [targetHash, fileHash, textHashes, activeTab]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="🔒 100% In-Browser Execution — Zero Server Uploads (Safe for Passwords & Confidential Files)"
      />

      {/* Mode Navigation & Options Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'text'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Text String Hashes</span>
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === 'file'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FileCheck className="h-4 w-4" />
            <span>File Checksum Verifier</span>
          </button>
        </div>

        {/* Global Controls: Case Toggle & Presets */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsUppercase(!isUppercase)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isUppercase
                ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
            title="Toggle Uppercase / Lowercase hex formatting"
          >
            {isUppercase ? <CaseUpper className="h-4 w-4" /> : <CaseLower className="h-4 w-4" />}
            <span>{isUppercase ? 'UPPERCASE' : 'lowercase'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: TEXT STRING HASHES */}
      {activeTab === 'text' && (
        <div className="space-y-6">
          {/* Input Text Box */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Input String / Plaintext
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEnableHmac(!enableHmac)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                    enableHmac
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Lock className="h-3 w-3" />
                  <span>HMAC Mode: {enableHmac ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type or paste any text string to generate cryptographic hashes..."
                rows={3}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono text-sm leading-relaxed text-slate-800 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
              />

              {/* HMAC Secret Key Input if enabled */}
              {enableHmac && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20 space-y-1.5">
                  <label className="text-xs font-bold text-amber-900 dark:text-amber-300">
                    HMAC Secret Key
                  </label>
                  <Input
                    type="text"
                    value={hmacSecret}
                    onChange={(e) => setHmacSecret(e.target.value)}
                    placeholder="Enter HMAC secret key..."
                    className="font-mono text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Hashes Parallel Output Grid */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Generated Hashes ({textHashes.length} Algorithms)
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {textHashes.map((item) => (
                <div
                  key={item.algorithm}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-800"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.algorithm}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {item.length} chars ({item.length * 4} bits)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyToClipboard(item.hash, item.algorithm)}
                      leftIcon={
                        copiedHash === item.algorithm ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )
                      }
                      className="text-xs h-8"
                    >
                      {copiedHash === item.algorithm ? 'Copied' : 'Copy'}
                    </Button>
                  </div>

                  <div className="mt-2.5">
                    <div className="rounded-xl bg-slate-50/80 p-2.5 font-mono text-xs break-all text-indigo-950 dark:bg-slate-900/60 dark:text-indigo-300 selection:bg-indigo-200">
                      {item.hash || '—'}
                    </div>
                    {item.description && (
                      <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FILE CHECKSUM VERIFIER */}
      {activeTab === 'file' && (
        <div className="space-y-6">
          {/* Dropzone & File Uploader */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-8 text-center transition-all hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-500 dark:hover:bg-slate-900/60"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              className="hidden"
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-transform group-hover:scale-110 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Upload className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              {selectedFile ? selectedFile.name : 'Choose a file or drag & drop here'}
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Supports ISOs, ZIPs, DMGs, executables, videos, and archives up to 2GB+
            </p>
            {selectedFile && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">
                <HardDrive className="h-3.5 w-3.5" />
                <span>Size: {formatFileSize(selectedFile.size)}</span>
              </div>
            )}
          </div>

          {/* Algorithm Picker */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Checksum Algorithm
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {(['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1', 'MD5', 'Keccak-256'] as SupportedFileHashAlgorithm[]).map(
                (algo) => (
                  <button
                    key={algo}
                    onClick={() => setFileAlgorithm(algo)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      fileAlgorithm === algo
                        ? 'bg-indigo-600 text-white shadow-sm dark:bg-indigo-500'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    {algo}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Streaming Progress Bar */}
          {isHashingFile && (
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-950 dark:bg-indigo-950/30">
              <ProgressBar
                progress={hashProgress}
                label={`Streaming ${fileAlgorithm} Checksum (${formatFileSize(processedBytes)} / ${formatFileSize(totalBytes)})...`}
              />
            </div>
          )}

          {/* File Hash Error */}
          {fileHashError && (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
              <AlertCircle className="h-5 w-5 text-rose-600" />
              <span className="text-xs font-semibold">{fileHashError}</span>
            </div>
          )}

          {/* Computed File Hash Output */}
          {fileHash && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/30 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    {fileAlgorithm} Checksum Result
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => copyToClipboard(fileHash, 'file-result')}
                  leftIcon={
                    copiedHash === 'file-result' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {copiedHash === 'file-result' ? 'Copied' : 'Copy Checksum'}
                </Button>
              </div>

              <div className="rounded-xl bg-white p-3 font-mono text-xs break-all text-slate-900 dark:bg-slate-900 dark:text-slate-100 shadow-inner">
                {fileHash}
              </div>
            </div>
          )}
        </div>
      )}

      {/* HASH INTEGRITY COMPARATOR BOX */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Instant Hash Comparator & Integrity Check
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste the checksum provided by the software vendor to verify authenticity
              </p>
            </div>
          </div>

          {/* Comparison Result Badge */}
          <div>
            {comparisonResult === 'match' && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                MATCH! File Integrity 100% Verified
              </span>
            )}
            {comparisonResult === 'mismatch' && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                MISMATCH! Hashes Do Not Match
              </span>
            )}
            {comparisonResult === 'idle' && (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                <Shield className="h-3.5 w-3.5 text-slate-400" />
                Awaiting Target Hash
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Expected / Target Hash from Publisher (MD5, SHA-256, SHA-512, etc.)
          </label>
          <Input
            type="text"
            value={targetHash}
            onChange={(e) => setTargetHash(e.target.value)}
            placeholder="Paste vendor checksum here (e.g. 5d41402abc4b2a76b9719d911017c592...)"
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Comparison is case-insensitive and automatically strips whitespace.
          </p>
        </div>
      </div>
    </div>
  );
};
