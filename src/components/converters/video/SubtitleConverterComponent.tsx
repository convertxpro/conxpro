'use client';

import React, { useState, useMemo } from 'react';
import { Dropzone } from '@/components/ui/Dropzone';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  parseSubtitles,
  shiftSubtitleTimestamps,
  cleanSubtitleText,
  serializeCues,
  SubtitleFormat,
  msToSrtTime,
  msToVttTime,
  msToAssTime,
} from '@/lib/converters/media/subtitles-engine';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { ToolMetadata } from '@/config/categories';
import {
  Subtitles,
  Clock,
  Search,
  Download,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
  FileCode,
  Eye,
} from 'lucide-react';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

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

interface SubtitleConverterComponentProps {
  tool?: ToolMetadata;
}

export const SubtitleConverterComponent: React.FC<SubtitleConverterComponentProps> = ({ tool }) => {
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

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('subtitles');

  // Parse Raw input into structured Cues
  const parsedCues = useMemo(() => {
    return parseSubtitles(rawInput);
  }, [rawInput]);

  // Apply shifts, cleaning, and search-replace to cues
  const transformedCues = useMemo(() => {
    let cues = shiftSubtitleTimestamps(parsedCues, offsetMs);

    // Apply text cleaning
    if (stripTags || stripSounds || stripSpeakers) {
      cues = cleanSubtitleText(cues, {
        stripTags: stripTags,
        stripBracketedSounds: stripSounds,
        stripSpeakerLabels: stripSpeakers,
      });
    }

    return cues;
  }, [parsedCues, offsetMs, stripTags, stripSounds, stripSpeakers]);

  // Filtered cues based on search
  const visibleCues = useMemo(() => {
    if (!searchQuery.trim()) return transformedCues;
    const q = searchQuery.toLowerCase();
    return transformedCues.filter(
      (c) =>
        c.text.toLowerCase().includes(q) ||
        msToSrtTime(c.startMs).includes(q) ||
        msToSrtTime(c.endMs).includes(q)
    );
  }, [transformedCues, searchQuery]);

  // Output generated text in target format
  const outputText = useMemo(() => {
    return serializeCues(transformedCues, targetFormat);
  }, [transformedCues, targetFormat]);

  // Handle file drop
  const handleFilesSelected = (files: File[]) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
    setFileName(nameWithoutExt);

    // Detect format from extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'vtt') {
      setSourceFormat('vtt');
      setTargetFormat('srt');
    } else if (ext === 'ass' || ext === 'ssa') {
      setSourceFormat('ass');
      setTargetFormat('vtt');
    } else {
      setSourceFormat('srt');
      setTargetFormat('vtt');
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) setRawInput(content);
    };
    reader.readAsText(file);
  };

  // Quick Offset Adder
  const handleAddOffset = (ms: number) => {
    setOffsetMs((prev) => prev + ms);
  };

  // Perform bulk Search & Replace
  const handleApplyReplace = () => {
    if (!searchQuery) return;
    const regex = new RegExp(searchQuery, 'gi');
    const updated = rawInput.replace(regex, replaceQuery);
    setRawInput(updated);
    setSearchQuery('');
    setReplaceQuery('');
  };

  // Download converted file
  const handleDownload = (format: SubtitleFormat) => {
    const text = serializeCues(transformedCues, format);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}_shifted_${offsetMs >= 0 ? '+' : ''}${offsetMs}ms.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            <Subtitles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Universal Subtitles Converter & Time-Shifter
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                ± Millisecond Sync
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Convert SRT, WebVTT, ASS & SSA, shift timestamps in milliseconds, and clean formatting tags client-side.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Top Controls & Dropzone Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Dropzone
              onFilesSelected={handleFilesSelected}
              accept=".srt, .vtt, .ass, .ssa, .sub, .txt, text/plain"
              multiple={false}
              className="py-3 px-4 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRawInput(SAMPLE_SRT);
                setOffsetMs(0);
                setFileName('subtitles_sample');
              }}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Load Sample
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRawInput('')}
              className="text-xs text-rose-500 hover:bg-rose-500/10"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
            </Button>
          </div>
        </div>

        {/* Quick Format & View Switcher */}
        <div className="md:col-span-4 p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveView('cues')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === 'cues'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5 inline mr-1" />
              Cue Table ({parsedCues.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView('editor')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeView === 'editor'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5 inline mr-1" />
              Raw Editor
            </button>
          </div>

          <select
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as SubtitleFormat)}
            className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-amber-500 uppercase focus:outline-none"
          >
            <option value="vtt">VTT</option>
            <option value="srt">SRT</option>
            <option value="ass">ASS</option>
            <option value="txt">TXT</option>
          </select>
        </div>
      </div>

      {/* 3. Settings & Precision Time Shifter Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Millisecond Shift Offset */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Timestamp Shift Offset:
              </span>
              <span
                className={`font-mono font-bold text-sm ${
                  offsetMs > 0
                    ? 'text-emerald-500'
                    : offsetMs < 0
                    ? 'text-rose-500'
                    : 'text-slate-500'
                }`}
              >
                {offsetMs > 0 ? `+${offsetMs} ms` : `${offsetMs} ms`} (
                {(offsetMs / 1000).toFixed(2)}s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={offsetMs}
                onChange={(e) => setOffsetMs(parseInt(e.target.value, 10) || 0)}
                placeholder="0"
                className="w-28 text-center font-mono text-sm font-bold"
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {[-1000, -500, +500, +1000, +2500].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAddOffset(val)}
                    className="px-2 py-1 text-xs rounded-lg font-mono font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-500 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    {val > 0 ? `+${val}` : val}ms
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setOffsetMs(0)}
                  className="px-2 py-1 text-xs rounded-lg font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Cleaning Toggles */}
          <div className="lg:col-span-6 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50">
              <input
                type="checkbox"
                checked={stripTags}
                onChange={(e) => setStripTags(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Strip HTML Tags (&lt;i&gt;, &lt;b&gt;)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50">
              <input
                type="checkbox"
                checked={stripSounds}
                onChange={(e) => setStripSounds(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Strip Sounds [Music]</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-amber-500/50">
              <input
                type="checkbox"
                checked={stripSpeakers}
                onChange={(e) => setStripSpeakers(e.target.checked)}
                className="rounded text-amber-500 focus:ring-amber-500"
              />
              <span>Strip Speaker: Labels</span>
            </label>
          </div>
        </div>

        {/* Search & Replace Strip */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search subtitle text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          <input
            type="text"
            placeholder="Replace with..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200"
          />

          <Button
            size="sm"
            variant="outline"
            disabled={!searchQuery}
            onClick={handleApplyReplace}
            className="text-xs"
          >
            Replace All
          </Button>
        </div>
      </div>

      {/* 4. Active Viewport: Cue Table vs Raw Editor */}
      {activeView === 'cues' ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="max-h-[480px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 uppercase tracking-wider z-10">
                <tr>
                  <th className="py-2.5 px-4 w-12">#</th>
                  <th className="py-2.5 px-4 w-40">Original Time</th>
                  <th className="py-2.5 px-4 w-40 text-amber-600 dark:text-amber-400">Shifted Time</th>
                  <th className="py-2.5 px-4">Subtitle Text</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                {visibleCues.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No subtitle cues found. Paste an SRT/VTT file above or load a sample.
                    </td>
                  </tr>
                ) : (
                  visibleCues.map((cue, idx) => {
                    const originalCue = parsedCues[idx] || cue;
                    return (
                      <tr
                        key={cue.id || idx}
                        className="hover:bg-amber-500/5 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-400">{cue.id || idx + 1}</td>
                        <td className="py-3 px-4 text-slate-400 text-[11px]">
                          {msToSrtTime(originalCue.startMs)} → {msToSrtTime(originalCue.endMs)}
                        </td>
                        <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-bold text-[11px]">
                          {targetFormat === 'vtt'
                            ? `${msToVttTime(cue.startMs)} → ${msToVttTime(cue.endMs)}`
                            : targetFormat === 'ass'
                            ? `${msToAssTime(cue.startMs)} → ${msToAssTime(cue.endMs)}`
                            : `${msToSrtTime(cue.startMs)} → ${msToSrtTime(cue.endMs)}`}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-800 dark:text-slate-200">
                          {cue.text}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold">Source Subtitle Text</span>
              <span>{sourceFormat.toUpperCase()}</span>
            </div>
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              className="w-full h-80 p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Paste SRT, VTT, or ASS subtitle script here..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-amber-500">
                Converted & Shifted ({targetFormat.toUpperCase()})
              </span>
              <span>
                {offsetMs !== 0 && `(Shifted by ${offsetMs}ms)`}
              </span>
            </div>
            <textarea
              readOnly
              value={outputText}
              className="w-full h-80 p-4 rounded-2xl bg-slate-950 text-amber-400/90 font-mono text-xs border border-slate-800 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 5. Download & Export Strip */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {transformedCues.length} Subtitle Cues Processed
            </div>
            <div className="text-xs text-slate-500">
              Ready for immediate download in standard broadcasting & streaming formats.
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="text-xs py-2 px-3 rounded-xl flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Subtitles!' : 'Copy Text'}</span>
          </Button>

          <Button
            onClick={() => handleDownload(targetFormat)}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .{targetFormat.toUpperCase()}</span>
          </Button>

          <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-800">
            {(['srt', 'vtt', 'ass', 'txt'] as SubtitleFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => handleDownload(fmt)}
                className="px-2 py-1 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/10 hover:text-amber-500 uppercase transition-colors"
              >
                .{fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Privacy Assurance Badge */}
      <PrivacyAssuranceBadge
        customTitle="Zero Cloud Subtitle Parsing"
        customDescription="All timestamp shifts, regular expressions, and subtitle text conversions execute strictly inside client browser memory."
      />

      {/* 7. Next Action Recommendations */}
      <NextActionRecommendations
        categorySlug="video"
        currentSlug={tool?.slug || 'subtitle-converter'}
      />
    </div>
  );
};
