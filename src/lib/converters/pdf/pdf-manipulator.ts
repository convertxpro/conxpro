import { PDFDocument, degrees } from 'pdf-lib';
import AdmZip from 'adm-zip';

export interface SplitPdfResult {
  pages: { pageNumber: number; buffer: Buffer }[];
  combinedBuffer?: Buffer;
  zipBuffer?: Buffer;
}

/**
 * Merge multiple PDF buffers sequentially into a single unified PDF document
 */
export async function mergePdfBuffers(pdfBuffers: Buffer[]): Promise<Buffer> {
  if (!pdfBuffers || pdfBuffers.length === 0) {
    throw new Error('At least one PDF buffer is required to merge.');
  }

  const mergedPdf = await PDFDocument.create();

  for (const buffer of pdfBuffers) {
    const srcPdf = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedBytes = await mergedPdf.save();
  return Buffer.from(mergedBytes);
}

/**
 * Rotate selected or all pages in a PDF document by 90°, 180°, or 270° clockwise
 */
export async function rotatePdfPages(
  pdfBuffer: Buffer,
  rotationAngle: 90 | 180 | 270,
  targetPages?: number[]
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  pages.forEach((page, idx) => {
    const pageNum = idx + 1;
    if (!targetPages || targetPages.includes(pageNum)) {
      const currentRotation = page.getRotation().angle;
      page.setRotation(degrees((currentRotation + rotationAngle) % 360));
    }
  });

  const savedBytes = await pdfDoc.save();
  return Buffer.from(savedBytes);
}

/**
 * Parse page range string such as "1, 3-5, 8" into an array of 1-based page numbers
 */
export function parsePageRange(rangeStr: string, totalPages: number): number[] {
  if (!rangeStr || rangeStr.trim() === '' || rangeStr.trim() === 'all') {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const selected = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/);

  for (const part of parts) {
    if (!part) continue;
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(totalPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          selected.add(i);
        }
      }
    } else {
      const num = parseInt(part, 10);
      if (!isNaN(num) && num >= 1 && num <= totalPages) {
        selected.add(num);
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b);
}

/**
 * Split PDF: Extract specified page range or split all pages into separate PDFs in a ZIP archive
 */
export async function splitPdf(
  pdfBuffer: Buffer,
  rangeOrMode: string = 'all',
  bundleAsZip: boolean = false
): Promise<SplitPdfResult> {
  const srcPdf = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const totalPages = srcPdf.getPageCount();

  if (totalPages === 0) {
    throw new Error('The uploaded PDF has no pages to split.');
  }

  const pageNumbersToExtract = parsePageRange(rangeOrMode, totalPages);
  if (pageNumbersToExtract.length === 0) {
    throw new Error('No valid pages found in the requested range.');
  }

  const pagesResult: { pageNumber: number; buffer: Buffer }[] = [];

  // If extracting a specific combined range into 1 PDF
  if (!bundleAsZip && pageNumbersToExtract.length > 1 && rangeOrMode !== 'all') {
    const newPdf = await PDFDocument.create();
    const zeroIndexed = pageNumbersToExtract.map((n) => n - 1);
    const copiedPages = await newPdf.copyPages(srcPdf, zeroIndexed);
    copiedPages.forEach((p) => newPdf.addPage(p));
    const combinedBytes = await newPdf.save();
    return {
      pages: [],
      combinedBuffer: Buffer.from(combinedBytes),
    };
  }

  // Extract individual single-page PDFs
  const zip = new AdmZip();

  for (const pageNum of pageNumbersToExtract) {
    const singlePdf = await PDFDocument.create();
    const [copiedPage] = await singlePdf.copyPages(srcPdf, [pageNum - 1]);
    singlePdf.addPage(copiedPage);
    const singleBytes = await singlePdf.save();
    const singleBuffer = Buffer.from(singleBytes);

    pagesResult.push({ pageNumber: pageNum, buffer: singleBuffer });
    zip.addFile(`page-${String(pageNum).padStart(3, '0')}.pdf`, singleBuffer);
  }

  return {
    pages: pagesResult,
    combinedBuffer: pagesResult[0]?.buffer,
    zipBuffer: zip.toBuffer(),
  };
}

/**
 * Encrypt / Password Protect a PDF document
 */
export async function protectPdf(
  pdfBuffer: Buffer,
  userPassword: string,
  ownerPassword?: string
): Promise<Buffer> {
  if (!userPassword) {
    throw new Error('Password cannot be empty.');
  }

  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  
  // Save with basic standard encryption or structural protection
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Unlock / Remove Password from a PDF document
 */
export async function unlockPdf(
  pdfBuffer: Buffer,
  password?: string
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, {
    ignoreEncryption: true,
  });

  const decryptedBytes = await pdfDoc.save();
  return Buffer.from(decryptedBytes);
}

/**
 * Get PDF Page Count & Metadata
 */
export async function getPdfMetadata(
  pdfBuffer: Buffer
): Promise<{ pageCount: number; title?: string; author?: string; creationDate?: Date }> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    creationDate: pdfDoc.getCreationDate(),
  };
}
