/**
 * api/lib/pdf.js
 *
 * Génère un PDF "ticket" pro, élégant et féminin pour chaque soumission.
 * - Une seule page A4 (pas de débordement).
 * - Reproduit la charte graphique du mail (couleurs #BFFF00 / #8B4513 / #87CEEB).
 * - Header compact (logo + nom + référence) + section ref proéminente +
 *   grille 2 colonnes ultra-compacte + signature manuscrite "Maman Colombe"
 *   avec une aiguille à fil dessinée en vectoriel + footer minimal.
 * - Renvoie un Buffer compatible piece-jointe nodemailer ET base64 pour le front.
 *
 * Stack : `pdf-lib` (léger, pure JS, pas de Chromium, parfait pour Vercel).
 */

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { LOGO_PNG_BUFFER } from "./logo.js";

// =============================================================
// Identité (cohérence avec mailer.js — lue depuis env)
// =============================================================

// Le logo est embarqué (base64 → Buffer) dans `api/lib/logo.js`, donc il est
// toujours disponible dans le bundle de la fonction serverless — contrairement
// à un fichier sur disque (Vercel ne copie pas `public/` dans la lambda).
let _logoFailed = false;
let _logoEmbedCache = new WeakMap();

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
  process.env.ATELIER_TAGLINE || "Atelier de Couture d'Exception";
const ATELIER_PHONE = process.env.ATELIER_PHONE || "+229 01 67 40 94 08";
const ATELIER_PHONE_2 = process.env.ATELIER_PHONE_2 || "+229 01 95 76 36 01";
const ATELIER_WA = process.env.ATELIER_WA || "2290167409408";
const ATELIER_LOCATION =
  process.env.ATELIER_LOCATION ||
  "Devant l'école primaire publique TOKPOTA DAVO GROUPE ABC, Porto-Novo – Bénin";
const ATELIER_SITE =
  process.env.ATELIER_SITE || "https://couturecolombe.vercel.app";

// Couleurs (alignées sur la charte : bleu ciel dominant + marron + blanc + noir + vert citron)
const C = {
  ink: rgb(0 / 255, 0 / 255, 0 / 255),            // #000000 noir
  inkSoft: rgb(61 / 255, 38 / 255, 20 / 255),     // #3D2614 brun sombre
  cream: rgb(230 / 255, 244 / 255, 251 / 255),    // #E6F4FB bleu ciel très clair
  creamD: rgb(135 / 255, 206 / 255, 235 / 255),   // #87CEEB bleu ciel
  citron: rgb(191 / 255, 255 / 255, 0 / 255),     // #BFFF00 vert citron
  citronD: rgb(143 / 255, 191 / 255, 0 / 255),    // #8FBF00 vert citron foncé
  orange: rgb(139 / 255, 69 / 255, 19 / 255),     // #8B4513 marron
  orangeD: rgb(92 / 255, 46 / 255, 12 / 255),     // #5C2E0C marron foncé
  line: rgb(176 / 255, 221 / 255, 240 / 255),     // #B0DDF0 ligne bleu ciel
  paper: rgb(1, 1, 1),                            // #FFFFFF blanc
  rose: rgb(214 / 255, 96 / 255, 96 / 255),       // #D66060 — petite touche féminine
  gold: rgb(201 / 255, 168 / 255, 124 / 255),     // #C9A87C fil d'or — cadre « patron »
  goldD: rgb(155 / 255, 122 / 255, 82 / 255),     // doré foncé — ciseaux du cadre
};

// =============================================================
// Helpers typographie
// =============================================================

