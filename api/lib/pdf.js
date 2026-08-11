/**
 * api/lib/pdf.js
 *
 * ════════════════════════════════════════════════════════════════════
 *  TICKET « PATRON ROSE » — refonte intégrale (août 2026)
 * ════════════════════════════════════════════════════════════════════
 *
 * Génère le PDF-récapitulatif remis à chaque cliente après un formulaire.
 * Une seule page A4, identité de la maison : noir charbon, marron, blanc,
 * rouge colombe, ROSE POUDRÉ et fil d'or — zéro vert, zéro bleu.
 *
 *   ✂  Cadre « patron à découper » en pointillés dorés + ciseaux
 *   🌸 Bandeau d'en-tête rose poudré, badge logo, bande tissée 3 fils
 *   🎟  Coupon-ticket perforé à droite (référence en Playfair rouge)
 *   🧷 Détails en deux colonnes, surlignés de pointillés rose
 *   🪡 Étapes numérotées sur carrés rouge colombe
 *   ✍  Signature manuscrite Caveat « — Maman Colombe » + aiguille au fil rouge
 *   🌺 Filigrane de la référence en rose pâle
 *
 * Polices de marque : embarquées en base64 dans `api/lib/fonts.js`
 * (Playfair Display + Caveat — vrais TTF, jamais de fetch réseau).
 * Logo : embarqué dans `api/lib/logo.js`.
 * Sortie : Buffer (pièce jointe nodemailer) + base64 (front).
 *
 * Stack : `pdf-lib` + `fontkit` (léger, pure JS, parfait pour Vercel).
 */

import { createRequire } from "node:module";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { LOGO_PNG_BUFFER } from "./logo.js";
import { FONTS } from "./fonts.js";

// fontkit est en CJS — interop explicite (fonctionne en lambda Vercel ET en local)
const require = createRequire(import.meta.url);
let fontkit = null;
try {
  fontkit = require("fontkit");
} catch {
  fontkit = null; // secours : polices standard uniquement
}

// =============================================================
// Identité de la maison (env, avec défauts sûrs)
// =============================================================

let _logoFailed = false;
const _logoEmbedCache = new WeakMap();

async function getLogoPng(pdf) {
  if (_logoFailed) return null;
  const cached = _logoEmbedCache.get(pdf);
  if (cached) return cached;
  try {
    const embedded = await pdf.embedPng(LOGO_PNG_BUFFER);
    _logoEmbedCache.set(pdf, embedded);
    return embedded;
  } catch {
    _logoFailed = true;
    return null;
  }
}

const ATELIER_NAME = process.env.ATELIER_NAME || "Les Services Colombes";
const ATELIER_TAGLINE =
  process.env.ATELIER_TAGLINE || "Atelier · Mercerie · Centre de Formation";
const ATELIER_PHONE = process.env.ATELIER_PHONE || "+229 01 67 40 94 08";
const ATELIER_PHONE_2 = process.env.ATELIER_PHONE_2 || "+229 01 95 76 36 01";
const ATELIER_WA = process.env.ATELIER_WA || "2290167409408";
const ATELIER_LOCATION =
  process.env.ATELIER_LOCATION ||
  "Devant l'école primaire publique TOKPOTA DAVO GROUPE ABC, Porto-Novo – Bénin";

// =============================================================
// Palette — NOIR · MARRON · BLANC · ROUGE COLOMBE · ROSE · OR
// =============================================================

