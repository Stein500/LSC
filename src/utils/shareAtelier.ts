/**
 * shareAtelier — « le partage des médias, pour de vrai » 🕊️
 * -----------------------------------------------------------
 * Demande explicite de la cheffe : chaque image doit pouvoir voyager
 * (WhatsApp, Facebook, SMS…) **en tant que PHOTO**, et **le lien du site
 * la suit** dans la légende : celui qui reçoit retombe directement chez nous.
 *
 *   📱 1er essai → partage natif AVEC le fichier image (Web Share Level 2) :
 *       la photo s'envoie vers WhatsApp & co, la légende porte le lien.
 *   🌍 Repli     → partage texte natif (lien cliquable dans le message)
 *   🖥️ Ailleurs  → texte + lien copiés, prêts à coller
 *
 * Le texte partagé contient TOUJOURS l'URL canonique du site.
 */

import { env } from "./env";
import { notify } from "./notify";
import { shareText } from "./share";

const SITE_TITLE = "Couture Colombe et Merceries";

/** URL publique de partage : site canonique + chemin (+ ancre éventuelle). */
export function atelierShareUrl(path: string, hash?: string | null): string {
  const base = env.siteUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanHash = hash && hash.length > 0 ? `#${hash.replace(/^#/, "")}` : "";
  return `${base}${cleanPath}${cleanHash}`;
}

/**
 * Prépare un FICHIER image partageable à partir d'une URL du site.
 * Toutes les messageries ne lisent pas le WebP : on convertit en JPEG
 * via canvas (même origine → pas de souci CORS). Retourne null si le
 * moindre fil casse — l'appelant retombe alors sur le partage texte.
 */
async function imageToShareFile(src: string): Promise<File | null> {
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const base =
      (src.split("/").pop() || "modele").replace(/\.[a-z0-9]+$/i, "") || "modele";
    const name = `couture-colombe-merceries--${base}.jpg`;

    // JPEG/PNG natifs : tels quels. Sinon (webp…) → conversion JPEG.
    if (blob.type === "image/jpeg" || blob.type === "image/png") {
      return new File([blob], name, { type: blob.type });
    }
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close?.();
    const jpeg = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.9),
    );
    if (!jpeg) return null;
    return new File([jpeg], name, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

/**
 * Partage d'une image d'ambiance / d'un modèle.
 * `caption` habille le message ; `path` et `hash` mènent vers la bonne page ;
 * `imageSrc` (recommandé) permet d'EMBARQUER la vraie photo dans le partage.
 */
export async function shareAtelierImage(opts: {
  caption?: string | null;
  path: string;
  hash?: string | null;
  imageSrc?: string | null;
}): Promise<void> {
  const url = atelierShareUrl(opts.path, opts.hash);
  const caption = (opts.caption ?? "").trim();
  const text = `${caption ? `${caption} ✨\n` : ""}${SITE_TITLE} 🧵✂️\n${url}`;

  // 1) 🕊️ Le vrai geste « média » : la PHOTO part, le lien la suit en légende.
  if (
    opts.imageSrc &&
    typeof navigator !== "undefined" &&
    typeof navigator.canShare === "function" &&
    typeof navigator.share === "function"
  ) {
    try {
      const file = await imageToShareFile(opts.imageSrc);
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: SITE_TITLE, text });
        return; // ✅ la photo voyage
      }
    } catch (e) {
      // Annulé du doigt : on sort proprement, sans double partage.
      if ((e as DOMException)?.name === "AbortError") return;
      // Toute autre glissade → on continue vers le partage texte.
    }
  }

  // 2) Repli élégant : pont app, partage texte natif, puis presse-papiers.
  const channel = await shareText(text, SITE_TITLE);
  if (channel === "clipboard") {
    notify.success("Lien copié — collez-le sur WhatsApp pour partager 🕊️");
  } else if (channel === "failed") {
    notify.error("Le partage a glissé entre les mailles — réessayez.");
  }
}
