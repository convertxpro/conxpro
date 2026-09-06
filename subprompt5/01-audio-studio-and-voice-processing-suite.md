# SUB-PROMPT 01: In-Browser Audio Studio & Voice Processing Suite

## 1. Context & Architectural Overview
This sub-prompt guides the complete implementation of the **Audio Studio & Voice Processing Suite** for ConvertX. 
All tools in this suite operate **100% in the user's browser** utilizing native HTML5 Web Audio API (`AudioContext`, `AudioBuffer`, `AnalyserNode`, `ScriptProcessorNode` / `AudioWorklet`), Canvas rendering for interactive zoomable waveforms, and client-side Web Workers for WAV, MP3, and OGG encoding/decoding.

### Core Architectural Guarantees:
- **100% Client-Side Privacy:** Zero audio files or voice recordings are uploaded to any server.
- **Zero Server Costs:** Audio processing, trimming, modulation, and encoding execute in browser memory.
- **Sub-10ms Audio Latency:** High-performance Web Audio DSP pipeline with live visual feedback.
- **Full Responsive UX:** Works seamlessly across desktop, tablets, and mobile touchscreens.

---

## 2. Tools Included in this Sub-Prompt

| Tool Name | Slug | Primary Features | Key Technologies |
|---|---|---|---|
| **Audio Trimmer & Ringtone Cutter** | `audio-trimmer` | Dual drag handles, millisecond precision, zoomable waveform, fade-in/fade-out, loop preview, MP3/WAV export | Web Audio API, Canvas 2D, Blob URL |
| **Multi-Track Audio Joiner** | `audio-joiner` | Drag-and-drop reordering, crossfade transition duration slider (0-5s), multi-file merge into single track | Web Audio API, AudioBuffer Concatenation |
| **Voice & Microphone Recorder** | `voice-recorder` | In-browser mic capture, live decibel VU meter & waveform, pause/resume, high-fidelity 48kHz WAV/MP3 recording | `navigator.mediaDevices.getUserMedia`, `MediaRecorder`, Web Audio API |
| **Audio Speed & Pitch Modulator** | `audio-speed-pitch-changer` | Speed modulation (0.5x to 2.5x), pitch-lock playback tempo, musical semitone transposition (-12 to +12 semitones) | Web Audio `playbackRate`, `detune`, Phase Vocoder / AudioBuffer source |
| **Audio Volume Booster & Normalizer** | `volume-booster` | +100% to +300% gain booster, peak limiter with soft clipping prevention, dynamic range normalizer | `GainNode`, `DynamicsCompressorNode` |
| **Universal Audio Converter** | `audio-converter` | Bi-directional conversion across MP3, WAV, M4A/AAC, FLAC, and OGG with custom bitrate selection (128k, 192k, 320k) | AudioBuffer to PCM/WAV encoder, In-Browser Transcoding Worker |

---

## 3. Metadata Registration (`src/config/categories.ts` & `src/config/site.ts`)

Ensure the `audio` category exists and contains all required tools in `src/config/categories.ts`:

