import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { generateToolMetadata } from '@/lib/seo/metadata';
import { ColorConverter } from '@/components/converters/color/ColorConverter';
import { PaletteGenerator } from '@/components/converters/color/PaletteGenerator';

interface ColorToolConfig {
  slug: string;
  name: string;
  description: string;
  badge: string;
  howToSteps: { title: string; description: string; tip?: string }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

const COLOR_TOOLS: Record<string, ColorToolConfig> = {
  'hex-to-rgb': {
    slug: 'hex-to-rgb',
    name: 'HEX to RGB / HSL / CMYK Color Converter',
    description: 'Convert color codes in real-time across HEX, RGB, HSL, CMYK, and HSV with WCAG 2.1 contrast ratio and accessibility checks.',
    badge: 'WCAG 2.1 Contrast Analysis',
    howToSteps: [
      { title: 'Pick or Enter Color Code', description: 'Type a 6-digit HEX code (e.g. #4F46E5) or use the visual color picker swatch.' },
      { title: 'View Synchronized Channels', description: 'RGB, HSL, CMYK, and HSV channels update simultaneously.' },
      { title: 'Check Accessibility & Copy CSS', description: 'Review WCAG AA/AAA contrast ratios against black/white and copy CSS snippets.' },
    ],
    faqs: [
      { question: 'What is the difference between RGB and CMYK?', answer: 'RGB is an additive digital color model for screens (Red, Green, Blue). CMYK is a subtractive ink color model for physical offset printing (Cyan, Magenta, Yellow, Key/Black).' },
      { question: 'What contrast ratio is required for WCAG AA compliance?', answer: 'WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt bold).' },
    ],
    relatedSlugs: ['color-palette-generator', 'rgb-to-cmyk'],
  },
  'color-palette-generator': {
    slug: 'color-palette-generator',
    name: 'Harmonious Color Palette Generator',
    description: 'Generate harmonious color schemes (Analogous, Monochromatic, Triadic, Complementary, Tetradic) with color locks and CSS variable export.',
    badge: 'Harmonic Schemes & CSS Export',
    howToSteps: [
      { title: 'Choose Color Harmony Scheme', description: 'Select Analogous, Monochromatic, Triadic, or Complementary.' },
      { title: 'Generate & Lock Favorites', description: 'Click Randomize to explore color combinations. Lock colors you want to keep.' },
      { title: 'Export for Code', description: 'Export palette as CSS Custom Properties (:root variables) or JSON arrays.' },
    ],
    faqs: [
      { question: 'What is an analogous color palette?', answer: 'Analogous colors sit adjacent to each other on the color wheel (e.g. blue, blue-purple, purple), creating serene and unified aesthetics.' },
    ],
    relatedSlugs: ['hex-to-rgb', 'rgb-to-cmyk'],
  },
  'rgb-to-cmyk': {
    slug: 'rgb-to-cmyk',
    name: 'RGB to CMYK Print Color Converter',
    description: 'Convert digital screen RGB color values to exact CMYK ink percentages for high-fidelity printing.',
    badge: 'Print Production Accurate',
    howToSteps: [
      { title: 'Enter RGB Values', description: 'Input Red, Green, and Blue channels (0-255).' },
      { title: 'Review CMYK Output', description: 'View calculated Cyan, Magenta, Yellow, and Key (Black) ink percentages.' },
      { title: 'Copy for Design Software', description: 'Paste percentages into Photoshop, Illustrator, or InDesign.' },
    ],
    faqs: [
      { question: 'Why do RGB colors look different when printed in CMYK?', answer: 'RGB screens can display a wider gamut of vibrant luminous colors than physical inks on paper can reproduce. Converting to CMYK ensures realistic print expectations.' },
    ],
    relatedSlugs: ['hex-to-rgb', 'color-palette-generator'],
  },
};

export async function generateStaticParams() {
  return Object.keys(COLOR_TOOLS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = COLOR_TOOLS[params.slug];
  if (!tool) return {};

  return generateToolMetadata({
    title: `${tool.name} — Free Online Color Converter`,
    description: tool.description,
    category: 'Color Converters',
    slug: tool.slug,
    categorySlug: 'color',
    keywords: [tool.name, `${tool.name} online`, 'color picker', 'color converter'],
  });
}

export default function ColorToolPage({ params }: { params: { slug: string } }) {
  const tool = COLOR_TOOLS[params.slug];
  if (!tool) notFound();

  const relatedTools = tool.relatedSlugs
    .map((s) => COLOR_TOOLS[s])
    .filter(Boolean)
    .map((t) => ({
      id: t.slug,
      name: t.name,
      slug: t.slug,
      categorySlug: 'color',
      categoryName: 'Color Tools',
      description: t.description,
      iconName: 'Palette',
    }));

  return (
    <ToolLayout
      toolName={tool.name}
      category="Color Tools"
      categorySlug="color"
      slug={tool.slug}
      description={tool.description}
      badgeText={tool.badge}
      howToSteps={tool.howToSteps}
      faqs={tool.faqs}
      relatedTools={relatedTools}
    >
      {tool.slug === 'hex-to-rgb' && <ColorConverter />}
      {tool.slug === 'color-palette-generator' && <PaletteGenerator />}
      {tool.slug === 'rgb-to-cmyk' && <ColorConverter />}
    </ToolLayout>
  );
}
