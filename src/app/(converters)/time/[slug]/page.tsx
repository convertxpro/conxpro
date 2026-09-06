import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { generateToolMetadata } from '@/lib/seo/metadata';
import { TimezoneConverter } from '@/components/converters/datetime/TimezoneConverter';
import { UnixTimestampTool } from '@/components/converters/datetime/UnixTimestampTool';
import { AgeCalculator } from '@/components/converters/datetime/AgeCalculator';
import { DateFormatConverter } from '@/components/converters/datetime/DateFormatConverter';

interface TimeToolConfig {
  slug: string;
  name: string;
  description: string;
  badge: string;
  howToSteps: { title: string; description: string; tip?: string }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

const TIME_TOOLS: Record<string, TimeToolConfig> = {
  'timezone-converter': {
    slug: 'timezone-converter',
    name: 'World Clock & Timezone Converter',
    description: 'Compare current and future times across Karachi, Dubai, London, New York, Tokyo, Sydney, and global timezones with interactive meeting scheduler.',
    badge: 'Multi-City Meeting Planner',
    howToSteps: [
      { title: 'View World Clocks', description: 'See live synchronized clocks for major global business centers.' },
      { title: 'Simulate Meeting Times', description: 'Drag the 24-hour time slider to see corresponding times in other countries simultaneously.' },
      { title: 'Add Custom Cities', description: 'Add your target cities or countries to the comparison board.' },
    ],
    faqs: [
      { question: 'What is the time difference between Pakistan and the UK?', answer: 'Pakistan Standard Time (PKT, UTC+5) is 5 hours ahead of GMT (or 4 hours ahead of British Summer Time BST).' },
      { question: 'Does this tool account for Daylight Saving Time (DST)?', answer: 'Yes! ApexTools uses the browser IANA timezone database which automatically applies regional Daylight Saving Time shifts.' },
    ],
    relatedSlugs: ['unix-timestamp', 'age-calculator', 'date-format-converter'],
  },
  'unix-timestamp': {
    slug: 'unix-timestamp',
    name: 'Unix Timestamp & Epoch Converter',
    description: 'Convert Unix epoch timestamps (seconds and milliseconds) to human-readable UTC, ISO 8601, and local dates with live ticking clock.',
    badge: 'Live Epoch Milliseconds Clock',
    howToSteps: [
      { title: 'Inspect Live Epoch Clock', description: 'View current UNIX epoch seconds and milliseconds ticking in real-time.' },
      { title: 'Convert Epoch to Date', description: 'Type or paste any 10-digit (seconds) or 13-digit (ms) epoch number.' },
      { title: 'Convert Date to Epoch', description: 'Pick any calendar date and time to generate its exact Unix timestamp.' },
    ],
    faqs: [
      { question: 'What is Unix Epoch time?', answer: 'Unix Epoch time is the total number of seconds elapsed since January 1, 1970 00:00:00 UTC (excluding leap seconds).' },
      { question: 'What is the Year 2038 problem?', answer: '32-bit signed integers will overflow on January 19, 2038. ApexTools uses 64-bit BigInt precision to support dates billions of years in the future.' },
    ],
    relatedSlugs: ['timezone-converter', 'date-format-converter', 'age-calculator'],
  },
  'age-calculator': {
    slug: 'age-calculator',
    name: 'Age Calculator & Birthday Countdown',
    description: 'Calculate your exact age in years, months, days, hours, and seconds, next birthday countdown, day of week born, and zodiac milestones.',
    badge: 'Precise Lifetime Breakdown',
    howToSteps: [
      { title: 'Select Date of Birth', description: 'Choose your birthdate using the calendar selector.' },
      { title: 'Set As-Of Date', description: 'Defaults to today or pick a custom milestone date.' },
      { title: 'View Lifetime Statistics', description: 'Explore total days, hours, minutes lived, next birthday countdown, and zodiac insights.' },
    ],
    faqs: [
      { question: 'How is exact age calculated with leap years?', answer: 'ApexTools accounts for leap years, varying month lengths (28 to 31 days), and calendar days accurately.' },
    ],
    relatedSlugs: ['timezone-converter', 'unix-timestamp', 'date-format-converter'],
  },
  'date-format-converter': {
    slug: 'date-format-converter',
    name: 'Date Format Converter',
    description: 'Convert date strings between ISO 8601, RFC 2822, US (MM/DD/YYYY), UK (DD/MM/YYYY), SQL DateTime, and custom format templates.',
    badge: 'Multi-Protocol Date Parser',
    howToSteps: [
      { title: 'Input Date & Time', description: 'Select a date or type an ISO date string.' },
      { title: 'Choose Format or Custom Pattern', description: 'Use standard presets or build a custom token pattern (YYYY-MM-DD).' },
      { title: 'Copy Formatted Output', description: 'Copy to clipboard for databases, APIs, or documents.' },
    ],
    faqs: [
      { question: 'What is the standard ISO 8601 format?', answer: 'ISO 8601 format is YYYY-MM-DDTHH:mm:ss.sssZ (e.g. 2026-08-27T15:30:00.000Z).' },
    ],
    relatedSlugs: ['unix-timestamp', 'timezone-converter', 'age-calculator'],
  },
};

export async function generateStaticParams() {
  return Object.keys(TIME_TOOLS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = TIME_TOOLS[params.slug];
  if (!tool) return {};

  return generateToolMetadata({
    title: `${tool.name} — Free Online Time Tool`,
    description: tool.description,
    category: 'Date & Time Tools',
    slug: tool.slug,
    categorySlug: 'time',
    keywords: [tool.name, `${tool.name} online`, 'date tool', 'time converter'],
  });
}

export default function TimeToolPage({ params }: { params: { slug: string } }) {
  const tool = TIME_TOOLS[params.slug];
  if (!tool) notFound();

  const relatedTools = tool.relatedSlugs
    .map((s) => TIME_TOOLS[s])
    .filter(Boolean)
    .map((t) => ({
      id: t.slug,
      name: t.name,
      slug: t.slug,
      categorySlug: 'time',
      categoryName: 'Date & Time Tools',
      description: t.description,
      iconName: 'Clock',
    }));

  return (
    <ToolLayout
      toolName={tool.name}
      category="Date & Time Tools"
      categorySlug="time"
      slug={tool.slug}
      description={tool.description}
      badgeText={tool.badge}
      howToSteps={tool.howToSteps}
      faqs={tool.faqs}
      relatedTools={relatedTools}
    >
      {tool.slug === 'timezone-converter' && <TimezoneConverter />}
      {tool.slug === 'unix-timestamp' && <UnixTimestampTool />}
      {tool.slug === 'age-calculator' && <AgeCalculator />}
      {tool.slug === 'date-format-converter' && <DateFormatConverter />}
    </ToolLayout>
  );
}
