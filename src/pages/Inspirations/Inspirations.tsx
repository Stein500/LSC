import { SEO, SchemaBuilders } from '@/components/seo/SEO';
import { env } from '@/utils/env';
import { LEGAL } from '@/data/legal';
import { PageHeaderBand } from '@/components/ui/PageHeaderBand';
import { ModelGallery } from '@/components/ui/ModelGallery';
import { StitchDivider } from '@/components/ui/StitchDivider';
import { GALLERY_INSPIRATIONS_PAGES, INSPIRATIONS_SECTIONS } from '@/data/galleries';

/**
 * Page INSPIRATIONS — le show-room des modèles 👗
 * ------------------------------------------------
 * Que des galeries, section par section : mariages, robes, ensembles,
 * filles & layette, matières & mercerie.
 * Un modèle qui plaît ? On le touche → « Télécharger » ou « Commander ».
 */
export default function Inspirations() {
  const tousLesModeles = INSPIRATIONS_SECTIONS.flatMap((s) =>
    s.images.map((img) => ({
      name: img.caption ?? img.alt,
      url: `${env.siteUrl}/inspirations#${s.key}`,
      image: img.src,
    })),
  );

  return (
    <>
      <SEO
        title="Inspirations — les modèles de l'atelier"
        description={`Robes, boubous, mariages, jupes & mercerie : le show-room de ${LEGAL.displayName}. Touchez un modèle pour le télécharger ou le commander.`}
        path="/inspirations"
        ogImage="/images/gallery/inspirations-06.webp"
        keywords={[
          'modèles couture Porto-Novo',
          'robes wax Bénin',
          'boubous et ensembles africains',
          'robes de mariage sur mesure',
          'mercerie Porto-Novo',
          LEGAL.displayName,
        ]}
        jsonLd={[
          SchemaBuilders.organization(),
          SchemaBuilders.breadcrumb([
            { name: 'Accueil', url: '/' },
            { name: 'Inspirations', url: '/inspirations' },
          ]),
          SchemaBuilders.collectionPage({
            name: 'Inspirations — les modèles de l\u2019atelier',
            description: `Le show-room de modèles de ${LEGAL.displayName} : mariages, robes, ensembles, filles & layette, matières & mercerie.`,
            url: `${env.siteUrl}/inspirations`,
            hasPart: tousLesModeles,
          }),
        ]}
      />

      {/* ===== BANDEAU-GALERIE (visuel, juste sous le header) ===== */}
      <PageHeaderBand
        images={GALLERY_INSPIRATIONS_PAGES}
        introTitle="Le show-room des modèles"
        introSubtitle="Touchez un modèle : téléchargez-le, ou commandez-le tel quel."
        introLabel="Galerie Inspirations"
        seamCaption="Les modèles de l'atelier"
        maxHeight="min(54vh, 500px)"
      />

      {/* ===== LES SECTIONS DE MODÈLES — rien d'autre ===== */}
      <ModelGallery sections={INSPIRATIONS_SECTIONS} />

      <StitchDivider className="max-w-4xl mx-auto px-6 pb-10" accent label="Chaque modèle peut être le vôtre" />
    </>
  );
}
