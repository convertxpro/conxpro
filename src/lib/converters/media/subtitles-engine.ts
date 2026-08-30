/**
 * Subtitles Engine — Parsing, Time-Shifting, Cleaning & Multi-Format Serialization
 * Supports SRT, WebVTT, ASS/SSA, and TXT transcripts.
 */

export interface SubtitleCue {
  id?: string | number;
  startMs: number;
  endMs: number;
  text: string;
}

export type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'txt';

/**
 * Universal subtitle parser supporting SRT, WebVTT, ASS/SSA, and TXT
 */
export function parseSubtitles(content: string, format?: SubtitleFormat): SubtitleCue[] {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];

  if (format === 'ass' || normalized.includes('[Events]') || normalized.includes('Dialogue:')) {
    return parseAss(normalized);
  }

  if (format === 'vtt' || normalized.startsWith('WEBVTT') || normalized.includes('WEBVTT\n')) {
    return parseVtt(normalized);
  }

  if (format === 'txt' && !normalized.includes('-->')) {
    return parseTxt(normalized);
  }

  // Default to SRT parser (also handles mixed VTT cue formats)
  const srtCues = parseSrt(normalized);
  if (srtCues.length > 0) return srtCues;

  // Fallback to TXT parser if no timestamp cues detected
  return parseTxt(normalized);
}

/**
 * Parse SubRip (.srt) subtitle string
 */
export function parseSrt(srtContent: string): SubtitleCue[] {
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  // Split on double newlines
  const blocks = normalized.split(/\n\s*\n+/);
  const cues: SubtitleCue[] = [];

  for (let b = 0; b < blocks.length; b++) {
    const block = blocks[b].trim();
    if (!block) continue;

    const lines = block.split('\n');
    let timeLineIdx = -1;
    let cueId: string | undefined;

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('-->')) {
        timeLineIdx = i;
        if (i > 0) cueId = lines[0].trim();
        break;
      }
    }

    if (timeLineIdx === -1) continue;

    const timeLine = lines[timeLineIdx];
    const arrowParts = timeLine.split('-->').map((s) => s.trim());
    if (arrowParts.length !== 2) continue;

    const startStr = arrowParts[0].split(/\s+/)[0];
    const endStr = arrowParts[1].split(/\s+/)[0];

    const startMs = parseTimeToMs(startStr);
    const endMs = parseTimeToMs(endStr);

    const textLines = lines.slice(timeLineIdx + 1);
    const text = textLines.join('\n').trim();

    if (startMs >= 0 && endMs >= startMs) {
      cues.push({
        id: cueId || (cues.length + 1).toString(),
        startMs,
        endMs,
        text,
      });
    }
  }

  return cues;
}

/**
 * Parse WebVTT (.vtt) subtitle string
 */
export function parseVtt(vttContent: string): SubtitleCue[] {
  let normalized = vttContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();

  // Strip WEBVTT header and NOTE comments
  if (normalized.startsWith('WEBVTT')) {
    normalized = normalized.replace(/^WEBVTT[^\n]*\n+/, '');
  }

  // Remove NOTE blocks
  normalized = normalized.replace(/^NOTE(\s+[\s\S]*?)?(\n\n+|$)/gm, '');

  return parseSrt(normalized);
}

/**
 * Parse Advanced SubStation Alpha (.ass / .ssa) subtitle string
 */
export function parseAss(assContent: string): SubtitleCue[] {
  const normalized = assContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');
  const cues: SubtitleCue[] = [];

  let inEvents = false;
  let formatFields: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('[Events]')) {
      inEvents = true;
      continue;
    }
    if (trimmed.startsWith('[') && inEvents) {
      inEvents = false;
      continue;
    }

    if (inEvents) {
      if (trimmed.startsWith('Format:')) {
        formatFields = trimmed
          .replace('Format:', '')
          .split(',')
          .map((s) => s.trim().toLowerCase());
        continue;
      }

      if (trimmed.startsWith('Dialogue:')) {
        const contentStr = trimmed.replace(/^Dialogue:\s*/, '');
        const parts = splitAssDialogue(contentStr, formatFields.length || 10);

        const startIdx = formatFields.indexOf('start') !== -1 ? formatFields.indexOf('start') : 1;
        const endIdx = formatFields.indexOf('end') !== -1 ? formatFields.indexOf('end') : 2;
        const textIdx = formatFields.indexOf('text') !== -1 ? formatFields.indexOf('text') : parts.length - 1;

        const startStr = parts[startIdx] || '0:00:00.00';
        const endStr = parts[endIdx] || '0:00:00.00';
        let text = parts[textIdx] || '';

        // Clean ASS override tags like {\b1} or \N
        text = text.replace(/\{[^}]+\}/g, '').replace(/\\N/g, '\n').replace(/\\n/g, '\n').trim();

        cues.push({
          id: (cues.length + 1).toString(),
          startMs: parseAssTimeToMs(startStr),
          endMs: parseAssTimeToMs(endStr),
          text,
        });
      }
    }
  }

  return cues;
}

