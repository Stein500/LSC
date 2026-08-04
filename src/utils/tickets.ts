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
  return `${base}\n\nRéf. ${ref}\nStatut: ${ticket.status === "synced" ? "Synchronisé" : "En attente"}\nCréé le: ${formatDateFR(ticket.createdAt)}`;
}

export function getTicketLabel(source: TicketSource): string {
  switch (source) {
    case "formation":
      return "Formation";
    case "precommande":
      return "Pré-commande";
    default:
      return "Contact";
  }
}

export function getTicketStatusLabel(status: TicketStatus): string {
  switch (status) {
    case "synced":
      return "Synchronisé";
    case "error":
      return "Échec";
    default:
      return "En attente";
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

export function openTicketWhatsApp(ticket: StoredTicket, rawNumber: string): string {
  return buildWhatsAppUrl(rawNumber, buildTicketWhatsAppMessage(ticket));
}
