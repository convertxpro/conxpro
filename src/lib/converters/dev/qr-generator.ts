/**
 * Smart QR Code & Barcode Generator Engine
 * ApexTools Developer Productivity Suite
 */

import QRCode from 'qrcode';

export type QrPayloadType = 'url' | 'wifi' | 'whatsapp' | 'vcard' | 'email' | 'sms' | 'text';

export interface WifiConfig {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface WhatsappConfig {
  phone: string;
  message: string;
}

export interface VcardConfig {
  firstName: string;
  lastName: string;
  org: string;
  title: string;
  phone: string;
  workPhone?: string;
  email: string;
  url: string;
  address?: string;
  note?: string;
}

export interface EmailConfig {
  email: string;
  subject: string;
  body: string;
}

export interface SmsConfig {
  phone: string;
  message: string;
}

export interface QrCodeOptions {
  type: QrPayloadType;
  content: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  width: number;
  margin?: number;
  darkColor: string;
  lightColor: string;
  logoDataUrl?: string | null;
  logoSizePercent?: number; // default: 22
  wifiConfig?: WifiConfig;
  whatsappConfig?: WhatsappConfig;
  vcardConfig?: VcardConfig;
  emailConfig?: EmailConfig;
  smsConfig?: SmsConfig;
}

/**
 * Escapes special characters for Wi-Fi QR strings
 */
function escapeWifiString(str: string): string {
  return str.replace(/([\\;,:"])/g, '\\$1');
}

/**
 * Normalizes phone numbers, ensuring clean numeric international format
 */
export function normalizePhoneNumber(phone: string, defaultCountryPrefix = '92'): string {
  let cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length >= 10) {
    // Pakistani local 0300... -> 92300...
    cleaned = defaultCountryPrefix + cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Generates the standardized payload string for different QR types
 */
export function formatQrPayload(options: QrCodeOptions): string {
  switch (options.type) {
    case 'url': {
      const raw = (options.content || '').trim();
      if (!raw) return 'https://apextools.app';
      if (/^https?:\/\//i.test(raw)) return raw;
      return `https://${raw}`;
    }

    case 'wifi': {
      if (!options.wifiConfig) return options.content || '';
      const { ssid, password, encryption, hidden } = options.wifiConfig;
      const safeSsid = escapeWifiString(ssid || '');
      const safePass = escapeWifiString(password || '');
      const enc = encryption || 'WPA';
      const hid = hidden ? 'true' : 'false';
      return `WIFI:S:${safeSsid};T:${enc};P:${safePass};H:${hid};;`;
    }

    case 'whatsapp': {
      if (!options.whatsappConfig) return options.content || '';
      const cleanPhone = normalizePhoneNumber(options.whatsappConfig.phone);
      const text = encodeURIComponent(options.whatsappConfig.message || '');
      if (text) {
        return `https://wa.me/${cleanPhone}?text=${text}`;
      }
      return `https://wa.me/${cleanPhone}`;
    }

    case 'vcard': {
      if (!options.vcardConfig) return options.content || '';
      const { firstName, lastName, org, title, phone, workPhone, email, url, address, note } = options.vcardConfig;
      const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'Contact';

      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${lastName || ''};${firstName || ''};;;`,
        `FN:${fullName}`,
      ];

      if (org) lines.push(`ORG:${org}`);
      if (title) lines.push(`TITLE:${title}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (workPhone) lines.push(`TEL;TYPE=WORK:${workPhone}`);
      if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
      if (url) lines.push(`URL:${url.startsWith('http') ? url : `https://${url}`}`);
      if (address) lines.push(`ADR;TYPE=HOME:;;${address};;;;`);
      if (note) lines.push(`NOTE:${note}`);

      lines.push('END:VCARD');
      return lines.join('\n');
    }

    case 'email': {
      if (!options.emailConfig) return `mailto:${options.content || ''}`;
      const { email, subject, body } = options.emailConfig;
      const params = new URLSearchParams();
      if (subject) params.set('subject', subject);
      if (body) params.set('body', body);
      const query = params.toString();
      return `mailto:${email}${query ? `?${query}` : ''}`;
    }

    case 'sms': {
      if (!options.smsConfig) return options.content || '';
      const cleanPhone = normalizePhoneNumber(options.smsConfig.phone);
      return `SMSTO:${cleanPhone}:${options.smsConfig.message || ''}`;
    }

    case 'text':
    default:
      return options.content || 'ApexTools QR Code';
  }
}

/**
 * Generates an SVG string representation of the QR code
 */
export async function generateQrSvgString(options: QrCodeOptions): Promise<string> {
  const payload = formatQrPayload(options);
  return QRCode.toString(payload, {
    type: 'svg',
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    width: options.width || 512,
    margin: options.margin !== undefined ? options.margin : 2,
    color: {
      dark: options.darkColor || '#000000',
      light: options.lightColor || '#ffffff',
    },
  });
}

/**
 * Generates a Data URL (PNG) of the QR code with optional logo overlay
 */
export async function generateQrDataUrl(options: QrCodeOptions): Promise<string> {
  const payload = formatQrPayload(options);
  const ecLevel = options.logoDataUrl ? 'H' : options.errorCorrectionLevel || 'M';
  const width = options.width || 1024;
  const margin = options.margin !== undefined ? options.margin : 2;

  // If no logo, use fast direct QRCode toDataURL
  if (!options.logoDataUrl) {
    return QRCode.toDataURL(payload, {
      errorCorrectionLevel: ecLevel,
      width,
      margin,
      color: {
        dark: options.darkColor || '#000000',
        light: options.lightColor || '#ffffff',
      },
    });
  }

  // If logo is present, render to an offscreen canvas and draw logo in center
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = width;

    QRCode.toCanvas(
      canvas,
      payload,
      {
        errorCorrectionLevel: 'H',
        width,
        margin,
        color: {
          dark: options.darkColor || '#000000',
          light: options.lightColor || '#ffffff',
        },
      },
      (err) => {
        if (err) return reject(err);

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(canvas.toDataURL('image/png'));

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const logoPercent = (options.logoSizePercent || 22) / 100;
          const logoSize = width * logoPercent;
          const logoX = (width - logoSize) / 2;
          const logoY = (width - logoSize) / 2;
          const padding = logoSize * 0.12;

          // Draw background badge for logo
          ctx.save();
          ctx.fillStyle = options.lightColor === 'transparent' ? '#ffffff' : (options.lightColor || '#ffffff');
          const badgeX = logoX - padding;
          const badgeY = logoY - padding;
          const badgeSize = logoSize + padding * 2;
          const borderRadius = badgeSize * 0.22;

          // Rounded rectangle path
          ctx.beginPath();
          ctx.moveTo(badgeX + borderRadius, badgeY);
          ctx.lineTo(badgeX + badgeSize - borderRadius, badgeY);
          ctx.quadraticCurveTo(badgeX + badgeSize, badgeY, badgeX + badgeSize, badgeY + borderRadius);
          ctx.lineTo(badgeX + badgeSize, badgeY + badgeSize - borderRadius);
          ctx.quadraticCurveTo(badgeX + badgeSize, badgeY + badgeSize, badgeX + badgeSize - borderRadius, badgeY + badgeSize);
          ctx.lineTo(badgeX + borderRadius, badgeY + badgeSize);
          ctx.quadraticCurveTo(badgeX, badgeY + badgeSize, badgeX, badgeY + badgeSize - borderRadius);
          ctx.lineTo(badgeX, badgeY + borderRadius);
          ctx.quadraticCurveTo(badgeX, badgeY, badgeX + borderRadius, badgeY);
          ctx.closePath();

          ctx.shadowColor = 'rgba(0, 0, 0, 0.18)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 3;
          ctx.fill();
          ctx.restore();

          // Draw the logo image clipped with rounded corners
          ctx.save();
          ctx.beginPath();
          const imgRadius = logoSize * 0.15;
          ctx.moveTo(logoX + imgRadius, logoY);
          ctx.lineTo(logoX + logoSize - imgRadius, logoY);
          ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + imgRadius);
          ctx.lineTo(logoX + logoSize, logoY + logoSize - imgRadius);
          ctx.quadraticCurveTo(logoX + logoSize, logoY + logoSize, logoX + logoSize - imgRadius, logoY + logoSize);
          ctx.lineTo(logoX + imgRadius, logoY + logoSize);
          ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - imgRadius);
          ctx.lineTo(logoX, logoY + imgRadius);
          ctx.quadraticCurveTo(logoX, logoY, logoX + imgRadius, logoY);
          ctx.closePath();
          ctx.clip();

          ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
          ctx.restore();

          resolve(canvas.toDataURL('image/png'));
        };

        img.onerror = () => {
          // If image fails, return raw QR without logo
          resolve(canvas.toDataURL('image/png'));
        };

        img.src = options.logoDataUrl!;
      }
    );
  });
}

/**
 * Downloads a data URL or string as a file
 */
export function downloadFile(data: string, filename: string, mimeType: string): void {
  const blob =
    data.startsWith('data:')
      ? dataURItoBlob(data)
      : new Blob([data], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

export const QR_PALETTES = [
  { name: 'Classic Black', dark: '#000000', light: '#ffffff' },
  { name: 'Emerald Forest', dark: '#047857', light: '#f0fdf4' },
  { name: 'Indigo Dream', dark: '#4338ca', light: '#eef2ff' },
  { name: 'Midnight Navy', dark: '#0f172a', light: '#f8fafc' },
  { name: 'Royal Purple', dark: '#6b21a8', light: '#faf5ff' },
  { name: 'Ruby Crimson', dark: '#991b1b', light: '#fef2f2' },
  { name: 'Dark Mode Slate', dark: '#38bdf8', light: '#0f172a' },
];
