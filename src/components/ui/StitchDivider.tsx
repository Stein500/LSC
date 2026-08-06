import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

/**
 * StitchDivider — séparateur « point de couture » animé : une ligne de
 * points qui avance comme le fil sous l'aiguille, avec une aiguille ✂
 * qui suit. Pure décoration, respecte reduced-motion via CSS global.
 */
export function StitchDivider({
  className,
  accent = false,
  label,
}: {
  className?: string;
  /** true → teinte marron/doré, sinon citron */
  accent?: boolean;
  label?: string;
}) {
  const color = accent ? "var(--color-gold-thread)" : "var(--color-orange)";
  return (
    <div
      className={cn("relative flex items-center gap-3 py-2 overflow-hidden", className)}
      aria-hidden="true"
    >
      <motion.span
        className="text-sm shrink-0"
        style={{ color }}
        animate={{ x: ["-8%", "2100%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      >
        ✂
      </motion.span>
      <svg
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-[2px]"
        preserveAspectRatio="none"
        viewBox="0 0 100 2"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="1"
          x2="100"
          y2="1"
          stroke={color}
          strokeWidth="1.6"
          strokeDasharray="6 8"
          className="lsc-stitch-line"
          opacity="0.55"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {label && (
        <span
          className="relative z-10 mx-auto shrink-0 px-4 text-[10px] uppercase tracking-[0.3em] font-medium"
          style={{ color: "var(--color-muted)", backgroundColor: "var(--app-bg)" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
