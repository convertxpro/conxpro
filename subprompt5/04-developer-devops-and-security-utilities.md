# SUB-PROMPT 04: Full-Stack Developer, DevOps & Cyber Security Utilities

## 1. Context & Architectural Overview
This sub-prompt guides the implementation of the **Developer, DevOps & Cyber Security Utility Suite** in ConvertX.
Developers and engineers frequently require serialization, cryptographic verification, JWT inspection, cron expression translation, and multi-language API code generation.

All developer tools in ConvertX operate **100% in-browser** using the Web Cryptography API (`crypto.subtle`), client-side token parsers, AST serializers, and high-performance Monaco / Prism syntax engines.

### Core Architectural Guarantees:
- **Zero Secrets / Token Leakage:** Authentication headers, Bearer tokens, private keys, and SQL dumps are processed exclusively in browser memory.
- **Zero Network Roundtrips:** Instantaneous sub-millisecond conversions as the user types.
- **Developer-First UX:** 1-click clipboard copy, syntax highlighted diffs, formatting toggles, and multi-language target selections.

---

## 2. Tools Included in this Sub-Prompt

| Tool Name | Slug | Primary Capabilities | Technical Foundation |
|---|---|---|---|
| **JWT Inspector & Debugger** | `jwt-decoder` | Decode Header & Payload, inspect standard claims (`exp`, `iat`, `nbf`), live expiration countdown, HMAC-SHA256 signature verification | Base64Url parser, Web Crypto API |
| **Cryptographic Hash & Checksum Generator** | `hash-generator` | Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512, Keccak-256 in parallel with streaming file drag-and-drop | `crypto.subtle`, CryptoJS, FileReader stream |
| **cURL to Code Converter** | `curl-to-code` | Parse raw cURL commands into idiomatic Fetch, Axios, Python Requests, Go HTTP, Rust Reqwest, PHP, and C# | cURL AST parser, Code generator templates |
| **Code & Text Diff Checker** | `diff-checker` | Side-by-side split & unified view, character-level diff highlighting, ignore whitespace/case toggles, unified patch export | `diff` / `jsdiff` algorithm, Prism syntax |
| **Cron Expression Translator & Builder** | `cron-expression-decoder` | Translate 5-field and 6-field crontabs into plain English, interactive visual time picker, upcoming 10 execution timestamps | `cronstrue`, Cron scheduler engine |
| **YAML ↔ JSON ↔ TOML Multi-Converter** | `yaml-to-json` / `json-to-yaml` | Multi-way configuration converter for Kubernetes manifests, Docker Compose, and `pyproject.toml` | `yaml`, `@iarna/toml`, JSON parser |
| **SQL to JSON/CSV & JSON to SQL INSERT** | `sql-to-json` / `json-to-sql` | Convert SQL INSERT dumps into JSON/CSV arrays and convert JSON/CSV tables to bulk ANSI SQL INSERT queries | SQL regex parser, SQL dialect formatter |
| **CSS Units Matrix & Fluid Typography** | `css-unit-converter` | Bi-directional PX ↔ REM ↔ EM ↔ VW ↔ PT converter with responsive `clamp()` fluid size generator & Tailwind class mapper | Viewport math, CSS CSSOM calculation |
| **CIDR & Subnet IP Calculator** | `cidr-subnet-calculator` | Calculate network address, broadcast address, usable IP range, total hosts, subnet mask, and IPv4 to IPv6 notation | Binary bitwise shift math |

---

## 3. Metadata Registration (`src/config/categories.ts`)

Ensure the `developer` category contains these tools in `src/config/categories.ts`:

```typescript
{
  id: 'developer',
  name: 'Developer & Data Utilities',
  slug: 'developer',
  description: 'Client-side instant encoding, formatting, parsing, security token decoding, and data serialization tools.',
  iconName: 'Code',
  color: '#3b82f6',
  gradient: 'from-blue-600 to-indigo-600',
  badge: '100% Private',
  tools: [
    {
      id: 'jwt-decoder',
      name: 'JWT (JSON Web Token) Inspector & Decoder',
      slug: 'jwt-decoder',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Inspect JWT headers, decode payload claims, verify expiration with live countdown, and validate HMAC signatures.',
      iconName: 'KeyRound',
      popular: true,
      badge: '100% Private',
    },
    {
      id: 'hash-generator',
      name: 'Cryptographic Hash & File Checksum Generator',
      slug: 'hash-generator',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Compute MD5, SHA-1, SHA-256, SHA-512, Keccak-256 hashes in parallel and verify large file checksums streamingly.',
      iconName: 'ShieldCheck',
      popular: true,
    },
    {
      id: 'curl-to-code',
      name: 'cURL to Code Converter',
      slug: 'curl-to-code',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Convert cURL commands into clean, idiomatic code for JavaScript, Python, Go, Rust, PHP, Java, and C#.',
      iconName: 'Terminal',
      popular: true,
    },
    {
      id: 'diff-checker',
      name: 'Text & Code Diff Checker',
      slug: 'diff-checker',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Compare text and code files side-by-side with character-level diff highlighting, whitespace ignoring, and patch generation.',
      iconName: 'GitCompare',
      popular: true,
    },
    {
      id: 'cron-expression-decoder',
      name: 'Cron Expression Translator & Crontab Builder',
      slug: 'cron-expression-decoder',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Translate 5-field and 6-field cron expressions into plain English with visual schedule builder and upcoming run times.',
      iconName: 'Clock',
    },
    {
      id: 'yaml-to-json',
      name: 'YAML to JSON / TOML Converter',
      slug: 'yaml-to-json',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Convert YAML syntax to formatted or minified JSON and TOML with live validation and error markers.',
      iconName: 'FileCode2',
      popular: true,
    },
    {
      id: 'json-to-yaml',
      name: 'JSON to YAML Converter',
      slug: 'json-to-yaml',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Convert JSON data into clean, indented YAML configuration files for Kubernetes, CI/CD, and Docker Compose.',
      iconName: 'FileCode',
      popular: true,
    },
    {
      id: 'sql-to-json',
      name: 'SQL Query to JSON / CSV Converter',
      slug: 'sql-to-json',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Convert SQL INSERT statements and table dumps into structured JSON arrays and CSV tables.',
      iconName: 'Database',
      popular: true,
    },
    {
      id: 'json-to-sql',
      name: 'JSON to SQL INSERT Generator',
      slug: 'json-to-sql',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Generate bulk ANSI SQL INSERT INTO statements from JSON arrays with custom table names and dialect quotes.',
      iconName: 'DatabaseBackup',
    },
    {
      id: 'css-unit-converter',
      name: 'CSS Units Converter (PX ↔ REM ↔ EM ↔ VW ↔ PT)',
      slug: 'css-unit-converter',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Bi-directional CSS unit conversion matrix with responsive clamp() generator and Tailwind CSS class mapper.',
      iconName: 'LayoutGrid',
    },
    {
      id: 'cidr-subnet-calculator',
      name: 'CIDR & Subnet IP Calculator',
      slug: 'cidr-subnet-calculator',
      categorySlug: 'developer',
      categoryName: 'Developer Tools',
      description: 'Calculate IPv4/IPv6 subnets, network/broadcast addresses, usable host ranges, and wildcard masks.',
      iconName: 'Network',
    },
  ],
}
```

