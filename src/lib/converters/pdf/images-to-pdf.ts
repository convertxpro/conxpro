import { PDFDocument, PageSizes } from 'pdf-lib';
import sharp from 'sharp';

export interface ImageInputItem {
  buffer: Buffer;
  mime?: string;
  name?: string;
}

export interface ImagesToPdfOptions {
  pageSize?: 'A4' | 'Letter' | 'Fit';
  orientation?: 'portrait' | 'landscape' | 'auto';
  margin?: number;
  quality?: number;
}

/**
 * Compile multiple images (JPG, PNG, WebP, HEIC, TIFF) into a unified PDF document
 */
export async function compileImagesToPdf(
  images: ImageInputItem[],
  options: ImagesToPdfOptions = {}
): Promise<Buffer> {
  if (!images || images.length === 0) {
    throw new Error('At least one image is required to compile a PDF.');
  }

  const { pageSize = 'A4', orientation = 'auto', margin = 20, quality = 90 } = options;
  const pdfDoc = await PDFDocument.create();

  for (const imgItem of images) {
    let normalizedBuffer = imgItem.buffer;
    let isPng = false;

    // Use sharp to get metadata, rotate correctly by EXIF, and convert non-JPG/PNG formats
    try {
      const metadata = await sharp(imgItem.buffer).metadata();
      
      if (metadata.format === 'png' && metadata.hasAlpha) {
        // Keep PNG for transparency
        normalizedBuffer = await sharp(imgItem.buffer).rotate().png().toBuffer();
        isPng = true;
      } else {
        // Standardize as high quality JPEG
        normalizedBuffer = await sharp(imgItem.buffer)
          .rotate()
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
        isPng = false;
      }
    } catch (err) {
      console.warn('Image processing via sharp failed, attempting raw embed:', err);
    }

    let embeddedImage;
    if (isPng) {
      embeddedImage = await pdfDoc.embedPng(normalizedBuffer);
    } else {
      embeddedImage = await pdfDoc.embedJpg(normalizedBuffer);
    }

    const imgWidth = embeddedImage.width;
    const imgHeight = embeddedImage.height;

    let targetPageWidth: number;
    let targetPageHeight: number;

    if (pageSize === 'Fit') {
      targetPageWidth = imgWidth + margin * 2;
      targetPageHeight = imgHeight + margin * 2;
    } else {
      const standardSize = pageSize === 'Letter' ? PageSizes.Letter : PageSizes.A4;
      const isImgLandscape = imgWidth > imgHeight;
      const pageIsLandscape =
        orientation === 'landscape' || (orientation === 'auto' && isImgLandscape);

      targetPageWidth = pageIsLandscape ? Math.max(standardSize[0], standardSize[1]) : Math.min(standardSize[0], standardSize[1]);
      targetPageHeight = pageIsLandscape ? Math.min(standardSize[0], standardSize[1]) : Math.max(standardSize[0], standardSize[1]);
    }

    const page = pdfDoc.addPage([targetPageWidth, targetPageHeight]);

    // Calculate scaled image dimensions maintaining aspect ratio
    const maxWidth = targetPageWidth - margin * 2;
    const maxHeight = targetPageHeight - margin * 2;
    const widthScale = maxWidth / imgWidth;
    const heightScale = maxHeight / imgHeight;
    const scale = Math.min(widthScale, heightScale, 1.0); // Don't upscale beyond original

    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;

    // Center image on the page
    const drawX = margin + (maxWidth - drawWidth) / 2;
    const drawY = margin + (maxHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
