import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  tone?: "citron" | "orange";
  className?: string;
};

/**
 * SectionTitle — titre de scène : kicker à filets dorés, pastille en
 * verre, titre qui se dévoile mot après mot en ressort, liseré
 * citron→doré sous la ligne.
 */
export function SectionTitle({ eyebrow, title, subtitle, align = "center", tone = "citron", className }: Props) {
  const isCenter = align === "center";
  const reduce = useReducedMotion();
  const accent = tone === "citron" ? "var(--color-citron)" : "var(--color-orange)";

  const inner = (
    <>
      {eyebrow && (
        <span
          className={cn(
            "lsc-section-kicker text-[11px] sm:text-xs font-semibold tracking-[0.28em] uppercase mb-5",
          )}
          style={{ color: "var(--color-muted)" }}
        >
          <span
            className="inline-flex px-4 py-1.5 rounded-full lsc-glass-strong"
            style={{ color: "var(--color-ink)" }}
          >
            {eyebrow}
          </span>
        </span>
      )}
      <h2
        className="text-3xl md:text-5xl font-bold leading-[1.12]"
        style={{ color: "var(--color-ink)", fontFamily: "var(--font-display)" }}
      >
        {title}
      </h2>
      <div className={cn("my-6", isCenter && "flex justify-center")}>
        <div
          className="h-[3px] w-24 rounded-full"
          style={{ background: `linear-gradient(90deg, ${accent}, var(--color-gold-thread), transparent)` }}
        />
      </div>
      {subtitle && (
        <p className="text-base md:text-lg text-[var(--color-ink-soft)] leading-relaxed">{subtitle}</p>
      )}
    </>
  );

  if (reduce) {
    return <div className={cn("max-w-3xl mb-12", isCenter && "mx-auto text-center", className)}>{inner}</div>;
  }

  return (
    <motion.div
      className={cn("max-w-3xl mb-12", isCenter && "mx-auto text-center", className)}
      initial={{ opacity: 0, y: 26, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{ type: "spring", stiffness: 80, damping: 16 }}
    >
      {inner}
    </motion.div>
  );
}
