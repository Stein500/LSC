import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Check } from "lucide-react";
import { useRefreshImages } from "@/hooks/useRefreshImages";

/**
 * RefreshImagesButton
 * -------------------
 * ⚠️ DÉSACTIVÉ — Ne rend rien.
 *
 * Raison : sur mobile (bottom-tabs), le bouton fixed bottom-4
 * chevauchait la navigation. Plutôt que de le repositionner
 * (pas l'UX qu'on veut), on le désactive complètement.
 *
 * Pour forcer un refresh de ton côté, ouvre DevTools → Application
 * → Service Workers → "Unregister" puis refresh. C'est 5 secondes.
 *
 * Pour les users, le stale-while-revalidate du SW + le versioning
 * suffisent : ils voient la nouvelle image automatiquement.
 *
 * - Visible uniquement si ?refresh=1 dans l'URL (admin / debug),
 *   OU si la PWA est installée (auto-détection display-mode).
 * - Clic → purge cache SW + reload manifest + hard reload.
 *
 * Pourquoi pas visible à tout le monde ?
 *   Pour 95% des users, le stale-while-revalidate suffit : ils
 *   voient la nouvelle image au second refresh. Le bouton est
 *   pour toi (admin) ou pour un user qui te signale "j'ai pas
 *   la bonne image".
 */

export function RefreshImagesButton() {
  // ⚠️ DÉSACTIVÉ — voir commentaire en tête de fichier.
  return null;

  // eslint-disable-next-line @typescript-eslint/no-unreachable-code
  const { refresh, busy } = useRefreshImages();
  const [showDone, setShowDone] = useState(false);

  // Visibilité du bouton :
  //   - ?refresh=1 dans l'URL  →  toujours visible (admin / debug)
  //   - PWA installée           →  visible (auto-détection)
  //   - sinon                  →  CACHÉ (visiteur normal)
  //
  // On vérifie côté client seulement (évite les erreurs SSR / prerender).
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1) Flag URL ?refresh=1 → on affiche direct
    const urlHasFlag = new URLSearchParams(window.location.search).has(
      "refresh",
    );
    if (urlHasFlag) {
      setIsVisible(true);
      return;
    }

    // 2) PWA installée → on affiche
    //    On teste les 2 modes "app" reconnus par les navigateurs.
    const isStandalone =
      window.matchMedia?.("(display-mode: standalone)").matches === true ||
      window.matchMedia?.("(display-mode: minimal-ui)").matches === true;

    // iOS Safari : navigator.standalone === true quand l'app est installée
    const isIOSStandalone = (navigator as any)?.standalone === true;

    if (isStandalone || isIOSStandalone) {
      setIsVisible(true);
      return;
    }

    // 3) Sinon : bouton caché (visiteur normal, pas d'admin, pas de PWA)
    setIsVisible(false);
  }, []);

  if (!isVisible) return null;

  const handleClick = async () => {
    setShowDone(false);
    await refresh();
  };

  return /* @__PURE__ */ (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      onClick={handleClick}
      disabled={busy}
      title="Forcer le re-téléchargement de toutes les images (purge cache)"
      className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-full bg-black/90 px-4 py-2.5 text-xs font-semibold text-white shadow-2xl ring-1 ring-white/20 backdrop-blur-md transition hover:bg-black hover:ring-white/40 disabled:opacity-60 print:hidden"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      <AnimatePresence mode="wait">
        {busy ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ rotate: { repeat: Infinity, duration: 1, ease: "linear" } }}
            className="inline-flex"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </motion.span>
        ) : showDone ? (
          <motion.span
            key="done"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex text-lime-400"
          >
            <Check className="h-3.5 w-3.5" />
          </motion.span>
        ) : (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </motion.span>
        )}
      </AnimatePresence>
      <span>
        {busy
          ? "Purge…"
          : showDone
            ? "Images à jour"
            : "Rafraîchir les images"}
      </span>
    </motion.button>
  );
}
