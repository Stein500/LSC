import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Scissors, X } from "lucide-react";
import { env } from "@/utils/env";
import { SmartImage } from "@/components/ui/SmartImage";

/**
 * PageIntroOverlay — bandeau cisaille d'ouverture de page / section.
 *
 * Cette itération :
 *
 *   - Durée par défaut : **3 000 ms** (le user a demandé + de douceur).
 *     La séquence s'étale en 3 paliers :
 *       · 0    → 220 ms   : fade-in + slide down du bandeau
 *       · 220  → 2 200 ms : affichage actif (ciseaux ondulent, barre
 *                            de coupe défile, chute de fil pulse)
 *       · 2 200 → 3 000 ms : fondu de sortie + remontée légère
 *
 *   - Lisibilité :
 *       · libellé + 30 % plus gros, en couleur orange pour le sortir
 *         du gris,
 *       · titre serif plus grand (Playfair),
 *       · corps de texte avec `tracking` plus serré et couleur
 *         intensifiée (`color-ink` au lieu de `color-ink-soft`),
 *       · contraste carte / fond renforcé (bg `white/95`),
 *       · ombre plus prononcée et bordure gradient subtil.
 *
 *   - Couleurs :
 *       · picto ciseaux ancré sur orange vif (au lieu de muted),
 *       · badge citron plus saturé pour le logo,
 *       · pill supérieure fine (border-orange) au-dessus du libellé
 *         pour bien segmenter l'info.
 *
 *   - Animations :
 *       · entrée du bandeau en `cubic-bezier(0.22, 1, 0.36, 1)` —
 *         easeOutExpo custom, plus douce qu'un easeOut générique,
 *       · ciseaux avec rotation + translation combinées
 *         (effet "lame qui s'ouvre puis se ferme"),
 *       · barre de coupe qui alterne gauche → droite en miroir,
 *       · chute de fil avec décalage `i*0.12s` pour effet cascade.
 *
 *   - Clic :
 *       · clic sur le bandeau → skip (ferme l'overlay),
 *       · bouton "Passer" explicite en haut à droite du bandeau,
 *       · accessible clavier (button + focus visible).
 */
