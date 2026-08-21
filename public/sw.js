const CACHE_NAME = 'paniund-v2';

// Cache static brand assets and offline fallback
const STATIC_ASSETS = [
  '/icon.svg',
  '/manifest.webmanifest',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
  '/icons/maskable-icon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force activating the new service worker immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Immediately purge old caches from previous deployments or legacy brands
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Purging legacy cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all open client tabs immediately
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle same-origin requests
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // 1. API Calls: Network Only (Never cache stale API data)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Offline', message: 'You are currently offline.' }),
          {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
          }
        );
      })
    );
    return;
  }

  // 2. HTML Navigation Requests: Network-First strategy
  // Ensures fresh deployments are ALWAYS loaded directly from server/CDN
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return new Response('Paniund is currently offline. Please check your network connection.', {
              headers: { 'Content-Type': 'text/plain' },
              status: 503,
            });
          });
        })
    );
    return;
  }

  // 3. Static Static Assets (Images, Icons, Webpack Chunks): Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
