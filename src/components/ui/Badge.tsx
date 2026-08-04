import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

type Tone = "citron" | "orange" | "neutral";

const tones: Record<Tone, string> = {
  citron: "bg-[var(--color-citron)] text-[var(--color-ink)]",
  orange: "bg-[var(--color-orange)] text-white",
  neutral: "bg-black/5 text-[var(--color-ink-soft)]",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}