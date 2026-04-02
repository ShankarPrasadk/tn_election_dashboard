const CACHE_NAME = 'tn-election-v1';
const PRECACHE = ['/', '/favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Network-first for API and data
  if (url.pathname.startsWith('/api/') || url.pathname.endsWith('.json')) {
    e.respondWith(
      fetch(e.request).then((r) => {
        const clone = r.clone();
        caches.open(CACHE_NAME).then((c) => c.put(e.request, clone));
        return r;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for static assets
  if (/\.(js|css|png|svg|woff2?)$/.test(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
        caches.open(CACHE_NAME).then((c) => c.put(e.request, resp.clone()));
        return resp;
      }))
    );
    return;
  }

  // Network-first for HTML
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
