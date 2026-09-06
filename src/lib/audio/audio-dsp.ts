/**
 * In-Browser Web Audio Digital Signal Processing (DSP) Engine
 * 100% Client-Side execution using Web Audio API and OfflineAudioContext.
 */

let sharedAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (typeof window === 'undefined') {
    throw new Error('Web Audio API is only available in browser environments.');
  }
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume();
  }
  return sharedAudioCtx;
}

/**
 * Decodes any browser-supported audio file (MP3, WAV, AAC, M4A, OGG, FLAC) into an AudioBuffer.
 */
export async function decodeAudioFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  const ctx = getAudioContext();
  // decodeAudioData consumes the ArrayBuffer, so slice a clone if needed
  return await ctx.decodeAudioData(arrayBuffer.slice(0));
}

/**
 * Extracts positive/negative peak amplitudes for rendering high-DPI waveforms on HTML5 Canvas.
 */
export function extractWaveformPeaks(
  buffer: AudioBuffer,
  numPoints: number = 800
): { min: Float32Array; max: Float32Array } {
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;
  const step = Math.ceil(length / numPoints);
  const minPeaks = new Float32Array(numPoints);
  const maxPeaks = new Float32Array(numPoints);

  // Combine channels to get master mono peak envelope
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  for (let i = 0; i < numPoints; i++) {
    const start = i * step;
    const end = Math.min(start + step, length);
    let min = 1.0;
    let max = -1.0;

    for (let j = start; j < end; j++) {
      let mixed = 0;
      for (let c = 0; c < numChannels; c++) {
        mixed += channelData[c][j];
      }
      mixed /= numChannels;

      if (mixed < min) min = mixed;
      if (mixed > max) max = mixed;
    }

    minPeaks[i] = min === 1.0 ? 0 : min;
    maxPeaks[i] = max === -1.0 ? 0 : max;
  }

  return { min: minPeaks, max: maxPeaks };
}

/**
 * Slices an AudioBuffer from startSec to endSec, applying optional fade-in and fade-out envelopes.
 */
export function sliceAudioBuffer(
  buffer: AudioBuffer,
  startSec: number,
  endSec: number,
  fadeInSec: number = 0,
  fadeOutSec: number = 0
): AudioBuffer {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  const startSample = Math.max(0, Math.min(buffer.length, Math.floor(startSec * sampleRate)));
  const endSample = Math.max(startSample, Math.min(buffer.length, Math.floor(endSec * sampleRate)));
  const sliceLength = Math.max(1, endSample - startSample);

  const ctx = getAudioContext();
  const slicedBuffer = ctx.createBuffer(numChannels, sliceLength, sampleRate);

  const fadeInSamples = Math.floor(Math.max(0, fadeInSec) * sampleRate);
  const fadeOutSamples = Math.floor(Math.max(0, fadeOutSec) * sampleRate);

  for (let c = 0; c < numChannels; c++) {
    const srcData = buffer.getChannelData(c);
    const dstData = slicedBuffer.getChannelData(c);

    for (let i = 0; i < sliceLength; i++) {
      let sample = srcData[startSample + i];

      // Linear/cosine fade-in
      if (fadeInSamples > 0 && i < fadeInSamples) {
        const gain = 0.5 * (1 - Math.cos((Math.PI * i) / fadeInSamples));
        sample *= gain;
      }

      // Linear/cosine fade-out
      const samplesFromEnd = sliceLength - 1 - i;
      if (fadeOutSamples > 0 && samplesFromEnd < fadeOutSamples) {
        const gain = 0.5 * (1 - Math.cos((Math.PI * samplesFromEnd) / fadeOutSamples));
        sample *= gain;
      }

      dstData[i] = sample;
    }
  }

  return slicedBuffer;
}

/**
 * Concatenates multiple AudioBuffers into a single continuous track with optional crossfade transitions.
 */
export function concatenateAudioBuffers(
  buffers: AudioBuffer[],
  crossfadeSec: number = 0,
  trackGains: number[] = []
): AudioBuffer {
  if (!buffers || buffers.length === 0) {
    throw new Error('At least one AudioBuffer is required.');
  }

  if (buffers.length === 1) {
    const single = buffers[0];
    const gain = trackGains[0] !== undefined ? trackGains[0] : 1.0;
    if (gain === 1.0) return single;

    const ctx = getAudioContext();
    const result = ctx.createBuffer(single.numberOfChannels, single.length, single.sampleRate);
    for (let c = 0; c < single.numberOfChannels; c++) {
      const src = single.getChannelData(c);
      const dst = result.getChannelData(c);
      for (let i = 0; i < single.length; i++) {
        dst[i] = Math.max(-1, Math.min(1, src[i] * gain));
      }
    }
    return result;
  }

  const sampleRate = buffers[0].sampleRate;
  const numChannels = Math.max(...buffers.map((b) => b.numberOfChannels));
  const crossfadeSamples = Math.floor(Math.max(0, crossfadeSec) * sampleRate);

  // Calculate total length accounting for crossfade overlaps
  let totalLength = 0;
  for (let idx = 0; idx < buffers.length; idx++) {
    totalLength += buffers[idx].length;
    if (idx > 0 && crossfadeSamples > 0) {
      const maxOverlap = Math.min(crossfadeSamples, buffers[idx - 1].length, buffers[idx].length);
      totalLength -= maxOverlap;
    }
  }

  const ctx = getAudioContext();
  const outputBuffer = ctx.createBuffer(numChannels, Math.max(1, totalLength), sampleRate);

  // Initialize output channel arrays
  const outputChannels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    outputChannels.push(outputBuffer.getChannelData(c));
  }

  let currentWritePos = 0;

  for (let bIdx = 0; bIdx < buffers.length; bIdx++) {
    const buf = buffers[bIdx];
    const gain = trackGains[bIdx] !== undefined ? trackGains[bIdx] : 1.0;
    const isFirst = bIdx === 0;
    const overlap = !isFirst ? Math.min(crossfadeSamples, buf.length) : 0;

    for (let c = 0; c < numChannels; c++) {
      const srcChan = c < buf.numberOfChannels ? buf.getChannelData(c) : buf.getChannelData(0);
      const dstChan = outputChannels[c];

      for (let i = 0; i < buf.length; i++) {
        const targetIdx = currentWritePos + i;
        if (targetIdx >= totalLength) break;

        let sample = srcChan[i] * gain;

        // Apply crossfade blending
        if (overlap > 0 && i < overlap) {
          // Transition in for current track: 0 -> 1
          const fadeFactor = i / overlap;
          sample *= fadeFactor;
          // Mix with existing track fading out (1 -> 0)
          dstChan[targetIdx] = dstChan[targetIdx] * (1 - fadeFactor) + sample;
        } else if (bIdx < buffers.length - 1 && crossfadeSamples > 0 && i >= buf.length - crossfadeSamples) {
          // Track end will be mixed with next track in next iteration
          dstChan[targetIdx] = sample;
        } else {
          dstChan[targetIdx] = sample;
        }
      }
    }

    currentWritePos += buf.length - overlap;
  }

  return outputBuffer;
}

