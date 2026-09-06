/* eslint-disable @next/next/no-img-element */
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
  RotateCcw,
  AlertCircle,
  Check,
  Monitor,
  Camera,
  Layers,
  Clock,
  Zap,
  Film,
  Camera as CameraIcon,
  Image as ImageIcon,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PrivacyAssuranceBadge } from '@/components/converters/common';
import { ToolMetadata } from '@/config/categories';
import { formatBytes } from '@/lib/utils';
import { NextActionRecommendations } from '@/components/conversion/NextActionRecommendations';

interface ScreenRecorderComponentProps {
  tool?: ToolMetadata;
}

type CaptureSource = 'screen' | 'webcam' | 'pip';
type AudioSource = 'both' | 'mic' | 'system' | 'mute';
type ExportFormat = 'webm' | 'mp4' | 'gif';

export const ScreenRecorderComponent: React.FC<ScreenRecorderComponentProps> = ({ tool }) => {
  // Configuration
  const [captureSource, setCaptureSource] = useState<CaptureSource>('screen');
  const [audioSource, setAudioSource] = useState<AudioSource>('both');
  const [resolution, setResolution] = useState<'1080p' | '720p' | '4k'>('1080p');
  const [fps, setFps] = useState<number>(30);

  // Countdown & Recording State
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingState, setRecordingState] = useState<'idle' | 'countdown' | 'recording' | 'paused' | 'stopped'>('idle');
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
  const [capturedSnapshotUrl, setCapturedSnapshotUrl] = useState<string | null>(null);

  // Refs for MediaStreams & AudioContext
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
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
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAllStreams();
      if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
      if (capturedSnapshotUrl) URL.revokeObjectURL(capturedSnapshotUrl);
    };
  }, [recordedBlobUrl, capturedSnapshotUrl]);

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
      console.warn('Audio metering error:', e);
    }
  };

  // Initiate countdown before recording
  const handleInitiateRecording = () => {
    setErrorMessage(null);
    setRecordingState('countdown');
    setCountdown(3);

    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setCountdown(null);
        startRecording();
      }
    }, 1000);
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

          // Draw circular webcam PiP in bottom-right
          const pipSize = canvas.width * 0.18;
          const pipX = canvas.width - pipSize - 40;
          const pipY = canvas.height - pipSize - 40;

          ctx.save();
          ctx.beginPath();
          ctx.arc(pipX + pipSize / 2, pipY + pipSize / 2, pipSize / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(camVideo, pipX, pipY, pipSize, pipSize);
          ctx.lineWidth = 6;
          ctx.strokeStyle = '#f59e0b';
          ctx.stroke();
          ctx.restore();

          if (recordingState === 'recording' || recordingState === 'idle') {
            requestAnimationFrame(drawFrame);
          }
        };
        requestAnimationFrame(drawFrame);

        finalStream = (canvas as any).captureStream(fps);

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

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = finalStream;
        previewVideoRef.current.play();
      }

      startAudioMeter(finalStream);

      // Supported MIME Types
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(finalStream, {
        mimeType,
        videoBitsPerSecond: resolution === '4k' ? 12000000 : 5000000,
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const fullBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        setRecordedBlob(fullBlob);
        const url = URL.createObjectURL(fullBlob);
        setRecordedBlobUrl(url);
        setRecordingState('stopped');
        stopAllStreams();
      };

      recorder.start(1000);
      mediaRecorderRef.current = recorder;
      setRecordingState('recording');
      setElapsedSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Failed to start recording:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'Screen recording permission was cancelled by the user.'
          : err.message || 'Failed to access screen or microphone.'
      );
      setRecordingState('idle');
      stopAllStreams();
    }
  };

  // Pause Recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Resume Recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Capture Frame Snapshot
  const handleSnapSnapshot = () => {
    if (!playbackVideoRef.current) return;
    const vid = playbackVideoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = vid.videoWidth || 1920;
    canvas.height = vid.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setCapturedSnapshotUrl(url);
        const a = document.createElement('a');
        a.href = url;
        a.download = `snapshot-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    }, 'image/png');
  };

  // Reset Studio
  const handleReset = () => {
    stopAllStreams();
    setRecordingState('idle');
    setElapsedSeconds(0);
    setRecordedBlob(null);
    if (recordedBlobUrl) URL.revokeObjectURL(recordedBlobUrl);
    setRecordedBlobUrl(null);
    setErrorMessage(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* 1. Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Screen & Webcam Studio Recorder
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                100% In-Browser Memory
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Record screen, application windows, or webcam with mixed microphone + tab audio, live PiP overlay, and instant MP4/WebM export.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Countdown Overlay */}
      {recordingState === 'countdown' && countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 rounded-full border-4 border-amber-500 flex items-center justify-center mx-auto text-6xl font-black text-amber-400 animate-pulse font-mono shadow-2xl shadow-amber-500/50">
              {countdown}
            </div>
            <p className="text-lg font-bold text-white tracking-wide">
              Starting Recording...
            </p>
          </div>
        </div>
      )}

      {/* 3. Setup Workspace when Idle */}
      {recordingState === 'idle' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Capture Sources (6 cols) */}
          <div className="lg:col-span-6 space-y-4 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Monitor className="w-4 h-4 text-amber-500" />
              <span>1. Choose Video Source</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'screen', label: 'Screen Only', desc: 'Display / Window / Tab', icon: Monitor },
                { id: 'pip', label: 'Screen + PiP', desc: 'Webcam Circle in Corner', icon: Layers },
                { id: 'webcam', label: 'Webcam Only', desc: 'Facecam Studio', icon: Camera },
              ].map((src) => {
                const IconComp = src.icon;
                const isSelected = captureSource === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setCaptureSource(src.id as CaptureSource)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <IconComp className="w-5 h-5 text-amber-500 mb-2" />
                    <div className="text-xs font-bold">{src.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal mt-0.5">{src.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Audio Sources */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-amber-500" />
                <span>Audio Input Source</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'both', label: 'Mic + Tab', desc: 'Mixed' },
                  { id: 'mic', label: 'Mic Only', desc: 'Voice' },
                  { id: 'system', label: 'Tab Only', desc: 'System' },
                  { id: 'mute', label: 'Muted', desc: 'No Audio' },
                ].map((aud) => (
                  <button
                    key={aud.id}
                    type="button"
                    onClick={() => setAudioSource(aud.id as AudioSource)}
                    className={`p-2.5 rounded-xl text-center border transition-all ${
                      audioSource === aud.id
                        ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs">{aud.label}</div>
                    <div className="text-[10px] text-slate-400">{aud.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quality Settings & Action (6 cols) */}
          <div className="lg:col-span-6 space-y-5 p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>2. Resolution & Framerate</span>
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: '1080p', label: '1080p Full HD', desc: 'Recommended' },
                  { id: '720p', label: '720p HD', desc: 'Smaller size' },
                  { id: '4k', label: '4K Ultra HD', desc: 'High Bitrate' },
                ].map((res) => (
                  <button
                    key={res.id}
                    type="button"
                    onClick={() => setResolution(res.id as any)}
                    className={`p-3 rounded-xl text-center border transition-all ${
                      resolution === res.id
                        ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold">{res.label}</div>
                    <div className="text-[10px] text-slate-400">{res.desc}</div>
                  </button>
                ))}
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Capture Framerate</span>
                  <span className="font-bold text-amber-500 font-mono">{fps} FPS</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFps(30)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border ${
                      fps === 30
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    30 FPS (Smooth Standard)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFps(60)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border ${
                      fps === 60
                        ? 'bg-amber-500/15 border-amber-500 text-amber-500'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    60 FPS (Ultra Fluid Gaming)
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleInitiateRecording}
              className="w-full py-4 text-base font-bold rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-xl shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
            >
              <Circle className="w-5 h-5 fill-rose-600 text-rose-600 animate-pulse" />
              <span>Start Screen Recording</span>
            </Button>
          </div>
        </div>
      )}

      {/* 4. Live Recording Viewport */}
      {(recordingState === 'recording' || recordingState === 'paused') && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {recordingState === 'recording' ? 'Recording Live...' : 'Recording Paused'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-black/80 font-mono text-sm font-bold text-amber-400 border border-slate-700">
                  {formatTime(elapsedSeconds)}
                </span>
              </div>
            </div>

            {/* Audio Waveform Volume Meter */}
            {audioSource !== 'mute' && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-500" />
                <div className="w-32 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 transition-all duration-75"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Live Preview Stream */}
          <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-2xl">
            <video
              ref={previewVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-contain"
            />
          </div>

          {/* Floating Recording Control Bar */}
          <div className="flex items-center justify-center gap-4 pt-2">
            {recordingState === 'recording' ? (
              <Button
                variant="outline"
                onClick={pauseRecording}
                className="py-3 px-6 rounded-xl font-bold text-sm flex items-center gap-2"
              >
                <Pause className="w-4 h-4 text-amber-500" />
                <span>Pause</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={resumeRecording}
                className="py-3 px-6 rounded-xl font-bold text-sm flex items-center gap-2"
              >
                <Play className="w-4 h-4 text-emerald-500" />
                <span>Resume</span>
              </Button>
            )}

            <Button
              onClick={stopRecording}
              className="py-3 px-8 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Finish & Stop Recording</span>
            </Button>
          </div>
        </div>
      )}

      {/* 5. Post-Recording Studio Player & Exporter */}
      {recordingState === 'stopped' && recordedBlobUrl && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Recording Captured Successfully!
                </h3>
                <p className="text-xs text-slate-500">
                  Preview your recording, capture frame snapshots, or export to MP4 / WebM.
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Record New Clip
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Video Playback Player */}
            <div className="lg:col-span-7 space-y-3">
              <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-800 shadow-2xl">
                <video
                  ref={playbackVideoRef}
                  src={recordedBlobUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Duration: {formatTime(elapsedSeconds)}</span>
                <span>Size: {formatBytes(recordedBlob?.size || 0)}</span>
              </div>
            </div>

            {/* Right: Export & Snapshot Tools */}
            <div className="lg:col-span-5 space-y-5">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>Download Recording</span>
                </span>

                <a
                  href={recordedBlobUrl}
                  download={`screen-recording-${Date.now()}.webm`}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all text-center"
                >
                  <Download className="w-4 h-4" />
                  <span>Download WebM Video (Fast)</span>
                </a>

                <Button
                  variant="outline"
                  onClick={handleSnapSnapshot}
                  className="w-full py-3 text-xs font-semibold rounded-xl flex items-center justify-center gap-2"
                >
                  <CameraIcon className="w-4 h-4 text-amber-500" />
                  <span>Snap & Save Frame as PNG</span>
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                <span className="font-semibold block mb-1">Privacy Guarantee</span>
                Your video recording was captured entirely inside local browser memory. Zero frames were uploaded to the cloud.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Privacy Assurance Badge */}
      <PrivacyAssuranceBadge
        customTitle="100% In-Browser Memory Video Recording"
        customDescription="Browser APIs (getDisplayMedia / getUserMedia) stream directly into memory. No background telemetry or recording storage."
      />

      {/* 7. Next Action Recommendations */}
      <NextActionRecommendations
        categorySlug="video"
        currentSlug={tool?.slug || 'screen-recorder'}
      />
    </div>
  );
};
