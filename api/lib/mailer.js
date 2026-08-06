/**
 * api/lib/mailer.js — v2 « COUTURE PREMIUM » (2026)
 *
 * SMTP Gmail via nodemailer. DEUX modèles distincts, pensés différemment :
 *
 *   💌 MAIL CLIENTE (« glamour »)
 *      Confirmation envoyée à la cliente après sa demande : crème parchemin,
 *      en-tête noir fil d'or wordmark « Colombes », carte TICKET bordure or
 *      pointillée (écho au PDF), récapitulatif zébré, grand bouton WhatsApp,
 *      étapes numérotées, signature chaleureuse. AUCUNE URL du site n'y
 *      figure (volonté de l'atelier : l'adresse d'hébergement reste invisible).
 *
 *   ⚡ MAIL ATELIER (« efficace »)
 *      Notification interne lisible en 5 secondes : qui, quoi, téléphone
 *      cliquable, boutons d'action [Appeler] [WhatsApp] [Email] avec lien
 *      wa.me pré-rempli (n° de ticket inclus), tableau compact, badge réf.
 *
 * Les deux reçoivent le PDF récapitulatif en pièce jointe (bandeau natif,
 * plus aucune injection regex — fini les débris d'attributs dans Gmail).
 */

import fs from "node:fs";
import path from "node:path";
import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "465", 10);
const SMTP_SECURE = (process.env.SMTP_SECURE || "true") === "true";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const MAIL_FROM = process.env.MAIL_FROM || SMTP_USER;
const MAIL_TO = (process.env.MAIL_TO || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Identité atelier (lue aussi depuis env si présente, sinon défaut)
const ATELIER_NAME = process.env.ATELIER_NAME || "Les Services Colombes";
const ATELIER_TAGLINE = process.env.ATELIER_TAGLINE || "Atelier de Couture d'Exception";
const ATELIER_PHONE = process.env.ATELIER_PHONE || "+229 01 67 40 94 08";
const ATELIER_PHONE_2 = process.env.ATELIER_PHONE_2 || "+229 01 95 76 36 01";
const ATELIER_WA = process.env.ATELIER_WA || "2290167409408";
const ATELIER_LOCATION =
  process.env.ATELIER_LOCATION ||
  "Devant l'école primaire publique TOKPOTA DAVO GROUPE ABC, Porto-Novo – Bénin";
const ATELIER_SITE = process.env.ATELIER_SITE || "https://couturecolombe.vercel.app";
const ATELIER_LOGO_URL = process.env.ATELIER_LOGO_URL || `${ATELIER_SITE.replace(/\/$/, "")}/images/logo.webp`;

// ── Palette (identique au site — ne jamais dériver) ─────────────────────────
const C = {
  noir: "#0B0B12",
  citron: "#BFFF00",
  citronD: "#8FBF00",
  marron: "#8B4513",
  marronD: "#5C2E0C",
  or: "#C9A87C",
  orL: "#F4E3C9",
  creme: "#FBF7EE",
  parchemin: "#F4EEE4",
  encre: "#2B1B0E",
  wa: "#25D366",
};

let _transport = null;
function getTransport() {
  if (_transport) return _transport;

  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_USER / SMTP_PASS manquants (variables d'env serveur)");
  }

  _transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return _transport;
}

// =============================================================
// Petits utilitaires
// =============================================================

function escHtml(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function formatDispo(dispo) {
  if (!Array.isArray(dispo) || dispo.length === 0) return "—";
  const labels = {
    matin: "Matin",
    apresmidi: "Après-midi",
    soir: "Soir",
    weekend: "Week-end",
  };
  return dispo.map((d) => labels[d] || d).join(", ");
}

/** Reformule les valeurs brutes des <select> en libellés français propres. */
function labelNiveau(v) {
  return v === "debutant"
    ? "Débutant(e)"
    : v === "intermediaire"
      ? "Intermédiaire"
      : v || "—";
}
function labelFormationChoisie(v) {
  return v === "courte"
    ? "Formation Courte"
    : v === "specialisee"
      ? "Formation Spécialisée"
      : v === "indecis"
        ? "Pas encore décidé"
        : v || "—";
}
function labelSujet(v) {
  return (
    {
      question: "Question générale",
      devis: "Demande de devis",
      reclamation: "Réclamation",
      autre: "Autre",
    }[v] ||
    v ||
    "—"
  );
}

/**
 * Profil destinataire (= contexte du formulaire côté client)
 *   - formation   → postulant
 *   - precommande → client·e
 *   - contact     → visiteur / visiteuse
 */
function profilFor(type) {
  if (type === "formation") return "postulant";
  if (type === "precommande") return "client";
  if (type === "contact") return "visiteur";
  return "visiteur";
}

// =============================================================
// Logo (pièce jointe CID + fallback SVG inline)
// =============================================================

const LOGO_CID = "lsc-logo";

function buildLogoSvg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128" role="img" aria-label="${escHtml(ATELIER_NAME)}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#BFFF00"/>
        <stop offset="100%" stop-color="#8FBF00"/>
      </linearGradient>
    </defs>
    <rect width="128" height="128" rx="30" fill="#FFFFFF"/>
    <circle cx="64" cy="64" r="51" fill="#FFFFFF" stroke="url(#g)" stroke-width="6"/>
    <g fill="none" stroke="#8B4513" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M47 50c7 7 16 14 26 22" />
      <path d="M51 47l-8-8" />
      <path d="M72 45c3 4 6 8 10 12" />
      <path d="M58 58c-6 6-11 13-15 21" />
      <path d="M78 44c3-3 7-3 10 0" />
      <path d="M67 69c5 5 11 11 18 14" />
    </g>
    <circle cx="64" cy="64" r="3.7" fill="#8B4513"/>
  </svg>`;
}

function getLogoAttachment() {
  const webpPath = path.join(process.cwd(), "public", "images", "logo.webp");
  const svgPath = path.join(process.cwd(), "public", "images", "logo.svg");

  if (fs.existsSync(webpPath)) {
    return { filename: "logo.webp", path: webpPath, contentType: "image/webp", cid: LOGO_CID };
  }
  if (fs.existsSync(svgPath)) {
    return { filename: "logo.svg", path: svgPath, contentType: "image/svg+xml", cid: LOGO_CID };
  }
  return { filename: "logo.svg", content: buildLogoSvg(), contentType: "image/svg+xml", cid: LOGO_CID };
}

// =============================================================
// Motifs signature de la maison (conservés — ils font la marque)
// =============================================================

/** Mini-bande "pagne tissé" — SVG inline, universelle (Gmail, Outlook, Apple Mail). */
function pagneBandSvg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 28" width="100%" height="28"
       preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
    <rect width="600" height="28" fill="#E6F4FB"/>
    <rect x="0"   y="0"  width="600" height="6"  fill="#BFFF00"/>
    <rect x="0"   y="6"  width="600" height="4"  fill="#8B4513"/>
    <rect x="0"   y="10" width="600" height="2"  fill="#8FBF00"/>
    <rect x="0"   y="12" width="600" height="2"  fill="#BFFF00"/>
    <rect x="0"   y="14" width="600" height="3"  fill="#8B4513"/>
    <rect x="0"   y="17" width="600" height="3"  fill="#5C2E0C"/>
    <rect x="0"   y="20" width="600" height="3"  fill="#BFFF00"/>
    <rect x="0"   y="23" width="600" height="3"  fill="#8FBF00"/>
    <rect x="0"   y="26" width="600" height="2"  fill="#000000"/>
    <g fill="#5C2E0C" opacity="0.85">
      ${Array.from({ length: 12 }, (_, i) => {
        const x = 8 + i * 50;
        return `<polygon points="${x},0 ${x + 18},6 ${x + 36},0"/>`;
      }).join("")}
    </g>
    <g fill="#8B4513" opacity="0.7">
      ${Array.from({ length: 12 }, (_, i) => {
        const x = 33 + i * 50;
        return `<polygon points="${x},0 ${x + 18},6 ${x + 36},0"/>`;
      }).join("")}
    </g>
    <g fill="#BFFF00">
      ${Array.from({ length: 20 }, (_, i) => {
        const x = 12 + i * 30;
        return `<circle cx="${x}" cy="11" r="1.2"/>`;
      }).join("")}
    </g>
  </svg>`;
}

/** Liseré "fil de couture" — utilisé en pied de mail, juste avant le footer. */
function threadStitchSvg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 14" width="100%" height="14"
       preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
    <rect width="600" height="14" fill="#FFFFFF"/>
    <path d="M0 7 Q 12 1 24 7 T 48 7 T 72 7 T 96 7 T 120 7 T 144 7 T 168 7 T 192 7 T 216 7 T 240 7 T 264 7 T 288 7 T 312 7 T 336 7 T 360 7 T 384 7 T 408 7 T 432 7 T 456 7 T 480 7 T 504 7 T 528 7 T 552 7 T 576 7 T 600 7"
          fill="none" stroke="#8B4513" stroke-width="1.6" stroke-linecap="round"/>
    ${Array.from({ length: 40 }, (_, i) => {
      const x = 4 + i * 15;
      return `<circle cx="${x}" cy="7" r="1" fill="#8FBF00" opacity="0.85"/>`;
    }).join("")}
  </svg>`;
}

// =============================================================
// Données (dates FR, noms, cœur de soumission)
// =============================================================

function submittedAtInfo(data = {}) {
  const submittedAt = data.timestamp || data.submittedAt || new Date().toISOString();
  const when = new Date(submittedAt);
  const dateSoumission = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(when);
  const heureSoumission = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(when);
  return { submittedAt, dateSoumission, heureSoumission };
}

function customerNameFor(type, data) {
  return (
    (type === "formation" ? data.prenom || data.nom : data.nom) ||
    data.prenom ||
    (type === "contact" ? "Bonjour" : "Client·e")
  );
}

/** Numéro de téléphone de la cliente → chiffres pour wa.me */
function clientPhoneDigits(data = {}) {
  const raw = String(data.telephone || data.phone || "").replace(/[^\d]/g, "");
  if (!raw) return "";
  // 229 déjà présent ? sinon on préfixe (Bénin)
  if (raw.startsWith("229")) return raw;
  return `229${raw.replace(/^0+/, "")}`;
}

/**
 * CŒUR MÉTIER — extrait tous les champs saisis, par type de demande,
 * dans l'ordre d'affichage. AUCUNE information saisie n'est perdue.
 */
function buildSubmissionCore(type, data) {
  const ref = data.ref || "—";
  const profil = profilFor(type);
  const { submittedAt, dateSoumission, heureSoumission } = submittedAtInfo(data);
  const recipientName = customerNameFor(type, data);

  const telLink = (v) =>
    v
      ? `<a href="tel:${escHtml(String(v).replace(/\s/g, ""))}" style="color:${C.marron};text-decoration:none;font-weight:600;">${escHtml(v)}</a>`
      : "—";
  const mailLink = (v) =>
    v
      ? `<a href="mailto:${escHtml(v)}" style="color:${C.marron};text-decoration:none;font-weight:600;">${escHtml(v)}</a>`
      : "—";

  let subject = "";
  let label = "";
  let intro = "";
  let fields = [];

  if (type === "formation") {
    subject = `[Formation — ${data.prenom || data.nom || "Postulant·e"}] Réf. ${ref}`;
    label = "Nouvelle candidature à la formation";
    intro = "Une nouvelle candidature pour l'apprentissage de la couture vient d'être reçue sur le site.";
    fields = [
      ["Date de soumission", escHtml(dateSoumission)],
      ["Heure de soumission", escHtml(heureSoumission)],
      ["Référence", ref, "ref"],
      ["Nom", escHtml(data.nom) || "—"],
      ["Prénom", escHtml(data.prenom) || "—"],
      ["Âge", data.age ? `${escHtml(data.age)} ans` : "—"],
      ["Téléphone", telLink(data.telephone)],
      ["Email", mailLink(data.email)],
      ["Niveau actuel", escHtml(labelNiveau(data.niveau_actuel))],
      ["Formation choisie", escHtml(labelFormationChoisie(data.formation_choisie))],
      ["Disponibilités", escHtml(formatDispo(data.disponibilite))],
      ["Motivation", escHtml(data.motivation) || "—"],
      ["Motif de paiement souhaité", escHtml(data.motif_paiement) || "—"],
    ];
  } else if (type === "precommande") {
    subject = `[Pré-commande — ${data.nom || "Cliente"}] Réf. ${ref}`;
    label = "Nouvelle pré-commande";
    intro = "Une nouvelle pré-commande de tenue vient d'être reçue sur le site.";
    fields = [
      ["Date de soumission", escHtml(dateSoumission)],
      ["Heure de soumission", escHtml(heureSoumission)],
      ["Référence", ref, "ref"],
      ["Nom complet", escHtml(data.nom) || "—"],
      ["Téléphone", telLink(data.telephone)],
      ["Email", mailLink(data.email)],
      ["Type de tenue", escHtml(data.type_tenue) || "—"],
      ["Type (autre / précisé)", escHtml(data.tenue_autre) || "—"],
      ["Couleur préférée", escHtml(data.couleur_preferee) || "—"],
      ["Taille", escHtml(data.taille) || "—"],
      ["Date souhaitée", escHtml(data.date_souhaitee) || "—"],
      ["Budget estimé", escHtml(data.budget) || "—"],
      ["Description du projet", escHtml(data.description) || "—"],
      ["Mesures fournies", escHtml(data.mesures) || "—"],
    ];
  } else if (type === "contact") {
    subject = `[Contact — ${data.nom || "Visiteur"}] ${data.sujet ? labelSujet(data.sujet) : "Sans objet"} — Réf. ${ref}`;
    label = "Nouveau message de contact";
    intro = "Un nouveau message vient d'être reçu via le formulaire de contact du site.";
    fields = [
      ["Date de soumission", escHtml(dateSoumission)],
      ["Heure de soumission", escHtml(heureSoumission)],
      ["Référence", ref, "ref"],
      ["Nom", escHtml(data.nom) || "—"],
      ["Email", mailLink(data.email)],
      ["Téléphone", telLink(data.telephone)],
      ["Sujet", escHtml(labelSujet(data.sujet))],
      ["Message", escHtml(data.message) || "—"],
    ];
  } else {
    subject = `[${escHtml(ATELIER_NAME)}] ${type} — Réf. ${ref}`;
    label = `Événement : ${type}`;
    intro = "Nouvel événement reçu via le système de suivi du site.";
    fields = [
      ["Date de soumission", escHtml(dateSoumission)],
      ["Heure de soumission", escHtml(heureSoumission)],
      ...Object.entries(data).map(([k, v]) => [
        escHtml(k),
        typeof v === "object" ? escHtml(JSON.stringify(v)) : escHtml(String(v ?? "—")),
      ]),
    ];
  }

  return { ref, profil, recipientName, subject, label, intro, fields, submittedAt, dateSoumission, heureSoumission };
}

// =============================================================
// PIÈCES DU DESIGN v2
// =============================================================

/** Coquille commune : fond, carte 620 px, coins arrondis. */
function shell({ pageBg, inner }) {
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap">
  <style>
    .lsc-signature { font-family: 'Caveat','Bradley Hand','Comic Sans MS',cursive; }
    @media only screen and (max-width: 480px) {
      .lsc-pad { padding: 24px 18px !important; }
      .lsc-h1 { font-size: 22px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:${pageBg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${C.encre};">
  <div style="max-width:620px;margin:0 auto;">${inner}</div>
</body>
</html>`;
}