/**
 * Parse plain text transcript (estimates ~3 seconds per sentence or block)
 */
export function parseTxt(txtContent: string): SubtitleCue[] {
  const normalized = txtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const paragraphs = normalized.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const cues: SubtitleCue[] = [];

  let currentMs = 0;
  for (let i = 0; i < paragraphs.length; i++) {
    const p = paragraphs[i].trim();
    const wordCount = p.split(/\s+/).length;
    // ~150 words per minute => ~400ms per word
    const durationMs = Math.max(2000, wordCount * 400);

    cues.push({
      id: (i + 1).toString(),
      startMs: currentMs,
      endMs: currentMs + durationMs,
      text: p,
    });

    currentMs += durationMs + 200; // 200ms gap
  }

  return cues;
}

/**
 * Shift all subtitle cue timestamps forward or backward by offsetMs
 */
export function shiftSubtitleTimestamps(cues: SubtitleCue[], offsetMs: number): SubtitleCue[] {
  return cues.map((cue) => {
    const shiftedStart = Math.max(0, cue.startMs + offsetMs);
    const shiftedEnd = Math.max(shiftedStart + 100, cue.endMs + offsetMs);
    return {
      ...cue,
      startMs: shiftedStart,
      endMs: shiftedEnd,
    };
  });
}

export interface SubtitleCleaningOptions {
  stripTags?: boolean;
  stripBracketedSounds?: boolean;
  stripSpeakerLabels?: boolean;
  customFind?: string;
  customReplace?: string;
  caseSensitive?: boolean;
  removeEmpty?: boolean;
}

/**
 * Clean and format subtitle cue texts
 */
export function cleanSubtitleText(cues: SubtitleCue[], options: SubtitleCleaningOptions): SubtitleCue[] {
  return cues
    .map((cue) => {
      let clean = cue.text;

      // 1. Strip HTML tags (e.g. <i>, <b>, <u>, <font color="...">, </font>)
      if (options.stripTags) {
        clean = clean.replace(/<[^>]*>/g, '');
      }

      // 2. Strip bracketed sounds and ambient audio tags (e.g. [Music], (Applause), [Laughter], *cheers*)
      if (options.stripBracketedSounds) {
        clean = clean
          .replace(/\[[^\]]*\]/g, '')
          .replace(/\([^)]*\)/g, '')
          .replace(/【[^】]*】/g, '')
          .replace(/\*[^*]+\*/g, '');
      }

      // 3. Strip speaker labels (e.g. "SPEAKER 1:", "John:", "Host (Narrator):", "Interviewer:")
      if (options.stripSpeakerLabels) {
        clean = clean.replace(/^[A-Za-z0-9_\s()-]+:\s*/gm, '');
      }

      // 4. Custom Find & Replace
      if (options.customFind && options.customFind.length > 0) {
        try {
          const flags = options.caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(escapeRegExp(options.customFind), flags);
          clean = clean.replace(regex, options.customReplace || '');
        } catch {
          // fallback plain replace
          clean = clean.split(options.customFind).join(options.customReplace || '');
        }
      }

      return {
        ...cue,
        text: clean.replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim(),
      };
    })
    .filter((cue) => (options.removeEmpty !== false ? cue.text.length > 0 : true));
}

/**
 * Serialize subtitle cues into requested output format (SRT, WebVTT, ASS, TXT)
 */
