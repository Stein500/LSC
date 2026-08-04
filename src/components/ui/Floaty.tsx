// PHASE 0 — Floaty : enveloppe un enfant et lui applique un mouvement
// "bob" (translateY) infini. Très utile pour faire vivre un sticker / un
// pictogramme sans toucher au CSS global.

import type { CSSProperties, ReactNode } from 'react';

type Props = {
  duration?: number;
  delay?: number;
  distance?: number;
  children: ReactNode;
  className?: string;
};

export function Floaty({
  duration = 4,
  delay = 0,
  distance = 8,
  children,
  className = '',
}: Props) {
  const style: CSSProperties = {
    animation: `lsc-bob ${duration}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
    ['--bob-distance' as string]: `${distance}px`,
    ['--bob-duration' as string]: `${duration}s`,
  };
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

export default Floaty;
