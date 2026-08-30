import { fileTypeFromBuffer } from 'file-type';
import path from 'path';

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
  'image/tiff',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/heic',
  'image/heif',
  'image/avif',
];

export const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'application/msword', // .doc
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
  'application/vnd.ms-powerpoint', // .ppt
  'text/plain',
  'text/html',
  'text/csv',
  'text/markdown',
  'application/rtf',
  'application/epub+zip',
];

export const ALLOWED_ARCHIVE_MIMES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/x-tar',
  'application/gzip',
  'application/x-gzip',
  'application/x-rar-compressed',
  'application/vnd.rar',
];

export const ALLOWED_MEDIA_MIMES = [
  // Video
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska', // .mkv
  'video/x-ms-wmv', // .wmv
  'video/x-flv', // .flv
  'video/mpeg',
  'video/ogg',
  'video/3gpp',
  'video/mp2t',
  // Audio
  'audio/mpeg', // .mp3
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/x-aac',
  'audio/flac',
  'audio/x-flac',
  'audio/ogg',
  'audio/x-m4a',
  'audio/mp4',
  'audio/x-matroska',
  'audio/opus',
  'audio/webm',
];

export interface ValidatedFileInfo {
  cleanFilename: string;
  mime: string;
  ext: string;
  isSvg?: boolean;
  isHeic?: boolean;
}

export async function validateAndSanitizeFile(
  buffer: Buffer,
  originalFilename: string
): Promise<ValidatedFileInfo> {
  // 1. Detect True MIME from Magic Bytes
  const detected = await fileTypeFromBuffer(buffer);

  // SVG fallback (SVGs are XML text and may not have binary magic bytes)
  const isSvgByExt = originalFilename.toLowerCase().endsWith('.svg');
  const bufferPrefix = buffer.toString('utf8', 0, Math.min(buffer.length, 500)).trim();
  const isSvgContent =
    isSvgByExt &&
    (bufferPrefix.includes('<svg') ||
      bufferPrefix.includes('<?xml') ||
      bufferPrefix.includes('<!DOCTYPE svg'));

  // HEIC / HEIF fallback detection
  const isHeic =
    detected?.mime === 'image/heic' ||
    detected?.mime === 'image/heif' ||
    originalFilename.toLowerCase().endsWith('.heic') ||
    originalFilename.toLowerCase().endsWith('.heif') ||
    buffer.toString('utf8', 4, 12).includes('ftypheic') ||
    buffer.toString('utf8', 4, 12).includes('ftypmif1') ||
    buffer.toString('utf8', 4, 12).includes('ftypmsf1') ||
    buffer.toString('utf8', 4, 12).includes('ftypheix');

  let mime = detected?.mime;
  if (isSvgContent) {
    mime = 'image/svg+xml';
  } else if (isHeic && (!mime || mime === 'application/octet-stream')) {
    mime = 'image/heic';
  }

  if (!mime || !ALLOWED_IMAGE_MIMES.includes(mime)) {
    throw new Error(
      `Unsupported or disguised file format: ${mime || 'unknown'}. Only genuine image formats are supported.`
    );
  }

  // 2. Prevent Dangerous Executables masquerading as images
  const dangerousPrefixes = ['MZ', '\x7fELF', '\xca\xfe\xba\xbe', '#!/'];
  const asciiHeader = buffer.toString('binary', 0, 4);
  if (dangerousPrefixes.some((p) => asciiHeader.startsWith(p))) {
    throw new Error('Security Error: Executable or script payload detected.');
  }

  // 3. Sanitize Filename (Prevent Directory Traversal and Null Byte Injections)
  const sanitizedOriginal = originalFilename.replace(/[\0\r\n]/g, '').trim();
  const cleanExt = path.extname(sanitizedOriginal).replace(/[^a-zA-Z0-9.]/g, '').toLowerCase() || `.${detected?.ext || (isSvgContent ? 'svg' : isHeic ? 'heic' : 'bin')}`;
  const baseName = path
    .basename(sanitizedOriginal, cleanExt)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50) || 'image';

  return {
    cleanFilename: `${baseName}${cleanExt}`,
    mime,
    ext: (detected?.ext || (isSvgContent ? 'svg' : isHeic ? 'heic' : 'bin')).toLowerCase(),
    isSvg: isSvgContent,
    isHeic,
  };
}

