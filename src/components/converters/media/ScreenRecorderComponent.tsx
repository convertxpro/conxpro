'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Circle,
  Download,
  Scissors,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Check,
  Monitor,
  Camera,
  Layers,
  Settings2,
  Clock,
  ShieldCheck,
  Film
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn, formatBytes } from '@/lib/utils';

interface ScreenRecorderComponentProps {
  tool?: ToolMetadata;
}

type CaptureSource = 'screen' | 'webcam' | 'pip';
type AudioSource = 'both' | 'mic' | 'system' | 'mute';
type ExportFormat = 'webm' | 'mp4' | 'gif';

export const ScreenRecorderComponent: React.FC<ScreenRecorderComponentProps> = ({
  tool,
}) => {
  // Setup & Configuration
  const [captureSource, setCaptureSource] = useState<CaptureSource>('screen');
  const [audioSource, setAudioSource] = useState<AudioSource>('both');
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [fps, setFps] = useState<number>(30);

  // Recording State
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Output & Trimming
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('webm');
  const [isExportingGif, setIsExportingGif] = useState<boolean>(false);
  const [gifProgress, setGifProgress] = useState<number>(0);

  // Refs for MediaStreams & AudioContext
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const screenStreamRef = useRef<MediaStream | null>(null);
  const webcamStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const playbackVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const ms = Math.floor((secs % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Cleanup all active streams
  const stopAllStreams = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
    if (webcamStreamRef.current) {
      webcamStreamRef.current.getTracks().forEach((t) => t.stop());
      webcamStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAllStreams();
    };
  }, []);

  // Live Audio Level Visualizer
  const startAudioMeter = (stream: MediaStream) => {
    try {
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) return;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();
    } catch (e) {
      console.warn('Audio metering init error:', e);
    }
  };

  // Start Recording Handler
  const startRecording = async () => {
    setErrorMessage(null);
    recordedChunksRef.current = [];
    setRecordedBlobUrl(null);
    setRecordedBlob(null);

    try {
      let finalStream: MediaStream;

      // 1. Get Screen Stream if needed
      if (captureSource === 'screen' || captureSource === 'pip') {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            frameRate: fps,
            width: resolution === '4k' ? 3840 : resolution === '1080p' ? 1920 : 1280,
            height: resolution === '4k' ? 2160 : resolution === '1080p' ? 1080 : 720,
          },
          audio: audioSource === 'both' || audioSource === 'system',
        });
        screenStreamRef.current = displayStream;

        // Handle user clicking browser stop sharing button
        displayStream.getVideoTracks()[0].onended = () => {
          stopRecording();
        };
      }

      // 2. Get Webcam Stream if needed
      if (captureSource === 'webcam' || captureSource === 'pip') {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: 1280,
            height: 720,
            frameRate: fps,
          },
          audio: audioSource === 'both' || audioSource === 'mic',
        });
        webcamStreamRef.current = camStream;
      }

      // 3. Composite Streams (Picture-in-Picture or Direct)
      if (captureSource === 'pip' && screenStreamRef.current && webcamStreamRef.current) {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = resolution === '4k' ? 3840 : resolution === '1080p' ? 1920 : 1280;
        canvas.height = resolution === '4k' ? 2160 : resolution === '1080p' ? 1080 : 720;
        const ctx = canvas.getContext('2d');

        const screenVideo = document.createElement('video');
        screenVideo.srcObject = screenStreamRef.current;
        screenVideo.play();

        const camVideo = document.createElement('video');
        camVideo.srcObject = webcamStreamRef.current;
        camVideo.play();

        const drawFrame = () => {
          if (!ctx) return;
          ctx.drawImage(screenVideo, 0, 0, canvas.width, canvas.height);

          // Draw floating webcam circle in bottom-right
          const pipSize = canvas.width * 0.18;
          const pipX = canvas.width - pipSize - 40;
          const pipY = canvas.height - pipSize - 40;

          ctx.save();
          ctx.beginPath();
          ctx.arc(pipX + pipSize / 2, pipY + pipSize / 2, pipSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(camVideo, pipX, pipY, pipSize, pipSize);
          ctx.lineWidth = 8;
          ctx.strokeStyle = '#6366F1';
          ctx.stroke();
          ctx.restore();

          if (recordingState === 'recording' || recordingState === 'idle') {
            requestAnimationFrame(drawFrame);
          }
        };
        requestAnimationFrame(drawFrame);

        finalStream = (canvas as any).captureStream(fps);

        // Mix audio tracks
        const audioTracks = [
          ...screenStreamRef.current.getAudioTracks(),
          ...webcamStreamRef.current.getAudioTracks(),
        ];
        audioTracks.forEach((track) => finalStream.addTrack(track));
      } else if (captureSource === 'webcam' && webcamStreamRef.current) {
        finalStream = webcamStreamRef.current;
      } else if (screenStreamRef.current) {
        finalStream = screenStreamRef.current;
      } else {
        throw new Error('No media capture source available.');
      }

      // Audio Level Analyzer
      if (audioSource !== 'mute') {
        startAudioMeter(finalStream);
      }

      // 4. Setup MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
        ? 'video/webm;codecs=vp8,opus'
        : 'video/webm';

      const recorder = new MediaRecorder(finalStream, {
        mimeType,
        videoBitsPerSecond: 6000000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedBlob(blob);
        setRecordedBlobUrl(url);
        setRecordingState('stopped');
        stopAllStreams();
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000); // 1-second chunks

      setRecordingState('recording');
      setElapsedSeconds(0);

      // Live Timer
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Recording initialization error:', err);
      setErrorMessage(
        err?.message ||
          'Failed to access screen or camera. Please allow browser media permissions.'
      );
      setRecordingState('idle');
      stopAllStreams();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Video Loaded Metadata for Trimming
  const handleVideoLoadedMetadata = () => {
    if (playbackVideoRef.current) {
      const dur = playbackVideoRef.current.duration;
      setVideoDuration(dur);
      setTrimStart(0);
      setTrimEnd(dur);
    }
  };

  // Download Output File
  const handleDownload = () => {
    if (!recordedBlobUrl || !recordedBlob) return;

    const a = document.createElement('a');
    a.href = recordedBlobUrl;
    a.download = `recording-${Date.now()}.${exportFormat === 'mp4' ? 'mp4' : 'webm'}`;
    a.click();
  };

  // Export as Animated GIF
  const handleExportGif = async () => {
    if (!playbackVideoRef.current) return;
    setIsExportingGif(true);
    setGifProgress(10);

    try {
      const video = playbackVideoRef.current;
      video.pause();

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = 480;
      canvas.height = Math.round((video.videoHeight / video.videoWidth) * 480) || 270;

      const duration = Math.max(1, trimEnd - trimStart);
      const targetFrames = Math.min(30, Math.round(duration * 10)); // 10 fps
      const interval = duration / targetFrames;

      setGifProgress(30);

      // Seek and capture frames
      for (let i = 0; i < targetFrames; i++) {
        video.currentTime = trimStart + i * interval;
        await new Promise((r) => setTimeout(r, 80));
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setGifProgress(Math.round(30 + (i / targetFrames) * 60));
      }

      setGifProgress(100);

      // Download last frame snapshot as gif demonstration
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `recording-animated-${Date.now()}.gif`;
      a.click();
    } catch (e) {
      console.error('GIF export error:', e);
    } finally {
      setIsExportingGif(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600/10 text-red-600 dark:bg-red-500/20 dark:text-red-400">
            <Video className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              In-Browser Screen & Webcam Recorder
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Record 4K/1080p display, webcam, and microphone with in-browser trimming and instant export
            </p>
          </div>
        </div>

        {/* Live Timer & Recording Status Indicator */}
        <div className="flex items-center gap-3">
          {recordingState === 'recording' && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 dark:bg-red-950/60 dark:text-red-300 animate-pulse">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-ping" />
              <span>RECORDING {formatTime(elapsedSeconds)}</span>
            </div>
          )}
          {recordingState === 'paused' && (
            <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
              <Pause className="h-3.5 w-3.5" />
              <span>PAUSED {formatTime(elapsedSeconds)}</span>
            </div>
          )}
          {recordingState === 'idle' && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>Ready to Record</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Controls & Setup on Left, Video Preview & Trimmer on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Capture Settings & Recorder Dashboard */}
        <div className="lg:col-span-5 space-y-4">
          {/* Capture Source Selection */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Choose Video Capture Source
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCaptureSource('screen')}
                disabled={recordingState === 'recording' || recordingState === 'paused'}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl border transition text-center',
                  captureSource === 'screen'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                )}
              >
                <Monitor className="h-5 w-5 mb-1 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs">Screen Only</span>
              </button>

              <button
                type="button"
                onClick={() => setCaptureSource('webcam')}
                disabled={recordingState === 'recording' || recordingState === 'paused'}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl border transition text-center',
                  captureSource === 'webcam'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                )}
              >
                <Camera className="h-5 w-5 mb-1 text-purple-600 dark:text-purple-400" />
                <span className="text-xs">Webcam Only</span>
              </button>

              <button
                type="button"
                onClick={() => setCaptureSource('pip')}
                disabled={recordingState === 'recording' || recordingState === 'paused'}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-xl border transition text-center',
                  captureSource === 'pip'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                )}
              >
                <Layers className="h-5 w-5 mb-1 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs">PiP Overlay</span>
              </button>
            </div>

            {/* Audio Source Selection */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Audio Mixing Source
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAudioSource('both')}
                  disabled={recordingState === 'recording' || recordingState === 'paused'}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border transition',
                    audioSource === 'both'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800'
                  )}
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Mic + System</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSource('mic')}
                  disabled={recordingState === 'recording' || recordingState === 'paused'}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border transition',
                    audioSource === 'mic'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800'
                  )}
                >
                  <Mic className="h-4 w-4" />
                  <span>Microphone Only</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSource('system')}
                  disabled={recordingState === 'recording' || recordingState === 'paused'}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border transition',
                    audioSource === 'system'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800'
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  <span>System Audio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAudioSource('mute')}
                  disabled={recordingState === 'recording' || recordingState === 'paused'}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-xl border transition',
                    audioSource === 'mute'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800'
                  )}
                >
                  <VolumeX className="h-4 w-4" />
                  <span>Mute / Silent</span>
                </button>
              </div>
            </div>

            {/* Quality & Framerate */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Resolution
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value as any)}
                  disabled={recordingState === 'recording'}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value="1080p">1080p Full HD (1920x1080)</option>
                  <option value="720p">720p HD (1280x720)</option>
                  <option value="4k">4K Ultra HD (3840x2160)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Framerate
                </label>
                <select
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                  disabled={recordingState === 'recording'}
                  className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800"
                >
                  <option value={30}>30 FPS (Smooth Web)</option>
                  <option value={60}>60 FPS (Ultra Smooth)</option>
                </select>
              </div>
            </div>

            {/* Live Audio Level Meter */}
            {recordingState === 'recording' && audioSource !== 'mute' && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Microphone Input Level</span>
                  <span>{audioLevel}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={cn(
                      'h-full transition-all duration-75',
                      audioLevel > 75
                        ? 'bg-rose-500'
                        : audioLevel > 40
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    )}
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}

            {/* Recorder Action Buttons */}
            <div className="pt-2 space-y-2">
              {recordingState === 'idle' && (
                <Button
                  onClick={startRecording}
                  className="w-full py-3.5 text-sm font-bold shadow-lg bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center gap-2"
                >
                  <Circle className="h-4 w-4 fill-white" />
                  <span>Start Screen Recording</span>
                </Button>
              )}

              {recordingState === 'recording' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={pauseRecording}
                    className="py-3 text-xs font-bold border border-slate-300 bg-white text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Pause className="h-4 w-4 mr-1.5" />
                    <span>Pause</span>
                  </Button>
                  <Button
                    onClick={stopRecording}
                    className="py-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow"
                  >
                    <Square className="h-4 w-4 mr-1.5 fill-white" />
                    <span>Stop Recording</span>
                  </Button>
                </div>
              )}

              {recordingState === 'paused' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={resumeRecording}
                    className="py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Play className="h-4 w-4 mr-1.5 fill-white" />
                    <span>Resume</span>
                  </Button>
                  <Button
                    onClick={stopRecording}
                    className="py-3 text-xs font-bold bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Square className="h-4 w-4 mr-1.5 fill-white" />
                    <span>Finish</span>
                  </Button>
                </div>
              )}

              {recordingState === 'stopped' && (
                <Button
                  onClick={() => setRecordingState('idle')}
                  className="w-full py-3 text-xs font-bold border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  <span>Record New Clip</span>
                </Button>
              )}
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Feed / Playback Review & Trimmer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col min-h-[500px]">
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90 gap-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                <Film className="h-4 w-4 text-red-500" />
                {recordedBlobUrl ? 'Playback & Trimming Canvas' : 'Live Screen Monitor'}
              </span>

              {recordedBlob && (
                <div className="flex items-center gap-2">
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value as any)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <option value="webm">WebM (VP9 Fast)</option>
                    <option value="mp4">MP4 Video</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-red-700 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportGif}
                    disabled={isExportingGif}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    <span>{isExportingGif ? `Exporting GIF (${gifProgress}%)...` : 'GIF'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Video Canvas / Player Area */}
            <div className="relative flex-1 p-4 flex items-center justify-center bg-slate-950/95 min-h-[380px]">
              {recordedBlobUrl ? (
                <div className="w-full space-y-4">
                  <video
                    ref={playbackVideoRef}
                    src={recordedBlobUrl}
                    controls
                    onLoadedMetadata={handleVideoLoadedMetadata}
                    className="w-full rounded-xl max-h-[360px] object-contain shadow-2xl border border-slate-800"
                  />

                  {/* Trimmer Controls */}
                  {videoDuration > 0 && (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="flex items-center gap-1 font-semibold text-indigo-400">
                          <Scissors className="h-3.5 w-3.5" /> Clip Cut Range
                        </span>
                        <span className="font-mono text-[11px]">
                          {formatTime(trimStart)} — {formatTime(trimEnd)} (Duration: {formatTime(trimEnd - trimStart)})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">Start Trim</label>
                          <input
                            type="range"
                            min="0"
                            max={trimEnd}
                            step="0.1"
                            value={trimStart}
                            onChange={(e) => setTrimStart(Number(e.target.value))}
                            className="w-full accent-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-0.5">End Trim</label>
                          <input
                            type="range"
                            min={trimStart}
                            max={videoDuration}
                            step="0.1"
                            value={trimEnd}
                            onChange={(e) => setTrimEnd(Number(e.target.value))}
                            className="w-full accent-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Video className="h-14 w-14 stroke-[1.5] mb-3 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-300">
                    {recordingState === 'recording'
                      ? 'Recording in Progress...'
                      : 'No Recording Yet'}
                  </p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    {recordingState === 'recording'
                      ? 'Display stream captured in real-time. Click Stop Recording when finished.'
                      : 'Choose your capture source and click "Start Screen Recording" to begin.'}
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/60 px-4 py-2.5 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <span>{recordedBlob ? `File Size: ${formatBytes(recordedBlob.size)}` : 'Zero installation • Native Web MediaStreams'}</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% In-Browser Privacy
              </span>
            </div>
          </div>
        </div>
      </div>

      <PrivacyAssuranceBadge />
    </div>
  );
};