/** En-tête cliente : pagne + bande noire fil d'or + wordmark Colombes. */
function clientHeader() {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="padding:0;line-height:0;font-size:0;">${pagneBandSvg()}</td></tr>
  </table>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.noir};">
    <tr>
      <td style="padding:30px 24px 26px;text-align:center;">
        <div style="display:inline-block;width:78px;height:78px;border-radius:50%;background:#FFFFFF;border:2px solid ${C.or};box-shadow:0 6px 18px rgba(0,0,0,0.35);overflow:hidden;">
          <img src="cid:${LOGO_CID}" alt="${escHtml(ATELIER_NAME)}" width="78" height="78" style="display:block;width:100%;height:100%;object-fit:contain;" />
        </div>
        <p style="margin:16px 0 0;font-size:10px;letter-spacing:0.42em;text-transform:uppercase;color:rgba(255,255,255,0.62);font-weight:600;">
          ${escHtml(ATELIER_NAME)}
        </p>
        <p style="margin:4px 0 0;font-family:Georgia,'Playfair Display',serif;font-style:italic;font-size:34px;color:${C.or};font-weight:700;letter-spacing:0.01em;">
          Colombes
        </p>
        <p style="margin:8px 0 0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${C.citron};font-weight:600;">
          ${escHtml(ATELIER_TAGLINE)}
        </p>
        <div style="margin:18px auto 0;width:120px;height:1px;background:linear-gradient(90deg,transparent,${C.or},transparent);"></div>
      </td>
    </tr>
  </table>`;
}

/** Carte ticket — bordure or pointillée « patron à découper » (écho au PDF). */
function clientTicketCard(ref, dateSoumission, heureSoumission) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="margin:0 0 22px;background:#FFFDF6;border:2px dashed ${C.or};border-radius:12px;">
    <tr>
      <td style="padding:16px 18px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr>
            <td style="vertical-align:middle;">
              <p style="margin:0;font-size:10px;letter-spacing:0.3em;text-transform:uppercase;color:${C.marron};font-weight:700;">🎫 Votre ticket</p>
              <p style="margin:5px 0 0;font-family:'Courier New',monospace;font-size:21px;font-weight:700;color:${C.marronD};letter-spacing:0.04em;">${escHtml(ref)}</p>
            </td>
            <td style="vertical-align:middle;text-align:right;font-size:26px;color:${C.or};">✂</td>
          </tr>
        </table>
        <div style="margin:12px 0 10px;border-top:1px dashed ${C.or};"></div>
        <p style="margin:0;font-size:12px;color:${C.encre};opacity:0.75;">
          Reçu le <strong>${escHtml(dateSoumission)}</strong> à <strong>${escHtml(heureSoumission)}</strong><br>
          <em>Présentez ce numéro lors de votre passage à l'atelier — il est votre fil d'Ariane avec nous.</em>
        </p>
      </td>
    </tr>
  </table>`;
}

