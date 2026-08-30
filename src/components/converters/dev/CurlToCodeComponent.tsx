'use client';

import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Code2,
  Copy,
  Download,
  Trash2,
  Check,
  Sparkles,
  FileCode,
  ArrowRight,
  RefreshCw,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { PrivacyAssuranceBadge } from '@/components/converters/common/PrivacyAssuranceBadge';
import { ToolMetadata } from '@/config/categories';
import { cn } from '@/lib/utils';

interface CurlToCodeComponentProps {
  tool?: ToolMetadata;
}

interface ParsedCurl {
  method: string;
  url: string;
  headers: Record<string, string>;
  data: string | null;
  isJson: boolean;
  auth?: { user: string; pass: string };
  cookies?: string;
  insecure?: boolean;
}

interface LanguageTarget {
  id: string;
  name: string;
  category: string;
  ext: string;
  generate: (parsed: ParsedCurl) => string;
}

// -------------------------------------------------------------
// cURL Parser Implementation
// -------------------------------------------------------------
function parseCurl(curlCommand: string): ParsedCurl {
  const cleanCmd = curlCommand
    .replace(/\\\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  let method = 'GET';
  let url = '';
  const headers: Record<string, string> = {};
  let data: string | null = null;
  let auth: { user: string; pass: string } | undefined = undefined;
  let cookies: string | undefined = undefined;
  let insecure = false;

  // Simple token regex taking quotes into account
  const tokenRegex = /(?:[^\s"']+|"[^"]*"|'[^']*')+/g;
  const tokens = cleanCmd.match(tokenRegex) || [];

  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i];
    const unquote = (s: string) => s.replace(/^['"]|['"]$/g, '');

    if (token === 'curl') continue;

    if (token === '-X' || token === '--request') {
      if (tokens[i + 1]) {
        method = unquote(tokens[++i]).toUpperCase();
      }
    } else if (token === '-H' || token === '--header') {
      if (tokens[i + 1]) {
        const headerStr = unquote(tokens[++i]);
        const colonIdx = headerStr.indexOf(':');
        if (colonIdx > 0) {
          const key = headerStr.slice(0, colonIdx).trim();
          const val = headerStr.slice(colonIdx + 1).trim();
          headers[key] = val;
        }
      }
    } else if (
      token === '-d' ||
      token === '--data' ||
      token === '--data-raw' ||
      token === '--data-binary'
    ) {
      if (tokens[i + 1]) {
        data = unquote(tokens[++i]);
        if (method === 'GET') method = 'POST';
      }
    } else if (token === '-u' || token === '--user') {
      if (tokens[i + 1]) {
        const authStr = unquote(tokens[++i]);
        const [user, pass] = authStr.split(':');
        auth = { user: user || '', pass: pass || '' };
      }
    } else if (token === '-b' || token === '--cookie') {
      if (tokens[i + 1]) {
        cookies = unquote(tokens[++i]);
      }
    } else if (token === '-A' || token === '--user-agent') {
      if (tokens[i + 1]) {
        headers['User-Agent'] = unquote(tokens[++i]);
      }
    } else if (token === '-k' || token === '--insecure') {
      insecure = true;
    } else if (
      !token.startsWith('-') &&
      (token.startsWith('http://') ||
        token.startsWith('https://') ||
        token.startsWith('"http') ||
        token.startsWith("'http") ||
        (!url && token.includes('.')))
    ) {
      url = unquote(token);
    }
  }

  if (!url) {
    url = 'https://api.example.com/v1/resource';
  }

  let isJson = false;
  if (data) {
    try {
      JSON.parse(data);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  return { method, url, headers, data, isJson, auth, cookies, insecure };
}

// -------------------------------------------------------------
// Code Generators
// -------------------------------------------------------------
const TARGET_LANGUAGES: LanguageTarget[] = [
  {
    id: 'js-fetch',
    name: 'JavaScript (Fetch)',
    category: 'Web',
    ext: 'js',
    generate: (p) => {
      const options: any = { method: p.method };
      if (Object.keys(p.headers).length > 0) options.headers = p.headers;
      if (p.data) options.body = p.isJson ? `JSON.stringify(${p.data})` : JSON.stringify(p.data);

      return `// JavaScript (Fetch API)
const url = ${JSON.stringify(p.url)};
const options = {
  method: '${p.method}',
  headers: ${JSON.stringify(p.headers, null, 4)},
  ${p.data ? `body: ${p.isJson ? p.data : JSON.stringify(p.data)}` : ''}
};

fetch(url, options)
  .then(res => res.json())
  .then(data => console.log('Response:', data))
  .catch(err => console.error('Error:', err));`;
    },
  },
  {
    id: 'js-axios',
    name: 'JavaScript (Axios)',
    category: 'Web',
    ext: 'js',
    generate: (p) => {
      return `// JavaScript (Axios)
import axios from 'axios';

const config = {
  method: '${p.method.toLowerCase()}',
  url: '${p.url}',
  headers: ${JSON.stringify(p.headers, null, 4)},
  ${p.data ? `data: ${p.isJson ? p.data : JSON.stringify(p.data)}` : ''}
};

axios(config)
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error('Request failed:', error);
  });`;
    },
  },
  {
    id: 'typescript',
    name: 'TypeScript (Fetch)',
    category: 'Web',
    ext: 'ts',
    generate: (p) => {
      return `// TypeScript Typed Fetch
interface ApiResponse {
  [key: string]: any;
}

export async function executeRequest(): Promise<ApiResponse | null> {
  const url = '${p.url}';
  const init: RequestInit = {
    method: '${p.method}',
    headers: ${JSON.stringify(p.headers, null, 4)},
    ${p.data ? `body: ${p.isJson ? p.data : JSON.stringify(p.data)},` : ''}
  };

  try {
    const res = await fetch(url, init);
    if (!res.ok) {
      throw new Error(\`HTTP error! status: \${res.status}\`);
    }
    const data: ApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error('Request failed:', error);
    return null;
  }
}`;
    },
  },
  {
    id: 'python-requests',
    name: 'Python (Requests)',
    category: 'Backend',
    ext: 'py',
    generate: (p) => {
      return `# Python 3 (requests)
import requests
import json

url = "${p.url}"

headers = ${JSON.stringify(p.headers, null, 4).replace(/true/g, 'True').replace(/false/g, 'False')}

${p.data ? (p.isJson ? `payload = ${p.data}` : `payload = ${JSON.stringify(p.data)}`) : ''}

response = requests.${p.method.toLowerCase()}(
    url,
    headers=headers,
    ${p.data ? (p.isJson ? 'json=payload' : 'data=payload') : ''}
)

print(f"Status: {response.status_code}")
print(response.json() if "application/json" in response.headers.get("Content-Type", "") else response.text)`;
    },
  },
  {
    id: 'python-httpx',
    name: 'Python (HTTPX Async)',
    category: 'Backend',
    ext: 'py',
    generate: (p) => {
      return `# Python (httpx async)
import httpx
import asyncio

async def make_request():
    url = "${p.url}"
    headers = ${JSON.stringify(p.headers, null, 4).replace(/true/g, 'True').replace(/false/g, 'False')}
    ${p.data ? (p.isJson ? `payload = ${p.data}` : `payload = ${JSON.stringify(p.data)}`) : ''}

    async with httpx.AsyncClient() as client:
        response = await client.${p.method.toLowerCase()}(
            url,
            headers=headers,
            ${p.data ? (p.isJson ? 'json=payload' : 'content=payload') : ''}
        )
        print(response.status_code)
        print(response.text)

if __name__ == "__main__":
    asyncio.run(make_request())`;
    },
  },
  {
    id: 'go',
    name: 'Go (net/http)',
    category: 'Backend',
    ext: 'go',
    generate: (p) => {
      const headerLines = Object.entries(p.headers)
        .map(([k, v]) => `\treq.Header.Set("${k}", "${v}")`)
        .join('\n');

      return `package main

import (
\t"fmt"
\t"io"
\t"net/http"
${p.data ? '\t"strings"\n' : ''})

func main() {
\turl := "${p.url}"
\t${p.data ? `payload := strings.NewReader(\`${p.data}\`)` : 'var payload io.Reader = nil'}

\treq, err := http.NewRequest("${p.method}", url, payload)
\tif err != nil {
\t\tpanic(err)
\t}

${headerLines}

\tclient := &http.Client{}
\tres, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer res.Body.Close()

\tbody, err := io.ReadAll(res.Body)
\tif err != nil {
\t\tpanic(err)
\t}

\tfmt.Println(res.Status)
\tfmt.Println(string(body))
}`;
    },
  },
  {
    id: 'rust',
    name: 'Rust (Reqwest)',
    category: 'Systems',
    ext: 'rs',
    generate: (p) => {
      const headerChains = Object.entries(p.headers)
        .map(([k, v]) => `        .header("${k}", "${v}")`)
        .join('\n');

      return `// Cargo.toml: reqwest = { version = "0.11", features = ["json"] }, tokio = { version = "1", features = ["full"] }
use reqwest::header::HeaderMap;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = reqwest::Client::new();
    
    let res = client
        .${p.method.toLowerCase()}("${p.url}")
${headerChains}
${p.data ? (p.isJson ? `        .json(&serde_json::json!(${p.data}))\n` : `        .body(\`${p.data}\`)\n`) : ''}        .send()
        .await?;

    println!("Status: {}", res.status());
    let body = res.text().await?;
    println!("Body: {}", body);

    Ok(())
}`;
    },
  },
  {
    id: 'php-guzzle',
    name: 'PHP (Guzzle)',
    category: 'Backend',
    ext: 'php',
    generate: (p) => {
      return `<?php
require 'vendor/autoload.php';

use GuzzleHttp\\Client;

$client = new Client();
$headers = ${varExport(p.headers)};
${p.data ? `$body = '${p.data.replace(/'/g, "\\'")}';` : ''}

$response = $client->request('${p.method}', '${p.url}', [
    'headers' => $headers,
    ${p.data ? (p.isJson ? "'json' => json_decode($body)," : "'body' => $body,") : ''}
]);

echo $response->getStatusCode() . "\\n";
echo $response->getBody();`;
    },
  },
  {
    id: 'java',
    name: 'Java (HttpClient 11+)',
    category: 'Enterprise',
    ext: 'java',
    generate: (p) => {
      const headerChains = Object.entries(p.headers)
        .map(([k, v]) => `            .header("${k}", "${v}")`)
        .join('\n');

      return `import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class ApiClient {
    public static void main(String[] args) throws Exception {
        HttpClient client = HttpClient.newHttpClient();

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("${p.url}"))
${headerChains}
            .${p.method}(${p.data ? `HttpRequest.BodyPublishers.ofString("${p.data.replace(/"/g, '\\"')}")` : 'HttpRequest.BodyPublishers.noBody()'})
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        System.out.println("Status: " + response.statusCode());
        System.out.println("Body: " + response.body());
    }
}`;
    },
  },
  {
    id: 'dart',
    name: 'Dart / Flutter (http)',
    category: 'Mobile',
    ext: 'dart',
    generate: (p) => {
      return `import 'package:http/http.dart' as http;
import 'dart:convert';

void main() async {
  final url = Uri.parse('${p.url}');
  final headers = ${JSON.stringify(p.headers, null, 2)};
  ${p.data ? `final body = jsonEncode(${p.data});` : ''}

  final response = await http.${p.method.toLowerCase()}(
    url,
    headers: headers,
    ${p.data ? 'body: body,' : ''}
  );

  print('Status: \${response.statusCode}');
  print('Response: \${response.body}');
}`;
    },
  },
  {
    id: 'csharp',
    name: 'C# (.NET HttpClient)',
    category: 'Enterprise',
    ext: 'cs',
    generate: (p) => {
      return `using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    static async Task Main()
    {
        using var client = new HttpClient();
        
        using var request = new HttpRequestMessage(HttpMethod.${p.method.charAt(0) + p.method.slice(1).toLowerCase()}, "${p.url}");
        ${Object.entries(p.headers)
          .map(([k, v]) => `request.Headers.TryAddWithoutValidation("${k}", "${v}");`)
          .join('\n        ')}

        ${p.data ? `request.Content = new StringContent("${p.data.replace(/"/g, '\\"')}", Encoding.UTF8, "application/json");` : ''}

        var response = await client.SendAsync(request);
        var result = await response.Content.ReadAsStringAsync();
        
        Console.WriteLine($"Status: {response.StatusCode}");
        Console.WriteLine(result);
    }
}`;
    },
  },
];

function varExport(obj: Record<string, string>): string {
  const entries = Object.entries(obj).map(([k, v]) => `    '${k}' => '${v}'`);
  return `[\n${entries.join(',\n')}\n]`;
}

const SAMPLE_CURL_PRESETS = [
  {
    id: 'post-bearer',
    name: 'POST JSON with Bearer Token',
    desc: 'Authenticated JSON payload with custom headers',
    curl: `curl -X POST "https://api.converthub.in/v2/transform" \\
  -H "Authorization: Bearer sec_tok_94827591038" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{"sourceFormat":"docx","targetFormat":"pdf","quality":"ultra","dpi":300}'`,
  },
  {
    id: 'get-headers',
    name: 'GET with Custom Headers & Query Params',
    desc: 'Paginated API query with User-Agent & API Key',
    curl: `curl -X GET "https://api.github.com/repos/converthub/platform/issues?state=open&per_page=20" \\
  -H "User-Agent: ConvertHub-Client/2.0" \\
  -H "Accept: application/vnd.github.v3+json"`,
  },
  {
    id: 'basic-auth',
    name: 'Basic Auth REST Request',
    desc: 'Username and password credentials encoded',
    curl: `curl -X PUT "https://api.stripe.com/v1/customers/cus_N48201" \\
  -u "sk_test_51Mz82048102:secret_pass" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "email=user%40lapvy.com&name=Muddasir+Ali"`,
  },
];

export const CurlToCodeComponent: React.FC<CurlToCodeComponentProps> = ({
  tool,
}) => {
  const [curlInput, setCurlInput] = useState<string>(SAMPLE_CURL_PRESETS[0].curl);
  const [selectedLangId, setSelectedLangId] = useState<string>('js-fetch');
  const [copied, setCopied] = useState<boolean>(false);

  // Parse cURL
  const parsed = useMemo(() => {
    return parseCurl(curlInput);
  }, [curlInput]);

  // Selected Target
  const targetLang = useMemo(() => {
    return TARGET_LANGUAGES.find((l) => l.id === selectedLangId) || TARGET_LANGUAGES[0];
  }, [selectedLangId]);

  // Generated Code
  const generatedCode = useMemo(() => {
    try {
      return targetLang.generate(parsed);
    } catch (err) {
      return `// Failed to generate code: ${err}`;
    }
  }, [targetLang, parsed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `curl-snippet.${targetLang.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-4 backdrop-blur-md shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
            <Terminal className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Universal cURL to Multi-Language Code Generator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Convert cURL commands into idiomatic code across 10+ modern languages & frameworks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
          <Sparkles className="h-4 w-4" />
          <span>10+ Target Languages</span>
        </div>
      </div>

      {/* Main Grid: Input on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: cURL Input & Quick Presets */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col min-h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900/90">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Paste Raw cURL Command
              </span>
              <button
                type="button"
                onClick={() => setCurlInput('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear input"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <textarea
              value={curlInput}
              onChange={(e) => setCurlInput(e.target.value)}
              placeholder={'curl -X POST https://api.example.com -H "Content-Type: application/json" -d \'{"hello":"world"}\''}
              className="flex-1 p-4 font-mono text-xs leading-relaxed text-slate-800 focus:outline-none dark:text-slate-100 bg-transparent resize-none min-h-[300px]"
            />

            {/* Parsed summary badge */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <span>Method: <strong className="text-amber-600 dark:text-amber-400">{parsed.method}</strong></span>
              <span>Headers: <strong>{Object.keys(parsed.headers).length}</strong></span>
              <span>Payload: <strong>{parsed.data ? (parsed.isJson ? 'JSON' : 'Raw Text') : 'None'}</strong></span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40 space-y-3">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sample cURL Commands
            </span>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_CURL_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setCurlInput(preset.curl)}
                  className="flex items-start justify-between rounded-xl border border-slate-200 bg-white p-2.5 text-left transition hover:border-amber-400 hover:bg-amber-50/30 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-amber-500/50 shadow-sm"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {preset.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {preset.desc}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Language Switcher & Generated Code */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col min-h-[520px]">
            {/* Language Selection Header */}
            <div className="border-b border-slate-200 bg-slate-50/90 p-2.5 dark:border-slate-800 dark:bg-slate-900/90 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-2">
                  Select Output Language
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-amber-600 transition"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download .{targetLang.ext}</span>
                  </button>
                </div>
              </div>

              {/* Language Pills Switcher */}
              <div className="flex flex-wrap gap-1.5 pt-1 px-1">
                {TARGET_LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLangId(lang.id)}
                    className={cn(
                      'rounded-lg px-2.5 py-1 text-xs font-medium transition',
                      selectedLangId === lang.id
                        ? 'bg-amber-500 text-white shadow-sm font-semibold'
                        : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    )}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Output Viewer */}
            <div className="relative flex-1 p-4 bg-slate-950/95 overflow-auto">
              <pre className="font-mono text-xs leading-relaxed text-amber-200 select-text whitespace-pre-wrap">
                <code>{generatedCode}</code>
              </pre>
            </div>

            {/* Bottom Status */}
            <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
              <span>Ready to copy & paste directly into your project codebase.</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Client-Side Parsing
              </span>
            </div>
          </div>
        </div>
      </div>

      <PrivacyAssuranceBadge />
    </div>
  );
};
