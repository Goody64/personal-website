/* Travel service worker — cache version replaced at deploy time */
const CACHE_VERSION = '__BUILD__';
const SHELL_CACHE = 'travel-shell-' + CACHE_VERSION;
const STATIC_CACHE = 'travel-static-' + CACHE_VERSION;

const SHELL_URLS = [
  './index.html',
  './post.html',
  './editor.html',
  './manifest.webmanifest',
  '../assets/favicon.svg',
  '../assets/icon-192.png',
  '../assets/icon-512.png'
];

const STATIC_URLS = [
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_URLS)).catch(() => {})
      .then(() => caches.open(STATIC_CACHE).then((c) => c.addAll(STATIC_URLS)).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE && k !== STATIC_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // App shells: network-first so updates propagate
  if (url.pathname.includes('/travel/js/') || url.pathname.endsWith('.html')) {
    e.respondWith(
      fetch(e.request).then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(SHELL_CACHE).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  // CDN static libs: cache-first
  if (STATIC_URLS.some((u) => e.request.url.startsWith(u.split('@')[0]))) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request).then((res) => {
        if (res.ok) { const clone = res.clone(); caches.open(STATIC_CACHE).then((c) => c.put(e.request, clone)); }
        return res;
      }))
    );
    return;
  }

  // Same-origin assets: stale-while-revalidate
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchPromise = fetch(e.request).then((res) => {
          if (res.ok) { const clone = res.clone(); caches.open(SHELL_CACHE).then((c) => c.put(e.request, clone)); }
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
