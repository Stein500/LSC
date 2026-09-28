/**
 * shareAtelier — « le Guichet en deux temps » 📤🕊️
 * ------------------------------------------------------------
 * Retour de la cheffe (28/09/2026, après essai réussi) :
 *   « Ça marche ! Mais il faut 2 clics pour partager avec la photo :
 *     le premier prépare, le second envoie. Je veux un VRAI mécanisme
 *     qui rassure — pas un “lien copié” qui arrive au mauvais moment. »
 *
 * Le design, assumé et guidé :
 *
 *   1er TEMPS — la photo n'est pas chaude :
 *     · toast immédiat « 🪡 On prépare ta photo… » (jamais d'attente muette) ;
 *     · on coud le JPEG depuis l'<img> AFFICHÉE (pixels déjà décodés
 *       dans le navigateur, zéro réseau) ou depuis le cache HTTP ;
 *     · on TENTE le panneau direct — les bons appareils gardent le
 *       geste ouvert assez longtemps : 1 clic suffit alors ;
 *     · si le panneau refuse (fenêtre de geste refermée) : la photo
 *       reste CHAUDE en mémoire, le bouton passe à l'état ARMÉ
 *       (vert feuille, il pulse, petit *bzz*), et le toast dit :
 *       « ✅ C'est prêt ! Retouche “Partager” — la photo part avec toi ».
 *
 *   2e TEMPS — bouton armé / photo chaude :
 *     · la photo est jointe DANS le geste, le panneau natif s'ouvre
 *       d'un coup, LA PHOTO DEDANS. ✨
 *
 * Garde-fous :
 *   · Le test de capacité se fait avec la VRAIE photo — un appareil
 *     qui ne sait pas joindre les fichiers n'entend JAMAIS « c'est
 *     prêt » : on ouvre le panneau texte honnêtement.
 *   · JAMAIS de téléchargement automatique — le bouton « Télécharger »
 *     des galeries reste seul maître.
 *   · Annulation du doigt sur le panneau = silence respectueux.
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

/** Petit *bzz* rassurant quand la photo est prête (Android). */
function tickHaptic(): void {
  try {
    navigator.vibrate?.(12);
  } catch {
    /* le silence est permis */
  }
}

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
/** Les photos PRÊTES : jointes au panneau dans le même geste, sans attente. */
const hotFiles = new Map<string, File>();

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
    p.then((f) => {
      if (f) hotFiles.set(src, f); // la photo devient CHAUDE : prochain clic = instantané
      else fileCache.delete(src); // un raté ne verrouille jamais la cachette
    });
  }
  return p;
}

/** Ce que le clic a réellement donné — le bouton se décore en connaissance. */
export type ShareAttemptResult =
  | "shared" // le panneau s'est ouvert avec la photo ✨
  | "armed" // la photo est PRÊTE : « retouche Partager »
  | "text" // repli honnête : panneau texte / lien copié
  | "cancelled"; // la cliente a refermé le panneau : silence

/** La vraie question, posée avec la VRAIE photo (jamais avec une sonde). */
function canAttachFile(file: File): boolean {
  try {
    return (
      typeof navigator.canShare !== "function" ||
      navigator.canShare({ files: [file] })
    );
  } catch {
    return false;
  }
}

/* ═══════════ Le partage d'image, de vrai — le Guichet en deux temps ═══════════ */

/**
 * Partage d'une image d'ambiance / d'un modèle.
 * `caption` habille le message ; `path` et `hash` mènent vers la bonne page ;
 * `imageSrc` (recommandé) permet d'EMBARQUER la vraie photo dans le panneau ;
 * `sourceImage` (recommandé) pointe l'<img> déjà affichée — les pixels sont
 * puisés directement dans le navigateur, sans aucun réseau ;
 * `onArmed` (optionnel) prévient le bouton que la photo est PRÊTE, pour
 * qu'il invite lui-même au second geste (vert feuille, il pulse).
 */
export async function shareAtelierImage(opts: {
  caption?: string | null;
  path: string;
  hash?: string | null;
  imageSrc?: string | null;
  sourceImage?: HTMLImageElement | null;
  onArmed?: (armed: boolean) => void;
}): Promise<ShareAttemptResult> {
  const url = atelierShareUrl(opts.path, opts.hash);
  const caption = (opts.caption ?? "").trim();
  const text = `${caption ? `${caption} ✨\n` : ""}${SITE_TITLE} 🧵✂️\n${url}`;
  const src = opts.imageSrc ?? null;

  const canNative =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  if (src && canNative) {
    // ─── 2e TEMPS 🔥 — la photo est CHAUDE : jointe dans le geste même,
    //     le panneau natif s'ouvre d'un coup, la photo dedans.
    const hot = hotFiles.get(src);
    if (hot && canAttachFile(hot)) {
      try {
        await navigator.share({ files: [hot], title: SITE_TITLE, text });
        notify.success("✨ La photo voyage — la colombe est partie 🕊️");
        opts.onArmed?.(false);
        return "shared";
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return "cancelled";
        // Couac rare (fenêtre de geste plus stricte encore) : on réarme.
        notify.success("✅ C'est prêt ! Retouche « Partager » — la photo part avec toi 🕊️");
        opts.onArmed?.(true);
        tickHaptic();
        return "armed";
      }
    }

    // ─── 1er TEMPS ⏳ — on prépare la photo, sans jamais laisser douter.
    notify.info("🪡 On prépare ta photo… un instant de couture");
    const file = await prepareAtelierShareFile(src, opts.sourceImage);

    if (file && canAttachFile(file)) {
      // Le panneau est tenté D'OFFICE : les bons appareils gardent le
      // geste ouvert pendant la couture → 1 clic suffit alors. ✨
      try {
        await navigator.share({ files: [file], title: SITE_TITLE, text });
        notify.success("✨ La photo voyage — la colombe est partie 🕊️");
        opts.onArmed?.(false);
        return "shared";
      } catch (e) {
        if ((e as DOMException)?.name === "AbortError") return "cancelled";
        // Fenêtre de geste refermée → la photo reste CHAUDE, le bouton
        // s'habille en vert feuille et invite au second geste.
        notify.success("✅ C'est prêt ! Retouche « Partager » — la photo part avec toi 🕊️");
        opts.onArmed?.(true);
        tickHaptic();
        return "armed";
      }
    }
    // Fichier impossible, ou appareil qui ne sait VRAIMENT pas joindre
    // les photos → repli honnête ci-dessous (jamais de « c'est prêt »,
    // jamais de téléchargement automatique).
  }

  // ─── Repli propre 🤍 — panneau texte natif, ou lien copié à l'ancienne.
  const channel = await shareText(text, SITE_TITLE);
  if (channel === "clipboard") {
    notify.success("Lien copié — colle-le dans WhatsApp pour partager 🕊️");
  } else if (channel === "failed") {
    notify.error("Le partage a glissé entre les mailles — réessaie.");
  }
  return channel === "cancelled" ? "cancelled" : "text";
}
