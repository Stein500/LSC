/**
 * imageVersion.ts
 * ----------------
 * Système de versioning d'images pour bypass le cache navigateur/CDN.
 *
 * Pourquoi :
 *   Ton site est ultra évolutif : tu changes souvent des images. Avec
 *   Cache-Control "public, max-age=31536000, immutable" sur Vercel +
 *   le cache-first du Service Worker, le navigateur et la PWA servent
 *   l'ancienne image pendant des jours.
 *
 * Comment ça marche :
 *   1. L'API /api/images-version retourne un manifeste :
 *      { "/images/header-colombes.webp": 7, "/images/logo.webp": 3, ... }
 *   2. Le client charge ce manifeste au boot (useImageVersions)
 *   3. Quand tu affiches une image, on appelle `withVersion(src)`
 *      qui ajoute `?v=7` → le navigateur voit une URL différente
 *      et la re-télécharge.
 *   4. Pour bump une image, tu incrémentes sa version dans
 *      data/image-versions.json et tu re-déploies (ou même pas :
 *      l'API peut lire depuis un KV / base de données plus tard).
 *
 * Avantage :
 *   - Changer une image = 1 ligne dans un JSON, pas de rebuild.
 *   - Le cache reste efficace : seules les images bumpées sont
 *     re-téléchargées.
 *   - Marche aussi pour la PWA installée.
 */

/**
 * Ajoute `?v=N` (ou `&v=N` si l'URL a déjà un query) à une URL d'image.
 *
 * @example
 *   withVersion("/images/logo.webp", 3) // → "/images/logo.webp?v=3"
 *   withVersion("/img?token=abc", 5)    // → "/img?token=abc&v=5"
 */
export function withVersion(src: string, version?: number | string): string {
  if (!src) return src;
  if (version === undefined || version === null) return src;

  // Ne versionne que les URLs relatives (chemins du site)
  // ou http(s) du même site — pas les CDN externes (Unsplash, etc.)
  if (/^https?:\/\//i.test(src)) {
    try {
      const u = new URL(src);
      if (u.host !== "localhost" && u.host !== "127.0.0.1") {
        // URL externe : on ne touche pas
        return src;
      }
    } catch {
      return src;
    }
  }

  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}v=${encodeURIComponent(String(version))}`;
}

export type ImageVersionMap = Record<string, number>;

/**
 * Versionne toutes les URLs d'un tableau (utile pour les galeries).
 */
export function withVersions(
  srcs: string[],
  versions: ImageVersionMap,
): string[] {
  return srcs.map((s) => withVersion(s, versions[s]));
}