const C = {
  ink: rgb(11 / 255, 11 / 255, 18 / 255),       // #0B0B12 noir charbon
  inkSoft: rgb(61 / 255, 38 / 255, 20 / 255),   // #3D2614 brun sombre
  paper: rgb(1, 1, 1),                          // #FFFFFF blanc
  rosePaper: rgb(251 / 255, 233 / 255, 237 / 255), // #FBE9ED rose poudré
  roseLine: rgb(239 / 255, 201 / 255, 209 / 255),  // #EFC9D1 lignes rose
  roseDeep: rgb(178 / 255, 90 / 255, 106 / 255),   // #B25A6A rose profond
  roseMist: rgb(244 / 255, 205 / 255, 213 / 255),  // #F4CDD5 filigrane rose
  rouge: rgb(209 / 255, 35 / 255, 42 / 255),    // #D1232A rouge colombe
  rougeD: rgb(163 / 255, 19 / 255, 34 / 255),   // #A31322 rouge foncé
  marron: rgb(139 / 255, 69 / 255, 19 / 255),   // #8B4513 marron
  marronD: rgb(92 / 255, 46 / 255, 12 / 255),   // #5C2E0C marron foncé
  gold: rgb(201 / 255, 168 / 255, 124 / 255),   // #C9A87C fil d'or
  goldD: rgb(155 / 255, 122 / 255, 82 / 255),   // #9B7A52 or patiné
};

// =============================================================
// Helpers typographie
// =============================================================

function sanitize(s) {
  if (s === null || s === undefined) return "—";
  const str = String(s);
  return (
    str
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
      .replace(/[\u{2700}-\u{27BF}]/gu, "")
      .replace(/[<>]/g, "")
      .trim() || "—"
  );
}

function safeLines(text, max = 70) {
  if (!text) return ["—"];
  const s = sanitize(text);
  const out = [];
  let line = "";
  for (const word of s.split(/\s+/)) {
    if ((line + " " + word).trim().length <= max) {
      line = (line + " " + word).trim();
    } else {
      if (line) out.push(line);
      line = word;
    }
  }
  if (line) out.push(line);
  return out.length ? out : ["—"];
}

/** Largeur d'un texte avec inter-lettrage. */
function trackWidth(font, text, size, tracking) {
  let w = 0;
  for (const ch of text) w += font.widthOfTextAtSize(ch, size) + tracking;
  return text.length ? w - tracking : 0;
}

/** Texte « caps espacées » façon raccommodage de luxe. */
function drawTracked(page, text, { x, y, size, font, color, tracking = 0.6, centerAt = null, rightAt = null }) {
  const total = trackWidth(font, text, size, tracking);
  let sx = x;
  if (centerAt !== null) sx = centerAt - total / 2;
  else if (rightAt !== null) sx = rightAt - total;
  let cx = sx;
  for (const ch of text) {
    page.drawText(ch, { x: cx, y, size, font, color });
    cx += font.widthOfTextAtSize(ch, size) + tracking;
  }
  return total;
}

// =============================================================
// Mapping valeurs -> libellés (cohérent avec mailer.js)
// =============================================================

const DISPO_LABELS = {
  matin: "Matin",
  apresmidi: "Après-midi",
  soir: "Soir",
  weekend: "Week-end",
};

function formatDispo(dispo) {
  if (!Array.isArray(dispo) || dispo.length === 0) return "—";
  return dispo.map((d) => DISPO_LABELS[d] || d).join(", ");
}

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

function labelType(v) {
  return (
    {
      formation: "Candidature formation",
      precommande: "Pré-commande",
      contact: "Message de contact",
    }[v] || v || "Demande"
  );
}

function profilFor(type) {
  if (type === "formation") return "Postulant·e";
  if (type === "precommande") return "Client·e";
  if (type === "contact") return "Visiteur·euse";
  return "Visiteur·euse";
}

// Texte court des étapes suivantes — utilisé dans le PDF.
function nextStepsFor(type) {
  if (type === "formation") {
    return [
      "Examen de votre candidature sous 48 heures ouvrées.",
      "Échange par téléphone ou WhatsApp pour préciser votre projet.",
      "Envoi d'une proposition de planning et de tarif.",
    ];
  }
  if (type === "precommande") {
    return [
      "Étude de votre projet sous 48 heures ouvrées.",
      "Échange pour valider tissu, mesures et finitions.",
      "Envoi d'un devis détaillé avec les délais de confection.",
    ];
  }
  return [
    "Lecture de votre message sous 48 heures ouvrées.",
    "Réponse personnalisée par mail ou téléphone.",
    "Si besoin, planification d'un rendez-vous à l'atelier.",
  ];
}

