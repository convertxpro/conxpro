/**
 * CIDR & Subnet IP Calculator Engine
 * 100% Client-side IPv4 & IPv6 Subnetting, Bitwise Math, and VLSM Generator.
 */

export interface Ipv4SubnetResult {
  ip: string;
  cidr: number;
  cidrNotation: string;
  netmask: string;
  wildcardMask: string;
  networkAddress: string;
  broadcastAddress: string;
  firstUsableHost: string;
  lastUsableHost: string;
  totalAddresses: number;
  usableHosts: number;
  ipClass: 'A' | 'B' | 'C' | 'D' | 'E';
  ipType: string;
  isPrivate: boolean;
  ipBinary: string;
  netmaskBinary: string;
  wildcardBinary: string;
  networkBinary: string;
  broadcastBinary: string;
  ipHex: string;
  ipInteger: number;
  mappedIpv6: string;
  sixToFourIpv6: string;
}

export interface SubnetChunk {
  index: number;
  cidrNotation: string;
  networkAddress: string;
  netmask: string;
  firstUsableHost: string;
  lastUsableHost: string;
  broadcastAddress: string;
  usableHosts: number;
}

export interface Ipv6SubnetResult {
  ip: string;
  prefix: number;
  cidrNotation: string;
  expandedIp: string;
  compressedIp: string;
  networkPrefix: string;
  interfaceId: string;
  totalAddressesNotation: string;
  ipType: string;
  isPrivate: boolean;
  binaryRepresentation: string;
}

export interface SubnetReferenceRow {
  prefix: number;
  netmask: string;
  wildcard: string;
  totalIps: number;
  usableHosts: number;
  description: string;
}

// -------------------------------------------------------------
// IPv4 Bitwise Helper Functions
// -------------------------------------------------------------

export function ipToNumber(ip: string): number {
  const octets = ip.trim().split('.').map((o) => parseInt(o, 10));
  if (octets.length !== 4 || octets.some((o) => isNaN(o) || o < 0 || o > 255)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }
  return ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;
}

