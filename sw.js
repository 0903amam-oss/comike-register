const CACHE = "comike-register-v14";
const ASSETS = ["./", "./index.html", "./manifest.json"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put("./index.html", copy));
        return res;
      }).catch(() =>
        caches.open(CACHE).then(cache =>
          cache.match("./index.html").then(r => r || cache.match("./"))
        )
      )
    );
    return;
  }
  event.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(cached =>
        cached || fetch(req).then(res => {
          if (req.method === "GET" && res.ok) cache.put(req, res.clone());
          return res;
        })
      )
    )
  );
});