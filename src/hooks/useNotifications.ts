/**
 * useNotifications.ts
 *
 * Hook React pour la cloche de notifications. Se branche sur le store
 * interne et expose une API propre :
 *
 *   const { items, unread, add, markRead, markAllRead, remove, clear } = useNotifications();
 *
 * Plus de Web Push, plus de VAPID, plus de permission navigateur :
 * tout vit dans le store local.
 */

import { useEffect, useState, useCallback, useSyncExternalStore } from "react";
import {
  getNotifications,
  subscribe as storeSubscribe,
  addNotification,
  markRead,
  markAllRead,
  removeNotification,
  clear,
  getUnreadCount,
  type NotificationItem,
  type AddInput,
} from "@/stores/notificationsStore";

/**
 * Implémentation minimaliste de useSyncExternalStore, fallback pour
 * les vieux React (<18). Ici on est en React 19, mais on garde le
 * pattern le plus simple possible.
 */
function useStoreSnapshot<T>(get: () => T, subscribeFn: (cb: () => void) => () => void): T {
  const [snap, setSnap] = useState<T>(get);
  useEffect(() => {
    return subscribeFn(() => setSnap(get()));
  }, [get, subscribeFn]);
  return snap;
}

export function useNotifications() {
  const items = useStoreSnapshot<NotificationItem[]>(getNotifications, storeSubscribe);
  const unread = getUnreadCount(items);

  const add = useCallback((input: AddInput) => addNotification(input), []);

  return {
    items,
    unread,
    add,
    markRead,
    markAllRead,
    remove: removeNotification,
    clear,
  };
}

export type { NotificationItem, AddInput } from "@/stores/notificationsStore";
