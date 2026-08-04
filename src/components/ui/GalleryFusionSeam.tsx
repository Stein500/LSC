import { Scissors } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * GalleryFusionSeam — Séparateur thématique entre le hero et la galerie.
 *
 * Crée le "parfait mariage" visuel :
 *   - Fusion bord-à-bord : aucun gap de marge, le hero et la galerie
 *     partagent le même fond crème pour une continuité sans coupure.
 *   - Filet de ciseaux : un fin trait orange décoratif (rappel des lames
 *     de ScissorGallery) avec un petit picto ciseaux au centre, comme
 *     un trait de coupe couture qui signe la transition.
 *
 * S'installe dans un wrapper <section className="bg-[var(--color-cream)]">
 * immédiatement après le hero, AVANT le titre de la galerie.
 *
 * Le composant lui-même est transparent en pleine hauteur — il ne porte
 * que le trait et l'icône, sans fond ni padding lourd. Ainsi la section
 * reste fluide et unifiée avec le hero (qui termine déjà sur du crème).
 */
export function GalleryFusionSeam({
  className,
  /** Afficher la légende au-dessus du trait (optionnel) */
  caption,
}: {
  className?: string;
  caption?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center select-none",
        "py-5 md:py-6",
        className,
      )}
      aria-hidden="true"
    >
      {/* Trait gauche — gradient transparent → orange */}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--color-orange)]/55 to-[var(--color-orange)]/85" />

      {/* Centre — picto ciseaux sur petit disque blanc crème */}
      <div className="relative mx-3 md:mx-4">
        {/* Halo très léger */}
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40"
          style={{ backgroundColor: "var(--color-orange)" }}
        />
        {/* Disque */}
        <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-[var(--color-cream)] border border-[var(--color-orange)]/35 flex items-center justify-center shadow-sm">
          <Scissors
            className="w-4 h-4 md:w-5 md:h-5"
            style={{ color: "var(--color-orange)" }}
            strokeWidth={2.25}
          />
        </div>
        {/* Mini point décoratif au-dessus */}
        <span
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-orange)]"
        />
        {/* Mini point décoratif en dessous */}
        <span
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-orange)]"
        />
      </div>

      {/* Trait droit — gradient orange → transparent (miroir) */}
      <div className="flex-1 h-px bg-gradient-to-l from-transparent via-[var(--color-orange)]/55 to-[var(--color-orange)]/85" />

      {/* Caption optionnelle, en dessous, italic */}
      {caption && (
        <span
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[10px] md:text-xs uppercase tracking-[0.28em] text-[var(--color-orange)]/70 font-medium"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {caption}
        </span>
      )}
    </div>
  );
}