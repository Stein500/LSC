import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
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
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-citron)] text-[var(--color-ink)] hover:bg-[var(--color-citron-d)] hover:-translate-y-0.5 shadow-sm hover:shadow-md",
  secondary:
    "bg-[var(--color-orange)] text-white hover:bg-[var(--color-orange-d)] hover:-translate-y-0.5 shadow-sm hover:shadow-md",
  ghost:
    "bg-transparent text-[var(--color-ink)] hover:bg-black/5",
  outline:
    "bg-transparent border-2 border-[var(--color-citron)] text-[var(--color-ink)] hover:bg-[var(--color-citron)]",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm min-h-[44px]",
  md: "px-6 py-3 text-sm min-h-[44px]",
  lg: "px-8 py-4 text-base min-h-[48px]",
};

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "md", fullWidth, icon, loading, shimmer, className, children, disabled, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          shimmer && "relative overflow-hidden",
          className,
        )}
        {...rest}
      >
        {loading ? (
          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        <span className="relative z-10">{children}</span>
        {shimmer && (
          <span className="absolute inset-0 animate-shimmer-citron pointer-events-none" />
        )}
      </button>
    );
  },
);
Button.displayName = "Button";