import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Scissors, Smartphone } from "lucide-react";
import { cn } from "@/utils/cn";
import { env } from "@/utils/env";
import { SmartImage } from "@/components/ui/SmartImage";

/**
 * HeaderAppBadge — le trône du header 👑
 * -------------------------------------
 * Par défaut : le médaillon-logo (badge royal).
 * Toutes les 5 minutes, un discret badge « APP » prend PARFAITEMENT la
 * place du logo pendant 60 secondes — sans envahir : même emplacement,
 * mêmes dimensions, zéro déplacement de mise en page, simple flip doux —
 * puis le logo revient sur son trône.
 *
 * Le bouton invite à télécharger l'application mise à jour (correctifs)
 * lorsque l'application actuelle pose problème. Il s'ouvre dans un
 * navigateur EXTERNE (Chrome, Firefox…) : `target="_blank"` + `external`
 * + tentative `window.open`. L'URL n'est JAMAIS affichée en clair —
 * ni dans le libellé, ni dans une infobulle visible, nulle part.
 *
 * Dans l'app Android (WebView), c'est le bridge natif qui intercepte ces
 * ouvertures et les délègue au navigateur du téléphone (cf. KOTLIN_APP_PROMPT.md).
 */
const APP_BADGE_FIRST_MS = 120_000; // 1re apparition : 2 min après l'arrivée
const APP_BADGE_EVERY_MS = 300_000; // puis toutes les 5 minutes
const APP_BADGE_SHOW_MS = 60_000; // visible 60 s à chaque passage

const APP_BADGE_LABEL = "Télécharger l'application Colombes — mise à jour & correctifs";

export function HeaderAppBadge({ scrolled }: { scrolled: boolean }) {
  const [showApp, setShowApp] = useState(false);
  const reduceMotion = useReducedMotion();
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    const cycle = () => {
      setShowApp(true);
      later(() => setShowApp(false), APP_BADGE_SHOW_MS);
      later(cycle, APP_BADGE_EVERY_MS);
    };
    later(cycle, APP_BADGE_FIRST_MS);
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, []);

  /** Force le navigateur externe quand le contexte le permet. */
  const openExternally = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const w = window.open(env.appUpdateUrl, "_blank", "noopener,noreferrer");
    if (w) {
      e.preventDefault();
      w.opener = null;
    }
    // Sinon : l'ancre target="_blank" + rel="external" fait son œuvre
    // (navigateur courant, ou WebView → bridge natif de l'app).
  };

  const flip = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { rotateY: 90, opacity: 0.35 },
        animate: { rotateY: 0, opacity: 1 },
        exit: { rotateY: -90, opacity: 0.35 },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
      };

  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden shrink-0 transition-all duration-300 hover:scale-105",
        // 🛡️ Badge royal : grand médaillon qui dépasse sous le bandeau,
        // puis se resserre joliment dès qu'on défile.
        scrolled
          ? "w-11 h-11 sm:w-12 sm:h-12"
          : "w-[60px] h-[60px] sm:w-16 sm:h-16 -mb-7 sm:-mb-9",
      )}
      style={{
        border: "3px solid var(--color-citron)",
        boxShadow: "0 8px 22px rgba(92,46,12,0.38), 0 0 0 3px rgba(201,168,124,0.45)",
        perspective: 600,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {showApp ? (
          <motion.a
            key="app"
            {...flip}
            href={env.appUpdateUrl}
            target="_blank"
            rel="noopener noreferrer external"
            onClick={openExternally}
            title={APP_BADGE_LABEL}
            aria-label={`${APP_BADGE_LABEL} — s'ouvre dans un navigateur externe`}
            className="absolute inset-0 flex flex-col items-center justify-center gap-[2px] text-[var(--color-citron)]"
            style={{ background: "radial-gradient(circle at 32% 26%, #262631 0%, #0B0B12 68%)" }}
          >
            {/* Anneau d'appel doux — une seule salve à l'apparition */}
            {!reduceMotion && (
              <motion.span
                className="absolute inset-0 rounded-full"
                style={{ border: "2px solid var(--color-citron)" }}
                initial={{ opacity: 0.65, scale: 1 }}
                animate={{ opacity: 0, scale: 1.5 }}
                transition={{ duration: 1.5, repeat: 2, ease: "easeOut" }}
                aria-hidden="true"
              />
            )}
            <Smartphone className="w-[42%] h-[42%]" strokeWidth={2} aria-hidden="true" />
            <span
              className="text-[7px] sm:text-[8px] font-extrabold tracking-[0.22em] leading-none"
              style={{ fontFamily: "var(--font-display)" }}
            >
              APP
            </span>
          </motion.a>
        ) : (
          <motion.div key="logo" {...flip} className="absolute inset-0">
            <Link to="/" aria-label="Accueil — Les Services Colombes" className="block w-full h-full">
              <SmartImage
                src="/images/logo.webp"
                alt="Les Services Colombes"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const el = e.currentTarget as HTMLImageElement;
                  el.style.display = "none";
                  (el.parentElement?.querySelector("[data-fallback-logo]") as HTMLElement | null)?.style.setProperty(
                    "display",
                    "flex",
                  );
                }}
              />
              <span
                data-fallback-logo
                className="absolute inset-0 items-center justify-center text-[var(--color-orange)]"
                style={{ display: "none" }}
                aria-hidden="true"
              >
                <Scissors className="w-5 h-5" />
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
