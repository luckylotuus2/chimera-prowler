const CACHE_NAME = 'chimera-offline-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './chimera-logo.jpg',
  'https://cdn.jsdelivr.net/npm/marked/marked.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).catch(() => {
            // Offline fallback
            return new Response("Chimera Systems Offline. Awaiting network signal.", {
                headers: { 'Content-Type': 'text/plain' }
            });
        });
      })
  );
});
