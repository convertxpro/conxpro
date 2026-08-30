# SUB-PROMPT 10: Rich Media Engine — Subtitles Converter, Audio Speed Modulator & Audio Joiner Suite

## 1. Context & Objective
Digital creators, podcasters, video editors, and language learners frequently require fast media transformation utilities:
- **Subtitles Converter & Time-Shifter:** Converting between **SRT, WebVTT, ASS/SSA, and TXT transcripts**, with the ability to offset all timestamps forward or backward by $\pm X$ milliseconds to fix out-of-sync audio, strip sound effect brackets (`[Applause]`, `[Music]`), and search/replace text.
- **Audio Speed & Pitch Modulator:** Changing audio playback speed (0.5x to 2.5x) while **preserving natural voice pitch** (preventing chipmunk or demon distortion) or shifting musical semitones (-12 to +12) for musicians and karaoke practice.
- **Multi-Track Audio Joiner & Merger:** Merging multiple MP3, WAV, M4A, or FLAC audio files with drag-and-drop ordering and smooth crossfade transitions into a single master audio track.

Your objective in this sub-prompt is to build:
1. **Tool C5: Universal Subtitles Converter & Time-Shifter** (`subtitle-converter`).
2. **Tool C6: Audio Speed & Pitch Modulator** (`audio-speed-pitch-changer`).
3. **Tool C7: Multi-Track Audio Joiner & Merger** (`audio-joiner`).
4. Wire backend FFmpeg filter graphs and client-side Web Audio API players into `src/components/converters/media/` and `ConverterCanvas.tsx`.

---

## 2. Technical Stack & Dependencies

- **Subtitle Parsing & Formatting:** `subtitle` or custom regex parser for SRT/VTT/ASS
- **Audio Processing Engine:** `fluent-ffmpeg` with `atempo`, `asetrate`, `acrossfade`, and `concat` filter graphs
- **Browser Audio Preview:** Native Web Audio API (`AudioContext`)
- **Drag-and-Drop Ordering:** `@hello-pangea/dnd` or HTML5 drag-and-drop

Install dependencies:
```bash
npm install subtitle @hello-pangea/dnd
```

---

## 3. Tool C5: Universal Subtitles Converter & Time-Shifter

### 3.1 Subtitle Parsing & Shifting Engine (`src/lib/converters/media/subtitles-engine.ts`)
```typescript
export interface SubtitleCue {
  id?: string;
  startMs: number;
  endMs: number;
  text: string;
}

export type SubtitleFormat = 'srt' | 'vtt' | 'ass' | 'txt';

export function parseSrt(srtContent: string): SubtitleCue[] {
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const blocks = normalized.split(/\n\n+/);
  const cues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block.split('\n');
    if (lines.length < 2) continue;

    let timeLineIdx = lines[0].includes('-->') ? 0 : 1;
    if (!lines[timeLineIdx] || !lines[timeLineIdx].includes('-->')) continue;

    const [startStr, endStr] = lines[timeLineIdx].split('-->').map(s => s.trim());
    const textLines = lines.slice(timeLineIdx + 1);

    cues.push({
      startMs: srtTimeToMs(startStr),
      endMs: srtTimeToMs(endStr),
      text: textLines.join('\n'),
    });
  }

  return cues;
}

export function shiftSubtitleTimestamps(cues: SubtitleCue[], offsetMs: number): SubtitleCue[] {
  return cues.map(cue => ({
    ...cue,
    startMs: Math.max(0, cue.startMs + offsetMs),
    endMs: Math.max(0, cue.endMs + offsetMs),
  }));
}

export function cleanSubtitleText(cues: SubtitleCue[], options: { stripTags: boolean; stripBracketedSounds: boolean }): SubtitleCue[] {
  return cues.map(cue => {
    let clean = cue.text;
    if (options.stripTags) {
      clean = clean.replace(/<[^>]*>/g, ''); // Removes <i>, <b>, <font>
    }
    if (options.stripBracketedSounds) {
      clean = clean.replace(/\[[^\]]*\]/g, '').replace(/\([^)]*\)/g, ''); // Removes [Music], (Applause)
    }
    return {
      ...cue,
      text: clean.trim(),
    };
  }).filter(cue => cue.text.length > 0);
}

export function serializeCues(cues: SubtitleCue[], format: SubtitleFormat): string {
  if (format === 'vtt') {
    let out = 'WEBVTT\n\n';
    cues.forEach((c, i) => {
      out += `${i + 1}\n${msToVttTime(c.startMs)} --> ${msToVttTime(c.endMs)}\n${c.text}\n\n`;
    });
    return out.trim();
  }

  if (format === 'txt') {
    return cues.map(c => c.text).join('\n\n');
  }

  // Default SRT
  let out = '';
  cues.forEach((c, i) => {
    out += `${i + 1}\n${msToSrtTime(c.startMs)} --> ${msToSrtTime(c.endMs)}\n${c.text}\n\n`;
  });
  return out.trim();
}

function srtTimeToMs(time: string): number {
  const [hms, ms] = time.replace(',', '.').split('.');
  const [h, m, s] = hms.split(':').map(Number);
  return (h * 3600 + m * 60 + s) * 1000 + (Number(ms) || 0);
}

function msToSrtTime(msTotal: number): string {
  const h = Math.floor(msTotal / 3600000);
  const m = Math.floor((msTotal % 3600000) / 60000);
  const s = Math.floor((msTotal % 60000) / 1000);
  const ms = msTotal % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`;
}

