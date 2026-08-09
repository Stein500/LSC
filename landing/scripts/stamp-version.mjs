#!/usr/bin/env node
/* ============================================================
   stamp-version.mjs — exécuté automatiquement à chaque build
   ------------------------------------------------------------
   1. Écrit version.json (empreinte scrutée par la page toutes
      les 30 s → rechargement silencieux).
   2. « Cache-bust » : ajoute ?v=<empreinte> aux URL des codes
      et images dans index.html → un nouveau déploiement change
      les adresses → les navigateurs TÉLÉCHARGENT la nouvelle
      version au lieu de servir leur vieux cache.
   Idempotent : relancer ne double jamais le ?v=.
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
let git = "";
try {
  git = execSync("git rev-parse --short HEAD").toString().trim();
} catch {
  git = "sans-git";
}

const stamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 12); // ex : 202608081014

/* 1 — version.json */
writeFileSync(
  join(racine, "version.json"),
  JSON.stringify(
    {
      stamp,
      git,
      _comment:
        "Empreinte de déploiement — régénérée automatiquement au build. La page la surveille toutes les 30 s. Ne pas éditer.",
    },
    null,
    2
  ) + "\n"
);

/* 2 — cache-bust de index.html */
const indexPath = join(racine, "index.html");
let html = readFileSync(indexPath, "utf8");
html = html.replace(
  /(assets\/(?:styles\.css|app\.js)|manifest\.webmanifest|images\/[\w.-]+\.(?:webp|jpg))(?:\?v=[\w-]+)?/g,
  `$1?v=${stamp}`
);
writeFileSync(indexPath, html);

console.log(`🕊 Empreinte ${stamp} (${git}) — version.json écrit, assets/imageries marquées ?v=${stamp}`);
