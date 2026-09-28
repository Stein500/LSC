/**
 * shareAtelier — « un clic = le panneau, avec la photo » 📤🕊️
 * ------------------------------------------------------------
 * Demande de la cheffe (28/09/2026) : pour les visiteurs pas du tout
 * à l'aise avec l'informatique, le bouton Partager doit ouvrir
 * DIRECTEMENT le panneau de partage du téléphone (celui où l'on
 * choisit WhatsApp, Facebook, « Copier le lien »…) **avec la photo
 * déjà dedans** — jamais une copie de lien silencieuse.
 *
 * Le couac d'avant : la photo était préparée APRÈS le clic
 * (téléchargement + conversion JPEG) ; le navigateur, pressé, fermait
 * le droit d'ouvrir le panneau… et tout finissait en « lien copié ».
 *
 * La couture maintenant :
 *   1. DÈS QUE LE DOIGT SE POSE (pointerdown / survol), la galerie
 *      appelle prepareAtelierShareFile(src) : la photo est convertie
 *      en JPEG pendant les 200–400 ms du clic.
 *   2. AU CLIC, le fichier est chaud en cache : le panneau natif
 *      s'ouvre INSTANTANÉMENT avec la photo + la légende + le lien.
 *   3. Si vraiment la photo n'est pas prête (à 900 ms près) : le même
 *      panneau natif s'ouvre quand même, avec le texte + le lien.
 *   4. Vraiment aucun partage natif (vieux navigateur) : pont app,
 *      puis presse-papiers + toast — en dernier recours seulement.
 *
 * Le texte partagé contient TOUJOURS l'URL canonique du site.
 */

import { env } from "./env";
import { notify } from "./notify";
import { shareText } from "./share";

const SITE_TITLE = "Couture Colombe et Merceries";

/** Attente maximale de la photo avant d'ouvrir le panneau quand même. */
const FILE_GRACE_MS = 900;
/** Les JPEG partagés sont plafonnés : plus légers à préparer et à envoyer. */
const MAX_DIM = 1280;
const JPEG_QUALITY = 0.85;

/** URL publique de partage : site canonique + chemin (+ ancre éventuelle). */
export function atelierShareUrl(path: string, hash?: string | null): string {
  const base = env.siteUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanHash = hash && hash.length > 0 ? `#${hash.replace(/^#/, "")}` : "";
  return `${base}${cleanPath}${cleanHash}`;
}

/* ═══════════════ Préparation des fichiers, avec cache chaud ═══════════════ */

const fileCache = new Map<string, Promise<File | null>>();

async function imageToShareFile(src: string): Promise<File | null> {
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const base =
      (src.split("/").pop() || "modele").replace(/\.[a-z0-9]+$/i, "") || "modele";
    const name = `couture-colombe-merceries--${base}.jpg`;

    // JPEG/PNG natifs : tels quels (le nom porte déjà notre griffe).
    if (blob.type === "image/jpeg" || blob.type === "image/png") {
      return new File([blob], name, { type: blob.type });
    }
    // WebP & co → JPEG : toutes les messageries savent lire le JPEG.
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, MAX_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close?.();
      return null;
    }
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const jpeg = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!jpeg) return null;
    return new File([jpeg], name, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

/**
 * À appeler DÈS QUE LE DOIGT SE POSE sur un bouton Partager
 * (onPointerDown / onPointerEnter) : lance la préparation JPEG en
 * coulisses, en cache — au clic, le fichier est prêt et le panneau
 * natif s'ouvre d'un coup, sans perdre le droit d'ouverture.
 */
export function prepareAtelierShareFile(src: string): Promise<File | null> {
  let p = fileCache.get(src);
  if (!p) {
    p = imageToShareFile(src);
    fileCache.set(src, p);
  }
  return p;
}

function delay(ms: number): Promise<null> {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

/* ═══════════════ Le partage d'image, de vrai ═══════════════ */

/**
 * Partage d'une image d'ambiance / d'un modèle.
 * `caption` habille le message ; `path` et `hash` mènent vers la bonne page ;
 * `imageSrc` (recommandé) permet d'EMBARQUER la vraie photo dans le panneau.
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

  const canNative =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  // 1) 🕊️ Le geste idéal : la PHOTO est jointe au panneau natif,
  //    le lien voyage dans la légende.
  if (opts.imageSrc && canNative && typeof navigator.canShare === "function") {
    try {
      const file = await Promise.race([
        prepareAtelierShareFile(opts.imageSrc),
        delay(FILE_GRACE_MS),
      ]);
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: SITE_TITLE, text });
        return; // ✅ la photo voyage avec le lien
      }
    } catch (e) {
      // Annulé du doigt : on sort proprement, sans double partage.
      if ((e as DOMException)?.name === "AbortError") return;
      // Toute autre glissade → on ouvre le panneau « texte » juste après.
    }
  }

  // 2) Le panneau NATIF s'ouvre quand même (texte + lien ; « Copier »
  //    est dedans, comme sur tous les téléphones) — pont app avant,
  //    presse-papiers seulement si vraiment rien d'autre n'existe.
  const channel = await shareText(text, SITE_TITLE);
  if (channel === "clipboard") {
    notify.success("Lien copié — collez-le sur WhatsApp pour partager 🕊️");
  } else if (channel === "failed") {
    notify.error("Le partage a glissé entre les mailles — réessayez.");
  }
}
