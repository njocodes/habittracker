// Service Worker für aggressives Caching - Vercel-Optimierung
const CACHE_NAME = 'habit-tracker-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Statische Assets - 1 Jahr Cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/_next/static/',
  '/favicon.ico',
  '/manifest.json'
];

// API-Routes - 5 Minuten Cache
const API_ROUTES = [
  '/api/habits',
  '/api/habits/entries',
  '/api/friends'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Statische Assets - Cache First
  if (STATIC_ASSETS.some(asset => url.pathname.startsWith(asset))) {
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).then((fetchResponse) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }

  // API-Routes - Stale While Revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          const fetchPromise = fetch(request).then((fetchResponse) => {
            // Cache nur GET-Requests
            if (request.method === 'GET') {
              cache.put(request, fetchResponse.clone());
            }
            return fetchResponse;
          });

          // Return cached response immediately, then update cache
          return response || fetchPromise;
        });
      })
    );
    return;
  }

  // Alle anderen Requests - Network First
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});
