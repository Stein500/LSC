/**
 * Resynchronisation des tickets vers le back-end.
 *
 * Le formulaire enregistre d'abord le ticket en local (localStorage) puis
 * tente un POST. Si le POST échoue (offline, timeout, 5xx...), le ticket
 * reste gardé en sûreté (`pending` / `error`). Ce module rejoue ces
 * tickets quand la connexion revient — avec la MÊME logique de statut
 * honnête partout (applySubmissionResult) : « Bien reçu » dès que l'un
 * des deux fils (mail, tableau) a porté la demande jusqu'à l'atelier.
 */
import { env } from "./env";
import {
  applySubmissionResult,
  getPendingTickets,
  updateTicket,
  type StoredTicket,
} from "./tickets";

export type SyncResult = {
  total: number;
  synced: number;
  failed: number;
  errors: Array<{ ref: string; message: string }>;
};

function buildSubmissionBody(ticket: StoredTicket) {
  return {
    ref: ticket.ref,
    title: ticket.title,
    ...ticket.data,
    resync: true,
  };
}

/**
 * Renvoie UN ticket vers l'atelier.
 * Retourne "synced" si la demande est bien arrivée (mail ou tableau),
 * "pending" si elle reste gardée en sûreté, "error" si l'envoi a glissé.
 */
export async function syncTicket(
  ticket: StoredTicket,
): Promise<"synced" | "pending" | "error"> {
  if (!env.apiUrl) return "error";
  try {
    const response = await fetch(env.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": env.apiToken,
      },
      body: JSON.stringify({
        event: `${ticket.source}_submit`,
        sheet:
          ticket.source === "formation"
            ? "Formations"
            : ticket.source === "precommande"
              ? "Precommandes"
              : "Contacts",
        ...buildSubmissionBody(ticket),
      }),
      keepalive: true,
    });
    if (!response.ok) {
      updateTicket(ticket.ref, {
        status: "error",
        lastError: `Le serveur souffle (HTTP ${response.status}) — on retente doucement.`,
      });
      return "error";
    }
    const json = (await response.json().catch(() => null)) as
      | { errors?: { sheet?: string | null; mail?: string | null } }
      | null;
    return applySubmissionResult(ticket.ref, json);
  } catch (error) {
    updateTicket(ticket.ref, {
      status: "error",
      lastError:
        "L'envoi a glissé entre les mailles — on retente doucement plus tard.",
    });
    return "error";
  }
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
    const outcome = await syncTicket(ticket);
    if (outcome === "synced") {
      result.synced += 1;
    } else {
      result.failed += 1;
      result.errors.push({
        ref: ticket.ref,
        message:
          outcome === "error"
            ? "Envoi glissé entre les mailles"
            : "Gardé en sûreté — l'atelier n'a pas encore reçu",
      });
    }
  }
  return result;
}
