import { Worker, Job } from 'bullmq';
import {
  MEDIA_QUEUE_NAME,
  MediaJobData,
  getRedisConnection,
  updateJobProgress,
} from '@/lib/queue/media-queue';
import { executeMediaConversion } from '@/lib/converters/media/media-engine';

let workerInstance: Worker<MediaJobData> | null = null;

/**
 * Start the BullMQ Media Conversion Worker Process
 */
export function startMediaWorker() {
  if (workerInstance) {
    return workerInstance;
  }

  const connection = getRedisConnection();
  if (!connection) {
    console.warn('[MediaWorker] No Redis connection available; BullMQ worker not started.');
    return null;
  }

  try {
    workerInstance = new Worker<MediaJobData>(
      MEDIA_QUEUE_NAME,
      async (job: Job<MediaJobData>) => {
        console.log(`[MediaWorker] Processing Job ID: ${job.id} (${job.data.toolType})`);

        try {
          await job.updateProgress(5);
          await updateJobProgress(job.data.jobId, {
            status: 'processing',
            progress: 5,
            stage: 'Worker Claimed',
            message: 'Worker claimed job from queue...',
          });

          const result = await executeMediaConversion(job.data);

          await job.updateProgress(100);
          return result;
        } catch (error: any) {
          console.error(`[MediaWorker] Job ${job.id} failed:`, error);
          throw error;
        }
      },
      {
        connection,
        concurrency: 2, // Process 2 media transcode streams simultaneously
        lockDuration: 300000, // 5 minutes lock duration for large files
      }
    );

    workerInstance.on('completed', (job) => {
      console.log(`[MediaWorker] Job ${job.id} completed successfully.`);
    });

    workerInstance.on('failed', (job, err) => {
      console.error(`[MediaWorker] Job ${job?.id} failed with error:`, err);
    });

    workerInstance.on('error', (err) => {
      console.error('[MediaWorker] Worker internal error:', err);
    });

    console.log(`[MediaWorker] Media Conversion Worker listening on queue: "${MEDIA_QUEUE_NAME}"`);
    return workerInstance;
  } catch (err) {
    console.error('[MediaWorker] Error initializing BullMQ worker:', err);
    return null;
  }
}

/**
 * Graceful shutdown of the media worker
 */
export async function stopMediaWorker() {
  if (workerInstance) {
    await workerInstance.close();
    workerInstance = null;
  }
}
