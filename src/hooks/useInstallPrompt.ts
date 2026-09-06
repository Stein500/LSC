import { useEffect, useState } from "react";

/**
 * useInstallPrompt — le fil qui relie le bouton « Installer » à l'invite
 * native du navigateur (PWA).
 *
 * - `beforeinstallprompt` est capturé UNE fois au niveau module (l'événement
 *   ne se répète pas ; on l'empêche pour garder la main — sinon la mini-barre
 *   du navigateur s'affiche à sa guise).
 * - `promptInstallPwa()` déclenche l'invite native ; si le navigateur refuse
 *   de la donner (iOS Safari, déjà installée, engagement insuffisant), on
 *   retourne "instructions" pour que l'appelant affiche le mode d'emploi.
 * - `appinstalled` referme proprement la boucle.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type InstallOutcome = "installed" | "dismissed" | "instructions";

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let installed = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    emit();
  });
  window.addEventListener("appinstalled", () => {
    installed = true;
    deferredPrompt = null;
    emit();
  });
  // Standalone = déjà installée (display-mode), on ne propose plus rien.
  if (window.matchMedia?.("(display-mode: standalone)").matches) installed = true;
}

export function canInstallPwa(): boolean {
  return !installed && deferredPrompt !== null;
}

/** L'atelier tourne-t-il déjà comme une app installée ? */
export function isPwaInstalled(): boolean {
  return installed;
}

/** iOS ne donne jamais beforeinstallprompt → mode d'emploi manuel. */
export function isAppleTouch(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export async function promptInstallPwa(): Promise<InstallOutcome> {
  if (installed) return "installed";
  if (!deferredPrompt) return "instructions";
  const choice = deferredPrompt;
  deferredPrompt = null; // un seul essai par événement capturé
  try {
    await choice.prompt();
    const { outcome } = await choice.userChoice;
    if (outcome === "accepted") {
      installed = true;
      emit();
      return "installed";
    }
    emit();
    return "dismissed";
  } catch {
    return "instructions";
  }
}

/** React : prêt à installer ? (se met à jour quand l'événement arrive) */
export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(canInstallPwa());
  const [isInstalled, setIsInstalled] = useState(isPwaInstalled());
  useEffect(() => {
    const sync = () => {
      setCanInstall(canInstallPwa());
      setIsInstalled(isPwaInstalled());
    };
    listeners.add(sync);
    sync();
    return () => {
      listeners.delete(sync);
    };
  }, []);
  return { canInstall, isInstalled, promptInstall: promptInstallPwa };
}
