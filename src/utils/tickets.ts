import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from "./whatsapp";
import { formatDateFR } from "./format";

export type TicketSource = "contact" | "formation" | "precommande";
export type TicketStatus = "pending" | "synced" | "error";

export type StoredTicket = {
  ref: string;
  source: TicketSource;
  title: string;
  status: TicketStatus;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  syncedAt?: string;
  lastError?: string;
};

const STORAGE_KEY = "colombes_tickets_v1";

function readTickets(): StoredTicket[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredTicket[]) : [];
  } catch {
    return [];
  }
}

function writeTickets(tickets: StoredTicket[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  } catch {}
}

export function getTickets(): StoredTicket[] {
  return readTickets().sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
}

export function getPendingTickets(): StoredTicket[] {
  return getTickets().filter((ticket) => ticket.status === "pending" || ticket.status === "error");
}

export function countPendingTickets(): number {
  return getPendingTickets().length;
}

export function saveTicket(ticket: StoredTicket): StoredTicket {
  const tickets = readTickets();
  const idx = tickets.findIndex((t) => t.ref === ticket.ref);
  const next = { ...ticket, updatedAt: ticket.updatedAt || new Date().toISOString() };
  if (idx >= 0) tickets[idx] = { ...tickets[idx], ...next };
  else tickets.unshift(next);
  writeTickets(tickets);
  return next;
}

export function updateTicket(ref: string, patch: Partial<StoredTicket>): StoredTicket | null {
  const tickets = readTickets();
  const idx = tickets.findIndex((t) => t.ref === ref);
  if (idx < 0) return null;
  tickets[idx] = { ...tickets[idx], ...patch, updatedAt: new Date().toISOString() };
  writeTickets(tickets);
  return tickets[idx];
}

export function deleteTicket(ref: string) {
  const tickets = readTickets().filter((ticket) => ticket.ref !== ref);
  writeTickets(tickets);
}

export function clearTickets() {
  writeTickets([]);
}

export function getTicketByRef(ref: string): StoredTicket | null {
  return readTickets().find((ticket) => ticket.ref === ref) ?? null;
}

export function ticketsToCSV(tickets: StoredTicket[] = getTickets()): string {
  const headers = ["ref", "source", "title", "status", "createdAt", "updatedAt", "syncedAt", "lastError", "summary"];
  const lines = [headers.join(",")];
  for (const ticket of tickets) {
    const summary = Object.entries(ticket.data)
      .slice(0, 6)
      .map(([k, v]) => `${k}:${String(v)}`)
      .join(" | ");
    const row = [
      ticket.ref,
      ticket.source,
      ticket.title,
      ticket.status,
      ticket.createdAt,
      ticket.updatedAt,
      ticket.syncedAt ?? "",
      ticket.lastError ?? "",
      summary,
    ].map(csvEscape);
    lines.push(row.join(","));
  }
  return lines.join("\n");
}

