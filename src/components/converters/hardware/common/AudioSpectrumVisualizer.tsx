'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Volume2, Activity, Radio, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type VisualizerMode = 'bars' | 'waveform' | 'spectrum' | 'circular';
export type VisualizerColorTheme = 'cyan' | 'purple' | 'emerald' | 'rainbow' | 'amber' | 'rose';

export interface AudioSpectrumVisualizerProps {
  analyserNode?: AnalyserNode | null;
  audioData?: Uint8Array | Float32Array | number[];
  mode?: VisualizerMode;
  colorTheme?: VisualizerColorTheme;
  height?: number;
  barCount?: number;
  showDecibels?: boolean;
  showPeakMeter?: boolean;
  showGrid?: boolean;
  isActive?: boolean;
  className?: string;
  onVolumeChange?: (db: number, peak: number) => void;
}

export const AudioSpectrumVisualizer: React.FC<AudioSpectrumVisualizerProps> = ({
  analyserNode,
  audioData,
  mode = 'bars',
  colorTheme = 'cyan',
  height = 140,
  barCount = 48,
  showDecibels = true,
  showPeakMeter = true,
  showGrid = true,
  isActive = true,
  className,
  onVolumeChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Peak tracking state
  const [currentDb, setCurrentDb] = useState<number>(-60);
  const [peakDb, setPeakDb] = useState<number>(-60);
  const peakDecayRef = useRef<number[]>([]);
  const peakHoldTimeRef = useRef<number[]>([]);

  // Peak history for VU meter
  const peakMeterRef = useRef<{ level: number; peak: number }>({ level: 0, peak: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;
    let idleAngle = 0;

    // Buffer arrays
    let freqDataArray: Uint8Array<ArrayBuffer>;
    let timeDataArray: Uint8Array<ArrayBuffer>;

    if (analyserNode) {
      analyserNode.fftSize = Math.max(128, barCount * 4);
      freqDataArray = new Uint8Array(new ArrayBuffer(analyserNode.frequencyBinCount));
      timeDataArray = new Uint8Array(new ArrayBuffer(analyserNode.frequencyBinCount));
    } else {
      freqDataArray = new Uint8Array(new ArrayBuffer(barCount));
      timeDataArray = new Uint8Array(new ArrayBuffer(barCount));
    }

    // Initialize peak decay arrays
    if (peakDecayRef.current.length !== barCount) {
      peakDecayRef.current = new Array(barCount).fill(0);
      peakHoldTimeRef.current = new Array(barCount).fill(0);
    }

    const render = () => {
      if (!isRunning) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = containerRef.current?.getBoundingClientRect();
      const displayWidth = rect?.width || 600;
      const displayHeight = height;

      // Update canvas resolution for high-DPI displays
      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
        ctx.scale(dpr, dpr);
      }

      const w = displayWidth;
      const h = displayHeight;

      // Clear background with translucent dark fill
      ctx.clearRect(0, 0, w, h);

      // Draw subtle background grid if requested
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        // Horizontal grid lines
        for (let y = 0; y < h; y += h / 4) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
        // Vertical grid lines
        for (let x = 0; x < w; x += w / 8) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
      }

      // Fetch live data from AnalyserNode or generate idle wave
      let hasSignal = false;
      let rms = 0;

      if (analyserNode && isActive) {
        try {
          analyserNode.getByteFrequencyData(freqDataArray);
          analyserNode.getByteTimeDomainData(timeDataArray);

          // Calculate RMS level
          let sumSquares = 0;
          for (let i = 0; i < timeDataArray.length; i++) {
            const normalized = (timeDataArray[i] - 128) / 128;
            sumSquares += normalized * normalized;
          }
          rms = Math.sqrt(sumSquares / timeDataArray.length);
          hasSignal = rms > 0.002;
        } catch {
          hasSignal = false;
        }
      }

      // Compute Decibel Level
      const calculatedDb = hasSignal ? Math.max(-60, Math.min(0, Math.round(20 * Math.log10(rms || 0.0001)))) : -60;
      if (Math.abs(calculatedDb - currentDb) > 0.5) {
        setCurrentDb(calculatedDb);
        setPeakDb((prev) => Math.max(prev, calculatedDb));
        if (onVolumeChange) {
          onVolumeChange(calculatedDb, Math.max(peakDb, calculatedDb));
        }
      }

      // 1. WAVEFORM MODE
      if (mode === 'waveform') {
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Gradient for waveform line
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        if (colorTheme === 'purple') {
          grad.addColorStop(0, '#8b5cf6');
          grad.addColorStop(0.5, '#ec4899');
          grad.addColorStop(1, '#8b5cf6');
        } else if (colorTheme === 'emerald') {
          grad.addColorStop(0, '#10b981');
          grad.addColorStop(0.5, '#06b6d4');
          grad.addColorStop(1, '#10b981');
        } else {
          // Cyan default
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#3b82f6');
          grad.addColorStop(1, '#8b5cf6');
        }

        ctx.strokeStyle = grad;
        ctx.shadowColor = colorTheme === 'purple' ? '#8b5cf6' : '#06b6d4';
        ctx.shadowBlur = hasSignal ? 10 : 4;

        ctx.beginPath();
        const sliceWidth = w / (timeDataArray.length || 100);
        let x = 0;

        for (let i = 0; i < timeDataArray.length; i++) {
          let v: number;
          if (hasSignal && analyserNode) {
            v = timeDataArray[i] / 128.0; // 0 to 2
          } else {
            // Ambient idle sinusoidal wave
            v = 1.0 + Math.sin(idleAngle + i * 0.05) * 0.08 + Math.cos(idleAngle * 0.5 + i * 0.02) * 0.04;
          }

          const y = (v * h) / 2;
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0; // Reset shadow

        // Fill below wave
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
        fillGrad.addColorStop(0, 'rgba(6, 182, 212, 0.15)');
        fillGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
        ctx.fillStyle = fillGrad;
        ctx.fill();
      }

      // 2. BARS & SPECTRUM MODE
      else {
        const totalBars = barCount;
        const barWidth = Math.max(2, (w - (totalBars - 1) * 3) / totalBars);
        const gap = 3;

        for (let i = 0; i < totalBars; i++) {
          let barHeight = 0;

          if (hasSignal && analyserNode) {
            // Map index exponentially for human hearing spectrum (bass to treble)
            const freqIndex = Math.min(
              freqDataArray.length - 1,
              Math.floor(Math.pow(i / totalBars, 1.4) * (freqDataArray.length * 0.75))
            );
            const rawVal = freqDataArray[freqIndex] || 0;
            barHeight = (rawVal / 255) * (h - 16);
          } else {
            // Ambient breathing bars
            const ambient = (Math.sin(idleAngle * 2 + i * 0.2) + 1) * 0.5;
            barHeight = 4 + ambient * 12;
          }

          barHeight = Math.max(3, barHeight);

          // Update peak caps with smooth gravity decay
          if (barHeight >= peakDecayRef.current[i]) {
            peakDecayRef.current[i] = barHeight;
            peakHoldTimeRef.current[i] = 12; // Hold frames
          } else {
            if (peakHoldTimeRef.current[i] > 0) {
              peakHoldTimeRef.current[i]--;
            } else {
              peakDecayRef.current[i] = Math.max(3, peakDecayRef.current[i] - 1.2);
            }
          }

          const x = i * (barWidth + gap);
          const y = h - barHeight;

          // Bar Gradient
          const barGrad = ctx.createLinearGradient(0, h, 0, y);
          if (colorTheme === 'purple') {
            barGrad.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
            barGrad.addColorStop(0.7, '#8b5cf6');
            barGrad.addColorStop(1, '#ec4899');
          } else if (colorTheme === 'emerald') {
            barGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
            barGrad.addColorStop(0.7, '#10b981');
            barGrad.addColorStop(1, '#06b6d4');
          } else if (colorTheme === 'rainbow') {
            const hue = (i / totalBars) * 280;
            barGrad.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.4)`);
            barGrad.addColorStop(1, `hsl(${hue}, 90%, 60%)`);
          } else {
            // Default Cyan to Indigo
            barGrad.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
            barGrad.addColorStop(0.6, '#06b6d4');
            barGrad.addColorStop(1, '#3b82f6');
          }

          // Draw rounded top bar
          ctx.fillStyle = barGrad;
          ctx.beginPath();
          const radius = Math.min(barWidth / 2, 4);
          ctx.moveTo(x, h);
          ctx.lineTo(x, y + radius);
          ctx.quadraticCurveTo(x, y, x + radius, y);
          ctx.lineTo(x + barWidth - radius, y);
          ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
          ctx.lineTo(x + barWidth, h);
          ctx.closePath();
          ctx.fill();

          // Draw peak floating cap
          const peakY = h - peakDecayRef.current[i] - 2;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, Math.max(0, peakY), barWidth, 2);
        }
      }

      idleAngle += 0.03;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyserNode, mode, colorTheme, height, barCount, showGrid, isActive, currentDb, peakDb, onVolumeChange]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-inner backdrop-blur-md',
        className
      )}
    >
      {/* Top telemetry HUD */}
      {(showDecibels || showPeakMeter) && (
        <div className="mb-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex h-2 w-2 rounded-full',
                currentDb > -50 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
              )}
            />
            <span className="font-semibold text-slate-300">Live Input Spectrum</span>
          </div>

          <div className="flex items-center gap-3">
            {showDecibels && (
              <div className="flex items-center gap-1 text-slate-400">
                <span>Signal:</span>
                <span
                  className={cn(
                    'font-bold',
                    currentDb > -6 ? 'text-rose-400' : currentDb > -20 ? 'text-emerald-400' : 'text-slate-300'
                  )}
                >
                  {currentDb > -60 ? `${currentDb} dBFS` : 'Silence'}
                </span>
              </div>
            )}

            {showPeakMeter && (
              <div className="flex items-center gap-1 text-slate-400">
                <span>Peak:</span>
                <span className="font-bold text-cyan-400">
                  {peakDb > -60 ? `${peakDb} dB` : '-∞'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Visualizer Canvas */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full block rounded-xl"
          style={{ width: '100%', height: `${height}px` }}
        />
      </div>

      {/* Bottom frequency range indicators */}
      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span>20 Hz (Sub-Bass)</span>
        <span>250 Hz (Mid)</span>
        <span>4 kHz (Presence)</span>
        <span>20 kHz (Air)</span>
      </div>
    </div>
  );
};
