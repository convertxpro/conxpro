import { ALL_TOOLS, ToolMetadata, getToolBySlug } from '@/config/categories';
import { siteConfig } from '@/config/site';
import { HowToStep } from '@/components/layout/HowToGuide';
import { FaqItem } from '@/components/layout/FAQAccordion';
import { ConversionRow } from '@/components/layout/ConversionTable';

export interface ToolSeoData {
  id: string;
  name: string;
  slug: string;
  categorySlug: string;
  categoryName: string;
  description: string;
  shortDescription?: string;
  definition: string;
  directAnswer: string;
  formula?: {
    title: string;
    expression: string;
    example: string;
    inverseExpression?: string;
  };
  howToSteps: HowToStep[];
  conversionTable?: {
    title: string;
    headers: [string, string] | [string, string, string];
    rows: ConversionRow[];
    caption?: string;
  };
  faqs: FaqItem[];
  relatedTools: ToolMetadata[];
  reverseTool?: {
    name: string;
    url: string;
  };
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  aliases: string[];
  lastUpdated: string;
  badge?: string;
}

// ---------------------------------------------------------------------------
// Standard Fallback Generation Helpers
// ---------------------------------------------------------------------------

function formatUnitName(slugPart: string): string {
  return slugPart
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function generateDefaultDirectAnswer(tool: ToolMetadata): string {
  if (tool.slug.includes('-to-')) {
    const [fromPart, toPart] = tool.slug.split('-to-');
    const fromName = formatUnitName(fromPart);
    const toName = formatUnitName(toPart);
    return `To convert from ${fromName} to ${toName}, use the ApexTools ${tool.name}. Enter your value for instant calculation with zero latency, complete accuracy, and step-by-step mathematical breakdown.`;
  }
  return `${tool.name} on ApexTools is a free, privacy-first online utility. All computations and file transformations process locally or within private auto-purged memory with zero sign-up.`;
}

function generateDefaultHowTo(tool: ToolMetadata): HowToStep[] {
  if (tool.categorySlug === 'document' || tool.categorySlug === 'image' || tool.categorySlug === 'video' || tool.categorySlug === 'audio' || tool.categorySlug === 'archive') {
    return [
      {
        title: 'Select or Upload Your File',
        description: `Drag and drop your file into the ${tool.name} canvas, or click to browse files from your device.`,
        tip: 'Files are processed securely and automatically deleted within 1 hour.',
      },
      {
        title: 'Configure Conversion Options',
        description: 'Choose your desired output quality, resolution, format parameters, or compression level.',
      },
      {
        title: 'Convert & Download',
        description: `Click Convert to process your file. Download the finished asset directly to your computer or mobile device.`,
      },
    ];
  }

  return [
    {
      title: 'Enter Input Value or Data',
      description: `Input your value or paste text into the input field for ${tool.name}.`,
      tip: 'Supports real-time computation as you type.',
    },
    {
      title: 'Adjust Settings or Units',
      description: 'Select desired output format, decimal precision, or transformation flags.',
    },
    {
      title: 'Copy or Save Output',
      description: 'The result is calculated instantly. Click Copy or Download to save your converted result.',
    },
  ];
}

function generateDefaultFaqs(tool: ToolMetadata): FaqItem[] {
  const isConverter = tool.slug.includes('-to-');
  const [fromPart, toPart] = isConverter ? tool.slug.split('-to-') : ['', ''];
  const fromName = isConverter ? formatUnitName(fromPart) : 'Input';
  const toName = isConverter ? formatUnitName(toPart) : 'Output';

  return [
    {
      question: `How does ${tool.name} work?`,
      answer: `${tool.name} executes standard algorithmic transformation to convert ${fromName} into ${toName} with maximum accuracy and high performance.`,
    },
    {
      question: `Is ${tool.name} completely free to use?`,
      answer: `Yes, ${tool.name} is 100% free with no registration, no watermarks, and no software installation required.`,
    },
    {
      question: 'Is my data secure and private?',
      answer: 'Yes. All calculations and transformations run with privacy-first standards. Client-side utilities run locally in your browser, and server-assisted operations auto-purge files within 1 hour.',
    },
    {
      question: 'Can I use this tool on my mobile phone or tablet?',
      answer: `Yes! ${tool.name} is fully responsive and optimized for touchscreens on iOS Safari, Android Chrome, tablets, and desktop browsers.`,
    },
  ];
}

function findReverseTool(tool: ToolMetadata): { name: string; url: string } | undefined {
  if (!tool.slug.includes('-to-')) return undefined;
  const parts = tool.slug.split('-to-');
  if (parts.length !== 2) return undefined;
  const reverseSlug = `${parts[1]}-to-${parts[0]}`;

  const reverse = ALL_TOOLS.find(
    (t) => t.slug === reverseSlug || (t.categorySlug === tool.categorySlug && t.slug.includes(parts[1]) && t.slug.includes(parts[0]))
  );

  if (reverse) {
    return {
      name: reverse.name,
      url: `/convert/${reverse.categorySlug}/${reverse.slug}`,
    };
  }
  return undefined;
}

function findRelatedTools(tool: ToolMetadata): ToolMetadata[] {
  // 1. Same category, different slug
  const sameCategory = ALL_TOOLS.filter(
    (t) => t.categorySlug === tool.categorySlug && t.slug !== tool.slug
  );

  // Score relevance
  const scored = sameCategory.map((t) => {
    let score = 0;
    // Shared unit/ext matching
    if (tool.fromExt && (t.fromExt === tool.fromExt || t.toExt === tool.fromExt)) score += 3;
    if (tool.toExt && (t.toExt === tool.toExt || t.fromExt === tool.toExt)) score += 3;
    if (tool.fromUnit && (t.fromUnit === tool.fromUnit || t.toUnit === tool.fromUnit)) score += 3;
    if (t.popular) score += 1;
    return { tool: t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 4).map((s) => s.tool);
}

// ---------------------------------------------------------------------------
// Explicit Curated Tool Registry for Core & Regional Tools
// ---------------------------------------------------------------------------

const CURATED_TOOL_DATA: Record<string, Partial<ToolSeoData>> = {
  'marla-to-square-feet': {
    seoTitle: 'Marla to Square Feet Converter Pakistan | مرلہ سے مربع فٹ | ApexTools',
    metaDescription: 'Free online Marla to Square Feet (Sq Ft) converter for Pakistan real estate. Supports Lahore/LDA/DHA (225 sq ft), Patwari/Revenue (272.25 sq ft), and CDA (250 sq ft) with interactive plot visualizer.',
    definition: 'A Marla is a traditional South Asian unit of land measurement widely used in Pakistan and India. In Pakistan real estate, 1 Marla equals 225 square feet (LDA/DHA Lahore), 250 square feet (Islamabad/CDA), or 272.25 square feet (Revenue/Patwari standard).',
    directAnswer: 'In Lahore, DHA, and most urban housing societies, 1 Marla equals 225 square feet. Under the official Board of Revenue / Patwari standard, 1 Marla equals 272.25 square feet. In Islamabad CDA sectors, 1 Marla equals 250 square feet. Multiply your Marla count by the applicable standard to calculate total square feet.',
    formula: {
      title: 'Marla to Square Feet Calculation Formula',
      expression: 'Square Feet = Marla × Standards (225 [LDA/DHA] | 250 [CDA] | 272.25 [Patwari])\nKanal = Marla ÷ 20\nSquare Yards (Gazz) = Square Feet ÷ 9',
      example: '5 Marla (Lahore Standard) = 5 × 225 = 1,125 sq ft (125 sq yards). 5 Marla (Patwari Standard) = 5 × 272.25 = 1,361.25 sq ft.',
      inverseExpression: 'Marla = Square Feet ÷ Standard Factor (225, 250, or 272.25)',
    },
    conversionTable: {
      title: 'Marla to Square Feet Reference Matrix (Punjab & Islamabad Standards)',
      headers: ['Plot Size (Marla)', 'LDA / DHA (225 Sq Ft)', 'Patwari Standard (272.25 Sq Ft)'],
      rows: [
        { fromValue: '1 Marla', toValue: '225 sq ft', extraInfo: '272.25 sq ft' },
        { fromValue: '3 Marla', toValue: '675 sq ft', extraInfo: '816.75 sq ft' },
        { fromValue: '5 Marla', toValue: '1,125 sq ft', extraInfo: '1,361.25 sq ft' },
        { fromValue: '7 Marla', toValue: '1,575 sq ft', extraInfo: '1,905.75 sq ft' },
        { fromValue: '10 Marla (0.5 Kanal)', toValue: '2,250 sq ft', extraInfo: '2,722.50 sq ft' },
        { fromValue: '1 Kanal (20 Marla)', toValue: '4,500 sq ft', extraInfo: '5,445.00 sq ft' },
      ],
      caption: 'Standard land measurement standards verified across Punjab Land Records Authority (PLRA) and private housing authorities.',
    },
    faqs: [
      {
        question: 'How many square feet are in 1 Marla in Pakistan?',
        answer: 'In Pakistan, 1 Marla equals 225 square feet in modern private housing schemes and development authorities such as LDA (Lahore), DHA, and Bahria Town. In rural revenue records managed by the Patwari (Board of Revenue), 1 Marla equals 272.25 square feet. In Islamabad CDA sectors, 1 Marla is commonly calculated as 250 square feet.',
      },
      {
        question: 'How many Marlas are in 1 Kanal?',
        answer: 'There are exactly 20 Marlas in 1 Kanal across all measurement systems in Pakistan.',
      },
      {
        question: 'How do I convert square feet to Marla?',
        answer: 'To convert square feet to Marla, divide the square footage by 225 for Lahore/DHA housing societies, or by 272.25 for official government Patwari land records.',
      },
      {
        question: 'What is 5 Marla plot size in feet?',
        answer: 'A standard 5 Marla plot in Lahore (1,125 sq ft) is typically 25 feet wide by 45 feet long (25×45 ft). Under the Patwari standard (1,361 sq ft), dimensions are commonly 25×54.5 feet.',
      },
    ],
    aliases: ['marla to sq ft', '1 marla in square feet', 'marla to square feet lahore', 'marla to sq ft pakistan', 'calculate marla from sq ft'],
    lastUpdated: '2026-09-18',
  },
  'square-feet-to-marla': {
    seoTitle: 'Square Feet to Marla Calculator Pakistan | مربع فٹ سے مرلہ | ApexTools',
    metaDescription: 'Convert Square Feet to Marla, Kanal, Square Yards (Gazz), and Sarsahi accurately across LDA (225), CDA (250), and Patwari (272.25) standards in Pakistan.',
    definition: 'The Square Feet to Marla converter transforms architectural and cadastral square footage into traditional South Asian land denominations including Marla, Kanal, and Sarsahi.',
    directAnswer: 'To convert Square Feet to Marla, divide your total square footage by the standard Marla size: divide by 225 for LDA/DHA Lahore, by 250 for Islamabad CDA, or by 272.25 for rural/Patwari revenue records.',
    formula: {
      title: 'Square Feet to Marla Mathematical Formula',
      expression: 'Marla = Square Feet ÷ Marla Size (225 for LDA/DHA | 250 for CDA | 272.25 for Patwari)\nTotal Kanal = Marla ÷ 20',
      example: '1,125 sq ft ÷ 225 = exactly 5.0 Marla. 2,250 sq ft ÷ 225 = exactly 10.0 Marla (0.5 Kanal).',
      inverseExpression: 'Square Feet = Marla × Standard Factor',
    },
    aliases: ['sq ft to marla', 'square feet to marla calculator', 'convert sq ft into marla', 'feet to marla'],
    lastUpdated: '2026-09-18',
  },
  'tola-to-grams': {
    seoTitle: 'Tola to Grams Gold Converter Pakistan | تولہ سے گرام | ApexTools',
    metaDescription: 'Convert Sarafa gold weight between Tola, Grams, Masha, and Ratti (1 Tola = 11.6638g). Calculate 24K, 22K, 21K, and 18K gold rates and jewelry valuations in PKR.',
    definition: 'A Tola is a traditional Vedic and South Asian unit of mass now standardized by the All Pakistan Sarafa Association at exactly 11.6638038 grams for precious metals including gold and silver.',
    directAnswer: '1 Tola equals exactly 11.6638 grams (or 11,664 milligrams). 1 Tola also subdivides into 12 Masha or 96 Ratti. To convert Tola to Grams, multiply the Tola amount by 11.6638.',
    formula: {
      title: 'Tola to Grams & Sarafa Weight Conversion Formula',
      expression: 'Grams = Tola × 11.6638038\n1 Tola = 12 Masha = 96 Ratti | 1 Masha = 0.9720 g | 1 Ratti = 0.1215 g\nGold Value = (Tola Weight × 24K Rate) × (Karat ÷ 24)',
      example: '2.5 Tola = 2.5 × 11.6638 = 29.1595 grams of 24K gold.',
      inverseExpression: 'Tola = Grams ÷ 11.6638',
    },
    conversionTable: {
      title: 'Tola to Grams Gold Reference Matrix (Sarafa Standard)',
      headers: ['Tola Weight', 'Grams Equivalent', 'Masha Subdivisions'],
      rows: [
        { fromValue: '0.25 Tola (Paao Tola)', toValue: '2.916 g', extraInfo: '3 Masha (24 Ratti)' },
        { fromValue: '0.50 Tola (Aadha Tola)', toValue: '5.832 g', extraInfo: '6 Masha (48 Ratti)' },
        { fromValue: '1 Tola', toValue: '11.664 g', extraInfo: '12 Masha (96 Ratti)' },
        { fromValue: '2.5 Tola', toValue: '29.160 g', extraInfo: '30 Masha' },
        { fromValue: '5 Tola', toValue: '58.319 g', extraInfo: '60 Masha' },
        { fromValue: '10 Tola (1 Biskut)', toValue: '116.638 g', extraInfo: '120 Masha' },
      ],
      caption: 'Gold weight certified according to All Pakistan Gem and Jewelers Association standards.',
    },
    faqs: [
      {
        question: 'How many grams are in 1 Tola of gold in Pakistan?',
        answer: '1 Tola of gold equals exactly 11.6638 grams across all Sarafa jewelers and bullion exchanges in Pakistan.',
      },
      {
        question: 'How many Masha are in 1 Tola?',
        answer: 'There are 12 Masha in 1 Tola. Each Masha equals approximately 0.972 grams.',
      },
      {
        question: 'What is the formula to convert Grams to Tola?',
        answer: 'Divide the total weight in grams by 11.6638. For example, 50 grams ÷ 11.6638 = 4.286 Tola.',
      },
    ],
    aliases: ['1 tola in grams', 'tola to grams gold', 'tola to gram pakistan', 'gold tola in gram'],
    lastUpdated: '2026-09-18',
  },
  'maund-to-kg': {
    seoTitle: 'Maund to KG Converter Pakistan | من سے کلو گرام | ApexTools',
    metaDescription: 'Convert Mandi wholesale crop weights from Maund (40 kg), Seer, and Chhatak to Kilograms and Metric Tons. Calculate wheat, rice, and cotton trade batch pricing in Lakhs/Crores.',
    definition: 'A Maund (traditionally known as Mann) is an agricultural mass measurement unit standardized across Pakistan grain markets (Ghalla Mandi) at exactly 40 Kilograms.',
    directAnswer: '1 Maund (Mann) equals exactly 40 kilograms. To convert Maund to Kilograms, multiply the number of Maunds by 40. For example, 10 Maunds = 400 kg.',
    formula: {
      title: 'Maund to Kilograms Agricultural Formula',
      expression: 'Kilograms = Maund × 40\n1 Maund = 40 Seer | 1 Seer = 1.0 kg (Standard Mandi) or 0.933 kg (Imperial)\nMetric Tons = (Maund × 40) ÷ 1,000',
      example: '25 Maunds of wheat = 25 × 40 = 1,000 kg (1.0 Metric Ton).',
      inverseExpression: 'Maund = Kilograms ÷ 40',
    },
    aliases: ['1 maund in kg', 'maund to kg', 'mann to kg pakistan', '1 mann in kg'],
    lastUpdated: '2026-09-18',
  },
  'usd-to-pkr': {
    seoTitle: 'USD to PKR Today | US Dollar to Pakistani Rupee Live Exchange Rate | ApexTools',
    metaDescription: 'Live USD to PKR interbank and open market exchange rates with real-time conversion matrices ($1 to $10,000), 7D/30D historical trend charts, and remittance savings calculator.',
    definition: 'The USD to PKR currency converter calculates real-time exchange rates between the United States Dollar (USD) and the Pakistani Rupee (PKR), reflecting live interbank mid-market and open-market forex valuations.',
    directAnswer: 'To convert US Dollars (USD) to Pakistani Rupees (PKR), multiply your USD amount by the current live exchange rate. ApexTools updates rates hourly from global mid-market interbank forex feeds.',
    formula: {
      title: 'USD to PKR Exchange Rate Formula',
      expression: 'PKR Amount = USD Amount × Live Exchange Rate (PKR per USD)\nRemittance Net = (USD × Rate) - Bank Transfer Fees',
      example: 'At an exchange rate of 280.50 PKR, $100 USD converts to Rs. 28,050 PKR.',
      inverseExpression: 'USD Amount = PKR Amount ÷ Live Exchange Rate',
    },
    aliases: ['dollar rate in pakistan today', '1 dollar in pkr', 'usd to pkr live', 'us dollar to pakistani rupee'],
    lastUpdated: '2026-09-18',
  },
  'heic-to-jpg': {
    seoTitle: 'HEIC to JPG Converter — Convert iPhone Photos Online Free | ApexTools',
    metaDescription: 'Convert Apple iPhone HEIC/HEIF photos to universal high-quality JPG images in seconds. 100% free, preserves EXIF metadata, and auto-deletes files in 2 hours.',
    definition: 'High Efficiency Image Container (HEIC) is Apple\'s default photo format for iPhone cameras. Converting HEIC to JPEG makes photos universally readable on Windows PCs, Android phones, and web browsers.',
    directAnswer: 'To convert iPhone HEIC photos to JPG, upload your .heic files to ApexTools, select your JPEG quality level, and download the converted .jpg images instantly. Fast, free, and no watermark.',
    formula: {
      title: 'HEIC to JPEG Transcoding Specification',
      expression: 'HEVC / H.265 Bitstream Decoding -> sRGB Color Matrix Conversion -> MozJPEG DCT 4:2:0 Quantization\nCompression Ratio: ~1.8x to 2.2x file size expansion from compressed HEIF container',
      example: 'A 2.1 MB iPhone HEIC image transforms into a sharp, universal 2.4 MB JPEG (92% quality) in under 2 seconds.',
    },
    aliases: ['convert heic to jpg', 'iphone photo to jpg', 'heif to jpg online free', 'apple heic converter'],
    lastUpdated: '2026-09-18',
  },
  'pdf-to-word': {
    seoTitle: 'PDF to Word Converter — Convert PDF to DOCX Online Free | ApexTools',
    metaDescription: 'Convert PDF documents to editable Microsoft Word DOCX files online with 100% layout and font preservation. Free, secure, and auto-purged within 1 hour.',
    definition: 'A PDF to Word converter parses Portable Document Format (PDF) files, extracts text streams, tables, and images, and reconstructs them into an editable Microsoft Word (.docx) document.',
    directAnswer: 'Upload your PDF document to ApexTools, click Convert to Word, and download your fully editable DOCX file in seconds. Layouts, tables, bullet points, and fonts are preserved with high fidelity.',
    formula: {
      title: 'PDF Document Parsing & DOCX Reconstruction Pipeline',
      expression: 'PDF DOM Traversal (PDF.js) -> Text Run & Bounding Box Extraction -> Table Grid Detection -> Office Open XML (DOCX) Packing',
      example: 'A 12-page invoice PDF with tables and headers converts into an editable Word document with preserved paragraph alignment.',
    },
    aliases: ['convert pdf to docx', 'pdf to word free', 'editable pdf to word online'],
    lastUpdated: '2026-09-18',
  },
  'compress-pdf': {
    seoTitle: 'Compress PDF Online — Reduce PDF File Size Free | ApexTools',
    metaDescription: 'Compress PDF files online by up to 80% without losing readable text or image clarity. Free PDF file size reducer with customizable DPI presets.',
    definition: 'PDF compression optimizes internal vector paths, recompresses embedded raster images via Flate/DCT algorithms, and removes redundant metadata to shrink total byte size.',
    directAnswer: 'To compress a PDF file, drag and drop it into ApexTools, select your compression level (Extreme, Recommended, or High Quality), and download the optimized PDF. Reduces file sizes under 1MB for email attachments and portal submissions.',
    formula: {
      title: 'PDF Stream Optimization & Image Downsampling Algorithm',
      expression: 'Compression Savings = (1 - Optimized File Size ÷ Original File Size) × 100%\nRaster Stream Re-compression: DCT / FlateDecode at 150 DPI target threshold',
      example: 'A 15 MB scanned contract PDF compresses to 1.8 MB (-88% reduction) while remaining crisp and readable.',
    },
    aliases: ['reduce pdf size', 'compress pdf under 1mb', 'shrink pdf file online free'],
    lastUpdated: '2026-09-18',
  },
};

// ---------------------------------------------------------------------------
// Main Public API: getToolSeoData
// ---------------------------------------------------------------------------

export function getToolSeoData(toolOrSlug: ToolMetadata | string, categorySlug?: string): ToolSeoData {
  let tool: ToolMetadata | undefined;

  if (typeof toolOrSlug === 'string') {
    tool = categorySlug
      ? getToolBySlug(categorySlug, toolOrSlug)
      : ALL_TOOLS.find((t) => t.slug === toolOrSlug);
  } else {
    tool = toolOrSlug;
  }

  if (!tool) {
    throw new Error(`Tool not found for SEO data: ${toolOrSlug}`);
  }

  const curated = CURATED_TOOL_DATA[tool.slug] || {};

  // Build complete cohesive data
  const seoTitle = curated.seoTitle || `${tool.name} — Free Online Converter | ${siteConfig.name}`;
  const metaDescription = curated.metaDescription || `${tool.description} Fast, free, accurate, and completely private with zero registration required.`;
  const definition = curated.definition || `${tool.name} is a high-speed online utility for converting and calculating ${tool.categoryName.toLowerCase()} with zero friction.`;
  const directAnswer = curated.directAnswer || generateDefaultDirectAnswer(tool);
  const howToSteps = curated.howToSteps || generateDefaultHowTo(tool);
  const faqs = curated.faqs || generateDefaultFaqs(tool);
  const reverseTool = curated.reverseTool !== undefined ? curated.reverseTool : findReverseTool(tool);
  const relatedTools = curated.relatedTools || findRelatedTools(tool);
  const lastUpdated = curated.lastUpdated || tool.lastUpdated || '2026-09-18';
  const aliases = curated.aliases || [
    tool.name.toLowerCase(),
    `convert ${tool.name.toLowerCase()}`,
    `${tool.slug.replace(/-/g, ' ')}`,
  ];

  const keywords = Array.from(
    new Set([
      tool.name,
      `${tool.name} online`,
      `free ${tool.name}`,
      `${tool.name} calculator`,
      tool.categoryName,
      ...aliases,
    ])
  );

  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    categorySlug: tool.categorySlug,
    categoryName: tool.categoryName,
    description: tool.description,
    shortDescription: curated.shortDescription || tool.description.slice(0, 120),
    definition,
    directAnswer,
    formula: curated.formula,
    howToSteps,
    conversionTable: curated.conversionTable,
    faqs,
    relatedTools,
    reverseTool,
    seoTitle,
    metaDescription,
    keywords,
    aliases,
    lastUpdated,
    badge: tool.badge,
  };
}

export function getAllToolsSeoData(): ToolSeoData[] {
  return ALL_TOOLS.map((tool) => getToolSeoData(tool));
}