function csvEscape(value: string): string {
  const safe = String(value ?? "");
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function buildTicketWhatsAppMessage(ticket: StoredTicket): string {
  const name = String(ticket.data.nom || ticket.data.prenom || "").trim();
  const ref = ticket.ref;
  const base = WHATSAPP_TEMPLATES[ticket.source]?.(name, ref) || WHATSAPP_TEMPLATES.general(name, ref);
  return `${base}\n\nRéf. ${ref}\nStatut: ${getTicketStatusLabel(ticket.status)}\nCréé le: ${formatDateFR(ticket.createdAt)}`;
}

export function getTicketLabel(source: TicketSource): string {
  switch (source) {
    case "formation":
      return "Formation";
    case "precommande":
      return "Commande";
    default:
      return "Contact";
  }
}

export const TICKET_SOURCE_EMOJI: Record<TicketSource, string> = {
  precommande: "👗",
  formation: "🎓",
  contact: "💌",
};

// =============================================================
// 📖 LECTURE FRANÇAISE D'UN TICKET — fini le dump JSON anglais
// ---------------------------------------------------------------
// Le détail d'un ticket se lit comme une fiche de la maison :
// libellés en français, valeurs habillées, rien de technique.
// (photo_jpeg & autres chaînes géantes ne passent JAMAIS ici.)
// =============================================================

const FIELD_LABELS_FR: Record<string, string> = {
  nom: "Nom",
  prenom: "Prénom",
  telephone: "Téléphone",
  email: "Email",
  age: "Âge",
  modele: "Modèle choisi",
  photo_nom: "Photo jointe",
  type_tenue: "Type de tenue",
  tenue_autre: "Précision (autre)",
  couleur_preferee: "Couleur préférée",
  taille: "Taille",
  date_souhaitee: "Date souhaitée",
  budget: "Budget estimé",
  description: "Projet",
  mesures: "Mesures",
  niveau_actuel: "Niveau actuel",
  formation_choisie: "Formule choisie",
  disponibilite: "Disponibilités",
  motivation: "Motivation",
  motif_paiement: "Mode de paiement",
  sujet: "Sujet",
  message: "Message",
};

const VALUE_LABELS_FR: Record<string, string> = {
  debutant: "Débutant·e",
  intermediaire: "Intermédiaire",
  courte: "Formation Courte",
  specialisee: "Formation Spécialisée",
  indecis: "Pas encore décidé",
  matin: "Matin",
  apresmidi: "Après-midi",
  soir: "Soir",
  weekend: "Week-end",
};

const SKIP_KEYS = new Set([
  "ref", "event", "sheet", "source", "sessionId", "path", "timestamp",
  "atelier", "status", "resync", "photo_jpeg", "token", "pageViews",
]);

function humanValue(v: unknown): string {
  if (Array.isArray(v)) return v.map(humanValue).filter(Boolean).join(", ");
  if (v === true) return "Oui";
  if (v === false) return "Non";
  const s = String(v ?? "").trim();
  if (!s) return "";
  return VALUE_LABELS_FR[s] ?? (s.length > 160 ? `${s.slice(0, 157)}…` : s);
}

/** Les champs d'un ticket prêts à l'affichage — français, propres, dans l'ordre. */
export function ticketFieldsFr(data: Record<string, unknown>): Array<{ label: string; value: string }> {
  const out: Array<{ label: string; value: string }> = [];
  for (const [key, raw] of Object.entries(data || {})) {
    if (SKIP_KEYS.has(key)) continue;
    const label = FIELD_LABELS_FR[key] ?? key.replace(/_/g, " ");
    const value = humanValue(raw);
    if (value) out.push({ label, value });
  }
  return out;
}

/** La personne derrière le ticket (pour le titre & le résumé). */
export function ticketPerson(data: Record<string, unknown>): { name: string; phone: string } {
  const prenom = String(data.prenom || "").trim();
  const nom = String(data.nom || "").trim();
  return {
    name: `${prenom} ${nom}`.trim() || "—",
    phone: String(data.telephone || "").trim(),
  };
}

export function getTicketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case "synced":
      return "Bien reçu";
    case "error":
      return "À renvoyer";
    default:
      return "En route";
  }
}

export function getTicketStatusTone(status: TicketStatus): "citron" | "orange" | "neutral" {
  switch (status) {
    case "synced":
      return "citron";
    case "error":
      return "orange";
    default:
      return "neutral";
  }
}

// =============================================================
// 🧭 LA LOGIQUE DES STATUTS — une seule couture, trois issues
// ---------------------------------------------------------------
// Depuis la résilience de /api/track (une réponse OK dès qu'UN canal
// aboutit), « synchronisé » veut dire : **l'atelier a bien reçu la
// demande** — par le mail OU par le tableau Google. Si ni l'un ni
// l'autre n'ont abouti, le ticket est gardé en sûreté sur l'appareil
// et attend un renvoi. Plus de « erreur de synchronisation » menteuse
// quand tout est en réalité bien parti. 🕊️
// =============================================================

export type SubmissionOutcome = "synced" | "pending";

/** Traduit la réponse de l'API en statut de ticket honnête. */
export function applySubmissionResult(
  ref: string,
  response: {
    errors?: { sheet?: unknown; mail?: unknown } | null;
    [key: string]: unknown;
  } | null,
): SubmissionOutcome {
  if (response) {
    const sheetKo = Boolean(response.errors?.sheet);
    const mailKo = Boolean(response.errors?.mail);
    const arrived = !mailKo || !sheetKo; // un des deux fils a porté la demande
    if (arrived) {
      const note = sheetKo && !mailKo
        ? "Reçu par mail ✔ — la ligne rejoindra le tableau Google au prochain envoi."
        : mailKo && !sheetKo
          ? "Inscrite au tableau ✔ — le mail suivra au prochain envoi."
          : undefined;
      updateTicket(ref, { status: "synced", syncedAt: new Date().toISOString(), lastError: note });
      return "synced";
    }
  }
  // Ni mail ni tableau : on garde précieusement, en attendant mieux.
  updateTicket(ref, {
    status: "pending",
    lastError: "Gardé en sûreté sur cet appareil — touchez « Relancer » quand la connexion sourit.",
  });
  return "pending";
}

/** Aucune réponse du tout (hors-ligne, serveur muet) : gardé en sûreté. */
export function markTicketKept(ref: string): SubmissionOutcome {
  updateTicket(ref, {
    status: "pending",
    lastError: "Gardé en sûreté sur cet appareil — touchez « Relancer » quand la connexion sourit.",
  });
  return "pending";
}

export function openTicketWhatsApp(ticket: StoredTicket, rawNumber: string): string {
  return buildWhatsAppUrl(rawNumber, buildTicketWhatsAppMessage(ticket));
}
