'use client';

import React, { useState } from 'react';
import {
  decodeCnic,
  validateNtn,
  formatCnicInput,
  formatNtnInput,
  CnicDecodedData,
  NtnValidationResult,
} from '@/lib/converters/pakistan/cnic-decoder';
import { WhatsAppShareButton } from './WhatsAppShareButton';
import { Button } from '@/components/ui/Button';
import {
  CreditCard,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
  MapPin,
  UserCheck,
  Lock,
  Building,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ToolMetadata } from '@/config/categories';

interface CnicDecoderComponentProps {
  tool?: ToolMetadata;
}

const SAMPLE_CNICS = [
  { label: 'Lahore (Male)', value: '35201-1234567-1' },
  { label: 'Islamabad (Female)', value: '61101-7654321-2' },
  { label: 'Karachi (Male)', value: '42101-9876543-3' },
  { label: 'Peshawar (Male)', value: '17301-2345678-5' },
  { label: 'Quetta (Female)', value: '54400-8765432-4' },
];

const SAMPLE_NTNS = [
  { label: 'Valid Individual NTN', value: '1435805-0' },
  { label: 'Valid Corporate NTN', value: '7123456-1' },
];

export const CnicDecoderComponent: React.FC<CnicDecoderComponentProps> = () => {
  const [activeTab, setActiveTab] = useState<'cnic' | 'ntn'>('cnic');
  const [cnicInput, setCnicInput] = useState<string>('35201-1234567-1');
  const [ntnInput, setNtnInput] = useState<string>('1435805-0');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const cnicResult: CnicDecodedData = decodeCnic(cnicInput);
  const ntnResult: NtnValidationResult = validateNtn(ntnInput);

  const handleCnicChange = (val: string) => {
    setCnicInput(formatCnicInput(val));
  };

  const handleNtnChange = (val: string) => {
    setNtnInput(formatNtnInput(val));
  };

  const shareText = activeTab === 'cnic'
    ? `🪪 *NADRA CNIC Region & Parity Verification*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *CNIC Number:* ${cnicResult.formattedCnic}\n` +
      `🏛️ *Province / Region:* ${cnicResult.provinceName} (${cnicResult.provinceUrdu})\n` +
      `📍 *Administrative Division:* ${cnicResult.divisionName}\n` +
      `🏙️ *Likely District(s):* ${cnicResult.likelyDistrict}\n` +
      `👤 *Gender Parity:* ${cnicResult.gender} (${cnicResult.genderUrdu})\n` +
      `🛡️ *Privacy:* 100% Client-Side In-Memory Verification\n` +
      `\n🔗 *Decoded free via ConvertHub Pakistan*`
    : `🏛️ *FBR NTN Checksum Verification*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📌 *NTN Number:* ${ntnResult.formattedNtn}\n` +
      `📊 *Status:* ${ntnResult.isValid ? 'Valid Modulo-11 Checksum 🟢' : 'Invalid Checksum 🔴'}\n` +
      `💼 *Entity Type:* ${ntnResult.entityType}\n` +
      `🛡️ *Privacy:* 100% Client-Side In-Memory Verification\n` +
      `\n🔗 *Validated free via ConvertHub Pakistan*`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const faqs = [
    {
      q: 'How does NADRA encode administrative location into 13-digit CNIC numbers?',
      qUrdu: 'نادرا شناختی کارڈ نمبر میں علاقائی معلومات کیسے محفوظ کرتا ہے؟',
      a: 'The first digit represents your home province (1: KPK, 2: FATA, 3: Punjab, 4: Sindh, 5: Balochistan, 6: Islamabad, 7: Gilgit-Baltistan, 8: Azad Kashmir). The second digit represents your administrative division (e.g. 35 for Lahore, 42 for Karachi, 37 for Rawalpindi). Digits 3 to 5 represent your district and tehsil, followed by family sequence tree numbers.',
    },
    {
      q: 'How is gender parity encoded in the 13th digit of a CNIC?',
      qUrdu: 'شناختی کارڈ کے آخری ہندسے سے جنس کا کیسے پتہ چلتا ہے؟',
      a: 'The 13th digit (last digit) of every Pakistani CNIC indicates gender parity. An odd number (1, 3, 5, 7, 9) designates a Male citizen. An even number (0, 2, 4, 6, 8) designates a Female citizen or third gender / transgender.',
    },
    {
      q: 'Is my CNIC or NTN number stored or sent to any server?',
      qUrdu: 'کیا میرا شناختی کارڈ نمبر کسی سرور پر محفوظ ہوتا ہے؟',
      a: 'Zero data is stored or transmitted! All parsing, validation, and region decoding algorithms execute 100% client-side inside your browser’s local JavaScript memory. No network requests are ever made.',
    },
    {
      q: 'How does the FBR NTN Modulo-11 checksum validation work?',
      qUrdu: 'ایف بی آر این ٹی این چیک سم کا حساب کیسے ہوتا ہے؟',
      a: 'The National Tax Number (NTN) consists of 7 digits plus 1 check digit. The FBR uses a weighted Modulo-11 algorithm with weight factors [8, 7, 6, 5, 4, 3, 2]. The weighted sum modulo 11 yields the official check digit.',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/40 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Lock className="h-3.5 w-3.5" />
              <span>100% Client-Side In-Memory Privacy Guarantee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Pakistani CNIC & NTN Decoder / Validator
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              Validate 13-digit Pakistani CNIC and FBR NTN numbers, decode province, administrative division, district, and gender parity in real-time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <WhatsAppShareButton shareText={shareText} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            >
              {copied ? 'Copied' : 'Copy Details'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80 max-w-md">
        <button
          type="button"
          onClick={() => setActiveTab('cnic')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'cnic'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          NADRA CNIC Decoder
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ntn')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeTab === 'ntn'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Building className="h-4 w-4" />
          FBR NTN Validator
        </button>
      </div>

      {/* Mode A: CNIC Decoder */}
      {activeTab === 'cnic' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input & Presets */}
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Enter 13-Digit Pakistani CNIC
              </label>

              <div className="relative">
                <input
                  type="text"
                  maxLength={15}
                  value={cnicInput}
                  onChange={(e) => handleCnicChange(e.target.value)}
                  placeholder="35201-1234567-1"
                  className="w-full px-5 py-3.5 text-xl tracking-widest font-mono font-bold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Sample Presets */}
              <div className="pt-2">
                <span className="text-xs text-slate-400 mb-2 block">Try Sample Test CNICs:</span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_CNICS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setCnicInput(s.value)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                        cnicInput === s.value
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Privacy Badge */}
            <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/5 p-6 dark:border-emerald-500/20 dark:bg-emerald-950/20 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  100% Zero-Server Privacy Guarantee
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Your CNIC is processed entirely inside your local browser memory. No data is stored, cached, logged, or sent over any internet connection.
                </p>
              </div>
            </div>
          </div>

          {/* Decoded Results */}
          <div className="lg:col-span-6 space-y-6">
            {cnicResult.isValid ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 text-white shadow-2xl relative overflow-hidden space-y-6">
                <div className="flex items-center justify-between border-b border-emerald-500/30 pb-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-widest text-emerald-200 font-bold">
                      NADRA Decoded Identity
                    </span>
                    <div className="text-2xl font-mono font-black text-white mt-0.5">
                      {cnicResult.formattedCnic}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-400/20 text-emerald-200 text-xs font-bold rounded-full border border-emerald-300/30">
                    Valid Format 🟢
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-emerald-200 block text-[11px]">Province / Administrative Region:</span>
                    <span className="text-base font-bold text-white block mt-0.5">{cnicResult.provinceName}</span>
                    <span className="text-xs text-emerald-300 block">{cnicResult.provinceUrdu} (Code {cnicResult.provinceCode})</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-emerald-200 block text-[11px]">Administrative Division:</span>
                    <span className="text-base font-bold text-white block mt-0.5">{cnicResult.divisionName}</span>
                    <span className="text-xs text-emerald-300 block">Division Code {cnicResult.divisionCode}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-emerald-200 block text-[11px]">Likely District Hierarchy:</span>
                    <span className="text-sm font-bold text-white block mt-0.5">{cnicResult.likelyDistrict}</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                    <span className="text-emerald-200 block text-[11px]">Gender Parity (Digit {cnicResult.genderDigit}):</span>
                    <span className="text-base font-bold text-white block mt-0.5">{cnicResult.gender}</span>
                    <span className="text-xs text-emerald-300 block">{cnicResult.genderUrdu} ({cnicResult.genderDigit % 2 !== 0 ? 'Odd = Male' : 'Even = Female'})</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-8 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 text-center space-y-3">
                <AlertCircle className="h-10 w-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Enter Complete 13-Digit CNIC
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {cnicResult.errorMessage || 'Please enter a valid 13-digit Pakistani National Identity Card number.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode B: NTN Validator */}
      {activeTab === 'ntn' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Enter 7-8 Digit FBR NTN (National Tax Number)
              </label>

              <div className="relative">
                <input
                  type="text"
                  maxLength={10}
                  value={ntnInput}
                  onChange={(e) => handleNtnChange(e.target.value)}
                  placeholder="1435805-0"
                  className="w-full px-5 py-3.5 text-xl tracking-widest font-mono font-bold rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Sample NTN Presets */}
              <div className="pt-2">
                <span className="text-xs text-slate-400 mb-2 block">Try Sample Valid NTNs:</span>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_NTNS.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setNtnInput(s.value)}
                      className={`px-3 py-1 text-xs rounded-lg border transition-all ${
                        ntnInput === s.value
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className={`rounded-3xl border p-6 text-white shadow-2xl relative overflow-hidden space-y-6 ${
              ntnResult.isValid
                ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900'
                : 'border-rose-500/30 bg-gradient-to-br from-rose-600 via-red-700 to-slate-900'
            }`}>
              <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-emerald-200 font-bold">
                    FBR NTN Validation
                  </span>
                  <div className="text-2xl font-mono font-black text-white mt-0.5">
                    {ntnResult.formattedNtn}
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${
                  ntnResult.isValid ? 'bg-emerald-400/20 text-emerald-200 border-emerald-300/30' : 'bg-rose-400/20 text-rose-200 border-rose-300/30'
                }`}>
                  {ntnResult.isValid ? 'Checksum Valid 🟢' : 'Invalid Checksum 🔴'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-emerald-200 block text-[11px]">Entity Category:</span>
                  <span className="text-base font-bold text-white block mt-0.5">{ntnResult.entityType}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <span className="text-emerald-200 block text-[11px]">Checksum Calculation:</span>
                  <span className="text-sm font-bold text-white block mt-0.5">
                    Calculated Check Digit: {ntnResult.calculatedCheckDigit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FAQs Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 md:p-8 shadow-sm backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/60">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-emerald-500" />
          Frequently Asked Questions (NADRA CNIC & FBR NTN)
        </h2>

        <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="flex items-center justify-between w-full text-left font-bold text-sm text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <div>
                  <span>{faq.q}</span>
                  <span className="block text-xs font-normal text-emerald-600 dark:text-emerald-400 mt-0.5">{faq.qUrdu}</span>
                </div>
                {activeFaq === idx ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
              </button>

              {activeFaq === idx && (
                <div className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line pl-2 border-l-2 border-emerald-500">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
