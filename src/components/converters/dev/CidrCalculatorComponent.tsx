'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateIpv4Subnet,
  calculateIpv6Subnet,
  splitSubnetIntoChunks,
  generateSubnetReferenceTable,
  CIDR_PRESETS,
  Ipv4SubnetResult,
  Ipv6SubnetResult,
  SubnetChunk,
  SubnetReferenceRow,
} from '@/lib/converters/dev/cidr-tools';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Network,
  Globe,
  Layers,
  Sliders,
  Copy,
  Check,
  Download,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Server,
  Binary,
  Table,
  ArrowRight,
  Info,
  Hash,
  Share2,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CidrCalculatorComponentProps {
  tool?: ToolMetadata;
}

type TabType = 'ipv4' | 'ipv6' | 'vlsm' | 'cheatsheet';

export const CidrCalculatorComponent: React.FC<CidrCalculatorComponentProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('ipv4');

  // IPv4 State
  const [ipv4Input, setIpv4Input] = useState<string>('192.168.1.1');
  const [ipv4Cidr, setIpv4Cidr] = useState<number>(24);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // IPv6 State
  const [ipv6Input, setIpv6Input] = useState<string>('2001:0db8:85a3:0000:0000:8a2e:0370:7334');
  const [ipv6Prefix, setIpv6Prefix] = useState<number>(64);

  // VLSM Subnet Splitter State
  const [vlsmParentIp, setVlsmParentIp] = useState<string>('10.0.0.0');
  const [vlsmParentCidr, setVlsmParentCidr] = useState<number>(16);
  const [vlsmTargetCidr, setVlsmTargetCidr] = useState<number>(24);

  // Search in CheatSheet
  const [cheatSheetQuery, setCheatSheetQuery] = useState<string>('');

  // Handle IPv4 calculation
  const ipv4Result: Ipv4SubnetResult | { error: string } = useMemo(() => {
    try {
      return calculateIpv4Subnet(ipv4Input, ipv4Cidr);
    } catch (err: any) {
      return { error: err.message || 'Invalid IPv4 address or CIDR' };
    }
  }, [ipv4Input, ipv4Cidr]);

  // Handle IPv6 calculation
  const ipv6Result: Ipv6SubnetResult | { error: string } = useMemo(() => {
    try {
      return calculateIpv6Subnet(ipv6Input, ipv6Prefix);
    } catch (err: any) {
      return { error: err.message || 'Invalid IPv6 address or prefix' };
    }
  }, [ipv6Input, ipv6Prefix]);

  // Handle VLSM split
  const vlsmChunks: SubnetChunk[] = useMemo(() => {
    if (vlsmTargetCidr <= vlsmParentCidr) return [];
    try {
      return splitSubnetIntoChunks(vlsmParentIp, vlsmParentCidr, vlsmTargetCidr, 128);
    } catch {
      return [];
    }
  }, [vlsmParentIp, vlsmParentCidr, vlsmTargetCidr]);

  // CheatSheet rows
  const cheatSheetRows: SubnetReferenceRow[] = useMemo(() => {
    const all = generateSubnetReferenceTable();
    if (!cheatSheetQuery.trim()) return all;
    const q = cheatSheetQuery.toLowerCase();
    return all.filter(
      (r) =>
        `/${r.prefix}`.includes(q) ||
        r.netmask.includes(q) ||
        r.wildcard.includes(q) ||
        r.usableHosts.toString().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }, [cheatSheetQuery]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleApplyPreset = (preset: typeof CIDR_PRESETS[0]) => {
    if (preset.category === 'IPv6 NextGen') {
      setActiveTab('ipv6');
      setIpv6Input(preset.ip);
      setIpv6Prefix(preset.cidr);
    } else {
      setActiveTab('ipv4');
      setIpv4Input(preset.ip);
      setIpv4Cidr(preset.cidr);
    }
  };

  const downloadVlsmPlan = (format: 'json' | 'csv') => {
    let content = '';
    let mimeType = 'text/plain';
    let filename = `subnet-plan-${vlsmParentIp.replace(/\./g, '-')}-${vlsmParentCidr}-to-${vlsmTargetCidr}.${format}`;

    if (format === 'json') {
      content = JSON.stringify(
        {
          parentNetwork: `${vlsmParentIp}/${vlsmParentCidr}`,
          targetSubnetPrefix: `/${vlsmTargetCidr}`,
          totalSubnets: Math.pow(2, vlsmTargetCidr - vlsmParentCidr),
          subnets: vlsmChunks,
        },
        null,
        2
      );
      mimeType = 'application/json';
    } else {
      const headers = ['Subnet #', 'CIDR', 'Network Address', 'Subnet Mask', 'First Usable Host', 'Last Usable Host', 'Broadcast Address', 'Usable Hosts'];
      const rows = vlsmChunks.map((c) => [
        c.index,
        c.cidrNotation,
        c.networkAddress,
        c.netmask,
        c.firstUsableHost,
        c.lastUsableHost,
        c.broadcastAddress,
        c.usableHosts,
      ]);
      content = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header & Assurance */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/60 backdrop-blur border border-border/60 p-5 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              CIDR & Subnet IP Calculator
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-medium">
                IPv4 & IPv6
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Client-side subnets, network/broadcast math, binary visualizer, and VLSM breakdown.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PrivacyAssuranceBadge />
        </div>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Presets:
        </span>
        {CIDR_PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleApplyPreset(p)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted/60 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/30 border border-border/60 transition-all whitespace-nowrap flex items-center gap-1.5"
            title={p.description}
          >
            <Server className="w-3 h-3 text-muted-foreground" />
            {p.name}
          </button>
        ))}
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-border/80 gap-2">
        <button
          onClick={() => setActiveTab('ipv4')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2',
            activeTab === 'ipv4'
              ? 'border-blue-500 text-blue-500 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
          )}
        >
          <Network className="w-4 h-4" />
          IPv4 Subnet Calculator
        </button>

        <button
          onClick={() => setActiveTab('ipv6')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2',
            activeTab === 'ipv6'
              ? 'border-blue-500 text-blue-500 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
          )}
        >
          <Globe className="w-4 h-4" />
          IPv6 Subnet Calculator
        </button>

        <button
          onClick={() => setActiveTab('vlsm')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2',
            activeTab === 'vlsm'
              ? 'border-blue-500 text-blue-500 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
          )}
        >
          <Layers className="w-4 h-4" />
          VLSM Subnet Splitter
        </button>

        <button
          onClick={() => setActiveTab('cheatsheet')}
          className={cn(
            'px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2',
            activeTab === 'cheatsheet'
              ? 'border-blue-500 text-blue-500 bg-blue-500/5'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40'
          )}
        >
          <Table className="w-4 h-4" />
          Subnet Cheat Sheet (/0 - /32)
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: IPv4 SUBNET CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'ipv4' && (
        <div className="space-y-6">
          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-card/60 backdrop-blur border border-border/60 p-5 rounded-2xl shadow-sm">
            <div className="md:col-span-6 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>IPv4 Address or CIDR Notation</span>
                <span className="text-[11px] font-normal text-muted-foreground/80">e.g. 192.168.1.50 or 10.0.0.1/16</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={ipv4Input}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIpv4Input(val);
                    if (val.includes('/')) {
                      const p = parseInt(val.split('/')[1], 10);
                      if (!isNaN(p) && p >= 0 && p <= 32) setIpv4Cidr(p);
                    }
                  }}
                  placeholder="192.168.1.1"
                  className="w-full h-11 px-3.5 py-2 rounded-xl bg-background border border-border/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-mono transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>CIDR Prefix</span>
                <span className="text-blue-500 font-mono font-bold">/{ipv4Cidr}</span>
              </label>
              <select
                value={ipv4Cidr}
                onChange={(e) => setIpv4Cidr(parseInt(e.target.value, 10))}
                className="w-full h-11 px-3 py-2 rounded-xl bg-background border border-border/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-mono cursor-pointer transition-all"
              >
                {Array.from({ length: 33 }, (_, i) => 32 - i).map((c) => {
                  const hosts = c === 32 ? 1 : c === 31 ? 2 : Math.max(0, Math.pow(2, 32 - c) - 2);
                  return (
                    <option key={c} value={c}>
                      /{c} — {hosts.toLocaleString()} hosts
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Prefix Slider (/{ipv4Cidr})
              </label>
              <div className="h-11 flex items-center px-1">
                <input
                  type="range"
                  min="0"
                  max="32"
                  value={ipv4Cidr}
                  onChange={(e) => setIpv4Cidr(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {'error' in ipv4Result ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{ipv4Result.error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Primary Metric Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-1">
                  <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                    <span>Usable Hosts</span>
                    <Server className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-bold text-foreground font-mono">
                    {ipv4Result.usableHosts.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Total: {ipv4Result.totalAddresses.toLocaleString()} IPs
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-1">
                  <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                    <span>Network Address</span>
                    <Network className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-lg font-bold text-foreground font-mono truncate" title={ipv4Result.networkAddress}>
                    {ipv4Result.networkAddress}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    CIDR: /{ipv4Result.cidr}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-1">
                  <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                    <span>Subnet Mask</span>
                    <Sliders className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="text-lg font-bold text-foreground font-mono truncate" title={ipv4Result.netmask}>
                    {ipv4Result.netmask}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Wildcard: {ipv4Result.wildcardMask}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-1">
                  <div className="text-xs text-muted-foreground font-medium flex items-center justify-between">
                    <span>Network Class & Scope</span>
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                      Class {ipv4Result.ipClass}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-md border',
                        ipv4Result.isPrivate
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      )}
                    >
                      {ipv4Result.isPrivate ? 'Private (RFC 1918)' : 'Public Internet'}
                    </span>
                  </div>
                  <div className="text-[11px] text-muted-foreground truncate" title={ipv4Result.ipType}>
                    {ipv4Result.ipType}
                  </div>
                </div>
              </div>

              {/* Comprehensive Breakdown Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Addressing Parameters */}
                <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-500" />
                    Subnet Addressing Breakdown
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { label: 'CIDR Notation', val: ipv4Result.cidrNotation, key: 'cidr' },
                      { label: 'Network Address', val: ipv4Result.networkAddress, key: 'net' },
                      { label: 'Broadcast Address', val: ipv4Result.broadcastAddress, key: 'bcast' },
                      { label: 'First Usable Host', val: ipv4Result.firstUsableHost, key: 'first' },
                      { label: 'Last Usable Host', val: ipv4Result.lastUsableHost, key: 'last' },
                      { label: 'Subnet Netmask', val: ipv4Result.netmask, key: 'mask' },
                      { label: 'Wildcard / Inverse Mask', val: ipv4Result.wildcardMask, key: 'wildcard' },
                      { label: 'IP Integer / Long Decimal', val: ipv4Result.ipInteger.toString(), key: 'int' },
                      { label: 'IP Hexadecimal', val: ipv4Result.ipHex, key: 'hex' },
                      { label: 'IPv4-Mapped IPv6', val: ipv4Result.mappedIpv6, key: 'mapped6' },
                      { label: '6to4 Prefix (/48)', val: ipv4Result.sixToFourIpv6, key: '6to4' },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40 font-mono"
                      >
                        <span className="text-muted-foreground font-sans font-medium">{item.label}:</span>
                        <div className="flex items-center gap-2 font-semibold text-foreground">
                          <span>{item.val}</span>
                          <button
                            onClick={() => copyToClipboard(item.val, item.key)}
                            className="p-1 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-all"
                            title="Copy to clipboard"
                          >
                            {copiedKey === item.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Binary Visualizer */}
                <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Binary className="w-4 h-4 text-emerald-500" />
                        32-Bit Binary Representation
                      </h3>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1.5 font-medium text-blue-500">
                          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" /> Network ({ipv4Result.cidr}b)
                        </span>
                        <span className="flex items-center gap-1.5 font-medium text-emerald-500">
                          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" /> Host ({32 - ipv4Result.cidr}b)
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      {[
                        { label: 'IP Address Binary', bin: ipv4Result.ipBinary },
                        { label: 'Subnet Mask Binary', bin: ipv4Result.netmaskBinary },
                        { label: 'Network Binary', bin: ipv4Result.networkBinary },
                        { label: 'Broadcast Binary', bin: ipv4Result.broadcastBinary },
                        { label: 'Wildcard Binary', bin: ipv4Result.wildcardBinary },
                      ].map((b) => {
                        const rawBits = b.bin.replace(/\./g, '');
                        const netBits = rawBits.slice(0, ipv4Result.cidr);
                        const hostBits = rawBits.slice(ipv4Result.cidr);

                        return (
                          <div key={b.label} className="space-y-1 bg-muted/40 p-3 rounded-xl border border-border/40">
                            <div className="text-[11px] font-sans font-medium text-muted-foreground">
                              {b.label}
                            </div>
                            <div className="text-xs tracking-wider break-all">
                              <span className="text-blue-500 font-bold">{netBits}</span>
                              <span className="text-emerald-500 font-bold">{hostBits}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Usable Host Range Summary Bar */}
                  <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1.5">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between">
                      <span>Usable Host IP Range:</span>
                      <span>{ipv4Result.usableHosts.toLocaleString()} Hosts</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-foreground flex items-center gap-2">
                      <span>{ipv4Result.firstUsableHost}</span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <span>{ipv4Result.lastUsableHost}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IPv6 SUBNET CALCULATOR */}
      {/* ========================================================================= */}
      {activeTab === 'ipv6' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-card/60 backdrop-blur border border-border/60 p-5 rounded-2xl shadow-sm">
            <div className="md:col-span-8 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>IPv6 Address or CIDR Notation</span>
                <span className="text-[11px] font-normal text-muted-foreground/80">e.g. 2001:db8::1 or fe80::1/64</span>
              </label>
              <input
                type="text"
                value={ipv6Input}
                onChange={(e) => {
                  const val = e.target.value;
                  setIpv6Input(val);
                  if (val.includes('/')) {
                    const p = parseInt(val.split('/')[1], 10);
                    if (!isNaN(p) && p >= 0 && p <= 128) setIpv6Prefix(p);
                  }
                }}
                placeholder="2001:db8::1"
                className="w-full h-11 px-3.5 py-2 rounded-xl bg-background border border-border/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-mono transition-all"
              />
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                <span>Prefix Length</span>
                <span className="text-blue-500 font-mono font-bold">/{ipv6Prefix}</span>
              </label>
              <select
                value={ipv6Prefix}
                onChange={(e) => setIpv6Prefix(parseInt(e.target.value, 10))}
                className="w-full h-11 px-3 py-2 rounded-xl bg-background border border-border/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-mono cursor-pointer transition-all"
              >
                {[128, 127, 126, 120, 112, 96, 64, 60, 56, 48, 32, 24, 16, 8, 0].map((p) => (
                  <option key={p} value={p}>
                    /{p} {p === 64 ? '(Standard SLAAC Subnet)' : p === 48 ? '(Standard End-Site Allocation)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {'error' in ipv6Result ? (
            <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{ipv6Result.error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">Compressed IPv6</div>
                  <div className="text-lg font-bold font-mono text-foreground truncate" title={ipv6Result.compressedIp}>
                    {ipv6Result.compressedIp}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Prefix: /{ipv6Result.prefix}</div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">Scope & Classification</div>
                  <div className="text-base font-bold text-blue-500 truncate" title={ipv6Result.ipType}>
                    {ipv6Result.ipType}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {ipv6Result.isPrivate ? 'Non-Routable / Private Scope' : 'Global Public Internet Scope'}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/60 shadow-sm space-y-1">
                  <div className="text-xs text-muted-foreground font-medium">Total Addresses Available</div>
                  <div className="text-sm font-bold font-mono text-foreground truncate" title={ipv6Result.totalAddressesNotation}>
                    {ipv6Result.totalAddressesNotation}
                  </div>
                  <div className="text-[11px] text-muted-foreground">Host Bits: {128 - ipv6Result.prefix} bits</div>
                </div>
              </div>

              {/* Full Details List */}
              <div className="bg-card/60 backdrop-blur border border-border/60 rounded-2xl p-5 space-y-3 text-xs font-mono shadow-sm">
                <h3 className="text-sm font-bold font-sans text-foreground flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-blue-500" />
                  Detailed IPv6 Breakdown
                </h3>

                {[
                  { label: 'Full Expanded Format', val: ipv6Result.expandedIp, key: 'exp' },
                  { label: 'RFC 5952 Compressed', val: ipv6Result.compressedIp, key: 'comp' },
                  { label: 'Subnet Network Prefix', val: ipv6Result.networkPrefix, key: 'netp' },
                  { label: 'Interface ID (Lower 64b)', val: ipv6Result.interfaceId, key: 'iface' },
                  { label: '128-Bit Binary String', val: ipv6Result.binaryRepresentation, key: 'bin' },
                ].map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted/70 transition-colors border border-border/40 gap-2"
                  >
                    <span className="text-muted-foreground font-sans font-medium">{row.label}:</span>
                    <div className="flex items-center gap-2 font-semibold text-foreground overflow-x-auto">
                      <span className="break-all">{row.val}</span>
                      <button
                        onClick={() => copyToClipboard(row.val, row.key)}
                        className="p-1 rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-all flex-shrink-0"
                      >
                        {copiedKey === row.key ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: VLSM SUBNET SPLITTER */}
      {/* ========================================================================= */}
      {activeTab === 'vlsm' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-card/60 backdrop-blur border border-border/60 p-5 rounded-2xl shadow-sm">
            <div className="md:col-span-5 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Parent Network Address
              </label>
              <input
                type="text"
                value={vlsmParentIp}
                onChange={(e) => setVlsmParentIp(e.target.value)}
                placeholder="10.0.0.0"
                className="w-full h-11 px-3.5 py-2 rounded-xl bg-background border border-border/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-mono"
              />
            </div>

            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Parent CIDR (/{vlsmParentCidr})
              </label>
              <select
                value={vlsmParentCidr}
                onChange={(e) => {
                  const p = parseInt(e.target.value, 10);
                  setVlsmParentCidr(p);
                  if (vlsmTargetCidr <= p) setVlsmTargetCidr(p + 1);
                }}
                className="w-full h-11 px-3 py-2 rounded-xl bg-background border border-border/80 focus:border-blue-500 text-sm font-mono cursor-pointer"
              >
                {Array.from({ length: 32 }, (_, i) => i).map((c) => (
                  <option key={c} value={c}>
                    /{c} (Parent)
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Split Into Subnets of (/{vlsmTargetCidr})
              </label>
              <select
                value={vlsmTargetCidr}
                onChange={(e) => setVlsmTargetCidr(parseInt(e.target.value, 10))}
                className="w-full h-11 px-3 py-2 rounded-xl bg-background border border-border/80 focus:border-blue-500 text-sm font-mono cursor-pointer"
              >
                {Array.from({ length: 33 - (vlsmParentCidr + 1) }, (_, i) => vlsmParentCidr + 1 + i).map((c) => {
                  const numSubnets = Math.pow(2, c - vlsmParentCidr);
                  const hosts = c === 32 ? 1 : c === 31 ? 2 : Math.max(0, Math.pow(2, 32 - c) - 2);
                  return (
                    <option key={c} value={c}>
                      /{c} ({numSubnets.toLocaleString()} subnets, {hosts.toLocaleString()} hosts each)
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Action Toolbar for VLSM */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-2xl border border-border/60">
            <div className="text-xs text-muted-foreground font-medium">
              Generating <strong className="text-foreground">{Math.pow(2, vlsmTargetCidr - vlsmParentCidr).toLocaleString()}</strong> subnets of size{' '}
              <strong className="text-blue-500">/{vlsmTargetCidr}</strong> from parent{' '}
              <strong className="text-foreground">{vlsmParentIp}/{vlsmParentCidr}</strong>.
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadVlsmPlan('csv')}
                className="gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadVlsmPlan('json')}
                className="gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Subnets Table */}
          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] font-sans font-bold border-b border-border/60">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Subnet CIDR</th>
                  <th className="p-3">Subnet Mask</th>
                  <th className="p-3">Usable Host Range</th>
                  <th className="p-3">Broadcast</th>
                  <th className="p-3 text-right">Usable Hosts</th>
                  <th className="p-3 text-center">Copy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {vlsmChunks.map((chunk) => (
                  <tr key={chunk.index} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-sans font-semibold text-muted-foreground">{chunk.index}</td>
                    <td className="p-3 font-bold text-blue-500">{chunk.cidrNotation}</td>
                    <td className="p-3 text-muted-foreground">{chunk.netmask}</td>
                    <td className="p-3 text-foreground font-semibold">
                      {chunk.firstUsableHost} — {chunk.lastUsableHost}
                    </td>
                    <td className="p-3 text-muted-foreground">{chunk.broadcastAddress}</td>
                    <td className="p-3 text-right font-bold text-emerald-500">
                      {chunk.usableHosts.toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => copyToClipboard(chunk.cidrNotation, `chunk-${chunk.index}`)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        title="Copy CIDR"
                      >
                        {copiedKey === `chunk-${chunk.index}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: COMPLETE SUBMET REFERENCE CHEAT SHEET */}
      {/* ========================================================================= */}
      {activeTab === 'cheatsheet' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 backdrop-blur border border-border/60 p-4 rounded-2xl shadow-sm">
            <div className="text-xs text-muted-foreground">
              Master reference table for all IPv4 Subnet Masks, Wildcards, Host Capacities, and standard use cases.
            </div>
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={cheatSheetQuery}
                onChange={(e) => setCheatSheetQuery(e.target.value)}
                placeholder="Search mask, hosts, /24..."
                className="w-full h-9 px-3 text-xs rounded-xl bg-background border border-border/80 focus:border-blue-500 font-sans"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-muted/70 text-muted-foreground uppercase text-[10px] font-sans font-bold border-b border-border/60">
                <tr>
                  <th className="p-3">Prefix</th>
                  <th className="p-3">Subnet Mask</th>
                  <th className="p-3">Wildcard Mask</th>
                  <th className="p-3 text-right">Total IPs</th>
                  <th className="p-3 text-right">Usable Hosts</th>
                  <th className="p-3 font-sans">Common Standard Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {cheatSheetRows.map((row) => (
                  <tr key={row.prefix} className="hover:bg-muted/40 transition-colors">
                    <td className="p-3 font-bold text-blue-500">/{row.prefix}</td>
                    <td className="p-3 text-foreground font-semibold">{row.netmask}</td>
                    <td className="p-3 text-muted-foreground">{row.wildcard}</td>
                    <td className="p-3 text-right text-muted-foreground">{row.totalIps.toLocaleString()}</td>
                    <td className="p-3 text-right font-bold text-emerald-500">{row.usableHosts.toLocaleString()}</td>
                    <td className="p-3 font-sans text-muted-foreground text-xs">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
