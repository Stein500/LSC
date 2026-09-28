/**
 * imageEmbed — la photo du modèle voyage JUSQUE DANS LE PDF 📎
 * ------------------------------------------------------------
 * Les images du site sont en WebP, que les PDF (pdf-lib) ne savent pas
 * embarquer. Ici, côté navigateur, on passe par le canvas : n'importe
 * quelle image (webp de la galerie, photo de la cliente) ressort en
 * **JPEG dataURL**, taille MAÎTRISÉE, prête à être envoyée à l'API et
 * cousue dans le ticket PDF.
 *
 * Garde-fous (28/09/2026 — « l'envoi avec images, bien et propre ») :
 *   · borne ~1000 px / qualité 0.82 → ~100-300 Ko ;
 *   · si le résultat dépasse tout de même ~345 Ko (photo riche en
 *     détails), on RECOUD plus petit automatiquement ;
 *   · l'ORIENTATION EXIF des photos de téléphone est respectée —
 *     fini les modèles couchés sur le côté dans le ticket ;
 *   · formats capricieux (HEIC…) → null : la commande part quand
 *     même, juste sans embarquage photo.
 */

const MAX_DIM = 1000;
const JPEG_QUALITY = 0.82;
/** « Petit modèle de secours » si la première couture dépasse la jauge. */
const RETRY_DIM = 820;
const RETRY_QUALITY = 0.68;
/** Jauge maximale du dataURL (caractères) : ~345 Ko binaires. */
const SIZE_GUARD = 460_000;

/** Dessine une image dans un canvas borné et ressort un JPEG dataURL. */
function drawToJpegDataUrl(
  img: HTMLImageElement | ImageBitmap,
  srcW: number,
  srcH: number,
  maxDim: number,
  quality: number,
): string | null {
  const scale = Math.min(1, maxDim / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  try {
    return canvas.toDataURL("image/jpeg", quality);
  } catch {
    return null;
  }
}

/** Première couture, puis recousue plus petite si la jauge déborde. */
function finishJpeg(
  img: HTMLImageElement | ImageBitmap,
  srcW: number,
  srcH: number,
): string | null {
  const first = drawToJpegDataUrl(img, srcW, srcH, MAX_DIM, JPEG_QUALITY);
  if (first && first.length <= SIZE_GUARD) return first;
  return drawToJpegDataUrl(img, srcW, srcH, RETRY_DIM, RETRY_QUALITY);
}

/** URL (même origine, ex. /images/gallery/…webp) → JPEG dataURL. */
export async function urlToJpegDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const out = finishJpeg(bitmap, bitmap.width, bitmap.height);
    bitmap.close?.();
    return out;
  } catch {
    return null;
  }
}

/** Fichier choisi par la cliente (input file) → JPEG dataURL. */
export async function fileToJpegDataUrl(file: File | Blob): Promise<string | null> {
  try {
    let bitmap: ImageBitmap;
    try {
      // Respecte l'orientation EXIF des photos de téléphone (Chrome & co) :
      // le modèle arrive DROIT dans le ticket, pas couché sur le côté.
      bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      } as ImageBitmapOptions);
    } catch {
      bitmap = await createImageBitmap(file);
    }
    const out = finishJpeg(bitmap, bitmap.width, bitmap.height);
    bitmap.close?.();
    return out;
  } catch {
    // Certains formats (HEIC…) ne passent pas le canvas : tant pis,
    // la commande reste envoyée, juste sans embarquage photo.
    return null;
  }
}
