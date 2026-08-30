import CryptoJS from 'crypto-js';

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

export interface ClaimMeta {
  key: string;
  label: string;
  description: string;
  value: any;
  formattedValue?: string;
  isStandard: boolean;
}

export const STANDARD_CLAIMS: Record<string, { label: string; description: string }> = {
  iss: { label: 'Issuer', description: 'Identifies principal that issued the JWT' },
  sub: { label: 'Subject', description: 'Identifies the principal subject of the JWT (user ID / entity)' },
  aud: { label: 'Audience', description: 'Identifies the recipients that the JWT is intended for' },
  exp: { label: 'Expiration Time', description: 'Identifies the expiration time on or after which the token must not be accepted' },
  nbf: { label: 'Not Before', description: 'Identifies the time before which the JWT must not be accepted' },
  iat: { label: 'Issued At', description: 'Identifies the time at which the JWT was issued' },
  jti: { label: 'JWT ID', description: 'Unique identifier for the JWT to prevent replay attacks' },
  name: { label: 'Full Name', description: 'Subject end-user full name' },
  email: { label: 'Email Address', description: 'Subject email identifier' },
  email_verified: { label: 'Email Verified', description: 'Whether the subject email has been verified' },
  role: { label: 'User Role', description: 'Security authorization role' },
  roles: { label: 'User Roles', description: 'Array of security authorization roles' },
  scope: { label: 'OAuth Scopes', description: 'Granted authorization permissions' },
  azp: { label: 'Authorized Party', description: 'Client ID of authorized application party' },
  nonce: { label: 'Nonce', description: 'Value used to associate client session with ID token' },
  auth_time: { label: 'Auth Time', description: 'Time when the end-user authentication occurred' },
};

export function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  
  if (typeof atob === 'function') {
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  }

  // Node.js fallback
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function parseJwt(token: string): { data?: DecodedJwt; error?: string } {
  try {
    const trimmed = token.trim();
    if (!trimmed) {
      return { error: 'Please enter a JWT token string' };
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return {
        error: 'Invalid JWT format: Token must contain exactly 3 dot-separated parts (Header.Payload.Signature)',
      };
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    let header: Record<string, any>;
    let payload: Record<string, any>;

    try {
      header = JSON.parse(base64UrlDecode(headerB64));
    } catch {
      return { error: 'Invalid JWT Header: Unable to parse Base64Url decoded JSON' };
    }

    try {
      payload = JSON.parse(base64UrlDecode(payloadB64));
    } catch {
      return { error: 'Invalid JWT Payload: Unable to parse Base64Url decoded JSON' };
    }

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

export function extractClaimsMetadata(payload: Record<string, any>): ClaimMeta[] {
  return Object.entries(payload).map(([key, value]) => {
    const standard = STANDARD_CLAIMS[key];
    let formattedValue: string | undefined;

    if (['exp', 'iat', 'nbf', 'auth_time'].includes(key) && typeof value === 'number') {
      try {
        const d = new Date(value * 1000);
        formattedValue = `${d.toLocaleString()} (${d.toUTCString()})`;
      } catch {
        formattedValue = String(value);
      }
    } else if (typeof value === 'object' && value !== null) {
      formattedValue = JSON.stringify(value);
    } else {
      formattedValue = String(value);
    }

    return {
      key,
      label: standard?.label || key,
      description: standard?.description || 'Custom application claim',
      value,
      formattedValue,
      isStandard: !!standard,
    };
  });
}

export async function verifyJwtHmacSha256(token: string, secret: string): Promise<boolean> {
  try {
    const trimmed = token.trim();
    const parts = trimmed.split('.');
    if (parts.length !== 3) return false;
    const [headerB64, payloadB64, signatureB64] = parts;

    if (!secret) return false;

    // Check if subtle crypto is available (Browser or modern Node)
    const subtle = typeof window !== 'undefined' ? window.crypto?.subtle : globalThis.crypto?.subtle;

    if (subtle) {
      const encoder = new TextEncoder();
      const key = await subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const data = encoder.encode(`${headerB64}.${payloadB64}`);
      const signatureBuffer = await subtle.sign('HMAC', key, data);

      const signatureArray = Array.from(new Uint8Array(signatureBuffer));
      const signatureString = String.fromCharCode(...signatureArray);
      const computedSignatureB64 = btoa(signatureString)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      return computedSignatureB64 === signatureB64;
    }

    // Fallback using CryptoJS
    const message = `${headerB64}.${payloadB64}`;
    const hash = CryptoJS.HmacSHA256(message, secret);
    const base64 = CryptoJS.enc.Base64.stringify(hash);
    const computedSignatureB64 = base64
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return computedSignatureB64 === signatureB64;
  } catch {
    return false;
  }
}