// =============================================================
// Champs affichés selon le type
// =============================================================

function fieldsFor(type, data) {
  if (type === "formation") {
    return [
      ["Nom complet", `${sanitize(data.prenom)} ${sanitize(data.nom)}`.trim() || "—"],
      ["Âge", data.age ? `${data.age} ans` : "—"],
      ["Téléphone", sanitize(data.telephone)],
      ["Email", sanitize(data.email)],
      ["Niveau actuel", labelNiveau(data.niveau_actuel)],
      ["Formation choisie", labelFormationChoisie(data.formation_choisie)],
      ["Disponibilités", formatDispo(data.disponibilite)],
      ["Motivation", sanitize(data.motivation)],
      ["Mode de paiement", sanitize(data.motif_paiement)],
    ];
  }
  if (type === "precommande") {
    return [
      ["Nom complet", sanitize(data.nom)],
      ["Téléphone", sanitize(data.telephone)],
      ["Email", sanitize(data.email)],
      ["Type de tenue", sanitize(data.type_tenue)],
      ["Précision (autre)", sanitize(data.tenue_autre)],
      ["Couleur préférée", sanitize(data.couleur_preferee)],
      ["Taille", sanitize(data.taille)],
      ["Date souhaitée", sanitize(data.date_souhaitee)],
      ["Budget estimé", sanitize(data.budget)],
      ["Description du projet", sanitize(data.description)],
      ["Mesures fournies", sanitize(data.mesures)],
    ];
  }
  if (type === "contact") {
    return [
      ["Nom", sanitize(data.nom)],
      ["Email", sanitize(data.email)],
      ["Téléphone", sanitize(data.telephone)],
      ["Sujet", labelSujet(data.sujet)],
      ["Message", sanitize(data.message)],
    ];
  }
  return Object.entries(data).map(([k, v]) => [
    sanitize(k),
    sanitize(typeof v === "object" ? JSON.stringify(v) : String(v ?? "—")),
  ]);
}

// =============================================================
// Polices de marque (embarquées, zéro réseau)
// =============================================================

async function getBrandFonts(pdf) {
  const helvetica = await pdf.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fallback = { display: helveticaBold, quote: helvetica, script: helvetica, text: helvetica, bold: helveticaBold };
  if (!fontkit) return fallback;
  try {
    pdf.registerFontkit(fontkit);
  } catch {
    return fallback;
  }
  try {
    const display = await pdf.embedFont(FONTS.playfairBold);
    const quote = await pdf.embedFont(FONTS.playfairItalic);
    const script = await pdf.embedFont(FONTS.caveatBold);
    return { display, quote, script, text: helvetica, bold: helveticaBold };
  } catch {
    return fallback;
  }
}

// =============================================================
// Rendu bas-niveau : helpers de « paint »
// =============================================================

function rect(page, x, y, w, h, color) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

function centerText(page, text, cx, y, { size, font, color }) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, { x: cx - w / 2, y, size, font, color });
}

/**
 * Aiguille + fil — vectoriel pur. Ancrée par le chas (x, y).
 * Aiguille marron, fil rouge colombe qui ondule : la signature de la maison.
 */
