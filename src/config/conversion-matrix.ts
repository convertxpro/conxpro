/**
 * Programmatic SEO Conversion Matrix
 * Maps high-volume, high-intent conversion permutations for automated ranking and sitemap generation.
 */

export interface ProgrammaticPair {
  slug: string;
  fromFormat: string;
  toFormat: string;
  categorySlug: 'image' | 'media' | 'audio' | 'document' | 'developer' | 'unit' | 'currency';
  categoryName: string;
  title: string;
  metaDescription: string;
  h1: string;
  searchVolumeTier: 'high' | 'very-high' | 'ultra-high';
  keywords: string[];
  faqs: { question: string; answer: string }[];
}

export const PROGRAMMATIC_CONVERSION_PAIRS: ProgrammaticPair[] = [
  // --- High Volume Image Converters ---
  {
    slug: 'heic-to-jpg',
    fromFormat: 'HEIC',
    toFormat: 'JPG',
    categorySlug: 'image',
    categoryName: 'Image Conversion Suite',
    title: 'HEIC to JPG Converter — Convert iPhone Apple Photos to JPG Free',
    metaDescription: 'Convert HEIC and HEIF photos from iPhone or iPad to high quality JPG online in seconds. 100% private, batch processing, zero software installation required.',
    h1: 'Convert HEIC to JPG Online',
    searchVolumeTier: 'ultra-high',
    keywords: ['heic to jpg', 'convert heic to jpg', 'iphone photo to jpg', 'heic converter online', 'free heic to jpg'],
    faqs: [
      {
        question: 'Why do iPhones shoot photos in HEIC format instead of JPG?',
        answer: 'Apple uses High Efficiency Image Container (HEIC) because it compresses images to approximately half the file size of a standard JPEG while maintaining higher visual dynamic range and 16-bit color depth.'
      },
      {
        question: 'Will converting HEIC to JPG decrease image quality?',
        answer: 'ApexTools uses high-precision lossy-to-lossless mathematical transcoding that retains 98%+ original pixel fidelity while ensuring compatibility across Windows, Android, and web platforms.'
      },
      {
        question: 'Are my personal iPhone photos uploaded to your server?',
        answer: 'Whenever supported by modern browsers, conversions execute directly inside your local browser memory via WebAssembly/HTML5 Canvas, or are automatically purged within minutes with zero logs.'
      }
    ]
  },
  {
    slug: 'webp-to-png',
    fromFormat: 'WEBP',
    toFormat: 'PNG',
    categorySlug: 'image',
    categoryName: 'Image Conversion Suite',
    title: 'WebP to PNG Converter — Transparent & Lossless Online Conversion',
    metaDescription: 'Convert Google WebP images to lossless PNG format with full transparency preservation. Fast, free, browser-based utility by ApexTools.',
    h1: 'Convert WebP to PNG Online with Transparency',
    searchVolumeTier: 'ultra-high',
    keywords: ['webp to png', 'convert webp to png', 'save webp as png', 'transparent webp to png', 'webp converter'],
    faqs: [
      {
        question: 'Does converting WebP to PNG preserve the transparent background?',
        answer: 'Yes. ApexTools preserves 8-bit alpha channels completely so transparent logos, icons, and cutouts remain fully transparent in the resulting PNG.'
      },
      {
        question: 'Why do so many websites download images as .webp instead of .png?',
        answer: 'WebP is developed by Google to speed up web page load times through aggressive modern compression algorithms. Converting to PNG allows universal editing in Photoshop, Illustrator, and Premiere.'
      }
    ]
  },
  {
    slug: 'png-to-svg',
    fromFormat: 'PNG',
    toFormat: 'SVG',
    categorySlug: 'image',
    categoryName: 'Image Conversion Suite',
    title: 'PNG to SVG Converter — Vectorize Bitmap Logos & Icons Online Free',
    metaDescription: 'Convert raster PNG images into scalable vector SVG graphics. Perfect for logos, illustrations, web design, and high-resolution printing.',
    h1: 'Convert PNG to Scalable Vector SVG',
    searchVolumeTier: 'very-high',
    keywords: ['png to svg', 'convert png to vector', 'vectorize png online', 'png to svg free', 'raster to vector'],
    faqs: [
      {
        question: 'What is the benefit of converting PNG to SVG?',
        answer: 'SVGs are resolution-independent XML vector files that can scale infinitely to any billboard, mobile display, or print size without ever pixelating or blurring.'
      }
    ]
  },
  {
    slug: 'jpg-to-png',
    fromFormat: 'JPG',
    toFormat: 'PNG',
    categorySlug: 'image',
    categoryName: 'Image Conversion Suite',
    title: 'JPG to PNG Converter — Convert JPEG Photos to Lossless PNG Online',
    metaDescription: 'Easily convert JPG/JPEG photos to PNG format for higher contrast, cleaner typography, and lossless graphic rendering. Free instant converter.',
    h1: 'Convert JPG to PNG Online',
    searchVolumeTier: 'ultra-high',
    keywords: ['jpg to png', 'convert jpeg to png', 'jpg to png converter', 'free jpg to png'],
    faqs: [
      {
        question: 'When should I convert JPG to PNG?',
        answer: 'Convert to PNG when you need uncompressed crisp edges for text, screenshots, logos, or diagrams, or when preparing an image for transparent background editing.'
      }
    ]
  },

  // --- High Volume Video Converters ---
  {
    slug: 'mov-to-mp4',
    fromFormat: 'MOV',
    toFormat: 'MP4',
    categorySlug: 'media',
    categoryName: 'Video & Media Engine',
    title: 'MOV to MP4 Converter — Convert Apple QuickTime Video to MP4 Online',
    metaDescription: 'Convert iPhone, Mac, and QuickTime MOV recordings to universal H.264 MP4 video format. Fast, high bitrate preservation, zero watermarks.',
    h1: 'Convert MOV to MP4 Video Online',
    searchVolumeTier: 'ultra-high',
    keywords: ['mov to mp4', 'convert mov to mp4', 'apple mov to mp4', 'iphone video to mp4', 'quicktime to mp4'],
    faqs: [
      {
        question: 'Why will my MOV video not play on Windows or Android?',
        answer: 'MOV is Apple QuickTime proprietary container. MP4 with H.264 video and AAC audio is the global standard compatible with every smart TV, Windows PC, Android, and browser.'
      }
    ]
  },
  {
    slug: 'mkv-to-mp4',
    fromFormat: 'MKV',
    toFormat: 'MP4',
    categorySlug: 'media',
    categoryName: 'Video & Media Engine',
    title: 'MKV to MP4 Converter — Lossless Matroska Video Transcoding Free',
    metaDescription: 'Transcode MKV video files with multi-track audio and subtitles into streamable MP4 format. Instant, private, and compatible everywhere.',
    h1: 'Convert MKV to MP4 Online',
    searchVolumeTier: 'very-high',
    keywords: ['mkv to mp4', 'convert mkv to mp4', 'matroska to mp4', 'play mkv on tv', 'fast mkv to mp4 converter'],
    faqs: [
      {
        question: 'Can I play converted MP4 files on smart TVs and gaming consoles?',
        answer: 'Yes! The converted MP4 files use standard baseline profiles supported by PlayStation, Xbox, Samsung Tizen, LG webOS, and iOS/Android players.'
      }
    ]
  },
  {
    slug: 'mp4-to-gif',
    fromFormat: 'MP4',
    toFormat: 'GIF',
    categorySlug: 'media',
    categoryName: 'Video & Media Engine',
    title: 'MP4 to GIF Converter — Make Animated GIFs from Video Clips Online',
    metaDescription: 'Convert video clips into lightweight, looping animated GIFs for Discord, Slack, Twitter, and Reddit with customizable frame rate and dimensions.',
    h1: 'Convert MP4 Video to Animated GIF',
    searchVolumeTier: 'ultra-high',
    keywords: ['mp4 to gif', 'video to gif', 'convert mp4 to gif', 'make gif from video', 'animated gif maker'],
    faqs: [
      {
        question: 'How do I keep the GIF file size small?',
        answer: 'Limit your clip length to 3–6 seconds, lower the FPS to 12–15 fps, and restrict width to 480px–600px for optimal Discord and web chat performance.'
      }
    ]
  },

  // --- High Volume Audio Converters ---
  {
    slug: 'm4a-to-mp3',
    fromFormat: 'M4A',
    toFormat: 'MP3',
    categorySlug: 'audio',
    categoryName: 'Audio Studio Suite',
    title: 'M4A to MP3 Converter — Convert Apple Voice Memos & AAC to 320kbps MP3',
    metaDescription: 'Convert iPhone Voice Memos, iTunes M4A, and AAC audio files to high-fidelity 320kbps MP3 audio format. 100% free with batch download.',
    h1: 'Convert M4A to MP3 Online (Up to 320kbps)',
    searchVolumeTier: 'ultra-high',
    keywords: ['m4a to mp3', 'convert m4a to mp3', 'iphone voice memo to mp3', 'm4a converter 320kbps', 'apple audio to mp3'],
    faqs: [
      {
        question: 'How do I convert an iPhone Voice Memo to MP3?',
        answer: 'Share the Voice Memo to your Files app, drag and drop the .m4a file into ApexTools, and download your universal 320kbps MP3 instantly.'
      }
    ]
  },
  {
    slug: 'wav-to-mp3',
    fromFormat: 'WAV',
    toFormat: 'MP3',
    categorySlug: 'audio',
    categoryName: 'Audio Studio Suite',
    title: 'WAV to MP3 Converter — Compress Heavy Studio Audio to MP3 Online',
    metaDescription: 'Compress heavy studio uncompressed WAV recordings into 90% lighter 320kbps MP3s without audible loss in clarity. Fast in-browser processing.',
    h1: 'Convert WAV to MP3 Online',
    searchVolumeTier: 'very-high',
    keywords: ['wav to mp3', 'compress wav to mp3', 'wav to mp3 320kbps', 'convert audio wav to mp3'],
    faqs: [
      {
        question: 'How much file size is saved by converting WAV to MP3?',
        answer: 'A standard uncompressed 50MB studio WAV file will typically compress down to 4MB–7MB as a 320kbps MP3, saving over 85% disk space.'
      }
    ]
  },

  // --- High Volume Document Converters ---
  {
    slug: 'pdf-to-word',
    fromFormat: 'PDF',
    toFormat: 'DOCX',
    categorySlug: 'document',
    categoryName: 'Document & PDF Suite',
    title: 'PDF to Word Converter — Convert PDF to Editable DOCX Online Free',
    metaDescription: 'Convert non-editable PDF documents into clean, fully editable Microsoft Word (.docx) files with formatting, fonts, and table preservation.',
    h1: 'Convert PDF to Editable Word (DOCX)',
    searchVolumeTier: 'ultra-high',
    keywords: ['pdf to word', 'convert pdf to docx', 'pdf to word editable', 'free pdf to word converter', 'pdf to doc'],
    faqs: [
      {
        question: 'Can I edit the converted Word document in Microsoft Word or Google Docs?',
        answer: 'Yes! The output is a standard OpenXML (.docx) file fully editable in Microsoft Word, Google Docs, Apple Pages, and LibreOffice.'
      }
    ]
  },
  {
    slug: 'word-to-pdf',
    fromFormat: 'DOCX',
    toFormat: 'PDF',
    categorySlug: 'document',
    categoryName: 'Document & PDF Suite',
    title: 'Word to PDF Converter — Convert DOCX & DOC Documents to PDF Free',
    metaDescription: 'Convert Microsoft Word DOCX and DOC files into clean, print-ready, secure PDF documents with preserved layout, margins, and typography.',
    h1: 'Convert Word to PDF Online',
    searchVolumeTier: 'ultra-high',
    keywords: ['word to pdf', 'convert docx to pdf', 'doc to pdf online', 'save word as pdf free'],
    faqs: [
      {
        question: 'Why convert Word documents to PDF before sharing or printing?',
        answer: 'PDF locks formatting, typography, and page breaks so your recipient sees the exact layout regardless of whether they have the specific fonts installed.'
      }
    ]
  },

  // --- High Volume Regional Converters ---
  {
    slug: 'marla-to-square-feet',
    fromFormat: 'Marla',
    toFormat: 'Sq Ft',
    categorySlug: 'unit',
    categoryName: 'Regional Land & Property Engine',
    title: 'Marla to Square Feet Converter Pakistan | مرلہ سے مربع فٹ | ApexTools',
    metaDescription: 'Convert Marla to Square Feet accurately for Pakistan real estate. Supports Lahore/LDA/DHA (225 sq ft), Patwari Revenue (272.25 sq ft), and CDA (250 sq ft).',
    h1: 'Marla to Square Feet (Sq Ft) Real Estate Calculator',
    searchVolumeTier: 'very-high',
    keywords: ['marla to square feet', '1 marla in sq ft lahore', 'marla to sq ft calculator', 'dha marla size', 'patwari marla size'],
    faqs: [
      {
        question: 'What is the exact size of 1 Marla in DHA Lahore?',
        answer: 'In DHA Lahore, Bahria Town, and all LDA housing developments, 1 Marla is strictly standardized as 225 Square Feet (1 Kanal = 20 Marlas = 4,500 Sq Ft).'
      },
      {
        question: 'Why does the Patwari (Revenue) Marla calculate as 272.25 Sq Ft?',
        answer: 'The traditional British-era Punjab Revenue standard defines 1 Karam as 5.5 feet (66 inches). A Sarsahi is 1 square Karam (30.25 sq ft), and 1 Marla is 9 Sarsahis (9 × 30.25 = 272.25 sq ft).'
      }
    ]
  },
  {
    slug: 'tola-to-grams',
    fromFormat: 'Tola',
    toFormat: 'Grams',
    categorySlug: 'unit',
    categoryName: 'Precious Metals & Gold Engine',
    title: 'Tola to Grams Gold Converter Pakistan | تولہ سے گرام | ApexTools',
    metaDescription: 'Convert Sarafa gold weight between Tola, Grams, Masha, and Ratti (1 Tola = 11.6638g). Real-time 24K, 22K, 21K, and 18K gold rate calculator in PKR.',
    h1: 'Tola to Grams Gold & Sarafa Weight Converter',
    searchVolumeTier: 'very-high',
    keywords: ['1 tola in grams', 'tola to grams', 'tola to masha', 'gold rate per tola', '24k gold tola price'],
    faqs: [
      {
        question: 'How many grams are in 1 Tola of gold?',
        answer: '1 Tola is legally and traditionally equal to 11.6638038 grams (or 180 troy grains). In local Pakistani Sarafa jewelers, 1 Tola also equals 12 Mashas or 96 Rattis.'
      }
    ]
  },
  {
    slug: 'usd-to-pkr',
    fromFormat: 'USD',
    toFormat: 'PKR',
    categorySlug: 'currency',
    categoryName: 'Forex & Remittance Engine',
    title: 'USD to PKR Today — Live US Dollar to Pakistani Rupee Exchange Rate',
    metaDescription: 'Check live USD to PKR interbank and open market exchange rates, daily conversion matrices ($1 to $10,000), remittance comparisons, and 30-day trends.',
    h1: 'USD to PKR Live Exchange Rate & Conversion Calculator',
    searchVolumeTier: 'ultra-high',
    keywords: ['usd to pkr', 'dollar rate today pakistan', 'convert dollar to pkr', 'usd to pkr open market', 'interbank dollar rate'],
    faqs: [
      {
        question: 'What is the difference between Interbank and Open Market USD rate in Pakistan?',
        answer: 'The Interbank rate is set during commercial bank forex trading hours for international trade. The Open Market rate is quoted by exchange companies for cash currency purchases and foreign travel.'
      }
    ]
  }
];

export function getProgrammaticPair(slug: string): ProgrammaticPair | undefined {
  return PROGRAMMATIC_CONVERSION_PAIRS.find((p) => p.slug === slug);
}
