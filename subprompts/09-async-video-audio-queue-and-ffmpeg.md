# SUB-PROMPT 09: Asynchronous Video & Audio Conversion Pipeline (BullMQ + FFmpeg) with Media SEO

## 1. Context & Objective
Video and audio conversions are CPU-intensive and long-running operations. Running them synchronously inside standard serverless HTTP requests leads to gateway timeouts (e.g., Vercel 15s–60s limit). Therefore, media conversions must be processed asynchronously using a queue-worker architecture backed by BullMQ and Redis, with native `ffmpeg` execution.

Your objective in this prompt is to:
1. Build the asynchronous media conversion pipeline with BullMQ job queues and worker processes using `fluent-ffmpeg`.
2. Implement real-time progress tracking (% progress from FFmpeg stderr via SSE / polling).
3. Construct **Programmatic Landing Pages** for all major media pairs (`video-to-mp3`, `mp4-to-mp3`, `video-to-gif`, `compress-video-for-discord`, `m4a-to-mp3`, etc.).
4. Embed codec compatibility matrices, audio bitrate reference tables, and Schema.org `HowTo` + `FAQPage` structured data.
5. Design the honest processing UX with native ad integration.

---

## 2. Technical Stack & Dependencies

- **Queue & Worker:** `bullmq`, `ioredis` / Upstash Redis
- **Media Transcoder:** `fluent-ffmpeg`, `@ffmpeg-installer/ffmpeg`, `@ffprobe-installer/ffprobe`
- **Real-time Progress:** Server-Sent Events (SSE) or Polling Route (`/api/jobs/[id]/progress`)
- **SEO & Schema:** `schema-dts`, Next.js Dynamic Metadata
- **Formats:** Video (MP4, AVI, MOV, MKV, WMV, FLV, WebM), Audio (MP3, WAV, AAC, FLAC, OGG, M4A)

Install dependencies:
```bash
npm install bullmq fluent-ffmpeg @ffmpeg-installer/ffmpeg @ffprobe-installer/ffprobe schema-dts
npm install @types/fluent-ffmpeg --save-dev
```

---

## 3. Asynchronous Queue Architecture

```
[Client Uploads Video/Audio File]
              │
              ▼
[Next.js API: Validates & Creates Job in Supabase]
              │
              ▼
[Enqueues BullMQ Job: media-conversion-queue]
              │
              ▼
[Background Worker (Node.js/Railway/VPS) Picks Up Job]
              │
              ▼
[FFmpeg Processes Stream -> Emits Progress (%)]
              │
              ├───► [Updates Redis / SSE: Progress State]
              │
              ▼
[Job Completes -> Saves Output File -> Updates Supabase Status]
              │
              ▼
[Client Progress Screen Automatically Transitions to Download Screen]
```

---

## 4. Worker & Transcoding Engine Implementation

### 4.1 Queue & Worker Setup (`src/lib/queue/media-queue.ts`)
```typescript
import { Queue, Worker, Job } from 'bullmq';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import ffprobeInstaller from '@ffprobe-installer/ffprobe';
import { Redis } from 'ioredis';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
ffmpeg.setFfprobePath(ffprobeInstaller.path);

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const MEDIA_QUEUE_NAME = 'media-conversion-queue';
export const mediaQueue = new Queue(MEDIA_QUEUE_NAME, { connection });

export interface MediaJobData {
  jobId: string;
  inputPath: string;
  outputPath: string;
  toolType: 'video-convert' | 'video-compress' | 'video-to-mp3' | 'video-to-gif' | 'video-trim' | 'audio-convert' | 'audio-compress';
  targetFormat: string;
  options?: {
    startTime?: number;
    duration?: number;
    resolution?: string;
    bitrate?: string;
    targetSizeMb?: number;
  };
}
```

---

