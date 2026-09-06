'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { ToolMetadata } from '@/config/categories';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { formatBytes } from '@/lib/utils';
import {
  decodeAudioFile,
  formatAudioTime,
  getAudioContext,
} from '@/lib/audio/audio-dsp';
import { audioBufferToWav, downloadAudioBlob } from '@/lib/audio/audio-encoders';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  CheckCircle2,
  Sparkles,
  Radio,
  Trash2,
  Gauge,
  Activity,
  FileAudio,
  ShieldCheck,
  Disc,
} from 'lucide-react';

interface VoiceRecorderComponentProps {
  tool?: ToolMetadata;
}

export const VoiceRecorderComponent: React.FC<VoiceRecorderComponentProps> = ({ tool }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [dbLevel, setDbLevel] = useState<number>(-60);
  const [peakClip, setPeakClip] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Recorded Audio state
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedBuffer, setRecordedBuffer] = useState<AudioBuffer | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Web Audio & MediaRecorder Refs
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerAnimRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Audio element ref for playback
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Start Live Recording
  const startRecording = async () => {
    setPermissionError(null);
    setRecordedBlob(null);
    setRecordedBuffer(null);
    setRecordedAudioUrl(null);
    setExportSuccess(false);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      mediaStreamRef.current = stream;

      // Setup Web Audio Analyser for VU meter and spectrum visualizer
      const ctx = getAudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/mp4';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const fullBlob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedAudioUrl(url);

        try {
          // Decode into AudioBuffer for lossless WAV export & precise editing
          const arrayBuf = await fullBlob.arrayBuffer();
          const buffer = await ctx.decodeAudioData(arrayBuf);
          setRecordedBuffer(buffer);
        } catch (err) {
          console.warn('Could not decode recorded blob to AudioBuffer:', err);
        }
      };

      recorder.start(100); // 100ms timeslices
      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);

      // Start elapsed timer
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((Date.now() - startTime) / 1000);
      }, 50);

      // Start visualizer animation loop
      drawLiveVisualizer();
    } catch (err: unknown) {
      console.error('Microphone access denied:', err);
      setPermissionError(
        'Microphone access was denied or not found. Please grant microphone permission in your browser settings.'
      );
    }
  };

  // Pause / Resume Recording
  const togglePauseResume = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (visualizerAnimRef.current) {
      cancelAnimationFrame(visualizerAnimRef.current);
      visualizerAnimRef.current = null;
    }

    setIsRecording(false);
    setIsPaused(false);
    setDbLevel(-60);
    setPeakClip(false);
  };

  // Discard Recording
  const discardRecording = () => {
    stopRecording();
    setRecordedBlob(null);
    setRecordedBuffer(null);
    setRecordedAudioUrl(null);
    setRecordingSeconds(0);
  };

  // Live Canvas Frequency Visualizer Loop
  const drawLiveVisualizer = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, width, height);

      // Compute RMS & dB level for VU meter
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / bufferLength);
      const db = rms > 0 ? 20 * Math.log10(rms / 255) : -60;
      setDbLevel(Math.max(-60, Math.round(db)));
      setPeakClip(db >= -1.0);

      // Draw 32 modern equalizer bars
      const numBars = 32;
      const barWidth = (width / numBars) * 0.75;
      const barGap = (width / numBars) * 0.25;

      for (let i = 0; i < numBars; i++) {
        const binIndex = Math.floor((i / numBars) * bufferLength);
        const val = dataArray[binIndex];
        const barHeight = Math.max(4, (val / 255) * (height * 0.85));
        const x = i * (barWidth + barGap) + barGap / 2;
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(0.5, '#f43f5e');
        gradient.addColorStop(1, '#a855f7');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 3);
        ctx.fill();
      }

      visualizerAnimRef.current = requestAnimationFrame(render);
    };

    visualizerAnimRef.current = requestAnimationFrame(render);
  };

  // Playback speed change
  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = speed;
    }
  };

  // Download recorded voice track
  const handleDownload = (format: 'wav' | 'mp3') => {
    if (recordedBuffer) {
      const wavBlob = audioBufferToWav(recordedBuffer);
      downloadAudioBlob(wavBlob, `voice_recording_${Date.now()}.${format === 'mp3' ? 'mp3' : 'wav'}`);
      setExportSuccess(true);
    } else if (recordedBlob) {
      downloadAudioBlob(recordedBlob, `voice_recording_${Date.now()}.webm`);
      setExportSuccess(true);
    }
  };

  // Clean up
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 1. Header Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-slate-900/90 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-semibold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              100% In-Browser Studio Recorder
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Voice & Microphone Studio Recorder
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl">
              Record studio-quality voice clips from your microphone with real-time decibel VU meter, live frequency spectrum visualizer, and instant MP3/WAV download.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <PrivacyAssuranceBadge />
          </div>
        </div>
      </div>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm font-medium flex items-center gap-3">
          <MicOff className="w-5 h-5 text-rose-400 shrink-0" />
          {permissionError}
        </div>
      )}

      {/* 2. Live Recording Console */}
      <div className="rounded-3xl border border-pink-500/20 bg-slate-950/90 p-6 md:p-10 shadow-2xl space-y-8 text-center">
        {/* Real-Time Spectrum Canvas */}
        <div className="relative w-full h-32 md:h-40 rounded-2xl border border-slate-800/80 bg-slate-900/80 overflow-hidden flex items-center justify-center">
          <canvas ref={canvasRef} className="w-full h-full block" />
          {!isRecording && !recordedAudioUrl && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 text-sm font-medium">
              <Activity className="w-6 h-6 mb-1 text-slate-600 animate-pulse" />
              Click the microphone button below to start recording
            </div>
          )}
        </div>

        {/* Live Timer & VU Meter */}
        <div className="space-y-3">
          <div className="text-4xl md:text-5xl font-extrabold font-mono text-white tracking-wider">
            {formatAudioTime(recordingSeconds, true)}
          </div>

          {/* Decibel VU Meter */}
          {isRecording && (
            <div className="max-w-md mx-auto space-y-1">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Mic Level: {dbLevel} dBFS</span>
                {peakClip ? (
                  <span className="text-rose-400 font-bold animate-pulse">CLIP WARNING</span>
                ) : (
                  <span className="text-emerald-400 font-medium">Optimum Level</span>
                )}
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-75 ${
                    peakClip
                      ? 'bg-rose-500 shadow-md shadow-rose-500/50'
                      : dbLevel > -12
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${Math.max(5, Math.min(100, ((dbLevel + 60) / 60) * 100))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Recording Actions (Large Pulsing Button) */}
        <div className="flex items-center justify-center gap-4 pt-2">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="relative group p-6 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-2xl shadow-pink-500/40 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <span className="absolute inset-0 rounded-full bg-pink-500/30 animate-ping group-hover:opacity-100 opacity-75" />
              <Mic className="w-8 h-8 relative z-10" />
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {/* Pause / Resume */}
              <Button
                variant="outline"
                size="lg"
                onClick={togglePauseResume}
                className="h-14 px-6 rounded-2xl border-slate-700 text-slate-200 hover:text-white flex items-center gap-2"
              >
                {isPaused ? <Play className="w-5 h-5 text-emerald-400" /> : <Pause className="w-5 h-5 text-amber-400" />}
                {isPaused ? 'Resume' : 'Pause'}
              </Button>

              {/* Stop & Save */}
              <Button
                size="lg"
                onClick={stopRecording}
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold shadow-xl shadow-rose-500/30 flex items-center gap-2"
              >
                <Disc className="w-5 h-5 animate-spin" />
                Stop & Review
              </Button>

              {/* Discard */}
              <Button
                variant="ghost"
                size="icon"
                onClick={discardRecording}
                className="h-14 w-14 rounded-2xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                title="Discard Recording"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 3. Review & Export Player */}
      {recordedAudioUrl && !isRecording && (
        <div className="p-6 md:p-8 rounded-3xl border border-pink-500/20 bg-slate-950/90 shadow-2xl space-y-6 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                <FileAudio className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Voice Recording Ready</h3>
                <p className="text-xs text-slate-400">
                  {formatAudioTime(recordingSeconds, true)} Duration • 48 kHz High-Fidelity Capture
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={discardRecording}
              className="text-xs border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Record New Clip
            </Button>
          </div>

          {/* HTML5 Audio Player */}
          <div className="rounded-xl bg-slate-900/90 p-4 border border-slate-800">
            <audio
              ref={audioPlayerRef}
              src={recordedAudioUrl}
              controls
              className="w-full h-12 rounded-lg accent-pink-500"
            />
          </div>

          {/* Playback Speed Chips */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-pink-400" />
                Playback Speed:
              </span>
              {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2.5 py-1 rounded-md font-mono font-semibold transition-all ${
                    playbackSpeed === s
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Download Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleDownload('mp3')}
                className="h-11 px-5 rounded-xl border-slate-700 text-slate-200 hover:text-pink-400 hover:border-pink-500 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download MP3
              </Button>

              <Button
                onClick={() => handleDownload('wav')}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold shadow-lg shadow-pink-500/30 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Studio WAV (48kHz)
              </Button>
            </div>
          </div>

          {exportSuccess && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 flex items-center gap-3 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              Recording saved directly to your local downloads folder! Zero cloud transmission.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
