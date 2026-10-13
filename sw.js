/* Tiny Tools: same-origin, network-first, public HTML only. No user input is cached. */
'use strict';
const BASE = '/sheetclean-lite/';
const CACHE = 'tinytools-pages-v1';
const PAGES = [
  BASE,
  BASE + 'apps/',
  BASE + 'handover-gap-checker/',
  BASE + 'announce-checker/',
  BASE + 'dm-order-checker/'
];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(async cache => {
      // One unavailable page should never block the whole service worker.
      await Promise.allSettled(PAGES.map(path => cache.add(new Request(path, { cache: 'reload' }))));
    }).then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('tinytools-pages-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  // Never intercept APIs, downloads, submitted files, or other cross-origin requests.
  if (request.mode !== 'navigate') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const response = await fetch(request);
      if (response.ok && response.type === 'basic') {
        event.waitUntil(cache.put(request, response.clone()).catch(() => {}));
      }
      return response;
    } catch (_) {
      const matching = await cache.match(request, { ignoreSearch: true });
      if (matching) return matching;
      const canonical = url.pathname.endsWith('/index.html') ? url.pathname.slice(0, -'index.html'.length) : url.pathname;
      const fallback = await cache.match(canonical);
      if (fallback) return fallback;
      return new Response('オフラインです。このページをオンラインで一度開いてからお試しください。', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
