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
// KILL-SWITCH — le site n'est plus une PWA.
// Si un ancien visiteur a encore le service worker / les caches de
// l'époque PWA, on les désinstalle une fois, proprement, puis on
// ne re-touche plus à rien (perf : boucle courte, best-effort).
// ---------------------------------------------------------------
if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => Promise.all(regs.map((r) => r.unregister())))
    .catch(() => {});
}
if (typeof caches !== "undefined") {
  caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))).catch(() => {});
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
