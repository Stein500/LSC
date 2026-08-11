import { env } from "./env";

export type WhatsAppContext = "general" | "secretariat" | "direction";

/**
 * Construit une URL wa.me avec un message pré-rempli.
 */
export function buildWhatsAppUrl(
  rawNumber: string = env.whatsappGeneralRaw,
  message?: string,
): string {
  const base = `https://wa.me/${rawNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

/**
 * Messages pré-écrits par contexte.
 */
export const WHATSAPP_TEMPLATES: Record<string, (name?: string, ref?: string) => string> = {
  general: (name = "") =>
    `Bonjour${name ? " " + name : ""}, je suis intéressé(e) par vos services de couture LES SERVICES COLOMBES.`,
  precommande: (name = "") =>
    `Bonjour, je m'appelle ${name || "[prénom]"}. Je viens de remplir le formulaire de pré-commande dans l'application. Pouvez-vous me recontacter ?`,
  formation: (name = "") =>
    `Bonjour, je m'appelle ${name || "[prénom]"}. Je souhaite m'inscrire à une formation chez LES SERVICES COLOMBES.`,
  contact: (name = "") =>
    `Bonjour, je m'appelle ${name || "[prénom]"}. Je vous écris via le formulaire de contact de l'application.`,
  relance: (name = "", ref = "") =>
    `Bonjour, je reviens vers vous concernant ma demande${name ? " (" + name + ")" : ""}${ref ? ` — Réf. ${ref}` : ""}. Avez-vous eu le temps d'y jeter un œil ?`,
};

export function getWhatsAppForContext(ctx: WhatsAppContext): string {
  switch (ctx) {
    case "secretariat":
      return env.whatsappSecretariatRaw;
    case "direction":
      return env.whatsappDirectionRaw;
    default:
      return env.whatsappGeneralRaw;
  }
}