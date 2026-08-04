/**
 * api/lib/mailer.js
 *
 * SMTP Gmail via nodemailer — envoi auto aux formulaires Colombes.
 *
 * Design :
 *  - Bloc en-tête "couture africaine" : couleurs du site (citron, orange, terre),
 *    logo / nom de l'atelier, liserés façon pagne tissé.
 *  - Bloc "Message de traitement" (côté destinataire) : "Votre demande est sous
 *    traitement, nous vous reviendrons sous 48h".
 *  - Bloc "NOTE ADMIN" (côté équipe) : "Veuillez lui répondre".
 *  - Tableau complet des informations saisies par le visiteur / client /
 *    postulant — tous les champs du formulaire sont listés explicitement
 *    pour qu'aucune information ne soit perdue.
 *
 * Profils traités :
 *  - formation  → "postulant·e"
 *  - precommande → "client·e"
 *  - contact    → "visiteur / visiteuse"
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
const ATELIER_SITE = process.env.ATELIER_SITE || "https://lesservicescolombes.vercel.app";
const ATELIER_LOGO_URL = process.env.ATELIER_LOGO_URL || `${ATELIER_SITE.replace(/\/$/, "")}/images/logo.webp`;

let _transport = null;
function getTransport() {
  if (_transport) return _transport;
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP_USER ou SMTP_PASS manquant");
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
// Utilitaires
// =============================================================

function escHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

/**
 * Reformule les valeurs brutes des <select> en libellés français propres.
 */
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
    }[v] || v || "—"
  );
}

/**
 * Profil destinataire (= contexte du formulaire côté client)
 *   - formation  → postulant
 *   - precommande → client·e
 *   - contact    → visiteur / visiteuse
 */
function profilFor(type) {
  if (type === "formation") return "postulant";
  if (type === "precommande") return "client";
  if (type === "contact") return "visiteur";
  return "visiteur";
}

// =============================================================
// Blocs HTML réutilisables (couleurs du site : #BFFF00 / #8FBF00 / #8B4513 / #E6F4FB)
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

/**
 * Mini-bande "pagne tissé" — SVG inline, universelle (Gmail, Outlook, Apple Mail).
 * Motif rayé façon wax/kente aux couleurs de l'atelier. Affichée en tête de chaque mail.
 */
function pagneBandSvg() {
  // Pattern de triangles/kentes en SVG inline. 28px de haut, 600px de large
  // (l'image est étirée par le `width="100%"` du conteneur <td>).
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 28" width="100%" height="28"
       preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
    <rect width="600" height="28" fill="#E6F4FB"/>
    <!-- Bandes colorées de fond -->
    <rect x="0"   y="0"  width="600" height="6"  fill="#BFFF00"/>
    <rect x="0"   y="6"  width="600" height="4"  fill="#8B4513"/>
    <rect x="0"   y="10" width="600" height="2"  fill="#8FBF00"/>
    <rect x="0"   y="12" width="600" height="2"  fill="#BFFF00"/>
    <rect x="0"   y="14" width="600" height="3"  fill="#8B4513"/>
    <rect x="0"   y="17" width="600" height="3"  fill="#5C2E0C"/>
    <rect x="0"   y="20" width="600" height="3"  fill="#BFFF00"/>
    <rect x="0"   y="23" width="600" height="3"  fill="#8FBF00"/>
    <rect x="0"   y="26" width="600" height="2"  fill="#000000"/>
    <!-- Motif de triangles façon kente — 12 cellules -->
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
    <!-- Petits points dorés sur le filet central -->
    <g fill="#BFFF00">
      ${Array.from({ length: 20 }, (_, i) => {
        const x = 12 + i * 30;
        return `<circle cx="${x}" cy="11" r="1.2"/>`;
      }).join("")}
    </g>
  </svg>`;
}

/**
 * Liseré "fil de couture" — utilisé en pied de mail, juste avant le footer.
 * SVG inline, 8px de haut : un trait ondulé façon point de couture.
 */
function threadStitchSvg() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 14" width="100%" height="14"
       preserveAspectRatio="xMidYMid slice" role="presentation" aria-hidden="true">
    <rect width="600" height="14" fill="#FFFFFF"/>
    <!-- Fil orange (point de couture) -->
    <path d="M0 7 Q 12 1 24 7 T 48 7 T 72 7 T 96 7 T 120 7 T 144 7 T 168 7 T 192 7 T 216 7 T 240 7 T 264 7 T 288 7 T 312 7 T 336 7 T 360 7 T 384 7 T 408 7 T 432 7 T 456 7 T 480 7 T 504 7 T 528 7 T 552 7 T 576 7 T 600 7"
          fill="none" stroke="#8B4513" stroke-width="1.6" stroke-linecap="round"/>
    <!-- Petits points verts par-dessus -->
    ${Array.from({ length: 40 }, (_, i) => {
      const x = 4 + i * 15;
      return `<circle cx="${x}" cy="7" r="1" fill="#8FBF00" opacity="0.85"/>`;
    }).join("")}
  </svg>`;
}

