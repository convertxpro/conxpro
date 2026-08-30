import React from 'react';
import { Check, X, Sparkles } from 'lucide-react';

export interface ImageFormatRow {
  format: string;
  name: string;
  transparency: boolean | string;
  compression: string;
  bestFor: string;
  browserSupport: string;
  isPopular?: boolean;
}

export const IMAGE_FORMAT_DATA: ImageFormatRow[] = [
  {
    format: 'WebP',
    name: 'Google WebP (.webp)',
    transparency: 'Yes (Alpha Channel)',
    compression: '25–35% smaller than JPG',
    bestFor: 'Modern websites, Core Web Vitals, fast page speed',
    browserSupport: '97%+ modern browsers (Chrome, Safari, Edge, Firefox)',
    isPopular: true,
  },
  {
    format: 'JPG / JPEG',
    name: 'Joint Photographic Experts (.jpg, .jpeg)',
    transparency: 'No (Opaque)',
    compression: 'High lossy compression (MozJPEG)',
    bestFor: 'Photographs, blog images, realistic artwork',
    browserSupport: '100% universal (All browsers & operating systems)',
    isPopular: true,
  },
  {
    format: 'PNG',
    name: 'Portable Network Graphics (.png)',
    transparency: 'Yes (Lossless Alpha 24-bit/32-bit)',
    compression: 'Lossless / Minimal compression',
    bestFor: 'Logos, screenshots, UI icons, transparent cutouts',
    browserSupport: '100% universal compatibility',
    isPopular: true,
  },
  {
    format: 'HEIC / HEIF',
    name: 'High Efficiency Image Container (.heic)',
    transparency: 'Yes (Alpha)',
    compression: '50% smaller than standard JPG',
    bestFor: 'Apple iPhone / iPad camera captures',
    browserSupport: 'Native in Safari / Apple iOS / macOS (Converts to JPG on web)',
    isPopular: true,
  },
  {
    format: 'AVIF',
    name: 'AV1 Image File Format (.avif)',
    transparency: 'Yes (Alpha & HDR)',
    compression: '50% smaller than JPG, 20% smaller than WebP',
    bestFor: 'Next-gen web performance and HDR photography',
    browserSupport: '93%+ modern browsers (Chrome, Firefox, Safari 16+)',
  },
  {
    format: 'GIF',
    name: 'Graphics Interchange Format (.gif)',
    transparency: 'Yes (1-bit index transparency)',
    compression: '8-bit color index (256 colors)',
    bestFor: 'Animated short loops, memes, reaction graphics',
    browserSupport: '100% universal across all email clients and web',
  },
  {
    format: 'SVG',
    name: 'Scalable Vector Graphics (.svg)',
    transparency: 'Yes (Vector Alpha)',
    compression: 'XML vector code (Infinite crispness)',
    bestFor: 'Vector icons, illustration assets, typography, responsive logos',
    browserSupport: '100% modern browsers',
  },
  {
    format: 'TIFF',
    name: 'Tagged Image File Format (.tiff)',
    transparency: 'Yes (16-bit / 32-bit deep color)',
    compression: 'Uncompressed or lossless LZW/Deflate',
    bestFor: 'Print publishing, professional photography editing, scanning',
    browserSupport: 'Desktop imaging software (Photoshop, InDesign)',
  },
];

export const ImageFormatComparisonTable: React.FC = () => {
  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900">
      <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-6 dark:border-slate-800/70 dark:bg-slate-950/40">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Image Format Comparison Matrix
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Compare transparency support, compression efficiency, best use cases, and browser
          compatibility.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-slate-200 bg-slate-100/50 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 sm:px-6">Format</th>
              <th className="px-4 py-3 sm:px-6">Transparency</th>
              <th className="px-4 py-3 sm:px-6">Typical Compression</th>
              <th className="px-4 py-3 sm:px-6">Best For</th>
              <th className="px-4 py-3 sm:px-6">Browser Support</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {IMAGE_FORMAT_DATA.map((row) => (
              <tr
                key={row.format}
                className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
              >
                <td className="whitespace-nowrap px-4 py-3.5 sm:px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{row.format}</span>
                    {row.isPopular && (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        Popular
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{row.name}</span>
                </td>
                <td className="px-4 py-3.5 sm:px-6 text-slate-700 dark:text-slate-300">
                  {typeof row.transparency === 'string' ? (
                    row.transparency
                  ) : row.transparency ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="h-3.5 w-3.5" /> Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-400">
                      <X className="h-3.5 w-3.5" /> No
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 sm:px-6 font-medium text-slate-800 dark:text-slate-200">
                  {row.compression}
                </td>
                <td className="px-4 py-3.5 sm:px-6 text-slate-600 dark:text-slate-400 max-w-[220px]">
                  {row.bestFor}
                </td>
                <td className="px-4 py-3.5 sm:px-6 text-slate-600 dark:text-slate-400">
                  {row.browserSupport}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
