import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ALL_TOOLS, getToolBySlug } from '@/config/categories';
import { generateToolMetadata } from '@/lib/seo/metadata';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { ConverterCanvas } from '@/components/converters/ConverterCanvas';
import { DEVELOPER_TOOL_FAQS, HARDWARE_TOOL_FAQS, AUDIO_TOOL_FAQS } from '@/lib/seo/faqData';

interface ToolPageProps {
  params: {
    category: string;
    tool: string;
  };
}

export async function generateStaticParams() {
  return ALL_TOOLS.map((tool) => ({
    category: tool.categorySlug,
    tool: tool.slug,
  }));
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = getToolBySlug(params.category, params.tool);
  if (!tool) return {};

  let seoTitle = tool.name;
  let seoDescription = tool.description;
  const keywords = [
    tool.name,
    `${tool.name} online`,
    `free ${tool.name}`,
    `${tool.name} calculator`,
    tool.categoryName,
  ];

  if (tool.slug === 'marla-to-square-feet') {
    seoTitle = 'Marla to Square Feet Converter Pakistan | مرلہ سے مربع فٹ | ApexTools';
    seoDescription = 'Free online Marla to Square Feet (Sq Ft) converter for Pakistan real estate. Supports Lahore/LDA/DHA (225 sq ft), Patwari/Revenue (272.25 sq ft), and CDA (250 sq ft) with interactive plot visualizer.';
    keywords.push('1 marla in sq ft lahore', 'marla to square feet', 'marla to sq ft calculator', 'marla to kanal', 'dha lahore marla size', 'patwari marla size');
  } else if (tool.slug === 'square-feet-to-marla') {
    seoTitle = 'Square Feet to Marla Calculator Pakistan | مربع فٹ سے مرلہ | ApexTools';
    seoDescription = 'Convert Square Feet to Marla, Kanal, Square Yards (Gazz), and Sarsahi accurately across LDA (225), CDA (250), and Patwari (272.25) standards in Pakistan.';
    keywords.push('square feet to marla', 'sq ft to marla pakistan', 'calculate marla from square feet', 'kanal calculator', 'square yard to marla');
  } else if (tool.slug === 'tola-to-grams') {
    seoTitle = 'Tola to Grams Gold Converter Pakistan | تولہ سے گرام | ApexTools';
    seoDescription = 'Convert Sarafa gold weight between Tola, Grams, Masha, and Ratti (1 Tola = 11.6638g). Calculate 24K, 22K, 21K, and 18K gold rates and jewelry valuations in PKR.';
    keywords.push('1 tola in grams', 'tola to grams gold', 'tola to masha', 'gold rate per tola pakistan', '24k gold rate per tola', '22k gold tola price');
  } else if (tool.slug === 'maund-to-kg') {
    seoTitle = 'Maund to KG Converter Pakistan | من سے کلو گرام | ApexTools';
    seoDescription = 'Convert Mandi wholesale crop weights from Maund (40 kg), Seer, and Chhatak to Kilograms and Metric Tons. Calculate wheat, rice, and cotton trade batch pricing in Lakhs/Crores.';
    keywords.push('1 maund in kg', 'maund to kg', 'mann to kg pakistan', '1 mann in kg wheat', 'maund to metric ton', 'ghalla mandi rates');
  } else if (tool.slug === 'hijri-to-gregorian') {
    seoTitle = 'Hijri to Gregorian Calendar Converter Pakistan | اسلامی ہجری کیلنڈر | ApexTools';
    seoDescription = 'Accurate Islamic lunar Hijri date to Gregorian solar date converter with Pakistan Central Ruet-e-Hilal moon sighting offset adjustments and annual Islamic event dates.';
    keywords.push('hijri to gregorian', 'islamic date today pakistan', 'gregorian to hijri converter', 'islamic calendar 1448', 'ruet e hilal moon sighting today');
  } else if (tool.slug === 'usd-to-pkr') {
    seoTitle = 'USD to PKR Today | US Dollar to Pakistani Rupee Live Exchange Rate | ApexTools';
    seoDescription = 'Live USD to PKR interbank and open market exchange rates with real-time conversion matrices ($1 to $10,000), 7D/30D historical trend charts, and remittance savings calculator.';
    keywords.push('usd to pkr', 'dollar rate in pakistan today', '1 dollar in pkr', 'usd to pkr interbank', 'open market dollar rate lahore karachi', 'remittance to pakistan usd to pkr');
  } else if (tool.slug === 'sar-to-pkr') {
    seoTitle = 'SAR to PKR Today | Saudi Riyal to Pakistani Rupee Exchange Rate | ApexTools';
    seoDescription = 'Live Saudi Riyal (SAR) to Pakistani Rupee (PKR) exchange rate for overseas remittances. Pre-calculated conversion tables from 1 to 10,000 SAR with zero bank fee guide.';
    keywords.push('sar to pkr', 'saudi riyal to pkr', '1 riyal in pakistani rupees', 'riyal rate in pakistan today', 'saudi remittance to pakistan');
  } else if (tool.slug === 'aed-to-pkr') {
    seoTitle = 'AED to PKR Today | UAE Dirham to Pakistani Rupee Live Rate | ApexTools';
    seoDescription = 'Convert UAE Dirham (AED) to Pakistani Rupee (PKR) with live hourly rates, Dubai exchange company comparisons, and 30-day historical chart.';
    keywords.push('aed to pkr', 'uae dirham to pkr', '1 dirham in pak rupees', 'dubai dirham rate in pakistan', 'uae remittance to pkr');
  } else if (tool.slug === 'gbp-to-pkr') {
    seoTitle = 'GBP to PKR Today | British Pound to Pakistani Rupee Exchange Rate | ApexTools';
    seoDescription = 'Live British Pound Sterling (GBP) to Pakistani Rupee (PKR) rate for UK diaspora remittances, freelancer payouts, and Roshan Digital transfers.';
    keywords.push('gbp to pkr', 'pound rate in pakistan', '1 pound in pkr', 'uk remittance to pakistan');
  } else if (tool.slug === 'eur-to-pkr') {
    seoTitle = 'EUR to PKR Today | Euro to Pakistani Rupee Live Exchange Rate | ApexTools';
    seoDescription = 'Live Euro (EUR) to Pakistani Rupee (PKR) exchange rate with daily trend chart, European remittance matrix, and interbank comparison.';
    keywords.push('eur to pkr', 'euro to pakistani rupee', 'euro rate in pakistan today');
  } else if (tool.slug === 'cad-to-pkr') {
    seoTitle = 'CAD to PKR Today | Canadian Dollar to Pakistani Rupee Rate | ApexTools';
    seoDescription = 'Live Canadian Dollar (CAD) to Pakistani Rupee (PKR) exchange rate and remittance payout calculator for overseas Pakistanis in Canada.';
    keywords.push('cad to pkr', 'canadian dollar to pkr', 'cad to pkr exchange rate today');
  } else if (tool.slug === 'aud-to-pkr') {
    seoTitle = 'AUD to PKR Today | Australian Dollar to Pakistani Rupee Rate | ApexTools';
    seoDescription = 'Live Australian Dollar (AUD) to Pakistani Rupee (PKR) exchange rate with pre-calculated conversion matrices and trend tracker.';
    keywords.push('aud to pkr', 'australian dollar to pkr', 'aud to pkr rate today');
  } else if (tool.slug === 'qar-to-pkr') {
    seoTitle = 'QAR to PKR Today | Qatari Riyal to Pakistani Rupee Exchange Rate | ApexTools';
    seoDescription = 'Convert Qatari Riyal (QAR) to Pakistani Rupee (PKR) with live exchange rates for Gulf remittances and Doha exchange companies.';
    keywords.push('qar to pkr', 'qatar riyal to pkr', 'qar to pkr exchange rate');
  } else if (tool.slug === 'kwd-to-pkr') {
    seoTitle = 'KWD to PKR Today | Kuwaiti Dinar to Pakistani Rupee Rate | ApexTools';
    seoDescription = 'Live Kuwaiti Dinar (KWD) to Pakistani Rupee (PKR) rate — convert the world\'s highest-value currency with live hourly updates.';
    keywords.push('kwd to pkr', 'kuwaiti dinar to pkr', '1 kwd in pkr');
  } else if (tool.slug === 'omr-to-pkr') {
    seoTitle = 'OMR to PKR Today | Omani Rial to Pakistani Rupee Rate | ApexTools';
    seoDescription = 'Convert Omani Rial (OMR) to Pakistani Rupee (PKR) with real-time exchange rates and Muscat remittance calculators.';
    keywords.push('omr to pkr', 'omani rial to pkr', 'omr to pkr today');
  } else if (tool.slug === 'currency-converter') {
    seoTitle = 'Live Forex & Currency Converter | Real-Time Exchange Rates | ApexTools';
    seoDescription = 'Convert between 150+ world currencies with hourly live mid-market exchange rates, multi-currency comparisons, and interactive historical charts.';
    keywords.push('currency converter', 'live forex converter', 'usd to pkr', 'exchange rates live', 'convert currency online');
  } else if (tool.slug === 'heic-to-jpg') {
    seoTitle = 'HEIC to JPG Converter — Convert iPhone Photos Online Free | ApexTools';
    seoDescription = 'Convert Apple iPhone HEIC/HEIF photos to universal high-quality JPG images in seconds. 100% free, preserves EXIF metadata, and auto-deletes files in 2 hours.';
    keywords.push('heic to jpg', 'convert heic to jpg', 'iphone photo converter', 'heic to jpeg', 'heif to jpg online free', 'apple photo to jpg');
  } else if (tool.slug === 'heic-to-png') {
    seoTitle = 'HEIC to PNG Converter — Convert iPhone Photos with Transparency | ApexTools';
    seoDescription = 'Convert Apple HEIC photos to lossless PNG format with transparent alpha channels and maximum color depth. Free online converter with instant download.';
    keywords.push('heic to png', 'convert heic to png', 'apple heic png converter', 'iphone photo to png', 'heif to png transparent');
  } else if (tool.slug === 'png-to-jpg') {
    seoTitle = 'PNG to JPG Converter — Convert PNG to Lightweight JPG Online | ApexTools';
    seoDescription = 'Convert transparent PNG images to optimized JPG files with custom background matte colors and MozJPEG compression. Free online batch converter.';
    keywords.push('png to jpg', 'convert png to jpg', 'png to jpeg converter', 'reduce png size to jpg', 'image converter png to jpg');
  } else if (tool.slug === 'jpg-to-png') {
    seoTitle = 'JPG to PNG Converter — Convert JPG to Lossless PNG Format | ApexTools';
    seoDescription = 'Convert JPG and JPEG files to crisp, lossless PNG images without compression artifacts. Ideal for graphics, design assets, and screenshots.';
    keywords.push('jpg to png', 'convert jpg to png', 'jpeg to png high quality', 'convert jpeg to png online free');
  } else if (tool.slug === 'webp-to-jpg') {
    seoTitle = 'WebP to JPG Converter — Convert Google WebP to Universal JPG | ApexTools';
    seoDescription = 'Convert modern Google WebP images to universal JPG format compatible with all desktop viewers, smartphones, and editing tools.';
    keywords.push('webp to jpg', 'convert webp to jpg', 'google webp to jpeg', 'webp to jpg converter free');
  } else if (tool.slug === 'jpg-to-webp') {
    seoTitle = 'JPG to WebP Converter — Reduce Image Size by 35% Online | ApexTools';
    seoDescription = 'Convert JPG photos to lightweight next-gen WebP format. Improve Google Core Web Vitals and website page speed with 30-40% smaller file sizes.';
    keywords.push('jpg to webp', 'convert jpg to webp', 'jpeg to webp converter', 'compress jpg to webp', 'web speed image optimization');
  } else if (tool.slug === 'png-to-webp') {
    seoTitle = 'PNG to WebP Converter — Preserve Transparency with Small Size | ApexTools';
    seoDescription = 'Convert PNG graphics to WebP while maintaining full alpha transparency at 50% smaller file sizes. Ideal for web developers and designers.';
    keywords.push('png to webp', 'convert png to webp', 'transparent webp converter', 'png to webp online');
  } else if (tool.slug === 'webp-to-png') {
    seoTitle = 'WebP to PNG Converter — Convert WebP with Lossless Alpha Channel | ApexTools';
    seoDescription = 'Convert Google WebP image format to standard PNG with full transparent background support. Instant, secure, and auto-purged in 2 hours.';
    keywords.push('webp to png', 'convert webp to png', 'webp transparent to png', 'webp to png converter online');
  } else if (tool.slug === 'png-to-ico') {
    seoTitle = 'PNG to ICO Converter — Create Website Favicons & Windows Icons | ApexTools';
    seoDescription = 'Convert PNG images into 256x256 multi-resolution ICO icon files and website favicons. Free online icon generator with transparent background support.';
    keywords.push('png to ico', 'favicon generator', 'convert png to ico', 'website favicon maker', 'create ico from png');
  } else if (tool.slug === 'png-to-svg') {
    seoTitle = 'PNG to SVG Vector Wrapper — Convert Raster PNG to Scalable SVG | ApexTools';
    seoDescription = 'Convert PNG graphics into clean, scalable SVG vector wrapper documents for web design, logos, and responsive web development.';
    keywords.push('png to svg', 'convert png to svg', 'raster to svg wrapper', 'png to vector converter');
  } else if (tool.slug === 'compress-image') {
    seoTitle = 'Free Image Compressor — Reduce JPG, PNG & WebP by Up to 90% | ApexTools';
    seoDescription = 'Compress images online with MozJPEG and WebP intelligent lossy compression. Reduce photo file size without visible degradation. 100% free.';
    keywords.push('compress image', 'image compressor online', 'compress jpg', 'reduce png file size', 'compress photo size');
  } else if (tool.slug === 'resize-image') {
    seoTitle = 'Free Image Resizer — Resize Dimensions in Pixels & Percentages | ApexTools';
    seoDescription = 'Resize image width and height online with aspect ratio lock, predefined scale percentages (25% to 200%), and high-quality Lanczos resampling.';
    keywords.push('resize image', 'image resizer online', 'resize photo dimensions', 'change image size in pixels', 'scale image online');
  } else if (tool.slug === 'remove-background') {
    seoTitle = 'Remove Image Background — Free Online Cutout Generator | ApexTools';
    seoDescription = 'Remove backgrounds from photos and graphics to generate clean transparent PNG cutouts instantly. Free, private, and fast browser conversion.';
    keywords.push('remove background', 'transparent background generator', 'image cutout tool', 'remove photo background free');
  } else if (tool.slug === 'pdf-to-word') {
    seoTitle = 'PDF to Word Converter — Convert PDF to Editable DOCX Online Free | ApexTools';
    seoDescription = 'Convert PDF files into fully editable Microsoft Word DOCX documents with preserved formatting, tables, and fonts. 100% free with bank-grade 256-bit encryption.';
    keywords.push('pdf to word', 'convert pdf to docx', 'pdf to word converter free', 'pdf to doc', 'editable word from pdf');
  } else if (tool.slug === 'word-to-pdf') {
    seoTitle = 'Word to PDF Converter — Convert DOCX & DOC to PDF Online Free | ApexTools';
    seoDescription = 'Convert Microsoft Word DOCX and DOC documents into universal, high-quality PDF files instantly. Preserves exact layout, fonts, and images.';
    keywords.push('word to pdf', 'convert word to pdf', 'docx to pdf', 'doc to pdf online free');
  } else if (tool.slug === 'pdf-to-excel') {
    seoTitle = 'PDF to Excel Converter — Extract PDF Tables to XLSX Spreadsheets | ApexTools';
    seoDescription = 'Extract financial tables, spreadsheets, and structured tabular data from PDF files into formatted Microsoft Excel XLSX spreadsheets.';
    keywords.push('pdf to excel', 'convert pdf to xlsx', 'pdf to excel spreadsheet', 'extract tables from pdf');
  } else if (tool.slug === 'excel-to-pdf') {
    seoTitle = 'Excel to PDF Converter — Convert XLSX Spreadsheets to PDF Online | ApexTools';
    seoDescription = 'Convert Microsoft Excel spreadsheets (XLSX, XLS) into clean, printable PDF documents with custom page fitting and gridlines.';
    keywords.push('excel to pdf', 'convert xlsx to pdf', 'spreadsheet to pdf', 'convert excel sheet to pdf online');
  } else if (tool.slug === 'pdf-to-powerpoint') {
    seoTitle = 'PDF to PowerPoint Converter — Convert PDF to Editable PPTX Slides | ApexTools';
    seoDescription = 'Convert PDF presentation slides into fully editable Microsoft PowerPoint PPTX decks. Retain layouts, vector graphics, and slide text.';
    keywords.push('pdf to powerpoint', 'pdf to pptx', 'convert pdf to ppt', 'pdf to presentation slides');
  } else if (tool.slug === 'powerpoint-to-pdf') {
    seoTitle = 'PowerPoint to PDF Converter — Convert PPTX to PDF Online Free | ApexTools';
    seoDescription = 'Convert PowerPoint presentations (PPTX, PPT) to universal PDF format. Ideal for presentations, sharing, and high-quality printing.';
    keywords.push('powerpoint to pdf', 'pptx to pdf', 'convert powerpoint to pdf', 'ppt to pdf free');
  } else if (tool.slug === 'jpg-to-pdf') {
    seoTitle = 'JPG to PDF Converter — Combine Multiple Images into Single PDF | ApexTools';
    seoDescription = 'Combine JPG, PNG, and WebP photos into a single professional PDF document. Customize A4/Letter page sizes, margins, and orientation.';
    keywords.push('jpg to pdf', 'convert jpg to pdf', 'combine images to pdf', 'photos to pdf online free');
  } else if (tool.slug === 'pdf-to-jpg') {
    seoTitle = 'PDF to JPG / PNG Converter — Extract PDF Pages to Images | ApexTools';
    seoDescription = 'Extract all PDF pages into high-resolution JPG or PNG image files with selectable 72/150/300 DPI rendering. Download as a single ZIP package.';
    keywords.push('pdf to jpg', 'pdf to png', 'convert pdf to images', 'extract pages from pdf');
  } else if (tool.slug === 'merge-pdf') {
    seoTitle = 'Merge PDF — Combine Multiple PDF Files into One Online Free | ApexTools';
    seoDescription = 'Combine and merge multiple PDF documents in your desired sequential order with interactive drag-and-drop page management. 100% free and secure.';
    keywords.push('merge pdf', 'combine pdf files', 'join pdf documents', 'merge pdf online free', 'pdf joiner');
  } else if (tool.slug === 'split-pdf') {
    seoTitle = 'Split PDF — Extract PDF Pages & Split into Separate Files | ApexTools';
    seoDescription = 'Extract specific page ranges (e.g. 1, 3-5, 8) from PDF or split all pages into separate numbered PDF files bundled in a convenient ZIP.';
    keywords.push('split pdf', 'extract pdf pages', 'separate pdf pages', 'split pdf online free', 'pdf splitter');
  } else if (tool.slug === 'compress-pdf') {
    seoTitle = 'Compress PDF — Reduce PDF File Size by Up to 80% Online Free | ApexTools';
    seoDescription = 'Compress PDF file size without sacrificing readability. Choose Extreme, Recommended, or Less compression with technical DPI benchmark analysis.';
    keywords.push('compress pdf', 'reduce pdf size', 'shrink pdf file size', 'pdf compressor online free', 'compress pdf to 200kb');
  } else if (tool.slug === 'rotate-pdf') {
    seoTitle = 'Rotate PDF — Rotate PDF Pages 90, 180, 270 Degrees Online | ApexTools';
    seoDescription = 'Rotate individual or all pages in a PDF document by 90°, 180°, or 270° clockwise with instant visual page orientation preview.';
    keywords.push('rotate pdf', 'rotate pdf pages', 'turn pdf clockwise', 'rotate upside down pdf');
  } else if (tool.slug === 'protect-pdf') {
    seoTitle = 'Protect PDF — Password Encrypt PDF Documents with 256-bit AES | ApexTools';
    seoDescription = 'Encrypt sensitive PDF documents with military-grade 256-bit AES password encryption to prevent unauthorized viewing, printing, and copying.';
    keywords.push('protect pdf', 'password protect pdf', 'encrypt pdf', 'lock pdf with password');
  } else if (tool.slug === 'unlock-pdf') {
    seoTitle = 'Unlock PDF — Remove Password & Encryption from PDF Online | ApexTools';
    seoDescription = 'Remove password restrictions and security encryption from PDF documents to enable editing, printing, and free sharing.';
    keywords.push('unlock pdf', 'remove pdf password', 'decrypt pdf', 'pdf password remover online');
  } else if (tool.slug === 'create-zip' || tool.slug === 'zip-compressor') {
    seoTitle = 'Create ZIP Archive — Compress & Bundle Multiple Files Online | ApexTools';
    seoDescription = 'Bundle and compress multiple files into a high-efficiency ZIP archive stream. Free, fast, with customizable deflate compression levels.';
    keywords.push('create zip', 'zip files online', 'bundle files to zip', 'zip compressor free');
  } else if (tool.slug === 'extract-zip') {
    seoTitle = 'Extract ZIP Archive — Unzip, Inspect & Decompress Files Online | ApexTools';
    seoDescription = 'Unzip and inspect contents of ZIP, 7Z, and TAR archives online without installing software. View file tree and download extracted assets.';
    keywords.push('extract zip', 'unzip files online', 'open zip file', 'zip extractor free');
  } else if (tool.slug === 'video-to-mp3' || tool.slug === 'mp4-to-mp3') {
    seoTitle = `${tool.name} — Extract 320kbps MP3 Audio from Video Online Free | ApexTools`;
    seoDescription = 'Extract crystal-clear 320kbps MP3 audio tracks directly from MP4, MOV, WebM, AVI, and MKV video files. 100% free with customizable bitrate presets.';
    keywords.push('video to mp3', 'mp4 to mp3', 'extract audio from video', 'convert video to mp3', 'mp4 to mp3 320kbps', 'video audio extractor free');
  } else if (tool.slug === 'video-to-gif') {
    seoTitle = 'Video to GIF Converter — Create High-Quality Animated GIFs Online Free | ApexTools';
    seoDescription = 'Convert MP4, MOV, and WebM video clips into high-framerate animated GIFs with lanczos 2-pass palette generation. Free online GIF maker.';
    keywords.push('video to gif', 'convert mp4 to gif', 'gif maker online', 'video to animated gif', 'high quality gif converter');
  } else if (tool.slug === 'compress-video-for-discord') {
    seoTitle = 'Compress Video for Discord — Reduce Video Under 8MB & 25MB Online Free | ApexTools';
    seoDescription = 'Compress video clips to under 8MB (Discord Free) or 25MB (Discord Nitro) with smart two-pass bitrate optimization. Fast, free, and no watermark.';
    keywords.push('compress video for discord', 'discord 8mb video compressor', 'shrink video for discord', 'discord video size reducer', 'discord nitro 25mb video');
  } else if (tool.slug === 'compress-video-for-whatsapp') {
    seoTitle = 'Compress Video for WhatsApp — Reduce Video Under 16MB Fast | ApexTools';
    seoDescription = 'Compress large video files to under 16MB for WhatsApp with H.264 FastStart encoding for instant message sharing without buffering.';
    keywords.push('compress video for whatsapp', 'whatsapp 16mb video compressor', 'reduce video size for whatsapp status', 'whatsapp video size reducer');
  } else if (tool.slug === 'compress-video') {
    seoTitle = 'Video Compressor — Reduce Video File Size Online Without Quality Loss | ApexTools';
    seoDescription = 'Compress MP4, MOV, and WebM videos by up to 80% with visually lossless CRF compression. Fast FFmpeg multi-threaded rendering.';
    keywords.push('compress video', 'video compressor online', 'reduce video size', 'mp4 compressor free', 'shrink video size');
  } else if (tool.slug === 'mp4-to-webm') {
    seoTitle = 'MP4 to WebM Converter — Convert MP4 to HTML5 WebM Online Free | ApexTools';
    seoDescription = 'Convert MP4 videos into next-gen VP9/Opus WebM format for lightweight HTML5 web video embedding and faster page load speeds.';
    keywords.push('mp4 to webm', 'convert mp4 to webm', 'html5 video converter', 'mp4 to webm online free');
  } else if (tool.slug === 'webm-to-mp4') {
    seoTitle = 'WebM to MP4 Converter — Convert WebM to Universal MP4 Online | ApexTools';
    seoDescription = 'Convert Google WebM screen recordings and browser video captures into universal H.264 MP4 format with full audio sync.';
    keywords.push('webm to mp4', 'convert webm to mp4', 'webm to mp4 high quality', 'webm converter online');
  } else if (tool.slug === 'mov-to-mp4') {
    seoTitle = 'MOV to MP4 Converter — Convert iPhone QuickTime MOV to MP4 | ApexTools';
    seoDescription = 'Convert Apple QuickTime MOV videos from iPhone and Mac into universal MP4 format with zero quality degradation. Free online converter.';
    keywords.push('mov to mp4', 'convert mov to mp4', 'iphone mov to mp4', 'apple video to mp4');
  } else if (tool.slug === 'mkv-to-mp4') {
    seoTitle = 'MKV to MP4 Converter — Convert Matroska MKV to MP4 Online | ApexTools';
    seoDescription = 'Convert MKV movie files into standard MP4 format compatible with smart TVs, iPhone, Android, and gaming consoles.';
    keywords.push('mkv to mp4', 'convert mkv to mp4', 'matroska to mp4', 'mkv to mp4 converter free');
  } else if (tool.slug === 'avi-to-mp4') {
    seoTitle = 'AVI to MP4 Converter — Convert Legacy AVI to Modern MP4 Online | ApexTools';
    seoDescription = 'Convert legacy AVI video files into lightweight, modern MP4 format with crisp stereo sound. 100% free online batch converter.';
    keywords.push('avi to mp4', 'convert avi to mp4', 'avi to mp4 converter online');
  } else if (tool.slug === 'video-trim') {
    seoTitle = 'Video Trimmer & Cutter — Cut & Trim Video Clips Online Free | ApexTools';
    seoDescription = 'Trim, cut, and extract video clips online by setting precise start and duration timestamps. Fast processing with no watermarks.';
    keywords.push('video trimmer', 'cut video online', 'trim mp4 online', 'video cutter free');
  } else if (tool.slug === 'wav-to-mp3') {
    seoTitle = 'WAV to MP3 Converter — Convert WAV to 320kbps MP3 Online Free | ApexTools';
    seoDescription = 'Convert heavy uncompressed WAV audio into lightweight 320kbps MP3s saving up to 90% storage space while preserving studio sound.';
    keywords.push('wav to mp3', 'convert wav to mp3', 'wav to mp3 320kbps', 'wav to mp3 converter free');
  } else if (tool.slug === 'mp3-to-wav') {
    seoTitle = 'MP3 to WAV Converter — Convert MP3 to Uncompressed PCM WAV | ApexTools';
    seoDescription = 'Convert MP3 audio tracks into 16-bit 44.1kHz uncompressed PCM WAV files for DAW audio editing and music production.';
    keywords.push('mp3 to wav', 'convert mp3 to wav', 'mp3 to wav converter online');
  } else if (tool.slug === 'm4a-to-mp3') {
    seoTitle = 'M4A to MP3 Converter — Convert Apple Voice Memos & AAC to MP3 | ApexTools';
    seoDescription = 'Convert iPhone Voice Memos, iTunes M4A, and AAC audio into universal MP3 format with customizable 320kbps bitrates.';
    keywords.push('m4a to mp3', 'convert m4a to mp3', 'apple voice memo to mp3', 'iphone audio to mp3');
  } else if (tool.slug === 'flac-to-mp3') {
    seoTitle = 'FLAC to MP3 Converter — Convert Lossless FLAC to 320kbps MP3 | ApexTools';
    seoDescription = 'Convert lossless FLAC audio files to high-definition 320kbps MP3 files for mobile devices and car audio players.';
    keywords.push('flac to mp3', 'convert flac to mp3', 'flac to mp3 320kbps', 'lossless audio to mp3');
  } else if (tool.slug === 'audio-compress') {
    seoTitle = 'Audio Compressor — Compress MP3, WAV & M4A Audio Online Free | ApexTools';
    seoDescription = 'Compress podcasts, audiobooks, and music tracks by optimizing bitrate without muffling voices. 100% free online audio compressor.';
    keywords.push('audio compressor', 'compress mp3', 'reduce audio file size', 'compress voice recording');
  } else if (tool.slug === 'yaml-to-json') {
    seoTitle = 'YAML to JSON Converter — Convert YAML to Clean JSON Online | ApexTools';
    seoDescription = 'Convert YAML configuration files to formatted or minified JSON with instant validation, indentation controls, and key sorting. 100% client-side.';
    keywords.push('yaml to json', 'convert yaml to json', 'yaml parser online', 'yaml to json validator');
  } else if (tool.slug === 'json-to-yaml') {
    seoTitle = 'JSON to YAML Converter — Generate Clean YAML for Kubernetes & CI/CD | ApexTools';
    seoDescription = 'Convert JSON data into clean, indented YAML for Kubernetes manifests, Docker Compose, and CI/CD pipelines. Zero latency, 100% private.';
    keywords.push('json to yaml', 'convert json to yaml', 'kubernetes yaml generator', 'json to yaml online');
  } else if (tool.slug === 'toml-to-json') {
    seoTitle = 'TOML to JSON / YAML Converter — Parse Cargo & PyProject Configs | ApexTools';
    seoDescription = 'Parse Cargo.toml, pyproject.toml, and TOML configuration files into structured JSON and clean YAML with live syntax validation.';
    keywords.push('toml to json', 'toml to yaml', 'cargo toml converter', 'parse toml online');
  } else if (tool.slug === 'sql-to-json') {
    seoTitle = 'SQL to JSON & CSV Converter — Extract SQL INSERT Table Dumps | ApexTools';
    seoDescription = 'Convert SQL INSERT statements and table dumps into structured JSON arrays and tabular CSV files instantly in your browser.';
    keywords.push('sql to json', 'convert sql to json', 'sql to csv', 'sql insert parser');
  } else if (tool.slug === 'json-to-sql') {
    seoTitle = 'JSON to SQL INSERT Generator — Bulk ANSI SQL Generator | ApexTools';
    seoDescription = 'Generate bulk ANSI SQL INSERT INTO statements from JSON arrays with customizable table names, batch chunking, and dialect quotes.';
    keywords.push('json to sql', 'convert json to sql insert', 'sql generator from json', 'json to mysql');
  } else if (tool.slug === 'jwt-decoder') {
    seoTitle = 'JWT Inspector & Decoder — 100% Private Token Claims Viewer | ApexTools';
    seoDescription = 'Inspect JWT headers, decode payload claims, verify expiration countdown, and validate HMAC signatures. 100% browser-only privacy.';
    keywords.push('jwt decoder', 'jwt inspector', 'decode jwt online', 'jwt token viewer', 'jwt claims expiry');
  } else if (tool.slug === 'hash-generator') {
    seoTitle = 'Cryptographic Hash & File Checksum Generator — MD5, SHA-256, Keccak | ApexTools';
    seoDescription = 'Compute MD5, SHA-1, SHA-256, SHA-512, Keccak-256 hashes in real-time and verify large 2GB+ file checksums securely via Web Crypto.';
    keywords.push('hash generator', 'sha256 generator', 'md5 hash online', 'file checksum verifier', 'keccak 256 hash');
  } else if (tool.slug === 'css-unit-converter') {
    seoTitle = 'CSS Units Converter (PX ↔ REM ↔ EM ↔ VW ↔ PT) & Clamp() Generator | ApexTools';
    seoDescription = 'Bi-directional CSS unit conversion matrix with responsive clamp() calculator and Tailwind CSS class mapper. Live preview & zero latency.';
    keywords.push('css unit converter', 'px to rem', 'rem to px', 'css clamp generator', 'tailwind unit converter');
  } else if (tool.slug === 'qr-code-generator') {
    seoTitle = 'Smart QR Code & Barcode Generator — Wi-Fi, WhatsApp & vCard | ApexTools';
    seoDescription = 'Generate high-resolution QR codes for URLs, Wi-Fi auto-connect, vCards, and WhatsApp chats in vector SVG, PNG, and WebP formats.';
    keywords.push('qr code generator', 'free qr code maker', 'wifi qr code generator', 'whatsapp qr code', 'svg qr code');
  } else if (tool.slug === 'cron-expression-decoder') {
    seoTitle = 'Cron Expression Translator & Crontab Schedule Builder | ApexTools';
    seoDescription = 'Translate 5-field and 6-field cron expressions into plain English with interactive visual schedule builders and upcoming run time calculations.';
    keywords.push('cron expression decoder', 'cron translator', 'crontab generator', 'cron schedule humanizer');
  } else if (tool.slug === 'fbr-salary-tax-calculator') {
    seoTitle = 'FBR Salary Tax Calculator (2024–2026) Pakistan | انکم ٹیکس کیلکولیٹر | ApexTools';
    seoDescription = 'Calculate monthly and annual Pakistan income tax, net take-home salary, Filer vs Non-Filer deductions, and FBR slabs for Tax Year 2024-2026.';
    keywords.push('fbr tax calculator', 'salary tax calculator pakistan', 'income tax 2024-2025 pakistan', 'fbr tax slabs', 'take home salary calculator');
  } else if (tool.slug === 'zakat-calculator') {
    seoTitle = 'Zakat Calculator Pakistan (PKR / Gold & Silver Nisab) | زکوٰۃ کیلکولیٹر | ApexTools';
    seoDescription = 'Accurate Islamic Zakat calculator with dynamic 7.5 Tola Gold and 52.5 Tola Silver Nisab thresholds in PKR. 100% private and instant.';
    keywords.push('zakat calculator pakistan', 'zakat on gold calculator', 'nisab of zakat 2024', 'calculate zakat in pkr', 'islamic zakat calculator');
  } else if (tool.slug === 'lakh-crore-to-million-billion') {
    seoTitle = 'Lakhs & Crores to Millions & Billions Converter | لاکھ کروڑ سے ملین | ApexTools';
    seoDescription = 'Convert South Asian numbering (Lakh, Crore, Arab, Kharab) to Western (Million, Billion, Trillion) with English and Urdu words cheque writer.';
    keywords.push('lakh to million', 'crore to billion', 'lakh crore converter', 'pakistan number to words', 'urdu cheque writer');
  } else if (tool.slug === 'murabba-bigha-to-acre') {
    seoTitle = 'Murabba & Bigha to Acre / Kanal Land Converter Pakistan | زرعی رقبہ | ApexTools';
    seoDescription = 'Convert agricultural land units across Murabba, Bigha, Acre, Kanal, Marla, Biswa, and Sq Feet for Punjab, Sindh & KPK provinces.';
    keywords.push('murabba to acre', 'bigha to kanal', 'agricultural land measurement pakistan', 'murabba in acre', 'bigha to acre sindh punjab');
  } else if (tool.slug === 'electricity-bill-solar-calculator') {
    seoTitle = 'WAPDA Electricity Bill & Solar Net-Metering Calculator | بجلی کا بل | ApexTools';
    seoDescription = 'Estimate electricity bills for LESCO, IESCO, MEPCO, K-Electric with Protected/Unprotected slabs, FPA taxes, and Solar ROI net-metering offsets.';
    keywords.push('electricity bill calculator pakistan', 'lesco bill calculator', 'iesco bill estimator', 'solar net metering calculator pakistan', 'wapda unit rate');
  } else if (tool.slug === 'gas-bill-calculator') {
    seoTitle = 'Gas Bill Units Calculator (MMBTU ↔ HM³ ↔ PKR) SNGPL / SSGC | گیس کا بل | ApexTools';
    seoDescription = 'Convert gas meter HM3 readings to MMBTU and calculate SNGPL / SSGC domestic monthly gas bills with slab rates and fixed charges.';
    keywords.push('gas bill calculator pakistan', 'sngpl bill calculator', 'ssgc bill calculator', 'hm3 to mmbtu', 'gas meter reading to bill');
  } else if (tool.slug === 'avif-to-jpg') {
    seoTitle = 'AVIF to JPG / PNG / WebP Converter — Next-Gen Image Engine | ApexTools';
    seoDescription = 'Convert next-generation AVIF images to universally compatible JPG, PNG, and WebP formats with quality sliders and batch processing.';
    keywords.push('avif to jpg', 'convert avif to jpg', 'avif to png', 'avif to webp', 'next gen image converter');
  } else if (tool.slug === 'avif-to-png') {
    seoTitle = 'AVIF to PNG Converter (Transparent Alpha Preserved) | ApexTools';
    seoDescription = 'Convert next-gen AVIF images into lossless transparent PNG files with pixel-perfect alpha channels and fast browser download.';
    keywords.push('avif to png', 'convert avif to png', 'avif transparent png', 'avif to lossless png');
  } else if (tool.slug === 'jpg-to-avif') {
    seoTitle = 'JPG to AVIF Converter — Save Up to 70% File Size | ApexTools';
    seoDescription = 'Compress heavy JPG and JPEG photos into next-generation AVIF images with 70% smaller file size and stunning HDR visual fidelity.';
    keywords.push('jpg to avif', 'convert jpg to avif', 'jpeg to avif online', 'next gen image compression', 'compress jpg to avif');
  } else if (tool.slug === 'png-to-avif') {
    seoTitle = 'PNG to AVIF Converter (Transparent & High Compression) | ApexTools';
    seoDescription = 'Convert PNG graphics and logos to ultra-lightweight AVIF format with full alpha transparency support and 50% better compression than WebP.';
    keywords.push('png to avif', 'convert png to avif', 'transparent avif converter', 'png compression avif');
  } else if (tool.slug === 'webp-to-avif') {
    seoTitle = 'WebP to AVIF Converter — Next-Gen Web Optimization | ApexTools';
    seoDescription = 'Upgrade WebP images to cutting-edge AVIF format for superior compression, wider color gamuts, and faster Core Web Vitals.';
    keywords.push('webp to avif', 'convert webp to avif', 'avif vs webp', 'next gen webp to avif');
  } else if (tool.slug === 'svg-to-ico') {
    seoTitle = 'SVG to Multi-Resolution Favicon (.ICO) & High-Res PNG | ApexTools';
    seoDescription = 'Rasterize SVG vector graphics into multi-pack Windows .ico favicons (16, 32, 48, 64px) and high-resolution PNG assets.';
    keywords.push('svg to ico', 'svg to favicon', 'convert svg to ico', 'multi resolution favicon generator');
  } else if (tool.slug === 'svg-to-png') {
    seoTitle = 'SVG to High-Res PNG Converter (Custom DPI & 4K Resolution) | ApexTools';
    seoDescription = 'Rasterize SVG vector graphics to crisp high-definition PNG images with custom DPI (72–600 DPI), transparent backgrounds, and dimensions up to 4K.';
    keywords.push('svg to png', 'convert svg to png', 'svg to high res png', 'vector to png converter', 'svg rasterizer 4k');
  } else if (tool.slug === 'png-to-svg') {
    seoTitle = 'PNG to SVG Scalable Vector Wrapper Converter | ApexTools';
    seoDescription = 'Wrap raster PNG images into scalable vector SVG markup containers for modern responsive web development.';
    keywords.push('png to svg', 'convert png to svg', 'raster to svg container');
  } else if (tool.slug === 'png-to-ico') {
    seoTitle = 'PNG to ICO Favicon Generator (16x16, 32x32, 48x48, 64x64) | ApexTools';
    seoDescription = 'Convert PNG icons into multi-layered Windows ICO favicons for websites and desktop applications.';
    keywords.push('png to ico', 'png to favicon', 'convert png to ico', 'multi layer ico maker');
  } else if (tool.slug === 'gif-to-mp4') {
    seoTitle = 'GIF to MP4 / WebM Converter — 90% File Size Reduction | ApexTools';
    seoDescription = 'Convert heavy animated GIFs into smooth, lightweight looping MP4 and WebM videos with 90%+ file size reduction and faststart encoding.';
    keywords.push('gif to mp4', 'convert gif to mp4', 'gif to webm', 'reduce gif file size', 'gif to video');
  } else if (tool.slug === 'video-aspect-ratio-resizer') {
    seoTitle = 'Video Aspect Ratio & Social Canvas Resizer (9:16, 16:9, 1:1) | ApexTools';
    seoDescription = 'Resize videos to 9:16 (TikTok, Reels, Shorts), 16:9 (YouTube), and 1:1 with intelligent blurred backgrounds and crop padding.';
    keywords.push('video aspect ratio resizer', 'resize video for tiktok', 'video to 9:16', 'reels video resizer', 'blur background video resizer');
  } else if (tool.slug === 'subtitle-converter') {
    seoTitle = 'Universal Subtitles Converter & Time-Shifter (SRT, VTT, ASS) | ApexTools';
    seoDescription = 'Convert SRT, WebVTT, ASS, and SubViewer subtitles, offset timestamps in milliseconds, and clean formatting tags online.';
    keywords.push('subtitle converter', 'srt to vtt', 'vtt to srt', 'subtitle time shifter', 'sync subtitles online');
  } else if (tool.slug === 'audio-speed-pitch-changer') {
    seoTitle = 'Audio Speed & Pitch Modulator (0.5x to 2.5x with Pitch Lock) | ApexTools';
    seoDescription = 'Change audio playback speed (0.5x to 2.5x) with pitch-lock or shift musical semitones with live browser preview.';
    keywords.push('audio speed changer', 'change audio pitch', 'slow down audio', 'speed up mp3', 'audio pitch shifter online');
  } else if (tool.slug === 'audio-joiner') {
    seoTitle = 'Multi-Track Audio Joiner & Merger with Crossfade Transitions | ApexTools';
    seoDescription = 'Combine and crossfade multiple MP3, WAV, M4A, FLAC audio files into a single seamless audio track online.';
    keywords.push('audio joiner', 'merge audio files', 'combine mp3 online', 'audio merger with crossfade');
  } else if (tool.slug === 'webcam-test') {
    seoTitle = 'Free Online Webcam Test — Check Camera Resolution, FPS & Quality | ApexTools';
    seoDescription = 'Test your webcam resolution (720p, 1080p, 4K), frame rate, brightness, and device info 100% in your browser. No software install, no video recording, complete privacy.';
    keywords.push('webcam test', 'test camera online', 'webcam resolution test', 'check webcam quality', 'online camera test free', 'webcam fps test');
  } else if (tool.slug === 'mic-test') {
    seoTitle = 'Free Online Microphone Test — Check Mic Volume, Echo & Quality | ApexTools';
    seoDescription = 'Test your microphone volume level, noise floor, echo loopback, and input device info in your browser. 100% private — no audio is recorded or uploaded.';
    keywords.push('mic test', 'test microphone online', 'microphone volume test', 'mic echo test', 'check mic quality', 'online mic test free');
  } else if (tool.slug === 'speaker-test') {
    seoTitle = 'Free Online Speaker Test — Stereo, Bass & Frequency Sweep | ApexTools';
    seoDescription = 'Test speakers and headphones with left/right stereo channel verification, bass response, and full 20Hz–20kHz frequency sweep. 100% browser-based.';
    keywords.push('speaker test', 'test speakers online', 'stereo test', 'bass test', 'frequency sweep speaker', 'left right speaker test');
  } else if (tool.slug === 'screen-test') {
    seoTitle = 'Free Screen Test — Dead Pixel Checker, Refresh Rate & Color Test | ApexTools';
    seoDescription = 'Detect dead and stuck pixels, measure actual screen refresh rate (Hz), and test color accuracy with fullscreen gradient and solid color patterns.';
    keywords.push('screen test', 'dead pixel test', 'stuck pixel checker', 'screen refresh rate test', 'monitor test online', 'display color test');
  } else if (tool.slug === 'keyboard-test') {
    seoTitle = 'Free Online Keyboard Tester — Ghosting, NKRO & Key Rollover Test | ApexTools';
    seoDescription = 'Interactive visual keyboard tester with anti-ghosting N-Key Rollover benchmark, mechanical switch chatter detection, and full key map verification.';
    keywords.push('keyboard test', 'test keyboard online', 'keyboard ghosting test', 'nkro test', 'key rollover test', 'mechanical keyboard tester');
  } else if (tool.slug === 'mouse-test') {
    seoTitle = 'Free Online Mouse Tester — Click, Scroll, Polling Rate & Double-Click Test | ApexTools';
    seoDescription = 'Test mouse buttons, scroll wheel speed, polling rate, and detect double-click microswitch faults. Works with USB, wireless, and Bluetooth mice.';
    keywords.push('mouse test', 'test mouse online', 'mouse click test', 'polling rate test', 'double click test', 'mouse scroll test');
  } else if (tool.slug === 'gamepad-test') {
    seoTitle = 'Free Online Gamepad & Controller Tester — Stick Drift, Buttons & Rumble | ApexTools';
    seoDescription = 'Calibrate Xbox, PlayStation, and Switch controllers with live analog stick drift radar, trigger pressure gauges, button map, and vibration motor test.';
    keywords.push('gamepad test', 'controller test online', 'stick drift test', 'xbox controller test', 'ps5 controller test', 'gamepad drift checker');
  } else if (tool.slug === 'call-readiness' || tool.slug === 'meeting-test') {
    seoTitle = 'Video Call Readiness Test — Zoom, Google Meet & Teams Compatibility Check | ApexTools';
    seoDescription = 'All-in-one 10-second diagnostic testing camera, microphone, speaker, and WebRTC network ping for Zoom, Google Meet, Microsoft Teams, and Webex readiness.';
    keywords.push('video call test', 'zoom readiness test', 'google meet test', 'teams camera test', 'meeting readiness checker', 'webrtc test');
  }

  return generateToolMetadata({
    title: seoTitle,
    description: seoDescription,
    category: tool.categoryName,
    slug: tool.slug,
    categorySlug: tool.categorySlug,
    keywords,
  });
}

