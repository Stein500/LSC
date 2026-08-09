/**
 * api/lib/sheets.js
 *
 * Wrapper Google Sheets — auth via Service Account, écriture générique.
 * Crée automatiquement les onglets manquants avec des en-têtes propres,
 * en français et bien formulées.
 *
 * Chaque ligne porte un discriminant `atelier` (utile quand plusieurs sites
 * partagent le même Google Sheet). Les anciens payloads qui contiennent
 * encore `school` sont aussi acceptés pour rétrocompat.
 */

import { google } from "googleapis";

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
let PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY || "";
// Vercel injecte les \n comme de vrais retours à la ligne parfois, parfois comme "\\n"
// On normalise pour accepter les deux cas.
PRIVATE_KEY = PRIVATE_KEY.replace(/\\n/g, "\n");

if (!SPREADSHEET_ID) console.warn("[sheets] GOOGLE_SHEET_ID manquant");
if (!SERVICE_ACCOUNT_EMAIL) console.warn("[sheets] GOOGLE_SERVICE_ACCOUNT_EMAIL manquant");
if (!PRIVATE_KEY) console.warn("[sheets] GOOGLE_PRIVATE_KEY manquant");

// =============================================================
// Définition des onglets et leurs en-têtes (formulation française)
// Chaque nouvel event est routé vers le bon onglet.
// =============================================================
function normalizeTimestamp(input = new Date().toISOString()) {
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatDateParts(ts) {
  const d = normalizeTimestamp(ts);
  return {
    timestamp: d.toISOString(),
    date: new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(d),
    time: new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }).format(d),
    isoDate: d.toISOString().slice(0, 10),
  };
}

function sameHeaders(a = [], b = []) {
  return a.length === b.length && a.every((v, i) => String(v || "").trim() === String(b[i] || "").trim());
}

function normalizeKey(input = "") {
  return String(input || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

const FIELD_ALIASES = {
  horodatage: ["timestamp", "createdAt", "created_at", "submittedAt"],
  date: ["date"],
  heure: ["time", "heure"],
  atelier: ["atelier", "school", "sourceId"],
  identifiantdesession: ["sessionId", "session_id", "sid"],
  page: ["path", "pathname", "url"],
  reference: ["ref", "reference", "ticket", "ticketId", "ticket_id"],
  statut: ["status"],
  source: ["source"],
  donneescompletesjson: ["payload", "data", "raw", "fullPayload"],
  typedevenement: ["event", "type"],
  contexte: ["context"],
  libelle: ["label"],
  lienhref: ["href", "link", "url"],
  numero: ["number", "phone", "telephone", "tel"],
  formulaire: ["form"],
  etape: ["stage"],
  erreur: ["error", "message"],
  etapedinstallation: ["stage"],
  nom: ["nom", "name"],
  prenom: ["prenom", "firstName", "firstname"],
  age: ["age"],
  telephone: ["telephone", "phone", "tel"],
  email: ["email", "mail"],
  niveauactuel: ["niveau_actuel", "niveau", "current_level"],
  formationchoisie: ["formation_choisie", "formation", "course"],
  disponibilites: ["disponibilite", "disponibilites", "availability"],
  motivation: ["motivation"],
  motifdepaiementsouhaite: ["motif_paiement", "payment_plan", "payment_mode"],
  typedetenue: ["type_tenue", "tenue", "garment_type"],
  typeautreprecise: ["tenue_autre", "type_autre", "precise_type"],
  couleurpreferee: ["couleur_preferee", "couleur", "color"],
  taille: ["taille", "size"],
  datesouhaitee: ["date_souhaitee", "dateSouhaitee", "date_requested"],
  budgetestime: ["budget", "budget_estime"],
  descriptionduprojet: ["description", "projet", "details"],
  mesuresfournies: ["mesures", "measurements"],
  sujet: ["sujet", "subject"],
  message: ["message", "content"],
  endpoint: ["endpoint"],
  p256dh: ["p256dh", "keysp256dh"],
  auth: ["auth", "keysauth"],
  actif: ["actif", "active", "enabled"],
  useragent: ["userAgent", "user_agent", "ua"],
  langue: ["lang", "language"],
  plateforme: ["platform", "platforme"],
  device: ["device"],
  navigateur: ["browser", "navigateur"],
  expirationtime: ["expirationTime", "expiration_time", "expiration"],
  contentencoding: ["contentEncoding", "content_encoding", "encoding"],
  // ---- Nouveaux alias (analytics étendus) ----
  typedevenement: ["event", "type"],
  plateforme: ["platform", "platforme"],
  device: ["device"],
  navigateur: ["browser"],
  langue: ["lang", "language"],
  enligne: ["online"],
  pagedentree: ["entryPath", "landingPath", "referrer"],
  pagedesortie: ["exitPath", "lastPath"],
  duree: ["duration", "durationMs", "duration_seconds"],
  pagesvues: ["pageViews", "pagesViewed"],
  categorie: ["category"],
  stack: ["stack", "stackTrace"],
  profondeurmax: ["maxDepth", "depth", "percentage"],
  palieratteint: ["milestone"],
  url: ["href", "link", "url", "destination"],
  type: ["type"],
  affiche: ["shown", "displayed"],
  action: ["action"],
  valeur: ["value", "amount"],
  contexte: ["context"],
};

function buildNormalizedIndex(row = {}) {
  const index = new Map();
  for (const [key, value] of Object.entries(row || {})) {
    const normalized = normalizeKey(key);
    if (!index.has(normalized)) index.set(normalized, value);
  }
  return index;
}

function pickValue(row, normalizedIndex, header) {
  const normalizedHeader = normalizeKey(header);

  if (normalizedIndex.has(normalizedHeader)) {
    return normalizedIndex.get(normalizedHeader);
  }

  const aliases = FIELD_ALIASES[normalizedHeader] || [];
  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias);
    if (normalizedIndex.has(normalizedAlias)) {
      return normalizedIndex.get(normalizedAlias);
    }
  }

  return undefined;
}

