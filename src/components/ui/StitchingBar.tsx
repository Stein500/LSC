// PHASE 0 — Barre de "couture" : segments pointillés dorés qui se déplacent
// en cascade, comme une machine à coudre qui avance.

type Props = {
  segments?: 6 | 8 | 12;
  color?: string;
  duration?: number;
};

export function StitchingBar({
  segments = 8,
  color = 'var(--color-gold-thread, #C9A87C)',
  duration = 4,
}: Props) {
  return (
    <div className="flex w-full items-center gap-1.5 py-2" aria-hidden="true">
      {Array.from({ length: segments }, (_, i) => (
        <span
          key={i}
          className="h-0.5 flex-1"
          style={{
            background: `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 8px)`,
            opacity: 0.6,
            animation: `lsc-twinkle ${duration}s ease-in-out infinite`,
            animationDelay: `${(i / segments) * duration}s`,
          }}
        />
      ))}
    </div>
  );
}

export default StitchingBar;
