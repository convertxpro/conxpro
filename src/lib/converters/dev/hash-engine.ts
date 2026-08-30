import CryptoJS from 'crypto-js';
import { keccak256 } from 'js-sha3';

export interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
  description?: string;
}

export type SupportedFileHashAlgorithm = 'SHA-256' | 'SHA-1' | 'SHA-512' | 'SHA-384' | 'MD5' | 'Keccak-256';

export const HASH_DESCRIPTIONS: Record<string, string> = {
  'MD5': '128-bit legacy checksum; popular for quick legacy integrity checks.',
  'SHA-1': '160-bit hash; widely used in Git commits and legacy SSL certificates.',
  'SHA-256': '256-bit NIST standard; industry default for software checksums & Bitcoin.',
  'SHA-384': '384-bit high-security NIST hash; common in TLS 1.3 & FIPS environments.',
  'SHA-512': '512-bit maximum security hash; optimal for 64-bit architectures.',
  'Keccak-256': 'Original Keccak-256 algorithm used by Ethereum (ETH) smart contracts.',
  'HMAC-MD5': 'Keyed-Hash Message Authentication Code using MD5.',
  'HMAC-SHA1': 'Keyed-Hash Message Authentication Code using SHA-1.',
  'HMAC-SHA256': 'Keyed-Hash Message Authentication Code using SHA-256; standard for JWT and API signatures.',
  'HMAC-SHA384': 'Keyed-Hash Message Authentication Code using SHA-384.',
  'HMAC-SHA512': 'Keyed-Hash Message Authentication Code using SHA-512.',
};

export function computeTextHashes(text: string, hmacSecret?: string): HashResult[] {
  if (!text) return [];

  const secret = hmacSecret?.trim();

  if (secret && secret.length > 0) {
    return [
      {
        algorithm: 'HMAC-SHA256',
        hash: CryptoJS.HmacSHA256(text, secret).toString(),
        length: 64,
        description: HASH_DESCRIPTIONS['HMAC-SHA256'],
      },
      {
        algorithm: 'HMAC-SHA512',
        hash: CryptoJS.HmacSHA512(text, secret).toString(),
        length: 128,
        description: HASH_DESCRIPTIONS['HMAC-SHA512'],
      },
      {
        algorithm: 'HMAC-SHA384',
        hash: CryptoJS.HmacSHA384(text, secret).toString(),
        length: 96,
        description: HASH_DESCRIPTIONS['HMAC-SHA384'],
      },
      {
        algorithm: 'HMAC-SHA1',
        hash: CryptoJS.HmacSHA1(text, secret).toString(),
        length: 40,
        description: HASH_DESCRIPTIONS['HMAC-SHA1'],
      },
      {
        algorithm: 'HMAC-MD5',
        hash: CryptoJS.HmacMD5(text, secret).toString(),
        length: 32,
        description: HASH_DESCRIPTIONS['HMAC-MD5'],
      },
    ];
  }

  return [
    {
      algorithm: 'SHA-256',
      hash: CryptoJS.SHA256(text).toString(),
      length: 64,
      description: HASH_DESCRIPTIONS['SHA-256'],
    },
    {
      algorithm: 'SHA-512',
      hash: CryptoJS.SHA512(text).toString(),
      length: 128,
      description: HASH_DESCRIPTIONS['SHA-512'],
    },
    {
      algorithm: 'Keccak-256',
      hash: keccak256(text),
      length: 64,
      description: HASH_DESCRIPTIONS['Keccak-256'],
    },
    {
      algorithm: 'SHA-384',
      hash: CryptoJS.SHA384(text).toString(),
      length: 96,
      description: HASH_DESCRIPTIONS['SHA-384'],
    },
    {
      algorithm: 'SHA-1',
      hash: CryptoJS.SHA1(text).toString(),
      length: 40,
      description: HASH_DESCRIPTIONS['SHA-1'],
    },
    {
      algorithm: 'MD5',
      hash: CryptoJS.MD5(text).toString(),
      length: 32,
      description: HASH_DESCRIPTIONS['MD5'],
    },
  ];
}

