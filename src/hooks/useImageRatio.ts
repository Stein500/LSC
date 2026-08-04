import { useEffect, useState } from "react";

export type ImageRatio = {
  /** Ratio largeur / hauteur (par ex. 1.5 pour 3:2). `null` tant que non chargé. */
  ratio: number | null;
  /** Largeur naturelle de l'image (px). */
  naturalWidth: number | null;
  /** Hauteur naturelle de l'image (px). */
  naturalHeight: number | null;
  /** true dès que l'image a été chargée au moins une fois avec succès. */
  ready: boolean;
};

/**
 * useImageRatio — détecte dynamiquement le ratio intrinsèque d'une image
 * (en utilisant `naturalWidth` / `naturalHeight`) et expose un état réactif.
 *
 * Pourquoi : permet aux hero (background + portrait) d'adapter leur
 * `aspect-ratio` à l'image réellement servie, sans CLS, sans supposer un
 * ratio fixe, et en respectant la résolution d'origine.
 *
 * Notes :
 * - Si l'image n'existe pas (404) ou si elle n'a pas encore chargé, `ready=false`
 *   et `ratio=null` : on garde le ratio de repli fourni par `fallbackRatio`.
 * - Aucune dépendance réseau lourde : on crée un Image() en mémoire.
 */
export function useImageRatio(src: string, fallbackRatio: number = 16 / 9): ImageRatio {
  const [state, setState] = useState<ImageRatio>({
    ratio: null,
    naturalWidth: null,
    naturalHeight: null,
    ready: false,
  });

  useEffect(() => {
    if (!src) {
      setState({ ratio: fallbackRatio, naturalWidth: null, naturalHeight: null, ready: false });
      return;
    }

    let cancelled = false;
    const img = new Image();
    img.decoding = "async";

    const finalize = (ok: boolean) => {
      if (cancelled) return;
      if (ok && img.naturalWidth > 0 && img.naturalHeight > 0) {
        setState({
          ratio: img.naturalWidth / img.naturalHeight,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          ready: true,
        });
      } else {
        setState({ ratio: fallbackRatio, naturalWidth: null, naturalHeight: null, ready: false });
      }
    };

    img.onload = () => finalize(true);
    img.onerror = () => finalize(false);
    img.src = src;

    return () => {
      cancelled = true;
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackRatio]);

  return state;
}

/**
 * useMultiImageRatios — charge plusieurs images en parallèle et expose un
 * `Map<src, ImageRatio>`. Utile pour les hero qui ont un fond + un portrait.
 *
 * Le `Map` est indexé par `src` pour gérer des `srcs` distincts.
 */
export function useMultiImageRatios(
  srcs: string[],
  fallbackRatio: number = 16 / 9,
): Map<string, ImageRatio> {
  const [map, setMap] = useState<Map<string, ImageRatio>>(() => {
    const m = new Map<string, ImageRatio>();
    for (const s of srcs) {
      m.set(s, { ratio: null, naturalWidth: null, naturalHeight: null, ready: false });
    }
    return m;
  });

  useEffect(() => {
    if (srcs.length === 0) return;
    const cancelled = { value: false };
    const imgs: HTMLImageElement[] = [];

    for (const src of srcs) {
      if (!src) continue;
      const img = new Image();
      img.decoding = "async";
      const finalize = (ok: boolean) => {
        if (cancelled.value) return;
        setMap((prev) => {
          const next = new Map(prev);
          if (ok && img.naturalWidth > 0 && img.naturalHeight > 0) {
            next.set(src, {
              ratio: img.naturalWidth / img.naturalHeight,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              ready: true,
            });
          } else {
            next.set(src, { ratio: fallbackRatio, naturalWidth: null, naturalHeight: null, ready: false });
          }
          return next;
        });
      };
      img.onload = () => finalize(true);
      img.onerror = () => finalize(false);
      img.src = src;
      imgs.push(img);
    }

    return () => {
      cancelled.value = true;
      for (const img of imgs) {
        img.onload = null;
        img.onerror = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcs.join("|"), fallbackRatio]);

  return map;
}
