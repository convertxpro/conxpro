import libre from 'libreoffice-convert';
import { convertWithFallback } from './cloud-fallback';

export type OfficeTargetFormat = 'pdf' | 'docx' | 'xlsx' | 'pptx' | 'txt' | 'html';

export async function convertOfficeDocument(
  inputBuffer: Buffer,
  targetFormat: OfficeTargetFormat,
  sourceFormat: string = 'docx'
): Promise<Buffer> {
  // Check if libreoffice-convert works, otherwise cleanly fall back
  try {
    const converted = await new Promise<Buffer>((resolve, reject) => {
      libre.convert(inputBuffer, `.${targetFormat}`, undefined, (err, done) => {
        if (err) return reject(err);
        resolve(done);
      });
    });
    return converted;
  } catch (error) {
    return await convertWithFallback(inputBuffer, sourceFormat, targetFormat);
  }
}
