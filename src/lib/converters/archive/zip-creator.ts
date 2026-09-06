import AdmZip from 'adm-zip';

export interface ZipFileInput {
  name: string;
  buffer: Buffer;
}

export interface ZipCreatorOptions {
  compressionLevel?: number; // 0 to 9
  comment?: string;
}

/**
 * Bundle multiple files into a high-efficiency ZIP archive stream using AdmZip
 */
export async function createZipArchive(
  files: ZipFileInput[],
  options: ZipCreatorOptions = {}
): Promise<Buffer> {
  if (!files || files.length === 0) {
    throw new Error('At least one file is required to create a ZIP archive.');
  }

  const zip = new AdmZip();
  const comment = options.comment || 'Created with ApexTools (Free Online Converter)';

  if (comment) {
    zip.addZipComment(comment);
  }

  for (const file of files) {
    zip.addFile(file.name, file.buffer);
  }

  return zip.toBuffer();
}
