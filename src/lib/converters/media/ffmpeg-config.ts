import ffmpeg from 'fluent-ffmpeg';

try {
  // eslint-disable-next-line
  const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
  if (ffmpegInstaller?.path) {
    ffmpeg.setFfmpegPath(ffmpegInstaller.path);
  }
} catch (err) {
  console.warn('[FFmpegConfig] Could not set FFmpeg binary path:', err);
}

try {
  // eslint-disable-next-line
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
  if (ffprobeInstaller?.path) {
    ffmpeg.setFfprobePath(ffprobeInstaller.path);
  }
} catch (err) {
  console.warn('[FFmpegConfig] Could not set FFprobe binary path:', err);
}

export default ffmpeg;
export { ffmpeg };
