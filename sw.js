const CACHE_NAME = 'varordakan-v21';
const CORE_ASSETS = [
  './',
  './index.html',
  './usucum/',
  './qnnutyun/',
  './skhalner/',
  './nshanner/',
  './gunaenkalum/',
  './orenq-jek/',
  './khagh/',
  './voronum/',
  './ru/',
  './en/',
  './styles.css?v=20261113p',
  './app-i18n.js?v=20261113o',
  './app-core.js?v=20261113j',
  './app-game.js?v=20261113p',
  './app.js?v=20261113o',
  './manifest.webmanifest',
  './logo-192.png',
  './logo-512.png',
  './data/questions.js?v=20261113e',
  './data/questions_i18n.js?v=20261113k',
  './data/signs.js?v=20261113e',
  './data/signs_i18n.js?v=20261113k',
  './data/markings.js?v=20261113e',
  './data/color_tests.js?v=20261113k',
  './data/rules.js?v=20261113e',
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
    url.pathname.includes('/data/markings/') ||
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
