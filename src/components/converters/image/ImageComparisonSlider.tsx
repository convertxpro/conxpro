'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Sparkles, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageComparisonSliderProps {
  originalSrc: string;
  convertedSrc: string;
  originalLabel?: string;
  convertedLabel?: string;
  originalSize?: string;
  convertedSize?: string;
}

export const ImageComparisonSlider: React.FC<ImageComparisonSliderProps> = ({
  originalSrc,
  convertedSrc,
  originalLabel = 'Original Image',
  convertedLabel = 'Converted / Optimized',
  originalSize,
  convertedSize,
}) => {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const clamped = Math.max(0, Math.min(rect.width, x));
    const percent = (clamped / rect.width) * 100;
    setSliderPosition(percent);
  }, []);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || e.touches.length === 0) return;
      handleMove(e.touches[0].clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    },
    [isDragging, handleMove]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove]);

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
          <span>{originalLabel}</span>
          {originalSize && (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {originalSize}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          {convertedSize && (
            <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {convertedSize}
            </span>
          )}
          <span>{convertedLabel}</span>
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-500" />
        </div>
      </div>

      <div
        ref={containerRef}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onTouchStart={(e) => {
          if (e.touches.length > 0) {
            setIsDragging(true);
            handleMove(e.touches[0].clientX);
          }
        }}
        className="relative h-[320px] sm:h-[420px] w-full select-none overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-900/90 shadow-inner dark:border-slate-800 cursor-ew-resize"
      >
        {/* Background Layer: Converted / Optimized Image */}
        <div className="absolute inset-0 flex items-center justify-center p-2">
          <img
            src={convertedSrc}
            alt="Converted Result"
            className="max-h-full max-w-full object-contain pointer-events-none"
          />
        </div>

        {/* Foreground Layer: Original Image Clipped */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <div
            className="relative h-full"
            style={{
              width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%',
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center p-2">
              <img
                src={originalSrc}
                alt="Original Source"
                className="max-h-full max-w-full object-contain pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Split Divider Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg ring-2 ring-white">
            <span className="text-[10px] font-bold">↔</span>
          </div>
        </div>

        {/* Floating Badges */}
        <div className="absolute bottom-3 left-3 pointer-events-none rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
          Original
        </div>
        <div className="absolute bottom-3 right-3 pointer-events-none rounded-lg bg-indigo-600/80 px-2 py-1 text-[10px] font-bold text-white backdrop-blur-md">
          Output ({Math.round(sliderPosition)}%)
        </div>
      </div>

      <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
        Drag the split slider horizontally to inspect compression fidelity and pixel sharpness.
      </p>
    </div>
  );
};
