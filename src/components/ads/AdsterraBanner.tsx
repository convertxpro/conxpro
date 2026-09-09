'use client';

import React, { useId } from 'react';
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
 * Using srcDoc avoids global `atOptions` variable collisions across multiple units,
 * prevents `document.write` runtime errors in React / Next.js client-side navigation,
 * and completely locks Cumulative Layout Shift (CLS).
 */
export const AdsterraBanner: React.FC<AdsterraBannerProps> = ({
  adKey,
  width,
  height,
  hostDomain,
  className,
}) => {
  const uniqueId = useId();

  if (!adKey) return null;

  const rawHost = hostDomain || process.env.NEXT_PUBLIC_ADSTERRA_HOST || 'www.highrevenueformat.com';
  const cleanHost = rawHost.replace(/^https?:\/\//, '').replace(/\/$/, '');

  // Clean HTML payload to be executed in the isolated iframe context
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
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
      className={cn('flex items-center justify-center overflow-hidden max-w-full', className)}
      style={{
        minHeight: `${height}px`,
        width: '100%',
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
          maxWidth: '100%',
        }}
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
        loading="lazy"
      />
    </div>
  );
};
