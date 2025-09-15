// Service Worker für EXTREME Caching - Minimale Edge Requests
const CACHE_NAME = 'habit-tracker-extreme-v3';
const STATIC_CACHE = 'static-extreme-v3';
const DYNAMIC_CACHE = 'dynamic-extreme-v3';
const API_CACHE = 'api-extreme-v3';

// Statische Assets - 1 Jahr Cache
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/auth/login',
  '/_next/static/',
  '/favicon.ico',
  '/manifest.json',
  '/sw.js'
];

// API-Routes - 2 Stunden Cache (EXTREM!)
const API_ROUTES = [
  '/api/habits',
  '/api/habits/entries',
  '/api/dashboard-data',
  '/api/habits/static',
  '/api/friends'
];

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 365 * 24 * 60 * 60 * 1000, // 1 Jahr
  API: 2 * 60 * 60 * 1000, // 2 Stunden (EXTREM!)
  DYNAMIC: 7 * 24 * 60 * 60 * 1000 // 7 Tage
};

// Helper function to check if cache is expired
function isCacheExpired(cacheTime, duration) {
  return Date.now() - cacheTime > duration;
}

// Helper function to get cache with timestamp
async function getCachedWithTimestamp(cache, request) {
  const response = await cache.match(request);
  if (!response) return null;
  
  const timestamp = response.headers.get('sw-cache-timestamp');
  if (!timestamp) return response;
  
  const cacheTime = parseInt(timestamp);
  const duration = API_ROUTES.some(route => request.url.includes(route)) 
    ? CACHE_DURATIONS.API 
    : CACHE_DURATIONS.STATIC;
    
  if (isCacheExpired(cacheTime, duration)) {
    await cache.delete(request);
    return null;
  }
  
  return response;
}

// Helper function to cache with timestamp
async function cacheWithTimestamp(cache, request, response) {
  const responseClone = response.clone();
  responseClone.headers.set('sw-cache-timestamp', Date.now().toString());
  await cache.put(request, responseClone);
}

self.addEventListener('install', (event) => {
  console.log('🚀 EXTREME Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('✅ Static assets cached for 1 YEAR');
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🚀 EXTREME Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheName.includes('extreme-v3')) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ EXTREME Service Worker activated');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // API-Routes - EXTREME Caching (2 Stunden!)
  if (API_ROUTES.some(route => url.pathname.startsWith(route))) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        // Try to get from cache first
        const cachedResponse = await getCachedWithTimestamp(cache, request);
        if (cachedResponse) {
          console.log('📦 Serving API from EXTREME cache (2h):', url.pathname);
          // Update cache in background (selten!)
          setTimeout(() => {
            fetch(request).then((fetchResponse) => {
              if (fetchResponse.ok) {
                cacheWithTimestamp(cache, request, fetchResponse);
                console.log('🔄 Background cache update:', url.pathname);
              }
            }).catch(() => {
              // Ignore fetch errors in background
            });
          }, 30000); // 30 Sekunden Verzögerung
          return cachedResponse;
        }
        
        // If not in cache or expired, fetch from network
        console.log('🌐 Fetching API from network:', url.pathname);
        try {
          const fetchResponse = await fetch(request);
          if (fetchResponse.ok) {
            await cacheWithTimestamp(cache, request, fetchResponse);
            console.log('💾 Cached for 2 HOURS:', url.pathname);
          }
          return fetchResponse;
        } catch (error) {
          console.error('❌ API fetch failed:', error);
          return new Response(
            JSON.stringify({ error: 'Network error', cached: true }), 
            { 
              status: 503, 
              headers: { 'Content-Type': 'application/json' } 
            }
          );
        }
      })
    );
    return;
  }

  // Statische Assets - Cache First (1 Jahr!)
  if (STATIC_ASSETS.some(asset => url.pathname.startsWith(asset)) || 
      url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          console.log('📦 Serving static from EXTREME cache (1Y):', url.pathname);
          return cachedResponse;
        }
        
        console.log('🌐 Fetching static from network:', url.pathname);
        try {
          const fetchResponse = await fetch(request);
          if (fetchResponse.ok) {
            await cache.put(request, fetchResponse.clone());
            console.log('💾 Cached for 1 YEAR:', url.pathname);
          }
          return fetchResponse;
        } catch (error) {
          console.error('❌ Static fetch failed:', error);
          return new Response('Not found', { status: 404 });
        }
      })
    );
    return;
  }

  // Alle anderen Requests - Network First mit Fallback
  event.respondWith(
    fetch(request).then((response) => {
      // Cache successful responses
      if (response.ok && request.method === 'GET') {
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cacheWithTimestamp(cache, request, response);
        });
      }
      return response;
    }).catch(() => {
      // Fallback to cache
      return caches.match(request).then((response) => {
        if (response) {
          console.log('📦 Serving fallback from cache:', url.pathname);
        }
        return response || new Response('Not found', { status: 404 });
      });
    })
  );
});

// Background sync für offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('🔄 Background sync triggered');
    event.waitUntil(
      // Handle any pending offline actions
      console.log('✅ Background sync completed')
    );
  }
});

// Push notifications (für zukünftige Features)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: 1
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Message handling für Cache-Invalidation
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});

console.log('🚀 EXTREME Service Worker loaded - Ready for minimal Edge Requests!');