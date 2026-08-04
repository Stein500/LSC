/* =============================================================
   sw.js — Les Services Colombes
   Build : 20260710-1354-6bcc  (injecté par scripts/inject-build-version.cjs)

   Stratégie (v3 — propre) :
   - HTML navigations : network-first STRICT. Le navigateur doit TOUJOURS
     re-télécharger le HTML depuis Vercel. On ne sert JAMAIS un HTML
     statique en cache si le réseau est dispo.
     Fallback (offline) → /offline.html.

   - Static assets (JS / CSS / images / fonts) : cache-first
     avec stale-while-revalidate, et purge automatique des anciens
     caches à l'activate().

   - API : JAMAIS intercepté.

   - Plus de mode "spa=1" : on supprime la double archi page-statique
     → SPA. Les pages SEO sont autonomes, la SPA est sur /.
     Le bouton "Entrer" est un simple <a href="/">.

   Avantages :
   - Plus de ERR_FAILED sur les URL du type /index.html?spa=1&route=...
   - Plus de cache "fantôme" qui sert l'ancien bundle après déploiement.
   - Le user voit la dernière version à chaque refresh.
   ============================================================= */

const VERSION = "20260710-1354-6bcc";
const STATIC_CACHE = `lsc-static-${VERSION}`;
const RUNTIME_CACHE = `lsc-runtime-${VERSION}`;
const OFFLINE_URL = "/offline.html";

/* Assets critiques à pré-cacher pour le mode offline (mêmes URLs que
   le Vite build) : on les ajoute à l'install. Les HTML ne sont PAS
   pré-cachés — ils seront cachés à la volée par le runtime. */
const PRECACHE_URLS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icon-192.webp",
  "/icon-512.webp",
  "/icon-512.webp",
  "/images/logo.webp",
  "/images/logo.webp",
  "/assets/static-page.css",
  "/assets/static-bootstrap.js",
];

/* ---------- Install ---------- */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) =>
        // addAll peut échouer si une URL 404 — on tolère l'erreur et on
        // continue. Les fichiers vraiment utiles sont en cache HTTP
        // long (immutable) côté Vercel, le SW n'en a pas besoin.
        cache.addAll(PRECACHE_URLS).catch(() => null)
      )
      .then(() => self.skipWaiting())
  );
});

/* ---------- Activate : purge TOUS les anciens caches ---------- */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // On garde uniquement les caches qui commencent par lsc-
            // ET qui contiennent la VERSION courante. Tout le reste
            // (ancien lsc-v2, lsc-static-v2, etc.) est viré.
            .filter((k) => k.startsWith("lsc-") && !k.endsWith(`-${VERSION}`))
            .map((k) => {
              try {
                return caches.delete(k);
              } catch (e) {
                return null;
              }
            })
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------- Helpers ---------- */
function isHTMLNavRequest(req) {
  if (req.mode === "navigate") return true;
  const accept = req.headers.get("accept") || "";
  return req.method === "GET" && accept.includes("text/html");
}

/* ---------- Fetch ---------- */
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // 1) API : on laisse passer sans interception
  if (url.pathname.startsWith("/api/")) return;

  // 2) Cross-origin (Google Fonts, etc.) : stale-while-revalidate
  if (url.hostname !== self.location.hostname) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const network = fetch(req)
          .then((res) => {
            if (res && res.status === 200) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
    return;
  }

  // 3) Navigation HTML : network-first avec cache de secours
  if (isHTMLNavRequest(req)) {
    event.respondWith(
      (async () => {
        const navCache = await caches.open(RUNTIME_CACHE);
        const cachedNav = await navCache.match(req);
        try {
          const res = await fetch(req);
          if (res && res.status === 200 && res.type === "basic") {
            navCache.put(req, res.clone()).catch(() => null);
          }
          return res;
        } catch (err) {
          // Hors-ligne : on privilégie la dernière page visitée, puis la
          // page dédiée offline. Cela évite la page native du navigateur.
          if (cachedNav) return cachedNav;
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return new Response(
            `<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#BFFF00"><title>Hors ligne</title><body style="font-family:system-ui,sans-serif;padding:24px;line-height:1.6"><h1>Hors ligne</h1><p>La page hors ligne n'est pas encore disponible localement. Reconnectez-vous puis rafraîchissez.</p></body></html>`,
            {
              status: 503,
              statusText: "Offline",
              headers: { "Content-Type": "text/html; charset=utf-8" },
            }
          );
        }
      })()
    );
    return;
  }

  // 4) Static assets (JS, CSS, images, fonts) : stale-while-revalidate
  //    (PAS cache-first — sinon le user voit l'ancienne image après un
  //    bump de version, même si la nouvelle est déjà sur le CDN).
  //
  //    On lance la requête réseau en parallèle du cache. Si le réseau
  //    répond, on met à jour le cache et on RENVOIE la réponse réseau
  //    (pas le cache). Si le réseau échoue, on fallback sur le cache.
  //    Si rien n'est en cache et que le réseau est down → 504.
  event.respondWith(
    caches.open(STATIC_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const fetchPromise = fetch(req)
        .then((res) => {
          if (res && res.status === 200 && res.type === "basic") {
            cache.put(req, res.clone()).catch(() => null);
          }
          return res;
        })
        .catch(() => null);
      // Toujours privilégier la réponse fraîche du réseau.
      const networkRes = await fetchPromise;
      if (networkRes) return networkRes;
      // Réseau down → fallback cache.
      if (cached) return cached;
      return new Response("", { status: 504 });
    })
  );
});

/* ---------- Messages ---------- */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();

  // Purge totale des caches LSC (utilisé par le bouton admin
  // "🔄 Rafraîchir les images" pour forcer le re-téléchargement).
  if (event.data === "PURGE_CACHES" || (event.data && event.data.type === "PURGE_IMAGES")) {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(
            keys
              .filter((k) => k.startsWith("lsc-") && !k.endsWith(`-${VERSION}`))
              .map((k) => caches.delete(k))
          )
        )
        .then(async () => {
          // On purge aussi les entrées "images" du cache STATIC courant
          // pour forcer le re-téléchargement immédiat.
          try {
            const staticCache = await caches.open(STATIC_CACHE);
            const keys = await staticCache.keys();
            await Promise.all(
              keys
                .filter((req) => {
                  try {
                    const u = new URL(req.url);
                    return (
                      u.pathname.startsWith("/images/") ||
                      u.pathname.endsWith(".webp") ||
                      u.pathname.endsWith(".png") ||
                      u.pathname.endsWith(".jpg") ||
                      u.pathname.endsWith(".jpeg") ||
                      u.pathname.endsWith(".avif") ||
                      u.pathname.endsWith(".svg")
                    );
                  } catch {
                    return false;
                  }
                })
                .map((req) => staticCache.delete(req))
            );
          } catch (e) {
            /* pas grave */
          }
          if (event.source && event.source.postMessage) {
            event.source.postMessage("CACHES_PURGED");
          }
        })
    );
  }
});
