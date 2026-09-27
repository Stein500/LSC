/**
 * shareAtelier — « le lien de notre site doit le suivre » 🕊️
 * -----------------------------------------------------------
 * Demande explicite de la cheffe : chaque image doit pouvoir voyager
 * (WhatsApp, Facebook, SMS…) **avec le lien du site dans le message** :
 * celui qui reçoit retombe directement chez nous.
 *
 *   📱 App / mobile → partage natif (via shareText)
 *   🖥️ Ailleurs     → texte + lien copiés, prêts à coller sur WhatsApp
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
 * Partage d'une image d'ambiance / d'un modèle.
 * `caption` habille le message ; `path` et `hash` mènent vers la bonne page.
 */
export async function shareAtelierImage(opts: {
  caption?: string | null;
  path: string;
  hash?: string | null;
}): Promise<void> {
  const url = atelierShareUrl(opts.path, opts.hash);
  const caption = (opts.caption ?? "").trim();
  const text = `${caption ? `${caption} ✨\n` : ""}${SITE_TITLE} 🧵✂️\n${url}`;

  const channel = await shareText(text, SITE_TITLE);
  if (channel === "clipboard") {
    notify.success("Lien copié — collez-le sur WhatsApp pour partager 🕊️");
  } else if (channel === "failed") {
    notify.error("Le partage a glissé entre les mailles — réessayez.");
  }
}
