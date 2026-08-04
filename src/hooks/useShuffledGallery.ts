// PHASE 0 — Mélange déterministe d'une galerie d'images
//
// Utilise un hash simple sur (src + seed) pour produire un ordre stable pendant
// la session / la journée, sans appeler Math.random() (qui rendrait le rendu
// différent entre SSR et CSR).

import { useMemo } from 'react';

type GalleryImage = { src: string; alt: string; caption: string };

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function useShuffledGallery<T extends GalleryImage>(
  images: T[],
  seed: 'session' | 'day' = 'session',
): T[] {
  return useMemo(() => {
    const now = new Date();
    const seedValue = seed === 'day'
      ? now.getDate() + now.getMonth() * 31
      : Math.floor(now.getTime() / (1000 * 60 * 60 * 12));
    const sorted = [...images].sort((a, b) => hash(a.src + seedValue) - hash(b.src + seedValue));
    return sorted;
  }, [images, seed]);
}