function serializeValue(value) {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map((v) => serializeValue(v)).filter(Boolean).join(", ");
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "boolean") return value ? "Oui" : "Non";
  return String(value);
}

/** Préfixe temporel commun — la colonne D est toujours « Date ISO » (filtre machine YYYY-MM-DD). */
const TS = ["Horodatage", "Date", "Heure", "Date ISO"];

export const SHEETS = {
  // 🏠 Tableau de bord — formules auto, placé à gauche (index 0)
  Accueil: { name: "Accueil", headers: ["Tableau de bord"], dashboard: true },
  Visites: {
    name: "Visites",
    headers: [...TS, "Page", "Référence", "Identifiant de session", "Source"],
  },
  ContactsClics: {
    name: "Clics & Contacts",
    headers: [...TS, "Type d'action", "Canal", "Libellé", "Lien / Numéro", "Page", "Identifiant de session"],
  },
  Formulaires: {
    name: "Formulaires",
    headers: [...TS, "Formulaire", "Étape", "Erreur", "Page", "Identifiant de session"],
  },
  Sessions: {
    name: "Sessions",
    headers: [...TS, "Type d'événement", "Page d'entrée", "Page de sortie", "Durée (s)", "Pages vues", "Appareil", "Identifiant de session"],
  },
  Messages: {
    name: "Messages",
    headers: [...TS, "Référence", "Nom", "Email", "Téléphone", "Sujet", "Message", "Statut"],
  },
  Formations: {
    name: "Formations",
    headers: [...TS, "Référence", "Nom", "Prénom", "Âge", "Téléphone", "Email", "Niveau actuel", "Formation choisie", "Disponibilités", "Motivation", "Motif de paiement souhaité", "Statut"],
  },
  Precommandes: {
    name: "Précommandes",
    headers: [...TS, "Référence", "Nom", "Téléphone", "Email", "Type de tenue", "Type (autre / précisé)", "Couleur préférée", "Taille", "Date souhaitée", "Budget estimé", "Description du projet", "Mesures fournies", "Statut"],
  },
  // 🛠️ Journal technique UNIQUEMENT (erreurs js, scroll, engagement — choix atelier)
  Events: {
    name: "Events",
    headers: [
      "Horodatage", "Date", "Heure", "Type d'événement", "Atelier",
      "Identifiant de session", "Page", "Référence", "Statut", "Source",
      "Données complètes (JSON)",
    ],
  },
};

