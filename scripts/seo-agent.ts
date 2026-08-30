import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateMetadata(fileContent: string, fileName: string): Promise<string> {
  const prompt = `
You are an expert SEO agent for a Next.js App Router application.
I will provide you with the source code of a React page component: \`${fileName}\`.
Your job is to analyze the content and purpose of this page, and generate a highly optimized Next.js \`metadata\` object for it.

Requirements:
- Extract the core topic, value proposition, and key features.
- Create a compelling \`title\` (max 60 characters).
- Create an engaging \`description\` (max 160 characters).
- Do NOT output any markdown blocks, explanations, or backticks.
- Return EXACTLY and ONLY valid TypeScript code starting with \`export const metadata = {\` and ending with \`};\`.
- Do not import any types, just use the untyped \`export const metadata = {\` format.

File Content:
---
${fileContent}
---

Return only the raw TypeScript code for the metadata export.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.7,
    },
  });

  let generatedText = response.text || '';
  
  // Clean up any potential markdown formatting
  generatedText = generatedText.replace(/^```typescript\n?/i, '').replace(/^```\n?/i, '').replace(/```$/i, '').trim();

  return generatedText;
}

function injectMetadata(fileContent: string, metadataCode: string): string {
  // Find the last import statement
  const importRegex = /^import\s+.*?;?\s*$/gm;
  let match;
  let lastImportIndex = 0;
  while ((match = importRegex.exec(fileContent)) !== null) {
    lastImportIndex = match.index + match[0].length;
  }

  // Insert metadata after the last import, with some spacing
  const before = fileContent.substring(0, lastImportIndex);
  const after = fileContent.substring(lastImportIndex);

  return `${before}\n\n${metadataCode}\n${after}`;
}

async function processFile(filePath: string) {
  try {
    const fullPath = path.resolve(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`[SKIP] File not found: ${filePath}`);
      return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');

    // Skip if it already has metadata
    if (content.includes('export const metadata') || content.includes('export function generateMetadata')) {
      console.log(`[SKIP] Metadata already exists in: ${filePath}`);
      return;
    }

    console.log(`[PROCESS] Generating SEO metadata for: ${filePath}`);
    const metadataCode = await generateMetadata(content, filePath);

    if (!metadataCode.includes('export const metadata')) {
      console.error(`[ERROR] AI returned invalid metadata format for: ${filePath}`);
      return;
    }

    const updatedContent = injectMetadata(content, metadataCode);
    fs.writeFileSync(fullPath, updatedContent, 'utf8');
    
    console.log(`[SUCCESS] Injected SEO metadata into: ${filePath}`);
  } catch (error) {
    console.error(`[ERROR] Failed to process ${filePath}:`, error);
  }
}

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable is not set. Exiting.');
    process.exit(1);
  }

  // Get file paths from command line arguments
  const files = process.argv.slice(2);
  
  if (files.length === 0) {
    console.log('No files provided to SEO agent.');
    return;
  }

  // Filter for Next.js app router page/layout files
  const pageFiles = files.filter(f => f.startsWith('src/app') && (f.endsWith('page.tsx') || f.endsWith('layout.tsx')));

  if (pageFiles.length === 0) {
    console.log('No Next.js page or layout files changed. Exiting.');
    return;
  }

  console.log(`Found ${pageFiles.length} page/layout files to analyze for SEO.`);

  for (const file of pageFiles) {
    await processFile(file);
  }
}

main().catch(console.error);
