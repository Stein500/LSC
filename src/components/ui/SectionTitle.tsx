import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Props = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  tone?: "citron" | "orange";
  className?: string;
};

export function SectionTitle({ eyebrow, title, subtitle, align = "center", tone = "citron", className }: Props) {
  const isCenter = align === "center";
  const accent = tone === "citron" ? "var(--color-citron)" : "var(--color-orange)";
  return (
    <div className={cn("max-w-3xl mb-12", isCenter && "mx-auto text-center", className)}>
      {eyebrow && (
        <span
          className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.18em] uppercase mb-4"
          style={{ backgroundColor: `${accent}20`, color: "var(--color-ink)" }}
        >
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-5xl font-bold leading-tight" style={{ color: "var(--color-ink)" }}>
        {title}
      </h2>
      <div
        className={cn("h-1 w-20 rounded-full my-6", isCenter && "mx-auto")}
        style={{ backgroundColor: accent }}
      />
      {subtitle && (
        <p className="text-base md:text-lg text-[var(--color-ink-soft)] leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
}