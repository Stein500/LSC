// PHASE 0 — HeartPulse étendu avec la prop `color` (PHASE 0 ajout de 'rose-soft')

import { Heart } from 'lucide-react';
import { cn } from '@/utils/cn';

type ColorKey = 'blush' | 'orange' | 'citron' | 'rose-soft';

const colorMap: Record<ColorKey, string> = {
  blush: 'var(--color-blush)',
  orange: 'var(--color-orange, #F4B860)',
  citron: 'var(--color-citron, #BFFF00)',
  'rose-soft': 'var(--color-rose-soft)',
};

type Props = {
  className?: string;
  size?: number;
  color?: ColorKey;
};

export function HeartPulse({ className, size = 16, color = 'blush' }: Props) {
  return (
    <Heart
      className={cn('animate-pulse', className)}
      size={size}
      fill={colorMap[color]}
      style={{ color: colorMap[color] }}
    />
  );
}
