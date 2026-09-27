/**
 * imageEmbed — la photo du modèle voyage JUSQUE DANS LE PDF 📎
 * ------------------------------------------------------------
 * Les images du site sont en WebP, que les PDF (pdf-lib) ne savent pas
 * embarquer. Ici, côté navigateur, on passe par le canvas : n'importe
 * quelle image (webp de la galerie, photo de la cliente) ressort en
 * **JPEG dataURL**, taille maîtrisée, prête à être envoyée à l'API et
 * cousue dans le ticket PDF.
 *
 * Le corps des requêtes /api/track est limité (4 Mo) : on borne à
 * ~1000 px de côté et une qualité 0.82 → ~100-350 Ko en base64.
 */

const MAX_DIM = 1000;
const JPEG_QUALITY = 0.82;

/** Dessine une image dans un canvas borné et ressort un JPEG dataURL. */
function drawToJpegDataUrl(
  img: HTMLImageElement | ImageBitmap,
  srcW: number,
  srcH: number,
): string | null {
  const scale = Math.min(1, MAX_DIM / Math.max(srcW, srcH));
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  try {
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } catch {
    return null;
  }
}

/** URL (même origine, ex. /images/gallery/…webp) → JPEG dataURL. */
export async function urlToJpegDataUrl(src: string): Promise<string | null> {
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const out = drawToJpegDataUrl(bitmap, bitmap.width, bitmap.height);
    bitmap.close?.();
    return out;
  } catch {
    return null;
  }
}

/** Fichier choisi par la cliente (input file) → JPEG dataURL. */
export async function fileToJpegDataUrl(file: File | Blob): Promise<string | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const out = drawToJpegDataUrl(bitmap, bitmap.width, bitmap.height);
    bitmap.close?.();
    return out;
  } catch {
    // Certains formats (HEIC…) ne passent pas le canvas : tant pis,
    // la commande reste envoyée, juste sans embarquage photo.
    return null;
  }
}
