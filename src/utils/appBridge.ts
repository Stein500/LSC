/**
 * Pont « Colombes App » — la Maison dans la main.
 *
 * Quand la SPA tourne DANS l'application Android Colombes, l'app native
 * prend le relais de tout ce qu'elle fait mieux que le web :
 *
 *   📥 Téléchargement des tickets PDF → DownloadManager + lecteur PDF natif
 *      (dans une WebView, un `<a download>` ne fait… rien)
 *   📤 Partage → Sharesheet Android
 *   🎬 Splash → natif animé (le splash web reste muet)
 *   📊 Barre de progression → native 3 dp (la barre web s'efface)
 *   🍃 Animations lourdes → réduites (le geste natif fait la fluidité)
 *
 * Le bridge Kotlin (`addJavascriptInterface(bridge, "ColombesApp")`) est
 * injecté AVANT le chargement de la page — il est donc disponible dès le
 * premier paint, sans attente ni clignotement.
 *
 * Hors app (navigateur classique), tout tombe en douceur sur le comportement
 * web habituel : rien ne casse, jamais.
 */

export interface ColombesBridge {
  /** true → le site vit dans l'application Android Colombes */
  isApp?: () => boolean;
  /** Version native, ex. "4.2.6" */
  getAppVersion?: () => string;
  /** Décodage + enregistrement natif du PDF (notification « Ticket reçu ») */
  downloadBase64Pdf?: (base64: string, filename: string) => void;
  /** Sharesheet Android — sans jamais exposer l'URL d'hébergement */
  share?: (text: string) => void;
  /** Notification locale de l'app (titre + corps) */
  notify?: (title: string, body: string) => void;
}

declare global {
  interface Window {
    ColombesApp?: ColombesBridge;
  }
}

/** Bridge natif exploitable, ou null en navigateur. */
export function getColombesBridge(): ColombesBridge | null {
  if (typeof window === "undefined") return null;
  const bridge = window.ColombesApp;
  if (!bridge) return null;
  try {
    return bridge.isApp?.() === true ? bridge : null;
  } catch {
    return null;
  }
}

let _inApp: boolean | null = null;

/**
 * `true` si la SPA s'exécute dans l'app Colombes.
 * Figé à la première lecture (le bridge ne change jamais en cours de session).
 */
export function isColombesApp(): boolean {
  if (_inApp === null) _inApp = getColombesBridge() !== null;
  return _inApp;
}

/** Version de l'app hôte ("1.0.0"…), ou "web" hors app. */
export function colombesAppVersion(): string {
  try {
    return getColombesBridge()?.getAppVersion?.() || "web";
  } catch {
    return "web";
  }
}

/**
 * Remet le ticket PDF au natif : décodage côté Kotlin, écriture dans les
 * Téléchargements, notification « Ticket reçu », ouverture FileProvider.
 * Retourne `true` si l'app a pris le relais — sinon le web fait son blob.
 */
export function downloadPdfViaApp(base64: string, filename: string): boolean {
  const bridge = getColombesBridge();
  if (!bridge?.downloadBase64Pdf) return false;
  try {
    const name = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    bridge.downloadBase64Pdf(base64, name);
    return true;
  } catch {
    return false;
  }
}

/** Partage via la Sharesheet Android. `true` si pris en charge par l'app. */
export function shareViaApp(text: string): boolean {
  const bridge = getColombesBridge();
  if (!bridge?.share) return false;
  try {
    bridge.share(text);
    return true;
  } catch {
    return false;
  }
}

/** Notification locale native (barre d'état de l'app). `true` si envoyée. */
export function notifyViaApp(title: string, body: string): boolean {
  const bridge = getColombesBridge();
  if (!bridge?.notify) return false;
  try {
    bridge.notify(title, body);
    return true;
  } catch {
    return false;
  }
}
