// PHASE 0 — Petits ✦ qui scintillent autour d'un élément.
// Très utile pour souligner un titre, un sticker, un callout.

type ColorKey = 'gold-thread' | 'citron';

const colorMap: Record<ColorKey, string> = {
  'gold-thread': 'var(--color-gold-thread, #C9A87C)',
  citron: 'var(--color-citron, #D1232A)',
};

type Props = {
  count?: 3 | 5 | 8;
  color?: ColorKey;
  loop?: boolean;
};

export function Sparkles({
  count = 3,
  color = 'gold-thread',
  loop = true,
}: Props) {
  const positions = Array.from({ length: count }, (_, i) => ({
    x: `${(i / count) * 100}%`,
    delay: i * 0.3,
  }));
  return (
    <div
      className="pointer-events-none relative inline-flex"
      style={{ minHeight: 14 }}
      aria-hidden="true"
    >
      {positions.map((p, i) => (
        <span
          key={i}
          className={loop ? 'lsc-twinkle' : ''}
          style={{
            position: 'absolute',
            left: p.x,
            top: 0,
            color: colorMap[color],
            fontSize: 14,
            animationDelay: `${p.delay}s`,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

export default Sparkles;
