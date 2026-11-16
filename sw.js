// Manutenção JBS - teste: rede primeiro, cache para funcionamento offline.
const CACHE = 'manutencao-jbs-teste-v1-2-0';
const APP = new URL('./index.html', self.registration.scope).href;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.add(APP)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('manutencao-jbs-') && key !== CACHE)
          .map(key => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, {cache:'no-store'}).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(APP, copy)));
        }
        return response;
      }).catch(async () => (await caches.match(APP)) || Response.error())
    );
    return;
  }
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
