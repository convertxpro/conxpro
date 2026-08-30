# SUB-PROMPT 09: Video Processing Engine — GIF to MP4 & Social Canvas Aspect Ratio Resizer

## 1. Context & Objective
Video conversion and social media format optimization represent major high-intent traffic categories:
- **GIF to MP4 / WebM:** Heavy animated GIFs (30MB–80MB) crash websites and consume excessive mobile bandwidth. Converting GIFs to H.264/WebM videos slashes file size by **90% to 95%** while retaining perfect 60fps smoothness and infinite looping.
- **Social Canvas & Aspect Ratio Resizer:** Content creators, marketers, and influencers constantly reformat horizontal 16:9 landscape videos into **9:16 Vertical** (for TikTok, Instagram Reels, YouTube Shorts), **1:1 Square**, or **4:5 Portrait** with stylish blurred background padding or custom brand backdrops.

Your objective in this sub-prompt is to build:
1. **Tool C3: High-Efficiency GIF ↔ MP4 / WebM Converter** (`gif-to-mp4`, `gif-to-webm`).
2. **Tool C4: Video Aspect Ratio & Social Canvas Resizer** (`video-aspect-ratio-resizer`).
3. Backend processing workers in `src/workers/media-worker.ts` and `src/lib/converters/media/ffmpeg-video.ts`.
4. Dedicated interactive components with HTML5 live preview players, aspect ratio preset toggles, and blur/color background pickers.

---

## 2. Technical Stack & Dependencies

- **Video Processing Pipeline:** `fluent-ffmpeg` and native FFmpeg binary (`libx264`, `libvpx-vp9`, `boxblur` filters)
- **Async Queue & Job Polling:** Redis + BullMQ (`src/workers/`)
- **Video Playback & UI:** HTML5 Video Player, Tailwind CSS, Lucide icons

Install dependencies:
```bash
npm install fluent-ffmpeg
npm install @types/fluent-ffmpeg --save-dev
```

---

## 3. Tool C3: High-Efficiency GIF ↔ MP4 / WebM Converter

### 3.1 FFmpeg GIF Conversion Engine (`src/lib/converters/media/gif-video-engine.ts`)
```typescript
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export interface GifToVideoOptions {
  targetFormat: 'mp4' | 'webm';
  qualityCrf?: number; // 18 - 28 (Default: 23)
  fps?: number; // Optional frame rate clamp
}

export function convertGifToVideo(
  inputPath: string,
  outputPath: string,
  options: GifToVideoOptions
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (options.targetFormat === 'mp4') {
      command = command
        .outputOptions([
          '-c:v libx264',
          '-pix_fmt yuv420p', // Critical for universal iOS and browser playback
          `-crf ${options.qualityCrf || 23}`,
          '-movflags +faststart', // Instant web streaming
          // Ensure even dimensions (H.264 requires width & height divisible by 2)
          '-vf pad=ceil(iw/2)*2:ceil(ih/2)*2',
          '-an', // Strip audio tracks (GIFs are silent)
        ]);
    } else if (options.targetFormat === 'webm') {
      command = command
        .outputOptions([
          '-c:v libvpx-vp9',
          `-crf ${options.qualityCrf || 30}`,
          '-b:v 0',
          '-pix_fmt yuv420p',
          '-an',
        ]);
    }

    command
      .save(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`GIF conversion failed: ${err.message}`)));
  });
}
```

---

## 4. Tool C4: Video Aspect Ratio & Social Canvas Resizer