/** Tableau récapitulatif zébré. */
function recapTable(fields, { compact = false } = {}) {
  const pad = compact ? "8px 12px" : "11px 15px";
  const size = compact ? "13px" : "14px";
  const rows = fields
    .map(([k, v, tone], i) => {
      const zebra = i % 2 === 1 ? `background:${C.creme};` : "";
      const labelColor = tone === "ref" ? C.marronD : C.marronD;
      const labelWeight = tone === "ref" ? "700" : "600";
      return `
    <tr style="${zebra}">
      <td style="padding:${pad};font-weight:${labelWeight};color:${labelColor};width:38%;vertical-align:top;font-size:${compact ? "12px" : "13px"};">${escHtml(k)}</td>
      <td style="padding:${pad};color:${C.encre};vertical-align:top;font-size:${size};line-height:1.5;">${v ?? "—"}</td>
    </tr>`;
    })
    .join("");
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="border-collapse:collapse;border:1px solid ${C.or}66;border-radius:10px;overflow:hidden;margin:0 0 22px;">
    ${rows}
  </table>`;
}

/** Bouton pilule bulletproof (table + bgcolor). */
function pillButton(href, label, bg, textColor = "#FFFFFF") {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
    <tr>
      <td bgcolor="${bg}" style="border-radius:999px;">
        <a href="${href}" style="display:inline-block;padding:13px 26px;border-radius:999px;font-size:14px;font-weight:700;color:${textColor};text-decoration:none;">
          ${label}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Étapes suivantes (cliente). */
function stepsBlock(type) {
  const steps =
    type === "formation"
      ? [
          "Nous étudions votre candidature sous 48 h ouvrées.",
          "Un échange (téléphone ou WhatsApp) est planifié avec vous.",
          "Une proposition de planning et de tarif vous est envoyée.",
          "Votre formation démarre selon vos disponibilités. ✂️",
        ]
      : type === "precommande"
        ? [
            "Nous prenons connaissance de votre projet sous 48 h ouvrées.",
            "Un échange est planifié pour valider chaque détail (tissu, mesures, délai).",
            "Un devis détaillé vous est envoyé.",
            "La production démarre après votre validation. 🧵",
          ]
        : [
            "Nous lisons votre message sous 48 h ouvrées.",
            "Une réponse personnalisée vous est adressée.",
            "Si besoin, nous planifions ensemble un rendez-vous à l'atelier. 💛",
          ];
  const lis = steps
    .map(
      (s, i) => `
      <tr>
        <td style="vertical-align:top;width:30px;padding:4px 0;">
          <div style="width:24px;height:24px;border-radius:50%;border:2px solid ${C.or};color:${C.marronD};font-size:12px;font-weight:700;text-align:center;line-height:22px;">${i + 1}</div>
        </td>
        <td style="padding:4px 0 8px 4px;font-size:14px;color:${C.encre};line-height:1.5;">${s}</td>
      </tr>`,
    )
    .join("");
  return `
  <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${C.citronD};font-weight:700;">
    🧭 La suite, tout simplement
  </p>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 22px;">
    ${lis}
  </table>`;
}

/** Signature chaleureuse (cliente). */
function signatureBlock(recipientName) {
  return `
  <div style="margin:6px 0 0;padding:16px 18px;background:${C.creme};border-radius:12px;border-left:4px solid ${C.or};">
    <p class="lsc-signature" style="margin:0 0 2px;font-size:26px;color:${C.marron};">
      Maman Colombe
    </p>
    <p style="margin:0;font-size:13px;color:${C.encre};opacity:0.8;line-height:1.5;">
      &amp; toute l'équipe de l'atelier — nous avons hâte de coudre avec vous, ${escHtml(recipientName)}. ✂️
    </p>
  </div>`;
}

/** Pied de page SANS URL du site (l'hébergement reste invisible). */
function footerBlock({ dark = true } = {}) {
  const bg = dark ? C.noir : C.creme;
  const text = dark ? "#CFC6B8" : C.encre;
  const accent = dark ? C.citron : C.marron;
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${bg};border-radius:0 0 14px 14px;">
    <tr>
      <td style="padding:22px 24px;text-align:center;">
        <p style="margin:0 0 2px;font-family:Georgia,serif;font-size:15px;color:${accent};font-weight:600;">
          ✂️ ${escHtml(ATELIER_NAME)}
        </p>
        <p style="margin:0 0 12px;font-size:10px;letter-spacing:0.26em;text-transform:uppercase;color:${accent};opacity:0.85;">
          ${escHtml(ATELIER_TAGLINE)}
        </p>
        <p style="margin:0;font-size:13px;color:${text};">
          📞 <a href="tel:${escHtml(ATELIER_PHONE.replace(/\s/g, ""))}" style="color:${accent};text-decoration:none;font-weight:600;">${escHtml(ATELIER_PHONE)}</a>
          &nbsp;·&nbsp;
          <a href="tel:${escHtml(ATELIER_PHONE_2.replace(/\s/g, ""))}" style="color:${accent};text-decoration:none;font-weight:600;">${escHtml(ATELIER_PHONE_2)}</a>
        </p>
        <p style="margin:7px 0 0;font-size:13px;color:${text};">
          💬 <a href="https://wa.me/${escHtml(ATELIER_WA)}" style="color:${accent};text-decoration:none;font-weight:600;">WhatsApp direct</a>
        </p>
        <p style="margin:12px 0 0;font-size:11px;color:${text};opacity:0.7;">
          ${escHtml(ATELIER_LOCATION)}
        </p>
      </td>
    </tr>
  </table>`;
}

