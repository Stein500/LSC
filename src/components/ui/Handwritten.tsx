// PHASE 0 — Composant "manuscrit" pour donner une touche chaleureuse.
//
// Utilise la font Caveat (chargée dans index.html) avec un fallback cursive.
// S'utilise sur des annotations, sous-titres, signatures manuscrites.

import type { ReactNode } from 'react';

type Tag = 'span' | 'p' | 'div' | 'h2' | 'h3';

type Props = {
  as?: Tag;
  color?: string;
  breathing?: boolean;
  className?: string;
  children: ReactNode;
};

export function Handwritten({
  as: Tag = 'span',
  color = 'var(--color-orange-d, #5C2E0C)',
  breathing = false,
  className = '',
  children,
}: Props) {
  return (
    <Tag
      className={`${breathing ? 'lsc-breathe' : ''} ${className}`}
      style={{
        fontFamily: 'var(--font-script, "Caveat"), "Comic Sans MS", cursive',
        color,
        fontSize: '1.15em',
      }}
    >
      {children}
    </Tag>
  );
}

export default Handwritten;
