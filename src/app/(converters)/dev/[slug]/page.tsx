import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { generateToolMetadata } from '@/lib/seo/metadata';
import { JsonFormatter } from '@/components/converters/dev/JsonFormatter';
import { DataFormatConverter } from '@/components/converters/dev/DataFormatConverter';
import { Base64Tool } from '@/components/converters/dev/Base64Tool';
import { UrlEncoder } from '@/components/converters/dev/UrlEncoder';
import { TextCaseConverter } from '@/components/converters/dev/TextCaseConverter';
import { NumberBaseConverter } from '@/components/converters/dev/NumberBaseConverter';
import { MarkdownHtmlEditor } from '@/components/converters/dev/MarkdownHtmlEditor';

interface DevToolConfig {
  slug: string;
  name: string;
  description: string;
  badge: string;
  howToSteps: { title: string; description: string; tip?: string }[];
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
}

const DEV_TOOLS: Record<string, DevToolConfig> = {
  'json-formatter': {
    slug: 'json-formatter',
    name: 'JSON Formatter & Validator',
    description: 'Format, beautify, validate, and minify JSON data with live syntax error highlighting and line/column callouts.',
    badge: '100% Client-Side JSON Linter',
    howToSteps: [
      { title: 'Paste Raw JSON', description: 'Paste your unformatted or minified JSON text into the editor window above.' },
      { title: 'Inspect Errors or Format', description: 'Click Beautify to indent with 2 or 4 spaces, or Minify to compact. Live syntax validation highlights errors instantly.' },
      { title: 'Copy or Export', description: 'Copy the clean JSON to clipboard or download as a .json file.' },
    ],
    faqs: [
      { question: 'Why is my JSON invalid?', answer: 'Common JSON errors include trailing commas, unquoted keys, single quotes instead of double quotes, and missing closing brackets.' },
      { question: 'Does ConvertHub store my JSON data?', answer: 'No. All validation and formatting occur 100% in your browser memory without sending data over the network.' },
    ],
    relatedSlugs: ['csv-to-json', 'base64-encode-decode', 'url-encode-decode'],
  },
  'csv-to-json': {
    slug: 'csv-to-json',
    name: 'CSV to JSON & XML Converter',
    description: 'Convert tabular CSV files into structured JSON arrays and clean XML markup with auto-detected delimiters.',
    badge: 'Auto-Delimiter Detection',
    howToSteps: [
      { title: 'Input CSV or JSON', description: 'Paste your raw CSV table or JSON object into the input box.' },
      { title: 'Select Target Format', description: 'Choose JSON, CSV, or XML as your target format and adjust delimiter settings.' },
      { title: 'Download Converted File', description: 'Copy output with one click or download the formatted file.' },
    ],
    faqs: [
      { question: 'Which CSV delimiters are supported?', answer: 'ConvertHub auto-detects commas, semicolons, tab characters, and pipes.' },
      { question: 'Can it handle nested JSON arrays?', answer: 'Yes! When converting to CSV, nested structures are serialized cleanly with escaped quotes.' },
    ],
    relatedSlugs: ['json-formatter', 'base64-encode-decode', 'text-case-converter'],
  },
  'json-to-csv': {
    slug: 'json-to-csv',
    name: 'JSON to CSV Converter',
    description: 'Transform structured JSON objects and arrays into clean, spreadsheet-ready CSV tables.',
    badge: 'Flatten JSON Arrays',
    howToSteps: [
      { title: 'Paste JSON Array', description: 'Input your JSON array of objects.' },
      { title: 'Auto-Extract Headers', description: 'ConvertHub automatically generates column headers from object keys.' },
      { title: 'Download CSV', description: 'Download your spreadsheet-compatible CSV file.' },
    ],
    faqs: [
      { question: 'Can I open the resulting CSV in Microsoft Excel?', answer: 'Yes! The CSV is fully compatible with Excel, Google Sheets, and LibreOffice Calc.' },
    ],
    relatedSlugs: ['csv-to-json', 'json-formatter', 'base64-encode-decode'],
  },
  'base64-encode-decode': {
    slug: 'base64-encode-decode',
    name: 'Base64 Encoder & Decoder',
    description: 'Encode text or drag-and-drop images and files to Base64 data URIs, or decode Base64 strings back to source.',
    badge: 'UTF-8 & Binary File Safe',
    howToSteps: [
      { title: 'Choose Mode', description: 'Select Text Mode for UTF-8 strings or File Mode for images/documents.' },
      { title: 'Encode or Decode', description: 'Process your data in real-time.' },
      { title: 'Copy Base64 Data URI', description: 'Copy encoded Base64 or preview decoded output.' },
    ],
    faqs: [
      { question: 'What is Base64 encoding used for?', answer: 'Base64 represents binary data in ASCII string format, commonly used in Data URIs, email attachments, and API payloads.' },
      { question: 'What is the overhead of Base64?', answer: 'Base64 encoding increases binary data size by approximately 33%.' },
    ],
    relatedSlugs: ['url-encode-decode', 'json-formatter', 'binary-to-decimal'],
  },
  'url-encode-decode': {
    slug: 'url-encode-decode',
    name: 'URL / URI Encoder & Decoder',
    description: 'Percent-encode and decode URL query parameters, query strings, and URI components with parameter inspection.',
    badge: 'RFC 3986 Compliant',
    howToSteps: [
      { title: 'Enter URL / Query String', description: 'Paste the URL or query parameter string.' },
      { title: 'Inspect & Edit Params', description: 'Use the interactive query parameter table to edit parameters dynamically.' },
      { title: 'Copy Result', description: 'Copy encoded or decoded URL.' },
    ],
    faqs: [
      { question: 'What is the difference between encodeURI and encodeURIComponent?', answer: 'encodeURI preserves protocol and domain slashes, whereas encodeURIComponent encodes all special characters including & and =.' },
    ],
    relatedSlugs: ['base64-encode-decode', 'json-formatter', 'text-case-converter'],
  },
  'text-case-converter': {
    slug: 'text-case-converter',
    name: 'Text Case Converter & Word Counter',
    description: 'Transform text into Title Case, Sentence case, camelCase, snake_case, kebab-case, PascalCase, CONSTANT_CASE, and UPPERCASE.',
    badge: '10+ Text Transforms',
    howToSteps: [
      { title: 'Input Text', description: 'Type or paste any paragraph, code variable, or heading.' },
      { title: 'View All Cases', description: 'All 11 case styles update simultaneously in real-time.' },
      { title: 'Copy Target Case', description: 'Click copy on the case style you need.' },
    ],
    faqs: [
      { question: 'Which case is best for programming variables?', answer: 'JavaScript uses camelCase, Python uses snake_case, TypeScript types use PascalCase, and CSS classes use kebab-case.' },
    ],
    relatedSlugs: ['url-encode-decode', 'json-formatter', 'markdown-to-html'],
  },
  'binary-to-decimal': {
    slug: 'binary-to-decimal',
    name: 'Number Base Converter (Binary, Hex, Decimal, Octal)',
    description: 'Convert between Binary (base 2), Octal (base 8), Decimal (base 10), and Hexadecimal (base 16) with interactive 8-bit switchboard.',
    badge: 'Live 8-Bit Switchboard',
    howToSteps: [
      { title: 'Enter Number in Any Base', description: 'Type in Decimal, Binary, Hex, or Octal.' },
      { title: 'Toggle Bits Interactively', description: 'Click 8-bit switches to see live binary weight calculations.' },
      { title: 'Copy Base Representation', description: 'Copy hex color values, binary bytes, or decimal numbers.' },
    ],
    faqs: [
      { question: 'How does binary to decimal conversion work?', answer: 'Each binary digit corresponds to a power of 2 (1, 2, 4, 8, 16, 32, 64, 128). Summing the active bit weights yields the decimal value.' },
    ],
    relatedSlugs: ['base64-encode-decode', 'json-formatter', 'text-case-converter'],
  },
  'markdown-to-html': {
    slug: 'markdown-to-html',
    name: 'Markdown to HTML Live Editor',
    description: 'Real-time dual-pane Markdown editor with WYSIWYG rendered preview, table generators, and syntax highlighting.',
    badge: 'Dual-Pane Live Preview',
    howToSteps: [
      { title: 'Write Markdown', description: 'Type Markdown with headers, bold, tables, and code snippets.' },
      { title: 'Inspect Rendered Preview', description: 'Switch between rendered HTML preview and raw HTML markup.' },
      { title: 'Export HTML or MD', description: 'Download .html or .md files with one click.' },
    ],
    faqs: [
      { question: 'Does this support Markdown tables and code blocks?', answer: 'Yes! ConvertHub supports standard GitHub Flavored Markdown (GFM) tables, blockquotes, and code blocks.' },
    ],
    relatedSlugs: ['text-case-converter', 'json-formatter', 'base64-encode-decode'],
  },
};