### 4.2 FFmpeg Transcoding Worker Process (`src/workers/media-worker.ts`)
```typescript
export function startMediaWorker() {
  const worker = new Worker<MediaJobData>(
    MEDIA_QUEUE_NAME,
    async (job: Job<MediaJobData>) => {
      const { inputPath, outputPath, toolType, targetFormat, options } = job.data;

      return new Promise((resolve, reject) => {
        let command = ffmpeg(inputPath);

        switch (toolType) {
          case 'video-to-mp3':
            command = command.noVideo().audioCodec('libmp3lame').audioBitrate(options?.bitrate || '192k');
            break;

          case 'video-to-gif':
            command = command
              .fps(15)
              .complexFilter(['fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse']);
            break;

          case 'video-trim':
            if (options?.startTime) command = command.setStartTime(options.startTime);
            if (options?.duration) command = command.setDuration(options.duration);
            break;

          case 'video-compress':
            command = command.videoCodec('libx264').outputOptions(['-crf 28', '-preset medium']);
            break;

          case 'video-convert':
            if (options?.resolution) {
              const resMap: Record<string, string> = {
                '1080p': 'scale=1920:1080',
                '720p': 'scale=1280:720',
                '480p': 'scale=854:480',
              };
              if (resMap[options.resolution]) command = command.videoFilters(resMap[options.resolution]);
            }
            break;

          case 'audio-convert':
          case 'audio-compress':
            if (options?.bitrate) command = command.audioBitrate(options.bitrate);
            break;
        }

        command
          .on('progress', (progress) => {
            const percent = Math.min(Math.round(progress.percent || 0), 99);
            job.updateProgress(percent);
          })
          .on('end', () => {
            job.updateProgress(100);
            resolve({ success: true, outputPath });
          })
          .on('error', (err) => {
            console.error('FFmpeg execution failed:', err);
            reject(err);
          })
          .save(outputPath);
      });
    },
    { connection, concurrency: 2 }
  );

  return worker;
}
```

---

## 5. Programmatic Media SEO Pages & Technical Reference Tables

### 5.1 Programmatic Media Tool Landing Pages
- `/convert/video/video-to-mp3`, `/convert/video/mp4-to-mp3`
- `/convert/video/video-to-gif`
- `/convert/video/mp4-to-webm`, `/convert/video/webm-to-mp4`
- `/convert/video/compress-video-for-discord`, `/convert/video/compress-video-for-whatsapp`
- `/convert/audio/mp3-to-wav`, `/convert/audio/wav-to-mp3`
- `/convert/audio/m4a-to-mp3`, `/convert/audio/flac-to-mp3`

### 5.2 Audio Bitrate Quality Reference Table
Rendered on all audio converter and compressor pages:

| Audio Bitrate | Audio Quality Level | File Size per Minute | Best Use Case |
|---|---|---|---|
| **320 kbps** | Studio / Audiophile | ~2.4 MB / min | Music production, archiving, premium listening |
| **256 kbps** | High Definition | ~1.9 MB / min | High-quality streaming, podcast publishing |
| **192 kbps** | Standard (Recommended) | ~1.4 MB / min | General music playback, mobile devices |
| **128 kbps** | Voice / Compact | ~0.9 MB / min | Audiobooks, lectures, voice memos |

---

## 6. The Honest Processing UX with Ad Placement

1. **Processing View (`src/components/conversion/MediaProcessingView.tsx`):**
   - Live percentage progress bar connected to `/api/jobs/[id]/progress`.
   - Dynamic status messages (*"Extracting audio stream..."*, *"Transcoding to MP3 (45%)..."*).
   - Display `<AdSlot placement="processing_screen" />` alongside the real progress bar.
2. **Download View:**
   - Single-click download button + audio/video preview player.
   - Display `<AdSlot placement="download_page" />`.

---

## 7. Acceptance Criteria & Verification Checklist

- [ ] BullMQ enqueues and processes media conversion jobs asynchronously.
- [ ] FFmpeg converts MP4, MOV, WebM, and AVI with accurate video/audio filters.
- [ ] Video to MP3 extracts clean MP3s with customized bitrate.
- [ ] Media landing pages render with `<ToolLayout />`, bitrate lookup tables, and FAQ accordions.
- [ ] Real-time progress updates stream to client and transition automatically to download screen on completion.
- [ ] Valid `HowTo`, `SoftwareApplication`, and `FAQPage` JSON-LD structured data is active on all media routes.