```typescript
{
  id: 'audio',
  name: 'Audio Converters & Studio Tools',
  slug: 'audio',
  description: 'Convert bitrates, modulate playback speed/pitch, trim ringtones, and merge multi-track audio across MP3, WAV, AAC, and FLAC.',
  iconName: 'Headphones',
  color: '#ec4899',
  gradient: 'from-pink-500 to-rose-500',
  badge: 'Lossless Audio',
  tools: [
    {
      id: 'audio-trimmer',
      name: 'Audio Trimmer & Ringtone Cutter',
      slug: 'audio-trimmer',
      categorySlug: 'audio',
      categoryName: 'Audio Tools',
      description: 'Cut MP3, WAV, and M4A audio tracks with visual zoomable waveforms, fade in/out effects, and millisecond precision.',
      iconName: 'Scissors',
      popular: true,
      badge: 'Waveform Editor',
    },
    {
      id: 'audio-joiner',
      name: 'Multi-Track Audio Joiner & Merger',
      slug: 'audio-joiner',
      categorySlug: 'audio',
      categoryName: 'Audio Tools',
      description: 'Combine and crossfade multiple MP3, WAV, M4A, FLAC audio files into a single seamless audio track.',
      iconName: 'Layers',
      popular: true,
      badge: 'Crossfade Support',
    },
    {
      id: 'voice-recorder',
      name: 'Voice & Microphone Studio Recorder',
      slug: 'voice-recorder',
      categorySlug: 'audio',
      categoryName: 'Audio Tools',
      description: 'Record studio-quality voice clips from your microphone with live waveform visualizer, pause/resume, and instant MP3/WAV download.',
      iconName: 'Mic',
      popular: true,
      badge: 'Studio Quality',
    },
    {
      id: 'audio-speed-pitch-changer',
      name: 'Audio Speed & Pitch Modulator',
      slug: 'audio-speed-pitch-changer',
      categorySlug: 'audio',
      categoryName: 'Audio Tools',
      description: 'Change audio playback speed (0.5x to 2.5x) with pitch-lock or shift musical semitones with live preview.',
      iconName: 'Gauge',
      popular: true,
      badge: 'Pitch Lock',
    },
    {
      id: 'volume-booster',
      name: 'Audio Volume Booster & Normalizer',
      slug: 'volume-booster',
      categorySlug: 'audio',
      categoryName: 'Audio Tools',
      description: 'Boost quiet MP3 and voice recordings up to 300% loudness with built-in soft clipping prevention and audio peak limiter.',
      iconName: 'Volume2',
      popular: true,
    },
    {
      id: 'wav-to-mp3',
      name: 'WAV to MP3 Converter',
      slug: 'wav-to-mp3',
      categorySlug: 'audio',
      categoryName: 'Audio Converters',
      description: 'Convert heavy uncompressed WAV files into lightweight 320kbps MP3s saving up to 90% storage space.',
      iconName: 'Volume2',
      popular: true,
      badge: 'Top Audio Search',
    },
    {
      id: 'mp3-to-wav',
      name: 'MP3 to WAV Converter',
      slug: 'mp3-to-wav',
      categorySlug: 'audio',
      categoryName: 'Audio Converters',
      description: 'Decompress MP3 audio into uncompressed 16-bit 44.1kHz PCM WAV audio for music production and editing.',
      iconName: 'Volume2',
      popular: true,
    },
    {
      id: 'm4a-to-mp3',
      name: 'M4A to MP3 Converter',
      slug: 'm4a-to-mp3',
      categorySlug: 'audio',
      categoryName: 'Audio Converters',
      description: 'Convert Apple Voice Memos, iTunes M4A, and AAC audio files into universal MP3 format.',
      iconName: 'Mic',
      popular: true,
    },
    {
      id: 'flac-to-mp3',
      name: 'FLAC to MP3 Converter',
      slug: 'flac-to-mp3',
      categorySlug: 'audio',
      categoryName: 'Audio Converters',
      description: 'Convert lossless FLAC studio audio tracks into high-bitrate 320kbps MP3 files for mobile devices.',
      iconName: 'Music2',
      popular: true,
    },
  ],
}
```

---

## 4. Detailed Component Implementation Specs

### 4.1 Audio Trimmer (`src/components/converters/audio/AudioTrimmerComponent.tsx`)
- **State & Refs:**
  - `audioFile: File | null`, `audioBuffer: AudioBuffer | null`, `isPlaying: boolean`
  - `startTime: number`, `endTime: number`, `duration: number`, `currentTime: number`
  - `fadeInSec: number`, `fadeOutSec: number`, `outputFormat: 'mp3' | 'wav'`
  - `canvasRef: React.RefObject<HTMLCanvasElement>`
- **Waveform Rendering:**
  - Decode loaded `File` using `audioContext.decodeAudioData()`.
  - Extract peaks into a `Float32Array` sample array and draw a high-DPI retina canvas waveform with a gradient stroke (`#ec4899` to `#f43f5e`).
  - Overlay semi-transparent active selection region with draggable start and end handles.