// =============================================================
// Client lazy
// =============================================================
let _sheets = null;

function getClient() {
  if (_sheets) return _sheets;

  const auth = new google.auth.JWT({
    email: SERVICE_ACCOUNT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  _sheets = google.sheets({ version: "v4", auth });
  return _sheets;
}

// =============================================================
// Helpers
// =============================================================

/** Liste les onglets existants (cache mémoire). */
let _existingTabs = null;
export async function listTabs() {
  if (_existingTabs) return _existingTabs;
  const sheets = getClient();
  const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  _existingTabs = (res.data.sheets || []).map((s) => s.properties.title);
  return _existingTabs;
}

/** Crée un onglet avec en-têtes s'il n'existe pas, ou les remet à jour. */
export async function ensureTab(name, headers) {
  if (name === DASHBOARD_NAME) {
    await ensureDashboard();
    return;
  }
  const tabs = await listTabs();
  const sheets = getClient();

  if (!tabs.includes(name)) {
    const addRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: name } } }],
      },
    });
    _existingTabs = null;
    const newSheetId = addRes && addRes.data && addRes.data.replies && addRes.data.replies[0] && addRes.data.replies[0].addSheet ? addRes.data.replies[0].addSheet.properties.sheetId : null;
    if (newSheetId != null) {
      try { await formatTabHeader(newSheetId); } catch (e) { console.error("[sheets] formatTabHeader", e && e.message ? e.message : e); }
    }
  }

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${name}'!A1:ZZ1`,
  });
  const currentHeaders = (current.data.values && current.data.values[0]) || [];
  if (!sameHeaders(currentHeaders, headers)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${name}'!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [headers] },
    });
  }
}

/**
 * Construit la ligne dans l'ordre exact des en-têtes, avec un vrai mapping
 * entre les champs du front et les colonnes de chaque onglet.
 */
function rowFor(headers, row) {
  const normalizedIndex = buildNormalizedIndex(row);
  const tsInfo = formatDateParts(row.timestamp || row.createdAt || new Date().toISOString());

  return headers.map((h) => {
    const normalizedHeader = normalizeKey(h);
    let v;

    if (normalizedHeader === "horodatage") v = tsInfo.timestamp;
    else if (normalizedHeader === "date") v = tsInfo.date;
    else if (normalizedHeader === "heure") v = tsInfo.time;
    else if (normalizedHeader === "dateiso") v = tsInfo.isoDate;
    else if (normalizedHeader === "atelier") v = row.atelier ?? row.school;
    else if (normalizedHeader === "donneescompletesjson") v = row;
    else v = pickValue(row, normalizedIndex, h);

    return serializeValue(v);
  });
}

/** Append une ligne à un onglet. */
export async function appendRow(tabName, headers, row) {
  await ensureTab(tabName, headers);
  const sheets = getClient();
  const values = rowFor(headers, row);
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tabName}'!A1`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [values] },
  });
}

export async function readRecords(tabName, headers) {
  const tab = SHEETS[tabName] || SHEETS.Events;
  const effectiveHeaders = headers || tab.headers;
  await ensureTab(tab.name, effectiveHeaders);
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${tab.name}'!A2:ZZ`,
  });
  const rows = res.data.values || [];
  return rows.map((row) => {
    const obj = {};
    effectiveHeaders.forEach((header, idx) => {
      obj[header] = row[idx] ?? "";
    });
    return obj;
  });
}

// =============================================================
// API publique
// =============================================================

/**
 * Écrit un event dans le bon onglet selon `sheet` ou `event`.
 * Crée l'onglet + en-têtes à la volée si besoin.
 */
// Le front historique envoie des clés anglaises (PageViews, Clicks, Forms…)
// ou les noms d'onglets accentués : on normalise tout vers les clés SHEETS.
const SHEET_ALIASES = {
  pageviews: "Visites", visites: "Visites",
  clicks: "ContactsClics", contactsclics: "ContactsClics", clicscontacts: "ContactsClics",
  forms: "Formulaires", formulaires: "Formulaires",
  sessions: "Sessions",
  messages: "Messages", contacts: "Messages",
  formations: "Formations",
  precommandes: "Precommandes",
  scrolldepth: "Events", errors: "Events", events: "Events",
};

