/**
 * notify.ts — API publique des notifications in-app.
 *
 * C'est la **seule** porte d'entrée à utiliser dans le code applicatif.
 * Elle s'appuie sur :
 *   - `sonner`     → pour les toasts éphémères (haut de l'écran)
 *   - `notificationsStore` → pour la cloche (centre de notifications, persistant)
 *   - `navigator.vibrate`   → feedback haptique léger (mobile)
 *
 * Style : iOS 17 / One UI 6 / HarmonyOS 4 — sobre, rapide, sans bruit.
 *
 * Usage :
 *   notify.success("Précommande reçue !", { description: "On vous confirme par email." });
 *   notify.error("Oups, réessayez.", { duration: 8000 });
 *   notify.promise(submitFn(), { loading: "...", success: "...", error: "..." });
 *   notify.addItem({ type: "success", title: "Formation enregistrée", ... });  // → cloche
 */

import { toast as sonnerToast, type ExternalToast } from "sonner";
import { addNotification, type NotificationItem, type NotificationKind } from "@/stores/notificationsStore";
import { playNotificationAudio, speakSoft, type NotificationAudioKind } from "@/utils/notificationAudio";

/* --------------------------------------------------------------
 * Couleurs du design system (alignées sur tokens CSS du site)
 * -------------------------------------------------------------- */
const KIND_COLORS: Record<NotificationKind, string> = {
  success: "#10B981",
  info: "#3B82F6",
  warning: "#F59E0B",
  error: "#EF4444",
  action: "var(--color-orange, #FF6A00)",
};

const KIND_DURATION: Record<NotificationKind, number> = {
  success: 4000,
  info: 4000,
  warning: 6000,
  error: 8000,
  action: 6000,
};

/* --------------------------------------------------------------
 * Feedback haptique — un *tap* subtil, pas une alarme.
 * -------------------------------------------------------------- */
function vibrate(ms = 50) {
  if (typeof navigator === "undefined") return;
  // L'API navigator.vibrate est supportée par Chromium / Android.
  // iOS Safari l'ignore silencieusement, parfait.
  try {
    if (typeof navigator.vibrate === "function") {
      navigator.vibrate(ms);
    }
  } catch {
    /* pas grave */
  }
}

/* --------------------------------------------------------------
 * Builder de description stylée pour sonner
 * -------------------------------------------------------------- */
function buildToastOptions(kind: NotificationKind, description?: string) {
  const base: ExternalToast = {
    description,
    duration: KIND_DURATION[kind],
    style: {
      borderLeft: `4px solid ${KIND_COLORS[kind]}`,
      borderRadius: "16px",
      backdropFilter: "blur(8px)",
      background: "rgba(255,255,255,0.97)",
      color: "var(--color-ink, #111827)",
      fontSize: "13px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
    },
    className: "lsc-toast",
  };
  return base;
}

/* ==============================================================
 * API publique
 * ============================================================== */

export type NotifyOptions = {
  description?: string;
  duration?: number;
  /** Action cliquable dans le toast (ex: "Voir", "Annuler") */
  action?: { label: string; onClick: () => void };
  /** Déclenche un tap haptique (mobile) */
  haptic?: boolean;
  /** Persiste aussi l'entrée dans la cloche (par défaut: true pour success/error/warning/action, false pour info) */
  persist?: boolean;
  /** Fait entendre une petite annonce vocale douce */
  announce?: string;
  /** Choisit la signature sonore utilisée */
  audioKind?: NotificationAudioKind;
};

export const notify = {
  /** Toast succès — optionnellement persisté dans la cloche */
  success(title: string, options: NotifyOptions = {}) {
    playNotificationAudio(options.audioKind ?? "success");
    if (options.announce) speakSoft(options.announce);
    sonnerToast.success(title, {
      ...buildToastOptions("success", options.description),
      duration: options.duration,
      action: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
    if (options.haptic) vibrate(50);
    if (options.persist !== false) {
      addNotification({
        type: "success",
        title,
        description: options.description,
        read: false,
      });
    }
  },

  info(title: string, options: NotifyOptions = {}) {
    playNotificationAudio(options.audioKind ?? "info");
    sonnerToast.info(title, {
      ...buildToastOptions("info", options.description),
      duration: options.duration,
      action: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
    // Les "info" ne sont PAS persistés par défaut (trop verbeux)
    if (options.persist) {
      addNotification({ type: "info", title, description: options.description, read: false });
    }
  },

  warning(title: string, options: NotifyOptions = {}) {
    playNotificationAudio(options.audioKind ?? "warning");
    sonnerToast.warning(title, {
      ...buildToastOptions("warning", options.description),
      duration: options.duration,
      action: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
    if (options.haptic) vibrate(50);
    if (options.persist !== false) {
      addNotification({ type: "warning", title, description: options.description, read: false });
    }
  },

  error(title: string, options: NotifyOptions = {}) {
    playNotificationAudio(options.audioKind ?? "error");
    sonnerToast.error(title, {
      ...buildToastOptions("error", options.description),
      duration: options.duration,
      action: options.action
        ? {
            label: options.action.label,
            onClick: options.action.onClick,
          }
        : undefined,
    });
    if (options.haptic !== false) vibrate(80);
    if (options.persist !== false) {
      addNotification({ type: "error", title, description: options.description, read: false });
    }
  },

  /**
   * Wrapper promesse — gère les 3 états automatiquement.
   *   notify.promise(submitForm(), {
   *     loading: "Envoi en cours...",
   *     success: "C'est parti !",
   *     error: "Oups, réessayez.",
   *   });
   */
  promise<T>(
    promise: Promise<T>,
    messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) },
    options: { persistSuccess?: boolean; hapticOnSuccess?: boolean; audioKind?: NotificationAudioKind } = {},
  ): Promise<T> {
    return sonnerToast.promise(promise, {
      loading: messages.loading,
      success: (data) => {
        const title = typeof messages.success === "function" ? messages.success(data) : messages.success;
        playNotificationAudio(options.audioKind ?? "success");
        if (options.persistSuccess) {
          addNotification({ type: "success", title, read: false });
        }
        if (options.hapticOnSuccess) vibrate(50);
        return title;
      },
      error: (err) => {
        const title = typeof messages.error === "function" ? messages.error(err) : messages.error;
        playNotificationAudio(options.audioKind ?? "error");
        addNotification({ type: "error", title, read: false });
        vibrate(80);
        return title;
      },
    }) as unknown as Promise<T>;
  },

  /**
   * Ajoute directement une entrée dans la cloche (sans toast).
   * Utile pour les événements post-submit qui doivent rester visibles.
   */
  addItem(item: Omit<NotificationItem, "id" | "createdAt" | "read">) {
    addNotification({ ...item, read: false });
  },

  /** Accès au toast brut pour les cas très custom (rare) */
  raw: sonnerToast,
};

export type { NotificationItem, NotificationKind };
