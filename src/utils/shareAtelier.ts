/**
 * shareAtelier — « la photo vient de l'écran » 📤🕊️
 * ------------------------------------------------------------
 * La cheffe a tranché (28/09/2026) :
 *   1. PLUS JAMAIS de téléchargement automatique — le bouton
 *      « Télécharger » des galeries est déjà là pour ça.
 *   2. Le clic ouvre le panneau de partage DIRECTEMENT, avec la
 *      photo DEDANS — comme au temps où ça marchait, même si la
 *      couture prend un instant.
 *   3. Son idée en or : puisque la photo est DÉJÀ affichée à
 *      l'écran, pourquoi aller la chercher ailleurs ?
 *
 * La couture, dans l'ordre :
 *
 *   A. SOURCE ÉCRAN — on redessine l'<img> déjà affichée (ses
 *      pixels sont déjà décodés dans le navigateur : c'est le
 *      fameux « cache » de la cheffe) sur une toile → JPEG léger.
 *      ZÉRO réseau, zéro re-téléchargement.
 *
 *   B. SOURCE CACHE — si l'élément n'est pas sous la main, on lit
 *      le cache HTTP du navigateur (force-cache) comme avant.
 *
 *   C. PATIENCE DE L'AIGUILLE — on attend la photo SANS limite
 *      d'abandon : si l'attente dépasse un souffle, un toast
 *      rassure (« Préparation de la photo… »), puis le panneau
 *      natif s'ouvre, LA PHOTO DEDANS. Le test de capacité se
 *      fait avec la VRAIE photo (canShare({ files: [vraiePhoto] }))
 *      — jamais avec une sonde qui pourrait mentir.
 *
 *   D. REPLI PROPRE — si l'appareil refuse vraiment les fichiers,
 *      le panneau natif s'ouvre avec texte + lien. Rien n'est
 *      téléchargé, rien n'est copié en douce.
 *
 * Le texte partagé contient TOUJOURS l'URL canonique du site.
 */

import { env } from "./env";
import { notify } from "./notify";
import { shareText } from "./share";

const SITE_TITLE = "Couture Colombe et Merceries";

/** Les JPEG partagés sont plafonnés : vite cousus, légers à envoyer. */
const MAX_DIM = 1280;
const JPEG_QUALITY = 0.85;
/** Toile crème posée sous les images transparentes avant le JPEG. */
const MAT_BG = "#FDF6EF";
/** Au-delà de ce souffle, un toast rassure pendant la préparation. */
const SLOW_NOTICE_MS = 350;

/** URL publique de partage : site canonique + chemin (+ ancre éventuelle). */
export function atelierShareUrl(path: string, hash?: string | null): string {
  const base = env.siteUrl.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const cleanHash = hash && hash.length > 0 ? `#${hash.replace(/^#/, "")}` : "";
  return `${base}${cleanPath}${cleanHash}`;
}

/* ═══════════ Retrouver la photo déjà affichée à l'écran ═══════════ */

/**
 * Retrouve, dans un morceau de page, l'<img> qui affiche `src`
 * (le cache du navigateur a déjà les pixels — on n'a qu'à coudre).
 * Compare le nom de fichier pour encaisser les `?v=` de version.
 */
export function displayedShareImage(
  root: ParentNode | null | undefined,
  src: string,
): HTMLImageElement | null {
  if (!root) return null;
  const list = Array.from(root.querySelectorAll("img"));
  if (list.length === 0) return null;
  const file = (src.split("/").pop() ?? "").split("?")[0];
  for (const el of list) {
    const cur = el.currentSrc || el.src || "";
    if (file && cur.includes(file)) return el;
  }
  return list.length === 1 ? list[0] : null;
}

/* ═══════════ Préparation du fichier, avec cache chaud ═══════════ */

const fileCache = new Map<string, Promise<File | null>>();

function shareFileName(src: string, type: string): string {
  const base =
    (src.split("/").pop() || "modele").split("?")[0].replace(/\.[a-z0-9]+$/i, "") ||
    "modele";
  const ext = type === "image/png" ? "png" : "jpg";
  return `couture-colombe-merceries--${base}.${ext}`;
}

