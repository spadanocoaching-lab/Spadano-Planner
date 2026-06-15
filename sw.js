const CACHE='spadano-v9';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const isNav = e.request.mode==='navigate' || e.request.destination==='document';
  if(isNav){
    // network-first per l'HTML: carica sempre l'ultima versione online, cache come fallback offline
    e.respondWith(
      fetch(e.request).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>{try{c.put('./index.html',cp);}catch(_){}}); return res; })
        .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  // cache-first per gli altri asset, con aggiornamento in background
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>{try{c.put(e.request,cp);}catch(_){}}); return res; }).catch(()=>caches.match('./index.html'))));
});
