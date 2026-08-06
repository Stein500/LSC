/**
 * vite-plugin-dev-api.ts
 *
 * Émulation locale des fonctions serverless Vercel (`/api/*`) pendant
 * `vite dev` (et `vite preview`). En production, ce sont les vrais
 * fichiers de `api/` qui tournent (Google Sheets + SMTP + PDF) — ici,
 * on répond avec le même contrat d'interface pour que le front soit
 * 100% fonctionnel hors Vercel : tracking, formulaires, tickets, ping,
 * manifeste de versions d'images.
 *
 * Comportement en dev :
 *  - /api/track    → valide le token public si configuré, logge l'event,
 *                    répond le même JSON que la prod (sheet/mail/pdf simulés).
 *  - /api/images-version → lit réellement data/image-versions.json.
 *  - /api/ping     → 204 (ou JSON si ?info=1).
 *  - /api/system*  → réponse de statut simulée.
 *
 * Aucune dépendance externe, aucun import depuis `api/` (les handlers
 * prod utilisent require/__dirname spécifiques au runtime Vercel).
 */

import fs from "node:fs";
import path from "node:path";
import type { Connect, Plugin } from "vite";
import { loadEnv } from "vite";

type EnvMap = Record<string, string>;

function readJsonBody(req: Connect.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c as Buffer));
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        resolve({});
      }
    });
    req.on("error", () => resolve({}));
  });
}

function sendJson(res: any, status: number, data: unknown, extraHeaders: Record<string, string> = {}) {
  const body = JSON.stringify(data);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-token");
  for (const [k, val] of Object.entries(extraHeaders)) res.setHeader(k, val);
  res.end(body);
}

export function devApiPlugin(root: string): Plugin {
  let env: EnvMap = {};
  let loggedSummary = false;

  return {
    name: "lsc-dev-api",
    apply: "serve",
    config(_config, { mode }) {
      // Charge TOUTES les variables (VITE_* et serveur) depuis .env / .env.local
      env = loadEnv(mode, root, "");
    },
    configureServer(server) {
      const versionsFile = path.resolve(root, "data", "image-versions.json");
      const validTokens = [
        env.TRACK_TOKEN,
        env.TRACK_PUBLIC_TOKEN,
        env.VITE_TRACK_TOKEN,
      ].filter((t): t is string => Boolean(t));

      server.middlewares.use((req, res, next) => {
        const url = (req.url || "").split("?")[0];
        const query = new URLSearchParams((req.url || "").split("?")[1] || "");

        // ---------------- /api/ping ----------------
        if (url === "/api/ping") {
          res.setHeader("Cache-Control", "no-store, max-age=0");
          res.setHeader("X-Content-Type-Options", "nosniff");
          if (req.method === "HEAD") {
            res.statusCode = 200;
            return res.end();
          }
          if (query.get("info") === "1") {
            return sendJson(res, 200, { ok: true, ts: Date.now(), region: "dev-local", dev: true });
          }
          res.statusCode = 204;
          return res.end();
        }

        // ---------------- /api/images-version ----------------
        if (url === "/api/images-version") {
          if (req.method === "OPTIONS") {
            res.statusCode = 204;
            return res.end();
          }
          let versions: Record<string, number> = {};
          try {
            if (fs.existsSync(versionsFile)) {
              const parsed = JSON.parse(fs.readFileSync(versionsFile, "utf8"));
              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) versions = parsed;
            }
          } catch {
            /* manifeste illisible → objet vide */
          }
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Cache-Control", "public, max-age=60, must-revalidate");
          return sendJson(res, 200, versions);
        }

        // ---------------- /api/track ----------------
        if (url === "/api/track") {
          // CORS preflight (même contrat que la prod)
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
          res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-token");

          if (req.method === "OPTIONS") {
            res.statusCode = 204;
            return res.end();
          }
          if (req.method === "GET") {
            return sendJson(res, 200, {
              ok: true,
              service: "colombes-track",
              dev: true,
              timestamp: new Date().toISOString(),
              endpoints: { track: "POST /api/track" },
            });
          }
          if (req.method !== "POST") {
            return sendJson(res, 405, { ok: false, error: "Method not allowed" });
          }

          void (async () => {
            const payload = await readJsonBody(req);
            const token = req.headers["x-api-token"] || payload?.token || "";

            if (validTokens.length > 0 && !validTokens.includes(token as string)) {
              return sendJson(res, 401, { ok: false, error: "Unauthorized" });
            }
            if (!payload?.event) {
              return sendJson(res, 400, { ok: false, error: "Missing event" });
            }

            const event = String(payload.event);
            const isSubmission = /^(formation|precommande|contact)/.test(event);

            // Log lisible dans le terminal dev
            const tag = isSubmission ? "📨 SUBMISSION" : "📊 event";
            // eslint-disable-next-line no-console
            console.log(
              `[dev-api] ${tag} ${event}`,
              isSubmission ? { ref: payload.ref, sheet: payload.sheet } : "",
            );

            return sendJson(res, 200, {
              ok: true,
              dev: true,
              event,
              // Même forme de réponse que api/track.js : le front lit
              // `ok`, `pdf` et marque le ticket "synced".
              sheet: { simulated: true, note: "Google Sheets inactif hors Vercel" },
              mail: null,
              pdf: null,
              errors: { sheet: null, mail: null, pdf: null },
              timestamp: new Date().toISOString(),
            });
          })();
          return;
        }

        // ---------------- /api/system* ----------------
        if (url.startsWith("/api/system") || url === "/api/health" || url === "/api/init-sheets" || url === "/api/notify") {
          return sendJson(res, 200, {
            ok: true,
            dev: true,
            note: "Endpoint simulé en dev — la logique réelle tourne sur Vercel (api/system.js)",
            timestamp: new Date().toISOString(),
          });
        }

        return next();
      });

      if (!loggedSummary) {
        loggedSummary = true;
        // eslint-disable-next-line no-console
        console.log(
          `[dev-api] Backend local actif — /api/track, /api/ping, /api/images-version` +
            (validTokens.length ? "" : " (⚠️ aucun token configuré : accès libre en dev)"),
        );
      }
    },
  };
}
