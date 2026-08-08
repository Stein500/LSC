import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  hover?: boolean;
  bordered?: boolean;
};

/**
 * Card — surface couture raffinée : reflet satiné en tête, reflet de
 * soie qui balaie au survol (.lsc-card-sheen), ourlet lumineux
 * (.lsc-hemline) et élévation en douceur.
 */
export function Card({ children, hover = true, bordered = true, className, ...rest }: Props) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6",
        bordered && "border border-[var(--color-line)]",
        hover && "lsc-card-sheen lsc-hemline hover:-translate-y-1.5 hover:shadow-[0_22px_44px_-16px_rgba(60,38,20,0.28)] hover:border-[var(--color-gold-thread)]/60",
        !hover && "transition-shadow duration-300",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