/** Bandeau « PDF joint » (natif — plus de hack regex). */
function pdfBanner(ref, forAdmin = false) {
  return `
  <div style="background:#FFF8E5;border:1px solid ${C.or};border-radius:10px;padding:12px 16px;margin:0 0 ${forAdmin ? "16px" : "20px"};">
    <p style="margin:0;font-size:12.5px;color:${C.encre};line-height:1.5;">
      📎 <strong>Récapitulatif PDF joint</strong> — Ticket <code style="background:#FFFFFF;padding:1px 6px;border-radius:4px;border:1px solid ${C.or}55;font-size:12px;">${escHtml(ref)}</code>${forAdmin ? "" : "<br><span style=\"opacity:0.75;\">Conservez-le : il tient lieu de justificatif de votre demande.</span>"}
    </p>
  </div>`;
}

// =============================================================
// 💌 MAIL CLIENTE — « GLAMOUR »
// =============================================================

function buildClientMail(type, data) {
  const { ref, recipientName, fields, dateSoumission, heureSoumission } = buildSubmissionCore(type, data);
  const clientLabel =
    type === "formation"
      ? "Votre candidature est entre de bonnes mains"
      : type === "precommande"
        ? "Votre pré-commande est entre de bonnes mains"
        : type === "contact"
          ? "Votre message est bien arrivé"
          : "Votre demande est bien arrivée";
  const clientSubject = `✂️ ${clientLabel} — Ticket n° ${ref}`;

  // Pour la cliente : on retire les champs purement techniques.
  const ADMIN_ONLY = new Set(["sessionId", "source", "Page", "Session"]);
  const clientFields = fields.filter(([label]) => !ADMIN_ONLY.has(String(label).trim()));

  const inner = `
  <div style="background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 10px 34px rgba(43,27,14,0.10);" >
    ${clientHeader()}
    <div class="lsc-pad" style="padding:30px 26px;">
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${C.citronD};font-weight:700;">
        Confirmation de réception
      </p>
      <h1 class="lsc-h1" style="margin:0 0 12px;font-family:Georgia,'Playfair Display',serif;font-size:25px;color:${C.encre};font-weight:700;line-height:1.25;">
        ${escHtml(clientLabel)}
      </h1>
      <p style="margin:0 0 22px;color:${C.encre};opacity:0.85;line-height:1.6;font-size:15px;">
        Bonjour <strong>${escHtml(recipientName)}</strong>, merci pour votre confiance.
        Votre demande vient d'être cousue dans notre registre — la voici, récapitulée avec soin.
      </p>

      ${clientTicketCard(ref, dateSoumission, heureSoumission)}

      <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${C.marron};font-weight:700;">
        📝 Votre récapitulatif
      </p>
      ${recapTable(clientFields)}

      ${data.__pdfAttached ? pdfBanner(ref) : ""}

      ${stepsBlock(type)}

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 24px;">
        <tr>
          <td align="center" style="padding:6px 0 10px;">
            ${pillButton(`https://wa.me/${ATELIER_WA}?text=${encodeURIComponent(`Bonjour, je fais suite à ma demande (ticket ${ref}) ✂️`)}`, "💬 Échanger sur WhatsApp", C.wa)}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:0;">
            <a href="tel:${escHtml(ATELIER_PHONE.replace(/\s/g, ""))}" style="font-size:13px;color:${C.marron};text-decoration:none;font-weight:600;border-bottom:1px dashed ${C.or};padding-bottom:2px;">
              ou appelez-nous au ${escHtml(ATELIER_PHONE)}
            </a>
          </td>
        </tr>
      </table>

      ${signatureBlock(recipientName)}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="padding:0;line-height:0;font-size:0;background:#FFFFFF;">${threadStitchSvg()}</td></tr>
    </table>
    ${footerBlock()}
  </div>`;

  const html = shell({ pageBg: C.parchemin, inner });

  const text = [
    `✂️ ${ATELIER_NAME} — ${clientLabel}`,
    "",
    `Bonjour ${recipientName},`,
    "",
    "Votre demande a bien été reçue et enregistrée.",
    "",
    `🎫 TICKET N° : ${ref}`,
    "   Présentez ce numéro lors de votre passage à l'atelier.",
    "",
    `Reçu le : ${dateSoumission} à ${heureSoumission}`,
    "",
    "--- VOTRE RÉCAPITULATIF ---",
    ...clientFields.map(([k, v]) => `${k} : ${String(v).replace(/<[^>]+>/g, "")}`),
    "",
    data.__pdfAttached ? "📎 Récapitulatif PDF joint à ce mail." : "",
    "",
    "--- LA SUITE ---",
    ...(type === "formation"
      ? [
          "1. Étude de votre candidature sous 48 h ouvrées.",
          "2. Échange (téléphone ou WhatsApp) planifié.",
          "3. Proposition de planning et tarif.",
          "4. Démarrage selon vos disponibilités.",
        ]
      : type === "precommande"
        ? [
            "1. Lecture de votre projet sous 48 h ouvrées.",
            "2. Échange pour valider les détails.",
            "3. Devis détaillé envoyé.",
            "4. Production après validation du devis.",
          ]
        : [
            "1. Lecture de votre message sous 48 h ouvrées.",
            "2. Réponse personnalisée.",
            "3. Rendez-vous planifié si besoin.",
          ]),
    "",
    "Contact :",
    `  ${ATELIER_PHONE} / ${ATELIER_PHONE_2}`,
    `  WhatsApp : https://wa.me/${ATELIER_WA}`,
    `  ${ATELIER_LOCATION}`,
    "",
    "Maman Colombe & toute l'équipe ✂️",
  ]
    .filter((l) => l !== "")
    .join("\n");

  return { subject: clientSubject, html, text, attachments: [getLogoAttachment()] };
}

