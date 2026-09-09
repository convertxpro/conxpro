'use client';

import React from 'react';
import Script from 'next/script';
import { ADSTERRA_DEFAULTS } from './ad-config';

export const AdsterraGlobal: React.FC = () => {
  const socialBarUrl =
    process.env.NEXT_PUBLIC_ADSTERRA_SOCIAL_BAR_URL || ADSTERRA_DEFAULTS.SOCIAL_BAR_URL;
  const popunderUrl = process.env.NEXT_PUBLIC_ADSTERRA_POPUNDER_URL;

  const normalizeScriptSrc = (src: string) => {
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return src;
    }
    return `//${src}`;
  };

  return (
    <>
      {/* Adsterra Social Bar (In-Page Push) */}
      {socialBarUrl && (
        <Script
          id="adsterra-social-bar"
          src={normalizeScriptSrc(socialBarUrl)}
          strategy="afterInteractive"
        />
      )}

      {/* Adsterra Popunder (Onclick) */}
      {popunderUrl && (
        <Script
          id="adsterra-popunder"
          src={normalizeScriptSrc(popunderUrl)}
          strategy="lazyOnload"
        />
      )}
    </>
  );
};