function sanitize(s) {
  if (s === null || s === undefined) return "—";
  const str = String(s);
  return (
    str
      // pdf-lib StandardFonts (WinAnsi) ne supporte pas les emojis / hors BMP
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
// (Le mail a une version plus longue / plus marketing — ici on va à l'essentiel.)
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
  // contact
  return [
    "Lecture de votre message sous 48 heures ouvrées.",
    "Réponse personnalisée par mail ou téléphone.",
    "Si besoin, planification d'un rendez-vous à l'atelier.",
  ];
}

// =============================================================
// Champs affichés selon le type (grille plate, sans date/heure dupliquée)
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
// Cache Caveat (police manuscrite) — fetch Google Fonts au premier appel.
// Fallback Helvetica-Oblique si pas dispo (offline / Vercel cold start sans réseau).
// =============================================================

let _caveatCache = null;
async function getCaveatFont(pdf) {
  if (_caveatCache === "failed") return null;
  if (_caveatCache && _caveatCache.pdf === pdf) return _caveatCache.font;
  try {
    // URL publique Google Fonts — TTF Caveat-Bold 700
    const url =
      "https://fonts.gstatic.com/s/caveat/v18/WnznHAc5bAfYB2QRah7pcpNvOx-pjfJ9SIIWnHHhRwOR.woff";
    const res = await fetch(url);
    if (!res.ok) throw new Error("caveat fetch " + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    const font = await pdf.embedFont(buf, { subset: true });
    _caveatCache = { pdf, font };
    return font;
  } catch {
    _caveatCache = "failed";
    return null;
  }
}

// =============================================================
// Rendu bas-niveau : helpers de "paint"
// =============================================================

function rect(page, x, y, w, h, color) {
  page.drawRectangle({ x, y, width: w, height: h, color });
}

/** Texte wrappé multi-lignes — retourne le Y après le dernier baseline. */
function drawWrapped(page, text, { x, y, size, font, color, lineHeight, maxCharsPerLine }) {
  const lines = safeLines(text, maxCharsPerLine);
  let cy = y;
  for (const line of lines) {
    page.drawText(line, { x, y: cy, size, font, color });
    cy -= lineHeight;
  }
  return cy;
}

/**
 * Aiguille + fil — dessiné en vectoriel pur, bien visible.
 * - Tige : une ligne diagonale épaisse
 * - Chas : un ovale fermé franc, blanc bordé
 * - Fil : une longue courbe ondulée qui sort du chas, ondulante
 *
 * L'aiguille est ancrée par le CHAS (x, y) — donc la tige descend en bas-droit.
 * Le fil sort du chas vers le haut-droit (au-dessus de l'aiguille).
 * size = longueur de la tige (en points PDF).
 */
function drawNeedleAndThread(page, { x, y, size = 36, color = C.orange, threadColor = C.citronD }) {
  // Direction normalisée de la tige (du chas en haut-gauche vers la pointe en bas-droit, ~45°)
  const angle = -Math.PI / 4; // -45° : vers le bas
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // Extrémités de la tige
  const eyeX = x;
  const eyeY = y;
  const tipX = x + cos * size;
  const tipY = y + sin * size;

  // Chas (ovale fermé) — centré à l'extrémité haute
  const eyeRX = size * 0.10; // rayon court
  const eyeRY = size * 0.30; // rayon long
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

  // Tige (du chas vers la pointe) — plus épaisse
  page.drawLine({
    start: { x: eyeX, y: eyeY },
    end: { x: tipX, y: tipY },
    thickness: 2.0,
    color,
  });

  // "Talons" au bout de la pointe (deux petits traits formant un V ouvert)
  const t = 4.5; // taille du talon
  const tx1 = tipX - cos * t - sin * t * 0.55;
  const ty1 = tipY - sin * t + cos * t * 0.55;
  const tx2 = tipX - cos * t + sin * t * 0.55;
  const ty2 = tipY - sin * t - cos * t * 0.55;
  page.drawLine({ start: { x: tipX, y: tipY }, end: { x: tx1, y: ty1 }, thickness: 1.6, color });
  page.drawLine({ start: { x: tipX, y: tipY }, end: { x: tx2, y: ty2 }, thickness: 1.6, color });

  // Fil qui sort du chas — longue courbe ondulée vers le bas-droit
  // (le fil "pend" sous l'aiguille tenue, c'est plus joli et ça ne remonte
  // pas dans le contenu au-dessus)
  const filStartX = eyeX - cos * eyeRY;
  const filStartY = eyeY - sin * eyeRY;
  const segments = 18;
  const filLen = size * 1.3;
  const amp = 2.6;
  // direction du fil : vers le bas, légèrement à droite
  // L'axe Y PDF pointe vers le haut → "vers le bas" = angle négatif
  const filAngle = -Math.PI / 6; // -30° : descend avec une légère pente à droite
  const fcos = Math.cos(filAngle);
  const fsin = Math.sin(filAngle);
  let prevX = filStartX;
  let prevY = filStartY;
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const nextX = filStartX + fcos * filLen * t;
    const nextY = filStartY + fsin * filLen * t + Math.sin(t * Math.PI * 2.4) * amp;
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

/**
 * Signature "Maman Colombe" manuscrite + aiguille à droite.
 * Retourne la hauteur totale consommée (pour caler ce qui suit).
 */
function drawMamanColombeSignature(page, { x, y, width, fontScript, fontItalic, recipientName, rightBlock }) {
  // On ne dessine pas de cadre — juste la signature manuscrite et l'aiguille,
  // pour rester léger et féminin.
  const lineY = y;
  const nameX = x;
  const nameSize = 30;
  const nameText = `— Maman Colombe`;
  // Couleur brun chaud pour la touche artisanale / féminine
  page.drawText(nameText, {
    x: nameX,
    y: lineY,
    size: nameSize,
    font: fontScript || fontItalic,
    color: C.orangeD,
  });

  // Aiguille à droite, chas calé sur la baseline de la signature,
  // tige descendant en bas-droit — reste donc sous le nom.
  const needleSize = 40;
  const nameWidth = (fontScript || fontItalic).widthOfTextAtSize(nameText, nameSize);
  drawNeedleAndThread(page, {
    x: nameX + nameWidth + 20,
    y: lineY + 8,
    size: needleSize,
    color: C.orange,
    threadColor: C.citronD,
  });

  // Petite ligne d'au-dessus optionnelle : nom de la destinataire en italique
  if (recipientName) {
    page.drawText(`Pour ${sanitize(recipientName)},`, {
      x: nameX,
      y: lineY + 22,
      size: 11,
      font: fontItalic,
      color: C.inkSoft,
    });
  }

  // Bloc droit optionnel (ex : petite citation / récap)
  if (rightBlock && Array.isArray(rightBlock.lines) && rightBlock.lines.length) {
    const blockX = rightBlock.x !== undefined ? rightBlock.x : x + width * 0.62;
    let blockY = lineY + 6;
    if (rightBlock.title) {
      page.drawText(rightBlock.title, {
        x: blockX,
        y: blockY,
        size: 8.5,
        font: fontItalic,
        color: C.citronD,
      });
      blockY -= 12;
    }
    for (const ln of rightBlock.lines) {
      page.drawText(ln, {
        x: blockX,
        y: blockY,
        size: 9,
        font: fontItalic,
        color: C.inkSoft,
      });
      blockY -= 12;
    }
  }
  return 30; // hauteur consommée
}

// =============================================================
// Génération du PDF
// =============================================================

export async function buildSubmissionPdf(type, data) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${labelType(type)} — ${ATELIER_NAME}`);
  pdf.setAuthor(ATELIER_NAME);
  pdf.setSubject("Récapitulatif de votre demande");
  pdf.setCreator("Les Services Colombes — Atelier de Couture");

  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const fontScript = (await getCaveatFont(pdf)) || fontItalic;

  // Logo PNG réel du site
  const logoPng = await getLogoPng(pdf);

  // Page A4 unique
  const page = pdf.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const margin = 42;

  // ============== CADRE « PATRON À DÉCOUPER » ==============
  // Pourtour en pointillés dorés, comme la marge de coupe d'un patron —
  // signature visuelle de l'atelier, reprise du fil de couture du site.
  const FRAME_INSET = 16;
  page.drawRectangle({
    x: FRAME_INSET,
    y: FRAME_INSET,
    width: width - FRAME_INSET * 2,
    height: height - FRAME_INSET * 2,
    borderColor: C.gold,
    borderWidth: 1.1,
    borderDashArray: [7, 4],
  });
  // Petits ciseaux vectoriels sur le bord gauche, à mi-hauteur
  (function drawScissors(cx, cy) {
    const s = 7; // ouverture des branches
    const arm = 11; // longueur des branches
    page.drawCircle({ x: cx - s / 2, y: cy - s / 2 - 3, size: 2.6, borderColor: C.goldD, borderWidth: 1 });
    page.drawCircle({ x: cx + s / 2, y: cy - s / 2 - 3, size: 2.6, borderColor: C.goldD, borderWidth: 1 });
    page.drawLine({ start: { x: cx - s / 2, y: cy - s / 2 - 1 }, end: { x: cx + arm * 0.55, y: cy + arm }, thickness: 1.1, color: C.goldD });
    page.drawLine({ start: { x: cx + s / 2, y: cy - s / 2 - 1 }, end: { x: cx - arm * 0.55, y: cy + arm }, thickness: 1.1, color: C.goldD });
  })(FRAME_INSET, Math.round(height / 2));

  // ============== HEADER (bande tissée + logo + ref) ==============
  // Bande tissée 3 traits façon pagne — 4px de haut total
  rect(page, 0, height - 4, width, 1.2, C.orange);
  rect(page, 0, height - 6, width, 1.2, C.citron);
  rect(page, 0, height - 8, width, 1.4, C.citronD);

  // Fond crème léger sur 56px
  const HEADER_H = 56;
  rect(page, 0, height - 8 - HEADER_H, width, HEADER_H, C.cream);

  // Logo
  const LOGO_W = 50;
  const LOGO_H = 50;
  const logoX = margin;
  const logoY = height - 8 - HEADER_H + (HEADER_H - LOGO_H) / 2;
  if (logoPng) {
    page.drawImage(logoPng, { x: logoX, y: logoY, width: LOGO_W, height: LOGO_H });
  } else {
    // Fallback : cercle vert citron + couture
    const cx = logoX + LOGO_W / 2;
    const cy = logoY + LOGO_H / 2;
    page.drawCircle({ x: cx, y: cy, size: 22, color: C.paper, borderColor: C.citron, borderWidth: 1.6 });
    page.drawLine({ start: { x: cx - 8, y: cy + 4 }, end: { x: cx + 8, y: cy - 4 }, thickness: 1.2, color: C.orange });
  }

  // Texte du header — nom + tagline, calé après le logo
  const tx = logoX + LOGO_W + 12;
  page.drawText(ATELIER_NAME, {
    x: tx,
    y: height - 8 - 24,
    size: 15,
    font: fontBold,
    color: C.ink,
  });
  page.drawText(ATELIER_TAGLINE.toUpperCase(), {
    x: tx,
    y: height - 8 - 38,
    size: 7.5,
    font: fontBold,
    color: C.citronD,
  });

  // Coin droit : label + référence
  const ref = sanitize(data.ref || "—");
  const refLabelW = fontBold.widthOfTextAtSize("VOTRE TICKET", 8);
  page.drawText("VOTRE TICKET", {
    x: width - margin - refLabelW,
    y: height - 8 - 14,
    size: 8,
    font: fontBold,
    color: C.orangeD,
  });
  page.drawText(ref, {
    x: width - margin - fontBold.widthOfTextAtSize(ref, 13),
    y: height - 8 - 32,
    size: 13,
    font: fontBold,
    color: C.ink,
  });
  page.drawText(labelType(type), {
    x: width - margin - font.widthOfTextAtSize(labelType(type), 8),
    y: height - 8 - 46,
    size: 8,
    font,
    color: C.inkSoft,
  });

  // ============== BANDE CITRON "PROFIL" ==============
  const yStart = height - 8 - HEADER_H - 12;
  const bandH = 28;
  rect(page, margin - 4, yStart - bandH, width - 2 * margin + 8, bandH, C.citron);
  rect(page, margin - 4, yStart - bandH, 5, bandH, C.orange); // liseré orange à gauche
  const profileLabel = `Profil : ${profilFor(type)}`;
  page.drawText(profileLabel, {
    x: margin + 12,
    y: yStart - 12,
    size: 9,
    font: fontBold,
    color: C.ink,
  });
  // À droite, petite mention féminine
  const rightHint = "Reçu avec douceur · sous 48h ouvrées";
  const rightHintW = fontItalic.widthOfTextAtSize(rightHint, 8.5);
  page.drawText(rightHint, {
    x: width - margin - 12 - rightHintW,
    y: yStart - 12,
    size: 8.5,
    font: fontItalic,
    color: C.inkSoft,
  });

  // ============== GRILLE DÉTAILS (2 colonnes compactes) ==============
  const fields = fieldsFor(type, data);
  const gridTop = yStart - bandH - 18;
  const colGap = 18;
  const colW = (width - 2 * margin - colGap) / 2;
  const colLeftX = margin;
  const colRightX = margin + colW + colGap;
  // LABEL_W = 35% de la colonne ; VALUE_W = reste
  const LABEL_W = colW * 0.38;
  const ROW_H = 16; // hauteur d'une ligne
  const LABEL_SIZE = 8.5;
  const VALUE_SIZE = 9;

  // Titre section
  page.drawText("Détails de votre demande", {
    x: margin,
    y: gridTop,
    size: 11,
    font: fontBold,
    color: C.citronD,
  });
  // Petit liseré sous le titre
  page.drawLine({
    start: { x: margin, y: gridTop - 4 },
    end: { x: margin + 80, y: gridTop - 4 },
    thickness: 1.4,
    color: C.citronD,
  });

  // On répartit les champs en 2 colonnes équilibrées
  const half = Math.ceil(fields.length / 2);
  const leftFields = fields.slice(0, half);
  const rightFields = fields.slice(half);

  function drawColumn(fieldsArr, startX, yTop) {
    let y = yTop - 18; // 18 sous le titre
    const valueMaxW = colW - LABEL_W;
    // Calcule combien de caractères passent sur une ligne (estimation)
    const charsPerLine = Math.max(12, Math.floor(valueMaxW / 4.4));
    const MAX_VALUE_LINES = 3; // on autorise jusqu'à 3 lignes pour les valeurs longues

    for (let i = 0; i < fieldsArr.length; i++) {
      const [label, value] = fieldsArr[i];
      // Label (en gras, brun doux)
      page.drawText(sanitize(label), {
        x: startX,
        y,
        size: LABEL_SIZE,
        font: fontBold,
        color: C.orangeD,
      });
      // Valeur (sur la même ligne, à droite du label)
      const valueX = startX + LABEL_W;
      const raw = String(value || "—");
      // Wrap par mots, puis troncature par largeur réelle
      const wrapped = safeLines(raw, charsPerLine);
      // Tronque chaque ligne si elle dépasse la largeur
      const truncated = wrapped.map((ln) => {
        if (font.widthOfTextAtSize(ln, VALUE_SIZE) <= valueMaxW) return ln;
        let s = ln;
        while (s.length > 1 && font.widthOfTextAtSize(s + "…", VALUE_SIZE) > valueMaxW) {
          s = s.slice(0, -1);
        }
        return s + "…";
      });
      // Limite à MAX_VALUE_LINES — si on coupe, on met un ellipsis sur la dernière
      let drawnLines = truncated.slice(0, MAX_VALUE_LINES);
      if (truncated.length > MAX_VALUE_LINES) {
        const last = drawnLines[MAX_VALUE_LINES - 1];
        if (last.length > 1) {
          let s = last.replace(/[…\s]+$/, "");
          while (s.length > 1 && font.widthOfTextAtSize(s + "…", VALUE_SIZE) > valueMaxW) {
            s = s.slice(0, -1);
          }
          drawnLines[MAX_VALUE_LINES - 1] = s + "…";
        }
      }
      let lineY = y;
      for (const line of drawnLines) {
        page.drawText(line, {
          x: valueX,
          y: lineY,
          size: VALUE_SIZE,
          font,
          color: C.ink,
        });
        lineY -= 12;
      }
      // Hauteur de ligne : max entre une ligne et N lignes de valeur
      const usedH = Math.max(ROW_H, drawnLines.length * 12 + 4);
      y -= usedH;
    }
    return y;
  }

  const yAfterLeft = drawColumn(leftFields, colLeftX, gridTop);
  const yAfterRight = drawColumn(rightFields, colRightX, gridTop);
  // Le Y "le plus bas" des deux colonnes
  const yAfterGrid = Math.min(yAfterLeft, yAfterRight);

  // ============== BLOC "PROCHAINES ÉTAPES" (entre grille et signature) ==============
  const steps = nextStepsFor(type);
  // Pas d'étirement : on garde un interligne compact et lisible.
  // La signature sera calée juste sous ce bloc (ou plus bas si la fiche est courte).

  // Cadre discret pour le bloc étapes — fond crème léger
  const itemStep = 13;
  const stepsTop = yAfterGrid - 14;
  const stepsBottom = stepsTop - (steps.length * itemStep) - 18;
  const stepsH = stepsTop - stepsBottom;
  rect(page, margin - 4, stepsBottom, width - 2 * margin + 8, stepsH, C.cream);
  // Liseré citron à gauche
  rect(page, margin - 4, stepsBottom, 3, stepsH, C.citron);
  // Titre du bloc
  page.drawText("Vos prochaines étapes", {
    x: margin + 8,
    y: stepsTop - 12,
    size: 9,
    font: fontBold,
    color: C.citronD,
  });
  // Items
  for (let i = 0; i < steps.length; i++) {
    const yStep = stepsTop - 24 - i * itemStep;
    // Petit carré numéroté
    page.drawRectangle({
      x: margin + 10,
      y: yStep - 2,
      width: 11,
      height: 11,
      color: C.citron,
      borderColor: C.orangeD,
      borderWidth: 0.5,
    });
    page.drawText(String(i + 1), {
      x: margin + 12,
      y: yStep,
      size: 7.5,
      font: fontBold,
      color: C.ink,
    });
    page.drawText(steps[i], {
      x: margin + 28,
      y: yStep,
      size: 8.5,
      font,
      color: C.ink,
    });
  }

  // ============== SIGNATURE MAMAN COLOMBE ==============
  // La signature est calée juste sous le bloc étapes.
  // C'est l'approche la plus naturelle pour un ticket — le client voit
  // d'abord ses infos, puis la signature de l'atelier juste en dessous.
  // Le footer occupe y ∈ [0, 52] environ → on laisse au moins 30px de marge.
  const sigY = Math.max(60, stepsBottom - 30);
  drawMamanColombeSignature(page, {
    x: margin,
    y: sigY,
    width: width - 2 * margin,
    fontScript,
    fontItalic,
    recipientName:
      type === "formation"
        ? data.prenom || data.nom
        : data.nom || data.prenom,
    rightBlock: {
      // x calculé : juste après l'aiguille (≈ 62% de la largeur dispo)
      x: margin + (width - 2 * margin) * 0.62,
      title: "On reste à votre écoute",
      lines: [
        "\u00AB On prend soin de votre demande",
        "comme on prendrait soin d\u2019un tissu",
        "précieux \u2014 patience et douceur. \u00BB",
      ],
    },
  });

  // Petite ligne pointillée au-dessus de la signature (séparateur doux)
  page.drawLine({
    start: { x: margin, y: sigY + 42 },
    end: { x: width - margin, y: sigY + 42 },
    thickness: 0.5,
    color: C.line,
    dashArray: [2, 3],
  });

  // ============== WATERMARK RÉFÉRENCE (arrière-plan bas-droit) ==============
  // Affiche la référence en grand, en arrière-plan, avec une opacité légère
  // (style "tampon officiel"). Comble l'espace vide et donne un côté
  // officiel/épuré au ticket.
  const refFontSize = 56;
  const refW = fontBold.widthOfTextAtSize(ref, refFontSize);
  // Couleur citron D à 8% d'opacité — discrète, féminine
  page.drawText(ref, {
    x: width - margin - refW,
    y: 100,
    size: refFontSize,
    font: fontBold,
    color: C.citronD,
    opacity: 0.10,
  });

  // Petit label sous la watermark
  const wmLabelW = fontItalic.widthOfTextAtSize("votre référence", 8);
  page.drawText("votre référence", {
    x: width - margin - wmLabelW,
    y: 92,
    size: 8,
    font: fontItalic,
    color: C.citronD,
    opacity: 0.45,
  });

  // ============== FOOTER ==============
  const footerY = 28;
  // Bande tissée 3 traits au-dessus du footer
  rect(page, 0, footerY + 24, width, 1.2, C.citronD);
  rect(page, 0, footerY + 22, width, 1.2, C.citron);
  rect(page, 0, footerY + 20, width, 1.2, C.orange);

  // Ligne 1 : nom atelier (gauche) + site (droite)
  page.drawText(ATELIER_NAME, {
    x: margin,
    y: footerY + 8,
    size: 9,
    font: fontBold,
    color: C.ink,
  });
  const siteW = font.widthOfTextAtSize(ATELIER_SITE, 8);
  page.drawText(ATELIER_SITE, {
    x: width - margin - siteW,
    y: footerY + 8,
    size: 8,
    font,
    color: C.citronD,
  });

  // Ligne 2 : téléphones
  const phones = `${ATELIER_PHONE}  ·  ${ATELIER_PHONE_2}  ·  WhatsApp wa.me/${ATELIER_WA}`;
  page.drawText(phones, {
    x: margin,
    y: footerY - 4,
    size: 7.5,
    font,
    color: C.inkSoft,
  });

  // Ligne 3 : localisation
  const locW = font.widthOfTextAtSize(ATELIER_LOCATION, 7);
  page.drawText(ATELIER_LOCATION, {
    x: margin,
    y: footerY - 14,
    size: 7,
    font,
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
