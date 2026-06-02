const CACHE = "ev-charge-lk-v2";
const STATIC = [
  "/",
  "/manifest.json",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/data/stations.json",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Push notifications ──────────────────────────────
self.addEventListener("push", (e) => {
  let data = { title: "EV PRO", body: "New update available", url: "/" };
  try { if (e.data) data = { ...data, ...e.data.json() }; } catch { /* plain text */ }
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
      vibrate: [80, 40, 80],
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = e.notification.data?.url || "/";
  e.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      for (const c of clients) {
        if (c.url.includes(url) && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Never cache API routes or external requests
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) {
    e.respondWith(fetch(request).catch(() => new Response("Offline", { status: 503 })));
    return;
  }

  // Map tiles — network first, cache fallback
  if (url.hostname.includes("carto") || url.hostname.includes("arcgis")) {
    e.respondWith(
      caches.open("ev-tiles-v1").then(async (cache) => {
        try {
          const res = await fetch(request);
          cache.put(request, res.clone());
          return res;
        } catch {
          return cache.match(request) ?? new Response("", { status: 408 });
        }
      })
    );
    return;
  }

  // Static assets — cache first
  e.respondWith(
    caches.match(request).then((cached) =>
      cached ?? fetch(request).then((res) => {
        if (res.ok) {
          caches.open(CACHE).then((c) => c.put(request, res.clone()));
        }
        return res;
      })
    )
  );
});