export function PageIntroOverlay({
  label = "Ouverture de page",
  subtitle = "Une couture élégante, des finitions soignées.",
  durationMs = 3000,
  /** Tag d'unicité — si fourni, on raccourcit l'intro quand on a déjà vu la section. */
  memoryKey,
  /** Affichage du bouton "Passer" (défaut : true). */
  showSkip = true,
}: {
  label?: string;
  subtitle?: string;
  durationMs?: number;
  memoryKey?: string;
  showSkip?: boolean;
}) {
  const [visible, setVisible] = useState(true);

  const skip = useCallback(() => setVisible(false), []);

  // Mémorise la 1ʳᵉ visite pour raccourcir l'intro à 800 ms (était 600)
  // quand on a déjà vu la section durant la session.
  const rememberRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;

    let duration = durationMs;
    if (memoryKey) {
      const k = `lsc_overlay_seen_${memoryKey}`;
      rememberRef.current = k;
      const alreadySeen = sessionStorage.getItem(k) === "1";
      if (alreadySeen) {
        duration = 800;
      } else {
        sessionStorage.setItem(k, "1");
      }
    }

    const t = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(t);
  }, [durationMs, memoryKey]);

  // Échappatoire clavier — `Esc` ferme aussi l'intro (accesibilité).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  // easeOutExpo custom — doux et naturel (utilisé partout)
  const easeOutExpo = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -22 }}
          transition={{ duration: 0.45, ease: easeOutExpo }}
          className="absolute left-1/2 top-4 z-20 w-[min(94vw,820px)] -translate-x-1/2"
        >
          <button
            type="button"
            onClick={skip}
            aria-label="Passer l'introduction"
            className="group block w-full text-left cursor-pointer rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-orange)] focus-visible:ring-offset-2"
          >
            <div
              className="relative overflow-hidden rounded-3xl border-2 bg-white/95 px-5 py-4 backdrop-blur-xl transition-all group-hover:bg-white group-hover:shadow-2xl group-hover:-translate-y-0.5"
              style={{
                borderColor: "rgba(139, 69, 19, 0.25)",
                boxShadow:
                  "0 18px 50px rgba(26,26,26,0.14), 0 0 0 1px rgba(255,255,255,0.6) inset",
              }}
            >
              {/* Halo doux derrière le picto */}
              <motion.div
                className="absolute -top-8 left-6 h-24 w-24 rounded-full blur-2xl pointer-events-none"
                style={{ background: "rgba(191,255,0,0.5)" }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Bouton "Passer" interne */}
              {showSkip && (
                <span
                  className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[var(--color-line)]/60 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink-soft)] opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  Passer <X className="w-3 h-3" />
                </span>
              )}

              <div className="relative flex items-center gap-3.5">
                {/* Logo / picto ciseaux — plus visible */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full overflow-hidden shadow-sm"
                  style={{ border: "2.5px solid var(--color-citron)", boxShadow: "0 4px 14px rgba(92,46,12,0.28)" }}>
                  <SmartImage
                    src="/images/logo.webp"
                    alt=""
                    decorative
                    className="h-full w-full object-cover"
                    onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
                  />
                </div>

                {/* Ciseaux animés — ondule avec translation + rotation */}
                <motion.div
                  className="hidden md:flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-citron)]/35 text-[var(--color-orange)] border border-white/60 shadow-sm"
                  animate={{
                    rotate: [0, -12, 8, -8, 6, 0],
                    scale: [1, 1.06, 0.98, 1.04, 1],
                  }}
                  transition={{ duration: 2.2, ease: easeOutExpo, repeat: Infinity }}
                >
                  <Scissors className="h-5 w-5" strokeWidth={2.4} />
                </motion.div>

                <div className="min-w-0 flex-1">
                  {/* Libellé — couleur orange, plus lisible */}
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-orange)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {label}
                  </p>
                  {/* Titre serif plus gros, contraste fort */}
                  <p
                    className="mt-0.5 truncate text-base md:text-lg font-bold text-[var(--color-ink)]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {env.atelierName} — <span className="text-[var(--color-ink-soft)] font-medium italic">{env.atelierTagline}</span>
                  </p>
                  {/* Sous-texte —> contraste amélioré */}
                  <p className="mt-0.5 truncate text-[13px] text-[var(--color-ink)] leading-tight">
                    {subtitle}
                  </p>
                </div>

                {/* Ciseaux + trait à droite — visible à partir de `sm` */}
                <div className="hidden sm:flex items-center gap-2 text-[var(--color-orange)] ml-2">
                  <motion.div
                    className="flex items-center gap-2"
                    animate={{ x: [-12, 12, -12] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Scissors className="h-4 w-4 rotate-12" strokeWidth={2.4} />
                    <span className="h-px w-16 bg-gradient-to-r from-transparent via-[var(--color-orange)] to-transparent" />
                    <Scissors className="h-4 w-4 -rotate-12" strokeWidth={2.4} />
                  </motion.div>
                </div>
              </div>

              {/* Barre de coupe — la lame qui avance */}
              <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-[var(--color-line)]">
                <motion.div
                  className="absolute inset-y-0 left-0 w-1/3 rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, var(--color-citron), var(--color-orange))",
                  }}
                  initial={{ x: "-100%" }}
                  animate={{ x: ["100%", "-100%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>

              {/* Chute de fil — cascade de points */}
              <div className="flex items-center justify-center gap-1.5 mt-2.5">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.span
                    key={i}
                    className="block h-1 w-1 rounded-full bg-[var(--color-orange)]/80"
                    animate={{ y: [0, 4, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.12, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
