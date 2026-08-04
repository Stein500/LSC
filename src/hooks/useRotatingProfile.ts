// PHASE 0 — Hook pour piocher un (ou plusieurs) Profile en rotation déterministe
//
// "session" = change toutes les 12h
// "day"     = change chaque jour calendaire
// "hour"    = change à chaque heure
//
// Le but : la Home ne montre pas le même profil de manière figée, et le
// rendu reste stable côté SSR / hydratation (même calcul à la milliseconde
// près tant qu'on est dans la même fenêtre temporelle).

import { useMemo } from 'react';
import { PROFILES, type Profile } from '@/data/profiles';

type Seed = 'session' | 'day' | 'hour';

function getSeedValue(seed: Seed): number {
  const now = new Date();
  if (seed === 'hour') return now.getHours();
  if (seed === 'day') return now.getDate() + now.getMonth() * 31;
  // session = slot de 12h
  return Math.floor(now.getTime() / (1000 * 60 * 60 * 12));
}

export function useRotatingProfile(
  seed: Seed = 'session',
  filter?: (p: Profile) => boolean,
): Profile {
  return useMemo(() => {
    const pool = filter ? PROFILES.filter(filter) : PROFILES;
    if (pool.length === 0) return PROFILES[0];
    const idx = getSeedValue(seed) % pool.length;
    return pool[idx];
  }, [seed, filter]);
}

export function useRotatingProfiles(
  count: number,
  seed: Seed = 'session',
  filter?: (p: Profile) => boolean,
): Profile[] {
  return useMemo(() => {
    const pool = filter ? PROFILES.filter(filter) : PROFILES;
    if (pool.length === 0) return [];
    const out: Profile[] = [];
    const start = getSeedValue(seed);
    for (let i = 0; i < count; i++) {
      out.push(pool[(start + i) % pool.length]);
    }
    return out;
  }, [count, seed, filter]);
}
