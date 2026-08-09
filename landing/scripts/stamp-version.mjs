#!/usr/bin/env node
/* ============================================================
   stamp-version.mjs — écrit version.json à chaque build Vercel
   La page le surveille toutes les 30 s : si l'empreinte change,
   elle se recharge SILENCIEUSEMENT quand l'onglet passe en
   arrière-plan (position de lecture conservée, zéro perturbation).
   ============================================================ */
import { writeFileSync } from "node:fs";
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

const stamp = new Date().toISOString();
writeFileSync(
  join(racine, "version.json"),
  JSON.stringify(
    {
      stamp,
      git,
      _comment:
        "Empreinte de déploiement — régénérée automatiquement au build (vercel.json). Ne pas éditer.",
    },
    null,
    2
  ) + "\n"
);
console.log(`🕊 Empreinte de version : ${stamp} (${git})`);