function msToVttTime(msTotal: number): string {
  return msToSrtTime(msTotal).replace(',', '.');
}

function pad(n: number, z: number = 2): string {
  return n.toString().padStart(z, '0');
}
```

---

## 4. Tool C6: Audio Speed & Pitch Modulator

### 4.1 FFmpeg Audio Modulator Engine (`src/lib/converters/media/audio-speed-engine.ts`)
```typescript
import ffmpeg from 'fluent-ffmpeg';

export interface AudioSpeedOptions {
  speedMultiplier: number; // 0.5 to 2.5
  preservePitch: boolean;  // True = natural voice, False = vinyl / chipmunk effect
  pitchSemitones?: number; // -12 to +12 semitones
}

export function modulateAudioSpeed(
  inputPath: string,
  outputPath: string,
  options: AudioSpeedOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);
    const audioFilters: string[] = [];

    if (options.preservePitch) {
      // Use chained atempo filters (each atempo filter accepts 0.5 to 2.0)
      let remainingSpeed = options.speedMultiplier;
      while (remainingSpeed > 2.0) {
        audioFilters.push('atempo=2.0');
        remainingSpeed /= 2.0;
      }
      while (remainingSpeed < 0.5) {
        audioFilters.push('atempo=0.5');
        remainingSpeed /= 0.5;
      }
      audioFilters.push(`atempo=${remainingSpeed.toFixed(4)}`);
    } else if (options.pitchSemitones) {
      // Pitch shifting via asetrate & rubberband / asetrate + atempo
      const pitchRatio = Math.pow(2, options.pitchSemitones / 12);
      audioFilters.push(`asetrate=44100*${pitchRatio.toFixed(4)},aresample=44100,atempo=${(1 / pitchRatio).toFixed(4)}`);
    }

    command
      .audioFilters(audioFilters)
      .outputOptions(['-c:a libmp3lame', '-b:a 320k'])
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Audio modulation failed: ${err.message}`)));
  });
}
```

---

## 5. Tool C7: Multi-Track Audio Joiner & Merger

### 5.1 FFmpeg Audio Concat Engine (`src/lib/converters/media/audio-joiner-engine.ts`)
```typescript
import ffmpeg from 'fluent-ffmpeg';

export interface AudioJoinerOptions {
  crossfadeDurationSec?: number; // 0 to 5 seconds
  targetFormat: 'mp3' | 'wav';
}

export function mergeAudioTracks(
  inputPaths: string[],
  outputPath: string,
  options: AudioJoinerOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (inputPaths.length < 2) {
      return reject(new Error('At least 2 audio tracks are required to merge.'));
    }

    let command = ffmpeg();
    inputPaths.forEach(p => command.input(p));

    const crossfade = options.crossfadeDurationSec || 0;

    if (crossfade > 0 && inputPaths.length === 2) {
      // 2-track acrossfade filter graph
      command = command.complexFilter([
        `[0:a][1:a]acrossfade=d=${crossfade}:c1=tri:c2=tri[outa]`,
      ], ['outa']);
    } else {
      // Standard concat filter graph
      const filterInputs = inputPaths.map((_, i) => `[${i}:a]`).join('');
      command = command.complexFilter([
        `${filterInputs}concat=n=${inputPaths.length}:v=0:a=1[outa]`,
      ], ['outa']);
    }

    if (options.targetFormat === 'wav') {
      command = command.outputOptions(['-c:a pcm_s16le']);
    } else {
      command = command.outputOptions(['-c:a libmp3lame', '-b:a 320k']);
    }

    command
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Audio merge failed: ${err.message}`)));
  });
}
```

---

## 6. UI Components & Playback Workflow

### 6.1 Subtitles Canvas UI (`src/components/converters/media/SubtitleConverterComponent.tsx`)
- **Dual Format Switcher:** Convert between `.srt`, `.vtt`, `.ass`, `.txt`.
- **Timestamp Offset Bar:** Shift all timestamps by $+500\text{ms}$, $-1.2\text{s}$, or custom milliseconds.
- **Cleaning Filters:** Toggles to strip HTML tags (`<i>`, `<b>`) and remove `[Music]` or speaker labels.
- **Transcript Search & Replace Editor:** Live editable textarea with find & replace toolbar.

### 6.2 Audio Canvas UI (`src/components/converters/media/AudioModulatorCanvas.tsx`)
- **Speed Slider:** 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 1.75x, 2.0x, 2.5x with "Preserve Voice Pitch" lock.
- **Musical Semitone Stepper:** -12 to +12 semitones.
- **Multi-Track Drag & Drop Organizer:** Reorder songs/voice recordings with visual drag handles and crossfade transition slider (0–5 seconds).

---

## 7. Acceptance Criteria & Verification Checklist

- [ ] Subtitle engine accurately shifts timestamps and converts between SRT, VTT, and TXT without desynchronization.
- [ ] HTML tag and bracket removal cleanly purges formatting while keeping speech text intact.
- [ ] Audio speed changer accelerates/decelerates audio without altering vocal pitch when pitch-lock is enabled.
- [ ] Audio joiner concatenates multiple MP3/WAV tracks in order with optional crossfade transitions.
- [ ] Output audio files export in crisp 320kbps MP3 or lossless WAV format.
