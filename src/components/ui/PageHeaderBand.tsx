import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ScissorGallery, type GalleryImage } from "@/components/ui/ScissorGallery";
import { GalleryFusionSeam } from "@/components/ui/GalleryFusionSeam";
import { SmartImage } from "@/components/ui/SmartImage";

/**
 * PageHeaderBand
 * --------------------------------------------------------------
 * Bande d'ouverture commune à toutes les pages — posée juste après
 * le header (la barre de navigation). Elle combine :
 *
 *   1. Une intro **épurée** (09/2026 ✂️) : médaillon colombe, le
 *      libellé de section, un titre, et **un fil wax qui se tend**.
 *      Pose 2 400 ms (« dure » le temps de lire) — la valse des
 *      ciseaux, barres de coupe et cascades a été rangée : simple,
 *      élégant, intemporel.
 *   2. Une galerie "bibliothèque" propre à la page.
 *   3. Le séparateur coutura qui signe la transition vers le héros.
 *
 *   - Mémoire : section déjà vue (session) → intro raccourcie 800 ms ;
 *   - Skip : clic sur la carte, bouton « Passer » au survol, ou Esc ;
 *   - easeOutExpo maison, un seul élément animé (le fil wax).
 */
export type PageHeaderBandProps = {
  /** Galerie propre à la page (atelier / créations / formation / contact) */
  images: GalleryImage[];
  /** Titre affiché dans l'overlay d'intro (ex : "L'atelier") */
  introTitle?: string;
  /** Sous-titre affiché dans l'overlay d'intro */
  introSubtitle?: string;
  /** Étiquette affichée en small-caps au-dessus du titre */
  introLabel?: string;
  /** Légende du seam de séparation sous la galerie */
  seamCaption?: string;
  /** Durée d'affichage de l'overlay en ms (défaut : 3 000) */
  introDurationMs?: number;
  /** Intervalle d'auto-défilement de la galerie */
  autoPlayInterval?: number;
  /** Hauteur max de la galerie */
  maxHeight?: string;
};

export function PageHeaderBand({
  images,
  introTitle = "Bienvenue",
  introSubtitle = "Découvrez l'univers de Couture Colombe et Merceries.",
  introLabel = "Ouverture de section",
  seamCaption,
  introDurationMs = 2400,
  autoPlayInterval = 6000,
  maxHeight = "min(56vh, 520px)",
}: PageHeaderBandProps) {
  // Key d'unicité : basé sur le titre pour reconnaître la section
  const bandKey = `lsc_page_band_${introTitle.toLowerCase().replace(/\s+/g, "_")}`;

  const [introVisible, setIntroVisible] = useState(true);
  const skip = useCallback(() => setIntroVisible(false), []);
  const rememberRef = useRef<string | null>(null);

  // easeOutExpo custom — cohérence avec le splash de l'application
  const easeOutExpo = [0.22, 1, 0.36, 1] as const;

  useEffect(() => {
    if (typeof window === "undefined") return;

    rememberRef.current = bandKey;

    const alreadySeen = sessionStorage.getItem(bandKey) === "1";
    if (alreadySeen) {
      // Si on a déjà vu cette section, on raccourcit l'intro
      const short = window.setTimeout(() => setIntroVisible(false), 800);
      return () => window.clearTimeout(short);
    }

    sessionStorage.setItem(bandKey, "1");
    const t = window.setTimeout(() => setIntroVisible(false), introDurationMs);
    return () => window.clearTimeout(t);
  }, [bandKey, introDurationMs]);

  // Esc — raccourci clavier pour passer
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  return (
    <section className="relative bg-[var(--color-cream)] scroll-mt-header" id="band">
      {/* === Overlay cisaille — bandeau cliquable pour passer === */}
      <AnimatePresence>
        {introVisible && (
          <motion.div
            className="absolute inset-x-0 top-0 z-30 flex justify-center px-4 pt-24 md:pt-28"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
            aria-hidden="true"
          >
            <button
              type="button"
              onClick={skip}
              aria-label="Passer l'introduction"
              className="group block w-full max-w-md cursor-pointer rounded-[2rem] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)] focus-visible:ring-offset-2"
            >
              <div
                className="relative overflow-hidden rounded-[2rem] border border-[var(--color-line)] bg-white/95 px-6 py-5 backdrop-blur-md transition-all group-hover:bg-white group-hover:-translate-y-0.5 group-hover:shadow-2xl shadow-[0_18px_44px_-18px_rgba(60,38,20,0.30)]"
              >
                {/* Bouton "Passer" — apparaît au survol */}
                <span
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-line)]/60 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink-soft)] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  Passer <X className="w-3 h-3" />
                </span>

                {/* Une seule respiration : médaillon, titres, fil wax */}
                <div className="relative flex items-center gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full overflow-hidden bg-white"
                    style={{ border: "2px solid var(--color-citron)", boxShadow: "0 4px 14px rgba(92,46,12,0.25)" }}
                  >
                    <SmartImage src="/images/logo.webp" alt="" decorative className="h-full w-full object-cover" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.42em] text-[var(--color-orange)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {introLabel}
                    </p>
                    <h2
                      className="mt-1 truncate text-xl md:text-2xl text-[var(--color-ink)] leading-tight"
                      style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                    >
                      {introTitle}
                    </h2>
                    {introSubtitle ? (
                      <p className="mt-0.5 truncate text-[13px] md:text-sm italic text-[var(--color-ink-soft)]">
                        {introSubtitle}
                      </p>
                    ) : null}

                    {/* Le fil wax qui se tend — quatre fils de pagne, un seul geste */}
                    <motion.span
                      className="lsc-wax-bande lsc-wax-bande--soft mt-3 block rounded-full"
                      style={{ transformOrigin: "left center" }}
                      initial={{ scaleX: 0, opacity: 0 }}
                      animate={{ scaleX: 1, opacity: 1 }}
                      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === Galerie bibliothèque — affichée juste sous le header === */}
      <div className={`relative pt-28 md:pt-32 pb-10 md:pb-14 transition-opacity duration-500 ${introVisible ? "opacity-90" : "opacity-100"}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScissorGallery
            images={images}
            autoPlayInterval={autoPlayInterval}
            showCaptions
            maxHeight={maxHeight}
          />
        </div>

        {/* Seam coutura — sépare la galerie du héros */}
        <GalleryFusionSeam caption={seamCaption} className="mt-2" />
      </div>
    </section>
  );
}
