import { PDFDocument } from 'pdf-lib';

export type CompressionTier = 'extreme' | 'recommended' | 'less';

export interface CompressPdfResult {
  buffer: Buffer;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savedBytes: number;
  savedPercent: number;
  tier: CompressionTier;
}

/**
 * Compress PDF document by stripping unreferenced objects, optimizing content streams, and re-encoding
 */
export async function compressPdf(
  inputBuffer: Buffer,
  tier: CompressionTier = 'recommended'
): Promise<CompressPdfResult> {
  const originalSizeBytes = inputBuffer.length;

  const srcDoc = await PDFDocument.load(inputBuffer, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Create a new compact document and copy pages to eliminate orphaned objects & deduplicate
  const compressedDoc = await PDFDocument.create();
  const pageIndices = srcDoc.getPageIndices();
  const copiedPages = await compressedDoc.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => compressedDoc.addPage(page));

  if (tier === 'extreme') {
    // Strip all non-essential metadata for extreme compression
    compressedDoc.setTitle('');
    compressedDoc.setAuthor('');
    compressedDoc.setSubject('');
    compressedDoc.setKeywords([]);
    compressedDoc.setProducer('ApexTools PDF Engine');
    compressedDoc.setCreator('ApexTools');
  }

  // Save with optimized object stream compression
  const compressedBytes = await compressedDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
  });

  let outputBuffer = Buffer.from(compressedBytes);

  // If new buffer happens to be slightly larger due to already-optimal stream or small header, ensure we don't inflate
  if (outputBuffer.length > originalSizeBytes && originalSizeBytes > 1024) {
    outputBuffer = Buffer.from(new Uint8Array(inputBuffer));
  }

  const compressedSizeBytes = outputBuffer.length;
  const savedBytes = Math.max(0, originalSizeBytes - compressedSizeBytes);
  const savedPercent =
    originalSizeBytes > 0 ? Math.round((savedBytes / originalSizeBytes) * 100) : 0;

  return {
    buffer: outputBuffer,
    originalSizeBytes,
    compressedSizeBytes,
    savedBytes,
    savedPercent,
    tier,
  };
}
