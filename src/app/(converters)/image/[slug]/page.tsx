import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { generateToolMetadata } from '@/lib/seo/metadata';
import { ImageConverter } from '@/components/converters/image/ImageConverter';
import { ImageFormatComparisonTable } from '@/components/converters/image/ImageFormatComparisonTable';
import { ALL_TOOLS, getToolBySlug } from '@/config/categories';

interface ImageSlugPageProps {
  params: {
    slug: string;
  };
}

const IMAGE_TOOLS_MAP: Record<
  string,
  {
    slug: string;
    name: string;
    description: string;
    badge: string;
    targetFormat: string;
    reverseSlug?: string;
    reverseName?: string;
  }
> = {
  'heic-to-jpg': {
    slug: 'heic-to-jpg',
    name: 'HEIC to JPG Converter',
    description:
      'Convert Apple iPhone and iPad HEIC / HEIF photos into universal high-resolution JPG images instantly.',
    badge: '📱 iPhone Photos',
    targetFormat: 'jpg',
    reverseSlug: 'jpg-to-png',
    reverseName: 'JPG to PNG',
  },
  'heic-to-png': {
    slug: 'heic-to-png',
    name: 'HEIC to PNG Converter',
    description:
      'Convert Apple HEIC photos directly to high-quality PNG with lossless transparency preserved.',
    badge: '📱 Apple HEIC',
    targetFormat: 'png',
  },
  'png-to-jpg': {
    slug: 'png-to-jpg',
    name: 'PNG to JPG Converter',
    description:
      'Convert PNG images with transparent backgrounds to lightweight MozJPEG compressed JPG files.',
    badge: 'High Compression',
    targetFormat: 'jpg',
    reverseSlug: 'jpg-to-png',
    reverseName: 'JPG to PNG',
  },
  'jpg-to-png': {
    slug: 'jpg-to-png',
    name: 'JPG to PNG Converter',
    description:
      'Convert JPG and JPEG files to lossless PNG format with crisp edge fidelity and zero artifacting.',
    badge: 'Lossless Quality',
    targetFormat: 'png',
    reverseSlug: 'png-to-jpg',
    reverseName: 'PNG to JPG',
  },
  'webp-to-jpg': {
    slug: 'webp-to-jpg',
    name: 'WebP to JPG Converter',
    description:
      'Convert Google WebP image format into universal JPG photos compatible with all software and devices.',
    badge: 'Universal Format',
    targetFormat: 'jpg',
    reverseSlug: 'jpg-to-webp',
    reverseName: 'JPG to WebP',
  },
  'jpg-to-webp': {
    slug: 'jpg-to-webp',
    name: 'JPG to WebP Converter',
    description:
      'Compress JPG photos into next-generation Google WebP format. Save 30–40% file size and boost Core Web Vitals.',
    badge: '⚡ Save 35% Size',
    targetFormat: 'webp',
    reverseSlug: 'webp-to-jpg',
    reverseName: 'WebP to JPG',
  },
  'png-to-webp': {
    slug: 'png-to-webp',
    name: 'PNG to WebP Converter',
    description:
      'Convert PNG graphics to lightweight WebP format while preserving transparent alpha channels perfectly.',
    badge: 'Transparent WebP',
    targetFormat: 'webp',
    reverseSlug: 'webp-to-png',
    reverseName: 'WebP to PNG',
  },
  'webp-to-png': {
    slug: 'webp-to-png',
    name: 'WebP to PNG Converter',
    description:
      'Convert Google WebP image format to standard PNG with full transparent background support.',
    badge: 'Lossless Alpha',
    targetFormat: 'png',
    reverseSlug: 'png-to-webp',
    reverseName: 'PNG to WebP',
  },
  'png-to-svg': {
    slug: 'png-to-svg',
    name: 'PNG to SVG Vector Wrapper',
    description:
      'Convert raster PNG images and graphics into scalable SVG vector wrapper files for modern web design.',
    badge: 'Vector Wrapper',
    targetFormat: 'svg',
  },
  'png-to-ico': {
    slug: 'png-to-ico',
    name: 'PNG to ICO Favicon Generator',
    description:
      'Convert PNG logos into multi-resolution Windows ICO icon files and website favicons with transparency.',
    badge: 'Favicon Maker',
    targetFormat: 'ico',
  },
  'compress-image': {
    slug: 'compress-image',
    name: 'Image Compressor',
    description:
      'Compress JPG, PNG, and WebP images by up to 90% without visible loss in quality or resolution.',
    badge: 'Save 90% Size',
    targetFormat: 'jpg',
  },
  'resize-image': {
    slug: 'resize-image',
    name: 'Image Resizer',
    description:
      'Resize image pixel dimensions, scale percentages, and aspect ratios with high-quality resampling.',
    badge: 'Precision Resizer',
    targetFormat: 'jpg',
  },
  'remove-background': {
    slug: 'remove-background',
    name: 'Remove Background Cutout',
    description:
      'Remove backgrounds from photos and graphics to generate clean transparent PNG cutouts instantly.',
    badge: 'AI Cutout',
    targetFormat: 'png',
  },
};

