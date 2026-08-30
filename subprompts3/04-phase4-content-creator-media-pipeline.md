# SUB-PROMPT 04: Content Creator Media Pipeline (Phase 4)

## 1. Context & Objective
This sub-prompt guides the complete implementation of **Phase 4** from [`ConvertHub-NextGen-Master-Prompt.md`](file:///c:/My%20Drive/My%20Drive/ConvertX/ConvertHub-NextGen-Master-Prompt.md).
This phase integrates creator-focused media capabilities into both the BullMQ worker pipeline (`src/workers/start-worker.ts`) and client-side canvas engines.

---

## 2. Tools in Scope

1. **Tool 4.1: Video Subtitle Hardcoder & Burn-in Engine (`burn-subtitles-to-video`)**
   - Burns `.srt`, `.vtt`, or `.ass` subtitles directly into MP4/WebM video frames using FFmpeg's `subtitles` filter graph.
   - Styling presets for TikTok, YouTube Shorts, and Instagram Reels:
     - **Viral Reels:** Bold yellow/white font with heavy black stroke and bottom margin offset.
     - **Cinematic:** Classic serif font with translucent black box.
     - **Minimalist:** Clean sans-serif with subtle drop shadow.
   - Custom font size slider, margin vertical position, and real-time video preview.
2. **Tool 4.2: Lossless Video Muter & Audio Stream Replacer (`mute-video-replace-audio`)**
   - Mode A: **Instant Lossless Mute:** Strips audio tracks using `-c:v copy -an` without re-encoding video. (Processes 4K videos in under 2 seconds).
   - Mode B: **Audio Stream Replacer:** Merges new background audio track (`.mp3`/`.wav`) with `-c:v copy -c:a aac -shortest` to eliminate video rendering time.
3. **Tool 4.3: Batch Image Watermarking Engine (`batch-watermark-images`)**
   - Multi-threaded Web Worker / Canvas batch watermarker handling up to 50+ images at once.
   - Modes: **Text Watermark** (custom font, color, opacity, rotation angle) and **Logo Watermark** (transparent PNG).
   - 9-Point Anchor Grid (Top-Left, Center, Bottom-Right, etc.) or Full Tiled Diagonal Watermark.
   - Bundles all watermarked outputs into a single downloadable `.zip` file.

---

## 3. Metadata Registration (`src/config/categories.ts`)

Add the following tool metadata entries under `video` and `image` categories:

```typescript
// Add to video & image categories in src/config/categories.ts:
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
{
  id: 'batch-watermark-images',
  name: 'Batch Image Watermarker',
  slug: 'batch-watermark-images',
  categorySlug: 'image',
  categoryName: 'Image Converters',
  description: 'Apply text or logo watermarks to 50+ photos simultaneously with customizable opacity, rotation, and position grid in your browser.',
  iconName: 'Stamp',
  popular: true,
  badge: 'Batch (50+ files)',
},
```

---

## 4. Component Construction & Worker Integration

### 4.1 Subtitle Burner Component (`src/components/converters/media/SubtitleBurnerComponent.tsx`) & Worker
- Client-side: Upload video (`.mp4`, `.mov`, `.webm`) + Subtitle file (`.srt`, `.vtt`).
- Style controls: Font Family (Impact, Arial, Montserrat, Courier), Font Size (16px to 48px), Primary Color, Outline Color & Thickness, Alignment (Bottom, Center, Top).
- Worker Job (`src/workers/start-worker.ts`):
  ```typescript
  // FFmpeg command builder for subtitle burn-in
  const subFilter = `subtitles='${subtitlePath}':force_style='Fontname=${fontName},FontSize=${fontSize},PrimaryColour=${primaryColorHex},OutlineColour=&H000000,BorderStyle=1,Outline=2,Alignment=2,MarginV=${marginV}'`;
  ffmpeg(inputVideo)
    .videoFilters(subFilter)
    .outputOptions(['-c:a copy', '-preset fast'])
    .save(outputVideo);
  ```

### 4.2 Lossless Video Muter Component (`src/components/converters/media/VideoMuterComponent.tsx`) & Worker
- Mode A (Mute):
  ```typescript
  // Lossless video stream copying without audio
  ffmpeg(inputVideo)
    .outputOptions(['-c:v copy', '-an'])
    .save(outputVideo);
  ```
- Mode B (Replace Audio):
  ```typescript
  // Lossless video stream copying with new audio stream
  ffmpeg()
    .input(inputVideo)
    .input(newAudioFile)
    .outputOptions([
      '-c:v copy',
      '-c:a aac',
      '-b:a 192k',
      '-map 0:v:0',
      '-map 1:a:0',
      '-shortest'
    ])
    .save(outputVideo);
  ```

### 4.3 Batch Image Watermarker (`src/components/converters/image/BatchWatermarkerComponent.tsx`)
- Drag and drop up to 50 images into a thumbnail batch grid.
- Watermark Controls:
  - Type toggle: **Text** vs **Image Logo**.
  - Text properties: Content string, Font size, Font color, Opacity (10% to 100%), Angle (-45° to +45°).
  - Logo properties: Image file upload, Scale slider, Opacity slider.
  - Position Grid: 9-point radio buttons + "Tile Pattern Across Entire Image" toggle.
- Live canvas preview updating in real time on the selected image.
- Process Batch button: Iterates through files on HTML5 Canvas, compresses to target format (JPG/PNG/WebP), and triggers `archiver`/`adm-zip` download.

---

## 5. Canvas Integration & Routing (`src/components/converters/ConverterCanvas.tsx`)

Map the new slugs to their respective components:
```typescript
case 'burn-subtitles-to-video':
  return <SubtitleBurnerComponent tool={tool} />;
case 'mute-video-replace-audio':
  return <VideoMuterComponent tool={tool} />;
case 'batch-watermark-images':
  return <BatchWatermarkerComponent tool={tool} />;
```

---

## 6. Verification & Quality Checklist

- [ ] Video subtitle burner generates clean, styled subtitles burned into MP4 files without audio desync.
- [ ] Lossless video muter outputs a muted video in under 2 seconds.
- [ ] Batch watermarker applies consistent logo and text watermarks across 10+ uploaded test images and outputs a valid ZIP archive.
- [ ] Run `npm run lint` and verify 0 TypeScript/ESLint errors.
- [ ] Run `npm run build` and ensure static generation compiles without errors.
