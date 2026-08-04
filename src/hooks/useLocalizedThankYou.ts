// PHASE 0 — Sélectionne un message de remerciement selon la langue / l'heure.

import { useMemo } from 'react';
import { THANK_YOU } from '@/data/localized';

type Lang = 'auto' | 'fr' | 'ar' | 'zh' | 'en' | 'wo' | 'ff';

export function useLocalizedThankYou(lang: Lang = 'auto') {
  return useMemo(() => {
    if (lang === 'auto') {
      // Rotation sur l'heure pour le côté "aléatoire" mais déterministe
      const idx = new Date().getHours() % THANK_YOU.length;
      return THANK_YOU[idx];
    }
    return THANK_YOU.find((t) => t.lang === lang) ?? THANK_YOU[0];
  }, [lang]);
}
