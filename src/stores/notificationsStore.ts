/**
 * notificationsStore.ts
 *
 * Store global des notifications in-app. 100% client, persistant en
 * localStorage (clé `lsc:notifications`), capacité 50 entrées FIFO.
 *
 * C'est le SEUL point de vérité pour la cloche : tous les autres
 * modules (formulaires, toasts, install prompt, WhatsApp) y poussent
 * leurs entrées.
 *
 * API exposée :
 *   - addNotification()  → push (avec cap FIFO + dédup)
 *   - markRead()         → marquer une notif comme lue
 *   - markAllRead()      → tout marquer comme lu
 *   - removeNotification()→ supprimer une notif (swipe-to-dismiss)
 *   - clear()            → vider entièrement
 *   - getNotifications() → snapshot du store
 *   - subscribe()        → écoute des changements (hook React)
 *
 * Aucun backend, aucune dépendance externe : juste un module TS pur,
 * sync via un EventTarget interne.
 */

const STORAGE_KEY = "lsc:notifications";
const MAX_ITEMS = 50;

/* ==============================================================
 * Types publics
 * ============================================================== */

export type NotificationKind = "success" | "info" | "warning" | "error" | "action";

export type NotificationAction = {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "ghost";
};

export type NotificationItem = {
  id: string;
  type: NotificationKind;
  title: string;
  description?: string;
  icon?: string; // nom d'icône lucide-react (ex: "CheckCircle2")
  createdAt: number; // timestamp ms
  read: boolean;
  actions?: NotificationAction[];
  /** Catégorie libre : permet de filtrer (ex: "formation", "precommande", "contact", "install") */
  category?: string;
  metadata?: Record<string, unknown>;
};

/* ==============================================================
 * Helpers
 * ============================================================== */

function uuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback déterministe (très peu probable en pratique)
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function loadFromStorage(): NotificationItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as NotificationItem[];
  } catch {
    return [];
  }
}

function saveToStorage(items: NotificationItem[]) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota ou autre → on ignore */
  }
}

/** Dédup : si la même notif (même titre + type) est ajoutée dans les
 *  5 dernières secondes, on remplace au lieu de doubler. */
function dedupRecent(items: NotificationItem[], incoming: NotificationItem): NotificationItem[] {
  const now = incoming.createdAt;
  const dup = items.find(
    (it) => it.title === incoming.title && it.type === incoming.type && now - it.createdAt < 5000,
  );
  if (!dup) return items;
  return items.map((it) => (it.id === dup.id ? { ...incoming, id: dup.id, createdAt: dup.createdAt } : it));
}

/* ==============================================================
 * Store interne (pattern mini-zustand, zero dep)
 * ============================================================== */

type Listener = (items: NotificationItem[]) => void;

const state: { items: NotificationItem[] } = {
  items: loadFromStorage(),
};
const listeners = new Set<Listener>();

function notifyListeners() {
  saveToStorage(state.items);
  for (const l of listeners) l(state.items);
}

export function getNotifications(): NotificationItem[] {
  return state.items;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  // Push initial pour que le hook ait la valeur courante
  listener(state.items);
  return () => {
    listeners.delete(listener);
  };
}

/* ==============================================================
 * Mutations
 * ============================================================== */

export type AddInput = Omit<NotificationItem, "id" | "createdAt" | "read"> & {
  read?: boolean;
  createdAt?: number;
};

export function addNotification(input: AddInput): NotificationItem {
  const item: NotificationItem = {
    id: uuid(),
    createdAt: input.createdAt ?? Date.now(),
    read: input.read ?? false,
    type: input.type,
    title: input.title,
    description: input.description,
    icon: input.icon,
    actions: input.actions,
    category: input.category,
    metadata: input.metadata,
  };
  let next = [item, ...state.items];
  next = dedupRecent(next, item);
  // Cap FIFO : on garde les MAX_ITEMS plus récents
  if (next.length > MAX_ITEMS) next = next.slice(0, MAX_ITEMS);
  state.items = next;
  notifyListeners();
  return item;
}

export function markRead(id: string) {
  state.items = state.items.map((it) => (it.id === id ? { ...it, read: true } : it));
  notifyListeners();
}

export function markAllRead() {
  state.items = state.items.map((it) => ({ ...it, read: true }));
  notifyListeners();
}

export function removeNotification(id: string) {
  state.items = state.items.filter((it) => it.id !== id);
  notifyListeners();
}

export function clear() {
  state.items = [];
  notifyListeners();
}

/* Helpers de lecture (calculés à la demande) */
export function getUnreadCount(items: NotificationItem[] = state.items): number {
  return items.reduce((acc, it) => acc + (it.read ? 0 : 1), 0);
}