export async function logEvent(payload) {
  // 1. Détermine l'onglet cible — structure « qualité » (française & métier)
  let tabKey = payload.sheet;
  if (tabKey && typeof tabKey === "string" && !SHEETS[tabKey]) {
    tabKey = SHEET_ALIASES[normalizeKey(tabKey)] || tabKey;
  }
  const ev = payload.event || "";
  if (!tabKey) {
    if (ev === "page_view" || ev === "section_view") {
      tabKey = "Visites";
    } else if (ev.endsWith("_submit")) {
      if (ev.startsWith("formation")) tabKey = "Formations";
      else if (ev.startsWith("precommande")) tabKey = "Precommandes";
      else if (ev.startsWith("contact")) tabKey = "Messages";
      else tabKey = "Formulaires";
    } else if (ev.startsWith("form_")) {
      tabKey = "Formulaires";
    } else if (
      ev === "whatsapp_click" || ev === "phone_click" || ev === "tel_click" ||
      ev === "mail_click" || ev === "mailto_click" || ev === "email_click" ||
      ev === "maps_click" || ev === "cta_click"
    ) {
      tabKey = "ContactsClics";
    } else if (
      ev === "session_start" || ev === "session_end" ||
      ev === "page_hidden" || ev === "page_visible"
    ) {
      tabKey = "Sessions";
    } else {
      // Erreurs js/react/api, scroll, outbound, engagement, restes pwa…
      // → journal technique (Events), choix de l'atelier.
      tabKey = "Events";
    }
  }

  const tab = SHEETS[tabKey] || SHEETS.Events;
  const enriched = {
    ...payload,
    timestamp: payload.timestamp || new Date().toISOString(),
    // Le discriminant principal est `atelier`, mais on garde `school`
    // en fallback pour ne pas casser les anciens envois.
    atelier: payload.atelier || payload.school || "atelier-colombes",
    source: payload.source || "site",
  };

  // --- Enrichissements métier (les clés littérales matchent les en-têtes) ---
  if (tabKey === "ContactsClics") {
    enriched["Type d'action"] = ev.replace(/_/g, " ");
    enriched["Canal"] =
      ev === "whatsapp_click" ? "WhatsApp"
      : ev === "phone_click" || ev === "tel_click" ? "Appel"
      : ev === "mail_click" || ev === "mailto_click" || ev === "email_click" ? "Email"
      : ev === "maps_click" ? "Itinéraire"
      : "CTA";
    enriched["Libellé"] = payload.label || payload.context || payload.text || "";
    enriched["Lien / Numéro"] =
      payload.href || payload.number || payload.phone || payload.tel || payload.url || "";
  }
  if (tabKey === "Visites") {
    enriched["Page"] = payload.page || payload.path || "";
  }
  if (tabKey === "Sessions") {
    enriched["Type d'événement"] = ev;
    enriched["Page d'entrée"] = payload.entryPage || payload.entry || payload.page || "";
    enriched["Page de sortie"] = payload.exitPage || payload.exit || "";
    enriched["Durée (s)"] = payload.duration ?? payload.durationSec ?? "";
    enriched["Pages vues"] = payload.pageViews ?? "";
    enriched["Appareil"] = payload.device || payload.platform || "";
  }
  if (tabKey === "Formulaires") {
    enriched["Formulaire"] = payload.form || (ev.endsWith("_submit") ? ev.replace(/_submit$/, "") : ev);
    enriched["Étape"] = payload.stage || (ev.endsWith("_submit") ? "Soumission" : "");
    enriched["Erreur"] = payload.error || "";
  }
  // Les 3 onglets métier : statut initial visible pour le suivi interne
  if (tabKey === "Messages" || tabKey === "Formations" || tabKey === "Precommandes") {
    enriched["Statut"] = payload.statut || payload.status || "🆕 Nouveau";
  }

  await appendRow(tab.name, tab.headers, enriched);

  // Le tableau de bord se rafraîchit derrière (max 1×/10 min par instance)
  ensureDashboard().catch((e) => console.error("[sheets] dashboard", e?.message || e));

  return { ok: true, tab: tab.name };
}


