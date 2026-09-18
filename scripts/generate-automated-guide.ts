import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

// Pre-curated high-volume evergreen topics targeting utility search queries
const TOPIC_POOL = [
  {
    topic: 'HEIC vs JPG: Compression, Quality and Compatibility Guide',
    suggestedSlug: 'heic-vs-jpg-compression-quality-guide',
    category: 'Image & Media',
    categorySlug: 'image',
    relatedTool: {
      name: 'HEIC to JPG Converter',
      slug: 'heic-to-jpg',
      categorySlug: 'image',
      ctaText: 'Convert iPhone HEIC to JPG Online',
    },
  },
  {
    topic: 'MOV vs MP4: How to Play and Convert Apple Videos on Windows and Android',
    suggestedSlug: 'mov-vs-mp4-apple-quicktime-compatibility-guide',
    category: 'Image & Media',
    categorySlug: 'media',
    relatedTool: {
      name: 'MOV to MP4 Converter',
      slug: 'mov-to-mp4',
      categorySlug: 'media',
      ctaText: 'Convert MOV to Universal MP4',
    },
  },
  {
    topic: 'Webcam and Microphone Test: How to Fix Echo, Audio Lag and Video Quality Before Meetings',
    suggestedSlug: 'webcam-microphone-test-remote-meeting-setup-guide',
    category: 'Unit Converters',
    categorySlug: 'hardware',
    relatedTool: {
      name: 'Webcam Test Online',
      slug: 'webcam-test',
      categorySlug: 'hardware',
      ctaText: 'Test Your Webcam & Mic Now',
    },
  },
  {
    topic: 'Audio Bitrates Explained: 128kbps vs 192kbps vs 320kbps MP3 for Music & Podcasts',
    suggestedSlug: 'audio-bitrates-explained-128kbps-vs-320kbps-mp3',
    category: 'Image & Media',
    categorySlug: 'audio',
    relatedTool: {
      name: 'WAV to MP3 Converter',
      slug: 'wav-to-mp3',
      categorySlug: 'audio',
      ctaText: 'Compress Audio to 320kbps MP3',
    },
  },
  {
    topic: 'How to Compress Heavy PDF Files for Email Without Blurry Text',
    suggestedSlug: 'compress-pdf-for-email-without-losing-text-clarity',
    category: 'Document & PDF',
    categorySlug: 'document',
    relatedTool: {
      name: 'PDF to Word Converter',
      slug: 'pdf-to-word',
      categorySlug: 'document',
      ctaText: 'Compress and Convert PDF Free',
    },
  },
  {
    topic: 'Gold Purity & Rates in Pakistan: How Tola, Masha, Ratti, and 22K vs 24K are Calculated',
    suggestedSlug: 'gold-purity-tola-masha-ratti-calculation-pakistan',
    category: 'Gold & Currency',
    categorySlug: 'unit',
    relatedTool: {
      name: 'Tola to Grams Gold Converter',
      slug: 'tola-to-grams',
      categorySlug: 'unit',
      ctaText: 'Calculate Gold Weight in Tola & Grams',
    },
  },
];

async function generateGuide(topicItem: typeof TOPIC_POOL[0], apiKey: string): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
You are an expert technical SEO author and software engineer at ApexTools (apextools.app).
Write a comprehensive, authoritative, 1,500+ word technical guide in valid TypeScript object syntax conforming to the GuideArticle interface.

Topic: "${topicItem.topic}"
Target Slug: "${topicItem.suggestedSlug}"
Category: "${topicItem.category}"
CategorySlug: "${topicItem.categorySlug}"
Related Tool Name: "${topicItem.relatedTool.name}"
Related Tool Slug: "${topicItem.relatedTool.slug}"
Related Tool CategorySlug: "${topicItem.relatedTool.categorySlug}"
Today's Date: "${today}"

