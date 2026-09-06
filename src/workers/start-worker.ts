import { startMediaWorker } from './media-worker';

console.log('--- ApexTools Background Media Worker ---');
console.log('Starting FFmpeg media queue consumer...');

const worker = startMediaWorker();

if (!worker) {
  console.log('Worker could not be started (check REDIS_URL environment variable).');
} else {
  console.log('Worker is actively polling Redis queue for media jobs.');
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received. Closing media worker...');
  if (worker) await worker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received. Closing media worker...');
  if (worker) await worker.close();
  process.exit(0);
});