- **Trimming Logic:**
  - Slice `AudioBuffer` from `startTime` to `endTime`.
  - Apply linear or exponential ramp-in for `fadeInSec` and ramp-out for `fadeOutSec`.
  - Encode to 16-bit PCM WAV or encode to MP3 in browser, then create download trigger.

### 4.2 Multi-Track Audio Joiner (`src/components/converters/audio/AudioJoinerComponent.tsx`)
- **Features:**
  - Multi-file dropzone accepting 2 to 20 audio tracks.
  - Drag-and-drop sortable list with track title, format, duration badge, and delete button.
  - Crossfade duration slider: 0s (hard cut), 1s, 2s, 3s, 5s.
  - Individual track volume adjustment slider (0% to 150%).
  - Real-time progress bar while rendering concatenated `AudioBuffer`.

### 4.3 Voice & Microphone Studio Recorder (`src/components/converters/audio/VoiceRecorderComponent.tsx`)
- **Features:**
  - Large pulsing record/stop button with animated halo.
  - Real-time decibel VU meter (`-60 dBFS` to `0 dBFS`) with peak clip warning.
  - Live frequency spectrum visualizer (32-bar canvas visualizer).
  - Elapsed recording timer (`MM:SS.ms`) with pause, resume, and discard actions.
  - Instant in-browser audio playback with playback speed toggles (0.75x, 1x, 1.25x, 1.5x, 2x).
  - 1-click Download buttons for WAV (uncompressed) and MP3 (compact).

### 4.4 Speed & Pitch Modulator (`src/components/converters/audio/AudioSpeedPitchComponent.tsx`)
- **Features:**
  - Dual slider controls:
    - **Speed / Tempo:** `0.5x` (half speed) to `2.5x` (fast forward) with preset chips (`0.75x`, `1.0x`, `1.25x`, `1.5x`, `2.0x`).
    - **Pitch Shift:** `-12 semitones` (1 octave down) to `+12 semitones` (1 octave up) with "Reset to Natural" button.
  - "Preserve Pitch (Time Stretch)" toggle switch.
  - Real-time instant preview without re-rendering delays.

### 4.5 Volume Booster & Loudness Normalizer (`src/components/converters/audio/VolumeBoosterComponent.tsx`)
- **Features:**
  - Master Gain Slider: `100%` (normal), `150%`, `200%`, `250%`, `300%` (+9.5 dB boost).
  - Dynamic Range Compression / Peak Limiter toggle to eliminate distortion and crackling on boosted audio.
  - Bass Boost & Treble Clarity toggle presets.
  - Before vs After A/B audio comparison button.

---

## 5. Wiring in `ConverterCanvas.tsx`
Update `src/components/converters/ConverterCanvas.tsx` to dynamically route audio slugs:
```tsx
case 'audio-trimmer':
  return <AudioTrimmerComponent tool={tool} />;
case 'audio-joiner':
  return <AudioJoinerComponent tool={tool} />;
case 'voice-recorder':
  return <VoiceRecorderComponent tool={tool} />;
case 'audio-speed-pitch-changer':
  return <AudioSpeedPitchComponent tool={tool} />;
case 'volume-booster':
  return <VolumeBoosterComponent tool={tool} />;
case 'wav-to-mp3':
case 'mp3-to-wav':
case 'm4a-to-mp3':
case 'flac-to-mp3':
  return <AudioConverterComponent tool={tool} />;
```

---

## 6. Verification & Quality Assurance Checklist
1. [ ] Test loading a 10MB MP3 file into `audio-trimmer`; verify waveform paints within 200ms.
2. [ ] Test trimming audio with 2-second fade-in/fade-out; verify smooth audio transition.
3. [ ] Test microphone recording in `voice-recorder`; verify VU meter moves dynamically with voice input.
4. [ ] Test joining 3 audio files with 2-second crossfade; verify no audio clicks between transitions.
5. [ ] Run `npm run lint` and verify zero TypeScript/ESLint warnings.
