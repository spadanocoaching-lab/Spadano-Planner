// Spadano Planner — Service Worker
// Cache "app shell" per funzionamento offline. La versione del cache va alzata
// a ogni release: il browser scarica i file nuovi e butta i vecchi.
const CACHE = "spadano-planner-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategia: network-first per l'HTML (così vedi subito gli aggiornamenti),
// cache-first per il resto (icone). Se sei offline, ricade sulla cache.
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then((r) => r || caches.match("./index.html")))
    );
  } else {
    e.respondWith(caches.match(req).then((r) => r || fetch(req)));
  }
});
