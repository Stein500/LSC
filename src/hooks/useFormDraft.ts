import { useRef } from "react";

/**
 * Sauvegarde / restauration automatique d'un brouillon de formulaire
 * en localStorage. Si le user ferme l'onglet accidentellement, on
 * retrouve ses données. Si la soumission réussit, on vide le cache.
 *
 * - Clé par formulaire (`formId`)
 * - TTL : 24 h
 */
export function useFormDraft<T extends Record<string, any>>(formId: string) {
  const key = `clb_draft:${formId}`;
  const restoredRef = useRef(false);

  function loadDraft(): T | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed?.ts || !parsed?.data) return null;
      if (Date.now() - parsed.ts > 24 * 60 * 60 * 1000) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data as T;
    } catch {
      return null;
    }
  }

  function saveDraft(values: T) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data: values }));
    } catch {}
  }

  function clearDraft() {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch {}
  }

  return {
    loadDraft,
    saveDraft,
    clearDraft,
    restoredRef,
    key,
  };
}