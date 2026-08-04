import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/utils/api";

/**
 * À monter une fois dans RootLayout : track chaque changement de route.
 */
export function useRouteTracking() {
  const location = useLocation();
  const first = useRef(true);

  useEffect(() => {
    // petit délai pour laisser l'animation/heroes finir le paint
    const t = setTimeout(() => {
      trackPageView(location.pathname + location.search);
      first.current = false;
    }, 100);
    return () => clearTimeout(t);
  }, [location.pathname, location.search]);
}