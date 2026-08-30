import { ffmpeg } from './ffmpeg-config';

export interface AudioJoinerOptions {
  crossfadeDurationSec?: number; // 0 to 5 seconds
  targetFormat: 'mp3' | 'wav';
  bitrate?: string; // e.g. '320k'
}

/**
 * Merges and joins multiple audio tracks in sequential order with optional crossfades.
 */
export function mergeAudioTracks(
  inputPaths: string[],
  outputPath: string,
  options: AudioJoinerOptions,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!inputPaths || inputPaths.length === 0) {
      return reject(new Error('At least one audio track is required to process.'));
    }

    if (inputPaths.length === 1) {
      // Single track fallback transcode
      let singleCommand = ffmpeg(inputPaths[0]);
      if (options.targetFormat === 'wav') {
        singleCommand = singleCommand.outputOptions(['-c:a pcm_s16le', '-ar 44100']);
      } else {
        singleCommand = singleCommand.outputOptions(['-c:a libmp3lame', `-b:a ${options.bitrate || '320k'}`, '-ar 44100']);
      }

      singleCommand
        .on('progress', (p) => {
          if (onProgress && p.percent) onProgress(Math.min(Math.round(p.percent), 99));
        })
        .on('end', () => resolve())
        .on('error', (err) => reject(new Error(`Audio transcode failed: ${err.message}`)))
        .save(outputPath);
      return;
    }

    let command = ffmpeg();
    inputPaths.forEach((p) => {
      command = command.input(p);
    });

    const crossfade = Math.max(0, Math.min(5, options.crossfadeDurationSec || 0));

    if (crossfade > 0) {
      // Sequential chained acrossfade graph
      const filterStrings: string[] = [];
      let lastOutputLabel = '0:a';

      for (let i = 1; i < inputPaths.length; i++) {
        const nextOutputLabel = i === inputPaths.length - 1 ? 'outa' : `a_fade_${i}`;
        filterStrings.push(
          `[${lastOutputLabel}][${i}:a]acrossfade=d=${crossfade}:c1=tri:c2=tri[${nextOutputLabel}]`
        );
        lastOutputLabel = nextOutputLabel;
      }

      command = command.complexFilter(filterStrings, ['outa']);
    } else {
      // Standard seamless concat filter
      const filterInputs = inputPaths.map((_, i) => `[${i}:a]`).join('');
      command = command.complexFilter(
        [`${filterInputs}concat=n=${inputPaths.length}:v=0:a=1[outa]`],
        ['outa']
      );
    }

    if (options.targetFormat === 'wav') {
      command = command.outputOptions(['-c:a pcm_s16le', '-ar 44100']);
    } else {
      command = command.outputOptions([
        '-c:a libmp3lame',
        `-b:a ${options.bitrate || '320k'}`,
        '-ar 44100',
      ]);
    }

    command
      .on('progress', (p) => {
        if (onProgress && p.percent) {
          onProgress(Math.min(Math.round(p.percent), 99));
        }
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(new Error(`Audio merge failed: ${err.message}`)))
      .save(outputPath);
  });
}