export async function validateAndSanitizeDocumentFile(
  buffer: Buffer,
  originalFilename: string
): Promise<ValidatedFileInfo> {
  const detected = await fileTypeFromBuffer(buffer);
  const extLower = path.extname(originalFilename).toLowerCase();

  // Text / CSV / HTML / Markdown fallbacks
  let mime = detected?.mime;
  if (!mime) {
    if (extLower === '.txt') mime = 'text/plain';
    else if (extLower === '.html' || extLower === '.htm') mime = 'text/html';
    else if (extLower === '.csv') mime = 'text/csv';
    else if (extLower === '.md') mime = 'text/markdown';
    else if (extLower === '.docx') mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else if (extLower === '.xlsx') mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    else if (extLower === '.pptx') mime = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  }

  // PDF Magic byte check (%PDF-)
  if (buffer.toString('utf8', 0, 5) === '%PDF-') {
    mime = 'application/pdf';
  }

  const allAllowed = [...ALLOWED_DOC_MIMES, ...ALLOWED_IMAGE_MIMES];
  if (!mime || !allAllowed.includes(mime)) {
    throw new Error(
      `Unsupported document format: ${mime || extLower || 'unknown'}. Supported formats include PDF, DOCX, XLSX, PPTX, TXT, HTML, JPG, and PNG.`
    );
  }

  const dangerousPrefixes = ['MZ', '\x7fELF', '\xca\xfe\xba\xbe'];
  const asciiHeader = buffer.toString('binary', 0, 4);
  if (dangerousPrefixes.some((p) => asciiHeader.startsWith(p))) {
    throw new Error('Security Error: Executable payload detected.');
  }

  const sanitizedOriginal = originalFilename.replace(/[\0\r\n]/g, '').trim();
  const cleanExt = extLower.replace(/[^a-zA-Z0-9.]/g, '') || `.${detected?.ext || 'pdf'}`;
  const baseName = path
    .basename(sanitizedOriginal, cleanExt)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50) || 'document';

  return {
    cleanFilename: `${baseName}${cleanExt}`,
    mime,
    ext: cleanExt.replace(/^\./, ''),
  };
}

export async function validateAndSanitizeArchiveFile(
  buffer: Buffer,
  originalFilename: string
): Promise<ValidatedFileInfo> {
  const detected = await fileTypeFromBuffer(buffer);
  const extLower = path.extname(originalFilename).toLowerCase();

  let mime = detected?.mime;
  if (!mime) {
    if (extLower === '.zip') mime = 'application/zip';
    else if (extLower === '.7z') mime = 'application/x-7z-compressed';
    else if (extLower === '.tar') mime = 'application/x-tar';
    else if (extLower === '.gz') mime = 'application/gzip';
    else if (extLower === '.rar') mime = 'application/x-rar-compressed';
  }

  // ZIP PK Header check (PK\x03\x04)
  if (buffer.length >= 4 && buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04) {
    mime = 'application/zip';
  }

  if (!mime || !ALLOWED_ARCHIVE_MIMES.includes(mime)) {
    throw new Error(
      `Unsupported archive format: ${mime || extLower || 'unknown'}. Supported formats: ZIP, 7Z, TAR, GZ, RAR.`
    );
  }

  const sanitizedOriginal = originalFilename.replace(/[\0\r\n]/g, '').trim();
  const cleanExt = extLower.replace(/[^a-zA-Z0-9.]/g, '') || `.${detected?.ext || 'zip'}`;
  const baseName = path
    .basename(sanitizedOriginal, cleanExt)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50) || 'archive';

  return {
    cleanFilename: `${baseName}${cleanExt}`,
    mime,
    ext: cleanExt.replace(/^\./, ''),
  };
}

