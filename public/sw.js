const BASE = self.location.pathname.replace(/\/sw\.js$/, "") || "";
const CACHE = "print-paint-mixer-v3";
const PRECACHE = [`${BASE}/manifest.webmanifest`, `${BASE}/icon.svg`];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept Next.js assets — stale chunks break hydration.
  if (url.pathname.includes("/_next/")) return;

  const isPrecache = PRECACHE.includes(url.pathname);

  if (isPrecache) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached ?? fetch(event.request)),
    );
    return;
  }

  // Network-first for HTML and everything else; offline fallback only for navigations.
  if (event.request.mode === "navigate") {
    const home = `${BASE}/`;
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((r) => r ?? caches.match(home) ?? caches.match(`${BASE}/index.html`)),
        ),
    );
  }
});