export async function generateStaticParams() {
  return Object.keys(IMAGE_TOOLS_MAP).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ImageSlugPageProps): Promise<Metadata> {
  const tool = IMAGE_TOOLS_MAP[params.slug];
  if (!tool) return {};

  return generateToolMetadata({
    title: `${tool.name} — Free Online Image Converter`,
    description: tool.description,
    category: 'Image Converters',
    slug: tool.slug,
    categorySlug: 'image',
    keywords: [
      tool.name,
      `${tool.name} online`,
      `free ${tool.name}`,
      'image converter',
      'heic converter',
      'webp converter',
      'convert image online',
    ],
  });
}

export default function ImageSlugPage({ params }: ImageSlugPageProps) {
  const tool = IMAGE_TOOLS_MAP[params.slug];
  if (!tool) notFound();

  const howToSteps = [
    {
      title: 'Upload Your Image',
      description:
        'Drag and drop your image (HEIC, PNG, JPG, WebP) into the secure dropzone above or click Browse.',
      tip: 'Supports photos up to 25MB completely free.',
    },
    {
      title: 'Configure Output Settings',
      description:
        'Select target format, adjust quality slider (10% to 100%), or set custom pixel dimensions.',
    },
    {
      title: 'Download Converted File',
      description:
        'Click Download to save your converted image. Files are automatically auto-deleted in 2 hours for privacy.',
    },
  ];

  const formula = {
    title: `${tool.name} Technical Compression & Formatting Logic`,
    expression:
      'Output Size = Resolution (Width × Height) × Color Channels × Compression Factor (MozJPEG / WebP / Deflate)',
    example:
      '4.2 MB HEIC/PNG image converted to MozJPEG/WebP (85% quality) yields ~1.35 MB with crisp edge clarity.',
  };

  const conversionTable = {
    title: 'Image Format Technical Comparison Reference',
    headers: ['Format', 'Transparency Support', 'Relative File Size'] as [string, string, string],
    rows: [
      { fromValue: 'WebP (.webp)', toValue: 'Full Alpha Channel', extraInfo: '25%–35% Smaller than JPG' },
      { fromValue: 'HEIC (.heic)', toValue: 'Alpha & Depth Maps', extraInfo: '50% Smaller than JPG' },
      { fromValue: 'AVIF (.avif)', toValue: 'Alpha & 12-bit HDR', extraInfo: '50% Smaller than JPG' },
      { fromValue: 'JPG / JPEG (.jpg)', toValue: 'Opaque (No Alpha)', extraInfo: 'Standard Baseline (100%)' },
      { fromValue: 'PNG (.png)', toValue: 'Lossless True Alpha', extraInfo: '200%–400% Larger' },
      { fromValue: 'ICO (.ico)', toValue: '32-bit Multi-Res Icon', extraInfo: '16px to 256px Favicons' },
      { fromValue: 'SVG (.svg)', toValue: 'Vector Alpha Support', extraInfo: 'Infinite Resolution Vector' },
    ],
    caption: 'Comparative format performance benchmark matrix.',
  };

  const faqs = [
    {
      question: `How does the ${tool.name} process images?`,
      answer:
        'ApexTools utilizes high-speed Sharp and MozJPEG image processing engines in Node.js. Images are rendered with high fidelity and optimized compression.',
    },
    {
      question: 'Are my private photos and documents secure?',
      answer:
        'Yes. All uploaded and converted files are stored in isolated temporary disk storage and permanently auto-purged within 2 hours. We never inspect or sell your data.',
    },
    {
      question: 'Can I convert Apple iPhone HEIC photos on Windows or Android?',
      answer:
        'Yes. Our server-side decoding engine accepts native Apple HEIC/HEIF files, auto-corrects EXIF orientation, and outputs standard JPG or PNG files compatible with all platforms.',
    },
    {
      question: 'What is the maximum file size supported?',
      answer:
        'Free users can convert image files up to 25MB with zero watermarks or registration required.',
    },
  ];

  const relatedTools = ALL_TOOLS.filter(
    (t) => t.categorySlug === 'image' && t.slug !== tool.slug
  ).slice(0, 4);

  const reverseTool =
    tool.reverseSlug && tool.reverseName
      ? {
          name: tool.reverseName,
          url: `/convert/image/${tool.reverseSlug}`,
        }
      : undefined;

  return (
    <ToolLayout
      toolName={tool.name}
      category="Image Converters"
      categorySlug="image"
      slug={tool.slug}
      description={tool.description}
      badgeText={tool.badge}
      howToSteps={howToSteps}
      formula={formula}
      conversionTable={conversionTable}
      faqs={faqs}
      relatedTools={relatedTools}
      reverseTool={reverseTool}
    >
      <ImageConverter initialTargetFormat={tool.targetFormat} initialToolSlug={tool.slug} />
      <div className="mt-8 border-t border-slate-100 pt-8 dark:border-slate-800/80">
        <ImageFormatComparisonTable />
      </div>
    </ToolLayout>
  );
}
