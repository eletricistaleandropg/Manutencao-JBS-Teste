const CACHE='manutencao-jbs-v1-1-1-teste';
const FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('manutencao-jbs-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET')return;
 const u=new URL(r.url);if(u.origin!==self.location.origin||!u.pathname.startsWith(new URL('./',self.registration.scope).pathname))return;
 if(r.mode==='navigate'){
  e.respondWith(caches.match('./index.html').then(saved=>saved||fetch(r)));
  return;
 }
 e.respondWith(caches.match(r).then(saved=>saved||fetch(r)));
});
