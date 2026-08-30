'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Binary, Copy, Check, Hash, Sparkles, Sliders } from 'lucide-react';

export const NumberBaseConverter: React.FC = () => {
  // Current numeric value held as BigInt or 0
  const [currentVal, setCurrentVal] = useState<bigint>(BigInt(255));
  const [activeBase, setActiveBase] = useState<'dec' | 'bin' | 'hex' | 'oct'>('dec');
  const [rawInputs, setRawInputs] = useState({
    dec: '255',
    bin: '11111111',
    hex: 'FF',
    oct: '377',
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Sync inputs when numeric value updates from a specific base
  const updateFromBase = (valStr: string, base: 'dec' | 'bin' | 'hex' | 'oct') => {
    setActiveBase(base);
    setRawInputs((prev) => ({ ...prev, [base]: valStr }));

    const clean = valStr.trim();
    if (!clean) {
      setCurrentVal(BigInt(0));
      return;
    }

    try {
      let parsed: bigint = BigInt(0);
      if (base === 'dec') {
        if (/^-?\d+$/.test(clean)) parsed = BigInt(clean);
      } else if (base === 'bin') {
        if (/^[01]+$/.test(clean)) parsed = BigInt(`0b${clean}`);
      } else if (base === 'hex') {
        if (/^[0-9a-fA-F]+$/.test(clean)) parsed = BigInt(`0x${clean}`);
      } else if (base === 'oct') {
        if (/^[0-7]+$/.test(clean)) parsed = BigInt(`0o${clean}`);
      }

      setCurrentVal(parsed);
      // Update other base strings
      setRawInputs({
        dec: parsed.toString(10),
        bin: parsed.toString(2),
        hex: parsed.toString(16).toUpperCase(),
        oct: parsed.toString(8),
      });
    } catch {
      // Invalid input ignored for other fields until valid
    }
  };

  // Toggle individual bit (0 to 7)
  const handleToggleBit = (bitIndex: number) => {
    const bitMask = BigInt(1) << BigInt(bitIndex);
    const newVal = currentVal ^ bitMask;
    setCurrentVal(newVal);
    setRawInputs({
      dec: newVal.toString(10),
      bin: newVal.toString(2),
      hex: newVal.toString(16).toUpperCase(),
      oct: newVal.toString(8),
    });
  };

  // ASCII representation
  const asciiChar = useMemo(() => {
    const num = Number(currentVal);
    if (num >= 32 && num <= 126) {
      return String.fromCharCode(num);
    }
    if (num === 10) return 'Line Feed (\\n)';
    if (num === 13) return 'Carriage Return (\\r)';
    if (num === 9) return 'Tab (\\t)';
    if (num === 0) return 'Null (\\0)';
    return 'Non-printable / Extended';
  }, [currentVal]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // 8-bit visual bits
  const bitArray = useMemo(() => {
    const bits: boolean[] = [];
    for (let i = 7; i >= 0; i--) {
      const isSet = (currentVal & (BigInt(1) << BigInt(i))) !== BigInt(0);
      bits.push(isSet);
    }
    return bits;
  }, [currentVal]);

  return (
    <div className="space-y-6">
      {/* 4-way Live Base Inputs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Decimal (Base 10) */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Decimal (Base 10)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(rawInputs.dec, 'dec')}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {copiedKey === 'dec' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Input
            type="text"
            value={rawInputs.dec}
            onChange={(e) => updateFromBase(e.target.value, 'dec')}
            placeholder="0-9"
            className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400"
          />
          <p className="text-[11px] text-slate-400">Standard base-10 numerical system</p>
        </div>

        {/* Binary (Base 2) */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Binary (Base 2)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(rawInputs.bin, 'bin')}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {copiedKey === 'bin' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Input
            type="text"
            value={rawInputs.bin}
            onChange={(e) => updateFromBase(e.target.value, 'bin')}
            placeholder="0 or 1"
            className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400"
          />
          <p className="text-[11px] text-slate-400">0b prefix • Digital computer logic</p>
        </div>

        {/* Hexadecimal (Base 16) */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Hexadecimal (Base 16)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(rawInputs.hex, 'hex')}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {copiedKey === 'hex' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Input
            type="text"
            value={rawInputs.hex}
            onChange={(e) => updateFromBase(e.target.value, 'hex')}
            placeholder="0-9, A-F"
            className="font-mono text-base font-bold text-amber-600 dark:text-amber-400"
          />
          <p className="text-[11px] text-slate-400">0x prefix • Memory addresses & color codes</p>
        </div>

        {/* Octal (Base 8) */}
        <div className="space-y-1.5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Octal (Base 8)
            </label>
            <button
              type="button"
              onClick={() => handleCopy(rawInputs.oct, 'oct')}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              {copiedKey === 'oct' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <Input
            type="text"
            value={rawInputs.oct}
            onChange={(e) => updateFromBase(e.target.value, 'oct')}
            placeholder="0-7"
            className="font-mono text-base font-bold text-purple-600 dark:text-purple-400"
          />
          <p className="text-[11px] text-slate-400">0o prefix • UNIX file permissions (e.g. 755)</p>
        </div>
      </div>

      {/* Interactive 8-Bit Switchboard */}
      <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Interactive 8-Bit Binary Switchboard
            </h4>
          </div>
          <span className="text-xs text-slate-500">Click any bit to toggle 0 / 1</span>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {bitArray.map((isSet, idx) => {
            const bitIndex = 7 - idx;
            const bitWeight = Math.pow(2, bitIndex);
            return (
              <button
                key={`bit-${bitIndex}`}
                type="button"
                onClick={() => handleToggleBit(bitIndex)}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 sm:p-3.5 transition-all ${
                  isSet
                    ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <span className="font-mono text-lg font-extrabold">{isSet ? '1' : '0'}</span>
                <span className={`text-[10px] font-mono mt-1 ${isSet ? 'text-emerald-100' : 'text-slate-400'}`}>
                  2^{bitIndex} ({bitWeight})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ASCII Character Map Card */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-xs dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-700 dark:text-slate-300">ASCII Symbol:</span>
          <span className="rounded-lg bg-indigo-50 px-3 py-1 font-mono text-sm font-bold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
            {asciiChar}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateFromBase('0', 'dec')}
          >
            Reset (0)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateFromBase('255', 'dec')}
          >
            Max 8-bit (255)
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateFromBase('65535', 'dec')}
          >
            Max 16-bit (65535)
          </Button>
        </div>
      </div>
    </div>
  );
};
