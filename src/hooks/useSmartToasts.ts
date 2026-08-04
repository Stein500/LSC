/**
 * useSmartToasts.ts
 *
 * Helpers contextuels pour le système de notifications in-app.
 * Centralise les messages + entrées cloche pour les 3 formulaires
 * (formation, precommande, contact) afin d'avoir un wording cohérent
 * partout (toast + entrée cloche + page de remerciement).
 *
 * Usage typique dans un onSubmit :
 *   onSuccessSmartToast({ kind: "formation", ref, payload, formData: data });
 */

import { notify } from "@/utils/notify";
import type { NotificationAudioKind } from "@/utils/notificationAudio";
import { addNotification } from "@/stores/notificationsStore";
import { env } from "@/utils/env";
import { buildWhatsAppUrl } from "@/utils/whatsapp";

/* --------------------------------------------------------------
 * Textes i18n-ready (futur i18n : extraire dans un fichier de
 * constantes partagées). Pour l'instant, on garde le français.
 * -------------------------------------------------------------- */

export const SMART_TOASTS = {
  formation: {
    success: "Les Services Colombes a bien reçu votre demande de formation",
    description: (ref: string) =>
      `Merci pour votre confiance. Référence ${ref}. L’équipe vous recontactera par appel, WhatsApp ou mail.`,
    bellTitle: "Demande de formation enregistrée",
    bellDescription: (ref: string) => `Référence ${ref} · retour par appel, WhatsApp ou mail.`,
    announce: "Les Services Colombes a bien reçu votre demande de formation.",
  },
  precommande: {
    success: "Les Services Colombes a bien reçu votre pré-commande",
    description: (ref: string) =>
      `Votre demande est bien arrivée. Référence ${ref}. Les Services Colombes vous revient dès que possible.`,
    bellTitle: "Pré-commande enregistrée",
    bellDescription: (ref: string) => `Référence ${ref} · suivi par appel, WhatsApp ou mail.`,
    announce: "Les Services Colombes a bien reçu votre pré-commande.",
  },
  contact: {
    success: "Les Services Colombes a bien reçu votre message",
    description: (ref: string) =>
      `Merci pour votre message. Référence ${ref}. Une réponse vous sera apportée par appel, WhatsApp ou mail.`,
    bellTitle: "Message de contact reçu",
    bellDescription: (ref: string) => `Référence ${ref} · réponse par appel, WhatsApp ou mail.`,
    announce: "Les Services Colombes a bien reçu votre message.",
  },
} as const;

type FormKind = keyof typeof SMART_TOASTS;

type FormData = Record<string, unknown>;

/**
 * Appelé après un onSubmit réussi (réponse HTTP OK ou pending local).
 * Déclenche le toast + ajoute une entrée dans la cloche avec une action
 * rapide "Contacter sur WhatsApp" + "Voir la commande".
 */
export function onSuccessSmartToast({
  kind,
  ref,
  payload,
  formData,
  synced,
}: {
  kind: FormKind;
  ref: string;
  payload?: unknown;
  formData?: FormData;
  /** true si l'API a confirmé la réception, false si stocké en local pending */
  synced?: boolean;
}) {
  const t = SMART_TOASTS[kind];
  const audioKind: NotificationAudioKind = kind === "formation" ? "formation" : kind === "precommande" ? "precommande" : "contact";

  // 1) Toast sonner
  notify.success(t.success, {
    description: synced === false
      ? "Votre demande est bien gardée et partira dès que la connexion revient."
      : t.description(ref),
    haptic: true,
    audioKind,
    announce: synced === false
      ? "Les Services Colombes garde votre demande pour la suite."
      : t.announce,
  });

  // 2) Entrée dans la cloche avec action rapide WhatsApp
  const whatsappHref = buildWhatsAppUrl(env.whatsappGeneralRaw, buildWhatsappPrefill(kind, ref, formData));
  addNotification({
    type: "success",
    title: t.bellTitle,
    description: t.bellDescription(ref),
    icon: "CheckCircle2",
    category: kind,
    actions: [
      {
        label: "Contacter sur WhatsApp",
        href: whatsappHref,
        variant: "primary",
      },
      {
        label: "Voir le récap",
        href: `/merci?type=${kind}&ref=${ref}`,
        variant: "ghost",
      },
    ],
    metadata: { ref, payload },
  });
}

/**
 * Appelé après un onSubmit en erreur réseau / 5xx.
 * Toast erreur + entrée cloche (pour pouvoir réessayer plus tard).
 */
export function onErrorSmartToast({ kind, ref, error }: { kind: FormKind; ref: string; error: unknown }) {
  const message = error instanceof Error ? error.message : String(error);
  notify.error("Connexion impossible", {
    description: "Votre demande est mise de côté et partira dès que tout revient.",
    duration: 8000,
    audioKind: "error",
    announce: kind === "formation"
      ? "Les Services Colombes garde votre demande de formation en attente."
      : kind === "precommande"
        ? "Les Services Colombes garde votre pré-commande en attente."
        : "Les Services Colombes garde votre message en attente.",
  });
  addNotification({
    type: "warning",
    title: "Demande en attente de synchronisation",
    description: `Référence ${ref} — réessai automatique au retour de la connexion.`,
    icon: "CloudOff",
    category: kind,
    actions: [
      {
        label: "Voir l'historique",
        href: "/parametres",
        variant: "ghost",
      },
    ],
    metadata: { ref, error: message },
  });
}

/* --------------------------------------------------------------
 * Pré-remplissage WhatsApp contextuel
 * -------------------------------------------------------------- */

function buildWhatsappPrefill(kind: FormKind, ref: string, data?: FormData): string {
  const name = (data?.["nom"] as string) || (data?.["fullName"] as string) || "";
  const tag = kind === "formation" ? "Formation" : kind === "precommande" ? "Précommande" : "Message";
  const lines = [
    `Bonjour, je reviens vers vous au sujet de ma ${tag.toLowerCase()} (réf. ${ref}).`,
    name ? `Nom : ${name}` : null,
    "Merci !",
  ].filter(Boolean);
  return lines.join("\n");
}
