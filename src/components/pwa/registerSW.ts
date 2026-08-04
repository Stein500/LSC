/**
 * registerSW — v3
 *
 * Changements :
 * - Enregistre sur `DOMContentLoaded` (au lieu de `window.load`).
 *   Avant, on attendait que la page soit 100% chargée (images, fonts,
 *   iframes) avant d'installer le SW → le SW s'installait 3-5s après
 *   le first paint, voire jamais si la page plantait. Maintenant :
 *   dès que le HTML est parsé, on installe le SW. Le navigateur
 *   téléchargera /sw.js en arrière-plan, sans bloquer l'UI.
 *
 * - On ajoute `?v=<timestamp de build>` à l'URL du SW pour forcer
 *   le navigateur à considérer que c'est un fichier différent de
 *   celui qu'il a déjà en cache HTTP. Combiné avec la purge des
 *   anciens caches dans sw.js activate(), ça garantit qu'à chaque
 *   déploiement, le nouveau SW s'installe et l'ancien est viré.
 *
 * - Si le user a déjà un SW qui contrôle la page, on déclenche
 *   un SKIP_WAITING dès qu'un nouveau est installé → l'user n'a
 *   pas besoin de fermer l'onglet pour voir la nouvelle version.
 */
export function registerSW() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

  // Build version injectée par Vite (variable d'env) — fallback timestamp.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BUILD_ID = (import.meta as any)?.env?.VITE_BUILD_ID || String(Date.now());

  const register = () => {
    navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(BUILD_ID)}`, { scope: "/" })
      .then((reg) => {
        // Détection d'une nouvelle version
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // Une nouvelle version est dispo, l'ancienne contrôle encore.
                // On force l'activation immédiate pour que l'user n'attende
                // pas la fermeture du tab.
                newWorker.postMessage("SKIP_WAITING");
                window.dispatchEvent(new CustomEvent("pwa:update-available"));
              } else {
                // Première installation : on notifie l'app (utile si tu
                // veux afficher un toast "PWA prête").
                window.dispatchEvent(new CustomEvent("pwa:installed"));
              }
            }
          });
        });
      })
      .catch((err) => console.warn("[SW] register failed", err));
  };

  // DOMContentLoaded : on enregistre dès que le HTML est parsé.
  // C'est plus rapide que `window.load` (qui attend images+fonts+iframes).
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", register, { once: true });
  } else {
    register();
  }

  // À chaque nouveau contrôleur (après SKIP_WAITING), on recharge
  // les modules si besoin. Ici, on ne fait rien d'agressif : le user
  // est déjà sur la dernière version grâce à la purge du cache HTML
  // par Vercel (no-cache, no-store).
  let refreshing = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing) return;
    refreshing = true;
    // Optionnel : window.location.reload() pour forcer la prise en compte
    // du nouveau bundle JS. On évite par défaut pour ne pas perdre le
    // scroll user.
  });
}
