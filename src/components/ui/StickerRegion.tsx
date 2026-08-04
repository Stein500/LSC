// PHASE 0 — Petit badge "drapeau + nom de pays" pour identifier une cliente.
// S'utilise après un nom, un témoignage, ou pour signaler la région d'un
// mood / profil. Existe aussi en <RegionStrip /> pour un groupe.

import { WORLD_CLOCK_CITIES } from '@/data/worldClock';

export type RegionCode =
  | 'BJ' | 'SN' | 'BF' | 'CI' | 'TN' | 'JP' | 'FR' | 'PT' | 'CN' | 'ML'
  | 'EG' | 'GH' | 'GN' | 'DZ' | 'IT' | 'RW' | 'NE' | 'MA' | 'MA-A';

const REGION_META: Record<RegionCode, { flag: string; label: string; tone: string }> = {
  BJ: { flag: '🇧🇯', label: 'Bénin', tone: 'var(--color-saffron)' },
  SN: { flag: '🇸🇳', label: 'Sénégal', tone: 'var(--color-mauve)' },
  BF: { flag: '🇧🇫', label: 'Burkina', tone: 'var(--color-gold-thread)' },
  CI: { flag: '🇨🇮', label: 'Côte d\'Ivoire', tone: 'var(--color-saffron)' },
  TN: { flag: '🇹🇳', label: 'Tunisie', tone: 'var(--color-mauve)' },
  JP: { flag: '🇯🇵', label: 'Japon', tone: 'var(--color-blush)' },
  FR: { flag: '🇫🇷', label: 'France', tone: 'var(--color-gold-thread)' },
  PT: { flag: '🇵🇹', label: 'Portugal', tone: 'var(--color-saffron)' },
  CN: { flag: '🇨🇳', label: 'Chine', tone: 'var(--color-rose-soft)' },
  ML: { flag: '🇲🇱', label: 'Mali', tone: 'var(--color-gold-thread)' },
  EG: { flag: '🇪🇬', label: 'Égypte', tone: 'var(--color-saffron)' },
  GH: { flag: '🇬🇭', label: 'Ghana', tone: 'var(--color-saffron)' },
  GN: { flag: '🇬🇳', label: 'Guinée', tone: 'var(--color-mauve)' },
  DZ: { flag: '🇩🇿', label: 'Algérie', tone: 'var(--color-rose-soft)' },
  IT: { flag: '🇮🇹', label: 'Italie', tone: 'var(--color-rose-soft)' },
  RW: { flag: '🇷🇼', label: 'Rwanda', tone: 'var(--color-saffron)' },
  NE: { flag: '🇳🇪', label: 'Niger', tone: 'var(--color-gold-thread)' },
  MA: { flag: '🇲🇦', label: 'Maroc', tone: 'var(--color-mauve)' },
  'MA-A': { flag: '🇲🇦', label: 'Marrakech', tone: 'var(--color-mauve)' },
};

export function StickerRegion({
  code,
  size = 16,
  showFlag = true,
  className = '',
}: {
  code: RegionCode;
  size?: number;
  showFlag?: boolean;
  className?: string;
}) {
  const meta = REGION_META[code];
  if (!meta) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-white/70 bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${className}`}
      style={{ color: 'var(--color-ink)' }}
    >
      {showFlag && <span style={{ fontSize: size * 0.75 }}>{meta.flag}</span>}
      <span>{meta.label}</span>
    </span>
  );
}

export function RegionStrip({
  codes,
  label,
  script = false,
}: {
  codes: RegionCode[];
  label?: string;
  script?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {label && (
        <span
          className={`text-xs ${script ? 'italic' : 'uppercase tracking-wider'} text-[var(--color-muted)]`}
          style={script ? { fontFamily: 'var(--font-script, "Caveat"), cursive' } : undefined}
        >
          {label}
        </span>
      )}
      {codes.map((c) => (
        <StickerRegion key={c} code={c} size={14} />
      ))}
    </div>
  );
}

/** Ré-exporte pour usage hors du fichier (ex: WallOfLove) */
export { WORLD_CLOCK_CITIES };
