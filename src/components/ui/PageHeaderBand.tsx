import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scissors, X } from "lucide-react";
import { ScissorGallery, type GalleryImage } from "@/components/ui/ScissorGallery";
import { GalleryFusionSeam } from "@/components/ui/GalleryFusionSeam";

/**
 * PageHeaderBand
 * --------------------------------------------------------------
 * Bande d'ouverture commune à toutes les pages — posée juste après
 * le header (la barre de navigation). Elle combine :
 *
 *   1. Une intro cisaille douce et longue (par défaut **3 000 ms**)
 *      qui présente la section à venir et s'efface avec un fondu.
 *   2. Une galerie "bibliothèque" propre à la page.
 *   3. Le séparateur coutura qui signe la transition vers le héros.
 *
 * Cette itération :
 *
 *   - Durée d'intro : **3 000 ms** (alignée sur PageIntroOverlay).
 *
 *   - Lisibilité :
 *       · libellé orange vif (au lieu de gris muted),
 *       · titre H2 plus grand, en serif contrasté,
 *       · corps de texte plus lisible (couleur `ink-soft` →
 *         `ink` pour un meilleur contraste),
 *       · carte opaque (white/95) au lieu de white/92.
 *
 *   - Couleurs :
 *       · picto ciseaux sur fond citron avec halo doux,
 *       · picto orange vif (au lieu de muted),
 *       · bordure orange subtile (rgba) et ombre profonde.
 *
 *   - Animations :
 *       · easeOutExpo custom (cohérent avec le splash),
 *       · ciseaux qui ondulent (rotation + scale combiné),
 *       · barre de coupe en miroir gauche → droite → gauche,
 *       · chute de fil en cascade (6 points).
 *
 *   - Clic :
 *       · clic sur le bandeau → skip (ferme l'intro),
 *       · bouton "Passer" explicite apparaît au survol,
 *       · raccourci clavier `Esc` aussi.
 *
 *   - Mémoire :
 *       · `bandKey` (basé sur introTitle) → mémorise la section
 *         déjà visitée dans la session. Au retour, l'intro est
 *         raccourcie à 800 ms (au lieu de rejouer 3 s en boucle).
 *
 * Accessibilité :
 *   - role="button" + aria-label sur le bandeau interactif,
 *   - skip purement visuel (`aria-hidden` sur les ornements).
 *   - Esc accessible aussi.
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
  introSubtitle = "Découvrez l'univers des Services Colombes.",
  introLabel = "Ouverture de section",
  seamCaption,
  introDurationMs = 3000,
  autoPlayInterval = 6000,
  maxHeight = "min(56vh, 520px)",
}: PageHeaderBandProps) {
  // Key d'unicité : basé sur le titre pour reconnaître la section
  const bandKey = `lsc_page_band_${introTitle.toLowerCase().replace(/\s+/g, "_")}`;

  const [introVisible, setIntroVisible] = useState(true);
  const skip = useCallback(() => setIntroVisible(false), []);
  const rememberRef = useRef<string | null>(null);

  // easeOutExpo custom — coherence avec le splash / PageIntroOverlay
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
                className="relative overflow-hidden rounded-[2rem] border-2 bg-white/95 px-6 py-5 backdrop-blur-xl transition-all group-hover:bg-white group-hover:-translate-y-0.5 group-hover:shadow-2xl"
                style={{
                  borderColor: "rgba(139, 69, 19, 0.25)",
                  boxShadow:
                    "0 18px 60px rgba(26,26,26,0.16), 0 0 0 1px rgba(255,255,255,0.6) inset",
                }}
              >
                {/* Halo doux derrière le picto */}
                <motion.div
                  className="absolute -top-10 left-6 h-28 w-28 rounded-full blur-2xl pointer-events-none"
                  style={{ background: "rgba(209,35,42,0.55)" }}
                  animate={{ scale: [1, 1.18, 1], opacity: [0.55, 1, 0.55] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Bouton "Passer" — apparaît au survol */}
                <span
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-line)]/60 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink-soft)] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  Passer <X className="w-3 h-3" />
                </span>

                {/* Ligne 1 : picto ciseaux + barre de coupe + chute de fil */}
                <div className="relative flex items-center gap-3">
                  {/* Picto ciseaux — ondule */}
                  <motion.div
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-white shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(209,35,42,0.55) 0%, rgba(209,35,42,0.18) 100%)",
                    }}
                    animate={{
                      rotate: [0, -12, 6, -10, 8, 0],
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ duration: 2, ease: easeOutExpo, repeat: Infinity }}
                  >
                    <Scissors className="h-5 w-5" strokeWidth={2.4} style={{ color: "var(--color-orange)" }} />
                  </motion.div>

                  {/* Barre de coupe orange — passe en miroir */}
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-citron)]/30">
                    <motion.span
                      className="block h-full w-20 rounded-full"
                      style={{
                        background:
                          "linear-gradient(90deg, var(--color-citron) 0%, var(--color-orange) 100%)",
                      }}
                      animate={{ x: ["-110%", "320%", "-110%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", times: [0, 0.55, 1] }}
                    />
                  </div>

                  {/* Cascade de points — chute de fil */}
                  <div className="hidden sm:flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="block h-1.5 w-1.5 rounded-full bg-[var(--color-orange)]/85"
                        animate={{ y: [0, 5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                </div>

                {/* Libellé — couleur orange pour ressortir du fond */}
                <motion.p
                  className="mt-4 text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-orange)]"
                  style={{ fontFamily: "var(--font-display)" }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08, duration: 0.35 }}
                >
                  {introLabel}
                </motion.p>

                {/* Titre — plus grand et contrasté */}
                <motion.h2
                  className="mt-1 text-2xl md:text-3xl text-[var(--color-ink)] leading-tight"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.16, duration: 0.4 }}
                >
                  {introTitle}
                </motion.h2>

                {/* Sous-titre — meilleure lisibilité */}
                <motion.p
                  className="mt-2 text-[14px] md:text-[15px] leading-relaxed text-[var(--color-ink)]"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.4 }}
                >
                  {introSubtitle}
                </motion.p>
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
