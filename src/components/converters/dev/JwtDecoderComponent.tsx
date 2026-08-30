'use client';

import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  parseJwt,
  verifyJwtHmacSha256,
  extractClaimsMetadata,
  DecodedJwt,
  ClaimMeta,
} from '@/lib/converters/dev/jwt-tools';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  KeyRound,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Code2,
  Calendar,
  Layers,
  FileJson,
} from 'lucide-react';

// Generates realistic sample tokens for demonstrations
function generateSampleTokens() {
  const now = Math.floor(Date.now() / 1000);
  const oneHourLater = now + 3600;
  const twoDaysAgo = now - 172800;

  const b64Url = (obj: any) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const sample1Header = b64Url({ alg: 'HS256', typ: 'JWT' });
  const sample1Payload = b64Url({
    iss: 'https://auth.converthub.dev/',
    sub: 'usr_98a76bc32d',
    aud: 'converthub-api-v2',
    name: 'Alex Mercer',
    email: 'alex.mercer@enterprise.io',
    email_verified: true,
    role: 'administrator',
    permissions: ['analytics:read', 'converters:unlimited', 'billing:admin'],
    iat: now,
    exp: oneHourLater,
  });
  const sample1Sig = 'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

  const sample2Header = b64Url({ alg: 'HS256', typ: 'JWT' });
  const sample2Payload = b64Url({
    iss: 'https://secure.identityprovider.com',
    sub: 'legacy_account_442',
    name: 'Sarah Connor',
    email: 'sarah.c@sky.net',
    role: 'operator',
    iat: twoDaysAgo - 86400,
    exp: twoDaysAgo,
  });
  const sample2Sig = 'dGhpc19pc19hbl9leHBpcmVkX3Rva2VuX3NpZ25hdHVyZQ';

  const sample3Header = b64Url({ alg: 'RS256', typ: 'JWT', kid: 'rsa-key-2026-prod' });
  const sample3Payload = b64Url({
    iss: 'https://accounts.google.com',
    sub: '109823478912384910283',
    aud: '394829104829-client.apps.googleusercontent.com',
    azp: '394829104829-client.apps.googleusercontent.com',
    email: 'dev@converthub.com',
    email_verified: true,
    iat: now - 300,
    exp: now + 3300,
    nonce: 'e83a9f002b1c',
  });
  const sample3Sig = 'iOnrN3_8B1q7q3vO1gB_yZ44_RS256_mock_signature_data_abc';

  return [
    {
      id: 'active',
      label: '🟢 Active Admin Token',
      token: `${sample1Header}.${sample1Payload}.${sample1Sig}`,
      secret: 'your-256-bit-secret',
    },
    {
      id: 'expired',
      label: '🔴 Expired User Token',
      token: `${sample2Header}.${sample2Payload}.${sample2Sig}`,
      secret: 'secret-key-123',
    },
    {
      id: 'oauth',
      label: '🌐 OpenID / OAuth2 Token',
      token: `${sample3Header}.${sample3Payload}.${sample3Sig}`,
      secret: '',
    },
  ];
}

