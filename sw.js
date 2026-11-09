importScripts("giochi.js"); // definisce GIOCHI: nomi di ROM e copertine stanno in un solo posto

const V = "pocket-dot-v5";
const CORE = ["./", "index.html", "giochi.html", "giochi.js", "manifest.json",
              "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
const EXTRA = [
  ...GIOCHI.map(g => "roms/" + encodeURIComponent(g.file)),
  ...GIOCHI.filter(g => g.img).map(g => "covers/" + encodeURIComponent(g.img))
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(V).then(async c => {
      await c.addAll(CORE);
      // ROM e copertine vengono salvate una a una: se un file manca, gli altri vengono salvati comunque.
      await Promise.all(EXTRA.map(u => c.add(u).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== V).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r => r ||
      fetch(e.request).then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => e.request.mode === "navigate" ? caches.match("index.html") : Response.error())
    )
  );
});
