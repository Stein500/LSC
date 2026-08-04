/**
 * api/system.js
 *
 * Endpoint système unifié — regroupe TOUT le non-front en un seul handler :
 *
 *   GET  /api/system                 → métadonnées (hint + liste des sous-routes)
 *   GET  /api/system/health          → état du back (env, Sheets, SMTP)  [ex /api/health]
 *   POST /api/system/init-sheets     → crée/répare les onglets Sheets    [ex /api/init-sheets]
 *   POST /api/system/notify          → broadcast admin (mail)            [ex /api/notify]
 *
 * Pourquoi 1 seul fichier ?
 *   Vercel Hobby = 12 serverless functions max par projet. Avant on en
 *   avait 5 (track, push, health, init-sheets, notify). On a supprimé
 *   toute la partie push (notifications in-app désormais), donc on
 *   garde 2 lambdas racine (track, system).
 *
 * Le routage se fait sur le path : /api/system/<action>.
 * `vercel.json` contient des rewrites transparents pour que les anciennes
 * URLs (/api/health, /api/init-sheets, /api/notify) pointent toujours ici.
 *
 * Auth : header `x-api-token` doit matcher `TRACK_TOKEN` pour les POST.
 * Le GET /api/system/health est public (utile pour monitoring externe).
 */

import { verifySmtp, sendRawMail } from "./lib/mailer.js";
import { listTabs, ensureTab, SHEETS } from "./lib/sheets.js";

export const config = {
  api: { bodyParser: { sizeLimit: "256kb" } },
};

// =============================================================
// Helpers communs
// =============================================================

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-token");
}

function isAuthorized(req) {
  const token = req.headers["x-api-token"] || (req.body && req.body.token) || "";
  return Boolean(token && token === process.env.TRACK_TOKEN);
}

function detectAction(url) {
  const u = String(url || "").toLowerCase();
  // On accepte les anciens ET nouveaux paths pour rétro-compat totale
  if (u.endsWith("/health") || u.includes("/system/health")) return "health";
  if (u.endsWith("/init-sheets") || u.includes("/system/init-sheets") || u.includes("/init_sheets")) return "init-sheets";
  if (u.endsWith("/notify") || u.includes("/system/notify")) return "notify";
  return "info";
}

// =============================================================
// Sous-handlers
// =============================================================

async function handleHealth(_req, res) {
  const checks = {
    env: {
      GOOGLE_SHEET_ID: !!process.env.GOOGLE_SHEET_ID,
      GOOGLE_SERVICE_ACCOUNT_EMAIL: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      GOOGLE_PRIVATE_KEY: !!process.env.GOOGLE_PRIVATE_KEY,
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      MAIL_FROM: !!process.env.MAIL_FROM,
      MAIL_TO: !!process.env.MAIL_TO,
      TRACK_TOKEN: !!process.env.TRACK_TOKEN,
    },
    sheets: { ok: false, error: null },
    smtp: { ok: false, error: null },
  };

  try {
    const tabs = await listTabs();
    checks.sheets.ok = true;
    checks.sheets.tabs = tabs;
  } catch (e) {
    checks.sheets.error = e?.message || String(e);
  }

  try {
    await verifySmtp();
    checks.smtp.ok = true;
  } catch (e) {
    checks.smtp.error = e?.message || String(e);
  }

  const allOk =
    Object.values(checks.env).every(Boolean) &&
    checks.sheets.ok &&
    checks.smtp.ok;

  return res.status(allOk ? 200 : 503).json({
    ok: allOk,
    checks,
    timestamp: new Date().toISOString(),
  });
}

async function handleInitSheets(_req, res) {
  const results = [];
  for (const key of Object.keys(SHEETS)) {
    const def = SHEETS[key];
    try {
      await ensureTab(def.name, def.headers);
      results.push({ name: def.name, status: "ok" });
    } catch (e) {
      results.push({
        name: def.name,
        status: "failed",
        error: e?.message || String(e),
      });
    }
  }
  const allOk = results.every((r) => r.status !== "failed");
  return res.status(allOk ? 200 : 207).json({
    ok: allOk,
    tabs: results,
    timestamp: new Date().toISOString(),
  });
}

async function handleNotify(req, res) {
  const body = req.body || {};
  const subject = String(body.subject || "").trim();
  const text = String(body.text || "").trim();
  const html = typeof body.html === "string" ? body.html : undefined;
  const wantMail = body.mail !== false;

  if (!subject || !text) {
    return res.status(400).json({ ok: false, error: "Missing subject or text" });
  }

  const results = { mail: null };
  const errors = {};

  if (wantMail) {
    try {
      const r = await sendRawMail({ subject, text, html });
      results.mail = { ok: true, ...r };
    } catch (e) {
      errors.mail = e?.message || String(e);
      results.mail = { ok: false, error: errors.mail };
    }
  }

  const ok = !errors.mail;
  return res.status(ok ? 200 : 207).json({
    ok,
    subject,
    results,
    errors,
    timestamp: new Date().toISOString(),
  });
}

// =============================================================
// Handler principal (routage par path)
// =============================================================

export default async function handler(req, res) {
  setCors(res);

  if (req.method === "OPTIONS") return res.status(204).end();

  const action = detectAction(req.url);

  // GET racine = métadonnées
  if (req.method === "GET" && (action === "info" || req.url === "/api/system" || req.url === "/api/system/")) {
    return res.status(200).json({
      ok: true,
      service: "lsc-system",
      hint: "GET /api/system/health · POST /api/system/init-sheets · POST /api/system/notify",
      routes: [
        "GET  /api/system/health          (public)",
        "POST /api/system/init-sheets     (auth)",
        "POST /api/system/notify          (auth)",
      ],
      timestamp: new Date().toISOString(),
    });
  }

  // /health : GET public
  if (action === "health") {
    if (req.method === "GET") return handleHealth(req, res);
    if (req.method === "OPTIONS") return res.status(204).end();
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // /init-sheets : GET (info) + POST (action, auth)
  if (action === "init-sheets") {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        hint: "POST /api/system/init-sheets (header x-api-token) pour forcer la création des onglets.",
        expected: Object.keys(SHEETS),
      });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
    if (!isAuthorized(req)) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
    try {
      return await handleInitSheets(req, res);
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  // /notify : POST auth uniquement
  if (action === "notify") {
    if (req.method === "GET") {
      return res.status(200).json({
        ok: true,
        hint: "POST /api/system/notify { subject, text, html?, mail? }",
      });
    }
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }
    if (!isAuthorized(req)) {
      return res.status(401).json({ ok: false, error: "Unauthorized" });
    }
    try {
      return await handleNotify(req, res);
    } catch (e) {
      return res.status(500).json({ ok: false, error: e?.message || String(e) });
    }
  }

  return res.status(404).json({ ok: false, error: "Unknown /api/system action" });
}
