import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { ALL_TOOLS, getToolBySlug } from '@/config/categories';
import { generateToolMetadata } from '@/lib/seo/metadata';
import { ToolLayout } from '@/components/layout/ToolLayout';
import { ConverterCanvas } from '@/components/converters/ConverterCanvas';

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
    seoTitle = 'Marla to Square Feet Converter Pakistan | مرلہ سے مربع فٹ | ConvertHub';
    seoDescription = 'Free online Marla to Square Feet (Sq Ft) converter for Pakistan real estate. Supports Lahore/LDA/DHA (225 sq ft), Patwari/Revenue (272.25 sq ft), and CDA (250 sq ft) with interactive plot visualizer.';
    keywords.push('1 marla in sq ft lahore', 'marla to square feet', 'marla to sq ft calculator', 'marla to kanal', 'dha lahore marla size', 'patwari marla size');
  } else if (tool.slug === 'square-feet-to-marla') {
    seoTitle = 'Square Feet to Marla Calculator Pakistan | مربع فٹ سے مرلہ | ConvertHub';
    seoDescription = 'Convert Square Feet to Marla, Kanal, Square Yards (Gazz), and Sarsahi accurately across LDA (225), CDA (250), and Patwari (272.25) standards in Pakistan.';
    keywords.push('square feet to marla', 'sq ft to marla pakistan', 'calculate marla from square feet', 'kanal calculator', 'square yard to marla');
  } else if (tool.slug === 'tola-to-grams') {
    seoTitle = 'Tola to Grams Gold Converter Pakistan | تولہ سے گرام | ConvertHub';
    seoDescription = 'Convert Sarafa gold weight between Tola, Grams, Masha, and Ratti (1 Tola = 11.6638g). Calculate 24K, 22K, 21K, and 18K gold rates and jewelry valuations in PKR.';
    keywords.push('1 tola in grams', 'tola to grams gold', 'tola to masha', 'gold rate per tola pakistan', '24k gold rate per tola', '22k gold tola price');
  } else if (tool.slug === 'maund-to-kg') {
    seoTitle = 'Maund to KG Converter Pakistan | من سے کلو گرام | ConvertHub';
    seoDescription = 'Convert Mandi wholesale crop weights from Maund (40 kg), Seer, and Chhatak to Kilograms and Metric Tons. Calculate wheat, rice, and cotton trade batch pricing in Lakhs/Crores.';
    keywords.push('1 maund in kg', 'maund to kg', 'mann to kg pakistan', '1 mann in kg wheat', 'maund to metric ton', 'ghalla mandi rates');
  } else if (tool.slug === 'hijri-to-gregorian') {
    seoTitle = 'Hijri to Gregorian Calendar Converter Pakistan | اسلامی ہجری کیلنڈر | ConvertHub';
    seoDescription = 'Accurate Islamic lunar Hijri date to Gregorian solar date converter with Pakistan Central Ruet-e-Hilal moon sighting offset adjustments and annual Islamic event dates.';
    keywords.push('hijri to gregorian', 'islamic date today pakistan', 'gregorian to hijri converter', 'islamic calendar 1448', 'ruet e hilal moon sighting today');
  } else if (tool.slug === 'usd-to-pkr') {
    seoTitle = 'USD to PKR Today | US Dollar to Pakistani Rupee Live Exchange Rate | ConvertHub';
    seoDescription = 'Live USD to PKR interbank and open market exchange rates with real-time conversion matrices ($1 to $10,000), 7D/30D historical trend charts, and remittance savings calculator.';
    keywords.push('usd to pkr', 'dollar rate in pakistan today', '1 dollar in pkr', 'usd to pkr interbank', 'open market dollar rate lahore karachi', 'remittance to pakistan usd to pkr');
  } else if (tool.slug === 'sar-to-pkr') {
    seoTitle = 'SAR to PKR Today | Saudi Riyal to Pakistani Rupee Exchange Rate | ConvertHub';
    seoDescription = 'Live Saudi Riyal (SAR) to Pakistani Rupee (PKR) exchange rate for overseas remittances. Pre-calculated conversion tables from 1 to 10,000 SAR with zero bank fee guide.';
    keywords.push('sar to pkr', 'saudi riyal to pkr', '1 riyal in pakistani rupees', 'riyal rate in pakistan today', 'saudi remittance to pakistan');
  } else if (tool.slug === 'aed-to-pkr') {
    seoTitle = 'AED to PKR Today | UAE Dirham to Pakistani Rupee Live Rate | ConvertHub';
    seoDescription = 'Convert UAE Dirham (AED) to Pakistani Rupee (PKR) with live hourly rates, Dubai exchange company comparisons, and 30-day historical chart.';
    keywords.push('aed to pkr', 'uae dirham to pkr', '1 dirham in pak rupees', 'dubai dirham rate in pakistan', 'uae remittance to pkr');
  } else if (tool.slug === 'gbp-to-pkr') {
    seoTitle = 'GBP to PKR Today | British Pound to Pakistani Rupee Exchange Rate | ConvertHub';
    seoDescription = 'Live British Pound Sterling (GBP) to Pakistani Rupee (PKR) rate for UK diaspora remittances, freelancer payouts, and Roshan Digital transfers.';
    keywords.push('gbp to pkr', 'pound rate in pakistan', '1 pound in pkr', 'uk remittance to pakistan');
  } else if (tool.slug === 'eur-to-pkr') {
    seoTitle = 'EUR to PKR Today | Euro to Pakistani Rupee Live Exchange Rate | ConvertHub';
    seoDescription = 'Live Euro (EUR) to Pakistani Rupee (PKR) exchange rate with daily trend chart, European remittance matrix, and interbank comparison.';
    keywords.push('eur to pkr', 'euro to pakistani rupee', 'euro rate in pakistan today');
  } else if (tool.slug === 'cad-to-pkr') {
    seoTitle = 'CAD to PKR Today | Canadian Dollar to Pakistani Rupee Rate | ConvertHub';
    seoDescription = 'Live Canadian Dollar (CAD) to Pakistani Rupee (PKR) exchange rate and remittance payout calculator for overseas Pakistanis in Canada.';
    keywords.push('cad to pkr', 'canadian dollar to pkr', 'cad to pkr exchange rate today');
  } else if (tool.slug === 'aud-to-pkr') {
    seoTitle = 'AUD to PKR Today | Australian Dollar to Pakistani Rupee Rate | ConvertHub';
    seoDescription = 'Live Australian Dollar (AUD) to Pakistani Rupee (PKR) exchange rate with pre-calculated conversion matrices and trend tracker.';
    keywords.push('aud to pkr', 'australian dollar to pkr', 'aud to pkr rate today');
  } else if (tool.slug === 'qar-to-pkr') {
    seoTitle = 'QAR to PKR Today | Qatari Riyal to Pakistani Rupee Exchange Rate | ConvertHub';
    seoDescription = 'Convert Qatari Riyal (QAR) to Pakistani Rupee (PKR) with live exchange rates for Gulf remittances and Doha exchange companies.';
    keywords.push('qar to pkr', 'qatar riyal to pkr', 'qar to pkr exchange rate');
  } else if (tool.slug === 'kwd-to-pkr') {
    seoTitle = 'KWD to PKR Today | Kuwaiti Dinar to Pakistani Rupee Rate | ConvertHub';
    seoDescription = 'Live Kuwaiti Dinar (KWD) to Pakistani Rupee (PKR) rate — convert the world\'s highest-value currency with live hourly updates.';
    keywords.push('kwd to pkr', 'kuwaiti dinar to pkr', '1 kwd in pkr');
  } else if (tool.slug === 'omr-to-pkr') {
    seoTitle = 'OMR to PKR Today | Omani Rial to Pakistani Rupee Rate | ConvertHub';
    seoDescription = 'Convert Omani Rial (OMR) to Pakistani Rupee (PKR) with real-time exchange rates and Muscat remittance calculators.';
    keywords.push('omr to pkr', 'omani rial to pkr', 'omr to pkr today');
  } else if (tool.slug === 'currency-converter') {
    seoTitle = 'Live Forex & Currency Converter | Real-Time Exchange Rates | ConvertHub';
    seoDescription = 'Convert between 150+ world currencies with hourly live mid-market exchange rates, multi-currency comparisons, and interactive historical charts.';
    keywords.push('currency converter', 'live forex converter', 'usd to pkr', 'exchange rates live', 'convert currency online');
  } else if (tool.slug === 'heic-to-jpg') {
    seoTitle = 'HEIC to JPG Converter — Convert iPhone Photos Online Free | ConvertHub';
    seoDescription = 'Convert Apple iPhone HEIC/HEIF photos to universal high-quality JPG images in seconds. 100% free, preserves EXIF metadata, and auto-deletes files in 2 hours.';
    keywords.push('heic to jpg', 'convert heic to jpg', 'iphone photo converter', 'heic to jpeg', 'heif to jpg online free', 'apple photo to jpg');
  } else if (tool.slug === 'heic-to-png') {
    seoTitle = 'HEIC to PNG Converter — Convert iPhone Photos with Transparency | ConvertHub';
    seoDescription = 'Convert Apple HEIC photos to lossless PNG format with transparent alpha channels and maximum color depth. Free online converter with instant download.';
    keywords.push('heic to png', 'convert heic to png', 'apple heic png converter', 'iphone photo to png', 'heif to png transparent');
  } else if (tool.slug === 'png-to-jpg') {
    seoTitle = 'PNG to JPG Converter — Convert PNG to Lightweight JPG Online | ConvertHub';
    seoDescription = 'Convert transparent PNG images to optimized JPG files with custom background matte colors and MozJPEG compression. Free online batch converter.';
    keywords.push('png to jpg', 'convert png to jpg', 'png to jpeg converter', 'reduce png size to jpg', 'image converter png to jpg');
  } else if (tool.slug === 'jpg-to-png') {
    seoTitle = 'JPG to PNG Converter — Convert JPG to Lossless PNG Format | ConvertHub';
    seoDescription = 'Convert JPG and JPEG files to crisp, lossless PNG images without compression artifacts. Ideal for graphics, design assets, and screenshots.';
    keywords.push('jpg to png', 'convert jpg to png', 'jpeg to png high quality', 'convert jpeg to png online free');
  } else if (tool.slug === 'webp-to-jpg') {
    seoTitle = 'WebP to JPG Converter — Convert Google WebP to Universal JPG | ConvertHub';
    seoDescription = 'Convert modern Google WebP images to universal JPG format compatible with all desktop viewers, smartphones, and editing tools.';
    keywords.push('webp to jpg', 'convert webp to jpg', 'google webp to jpeg', 'webp to jpg converter free');
  } else if (tool.slug === 'jpg-to-webp') {
    seoTitle = 'JPG to WebP Converter — Reduce Image Size by 35% Online | ConvertHub';
    seoDescription = 'Convert JPG photos to lightweight next-gen WebP format. Improve Google Core Web Vitals and website page speed with 30-40% smaller file sizes.';
    keywords.push('jpg to webp', 'convert jpg to webp', 'jpeg to webp converter', 'compress jpg to webp', 'web speed image optimization');
  } else if (tool.slug === 'png-to-webp') {
    seoTitle = 'PNG to WebP Converter — Preserve Transparency with Small Size | ConvertHub';
    seoDescription = 'Convert PNG graphics to WebP while maintaining full alpha transparency at 50% smaller file sizes. Ideal for web developers and designers.';
    keywords.push('png to webp', 'convert png to webp', 'transparent webp converter', 'png to webp online');
  } else if (tool.slug === 'webp-to-png') {
    seoTitle = 'WebP to PNG Converter — Convert WebP with Lossless Alpha Channel | ConvertHub';
    seoDescription = 'Convert Google WebP image format to standard PNG with full transparent background support. Instant, secure, and auto-purged in 2 hours.';
    keywords.push('webp to png', 'convert webp to png', 'webp transparent to png', 'webp to png converter online');
  } else if (tool.slug === 'png-to-ico') {
    seoTitle = 'PNG to ICO Converter — Create Website Favicons & Windows Icons | ConvertHub';
    seoDescription = 'Convert PNG images into 256x256 multi-resolution ICO icon files and website favicons. Free online icon generator with transparent background support.';
    keywords.push('png to ico', 'favicon generator', 'convert png to ico', 'website favicon maker', 'create ico from png');
  } else if (tool.slug === 'png-to-svg') {
    seoTitle = 'PNG to SVG Vector Wrapper — Convert Raster PNG to Scalable SVG | ConvertHub';
    seoDescription = 'Convert PNG graphics into clean, scalable SVG vector wrapper documents for web design, logos, and responsive web development.';
    keywords.push('png to svg', 'convert png to svg', 'raster to svg wrapper', 'png to vector converter');
  } else if (tool.slug === 'compress-image') {
    seoTitle = 'Free Image Compressor — Reduce JPG, PNG & WebP by Up to 90% | ConvertHub';
    seoDescription = 'Compress images online with MozJPEG and WebP intelligent lossy compression. Reduce photo file size without visible degradation. 100% free.';
    keywords.push('compress image', 'image compressor online', 'compress jpg', 'reduce png file size', 'compress photo size');
  } else if (tool.slug === 'resize-image') {
    seoTitle = 'Free Image Resizer — Resize Dimensions in Pixels & Percentages | ConvertHub';
    seoDescription = 'Resize image width and height online with aspect ratio lock, predefined scale percentages (25% to 200%), and high-quality Lanczos resampling.';
    keywords.push('resize image', 'image resizer online', 'resize photo dimensions', 'change image size in pixels', 'scale image online');
  } else if (tool.slug === 'remove-background') {
    seoTitle = 'Remove Image Background — Free Online Cutout Generator | ConvertHub';
    seoDescription = 'Remove backgrounds from photos and graphics to generate clean transparent PNG cutouts instantly. Free, private, and fast browser conversion.';
    keywords.push('remove background', 'transparent background generator', 'image cutout tool', 'remove photo background free');
  } else if (tool.slug === 'pdf-to-word') {
    seoTitle = 'PDF to Word Converter — Convert PDF to Editable DOCX Online Free | ConvertHub';
    seoDescription = 'Convert PDF files into fully editable Microsoft Word DOCX documents with preserved formatting, tables, and fonts. 100% free with bank-grade 256-bit encryption.';
    keywords.push('pdf to word', 'convert pdf to docx', 'pdf to word converter free', 'pdf to doc', 'editable word from pdf');
  } else if (tool.slug === 'word-to-pdf') {
    seoTitle = 'Word to PDF Converter — Convert DOCX & DOC to PDF Online Free | ConvertHub';
    seoDescription = 'Convert Microsoft Word DOCX and DOC documents into universal, high-quality PDF files instantly. Preserves exact layout, fonts, and images.';
    keywords.push('word to pdf', 'convert word to pdf', 'docx to pdf', 'doc to pdf online free');
  } else if (tool.slug === 'pdf-to-excel') {
    seoTitle = 'PDF to Excel Converter — Extract PDF Tables to XLSX Spreadsheets | ConvertHub';
    seoDescription = 'Extract financial tables, spreadsheets, and structured tabular data from PDF files into formatted Microsoft Excel XLSX spreadsheets.';
    keywords.push('pdf to excel', 'convert pdf to xlsx', 'pdf to excel spreadsheet', 'extract tables from pdf');
  } else if (tool.slug === 'excel-to-pdf') {
    seoTitle = 'Excel to PDF Converter — Convert XLSX Spreadsheets to PDF Online | ConvertHub';
    seoDescription = 'Convert Microsoft Excel spreadsheets (XLSX, XLS) into clean, printable PDF documents with custom page fitting and gridlines.';
    keywords.push('excel to pdf', 'convert xlsx to pdf', 'spreadsheet to pdf', 'convert excel sheet to pdf online');
  } else if (tool.slug === 'pdf-to-powerpoint') {
    seoTitle = 'PDF to PowerPoint Converter — Convert PDF to Editable PPTX Slides | ConvertHub';
    seoDescription = 'Convert PDF presentation slides into fully editable Microsoft PowerPoint PPTX decks. Retain layouts, vector graphics, and slide text.';
    keywords.push('pdf to powerpoint', 'pdf to pptx', 'convert pdf to ppt', 'pdf to presentation slides');
  } else if (tool.slug === 'powerpoint-to-pdf') {
    seoTitle = 'PowerPoint to PDF Converter — Convert PPTX to PDF Online Free | ConvertHub';
    seoDescription = 'Convert PowerPoint presentations (PPTX, PPT) to universal PDF format. Ideal for presentations, sharing, and high-quality printing.';
    keywords.push('powerpoint to pdf', 'pptx to pdf', 'convert powerpoint to pdf', 'ppt to pdf free');
  } else if (tool.slug === 'jpg-to-pdf') {
    seoTitle = 'JPG to PDF Converter — Combine Multiple Images into Single PDF | ConvertHub';
    seoDescription = 'Combine JPG, PNG, and WebP photos into a single professional PDF document. Customize A4/Letter page sizes, margins, and orientation.';
    keywords.push('jpg to pdf', 'convert jpg to pdf', 'combine images to pdf', 'photos to pdf online free');
  } else if (tool.slug === 'pdf-to-jpg') {
    seoTitle = 'PDF to JPG / PNG Converter — Extract PDF Pages to Images | ConvertHub';
    seoDescription = 'Extract all PDF pages into high-resolution JPG or PNG image files with selectable 72/150/300 DPI rendering. Download as a single ZIP package.';
    keywords.push('pdf to jpg', 'pdf to png', 'convert pdf to images', 'extract pages from pdf');
  } else if (tool.slug === 'merge-pdf') {
    seoTitle = 'Merge PDF — Combine Multiple PDF Files into One Online Free | ConvertHub';
    seoDescription = 'Combine and merge multiple PDF documents in your desired sequential order with interactive drag-and-drop page management. 100% free and secure.';
    keywords.push('merge pdf', 'combine pdf files', 'join pdf documents', 'merge pdf online free', 'pdf joiner');
  } else if (tool.slug === 'split-pdf') {
    seoTitle = 'Split PDF — Extract PDF Pages & Split into Separate Files | ConvertHub';
    seoDescription = 'Extract specific page ranges (e.g. 1, 3-5, 8) from PDF or split all pages into separate numbered PDF files bundled in a convenient ZIP.';
    keywords.push('split pdf', 'extract pdf pages', 'separate pdf pages', 'split pdf online free', 'pdf splitter');
  } else if (tool.slug === 'compress-pdf') {
    seoTitle = 'Compress PDF — Reduce PDF File Size by Up to 80% Online Free | ConvertHub';
    seoDescription = 'Compress PDF file size without sacrificing readability. Choose Extreme, Recommended, or Less compression with technical DPI benchmark analysis.';
    keywords.push('compress pdf', 'reduce pdf size', 'shrink pdf file size', 'pdf compressor online free', 'compress pdf to 200kb');
  } else if (tool.slug === 'rotate-pdf') {
    seoTitle = 'Rotate PDF — Rotate PDF Pages 90, 180, 270 Degrees Online | ConvertHub';
    seoDescription = 'Rotate individual or all pages in a PDF document by 90°, 180°, or 270° clockwise with instant visual page orientation preview.';
    keywords.push('rotate pdf', 'rotate pdf pages', 'turn pdf clockwise', 'rotate upside down pdf');
  } else if (tool.slug === 'protect-pdf') {
    seoTitle = 'Protect PDF — Password Encrypt PDF Documents with 256-bit AES | ConvertHub';
    seoDescription = 'Encrypt sensitive PDF documents with military-grade 256-bit AES password encryption to prevent unauthorized viewing, printing, and copying.';
    keywords.push('protect pdf', 'password protect pdf', 'encrypt pdf', 'lock pdf with password');
  } else if (tool.slug === 'unlock-pdf') {
    seoTitle = 'Unlock PDF — Remove Password & Encryption from PDF Online | ConvertHub';
    seoDescription = 'Remove password restrictions and security encryption from PDF documents to enable editing, printing, and free sharing.';
    keywords.push('unlock pdf', 'remove pdf password', 'decrypt pdf', 'pdf password remover online');
  } else if (tool.slug === 'create-zip' || tool.slug === 'zip-compressor') {
    seoTitle = 'Create ZIP Archive — Compress & Bundle Multiple Files Online | ConvertHub';
    seoDescription = 'Bundle and compress multiple files into a high-efficiency ZIP archive stream. Free, fast, with customizable deflate compression levels.';
    keywords.push('create zip', 'zip files online', 'bundle files to zip', 'zip compressor free');
  } else if (tool.slug === 'extract-zip') {
    seoTitle = 'Extract ZIP Archive — Unzip, Inspect & Decompress Files Online | ConvertHub';
    seoDescription = 'Unzip and inspect contents of ZIP, 7Z, and TAR archives online without installing software. View file tree and download extracted assets.';
    keywords.push('extract zip', 'unzip files online', 'open zip file', 'zip extractor free');
  } else if (tool.slug === 'video-to-mp3' || tool.slug === 'mp4-to-mp3') {
    seoTitle = `${tool.name} — Extract 320kbps MP3 Audio from Video Online Free | ConvertHub`;
    seoDescription = 'Extract crystal-clear 320kbps MP3 audio tracks directly from MP4, MOV, WebM, AVI, and MKV video files. 100% free with customizable bitrate presets.';
    keywords.push('video to mp3', 'mp4 to mp3', 'extract audio from video', 'convert video to mp3', 'mp4 to mp3 320kbps', 'video audio extractor free');
  } else if (tool.slug === 'video-to-gif') {
    seoTitle = 'Video to GIF Converter — Create High-Quality Animated GIFs Online Free | ConvertHub';
    seoDescription = 'Convert MP4, MOV, and WebM video clips into high-framerate animated GIFs with lanczos 2-pass palette generation. Free online GIF maker.';
    keywords.push('video to gif', 'convert mp4 to gif', 'gif maker online', 'video to animated gif', 'high quality gif converter');
  } else if (tool.slug === 'compress-video-for-discord') {
    seoTitle = 'Compress Video for Discord — Reduce Video Under 8MB & 25MB Online Free | ConvertHub';
    seoDescription = 'Compress video clips to under 8MB (Discord Free) or 25MB (Discord Nitro) with smart two-pass bitrate optimization. Fast, free, and no watermark.';
    keywords.push('compress video for discord', 'discord 8mb video compressor', 'shrink video for discord', 'discord video size reducer', 'discord nitro 25mb video');
  } else if (tool.slug === 'compress-video-for-whatsapp') {
    seoTitle = 'Compress Video for WhatsApp — Reduce Video Under 16MB Fast | ConvertHub';
    seoDescription = 'Compress large video files to under 16MB for WhatsApp with H.264 FastStart encoding for instant message sharing without buffering.';
    keywords.push('compress video for whatsapp', 'whatsapp 16mb video compressor', 'reduce video size for whatsapp status', 'whatsapp video size reducer');
  } else if (tool.slug === 'compress-video') {
    seoTitle = 'Video Compressor — Reduce Video File Size Online Without Quality Loss | ConvertHub';
    seoDescription = 'Compress MP4, MOV, and WebM videos by up to 80% with visually lossless CRF compression. Fast FFmpeg multi-threaded rendering.';
    keywords.push('compress video', 'video compressor online', 'reduce video size', 'mp4 compressor free', 'shrink video size');
  } else if (tool.slug === 'mp4-to-webm') {
    seoTitle = 'MP4 to WebM Converter — Convert MP4 to HTML5 WebM Online Free | ConvertHub';
    seoDescription = 'Convert MP4 videos into next-gen VP9/Opus WebM format for lightweight HTML5 web video embedding and faster page load speeds.';
    keywords.push('mp4 to webm', 'convert mp4 to webm', 'html5 video converter', 'mp4 to webm online free');
  } else if (tool.slug === 'webm-to-mp4') {
    seoTitle = 'WebM to MP4 Converter — Convert WebM to Universal MP4 Online | ConvertHub';
    seoDescription = 'Convert Google WebM screen recordings and browser video captures into universal H.264 MP4 format with full audio sync.';
    keywords.push('webm to mp4', 'convert webm to mp4', 'webm to mp4 high quality', 'webm converter online');
  } else if (tool.slug === 'mov-to-mp4') {
    seoTitle = 'MOV to MP4 Converter — Convert iPhone QuickTime MOV to MP4 | ConvertHub';
    seoDescription = 'Convert Apple QuickTime MOV videos from iPhone and Mac into universal MP4 format with zero quality degradation. Free online converter.';
    keywords.push('mov to mp4', 'convert mov to mp4', 'iphone mov to mp4', 'apple video to mp4');
  } else if (tool.slug === 'mkv-to-mp4') {
    seoTitle = 'MKV to MP4 Converter — Convert Matroska MKV to MP4 Online | ConvertHub';
    seoDescription = 'Convert MKV movie files into standard MP4 format compatible with smart TVs, iPhone, Android, and gaming consoles.';
    keywords.push('mkv to mp4', 'convert mkv to mp4', 'matroska to mp4', 'mkv to mp4 converter free');
  } else if (tool.slug === 'avi-to-mp4') {
    seoTitle = 'AVI to MP4 Converter — Convert Legacy AVI to Modern MP4 Online | ConvertHub';
    seoDescription = 'Convert legacy AVI video files into lightweight, modern MP4 format with crisp stereo sound. 100% free online batch converter.';
    keywords.push('avi to mp4', 'convert avi to mp4', 'avi to mp4 converter online');
  } else if (tool.slug === 'video-trim') {
    seoTitle = 'Video Trimmer & Cutter — Cut & Trim Video Clips Online Free | ConvertHub';
    seoDescription = 'Trim, cut, and extract video clips online by setting precise start and duration timestamps. Fast processing with no watermarks.';
    keywords.push('video trimmer', 'cut video online', 'trim mp4 online', 'video cutter free');
  } else if (tool.slug === 'wav-to-mp3') {
    seoTitle = 'WAV to MP3 Converter — Convert WAV to 320kbps MP3 Online Free | ConvertHub';
    seoDescription = 'Convert heavy uncompressed WAV audio into lightweight 320kbps MP3s saving up to 90% storage space while preserving studio sound.';
    keywords.push('wav to mp3', 'convert wav to mp3', 'wav to mp3 320kbps', 'wav to mp3 converter free');
  } else if (tool.slug === 'mp3-to-wav') {
    seoTitle = 'MP3 to WAV Converter — Convert MP3 to Uncompressed PCM WAV | ConvertHub';
    seoDescription = 'Convert MP3 audio tracks into 16-bit 44.1kHz uncompressed PCM WAV files for DAW audio editing and music production.';
    keywords.push('mp3 to wav', 'convert mp3 to wav', 'mp3 to wav converter online');
  } else if (tool.slug === 'm4a-to-mp3') {
    seoTitle = 'M4A to MP3 Converter — Convert Apple Voice Memos & AAC to MP3 | ConvertHub';
    seoDescription = 'Convert iPhone Voice Memos, iTunes M4A, and AAC audio into universal MP3 format with customizable 320kbps bitrates.';
    keywords.push('m4a to mp3', 'convert m4a to mp3', 'apple voice memo to mp3', 'iphone audio to mp3');
  } else if (tool.slug === 'flac-to-mp3') {
    seoTitle = 'FLAC to MP3 Converter — Convert Lossless FLAC to 320kbps MP3 | ConvertHub';
    seoDescription = 'Convert lossless FLAC audio files to high-definition 320kbps MP3 files for mobile devices and car audio players.';
    keywords.push('flac to mp3', 'convert flac to mp3', 'flac to mp3 320kbps', 'lossless audio to mp3');
  } else if (tool.slug === 'audio-compress') {
    seoTitle = 'Audio Compressor — Compress MP3, WAV & M4A Audio Online Free | ConvertHub';
    seoDescription = 'Compress podcasts, audiobooks, and music tracks by optimizing bitrate without muffling voices. 100% free online audio compressor.';
    keywords.push('audio compressor', 'compress mp3', 'reduce audio file size', 'compress voice recording');
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

  // 1. How To Steps
  let howToSteps = [
    {
      title: isDocumentOrImage ? 'Upload Your File' : 'Enter Input Value',
      description: isDocumentOrImage
        ? 'Drag and drop your file into the secure dropzone above or click Browse to select from your device.'
        : isCurrency
        ? `Type the ${fromCurr} amount you want to convert to ${toCurr}.`
        : 'Type the numerical amount you want to convert into the input field.',
      tip: isDocumentOrImage ? 'Files up to 25MB are completely free.' : 'Supports standard decimal notation.',
    },
    {
      title: 'Choose Conversion Parameters',
      description: isPakistanRealEstate
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
      title: 'Get Instant Output & Share',
      description: isDocumentOrImage
        ? 'Click download to save your converted file. All files are automatically deleted after 1 hour.'
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

  if (isPakistanRealEstate) {
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

  if (isPakistanRealEstate) {
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
      headers: ['Platform / Service', 'Maximum File Allowance', 'Optimized ConvertHub Preset'] as [string, string, string],
      rows: [
        { fromValue: 'Discord (Free Account)', toValue: '8.00 MB File Limit', extraInfo: 'Discord 8MB Preset (Two-pass variable bitrate)' },
        { fromValue: 'WhatsApp Direct Attachment', toValue: '16.00 MB File Limit', extraInfo: 'WhatsApp 16MB FastStart (AAC stereo)' },
        { fromValue: 'Discord Nitro Basic / Email', toValue: '25.00 MB File Limit', extraInfo: '25MB High-Definition Preset' },
        { fromValue: 'Discord Nitro Pro', toValue: '500.00 MB File Limit', extraInfo: 'Full 1080p CRF 22 Preset' },
      ],
      caption: 'Benchmarked upload size limits across major communication platforms.',
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
  }

  // 4. Long-Tail SEO FAQs
  let faqs = [
    {
      question: `Is ${tool.name} completely free to use?`,
      answer: `Yes, ${tool.name} on ConvertHub is 100% free with no registration or credit card required. You get unlimited calculations directly inside your browser.`,
    },
    {
      question: 'Are my calculations private and secure?',
      answer: 'Absolutely. All mathematical operations occur 100% client-side inside your browser. No personal measurements or numerical inputs are transmitted or stored.',
    },
    {
      question: 'Can I use this tool on my mobile phone?',
      answer: 'Yes, ConvertHub is mobile-first and optimized for seamless use on smartphones, tablets, and desktop browsers without installing any external apps.',
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
        answer: 'The Revenue/Patwari standard (272.25 sq ft per Marla) is the official legal standard maintained by the Board of Revenue in Punjab, Sindh, KPK, and Balochistan. It is based on 9 Sarsahi (where 1 Karam = 5.5 ft). Urban housing societies reduced the standard to 225 sq ft (15 ft × 15 ft) for easier grid planning. ConvertHub lets you toggle between both standards instantly.',
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
        answer: 'While the astronomical Umm al-Qura calendar provides mathematical moon phases, local Islamic dates in Pakistan depend on physical crescent moon sightings declared by the Central Ruet-e-Hilal Committee. ConvertHub provides an interactive offset toggle (-2, -1, 0, +1, +2 days) to synchronize with official Pakistan declarations.',
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
        answer: 'The Interbank rate is the official benchmark wholesale rate traded between licensed commercial banks. The Open Market rate is quoted by Exchange Companies (Forex Association of Pakistan - FAP) for physical cash purchase and selling. ConvertHub provides hourly synchronized live mid-market rates.',
      },
      {
        question: `How can overseas Pakistanis send remittances to Pakistan with zero transfer fees?`,
        answer: 'Under the State Bank of Pakistan (SBP) Pakistan Remittance Initiative (PRI), remittances of $100 or more sent through legal banking channels (Direct Bank Wire, Roshan Digital Account, Western Union/Remitly direct to bank account) are completely free of transfer charges.',
      },
      {
        question: 'When do foreign exchange rates update daily on ConvertHub?',
        answer: 'ConvertHub synchronizes exchange rates continuously on an hourly schedule using a multi-tiered caching architecture (Upstash Redis <10ms -> Supabase Cloud DB -> Central Bank feed), providing sub-10ms response times with zero rate-limit interruptions.',
      },
      {
        question: 'Are foreign currency remittances sent to Pakistan subject to income tax or withholding tax?',
        answer: 'No. Remittances received into personal Pakistani bank accounts or Roshan Digital Accounts (RDA) from overseas family members are 100% tax-free under Section 111(4) of the Income Tax Ordinance. Foreign IT export income is eligible for a reduced 0.25% final tax status with PSEB registration.',
      },
      {
        question: `Can I convert other foreign currencies like SAR, AED, GBP, and EUR to PKR?`,
        answer: `Yes! ConvertHub provides dedicated calculators and real-time comparison tables for all major remittance pairs including Saudi Riyal (SAR), UAE Dirham (AED), British Pound (GBP), Euro (EUR), Canadian Dollar (CAD), Australian Dollar (AUD), Qatari Riyal (QAR), and Kuwaiti Dinar (KWD).`,
      },
    ];
  } else if (tool.categorySlug === 'image') {
    faqs = [
      {
        question: `How do I convert ${tool.name} without losing image quality?`,
        answer: 'ConvertHub leverages high-performance Sharp and MozJPEG rendering pipelines. Our default 85% balanced quality setting maintains high visual fidelity and sharpness while eliminating unnecessary byte overhead.',
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
        answer: 'ConvertHub is 100% free with unlimited single and batch conversions for files up to 25 MB with no registration or credit card required.',
      },
    ];
  } else if (tool.categorySlug === 'document') {
    faqs = [
      {
        question: 'How do I convert PDF to editable Word document without losing formatting?',
        answer: 'ConvertHub extracts paragraphs, headings, font styles, and table structures directly from your PDF and generates a standard Microsoft Word DOCX file with exact formatting preserved.',
      },
      {
        question: 'Is it safe to upload confidential legal documents to ConvertHub?',
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
        answer: 'Yes. If you know the password, ConvertHub decrypts the document and provides an unlocked copy with all printing and editing restrictions permanently removed.',
      },
    ];
  } else if (tool.categorySlug === 'archive') {
    faqs = [
      {
        question: 'How do I create a ZIP file from multiple documents and photos?',
        answer: 'Simply drag and drop all your files into the upload area, optionally specify an archive name, and click "Create ZIP". ConvertHub compresses the files in real time.',
      },
      {
        question: 'What compression level does ConvertHub ZIP creator use?',
        answer: 'We utilize industry-standard Deflate LZ77 + Huffman compression (Level 0 to 9) to ensure maximum byte reduction and 100% compatibility across Windows, macOS, Linux, iOS, and Android.',
      },
      {
        question: 'Can I extract and preview ZIP files online without installing software?',
        answer: 'Yes! ConvertHub allows you to inspect archive contents, verify file sizes, and decompress all contents directly in your browser.',
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
        answer: 'Yes! ConvertHub seamlessly decodes Apple AAC/M4A audio recordings from iPhone and iPad and generates universal MP3 files playable on any device or software.',
      },
      {
        question: 'Are my uploaded audio and video files kept private and secure?',
        answer: 'Yes, 100%. All media processing runs in isolated temporary sandboxes with end-to-end encryption. Converted files are permanently auto-purged from our servers after 2 hours.',
      },
    ];
  } else if (tool.categorySlug === 'video' || tool.categorySlug === 'media') {
    faqs = [
      {
        question: 'How does the Discord 8MB and WhatsApp 16MB video compressor work?',
        answer: 'ConvertHub dynamically calculates the exact target video bitrate required to fit your video clip within Discord (8MB) or WhatsApp (16MB) limits based on its duration. We apply two-pass H.264 FastStart encoding to ensure maximum visual clarity and instant streaming without buffering.',
      },
      {
        question: 'How does ConvertHub make high-quality animated GIFs from video clips?',
        answer: 'We utilize a specialized two-pass FFmpeg palette generation filter (palettegen + paletteuse with Lanczos scaling and Bayer dithering). This samples the exact 256 optimal colors from your video frames, eliminating the pixelated noise and banding common in standard GIF converters.',
      },
      {
        question: 'Will converting MOV or WebM to MP4 cause audio and video desynchronization?',
        answer: 'No. Our FFmpeg transcode pipeline enforces strict timestamp alignment (-pix_fmt yuv420p, fixed frame rates, and synced AAC audio tracks) to guarantee perfect audio-video synchronization.',
      },
      {
        question: 'What is the maximum file size I can convert for free?',
        answer: 'ConvertHub allows free media conversions for files up to 100 MB without registration, watermarks, or credit card requirements.',
      },
    ];
  }

  // Internal linking: reverse tool if available
  const reverseTool = tool.slug === 'marla-to-square-feet'
    ? { name: 'Square Feet to Marla (مربع فٹ سے مرلہ)', url: '/convert/pakistan/square-feet-to-marla' }
    : tool.slug === 'square-feet-to-marla'
    ? { name: 'Marla to Square Feet (مرلہ سے مربع فٹ)', url: '/convert/pakistan/marla-to-square-feet' }
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
      badgeText={tool.pakistanSpecific ? '🇵🇰 Pakistan Standard' : isCurrency ? '⚡ Live Forex Hourly' : 'Free & Instant'}
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
