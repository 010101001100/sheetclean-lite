/* NOMA: cache only the published app shell. Old Tiny Tools caches are purged. */
'use strict';
const CACHE = 'noma-shell-v1';
const APP = new URL('./', self.registration.scope).pathname;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.add(new Request(APP, {cache:'reload'}))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil((async()=>{
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== CACHE && (name.startsWith('tinytools-pages-') || name.startsWith('noma-shell-'))).map(name=>caches.delete(name)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request=event.request;
  if (request.method!=='GET' || request.mode!=='navigate') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || ![APP, APP+'index.html'].includes(url.pathname))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{const res=await fetch(request);if(res.ok){event.waitUntil(cache.put(APP,res.clone()).catch(()=>{}))}return res}
    catch {return await cache.match(APP) || new Response('オフラインのためページを開けませんでした。',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}})}
  })());
});