export function numberToIp(num: number): string {
  const n = num >>> 0;
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

export function cidrToNetmaskNumber(cidr: number): number {
  if (cidr === 0) return 0;
  return (0xffffffff << (32 - cidr)) >>> 0;
}

export function netmaskToCidr(mask: string): number {
  const num = ipToNumber(mask);
  let count = 0;
  let seenZero = false;
  for (let i = 31; i >= 0; i--) {
    const bit = (num >>> i) & 1;
    if (bit === 1) {
      if (seenZero) throw new Error('Non-contiguous subnet mask');
      count++;
    } else {
      seenZero = true;
    }
  }
  return count;
}

export function toBinaryOctets(num: number): string {
  const n = num >>> 0;
  const b1 = ((n >>> 24) & 255).toString(2).padStart(8, '0');
  const b2 = ((n >>> 16) & 255).toString(2).padStart(8, '0');
  const b3 = ((n >>> 8) & 255).toString(2).padStart(8, '0');
  const b4 = (n & 255).toString(2).padStart(8, '0');
  return `${b1}.${b2}.${b3}.${b4}`;
}

export function getIpClass(firstOctet: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (firstOctet >= 1 && firstOctet <= 126) return 'A';
  if (firstOctet === 127) return 'A'; // Loopback
  if (firstOctet >= 128 && firstOctet <= 191) return 'B';
  if (firstOctet >= 192 && firstOctet <= 223) return 'C';
  if (firstOctet >= 224 && firstOctet <= 239) return 'D';
  return 'E';
}

export function getIpType(ipNum: number): { type: string; isPrivate: boolean } {
  const oct1 = (ipNum >>> 24) & 255;
  const oct2 = (ipNum >>> 16) & 255;

  // RFC 1918 Private
  if (oct1 === 10) return { type: 'Private Network (RFC 1918 - Class A)', isPrivate: true };
  if (oct1 === 172 && oct2 >= 16 && oct2 <= 31) return { type: 'Private Network (RFC 1918 - Class B)', isPrivate: true };
  if (oct1 === 192 && oct2 === 168) return { type: 'Private Network (RFC 1918 - Class C)', isPrivate: true };

  // Loopback
  if (oct1 === 127) return { type: 'Loopback Host (RFC 1122)', isPrivate: true };

  // Link-Local
  if (oct1 === 169 && oct2 === 254) return { type: 'Link-Local / APIPA (RFC 3927)', isPrivate: true };

  // Carrier-Grade NAT (RFC 6598)
  if (oct1 === 100 && oct2 >= 64 && oct2 <= 127) return { type: 'Carrier-Grade NAT / Shared (RFC 6598)', isPrivate: true };

  // Documentation / TEST-NET
  if (oct1 === 192 && oct2 === 0 && ((ipNum >>> 8) & 255) === 2) return { type: 'Documentation (TEST-NET-1)', isPrivate: true };
  if (oct1 === 198 && oct2 === 51 && ((ipNum >>> 8) & 255) === 100) return { type: 'Documentation (TEST-NET-2)', isPrivate: true };
  if (oct1 === 203 && oct2 === 0 && ((ipNum >>> 8) & 255) === 113) return { type: 'Documentation (TEST-NET-3)', isPrivate: true };

  // Benchmarking
  if (oct1 === 198 && (oct2 === 18 || oct2 === 19)) return { type: 'Benchmarking (RFC 2544)', isPrivate: true };

  // Multicast
  if (oct1 >= 224 && oct1 <= 239) return { type: 'Multicast (Class D)', isPrivate: false };

  // Reserved
  if (oct1 >= 240) return { type: 'Reserved (Class E)', isPrivate: false };

  // 0.0.0.0
  if (ipNum === 0) return { type: 'Current Network (RFC 1122)', isPrivate: true };

  // Global Public
  return { type: 'Public Internet (Global Unicast)', isPrivate: false };
}

// -------------------------------------------------------------
// Calculate IPv4 Subnet Result
// -------------------------------------------------------------

export function calculateIpv4Subnet(ipInput: string, cidrInput?: number | string): Ipv4SubnetResult {
  let rawIp = ipInput.trim();
  let cidr = 24;

  if (rawIp.includes('/')) {
    const parts = rawIp.split('/');
    rawIp = parts[0].trim();
    const parsedCidr = parseInt(parts[1].trim(), 10);
    if (!isNaN(parsedCidr) && parsedCidr >= 0 && parsedCidr <= 32) {
      cidr = parsedCidr;
    }
  } else if (cidrInput !== undefined) {
    if (typeof cidrInput === 'number') {
      cidr = Math.max(0, Math.min(32, Math.floor(cidrInput)));
    } else if (typeof cidrInput === 'string') {
      const trimmed = cidrInput.trim();
      if (trimmed.includes('.')) {
        cidr = netmaskToCidr(trimmed);
      } else {
        const parsed = parseInt(trimmed.replace('/', ''), 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 32) {
          cidr = parsed;
        }
      }
    }
  }

  const ipNum = ipToNumber(rawIp);
  const cleanIp = numberToIp(ipNum);
  const netmaskNum = cidrToNetmaskNumber(cidr);
  const wildcardNum = (~netmaskNum) >>> 0;
  const networkNum = (ipNum & netmaskNum) >>> 0;
  const broadcastNum = (networkNum | wildcardNum) >>> 0;

  const netmask = numberToIp(netmaskNum);
  const wildcardMask = numberToIp(wildcardNum);
  const networkAddress = numberToIp(networkNum);
  const broadcastAddress = numberToIp(broadcastNum);

  const totalAddresses = Math.pow(2, 32 - cidr);
  let usableHosts = 0;
  let firstUsableHost = networkAddress;
  let lastUsableHost = broadcastAddress;

  if (cidr === 32) {
    usableHosts = 1;
    firstUsableHost = cleanIp;
    lastUsableHost = cleanIp;
  } else if (cidr === 31) {
    // RFC 3021 Point-to-Point Links
    usableHosts = 2;
    firstUsableHost = networkAddress;
    lastUsableHost = broadcastAddress;
  } else {
    usableHosts = Math.max(0, totalAddresses - 2);
    firstUsableHost = numberToIp(networkNum + 1);
    lastUsableHost = numberToIp(broadcastNum - 1);
  }

  const oct1 = (ipNum >>> 24) & 255;
  const ipClass = getIpClass(oct1);
  const { type: ipType, isPrivate } = getIpType(ipNum);

  const ipHex = '0x' + ipNum.toString(16).padStart(8, '0').toUpperCase();

  // IPv6 mapped representations
  const hexPart = ipNum.toString(16).padStart(8, '0');
  const h1 = hexPart.slice(0, 4);
  const h2 = hexPart.slice(4, 8);
  const sixToFourIpv6 = `2002:${h1}:${h2}::/48`;
  const mappedIpv6 = `::ffff:${cleanIp}`;

  return {
    ip: cleanIp,
    cidr,
    cidrNotation: `${cleanIp}/${cidr}`,
    netmask,
    wildcardMask,
    networkAddress,
    broadcastAddress,
    firstUsableHost,
    lastUsableHost,
    totalAddresses,
    usableHosts,
    ipClass,
    ipType,
    isPrivate,
    ipBinary: toBinaryOctets(ipNum),
    netmaskBinary: toBinaryOctets(netmaskNum),
    wildcardBinary: toBinaryOctets(wildcardNum),
    networkBinary: toBinaryOctets(networkNum),
    broadcastBinary: toBinaryOctets(broadcastNum),
    ipHex,
    ipInteger: ipNum,
    mappedIpv6,
    sixToFourIpv6,
  };
}

// -------------------------------------------------------------
// Subnet Splitter / VLSM Breakdown Generator
// -------------------------------------------------------------

export function splitSubnetIntoChunks(
  parentNetworkIp: string,
  parentCidr: number,
  targetCidr: number,
  maxChunks: number = 128
): SubnetChunk[] {
  if (targetCidr <= parentCidr) {
    throw new Error('Target subnet prefix must be greater than parent network prefix');
  }

  const parentNetNum = (ipToNumber(parentNetworkIp) & cidrToNetmaskNumber(parentCidr)) >>> 0;
  const numSubnets = Math.pow(2, targetCidr - parentCidr);
  const chunkSize = Math.pow(2, 32 - targetCidr);
  const netmaskNum = cidrToNetmaskNumber(targetCidr);
  const netmaskStr = numberToIp(netmaskNum);

  const chunks: SubnetChunk[] = [];
  const limit = Math.min(numSubnets, maxChunks);

  for (let i = 0; i < limit; i++) {
    const netNum = (parentNetNum + i * chunkSize) >>> 0;
    const bcastNum = (netNum + chunkSize - 1) >>> 0;
    const netAddr = numberToIp(netNum);
    const bcastAddr = numberToIp(bcastNum);

    let firstHost = netAddr;
    let lastHost = bcastAddr;
    let usable = 0;

    if (targetCidr === 32) {
      usable = 1;
      firstHost = netAddr;
      lastHost = netAddr;
    } else if (targetCidr === 31) {
      usable = 2;
      firstHost = netAddr;
      lastHost = bcastAddr;
    } else {
      usable = Math.max(0, chunkSize - 2);
      firstHost = numberToIp(netNum + 1);
      lastHost = numberToIp(bcastNum - 1);
    }

    chunks.push({
      index: i + 1,
      cidrNotation: `${netAddr}/${targetCidr}`,
      networkAddress: netAddr,
      netmask: netmaskStr,
      firstUsableHost: firstHost,
      lastUsableHost: lastHost,
      broadcastAddress: bcastAddr,
      usableHosts: usable,
    });
  }

  return chunks;
}

// -------------------------------------------------------------
// Complete Subnet Reference Cheat Sheet (/0 to /32)
// -------------------------------------------------------------

export function generateSubnetReferenceTable(): SubnetReferenceRow[] {
  const rows: SubnetReferenceRow[] = [];
  const descriptions: Record<number, string> = {
    0: 'Default Route (Entire IPv4 Internet)',
    8: 'Class A Default Subnet (/8)',
    16: 'Class B Default Subnet (/16)',
    24: 'Class C Default Subnet (Standard LAN /24)',
    28: 'Small Office / Cloud Subnet (14 usable hosts)',
    29: 'Small Public Subnet / Routing (6 usable hosts)',
    30: 'Point-to-Point Link legacy (2 usable hosts)',
    31: 'Point-to-Point Link modern (RFC 3021)',
    32: 'Single Host / Loopback / Route',
  };

  for (let c = 0; c <= 32; c++) {
    const netmask = numberToIp(cidrToNetmaskNumber(c));
    const wildcard = numberToIp((~cidrToNetmaskNumber(c)) >>> 0);
    const totalIps = Math.pow(2, 32 - c);
    let usableHosts = 0;
    if (c === 32) usableHosts = 1;
    else if (c === 31) usableHosts = 2;
    else usableHosts = Math.max(0, totalIps - 2);

    rows.push({
      prefix: c,
      netmask,
      wildcard,
      totalIps,
      usableHosts,
      description: descriptions[c] || `/${c} Subnet (${usableHosts.toLocaleString()} hosts)`,
    });
  }

  return rows;
}

// -------------------------------------------------------------
// IPv6 Subnet Calculator Helpers
// -------------------------------------------------------------

export function expandIpv6(ipv6: string): string {
  let addr = ipv6.trim().toLowerCase();
  if (addr.includes('/')) {
    addr = addr.split('/')[0].trim();
  }

  // Handle :: expansion
  if (addr.includes('::')) {
    const parts = addr.split('::');
    const leftHextets = parts[0] ? parts[0].split(':') : [];
    const rightHextets = parts[1] ? parts[1].split(':') : [];
    const missingCount = 8 - (leftHextets.length + rightHextets.length);
    const middleHextets = new Array(missingCount).fill('0000');
    const all = [...leftHextets, ...middleHextets, ...rightHextets];
    return all.map((h) => h.padStart(4, '0')).join(':');
  }

  const hextets = addr.split(':');
  if (hextets.length !== 8) {
    throw new Error('Invalid IPv6 address structure');
  }
  return hextets.map((h) => h.padStart(4, '0')).join(':');
}

export function compressIpv6(expanded: string): string {
  const hextets = expanded.split(':').map((h) => h.replace(/^0+/, '') || '0');

  // Find longest run of consecutive '0'
  let bestStart = -1;
  let bestLen = 0;
  let curStart = -1;
  let curLen = 0;

  for (let i = 0; i < hextets.length; i++) {
    if (hextets[i] === '0') {
      if (curStart === -1) {
        curStart = i;
        curLen = 1;
      } else {
        curLen++;
      }
    } else {
      if (curLen > bestLen && curLen > 1) {
        bestStart = curStart;
        bestLen = curLen;
      }
      curStart = -1;
      curLen = 0;
    }
  }
  if (curLen > bestLen && curLen > 1) {
    bestStart = curStart;
    bestLen = curLen;
  }

  if (bestStart !== -1) {
    const left = hextets.slice(0, bestStart).join(':');
    const right = hextets.slice(bestStart + bestLen).join(':');
    return `${left}::${right}`.replace(/^:::/, '::').replace(/:::$/, '::');
  }

  return hextets.join(':');
}

export function calculateIpv6Subnet(ipv6Input: string, prefixInput: number = 64): Ipv6SubnetResult {
  let rawIp = ipv6Input.trim();
  let prefix = prefixInput;

  if (rawIp.includes('/')) {
    const parts = rawIp.split('/');
    rawIp = parts[0].trim();
    const p = parseInt(parts[1].trim(), 10);
    if (!isNaN(p) && p >= 0 && p <= 128) {
      prefix = p;
    }
  }

  const expanded = expandIpv6(rawIp);
  const compressed = compressIpv6(expanded);
  const hextets = expanded.split(':');

  // Convert to binary string
  let binaryStr = '';
  for (const h of hextets) {
    const val = parseInt(h, 16);
    binaryStr += val.toString(2).padStart(16, '0');
  }

  // Network prefix bits and interface ID
  const netBits = binaryStr.slice(0, prefix);
  const hostBits = binaryStr.slice(prefix);

  // Network prefix string (with remaining bits zeroed)
  const zeroPaddedBin = netBits.padEnd(128, '0');
  const netHextets: string[] = [];
  for (let i = 0; i < 8; i++) {
    const chunk = zeroPaddedBin.slice(i * 16, (i + 1) * 16);
    netHextets.push(parseInt(chunk, 2).toString(16).padStart(4, '0'));
  }
  const netExpanded = netHextets.join(':');
  const netCompressed = compressIpv6(netExpanded);

  // Scope / Type
  let ipType = 'Global Unicast (Public Internet)';
  let isPrivate = false;

  if (expanded.startsWith('0000:0000:0000:0000:0000:0000:0000:0001')) {
    ipType = 'Loopback (::1/128)';
    isPrivate = true;
  } else if (expanded === '0000:0000:0000:0000:0000:0000:0000:0000') {
    ipType = 'Unspecified Address (::/128)';
    isPrivate = true;
  } else if (expanded.startsWith('fe80:')) {
    ipType = 'Link-Local Unicast (fe80::/10)';
    isPrivate = true;
  } else if (expanded.startsWith('fc') || expanded.startsWith('fd')) {
    ipType = 'Unique Local Address - ULA (RFC 4193 - Private)';
    isPrivate = true;
  } else if (expanded.startsWith('ff')) {
    ipType = 'Multicast (ff00::/8)';
    isPrivate = false;
  } else if (expanded.startsWith('2001:0db8:')) {
    ipType = 'Documentation (2001:db8::/32)';
    isPrivate = true;
  } else if (expanded.startsWith('2002:')) {
    ipType = '6to4 Relay Anycast (2002::/16)';
    isPrivate = false;
  }

  const hostBitExponent = 128 - prefix;
  let totalAddressesNotation = '';
  if (hostBitExponent === 0) {
    totalAddressesNotation = '1 (Single /128 Host)';
  } else if (hostBitExponent <= 32) {
    totalAddressesNotation = Math.pow(2, hostBitExponent).toLocaleString() + ` (2^${hostBitExponent})`;
  } else {
    totalAddressesNotation = `2^${hostBitExponent} (≈ 1.84 × 10^${Math.floor(hostBitExponent * 0.30103)} addresses)`;
  }

  // Format binary with spaces every 16 bits
  const formattedBinary = binaryStr.match(/.{1,16}/g)?.join(' ') || binaryStr;

  return {
    ip: compressed,
    prefix,
    cidrNotation: `${compressed}/${prefix}`,
    expandedIp: expanded,
    compressedIp: compressed,
    networkPrefix: `${netCompressed}/${prefix}`,
    interfaceId: hextets.slice(4).join(':'),
    totalAddressesNotation,
    ipType,
    isPrivate,
    binaryRepresentation: formattedBinary,
  };
}

// -------------------------------------------------------------
// Presets for Quick Testing & One-Click Demos
// -------------------------------------------------------------

export interface CidrPreset {
  id: string;
  name: string;
  category: 'Home / SOHO' | 'Cloud / VPC' | 'Telecom / ISP' | 'IPv6 NextGen';
  ip: string;
  cidr: number;
  description: string;
}

export const CIDR_PRESETS: CidrPreset[] = [
  {
    id: 'home-router',
    name: 'Home / Office Wi-Fi LAN (Class C)',
    category: 'Home / SOHO',
    ip: '192.168.1.1',
    cidr: 24,
    description: 'Standard 254-host private subnet for routers, laptops, and IoT devices.',
  },
  {
    id: 'aws-vpc-primary',
    name: 'AWS / Cloud VPC Main Subnet',
    category: 'Cloud / VPC',
    ip: '10.0.0.0',
    cidr: 16,
    description: '65,534 host cloud infrastructure VPC address space.',
  },
  {
    id: 'docker-bridge',
    name: 'Docker Default Bridge Network',
    category: 'Cloud / VPC',
    ip: '172.17.0.1',
    cidr: 16,
    description: 'Default container bridge gateway allocation on Linux/macOS.',
  },
  {
    id: 'kubernetes-pod-cidr',
    name: 'Kubernetes Cluster Pod CIDR',
    category: 'Cloud / VPC',
    ip: '10.244.0.0',
    cidr: 16,
    description: 'Flannel/Calico default cluster-wide pod IP assignment pool.',
  },
  {
    id: 'ptp-router-link',
    name: 'Point-to-Point Router Link (RFC 3021)',
    category: 'Telecom / ISP',
    ip: '192.168.100.0',
    cidr: 31,
    description: 'Modern 2-address /31 subnet conserving addresses on transit links.',
  },
  {
    id: 'cgnat-shared',
    name: 'ISP Carrier-Grade NAT (CGNAT)',
    category: 'Telecom / ISP',
    ip: '100.64.0.1',
    cidr: 10,
    description: '4 Million host RFC 6598 shared address space for telecom mobile networks.',
  },
  {
    id: 'ipv6-vpc-subnet',
    name: 'IPv6 Global Dual-Stack Subnet (/64)',
    category: 'IPv6 NextGen',
    ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    cidr: 64,
    description: 'Standard SLAAC auto-configuration 64-bit host subnet (18.4 Quintillion IPs).',
  },
];
