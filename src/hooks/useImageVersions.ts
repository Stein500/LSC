import { useEffect, useState } from "react";
import type { ImageVersionMap } from "@/utils/imageVersion";
import { withVersion } from "@/utils/imageVersion";

/**
 * useImageVersions
 * ----------------
 * Charge le manifeste des versions d'images depuis /api/images-version
 * au boot de l'app, et expose une fonction `v(src)` qui retourne
 * l'URL versionnée.
 *
 * Comportement :
 *   - Fetch en background, ne bloque jamais le rendu
 *   - En cas d'erreur (réseau down, API down), fallback sur {} →
 *     toutes les images sont servies sans query string (état actuel
 *     du site, pas de régression)
 *   - Cache mémoire : un seul fetch par session
 *   - Re-fetch quand la PWA revient au foreground
 *
 * @example
 *   const v = useImageVersions();
 *   <img src={v("/images/header-colombes.webp")} />
 */

let cachedVersions: ImageVersionMap | null = null;
let inflight: Promise<ImageVersionMap> | null = null;

async function fetchVersions(): Promise<ImageVersionMap> {
  try {
    const res = await fetch("/api/images-version", {
      cache: "no-cache",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return {};
    const data = (await res.json()) as ImageVersionMap;
    if (data && typeof data === "object") return data;
    return {};
  } catch {
    return {};
  }
}

function getVersions(): Promise<ImageVersionMap> {
  if (cachedVersions) return Promise.resolve(cachedVersions);
  if (inflight) return inflight;
  inflight = fetchVersions()
    .then((data) => {
      cachedVersions = data;
      inflight = null;
      return data;
    })
    .catch(() => {
      inflight = null;
      return {} as ImageVersionMap;
    });
  return inflight;
}

export function useImageVersions() {
  const [versions, setVersions] = useState<ImageVersionMap>(
    () => cachedVersions ?? {},
  );

  useEffect(() => {
    let cancelled = false;

    const load = () => {
      getVersions().then((data) => {
        if (!cancelled) setVersions(data);
      });
    };

    load();

    // Re-fetch quand la PWA redevient visible (user revient d'un autre tab)
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (src: string): string => withVersion(src, versions[src]);
}

/**
 * Purge le cache mémoire (utile après un bump de version manuel).
 * À brancher sur un bouton admin "rafraîchir les images".
 */
export function refreshImageVersions(): Promise<ImageVersionMap> {
  cachedVersions = null;
  inflight = null;
  return getVersions();
}
