const CACHE_NAME = 'win95-minesweeper-v6';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/win95-games/minesweeper/',
        '/win95-games/minesweeper/index.html',
        '/win95-games/minesweeper/manifest.json',
        '/win95-games/minesweeper/icon.svg'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(k => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match('/win95-games/minesweeper/index.html').then(fb => {
            if (fb) return fb;
            return caches.match('/win95-games/minesweeper/');
          });
        });
    })
  );
});
