import React from 'react';
import Script from 'next/script';

export const AdSenseScript: React.FC = () => {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9256656578273481';

  // Only render if a client ID is available and in non-test mode
  if (!clientId) return null;

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};