function headerBlock(logoCid = LOGO_CID) {
  const logoSrc = logoCid ? `cid:${logoCid}` : ATELIER_LOGO_URL;
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="padding:0;line-height:0;font-size:0;background:#E6F4FB;">${pagneBandSvg()}</td></tr>
  </table>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="background:linear-gradient(135deg,#E6F4FB 0%,#E6F4FB 100%);border-bottom:6px solid #BFFF00;">
    <tr>
      <td style="padding:28px 24px;text-align:center;">
        <div style="display:inline-flex;align-items:center;justify-content:center;width:76px;height:76px;border-radius:50%;background:#FFFFFF;border:3px solid #BFFF00;box-shadow:0 4px 14px rgba(0,0,0,0.08);overflow:hidden;">
          <img src="${escHtml(logoSrc)}" alt="${escHtml(ATELIER_NAME)}" style="display:block;width:100%;height:100%;object-fit:contain;" />
        </div>
        <p style="margin:14px 0 0;font-size:11px;letter-spacing:0.35em;text-transform:uppercase;color:#5C2E0C;font-weight:700;">
          ${escHtml(ATELIER_NAME)}
        </p>
        <h1 style="margin:6px 0 0;font-family:Georgia,'Playfair Display',serif;font-size:26px;color:#000000;font-weight:700;letter-spacing:-0.01em;">
          ${escHtml(ATELIER_NAME)}
        </h1>
        <p style="margin:6px 0 0;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#8FBF00;font-weight:600;">
          ${escHtml(ATELIER_TAGLINE)}
        </p>
      </td>
    </tr>
  </table>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr><td style="height:8px;background:#8B4513;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="height:6px;background:#BFFF00;font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td style="height:3px;background:#8FBF00;font-size:0;line-height:0;">&nbsp;</td></tr>
  </table>`;
}

function fieldRow(label, value, tone = "default") {
  const labelColor = tone === "ref" ? "#5C2E0C" : "#000000";
  return `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #B0DDF0;font-weight:600;color:${labelColor};width:36%;background:#E6F4FB;vertical-align:top;font-size:13px;">
        ${escHtml(label)}
      </td>
      <td style="padding:10px 14px;border-bottom:1px solid #B0DDF0;color:#3D2614;vertical-align:top;font-size:14px;">
        ${value}
      </td>
    </tr>`;
}

function footerBlock() {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="background:#000000;color:#B0DDF0;">
    <tr>
      <td style="padding:22px 24px;text-align:center;">
        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:16px;color:#BFFF00;">
          ${escHtml(ATELIER_NAME)}
        </p>
        <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#BFFF00;font-weight:600;">
          ${escHtml(ATELIER_TAGLINE)}
        </p>
        <p style="margin:0;font-size:13px;color:#B0DDF0;">
          📞 <a href="tel:${escHtml(ATELIER_PHONE.replace(/\s/g, ""))}" style="color:#BFFF00;text-decoration:none;font-weight:600;">${escHtml(ATELIER_PHONE)}</a>
          &nbsp;·&nbsp;
          <a href="tel:${escHtml(ATELIER_PHONE_2.replace(/\s/g, ""))}" style="color:#BFFF00;text-decoration:none;font-weight:600;">${escHtml(ATELIER_PHONE_2)}</a>
        </p>
        <p style="margin:6px 0 0;font-size:13px;color:#B0DDF0;">
          💬 <a href="https://wa.me/${escHtml(ATELIER_WA)}" style="color:#BFFF00;text-decoration:none;font-weight:600;">WhatsApp direct</a>
          &nbsp;·&nbsp;
          🌐 <a href="${escHtml(ATELIER_SITE)}" style="color:#BFFF00;text-decoration:none;font-weight:600;">${escHtml(ATELIER_SITE.replace(/^https?:\/\//, ""))}</a>
        </p>
        <p style="margin:10px 0 0;font-size:11px;color:#9A9A9A;">
          ${escHtml(ATELIER_LOCATION)}
        </p>
      </td>
    </tr>
  </table>`;
}

