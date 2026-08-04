/**
 * Resynchronisation des tickets en attente vers le back-end.
 *
 * Le formulaire enregistre d'abord le ticket en local (localStorage) puis
 * tente un POST. Si le POST échoue (offline, timeout, 5xx...), le ticket
 * reste en `pending` ou `error`. Ce module rejoue ces tickets quand la
 * connexion revient.
 */
import { env } from "./env";
import { getPendingTickets, updateTicket, type StoredTicket } from "./tickets";

export type SyncResult = {
  total: number;
  synced: number;
  failed: number;
  errors: Array<{ ref: string; message: string }>;
};

function buildSubmissionBody(ticket: StoredTicket) {
  return {
    ref: ticket.ref,
    source: ticket.source,
    title: ticket.title,
    ...ticket.data,
    resync: true,
  };
}

function pickEndpoint(ticket: StoredTicket) {
  if (!env.apiUrl) return null;
  // Le back `/api/track` route par `event` : on garde la même convention
  // que les submits originaux pour que la ligne reparte dans le même onglet.
  const event = `${ticket.source}_submit`;
  return { url: env.apiUrl, event };
}

export async function syncPendingTickets(): Promise<SyncResult> {
  const result: SyncResult = { total: 0, synced: 0, failed: 0, errors: [] };
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return result;
  }
  const pending = getPendingTickets();
  result.total = pending.length;
  if (pending.length === 0) return result;

  for (const ticket of pending) {
    const ep = pickEndpoint(ticket);
    if (!ep) {
      // pas d'API configurée : on ne tente rien
      continue;
    }
    try {
      const response = await fetch(ep.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-token": env.apiToken,
        },
        body: JSON.stringify({ event: ep.event, sheet: ticket.source === "formation" ? "Formations" : ticket.source === "precommande" ? "Precommandes" : "Contacts", ...buildSubmissionBody(ticket) }),
        keepalive: true,
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || `HTTP ${response.status}`);
      }
      updateTicket(ticket.ref, { status: "synced", syncedAt: new Date().toISOString(), lastError: undefined });
      result.synced += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      updateTicket(ticket.ref, { status: "error", lastError: message });
      result.failed += 1;
      result.errors.push({ ref: ticket.ref, message });
    }
  }
  return result;
}
