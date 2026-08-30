import fs from 'fs';
import path from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';
import { createAdminClient } from '@/lib/supabase/admin';
import { ConversionJob } from '@/lib/supabase/types';

export interface StoredFileRecord {
  jobId: string;
  downloadToken: string;
  originalFilename: string;
  targetFilename: string;
  mime: string;
  targetFormat: string;
  sourceFormat: string;
  originalSizeBytes: number;
  convertedSizeBytes: number;
  filePath: string;
  createdAt: number;
  expiresAt: number;
}

// Base temporary directories
const BASE_TEMP_DIR = path.join(os.tmpdir(), 'converthub');
const UPLOADS_DIR = path.join(BASE_TEMP_DIR, 'uploads');
const CONVERTED_DIR = path.join(BASE_TEMP_DIR, 'converted');
const INDEX_FILE = path.join(BASE_TEMP_DIR, 'tokens-index.json');

// Ensure directories exist
function ensureDirs() {
  try {
    if (!fs.existsSync(BASE_TEMP_DIR)) fs.mkdirSync(BASE_TEMP_DIR, { recursive: true });
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    if (!fs.existsSync(CONVERTED_DIR)) fs.mkdirSync(CONVERTED_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating temp directories:', err);
  }
}

ensureDirs();

// Persistent Global Token Store across Next.js route chunks
const globalStorage = globalThis as unknown as {
  __converthub_token_store?: Map<string, StoredFileRecord>;
};

if (!globalStorage.__converthub_token_store) {
  globalStorage.__converthub_token_store = new Map<string, StoredFileRecord>();
}

const tokenStore = globalStorage.__converthub_token_store;

// Helper to write to disk index
function persistTokenToDisk(token: string, record: StoredFileRecord) {
  try {
    let indexData: Record<string, StoredFileRecord> = {};
    if (fs.existsSync(INDEX_FILE)) {
      const content = fs.readFileSync(INDEX_FILE, 'utf8');
      indexData = JSON.parse(content || '{}');
    }
    indexData[token] = record;
    fs.writeFileSync(INDEX_FILE, JSON.stringify(indexData, null, 2), 'utf8');
  } catch (e) {
    // Ignore index disk write errors
  }
}

function readTokenFromDisk(token: string): StoredFileRecord | null {
  try {
    if (fs.existsSync(INDEX_FILE)) {
      const content = fs.readFileSync(INDEX_FILE, 'utf8');
      const indexData = JSON.parse(content || '{}');
      return indexData[token] || null;
    }
  } catch (e) {}
  return null;
}

export class TempStorageManager {
  /**
   * Save an uploaded input file to disk
   */
  static async saveUpload(
    buffer: Buffer,
    filename: string,
    jobId: string = uuidv4()
  ): Promise<{ jobId: string; filePath: string }> {
    ensureDirs();
    const safeName = `${jobId}-${filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    await fs.promises.writeFile(filePath, buffer);
    return { jobId, filePath };
  }

  /**
   * Save a converted output file to disk and generate a secure download token
   */
  static async saveConverted(
    buffer: Buffer,
    params: {
      jobId?: string;
      originalFilename: string;
      targetFilename: string;
      mime: string;
      targetFormat: string;
      sourceFormat: string;
      originalSizeBytes: number;
      userId?: string | null;
      ipHash?: string | null;
      ttlHours?: number;
    }
  ): Promise<StoredFileRecord> {
    ensureDirs();
    const jobId = params.jobId || uuidv4();
    const downloadToken = uuidv4();
    const ttlHours = params.ttlHours || 2;
    const now = Date.now();
    const expiresAt = now + ttlHours * 60 * 60 * 1000;

    // Use both token and jobId in the filename for foolproof lookup
    const safeTargetName = `${downloadToken}-${jobId}-${params.targetFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(CONVERTED_DIR, safeTargetName);

    await fs.promises.writeFile(filePath, buffer);

    const record: StoredFileRecord = {
      jobId,
      downloadToken,
      originalFilename: params.originalFilename,
      targetFilename: params.targetFilename,
      mime: params.mime,
      targetFormat: params.targetFormat,
      sourceFormat: params.sourceFormat,
      originalSizeBytes: params.originalSizeBytes,
      convertedSizeBytes: buffer.length,
      filePath,
      createdAt: now,
      expiresAt,
    };

    tokenStore.set(downloadToken, record);
    persistTokenToDisk(downloadToken, record);

    // Only persist metadata to Supabase if real credentials configured
    const hasRealSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (hasRealSupabase) {
      try {
        const supabase = createAdminClient();
        await (supabase.from('conversion_jobs') as any).insert({
          id: jobId,
          user_id: params.userId || null,
          ip_hash: params.ipHash || null,
          tool_type: `${params.sourceFormat}-to-${params.targetFormat}`,
          source_format: params.sourceFormat,
          target_format: params.targetFormat,
          file_size_bytes: buffer.length,
          status: 'completed',
          download_token: downloadToken,
          expires_at: new Date(expiresAt).toISOString(),
        });
      } catch (err) {
        console.warn('Could not record conversion job in Supabase:', err);
      }
    }

    return record;
  }

  /**
   * Retrieve file record by download token
   */
  static async getByToken(token: string): Promise<StoredFileRecord | null> {
    if (!token) return null;

    // 1. Check in-memory global index
    const cached = tokenStore.get(token);
    if (cached) {
      if (cached.expiresAt < Date.now()) {
        await this.deleteFileRecord(token);
        return null;
      }
      if (fs.existsSync(cached.filePath)) {
        return cached;
      }
    }

    // 2. Check disk JSON index
    const diskRecord = readTokenFromDisk(token);
    if (diskRecord) {
      if (diskRecord.expiresAt < Date.now()) {
        await this.deleteFileRecord(token);
        return null;
      }
      if (fs.existsSync(diskRecord.filePath)) {
        tokenStore.set(token, diskRecord);
        return diskRecord;
      }
    }

    // 3. Check directly in CONVERTED_DIR for matching file prefix
    try {
      if (fs.existsSync(CONVERTED_DIR)) {
        const files = await fs.promises.readdir(CONVERTED_DIR);
        const matched = files.find((f) => f.startsWith(token));
        if (matched) {
          const filePath = path.join(CONVERTED_DIR, matched);
          const ext = path.extname(matched).replace(/^\./, '') || 'bin';
          const mime = getMimeForFormat(ext);
          const cleanTargetName = matched.substring(matched.indexOf('-', token.length + 1) + 1) || matched;

          const record: StoredFileRecord = {
            jobId: token,
            downloadToken: token,
            originalFilename: cleanTargetName,
            targetFilename: cleanTargetName,
            mime,
            targetFormat: ext,
            sourceFormat: 'bin',
            originalSizeBytes: (await fs.promises.stat(filePath)).size,
            convertedSizeBytes: (await fs.promises.stat(filePath)).size,
            filePath,
            createdAt: Date.now(),
            expiresAt: Date.now() + 2 * 60 * 60 * 1000,
          };
          tokenStore.set(token, record);
          persistTokenToDisk(token, record);
          return record;
        }
      }
    } catch (err) {
      console.warn('Error reading converted dir:', err);
    }

    // 4. Fallback check from Supabase if real supabase is configured
    const hasRealSupabase =
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

    if (hasRealSupabase) {
      try {
        const supabase = createAdminClient();
        const { data } = await (supabase.from('conversion_jobs') as any)
          .select('*')
          .eq('download_token', token)
          .eq('status', 'completed')
          .single();

        const job = data as ConversionJob | null;

        if (job) {
          const expiresTime = new Date(job.expires_at).getTime();
          if (expiresTime < Date.now()) return null;

          const files = await fs.promises.readdir(CONVERTED_DIR);
          const matched = files.find((f) => f.includes(job.id) || f.startsWith(token));
          if (matched) {
            const filePath = path.join(CONVERTED_DIR, matched);
            const mime = getMimeForFormat(job.target_format || 'jpg');
            const targetFilename = `converted-${job.id}.${job.target_format || 'jpg'}`;

            const record: StoredFileRecord = {
              jobId: job.id,
              downloadToken: token,
              originalFilename: `original.${job.source_format || 'bin'}`,
              targetFilename,
              mime,
              targetFormat: job.target_format || 'jpg',
              sourceFormat: job.source_format || 'bin',
              originalSizeBytes: job.file_size_bytes || 0,
              convertedSizeBytes: (await fs.promises.stat(filePath)).size,
              filePath,
              createdAt: new Date(job.created_at).getTime(),
              expiresAt: expiresTime,
            };
            tokenStore.set(token, record);
            persistTokenToDisk(token, record);
            return record;
          }
        }
      } catch (err) {
        console.warn('Error fetching token record from Supabase:', err);
      }
    }

    return null;
  }

  /**
   * Remove a single record and its file from disk
   */
  static async deleteFileRecord(token: string) {
    const record = tokenStore.get(token) || readTokenFromDisk(token);
    if (record) {
      tokenStore.delete(token);
      try {
        if (fs.existsSync(record.filePath)) {
          await fs.promises.unlink(record.filePath);
        }
      } catch (err) {
        console.warn(`Failed to unlink file ${record.filePath}:`, err);
      }
    }
  }

  /**
   * Purge all expired files (older than expiresAt) from both /uploads and /converted
   */
  static async purgeExpiredFiles(): Promise<{ purgedTokens: number; purgedFiles: number }> {
    ensureDirs();
    const now = Date.now();
    let purgedTokens = 0;
    let purgedFiles = 0;

    for (const [token, record] of Array.from(tokenStore.entries())) {
      if (record.expiresAt < now) {
        tokenStore.delete(token);
        purgedTokens++;
        try {
          if (fs.existsSync(record.filePath)) {
            await fs.promises.unlink(record.filePath);
            purgedFiles++;
          }
        } catch (err) {
          console.warn(`Error deleting file ${record.filePath}:`, err);
        }
      }
    }

    const MAX_AGE_MS = 2 * 60 * 60 * 1000;
    const dirs = [UPLOADS_DIR, CONVERTED_DIR];

    for (const dir of dirs) {
      try {
        if (!fs.existsSync(dir)) continue;
        const files = await fs.promises.readdir(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          try {
            const stats = await fs.promises.stat(filePath);
            const age = now - stats.mtimeMs;
            if (age > MAX_AGE_MS) {
              await fs.promises.unlink(filePath);
              purgedFiles++;
            }
          } catch {}
        }
      } catch (err) {
        console.warn(`Error reading dir ${dir} for purge:`, err);
      }
    }

    return { purgedTokens, purgedFiles };
  }
}

export function getMimeForFormat(format: string): string {
  const f = format.toLowerCase().replace(/^\./, '');
  switch (f) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'bmp':
      return 'image/bmp';
    case 'tiff':
    case 'tif':
      return 'image/tiff';
    case 'ico':
      return 'image/x-icon';
    case 'svg':
      return 'image/svg+xml';
    case 'avif':
      return 'image/avif';
    case 'heic':
      return 'image/heic';
    case 'heif':
      return 'image/heif';
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'zip':
      return 'application/zip';
    case '7z':
      return 'application/x-7z-compressed';
    case 'tar':
      return 'application/x-tar';
    case 'gz':
      return 'application/gzip';
    case 'rar':
      return 'application/x-rar-compressed';
    case 'txt':
      return 'text/plain';
    case 'html':
      return 'text/html';
    case 'csv':
      return 'text/csv';
    case 'mp4':
    case 'm4v':
      return 'video/mp4';
    case 'webm':
      return 'video/webm';
    case 'mov':
      return 'video/quicktime';
    case 'avi':
      return 'video/x-msvideo';
    case 'mkv':
      return 'video/x-matroska';
    case 'wmv':
      return 'video/x-ms-wmv';
    case 'flv':
      return 'video/x-flv';
    case 'mp3':
      return 'audio/mpeg';
    case 'wav':
      return 'audio/wav';
    case 'aac':
      return 'audio/aac';
    case 'flac':
      return 'audio/flac';
    case 'ogg':
    case 'oga':
      return 'audio/ogg';
    case 'm4a':
      return 'audio/x-m4a';
    case 'opus':
      return 'audio/opus';
    default:
      return 'application/octet-stream';
  }
}
