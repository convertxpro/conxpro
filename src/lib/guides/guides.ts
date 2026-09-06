import { FaqItem } from '@/components/layout/FAQAccordion';

export interface GuideArticle {
  slug: string;
  title: string;
  shortDescription: string;
  category: 'Real Estate' | 'Gold & Currency' | 'Image & Media' | 'Document & PDF' | 'Unit Converters';
  categorySlug: string;
  publishedDate: string;
  updatedDate: string;
  author: string;
  readTime: string;
  featured?: boolean;
  coverImage?: string;
  relatedTool: {
    name: string;
    slug: string;
    categorySlug: string;
    ctaText: string;
  };
  tableOfContents: { id: string; title: string }[];
  keyTakeaways: string[];
  contentHtml: string;
  faqs: FaqItem[];
}

export const GUIDES: GuideArticle[] = [
  {
    slug: 'pakistan-property-measurement-units-guide',
    title: 'Pakistan Property & Land Measurement Units: Complete Marla, Kanal & Square Feet Guide',
    shortDescription: 'Master traditional Pakistani land measurement units. Learn the critical difference between the 225 sq ft housing society Marla (DHA/Bahria) vs the 272.25 sq ft Patwari Revenue standard.',
    category: 'Real Estate',
    categorySlug: 'unit',
    publishedDate: '2026-08-20',
    updatedDate: '2026-08-27',
    author: 'Engr. Tariq Mehmood, Land Surveying Specialist',
    readTime: '6 min read',
    featured: true,
    relatedTool: {
      name: 'Marla to Square Feet Converter',
      slug: 'marla-to-square-feet',
      categorySlug: 'unit',
      ctaText: 'Calculate Land & Marla Online',
    },
    tableOfContents: [
      { id: 'introduction', title: '1. Overview of Pakistani Land Units' },
      { id: 'the-marla-dilemma', title: '2. The 225 vs 272.25 Sq Ft Marla Conflict' },
      { id: 'standard-conversion-table', title: '3. Standard Hierarchy Table (Sarsahi to Murabba)' },
      { id: 'regional-district-variations', title: '4. District-Specific Land Variations' },
      { id: 'patwari-terms-glossary', title: '5. Crucial Patwari & Fard Terminology' },
      { id: 'interactive-calculator', title: '6. Embedded Interactive Converter' },
      { id: 'faqs', title: '7. Frequently Asked Questions' },
    ],
    keyTakeaways: [
      'Modern housing authorities (DHA, Bahria, LDA, CDA) calculate 1 Marla as 225 Square Feet (1 Kanal = 4,500 Sq Ft = 20 Marla).',
      'The official Punjab & KPK Board of Revenue (Patwari record) calculates 1 Marla as 272.25 Square Feet (1 Karam = 5.5 ft).',
      'Buying 1 Kanal in DHA gets you 4,500 sq ft; buying 1 Kanal in agricultural registry gives you 5,445 sq ft (a 21% difference in physical land size).',
      '1 Murabba = 25 Killas/Acres = 200 Kanals = 4,000 Marlas.',
    ],
    contentHtml: `
      <h2 id="introduction">1. Overview of Pakistani Land Units</h2>
      <p>Real estate transactions, property registry documents (Fard Malkiyat), and architectural drawings in Pakistan frequently blend British imperial units (Square Feet, Square Yards, Acres) with traditional South Asian revenue units (Karam, Sarsahi, Marla, Kanal, Murabba).</p>
      <p>Understanding these units is crucial for property buyers, overseas Pakistanis, civil engineers, and legal practitioners to avoid major financial discrepancies during land transfers and registry verifications.</p>

      <h2 id="the-marla-dilemma">2. The 225 vs 272.25 Sq Ft Marla Conflict</h2>
      <p>The most common and costly mistake in Pakistani property transactions occurs due to dual standards for Marla:</p>
      <ul>
        <li><strong>LDA / DHA Urban Standard:</strong> <code>1 Marla = 225 Sq Ft</code> (Used in DHA Lahore, Bahria Town, LDA City, Gulberg, Rawalpindi).</li>
        <li><strong>Patwari / Revenue Standard:</strong> <code>1 Marla = 272.25 Sq Ft</code> (Mandated by Punjab & KPK Board of Revenue based on 1 Karam = 5.5 ft).</li>
        <li><strong>CDA Islamabad Standard:</strong> <code>1 Marla = 250 Sq Ft</code> (Applied in specific older Islamabad and Rawalpindi municipal sectors).</li>
      </ul>

      <h2 id="standard-conversion-table">3. Standard Hierarchy Table (Sarsahi to Murabba)</h2>
      <table class="my-4 w-full border-collapse border border-slate-700 text-left text-xs">
        <thead class="bg-slate-800 text-slate-200">
          <tr>
            <th class="border border-slate-700 p-2">Unit</th>
            <th class="border border-slate-700 p-2">Urban DHA/LDA Standard</th>
            <th class="border border-slate-700 p-2">Patwari Revenue Standard</th>
            <th class="border border-slate-700 p-2">Square Meters (m²)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 font-mono text-slate-300">
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold">1 Sarsahi</td>
            <td class="border border-slate-700 p-2">25 Sq Ft</td>
            <td class="border border-slate-700 p-2 text-emerald-400">30.25 Sq Ft</td>
            <td class="border border-slate-700 p-2">2.81 m²</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold text-indigo-400">1 Marla</td>
            <td class="border border-slate-700 p-2">225 Sq Ft</td>
            <td class="border border-slate-700 p-2 text-emerald-400">272.25 Sq Ft</td>
            <td class="border border-slate-700 p-2">20.90 / 25.29 m²</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold text-indigo-400">1 Kanal (20 Marla)</td>
            <td class="border border-slate-700 p-2">4,500 Sq Ft (500 Sq Yd)</td>
            <td class="border border-slate-700 p-2 text-emerald-400">5,445 Sq Ft (605 Sq Yd)</td>
            <td class="border border-slate-700 p-2">418.06 / 505.85 m²</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold text-indigo-400">1 Acre / Killa (8 Kanal)</td>
            <td class="border border-slate-700 p-2">36,000 Sq Ft</td>
            <td class="border border-slate-700 p-2 text-emerald-400">43,560 Sq Ft</td>
            <td class="border border-slate-700 p-2">4,046.86 m²</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold">1 Murabba (25 Acres)</td>
            <td class="border border-slate-700 p-2">900,000 Sq Ft</td>
            <td class="border border-slate-700 p-2 text-emerald-400">1,089,000 Sq Ft</td>
            <td class="border border-slate-700 p-2">101,171 m²</td>
          </tr>
        </tbody>
      </table>

      <h2 id="regional-district-variations">4. District-Specific Land Variations</h2>
      <p>While urban housing schemes have unified around 225 sq ft, provincial Patwar records vary across provinces:</p>
      <ul>
        <li><strong>Punjab (Lahore, Faisalabad, Multan):</strong> 1 Marla = 9 Sarsahi = 272.25 sq ft in revenue records; 225 sq ft in approved private housing societies.</li>
        <li><strong>Sindh (Karachi, Hyderabad):</strong> Land is measured in <strong>Square Yards (Gazz)</strong> and <strong>Acres</strong>. 120 Sq Yd (~5.33 Marla) and 240 Sq Yd (~10.66 Marla) are standard plot sizes.</li>
        <li><strong>KPK (Peshawar, Abbottabad, Mardan):</strong> Patwari standard 272.25 sq ft applies in rural tehsils; Galiyat region often uses local Jareeb denominations.</li>
      </ul>

      <h2 id="patwari-terms-glossary">5. Crucial Patwari & Fard Terminology</h2>
      <ul>
        <li><strong>Fard (فرد):</strong> Official property ownership record certificate issued by the Land Record Authority (Arazi Record Center).</li>
        <li><strong>Khasra (خسرہ):</strong> Specific parcel/plot number allocated to a piece of land in village settlement maps (Shajra).</li>
        <li><strong>Khatoni (کھتونی):</strong> Holding number indicating tenant or cultivator details under a Khewat.</li>
        <li><strong>Khewat (کھیوٹ):</strong> Account number representing one or multiple joint landowners in the revenue mauza.</li>
        <li><strong>Intiqal (انتقال):</strong> Mutation registration officially transferring legal land title from seller to buyer.</li>
      </ul>
    `,
    faqs: [
      {
        question: 'What is the exact size of 1 Marla in DHA Lahore and Bahria Town?',
        answer: 'In DHA Lahore, Bahria Town, and all LDA-approved private housing societies, 1 Marla is officially calculated as exactly 225 Square Feet (25 Square Yards / Gazz).',
      },
      {
        question: 'Why does the Patwari calculate Marla as 272.25 sq ft instead of 225?',
        answer: 'The Board of Revenue standard is based on the traditional British settlement rod (Karam = 5.5 feet). 1 Sarsahi = 1 Karam × 1 Karam = 30.25 sq ft. 1 Marla = 9 Sarsahi = 272.25 sq ft. This standard remains legally binding on all agricultural land registrations.',
      },
      {
        question: 'How many Marlas are in 1 Acre in Pakistan?',
        answer: 'In the official Patwari revenue standard, 1 Acre (Killa) equals exactly 8 Kanals or 160 Marlas (43,560 Square Feet).',
      },
    ],
  },
  {
    slug: 'tola-masha-grams-gold-purity-guide',
    title: 'Gold Weight & Purity Guide in Pakistan: Tola, Masha, Ratti to Grams Conversion & 24K vs 22K',
    shortDescription: 'Comprehensive guide to Pakistani bullion and Sarafa market standards. Calculate gold price per tola, grams to tola ratios, and karat purity formulas (24K, 22K, 21K, 18K).',
    category: 'Gold & Currency',
    categorySlug: 'unit',
    publishedDate: '2026-08-22',
    updatedDate: '2026-08-27',
    author: 'Haji Muhammad Rizwan, Sarafa Bullion Analyst',
    readTime: '5 min read',
    featured: true,
    relatedTool: {
      name: 'Gold Tola to Grams Converter',
      slug: 'tola-to-grams',
      categorySlug: 'unit',
      ctaText: 'Calculate Gold Price & Purity',
    },
    tableOfContents: [
      { id: 'gold-units-overview', title: '1. South Asian Gold Weight Units' },
      { id: 'mathematical-ratios', title: '2. Exact Gram Ratios (Tola, Masha, Ratti)' },
      { id: 'karat-purity-breakdown', title: '3. Gold Purity Karats (24K vs 22K vs 21K vs 18K)' },
      { id: 'making-charges-calculation', title: '4. Sarafa Price & Jarta (Making Charges) Formula' },
      { id: 'faqs', title: '5. Frequently Asked Questions' },
    ],
    keyTakeaways: [
      '1 International Metric Tola in Pakistan equals exactly 11.6638038 grams.',
      '1 Tola = 12 Masha = 96 Ratti = 11.664 Grams.',
      '24 Karat gold is 99.9% pure bullion. 22 Karat gold contains 91.67% pure gold (popular for bridal jewelry in Pakistan).',
      'To calculate 22K price from 24K tola rate: Multiply 24K Rate × (22 / 24) = Rate × 0.9167.',
    ],
    contentHtml: `
      <h2 id="gold-units-overview">1. South Asian Gold Weight Units</h2>
      <p>In Pakistan’s Sarafa markets (Karachi, Lahore, Rawalpindi, Peshawar, Multan), gold and silver jewelry are traded in traditional Ayurvedic weight denominations: <strong>Tola (تولہ)</strong>, <strong>Masha (ماشہ)</strong>, and <strong>Ratti (رتی)</strong>.</p>
      <p>While bullion bars are minted in metric grams or Troy ounces internationally, retail jewelers formulate quotes based on daily rates issued by the All Pakistan Sarafa Gems and Jewellers Association (APSGJA).</p>

      <h2 id="mathematical-ratios">2. Exact Gram Ratios (Tola, Masha, Ratti)</h2>
      <ul>
        <li><strong>1 Tola</strong> = <code>11.6638 Grams</code></li>
        <li><strong>1 Masha</strong> = 1/12 Tola = <code>0.97198 Grams</code></li>
        <li><strong>1 Ratti</strong> = 1/8 Masha = 1/96 Tola = <code>0.12149 Grams</code></li>
        <li><strong>1 Gram</strong> = <code>0.085735 Tola</code></li>
      </ul>

      <h2 id="karat-purity-breakdown">3. Gold Purity Karats (24K vs 22K vs 21K vs 18K)</h2>
      <table class="my-4 w-full border-collapse border border-slate-700 text-left text-xs">
        <thead class="bg-slate-800 text-slate-200">
          <tr>
            <th class="border border-slate-700 p-2">Karat</th>
            <th class="border border-slate-700 p-2">Purity Percentage</th>
            <th class="border border-slate-700 p-2">Fineness (Millennial)</th>
            <th class="border border-slate-700 p-2">Primary Market Application</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 font-mono text-slate-300">
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold text-amber-400">24 Karat (24K)</td>
            <td class="border border-slate-700 p-2">99.9% - 100%</td>
            <td class="border border-slate-700 p-2">999</td>
            <td class="border border-slate-700 p-2 font-sans">Investment Biscuits & Pure Bullion Bars</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold text-amber-300">22 Karat (22K)</td>
            <td class="border border-slate-700 p-2">91.67%</td>
            <td class="border border-slate-700 p-2">916</td>
            <td class="border border-slate-700 p-2 font-sans">Bridal Sets, Bangles, Heavy Pakistani Jewelry</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold text-slate-200">21 Karat (21K)</td>
            <td class="border border-slate-700 p-2">87.5%</td>
            <td class="border border-slate-700 p-2">875</td>
            <td class="border border-slate-700 p-2 font-sans">Gulf / Dubai Gold Imports & Chains</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold text-slate-300">18 Karat (18K)</td>
            <td class="border border-slate-700 p-2">75.0%</td>
            <td class="border border-slate-700 p-2">750</td>
            <td class="border border-slate-700 p-2 font-sans">Diamond Rings, Lightweight Western Jewelry</td>
          </tr>
        </tbody>
      </table>

      <h2 id="making-charges-calculation">4. Sarafa Price & Jarta (Making Charges) Formula</h2>
      <p>When purchasing jewelry, the total customer invoice is calculated as:</p>
      <pre class="rounded-xl bg-slate-950 p-3 font-mono text-xs text-amber-300"><code>Total Price = (Weight in Tola × Purity Adjusted Rate) + Making Charges (Katai / Jarta) + Gemstone Valuation</code></pre>
    `,
    faqs: [
      {
        question: 'How many grams are in 1 Tola of gold in Pakistan?',
        answer: '1 Tola in Pakistan equals exactly 11.6638 grams (often rounded to 11.66 grams).',
      },
      {
        question: 'How do I calculate the price of 22K gold from the 24K rate?',
        answer: 'Divide the 24K tola price by 24 and multiply by 22 (or multiply the 24K rate by 0.91667). For example, if 24K gold is PKR 240,000 per tola, 22K gold is PKR 220,000 per tola.',
      },
      {
        question: 'How many Masha and Ratti are in one Tola?',
        answer: '1 Tola consists of 12 Masha. Each Masha consists of 8 Ratti, resulting in 96 Ratti in 1 Tola.',
      },
    ],
  },
  {
    slug: 'heic-to-jpg-iphone-photos-guide',
    title: 'Why Apple Uses HEIC & How to Convert iPhone Photos to JPG Free Without Quality Loss',
    shortDescription: 'Discover why Apple iOS saves camera photos as HEIC/HEIF files, how it saves 50% storage space, and how to convert HEIC to universal JPG for Windows and Android with zero quality loss.',
    category: 'Image & Media',
    categorySlug: 'image-converters',
    publishedDate: '2026-08-24',
    updatedDate: '2026-08-27',
    author: 'Zainab Qureshi, Digital Imaging Lead',
    readTime: '4 min read',
    featured: false,
    relatedTool: {
      name: 'HEIC to JPG Converter',
      slug: 'heic-to-jpg',
      categorySlug: 'image-converters',
      ctaText: 'Convert HEIC to JPG Free',
    },
    tableOfContents: [
      { id: 'what-is-heic', title: '1. What is HEIC / HEIF Format?' },
      { id: 'heic-vs-jpg-comparison', title: '2. HEIC vs JPG Detailed Comparison' },
      { id: 'compatibility-issues', title: '3. Why Windows & Web Portals Reject HEIC' },
      { id: 'how-to-convert', title: '4. Instant Zero-Loss Conversion' },
      { id: 'faqs', title: '5. Frequently Asked Questions' },
    ],
    keyTakeaways: [
      'HEIC (High Efficiency Image Container) delivers 50% smaller file size than JPG at identical visual fidelity.',
      'HEIC supports 16-bit color depth compared to JPG\'s 8-bit limit, preserving dynamic range in HDR photography.',
      'Windows 10/11, government job portals, and older browsers do not natively open HEIC without third-party codecs.',
      'ApexTools converts HEIC to standard JPEG directly in the browser via WebAssembly with zero data transmission.',
    ],
    contentHtml: `
      <h2 id="what-is-heic">1. What is HEIC / HEIF Format?</h2>
      <p>Since iOS 11, Apple defaulted iPhone and iPad camera photos to <strong>HEIF (High Efficiency Image File Format)</strong>, packaged inside the <code>.heic</code> file container using the advanced HEVC (H.265) compression codec.</p>

      <h2 id="heic-vs-jpg-comparison">2. HEIC vs JPG Detailed Comparison</h2>
      <table class="my-4 w-full border-collapse border border-slate-700 text-left text-xs">
        <thead class="bg-slate-800 text-slate-200">
          <tr>
            <th class="border border-slate-700 p-2">Feature</th>
            <th class="border border-slate-700 p-2">HEIC (Apple iPhone)</th>
            <th class="border border-slate-700 p-2">JPG / JPEG (Universal Standard)</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-800 font-mono text-slate-300">
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold">Average File Size</td>
            <td class="border border-slate-700 p-2 text-emerald-400">1.8 MB (50% lighter)</td>
            <td class="border border-slate-700 p-2">3.8 MB</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold">Color Depth</td>
            <td class="border border-slate-700 p-2 text-emerald-400">16-bit Deep Color</td>
            <td class="border border-slate-700 p-2">8-bit Standard</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold">Live Photos & Burst</td>
            <td class="border border-slate-700 p-2 text-emerald-400">Supported (single file)</td>
            <td class="border border-slate-700 p-2">No (requires MOV + JPG)</td>
          </tr>
          <tr>
            <td class="border border-slate-700 p-2 font-sans font-semibold">Compatibility</td>
            <td class="border border-slate-700 p-2 text-amber-400">Limited (Apple ecosystem)</td>
            <td class="border border-slate-700 p-2 text-emerald-400">100% Universal</td>
          </tr>
        </tbody>
      </table>

      <h2 id="compatibility-issues">3. Why Windows & Web Portals Reject HEIC</h2>
      <p>Because HEVC codec licensing involves commercial royalties, Microsoft Windows does not bundle native HEIC support out-of-the-box. Furthermore, job portals (FPSC, PPSC), university admission systems, and visa application sites explicitly mandate <code>.jpg</code> or <code>.png</code> uploads.</p>
    `,
    faqs: [
      {
        question: 'Can I make my iPhone save photos as JPG automatically?',
        answer: 'Yes! Open iOS Settings > Camera > Formats, and select "Most Compatible" instead of "High Efficiency". This saves photos directly as JPG.',
      },
      {
        question: 'Does converting HEIC to JPG lose image quality?',
        answer: 'When using ApexTools with maximum 100% quality settings, the visual fidelity is imperceptibly identical to the original iPhone capture.',
      },
    ],
  },
  {
    slug: 'how-to-compress-pdf-for-government-portals',
    title: 'How to Compress PDF to 500KB or 1MB for Government, University & Visa Portals',
    shortDescription: 'Step-by-step tutorial to shrink scanned PDF document sizes under 500KB or 100KB for FPSC, PPSC, NADRA, FBR, and international visa portals without unreadable text.',
    category: 'Document & PDF',
    categorySlug: 'document-converters',
    publishedDate: '2026-08-25',
    updatedDate: '2026-08-27',
    author: 'Bilal Farooq, Document Processing Architect',
    readTime: '4 min read',
    featured: false,
    relatedTool: {
      name: 'Compress PDF Online',
      slug: 'compress-pdf',
      categorySlug: 'document-converters',
      ctaText: 'Compress PDF Files Now',
    },
    tableOfContents: [
      { id: 'why-portals-restrict-pdf', title: '1. Why Portals Impose 500KB / 1MB File Size Caps' },
      { id: 'dpi-resolution-guide', title: '2. DPI Resolution & Color Space Optimization' },
      { id: 'compression-methods', title: '3. Lossless vs Lossy PDF Downsampling' },
      { id: 'step-by-step-guide', title: '4. Step-by-Step Optimization Workflow' },
      { id: 'faqs', title: '5. Frequently Asked Questions' },
    ],
    keyTakeaways: [
      'Government portals (FPSC, PPSC, NTS, NADRA, FBR) enforce strict 500KB or 1MB file caps to protect server storage and bandwidth.',
      'Scanned documents from mobile apps (CamScanner) often contain uncompressed 300+ DPI color bitmaps, ballooning file sizes up to 15MB.',
      'Downsampling embedded scan bitmaps to 150 DPI (Screen / Web Quality) reduces file size by 85% while retaining crisp, readable text.',
    ],
    contentHtml: `
      <h2 id="why-portals-restrict-pdf">1. Why Portals Impose 500KB / 1MB File Size Caps</h2>
      <p>Public sector recruitment agencies (FPSC, PPSC, SPSC, KPPSC) and tax authorities (FBR IRIS) receive hundreds of thousands of candidate applications simultaneously. Strict file limits prevent server memory exhaustion and ensure lightning-fast document verification.</p>

      <h2 id="dpi-resolution-guide">2. DPI Resolution & Color Space Optimization</h2>
      <p>Most mobile phone scanning apps generate oversized PDF documents because they capture 24-bit TrueColor images at 300 to 600 DPI. For standard A4 degrees, CNIC cards, and experience letters:</p>
      <ul>
        <li><strong>300 DPI Color:</strong> ~4 MB per page (Overkill for screen review)</li>
        <li><strong>150 DPI Grayscale:</strong> ~350 KB per page (Ideal for government submission)</li>
        <li><strong>72 DPI Black & White:</strong> ~90 KB per page (Ultra-compressed for 100KB limits)</li>
      </ul>
    `,
    faqs: [
      {
        question: 'Will compressing my PDF make my degree or CNIC unreadable?',
        answer: 'ApexTools preserves text vector streams and applies intelligent bicubic downsampling to images, ensuring all text, stamps, and signatures remain sharp and legibly clear.',
      },
      {
        question: 'What is the maximum file size for FPSC and PPSC online applications?',
        answer: 'FPSC typically limits CNIC and document scans to 500KB, while photograph uploads must remain under 30KB.',
      },
    ],
  },
  {
    slug: 'usd-to-pkr-forex-remittance-guide',
    title: 'USD to PKR Forex & Remittance Guide: Interbank vs Open Market & SBP PRI Incentives',
    shortDescription: 'Understand the difference between SBP Interbank exchange rates and Sarafa Open Market rates. Learn how to maximize remittance values via official banking channels with zero fees.',
    category: 'Gold & Currency',
    categorySlug: 'currency',
    publishedDate: '2026-08-26',
    updatedDate: '2026-08-27',
    author: 'Kamran Siddiqui, Macroeconomic & Forex Research Lead',
    readTime: '5 min read',
    featured: false,
    relatedTool: {
      name: 'USD to PKR Currency Converter',
      slug: 'usd-to-pkr',
      categorySlug: 'currency',
      ctaText: 'Check Live Interbank USD Rate',
    },
    tableOfContents: [
      { id: 'interbank-vs-open-market', title: '1. SBP Interbank vs Open Market Explained' },
      { id: 'why-spreads-exist', title: '2. Why Exchange Spreads & Hawala Risks Exist' },
      { id: 'sbp-pri-incentives', title: '3. State Bank PRI Free Remittance Scheme' },
      { id: 'best-practices-remittances', title: '4. Best Practices for Freelancers & Expats' },
      { id: 'faqs', title: '5. Frequently Asked Questions' },
    ],
    keyTakeaways: [
      'The Interbank rate is the benchmark wholesale exchange rate set by commercial banks and the State Bank of Pakistan (SBP).',
      'The Open Market rate is quoted by Exchange Companies for physical foreign currency cash notes, usually carrying a 0.5% to 1.5% margin.',
      'Under SBP\'s Pakistan Remittance Initiative (PRI), home remittances of $100 or more sent through legal banking channels incur ZERO transfer fees.',
      'IT exporters and freelancers can retain up to 50% of export proceeds in specialized Exporters\' Specialized Foreign Currency Accounts (ESFCAs).',
    ],
    contentHtml: `
      <h2 id="interbank-vs-open-market">1. SBP Interbank vs Open Market Explained</h2>
      <p>When monitoring Pakistani Rupee (PKR) exchange rates, two distinct rates are reported daily:</p>
      <ul>
        <li><strong>Interbank Exchange Rate:</strong> The rate at which licensed commercial banks trade currencies for sovereign debt payments, oil imports, and official export/import LC settlements.</li>
        <li><strong>Open Market (Kerb) Rate:</strong> The retail rate at which exchange companies (EC) buy and sell physical foreign currency banknotes to international travelers and individual citizens.</li>
      </ul>

      <h2 id="sbp-pri-incentives">3. State Bank PRI Free Remittance Scheme</h2>
      <p>The Government of Pakistan, via the State Bank, reimburses commercial banks standard TT charges on transactions equal to or exceeding <strong>USD $100</strong> (or equivalent in SAR, AED, GBP, EUR), ensuring overseas Pakistanis can send money to their families completely free of charge.</p>
    `,
    faqs: [
      {
        question: 'Why is the Open Market dollar rate higher than the Interbank rate?',
        answer: 'The open market reflects physical cash availability, import duty on cash notes, and consumer travel demand, creating a normal spread of PKR 1.00 to 2.50 above interbank rates.',
      },
      {
        question: 'Are home remittances taxed in Pakistan?',
        answer: 'No. Legitimate foreign remittances transferred via official banking channels under SBP PRI are exempt from withholding tax and income tax under the Income Tax Ordinance 2001.',
      },
    ],
  },
];

export function getAllGuides(): GuideArticle[] {
  return GUIDES;
}

export function getGuideBySlug(slug: string): GuideArticle | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getGuidesByCategory(categorySlug: string): GuideArticle[] {
  return GUIDES.filter((g) => g.categorySlug === categorySlug);
}