function adminNote(ref, roleLabel) {
  return `
  <div style="background:#E6F4FB;border:2px dashed #8B4513;border-radius:8px;padding:14px 16px;margin:0 0 20px;">
    <p style="margin:0 0 6px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#8B4513;font-size:11px;">
      ⚑ Note pour les admins
    </p>
    <p style="margin:0 0 4px;font-size:13px;color:#000000;">
      <strong>Nouvelle demande reçue</strong> de <strong>${escHtml(roleLabel)}</strong>.
      Référence : <code style="background:#FFFFFF;padding:2px 6px;border-radius:4px;border:1px solid #B0DDF0;font-size:12px;">${escHtml(ref)}</code>
    </p>
    <p style="margin:6px 0 0;font-size:13px;color:#3D2614;font-style:italic;">
      📩 <strong>Veuillez lui répondre</strong> dans les meilleurs délais
      (objectif interne : sous 24h ouvrées).
    </p>
  </div>`;
}

function processingNote(ref, recipientName) {
  return `
  <div style="background:#F0F8E0;border-left:4px solid #BFFF00;border-radius:8px;padding:14px 16px;margin:0 0 20px;">
    <p style="margin:0 0 4px;font-weight:700;color:#8FBF00;letter-spacing:0.08em;text-transform:uppercase;font-size:11px;">
      ✓ Demande bien reçue
    </p>
    <p style="margin:0;font-size:14px;color:#000000;line-height:1.5;">
      Bonjour <strong>${escHtml(recipientName)}</strong>, votre demande est bien enregistrée
      sous la référence
      <code style="background:#FFFFFF;padding:2px 6px;border-radius:4px;border:1px solid #BFFF00;font-size:12px;">${escHtml(ref)}</code>.
      <strong>Elle est en cours de traitement.</strong>
    </p>
    <p style="margin:8px 0 0;font-size:14px;color:#000000;line-height:1.5;">
      <strong>Nous vous reviendrons d'ici 48 heures</strong> (jours ouvrés).
    </p>
    <p style="margin:8px 0 0;font-size:12px;color:#3D2614;">
      En cas d'urgence :
      <a href="tel:${escHtml(ATELIER_PHONE.replace(/\s/g, ""))}" style="color:#8B4513;text-decoration:none;font-weight:600;">${escHtml(ATELIER_PHONE)}</a>
      ou
      <a href="https://wa.me/${escHtml(ATELIER_WA)}" style="color:#25D366;text-decoration:none;font-weight:600;">WhatsApp</a>.
    </p>
  </div>`;
}

/**
 * Bandeau "VOTRE NUMÉRO DE TICKET" bien visible — utilisé en haut du mail client.
 * Design : gros bloc coloré citron avec liseré orange, comme la charte du site.
 */
