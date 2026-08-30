'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Minimize2,
  PenTool,
  Shield,
  FileText,
  FileCheck,
  Scissors,
  Music,
  Video,
  Volume2,
  Layers,
  Image as ImageIcon,
  Wand2,
  Stamp,
  Calculator,
  Laptop,
  Building2,
  Sun,
  Coins,
  Receipt,
  FileCode,
  FileDiff,
  Key,
  Hash,
  Terminal,
  Code2,
  DollarSign,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export interface RecommendationItem {
  slug: string;
  categorySlug: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
}

export interface NextActionRule {
  triggerSlugs: string[];
  recommendations: RecommendationItem[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Minimize2,
  PenTool,
  Shield,
  FileText,
  FileCheck,
  Scissors,
  Music,
  Video,
  Volume2,
  Layers,
  ImageIcon,
  Wand2,
  Stamp,
  Calculator,
  Laptop,
  Building2,
  Sun,
  Coins,
  Receipt,
  FileCode,
  FileDiff,
  Key,
  Hash,
  Terminal,
  Code2,
  DollarSign,
  Sparkles,
};

export const NEXT_ACTION_RULES: NextActionRule[] = [
  // 1. PDF Tools
  {
    triggerSlugs: ['merge-pdf', 'jpg-to-pdf', 'organize-pdf', 'images-to-pdf'],
    recommendations: [
      {
        slug: 'compress-pdf',
        categorySlug: 'document',
        title: 'Compress PDF',
        description: 'Shrink file size up to 90% while preserving crystal-clear visual quality.',
        iconName: 'Minimize2',
        badge: 'Recommended',
      },
      {
        slug: 'sign-pdf',
        categorySlug: 'document',
        title: 'Sign & Stamp PDF',
        description: 'Add your digital signature, custom stamps, and verification marks.',
        iconName: 'PenTool',
        badge: 'New',
      },
      {
        slug: 'protect-pdf',
        categorySlug: 'document',
        title: 'Protect PDF with Password',
        description: 'Encrypt your document with military-grade AES-256 password protection.',
        iconName: 'Shield',
      },
    ],
  },
  {
    triggerSlugs: ['compress-pdf'],
    recommendations: [
      {
        slug: 'sign-pdf',
        categorySlug: 'document',
        title: 'Sign & Stamp PDF',
        description: 'Sign or stamp your newly compressed document with zero friction.',
        iconName: 'PenTool',
        badge: 'Popular',
      },
      {
        slug: 'redact-pdf',
        categorySlug: 'document',
        title: 'Redact Confidential Data',
        description: 'Black out CNIC, phone numbers, and sensitive details permanently.',
        iconName: 'Scissors',
        badge: '100% Private',
      },
    ],
  },
  {
    triggerSlugs: ['split-pdf', 'rotate-pdf', 'redact-pdf', 'sign-pdf'],
    recommendations: [
      {
        slug: 'compress-pdf',
        categorySlug: 'document',
        title: 'Compress PDF',
        description: 'Optimize and reduce size before emailing or attaching to portals.',
        iconName: 'Minimize2',
        badge: 'Recommended',
      },
      {
        slug: 'organize-pdf',
        categorySlug: 'document',
        title: 'Organize & Rearrange Pages',
        description: 'Reorder, rotate, or delete individual pages visually.',
        iconName: 'Layers',
      },
    ],
  },

  // 2. Media, Video & Audio Tools
  {
    triggerSlugs: ['video-to-mp3', 'video-converter', 'mp4-to-mp3', 'extract-audio'],
    recommendations: [
      {
        slug: 'audio-speed-pitch-changer',
        categorySlug: 'audio',
        title: 'Audio Speed & Pitch Changer',
        description: 'Speed up podcasts (1.25x-2x) or fine-tune audio pitch with WebAudio.',
        iconName: 'Volume2',
        badge: 'Instant',
      },
      {
        slug: 'audio-joiner',
        categorySlug: 'audio',
        title: 'Audio Joiner & Combiner',
        description: 'Merge multiple audio tracks, voice notes, and songs seamlessly.',
        iconName: 'Music',
      },
    ],
  },
  {
    triggerSlugs: ['audio-speed-pitch-changer', 'audio-joiner'],
    recommendations: [
      {
        slug: 'burn-subtitles-to-video',
        categorySlug: 'video',
        title: 'Burn Subtitles to Video',
        description: 'Hardcode SRT captions into MP4 videos for TikTok, Reels, and Shorts.',
        iconName: 'Video',
        badge: 'Viral',
      },
      {
        slug: 'screen-recorder',
        categorySlug: 'video',
        title: 'In-Browser Screen Recorder',
        description: 'Record high-res browser tabs, webcam, and system audio without watermark.',
        iconName: 'Video',
      },
    ],
  },
  {
    triggerSlugs: ['video-aspect-ratio-resizer', 'gif-to-mp4', 'burn-subtitles-to-video', 'mute-video-replace-audio'],
    recommendations: [
      {
        slug: 'video-to-mp3',
        categorySlug: 'media',
        title: 'Extract MP3 Audio',
        description: 'Extract 320kbps lossless audio track from your completed video.',
        iconName: 'Music',
        badge: '320kbps',
      },
      {
        slug: 'screen-recorder',
        categorySlug: 'video',
        title: 'Screen & Webcam Recorder',
        description: 'Capture high-framerate tutorials and product demos directly in browser.',
        iconName: 'Video',
      },
    ],
  },

  // 3. Image Suite
  {
    triggerSlugs: ['svg-to-png', 'png-to-svg', 'webp-to-png', 'jpg-to-png', 'image-converter'],
    recommendations: [
      {
        slug: 'remove-background',
        categorySlug: 'image',
        title: 'AI Background Remover',
        description: 'Cut out subjects with in-browser neural segmentation in under 2 seconds.',
        iconName: 'Wand2',
        badge: 'Client-Side AI',
      },
      {
        slug: 'batch-watermark-images',
        categorySlug: 'image',
        title: 'Batch Watermarker',
        description: 'Protect your brand with custom tiled or corner logo stamps.',
        iconName: 'Stamp',
      },
      {
        slug: 'image-to-text-ocr',
        categorySlug: 'developer',
        title: 'Image to Text OCR',
        description: 'Extract Urdu, Arabic, and English text directly from image scans.',
        iconName: 'FileText',
      },
    ],
  },
  {
    triggerSlugs: ['remove-background', 'batch-watermark-images'],
    recommendations: [
      {
        slug: 'jpg-to-pdf',
        categorySlug: 'document',
        title: 'JPG / PNG to PDF',
        description: 'Package your processed photos and designs into a clean PDF booklet.',
        iconName: 'FileCheck',
        badge: 'Recommended',
      },
      {
        slug: 'image-to-text-ocr',
        categorySlug: 'developer',
        title: 'Image to Text OCR',
        description: 'Extract editable text from scanned documents and receipts.',
        iconName: 'FileText',
      },
    ],
  },

  // 4. Pakistan Tax & Financial Moats
  {
    triggerSlugs: ['fbr-salary-tax-calculator', 'pta-mobile-tax-calculator'],
    recommendations: [
      {
        slug: 'freelance-tax-calculator',
        categorySlug: 'pakistan',
        title: 'Freelancer IT Tax Calculator',
        description: 'Calculate 0.25% PSEB export tax vs standard slab rates for IT exports.',
        iconName: 'Laptop',
        badge: '0.25% Tax',
      },
      {
        slug: 'property-tax-calculator',
        categorySlug: 'pakistan',
        title: 'Property Transfer & Stamp Duty',
        description: 'Calculate 236K/236C withholding taxes and e-Stamping costs for Filer & Non-Filer.',
        iconName: 'Building2',
      },
      {
        slug: 'zakat-calculator',
        categorySlug: 'pakistan',
        title: 'Zakat & Nisab Calculator',
        description: 'Calculate accurate Zakat on gold, silver, cash, savings, and investments.',
        iconName: 'Coins',
      },
    ],
  },
  {
    triggerSlugs: ['freelance-tax-calculator', 'property-tax-calculator', 'vehicle-token-tax-calculator'],
    recommendations: [
      {
        slug: 'fbr-salary-tax-calculator',
        categorySlug: 'pakistan',
        title: 'FBR Salary Tax Calculator (2024-2025)',
        description: 'Check latest monthly and yearly income tax breakdown for salaried staff.',
        iconName: 'Receipt',
        badge: 'Updated Slabs',
      },
      {
        slug: 'electricity-bill-solar-calculator',
        categorySlug: 'pakistan',
        title: 'Electricity Bill & Solar ROI Calculator',
        description: 'Calculate LESCO/K-Electric slab tariffs and net metering payback period.',
        iconName: 'Sun',
      },
    ],
  },
  {
    triggerSlugs: ['marla-to-square-feet', 'square-feet-to-marla', 'murabba-bigha-to-acre'],
    recommendations: [
      {
        slug: 'property-tax-calculator',
        categorySlug: 'pakistan',
        title: 'Property Transfer & Advance Tax (236K/C)',
        description: 'Instant calculation of FBR DC rates, CVT, and e-Stamping fees.',
        iconName: 'Building2',
        badge: '2024-25 Rules',
      },
      {
        slug: 'fbr-salary-tax-calculator',
        categorySlug: 'pakistan',
        title: 'FBR Tax Calculator',
        description: 'Calculate your annual income tax liability to optimize property purchases.',
        iconName: 'Calculator',
      },
    ],
  },

  // 5. Developer & Data Tools
  {
    triggerSlugs: ['json-formatter', 'json-to-csv', 'csv-to-json', 'yaml-to-json', 'sql-to-json'],
    recommendations: [
      {
        slug: 'diff-checker',
        categorySlug: 'developer',
        title: 'Side-by-Side Diff Checker',
        description: 'Compare code, JSON, and text with character-level difference highlighting.',
        iconName: 'FileDiff',
        badge: 'Instant',
      },
      {
        slug: 'csv-deduplicator-splitter',
        categorySlug: 'developer',
        title: 'CSV Deduplicator & Chunk Splitter',
        description: 'Clean massive 500MB+ CSV files with zero memory crashes in-browser.',
        iconName: 'Layers',
        badge: 'Fast',
      },
      {
        slug: 'jwt-decoder',
        categorySlug: 'developer',
        title: 'JWT Token Decoder & Verifier',
        description: 'Inspect JWT headers, claims, and expiry dates with zero network tracking.',
        iconName: 'Key',
      },
    ],
  },
  {
    triggerSlugs: ['image-to-text-ocr', 'scanned-pdf-to-text', 'diff-checker', 'curl-to-code', 'csv-deduplicator-splitter'],
    recommendations: [
      {
        slug: 'json-formatter',
        categorySlug: 'developer',
        title: 'JSON Formatter & Validator',
        description: 'Format, validate, and minify nested JSON data with syntax highlights.',
        iconName: 'FileCode',
      },
      {
        slug: 'hash-generator',
        categorySlug: 'developer',
        title: 'Crypto Hash Generator',
        description: 'Generate instant SHA-256, MD5, and HMAC signatures client-side.',
        iconName: 'Hash',
      },
    ],
  },

  // 6. Currency / Forex Tools
  {
    triggerSlugs: ['usd-to-pkr', 'sar-to-pkr', 'aed-to-pkr', 'gbp-to-pkr', 'eur-to-pkr', 'currency-converter'],
    recommendations: [
      {
        slug: 'freelance-tax-calculator',
        categorySlug: 'pakistan',
        title: 'Freelancer IT Tax Calculator',
        description: 'Calculate withholding taxes on USD/EUR foreign remittance payouts.',
        iconName: 'Laptop',
        badge: '0.25% PSEB',
      },
      {
        slug: 'tola-to-grams',
        categorySlug: 'pakistan',
        title: 'Gold Tola to Grams Converter',
        description: 'Calculate 24K / 22K Sarafa market gold rates and jewelry valuations.',
        iconName: 'Coins',
      },
      {
        slug: 'fbr-salary-tax-calculator',
        categorySlug: 'pakistan',
        title: 'FBR Salary Tax Calculator',
        description: 'Calculate net income and tax brackets for salaried professionals.',
        iconName: 'Calculator',
      },
    ],
  },
];

// Fallback recommendations by category if specific slug isn't explicitly defined
const CATEGORY_FALLBACKS: Record<string, RecommendationItem[]> = {
  document: [
    {
      slug: 'compress-pdf',
      categorySlug: 'document',
      title: 'Compress PDF Document',
      description: 'Reduce PDF file size up to 90% while keeping high visual clarity.',
      iconName: 'Minimize2',
      badge: 'Popular',
    },
    {
      slug: 'sign-pdf',
      categorySlug: 'document',
      title: 'Sign & Stamp PDF',
      description: 'Add your digital signature or stamp to any document.',
      iconName: 'PenTool',
    },
  ],
  media: [
    {
      slug: 'video-to-mp3',
      categorySlug: 'media',
      title: 'Extract MP3 Audio',
      description: 'Extract crisp audio tracks from any video format.',
      iconName: 'Music',
      badge: 'Fast',
    },
    {
      slug: 'audio-speed-pitch-changer',
      categorySlug: 'audio',
      title: 'Audio Speed Changer',
      description: 'Adjust playback speed and audio pitch with WebAudio.',
      iconName: 'Volume2',
    },
  ],
  video: [
    {
      slug: 'burn-subtitles-to-video',
      categorySlug: 'video',
      title: 'Burn Subtitles to Video',
      description: 'Hardcode SRT captions for social media reels.',
      iconName: 'Video',
    },
    {
      slug: 'screen-recorder',
      categorySlug: 'video',
      title: 'Screen Recorder',
      description: 'Capture browser tabs and desktop with audio.',
      iconName: 'Video',
    },
  ],
  audio: [
    {
      slug: 'audio-joiner',
      categorySlug: 'audio',
      title: 'Audio Joiner',
      description: 'Merge multiple audio files into a single seamless track.',
      iconName: 'Music',
    },
    {
      slug: 'audio-speed-pitch-changer',
      categorySlug: 'audio',
      title: 'Audio Speed & Pitch',
      description: 'Change playback speed and pitch without quality loss.',
      iconName: 'Volume2',
    },
  ],
  image: [
    {
      slug: 'remove-background',
      categorySlug: 'image',
      title: 'AI Background Remover',
      description: 'Instantly remove backgrounds in your browser with AI.',
      iconName: 'Wand2',
      badge: 'AI Powered',
    },
    {
      slug: 'batch-watermark-images',
      categorySlug: 'image',
      title: 'Batch Watermark',
      description: 'Stamp multiple images with custom logos or text.',
      iconName: 'Stamp',
    },
  ],
  pakistan: [
    {
      slug: 'fbr-salary-tax-calculator',
      categorySlug: 'pakistan',
      title: 'FBR Salary Tax (2024-25)',
      description: 'Accurate monthly and annual tax breakdown for Pakistan.',
      iconName: 'Receipt',
      badge: '2024-25 Slabs',
    },
    {
      slug: 'freelance-tax-calculator',
      categorySlug: 'pakistan',
      title: 'Freelance IT Tax (0.25%)',
      description: 'Calculate PSEB export tax vs standard tax slabs.',
      iconName: 'Laptop',
    },
  ],
  developer: [
    {
      slug: 'diff-checker',
      categorySlug: 'developer',
      title: 'Diff Checker',
      description: 'Inspect text and code differences with highlighting.',
      iconName: 'FileDiff',
    },
    {
      slug: 'json-formatter',
      categorySlug: 'developer',
      title: 'JSON Formatter',
      description: 'Prettify, validate, and minify JSON data structures.',
      iconName: 'FileCode',
    },
  ],
  currency: [
    {
      slug: 'usd-to-pkr',
      categorySlug: 'currency',
      title: 'USD to PKR Live Rate',
      description: 'Check real-time USD/PKR interbank and open market rates.',
      iconName: 'DollarSign',
    },
    {
      slug: 'freelance-tax-calculator',
      categorySlug: 'pakistan',
      title: 'Freelancer IT Tax',
      description: 'Calculate 0.25% PSEB tax on incoming foreign remittances.',
      iconName: 'Laptop',
    },
  ],
};

export interface NextActionRecommendationsProps {
  currentSlug?: string;
  categorySlug?: string;
  className?: string;
}

export const NextActionRecommendations: React.FC<NextActionRecommendationsProps> = ({
  currentSlug,
  categorySlug,
  className = '',
}) => {
  // 1. Look for direct trigger rule
  let recommendations: RecommendationItem[] = [];

  if (currentSlug) {
    const matchedRule = NEXT_ACTION_RULES.find((rule) =>
      rule.triggerSlugs.includes(currentSlug)
    );
    if (matchedRule) {
      recommendations = matchedRule.recommendations;
    }
  }

  // 2. Fallback to category rules if no direct match found
  if (recommendations.length === 0 && categorySlug && CATEGORY_FALLBACKS[categorySlug]) {
    recommendations = CATEGORY_FALLBACKS[categorySlug];
  }

  // 3. Global fallback if still empty
  if (recommendations.length === 0) {
    recommendations = [
      {
        slug: 'compress-pdf',
        categorySlug: 'document',
        title: 'Compress PDF',
        description: 'Shrink file size up to 90% while preserving crystal-clear visual quality.',
        iconName: 'Minimize2',
        badge: 'Popular',
      },
      {
        slug: 'remove-background',
        categorySlug: 'image',
        title: 'AI Background Remover',
        description: 'Remove background from photos directly in browser with AI.',
        iconName: 'Wand2',
        badge: 'Instant AI',
      },
    ];
  }

  // Filter out current slug if accidentally recommended
  const filtered = recommendations.filter((r) => r.slug !== currentSlug).slice(0, 3);
  if (filtered.length === 0) return null;

  return (
    <div className={`w-full space-y-3 rounded-2xl border border-indigo-100/90 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 p-5 shadow-sm dark:border-indigo-950/70 dark:from-slate-900/90 dark:via-indigo-950/20 dark:to-slate-900/80 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/25">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Next Suggested Actions
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Continue working with complementary tools
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full">
          Workflow
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
        {filtered.map((item) => {
          const IconComponent = ICON_MAP[item.iconName] || Sparkles;
          return (
            <Link
              key={item.slug}
              href={`/convert/${item.categorySlug}/${item.slug}`}
              className="group relative flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white/90 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 dark:border-slate-800/80 dark:bg-slate-900/90 dark:hover:border-indigo-700/80"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  {item.badge && (
                    <Badge variant="purple" size="sm" className="font-semibold text-[10px]">
                      {item.badge}
                    </Badge>
                  )}
                </div>

                <h5 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.title}
                </h5>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                  {item.description}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                <span>Launch tool</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