function drawNeedleAndThread(page, { x, y, size = 36, color = C.marron, threadColor = C.rouge }) {
  const angle = -Math.PI / 4;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  const eyeX = x;
  const eyeY = y;
  const tipX = x + cos * size;
  const tipY = y + sin * size;

  const eyeRX = size * 0.10;
  const eyeRY = size * 0.30;
  page.drawEllipse({
    x: eyeX,
    y: eyeY,
    xScale: eyeRX,
    yScale: eyeRY,
    rotate: { type: "degrees", angle: (angle * 180) / Math.PI },
    color: C.paper,
    borderColor: color,
    borderWidth: 1.4,
  });

  page.drawLine({
    start: { x: eyeX, y: eyeY },
    end: { x: tipX, y: tipY },
    thickness: 2.0,
    color,
  });

  const t = 4.5;
  const tx1 = tipX - cos * t - sin * t * 0.55;
  const ty1 = tipY - sin * t + cos * t * 0.55;
  const tx2 = tipX - cos * t + sin * t * 0.55;
  const ty2 = tipY - sin * t - cos * t * 0.55;
  page.drawLine({ start: { x: tipX, y: tipY }, end: { x: tx1, y: ty1 }, thickness: 1.6, color });
  page.drawLine({ start: { x: tipX, y: tipY }, end: { x: tx2, y: ty2 }, thickness: 1.6, color });

  const filStartX = eyeX - cos * eyeRY;
  const filStartY = eyeY - sin * eyeRY;
  const segments = 18;
  const filLen = size * 1.3;
  const amp = 2.6;
  const filAngle = -Math.PI / 6;
  const fcos = Math.cos(filAngle);
  const fsin = Math.sin(filAngle);
  let prevX = filStartX;
  let prevY = filStartY;
  for (let i = 1; i <= segments; i++) {
    const t2 = i / segments;
    const nextX = filStartX + fcos * filLen * t2;
    const nextY = filStartY + fsin * filLen * t2 + Math.sin(t2 * Math.PI * 2.4) * amp;
    page.drawLine({
      start: { x: prevX, y: prevY },
      end: { x: nextX, y: nextY },
      thickness: 1.2,
      color: threadColor,
    });
    prevX = nextX;
    prevY = nextY;
  }
}

/** Petits ciseaux vectoriels (bord de patron / ligne de coupe). */
function drawScissorsAt(page, cx, cy, color = C.goldD, s = 7, arm = 11) {
  page.drawCircle({ x: cx - s / 2, y: cy - s / 2 - 3, size: 2.6, borderColor: color, borderWidth: 1 });
  page.drawCircle({ x: cx + s / 2, y: cy - s / 2 - 3, size: 2.6, borderColor: color, borderWidth: 1 });
  page.drawLine({ start: { x: cx - s / 2, y: cy - s / 2 - 1 }, end: { x: cx + arm * 0.55, y: cy + arm }, thickness: 1.1, color });
  page.drawLine({ start: { x: cx + s / 2, y: cy - s / 2 - 1 }, end: { x: cx - arm * 0.55, y: cy + arm }, thickness: 1.1, color });
}

/** Bande tissée 3 fils — signature pagne de la maison (haut et bas de page). */
function drawWovenBand(page, width, yTop) {
  rect(page, 0, yTop, width, 1.7, C.rouge);
  rect(page, 0, yTop - 2.4, width, 1.1, C.gold);
  rect(page, 0, yTop - 4.2, width, 1.3, C.marron);
}

/**
 * Signature « Maman Colombe » manuscrite + aiguille au fil rouge.
 */
function drawMamanColombeSignature(page, { x, y, width, fonts, recipientName, rightBlock }) {
  const lineY = y;
  const nameX = x;
  const nameSize = 30;
  const nameText = `— Maman Colombe`;
  page.drawText(nameText, {
    x: nameX,
    y: lineY,
    size: nameSize,
    font: fonts.script,
    color: C.marronD,
  });

  const needleSize = 40;
  const nameWidth = fonts.script.widthOfTextAtSize(nameText, nameSize);
  drawNeedleAndThread(page, {
    x: nameX + nameWidth + 20,
    y: lineY + 8,
    size: needleSize,
    color: C.marron,
    threadColor: C.rouge,
  });

  if (recipientName) {
    page.drawText(`Pour ${sanitize(recipientName)},`, {
      x: nameX + 2,
      y: lineY + 24,
      size: 11,
      font: fonts.quote,
      color: C.roseDeep,
    });
  }

  if (rightBlock && Array.isArray(rightBlock.lines) && rightBlock.lines.length) {
    const blockX = rightBlock.x !== undefined ? rightBlock.x : x + width * 0.60;
    let blockY = lineY + 12;
    if (rightBlock.title) {
      page.drawText(rightBlock.title, {
        x: blockX,
        y: blockY,
        size: 8.8,
        font: fonts.bold,
        color: C.goldD,
      });
      blockY -= 13;
    }
    for (const ln of rightBlock.lines) {
      page.drawText(ln, {
        x: blockX,
        y: blockY,
        size: 9.6,
        font: fonts.quote,
        color: C.roseDeep,
      });
      blockY -= 12.5;
    }
  }
}

