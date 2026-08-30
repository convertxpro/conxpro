import { Queue, QueueEvents } from 'bullmq';
import { Redis } from 'ioredis';

export const MEDIA_QUEUE_NAME = 'media-conversion-queue';

export type AspectRatioPreset = '9:16' | '16:9' | '1:1' | '4:5';
export type BackgroundStyle = 'blur' | 'black' | 'white' | 'color' | 'crop';

export interface MediaJobOptions {
  startTime?: number | string;
  duration?: number | string;
  endTime?: number | string;
  resolution?: '1080p' | '720p' | '480p' | '360p' | 'original' | string;
  bitrate?: string; // '320k', '256k', '192k', '128k'
  audioCodec?: string;
  videoCodec?: string;
  crf?: number; // e.g. 28
  qualityCrf?: number; // 18 - 30
  preset?: string; // 'medium', 'fast', 'ultrafast' or AspectRatioPreset
  fps?: number; // for gif or video (e.g. 15, 24, 30)
  targetSizeMb?: number; // e.g. 8 for discord, 16 for whatsapp
  width?: number;
  height?: number;
  audioChannels?: number;
  sampleRate?: number;
  volume?: number;
  backgroundStyle?: BackgroundStyle | string;
  customColorHex?: string;
  speedMultiplier?: number;
  preservePitch?: boolean;
  pitchSemitones?: number;
  crossfadeDurationSec?: number;
  inputPaths?: string[];
  // Phase 4: Subtitle burn-in & audio replacement
  subtitlePath?: string;
  subtitleContent?: string;
  fontName?: string;
  fontSize?: number;
  primaryColorHex?: string;
  outlineColorHex?: string;
  outlineThickness?: number;
  marginV?: number;
  alignment?: number;
  newAudioPath?: string;
  muteOnly?: boolean;
}

export type MediaToolType =
  | 'video-convert'
  | 'video-compress'
  | 'video-to-mp3'
  | 'video-to-gif'
  | 'gif-to-mp4'
  | 'gif-to-webm'
  | 'gif-to-video'
  | 'video-aspect-ratio-resizer'
  | 'social-resize'
  | 'video-trim'
  | 'video-resize'
  | 'burn-subtitles-to-video'
  | 'mute-video-replace-audio'
  | 'video-mute'
  | 'video-replace-audio'
  | 'audio-convert'
  | 'audio-compress'
  | 'audio-trim'
  | 'audio-speed-pitch-changer'
  | 'audio-speed'
  | 'audio-joiner'
  | 'audio-merge'
  | 'subtitle-converter';

export interface MediaJobData {
  jobId: string;
  downloadToken: string;
  inputPath: string;
  outputPath: string;
  originalFilename: string;
  targetFilename: string;
  toolType: MediaToolType;
  sourceFormat: string;
  targetFormat: string;
  originalSizeBytes: number;
  userId?: string | null;
  ipHash?: string | null;
  options?: MediaJobOptions;
}

export interface JobProgressInfo {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  message: string;
  updatedAt: number;
  error?: string;
  result?: {
    downloadUrl: string;
    targetFilename: string;
    convertedSizeBytes: number;
    originalSizeBytes: number;
    duration?: number;
    format: string;
    downloadToken: string;
  };
}

// In-memory fallback progress store for instant SSE/polling lookup
const memoryProgressStore = new Map<string, JobProgressInfo>();

let redisClient: Redis | null = null;
let bullQueue: Queue<MediaJobData> | null = null;
let queueEvents: QueueEvents | null = null;
let isRedisAvailable = false;

export function getRedisConnection(): Redis | null {
  if (redisClient) return redisClient;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying if offline
        return Math.min(times * 200, 1000);
      },
    });

    redisClient.on('connect', () => {
      isRedisAvailable = true;
    });

    redisClient.on('error', (err) => {
      // Don't crash process if Redis is not running locally
      isRedisAvailable = false;
    });

    return redisClient;
  } catch (err) {
    isRedisAvailable = false;
    return null;
  }
}

export function getMediaQueue(): Queue<MediaJobData> | null {
  if (bullQueue) return bullQueue;

  const conn = getRedisConnection();
  if (!conn) return null;

  try {
    bullQueue = new Queue<MediaJobData>(MEDIA_QUEUE_NAME, {
      connection: conn,
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: {
          age: 3600, // keep for 1 hour
          count: 100,
        },
        removeOnFail: {
          age: 86400, // keep failed for 24h
        },
      },
    });
    return bullQueue;
  } catch (err) {
    console.warn('BullMQ Queue initialization skipped:', err);
    return null;
  }
}

/**
 * Update job progress in memory and Redis cache (if active)
 */
export async function updateJobProgress(
  jobId: string,
  info: Partial<JobProgressInfo>
): Promise<void> {
  const current = memoryProgressStore.get(jobId) || {
    jobId,
    status: 'pending',
    progress: 0,
    stage: 'Queued',
    message: 'Initializing media conversion...',
    updatedAt: Date.now(),
  };

  const updated: JobProgressInfo = {
    ...current,
    ...info,
    jobId,
    updatedAt: Date.now(),
  };

  memoryProgressStore.set(jobId, updated);

  // If Redis is active, cache progress with 1 hour TTL
  const conn = getRedisConnection();
  if (conn && isRedisAvailable) {
    try {
      await conn.set(`job_progress:${jobId}`, JSON.stringify(updated), 'EX', 3600);
    } catch {
      // ignore redis write error, memory store suffices
    }
  }
}

/**
 * Get job progress from memory or Redis
 */
export async function getJobProgress(jobId: string): Promise<JobProgressInfo | null> {
  // 1. Check in-memory store
  const local = memoryProgressStore.get(jobId);
  if (local) return local;

  // 2. Check Redis
  const conn = getRedisConnection();
  if (conn && isRedisAvailable) {
    try {
      const data = await conn.get(`job_progress:${jobId}`);
      if (data) {
        const parsed = JSON.parse(data) as JobProgressInfo;
        memoryProgressStore.set(jobId, parsed);
        return parsed;
      }
    } catch {
      // ignore redis read error
    }
  }

  return null;
}

/**
 * Add a job to BullMQ queue, or initialize tracking state for in-process runner
 */
export async function addMediaJob(data: MediaJobData): Promise<{ queuedInBull: boolean; jobId: string }> {
  // Initialize progress state
  await updateJobProgress(data.jobId, {
    jobId: data.jobId,
    status: 'pending',
    progress: 0,
    stage: 'Queued',
    message: 'Conversion job registered in queue...',
  });

  const queue = getMediaQueue();
  if (queue) {
    try {
      await queue.add(data.toolType, data, {
        jobId: data.jobId,
      });
      return { queuedInBull: true, jobId: data.jobId };
    } catch (err) {
      console.warn('Could not enqueue into BullMQ, using async background runner:', err);
    }
  }

  return { queuedInBull: false, jobId: data.jobId };
}
