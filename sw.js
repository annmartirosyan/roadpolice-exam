const CACHE_NAME = 'varordakan-v8';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css?v=20261113c',
  './app-core.js?v=20261113b',
  './app.js?v=20261113b',
  './manifest.webmanifest',
  './logo-192.png',
  './logo-512.png',
  './data/questions.js?v=20261113b',
  './data/signs.js?v=20261113b',
  './data/color_tests.js?v=20261113b',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.all(
          CORE_ASSETS.map((url) =>
            fetch(url, { cache: 'no-cache' }).then((resp) => {
              if (resp && resp.ok) return cache.put(url, resp);
            })
          )
        )
      )
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  const isAssetImage =
    url.pathname.includes('/data/images/') ||
    url.pathname.includes('/data/signs/') ||
    url.pathname.includes('/data/color_tests/');

  if (isAssetImage) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return resp;
        });
      })
    );
    return;
  }

  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return resp;
      })
      .catch(() => caches.match(req))
  );
});
