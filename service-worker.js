const CACHE_NAME = 'reditor-cache-01-06-2024-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/javascript.js',
  '/style.css',
  '/manifest.json',
  '/icon_192x192.png',
  '/icon_256x256.png',
  '/favicon.ico',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/theme/dracula.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.5/codemirror.min.js',
  '/syntax.js',
  '/profiles/potados.jsonc',
  '/profiles/cpu5.jsonc',
  '/profiles/pm1.jsonc'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
    .then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response;
      }
      return fetch(event.request).then(
        response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          let responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        }
      );
    })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (cacheWhitelist.indexOf(key) === -1) {
          return caches.delete(key);
        }
      }));
    })
  );
});