/**
 * Renders audio with Master Gain Boost, Dynamics Compressor Limiter (prevents clipping), and Bass/Treble EQ.
 */
export async function renderBoostedAudio(
  buffer: AudioBuffer,
  gainMultiplier: number = 1.0, // 1.0 = 100%, 3.0 = 300%
  enableLimiter: boolean = true,
  enableBassBoost: boolean = false,
  enableTrebleBoost: boolean = false
): Promise<AudioBuffer> {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const length = buffer.length;

  const offlineCtx = new OfflineAudioContext(numChannels, length, sampleRate);

  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;

  let lastNode: AudioNode = source;

  // 1. Bass Boost (+6 dB low-shelf filter at 120Hz)
  if (enableBassBoost) {
    const bassFilter = offlineCtx.createBiquadFilter();
    bassFilter.type = 'lowshelf';
    bassFilter.frequency.value = 120;
    bassFilter.gain.value = 6.0;
    lastNode.connect(bassFilter);
    lastNode = bassFilter;
  }

  // 2. Treble Boost (+4 dB high-shelf filter at 6000Hz)
  if (enableTrebleBoost) {
    const trebleFilter = offlineCtx.createBiquadFilter();
    trebleFilter.type = 'highshelf';
    trebleFilter.frequency.value = 6000;
    trebleFilter.gain.value = 4.0;
    lastNode.connect(trebleFilter);
    lastNode = trebleFilter;
  }

  // 3. Master Gain Node
  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = gainMultiplier;
  lastNode.connect(gainNode);
  lastNode = gainNode;

  // 4. Dynamics Compressor / Peak Limiter
  if (enableLimiter) {
    const compressor = offlineCtx.createDynamicsCompressor();
    compressor.threshold.value = -3.0; // dB
    compressor.knee.value = 6.0;
    compressor.ratio.value = 16.0; // Hard limiting
    compressor.attack.value = 0.003; // 3ms
    compressor.release.value = 0.15; // 150ms
    lastNode.connect(compressor);
    lastNode = compressor;
  }

  lastNode.connect(offlineCtx.destination);
  source.start(0);

  return await offlineCtx.startRendering();
}

/**
 * Modulates audio speed and pitch.
 */
export async function renderSpeedPitchAudio(
  buffer: AudioBuffer,
  speedMultiplier: number = 1.0,
  pitchSemitones: number = 0,
  preservePitch: boolean = true
): Promise<AudioBuffer> {
  const speed = Math.max(0.25, Math.min(4.0, speedMultiplier));
  const semitones = Math.max(-12, Math.min(12, pitchSemitones));

  // If standard rate and no pitch change, return clone
  if (speed === 1.0 && semitones === 0) {
    return buffer;
  }

  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;

  // Calculate effective playback rate
  let effectiveRate = speed;
  if (!preservePitch && semitones !== 0) {
    const pitchRatio = Math.pow(2, semitones / 12);
    effectiveRate = speed * pitchRatio;
  } else if (preservePitch && semitones !== 0) {
    // Pitch shift via sample rate modulation
    const pitchRatio = Math.pow(2, semitones / 12);
    effectiveRate = pitchRatio;
  }

  const outputLength = Math.max(1, Math.round(buffer.length / effectiveRate));
  const offlineCtx = new OfflineAudioContext(numChannels, outputLength, sampleRate);

  const source = offlineCtx.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = effectiveRate;

  source.connect(offlineCtx.destination);
  source.start(0);

  return await offlineCtx.startRendering();
}

/**
 * Formats duration in seconds to MM:SS or MM:SS.ms string.
 */
export function formatAudioTime(seconds: number, includeMs: boolean = false): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const minStr = String(mins).padStart(2, '0');
  const secStr = String(secs).padStart(2, '0');

  if (includeMs) {
    const ms = Math.floor((seconds % 1) * 100);
    const msStr = String(ms).padStart(2, '0');
    return `${minStr}:${secStr}.${msStr}`;
  }

  return `${minStr}:${secStr}`;
}
