// PHASE 0 — Sélectionne N mood cards depuis MOODS selon l'heure locale.
//
// Logique : on identifie le "slot" courant (morning/noon/afternoon/evening/night)
// puis on pioche N cartes à partir de ce slot pour donner une impression
// de progression temporelle dans la page.

import { useMemo } from 'react';
import { MOODS, type Mood } from '@/data/moods';

export function useMoodCards(count: 3 | 4 | 5 = 4, includeWorldTouch = false): Mood[] {
  return useMemo(() => {
    const hour = new Date().getHours();
    // Détermine le slot de mood actuel
    const slot = hour < 7 ? 4 : hour < 12 ? 0 : hour < 14 ? 1 : hour < 18 ? 2 : hour < 22 ? 3 : 4;
    const start = includeWorldTouch ? 0 : slot;
    return MOODS.slice(start, start + count);
  }, [count, includeWorldTouch]);
}
