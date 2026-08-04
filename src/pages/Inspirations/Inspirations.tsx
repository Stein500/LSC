
import { SEO, SchemaBuilders } from '@/components/seo/SEO';
import { PageHeaderBand } from '@/components/ui/PageHeaderBand';
import { PageHero } from '@/components/ui/PageHero';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Masonry } from '@/components/ui/Masonry';
import { HeartPulse } from '@/components/ui/HeartPulse';
import { Sticker, type StickerName } from '@/components/ui/Sticker';
import { StickerRegion, type RegionCode } from '@/components/ui/StickerRegion';
import { GALLERY_INSPIRATIONS_PAGES } from '@/data/galleries';
import { PROFILES } from '@/data/profiles';

export default function Inspirations() {
  return (
    <>
      <SEO
        title="Inspirations du monde"
        description="Galerie d'inspirations couture, profils multiculturels et matières de l'atelier Les Services Colombes à Porto-Novo. 18 visages, 4 matières, 1 vision."
        path="/inspirations"
        ogImage="/images/gallery/inspirations-page-01.webp"
        keywords={[
          'inspirations couture Porto-Novo',
          'atelier couture Bénin',
          'tenues sur mesure multiculturelles',
          'profils couture africains',
          'bazin wax pagne',
          'Les Services Colombes',
        ]}
        jsonLd={[
          SchemaBuilders.organization(),
          SchemaBuilders.collectionPage({
            name: 'Inspirations du monde',
            description: 'Profils multiculturels et inspirations couture de l\'atelier Les Services Colombes',
            url: 'https://lesservicescolombes.vercel.app/inspirations',
            hasPart: PROFILES.map((p) => ({
              name: `${p.name} — ${p.city}`,
              url: `https://lesservicescolombes.vercel.app/inspirations#${p.id}`,
              image: '/images/logo.webp',
            })),
          }),
        ]}
      />

      {/* ===================== BIBLIOTHÈQUE GALERIE (juste après le header) ===================== */}
      <PageHeaderBand
        images={GALLERY_INSPIRATIONS_PAGES}
        introTitle="Un tour du monde en couture"
        introSubtitle="Des pagnes béninois aux caftans marocains, des boubous sénégalais aux kimonos revisités."
        introLabel="Galerie Inspirations"
        seamCaption="Galerie couture"
        maxHeight="min(54vh, 500px)"
      />

      {/* ===================== HERO ===================== */}
      <PageHero
        title="Inspirations du monde"
        subtitle="Une balade douce entre visages, matières et lumière ✨"
        image="/images/gallery/inspirations-page-01.webp"
        crumbs={[{ label: 'Accueil', to: '/' }, { label: 'Inspirations' }]}
      />

      {/* Intro */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-lg md:text-xl text-[var(--color-ink-soft)] leading-relaxed">
              Chez Les Services Colombes, chaque tenue raconte une ville et une matière. Cette galerie réunit{' '}
              <span style={{ fontFamily: 'var(--font-display)', color: 'var(--color-orange)' }}>
                {PROFILES.length} visages
              </span>
              , du Bénin à l'Afrique de l'Ouest, du Maghreb à l'Europe et l'Asie — tous passés par le même atelier, à Porto-Novo.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 md:py-16 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Profils"
            title={<>Profils inspirants</>}
            align="left"
          />
          <Masonry columns={{ sm: 1, md: 2, lg: 3 }} gap={16}>
            {PROFILES.map((profile) => (
              <Card key={profile.id} className="mb-4 break-inside-avoid">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">{profile.city}</p>
                  <StickerRegion code={profile.region as RegionCode} />
                </div>
                <h2 className="text-2xl mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  {profile.name}
                </h2>
                <div className="flex items-center gap-2 mb-4">
                  <Sticker
                    name={profile.stickerId as StickerName}
                    size={20}
                    className="text-[var(--color-orange)] shrink-0"
                  />
                  <p className="text-sm text-[var(--color-ink-soft)]">{profile.textile}</p>
                </div>
                <p className="text-sm leading-relaxed mb-4">{profile.story}</p>
                <div className="flex items-center gap-2 text-[var(--color-orange)]">
                  <HeartPulse size={16} />
                  <span className="text-sm">♡ Inspiration couture</span>
                </div>
              </Card>
            ))}
          </Masonry>
        </div>
      </section>
    </>
  );
}
