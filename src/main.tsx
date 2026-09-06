import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initWebVitals } from "@/utils/webVitals";
import { isColombesApp } from "@/utils/appBridge";

// Démarrage du monitoring Core Web Vitals (LCP, CLS, INP, FCP, TTFB)
initWebVitals();

// ---------------------------------------------------------------
// 📱 MODE APP — si la SPA vit dans l'application Android Colombes,
// on le marque AVANT le premier rendu : le CSS s'allège (plus de
// halos flous animés), et les composants natifs-adjacent s'effacent
// (barre de progression web, splash web muet…). L'app est cheffe.
// ---------------------------------------------------------------
try {
  if (isColombesApp()) {
    document.documentElement.dataset.colombesApp = "true";
  }
} catch {
  /* navigateur classique : rien à faire */
}

// ---------------------------------------------------------------
// 🪡 PWA — l'atelier est installable : le bouton « Installer »
// déclenche l'invite native (beforeinstallprompt → prompt()).
// Le service worker garde la coquille sous le coude (statique en
// cache, HTML réseau d'abord, /api jamais caché).
// 📱 Dans l'app Colombes native (WebView) : PAS de SW — le natif
// pilote déjà le cycle de vie, et l'ancienne PWA serait une rivale.
// ---------------------------------------------------------------
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  try {
    if (isColombesApp()) {
      // Filet de propreté : si un reste d'ancien SW traîne dans la
      // WebView legacy, on le désinstalle une fois, sans bruit.
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => Promise.all(regs.map((r) => r.unregister())))
        .catch(() => {});
    } else {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      });
    }
  } catch {
    /* navigateur classique : rien à faire */
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