// =============================================================
// 🏠 TABLEAU DE BORD « Accueil » — formules auto (choix combiné)
// =============================================================

const DASHBOARD_NAME = "Accueil";
const DASHBOARD_REFRESH_MS = 10 * 60 * 1000;
let _dashboardAt = 0;

const DASH_TABS = [
  { label: "Visites", tab: "Visites" },
  { label: "Clics contacts", tab: "Clics & Contacts" },
  { label: "Sessions", tab: "Sessions" },
  { label: "Messages", tab: "Messages" },
  { label: "Formations", tab: "Formations" },
  { label: "Précommandes", tab: "Précommandes" },
];

async function countTab(sheets, tabName) {
  // Comptes calculés côté serveur : aucun risque de #ERROR! (locale FR du tableur)
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "'" + tabName + "'!D2:D10000",
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    const vals = (res.data.values || []).map(function (r) { return String(r[0] || "").trim(); }).filter(Boolean);
    const today = new Date().toISOString().slice(0, 10);
    const d6 = new Date(Date.now() - 6 * 864e5).toISOString().slice(0, 10);
    const d29 = new Date(Date.now() - 29 * 864e5).toISOString().slice(0, 10);
    let t = 0, s7 = 0, s30 = 0;
    for (const v of vals) {
      const iso = v.slice(0, 10);
      if (iso === today) t++;
      if (iso >= d6) s7++;
      if (iso >= d29) s30++;
    }
    return { today: t, d7: s7, d30: s30, total: vals.length };
  } catch (e) {
    return { today: 0, d7: 0, d30: 0, total: 0 };
  }
}

async function ensureDashboard(force = false) {
  if (!force && Date.now() - _dashboardAt < DASHBOARD_REFRESH_MS) return;
  const sheets = getClient();
  const tabs = await listTabs();

  if (!tabs.includes(DASHBOARD_NAME)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: DASHBOARD_NAME, index: 0, gridProperties: { rowCount: 14, columnCount: 8 } },
            },
          },
        ],
      },
    });
    _existingTabs = null;
  }

  const stamp = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date());

  const counts = [];
  for (const t of DASH_TABS) counts.push(await countTab(sheets, t.tab));
  const sumDemandes = function (k) { return counts[3][k] + counts[4][k] + counts[5][k]; }; // Messages + Formations + Précommandes

  const rows = [
    ["✂️ LES SERVICES COLOMBES — TABLEAU DE BORD"],
    ["Mis à jour automatiquement — dernière écriture : " + stamp],
    [],
    ["Période"].concat(DASH_TABS.map(function (t) { return t.label; }), ["Demandes totales"]),
    ["Aujourd'hui"].concat(counts.map(function (c) { return c.today; }), [sumDemandes("today")]),
    ["7 derniers jours"].concat(counts.map(function (c) { return c.d7; }), [sumDemandes("d7")]),
    ["30 derniers jours"].concat(counts.map(function (c) { return c.d30; }), [sumDemandes("d30")]),
    ["Total général"].concat(counts.map(function (c) { return c.total; }), [sumDemandes("total")]),
    [],
    ["💡 Chiffres recalculés par l'atelier à chaque activité (visites, clics, formulaires). Les détails vivent dans les onglets métier."],
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "'" + DASHBOARD_NAME + "'!A1:H10",
    valueInputOption: "RAW",
    requestBody: { values: rows },
  });

  try {
    await formatDashboard();
  } catch (e) {
    console.error("[sheets] formatDashboard", e && e.message ? e.message : e);
  }
  _dashboardAt = Date.now();
}

