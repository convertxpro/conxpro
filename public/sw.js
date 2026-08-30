// ConvertHub Offline-Ready Progressive Web App Service Worker
const CACHE_NAME = 'converthub-pwa-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/convert/pakistan/fbr-salary-tax-calculator',
  '/convert/pakistan/marla-to-square-feet',
  '/convert/pakistan/zakat-calculator',
  '/convert/pakistan/freelance-tax-calculator',
  '/convert/developer/json-formatter',
  '/convert/developer/base64-encode-decode',
  '/convert/developer/diff-checker',
  '/convert/unit/length-converter',
  '/convert/unit/weight-converter',
  '/convert/currency/usd-to-pkr',
];

// 1. Install Event — Pre-cache critical offline shell & calculators
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[SW] Pre-cache error:', err);
      })
  );
});

// 2. Activate Event — Clean up stale old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Network-first for dynamic APIs, Cache-first for static assets, Stale-while-revalidate for pages
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests and chrome-extension / non-http schemes
  if (event.request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // A. Dynamic APIs: Server-side conversion, job queues, download streaming -> Network-only
  if (
    url.pathname.startsWith('/api/convert/') ||
    url.pathname.startsWith('/api/jobs/') ||
    url.pathname.startsWith('/api/download/') ||
    url.pathname.startsWith('/api/cron/')
  ) {
    return;
  }

  // B. Static Next.js Bundles, Fonts, Icons, Images -> Cache-First Strategy
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|avif|ico|woff2|woff|css|js)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // C. HTML Pages & Converters -> Stale-While-Revalidate Strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return cachedResponse;
        });

      return cachedResponse || fetchPromise;
    })
  );
});