function ticketBanner(ref) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="margin:0 0 22px;border-collapse:separate;border-spacing:0;border-radius:12px;overflow:hidden;border:1px solid #BFFF00;">
    <tr>
      <td style="width:8px;background:#8B4513;font-size:0;line-height:0;">&nbsp;</td>
      <td style="background:linear-gradient(135deg,#F0F8E0 0%,#E5F5BE 100%);padding:18px 20px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8FBF00;font-weight:700;">
          🎫 Votre numéro de ticket
        </p>
        <p style="margin:0;font-family:'Courier New',Consolas,monospace;font-size:26px;font-weight:800;color:#000000;letter-spacing:0.04em;line-height:1.2;">
          ${escHtml(ref)}
        </p>
        <p style="margin:8px 0 0;font-size:12px;color:#3D2614;line-height:1.5;">
          📌 <strong>À conserver précieusement</strong> — à mentionner lors de tout échange
          (téléphone, WhatsApp, passage à l'atelier).
        </p>
      </td>
    </tr>
  </table>`;
}

/**
 * Pictos SVG inline (universels) — utilisés en tête de chaque étape.
 * Couleurs du site, traits épais pour rester lisibles sur 20x20px.
 * Index : 0 = carnet, 1 = ciseaux, 2 = bobine, 3 = aiguille+fil
 */
function stepIconSvg(index) {
  const strokes = "#8B4513";
  const accent = "#BFFF00";
  const wrap = (inner) => `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22"
         role="presentation" aria-hidden="true" style="vertical-align:-5px;margin-right:6px;">
      <rect x="0" y="0" width="24" height="24" rx="5" fill="#F0F8E0"/>
      ${inner}
    </svg>`;
  if (index === 0) {
    // Carnet de notes (consultation)
    return wrap(`
      <rect x="4" y="4" width="13" height="17" rx="2" fill="#FFFFFF" stroke="${strokes}" stroke-width="1.6"/>
      <rect x="6" y="8" width="9" height="1.2" fill="${strokes}"/>
      <rect x="6" y="11" width="9" height="1.2" fill="${strokes}"/>
      <rect x="6" y="14" width="6" height="1.2" fill="${strokes}"/>
      <circle cx="18" cy="18" r="3" fill="${accent}" stroke="${strokes}" stroke-width="1.4"/>
    `);
  }
  if (index === 1) {
    // Ciseaux ouverts
    return wrap(`
      <circle cx="5"  cy="6"  r="2.4" fill="none" stroke="${strokes}" stroke-width="1.6"/>
      <circle cx="5"  cy="18" r="2.4" fill="none" stroke="${strokes}" stroke-width="1.6"/>
      <path d="M7 7 L19 12 M7 17 L19 12" stroke="${strokes}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M19 12 L21 10 M19 12 L21 14" stroke="${strokes}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    `);
  }
  if (index === 2) {
    // Bobine de fil
    return wrap(`
      <ellipse cx="12" cy="7"  rx="6" ry="2" fill="#FFFFFF" stroke="${strokes}" stroke-width="1.4"/>
      <ellipse cx="12" cy="17" rx="6" ry="2" fill="#FFFFFF" stroke="${strokes}" stroke-width="1.4"/>
      <path d="M6 7 L6 17 M18 7 L18 17" stroke="${strokes}" stroke-width="1.4" fill="none"/>
      <path d="M8 9 Q12 11 16 9 M8 12 Q12 14 16 12 M8 15 Q12 17 16 15" stroke="${accent}" stroke-width="1.2" fill="none" opacity="0.9"/>
    `);
  }
  // index 3 — aiguille + fil
  return wrap(`
    <ellipse cx="12" cy="3" rx="2.2" ry="1.2" fill="${strokes}"/>
    <path d="M12 4 L12 21" stroke="${strokes}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M12 21 L10 19 M12 21 L14 19" stroke="${strokes}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M13 5 Q 20 8 19 16 Q 18 20 14 19" stroke="${accent}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  `);
}

/**
 * Bloc "Étapes suivantes" — rassure le client sur ce qui va se passer.
 * Chaque étape est préfixée par un picto SVG inline (carnet, ciseaux, bobine, aiguille).
 */