export default function ToolPage({ params }: ToolPageProps) {
  const tool = getToolBySlug(params.category, params.tool);
  if (!tool) notFound();

  const isPakistanRealEstate = tool.slug.includes('marla') || tool.slug.includes('square-feet');
  const isPakistanGold = tool.slug === 'tola-to-grams';
  const isPakistanMaund = tool.slug === 'maund-to-kg';
  const isPakistanHijri = tool.slug === 'hijri-to-gregorian';
  const isCurrency = tool.categorySlug === 'currency';
  const isDocumentOrImage =
    tool.categorySlug === 'document' ||
    tool.categorySlug === 'image' ||
    tool.categorySlug === 'archive' ||
    tool.categorySlug === 'media' ||
    tool.categorySlug === 'video' ||
    tool.categorySlug === 'audio';

  // Extract currency pair if available
  let fromCurr = 'USD';
  let toCurr = 'PKR';
  if (tool.slug.includes('-to-')) {
    const parts = tool.slug.split('-to-');
    if (parts[0]) fromCurr = parts[0].toUpperCase();
    if (parts[1]) toCurr = parts[1].toUpperCase();
  }

  const isDeveloperTool = tool.categorySlug === 'developer';
  const isHardwareTool = tool.categorySlug === 'hardware';

  // 1. How To Steps
  let howToSteps = [
    {
      title: isDocumentOrImage
        ? 'Upload Your File'
        : isDeveloperTool
        ? 'Paste or Upload Source Data'
        : isHardwareTool
        ? 'Grant Browser Permissions'
        : 'Enter Input Value',
      description: isDocumentOrImage
        ? 'Drag and drop your file into the secure dropzone above or click Browse to select from your device.'
        : isDeveloperTool
        ? `Paste your ${tool.name.replace(' Converter', '').replace(' Generator', '')} code directly into the left editor pane or click Upload to select a file.`
        : isHardwareTool
        ? 'Click "Start Test" and allow browser access to your camera, microphone, or peripherals when prompted. All data stays 100% local in your browser.'
        : isCurrency
        ? `Type the ${fromCurr} amount you want to convert to ${toCurr}.`
        : 'Type the numerical amount you want to convert into the input field.',
      tip: isDocumentOrImage
        ? 'Files up to 25MB are completely free.'
        : isDeveloperTool
        ? '100% client-side execution in your browser memory. Zero server uploads.'
        : isHardwareTool
        ? 'No data is recorded, uploaded, or stored. Zero server contact.'
        : 'Supports standard decimal notation.',
    },
    {
      title: isDeveloperTool ? 'Configure Syntax & Dialect Options' : isHardwareTool ? 'Run Interactive Diagnostics' : 'Choose Conversion Parameters',
      description: isDeveloperTool
        ? 'Adjust indentation (2 or 4 spaces), toggle alphabetical key sorting, set SQL table name and dialect quotes, or pick a built-in template.'
        : isHardwareTool
        ? 'The tool runs real-time diagnostics on your hardware, measuring resolution, frame rate, volume levels, latency, drift, and other device-specific metrics.'
        : isPakistanRealEstate
        ? 'Select your regional standard: Urban DHA/LDA (225 sq ft), Official Patwari (272.25 sq ft), or CDA Islamabad (250 sq ft).'
        : isPakistanGold
        ? 'Enter your local Sarafa 24K gold benchmark rate and optional making charges.'
        : isPakistanMaund
        ? 'Select your crop type and standard Mandi factor (40 kg per Maund).'
        : isPakistanHijri
        ? 'Select the target date and apply Ruet-e-Hilal moon sighting adjustments.'
        : isCurrency
        ? 'Select source and target currencies or swap pairs with a single click.'
        : 'Adjust target quality, output format, or unit settings as needed.',
    },
    {
      title: isDeveloperTool ? 'Instant Result & Copy / Download' : isHardwareTool ? 'Review Results & Share Report' : 'Get Instant Output & Share',
      description: isDocumentOrImage
        ? 'Click download to save your converted file. All files are automatically deleted after 1 hour.'
        : isDeveloperTool
        ? 'View formatted output in real time with line numbers and syntax highlighting. Click Copy or Download to save.'
        : isHardwareTool
        ? 'View your live diagnostic scorecard with pass/fail indicators. Copy results to share with IT support or embed this test on your own website.'
        : isCurrency
        ? `View the real-time ${toCurr} calculated total, compare multi-currency rates, inspect 30-day historical trends, or copy/share via WhatsApp.`
        : 'View your real-time calculated result, copy to clipboard, or share directly via WhatsApp.',
    },
  ];

  // 2. Mathematical Formula
  let formulaData = {
    title: `${tool.name} Mathematical Formula & Conversion Logic`,
    expression: 'Target Value = Source Value × Conversion Coefficient',
    example: '1 Unit = Standard multiplier applied with floating-point precision arithmetic.',
  };

  if (tool.slug === 'yaml-to-json' || tool.slug === 'json-to-yaml' || tool.slug === 'toml-to-json' || tool.slug === 'yaml-to-toml') {
    formulaData = {
      title: `${tool.name} Serialization & AST Mapping Specification`,
      expression: 'Native JavaScript AST = Parser.load(Input Source Stream)\nTarget Output = Serializer.dump(AST, { indent, sortKeys, dialect })',
      example: 'Strict Type Preservations: YAML & TOML Maps ↔ JSON Objects | Sequences ↔ JSON Arrays | Timestamps ↔ ISO-8601 Strings | Nulls ↔ null',
    };
  } else if (tool.slug === 'sql-to-json' || tool.slug === 'json-to-sql' || tool.slug === 'csv-to-sql') {
    formulaData = {
      title: `${tool.name} Relational Schema Transformation Specification`,
      expression: 'SQL INSERT = PartitionBatch(Rows, BatchSize) → INSERT INTO Table (Cols) VALUES (Val_1, Val_2, ...)\nEscaping Rule: Single quotes (\') → (\'\') | Identifier Quotes: MySQL (`), PostgreSQL ("), SQL Server ([])',
      example: 'Bulk chunking of 500 records into partitioned multi-row tuples with auto-inferred CREATE TABLE DDL data types.',
    };
  } else if (tool.slug === 'css-unit-converter') {
    formulaData = {
      title: 'CSS Units & Fluid clamp() Calculation Formula',
      expression: 'REM = PX / RootFontSize (16px) | EM = PX / ParentFontSize\nPreferred VW = (Slope × 100)vw where Slope = (MaxPX - MinPX) / (MaxViewport - MinViewport)\nclamp(minRem, preferredRem + preferredVw, maxRem)',
      example: '16px min at 375px viewport to 32px max at 1440px viewport yields font-size: clamp(1rem, 0.6479rem + 1.5023vw, 2rem);',
    };
  } else if (tool.slug === 'qr-code-generator') {
    formulaData = {
      title: 'QR Code Reed-Solomon Error Correction & Encoding Standard',
      expression: 'Reed-Solomon Error Correction Capacity: Low (7%), Medium (15%), Quartile (25%), High (30%)\nPayload String Formatting: Standard ISO/IEC 18004 2D Matrix Symbol',
      example: 'Wi-Fi Network: WIFI:S:Office_WiFi;T:WPA;P:SecretKey;; | WhatsApp: https://wa.me/923001234567?text=Hello',
    };
  } else if (tool.slug === 'cron-expression-decoder') {
    formulaData = {
      title: 'Unix Crontab Syntax & Execution Model Specification',
      expression: '* * * * * = [Minute: 0-59] [Hour: 0-23] [Day of Month: 1-31] [Month: 1-12] [Day of Week: 0-7 (0/7=Sun)]\nSpecial Operators: * (Any), / (Step interval), , (Value list), - (Range)',
      example: '0 9 * * 1-5 = At 09:00 AM, Monday through Friday | */15 * * * * = Every 15 minutes continuously',
    };
  } else if (tool.slug === 'lakh-crore-to-million-billion') {
    formulaData = {
      title: 'South Asian to Western Numeral Conversion Formula',
      expression: '1 Lakh = 100,000 (0.1 Million) | 10 Lakhs = 1,000,000 (1 Million)\n1 Crore = 10,000,000 (10 Million) | 10 Crores = 100,000,000 (100 Million)\n1 Arab = 1,000,000,000 (1 Billion) | 1 Kharab = 100,000,000,000 (100 Billion)',
      example: '5.5 Crore = 55,000,000 = 55 Million. In Words: "Five Crore Fifty Lakh Rupees Only" / "پانچ کروڑ پچاس لاکھ روپے فقط".',
    };
  } else if (tool.slug === 'murabba-bigha-to-acre') {
    formulaData = {
      title: 'Agricultural Land Units Conversion Formula (Punjab & Sindh)',
      expression: '1 Murabba = 25 Acres (Qillas) = 200 Kanals = 4,000 Marlas\n1 Acre (Qilla) = 8 Kanals = 160 Marlas = 43,560 Sq Ft (Revenue)\nPunjab: 1 Bigha = 4 Kanals (80 Marlas) | Sindh: 1 Bigha = 2 Kanals (40 Marlas = 0.5 Acre)',
      example: '1 Murabba (Revenue standard) = 25 × 8 × 20 × 272.25 = 1,089,000 Sq Ft (121,000 Sq Yards / Gazz).',
    };
  } else if (isPakistanRealEstate) {
    formulaData = {
      title: 'Pakistan Land Area Conversion Formula',
      expression: 'Square Feet = Marla × Standard Factor (225 sq ft, 272.25 sq ft, or 250 sq ft)\n1 Kanal = 20 Marla | 1 Acre (Qilla) = 8 Kanal = 160 Marla | 1 Sq Yard (Gazz) = 9 Sq Ft',
      example: '5 Marla (Urban Standard) = 5 × 225 = 1,125 sq ft (125 sq yards). 5 Marla (Patwari Standard) = 5 × 272.25 = 1,361.25 sq ft (151.25 sq yards).',
    };
  } else if (isPakistanGold) {
    formulaData = {
      title: 'Sarafa Gold Weight & Valuation Formula',
      expression: 'Weight in Grams = Tola × 11.6638038\n1 Tola = 12 Masha = 96 Ratti\nPure Gold Value = Tola Weight × Rate per Tola × Karat Factor (24K: 1.0, 22K: 0.9167, 21K: 0.875, 18K: 0.750)',
      example: '2.5 Tola 22K Gold @ Rs. 275,000/Tola (24K) = 2.5 × (275,000 × 22/24) = Rs. 630,208 (6.30 Lakhs).',
    };
  } else if (isPakistanMaund) {
    formulaData = {
      title: 'Agricultural Wholesale Mandi Formula',
      expression: 'Total Weight (kg) = (Maunds + Seers / 40) × 40 kg\n1 Metric Ton = 25 Maunds = 1,000 kg | 1 Maund = 40 Seers = 640 Chhataks\nTotal Trade Value = Total Maunds × Rate per Maund - Commission',
      example: '45 Maunds 20 Seers (45.5 Maunds) @ Rs. 3,900/Maund = 45.5 × 40 = 1,820 kg (1.82 MT). Gross = Rs. 177,450 (1.77 Lakhs).',
    };
  } else if (isPakistanHijri) {
    formulaData = {
      title: 'Umm al-Qura Astronomical Hijri Algorithm',
      expression: 'Hijri Date = Astronomical Lunar Synodic Calculation (29.53059 days / lunation) ± Moon Sighting Offset (Days)',
      example: 'Gregorian Date 2026-08-27 maps to 14th Rabi al-Awwal 1448 AH (with zero offset). Day begins at Maghrib (sunset).',
    };
  } else if (isCurrency) {
    formulaData = {
      title: `${fromCurr} to ${toCurr} Foreign Exchange Conversion Formula`,
      expression: `Converted Amount (${toCurr}) = Input Amount (${fromCurr}) × Mid-Market Exchange Rate (${toCurr}/${fromCurr})\nInverse Rate = 1 / (Exchange Rate)`,
      example: `100 ${fromCurr} @ Rate (e.g. 278.50) = 100 × 278.50 = ${toCurr === 'PKR' ? 'Rs. 27,850.00 PKR' : '27,850.00 ' + toCurr}. Updated hourly via Upstash Redis high-speed cache.`,
    };
  } else if (tool.categorySlug === 'document') {
    if (tool.slug === 'compress-pdf') {
      formulaData = {
        title: 'PDF Compression & Stream Optimization Technical Specification',
        expression: 'Compressed Size = Content Streams (FlateDecode / Deflate) + Downscaled Embedded Rasters (72/150 DPI) + Deduplicated XObjects\nTarget Reduction = (1 - Compressed Size / Original Size) × 100%',
        example: '8.5 MB Graphic PDF converted with Recommended Compression yields ~3.1 MB (-63% reduction) with crisp 150 DPI text fidelity.',
      };
    } else {
      formulaData = {
        title: `${tool.name} Engine & OpenXML Conversion Specification`,
        expression: 'Output Document = Extracted Document Tree (Paragraphs, Tables, Styles) ↔ Target OpenXML / PDF Binary Model\nSecurity Standard: 256-bit SSL Session Transfer • In-Memory Processing',
        example: `Input file processed via high-performance headless document bridges and rendered to exact .${tool.slug.includes('-to-') ? tool.slug.split('-to-')[1] : 'pdf'} specifications.`,
      };
    }
  } else if (tool.categorySlug === 'archive') {
    formulaData = {
      title: 'ZIP Deflate Stream Compression & Packaging Specification',
      expression: 'Archive Ratio = (1 - Compressed ZIP Size / Sum of Uncompressed Files) × 100%\nDeflate Level: 0 (Store) to 9 (Maximum LZ77 + Huffman Encoding)',
      example: '15 documents and images totaling 32.4 MB compress into an 11.2 MB ZIP package (-65% size reduction) with verified CRC32 checksums.',
    };
  } else if (tool.categorySlug === 'image') {
    if (tool.slug.includes('avif')) {
      formulaData = {
        title: 'AVIF (AV1 Image File Format) Compression Specification',
        expression: 'Target Bitrate / File Size = (AV1 Intra-Frame Prediction Block Size + Directional Transforms + 10/12-bit HDR Color Matrices) ÷ 8\nCompression Efficiency: Up to 50% smaller than WebP and 70% smaller than JPEG at identical SSIM/PSNR visual index.',
        example: 'A 4.8 MB JPEG photograph encodes into ~1.1 MB in AVIF format (-77% bandwidth saving) with full 4:2:0/4:4:4 chroma fidelity and stripped EXIF headers.',
      };
    } else if (tool.slug.includes('svg') || tool.slug.includes('ico')) {
      formulaData = {
        title: 'Vector SVG Rasterization & Favicon Multi-Packing Specification',
        expression: 'Multi-Pack ICO Container = Header (6 bytes) + Directory Entries (16 bytes × N resolutions) + Embedded PNG Streams (16px, 32px, 48px, 64px)\nRaster Density: Rendered at 300+ DPI with Lanczos resampling and anti-aliased alpha transparency.',
        example: 'A scalable vector SVG renders into a crisp 1024×1024 PNG asset and packs into a standard 4-layer Windows .ico favicon container (16/32/48/64px).',
      };
    } else {
      formulaData = {
        title: 'Image Compression & Format Transformation Specification',
        expression: 'Output Buffer = Decoded Pixel Array (RGB/RGBA) ↔ Target Quantization Matrix & Huffman/Entropy Encoder\nOptimization Level: MozJPEG / Deflate 9 / WebP Lossless / Lanczos 3 Resampling',
        example: `Uploaded image converted to .${tool.slug.includes('-to-') ? tool.slug.split('-to-')[1] : 'jpg'} with optimized byte stream and stripped EXIF privacy headers.`,
      };
    }
  } else if (tool.categorySlug === 'video' || tool.categorySlug === 'media') {
    if (tool.slug === 'gif-to-mp4' || tool.slug === 'gif-to-webm') {
      formulaData = {
        title: 'Animated GIF to H.264 / VP9 Video Compression Algorithm',
        expression: 'Bandwidth Reduction = (1 - Video Bitrate × Duration ÷ (GIF Frame Count × Frame Uncompressed Size)) × 100%\nH.264 Encoder Filter: pad=ceil(iw/2)*2:ceil(ih/2)*2 (Even macroblock alignment) • -pix_fmt yuv420p • -movflags +faststart',
        example: 'A 45 MB animated GIF compresses to 2.2 MB MP4 (-95.1% file size reduction) with 60fps smoothness and infinite HTML5 video looping.',
      };
    } else if (tool.slug === 'video-aspect-ratio-resizer') {
      formulaData = {
        title: 'Social Canvas Dynamic Filtergraph & Aspect Ratio Transformation',
        expression: 'Blurred Mirror Pipeline = [0:v]scale=W:H:increase,crop=W:H,boxblur=25:25[bg];[0:v]scale=W:H:decrease[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]\nCanvas Target Matrices: 9:16 (1080×1920) | 16:9 (1920×1080) | 1:1 (1080×1080) | 4:5 (1080×1350)',
        example: 'A horizontal 16:9 4K landscape video converts into a 9:16 TikTok/Reels canvas with a stylish blurred mirror background without cropping the main subject.',
      };
    } else {
      formulaData = {
        title: `${tool.name} FFmpeg Transcoding Specification`,
        expression: 'Target Bitrate = File Size Budget ÷ Duration | Audio Stream: AAC Stereo (192kbps) | Video Stream: libx264 (CRF 23)\nFlags: -movflags +faststart • -pix_fmt yuv420p',
        example: 'Multi-threaded native transcode pipeline with dynamic buffer sizing and timestamp alignment.',
      };
    }
  } else if (isHardwareTool) {
    formulaData = {
      title: `${tool.name} Browser Diagnostic API & Technical Specification`,
      expression: 'MediaDevices API: navigator.mediaDevices.getUserMedia({ video: { width, height, frameRate }, audio: true })\nRefresh Rate: requestAnimationFrame() frame count per 1-second window\nGamepad API: navigator.getGamepads() polling axis/button state at 16.67ms intervals',
      example: 'Webcam: 1920×1080 @ 30fps via getUserMedia constraint negotiation. Screen: 144Hz detected via 144 RAF callbacks per 1000ms window.',
    };
  }

  // 3. Conversion Table
  let conversionTableData: any = {
    title: `${tool.name} Quick Conversion Reference Matrix`,
    headers: ['Input Unit', 'Calculated Output'] as [string, string],
    rows: [
      { fromValue: '1 Unit', toValue: 'Standard Ratio' },
      { fromValue: '5 Units', toValue: '5× Ratio' },
      { fromValue: '10 Units', toValue: '10× Ratio' },
      { fromValue: '25 Units', toValue: '25× Ratio' },
      { fromValue: '50 Units', toValue: '50× Ratio' },
      { fromValue: '100 Units', toValue: '100× Ratio' },
    ],
  };

  if (isHardwareTool) {
    conversionTableData = {
      title: 'Hardware Diagnostic Test Capabilities & Browser API Reference',
      headers: ['Diagnostic Tool', 'Browser API Used', 'Key Metrics Measured'] as [string, string, string],
      rows: [
        { fromValue: 'Webcam Tester', toValue: 'MediaDevices.getUserMedia (video)', extraInfo: 'Resolution (720p/1080p/4K), FPS, device label, codec support' },
        { fromValue: 'Microphone Tester', toValue: 'MediaDevices.getUserMedia (audio)', extraInfo: 'Volume level (dB), noise floor, echo loopback, sample rate' },
        { fromValue: 'Speaker Tester', toValue: 'Web Audio API (AudioContext, OscillatorNode)', extraInfo: 'L/R stereo channels, frequency sweep (20Hz–20kHz), bass response' },
        { fromValue: 'Screen Display Tester', toValue: 'requestAnimationFrame, Fullscreen API', extraInfo: 'Refresh rate (Hz), dead/stuck pixels, contrast gradient banding' },
        { fromValue: 'Keyboard Tester', toValue: 'KeyboardEvent (keydown/keyup)', extraInfo: 'Key map verification, N-Key Rollover, ghosting, switch chatter' },
        { fromValue: 'Mouse Tester', toValue: 'MouseEvent, WheelEvent', extraInfo: 'Click buttons, scroll delta, polling rate, double-click fault' },
        { fromValue: 'Gamepad Tester', toValue: 'Gamepad API (navigator.getGamepads)', extraInfo: 'Stick drift %, trigger pressure, button map, rumble motors' },
        { fromValue: 'Call Readiness', toValue: 'MediaDevices + RTCPeerConnection', extraInfo: 'Camera/mic/speaker pass/fail, WebRTC latency, readiness score' },
      ],
      caption: 'All diagnostics execute 100% client-side in your browser using standard Web Platform APIs. Zero data is uploaded or recorded.',
    };
  } else if (tool.slug === 'yaml-to-json' || tool.slug === 'json-to-yaml' || tool.slug === 'toml-to-json' || tool.slug === 'yaml-to-toml') {
    conversionTableData = {
      title: 'Structured Data Types Mapping Matrix',
      headers: ['Data Type / Construct', 'JSON Representation', 'YAML / TOML Representation'] as [string, string, string],
      rows: [
        { fromValue: 'Key-Value Map', toValue: '{ "key": "value" }', extraInfo: 'key: value / key = "value"' },
        { fromValue: 'Array / List', toValue: '[1, 2, 3]', extraInfo: '- 1\\n- 2 / [1, 2, 3]' },
        { fromValue: 'Boolean', toValue: 'true / false', extraInfo: 'true / false' },
        { fromValue: 'Null / Nil', toValue: 'null', extraInfo: 'null / ~ (omitted in TOML)' },
        { fromValue: 'Multiline String', toValue: '"Line 1\\nLine 2"', extraInfo: '| (Literal) / """ (Multiline)' },
        { fromValue: 'Numbers / Floats', toValue: '42 / 3.14159', extraInfo: '42 / 3.14159' },
      ],
      caption: 'Standard type equivalencies across JSON, YAML, and TOML serialization formats.',
    };
  } else if (tool.slug === 'sql-to-json' || tool.slug === 'json-to-sql' || tool.slug === 'csv-to-sql') {
    conversionTableData = {
      title: 'SQL Dialect Quotes & Type Mapping Matrix',
      headers: ['Feature / Construct', 'PostgreSQL / SQLite', 'MySQL / MariaDB'] as [string, string, string],
      rows: [
        { fromValue: 'Identifier Quoting', toValue: '"table_name", "column"', extraInfo: '`table_name`, `column`' },
        { fromValue: 'String Escaping', toValue: '\'O\'\'Reilly\'', extraInfo: '\'O\'\'Reilly\' or \'O\\\'Reilly\'' },
        { fromValue: 'Boolean Values', toValue: 'TRUE / FALSE', extraInfo: 'TRUE / FALSE (TINYINT 1/0)' },
        { fromValue: 'JSON Objects', toValue: '\'{"a": 1}\'::jsonb', extraInfo: '\'{"a": 1}\'' },
        { fromValue: 'Null Handling', toValue: 'NULL', extraInfo: 'NULL' },
      ],
      caption: 'Dialect comparison matrix for ANSI SQL INSERT statements generated by ApexTools.',
    };
  } else if (tool.slug === 'css-unit-converter') {
    conversionTableData = {
      title: 'Standard CSS Typography & Spacing Conversion Matrix (16px Root Baseline)',
      headers: ['Pixel Size (PX)', 'Root REM (REM)', 'Tailwind CSS Equivalent'] as [string, string, string],
      rows: [
        { fromValue: '12 px', toValue: '0.7500 rem', extraInfo: 'text-xs / p-3' },
        { fromValue: '14 px', toValue: '0.8750 rem', extraInfo: 'text-sm / p-3.5' },
        { fromValue: '16 px', toValue: '1.0000 rem', extraInfo: 'text-base / p-4' },
        { fromValue: '18 px', toValue: '1.1250 rem', extraInfo: 'text-lg / p-4.5' },
        { fromValue: '20 px', toValue: '1.2500 rem', extraInfo: 'text-xl / p-5' },
        { fromValue: '24 px', toValue: '1.5000 rem', extraInfo: 'text-2xl / p-6' },
        { fromValue: '30 px', toValue: '1.8750 rem', extraInfo: 'text-3xl / p-7.5' },
        { fromValue: '36 px', toValue: '2.2500 rem', extraInfo: 'text-4xl / p-9' },
        { fromValue: '48 px', toValue: '3.0000 rem', extraInfo: 'text-5xl / p-12' },
        { fromValue: '64 px', toValue: '4.0000 rem', extraInfo: 'text-6xl / p-16' },
      ],
      caption: 'Computed typographic scale matrix across Pixels, REMs, and Tailwind CSS design tokens.',
    };
  } else if (tool.slug === 'qr-code-generator') {
    conversionTableData = {
      title: 'QR Code Error Correction Levels & Data Density Reference Table',
      headers: ['ECC Level', 'Restoration Capacity', 'Recommended Use Case'] as [string, string, string],
      rows: [
        { fromValue: 'Level L (Low)', toValue: '~7% of data codewords', extraInfo: 'Clean digital screens & short URLs' },
        { fromValue: 'Level M (Medium)', toValue: '~15% of data codewords', extraInfo: 'General purpose marketing, business cards' },
        { fromValue: 'Level Q (Quartile)', toValue: '~25% of data codewords', extraInfo: 'Outdoor signage, industrial environments' },
        { fromValue: 'Level H (High)', toValue: '~30% of data codewords', extraInfo: 'Branded QR codes with centered company logos' },
      ],
      caption: 'Standard Reed-Solomon Error Correction Code (ECC) recovery thresholds for QR matrix symbols.',
    };
  } else if (tool.slug === 'cron-expression-decoder') {
    conversionTableData = {
      title: 'Common Crontab Schedules & Syntax Reference Matrix',
      headers: ['Schedule / Intent', 'Standard Cron Expression', 'Execution Frequency'] as [string, string, string],
      rows: [
        { fromValue: 'Every Minute', toValue: '* * * * *', extraInfo: '60 times per hour continuously' },
        { fromValue: 'Every 5 Minutes', toValue: '*/5 * * * *', extraInfo: '12 times per hour (queue polling)' },
        { fromValue: 'Every Hour', toValue: '0 * * * *', extraInfo: 'At minute 0 of every hour' },
        { fromValue: 'Daily at Midnight', toValue: '0 0 * * *', extraInfo: '00:00 UTC / PKT once every day' },
        { fromValue: 'Weekdays at 9 AM', toValue: '0 9 * * 1-5', extraInfo: 'Monday through Friday at 09:00' },
        { fromValue: 'Weekly on Sunday', toValue: '0 0 * * 0', extraInfo: 'Sunday at 00:00 midnight' },
        { fromValue: '1st of Every Month', toValue: '0 0 1 * *', extraInfo: 'Monthly billing cycle at midnight' },
      ],
      caption: 'Comparative schedule matrix for standard Unix 5-field cron expressions.',
    };
  } else if (tool.slug === 'lakh-crore-to-million-billion') {
    conversionTableData = {
      title: 'South Asian vs Western Numeral Scaling Reference Table',
      headers: ['South Asian Scale', 'Numerical Digits', 'Western Equivalent'] as [string, string, string],
      rows: [
        { fromValue: '1 Lakh (ایک لاکھ)', toValue: '1,00,000', extraInfo: '100 Thousand (0.1M)' },
        { fromValue: '10 Lakhs (دس لاکھ)', toValue: '10,00,000', extraInfo: '1 Million (1M)' },
        { fromValue: '50 Lakhs (پچاس لاکھ)', toValue: '50,00,000', extraInfo: '5 Million (5M)' },
        { fromValue: '1 Crore (ایک کروڑ)', toValue: '1,00,00,000', extraInfo: '10 Million (10M)' },
        { fromValue: '10 Crores (دس کروڑ)', toValue: '10,00,00,000', extraInfo: '100 Million (100M)' },
        { fromValue: '1 Arab (ایک ارب)', toValue: '1,00,00,00,000', extraInfo: '1 Billion (1B)' },
        { fromValue: '10 Arabs (دس ارب)', toValue: '10,00,00,00,000', extraInfo: '10 Billion (10B)' },
        { fromValue: '1 Kharab (ایک کھرب)', toValue: '1,00,00,00,00,000', extraInfo: '100 Billion (100B)' },
      ],
      caption: 'Standard denomination mapping between Pakistani South Asian and International Western numbering systems.',
    };
  } else if (tool.slug === 'murabba-bigha-to-acre') {
    conversionTableData = {
      title: 'Agricultural & Farmland Units Reference Matrix',
      headers: ['Unit Name (اردو)', 'Area in Kanals / Acres', 'Square Feet (Patwari 272.25)'] as [string, string, string],
      rows: [
        { fromValue: '1 Murabba (مربع)', toValue: '25 Acres (200 Kanals)', extraInfo: '1,089,000 sq ft' },
        { fromValue: '1 Acre / Qilla (ایکڑ / قلعہ)', toValue: '8 Kanals (160 Marlas)', extraInfo: '43,560 sq ft' },
        { fromValue: '1 Bigha Punjab (بیگھہ)', toValue: '4 Kanals (80 Marlas)', extraInfo: '21,780 sq ft' },
        { fromValue: '1 Bigha Sindh (بیگھہ)', toValue: '2 Kanals (40 Marlas)', extraInfo: '10,890 sq ft' },
        { fromValue: '1 Kanal (کنال)', toValue: '20 Marlas', extraInfo: '5,445 sq ft' },
        { fromValue: '1 Marla (مرلہ)', toValue: '9 Sarsahi (1/20 Kanal)', extraInfo: '272.25 sq ft' },
        { fromValue: '1 Sarsahi (سرسائی)', toValue: '1 Sq Karam (1/9 Marla)', extraInfo: '30.25 sq ft' },
      ],
      caption: 'Official Board of Revenue conversion factors for rural agricultural holdings across Punjab and Sindh.',
    };
  } else if (isPakistanRealEstate) {
    conversionTableData = {
      title: 'Marla to Square Feet Quick Reference Matrix',
      headers: ['Marla (Units)', 'Urban / DHA (225 sq ft)', 'Patwari Legal (272.25 sq ft)'] as [string, string, string],
      rows: [
        { fromValue: '1 Marla', toValue: '225 sq ft (25 sq yd)', extraInfo: '272.25 sq ft (30.25 sq yd)' },
        { fromValue: '2 Marla', toValue: '450 sq ft (50 sq yd)', extraInfo: '544.50 sq ft (60.50 sq yd)' },
        { fromValue: '3 Marla', toValue: '675 sq ft (75 sq yd)', extraInfo: '816.75 sq ft (90.75 sq yd)' },
        { fromValue: '5 Marla', toValue: '1,125 sq ft (125 sq yd)', extraInfo: '1,361.25 sq ft (151.25 sq yd)' },
        { fromValue: '7 Marla', toValue: '1,575 sq ft (175 sq yd)', extraInfo: '1,905.75 sq ft (211.75 sq yd)' },
        { fromValue: '10 Marla', toValue: '2,250 sq ft (250 sq yd)', extraInfo: '2,722.50 sq ft (302.50 sq yd)' },
        { fromValue: '20 Marla (1 Kanal)', toValue: '4,500 sq ft (500 sq yd)', extraInfo: '5,445.00 sq ft (605.00 sq yd)' },
        { fromValue: '40 Marla (2 Kanal)', toValue: '9,000 sq ft (1,000 sq yd)', extraInfo: '10,890.00 sq ft (1,210.00 sq yd)' },
        { fromValue: '160 Marla (1 Acre / Qilla)', toValue: '36,000 sq ft (4,000 sq yd)', extraInfo: '43,560.00 sq ft (4,840.00 sq yd)' },
      ],
      caption: 'Comparative conversion table across major Pakistan housing authorities and government revenue records.',
    };
  } else if (isPakistanGold) {
    conversionTableData = {
      title: 'Tola to Grams, Masha & Ratti Reference Matrix',
      headers: ['Tola (تولہ)', 'Metric Grams (g)', 'Masha (ماشہ)'] as [string, string, string],
      rows: [
        { fromValue: '0.5 Tola (آدھا تولہ)', toValue: '5.8319 g', extraInfo: '6 Masha (48 Ratti)' },
        { fromValue: '1.0 Tola (ایک تولہ)', toValue: '11.6638 g', extraInfo: '12 Masha (96 Ratti)' },
        { fromValue: '1.5 Tola (ڈیڑھ تولہ)', toValue: '17.4957 g', extraInfo: '18 Masha (144 Ratti)' },
        { fromValue: '2.0 Tola (دو تولہ)', toValue: '23.3276 g', extraInfo: '24 Masha (192 Ratti)' },
        { fromValue: '2.5 Tola (ڈھائی تولہ)', toValue: '29.1595 g', extraInfo: '30 Masha (240 Ratti)' },
        { fromValue: '5.0 Tola (پانچ تولہ)', toValue: '58.3190 g', extraInfo: '60 Masha (480 Ratti)' },
        { fromValue: '10.0 Tola (دس تولہ / بسکٹ)', toValue: '116.6380 g', extraInfo: '120 Masha (960 Ratti)' },
        { fromValue: '20.0 Tola (بیس تولہ)', toValue: '233.2761 g', extraInfo: '240 Masha (1920 Ratti)' },
      ],
      caption: 'Official Pakistan Sarafa Jewelers Association weight matrix benchmark.',
    };
  } else if (isPakistanMaund) {
    conversionTableData = {
      title: 'Maund to Kilograms & Metric Tons Reference Matrix',
      headers: ['Maunds (من)', 'Kilograms (40 kg std)', 'Metric Tons (MT)'] as [string, string, string],
      rows: [
        { fromValue: '1 Maund (ایک من)', toValue: '40 kg (40 Seers)', extraInfo: '0.040 MT (0.8 Bags)' },
        { fromValue: '2 Maunds (دو من)', toValue: '80 kg (80 Seers)', extraInfo: '0.080 MT (1.6 Bags)' },
        { fromValue: '5 Maunds (پانچ من)', toValue: '200 kg (200 Seers)', extraInfo: '0.200 MT (4.0 Bags)' },
        { fromValue: '10 Maunds (دس من)', toValue: '400 kg (400 Seers)', extraInfo: '0.400 MT (8.0 Bags)' },
        { fromValue: '20 Maunds (بیس من)', toValue: '800 kg (800 Seers)', extraInfo: '0.800 MT (16.0 Bags)' },
        { fromValue: '25 Maunds (ایک ٹن)', toValue: '1,000 kg (1000 Seers)', extraInfo: '1.000 MT (20.0 Bags)' },
        { fromValue: '50 Maunds (دو ٹن)', toValue: '2,000 kg (2000 Seers)', extraInfo: '2.000 MT (40.0 Bags)' },
        { fromValue: '100 Maunds (سو من)', toValue: '4,000 kg (4000 Seers)', extraInfo: '4.000 MT (80.0 Bags)' },
      ],
      caption: 'Ghalla Mandi benchmark conversion table for agricultural produce.',
    };
  } else if (isCurrency) {
    // Benchmark conversion matrix for search crawler exact-match queries
    const estRate = fromCurr === 'USD' ? 278.50 : fromCurr === 'SAR' ? 74.25 : fromCurr === 'AED' ? 75.80 : fromCurr === 'GBP' ? 360.50 : fromCurr === 'EUR' ? 305.20 : fromCurr === 'CAD' ? 205.50 : fromCurr === 'AUD' ? 185.20 : fromCurr === 'KWD' ? 908.00 : fromCurr === 'QAR' ? 76.50 : fromCurr === 'OMR' ? 723.50 : 278.50;
    conversionTableData = {
      title: `${fromCurr} to ${toCurr} Conversion Reference Table ($1 to $10,000)`,
      headers: [`Amount (${fromCurr})`, `Estimated Payout (${toCurr})`, 'Denomination Type'] as [string, string, string],
      rows: [
        { fromValue: `1 ${fromCurr}`, toValue: `${(1 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Single Unit' },
        { fromValue: `5 ${fromCurr}`, toValue: `${(5 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Small Cash' },
        { fromValue: `10 ${fromCurr}`, toValue: `${(10 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Pocket Money' },
        { fromValue: `20 ${fromCurr}`, toValue: `${(20 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Daily Expense' },
        { fromValue: `50 ${fromCurr}`, toValue: `${(50 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Standard Note' },
        { fromValue: `100 ${fromCurr}`, toValue: `${(100 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Remittance Tier 1 (Free Fee)' },
        { fromValue: `250 ${fromCurr}`, toValue: `${(250 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Freelance Payout' },
        { fromValue: `500 ${fromCurr}`, toValue: `${(500 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Monthly Support' },
        { fromValue: `1,000 ${fromCurr}`, toValue: `${(1000 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Family Remittance' },
        { fromValue: `5,000 ${fromCurr}`, toValue: `${(5000 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Commercial Wire' },
        { fromValue: `10,000 ${fromCurr}`, toValue: `${(10000 * estRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCurr}`, extraInfo: 'Major Bank Transfer' },
      ],
      caption: `Real-time mid-market benchmark conversion matrix for ${fromCurr} to ${toCurr}.`,
    };
  } else if (tool.categorySlug === 'image') {
    conversionTableData = {
      title: 'Image Formats Comparison Reference Matrix',
      headers: ['Image Format', 'Transparency & Alpha', 'Typical Size vs JPG'] as [string, string, string],
      rows: [
        { fromValue: 'WebP (.webp)', toValue: 'Full Alpha Support (24/32-bit)', extraInfo: '25%–35% Smaller' },
        { fromValue: 'HEIC (.heic)', toValue: 'Alpha & Depth Map Support', extraInfo: '50% Smaller' },
        { fromValue: 'AVIF (.avif)', toValue: 'Alpha & 12-bit HDR', extraInfo: '50% Smaller' },
        { fromValue: 'JPG / JPEG (.jpg)', toValue: 'No Transparency (Opaque)', extraInfo: 'Baseline (0%)' },
        { fromValue: 'PNG (.png)', toValue: 'Lossless True Alpha Channel', extraInfo: '200%–400% Larger' },
        { fromValue: 'GIF (.gif)', toValue: '1-Bit Binary Transparency', extraInfo: 'Indexed 256 Colors' },
        { fromValue: 'SVG (.svg)', toValue: 'Vector Alpha Transparency', extraInfo: 'Infinite Resolution' },
        { fromValue: 'ICO (.ico)', toValue: '32-bit Alpha Multi-Res Favicon', extraInfo: '16px to 256px' },
      ],
      caption: 'Comparative technical matrix across modern raster and vector image formats.',
    };
  } else if (tool.categorySlug === 'document') {
    if (tool.slug === 'compress-pdf') {
      conversionTableData = {
        title: 'PDF Compression Benchmark Reference Table',
        headers: ['Compression Level', 'Estimated Size Reduction', 'Text Clarity & DPI Benchmark'] as [string, string, string],
        rows: [
          { fromValue: 'Extreme Compression', toValue: 'Up to 80% Reduction', extraInfo: 'Clear (72 DPI) • Email attachments, Discord uploads' },
          { fromValue: 'Recommended Compression', toValue: '50–65% Reduction', extraInfo: 'Sharp (150 DPI) • Web sharing, job applications' },
          { fromValue: 'Less Compression', toValue: '20–30% Reduction', extraInfo: 'High Definition (300 DPI) • High quality printing, archival' },
        ],
        caption: 'Performance benchmark data across standard multi-page PDF documents.',
      };
    } else {
      conversionTableData = {
        title: 'Document & PDF Interoperability Reference Matrix',
        headers: ['Document Format', 'Editable Layout & Text', 'Compatibility & Standard'] as [string, string, string],
        rows: [
          { fromValue: 'PDF (.pdf)', toValue: 'Fixed Layout / Vector Text', extraInfo: '100% Universal (ISO 32000)' },
          { fromValue: 'Word (.docx)', toValue: 'Fully Editable OpenXML Text & Tables', extraInfo: 'Microsoft Word, Google Docs' },
          { fromValue: 'Excel (.xlsx)', toValue: 'Multi-Sheet Tables & Formula Cells', extraInfo: 'Microsoft Excel, Google Sheets' },
          { fromValue: 'PowerPoint (.pptx)', toValue: 'Editable Slides & Presentation Shapes', extraInfo: 'Microsoft PowerPoint, Keynote' },
          { fromValue: 'Images (.jpg / .png)', toValue: 'High-Res Raster Bitmaps (150/300 DPI)', extraInfo: 'Universal Image Viewers' },
        ],
        caption: 'Cross-platform document structure and editing compatibility.',
      };
    }
  } else if (tool.categorySlug === 'archive') {
    conversionTableData = {
      title: 'Archive Format & Deflate Compression Reference Matrix',
      headers: ['Archive Format', 'Deflate Compression Algorithm', 'Native OS Compatibility'] as [string, string, string],
      rows: [
        { fromValue: 'ZIP (.zip)', toValue: 'DEFLATE / LZ77 + Huffman (Level 0–9)', extraInfo: 'Windows, macOS, Linux, iOS, Android' },
        { fromValue: '7Z (.7z)', toValue: 'LZMA / LZMA2 High Compression Ratio', extraInfo: '7-Zip, PeaZip, The Unarchiver' },
        { fromValue: 'TAR (.tar / .tar.gz)', toValue: 'POSIX Tape Archive + Gzip Streams', extraInfo: 'Linux, Unix, Server Backups' },
        { fromValue: 'RAR (.rar)', toValue: 'Proprietary Multi-Volume Archive', extraInfo: 'WinRAR, UnRAR' },
      ],
      caption: 'Comparative archive compression formats and operating system support.',
    };
  } else if (tool.categorySlug === 'audio' || tool.slug === 'video-to-mp3' || tool.slug === 'mp4-to-mp3' || tool.slug === 'wav-to-mp3' || tool.slug === 'm4a-to-mp3' || tool.slug === 'flac-to-mp3') {
    conversionTableData = {
      title: 'Audio Bitrate Quality & File Size Reference Table',
      headers: ['Audio Bitrate', 'Audio Quality Level', 'File Size per Minute'] as [string, string, string],
      rows: [
        { fromValue: '320 kbps', toValue: 'Studio / Audiophile Quality', extraInfo: '~2.4 MB / min • Music production, archiving, premium listening' },
        { fromValue: '256 kbps', toValue: 'High Definition (HD)', extraInfo: '~1.9 MB / min • High-quality streaming, podcast publishing' },
        { fromValue: '192 kbps', toValue: 'Standard (Recommended)', extraInfo: '~1.4 MB / min • General music playback, mobile devices' },
        { fromValue: '128 kbps', toValue: 'Voice / Compact', extraInfo: '~0.9 MB / min • Audiobooks, lectures, voice memos' },
      ],
      caption: 'Official audio encoding bitrate benchmarks and bandwidth estimation metrics.',
    };
  } else if (tool.slug.includes('compress-video')) {
    conversionTableData = {
      title: 'Messaging & Platform Video Upload Limits Reference Table',
      headers: ['Platform / Service', 'Maximum File Allowance', 'Optimized ApexTools Preset'] as [string, string, string],
      rows: [
        { fromValue: 'Discord (Free Account)', toValue: '8.00 MB File Limit', extraInfo: 'Discord 8MB Preset (Two-pass variable bitrate)' },
        { fromValue: 'WhatsApp Direct Attachment', toValue: '16.00 MB File Limit', extraInfo: 'WhatsApp 16MB FastStart (AAC stereo)' },
        { fromValue: 'Discord Nitro Basic / Email', toValue: '25.00 MB File Limit', extraInfo: '25MB High-Definition Preset' },
        { fromValue: 'Discord Nitro Pro', toValue: '500.00 MB File Limit', extraInfo: 'Full 1080p CRF 22 Preset' },
      ],
      caption: 'Benchmarked upload size limits across major communication platforms.',
    };
  } else if (tool.slug === 'gif-to-mp4' || tool.slug === 'gif-to-webm') {
    conversionTableData = {
      title: 'GIF to MP4 File Size & Bandwidth Savings Benchmark Table',
      headers: ['Original GIF Size', 'Converted MP4 Size (CRF 23)', 'Bandwidth Saved'] as [string, string, string],
      rows: [
        { fromValue: '5.0 MB GIF', toValue: '340 KB MP4', extraInfo: '-93.2% Bandwidth Reduction' },
        { fromValue: '12.0 MB GIF', toValue: '780 KB MP4', extraInfo: '-93.5% Bandwidth Reduction' },
        { fromValue: '25.0 MB GIF', toValue: '1.60 MB MP4', extraInfo: '-93.6% Bandwidth Reduction' },
        { fromValue: '50.0 MB GIF', toValue: '2.90 MB MP4', extraInfo: '-94.2% Bandwidth Reduction' },
        { fromValue: '80.0 MB GIF', toValue: '4.40 MB MP4', extraInfo: '-94.5% Bandwidth Reduction' },
      ],
      caption: 'Benchmarked file size reduction comparing uncompressed 256-color GIF bitmaps to H.264 inter-frame compression.',
    };
  } else if (tool.slug === 'video-aspect-ratio-resizer') {
    conversionTableData = {
      title: 'Social Media Aspect Ratios & Canvas Dimensions Reference Matrix',
      headers: ['Target Social Platform', 'Aspect Ratio Preset', 'Pixel Dimensions & Best Backdrop'] as [string, string, string],
      rows: [
        { fromValue: 'TikTok / Instagram Reels / YouTube Shorts', toValue: '9:16 Vertical', extraInfo: '1080 × 1920 px • Blurred Mirror Backdrop' },
        { fromValue: 'YouTube Main / Desktop / TV', toValue: '16:9 Landscape', extraInfo: '1920 × 1080 px • Native Fullscreen' },
        { fromValue: 'Instagram Feed / Facebook Square', toValue: '1:1 Square', extraInfo: '1080 × 1080 px • Blurred / White Border' },
        { fromValue: 'Instagram Portrait Feed Post', toValue: '4:5 Portrait', extraInfo: '1080 × 1350 px • Blurred Mirror Backdrop' },
      ],
      caption: 'Standard social network canvas resolutions and recommended background styling.',
    };
  } else if (tool.categorySlug === 'video' || tool.categorySlug === 'media') {
    conversionTableData = {
      title: 'Video Codec & Container Compatibility Reference Matrix',
      headers: ['Video / Audio Codec', 'Supported Containers', 'Browser & Hardware Support'] as [string, string, string],
      rows: [
        { fromValue: 'H.264 (AVC) + AAC', toValue: 'MP4, MOV, MKV', extraInfo: '100% All Modern Browsers, iPhone, Android, Smart TVs' },
        { fromValue: 'VP9 / AV1 + Opus', toValue: 'WebM, MP4', extraInfo: 'Chrome, Edge, Firefox, Android, YouTube (30% higher compression)' },
        { fromValue: 'Animated GIF', toValue: 'GIF', extraInfo: 'Universal animated image playback across all apps' },
        { fromValue: 'H.265 (HEVC)', toValue: 'MP4, MOV, MKV', extraInfo: 'Apple iOS/macOS, 4K Smart TVs, Windows 11' },
        { fromValue: 'MPEG-4 + MP3', toValue: 'AVI, MP4', extraInfo: 'Legacy Windows PC players and automotive screens' },
      ],
      caption: 'Cross-platform video decoding capabilities and container standards.',
    };
  } else if (tool.categorySlug === 'image') {
    if (tool.slug.includes('avif') || tool.slug.includes('webp')) {
      conversionTableData = {
        title: 'Next-Gen Image Formats Compression & Feature Benchmark Table',
        headers: ['Format', 'Average File Size vs JPG', 'Key Advantage / Feature'] as [string, string, string],
        rows: [
          { fromValue: 'AVIF (.avif)', toValue: '50% to 70% Smaller', extraInfo: 'AV1 Intra-frame, 10/12-bit HDR, wide color gamut' },
          { fromValue: 'WebP (.webp)', toValue: '25% to 35% Smaller', extraInfo: 'Universal web browser support, alpha channel' },
          { fromValue: 'PNG (.png)', toValue: 'Baseline Lossless', extraInfo: 'Lossless graphics, sharp UI edges, full alpha' },
          { fromValue: 'JPEG (.jpg)', toValue: 'Baseline Lossy', extraInfo: 'Universal photo compatibility across all legacy platforms' },
          { fromValue: 'ICO (.ico)', toValue: 'Multi-Pack Container', extraInfo: '16x16, 32x32, 48x48, 64x64 favicon layers' },
        ],
        caption: 'Compression efficiency benchmarks based on W3C and modern browser rendering engines.',
      };
    } else if (tool.slug.includes('ico') || tool.slug.includes('svg')) {
      conversionTableData = {
        title: 'Favicon & Vector Icon Standard Resolutions Table',
        headers: ['Resolution (Pixels)', 'Intended Platform / Target', 'File Type'] as [string, string, string],
        rows: [
          { fromValue: '16 × 16 px', toValue: 'Browser Tab Icon & Desktop Shortcuts', extraInfo: 'Embedded .ico layer / small favicon' },
          { fromValue: '32 × 32 px', toValue: 'Retina / High-DPI Browser Tab Icon', extraInfo: 'Embedded .ico layer / standard favicon' },
          { fromValue: '48 × 48 px', toValue: 'Windows Taskbar & Start Menu Icon', extraInfo: 'Embedded .ico layer / desktop app' },
          { fromValue: '64 × 64 px', toValue: 'High-Resolution OS Icon & Bookmark', extraInfo: 'Embedded .ico layer / bookmark manager' },
          { fromValue: '512 × 512 px', toValue: 'PWA Web App Manifest & Android Splash', extraInfo: 'Rasterized PNG from SVG' },
          { fromValue: '1024 × 1024 px', toValue: 'iOS App Store & Retina Vector Asset', extraInfo: 'Ultra-HD PNG from SVG' },
        ],
        caption: 'Standard web and application favicon resolution dimensions matrix.',
      };
    }
  }

  // 4. Long-Tail SEO FAQs
  let faqs = [
    {
      question: `Is ${tool.name} completely free to use?`,
      answer: `Yes, ${tool.name} on ApexTools is 100% free with no registration or credit card required. You get unlimited calculations directly inside your browser.`,
    },
    {
      question: 'Are my calculations private and secure?',
      answer: 'Absolutely. All mathematical operations occur 100% client-side inside your browser. No personal measurements or numerical inputs are transmitted or stored.',
    },
    {
      question: 'Can I use this tool on my mobile phone?',
      answer: 'Yes, ApexTools is mobile-first and optimized for seamless use on smartphones, tablets, and desktop browsers without installing any external apps.',
    },
  ];

  if (isPakistanRealEstate) {
    faqs = [
      {
        question: 'How many square feet are in 1 Marla in Lahore (LDA / DHA / Bahria)?',
        answer: 'In modern urban housing societies in Lahore, Islamabad, and Rawalpindi (including DHA, Bahria Town, LDA, Lake City, and Gulberg Greens), 1 Marla is standardized to 225 square feet (25 square yards). Under this standard, 1 Kanal equals 20 Marla (4,500 sq ft), and a standard 5 Marla plot is 1,125 sq ft (usually 25 ft × 45 ft).',
      },
      {
        question: 'What is the difference between Revenue 272.25 sq ft Marla and Urban 225 sq ft Marla?',
        answer: 'The Revenue/Patwari standard (272.25 sq ft per Marla) is the official legal standard maintained by the Board of Revenue in Punjab, Sindh, KPK, and Balochistan. It is based on 9 Sarsahi (where 1 Karam = 5.5 ft). Urban housing societies reduced the standard to 225 sq ft (15 ft × 15 ft) for easier grid planning. ApexTools lets you toggle between both standards instantly.',
      },
      {
        question: 'How many Marlas and Kanals are in 1 Acre (Qilla / Killa) in Pakistan?',
        answer: 'In Pakistan, 1 Acre (commonly called Qilla or Killa) equals 8 Kanals or 160 Marlas. Under the 272.25 sq ft standard, 1 Acre equals 43,560 square feet (4,840 square yards). Under the 225 sq ft society standard, 1 Acre equals 36,000 square feet. 1 Murabba equals 25 Acres or 200 Kanals.',
      },
      {
        question: 'What is a Sarsahi and Karam in Pakistani property measurement?',
        answer: 'A Karam is a traditional linear unit used by Patwaris equal to 5.5 feet (66 inches). A Sarsahi is the area of 1 square Karam (5.5 ft × 5.5 ft = 30.25 sq ft). 9 Sarsahi equal 1 Marla in legal land revenue records.',
      },
      {
        question: 'How does the interactive Land Plot Dimension Visualizer work?',
        answer: 'Enter the front width and length of your plot in feet (e.g. 30 ft × 50 ft). The visualizer automatically calculates the total area in square feet (1,500 sq ft), computes the exact Marla yield (6.67 Marla under 225 standard or 5.51 Marla under 272.25 standard), and displays an interactive diagram.',
      },
    ];
  } else if (isPakistanGold) {
    faqs = [
      {
        question: 'How many grams are in 1 Tola of gold in Pakistan?',
        answer: 'In Pakistan and all South Asian Sarafa jewelry markets, 1 Tola is standardized to exactly 11.6638 grams (11.6638038 grams for high-precision bullion calculations). 1 Troy Ounce equals 31.1035 grams (2.6667 Tolas), and a 10 Gram bar equals 0.85735 Tola.',
      },
      {
        question: 'How many Masha and Ratti make 1 Tola?',
        answer: '1 Tola equals 12 Masha or 96 Ratti. 1 Masha equals 8 Ratti (0.972 grams), and 1 Ratti equals 0.1215 grams. These traditional units are widely used by goldsmiths when manufacturing intricate jewelry and weighing gemstones.',
      },
      {
        question: 'What is the difference between 24K, 22K, 21K, and 18K gold in Sarafa bazaar?',
        answer: '24 Karat is 99.9% pure raw bullion (standard benchmark rate). 22 Karat (91.6% pure / 916 hallmark) is the standard alloy used for traditional Pakistani jewelry. 21 Karat (87.5% pure / 875) is widely imported from Dubai/Saudi Arabia. 18 Karat (75.0% pure / 750) is used for diamond settings and Italian designer jewelry.',
      },
      {
        question: 'How are Making Charges (Jarrat / Mazdoori) calculated in Pakistan?',
        answer: 'Making charges (Jarrat) are craftsmanship fees charged by the jeweler for casting, designing, and polishing the ornament. They are added as a flat fee per tola or per gram onto the raw gold weight price.',
      },
    ];
  } else if (isPakistanMaund) {
    faqs = [
      {
        question: 'How many kilograms are in 1 Maund (Mann) in Pakistani Mandi?',
        answer: 'In wholesale grain, cotton, oilseed, and sugar markets (Ghalla Mandi) across Pakistan, 1 Maund (Mann) is standardized to exactly 40.0 Kilograms (1 Maund = 40 kg).',
      },
      {
        question: 'How many Seers and Chhataks are in 1 Maund?',
        answer: '1 Maund contains 40 Seers (Ser). 1 Seer contains 16 Chhataks. In modern Pakistani metric trading, 1 Seer equals exactly 1.0 Kilogram, and 1 Chhatak equals 62.5 grams (or 58.32 grams under historical tola weights).',
      },
      {
        question: 'How many Maunds are in 1 Metric Ton?',
        answer: '1 Metric Ton (1,000 Kilograms) equals exactly 25 Maunds under the 40 kg Mandi standard.',
      },
      {
        question: 'What is the standard weight of a commercial crop bag (Bori)?',
        answer: 'Standard commercial bags for wheat, rice, and fertilizer in Pakistan are packed in 50 kg bags (equivalent to 1.25 Maunds) or 100 kg jute bags (2.5 Maunds).',
      },
    ];
  } else if (isPakistanHijri) {
    faqs = [
      {
        question: 'How does the Ruet-e-Hilal moon sighting adjustment work?',
        answer: 'While the astronomical Umm al-Qura calendar provides mathematical moon phases, local Islamic dates in Pakistan depend on physical crescent moon sightings declared by the Central Ruet-e-Hilal Committee. ApexTools provides an interactive offset toggle (-2, -1, 0, +1, +2 days) to synchronize with official Pakistan declarations.',
      },
      {
        question: 'What are the 12 Islamic months in chronological order?',
        answer: '1. Muharram, 2. Safar, 3. Rabi al-Awwal, 4. Rabi al-Thani, 5. Jumada al-Awwal, 6. Jumada al-Thani, 7. Rajab, 8. Shaban, 9. Ramadan, 10. Shawwal, 11. Dhu al-Qidah, 12. Dhu al-Hijjah.',
      },
    ];
  } else if (isCurrency) {
    faqs = [
      {
        question: `What is the difference between State Bank of Pakistan (SBP) Interbank and Open Market Forex rates?`,
        answer: 'The Interbank rate is the official benchmark wholesale rate traded between licensed commercial banks. The Open Market rate is quoted by Exchange Companies (Forex Association of Pakistan - FAP) for physical cash purchase and selling. ApexTools provides hourly synchronized live mid-market rates.',
      },
      {
        question: `How can overseas Pakistanis send remittances to Pakistan with zero transfer fees?`,
        answer: 'Under the State Bank of Pakistan (SBP) Pakistan Remittance Initiative (PRI), remittances of $100 or more sent through legal banking channels (Direct Bank Wire, Roshan Digital Account, Western Union/Remitly direct to bank account) are completely free of transfer charges.',
      },
      {
        question: 'When do foreign exchange rates update daily on ApexTools?',
        answer: 'ApexTools synchronizes exchange rates continuously on an hourly schedule using a multi-tiered caching architecture (Upstash Redis <10ms -> Supabase Cloud DB -> Central Bank feed), providing sub-10ms response times with zero rate-limit interruptions.',
      },
      {
        question: 'Are foreign currency remittances sent to Pakistan subject to income tax or withholding tax?',
        answer: 'No. Remittances received into personal Pakistani bank accounts or Roshan Digital Accounts (RDA) from overseas family members are 100% tax-free under Section 111(4) of the Income Tax Ordinance. Foreign IT export income is eligible for a reduced 0.25% final tax status with PSEB registration.',
      },
      {
        question: `Can I convert other foreign currencies like SAR, AED, GBP, and EUR to PKR?`,
        answer: `Yes! ApexTools provides dedicated calculators and real-time comparison tables for all major remittance pairs including Saudi Riyal (SAR), UAE Dirham (AED), British Pound (GBP), Euro (EUR), Canadian Dollar (CAD), Australian Dollar (AUD), Qatari Riyal (QAR), and Kuwaiti Dinar (KWD).`,
      },
    ];
  } else if (tool.categorySlug === 'image') {
    faqs = [
      {
        question: `How do I convert ${tool.name} without losing image quality?`,
        answer: 'ApexTools leverages high-performance Sharp and MozJPEG rendering pipelines. Our default 85% balanced quality setting maintains high visual fidelity and sharpness while eliminating unnecessary byte overhead.',
      },
      {
        question: 'Are my uploaded images kept private and secure?',
        answer: 'Yes! All uploaded and converted files are stored in temporary isolated storage and permanently auto-deleted after 2 hours. We never inspect, sell, or store your private images.',
      },
      {
        question: 'Can I convert iPhone HEIC photos to JPG or PNG?',
        answer: 'Yes! Our server-side decoding engine supports Apple HEIC/HEIF photos from iPhone cameras, auto-rotates EXIF orientation, and renders standard universal JPG or PNG files.',
      },
      {
        question: 'What is the advantage of converting PNG or JPG to WebP?',
        answer: 'Google WebP offers 25% to 35% smaller file sizes than JPG at equivalent visual quality while supporting transparent alpha channels. Converting your website images to WebP improves Google Core Web Vitals and SEO rankings.',
      },
      {
        question: 'Is there a limit on how many images I can convert?',
        answer: 'ApexTools is 100% free with unlimited single and batch conversions for files up to 25 MB with no registration or credit card required.',
      },
    ];
  } else if (tool.categorySlug === 'document') {
    faqs = [
      {
        question: 'How do I convert PDF to editable Word document without losing formatting?',
        answer: 'ApexTools extracts paragraphs, headings, font styles, and table structures directly from your PDF and generates a standard Microsoft Word DOCX file with exact formatting preserved.',
      },
      {
        question: 'Is it safe to upload confidential legal documents to ApexTools?',
        answer: 'Yes, 100%. All uploads are encrypted with end-to-end 256-bit SSL encryption. We enforce zero data logging and permanently auto-purge all files from our servers after 2 hours.',
      },
      {
        question: 'How many PDF files can I merge together for free?',
        answer: 'You can merge unlimited PDF files up to a combined size of 50 MB completely free without registering or providing an email address.',
      },
      {
        question: 'How does PDF compression reduce file size without losing text sharpness?',
        answer: 'Our compression engine removes orphaned font descriptors, deduplicates internal object streams, and re-encodes embedded raster images at optimized DPI (72 or 150 DPI) while keeping vector text 100% crisp.',
      },
      {
        question: 'Can I unlock a password-protected PDF file?',
        answer: 'Yes. If you know the password, ApexTools decrypts the document and provides an unlocked copy with all printing and editing restrictions permanently removed.',
      },
    ];
  } else if (tool.categorySlug === 'archive') {
    faqs = [
      {
        question: 'How do I create a ZIP file from multiple documents and photos?',
        answer: 'Simply drag and drop all your files into the upload area, optionally specify an archive name, and click "Create ZIP". ApexTools compresses the files in real time.',
      },
      {
        question: 'What compression level does ApexTools ZIP creator use?',
        answer: 'We utilize industry-standard Deflate LZ77 + Huffman compression (Level 0 to 9) to ensure maximum byte reduction and 100% compatibility across Windows, macOS, Linux, iOS, and Android.',
      },
      {
        question: 'Can I extract and preview ZIP files online without installing software?',
        answer: 'Yes! ApexTools allows you to inspect archive contents, verify file sizes, and decompress all contents directly in your browser.',
      },
    ];
  } else if (tool.categorySlug === 'audio' || tool.slug.includes('-to-mp3') || tool.slug.includes('audio-')) {
    faqs = [
      {
        question: 'How do I extract high-quality 320kbps MP3 audio from my video file?',
        answer: 'Upload your MP4, MOV, or WebM video file, select the 320 kbps (Studio / Audiophile) bitrate preset, and click "Start Conversion". Our FFmpeg audio pipeline strips the video frames, resamples stereo channels, and encodes a pristine MP3 file with zero distortion.',
      },
      {
        question: 'What is the best audio bitrate for voice memos and podcasts?',
        answer: 'For speech and voice recordings, 128 kbps or 192 kbps is ideal — it produces clear, natural voice articulation while keeping file sizes under 1.4 MB per minute. For music playback, we recommend 256 kbps or 320 kbps.',
      },
      {
        question: 'Can I convert Apple Voice Memos (M4A) to MP3?',
        answer: 'Yes! ApexTools seamlessly decodes Apple AAC/M4A audio recordings from iPhone and iPad and generates universal MP3 files playable on any device or software.',
      },
      {
        question: 'Are my uploaded audio and video files kept private and secure?',
        answer: 'Yes, 100%. All media processing runs in isolated temporary sandboxes with end-to-end encryption. Converted files are permanently auto-purged from our servers after 2 hours.',
      },
    ];
  } else if (tool.categorySlug === 'developer') {
    faqs = DEVELOPER_TOOL_FAQS[tool.slug] || [
      {
        question: `How does ${tool.name} work on ApexTools?`,
        answer: 'All developer data and security conversions execute 100% client-side directly within your browser’s V8 JavaScript engine. Your strings, code, JWT tokens, and configurations are never transmitted over the network or logged on any server.',
      },
      {
        question: 'Can I format, validate, and minify outputs with custom indentation?',
        answer: 'Yes. Our dual-pane code editor provides live syntax validation, customizable indentation (2 spaces, 4 spaces, tabs), alphabetical key sorting, and instant minification controls.',
      },
      {
        question: 'What is the maximum file or payload size I can convert?',
        answer: 'Because processing happens entirely in your local browser memory, you can convert multi-megabyte JSON, YAML, SQL, and CSV payloads with zero network latency or upload timeouts.',
      },
      {
        question: 'Can I use this tool offline without an internet connection?',
        answer: 'Yes! Once the webpage is loaded, all client-side conversion logic, parsers, and cryptographic hash functions work completely offline in airplane mode.',
      },
    ];
  } else if (isHardwareTool) {
    faqs = HARDWARE_TOOL_FAQS[tool.slug] || [
      {
        question: `How does the ${tool.name} work in a web browser?`,
        answer: `ApexTools uses standard Web Platform APIs (MediaDevices, Web Audio, Gamepad, KeyboardEvent, requestAnimationFrame) to run all diagnostics 100% client-side in your browser. No data is recorded, uploaded, or sent to any server.`,
      },
      {
        question: 'Do I need to install any software or browser extensions?',
        answer: 'No! All hardware diagnostic tests run natively in modern browsers (Chrome, Edge, Firefox, Safari) using built-in Web APIs. No downloads, plugins, or extensions are required.',
      },
      {
        question: 'Is my camera/microphone data private and secure?',
        answer: 'Absolutely. All video, audio, and sensor data stays entirely within your local browser memory. ApexTools never records, transmits, or stores any hardware diagnostic data on remote servers.',
      },
      {
        question: 'Can I embed this hardware test on my own website?',
        answer: 'Yes! Click the "Embed This Tool" button to get a ready-to-use iframe snippet. Perfect for IT helpdesks, HR interview platforms, and educational portals.',
      },
    ];
  } else if (tool.slug === 'fbr-salary-tax-calculator') {
    faqs = [
      {
        question: 'What are the FBR Income Tax Slabs for Tax Year 2024–2026 in Pakistan?',
        answer: 'Under the Finance Act, salaried individuals earning up to Rs. 600,000 annually (Rs. 50,000/month) are 100% tax exempt. Progressive slabs apply thereafter up to 35% plus a 10% super surcharge for high earners above Rs. 10 Million.',
      },
      {
        question: 'What is the difference in tax deductions for Filer vs Non-Filer?',
        answer: 'Active Taxpayers (Filers) on the FBR ATL list enjoy standard statutory tax rates and lower withholding tax on banking transactions, cash withdrawals, and vehicle/property registrations. Non-Filers face 100% to 200% higher punitive withholding rates.',
      },
      {
        question: 'Are employee allowances (Medical, Conveyance, House Rent) taxable?',
        answer: 'Medical allowance up to 10% of basic salary is generally exempt under Section 139. Conveyance and house rent allowances are fully integrated into taxable gross salary per current FBR rules.',
      },
    ];
  } else if (tool.slug === 'zakat-calculator') {
    faqs = [
      {
        question: 'What is the current Nisab threshold for Zakat in Pakistan (2024–2026)?',
        answer: 'The Nisab threshold is 7.5 Tolas (87.48 grams) for Gold or 52.5 Tolas (612.36 grams) for Silver. If you own cash, silver, gold, or business inventory exceeding the silver Nisab threshold for one lunar year (Hawl), 2.5% Zakat is obligatory on net zakatable assets.',
      },
      {
        question: 'How is Zakat calculated on personal jewelry and gold?',
        answer: 'Calculate the total weight of your 24K, 22K, 21K, and 18K gold in tolas or grams, multiply by today’s Sarafa market rate, subtract outstanding debts, and apply the 2.5% (1/40th) rate.',
      },
      {
        question: 'Are provident funds, prize bonds, and shares subject to Zakat?',
        answer: 'Yes. Prize bonds and tradable shares are zakatable at full face/market value. Voluntary provident funds and available withdrawable balances are zakatable upon maturity or withdrawal.',
      },
    ];
  } else if (tool.slug === 'lakh-crore-to-million-billion') {
    faqs = [
      {
        question: 'How many Lakhs or Crores are in 1 Million and 1 Billion?',
        answer: '1 Million is equal to exactly 10 Lakhs (1,000,000). 1 Billion is equal to 100 Crores or 1 Arab (1,000,000,000). 1 Trillion is equal to 10 Kharabs (1,000,000,000,000).',
      },
      {
        question: 'How does South Asian comma grouping (12,34,56,789) differ from Western grouping (123,456,789)?',
        answer: 'In the South Asian numbering system, after the first three digits from the right (thousands), grouping commas are placed every two digits (Lakhs, Crores, Arabs, Kharabs). In the Western system, commas are strictly placed every three digits (Thousands, Millions, Billions, Trillions).',
      },
      {
        question: 'How should amounts in words be written on banking cheques in Pakistan?',
        answer: 'In Pakistan banking and corporate accounting, cheque amounts should be written in full South Asian or Western words with the mandatory suffix "Rupees Only" in English or "روپے فقط" in Urdu script to prevent unauthorized additions.',
      },
    ];
  } else if (tool.slug === 'murabba-bigha-to-acre') {
    faqs = [
      {
        question: 'How many Kanals and Acres are in 1 Murabba in Punjab Pakistan?',
        answer: 'In Punjab and across Pakistan agricultural revenue records, 1 Murabba is equal to exactly 25 Acres (Qillas), which equals 200 Kanals or 4,000 Marlas (1,089,000 square feet in Patwari standard).',
      },
      {
        question: 'What is the difference between Bigha in Punjab vs Sindh?',
        answer: 'In Punjab revenue records, 1 Bigha is standardized as 4 Kanals (80 Marlas or 0.5 Acre). In Sindh agricultural practice, 1 Bigha equals 2 Kanals (40 Marlas or 0.25 Acre), while 1 Jareeb equals 0.5 Acre (4 Kanals).',
      },
      {
        question: 'How many Square Feet are in 1 Marla in Patwari revenue vs DHA urban housing?',
        answer: 'Official government revenue records (Patwari/Board of Revenue) measure 1 Marla as 272.25 square feet (30.25 sq yards, based on a 5.5-foot Karam). Modern private housing societies (DHA, Bahria Town, LDA) standardize 1 Marla at 225 square feet (25 sq yards).',
      },
    ];
  } else if (tool.slug === 'electricity-bill-solar-calculator') {
    faqs = [
      {
        question: 'How are units calculated from meter readings on LESCO, IESCO, and K-Electric bills?',
        answer: 'Electricity units (kWh) are calculated by subtracting your Previous Meter Reading from your Current Meter Reading on your DISCO bill. For three-phase Time-of-Use (ToU) meters, Peak and Off-Peak units are recorded separately on different registers (01 and 02) and billed at their respective NEPRA slab rates.',
      },
      {
        question: 'What is a Protected Consumer in Pakistan electricity tariffs?',
        answer: 'A residential consumer is designated as "Protected" if their electricity consumption has remained 200 units or less per month for the past 6 consecutive billing cycles. Protected consumers enjoy subsidized lifeline tariffs (Rs. 3.95 to Rs. 14.16/unit). Exceeding 200 units even once immediately moves you to the unprotected higher slabs (Rs. 16.48 to Rs. 42.72/unit).',
      },
      {
        question: 'How does solar net-metering credit calculation work on WAPDA bills?',
        answer: 'Bi-directional green meters export excess daytime solar electricity to the DISCO grid (LESCO, IESCO, MEPCO, KE). Billed units are calculated as Net Units = Imported kWh - Exported kWh. Any surplus units exported over consumption are credited at NEPRA buyback rates (~Rs. 24.50/unit) to offset future bills or generate financial credits.',
      },
      {
        question: 'What additional taxes and surcharges are included in WAPDA electricity bills?',
        answer: 'Pakistani electricity bills include Fuel Price Adjustment (FPA), Financing Cost (FC) Surcharge (Rs. 3.23/kWh), Electricity Duty (1.5%), General Sales Tax (18% GST), TV/Radio Fee (Rs. 35), and Advance Income Tax under Section 235 (7.5% for non-filers on bills over Rs. 25,000).',
      },
    ];
  } else if (tool.slug === 'gas-bill-calculator') {
    faqs = [
      {
        question: 'How is gas consumption converted from Meter Reading (HM³) to MMBTU on SNGPL and SSGC bills?',
        answer: 'Gas meters measure volume in Hundreds of Cubic Meters (HM³). Billing units in MMBTU (Million British Thermal Units) are calculated using the formula: MMBTU = (HM³ × 100 × 35.3147 × GCV) ÷ 1,000,000, where GCV (Gross Calorific Value) is typically 1,050 BTU/Scf for SNGPL and 1,020 BTU/Scf for SSGC.',
      },
      {
        question: 'What are the domestic Protected vs Non-Protected gas slabs for SNGPL & SSGC?',
        answer: 'Domestic consumers consuming up to 0.9 HM³ per month in winter (Nov–Feb) are classified as Protected with subsidized progressive rates (Rs. 200 to Rs. 400 per MMBTU and Rs. 40 meter rent). Non-Protected consumers pay standard rates (Rs. 500 to Rs. 3,500 per MMBTU) plus Rs. 500 fixed monthly meter rent.',
      },
      {
        question: 'Why did my gas bill jump significantly from summer to winter?',
        answer: 'In winter, running geysers and space heaters pushes monthly consumption above the 0.9 HM³ (or 1.5 MMBTU) protected threshold. This shifts the consumer into the non-protected category, causing the commodity rate per MMBTU to surge up to 5x and increasing the monthly meter rent from Rs. 40 to Rs. 500.',
      },
    ];
  } else if (tool.slug === 'gif-to-mp4' || tool.slug === 'gif-to-webm') {
    faqs = [
      {
        question: 'Why is MP4 smaller and faster to load than GIF on websites?',
        answer: 'GIF is a 35-year-old bitmap format that stores every single frame as an uncompressed 256-color table. MP4 (H.264) and WebM (VP9) utilize temporal inter-frame compression and motion vectors to encode only the changes between frames. This reduces file size by 90% to 95% while supporting 60fps smoothness and hardware-accelerated streaming on mobile devices.',
      },
      {
        question: 'Will converted MP4 videos loop automatically like animated GIFs?',
        answer: 'Yes! When embedding your converted MP4 or WebM video on any website, adding HTML5 video attributes (<video autoplay loop muted playsinline>) provides identical silent, infinite looping playback without freezing or crashing mobile browsers.',
      },
      {
        question: 'Why does ApexTools use the pad=ceil(iw/2)*2:ceil(ih/2)*2 filter for MP4 conversion?',
        answer: 'H.264 video compression encoders require pixel dimensions (both width and height) to be even numbers divisible by 2. When converting GIFs with odd dimensions (e.g. 401x325), standard converters fail or glitch. ApexTools automatically pads 1 pixel to ensure universal playback on iOS Safari, Chrome, and desktop players.',
      },
      {
        question: 'Is WebM or MP4 better for web animations and icons?',
        answer: 'MP4 (H.264) provides universal 100% compatibility across all devices, including Apple iPhones, Safari, and Windows. WebM (VP9) provides ~15% higher compression efficiency and is ideal for modern Google Chrome, Edge, and Android web apps.',
      },
    ];
  } else if (tool.slug === 'video-aspect-ratio-resizer') {
    faqs = [
      {
        question: 'How to convert a landscape 16:9 video to 9:16 for TikTok without cutting off edges?',
        answer: 'Select the 9:16 Vertical preset and choose the "Blurred Mirror" or "Custom Color Letterbox" background mode. Instead of zooming in and cropping out the sides of your landscape video, our engine keeps your entire original video in full resolution at the center and pads the top and bottom with a stylish blurred mirror backdrop.',
      },
      {
        question: 'How does blurred background padding work for vertical videos?',
        answer: 'Our FFmpeg filtergraph creates two simultaneous video layers: a background layer scaled to fill the entire 1080×1920 canvas and softened with a heavy boxblur (25:25) filter, and a sharp foreground layer scaled to fit inside. The two layers are composited into a modern, professional social media post.',
      },
      {
        question: 'What is the difference between Blurred Mirror, Black Letterbox, and Center Crop?',
        answer: 'Blurred Mirror provides a modern TikTok/Instagram Reels aesthetic. Black Letterbox creates a clean, classic cinematic letterbox bar appearance. Center Crop scales and crops the video to completely fill the canvas, which is ideal when your subject remains centered in the frame.',
      },
      {
        question: 'Does resizing videos degrade audio quality or frame rate?',
        answer: 'No. Audio streams are encoded with high-fidelity 192 kbps AAC stereo channels, and original frame rates are preserved with H.264 FastStart streaming headers for instant playback upon upload.',
      },
    ];
  } else if (tool.categorySlug === 'video' || tool.categorySlug === 'media') {
    faqs = [
      {
        question: 'How does the Discord 8MB and WhatsApp 16MB video compressor work?',
        answer: 'ApexTools dynamically calculates the exact target video bitrate required to fit your video clip within Discord (8MB) or WhatsApp (16MB) limits based on its duration. We apply two-pass H.264 FastStart encoding to ensure maximum visual clarity and instant streaming without buffering.',
      },
      {
        question: 'How does ApexTools make high-quality animated GIFs from video clips?',
        answer: 'We utilize a specialized two-pass FFmpeg palette generation filter (palettegen + paletteuse with Lanczos scaling and Bayer dithering). This samples the exact 256 optimal colors from your video frames, eliminating the pixelated noise and banding common in standard GIF converters.',
      },
      {
        question: 'Will converting MOV or WebM to MP4 cause audio and video desynchronization?',
        answer: 'No. Our FFmpeg transcode pipeline enforces strict timestamp alignment (-pix_fmt yuv420p, fixed frame rates, and synced AAC audio tracks) to guarantee perfect audio-video synchronization.',
      },
      {
        question: 'What is the maximum file size I can convert for free?',
        answer: 'ApexTools allows free media conversions for files up to 100 MB without registration, watermarks, or credit card requirements.',
      },
    ];
  } else if (tool.categorySlug === 'image') {
    faqs = [
      {
        question: 'What is AVIF and why is it smaller than WebP and JPEG?',
        answer: 'AVIF (AV1 Image File Format) is an open, royalty-free image format derived from the AV1 video codec. It uses advanced intra-frame prediction algorithms and modern entropy coding, achieving up to 50% smaller file sizes than WebP and 70% smaller than JPEG at identical or superior visual quality. It also supports 10-bit and 12-bit color depth, HDR, and transparent alpha channels.',
      },
      {
        question: 'How to create a multi-resolution favicon.ico containing 16x16 and 32x32 icons from an SVG?',
        answer: 'Simply upload your vector SVG (or high-resolution PNG) file to ApexTools and select "ICO (Favicon)" as the target format. Our backend pipeline automatically generates 16×16, 32×32, 48×48, and 64×64 pixel raster layers and encapsulates them into a single multi-pack Windows .ico container file ready for immediate use in your website root directory.',
      },
      {
        question: 'Does converting SVG to PNG maintain transparent background?',
        answer: 'Yes! When converting SVG to PNG on ApexTools, all transparent background areas and alpha channels are preserved with 100% precision. You can also select custom DPI rendering (72, 150, 300, 600 DPI) and dimension presets (up to 4096×4096 4K) for ultra-sharp rasterization.',
      },
      {
        question: 'How does the side-by-side comparison slider work?',
        answer: 'After converting an image, ApexTools displays an interactive split comparison handle. Drag the slider horizontally to inspect visual fidelity, edge sharpness, and compression artifacts between the original source image and the converted output before downloading.',
      },
      {
        question: 'Are image EXIF metadata and GPS location tags stripped for privacy?',
        answer: 'Yes. By default, ApexTools strips sensitive EXIF metadata (including camera model, date taken, and embedded GPS coordinates) during conversion to ensure maximum user privacy and minimize file size.',
      },
    ];
  } else if (AUDIO_TOOL_FAQS[tool.slug]) {
    faqs = AUDIO_TOOL_FAQS[tool.slug];
  } else if (tool.categorySlug === 'audio') {
    faqs = [
      {
        question: 'Does audio editing and processing occur 100% in the browser?',
        answer: 'Yes! ApexTools utilizes native Web Audio API (AudioContext and AudioBuffer) to execute all cutting, volume boosting, pitch modulation, and format transcoding inside your local browser memory. Zero audio files or voice recordings are uploaded to any server.',
      },
      {
        question: 'What audio formats are supported for conversion and editing?',
        answer: 'ApexTools supports all standard browser-decodable audio formats including MP3, WAV, M4A, AAC, FLAC, OGG, and WebM with custom bitrate presets up to 320kbps.',
      },
    ];
  }

  // Internal linking: reverse tool if available
  const reverseTool = tool.slug === 'marla-to-square-feet'
    ? { name: 'Square Feet to Marla (مربع فٹ سے مرلہ)', url: '/convert/unit/square-feet-to-marla' }
    : tool.slug === 'square-feet-to-marla'
    ? { name: 'Marla to Square Feet (مرلہ سے مربع فٹ)', url: '/convert/unit/marla-to-square-feet' }
    : undefined;

  const relatedTools = ALL_TOOLS.filter(
    (t) => t.categorySlug === tool.categorySlug && t.slug !== tool.slug
  ).slice(0, 3);

  // Schema financial product if currency tool
  const financialProduct = isCurrency
    ? {
        name: `${tool.name} Live Forex & Remittance Rates`,
        description: tool.description,
        baseCurrency: fromCurr,
        targetCurrency: toCurr,
      }
    : undefined;

  return (
    <ToolLayout
      toolName={tool.name}
      category={tool.categoryName}
      categorySlug={tool.categorySlug}
      slug={tool.slug}
      description={tool.description}
      badgeText={tool.badge || (isCurrency ? '⚡ Live Forex Hourly' : 'Free & Instant')}
      howToSteps={howToSteps}
      formula={formulaData}
      conversionTable={conversionTableData}
      faqs={faqs}
      relatedTools={relatedTools}
      reverseTool={reverseTool}
      financialProduct={financialProduct}
    >
      <ConverterCanvas tool={tool} />
    </ToolLayout>
  );
}
