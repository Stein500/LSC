import { useEffect, useMemo, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "clb_pwa_dismiss";
const DISMISS_DAYS = 7;

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") return false;
  const standaloneMedia = window.matchMedia?.("(display-mode: standalone)")?.matches ?? false;
  // iOS Safari legacy
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iosStandalone = typeof (navigator as any).standalone === "boolean" ? Boolean((navigator as any).standalone) : false;
  return standaloneMedia || iosStandalone;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [supported, setSupported] = useState(false);
  const [standalone, setStandalone] = useState(isStandaloneDisplayMode());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setStandalone(isStandaloneDisplayMode());
    setSupported("beforeinstallprompt" in window || "onbeforeinstallprompt" in window);

    const lastDismiss = Number(localStorage.getItem(DISMISS_KEY) || 0);
    setDismissed(Boolean(lastDismiss && Date.now() - lastDismiss < DISMISS_DAYS * 24 * 3600 * 1000));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    const onDisplayModeChange = () => setStandalone(isStandaloneDisplayMode());
    const media = window.matchMedia?.("(display-mode: standalone)");
    media?.addEventListener?.("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      media?.removeEventListener?.("change", onDisplayModeChange);
    };
  }, []);

  const canInstall = useMemo(() => Boolean(deferredPrompt && supported && !standalone && !dismissed), [deferredPrompt, supported, standalone, dismissed]);

  async function promptInstall() {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setDismissed(choice.outcome === "dismissed");
    return choice.outcome === "accepted";
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setDismissed(true);
    setDeferredPrompt(null);
  }

  return {
    canInstall,
    supported,
    standalone,
    promptInstall,
    dismiss,
  };
}
