# SUB-PROMPT 02: Video Creator, Social Media Resizer & Subtitle Suite

## 1. Context & Architectural Overview
This sub-prompt covers the implementation of the **Video Creator, Social Media Resizer & Subtitle Suite** in ConvertX.
Modern video processing requires client-side responsiveness, high-speed clipping, social canvas aspect ratio adjustments, and subtitle synchronization.

All tools in this suite operate client-side leveraging native HTML5 `<video>`, Canvas 2D frame manipulation, Web Codecs, and lightweight WebAssembly FFmpeg routines with hardware-accelerated rendering.

### Core Architectural Guarantees:
- **Zero Cloud Uploads:** User video clips, screen captures, and sensitive recordings remain 100% on the user's local machine.
- **Social Media Native Presets:** Instant 1-click aspect ratio framing for TikTok / Instagram Reels / YouTube Shorts (`9:16`), YouTube (`16:9`), and Square (`1:1`).
- **Platform Compression Presets:** Dedicated output targets for Discord Free (8MB limit), Discord Nitro (25MB limit), and WhatsApp (16MB faststart).
- **Sub-Millisecond Subtitle Alignment:** Live subtitle preview with customizable font styling, positioning, and millisecond time shifting.

---

## 2. Tools Included in this Sub-Prompt

| Tool Name | Slug | Primary Capabilities | Technical Approach |
|---|---|---|---|
| **Video to GIF Maker** | `video-to-gif` | Convert MP4/WebM clips to high-framerate GIFs, custom FPS (10-30), crop region, 2-pass color quantization | Canvas 2D, gifshot / omggif, Blob URL |
| **GIF to MP4 / WebM** | `gif-to-mp4` | Convert heavy animated GIFs into smooth, lightweight looping MP4/WebM videos with 90%+ size reduction | In-browser video rendering / WebM encoder |
| **Video Aspect Ratio & Social Canvas Resizer** | `video-aspect-ratio-resizer` | Frame videos for 9:16 (Reels/TikTok), 16:9 (YouTube), 1:1 (Instagram), 4:5 with blurred video background padding | Canvas 2D stack with CSS backdrop blur & video loop |
| **Smart Video Compressor** | `compress-video` | Compress videos to targeted file size limits with two-pass bitrate optimization & resolution scaling | Web Codecs / FFmpeg WASM / HTML5 Canvas |
| **Universal Subtitle Converter & Time-Shifter** | `subtitle-converter` | Parse, edit, time-shift (+/- ms), and convert across SRT, WebVTT, ASS, and SSA subtitle formats | Regex text parser, Millisecond timestamp math |
| **Hardcode Subtitles to Video** | `burn-subtitles-to-video` | Burn SRT/VTT captions permanently into video frames with font family, size, color, outline, and position styling | Canvas subtitle overlay & MediaRecorder |
| **Screen & Webcam In-Browser Recorder** | `screen-recorder` | Capture full screen, window, or browser tab with mic + system audio, countdown timer, webcam PiP, and MP4/WebM export | `navigator.mediaDevices.getDisplayMedia`, WebRTC |
| **Lossless Video Muter & Audio Replacer** | `mute-video-replace-audio` | Remove audio tracks or replace background music in under 2 seconds without re-encoding video frames | MP4Box.js / Stream Demuxing |

---

## 3. Metadata Registration (`src/config/categories.ts`)

Ensure the `video` category contains the following tools in `src/config/categories.ts`:

```typescript
{
  id: 'video',
  name: 'Video Converters & Tools',
  slug: 'video',
  description: 'Transcode, compress, resize canvas aspect ratios, and convert GIFs with high-speed native FFmpeg processing.',
  iconName: 'Video',
  color: '#f59e0b',
  gradient: 'from-amber-500 to-orange-500',
  badge: 'FFmpeg Accelerated',
  tools: [
    {
      id: 'video-to-gif',
      name: 'Video to GIF Maker',
      slug: 'video-to-gif',
      categorySlug: 'video',
      categoryName: 'Video Converters',
      description: 'Convert MP4, MOV, and WebM video clips into high-framerate animated GIFs with lanczos 2-pass color palettes.',
      iconName: 'Film',
      popular: true,
      badge: 'HQ Palette',
    },
    {
      id: 'gif-to-mp4',
      name: 'GIF to MP4 / WebM Converter',
      slug: 'gif-to-mp4',
      categorySlug: 'video',
      categoryName: 'Video Converters',
      description: 'Convert heavy animated GIFs into smooth, lightweight looping MP4 and WebM videos with 90%+ file size reduction.',
      iconName: 'Video',
      popular: true,
      badge: '90% Size Reduction',
    },
    {
      id: 'video-aspect-ratio-resizer',
      name: 'Video Aspect Ratio & Social Canvas Resizer',
      slug: 'video-aspect-ratio-resizer',
      categorySlug: 'video',
      categoryName: 'Video Converters',
      description: 'Resize videos to 9:16 (TikTok, Reels, Shorts), 16:9 (YouTube), and 1:1 with intelligent blurred backgrounds.',
      iconName: 'Maximize2',
      popular: true,
      badge: 'Social Presets',
    },
    {
      id: 'compress-video',
      name: 'Video Compressor & Bitrate Optimizer',
      slug: 'compress-video',
      categorySlug: 'video',
      categoryName: 'Video Converters',
      description: 'Reduce large video files for Discord (8MB/25MB), WhatsApp (16MB), and email without visible quality loss.',
      iconName: 'Minimize2',
      popular: true,
      badge: 'Discord & WhatsApp',
    },
    {
      id: 'subtitle-converter',
      name: 'Universal Subtitles Converter & Time-Shifter',
      slug: 'subtitle-converter',
      categorySlug: 'video',
      categoryName: 'Media Tools',
      description: 'Convert SRT, WebVTT, ASS, SubViewer subtitles, offset timestamps in milliseconds, and clean formatting tags.',
      iconName: 'Subtitles',
      popular: true,
      badge: 'Time-Shift Sync',
    },
    {
      id: 'burn-subtitles-to-video',
      name: 'Hardcode Subtitles to Video',
      slug: 'burn-subtitles-to-video',
      categorySlug: 'video',
      categoryName: 'Video Converters',
      description: 'Burn SRT and VTT subtitles permanently into video frames with custom fonts, colors, and styles for TikTok, Reels, and Shorts.',
      iconName: 'Captions',
      popular: true,
      badge: 'Reels / TikTok',
    },
    {
      id: 'screen-recorder',
      name: 'Screen & Webcam Studio Recorder',
      slug: 'screen-recorder',
      categorySlug: 'video',
      categoryName: 'Video Converters',
      description: 'Record your screen, browser tabs, or webcam with audio directly in browser memory and export to MP4 or GIF.',
      iconName: 'Video',
      popular: true,
      badge: 'No Install Needed',
    },
    {
      id: 'mute-video-replace-audio',
      name: 'Lossless Video Muter & Audio Replacer',
      slug: 'mute-video-replace-audio',
      categorySlug: 'video',
      categoryName: 'Video Converters',
      description: 'Instantly remove audio or replace background music in MP4/MOV videos in under 2 seconds without re-encoding video streams.',
      iconName: 'VolumeX',
      popular: true,
      badge: 'Ultra Fast',
    },
  ],
}
```

