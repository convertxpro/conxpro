'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  QrPayloadType,
  QrCodeOptions,
  WifiConfig,
  WhatsappConfig,
  VcardConfig,
  EmailConfig,
  formatQrPayload,
  generateQrDataUrl,
  generateQrSvgString,
  downloadFile,
  QR_PALETTES,
} from '@/lib/converters/dev/qr-generator';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  QrCode,
  Link2,
  Wifi,
  MessageCircle,
  Contact,
  FileText,
  Mail,
  Download,
  Copy,
  Check,
  Sparkles,
  Upload,
  Trash2,
  Palette,
  ShieldCheck,
  Eye,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const QrCodeGeneratorComponent: React.FC = () => {
  const [activeType, setActiveType] = useState<QrPayloadType>('url');

  // Payload form states
  const [urlContent, setUrlContent] = useState('https://apextools.app');
  const [textContent, setTextContent] = useState('Welcome to ApexTools — Ultra-fast client-side utilities.');
  const [wifiConfig, setWifiConfig] = useState<WifiConfig>({
    ssid: 'Office_Guest_WiFi',
    password: 'SecurePassword123',
    encryption: 'WPA',
    hidden: false,
  });
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsappConfig>({
    phone: '923001234567',
    message: 'Hello! I am inquiring about your service on ApexTools.',
  });
  const [vcardConfig, setVcardConfig] = useState<VcardConfig>({
    firstName: 'Muddasir',
    lastName: 'Ahmed',
    org: 'ApexTools Technologies',
    title: 'Software Architect',
    phone: '+92 300 1234567',
    email: 'contact@apextools.app',
    url: 'https://apextools.app',
    address: 'Lahore, Pakistan',
    note: 'Client-side file and data conversion suite',
  });
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    email: 'support@apextools.app',
    subject: 'Inquiry from ApexTools',
    body: 'Hello Team,\n\nI would like to inquire about...',
  });

  // Customization options
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSizePercent, setLogoSizePercent] = useState<number>(22);

  // Generated results
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [qrSvgString, setQrSvgString] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compile options
  const currentOptions: QrCodeOptions = useMemo(() => ({
    type: activeType,
    content: activeType === 'url' ? urlContent : textContent,
    errorCorrectionLevel: logoDataUrl ? 'H' : errorCorrection,
    width: 1024,
    darkColor,
    lightColor,
    logoDataUrl,
    logoSizePercent,
    wifiConfig: activeType === 'wifi' ? wifiConfig : undefined,
    whatsappConfig: activeType === 'whatsapp' ? whatsappConfig : undefined,
    vcardConfig: activeType === 'vcard' ? vcardConfig : undefined,
    emailConfig: activeType === 'email' ? emailConfig : undefined,
  }), [
    activeType,
    urlContent,
    textContent,
    wifiConfig,
    whatsappConfig,
    vcardConfig,
    emailConfig,
    darkColor,
    lightColor,
    errorCorrection,
    logoDataUrl,
    logoSizePercent,
  ]);

  const payloadString = formatQrPayload(currentOptions);

  // Render QR Code whenever inputs or styles change
  useEffect(() => {
    let isMounted = true;
    setIsGenerating(true);

    const render = async () => {
      try {
        const [dataUrl, svg] = await Promise.all([
          generateQrDataUrl(currentOptions),
          generateQrSvgString(currentOptions),
        ]);
        if (isMounted) {
          setQrDataUrl(dataUrl);
          setQrSvgString(svg);
        }
      } catch (err) {
        console.error('QR generation error:', err);
      } finally {
        if (isMounted) setIsGenerating(false);
      }
    };

    render();

    return () => {
      isMounted = false;
    };
  }, [currentOptions]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoDataUrl(ev.target?.result as string);
      setErrorCorrection('H'); // Automatically bump error correction to High for logos
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export handlers
  const handleDownloadPng = async () => {
    // Generate high-res 2048px version for download
    const highResUrl = await generateQrDataUrl({
      ...currentOptions,
      width: 2048,
    });
    downloadFile(highResUrl, `qr-code-${activeType}-2048px.png`, 'image/png');
  };

  const handleDownloadSvg = () => {
    downloadFile(qrSvgString, `qr-code-${activeType}.svg`, 'image/svg+xml');
  };

  const handleDownloadWebp = async () => {
    // Convert PNG dataUrl to WebP using Canvas
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const webpUrl = canvas.toDataURL('image/webp', 0.95);
        downloadFile(webpUrl, `qr-code-${activeType}.webp`, 'image/webp');
      }
    };
    img.src = qrDataUrl;
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStatus(id);
      setTimeout(() => setCopiedStatus(null), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const copyImageToClipboard = async () => {
    try {
      const response = await fetch(qrDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopiedStatus('image');
      setTimeout(() => setCopiedStatus(null), 2000);
    } catch {
      // Fallback: copy dataUrl string
      copyToClipboard(qrDataUrl, 'image');
    }
  };

  const typeTabs: { id: QrPayloadType; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'URL / Link', icon: <Link2 className="h-4 w-4" /> },
    { id: 'wifi', label: 'Wi-Fi Network', icon: <Wifi className="h-4 w-4" /> },
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" /> },
    { id: 'vcard', label: 'Contact vCard', icon: <Contact className="h-4 w-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { id: 'text', label: 'Plain Text', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="w-full space-y-8">
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="🔒 100% Client-Side QR Generation • Zero Data Transmission"
      />

      {/* Mode Selector Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800">
        {typeTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveType(tab.id)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
              activeType === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Grid: Form Inputs (Left) & QR Code Live Studio (Right) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* ======================================================== */}
        {/* LEFT COLUMN: PAYLOAD INPUT FORMS & STYLER */}
        {/* ======================================================== */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Payload Inputs */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">
              Configure {typeTabs.find((t) => t.id === activeType)?.label} Data
            </h3>

            {/* URL Payload */}
            {activeType === 'url' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Target Website URL
                </label>
                <Input
                  type="url"
                  value={urlContent}
                  onChange={(e) => setUrlContent(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="font-medium"
                />
                <p className="text-[11px] text-slate-400">
                  Scanned by iPhone and Android camera apps to open the web link directly.
                </p>
              </div>
            )}

            {/* Wi-Fi Payload */}
            {activeType === 'wifi' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Network SSID (Name)
                  </label>
                  <Input
                    type="text"
                    value={wifiConfig.ssid}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                    placeholder="e.g. Home_5G_Network"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Wi-Fi Password
                    </label>
                    <Input
                      type="text"
                      value={wifiConfig.password}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                      placeholder="Password"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Security Type
                    </label>
                    <select
                      value={wifiConfig.encryption}
                      onChange={(e) =>
                        setWifiConfig({ ...wifiConfig, encryption: e.target.value as any })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                      <option value="WEP">WEP (Legacy)</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wifiConfig.hidden}
                    onChange={(e) => setWifiConfig({ ...wifiConfig, hidden: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Hidden Network (SSID is not broadcasted)
                </label>
              </div>
            )}

            {/* WhatsApp Payload */}
            {activeType === 'whatsapp' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Phone Number (with Country Code)
                  </label>
                  <Input
                    type="text"
                    value={whatsappConfig.phone}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, phone: e.target.value })}
                    placeholder="e.g. 923001234567 or +923001234567"
                    className="font-mono"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Pakistani format: <code className="font-mono text-indigo-500">92300XXXXXXX</code>. Scanners immediately launch WhatsApp chat.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Pre-filled Chat Message
                  </label>
                  <textarea
                    rows={3}
                    value={whatsappConfig.message}
                    onChange={(e) => setWhatsappConfig({ ...whatsappConfig, message: e.target.value })}
                    placeholder="Enter default message to send..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* vCard Contact Payload */}
            {activeType === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      First Name
                    </label>
                    <Input
                      type="text"
                      value={vcardConfig.firstName}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, firstName: e.target.value })}
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      value={vcardConfig.lastName}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, lastName: e.target.value })}
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Organization / Company
                    </label>
                    <Input
                      type="text"
                      value={vcardConfig.org}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, org: e.target.value })}
                      placeholder="Company Name"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Job Title
                    </label>
                    <Input
                      type="text"
                      value={vcardConfig.title}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, title: e.target.value })}
                      placeholder="Title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Mobile Phone
                    </label>
                    <Input
                      type="tel"
                      value={vcardConfig.phone}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, phone: e.target.value })}
                      placeholder="+92 300 1234567"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={vcardConfig.email}
                      onChange={(e) => setVcardConfig({ ...vcardConfig, email: e.target.value })}
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    value={vcardConfig.url}
                    onChange={(e) => setVcardConfig({ ...vcardConfig, url: e.target.value })}
                    placeholder="https://company.com"
                  />
                </div>
              </div>
            )}

            {/* Email Payload */}
            {activeType === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Recipient Email
                  </label>
                  <Input
                    type="email"
                    value={emailConfig.email}
                    onChange={(e) => setEmailConfig({ ...emailConfig, email: e.target.value })}
                    placeholder="recipient@example.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Subject Line
                  </label>
                  <Input
                    type="text"
                    value={emailConfig.subject}
                    onChange={(e) => setEmailConfig({ ...emailConfig, subject: e.target.value })}
                    placeholder="Email subject..."
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Email Body
                  </label>
                  <textarea
                    rows={3}
                    value={emailConfig.body}
                    onChange={(e) => setEmailConfig({ ...emailConfig, body: e.target.value })}
                    placeholder="Type your message..."
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Plain Text Payload */}
            {activeType === 'text' && (
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Plain Text Content
                </label>
                <textarea
                  rows={4}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Enter any text, instructions, or notes to encode..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>

          {/* 2. Visual Customizer Studio */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2">
              <Palette className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Visual Customizer & Styling
              </h3>
            </div>

            {/* Color Palette Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Curated Color Themes
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {QR_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    onClick={() => {
                      setDarkColor(pal.dark);
                      setLightColor(pal.light);
                    }}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all ${
                      darkColor === pal.dark && lightColor === pal.light
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm dark:border-indigo-500 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-slate-300"
                      style={{ backgroundColor: pal.dark }}
                    />
                    <span>{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers & Error Correction */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  QR Pattern Color
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <Input
                    type="text"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Background Color
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <Input
                    type="text"
                    value={lightColor}
                    onChange={(e) => setLightColor(e.target.value)}
                    className="font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Error Correction Level
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="L">Low (7% recovery)</option>
                  <option value="M">Medium (15% recovery - Standard)</option>
                  <option value="Q">Quartile (25% recovery)</option>
                  <option value="H">High (30% recovery - for Logos)</option>
                </select>
              </div>
            </div>

            {/* Logo Center Uploader */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Center Brand Logo (Optional)
                  </span>
                </div>
                {logoDataUrl && (
                  <button
                    onClick={removeLogo}
                    className="text-xs font-semibold text-rose-500 hover:text-rose-600 flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoUpload}
                  accept="image/png, image/jpeg, image/svg+xml, image/webp"
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<Upload className="h-3.5 w-3.5" />}
                >
                  {logoDataUrl ? 'Change Logo Image' : 'Upload PNG / SVG Logo'}
                </Button>

                {logoDataUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={logoDataUrl}
                      alt="Logo thumbnail"
                      className="h-8 w-8 rounded-lg object-contain border bg-white p-0.5"
                    />
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" /> High 30% ECC active
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: LIVE QR PREVIEW & DOWNLOAD SUITE */}
        {/* ======================================================== */}
        <div className="space-y-6 lg:col-span-5">
          <div className="sticky top-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Preview
                </h3>
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Ready to Scan
              </span>
            </div>

            {/* Rendered QR Canvas Box */}
            <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 dark:border-slate-800 dark:bg-slate-950/60">
              {qrDataUrl ? (
                <div className="relative group">
                  <img
                    src={qrDataUrl}
                    alt="Generated QR Code"
                    className="h-64 w-64 rounded-2xl shadow-lg transition-transform duration-200 group-hover:scale-[1.02] bg-white object-contain"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/20 backdrop-blur-[1px] rounded-2xl">
                    <span className="rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-md">
                      Scan with Phone Camera
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex h-64 w-64 items-center justify-center">
                  <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
                </div>
              )}

              <p className="mt-4 text-center text-xs text-slate-400">
                Vectorized rendering • Encoded size: {payloadString.length} chars
              </p>
            </div>

            {/* Download & Export Suite */}
            <div className="mt-6 space-y-2.5">
              <Button
                variant="gradient"
                size="lg"
                onClick={handleDownloadPng}
                className="w-full"
                leftIcon={<Download className="h-4 w-4" />}
              >
                Download High-Res PNG (2048px)
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleDownloadSvg}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                >
                  Vector SVG
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleDownloadWebp}
                  leftIcon={<Download className="h-3.5 w-3.5" />}
                >
                  WebP Image
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyImageToClipboard}
                  leftIcon={
                    copiedStatus === 'image' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {copiedStatus === 'image' ? 'Image Copied!' : 'Copy Image'}
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(qrSvgString, 'svg')}
                  leftIcon={
                    copiedStatus === 'svg' ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {copiedStatus === 'svg' ? 'SVG Copied!' : 'Copy SVG Code'}
                </Button>
              </div>
            </div>

            {/* Encoded Payload Inspector */}
            <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-slate-950/40">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                <span>Raw Payload String:</span>
                <button
                  onClick={() => copyToClipboard(payloadString, 'raw')}
                  className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  {copiedStatus === 'raw' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all line-clamp-3">
                {payloadString}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