/**
 * Computes hash of a large File in a streaming/chunked fashion to prevent browser memory crashes (up to 2GB+)
 */
export async function computeFileChecksumStreaming(
  file: File,
  algorithm: SupportedFileHashAlgorithm = 'SHA-256',
  onProgress?: (percent: number, processedBytes: number, totalBytes: number) => void
): Promise<string> {
  // If file is under 64MB and Web Crypto subtle is available for standard SHA algorithms, use native hardware acceleration
  const subtle = typeof window !== 'undefined' ? window.crypto?.subtle : globalThis.crypto?.subtle;
  const webCryptoAlgoMap: Record<string, string> = {
    'SHA-256': 'SHA-256',
    'SHA-1': 'SHA-1',
    'SHA-384': 'SHA-384',
    'SHA-512': 'SHA-512',
  };

  if (file.size <= 64 * 1024 * 1024 && subtle && webCryptoAlgoMap[algorithm]) {
    if (onProgress) onProgress(10, 0, file.size);
    const buffer = await file.arrayBuffer();
    if (onProgress) onProgress(50, Math.floor(file.size / 2), file.size);
    const hashBuffer = await subtle.digest(webCryptoAlgoMap[algorithm], buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const result = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    if (onProgress) onProgress(100, file.size, file.size);
    return result;
  }

  // Chunked streaming pipeline for large files and MD5 / Keccak
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024; // 2MB chunks
    const totalBytes = file.size;
    const totalChunks = Math.max(1, Math.ceil(totalBytes / chunkSize));
    let currentChunk = 0;
    let processedBytes = 0;

    let hasher: any;
    if (algorithm === 'MD5') {
      hasher = CryptoJS.algo.MD5.create();
    } else if (algorithm === 'SHA-1') {
      hasher = CryptoJS.algo.SHA1.create();
    } else if (algorithm === 'SHA-256') {
      hasher = CryptoJS.algo.SHA256.create();
    } else if (algorithm === 'SHA-384') {
      hasher = CryptoJS.algo.SHA384.create();
    } else if (algorithm === 'SHA-512') {
      hasher = CryptoJS.algo.SHA512.create();
    } else if (algorithm === 'Keccak-256') {
      const keccakHasher = keccak256.create();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          const buffer = e.target.result as ArrayBuffer;
          keccakHasher.update(buffer);
          currentChunk++;
          processedBytes += buffer.byteLength;
          if (onProgress) {
            const percent = Math.min(100, Math.round((currentChunk / totalChunks) * 100));
            onProgress(percent, processedBytes, totalBytes);
          }

          if (currentChunk < totalChunks) {
            loadNext();
          } else {
            resolve(keccakHasher.hex());
          }
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file chunk for Keccak checksum'));

      const loadNext = () => {
        const start = currentChunk * chunkSize;
        const end = Math.min(start + chunkSize, totalBytes);
        reader.readAsArrayBuffer(file.slice(start, end));
      };

      loadNext();
      return;
    } else {
      hasher = CryptoJS.algo.SHA256.create();
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        const arrayBuffer = e.target.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any);
        hasher.update(wordArray);
        currentChunk++;
        processedBytes += arrayBuffer.byteLength;

        if (onProgress) {
          const percent = Math.min(100, Math.round((currentChunk / totalChunks) * 100));
          onProgress(percent, processedBytes, totalBytes);
        }

        if (currentChunk < totalChunks) {
          loadNext();
        } else {
          const hash = hasher.finalize().toString();
          resolve(hash);
        }
      }
    };

    reader.onerror = () => reject(new Error(`Failed to read file chunk for ${algorithm} checksum`));

    const loadNext = () => {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, totalBytes);
      reader.readAsArrayBuffer(file.slice(start, end));
    };

    loadNext();
  });
}
