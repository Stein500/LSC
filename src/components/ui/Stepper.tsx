import { Check } from "lucide-react";

/**
 * Stepper — barre de progression multi-étapes.
 * Affichée en haut des formulaires longs (Formation, Precommande).
 */
export function Stepper({
  steps,
  current,
  className = "",
}: {
  steps: { key: string; label: string }[];
  current: number;
  className?: string;
}) {
  const total = steps.length;
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-2 text-xs font-medium">
        <span className="text-[var(--color-orange)]">
          Étape {Math.min(current + 1, total)} / {total}
        </span>
        <span className="text-[var(--color-muted)]">{steps[current]?.label}</span>
      </div>

      <div className="relative h-1.5 rounded-full bg-[var(--color-line)] overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{
            width: `${((current + 1) / total) * 100}%`,
            background: "linear-gradient(90deg, var(--color-citron) 0%, var(--color-orange) 100%)",
          }}
        />
      </div>

      <ol className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}>
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <li
              key={s.key}
              className={`flex items-center gap-2 text-[11px] sm:text-xs font-medium truncate ${
                done ? "text-[var(--color-citron-d)]" : active ? "text-[var(--color-orange)]" : "text-[var(--color-muted)]"
              }`}
            >
              <span
                className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  done
                    ? "bg-[var(--color-citron-d)] text-[var(--color-ink)]"
                    : active
                      ? "bg-[var(--color-orange)] text-white"
                      : "bg-[var(--color-line)] text-[var(--color-muted)]"
                }`}
              >
                {done ? <Check className="w-3 h-3" strokeWidth={3} /> : i + 1}
              </span>
              <span className="truncate">{s.label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}