import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { devApiPlugin } from "./scripts/vite-plugin-dev-api";

// ⚠️ OPTION SEO ACTIVÉE : vite-plugin-singlefile est désactivé.
//
// Pourquoi on le retire :
// - Il inliné TOUT le bundle (CSS + JS) dans un seul fichier → Googlebot
//   doit télécharger et parser ce gros bloc avant de voir le moindre
//   contenu, ce qui ralentit le 1er paint et l'indexation.
// - Il empêche le code-splitting par route, ce qui fait que les pages
//   /services, /formation, /contact partagent un seul bundle.
//
// À la place on fait un build normal Vite : dist/index.html + dist/assets/*.js
// et *.css hashés. Vercel edge CDN les sert en immutable (voir
// vercel.json headers /assets/(.*)). Performance identique en prod,
// SEO et FCP nettement meilleurs.
//
// Si tu veux réactiver singlefile (pour une raison X ou Y), il suffit
// de remettre l'import et le plugin dans le tableau `plugins` ci-dessous.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss(), devApiPlugin(__dirname)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  // Dev / preview : accepter les hôtes de tunnel (sandbox, Vercel preview locale)
  // pour que le site soit accessible depuis n'importe quel proxy.
  server: {
    host: "0.0.0.0",
    allowedHosts: true,
    cors: true,
  },
  preview: {
    host: "0.0.0.0",
    allowedHosts: true,
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // Découpe vendor en chunks fins pour limiter les Long Tasks
        // (les petits chunks se chargent en parallèle et libèrent plus vite
        // le main thread → meilleur INP).
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;

          // React + ReactDOM + Router (toujours critiques, premier paint)
          //
          // ⚠️ Invariant à préserver (sinon on recrée le bug des chunks
          // circulaires) : "vendor-react" doit rester un puits — tous les
          // autres chunks vendor-* peuvent l'importer, mais lui ne doit
          // JAMAIS importer un module qui vit dans un autre chunk vendor-*.
          // scheduler (dépendance interne de react-dom) et cookie /
          // set-cookie-parser (dépendances internes de react-router) sont
          // donc rattachés ici explicitement — les laisser tomber dans le
          // bucket par défaut "vendor-misc" est exactement ce qui créait
          // le cycle vendor-misc <-> vendor-react (vendor-react a besoin
          // de scheduler, vendor-misc — via sonner/usehooks-ts — a besoin
          // de react) => "Cannot access 'X' before initialization" en prod.
          if (
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/scheduler/") ||
            id.includes("node_modules/cookie/") ||
            id.includes("node_modules/set-cookie-parser/") ||
            id.includes("/react/")
          ) {
            return "vendor-react";
          }

          // UI / animations / icônes (chargé après le critical path)
          if (
            id.includes("node_modules/framer-motion") ||
            id.includes("node_modules/lucide-react")
          ) {
            return "vendor-ui";
          }

          // Formulaires (uniquement sur /contact, /precommande, etc.)
          if (
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/zod") ||
            id.includes("node_modules/@hookform")
          ) {
            return "vendor-forms";
          }

          // SEO + monitoring (web-vitals, helmet)
          if (
            id.includes("node_modules/web-vitals") ||
            id.includes("node_modules/react-helmet")
          ) {
            return "vendor-seo";
          }

          // Autres vendors (clsx, tailwind-merge, etc.) → chunk par défaut
          return "vendor-misc";
        },
      },
    },
  },
});
