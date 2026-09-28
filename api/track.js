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
import { buildSubmissionPdf, pdfFilename } from "./lib/pdf.js";

// Évite que Vercel bundle ce truc bizarrement (CommonJS vs ESM)
// 4 Mo : les commandes peuvent embarquer la PHOTO du modèle (JPEG base64,
// ~100-350 Ko) destinée au ticket PDF — 1 Mo les aurait coupées en route.
export const config = {
  api: { bodyParser: { sizeLimit: "4mb" } },
};

// 🧵 60 secondes (plafond Hobby) : avec une photo jointe, PDF + 2 mails
// ont besoin d'air — sans cette marge, la fonction mourrait en route
// (« ça marche sans image, plus avec » — 28/09/2026).
export const maxDuration = 60;

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
  //    ⚠️ Jamais la photo brute (base64) dans une cellule : on garde
  //       son nom, l'image elle-même vit dans le PDF et le mail.
  // ============================================================
  let sheetResult = null;
  let sheetError = null;
  try {
    const { photo_jpeg, ...sheetPayload } = payload;
    sheetResult = await logEvent({ ...sheetPayload, status: payload.status || "ok" });
  } catch (e) {
    sheetError = e?.message || String(e);
    console.error("[track] sheets error", sheetError, payload);
  }

  // ============================================================
  // 2. Soumission → PDF UNIQUE + mails.
  //    Avant : le PDF était construit DEUX FOIS par demande (une
  //    fois pour le mail, une fois pour la réponse) — double travail
  //    qui, avec une photo jointe, tuait la fonction en plein vol.
  //    Maintenant : cousu UNE fois, partagé partout. 🧵
  // ============================================================
  const mailType = getTypeFromEvent(event);
  let mailResult = null;
  let mailError = null;
  let pdfResult = null;
  let pdfError = null;

  if (mailType) {
    // 2a. Le ticket PDF, une seule fois — il servira au mail ET à la réponse.
    let pdfAttachmentForMail = null;
    try {
      const buffer = await buildSubmissionPdf(mailType, payload);
      const filename = pdfFilename(
        payload.ref || payload.reference || payload.id || "CLB",
        mailType,
      );
      pdfAttachmentForMail = {
        filename,
        content: buffer,
        contentType: "application/pdf",
      };
      pdfResult = {
        ok: true,
        base64: buffer.toString("base64"),
        filename,
        mimeType: "application/pdf",
      };
    } catch (e) {
      pdfError = e?.message || String(e);
      console.error("[track] pdf error", pdfError, payload);
    }

    // 2b. Les mails (atelier + cliente) partent avec ce même PDF joint.
    try {
      mailResult = await sendSubmissionMail(mailType, payload, {
        pdfAttachment: pdfAttachmentForMail,
      });
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
  }

  // ============================================================
  // 3. Réponse
  //    « Livré » si AU MOINS un canal a abouti : une panne Sheets
  //    (clé absente…) ne doit JAMAIS priver la cliente de son
  //    ticket PDF ou empêcher le mail de partir — et vice versa.
  //    Le détail de chaque canal reste dans la réponse.
  // ============================================================
  const anyChannel = !!sheetResult?.ok || !!mailResult || !!pdfResult;
  const ok = anyChannel;
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