function nextSteps(type) {
  const formationSteps = [
    "Notre équipe examine votre candidature sous 48 heures ouvrées.",
    "Un échange (téléphone ou WhatsApp) est planifié pour préciser votre projet et votre niveau.",
    "Une proposition de planning + tarif vous est envoyée.",
    "Démarrage de la formation selon vos disponibilités.",
  ];
  const precommandeSteps = [
    "Notre équipe prend connaissance de votre projet sous 48 heures ouvrées.",
    "Un échange est planifié pour valider les détails (tissu, mesures, finitions).",
    "Un devis détaillé vous est envoyé avec les délais de confection.",
    "Lancement de la production après validation de votre devis.",
  ];
  const contactSteps = [
    "Notre équipe prend connaissance de votre message sous 48 heures ouvrées.",
    "Une réponse personnalisée vous est envoyée par mail ou téléphone.",
    "Si nécessaire, nous planifions un rendez-vous à l'atelier.",
  ];

  const steps =
    type === "formation" ? formationSteps :
    type === "precommande" ? precommandeSteps :
    contactSteps;

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="margin:0 0 22px;border-collapse:collapse;border:1px solid #B0DDF0;border-radius:8px;overflow:hidden;">
    <tr>
      <td style="padding:14px 18px;background:#E6F4FB;border-bottom:1px solid #B0DDF0;">
        <p style="margin:0;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8FBF00;font-weight:700;">
          📋 Les étapes suivantes
        </p>
      </td>
    </tr>
    ${steps.map((step, i) => `
      <tr>
        <td style="padding:10px 18px;border-bottom:1px solid #B0DDF0;font-size:14px;color:#000000;line-height:1.6;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr>
              <td style="width:30px;vertical-align:top;padding-top:1px;">${stepIconSvg(i)}</td>
              <td style="vertical-align:top;">
                <strong style="color:#8B4513;">${i + 1}.</strong> ${escHtml(step)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `).join("")}
  </table>`;
}

/**
 * Bloc signature "Maman Colombe" — touche manuscrite Caveat, chaleur humaine.
 * Affiché juste avant le footer, uniquement dans le mail CLIENT.
 * Le bloc utilise un fallback font-family (Caveat -> cursive) pour les
 * clients mail qui ne chargent pas Google Fonts.
 */
function mamanColombeSignature(recipientName) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
         style="margin:0 0 18px;border-collapse:collapse;">
    <tr>
      <td style="padding:18px 18px 14px;background:#FFFFFF;border:1px dashed #BFFF00;border-radius:10px;text-align:center;">
        <p style="margin:0 0 4px;font-family:'Caveat','Bradley Hand','Comic Sans MS',cursive;font-size:26px;line-height:1.15;color:#5C2E0C;font-weight:700;">
          À très vite, ${escHtml(recipientName)} 🤍
        </p>
        <p style="margin:8px 0 0;font-family:Georgia,'Playfair Display',serif;font-style:italic;font-size:14px;color:#3D2614;line-height:1.5;">
          On prend soin de votre demande comme on prendrait soin<br/>
          d'un tissu précieux — patience et douceur.
        </p>
        <p style="margin:14px 0 0;font-family:'Caveat','Bradley Hand','Comic Sans MS',cursive;font-size:22px;color:#8B4513;font-weight:700;">
          — Maman Colombe 🪡
        </p>
      </td>
    </tr>
  </table>`;
}

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

function buildSubmissionCore(type, data) {
  const ref = data.ref || "—";
  const profil = profilFor(type);
  const { submittedAt, dateSoumission, heureSoumission } = submittedAtInfo(data);
  const recipientName = customerNameFor(type, data);

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
      ["Téléphone", data.telephone ? `<a href="tel:${escHtml(data.telephone)}" style="color:#8B4513;text-decoration:none;font-weight:600;">${escHtml(data.telephone)}</a>` : "—"],
      ["Email", data.email ? `<a href="mailto:${escHtml(data.email)}" style="color:#8B4513;text-decoration:none;font-weight:600;">${escHtml(data.email)}</a>` : "—"],
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
      ["Téléphone", data.telephone ? `<a href="tel:${escHtml(data.telephone)}" style="color:#8B4513;text-decoration:none;font-weight:600;">${escHtml(data.telephone)}</a>` : "—"],
      ["Email", data.email ? `<a href="mailto:${escHtml(data.email)}" style="color:#8B4513;text-decoration:none;font-weight:600;">${escHtml(data.email)}</a>` : "—"],
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
      ["Email", data.email ? `<a href="mailto:${escHtml(data.email)}" style="color:#8B4513;text-decoration:none;font-weight:600;">${escHtml(data.email)}</a>` : "—"],
      ["Téléphone", data.telephone ? `<a href="tel:${escHtml(data.telephone)}" style="color:#8B4513;text-decoration:none;font-weight:600;">${escHtml(data.telephone)}</a>` : "—"],
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
      ...Object.entries(data).map(([k, v]) => [escHtml(k), typeof v === "object" ? escHtml(JSON.stringify(v)) : escHtml(String(v ?? "—"))]),
    ];
  }

  return { ref, profil, recipientName, subject, label, intro, fields, submittedAt, dateSoumission, heureSoumission };
}