Output Requirements:
1. Return EXACTLY a single JavaScript/TypeScript object matching this shape:
{
  slug: '${topicItem.suggestedSlug}',
  title: 'Compelling High CTR Title Under 70 Characters',
  shortDescription: 'Engaging meta description under 155 characters explaining value proposition.',
  category: '${topicItem.category}',
  categorySlug: '${topicItem.categorySlug}',
  publishedDate: '${today}',
  updatedDate: '${today}',
  author: 'ApexTools Tech & Media Lab',
  readTime: '6 min read',
  featured: false,
  relatedTool: {
    name: '${topicItem.relatedTool.name}',
    slug: '${topicItem.relatedTool.slug}',
    categorySlug: '${topicItem.relatedTool.categorySlug}',
    ctaText: '${topicItem.relatedTool.ctaText}',
  },
  tableOfContents: [
    { id: 'section-1-id', title: '1. Section Title' },
    ...5 to 7 sections...
  ],
  keyTakeaways: [
    'Takeaway 1: core insight',
    'Takeaway 2: actionable rule',
    'Takeaway 3: comparison takeaway',
    'Takeaway 4: best tool recommendation'
  ],
  contentHtml: \`
    <h2 id="section-1-id">1. Section Title</h2>
    <p>In-depth technical explanation...</p>
    ...Include at least one clean HTML table with <table class="my-4 w-full border-collapse border border-slate-700 text-left text-xs">...
  \`,
  faqs: [
    {
      question: 'Direct user search question 1?',
      answer: 'Clear, concise 2-3 sentence answer optimized for Google featured snippets.'
    },
    ...at least 4 comprehensive FAQs...
  ]
}

CRITICAL RULES:
- Output ONLY valid TypeScript/JavaScript code for the object literal (starting with { and ending with }).
- Do NOT wrap in markdown code blocks like \`\`\`typescript or \`\`\`.
- Escape any backticks inside strings properly.
- All IDs in tableOfContents must strictly match the id attributes in <h2 id="..."> in contentHtml.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.6,
    },
  });

  let raw = response.text || '';
  raw = raw.replace(/^```(typescript|javascript|json)?\n?/i, '').replace(/```$/i, '').trim();
  return raw;
}

async function main() {
  console.log('=====================================================');
  console.log('✍️ ApexTools Autonomous AI Content & Guide Generator');
  console.log('=====================================================\n');

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY is not set in environment.');
    process.exit(1);
  }

  const guidesFilePath = path.resolve(process.cwd(), 'src/lib/guides/guides.ts');
  if (!fs.existsSync(guidesFilePath)) {
    console.error(`❌ Guides file not found: ${guidesFilePath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(guidesFilePath, 'utf8');

  // Check which topics already exist in guides.ts
  const customTopicArg = process.argv[2];
  let selectedTopic = TOPIC_POOL.find((t) => !fileContent.includes(t.suggestedSlug));

  if (customTopicArg) {
    console.log(`[TOPIC] Using custom topic provided via argument: "${customTopicArg}"`);
    selectedTopic = {
      topic: customTopicArg,
      suggestedSlug: customTopicArg.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: 'Image & Media',
      categorySlug: 'image',
      relatedTool: {
        name: 'File & Media Converter',
        slug: 'heic-to-jpg',
        categorySlug: 'image',
        ctaText: 'Use Free Converter Online',
      },
    };
  }

  if (!selectedTopic) {
    console.log('ℹ️ All pre-curated topics have already been generated in guides.ts!');
    console.log('To generate a new guide, pass a topic title: npx tsx scripts/generate-automated-guide.ts "My New Guide Topic"');
    return;
  }

  console.log(`[GENERATING] Selected Topic: "${selectedTopic.topic}"`);
  console.log(`[SLUG] ${selectedTopic.suggestedSlug}`);

  try {
    const generatedObjectCode = await generateGuide(selectedTopic, apiKey);

    // Validate that it looks like a valid object
    if (!generatedObjectCode.startsWith('{') || !generatedObjectCode.endsWith('}')) {
      throw new Error('AI response did not return a valid object literal.');
    }

    // Insert the new guide right before the closing bracket of GUIDES array
    const lastArrayCloseIndex = fileContent.lastIndexOf('];');
    if (lastArrayCloseIndex === -1) {
      throw new Error('Could not locate closing array bracket "];" in guides.ts');
    }

    const before = fileContent.substring(0, lastArrayCloseIndex).trimEnd();
    const after = fileContent.substring(lastArrayCloseIndex);

    // Ensure there's a trailing comma before appending
    const needsComma = !before.endsWith(',') && !before.endsWith('[');
    const updatedContent = `${before}${needsComma ? ',' : ''}\n  ${generatedObjectCode},\n${after}`;

    fs.writeFileSync(guidesFilePath, updatedContent, 'utf8');
    console.log(`\n✅ Successfully generated and registered guide: "${selectedTopic.topic}"`);
    console.log(`   URL will be: https://apextools.app/guides/${selectedTopic.suggestedSlug}`);
  } catch (err: any) {
    console.error('❌ Failed to generate guide:', err?.message || err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
