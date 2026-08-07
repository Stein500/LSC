#!/usr/bin/env node
/* ============================================================
   update-app-release.mjs — Les Services Colombes
   ------------------------------------------------------------
   À CHAQUE FOIS que tu déposes un nouvel APK dans downloads/,
   ce script :
     1. détecte l'APK le plus récent (version lue dans le nom
        du fichier : colombes-1.0.0.apk, Colombes_v2.1.apk…),
     2. calcule sa taille,
     3. réécrit app-release.json (lu par la page pour afficher
        « Télécharger l'app Colombes — v1.0.0 · 24 Mo »).

   Usage (à la racine de ce dossier) :
       node scripts/update-app-release.mjs

   Sur Vercel : il tourne aussi automatiquement au build
   (voir le vercel.json : buildCommand).
   ============================================================ */

import { readdirSync, statSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const dossierDownloads = join(racine, "downloads");
const manifestePath = join(racine, "app-release.json");

const ANCRE_CAP = {
  appName: "Colombes",
  available: false,
  version: null,
  file: null,
  sizeBytes: null,
  minAndroid: "8.0",
  updatedAt: null,
  githubReleases: null,
  waitlist: {
    whatsapp: "2290167409408",
    message:
      "Bonjour Les Services Colombes ! Je souhaite être informé(e) dès que l'application Colombes est disponible.",
  },
};

/* Extrait une version du nom de fichier :
   colombes-1.0.0.apk → "1.0.0" ; Colombes_v2.1.apk → "2.1" */
function extraireVersion(nomFichier) {
  const m = nomFichier.match(/(\d+(?:\.\d+){1,3})/);
  return m ? m[1] : null;
}

/* Compare deux versions "1.2.10" vs "1.3.0" */
function compareVersions(a, b) {
  const pa = String(a).split(".").map(Number);
  const pb = String(b).split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d;
  }
  return 0;
}

function lireManifesteActuel() {
  try {
    return JSON.parse(readFileSync(manifestePath, "utf8"));
  } catch {
    return {};
  }
}

function main() {
  if (!existsSync(dossierDownloads)) {
    console.log("ℹ️  Dossier downloads/ absent — manifeste « liste d'attente » écrit.");
    writeFileSync(manifestePath, JSON.stringify({ ...ANCRE_CAP, ...lireManifesteActuel(), available: false }, null, 2) + "\n");
    return;
  }

  const apks = readdirSync(dossierDownloads)
    .filter((f) => f.toLowerCase().endsWith(".apk"))
    .map((f) => {
      const stats = statSync(join(dossierDownloads, f));
      return {
        nom: f,
        version: extraireVersion(f) ?? "0.0.0",
        sizeBytes: stats.size,
        mtime: stats.mtime,
      };
    })
    .sort((a, b) => compareVersions(b.version, a.version) || b.mtime - a.mtime);

  const precedent = lireManifesteActuel();

  if (apks.length === 0) {
    console.log("ℹ️  Aucun APK dans downloads/ — la page reste en mode « être informé(e) ».");
    writeFileSync(
      manifestePath,
      JSON.stringify(
        {
          ...ANCRE_CAP,
          ...precedent,
          available: false,
          version: null,
          file: null,
          sizeBytes: null,
          updatedAt: null,
        },
        null,
        2
      ) + "\n"
    );
    return;
  }

  const dernier = apks[0];
  const manifeste = {
    ...ANCRE_CAP,
    ...precedent,
    available: true,
    version: dernier.version,
    file: "downloads/" + dernier.nom,
    sizeBytes: dernier.sizeBytes,
    updatedAt: dernier.mtime.toISOString(),
  };

  writeFileSync(manifestePath, JSON.stringify(manifeste, null, 2) + "\n");

  const mo = (dernier.sizeBytes / 1048576).toFixed(1);
  console.log(`✅ APK détecté : ${dernier.nom}`);
  console.log(`   version : ${dernier.version}  ·  taille : ${mo} Mo`);
  console.log(`   → la page affichera « Télécharger l'app Colombes — v${dernier.version} · ${mo} Mo »`);
  if (apks.length > 1) {
    console.log("ℹ️  Anciens APK présents — pense à les retirer de downloads/ :");
    apks.slice(1).forEach((a) => console.log(`     - ${a.nom}`));
  }
}

main();