function buildClientMail(type, data) {
  const { ref, recipientName, fields, dateSoumission, heureSoumission } = buildSubmissionCore(type, data);
  const clientLabel =
    type === "formation" ? "Votre candidature a bien été reçue" :
    type === "precommande" ? "Votre pré-commande a bien été reçue" :
    type === "contact" ? "Votre message a bien été reçu" :
    "Votre demande a bien été reçue";
  const clientSubject = `✅ ${clientLabel} — Ticket n° ${ref}`;

  // Pour le mail client : on filtre pour ne pas afficher les champs admin-only
  // (sessionId, source technique, etc.) tout en gardant TOUT ce que le client a saisi.
  const ADMIN_ONLY = new Set(["sessionId", "source", "Page", "Session"]);
  const clientFields = fields.filter(([label]) => {
    const l = String(label).trim();
    return !ADMIN_ONLY.has(l);
  });

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escHtml(clientSubject)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap">
  <style>
    /* La signature manuscrite utilise Caveat — fallback cursive pour clients sans web fonts. */
    .lsc-signature { font-family: 'Caveat','Bradley Hand','Comic Sans MS',cursive; }
    @media only screen and (max-width: 480px) {
      .lsc-pad { padding: 22px 18px !important; }
      .lsc-h1 { font-size: 22px !important; }
      .lsc-mob-stack > tbody > tr > td { display: block !important; width: 100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#E6F4FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#000000;">
  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.06);">
    ${headerBlock(LOGO_CID)}
    <div class="lsc-pad" style="padding:28px 24px;background:#FFFFFF;">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#8B4513;font-weight:700;">
        🎫 Ticket n° ${escHtml(ref)}
      </p>
      <h1 class="lsc-h1" style="margin:0 0 10px;font-family:Georgia,'Playfair Display',serif;font-size:24px;color:#000000;font-weight:700;line-height:1.25;">
        ${escHtml(clientLabel)}
      </h1>
      <p style="margin:0 0 22px;color:#3D2614;line-height:1.55;font-size:15px;">
        Bonjour <strong style="color:#000000;">${escHtml(recipientName)}</strong>, nous vous confirmons
        la bonne réception de votre demande. <strong>Elle est entre de bonnes mains</strong> —
        voici votre récapitulatif.
      </p>

      ${ticketBanner(ref)}

      ${processingNote(ref, recipientName)}

      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8FBF00;font-weight:700;">
        📝 Récapitulatif de votre demande
      </p>
      <p style="margin:0 0 12px;font-size:12px;color:#3D2614;">
        Envoyé le <strong>${escHtml(dateSoumission)}</strong> à <strong>${escHtml(heureSoumission)}</strong>
      </p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
             style="border-collapse:collapse;border:1px solid #B0DDF0;border-radius:8px;overflow:hidden;margin:0 0 22px;">
        ${clientFields.map(([k, v, tone]) => fieldRow(k, v, tone)).join("")}
      </table>

      ${nextSteps(type)}

      <div style="background:#FFF8E5;border:1px solid #FFE4A8;border-radius:8px;padding:14px 16px;margin:0 0 20px;">
        <p style="margin:0 0 4px;font-size:13px;color:#000000;">
          📎 <strong>Un récapitulatif PDF est joint à ce mail.</strong>
        </p>
        <p style="margin:0;font-size:12px;color:#3D2614;line-height:1.5;">
          Vous pouvez l'imprimer ou le conserver pour votre archive personnelle.
          Il contient votre ticket et l'ensemble des informations transmises.
        </p>
      </div>

      <p style="margin:0 0 18px;font-size:13px;color:#3D2614;line-height:1.6;">
        Pour toute question, répondez simplement à ce mail — votre ticket
        <strong style="color:#000000;">${escHtml(ref)}</strong> sera automatiquement reconnu
        par notre équipe. Ou contactez-nous au
        <a href="tel:${escHtml(ATELIER_PHONE.replace(/\s/g, ""))}" style="color:#8B4513;text-decoration:none;font-weight:600;">${escHtml(ATELIER_PHONE)}</a>.
      </p>

      ${mamanColombeSignature(recipientName)}
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="padding:0;line-height:0;font-size:0;background:#FFFFFF;">${threadStitchSvg()}</td></tr>
    </table>
    ${footerBlock()}
  </div>
</body>
</html>`;

  const text = [
    `[${ATELIER_NAME}] ${clientLabel}`,
    clientSubject,
    "",
    `Bonjour ${recipientName},`,
    "",
    "✓ Votre demande a bien été reçue.",
    "",
    "🎫 VOTRE NUMÉRO DE TICKET",
    `   ${ref}`,
    "   À conserver et mentionner lors de tout échange.",
    "",
    `Envoyé le : ${dateSoumission} à ${heureSoumission}`,
    "",
    "--- RÉCAPITULATIF DE VOTRE DEMANDE ---",
    ...clientFields.map(([k, v]) => `${k}: ${String(v).replace(/<[^>]+>/g, "")}`),
    "",
    "--- LES ÉTAPES SUIVANTES ---",
    ...(type === "formation" ? [
      "1. Notre équipe examine votre candidature sous 48 heures ouvrées.",
      "2. Un échange (téléphone ou WhatsApp) est planifié.",
      "3. Une proposition de planning + tarif vous est envoyée.",
      "4. Démarrage de la formation selon vos disponibilités.",
    ] : type === "precommande" ? [
      "1. Notre équipe prend connaissance de votre projet sous 48 heures ouvrées.",
      "2. Un échange est planifié pour valider les détails.",
      "3. Un devis détaillé vous est envoyé.",
      "4. Production lancée après validation du devis.",
    ] : [
      "1. Notre équipe prend connaissance de votre message sous 48 heures ouvrées.",
      "2. Une réponse personnalisée vous est envoyée.",
      "3. Si besoin, nous planifions un rendez-vous.",
    ]),
    "",
    "📎 Un récapitulatif PDF est joint à ce mail.",
    "",
    "Contact :",
    `  ${ATELIER_PHONE} / ${ATELIER_PHONE_2}`,
    `  WhatsApp : https://wa.me/${ATELIER_WA}`,
    `  ${ATELIER_LOCATION}`,
    `  ${ATELIER_SITE}`,
  ].join("\n");

  return { subject: clientSubject, html, text, attachments: [getLogoAttachment()] };
}

