#!/usr/bin/env node
/* =============================================================
   scripts/inject-build-version.cjs

   But :
     Génère un identifiant de build unique (court, lisible) et
     l'injecte dans public/sw.js à la place du placeholder
     `__BUILD_ID__`. Le SW utilise ce token pour versionner
     ses caches (lsc-static-<TOKEN>, lsc-runtime-<TOKEN>) et
     purger tous les anciens caches à l'activate().

   Pourquoi :
     Sans versionnage, à chaque déploiement, les visiteurs
     qui ont déjà ouvert le site gardent l'ancien SW + l'ancien
     bundle JS en cache → ils voient l'ancien site pendant
     des jours. Avec le BUILD_ID, l'ancien SW s'auto-purge
     et le nouveau s'installe proprement.

   Modules utilisés : fs, path, crypto (natifs Node, aucun npm).
   ============================================================= */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SW_PATH = path.join(ROOT, "public", "sw.js");


function loadEnvEmail(rootDir) {
  const candidates = [
    path.join(rootDir, ".env.local"),
    path.join(rootDir, ".env"),
    path.join(rootDir, ".env.production"),
    path.join(rootDir, ".env.production.local"),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    const match = content.match(/^VITE_ATELIER_EMAIL\s*=\s*(.*)$/m);
    if (match) {
      return match[1].trim().replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  return process.env.VITE_ATELIER_EMAIL || "";
}

function replaceEmailTokens(filePath, email) {
  if (!fs.existsSync(filePath)) return false;
  const src = fs.readFileSync(filePath, "utf8");
  if (!src.includes("__ATELIER_EMAIL__")) return false;
  const next = src.replace(/__ATELIER_EMAIL__/g, email || "");
  fs.writeFileSync(filePath, next, "utf8");
  return true;
}

function buildId() {
  // Date UTC courte (YYYYMMDD-HHMM) + 4 hex de random pour
  // différencier deux builds dans la même minute.
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp =
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "-" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes());
  // crypto natif dispo en Node 14.17+
  let rand = "";
  try {
    rand = require("crypto").randomBytes(2).toString("hex");
  } catch (e) {
    rand = Math.floor(Math.random() * 0xffff)
      .toString(16)
      .padStart(4, "0");
  }
  return `${stamp}-${rand}`;
}

function main() {
  if (!fs.existsSync(SW_PATH)) {
    console.error(
      "[inject-build-version] public/sw.js introuvable : " + SW_PATH
    );
    process.exit(1);
  }

  const token = buildId();
  const src = fs.readFileSync(SW_PATH, "utf8");
  const next = src.replace(/__BUILD_ID__/g, token);

  if (next === src) {
    console.warn(
      "[inject-build-version] Aucun placeholder __BUILD_ID__ trouvé dans public/sw.js — rien à faire."
    );
  } else {
    fs.writeFileSync(SW_PATH, next, "utf8");
    console.log("[inject-build-version] BUILD_ID injecté : " + token);
  }

  const email = loadEnvEmail(ROOT);

  const htmlTargets = [
    path.join(ROOT, "public", "404.html"),
    path.join(ROOT, "public", "contact.html"),
    path.join(ROOT, "public", "formation.html"),
    path.join(ROOT, "public", "mentions-legales.html"),
    path.join(ROOT, "public", "merci.html"),
    path.join(ROOT, "public", "services.html"),
    path.join(ROOT, "dist", "404.html"),
    path.join(ROOT, "dist", "contact.html"),
    path.join(ROOT, "dist", "formation.html"),
    path.join(ROOT, "dist", "mentions-legales.html"),
    path.join(ROOT, "dist", "merci.html"),
    path.join(ROOT, "dist", "services.html"),
  ];
  for (const target of htmlTargets) {
    replaceEmailTokens(target, email);
  }

  // Petit fichier témoin (utile au debug, ignoré par Vercel)
  try {
    const stampPath = path.join(ROOT, "BUILD_ID.txt");
    fs.writeFileSync(stampPath, token + "\n", "utf8");
  } catch (e) {
    /* pas grave */
  }
}

main();