export async function generateStaticParams() {
  return Object.keys(DEV_TOOLS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const tool = DEV_TOOLS[params.slug];
  if (!tool) return {};

  return generateToolMetadata({
    title: `${tool.name} — Free Online Developer Tool`,
    description: tool.description,
    category: 'Developer & Data Utilities',
    slug: tool.slug,
    categorySlug: 'dev',
    keywords: [tool.name, `${tool.name} online`, 'developer tool', 'free online converter'],
  });
}

export default function DevToolPage({ params }: { params: { slug: string } }) {
  const tool = DEV_TOOLS[params.slug];
  if (!tool) notFound();

  const relatedTools = tool.relatedSlugs
    .map((s) => DEV_TOOLS[s])
    .filter(Boolean)
    .map((t) => ({
      id: t.slug,
      name: t.name,
      slug: t.slug,
      categorySlug: 'dev',
      categoryName: 'Developer Tools',
      description: t.description,
      iconName: 'Code',
    }));

  return (
    <ToolLayout
      toolName={tool.name}
      category="Developer Tools"
      categorySlug="dev"
      slug={tool.slug}
      description={tool.description}
      badgeText={tool.badge}
      howToSteps={tool.howToSteps}
      faqs={tool.faqs}
      relatedTools={relatedTools}
    >
      {tool.slug === 'json-formatter' && <JsonFormatter />}
      {(tool.slug === 'csv-to-json' || tool.slug === 'json-to-csv') && <DataFormatConverter />}
      {tool.slug === 'base64-encode-decode' && <Base64Tool />}
      {tool.slug === 'url-encode-decode' && <UrlEncoder />}
      {tool.slug === 'text-case-converter' && <TextCaseConverter />}
      {tool.slug === 'binary-to-decimal' && <NumberBaseConverter />}
      {tool.slug === 'markdown-to-html' && <MarkdownHtmlEditor />}
    </ToolLayout>
  );
}
