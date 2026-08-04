/**
 * SmartInstallPrompt.tsx
 *
 * Bannière non-intrusive qui propose l'installation de la PWA.
 * Apparition :
 *   - Sur la home, après 5 secondes de présence
 *   - Uniquement si beforeinstallprompt a été capturé
 *   - Et si l'app n'est pas déjà installée (display-mode !== standalone)
 *
 * UX :
 *   - Bouton "Installer" → déclenche le prompt natif
 *   - Croix "Plus tard" → ferme + mémorise pendant 14 jours (localStorage)
 */

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";
import { addNotification } from "@/stores/notificationsStore";
import { cn } from "@/utils/cn";

const DISMISS_KEY = "lsc:install-prompt-dismissed";
const SHOW_DELAY_MS = 5000; // 5 secondes

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < 14 * 24 * 60 * 60 * 1000; // 14 jours
  } catch {
    return false;
  }
}

function markDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function SmartInstallPrompt({ path = "/" }: { path?: string }) {
  const { supported, canInstall, standalone, promptInstall } = useInstallPrompt();
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  // Apparition différée, seulement sur la home, et seulement si non-installé
  useEffect(() => {
    if (!supported) return;
    if (standalone) return;
    if (isDismissed()) return;
    if (path !== "/") return;
    const timer = setTimeout(() => {
      if (canInstall) setShow(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [supported, standalone, canInstall, path]);

  if (!show) return null;

  const handleInstall = async () => {
    setBusy(true);
    try {
      const accepted = await promptInstall();
      if (accepted) {
        addNotification({
          type: "success",
          title: "Application installée",
          description: "Vous pouvez maintenant ouvrir l'app depuis votre écran d'accueil.",
          icon: "Download",
          category: "install",
        });
        setShow(false);
      } else {
        markDismissed();
        setShow(false);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    markDismissed();
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-label="Installer l'application"
      className={cn(
        "fixed inset-x-0 bottom-24 md:bottom-28 z-30 mx-auto max-w-md px-3",
        "animate-slide-up",
      )}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-[var(--color-line)] p-4 flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-citron)]/30 text-[var(--color-orange)]"
          aria-hidden="true"
        >
          <Download className="w-5 h-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-display)" }}>
            Installez l'app
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-0.5">
            Pour un accès rapide, ajoutez Les Services Colombes à votre écran d’accueil.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleInstall}
              disabled={busy}
              className="px-3.5 py-2 rounded-full bg-[var(--color-citron)] text-[var(--color-ink)] text-xs font-semibold hover:bg-[var(--color-citron-d)] disabled:opacity-60"
            >
              {busy ? "Installation…" : "Installer"}
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-2 rounded-full text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer"
          className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-black/5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
