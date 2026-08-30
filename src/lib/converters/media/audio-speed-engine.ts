import { ffmpeg } from './ffmpeg-config';

export interface AudioSpeedOptions {
  speedMultiplier: number; // 0.5 to 2.5
  preservePitch: boolean; // True = natural voice (atempo), False = analog vinyl / chipmunk effect
  pitchSemitones?: number; // -12 to +12 semitones
  targetFormat?: 'mp3' | 'wav';
  bitrate?: string; // e.g. '320k', '256k', '192k'
}

/**
 * Modulates audio playback speed and musical pitch semitones using fluent-ffmpeg.
 */
export function modulateAudioSpeed(
  inputPath: string,
  outputPath: string,
  options: AudioSpeedOptions,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(inputPath);
    const audioFilters: string[] = [];

    const speed = Math.max(0.25, Math.min(4.0, options.speedMultiplier || 1.0));
    const semitones = options.pitchSemitones !== undefined ? Math.max(-12, Math.min(12, options.pitchSemitones)) : 0;
    const hasPitchShift = semitones !== 0;

    if (hasPitchShift) {
      // 1. Pitch shifting via sample rate modulation (asetrate + aresample + atempo compensation)
      const pitchRatio = Math.pow(2, semitones / 12);
      const baseSampleRate = 44100;
      const targetRate = Math.round(baseSampleRate * pitchRatio);

      audioFilters.push(`asetrate=${targetRate}`);
      audioFilters.push(`aresample=${baseSampleRate}`);

      // Calculate the combined atempo compensation factor
      let effectiveAtempo = (1 / pitchRatio) * (options.preservePitch || speed !== 1.0 ? speed : 1.0);

      // Chain atempo filters (each atempo filter accepts 0.5 to 2.0)
      while (effectiveAtempo > 2.0) {
        audioFilters.push('atempo=2.0');
        effectiveAtempo /= 2.0;
      }
      while (effectiveAtempo < 0.5) {
        audioFilters.push('atempo=0.5');
        effectiveAtempo /= 0.5;
      }
      if (Math.abs(effectiveAtempo - 1.0) > 0.001) {
        audioFilters.push(`atempo=${effectiveAtempo.toFixed(4)}`);
      }
    } else if (options.preservePitch) {
      // 2. Speed modulation with voice pitch preservation using chained atempo
      let remainingSpeed = speed;
      while (remainingSpeed > 2.0) {
        audioFilters.push('atempo=2.0');
        remainingSpeed /= 2.0;
      }
      while (remainingSpeed < 0.5) {
        audioFilters.push('atempo=0.5');
        remainingSpeed /= 0.5;
      }
      if (Math.abs(remainingSpeed - 1.0) > 0.001) {
        audioFilters.push(`atempo=${remainingSpeed.toFixed(4)}`);
      }
    } else if (Math.abs(speed - 1.0) > 0.001) {
      // 3. Analog tape / vinyl pitch & speed modulation (chipmunk at high speed, demon at low speed)
      const baseSampleRate = 44100;
      const targetRate = Math.round(baseSampleRate * speed);
      audioFilters.push(`asetrate=${targetRate}`);
      audioFilters.push(`aresample=${baseSampleRate}`);
    }

    if (audioFilters.length > 0) {
      command = command.audioFilters(audioFilters);
    }

    // Target encoding options
    const format = options.targetFormat === 'wav' ? 'wav' : 'mp3';
    if (format === 'wav') {
      command = command.outputOptions(['-c:a pcm_s16le', '-ar 44100']);
    } else {
      const bitrate = options.bitrate || '320k';
      command = command.outputOptions(['-c:a libmp3lame', `-b:a ${bitrate}`, '-ar 44100']);
    }

    command
      .on('progress', (p) => {
        if (onProgress && p.percent) {
          onProgress(Math.min(Math.round(p.percent), 99));
        }
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Audio modulation failed: ${err.message}`)))
      .save(outputPath);
  });
}
