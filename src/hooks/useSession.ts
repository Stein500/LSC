import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  trackSessionStart,
  trackSessionEnd,
  trackPageHidden,
  trackPageVisible,
  trackScrollDepthOnce,
  installGlobalErrorTracking,
} from "@/utils/api";

/**
 * À monter **une seule fois** dans le RootLayout.
 * - Démarre la session au mount, log "session_end" au unmount / page cachée.
 * - Capte la visibilité de la page (focus / blur) pour mesure d'attention.
 * - Capte la profondeur de scroll (paliers 25/50/75/100 %).
 * - Pose un listener global d'erreurs JS / unhandledrejection.
 */
export function useSessionTracking() {
  const location = useLocation();

  // ----- Erreurs globales + scroll depth + session_start (une seule fois) -----
  useEffect(() => {
    installGlobalErrorTracking();
    trackSessionStart();

    const cleanupScroll = trackScrollDepthOnce();

    const onVisibility = () => {
      if (document.visibilityState === "hidden") trackPageHidden();
      else if (document.visibilityState === "visible") trackPageVisible();
    };
    document.addEventListener("visibilitychange", onVisibility);

    const onBeforeUnload = () => {
      try { trackSessionEnd(); } catch {}
    };
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (cleanupScroll) cleanupScroll();
      // ne log session_end ici que sur unmount du layout (rare)
      // En pratique c'est surtout beforeunload qui le déclenche.
    };
  }, []);

  // ----- Log "page_view" sur changement de route -----
  useEffect(() => {
    const t = setTimeout(() => {
      // On évite le double log : useRouteTracking gère déjà ça.
      // On log juste un repère léger ici si besoin.
    }, 0);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);
}