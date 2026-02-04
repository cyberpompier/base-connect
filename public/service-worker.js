const CACHE_NAME = 'baseconnect-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell');
      const promises = ASSETS_TO_CACHE.map((assetUrl) => {
        // We use fetch and cache.put separately to have more control
        // and prevent one failed asset from stopping the whole process.
        return fetch(assetUrl)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`Failed to fetch ${assetUrl}: ${response.status} ${response.statusText}`);
            }
            return cache.put(assetUrl, response);
          })
          .catch((err) => {
            console.error(`Service Worker: Failed to cache ${assetUrl}.`, err);
            // We don't re-throw, allowing other assets to be cached successfully.
          });
      });
      return Promise.all(promises);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              // Cache dynamic requests for basic offline functionality
              // Note: Be careful with API requests in production apps
              if (!event.request.url.includes('supabase')) {
                 cache.put(event.request, responseToCache);
              }
            });
          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});