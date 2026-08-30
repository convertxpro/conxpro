'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  RefreshCw,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sliders,
  Sun,
  Contrast,
  Sparkles,
  Download,
  Copy,
  Check,
  Video,
  VideoOff,
  Zap,
  ZoomIn,
  Grid,
  Square,
  Play,
  Pause,
  Clock,
  FlipHorizontal,
  Info,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Activity,
  Image as ImageIcon,
  CheckCircle2,
  Settings2,
  Eye,
  Trash2,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';
import { HardwareTestLayout, HardwareTestDevice } from './common/HardwareTestLayout';
import { PermissionPrompt, HardwarePermissionState } from './common/PermissionPrompt';
import { HardwareMetricCard } from './common/HardwareMetricCard';
import { cn } from '@/lib/utils';

export interface WebcamTesterComponentProps {
  tool?: ToolMetadata | { name: string; description: string; slug?: string };
}

interface CapturedSnapshot {
  id: string;
  dataUrl: string;
  timestamp: string;
  width: number;
  height: number;
}

export const WebcamTesterComponent: React.FC<WebcamTesterComponentProps> = ({
  tool = {
    name: 'Webcam & Camera Tester',
    description:
      'Test webcam video feed, detect live FPS, resolution (up to 4K), aspect ratio, color balance, and capture test photos 100% locally in your browser.',
    slug: 'webcam-test',
  },
}) => {
  // 1. Permission & Stream States
  const [permissionState, setPermissionState] = useState<HardwarePermissionState>('idle');
  const [devices, setDevices] = useState<HardwareTestDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [requestedResolution, setRequestedResolution] = useState<'auto' | '4k' | '1080p' | '720p' | '480p'>('auto');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 2. Telemetry States
  const [liveFps, setLiveFps] = useState<number>(0);
  const [resolution, setResolution] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [aspectRatioStr, setAspectRatioStr] = useState<string>('16:9');
  const [cameraLabel, setCameraLabel] = useState<string>('Standard Camera');
  const [supportedCapabilities, setSupportedCapabilities] = useState<MediaTrackCapabilities | null>(null);

  // 3. Visual Video Filter Adjustments
  const [isMirrored, setIsMirrored] = useState<boolean>(true);
  const [gridOverlay, setGridOverlay] = useState<'none' | 'rule-of-thirds' | 'crosshair'>('none');
  const [brightness, setBrightness] = useState<number>(100); // 50 - 150%
  const [contrast, setContrast] = useState<number>(100); // 50 - 150%
  const [saturation, setSaturation] = useState<number>(100); // 0 - 200%
  const [grayscale, setGrayscale] = useState<number>(0); // 0 - 100%
  const [invert, setInvert] = useState<number>(0); // 0 - 100%
  const [sepia, setSepia] = useState<number>(0); // 0 - 100%
  const [digitalZoom, setDigitalZoom] = useState<number>(1); // 1 - 3x
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState<boolean>(false);

  // 4. Snapshot & Video Capture States
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [selectedTimerOption, setSelectedTimerOption] = useState<0 | 3 | 5>(0);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [capturedSnapshots, setCapturedSnapshots] = useState<CapturedSnapshot[]>([]);
  const [activePreviewSnapshot, setActivePreviewSnapshot] = useState<CapturedSnapshot | null>(null);
  const [copiedSnapshotId, setCopiedSnapshotId] = useState<string | null>(null);

  // 5. Video Clip Recording Test
  const [isRecordingVideo, setIsRecordingVideo] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 6. UI & Layout States
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fpsFrameCountRef = useRef<number>(0);
  const fpsLastTimeRef = useRef<number>(performance.now());
  const fpsCallbackHandleRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play synthetic camera shutter sound
  const playShutterSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);

      // Noise click
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(1200, ctx.currentTime);
          gain2.gain.setValueAtTime(0.2, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.05);
        } catch {}
      }, 70);
    } catch {
      // Audio autoplay policy fallback
    }
  }, []);

  // Compute common aspect ratio string
  const calculateAspectRatio = (w: number, h: number): string => {
    if (!w || !h) return '16:9';
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(w, h);
    const aspectW = w / divisor;
    const aspectH = h / divisor;

    const ratio = w / h;
    if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9 (Widescreen)';
    if (Math.abs(ratio - 4 / 3) < 0.05) return '4:3 (Standard)';
    if (Math.abs(ratio - 1) < 0.05) return '1:1 (Square)';
    if (Math.abs(ratio - 21 / 9) < 0.05) return '21:9 (Ultrawide)';
    if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16 (Vertical)';
    return `${aspectW}:${aspectH}`;
  };

  // Stop active stream tracks cleanly
  const stopStream = useCallback(() => {
    if (fpsCallbackHandleRef.current) {
      if ('cancelVideoFrameCallback' in (videoRef.current || {})) {
        (videoRef.current as unknown as { cancelVideoFrameCallback: (id: number) => void }).cancelVideoFrameCallback(
          fpsCallbackHandleRef.current
        );
      } else {
        cancelAnimationFrame(fpsCallbackHandleRef.current);
      }
      fpsCallbackHandleRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setLiveFps(0);
  }, []);

  // Query Available Video Input Devices
  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = allDevices
        .filter((d) => d.kind === 'videoinput')
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Camera ${index + 1} (${d.deviceId.slice(0, 5)}...)`,
          kind: d.kind,
        }));

      setDevices(videoInputs);
      if (videoInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(videoInputs[0].deviceId);
      }
    } catch {
      // Ignored
    }
  }, [selectedDeviceId]);

  // Request & Start Camera Stream
  const startCamera = useCallback(
    async (deviceId?: string, resPref?: string) => {
      stopStream();
      setPermissionState('requesting');
      setErrorMessage('');

      if (!navigator.mediaDevices?.getUserMedia) {
        setPermissionState('unsupported');
        return;
      }

      // Determine requested dimensions
      const targetRes = resPref || requestedResolution;
      let widthConstraint: number | { ideal: number; max?: number } = { ideal: 1920 };
      let heightConstraint: number | { ideal: number; max?: number } = { ideal: 1080 };

      if (targetRes === '4k') {
        widthConstraint = { ideal: 3840, max: 3840 };
        heightConstraint = { ideal: 2160, max: 2160 };
      } else if (targetRes === '1080p') {
        widthConstraint = { ideal: 1920 };
        heightConstraint = { ideal: 1080 };
      } else if (targetRes === '720p') {
        widthConstraint = { ideal: 1280 };
        heightConstraint = { ideal: 720 };
      } else if (targetRes === '480p') {
        widthConstraint = { ideal: 640 };
        heightConstraint = { ideal: 480 };
      } else {
        // Auto / Max
        widthConstraint = { ideal: 3840 };
        heightConstraint = { ideal: 2160 };
      }

      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: deviceId || selectedDeviceId ? { exact: deviceId || selectedDeviceId } : undefined,
          facingMode: deviceId ? undefined : facingMode,
          width: widthConstraint,
          height: heightConstraint,
          frameRate: { ideal: 60, min: 15 },
        },
        audio: false,
      };

      let permStateBefore = 'unknown';
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const perm = await navigator.permissions.query({ name: 'camera' as PermissionName });
          permStateBefore = perm.state;
        }
      } catch (e) {
        // Ignored
      }

      const startTime = Date.now();

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          setCameraLabel(videoTrack.label || 'Webcam');
          if (videoTrack.getCapabilities) {
            setSupportedCapabilities(videoTrack.getCapabilities());
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        setPermissionState('granted');
        setIsCameraActive(true);
        await refreshDevices();
      } catch (err: unknown) {
        const elapsed = Date.now() - startTime;
        const error = err as { name?: string; message?: string };
        
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setPermissionState('denied');
          if (permStateBefore === 'prompt' && elapsed < 1000) {
            setErrorMessage('Camera access is blocked by your Operating System (e.g., Windows Privacy Settings). No browser prompt could be shown.');
          } else {
            setErrorMessage('Camera access was blocked by your browser or system permissions.');
          }
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setPermissionState('not-found');
          setErrorMessage('No camera device detected on this system.');
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
          setPermissionState('error');
          setErrorMessage('Camera is currently in use by another application (e.g. Zoom, Teams, Skype).');
        } else {
          setPermissionState('error');
          setErrorMessage(error.message || 'Failed to initialize camera video feed.');
        }
      }
    },
    [facingMode, refreshDevices, requestedResolution, selectedDeviceId, stopStream]
  );

  // Live FPS Telemetry Loop
  useEffect(() => {
    if (!isCameraActive || !videoRef.current) return;
    const video = videoRef.current;
    let isActive = true;

    fpsFrameCountRef.current = 0;
    fpsLastTimeRef.current = performance.now();

    const updateFps = () => {
      if (!isActive) return;
      fpsFrameCountRef.current++;
      const now = performance.now();
      const delta = now - fpsLastTimeRef.current;

      if (delta >= 800) {
        const measuredFps = Math.round((fpsFrameCountRef.current * 1000) / delta);
        setLiveFps(measuredFps);
        fpsFrameCountRef.current = 0;
        fpsLastTimeRef.current = now;
      }

      if ('requestVideoFrameCallback' in video) {
        fpsCallbackHandleRef.current = (
          video as unknown as { requestVideoFrameCallback: (cb: () => void) => number }
        ).requestVideoFrameCallback(updateFps);
      } else {
        fpsCallbackHandleRef.current = requestAnimationFrame(updateFps);
      }
    };

    if ('requestVideoFrameCallback' in video) {
      fpsCallbackHandleRef.current = (
        video as unknown as { requestVideoFrameCallback: (cb: () => void) => number }
      ).requestVideoFrameCallback(updateFps);
    } else {
      fpsCallbackHandleRef.current = requestAnimationFrame(updateFps);
    }

    return () => {
      isActive = false;
      if (fpsCallbackHandleRef.current) {
        if ('cancelVideoFrameCallback' in video) {
          (video as unknown as { cancelVideoFrameCallback: (id: number) => void }).cancelVideoFrameCallback(
            fpsCallbackHandleRef.current
          );
        } else {
          cancelAnimationFrame(fpsCallbackHandleRef.current);
        }
      }
    };
  }, [isCameraActive]);

  // Video Metadata Loaded (Resolution & Aspect Ratio)
  const handleVideoLoadedMetadata = () => {
    if (!videoRef.current) return;
    const w = videoRef.current.videoWidth || 0;
    const h = videoRef.current.videoHeight || 0;
    setResolution({ width: w, height: h });
    setAspectRatioStr(calculateAspectRatio(w, h));
  };

  // Switch Active Camera Device
  const handleDeviceChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    startCamera(deviceId, requestedResolution);
  };

  // Toggle Hardware Torch (if supported)
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const nextTorch = !torchEnabled;
      await (track as unknown as { applyConstraints: (c: unknown) => Promise<void> }).applyConstraints({
        advanced: [{ torch: nextTorch }],
      });
      setTorchEnabled(nextTorch);
    } catch {
      // Torch constraint failed
    }
  };

  // Execute Real Frame Drawing to Canvas at Full Native Resolution
  const executeSnapshot = useCallback(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;

    // Trigger Visual Flash & Audio Shutter
    setIsFlashActive(true);
    playShutterSound();
    setTimeout(() => setIsFlashActive(false), 220);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Apply Mirror & Filters to the Snapshot
    ctx.save();
    if (isMirrored) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    // Apply CSS filters on Canvas Context
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) invert(${invert}%) sepia(${sepia}%)`;

    // Apply digital zoom if active
    if (digitalZoom > 1) {
      const cropW = w / digitalZoom;
      const cropH = h / digitalZoom;
      const cropX = (w - cropW) / 2;
      const cropY = (h - cropH) / 2;
      ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, w, h);
    } else {
      ctx.drawImage(video, 0, 0, w, h);
    }

    ctx.restore();

    const dataUrl = canvas.toDataURL('image/png');
    const newSnapshot: CapturedSnapshot = {
      id: `snap-${Date.now()}`,
      dataUrl,
      timestamp: new Date().toLocaleTimeString(),
      width: w,
      height: h,
    };

    setCapturedSnapshots((prev) => [newSnapshot, ...prev]);
    setActivePreviewSnapshot(newSnapshot);
  }, [brightness, contrast, digitalZoom, grayscale, invert, isMirrored, playShutterSound, saturation, sepia]);

  // Perform Snapshot Capture (Direct or with Countdown)
  const triggerSnapshotCapture = () => {
    if (selectedTimerOption === 0) {
      executeSnapshot();
    } else {
      setCountdownSeconds(selectedTimerOption);
    }
  };

  // Countdown Timer Effect
  useEffect(() => {
    if (countdownSeconds === null) return;
    if (countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setCountdownSeconds(countdownSeconds - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdownSeconds === 0) {
      executeSnapshot();
      setCountdownSeconds(null);
    }
  }, [countdownSeconds, executeSnapshot]);


  // Video Clip Recording (5-10s test)
  const toggleVideoRecording = () => {
    if (isRecordingVideo) {
      stopVideoRecording();
    } else {
      startVideoRecording();
    }
  };

  const startVideoRecording = () => {
    if (!streamRef.current) return;
    try {
      recordedChunksRef.current = [];
      const options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp9,opus' };
      let recorder: MediaRecorder;
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) {
        recorder = new MediaRecorder(streamRef.current, options);
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
      } else {
        recorder = new MediaRecorder(streamRef.current);
      }

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        setIsRecordingVideo(false);
        setRecordingSeconds(0);
      };

      recorder.start(250);
      mediaRecorderRef.current = recorder;
      setIsRecordingVideo(true);
      setRecordingSeconds(0);

      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 15) {
            stopVideoRecording();
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      // MediaRecorder failure
    }
  };

  const stopVideoRecording = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  // Copy snapshot to clipboard
  const handleCopySnapshot = async (snapshot: CapturedSnapshot) => {
    try {
      const res = await fetch(snapshot.dataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedSnapshotId(snapshot.id);
      setTimeout(() => setCopiedSnapshotId(null), 2000);
    } catch {
      // Fallback
    }
  };

  // Reset visual filters
  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setInvert(0);
    setSepia(0);
    setDigitalZoom(1);
    setIsMirrored(true);
  };

  // Cleanup on unmount
  useEffect(() => {
    const audioCtx = audioContextRef.current;
    return () => {
      stopStream();
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (audioCtx) {
        audioCtx.close().catch(() => {});
      }
    };
  }, [stopStream]);


  // Video CSS filter string
  const activeFilterStyle = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) invert(${invert}%) sepia(${sepia}%)`;

  // Quality badge classification
  const getQualityBadge = () => {
    if (!resolution.width) return { label: 'Standby', variant: 'info' as const };
    if (resolution.width >= 3840) return { label: '4K UHD (Ultra HD)', variant: 'success' as const };
    if (resolution.width >= 1920) return { label: '1080p (Full HD)', variant: 'success' as const };
    if (resolution.width >= 1280) return { label: '720p (HD)', variant: 'info' as const };
    return { label: '480p (Standard)', variant: 'warning' as const };
  };

  const qualityBadge = getQualityBadge();

  // Full Telemetry Report Data
  const telemetryReport = {
    cameraName: cameraLabel,
    resolution: `${resolution.width}x${resolution.height}`,
    aspectRatio: aspectRatioStr,
    frameRateFps: liveFps,
    qualityCategory: qualityBadge.label,
    isMirrored,
    activeFilters: { brightness, contrast, saturation, grayscale, invert, sepia, digitalZoom },
  };

  return (
    <HardwareTestLayout
      tool={tool}
      activeDeviceId={selectedDeviceId}
      devices={devices}
      onDeviceChange={handleDeviceChange}
      onRefreshDevices={refreshDevices}
      statusBadge={isCameraActive ? { label: `${liveFps} FPS • ${resolution.width}x${resolution.height}`, variant: 'success' } : undefined}
      reportData={isCameraActive ? telemetryReport : undefined}
      onReset={() => {
        resetFilters();
        if (isCameraActive) startCamera(selectedDeviceId);
      }}
      onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      isFullscreen={isFullscreen}
    >
      {/* 1. Permission Prompt or Offline Standby View */}
      {!isCameraActive ? (
        <PermissionPrompt
          type="camera"
          state={permissionState}
          errorMessage={errorMessage}
          onRequestAccess={() => startCamera()}
          onRetry={() => startCamera()}
          buttonText="Start Webcam & FPS Test"
          description="Test your webcam video feed, calculate live real-time rendering FPS, benchmark native resolution (up to 4K), and test camera filters completely locally."
        />
      ) : (
        <div className="space-y-6">
          {/* 2. Main Live Video Viewport Container */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
            {/* Shutter Visual Flash overlay */}
            <div
              className={cn(
                'pointer-events-none absolute inset-0 z-30 bg-white transition-opacity duration-200',
                isFlashActive ? 'opacity-90' : 'opacity-0'
              )}
            />

            {/* Countdown Overlay Display */}
            {countdownSeconds !== null && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
                <div className="flex h-36 w-36 items-center justify-center rounded-full border-4 border-cyan-400 bg-slate-900/90 text-6xl font-black text-cyan-400 shadow-2xl shadow-cyan-500/50 animate-ping">
                  {countdownSeconds}
                </div>
              </div>
            )}

            {/* Live Video Feed Element */}
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-slate-950">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedMetadata={handleVideoLoadedMetadata}
                style={{
                  transform: `${isMirrored ? 'scaleX(-1)' : 'scaleX(1)'} scale(${digitalZoom})`,
                  filter: activeFilterStyle,
                  transformOrigin: 'center center',
                }}
                className="h-full w-full object-contain transition-all duration-150"
              />

              {/* Grid Overlays */}
              {gridOverlay === 'rule-of-thirds' && (
                <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 border border-cyan-500/30">
                  <div className="border-r border-b border-cyan-500/30" />
                  <div className="border-r border-b border-cyan-500/30" />
                  <div className="border-b border-cyan-500/30" />
                  <div className="border-r border-b border-cyan-500/30" />
                  <div className="border-r border-b border-cyan-500/30" />
                  <div className="border-b border-cyan-500/30" />
                  <div className="border-r border-cyan-500/30" />
                  <div className="border-r border-cyan-500/30" />
                  <div />
                </div>
              )}

              {gridOverlay === 'crosshair' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-full w-[1px] bg-cyan-400/40" />
                  <div className="absolute h-[1px] w-full bg-cyan-400/40" />
                  <div className="absolute h-16 w-16 rounded-full border border-cyan-400/60" />
                </div>
              )}

              {/* Top-Left Live Telemetry Floating HUD */}
              <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-xl bg-slate-950/80 px-3 py-1.5 text-xs font-mono font-bold text-white shadow-lg backdrop-blur-md border border-slate-800">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{liveFps > 0 ? `${liveFps} FPS` : 'Measuring...'}</span>
                </div>

                <div className="rounded-xl bg-slate-950/80 px-3 py-1.5 text-xs font-mono font-semibold text-cyan-300 shadow-lg backdrop-blur-md border border-slate-800">
                  {resolution.width > 0 ? `${resolution.width} × ${resolution.height}` : 'Detecting...'}
                </div>

                <div className="hidden sm:inline-flex rounded-xl bg-slate-950/80 px-3 py-1.5 text-xs font-mono font-medium text-slate-300 shadow-lg backdrop-blur-md border border-slate-800">
                  {aspectRatioStr}
                </div>
              </div>

              {/* Top-Right Recording / Quality Status Badge */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
                {isRecordingVideo && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-950/90 px-3 py-1.5 text-xs font-mono font-bold text-rose-300 border border-rose-500/50 animate-pulse">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                    <span>REC {recordingSeconds}s</span>
                  </div>
                )}

                <div className="rounded-xl bg-slate-950/80 px-3 py-1.5 text-xs font-bold text-white shadow-lg backdrop-blur-md border border-slate-800">
                  {qualityBadge.label}
                </div>
              </div>

              {/* Bottom Video Floating Action Bar */}
              <div className="absolute bottom-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-slate-950/85 p-2.5 shadow-2xl backdrop-blur-xl border border-slate-800">
                {/* Left quick toggles */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setIsMirrored(!isMirrored)}
                    title={isMirrored ? 'Disable Mirroring' : 'Enable Mirroring'}
                    className={cn(
                      'flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition',
                      isMirrored
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    )}
                  >
                    <FlipHorizontal className="h-4 w-4" />
                    <span className="hidden sm:inline">Mirror</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGridOverlay(gridOverlay === 'none' ? 'rule-of-thirds' : gridOverlay === 'rule-of-thirds' ? 'crosshair' : 'none');
                    }}
                    title="Cycle Framing Grid Overlay"
                    className={cn(
                      'flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition',
                      gridOverlay !== 'none'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    )}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="hidden sm:inline">Grid</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                    title="Toggle Visual Color Sliders"
                    className={cn(
                      'flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition',
                      showFiltersPanel
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    )}
                  >
                    <Sliders className="h-4 w-4" />
                    <span className="hidden sm:inline">Filters</span>
                  </button>
                </div>

                {/* Center Snapshot & Video Recording Triggers */}
                <div className="flex items-center gap-2">
                  {/* Timer selection dropdown */}
                  <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-0.5 text-[11px] font-bold text-slate-400">
                    <button
                      type="button"
                      onClick={() => setSelectedTimerOption(0)}
                      className={cn('rounded-lg px-2 py-1 transition', selectedTimerOption === 0 && 'bg-slate-800 text-white')}
                    >
                      0s
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTimerOption(3)}
                      className={cn('rounded-lg px-2 py-1 transition', selectedTimerOption === 3 && 'bg-slate-800 text-cyan-300')}
                    >
                      3s
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedTimerOption(5)}
                      className={cn('rounded-lg px-2 py-1 transition', selectedTimerOption === 5 && 'bg-slate-800 text-cyan-300')}
                    >
                      5s
                    </button>
                  </div>

                  {/* Main Big Photo Snapshot Button */}
                  <button
                    type="button"
                    onClick={triggerSnapshotCapture}
                    title="Take Photo Snapshot"
                    className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-cyan-500/30 transition hover:scale-105 active:scale-95"
                  >
                    <Camera className="h-4 w-4" />
                    <span>Snapshot</span>
                  </button>

                  {/* Video Clip Record Button */}
                  <button
                    type="button"
                    onClick={toggleVideoRecording}
                    title={isRecordingVideo ? 'Stop Video Recording' : 'Record 10s Video Test'}
                    className={cn(
                      'flex h-10 items-center gap-2 rounded-xl px-3.5 text-xs font-bold transition shadow-lg',
                      isRecordingVideo
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    )}
                  >
                    <Video className="h-4 w-4 text-rose-400" />
                    <span className="hidden sm:inline">{isRecordingVideo ? 'Stop' : 'Record'}</span>
                  </button>
                </div>

                {/* Right Stop / Refresh Control */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={stopStream}
                    title="Stop Camera Stream"
                    className="flex h-9 items-center gap-1.5 rounded-xl bg-rose-500/10 px-2.5 text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition"
                  >
                    <VideoOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Stop</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Real-Time CSS Filter & Zoom Tuning Drawer */}
            {showFiltersPanel && (
              <div className="border-t border-slate-800 bg-slate-900/90 p-4 sm:p-6 backdrop-blur-xl animate-in slide-in-from-top-4 duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-cyan-400" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white">Live Visual Filter Adjustments</h4>
                  </div>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-white transition"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset All</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-300">
                  {/* Brightness */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Brightness</span>
                      <span className="text-cyan-400">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Contrast</span>
                      <span className="text-cyan-400">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Saturation</span>
                      <span className="text-cyan-400">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Digital Zoom */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Digital Zoom</span>
                      <span className="text-cyan-400">{digitalZoom.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={digitalZoom}
                      onChange={(e) => setDigitalZoom(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Grayscale */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Grayscale</span>
                      <span className="text-cyan-400">{grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grayscale}
                      onChange={(e) => setGrayscale(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Invert */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Invert</span>
                      <span className="text-cyan-400">{invert}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={invert}
                      onChange={(e) => setInvert(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Sepia */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Sepia</span>
                      <span className="text-cyan-400">{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Resolution Override Selector */}
                  <div className="space-y-1.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800">
                    <div className="flex justify-between font-mono">
                      <span>Target Resolution</span>
                      <span className="text-cyan-400 uppercase">{requestedResolution}</span>
                    </div>
                    <select
                      value={requestedResolution}
                      onChange={(e) => {
                        const next = e.target.value as 'auto' | '4k' | '1080p' | '720p' | '480p';
                        setRequestedResolution(next);
                        startCamera(selectedDeviceId, next);
                      }}
                      className="w-full rounded-lg bg-slate-900 border border-slate-700 py-1 px-2 text-xs text-white font-semibold focus:outline-none"
                    >
                      <option value="auto">Auto / Max Available</option>
                      <option value="4k">4K UHD (3840x2160)</option>
                      <option value="1080p">1080p Full HD (1920x1080)</option>
                      <option value="720p">720p HD (1280x720)</option>
                      <option value="480p">480p Standard (640x480)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Hardware Telemetry Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <HardwareMetricCard
              title="Live Render Frame Rate"
              value={liveFps > 0 ? liveFps : '...'}
              unit="FPS"
              subtext={liveFps >= 50 ? 'Silky smooth 60 FPS video stream' : liveFps >= 24 ? 'Standard cinematic refresh' : 'Sub-optimal frame rate'}
              status={liveFps >= 28 ? 'optimal' : liveFps >= 18 ? 'warning' : 'neutral'}
              icon={Activity}
              copyable
            />

            <HardwareMetricCard
              title="Native Resolution"
              value={resolution.width > 0 ? `${resolution.width}×${resolution.height}` : '...'}
              unit={`${((resolution.width * resolution.height) / 1000000).toFixed(1)} MP`}
              subtext={qualityBadge.label}
              status={resolution.width >= 1920 ? 'optimal' : resolution.width >= 1280 ? 'good' : 'warning'}
              icon={Maximize2}
              copyable
            />

            <HardwareMetricCard
              title="Native Aspect Ratio"
              value={aspectRatioStr.split(' ')[0]}
              subtext={aspectRatioStr.split(' ')[1] || 'Format'}
              status="optimal"
              icon={Layers}
              copyable
            />

            <HardwareMetricCard
              title="Hardware Device"
              value={cameraLabel.length > 18 ? `${cameraLabel.slice(0, 18)}...` : cameraLabel}
              subtext="WebRTC Local Stream"
              status="optimal"
              icon={Camera}
            />
          </div>

          {/* 5. Recorded Video Playback Preview (if recorded) */}
          {recordedVideoUrl && (
            <div className="rounded-3xl border border-rose-500/30 bg-slate-950/80 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                  <Video className="h-5 w-5" />
                  <span>Recorded Video Test Clip</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={recordedVideoUrl}
                    download="convertx-webcam-test.webm"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:brightness-110 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download Clip</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setRecordedVideoUrl(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="relative aspect-video max-w-xl mx-auto rounded-2xl overflow-hidden border border-slate-800 bg-black">
                <video src={recordedVideoUrl} controls autoPlay className="h-full w-full object-contain" />
              </div>
            </div>
          )}

          {/* 6. Captured Snapshots Gallery */}
          {capturedSnapshots.length > 0 && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-base sm:text-lg">Captured Test Snapshots ({capturedSnapshots.length})</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCapturedSnapshots([])}
                  className="text-xs text-slate-400 hover:text-rose-400 transition"
                >
                  Clear Gallery
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {capturedSnapshots.map((snap) => (
                  <div
                    key={snap.id}
                    className="group relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 transition hover:border-cyan-500/50"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={snap.dataUrl} alt="Webcam snapshot" className="h-28 w-full object-cover" />

                    <div className="p-2 text-[10px] text-slate-400 flex justify-between items-center font-mono">
                      <span>{snap.width}x{snap.height}</span>
                      <span>{snap.timestamp}</span>
                    </div>

                    {/* Hover Action Overlay */}
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={snap.dataUrl}
                        download={`convertx-snapshot-${snap.timestamp.replace(/:/g, '-')}.png`}
                        title="Download Image"
                        className="p-2 rounded-xl bg-cyan-500 text-white hover:scale-110 transition shadow-md"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopySnapshot(snap)}
                        title="Copy to Clipboard"
                        className="p-2 rounded-xl bg-slate-800 text-white hover:scale-110 transition shadow-md"
                      >
                        {copiedSnapshotId === snap.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </HardwareTestLayout>
  );
};
