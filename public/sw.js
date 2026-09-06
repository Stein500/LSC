/* ============================================================
   COLOMBES PWA — service worker « fil fin »
   ------------------------------------------------------------
   Rôle : rendre l'atelier installable (PWA) et le relancer vite,
   SANS jamais servir de contenu périmé :
   - navigation (HTML) → réseau d'abord, cache en secours (offline)
   - statique (images, css, js, fonts) → cache d'abord, réseau à jour
   - /api/** → JAMAIS mis en cache (suivi live, tickets PDF)
   ============================================================ */
const CACHE = "colombes-v2";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/", "/index.html", "/manifest.webmanifest"])).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // fonts/CDN : laisser le navigateur
  if (url.pathname.startsWith("/api/")) return; // live only

  // Pages : réseau d'abord — le fil direct de l'atelier.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return resp;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  // Statique : cache d'abord (les noms Vite sont hashés, sûrs à garder).
  if (/\.(webp|png|jpe?g|gif|ico|svg|woff2?|css|js|webmanifest)$/i.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((resp) => {
            if (resp.ok) {
              const copy = resp.clone();
              caches.open(CACHE).then((c) => c.put(request, copy));
            }
            return resp;
          })
      )
    );
  }
});
