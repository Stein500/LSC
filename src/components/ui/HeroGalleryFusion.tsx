import type { ReactNode } from "react";

/**
 * HeroGalleryFusion — Wrapper qui matérialise le "parfait mariage" hero ↔ galerie.
 *
 *   1. Le <PageHero> (ou hero custom) rend la section en bg crème dégradé
 *      (le bas du hero est déjà en crème à 95% d'opacité).
 *   2. La <GalleryFusionSeam> assure la couture visuelle (filet orange + ciseaux).
 *   3. Le contenu suivant (titre de section + ScissorGallery) reste sur
 *      fond crème continu — zéro rupture chromatique.
 *
 * Ce wrapper n'impose pas de layout : il se contente d'aligner
 * verticalement les enfants avec un fond crème commun, en supprimant
 * toute marge résiduelle entre le hero et la suite.
 *
 * Usage typique dans une page :
 *   <PageHero ... />
 *   <HeroGalleryFusion>
 *     <GalleryFusionSeam />
 *     <SectionTitle ... />
 *     <ScissorGallery ... />
 *   </HeroGalleryFusion>
 *   <section className="bg-white"> ... suite de la page ... </section>
 */
export function HeroGalleryFusion({ children }: { children: ReactNode }) {
  return (
    <section
      className="relative bg-[var(--color-cream)] -mt-px"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      {/* Petit liseré orange en haut, signature subtile de la "coupe couture" */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, var(--color-orange) 50%, transparent 100%)",
          opacity: 0.35,
        }}
        aria-hidden="true"
      />
      {children}
    </section>
  );
}