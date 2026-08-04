import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { HeartPulse } from '@/components/ui/HeartPulse';
import { Masonry } from '@/components/ui/Masonry';
import { PROFILES } from '@/data/profiles';

// ============================================================================
// WALLOFLOVE — v2 (Phase 3)
// 2 profils featured sur la home + bouton "voir plus" → /inspirations
// ============================================================================

const FEATURED = [...PROFILES]
  .sort((a, b) => {
    const score = (p: { country: string }) =>
      p.country === 'BJ' ? 3 : p.country === 'BF' ? 2 : p.country === 'SN' ? 1 : 0;
    return score(b) - score(a);
  })
  .slice(0, 2);

export function WallOfLove() {
  return (
    <section className="py-16 md:py-24 bg-[var(--color-paper)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Wall of Love"
          title={<>Des inspirations qui donnent envie de créer</>}
          subtitle="Deux visages pour faire vivre l'atelier avec douceur — et 16 autres à découvrir 🤍"
          align="left"
          tone="orange"
        />

        {/* === MASONRY : 2 PROFILS UNIQUEMENT === */}
        <Masonry columns={{ sm: 1, md: 2 }} gap={16}>
          {FEATURED.map((profile) => (
            <Card key={profile.id} className="mb-4 break-inside-avoid">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)] mb-2">
                {profile.city} · {profile.country}
              </p>
              <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                {profile.name}
              </h3>
              <p className="text-sm text-[var(--color-ink-soft)] mb-4">{profile.textile}</p>
              <div className="flex items-center gap-2 text-[var(--color-orange)]">
                <HeartPulse size={16} />
                <span className="text-sm">♡ {profile.story}</span>
              </div>
            </Card>
          ))}
        </Masonry>

        {/* === BOUTON VOIR PLUS === */}
        <div className="mt-8 text-center">
          <Link
            to="/inspirations"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--color-orange)] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[var(--color-saffron)] hover:scale-105 active:scale-95"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <span>Voir toutes les inspirations</span>
            <HeartPulse size={16} color="blush" />
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