export const JwtDecoderComponent: React.FC = () => {
  const presets = useMemo(() => generateSampleTokens(), []);
  const [tokenInput, setTokenInput] = useState(presets[0].token);
  const [hmacSecret, setHmacSecret] = useState(presets[0].secret);
  const [showSecret, setShowSecret] = useState(false);
  const [activeView, setActiveView] = useState<'claims' | 'json'>('claims');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [signatureStatus, setSignatureStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // Auto-refresh countdown every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const parsed = useMemo(() => {
    return parseJwt(tokenInput);
  }, [tokenInput]);

  const decodedData = parsed.data;
  const claimsList = useMemo(() => {
    if (!decodedData?.payload) return [];
    return extractClaimsMetadata(decodedData.payload);
  }, [decodedData]);

  // Live verification when secret or token changes
  useEffect(() => {
    if (!tokenInput.trim() || !hmacSecret.trim()) {
      setSignatureStatus('idle');
      return;
    }

    let isMounted = true;
    verifyJwtHmacSha256(tokenInput, hmacSecret).then((isValid) => {
      if (isMounted) {
        setSignatureStatus(isValid ? 'valid' : 'invalid');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [tokenInput, hmacSecret]);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Expiration countdown calculation
  const expirationState = useMemo(() => {
    if (!decodedData || typeof decodedData.payload.exp !== 'number') {
      return { status: 'none', label: 'No Expiration Specified', diffText: '' };
    }
    const exp = decodedData.payload.exp;
    const diff = exp - currentTime;

    if (diff > 0) {
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      const formattedDiff = `${String(hours).padStart(2, '0')}h : ${String(minutes).padStart(2, '0')}m : ${String(seconds).padStart(2, '0')}s`;
      return {
        status: 'active',
        label: `Active — Expires in ${formattedDiff}`,
        diffText: `Expires in ${hours}h ${minutes}m ${seconds}s`,
      };
    } else {
      const pastSeconds = Math.abs(diff);
      const days = Math.floor(pastSeconds / 86400);
      const hours = Math.floor((pastSeconds % 86400) / 3600);
      const minutes = Math.floor((pastSeconds % 3600) / 60);
      const timeStr = days > 0 ? `${days}d ${hours}h ago` : `${hours}h ${minutes}m ago`;
      return {
        status: 'expired',
        label: `Expired ${timeStr}`,
        diffText: `Token expired ${timeStr}`,
      };
    }
  }, [decodedData, currentTime]);

  return (
    <div className="space-y-6">
      {/* Privacy Guarantee Banner */}
      <PrivacyAssuranceBadge
        variant="banner"
        customTitle="🔒 100% Client-Side Decoded — Zero Server Data Transmission"
      />

      {/* Preset Quick Load Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span>Sample Tokens:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setTokenInput(preset.token);
                setHmacSecret(preset.secret);
              }}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
            >
              {preset.label}
            </button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setTokenInput('');
              setHmacSecret('');
            }}
            className="text-xs"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* 3-Color Token Visualizer & Raw Input */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <KeyRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Encoded JWT String
            </span>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-2 py-0.5 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Header
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-950/80 dark:text-purple-400">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> Payload
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-sky-100 px-2 py-0.5 text-sky-700 dark:bg-sky-950/80 dark:text-sky-400">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> Signature
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => copyToClipboard(tokenInput, 'raw')}
              leftIcon={
                copiedSection === 'raw' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )
              }
            >
              {copiedSection === 'raw' ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="p-4">
          <textarea
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste your JWT token here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
            rows={4}
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-3 font-mono text-xs leading-relaxed text-slate-800 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:bg-slate-900"
            spellCheck={false}
          />
        </div>

        {/* Color-Segmented Highlight Preview */}
        {decodedData?.rawParts && (
          <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 font-mono text-xs break-all dark:border-slate-800 dark:bg-slate-900/30">
            <span className="text-rose-600 dark:text-rose-400 font-semibold selection:bg-rose-200">
              {decodedData.rawParts.headerB64}
            </span>
            <span className="text-slate-400 font-bold">.</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold selection:bg-purple-200">
              {decodedData.rawParts.payloadB64}
            </span>
            <span className="text-slate-400 font-bold">.</span>
            <span className="text-sky-600 dark:text-sky-400 font-semibold selection:bg-sky-200">
              {decodedData.rawParts.signatureB64}
            </span>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {parsed.error && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="text-xs font-semibold">{parsed.error}</div>
        </div>
      )}

      {/* Token Decoded Dashboard */}
      {decodedData && (
        <>
          {/* Status & Expiry Banner */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Expiration Status Card */}
            <div
              className={`rounded-2xl border p-4 shadow-sm transition-all ${
                expirationState.status === 'active'
                  ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-emerald-950/30'
                  : expirationState.status === 'expired'
                  ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/60 dark:bg-rose-950/30'
                  : 'border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-900/40'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Token Lifespan Status
                </span>
                <Clock
                  className={`h-4 w-4 ${
                    expirationState.status === 'active'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : expirationState.status === 'expired'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-400'
                  }`}
                />
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    expirationState.status === 'active'
                      ? 'bg-emerald-500 animate-pulse'
                      : expirationState.status === 'expired'
                      ? 'bg-rose-500'
                      : 'bg-slate-400'
                  }`}
                />
                <span
                  className={`text-base font-bold ${
                    expirationState.status === 'active'
                      ? 'text-emerald-700 dark:text-emerald-300'
                      : expirationState.status === 'expired'
                      ? 'text-rose-700 dark:text-rose-300'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {expirationState.label}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {decodedData.expiresAt
                  ? `Expires: ${decodedData.expiresAt.toLocaleTimeString()} (${decodedData.expiresAt.toLocaleDateString()})`
                  : 'Permanent token without exp claim'}
              </p>
            </div>

            {/* Algorithm & Type Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cryptographic Algorithm
                </span>
                <Shield className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {decodedData.header.alg || 'None'}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Token Type: <span className="font-semibold">{decodedData.header.typ || 'JWT'}</span>
                {decodedData.header.kid && ` • Key ID: ${decodedData.header.kid}`}
              </p>
            </div>

            {/* Issued At Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Issued At (iat)
                </span>
                <Calendar className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                {decodedData.issuedAt
                  ? decodedData.issuedAt.toLocaleTimeString()
                  : 'Not specified'}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {decodedData.issuedAt
                  ? decodedData.issuedAt.toUTCString()
                  : 'iat claim omitted in payload'}
              </p>
            </div>
          </div>

          {/* Main Inspection Grid (Header & Payload Claims) */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left: Decoded Header */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Decoded Header
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    copyToClipboard(JSON.stringify(decodedData.header, null, 2), 'header')
                  }
                  leftIcon={
                    copiedSection === 'header' ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )
                  }
                  className="text-xs h-7 px-2"
                >
                  {copiedSection === 'header' ? 'Copied' : 'Copy'}
                </Button>
              </div>

              <div className="rounded-2xl border border-rose-200/80 bg-rose-50/20 p-4 font-mono text-xs text-slate-800 dark:border-rose-900/40 dark:bg-rose-950/10 dark:text-slate-200">
                <pre className="overflow-x-auto whitespace-pre-wrap">
                  {JSON.stringify(decodedData.header, null, 2)}
                </pre>
              </div>
            </div>

            {/* Right: Decoded Payload & Claims Inspector */}
            <div className="lg:col-span-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Decoded Payload Claims
                  </h3>
                </div>

                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-900">
                  <button
                    onClick={() => setActiveView('claims')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      activeView === 'claims'
                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Claims Tree
                  </button>
                  <button
                    onClick={() => setActiveView('json')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      activeView === 'json'
                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Raw JSON
                  </button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      copyToClipboard(JSON.stringify(decodedData.payload, null, 2), 'payload')
                    }
                    leftIcon={
                      copiedSection === 'payload' ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )
                    }
                    className="text-xs h-7 px-2"
                  >
                    {copiedSection === 'payload' ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {activeView === 'claims' ? (
                <div className="overflow-hidden rounded-2xl border border-purple-200/80 bg-white shadow-sm dark:border-purple-900/40 dark:bg-slate-950">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {claimsList.map((claim) => (
                      <div
                        key={claim.key}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                              {claim.key}
                            </span>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                              ({claim.label})
                            </span>
                            {claim.isStandard && (
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                RFC 7519
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {claim.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 sm:max-w-[50%]">
                          <div className="truncate rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-xs font-medium text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                            {claim.formattedValue}
                          </div>
                          <button
                            onClick={() => copyToClipboard(String(claim.value), `claim-${claim.key}`)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                            title="Copy claim value"
                          >
                            {copiedSection === `claim-${claim.key}` ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-purple-200/80 bg-purple-50/20 p-4 font-mono text-xs text-slate-800 dark:border-purple-900/40 dark:bg-purple-950/10 dark:text-slate-200">
                  <pre className="overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(decodedData.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* HMAC Signature Verifier Drawer / Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    HMAC-SHA256 Signature Verifier
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Verify whether the cryptographic signature matches your secret key
                  </p>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {signatureStatus === 'valid' && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    Signature Verified
                  </span>
                )}
                {signatureStatus === 'invalid' && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                    Invalid Signature
                  </span>
                )}
                {signatureStatus === 'idle' && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    Enter Secret Key Below
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                HMAC Secret Key (Base64 / UTF-8)
              </label>
              <div className="relative">
                <Input
                  type={showSecret ? 'text' : 'password'}
                  value={hmacSecret}
                  onChange={(e) => setHmacSecret(e.target.value)}
                  placeholder="Enter your HMAC-SHA256 secret key..."
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                💡 Secret is tested in-memory with Web Crypto / CryptoJS and never sent to any server.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
