/**
 * /api/images-version
 * -------------------
 * Sert le manifeste des versions d'images.
 *
 * Le manifeste est lu depuis `data/image-versions.json` à la racine
 * du projet. Format attendu :
 *
 *   {
 *     "/images/logo.webp": 3,
 *     "/images/header-colombes.webp": 7,
 *     "/images/gallery/atelier-01.webp": 2
 *   }
 *
 * Endpoint public, cache court (1 minute CDN) : si tu bumpes une
 * version, elle est visible partout en < 1 min même sans re-déployer.
 *
 * Header CORS ouvert : pratique si tu utilises ces images depuis
 * un sous-domaine ou un script externe.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const VERSIONS_FILE = path.join(ROOT, "data", "image-versions.json");

function readVersions() {
  try {
    if (!fs.existsSync(VERSIONS_FILE)) return {};
    const raw = fs.readFileSync(VERSIONS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch (e) {
    return {};
  }
}

module.exports = async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    return res.end(JSON.stringify({ error: "Method not allowed" }));
  }

  const versions = readVersions();

  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  // Cache court CDN + revalidation obligatoire
  res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");
  res.end(JSON.stringify(versions));
};
