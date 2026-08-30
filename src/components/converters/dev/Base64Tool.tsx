'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Dropzone } from '@/components/ui/Dropzone';
import {
  Copy,
  Check,
  Download,
  FileCode,
  Image as ImageIcon,
  ArrowLeftRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const Base64Tool: React.FC = () => {
  const [mode, setMode] = useState<'text' | 'file'>('text');
  const [action, setAction] = useState<'encode' | 'decode'>('encode');
  const [textInput, setTextInput] = useState<string>('Hello ConvertHub! Fast & private conversion.');
  const [copied, setCopied] = useState<boolean>(false);

  // File state
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [base64Output, setBase64Output] = useState<string>('');
  const [includeDataUri, setIncludeDataUri] = useState<boolean>(true);

  // UTF-8 safe encode/decode
  const textResult = useMemo(() => {
    if (!textInput) return { success: true, output: '', error: null };
    try {
      if (action === 'encode') {
        const bytes = new TextEncoder().encode(textInput);
        let binary = '';
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        const encoded = btoa(binary);
        return { success: true, output: encoded, error: null };
      } else {
        const binary = atob(textInput.trim());
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const decoded = new TextDecoder().decode(bytes);
        return { success: true, output: decoded, error: null };
      }
    } catch (err: any) {
      return { success: false, output: '', error: 'Invalid Base64 string format.' };
    }
  }, [textInput, action]);

  // Handle file selection
  const handleFileSelect = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setFileType(file.type || 'application/octet-stream');
    setFileSize(file.size);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setBase64Output(result);
    };
    reader.readAsDataURL(file);
  };

  const activeOutput = mode === 'text' ? textResult.output : base64Output;

  // Processed file base64 based on data URI preference
  const processedFileOutput = useMemo(() => {
    if (!base64Output) return '';
    if (includeDataUri) return base64Output;
    const commaIdx = base64Output.indexOf(',');
    return commaIdx >= 0 ? base64Output.slice(commaIdx + 1) : base64Output;
  }, [base64Output, includeDataUri]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800/80 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              mode === 'text'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            Text Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('file')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              mode === 'file'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            File to Base64 (Images & Docs)
          </button>
        </div>

        {mode === 'text' && (
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setAction('encode')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                action === 'encode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => setAction('decode')}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                action === 'decode'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              Decode
            </button>
          </div>
        )}
      </div>

      {mode === 'text' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {action === 'encode' ? 'Plain Text Input (UTF-8)' : 'Base64 Input String'}
            </label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={action === 'encode' ? 'Enter plain text...' : 'Enter Base64 encoded string...'}
              rows={9}
              className="w-full rounded-2xl border border-slate-200 bg-white p-4 font-mono text-xs text-slate-900 shadow-xs focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {action === 'encode' ? 'Base64 Encoded Output' : 'Decoded Plain Text'}
            </label>
            <textarea
              readOnly
              value={textResult.success ? textResult.output : `Error: ${textResult.error}`}
              rows={9}
              className={`w-full rounded-2xl border p-4 font-mono text-xs shadow-xs focus:outline-none ${
                textResult.success
                  ? 'border-indigo-200 bg-indigo-50/40 text-indigo-900 dark:border-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-200'
                  : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Dropzone
            onFilesSelected={handleFileSelect}
            multiple={false}
            maxSizeMb={15}
            acceptedFormatsText="Upload any image, font, SVG, or document to convert to Base64"
          />

          {base64Output && (
            <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {fileName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {fileType} • {(fileSize / 1024).toFixed(1)} KB original file (Base64 payload:{' '}
                    {(processedFileOutput.length / 1024).toFixed(1)} KB, ~33% overhead)
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDataUri}
                      onChange={(e) => setIncludeDataUri(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    Include `data:${fileType};base64,` prefix
                  </label>
                </div>
              </div>

              {/* Image Preview if applicable */}
              {fileType.startsWith('image/') && (
                <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={base64Output}
                    alt="Preview"
                    className="h-16 w-16 rounded-lg object-contain border border-slate-200 dark:border-slate-800"
                  />
                  <span className="text-xs text-slate-500">Live data URI preview render</span>
                </div>
              )}

              <textarea
                readOnly
                value={processedFileOutput}
                rows={6}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] leading-relaxed text-slate-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          )}
        </div>
      )}

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800/80">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Zero server transmission • 100% processed in local browser RAM
        </span>

        <Button
          size="sm"
          variant="gradient"
          onClick={() => handleCopy(mode === 'text' ? textResult.output : processedFileOutput)}
          disabled={!(mode === 'text' ? textResult.output : processedFileOutput)}
          leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        >
          {copied ? 'Copied to Clipboard!' : 'Copy Base64 Output'}
        </Button>
      </div>
    </div>
  );
};
