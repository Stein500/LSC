import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { registerSW } from "@/components/pwa/registerSW";
import { initWebVitals } from "@/utils/webVitals";

// Démarrage du monitoring Core Web Vitals (LCP, CLS, INP, FCP, TTFB)
initWebVitals();

// Enregistrer le SW le plus tôt possible pour maximiser la prise en main
// avant les navigations suivantes et accélérer le comportement PWA.
registerSW();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);