---

## 4. Component Implementation Architecture

### 4.1 Video to GIF Maker (`src/components/converters/video/VideoToGifComponent.tsx`)
- **Key Features:**
  - Video preview scrubber with start/end trim handles.
  - FPS selector: `10 FPS` (lightweight), `15 FPS` (standard), `24 FPS` (cinematic), `30 FPS` (ultra smooth).
  - Width slider: `320px`, `480px`, `640px`, `Original`.
  - Loop count: Infinite loop vs 1-time play.
  - Live GIF preview with calculated output file size indicator.

### 4.2 Social Canvas Resizer (`src/components/converters/video/VideoResizerComponent.tsx`)
- **Aspect Ratio Presets:**
  - `9:16` (TikTok, Instagram Reels, YouTube Shorts)
  - `16:9` (YouTube, Landscape Video)
  - `1:1` (Instagram Square Post)
  - `4:5` (Instagram Portrait Feed)
- **Background Styling:**
  - **Blurred Video Background:** Dual canvas stack where background video is scaled, mirrored, and blurred (`blur(25px)`).
  - **Solid Color / Gradient:** Custom HEX color picker or aesthetic dark gradients.
  - **Fit / Fill / Stretch** toggle controls.

### 4.3 Universal Subtitle Converter & Time-Shifter (`src/components/converters/video/SubtitleConverterComponent.tsx`)
- **Parser Engine:**
  - Robust regex parser parsing SRT (`00:01:23,456 --> 00:01:25,789`), WebVTT (`00:01:23.456 --> 00:01:25.789`), and ASS/SSA script dialogue lines.
- **Time Shift Controls:**
  - Offset input: `+500ms`, `-500ms`, `+1000ms`, `-1000ms`, or custom milliseconds.
  - Real-time line-by-line preview table showing original vs shifted timestamp.
  - 1-click conversion between `.srt`, `.vtt`, and `.ass` format downloads.

### 4.4 Screen & Webcam Studio Recorder (`src/components/converters/video/ScreenRecorderComponent.tsx`)
- **Sources Supported:**
  - Entire Screen / Window / Chrome Tab.
  - Webcam Picture-in-Picture (PiP) circular or rounded rectangle overlay in corner.
  - Microphone audio + System tab audio mixing.
- **Controls:**
  - 3-second animated countdown overlay before recording begins.
  - Floating pause, resume, and stop toolbar.
  - Instant in-browser player with video trimmer and MP4 / GIF export options.

---

## 5. Wiring in `ConverterCanvas.tsx`
Connect all video slugs inside `src/components/converters/ConverterCanvas.tsx`:
```tsx
case 'video-to-gif':
  return <VideoToGifComponent tool={tool} />;
case 'gif-to-mp4':
  return <GifToVideoComponent tool={tool} />;
case 'video-aspect-ratio-resizer':
  return <VideoResizerComponent tool={tool} />;
case 'compress-video':
case 'compress-video-for-discord':
case 'compress-video-for-whatsapp':
  return <VideoCompressorComponent tool={tool} />;
case 'subtitle-converter':
  return <SubtitleConverterComponent tool={tool} />;
case 'burn-subtitles-to-video':
  return <BurnSubtitlesComponent tool={tool} />;
case 'screen-recorder':
  return <ScreenRecorderComponent tool={tool} />;
case 'mute-video-replace-audio':
  return <VideoAudioMuterComponent tool={tool} />;
```

---

## 6. Verification & Quality Assurance Checklist
1. [ ] Test loading a 15-second MP4 into `video-to-gif`; verify animated GIF generates with crisp color fidelity.
2. [ ] Test resizing a 16:9 video to 9:16 in `video-aspect-ratio-resizer`; verify blurred background renders without tearing.
3. [ ] Test uploading an SRT file with a `+1500ms` offset in `subtitle-converter`; verify every timestamp is shifted accurately.
4. [ ] Test recording a 5-second screen recording in `screen-recorder`; verify video playback works and download triggers properly.
5. [ ] Run `npm run lint` and verify zero errors.
