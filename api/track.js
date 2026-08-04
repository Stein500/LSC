/**
 * api/track.js
 *
 * Endpoint unique — reçoit tous les events du front, écrit dans Google Sheets,
 * envoie un mail SMTP pour les 3 types de soumission (formation, precommande, contact).
 *
 * Auth : header `x-api-token` doit matcher `TRACK_TOKEN`.
 * Format body : JSON libre, voir src/utils/api.ts côté front.
 */

import { logEvent } from "./lib/sheets.js";
import { sendSubmissionMail } from "./lib/mailer.js";
import { buildSubmissionPdfBase64, pdfFilename } from "./lib/pdf.js";

// Évite que Vercel bundle ce truc bizarrement (CommonJS vs ESM)
export const config = {
  api: { bodyParser: { sizeLimit: "1mb" } },
};

// =============================================================
// Helpers
// =============================================================

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS, GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-api-token");
}

function isAuthorized(req) {
  const token =
    req.headers["x-api-token"] ||
    (req.body && req.body.token) ||
    "";
  if (!token) return false;
  // Accepte soit le token admin (TRACK_TOKEN) soit le token public (TRACK_PUBLIC_TOKEN).
  // Le token public peut être embarqué dans le bundle JS (préfixe VITE_), il sert
  // uniquement au tracking analytics. Le token admin reste server-only.
  const validTokens = [process.env.TRACK_TOKEN, process.env.TRACK_PUBLIC_TOKEN].filter(Boolean);
  return validTokens.includes(token);
}

function getTypeFromEvent(event) {
  if (!event) return null;
  if (event.startsWith("formation")) return "formation";
  if (event.startsWith("precommande")) return "precommande";
  if (event.startsWith("contact")) return "contact";
  return null;
}

// =============================================================
// Handler principal
// =============================================================

export default async function handler(req, res) {
  setCors(res);

  // Preflight CORS
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Health-check simple
  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      service: "colombes-track",
      timestamp: new Date().toISOString(),
      endpoints: { track: "POST /api/track" },
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  // Auth
  if (!isAuthorized(req)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  const payload = req.body || {};
  const event = payload.event;
  if (!event) {
    return res.status(400).json({ ok: false, error: "Missing event" });
  }

  // ============================================================
  // 1. Toujours écrire dans Google Sheets (best-effort)
  // ============================================================
  let sheetResult = null;
  let sheetError = null;
  try {
    sheetResult = await logEvent({ ...payload, status: payload.status || "ok" });
  } catch (e) {
    sheetError = e?.message || String(e);
    console.error("[track] sheets error", sheetError, payload);
  }

  // ============================================================
  // 2. Envoyer le mail si c'est une soumission
  // ============================================================
  const mailType = getTypeFromEvent(event);
  let mailResult = null;
  let mailError = null;
  let pdfResult = null;
  let pdfError = null;

  if (mailType) {
    try {
      mailResult = await sendSubmissionMail(mailType, payload);
    } catch (e) {
      mailError = e?.message || String(e);
      console.error("[track] mail error", mailError, payload);
      // Tente de re-loguer l'erreur dans Forms
      try {
        await logEvent({
          event: "form_api_error",
          sheet: "Forms",
          form: mailType,
          stage: "mail_send",
          error: mailError,
          ref: payload.ref,
        });
      } catch {}
    }

    // ============================================================
    // 2b. Générer le ticket PDF correspondant à la soumission
    // ============================================================
    try {
      const base64 = await buildSubmissionPdfBase64(mailType, payload);
      pdfResult = {
        ok: true,
        base64,
        filename: pdfFilename(payload.ref || payload.reference || payload.id || "CLB", mailType),
        mimeType: "application/pdf",
      };
    } catch (e) {
      pdfError = e?.message || String(e);
      console.error("[track] pdf error", pdfError, payload);
    }

    // Plus de push serveur : tout est en in-app (localStorage).
  }

  // ============================================================
  // 3. Réponse
  // ============================================================
  const ok = !sheetError; // l'event est "delivered" si Sheets a marché
  return res.status(ok ? 200 : 500).json({
    ok,
    event,
    sheet: sheetResult,
    mail: mailResult
      ? {
          ok: true,
          admin: mailResult.admin || null,
          customer: mailResult.customer || null,
        }
      : mailError
        ? { ok: false, error: mailError }
        : null,
    pdf: pdfResult,
    errors: {
      sheet: sheetError,
      mail: mailError,
      pdf: pdfError,
    },
    timestamp: new Date().toISOString(),
  });
}