export async function validateAndSanitizeMediaFile(
  buffer: Buffer,
  originalFilename: string
): Promise<ValidatedFileInfo> {
  const detected = await fileTypeFromBuffer(buffer);
  const extLower = path.extname(originalFilename).toLowerCase();

  let mime = detected?.mime;
  if (!mime) {
    if (extLower === '.mp4') mime = 'video/mp4';
    else if (extLower === '.webm') mime = 'video/webm';
    else if (extLower === '.mov') mime = 'video/quicktime';
    else if (extLower === '.avi') mime = 'video/x-msvideo';
    else if (extLower === '.mkv') mime = 'video/x-matroska';
    else if (extLower === '.wmv') mime = 'video/x-ms-wmv';
    else if (extLower === '.flv') mime = 'video/x-flv';
    else if (extLower === '.mp3') mime = 'audio/mpeg';
    else if (extLower === '.wav') mime = 'audio/wav';
    else if (extLower === '.aac') mime = 'audio/aac';
    else if (extLower === '.flac') mime = 'audio/flac';
    else if (extLower === '.ogg') mime = 'audio/ogg';
    else if (extLower === '.m4a') mime = 'audio/x-m4a';
    else if (extLower === '.opus') mime = 'audio/opus';
  }

  // Fallback checks for video/audio magic bytes
  if (!mime) {
    // MP4/MOV ftyp check
    if (buffer.length >= 12 && buffer.toString('utf8', 4, 8) === 'ftyp') {
      mime = 'video/mp4';
    }
    // WebM / Matroska EBML ID: 0x1A 0x45 0xDF 0xA3
    else if (buffer.length >= 4 && buffer[0] === 0x1a && buffer[1] === 0x45 && buffer[2] === 0xdf && buffer[3] === 0xa3) {
      mime = extLower.includes('webm') ? 'video/webm' : 'video/x-matroska';
    }
    // AVI RIFF ... AVI
    else if (buffer.length >= 12 && buffer.toString('utf8', 0, 4) === 'RIFF' && buffer.toString('utf8', 8, 12) === 'AVI ') {
      mime = 'video/x-msvideo';
    }
    // WAV RIFF ... WAVE
    else if (buffer.length >= 12 && buffer.toString('utf8', 0, 4) === 'RIFF' && buffer.toString('utf8', 8, 12) === 'WAVE') {
      mime = 'audio/wav';
    }
    // MP3 ID3 header or sync frame 0xFF 0xFB/0xF3/0xF2
    else if (buffer.length >= 3 && (buffer.toString('utf8', 0, 3) === 'ID3' || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0))) {
      mime = 'audio/mpeg';
    }
    // FLAC magic "fLaC"
    else if (buffer.length >= 4 && buffer.toString('utf8', 0, 4) === 'fLaC') {
      mime = 'audio/flac';
    }
    // OGG "OggS"
    else if (buffer.length >= 4 && buffer.toString('utf8', 0, 4) === 'OggS') {
      mime = 'audio/ogg';
    }
  }

  if (!mime || !ALLOWED_MEDIA_MIMES.includes(mime)) {
    throw new Error(
      `Unsupported media format: ${mime || extLower || 'unknown'}. Supported formats include MP4, WebM, MOV, AVI, MKV, WMV, FLV, MP3, WAV, AAC, FLAC, OGG, and M4A.`
    );
  }

  const dangerousPrefixes = ['MZ', '\x7fELF', '\xca\xfe\xba\xbe'];
  const asciiHeader = buffer.toString('binary', 0, 4);
  if (dangerousPrefixes.some((p) => asciiHeader.startsWith(p))) {
    throw new Error('Security Error: Executable payload detected.');
  }

  const sanitizedOriginal = originalFilename.replace(/[\0\r\n]/g, '').trim();
  const cleanExt = extLower.replace(/[^a-zA-Z0-9.]/g, '') || `.${detected?.ext || 'mp4'}`;
  const baseName = path
    .basename(sanitizedOriginal, cleanExt)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 60) || 'media';

  return {
    cleanFilename: `${baseName}${cleanExt}`,
    mime,
    ext: cleanExt.replace(/^\./, ''),
  };
}