function buildAdminMail(type, data) {
  const { ref, profil, recipientName, subject, label, intro, fields, submittedAt } = buildSubmissionCore(type, data);

  const html = `<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${escHtml(subject)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap">
  <style>
    .lsc-signature { font-family: 'Caveat','Bradley Hand','Comic Sans MS',cursive; }
    @media only screen and (max-width: 480px) {
      .lsc-pad { padding: 22px 18px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#E6F4FB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#000000;">
  <div style="max-width:640px;margin:0 auto;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.06);">
    ${headerBlock(LOGO_CID)}
    <div class="lsc-pad" style="padding:28px 24px;background:#FFFFFF;">
      ${adminNote(ref, profil)}
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#8B4513;font-weight:700;">${escHtml(label)}</p>
      <h2 style="margin:0 0 16px;font-family:Georgia,'Playfair Display',serif;font-size:20px;color:#000000;font-weight:700;line-height:1.3;">${escHtml(subject)}</h2>
      <p style="margin:0 0 20px;color:#3D2614;line-height:1.55;font-size:14px;">${escHtml(intro)}</p>
      <p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#8FBF00;font-weight:700;">Détail des informations saisies</p>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;border:1px solid #B0DDF0;border-radius:8px;overflow:hidden;">
        ${fields.map(([k, v, tone]) => fieldRow(k, v, tone)).join("")}
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;border-top:1px dashed #B0DDF0;padding-top:12px;">
        <tr>
          <td style="font-size:12px;color:#8A8A8A;padding-top:10px;">
            <strong style="color:#000000;">Reçu le</strong>
            ${escHtml(new Date(submittedAt).toLocaleString("fr-FR", { timeZone: "Africa/Porto-Novo", dateStyle: "full", timeStyle: "short" }))}
            &nbsp;·&nbsp;
            <strong style="color:#000000;">Source</strong> ${escHtml(data.source || "site")}
            ${data.path ? `&nbsp;·&nbsp;<strong style="color:#000000;">Page</strong> ${escHtml(data.path)}` : ""}
            ${data.sessionId ? `&nbsp;·&nbsp;<strong style="color:#000000;">Session</strong> ${escHtml(data.sessionId)}` : ""}
          </td>
        </tr>
      </table>
      <p class="lsc-signature" style="margin:18px 0 0;font-size:20px;color:#8B4513;text-align:right;">
        — Maman Colombe 🪡
      </p>
    </div>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr><td style="padding:0;line-height:0;font-size:0;background:#FFFFFF;">${threadStitchSvg()}</td></tr>
    </table>
    ${footerBlock()}
  </div>
  <p style="text-align:center;margin:16px 0 0;font-size:11px;color:#8A8A8A;">
    Email automatique envoyé par le système de suivi — ${escHtml(ATELIER_NAME)}
  </p>
</body>
</html>`;

  const text = [
    `[${ATELIER_NAME}] ${label}`,
    subject,
    "",
    `[Profil destinataire] ${profil}`,
    `Nouvelle demande reçue de ${recipientName}`,
    `Référence : ${ref}`,
    "",
    "--- DÉTAIL DES INFORMATIONS SAISIES ---",
    ...fields.map(([k, v]) => `${k}: ${String(v).replace(/<[^>]+>/g, "")}`),
    "",
    "Contact :",
    `  ${ATELIER_PHONE} / ${ATELIER_PHONE_2}`,
    `  WhatsApp : https://wa.me/${ATELIER_WA}`,
    `  ${ATELIER_LOCATION}`,
  ].join("\n");

  return { subject, html, text, attachments: [getLogoAttachment()] };
}