### 4.1 Social Canvas FFmpeg Filter Graph Engine (`src/lib/converters/media/social-resizer.ts`)
```typescript
import ffmpeg from 'fluent-ffmpeg';

export type AspectRatioPreset = '9:16' | '16:9' | '1:1' | '4:5';
export type BackgroundStyle = 'blur' | 'black' | 'white' | 'color' | 'crop';

export interface SocialResizeOptions {
  preset: AspectRatioPreset;
  backgroundStyle: BackgroundStyle;
  customColorHex?: string; // e.g. '#1e293b'
}

export function getCanvasDimensions(preset: AspectRatioPreset): { targetWidth: number; targetHeight: number } {
  switch (preset) {
    case '9:16': // TikTok, Reels, Shorts
      return { targetWidth: 1080, targetHeight: 1920 };
    case '16:9': // YouTube, TV
      return { targetWidth: 1920, targetHeight: 1080 };
    case '1:1': // Square
      return { targetWidth: 1080, targetHeight: 1080 };
    case '4:5': // Instagram Portrait Post
      return { targetWidth: 1080, targetHeight: 1350 };
  }
}

export function resizeVideoForSocial(
  inputPath: string,
  outputPath: string,
  options: SocialResizeOptions,
  onProgress?: (percent: number) => void
): Promise<void> {
  const { targetWidth, targetHeight } = getCanvasDimensions(options.preset);

  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);

    if (options.backgroundStyle === 'crop') {
      // Scale and crop to fill entire frame without padding
      const filter = `scale=w=${targetWidth}:h=${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight}`;
      command = command.videoFilters(filter);
    } else if (options.backgroundStyle === 'blur') {
      // Blurred mirrored background filtergraph
      const filterComplex = [
        `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=increase,crop=${targetWidth}:${targetHeight},boxblur=25:25[bg]`,
        `[0:v]scale=${targetWidth}:${targetHeight}:force_original_aspect_ratio=decrease[fg]`,
        `[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]`,
      ].join(';');

      command = command
        .complexFilter(filterComplex, ['outv'])
        .outputOptions(['-map [outv]', '-map 0:a?']);
    } else {
      // Solid color letterbox / pillarbox padding
      const hex = options.customColorHex ? options.customColorHex.replace('#', '0x') : '0x000000';
      const filter = `scale=w=${targetWidth}:h=${targetHeight}:force_original_aspect_ratio=decrease,pad=${targetWidth}:${targetHeight}:(ow-iw)/2:(oh-ih)/2:color=${hex}`;
      command = command.videoFilters(filter);
    }

    command
      .outputOptions([
        '-c:v libx264',
        '-pix_fmt yuv420p',
        '-c:a aac',
        '-b:a 192k',
        '-movflags +faststart',
      ])
      .save(outputPath)
      .on('progress', (p) => {
        if (onProgress && p.percent) onProgress(Math.round(p.percent));
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Video resizing failed: ${err.message}`)));
  });
}
```

---

## 5. UI Components & Playback Workflow

### 5.1 Video Tools Canvas (`src/components/converters/media/VideoCanvasComponent.tsx`)
- **Interactive Social Preset Selector:**
  - 📱 **9:16 Vertical** (TikTok / Reels / Shorts)
  - 🖥️ **16:9 Landscape** (YouTube / Desktop)
  - 🔲 **1:1 Square** (Instagram Feed)
  - 🖼️ **4:5 Portrait** (Instagram Post)
- **Background Mode Selector:**
  - 🌟 **Blurred Mirror Background** (Smart TikTok styling)
  - ⬛ **Black Letterbox**
  - ⬜ **White Border**
  - 🎨 **Custom Hex Color Picker**
  - ✂️ **Center Crop (Fill Frame)**
- **Video Player Preview:** HTML5 `<video controls loop />` showing before/after results with one-click download trigger.

---

## 6. Programmatic SEO & Acceptance Criteria

Add FAQ schemas for:
- *"Why is MP4 smaller and faster to load than GIF on websites?"*
- *"How to convert a landscape 16:9 video to 9:16 for TikTok without cutting off edges?"*
- *"How does blurred background padding work for vertical videos?"*

### Acceptance Checklist:
- [ ] GIF to MP4 converter produces H.264 videos with even dimensions (`pad=ceil(iw/2)*2:ceil(ih/2)*2`) and `-movflags +faststart`.
- [ ] Converted MP4s achieve 90%+ file size reduction compared to original GIF.
- [ ] Video resizer accurately builds blurred background filter graphs across 9:16, 16:9, 1:1, and 4:5 presets.
- [ ] Output videos playback smoothly in Safari, Chrome, and iOS mobile devices.