export function serializeCues(cues: SubtitleCue[], format: SubtitleFormat): string {
  if (cues.length === 0) return '';

  if (format === 'vtt') {
    let out = 'WEBVTT - Generated by ConvertHub Universal Media Engine\n\n';
    cues.forEach((cue, index) => {
      out += `${index + 1}\n${msToVttTime(cue.startMs)} --> ${msToVttTime(cue.endMs)}\n${cue.text}\n\n`;
    });
    return out.trim();
  }

  if (format === 'ass') {
    let out = `[Script Info]
; Script generated by ConvertHub
Title: Converted Subtitles
ScriptType: v4.00+
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: None

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Arial,20,&H00FFFFFF,&H000000FF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,2,2,2,10,10,10,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    cues.forEach((cue) => {
      const assStart = msToAssTime(cue.startMs);
      const assEnd = msToAssTime(cue.endMs);
      const assText = cue.text.replace(/\n/g, '\\N');
      out += `Dialogue: 0,${assStart},${assEnd},Default,,0,0,0,,${assText}\n`;
    });

    return out.trim();
  }

  if (format === 'txt') {
    return cues.map((c) => c.text).join('\n\n');
  }

  // Default SRT (.srt)
  let out = '';
  cues.forEach((cue, index) => {
    out += `${index + 1}\n${msToSrtTime(cue.startMs)} --> ${msToSrtTime(cue.endMs)}\n${cue.text}\n\n`;
  });
  return out.trim();
}

// ----------------------------------------------------
// Time Helpers
// ----------------------------------------------------

export function parseTimeToMs(timeStr: string): number {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(',', '.');
  const parts = clean.split(':');

  if (parts.length === 3) {
    const [h, m, sWithMs] = parts;
    const [s, ms = '0'] = sWithMs.split('.');
    return (
      (parseInt(h, 10) * 3600 + parseInt(m, 10) * 60 + parseInt(s, 10)) * 1000 +
      Math.round(parseFloat(`0.${ms}`) * 1000)
    );
  }

  if (parts.length === 2) {
    const [m, sWithMs] = parts;
    const [s, ms = '0'] = sWithMs.split('.');
    return (
      (parseInt(m, 10) * 60 + parseInt(s, 10)) * 1000 +
      Math.round(parseFloat(`0.${ms}`) * 1000)
    );
  }

  const numeric = parseFloat(clean);
  return isNaN(numeric) ? 0 : Math.round(numeric * 1000);
}

export function parseAssTimeToMs(timeStr: string): number {
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;

  const h = parts.length === 3 ? parseInt(parts[0], 10) : 0;
  const m = parseInt(parts[parts.length - 2], 10);
  const sParts = parts[parts.length - 1].split('.');
  const s = parseInt(sParts[0], 10);
  const cs = parseInt(sParts[1] || '0', 10); // ASS uses centiseconds (hundredths)

  return (h * 3600 + m * 60 + s) * 1000 + cs * 10;
}

export function msToSrtTime(msTotal: number): string {
  const safeMs = Math.max(0, Math.round(msTotal));
  const h = Math.floor(safeMs / 3600000);
  const m = Math.floor((safeMs % 3600000) / 60000);
  const s = Math.floor((safeMs % 60000) / 1000);
  const ms = safeMs % 1000;
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)},${pad(ms, 3)}`;
}

export function msToVttTime(msTotal: number): string {
  return msToSrtTime(msTotal).replace(',', '.');
}

export function msToAssTime(msTotal: number): string {
  const safeMs = Math.max(0, Math.round(msTotal));
  const h = Math.floor(safeMs / 3600000);
  const m = Math.floor((safeMs % 3600000) / 60000);
  const s = Math.floor((safeMs % 60000) / 1000);
  const cs = Math.floor((safeMs % 1000) / 10); // centiseconds (2 digits)
  return `${h}:${pad(m, 2)}:${pad(s, 2)}.${pad(cs, 2)}`;
}

function pad(num: number, size: number = 2): string {
  return num.toString().padStart(size, '0');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitAssDialogue(content: string, fieldCount: number): string[] {
  const result: string[] = [];
  let remaining = content;

  for (let i = 0; i < fieldCount - 1; i++) {
    const commaIndex = remaining.indexOf(',');
    if (commaIndex === -1) {
      result.push(remaining.trim());
      remaining = '';
      break;
    }
    result.push(remaining.substring(0, commaIndex).trim());
    remaining = remaining.substring(commaIndex + 1);
  }

  if (remaining.length > 0 || result.length < fieldCount) {
    result.push(remaining.trim());
  }

  return result;
}
