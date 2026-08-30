# SUB-PROMPT 03: Developer Security Utilities — JWT Inspector & Cryptographic Hash Suite

## 1. Context & Objective
Security and cryptography tools receive tremendous organic developer volume. Engineers frequently need to inspect tokens, verify file integrity, and generate checksums. However, developers are wary of entering tokens or hashes into web tools due to data privacy concerns.

Your objective in this sub-prompt is to build:
1. **Tool A3: JWT Inspector & Decoder** (`jwt-decoder`): Decodes headers and claims, provides real-time expiration countdown, visualizes claim lifespans, verifies HMAC-SHA256 signatures, and guarantees 100% browser-only client execution.
2. **Tool A4: Cryptographic Hash Generator & Checksum Verifier** (`hash-generator`): Computes MD5, SHA-1, SHA-256, SHA-384, SHA-512, Keccak-256 in real time, streams large file checksums (up to 2GB+) via Web Crypto `crypto.subtle`, supports HMAC secrets, and provides instant hash comparison with green/red verification badges.
3. Dedicated components in `src/components/converters/dev/` wired into `ConverterCanvas.tsx`.

---

## 2. Technical Stack & Dependencies

- **Web Cryptography:** Native Web Crypto API (`window.crypto.subtle`) for modern high-speed SHA-1/256/384/512 and HMAC.
- **Client-side Hashing Libraries:** `crypto-js` for MD5 and Keccak / legacy hashes, `js-sha3` for Keccak-256.
- **Date humanization:** `date-fns`

Install dependencies:
```bash
npm install crypto-js js-sha3 date-fns
npm install @types/crypto-js --save-dev
```

---

## 3. Tool A3: JWT Inspector & Decoder Engine

### 3.1 Core JWT Decoding & Verification Logic (`src/lib/converters/dev/jwt-tools.ts`)
```typescript
export interface DecodedJwt {
  header: Record<string, any>;
  payload: Record<string, any>;
  signature: string;
  isExpired: boolean;
  issuedAt?: Date;
  expiresAt?: Date;
  notBefore?: Date;
  timeRemainingSeconds?: number;
  rawParts: {
    headerB64: string;
    payloadB64: string;
    signatureB64: string;
  };
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(
    atob(base64)
      .split('')
      .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
}

export function parseJwt(token: string): { data?: DecodedJwt; error?: string } {
  try {
    const trimmed = token.trim();
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return { error: 'Invalid JWT format: Token must contain exactly 3 dot-separated parts (Header.Payload.Signature)' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(base64UrlDecode(headerB64));
    const payload = JSON.parse(base64UrlDecode(payloadB64));

    const nowSeconds = Math.floor(Date.now() / 1000);
    const exp = typeof payload.exp === 'number' ? payload.exp : undefined;
    const iat = typeof payload.iat === 'number' ? payload.iat : undefined;
    const nbf = typeof payload.nbf === 'number' ? payload.nbf : undefined;

    const isExpired = exp !== undefined ? exp < nowSeconds : false;
    const timeRemainingSeconds = exp !== undefined ? exp - nowSeconds : undefined;

    return {
      data: {
        header,
        payload,
        signature: signatureB64,
        isExpired,
        issuedAt: iat ? new Date(iat * 1000) : undefined,
        expiresAt: exp ? new Date(exp * 1000) : undefined,
        notBefore: nbf ? new Date(nbf * 1000) : undefined,
        timeRemainingSeconds,
        rawParts: { headerB64, payloadB64, signatureB64 },
      },
    };
  } catch (err: any) {
    return { error: err.message || 'Failed to decode JWT' };
  }
}

export async function verifyJwtHmacSha256(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;

    const encoder = new TextEncoder();
    const key = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signatureBuffer = await window.crypto.subtle.sign('HMAC', key, data);
    
    // Convert signatureBuffer to base64url
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signatureString = String.fromCharCode(...signatureArray);
    const computedSignatureB64 = btoa(signatureString)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return computedSignatureB64 === signatureB64;
  } catch {
    return false;
  }
}
```

### 3.2 UI Component (`src/components/converters/dev/JwtDecoderComponent.tsx`)
- **3-Color Token Visualizer:** Renders the input JWT with syntax color tokens (Red Header, Purple Payload, Cyan Signature).
- **Status Dashboard:**
  - Expiration Pill: Green "Active" with live tick-by-tick countdown ("Expires in 01h:24m:15s") or Red "Expired" ("Expired 4 days ago").
  - Formatted Timestamps: `iat` (Issued At) and `exp` (Expires At) in local time and UTC.
  - Claims Tree: Explains standard claims (`iss` = Issuer, `sub` = Subject, `aud` = Audience, `role`, etc.).
- **Signature Verifier Drawer:** Enter HMAC secret key to test signature validity in real time.
- **Privacy Badge:** "🔒 Client-Side Decoded — No Token Transmitted to Network".

