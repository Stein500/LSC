import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { trackInstall, trackPwa } from "@/utils/api";

export function PWAInstallPrompt() {
  const { canInstall, promptInstall, dismiss } = usePWAInstall();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (canInstall) {
      trackInstall("prompt");
      trackPwa("install_prompt_shown", { shown: true });
      const t = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [canInstall]);

  if (!visible) return null;

  const handleAccept = async () => {
    trackInstall("accept");
    trackPwa("install_prompt_accept", { shown: true, action: "accept" });
    const ok = await promptInstall();
    if (!ok) handleDismiss();
    setVisible(false);
  };

  const handleDismiss = () => {
    trackInstall("dismiss");
    trackPwa("install_prompt_dismiss", { shown: true, action: "dismiss" });
    dismiss();
    setVisible(false);
  };

  return (
    <div className="fixed bottom-24 md:bottom-7 left-4 right-4 md:right-auto md:left-7 md:w-96 z-30 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-[var(--color-citron)] p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[var(--color-citron)] flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-[var(--color-ink)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1">Installer l'application</p>
          <p className="text-xs text-[var(--color-muted)] mb-3">
            Ajoutez Les Services Colombes à votre écran d’accueil pour un accès rapide.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleAccept}
              className="px-4 py-2 rounded-full bg-[var(--color-citron)] text-[var(--color-ink)] text-xs font-semibold hover:bg-[var(--color-citron-d)] transition-colors"
            >
              Installer
            </button>
            <button
              onClick={handleDismiss}
              className="px-3 py-2 rounded-full text-xs font-medium text-[var(--color-muted)] hover:bg-black/5 transition-colors"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-[var(--color-muted)] hover:text-[var(--color-ink)] p-1"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