// =============================================================
// API publique
// =============================================================

/**
 * Construit la pièce jointe PDF pour un envoi mail.
 * Retourne null si le PDF ne peut pas être généré (erreur silencieuse, on n'empêche
 * pas l'envoi du mail).
 */
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

/**
 * Envoie deux mails séparés :
 *  - au client / soumetteur si une adresse e-mail existe
 *  - à l'équipe admin via MAIL_TO
 *
 * Les deux mails reçoivent le PDF récapitulatif en pièce jointe.
 */
export async function sendSubmissionMail(type, data) {
  if (MAIL_TO.length === 0) {
    throw new Error("MAIL_TO manquant (variables d'env serveur)");
  }

  const transport = getTransport();
  const pdfAttachment = await buildPdfAttachment(type, data);
  const results = { admin: null, customer: null, pdfAttached: !!pdfAttachment };

  // --- Mail admin ---
  const adminMail = buildAdminMail(type, data);
  const adminAttachments = [...(adminMail.attachments || [])];
  if (pdfAttachment) {
    adminAttachments.push(pdfAttachment);
    // Bandeau "PDF joint" dans le mail admin
    //
    // IMPORTANT : on insère UNIQUEMENT un <p> juste avant le second <table>
    // (le bloc "Reçu le ..."). On ne réouvre PAS un nouveau <table> ici,
    // car sinon le second <table> du template (ligne ~790) se retrouve
    // refermé par le </table> de notre replace, et le <table> qu'on ouvre
    // n'a jamais de </table> de fermeture. Gmail "répare" alors en mangeant
    // tout le contenu entre les deux et n'affiche que la queue d'attribut
    // style — d'où le déchet "#B0DDF0;padding-top:12px;"> visible en haut
    // du mail admin.
    //
    // On remplace la balise <table ...> ENTIÈRE (jusqu'au '>') par
    // `${pdfBanner}<table ...>` reconstruite proprement, pour éviter tout
    // risque de doublon d'attribut style si le `[^>]*` du regex
    // consomme mal la balise d'origine.
    const pdfBanner = `<p style="margin:18px 0 0;padding:10px 14px;background:#F0F8E0;border-left:4px solid #BFFF00;border-radius:6px;font-size:13px;color:#000000;">📎 <strong>PDF récapitulatif joint</strong> — Ticket <code style="background:#FFFFFF;padding:2px 6px;border-radius:4px;font-family:monospace;">${escHtml(data.ref || "")}</code></p>`;
    adminMail.html = adminMail.html.replace(
      /<table role="presentation"[^>]*style="margin-top:24px;border-top:1px dashed[^>]*>/s,
      `${pdfBanner}<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:24px;border-top:1px dashed #B0DDF0;padding-top:12px;">`,
    );
    adminMail.text += `\n\n📎 PDF récapitulatif joint : ${pdfAttachment.filename}\n`;
  }
  const adminInfo = await transport.sendMail({
    from: MAIL_FROM,
    to: MAIL_TO.join(", "),
    subject: adminMail.subject,
    text: adminMail.text,
    html: adminMail.html,
    attachments: adminAttachments,
  });
  results.admin = { messageId: adminInfo.messageId, recipients: MAIL_TO };

  // --- Mail client (soumetteur) ---
  const customerEmail = String(data.email || "").trim();
  if (customerEmail) {
    const clientMail = buildClientMail(type, data);
    const customerAttachments = [...(clientMail.attachments || [])];
    if (pdfAttachment) customerAttachments.push(pdfAttachment);
    const customerInfo = await transport.sendMail({
      from: MAIL_FROM,
      to: customerEmail,
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
