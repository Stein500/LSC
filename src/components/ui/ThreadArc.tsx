// PHASE 0 — Un arc de fil (SVG) pour les séparateurs, signatures, transitions
// "couture". Très léger, décoratif.

type Props = {
  direction?: 'left' | 'right' | 'both';
  breathing?: boolean;
  color?: string;
  length?: number;
};

export function ThreadArc({
  direction = 'right',
  breathing = false,
  color = 'var(--color-gold-thread, #C9A87C)',
  length = 80,
}: Props) {
  const offset = direction === 'left' ? -length / 2 : direction === 'right' ? length / 2 : 0;
  return (
    <svg
      width="100%"
      height="20"
      viewBox={`0 0 ${length} 20`}
      className={breathing ? 'lsc-bob' : ''}
      aria-hidden="true"
    >
      <path
        d={`M 0 10 Q ${length / 4 + offset} 2, ${length / 2} 10 T ${length} 10`}
        fill="none"
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default ThreadArc;