let _dashFormatted = false;
async function formatDashboard() {
  if (_dashFormatted) return;
  const sheets = getClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
  const dash = (meta.data.sheets || []).find(function (s) { return s.properties.title === DASHBOARD_NAME; });
  const id = dash && dash.properties ? dash.properties.sheetId : null;
  if (id == null) return;

  const brown = { red: 0x8b / 255, green: 0x45 / 255, blue: 0x13 / 255 };
  const brownD = { red: 0x5c / 255, green: 0x2e / 255, blue: 0x0c / 255 };
  const citron = { red: 0xbf / 255, green: 1, blue: 0 };
  const white = { red: 1, green: 1, blue: 1 };
  const cream = { red: 0xfb / 255, green: 0xf7 / 255, blue: 0xee / 255 };

  function cell(r1, c1, r2, c2) {
    return { sheetId: id, startRowIndex: r1, endRowIndex: r2, startColumnIndex: c1, endColumnIndex: c2 };
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        { mergeCells: { range: cell(0, 0, 1, 8), mergeType: "MERGE_ALL" } },
        {
          repeatCell: {
            range: cell(0, 0, 1, 8),
            cell: {
              userEnteredFormat: {
                backgroundColor: brownD,
                textFormat: { foregroundColor: white, bold: true, fontSize: 13, fontFamily: "Georgia" },
                verticalAlignment: "MIDDLE",
                padding: { top: 8, bottom: 8, left: 12 },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment,padding)",
          },
        },
        {
          repeatCell: {
            range: cell(1, 0, 2, 8),
            cell: { userEnteredFormat: { textFormat: { italic: true, foregroundColor: { red: 0.45, green: 0.35, blue: 0.25 }, fontSize: 9 }, padding: { left: 12 } } },
            fields: "userEnteredFormat(textFormat,padding)",
          },
        },
        {
          repeatCell: {
            range: cell(3, 0, 4, 8),
            cell: {
              userEnteredFormat: {
                backgroundColor: brown,
                textFormat: { foregroundColor: citron, bold: true, fontSize: 10 },
                horizontalAlignment: "CENTER",
                verticalAlignment: "MIDDLE",
                padding: { top: 6, bottom: 6 },
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,padding)",
          },
        },
        {
          repeatCell: {
            range: cell(4, 0, 8, 1),
            cell: { userEnteredFormat: { textFormat: { bold: true, fontSize: 10 }, padding: { left: 12 } } },
            fields: "userEnteredFormat(textFormat,padding)",
          },
        },
        {
          repeatCell: {
            range: cell(4, 1, 8, 8),
            cell: { userEnteredFormat: { horizontalAlignment: "CENTER", textFormat: { fontSize: 11 } } },
            fields: "userEnteredFormat(horizontalAlignment,textFormat)",
          },
        },
        {
          repeatCell: {
            range: cell(7, 0, 8, 8),
            cell: { userEnteredFormat: { backgroundColor: cream, textFormat: { bold: true, fontSize: 11 } } },
            fields: "userEnteredFormat(backgroundColor,textFormat)",
          },
        },
        {
          repeatCell: {
            range: cell(4, 7, 8, 8),
            cell: { userEnteredFormat: { textFormat: { bold: true, foregroundColor: brownD, fontSize: 11 } } },
            fields: "userEnteredFormat(textFormat)",
          },
        },
        { updateDimensionProperties: { range: { sheetId: id, dimension: "COLUMNS", startIndex: 0, endIndex: 1 }, properties: { pixelSize: 150 }, fields: "pixelSize" } },
        { updateDimensionProperties: { range: { sheetId: id, dimension: "COLUMNS", startIndex: 1, endIndex: 8 }, properties: { pixelSize: 118 }, fields: "pixelSize" } },
      ],
    },
  });
  _dashFormatted = true;
}

/** En-tête « marque » pour les onglets de données (marron foncé + blanc, ligne gelée). */
async function formatTabHeader(sheetId) {
  const sheets = getClient();
  const brownD = { red: 0x5c / 255, green: 0x2e / 255, blue: 0x0c / 255 };
  const white = { red: 1, green: 1, blue: 1 };
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          updateSheetProperties: {
            properties: { sheetId: sheetId, gridProperties: { frozenRowCount: 1 } },
            fields: "gridProperties.frozenRowCount",
          },
        },
        {
          repeatCell: {
            range: { sheetId: sheetId, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: brownD,
                textFormat: { foregroundColor: white, bold: true, fontSize: 10 },
                verticalAlignment: "MIDDLE",
              },
            },
            fields: "userEnteredFormat(backgroundColor,textFormat,verticalAlignment)",
          },
        },
      ],
    },
  });
}