---

## 4. Component Implementation Architecture

### 4.1 JWT Inspector & Debugger (`src/components/converters/developer/JwtDecoderComponent.tsx`)
- **Visual Sections:**
  - **Raw Encoded Input:** Color-coded string with red (Header), purple (Payload), and blue (Signature).
  - **Decoded Header & Algorithm:** algorithm (`HS256`, `RS256`), token type.
  - **Decoded Payload Claims:** formatted JSON view with human-readable badges for `exp`, `iat`, `iss`, `sub`, `aud`.
  - **Live Expiration Clock:** Displays "Valid (Expires in 42 minutes)" or "Expired (3 days ago)" with live countdown.
  - **Signature Verifier:** Optional secret key input to verify HMAC signature locally.

### 4.2 cURL to Code Converter (`src/components/converters/developer/CurlToCodeComponent.tsx`)
- **Target Language Tabs:**
  - JavaScript (`fetch`, `axios`)
  - Python (`requests`, `httpx`)
  - Go (`net/http`)
  - Rust (`reqwest`)
  - PHP (`curl`, `Guzzle`)
  - C# (`HttpClient`)
- **Features:** Auto-detects headers, HTTP method (`GET`, `POST`, `PUT`, `DELETE`), Bearer tokens, JSON bodies, and multi-part form data.

### 4.3 Side-by-Side Diff Checker (`src/components/converters/developer/DiffCheckerComponent.tsx`)
- **Features:**
  - Dual textareas for "Original Text" and "Modified Text".
  - Split-view vs Unified-view toggle.
  - Character-level red/green diff highlighting.
  - Toggles: "Ignore Whitespace", "Ignore Case", "Wrap Lines".
  - Statistics bar: `+14 additions`, `-8 deletions`, `32 unchanged lines`.

### 4.4 CSS Unit Converter & Fluid clamp() Generator (`src/components/converters/developer/CssUnitConverterComponent.tsx`)
- **Features:**
  - Base Root Font Size setting (default: `16px`).
  - Real-time conversion matrix: `PX` $\leftrightarrow$ `REM` $\leftrightarrow$ `EM` $\leftrightarrow$ `VW` $\leftrightarrow$ `PT` $\leftrightarrow$ `Tailwind Class` (e.g., `text-xl`).
  - **Fluid Typography `clamp()` Generator:**
    - Min Size (e.g., `16px` at `375px` screen)
    - Max Size (e.g., `32px` at `1440px` screen)
    - Output: `font-size: clamp(1rem, 0.76rem + 1.02vw, 2rem);`

---

## 5. Wiring in `ConverterCanvas.tsx`
```tsx
case 'jwt-decoder':
  return <JwtDecoderComponent tool={tool} />;
case 'hash-generator':
  return <HashGeneratorComponent tool={tool} />;
case 'curl-to-code':
  return <CurlToCodeComponent tool={tool} />;
case 'diff-checker':
  return <DiffCheckerComponent tool={tool} />;
case 'cron-expression-decoder':
  return <CronDecoderComponent tool={tool} />;
case 'yaml-to-json':
case 'json-to-yaml':
  return <ConfigConverterComponent tool={tool} />;
case 'sql-to-json':
case 'json-to-sql':
  return <SqlConverterComponent tool={tool} />;
case 'css-unit-converter':
  return <CssUnitConverterComponent tool={tool} />;
case 'cidr-subnet-calculator':
  return <CidrCalculatorComponent tool={tool} />;
```

---

## 6. Verification & Quality Assurance Checklist
1. [ ] Test pasting a valid JWT; verify header, payload claims, and live expiry countdown render correctly.
2. [ ] Test pasting a cURL command with JSON payload; verify Python and JavaScript outputs match the request headers.
3. [ ] Test diffing two blocks of code in `diff-checker`; verify character-level inline diff renders accurately.
4. [ ] Run `npm run lint` and verify clean build.
