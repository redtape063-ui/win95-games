const CACHE_NAME = 'classic-solitaire-v5';
const ASSETS = [
  '/win95-games/solitaire/',
  '/win95-games/solitaire/index.html',
  '/win95-games/solitaire/manifest.json',
  '/win95-games/solitaire/icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cached => {
      if (cached) return cached;
      
      // If navigating, always fall back to index.html from cache
      if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        return caches.match('/win95-games/solitaire/index.html', { ignoreSearch: true })
          .then(fallback => fallback || caches.match('/win95-games/solitaire/', { ignoreSearch: true }));
      }
      
      return fetch(event.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return resp;
      }).catch(() => {
        return caches.match(event.request, { ignoreSearch: true })
          .then(res => res || caches.match('/win95-games/solitaire/index.html', { ignoreSearch: true }));
      });
    })
  );
});
