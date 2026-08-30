import AdmZip from 'adm-zip';

export interface ArchiveEntryInfo {
  entryName: string;
  name: string;
  isDirectory: boolean;
  size: number;
  compressedSize: number;
}

export interface ExtractedArchiveResult {
  entries: ArchiveEntryInfo[];
  totalFiles: number;
  totalSizeBytes: number;
  files: { name: string; buffer: Buffer }[];
}

/**
 * Inspect and extract contents of a ZIP archive package
 */
export async function inspectAndExtractArchive(
  archiveBuffer: Buffer
): Promise<ExtractedArchiveResult> {
  const zip = new AdmZip(archiveBuffer);
  const zipEntries = zip.getEntries();

  const entries: ArchiveEntryInfo[] = [];
  const files: { name: string; buffer: Buffer }[] = [];
  let totalSizeBytes = 0;

  for (const entry of zipEntries) {
    const entryInfo: ArchiveEntryInfo = {
      entryName: entry.entryName,
      name: entry.name,
      isDirectory: entry.isDirectory,
      size: entry.header.size,
      compressedSize: entry.header.compressedSize,
    };

    entries.push(entryInfo);

    if (!entry.isDirectory) {
      totalSizeBytes += entry.header.size;
      const fileBuffer = entry.getData();
      files.push({
        name: entry.entryName,
        buffer: fileBuffer,
      });
    }
  }

  return {
    entries,
    totalFiles: files.length,
    totalSizeBytes,
    files,
  };
}
