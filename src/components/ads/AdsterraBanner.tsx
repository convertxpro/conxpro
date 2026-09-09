'use client';

import React, { useId, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export interface AdsterraBannerProps {
  adKey: string;
  width: number;
  height: number;
  hostDomain?: string;
  className?: string;
}

/**
 * AdsterraBanner renders an isolated sandboxed iframe for Adsterra banner units.
 * Features:
 * - Fluid auto-scaling: scales down on mobile viewports so banners are NEVER cut off horizontally.
 * - Exact height reservation: prevents vertical clipping.
 * - Sandboxed iframe: isolates global atOptions and prevents document.write errors.
 */
export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  adKey,
  width,
  height,
  hostDomain,
  className,
}) => {
  const uniqueId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Auto-scale on mobile/narrow screens to fit the viewport perfectly
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const availableWidth = containerRef.current.parentElement?.clientWidth || window.innerWidth;
      if (availableWidth < width && availableWidth > 0) {
        // Leave a slight 8px margin buffer
        const computedScale = Math.min(1, (availableWidth - 8) / width);
        setScale(Math.max(0.4, computedScale));
      } else {
        setScale(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [width]);

  if (!adKey) return null;

  const rawHost = hostDomain || process.env.NEXT_PUBLIC_ADSTERRA_HOST || 'www.highrevenueformat.com';
  const cleanHost = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '');

  const scaledHeight = Math.round(height * scale);

  // Clean HTML payload executed in the isolated iframe context
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    iframe {
      border: 0 !important;
      margin: 0 !important;
      display: block !important;
      max-width: 100% !important;
      max-height: 100% !important;
    }
  </style>
</head>
<body>
  <script type="text/javascript">
    atOptions = {
      'key': '${adKey}',
      'format': 'iframe',
      'height': ${height},
      'width': ${width},
      'params': {}
    };
  </script>
  <script type="text/javascript" src="https://${cleanHost}/${adKey}/invoke.js"></script>
</body>
</html>`;

  return (
    <div
      ref={containerRef}
      className={cn('flex items-center justify-center overflow-hidden w-full mx-auto', className)}
      style={{
        height: `${scaledHeight}px`,
        minHeight: `${scaledHeight}px`,
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <iframe
          id={`adsterra-banner-${uniqueId}`}
          title={`Adsterra ${width}x${height} Unit`}
          srcDoc={htmlContent}
          width={width}
          height={height}
          scrolling="no"
          frameBorder="0"
          style={{
            border: 'none',
            overflow: 'hidden',
            width: `${width}px`,
            height: `${height}px`,
            display: 'block',
          }}
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
          loading="lazy"
        />
      </div>
    </div>
  );
};
