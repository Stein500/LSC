/**
 * Partage unifié — un seul « Partager », trois routes élégantes :
 *
 *   📱 Dans l'app Colombes  → Sharesheet Android (ColombesApp.share)
 *   🌍 Navigateur mobile    → Web Share API native
 *   🖥️ Ailleurs             → presse-papiers + toast de confirmation
 *
 * ⚠️ L'URL d'hébergement n'entre JAMAIS dans les textes partagés.
 */

import { shareViaApp } from "./appBridge";

export type ShareChannel = "app" | "native" | "clipboard" | "cancelled" | "failed";

export async function shareText(
  text: string,
  title = "Les Services Colombes",
): Promise<ShareChannel> {
  // 📱 L'app prend le relais
  if (shareViaApp(text)) return "app";

  // 🌍 Web Share API (mobile surtout)
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({ title, text });
      return "native";
    } catch (e) {
      // Annulé par l'utilisatrice : on sort proprement, sans rien copier
      if ((e as DOMException)?.name === "AbortError") return "cancelled";
    }
  }

  // 🖥️ Repli : presse-papiers
  try {
    await navigator.clipboard.writeText(text);
    return "clipboard";
  } catch {
    return "failed";
  }
}