// =============================================================
// ⚡ MAIL ATELIER — « EFFICACE » (lecture 5 secondes, actions 1 clic)
// =============================================================

function buildAdminMail(type, data) {
  const { ref, subject, label, intro, fields, dateSoumission, heureSoumission } = buildSubmissionCore(type, data);

  const typeBadge =
    type === "formation" ? "🎓 FORMATION" : type === "precommande" ? "👗 PRÉ-COMMANDE" : "📩 CONTACT";
  const clientTel = String(data.telephone || "").trim();
  const clientTelHref = clientTel ? `tel:${clientTel.replace(/\s/g, "")}` : "";
  const waDigits = clientPhoneDigits(data);
  const waHref = waDigits
    ? `https://wa.me/${waDigits}?text=${encodeURIComponent(
        `Bonjour ${customerNameFor(type, data)}, ici l'atelier ${ATELIER_NAME} — au sujet de votre ticket ${ref} ✂️`,
      )}`
    : "";
  const clientMail = String(data.email || "").trim();

  const actions = [
    clientTelHref ? pillButton(clientTelHref, "📞 Appeler", C.marron) : "",
    waHref ? pillButton(waHref, "💬 WhatsApp", C.wa) : "",
    clientMail ? pillButton(`mailto:${escHtml(clientMail)}?subject=${encodeURIComponent(`Re: votre ticket ${ref} — ${ATELIER_NAME}`)}`, "✉️ Email", C.noir) : "",
  ]
    .filter(Boolean)
    .join("&nbsp;&nbsp;");

  const inner = `
  <div style="background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 10px 34px rgba(43,27,14,0.10);">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${C.marronD};">
      <tr>
        <td style="padding:16px 22px;">
          <p style="margin:0;font-size:13px;font-weight:700;color:${C.citron};letter-spacing:0.14em;">${typeBadge}</p>
          <p style="margin:4px 0 0;font-size:11px;color:rgba(255,255,255,0.75);">${escHtml(intro)}</p>
        </td>
        <td style="padding:16px 22px;text-align:right;vertical-align:top;">
          <span style="display:inline-block;background:#FFFFFF;border-radius:8px;padding:5px 10px;font-family:'Courier New',monospace;font-size:13px;font-weight:700;color:${C.marronD};">${escHtml(ref)}</span>
        </td>
      </tr>
    </table>

    <div class="lsc-pad" style="padding:20px 22px 24px;">
      <p style="margin:0 0 4px;font-size:11px;color:${C.encre};opacity:0.6;">
        Reçu le <strong>${escHtml(dateSoumission)}</strong> à <strong>${escHtml(heureSoumission)}</strong>
      </p>

      ${actions ? `<div style="margin:14px 0 18px;">${actions}</div>` : ""}

      ${data.__pdfAttached ? pdfBanner(ref, true) : ""}

      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:${C.marron};font-weight:700;">
        📋 Détails de la demande
      </p>
      ${recapTable(fields, { compact: true })}

      <p style="margin:0;font-size:11px;color:${C.encre};opacity:0.55;line-height:1.5;">
        Relais automatique du site · penser à marquer la demande « Traitée » dans Google Sheets après réponse.
      </p>
    </div>
    ${footerBlock()}
  </div>`;

  const html = shell({ pageBg: C.parchemin, inner });

  const text = [
    `${typeBadge} — ${label}`,
    `Référence : ${ref}`,
    `Reçu le : ${dateSoumission} à ${heureSoumission}`,
    "",
    ...fields.map(([k, v]) => `${k} : ${String(v).replace(/<[^>]+>/g, "")}`),
    "",
    waHref ? `Répondre sur WhatsApp : ${waHref}` : "",
    data.__pdfAttached ? `📎 PDF joint : ticket ${ref}` : "",
  ]
    .filter((l) => l !== "")
    .join("\n");

  return { subject, html, text, attachments: [getLogoAttachment()] };
}

// =============================================================
// PDF récapitulatif (pièce jointe — généré par lib/pdf.js)
// =============================================================

async function buildPdfAttachment(type, data) {
  try {
    const { buildSubmissionPdf, pdfFilename } = await import("./pdf.js");
    const buffer = await buildSubmissionPdf(type, data);
    return {
      filename: pdfFilename(data.ref || data.reference || data.id || "CLB", type),
      content: buffer,
      contentType: "application/pdf",
    };
  } catch (e) {
    console.error("[mailer] pdf build failed", e?.message || e);
    return null;
  }
}

// =============================================================
// Envoi des deux mails (admin + client). PDF joint aux deux.
// =============================================================

export async function sendSubmissionMail(type, data) {
  if (MAIL_TO.length === 0) {
    throw new Error("MAIL_TO manquant (variables d'env serveur)");
  }

  const transport = getTransport();
  const pdfAttachment = await buildPdfAttachment(type, data);

  // Le PDF est annoncé NATIVEËMENT par les modèles (plus d'injection regex).
  const enriched = { ...data, __pdfAttached: !!pdfAttachment };

  const results = { admin: null, customer: null, pdfAttached: !!pdfAttachment };

  // --- Mail atelier (interne) ---
  const adminMail = buildAdminMail(type, enriched);
  const adminAttachments = [...(adminMail.attachments || [])];
  if (pdfAttachment) adminAttachments.push(pdfAttachment);
  const adminInfo = await transport.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO.join(", "),
    subject: adminMail.subject,
    text: adminMail.text,
    html: adminMail.html,
    attachments: adminAttachments,
  });
  results.admin = { messageId: adminInfo.messageId, recipients: MAIL_TO };

  // --- Mail cliente (si email fourni) ---
  const customerEmail = String(data.email || "").trim();
  if (customerEmail) {
    const clientMail = buildClientMail(type, enriched);
    const customerAttachments = [...(clientMail.attachments || [])];
    if (pdfAttachment) customerAttachments.push(pdfAttachment);
    const customerInfo = await transport.sendMail({
      from: MAIL_FROM,
      to: customerEmail,
      replyTo: MAIL_TO[0],
      subject: clientMail.subject,
      text: clientMail.text,
      html: clientMail.html,
      attachments: customerAttachments,
    });
    results.customer = { messageId: customerInfo.messageId, recipients: [customerEmail] };
  }

  return { ok: true, ...results };
}

/**
 * Test rapide que le SMTP est bien configuré.
 */
export async function verifySmtp() {
  const transport = getTransport();
  await transport.verify();
  return { ok: true };
}

/**
 * Envoi d'un mail "brut" — utilisé par /api/notify pour les broadcasts admin.
 * Sujet + texte brut (+ HTML optionnel) envoyés à MAIL_TO.
 */
export async function sendRawMail({ subject, text, html }) {
  if (!subject || !text) {
    throw new Error("sendRawMail: subject and text are required");
  }
  const transport = getTransport();
  const info = await transport.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO.join(", "),
    subject: String(subject).slice(0, 200),
    text: String(text),
    html: typeof html === "string" ? html : undefined,
  });
  return { messageId: info.messageId, recipients: MAIL_TO };
}