// =============================================================
// GÉNÉRATION DU TICKET — « PATRON ROSE »
// =============================================================

export async function buildSubmissionPdf(type, data) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${labelType(type)} — ${ATELIER_NAME}`);
  pdf.setAuthor(ATELIER_NAME);
  pdf.setSubject("Récapitulatif de votre demande");
  pdf.setCreator("Les Services Colombes — Atelier de Couture");

  const fonts = await getBrandFonts(pdf);
  const logoPng = await getLogoPng(pdf);

  // Page A4 unique
  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const M = 48; // marge maison

  // ========== ✂ CADRE « PATRON À DÉCOUPER » ==========
  const FRAME_INSET = 15;
  page.drawRectangle({
    x: FRAME_INSET,
    y: FRAME_INSET,
    width: width - FRAME_INSET * 2,
    height: height - FRAME_INSET * 2,
    borderColor: C.gold,
    borderWidth: 1.1,
    borderDashArray: [7, 4],
  });
  // Ciseaux vectoriels sur le bord gauche, à mi-hauteur
  drawScissorsAt(page, FRAME_INSET, Math.round(height / 2));

  // ========== 🌸 EN-TÊTE ROSE POUDRÉ ==========
  drawWovenBand(page, width, height - 5);

  const headerTop = height - 9.5;
  const headerH = 100;
  const headerBottom = headerTop - headerH;
  rect(page, 0, headerBottom, width, headerH, C.rosePaper);
  // Liseré rouge fin qui coud le bas du bandeau
  rect(page, 0, headerBottom, width, 1.2, C.roseLine);

  // Badge logo sur pastille blanche
  const LOGO = 64;
  const logoX = M - 6;
  const logoY = headerTop - 18 - LOGO;
  page.drawCircle({
    x: logoX + LOGO / 2,
    y: logoY + LOGO / 2,
    size: LOGO / 2 + 3,
    color: C.paper,
    borderColor: C.gold,
    borderWidth: 0.9,
  });
  if (logoPng) {
    page.drawImage(logoPng, { x: logoX, y: logoY, width: LOGO, height: LOGO });
  } else {
    // Secours : colombe stylisée (cercle blanc cousu rouge + point marron)
    const cx = logoX + LOGO / 2;
    const cy = logoY + LOGO / 2;
    page.drawCircle({ x: cx, y: cy, size: 22, color: C.paper, borderColor: C.rouge, borderWidth: 1.6 });
    page.drawLine({ start: { x: cx - 8, y: cy + 4 }, end: { x: cx + 8, y: cy - 4 }, thickness: 1.2, color: C.marron });
  }

  // Nom de la maison + tagline espacée
  const nameX = logoX + LOGO + 16;
  page.drawText(ATELIER_NAME, {
    x: nameX,
    y: headerTop - 40,
    size: 19,
    font: fonts.display,
    color: C.ink,
  });
  drawTracked(page, ATELIER_TAGLINE.toUpperCase(), {
    x: nameX + 1,
    y: headerTop - 57,
    size: 6.9,
    font: fonts.bold,
    color: C.marron,
    tracking: 0.9,
  });
  // Fil d'or sous la tagline + petit carré rouge en bout
  const tagW = trackWidth(fonts.bold, ATELIER_TAGLINE.toUpperCase(), 6.9, 0.9);
  page.drawLine({
    start: { x: nameX + 1, y: headerTop - 66 },
    end: { x: nameX + 1 + Math.min(tagW, 200), y: headerTop - 66 },
    thickness: 1,
    color: C.gold,
  });
  rect(page, nameX + 1 + Math.min(tagW, 200) + 4, headerTop - 67.4, 2.8, 2.8, C.rouge);

  // ========== 🎟 COUPON TICKET (à droite de l'en-tête) ==========
  const ref = sanitize(data.ref || "—");
  const cpW = 168;
  const cpH = 70;
  const cpX = width - M + 6 - cpW;
  const cpY = headerTop - 16 - cpH;
  // Corps blanc bordé rouge en pointillés
  page.drawRectangle({
    x: cpX,
    y: cpY,
    width: cpW,
    height: cpH,
    color: C.paper,
    borderColor: C.rouge,
    borderWidth: 1.2,
    borderDashArray: [4.5, 3],
  });
  // Perforations : ronds rose poudré qui « percent » le bord gauche
  for (let i = 0; i < 6; i++) {
    page.drawCircle({ x: cpX, y: cpY + 8 + i * 11.4, size: 3.1, color: C.rosePaper });
  }

  centerText(page, "— VOTRE TICKET —", cpX + cpW / 2 + 6, cpY + cpH - 15, {
    size: 6.8,
    font: fonts.bold,
    color: C.marronD,
  });
  // Référence en Playfair rouge, rétrécie si nécessaire
  let refSize = 15;
  const refMaxW = cpW - 26;
  while (refSize > 9 && fonts.display.widthOfTextAtSize(ref, refSize) > refMaxW) refSize -= 0.5;
  centerText(page, ref, cpX + cpW / 2 + 6, cpY + cpH - 36, {
    size: refSize,
    font: fonts.display,
    color: C.rouge,
  });
  centerText(page, labelType(type), cpX + cpW / 2 + 6, cpY + 15, {
    size: 7.6,
    font: fonts.text,
    color: C.inkSoft,
  });
  const dateStr = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  centerText(page, `le ${dateStr}`, cpX + cpW / 2 + 6, cpY + 6, {
    size: 6.6,
    font: fonts.text,
    color: C.goldD,
  });

  // ========== 🧷 BANDEAU PROFIL ==========
  const profTop = headerBottom - 14;
  const profH = 26;
  rect(page, M - 8, profTop - profH, width - 2 * M + 16, profH, C.rosePaper);
  rect(page, M - 8, profTop - profH, 3, profH, C.rouge);
  page.drawText(`Profil : ${profilFor(type)}`, {
    x: M + 4,
    y: profTop - 17,
    size: 9,
    font: fonts.bold,
    color: C.ink,
  });
  const rightHint = "Reçu avec douceur · réponse sous 48 h ouvrées";
  page.drawText(rightHint, {
    x: width - M - 4 - fonts.quote.widthOfTextAtSize(rightHint, 8.6),
    y: profTop - 17,
    size: 8.6,
    font: fonts.quote,
    color: C.roseDeep,
  });

  // ========== 📐 DÉTAILS — DEUX COLONNES SUR POINTILLÉS ROSE ==========
  const fields = fieldsFor(type, data);
  const titleY = profTop - profH - 26;
  page.drawText("Détails de votre demande", {
    x: M,
    y: titleY,
    size: 13,
    font: fonts.display,
    color: C.ink,
  });
  // Surlignage cousu : segment rouge franc + pointillés or
  page.drawLine({ start: { x: M, y: titleY - 5 }, end: { x: M + 56, y: titleY - 5 }, thickness: 1.7, color: C.rouge });
  page.drawLine({
    start: { x: M + 60, y: titleY - 5 },
    end: { x: width - M, y: titleY - 5 },
    thickness: 0.8,
    color: C.gold,
    dashArray: [2, 3],
  });

  const gridTop = titleY - 10;
  const colGap = 22;
  const colW = (width - 2 * M - colGap) / 2;
  const colLeftX = M;
  const colRightX = M + colW + colGap;
  const LABEL_W = colW * 0.46;
  const ROW_MIN_H = 19.5;
  const LABEL_SIZE = 7.4;
  const VALUE_SIZE = 9.4;

  function drawColumn(fieldsArr, startX, yTop) {
    let y = yTop - 16;
    const valueMaxW = colW - LABEL_W;
    const charsPerLine = Math.max(12, Math.floor(valueMaxW / 4.4));
    const MAX_VALUE_LINES = 3;

    for (let i = 0; i < fieldsArr.length; i++) {
      const [label, value] = fieldsArr[i];
      const rowTopBase = y;
      // Label en capsules marron
      page.drawText(sanitize(label).toUpperCase(), {
        x: startX,
        y,
        size: LABEL_SIZE,
        font: fonts.bold,
        color: C.marron,
      });
      // Valeur — wrap + troncature propre
      const valueX = startX + LABEL_W;
      const raw = String(value || "—");
      const wrapped = safeLines(raw, charsPerLine);
      const truncated = wrapped.map((ln) => {
        if (fonts.text.widthOfTextAtSize(ln, VALUE_SIZE) <= valueMaxW) return ln;
        let s = ln;
        while (s.length > 1 && fonts.text.widthOfTextAtSize(s + "…", VALUE_SIZE) > valueMaxW) {
          s = s.slice(0, -1);
        }
        return s + "…";
      });
      const drawnLines = truncated.slice(0, MAX_VALUE_LINES);
      if (truncated.length > MAX_VALUE_LINES && drawnLines.length) {
        let s = drawnLines[drawnLines.length - 1].replace(/[…\s]+$/, "");
        while (s.length > 1 && fonts.text.widthOfTextAtSize(s + "…", VALUE_SIZE) > valueMaxW) {
          s = s.slice(0, -1);
        }
        drawnLines[drawnLines.length - 1] = s + "…";
      }
      let lineY = y;
      for (const line of drawnLines) {
        page.drawText(line, { x: valueX, y: lineY, size: VALUE_SIZE, font: fonts.text, color: C.ink });
        lineY -= 12.5;
      }
      const usedH = Math.max(ROW_MIN_H, drawnLines.length * 12.5 + 7);
      // Pointillés rose sous la ligne
      page.drawLine({
        start: { x: startX, y: rowTopBase - usedH + 7 },
        end: { x: startX + colW, y: rowTopBase - usedH + 7 },
        thickness: 0.55,
        color: C.roseLine,
        dashArray: [1.6, 2.6],
      });
      y -= usedH;
    }
    return y;
  }

  const half = Math.ceil(fields.length / 2);
  const yAfterLeft = drawColumn(fields.slice(0, half), colLeftX, gridTop);
  const yAfterRight = drawColumn(fields.slice(half), colRightX, gridTop);
  const yAfterGrid = Math.min(yAfterLeft, yAfterRight);

  // ========== 🪡 PROCHAINES ÉTAPES ==========
  const steps = nextStepsFor(type);
  const itemStep = 15.5;
  const stepsTop = yAfterGrid - 14;
  const stepsBottom = stepsTop - steps.length * itemStep - 22;
  const stepsH = stepsTop - stepsBottom;
  rect(page, M - 8, stepsBottom, width - 2 * M + 16, stepsH, C.rosePaper);
  rect(page, M - 8, stepsBottom, 3, stepsH, C.marron);
  page.drawText("Vos prochaines étapes", {
    x: M + 4,
    y: stepsTop - 13,
    size: 10.5,
    font: fonts.display,
    color: C.marronD,
  });
  for (let i = 0; i < steps.length; i++) {
    const yStep = stepsTop - 31 - i * itemStep;
    page.drawRectangle({ x: M + 6, y: yStep - 2.4, width: 11, height: 11, color: C.rouge });
    centerText(page, String(i + 1), M + 11.5, yStep, {
      size: 7.4,
      font: fonts.bold,
      color: C.paper,
    });
    page.drawText(steps[i], {
      x: M + 25,
      y: yStep,
      size: 8.7,
      font: fonts.text,
      color: C.ink,
    });
  }

  // ========== ✍ SIGNATURE MAMAN COLOMBE ==========
  // La signature vient se poser élégamment au-dessus du filigrane (ancre 150)
  // — mais jamais superposée aux étapes si la fiche est très longue.
  const sigY = Math.max(76, Math.min(stepsBottom - 34, 172));
  // Point de croix doré au-dessus de la signature
  page.drawLine({
    start: { x: M, y: sigY + 44 },
    end: { x: width - M, y: sigY + 44 },
    thickness: 0.6,
    color: C.gold,
    dashArray: [2, 3],
  });
  // ✂ Ligne de coupe du talon — ornement centré dans l'espace libre
  const freeGap = stepsBottom - 34 - (sigY + 44);
  if (freeGap > 50) {
    const cutY = sigY + 44 + freeGap / 2;
    page.drawLine({ start: { x: M + 30, y: cutY }, end: { x: width / 2 - 18, y: cutY }, thickness: 0.75, color: C.roseLine, dashArray: [3, 4] });
    page.drawLine({ start: { x: width / 2 + 18, y: cutY }, end: { x: width - M - 30, y: cutY }, thickness: 0.75, color: C.roseLine, dashArray: [3, 4] });
    drawScissorsAt(page, width / 2, cutY + 2, C.goldD);
    centerText(page, "à conserver précieusement", width / 2, cutY - 14, {
      size: 7.2,
      font: fonts.quote,
      color: C.roseDeep,
    });
  }
  drawMamanColombeSignature(page, {
    x: M,
    y: sigY,
    width: width - 2 * M,
    fonts,
    recipientName:
      type === "formation" ? data.prenom || data.nom : data.nom || data.prenom,
    rightBlock: {
      x: M + (width - 2 * M) * 0.60,
      title: "ON RESTE À VOTRE ÉCOUTE",
      lines: [
        "« On prend soin de votre demande",
        "comme on prendrait soin d'un tissu",
        "précieux — patience et douceur. »",
      ],
    },
  });

  // ========== 🌺 FILIGRANE RÉFÉRENCE ==========
  const wmSize = 50;
  const wmW = fonts.display.widthOfTextAtSize(ref, wmSize);
  page.drawText(ref, {
    x: width - M - wmW,
    y: 96,
    size: wmSize,
    font: fonts.display,
    color: C.roseMist,
  });
  const wmLabel = "votre référence";
  const wmLabelW = fonts.quote.widthOfTextAtSize(wmLabel, 8.5);
  page.drawText(wmLabel, {
    x: width - M - wmLabelW,
    y: 87,
    size: 8.5,
    font: fonts.quote,
    color: C.roseDeep,
  });

  // ========== PIED DE PAGE ==========
  const footerBandY = 56;
  drawWovenBand(page, width, footerBandY + 4);

  page.drawText(ATELIER_NAME, {
    x: M,
    y: footerBandY - 10,
    size: 9,
    font: fonts.bold,
    color: C.ink,
  });
  const rightNote = "Présentez ce ticket lors de votre passage à l'atelier";
  page.drawText(rightNote, {
    x: width - M - fonts.quote.widthOfTextAtSize(rightNote, 8),
    y: footerBandY - 10,
    size: 8,
    font: fonts.quote,
    color: C.roseDeep,
  });

  const phones = `${ATELIER_PHONE}  ·  ${ATELIER_PHONE_2}  ·  WhatsApp wa.me/${ATELIER_WA}`;
  page.drawText(phones, {
    x: M,
    y: footerBandY - 22,
    size: 7.5,
    font: fonts.text,
    color: C.inkSoft,
  });
  page.drawText(ATELIER_LOCATION, {
    x: M,
    y: footerBandY - 32,
    size: 7,
    font: fonts.text,
    color: C.inkSoft,
  });

  const bytes = await pdf.save();
  return Buffer.from(bytes);
}

/**
 * Retourne aussi le PDF en base64 (pour transport via JSON quand on n'attache
 * pas de buffer au mail — ex : fallback API).
 */
export async function buildSubmissionPdfBase64(type, data) {
  const buf = await buildSubmissionPdf(type, data);
  return buf.toString("base64");
}

/**
 * Nom de fichier cohérent pour le PDF.
 */
export function pdfFilename(ref, type) {
  const safe = String(ref || "CLB").replace(/[^A-Z0-9_-]/gi, "");
  return `Les-Services-Colombes_${safe}_${type || "demande"}.pdf`;
}