---

## 4. Tool A4: Cryptographic Hash & File Checksum Suite

### 4.1 Hash & Checksum Calculation Utilities (`src/lib/converters/dev/hash-engine.ts`)
```typescript
import CryptoJS from 'crypto-js';
import { keccak256 } from 'js-sha3';

export interface HashResult {
  algorithm: string;
  hash: string;
  length: number;
}

export function computeTextHashes(text: string, hmacSecret?: string): HashResult[] {
  if (!text) return [];

  if (hmacSecret && hmacSecret.trim().length > 0) {
    return [
      { algorithm: 'HMAC-MD5', hash: CryptoJS.HmacMD5(text, hmacSecret).toString(), length: 32 },
      { algorithm: 'HMAC-SHA1', hash: CryptoJS.HmacSHA1(text, hmacSecret).toString(), length: 40 },
      { algorithm: 'HMAC-SHA256', hash: CryptoJS.HmacSHA256(text, hmacSecret).toString(), length: 64 },
      { algorithm: 'HMAC-SHA512', hash: CryptoJS.HmacSHA512(text, hmacSecret).toString(), length: 128 },
    ];
  }

  return [
    { algorithm: 'MD5', hash: CryptoJS.MD5(text).toString(), length: 32 },
    { algorithm: 'SHA-1', hash: CryptoJS.SHA1(text).toString(), length: 40 },
    { algorithm: 'SHA-256', hash: CryptoJS.SHA256(text).toString(), length: 64 },
    { algorithm: 'SHA-384', hash: CryptoJS.SHA384(text).toString(), length: 96 },
    { algorithm: 'SHA-512', hash: CryptoJS.SHA512(text).toString(), length: 128 },
    { algorithm: 'Keccak-256', hash: keccak256(text), length: 64 },
  ];
}

export async function computeFileChecksumStreaming(
  file: File,
  algorithm: 'SHA-256' | 'SHA-1' | 'SHA-512' | 'MD5',
  onProgress?: (percent: number) => void
): Promise<string> {
  if (algorithm === 'MD5') {
    // For MD5, read chunked array buffer with CryptoJS
    return computeFileMd5(file, onProgress);
  }

  const buffer = await file.arrayBuffer();
  const hashBuffer = await window.crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function computeFileMd5(file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunkSize = 2 * 1024 * 1024; // 2MB chunks
    const chunks = Math.ceil(file.size / chunkSize);
    let currentChunk = 0;
    const md5 = CryptoJS.algo.MD5.create();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result as any);
        md5.update(wordArray);
        currentChunk++;
        if (onProgress) onProgress(Math.round((currentChunk / chunks) * 100));

        if (currentChunk < chunks) {
          loadNext();
        } else {
          const hash = md5.finalize().toString();
          resolve(hash);
        }
      }
    };

    reader.onerror = () => reject(new Error('Error reading file for MD5 checksum'));

    function loadNext() {
      const start = currentChunk * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      reader.readAsArrayBuffer(file.slice(start, end));
    }

    loadNext();
  });
}
```

### 4.2 UI Component (`src/components/converters/dev/HashGeneratorComponent.tsx`)
- **Dual Tabs:**
  - **Text String Hashes:** Live parallel output grid showing MD5, SHA-1, SHA-256, SHA-384, SHA-512, Keccak-256. Uppercase/Lowercase toggle, HMAC key input, one-click copy buttons.
  - **File Checksum Verifier:** Drag-and-drop file uploader (supports ISOs, ZIPs, DMG files up to 2GB+). Streaming progress bar (0–100%).
- **Hash Comparator Box:** Paste target hash from software vendor; instant visual confirmation:
  - 🟢 **"MATCH! File integrity verified."**
  - 🔴 **"MISMATCH! Hashes do not match. File may be corrupted or modified."**

---

## 5. Programmatic SEO & Developer Search Queries

Add SEO content in `src/lib/seo/faqData.ts`:
- *"How to decode and verify JWT expiration in browser without risking security?"*
- *"How to verify SHA-256 checksum of an ISO or ZIP file on Windows/Mac?"*
- *"What is the difference between SHA-256 and Keccak-256 (Ethereum hash)?"*

---

## 6. Acceptance Criteria & Verification Checklist

- [ ] JWT decoder parses standard and custom claims, formatting time fields into human-readable UTC and local strings.
- [ ] Real-time expiration timer counts down every second and updates the active/expired pill status.
- [ ] HMAC signature verification returns `true` for matching secret keys and `false` for invalid keys.
- [ ] Cryptographic hash generator computes all 6 algorithms instantly as the user types without UI freeze.
- [ ] File checksum streamingly processes files up to 2GB+ in the browser with progress callbacks.
- [ ] Hash comparison correctly compares case-insensitively with clear visual feedback.
