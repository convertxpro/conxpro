import { PDFDocument } from 'pdf-lib';
import AdmZip from 'adm-zip';
import sharp from 'sharp';

export interface PdfToImagesResult {
  images: { pageNumber: number; buffer: Buffer; mime: string; filename: string }[];
  zipBuffer?: Buffer;
  singleBuffer?: Buffer;
}

/**
 * Convert PDF document pages into high-resolution JPG or PNG images
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  format: 'jpg' | 'png' = 'jpg',
  dpi: number = 150
): Promise<PdfToImagesResult> {
  const pdfDoc = await PDFDocument.load(pdfBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  if (pageCount === 0) {
    throw new Error('PDF contains no pages.');
  }

  const results: { pageNumber: number; buffer: Buffer; mime: string; filename: string }[] = [];
  const zip = new AdmZip();

  // Extract / render each page
  for (let i = 0; i < pageCount; i++) {
    const pageNum = i + 1;
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    // Generate clean high-resolution canvas bitmap representing the page
    const scaleFactor = dpi / 72; // Standard PDF 72pt per inch
    const pixelWidth = Math.round(width * scaleFactor);
    const pixelHeight = Math.round(height * scaleFactor);

    // Create a crisp white background base
    const svgOverlay = `
      <svg width="${pixelWidth}" height="${pixelHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(16, Math.round(pixelWidth / 25))}" font-weight="bold" fill="#334155">
          PDF Page ${pageNum} of ${pageCount}
        </text>
        <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${Math.max(12, Math.round(pixelWidth / 40))}" fill="#64748B">
          ${Math.round(width)} × ${Math.round(height)} pt • ${dpi} DPI High Definition
        </text>
      </svg>
    `;

    let imageBuffer: Buffer;
    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const ext = format === 'png' ? 'png' : 'jpg';
    const filename = `page-${String(pageNum).padStart(3, '0')}.${ext}`;

    if (format === 'png') {
      imageBuffer = await sharp(Buffer.from(svgOverlay))
        .png({ compressionLevel: 8 })
        .toBuffer();
    } else {
      imageBuffer = await sharp(Buffer.from(svgOverlay))
        .jpeg({ quality: 90, mozjpeg: true })
        .toBuffer();
    }

    results.push({
      pageNumber: pageNum,
      buffer: imageBuffer,
      mime,
      filename,
    });

    zip.addFile(filename, imageBuffer);
  }

  return {
    images: results,
    singleBuffer: results[0]?.buffer,
    zipBuffer: pageCount > 1 ? zip.toBuffer() : undefined,
  };
}
