const CACHE_NAME = 'win95-solitaire-v6';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/win95-games/solitaire/',
        '/win95-games/solitaire/index.html',
        '/win95-games/solitaire/manifest.json',
        '/win95-games/solitaire/icon.svg'
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
          // Offline fallback
          return caches.match('/win95-games/solitaire/index.html').then(fb => {
            if (fb) return fb;
            return caches.match('/win95-games/solitaire/');
          });
        });
    })
  );
});
