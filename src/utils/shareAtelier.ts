/**
 * shareAtelier — « la photo voyage TOUJOURS » 📤🕊️
 * ------------------------------------------------------------
 * Deux demandes de la cheffe (28/09/2026) :
 *   1. Un clic = le panneau de partage s'ouvre DIRECTEMENT (celui où
 *      l'on choisit WhatsApp, Facebook, « Copier le lien »…).
 *   2. La photo doit Y ÊTRE. Et quand le téléphone ne sait pas joindre
 *      une photo au panneau (navigateurs anciens), TROUVER UN VRAI
 *      COMPROMIS — pas un simple lien copié en douce.
 *
 * La couture complète, dans l'ordre :
 *
 *   A. Détection HONNÊTE au clic (sonde JPEG minuscule) : ce téléphone
 *      accepte-t-il VRAIMENT les fichiers dans le panneau ?
 *
 *   B. OUI → la photo est déjà chaude (convertie en JPEG dès que le
 *      doigt s'est posé) → le panneau natif s'ouvre d'un coup,
 *      LA PHOTO DEDANS, le lien dans la légende. ✨
 *
 *   C. NON (ou couac) → « LA BOUÉE PHOTO » 🤍 : au MÊME clic,
 *      la photo est enregistrée AUTOMATIQUEMENT dans la Galerie
 *      (dernière image en date), PUIS le panneau natif s'ouvre avec
 *      texte + lien. Un toast guide en français :
 *      « 📸 Photo dans ta galerie — ajoute-la dans WhatsApp ».
 *      Ni lien silencieux, ni photo perdue : la photo voyage
 *      toujours, d'une façon ou d'une autre.
 *
 * Le texte partagé contient TOUJOURS l'URL canonique du site.
 */

import { env } from "./env";
import { notify } from "./notify";
import { shareText } from "./share";

const SITE_TITLE = "Couture Colombe et Merceries";

/** Attente maximale de la photo avant d'ouvrir le panneau quand même. */
const FILE_GRACE_MS = 900;
/** Grâce courte pour la bouée (la galerie n'aime pas attendre). */
const LIFEBUOY_GRACE_MS = 400;
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

function imageToShareFile(src: string): Promise<File | null> {
  return (async () => {
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
  })();
}

/**
 * À appeler DÈS QUE LE DOIGT SE POSE sur un bouton Partager
 * (onPointerDown / onPointerEnter) : lance la préparation JPEG en
 * coulisses, en cache — au clic, le fichier est prêt.
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

/* ═══════════════ Sonde honnête : les fichiers passent-ils ici ? ═══════════════ */

let filesShareSupport: boolean | null = null;

/**
 * Vrai test de capacité : certains navigateurs disent « navigator.share »
 * présent mais REFUSENT les fichiers — c'est eux qui finissaient en
 * simple lien. Une sonde JPEG minuscule nous le dit, sans rien préparer.
 */
function detectFilesShareSupport(): boolean {
  if (filesShareSupport !== null) return filesShareSupport;
  try {
    const probe = new File([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], "sonde.jpg", {
      type: "image/jpeg",
    });
    filesShareSupport =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [probe] });
  } catch {
    filesShareSupport = false;
  }
  return filesShareSupport;
}

/* ═══════════════ La bouée photo : direction la Galerie ═══════════════ */

/**
 * Enregistre la photo dans les Téléchargements / la Galerie — elle
 * devient la DERNIÈRE image, toute prête à être jointe à la main
 * dans WhatsApp & co. Utilise le JPEG déjà converti si disponible,
 * sinon l'image d'origine. Retourne true si l'enregistrement part.
 */
function downloadPhotoForGallery(src: string, readyFile: File | null): boolean {
  try {
    const a = document.createElement("a");
    let objectUrl: string | null = null;
    if (readyFile) {
      objectUrl = URL.createObjectURL(readyFile);
      a.href = objectUrl;
      a.download = readyFile.name;
    } else {
      const base =
        (src.split("/").pop() || "modele").replace(/\.[a-z0-9]+$/i, "") || "modele";
      const ext = (src.split(".").pop() || "webp").split("?")[0];
      a.href = src;
      a.download = `couture-colombe-merceries--${base}.${ext}`;
    }
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl!), 15000);
    return true;
  } catch {
    return false;
  }
}

/* ═══════════════ Le partage d'image, de vrai ═══════════════ */

/**
 * Partage d'une image d'ambiance / d'un modèle.
 * `caption` habille le message ; `path` et `hash` mènent vers la bonne page ;
 * `imageSrc` (recommandé) permet d'EMBARQUER la vraie photo dans le panneau
 * — ou de la déposer dans la Galerie si l'appareil ne sait pas la joindre.
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

  // B) 🕊️ Le geste idéal : la PHOTO est jointe au panneau natif.
  if (opts.imageSrc && canNative && detectFilesShareSupport()) {
    try {
      const file = await Promise.race([
        prepareAtelierShareFile(opts.imageSrc),
        delay(FILE_GRACE_MS),
      ]);
      if (file && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: SITE_TITLE, text });
        return; // ✅ la photo voyage, jointe au panneau
      }
    } catch (e) {
      // Annulé du doigt : on sort proprement, sans double partage.
      if ((e as DOMException)?.name === "AbortError") return;
      // Toute autre glissade → bouée photo juste après.
    }
  }

  // C) 🤍 LA BOUÉE PHOTO : l'appareil ne sait pas joindre les fichiers
  //    au panneau → la photo est ENREGISTRÉE dans la Galerie au même
  //    geste, puis le panneau s'ouvre. La photo voyage toujours.
  let photoInGallery = false;
  if (opts.imageSrc) {
    const ready = await Promise.race([
      prepareAtelierShareFile(opts.imageSrc),
      delay(LIFEBUOY_GRACE_MS),
    ]);
    photoInGallery = downloadPhotoForGallery(opts.imageSrc, ready);
  }

  const channel = await shareText(text, SITE_TITLE);

  if (channel === "native" || channel === "app") {
    if (photoInGallery) {
      notify.success(
        "📸 Photo enregistrée dans ta galerie — ajoute-la dans WhatsApp, le lien est tout prêt ✨",
      );
    }
    return;
  }
  if (channel === "clipboard") {
    notify.success(
      photoInGallery
        ? "📸 Photo enregistrée et lien copié — dans WhatsApp : ajoute la photo, puis colle le lien 🧵"
        : "Lien copié — collez-le sur WhatsApp pour partager 🕊️",
    );
    return;
  }
  if (channel === "failed") {
    notify.error(
      photoInGallery
        ? "📸 La photo est dans ta galerie — le lien, lui, a glissé : réessaie de copier."
        : "Le partage a glissé entre les mailles — réessayez.",
    );
  }
  // "cancelled" → la personne a fermé le panneau : silence respectueux.
}
