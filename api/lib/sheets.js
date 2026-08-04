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

export const SHEETS = {
  Events: {
    name: "Events",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Type d'événement",
      "Atelier",
      "Identifiant de session",
      "Page",
      "Référence",
      "Statut",
      "Source",
      "Données complètes (JSON)",
    ],
  },
  PageViews: {
    name: "PageViews",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Page",
      "Identifiant de session",
      "Référence",
      "Source",
    ],
  },
  Clicks: {
    name: "Clicks",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Type d'événement",
      "Contexte",
      "Libellé",
      "Lien (href)",
      "Numéro",
      "Identifiant de session",
      "Page",
    ],
  },
  Forms: {
    name: "Forms",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Type d'événement",
      "Formulaire",
      "Étape",
      "Erreur",
      "Identifiant de session",
      "Page",
    ],
  },
  Installs: {
    name: "Installs",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Étape d'installation",
      "Identifiant de session",
      "Page",
      "Plateforme",
      "Source",
    ],
  },
  // ---- Nouveaux onglets (analytics étendus) ----
  Sessions: {
    name: "Sessions",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Identifiant de session",
      "Type d'événement",
      "Page d'entrée",
      "Page de sortie",
      "Durée (secondes)",
      "Pages vues",
      "Device",
      "Navigateur",
      "Langue",
      "En ligne",
      "Référence",
      "Source",
    ],
  },
  Errors: {
    name: "Errors",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Type d'événement",
      "Catégorie",
      "Message",
      "Stack",
      "Page",
      "Identifiant de session",
    ],
  },
  PWA: {
    name: "PWA",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Type d'événement",
      "Étape",
      "Plateforme",
      "Affiché",
      "Action",
      "Identifiant de session",
      "Page",
    ],
  },
  ScrollDepth: {
    name: "ScrollDepth",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Page",
      "Profondeur max (%)",
      "Palier atteint",
      "Identifiant de session",
    ],
  },
  OutboundLinks: {
    name: "OutboundLinks",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Libellé",
      "URL",
      "Type",
      "Identifiant de session",
      "Page",
    ],
  },
  Engagement: {
    name: "Engagement",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Type d'événement",
      "Contexte",
      "Valeur",
      "Identifiant de session",
      "Page",
    ],
  },
  Formations: {
    name: "Formations",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Référence",
      "Nom",
      "Prénom",
      "Âge",
      "Téléphone",
      "Email",
      "Niveau actuel",
      "Formation choisie",
      "Disponibilités",
      "Motivation",
      "Motif de paiement souhaité",
      "Identifiant de session",
      "Statut",
      "Source",
      "Données complètes (JSON)",
    ],
  },
  Precommandes: {
    name: "Precommandes",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Référence",
      "Nom",
      "Téléphone",
      "Email",
      "Type de tenue",
      "Type (autre / précisé)",
      "Couleur préférée",
      "Taille",
      "Date souhaitée",
      "Budget estimé",
      "Description du projet",
      "Mesures fournies",
      "Identifiant de session",
      "Statut",
      "Source",
      "Données complètes (JSON)",
    ],
  },
  Contacts: {
    name: "Contacts",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Référence",
      "Nom",
      "Email",
      "Téléphone",
      "Sujet",
      "Message",
      "Identifiant de session",
      "Statut",
      "Source",
      "Données complètes (JSON)",
    ],
  },
  PushSubscriptions: {
    name: "PushSubscriptions",
    headers: [
      "Horodatage",
      "Date",
      "Heure",
      "Atelier",
      "Endpoint",
      "p256dh",
      "auth",
      "Content-Encoding",
      "Expiration",
      "Actif",
      "User Agent",
      "Langue",
      "Plateforme",
      "Device",
      "Navigateur",
      "Identifiant de session",
      "Source",
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
  const tabs = await listTabs();
  const sheets = getClient();

  if (!tabs.includes(name)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: name } } }],
      },
    });
    _existingTabs = null;
  }

  const current = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${name}!A1:ZZ1`,
  });
  const currentHeaders = (current.data.values && current.data.values[0]) || [];
  if (!sameHeaders(currentHeaders, headers)) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${name}!A1`,
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
    range: `${tabName}!A1`,
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
    range: `${tab.name}!A2:ZZ`,
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
export async function logEvent(payload) {
  // 1. Détermine l'onglet cible
  let tabKey = payload.sheet;
  if (!tabKey) {
    const ev = payload.event || "";
    if (ev.endsWith("_submit")) {
      if (ev.startsWith("formation")) tabKey = "Formations";
      else if (ev.startsWith("precommande")) tabKey = "Precommandes";
      else if (ev.startsWith("contact")) tabKey = "Contacts";
      else tabKey = "Forms";
    } else if (ev.startsWith("form_")) {
      tabKey = "Forms";
    } else if (ev.startsWith("install_pwa_")) {
      tabKey = "Installs";
    } else if (ev.startsWith("pwa_")) {
      tabKey = "PWA";
    } else if (ev === "page_view" || ev === "section_view") {
      tabKey = "PageViews";
    } else if (
      ev === "cta_click" ||
      ev === "whatsapp_click" ||
      ev === "phone_click"
    ) {
      tabKey = "Clicks";
    } else if (
      ev === "session_start" ||
      ev === "session_end" ||
      ev === "page_hidden" ||
      ev === "page_visible"
    ) {
      tabKey = "Sessions";
    } else if (
      ev === "js_error" ||
      ev === "react_error" ||
      ev === "api_error" ||
      ev === "form_api_error"
    ) {
      // form_api_error reste sur Forms (ligne d'erreur par form), mais les
      // erreurs runtime vont dans Errors.
      tabKey = payload.form ? "Forms" : "Errors";
    } else if (ev === "scroll_depth") {
      tabKey = "ScrollDepth";
    } else if (ev === "outbound_click" || ev === "external_link") {
      tabKey = "OutboundLinks";
    } else if (
      ev === "video_play" ||
      ev === "video_pause" ||
      ev === "video_complete" ||
      ev === "tab_focus" ||
      ev === "tab_blur" ||
      ev === "copy_clipboard" ||
      ev === "download_file"
    ) {
      tabKey = "Engagement";
    } else {
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

  await appendRow(tab.name, tab.headers, enriched);
  return { ok: true, tab: tab.name };
}
