// Chimera Advanced Service Worker: Version 2
const CACHE_NAME = 'chimera-offline-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './chimera-logo.jpg',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

// 1. Install & Force Update
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting()) // Forces the new Service Worker to take over immediately
  );
});

// 2. Activate & Auto-Purge Old Memory
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // If the cache name doesn't match our current version, destroy it
          if (cacheName !== CACHE_NAME) {
            console.log('[Chimera System] Purging obsolete cache memory:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Instantly control all open app windows
  );
});

// 3. The Network-First Protocol
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // If the internet works, grab the freshest code, clone it, and silently save it to the cache
        if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response; // Serve the fresh code to the user
      })
      .catch(() => {
        // If the network fails (Offline Mode), instantly load the app from the cache
        return caches.match(event.request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }
            // Absolute final fallback if both network and cache fail
            return new Response("Chimera Systems Offline. Awaiting network signal.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        });
      })
  );
});
