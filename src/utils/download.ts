/**
 * Utilitaires de téléchargement navigateur — PDF / blob / data URL.
 * Permet à /api/track (qui renvoie le PDF en base64) de proposer
 * un téléchargement immédiat côté front, sans round-trip vers une URL signée.
 */

import { isValidRef } from "./format";
import { downloadPdfViaApp, isColombesApp } from "./appBridge";

/**
 * Décode une chaîne base64 en ArrayBuffer.
 */
function base64ToBuffer(b64: string): ArrayBuffer {
  const cleaned = b64.replace(/\s+/g, "");
  const binary = atob(cleaned);
  const buf = new ArrayBuffer(binary.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
  return buf;
}

/**
 * Déclenche le téléchargement d'un PDF à partir de sa représentation base64.
 * Retourne `true` si le téléchargement a été initié.
 *
 * 🪡 Dans l'app Colombes (WebView), un `<a download>` est sans effet :
 * on remet le base64 au natif (DownloadManager + lecteur PDF) via le bridge.
 * En navigateur, le blob classique prend le relais.
 */
export function downloadPdfBase64(
  base64: string,
  filename: string,
  ref: string,
): boolean {
  try {
    if (!base64 || !isValidRef(ref)) return false;
    // 📱 L'app prend le relais — notification « Ticket reçu » côté natif
    if (isColombesApp() && downloadPdfViaApp(base64, filename)) return true;
    const bytes = base64ToBuffer(base64);
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    // Cleanup différé pour laisser le navigateur traiter
    setTimeout(() => {
      a.remove();
      URL.revokeObjectURL(url);
    }, 1500);
    return true;
  } catch (e) {
    if (import.meta.env.DEV) console.warn("[download] pdf error", e);
    return false;
  }
}

/**
 * Téléchargement simple via data URL (utile pour de petits textes).
 */
export function downloadTextFile(content: string, filename: string, mime = "text/plain"): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 1500);
}
