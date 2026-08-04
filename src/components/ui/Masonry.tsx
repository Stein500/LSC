// PHASE 0 — Masonry étendu :
//  - lazyLoad : si true, n'affiche que les 12 premiers + IntersectionObserver
//  - itemMin  : hauteur min en px pour les enfants (via min-height)
//
// Aucune casse : les 3 props existantes (children, columns, gap) restent.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Props = {
  children: ReactNode;
  columns?: { sm?: number; md?: number; lg?: number };
  gap?: number;
  className?: string;
  // === AJOUTS PHASE 0 ===
  lazyLoad?: boolean;
  itemMin?: number;
  /** index après lequel on coupe en lazy mode (défaut 12) */
  lazyThreshold?: number;
};

export function Masonry({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 16,
  className,
  lazyLoad = false,
  itemMin,
  lazyThreshold = 12,
}: Props) {
  // Conversion children → array pour pouvoir slicer en mode lazy
  const childArray = Array.isArray(children) ? children : [children];
  const totalCount = childArray.length;
  const [visibleCount, setVisibleCount] = useState(
    lazyLoad ? Math.min(lazyThreshold, totalCount) : totalCount,
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!lazyLoad) return;
    const node = sentinelRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisibleCount((c) => Math.min(c + lazyThreshold, totalCount));
          }
        }
      },
      { rootMargin: '200px' },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [lazyLoad, lazyThreshold, totalCount]);

  const style = {
    ['--lsc-cols-sm' as string]: columns.sm ?? 1,
    ['--lsc-cols-md' as string]: columns.md ?? columns.sm ?? 1,
    ['--lsc-cols-lg' as string]: columns.lg ?? columns.md ?? columns.sm ?? 1,
    ['--lsc-gap' as string]: `${gap}px`,
  } as CSSProperties;

  const slice = childArray.slice(0, visibleCount);

  return (
    <>
      <div
        className={cn(
          'columns-1',
          'sm:columns-[var(--lsc-cols-sm)] md:columns-[var(--lsc-cols-md)] lg:columns-[var(--lsc-cols-lg)]',
          '[column-gap:var(--lsc-gap)]',
          className,
        )}
        style={style}
      >
        {slice.map((child, i) => (
          <div
            key={i}
            style={
              itemMin
                ? ({ minHeight: itemMin, breakInside: 'avoid', marginBottom: gap } as CSSProperties)
                : { breakInside: 'avoid', marginBottom: gap }
            }
          >
            {child}
          </div>
        ))}
      </div>
      {lazyLoad && visibleCount < totalCount && (
        <div ref={sentinelRef} aria-hidden="true" className="h-8 w-full" />
      )}
    </>
  );
}
