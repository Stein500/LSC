import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  shimmer?: boolean;
  children?: ReactNode;
};

const base =
  "relative inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 overflow-hidden";

const variants: Record<Variant, string> = {
  // Citron satiné : dégradé subtil + ombre colorée + ourlet lumineux
  primary:
    "text-[var(--color-ink)] shadow-[0_10px_25px_-8px_rgba(143,191,0,0.55)] hover:shadow-[0_16px_34px_-8px_rgba(143,191,0,0.65)] " +
    "bg-[linear-gradient(180deg,#D6FF4D_0%,var(--color-citron)_40%,var(--color-citron-d)_130%)] hover:brightness-[1.04] " +
    "before:absolute before:inset-x-4 before:top-px before:h-px before:bg-white/70 before:content-['']",
  // Marron cuir : profondeur chaude
  secondary:
    "text-white shadow-[0_10px_25px_-8px_rgba(92,46,12,0.55)] hover:shadow-[0_16px_34px_-8px_rgba(92,46,12,0.6)] " +
    "bg-[linear-gradient(180deg,#A65A21_0%,var(--color-orange)_45%,var(--color-orange-d)_130%)] hover:brightness-[1.05] " +
    "before:absolute before:inset-x-4 before:top-px before:h-px before:bg-white/25 before:content-['']",
  ghost: "bg-transparent text-[var(--color-ink)] hover:bg-black/5",
  outline:
    "bg-transparent border-2 border-[var(--color-citron)] text-[var(--color-ink)] hover:bg-[var(--color-citron)] hover:shadow-[0_10px_25px_-8px_rgba(143,191,0,0.5)]",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm min-h-[44px]",
  md: "px-6 py-3 text-sm min-h-[44px]",
  lg: "px-8 py-4 text-base min-h-[48px]",
};

const MotionButton = motion.button;

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth,
      icon,
      loading,
      shimmer,
      className,
      children,
      disabled,
      ...rest
    },
    ref,
  ) => {
    const reduce = useReducedMotion();

    return (
      <MotionButton
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          "lsc-arrow-nudge",
          className,
        )}
        whileHover={reduce ? undefined : { y: -2, scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.96, y: 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        {...(rest as any)}
      >
        {/* Onde de brillance permanente (très douce) */}
        {shimmer && !loading && (
          <span className="lsc-shine-sweep absolute inset-0 overflow-hidden rounded-full pointer-events-none" />
        )}

        {loading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : icon ? (
          <span className="shrink-0 inline-flex items-center">{icon}</span>
        ) : null}
        <span className="relative z-10">{children}</span>
      </MotionButton>
    );
  },
);
Button.displayName = "Button";
