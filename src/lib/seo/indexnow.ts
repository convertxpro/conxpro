/**
 * IndexNow & Search Engine Automated Pinging Protocol
 * Used to immediately notify Bing, Yandex, Seznam, and Google of newly added/updated URLs
 * without waiting weeks for organic crawler discovery.
 */

export interface IndexNowPayload {
  host: string;
  key: string;
  keyLocation?: string;
  urlList: string[];
}

export interface IndexNowResult {
  endpoint: string;
  status: number;
  ok: boolean;
  message?: string;
}

const INDEXNOW_ENDPOINTS = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

/**
 * Submit an array of URLs to IndexNow engines (Bing, Yandex, Seznam, etc.)
 */
export async function submitToIndexNow(
  urls: string[],
  options?: {
    host?: string;
    key?: string;
    keyLocation?: string;
  }
): Promise<IndexNowResult[]> {
  const host = options?.host || process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || 'apextools.app';
  const key = options?.key || process.env.INDEXNOW_KEY || 'apextools2026indexnowkey8832a4';
  const keyLocation = options?.keyLocation || `https://${host}/${key}.txt`;

  if (!urls || urls.length === 0) {
    return [];
  }

  // Deduplicate and filter canonical host URLs
  const cleanUrls = Array.from(
    new Set(
      urls.map((u) => (u.startsWith('http') ? u : `https://${host}${u.startsWith('/') ? '' : '/'}${u}`))
    )
  );

  const payload: IndexNowPayload = {
    host,
    key,
    keyLocation,
    urlList: cleanUrls.slice(0, 10000), // IndexNow allows up to 10,000 URLs per batch
  };

  const results: IndexNowResult[] = [];

  for (const endpoint of INDEXNOW_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'ApexTools-Autonomous-SEO-Agent/1.0',
        },
        body: JSON.stringify(payload),
      });

      // IndexNow returns 200 (OK) or 202 (Accepted)
      const ok = response.status === 200 || response.status === 202;
      results.push({
        endpoint,
        status: response.status,
        ok,
        message: ok ? 'Submitted successfully' : `HTTP status ${response.status}`,
      });
    } catch (err: any) {
      results.push({
        endpoint,
        status: 0,
        ok: false,
        message: err?.message || 'Network error connecting to IndexNow endpoint',
      });
    }
  }

  return results;
}

/**
 * Ping traditional search engine sitemap endpoints (Google & Bing)
 */
export async function pingSearchEngines(sitemapUrl: string = 'https://apextools.app/sitemap.xml'): Promise<{ engine: string; ok: boolean; status: number }[]> {
  const endpoints = [
    { engine: 'Google', url: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
    { engine: 'Bing', url: `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}` },
  ];

  const results = [];

  for (const item of endpoints) {
    try {
      const res = await fetch(item.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'ApexTools-Autonomous-SEO-Agent/1.0',
        },
      });
      results.push({
        engine: item.engine,
        ok: res.ok,
        status: res.status,
      });
    } catch (err) {
      results.push({
        engine: item.engine,
        ok: false,
        status: 0,
      });
    }
  }

  return results;
}
