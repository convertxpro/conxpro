'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  parseSubtitles,
  shiftSubtitleTimestamps,
  cleanSubtitleText,
  serializeCues,
  SubtitleCue,
  SubtitleFormat,
  msToSrtTime,
  msToVttTime,
  msToAssTime,
} from '@/lib/converters/media/subtitles-engine';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import {
  Subtitles,
  Clock,
  Scissors,
  Search,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Plus,
  Trash2,
  FileText,
  FileCode,
  Sliders,
  Eye,
  RefreshCw,
  HelpCircle,
  Film,
} from 'lucide-react';

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:04,200
[Upbeat Intro Music]
SPEAKER 1: Welcome back to ApexTools, the ultimate conversion suite.

2
00:00:04,500 --> 00:00:08,800
<i>Today, we are exploring lightning-fast <b>subtitle synchronization</b>.</i>

3
00:00:09,100 --> 00:00:13,600
SPEAKER 2: (Applause) You can shift timestamps forward or backward with zero latency!

4
00:00:14,000 --> 00:00:18,500
Convert between SRT, WebVTT, ASS and plain transcripts in seconds.`;

export const SubtitleConverterComponent: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_SRT);
  const [sourceFormat, setSourceFormat] = useState<SubtitleFormat>('srt');
  const [targetFormat, setTargetFormat] = useState<SubtitleFormat>('vtt');
  const [activeView, setActiveView] = useState<'editor' | 'cues'>('cues');

  // Offset & Cleaning Settings
  const [offsetMs, setOffsetMs] = useState<number>(0);
  const [stripTags, setStripTags] = useState<boolean>(true);
  const [stripSounds, setStripSounds] = useState<boolean>(true);
  const [stripSpeakers, setStripSpeakers] = useState<boolean>(true);

  // Search & Replace
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [caseSensitive, setCaseSensitive] = useState<boolean>(false);

  // Status & Feedback
  const [copied, setCopied] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>('subtitles.srt');
  const [customOffsetInput, setCustomOffsetInput] = useState<string>('0');

  // Parsed initial cues
  const baseCues = useMemo(() => {
    return parseSubtitles(rawInput, sourceFormat);
  }, [rawInput, sourceFormat]);

  // Transformed cues with offset, cleaning, and find & replace applied
  const processedCues = useMemo(() => {
    let cues = baseCues;
    if (offsetMs !== 0) {
      cues = shiftSubtitleTimestamps(cues, offsetMs);
    }
    cues = cleanSubtitleText(cues, {
      stripTags,
      stripBracketedSounds: stripSounds,
      stripSpeakerLabels: stripSpeakers,
      customFind: searchQuery,
      customReplace: replaceQuery,
      caseSensitive,
    });
    return cues;
  }, [baseCues, offsetMs, stripTags, stripSounds, stripSpeakers, searchQuery, replaceQuery, caseSensitive]);

  // Serialized target output text
  const serializedOutput = useMemo(() => {
    return serializeCues(processedCues, targetFormat);
  }, [processedCues, targetFormat]);

  // Match count for find & replace
  const matchCount = useMemo(() => {
    if (!searchQuery.trim()) return 0;
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
      const matches = rawInput.match(regex);
      return matches ? matches.length : 0;
    } catch {
      return 0;
    }
  }, [rawInput, searchQuery, caseSensitive]);

  const handleFileUpload = (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFilename(file.name);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'vtt') setSourceFormat('vtt');
    else if (ext === 'ass' || ext === 'ssa') setSourceFormat('ass');
    else if (ext === 'txt') setSourceFormat('txt');
    else setSourceFormat('srt');

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setRawInput(content);
        setOffsetMs(0);
        setCustomOffsetInput('0');
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(serializedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const baseName = filename.replace(/\.[^/.]+$/, '');
    const outName = `${baseName}_converted.${targetFormat}`;
    const blob = new Blob([serializedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = outName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleShiftQuick = (delta: number) => {
    const newOffset = offsetMs + delta;
    setOffsetMs(newOffset);
    setCustomOffsetInput(newOffset.toString());
  };

  const handleCustomOffsetApply = (valStr: string) => {
    setCustomOffsetInput(valStr);
    const val = parseInt(valStr, 10);
    if (!isNaN(val)) {
      setOffsetMs(val);
    }
  };

  const handleResetOffset = () => {
    setOffsetMs(0);
    setCustomOffsetInput('0');
  };

  const handleReplaceAll = () => {
    if (!searchQuery) return;
    const updated = serializeCues(processedCues, sourceFormat);
    setRawInput(updated);
    setSearchQuery('');
    setReplaceQuery('');
  };

  const handleCueTextChange = (cueId: string | number | undefined, newText: string, index: number) => {
    const updated = [...processedCues];
    if (updated[index]) {
      updated[index] = { ...updated[index], text: newText };
      const serialized = serializeCues(updated, sourceFormat);
      setRawInput(serialized);
    }
  };

  const handleDeleteCue = (index: number) => {
    const updated = processedCues.filter((_, i) => i !== index);
    const serialized = serializeCues(updated, sourceFormat);
    setRawInput(serialized);
  };

  return (
    <div className="space-y-6">
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="🔒 100% Client-Side Subtitle Processing — Zero Latency, Zero Server Uploads"
      />

      {/* Top Controls: Format Selection & Sample Loader */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Source Format:
              </span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {(['srt', 'vtt', 'ass', 'txt'] as SubtitleFormat[]).map((fmt) => (
                  <button
                    key={`src-${fmt}`}
                    onClick={() => setSourceFormat(fmt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition-all ${
                      sourceFormat === fmt
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-300 dark:text-slate-700">➔</span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Target Format:
              </span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
                {(['srt', 'vtt', 'ass', 'txt'] as SubtitleFormat[]).map((fmt) => (
                  <button
                    key={`tgt-${fmt}`}
                    onClick={() => setTargetFormat(fmt)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition-all ${
                      targetFormat === fmt
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRawInput(SAMPLE_SRT);
                setSourceFormat('srt');
                setOffsetMs(0);
                setCustomOffsetInput('0');
              }}
              leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-500" />}
            >
              Load Sample
            </Button>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
              {processedCues.length} Cues Detected
            </div>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div className="mt-4">
          <Dropzone
            onFilesSelected={handleFileUpload}
            accept=".srt,.vtt,.ass,.ssa,.txt,.sub,text/plain"
            maxSizeMb={15}
            acceptedFormatsText="Supported Subtitles: .srt, .vtt, .ass, .ssa, .txt transcript (100% Client-Side Private)"
          />
        </div>
      </div>

      {/* Time-Shifter Toolbar */}
      <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-transparent p-5 dark:border-amber-500/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Timestamp Shifter & Synchronization
              </h3>
              {offsetMs !== 0 && (
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                  Offset: {offsetMs > 0 ? `+${offsetMs}` : offsetMs}ms ({((offsetMs / 1000).toFixed(2))}s)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fix out-of-sync video audio by nudging all timestamps forward (+) or backward (-).
            </p>
          </div>

          {/* Quick Offset Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => handleShiftQuick(-1000)}>
              -1.0s
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShiftQuick(-500)}>
              -500ms
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShiftQuick(-100)}>
              -100ms
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShiftQuick(100)}>
              +100ms
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShiftQuick(500)}>
              +500ms
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleShiftQuick(1000)}>
              +1.0s
            </Button>
            {offsetMs !== 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetOffset}
                className="text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                leftIcon={<RotateCcw className="h-3 w-3" />}
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Custom Offset Slider & Input */}
        <div className="mt-4 grid grid-cols-1 items-center gap-4 sm:grid-cols-12">
          <div className="sm:col-span-8">
            <input
              type="range"
              min="-10000"
              max="10000"
              step="50"
              value={offsetMs}
              onChange={(e) => handleCustomOffsetApply(e.target.value)}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-amber-500 dark:bg-slate-700"
            />
            <div className="mt-1 flex justify-between text-[10px] font-medium text-slate-400">
              <span>-10.0s (Delay)</span>
              <span>0.0s (Original)</span>
              <span>+10.0s (Advance)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:col-span-4">
            <Input
              type="number"
              value={customOffsetInput}
              onChange={(e) => handleCustomOffsetApply(e.target.value)}
              placeholder="Offset in ms"
              className="text-center font-mono text-xs font-semibold"
            />
            <span className="text-xs font-bold text-slate-500">ms</span>
          </div>
        </div>
      </div>

      {/* Cleaning Filters & Find/Replace Bar */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Cleaning Toggles */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mb-3 flex items-center gap-2">
            <Scissors className="h-4 w-4 text-primary-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Formatting & Clean-up Filters
            </h4>
          </div>

          <div className="space-y-2.5">
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-100/70 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Strip HTML Formatting Tags (<code>&lt;i&gt;</code>, <code>&lt;b&gt;</code>, <code>&lt;font&gt;</code>)
              </span>
              <input
                type="checkbox"
                checked={stripTags}
                onChange={(e) => setStripTags(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-100/70 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Remove Sound Effect Brackets (<code>[Music]</code>, <code>(Applause)</code>)
              </span>
              <input
                type="checkbox"
                checked={stripSounds}
                onChange={(e) => setStripSounds(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 transition-colors hover:bg-slate-100/70 dark:border-slate-800/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/70">
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Purge Speaker Identifiers (<code>SPEAKER 1:</code>, <code>Host:</code>)
              </span>
              <input
                type="checkbox"
                checked={stripSpeakers}
                onChange={(e) => setStripSpeakers(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
            </label>
          </div>
        </div>

        {/* Find & Replace Engine */}
        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary-500" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Live Transcript Find & Replace
              </h4>
            </div>
            {matchCount > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                {matchCount} match{matchCount > 1 ? 'es' : ''}
              </span>
            )}
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find text or typo..."
                className="text-xs"
              />
              <Input
                value={replaceQuery}
                onChange={(e) => setReplaceQuery(e.target.value)}
                placeholder="Replace with..."
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                Case sensitive
              </label>

              <Button
                variant="outline"
                size="sm"
                disabled={!searchQuery || matchCount === 0}
                onClick={handleReplaceAll}
                leftIcon={<RefreshCw className="h-3 w-3" />}
              >
                Commit Replace All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dual Workspace: Visual Cue Timeline / Raw Code Editor */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 p-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('cues')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeView === 'cues'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Interactive Cues Table ({processedCues.length})
            </button>
            <button
              onClick={() => setActiveView('editor')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeView === 'editor'
                  ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              Source Input Editor
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            >
              {copied ? 'Copied!' : 'Copy Target'}
            </Button>
            <Button
              variant="gradient"
              size="sm"
              onClick={handleDownload}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Download .{targetFormat.toUpperCase()}
            </Button>
          </div>
        </div>

        <div className="p-4">
          {activeView === 'editor' ? (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Source Subtitle Text ({sourceFormat.toUpperCase()}):
              </label>
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                rows={14}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-900 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                placeholder="Paste SRT or WebVTT content here..."
              />
            </div>
          ) : (
            <div className="max-h-[480px] space-y-2.5 overflow-y-auto pr-1">
              {processedCues.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <Subtitles className="mb-2 h-10 w-10 opacity-40" />
                  <p className="text-sm font-semibold">No subtitle cues parsed.</p>
                  <p className="text-xs">Upload an SRT/VTT file or paste subtitle text.</p>
                </div>
              ) : (
                processedCues.map((cue, idx) => (
                  <div
                    key={`cue-${cue.id || idx}`}
                    className="flex flex-col gap-2 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 transition-colors hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-slate-700 sm:flex-row sm:items-start"
                  >
                    <div className="flex flex-wrap items-center gap-2 sm:w-60 sm:flex-col sm:items-start">
                      <div className="flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {idx + 1}
                        </span>
                        <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                          {msToSrtTime(cue.startMs)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 sm:hidden">➔</span>
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {msToSrtTime(cue.endMs)}
                      </div>
                      <span className="rounded bg-slate-200/60 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {((cue.endMs - cue.startMs) / 1000).toFixed(1)}s
                      </span>
                    </div>

                    <div className="flex-1">
                      <textarea
                        value={cue.text}
                        onChange={(e) => handleCueTextChange(cue.id, e.target.value, idx)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                      />
                    </div>

                    <button
                      onClick={() => handleDeleteCue(idx)}
                      title="Delete Cue"
                      className="self-center p-1.5 text-slate-400 transition-colors hover:text-rose-500 sm:self-start"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Target Output Preview */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Live Target Stream Output ({targetFormat.toUpperCase()})
            </h4>
          </div>
          <span className="text-xs text-slate-400">
            {serializedOutput.length.toLocaleString()} characters
          </span>
        </div>

        <pre className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-emerald-400 dark:border-slate-800 dark:bg-slate-950">
          {serializedOutput || '// No output generated'}
        </pre>
      </div>
    </div>
  );
};
