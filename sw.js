// Escala JBS - ambiente de testes, versão 1.3.
// Rede primeiro; arquivos essenciais disponíveis offline.
const CACHE = 'manutencao-jbs-teste-v1-3-0';
const SCOPE = self.registration.scope;
const APP = new URL('./index.html', SCOPE).href;
const ASSETS = [
  APP,
  new URL('./manifest.webmanifest', SCOPE).href,
  new URL('./icon-192.png', SCOPE).href,
  new URL('./icon-512.png', SCOPE).href
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key.startsWith('manutencao-jbs-') && key !== CACHE)
            .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.href.startsWith(SCOPE)) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).then(response => {
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
