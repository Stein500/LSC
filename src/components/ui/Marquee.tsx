import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

/**
 * Marquee — ruban défilant infini. Le contenu est doublé pour une boucle
 * parfaite (l'animation CSS translate de 0 → -50%).
 *
 * <Marquee><span>Boubous ✦</span><span>Layette ✦</span></Marquee>
 */
export function Marquee({
  children,
  duration = 36,
  reverse = false,
  className,
  trackClassName,
}: {
  children: ReactNode;
  /** Secondes pour un cycle complet */
  duration?: number;
  reverse?: boolean;
  className?: string;
  trackClassName?: string;
}) {
  return (
    <div
      className={cn("lsc-marquee relative w-full overflow-hidden select-none", className)}
      aria-hidden="true"
    >
      <div
        className={cn("lsc-marquee-track items-center", reverse && "lsc-marquee-track--reverse", trackClassName)}
        style={{ ["--marquee-duration" as string]: `${duration}s` }}
      >
        {/* Deux copies identiques : la boucle CSS -50% est invisible */}
        <div className="flex items-center shrink-0">{children}</div>
        <div className="flex items-center shrink-0">{children}</div>
      </div>
    </div>
  );
}
