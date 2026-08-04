/**
 * useRefreshImages
 * ----------------
 * Action complète de "rafraîchir les images" :
 *   1. Demande au Service Worker de purger ses caches d'images.
 *   2. Force le re-fetch du manifeste /api/images-version.
 *   3. Recharge la page (hard reload, ignore le cache HTTP).
 *
 * Pourquoi :
 *   Sur un site ultra évolutif, après avoir bumpé une version dans
 *   data/image-versions.json + redéployé, l'user (surtout sur PWA
 *   installée) peut voir l'ancienne image parce que :
 *     - son Service Worker a l'ancienne réponse en cache STATIC,
 *     - son navigateur HTTP cache a l'ancienne réponse (1 an avant).
 *   Ce hook fait le ménage une fois pour toutes.
 *
 * Usage :
 *   const refresh = useRefreshImages();
 *   <Button onClick={refresh}>🔄 Rafraîchir les images</Button>
 */

import { useCallback, useState } from "react";
import { refreshImageVersions } from "@/hooks/useImageVersions";

export function useRefreshImages() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const refresh = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setDone(false);
    try {
      // 1. Purge cache SW (images)
      if (
        typeof navigator !== "undefined" &&
        "serviceWorker" in navigator &&
        navigator.serviceWorker.controller
      ) {
        const purged = new Promise<void>((resolve) => {
          const channel = new MessageChannel();
          channel.port1.onmessage = () => resolve();
          // Timeout de sécurité (1.5s) si le SW ne répond pas
          const timeout = setTimeout(resolve, 1500);
          const sw = navigator.serviceWorker.controller;
          if (sw) {
            sw.postMessage({ type: "PURGE_IMAGES" }, [channel.port2]);
          } else {
            clearTimeout(timeout);
            resolve();
            return;
          }
          channel.port1.onmessage = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
        await purged;
      } else {
        // Pas de SW : on tente un unregister pour forcer la réinstall
        // au prochain load (utile en dev / PWA pas encore activée)
        try {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.unregister()));
        } catch {
          /* noop */
        }
      }

      // 2. Force le re-fetch du manifest
      await refreshImageVersions();

      // 3. Hard reload — bypass cache HTTP
      window.location.reload();
    } catch (e) {
      // En cas d'erreur, on tente quand même le reload
      window.location.reload();
    }
  }, [busy]);

  return { refresh, busy, done };
}
