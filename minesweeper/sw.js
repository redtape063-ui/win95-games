const CACHE_NAME = 'win95-minesweeper-v5';
const ASSETS = [
  '/win95-games/minesweeper/',
  '/win95-games/minesweeper/index.html',
  '/win95-games/minesweeper/manifest.json',
  '/win95-games/minesweeper/icon.svg'
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
      
      if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        return caches.match('/win95-games/minesweeper/index.html', { ignoreSearch: true })
          .then(fallback => fallback || caches.match('/win95-games/minesweeper/', { ignoreSearch: true }));
      }
      
      return fetch(event.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return resp;
      }).catch(() => {
        return caches.match(event.request, { ignoreSearch: true })
          .then(res => res || caches.match('/win95-games/minesweeper/index.html', { ignoreSearch: true }));
      });
    })
  );
});