/** Pose la source sur une toile bornée et la coud en JPEG signé. */
async function paintToJpegFile(
  source: CanvasImageSource,
  sw: number,
  sh: number,
  name: string,
): Promise<File | null> {
  try {
    if (sw <= 0 || sh <= 0) return null;
    const scale = Math.min(1, MAX_DIM / Math.max(sw, sh));
    const w = Math.max(1, Math.round(sw * scale));
    const h = Math.max(1, Math.round(sh * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = MAT_BG; // doublure crème si l'image a des transparences
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(source, 0, 0, w, h);
    const jpeg = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    if (!jpeg) return null;
    return new File([jpeg], name, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

/** Chemin A — les pixels viennent de l'image DÉJÀ AFFICHÉE à l'écran. */
async function fileFromDisplayedImage(
  img: HTMLImageElement,
  src: string,
): Promise<File | null> {
  try {
    if (!img.complete || img.naturalWidth <= 0) return null;
    // S'assure que les pixels sont décodés (instantané pour une image affichée).
    await img.decode().catch(() => undefined);
    return await paintToJpegFile(
      img,
      img.naturalWidth,
      img.naturalHeight,
      shareFileName(src, "image/jpeg"),
    );
  } catch {
    return null;
  }
}

/** Chemin B — lecture dans le cache HTTP du navigateur (force-cache). */
async function fileFromNetworkCache(src: string): Promise<File | null> {
  try {
    const res = await fetch(src, { cache: "force-cache" });
    if (!res.ok) return null;
    const blob = await res.blob();
    // JPEG/PNG natifs : tels quels (le nom porte déjà notre griffe).
    if (blob.type === "image/jpeg" || blob.type === "image/png") {
      return new File([blob], shareFileName(src, blob.type), { type: blob.type });
    }
    // WebP & co → JPEG : toutes les messageries savent lire le JPEG.
    const bitmap = await createImageBitmap(blob);
    const file = await paintToJpegFile(
      bitmap,
      bitmap.width,
      bitmap.height,
      shareFileName(src, "image/jpeg"),
    );
    bitmap.close?.();
    return file;
  } catch {
    return null;
  }
}

/**
 * À appeler DÈS QUE LE DOIGT SE POSE sur un bouton Partager
 * (onPointerDown / onPointerEnter) : lance la couture du JPEG en
 * coulisses — au clic, le fichier est déjà chaud. Passe l'<img>
 * affichée quand elle est connue : c'est le chemin le plus court.
 */
export function prepareAtelierShareFile(
  src: string,
  displayedImage?: HTMLImageElement | null,
): Promise<File | null> {
  let p = fileCache.get(src);
  if (!p) {
    p = (async () => {
      if (displayedImage) {
        const fromScreen = await fileFromDisplayedImage(displayedImage, src);
        if (fromScreen) return fromScreen;
      }
      return fileFromNetworkCache(src);
    })();
    fileCache.set(src, p);
    // Un fichier manqué ne doit pas verrouiller la cachette à jamais.
    p.then((f) => {
      if (!f) fileCache.delete(src);
    });
  }
  return p;
}

/* ═══════════ Le partage d'image, de vrai ═══════════ */

/**
 * Partage d'une image d'ambiance / d'un modèle.
 * `caption` habille le message ; `path` et `hash` mènent vers la bonne page ;
 * `imageSrc` (recommandé) permet d'EMBARQUER la vraie photo dans le panneau ;
 * `sourceImage` (recommandé) pointe l'<img> déjà affichée — les pixels sont
 * puisés directement dans le navigateur, sans aucun réseau.
 */
export async function shareAtelierImage(opts: {
  caption?: string | null;
  path: string;
  hash?: string | null;
  imageSrc?: string | null;
  sourceImage?: HTMLImageElement | null;
}): Promise<void> {
  const url = atelierShareUrl(opts.path, opts.hash);
  const caption = (opts.caption ?? "").trim();
  const text = `${caption ? `${caption} ✨\n` : ""}${SITE_TITLE} 🧵✂️\n${url}`;

  const canNative =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  // A–C) 🕊️ La PHOTO d'abord : écran → cache, et on l'attend sans jamais
  //      abandonner — c'est cette patience qui faisait marcher « avant ».
  if (opts.imageSrc && canNative) {
    const filePromise = prepareAtelierShareFile(opts.imageSrc, opts.sourceImage);
    // Un petit mot doux si l'aiguille prend plus d'un souffle.
    const slowNotice = window.setTimeout(() => {
      notify.info("🪡 Préparation de la photo… un fil de patience ✨");
    }, SLOW_NOTICE_MS);
    let file: File | null = null;
    try {
      file = await filePromise;
    } finally {
      window.clearTimeout(slowNotice);
    }

    if (file) {
      // Le test de capacité AVEC LA VRAIE PHOTO — comme quand ça marchait.
      const attachOk =
        typeof navigator.canShare !== "function" ||
        navigator.canShare({ files: [file] });
      if (attachOk) {
        try {
          await navigator.share({ files: [file], title: SITE_TITLE, text });
          notify.success("✨ La photo voyage — la colombe est partie 🕊️");
          return; // ✅ la photo voyage, jointe au panneau
        } catch (e) {
          // Annulé du doigt : on sort proprement, sans double partage.
          if ((e as DOMException)?.name === "AbortError") return;
          // Toute autre glissade → repli texte juste après.
        }
      }
    }
  }

  // D) 🤍 Repli propre : le panneau natif s'ouvre avec texte + lien.
  //    JAMAIS de téléchargement automatique — le bouton « Télécharger »
  //    des galeries est là pour qui veut garder la photo.
  const channel = await shareText(text, SITE_TITLE);
  if (channel === "clipboard") {
    notify.success("Lien copié — collez-le dans WhatsApp pour partager 🕊️");
  } else if (channel === "failed") {
    notify.error("Le partage a glissé entre les mailles — réessayez.");
  }
  // "native"/"app" → le panneau s'est ouvert ; "cancelled" → silence respectueux.
}
