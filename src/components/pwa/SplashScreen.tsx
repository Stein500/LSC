import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSplashMemory } from "@/hooks/useSplashMemory";

// ============================================================================
// SPLASH « L'ATELIER S'OUVRE » — v6 (2026)
// Cinématique d'ouverture ~2,6 s → les rideaux de l'atelier s'écartent.
//   - Wordmark lettre par lettre (ressort) + fil d'or qui se coud
//   - ✂ qui glisse le long du fil
//   - Skippable (tap / bouton Passer / Échap), 1 fois par 3 h
//   - reduced-motion : jamais affiché
// ============================================================================

const SESSION_KEY = "lscolombes:splash-atelier:v1";
const TTL_MS = 3 * 60 * 60 * 1000; // 3 h
const HOLD_MS = 2600;              // durée d'affichage avant ouverture
const OPEN_MS = 900;               // durée d'ouverture des rideaux

const WORDMARK = "Colombes";

export function SplashScreen() {
  const reduceMotion = useReducedMotion();
  const { shouldShow, markSeen } = useSplashMemory(SESSION_KEY, TTL_MS);
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const holdTimer = useRef<number | null>(null);

  // Ouverture au montage
  useEffect(() => {
    if (!shouldShow || reduceMotion) return;
    markSeen();
    setVisible(true);
  }, [shouldShow, reduceMotion, markSeen]);

  const close = useCallback(() => {
    setOpening(true); // d'éclanche les rideaux
  }, []);

  // Fermeture automatique après HOLD_MS
  useEffect(() => {
    if (!visible) return;
    holdTimer.current = window.setTimeout(close, HOLD_MS);
    return () => {
      if (holdTimer.current != null) window.clearTimeout(holdTimer.current);
    };
  }, [visible, close]);

  // Échap pour passer
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  // reduced-motion : jamais affiché (accessibilité).
  if (reduceMotion) {
    return null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed inset-0 z-[70] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Ouverture de l'atelier"
          onClick={close}
        >
          {/* ================= RIDEAU GAUCHE ================= */}
          <motion.div
            className="absolute top-0 bottom-0 left-0 w-1/2"
            style={{
              background: "linear-gradient(225deg, #131318 0%, #0B0B12 60%, #08080C 100%)",
              borderRight: "1px solid rgba(201,168,124,0.35)",
            }}
            initial={{ x: 0 }}
            animate={opening ? { x: "-100%" } : { x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: OPEN_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => {
              if (opening) setVisible(false);
            }}
          >
            {/* ourlet doré vertical */}
            <div
              className="absolute top-0 bottom-0 right-0 w-[3px]"
              style={{ background: "linear-gradient(180deg, transparent, rgba(201,168,124,0.6) 30%, rgba(201,168,124,0.6) 70%, transparent)" }}
            />
            {/* plis du tissu */}
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ background: "repeating-linear-gradient(90deg, transparent 0 34px, rgba(255,255,255,0.5) 34px 36px)" }} />
          </motion.div>

          {/* ================= RIDEAU DROIT ================= */}
          <motion.div
            className="absolute top-0 bottom-0 right-0 w-1/2"
            style={{
              background: "linear-gradient(135deg, #131318 0%, #0B0B12 60%, #08080C 100%)",
              borderLeft: "1px solid rgba(201,168,124,0.35)",
            }}
            initial={{ x: 0 }}
            animate={opening ? { x: "100%" } : { x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: OPEN_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
          >
            <div
              className="absolute top-0 bottom-0 left-0 w-[3px]"
              style={{ background: "linear-gradient(180deg, transparent, rgba(201,168,124,0.6) 30%, rgba(201,168,124,0.6) 70%, transparent)" }}
            />
            <div className="absolute inset-0 opacity-[0.07]"
              style={{ background: "repeating-linear-gradient(90deg, transparent 0 34px, rgba(255,255,255,0.5) 34px 36px)" }} />
          </motion.div>

          {/* ================= HALO D'AMBIANCE ================= */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(46rem 30rem at 50% 62%, rgba(191,255,0,0.10), transparent 60%), radial-gradient(30rem 22rem at 50% 30%, rgba(201,168,124,0.12), transparent 60%)",
            }}
            animate={opening ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* ================= CONTENU CENTRAL ================= */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
            animate={opening ? { opacity: 0, scale: 0.94, filter: "blur(6px)" } : {}}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            {/* ciseaux qui glissent */}
            <motion.span
              className="text-2xl md:text-3xl mb-6 select-none"
              style={{ color: "var(--color-gold-thread)" }}
              initial={{ opacity: 0, x: -120, rotate: -24 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 14, delay: 0.15 }}
              aria-hidden="true"
            >
              ✂
            </motion.span>

            {/* sur-ligne */}
            <motion.p
              className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-white/60 mb-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Atelier de Couture d'Exception
            </motion.p>

            {/* wordmark lettre par lettre */}
            <h1
              className="text-6xl sm:text-7xl md:text-8xl font-bold leading-none italic text-center"
              style={{ fontFamily: "var(--font-display)" }}
              aria-label="Les Services Colombes"
            >
              {WORDMARK.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  style={{
                    backgroundImage: "linear-gradient(110deg, #F4E3C9 0%, #C9A87C 45%, #F4B860 80%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    textShadow: "none",
                  }}
                  initial={{ opacity: 0, y: 34, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    type: "spring",
                    stiffness: 130,
                    damping: 15,
                    delay: 0.45 + i * 0.055,
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </h1>

            {/* petite ligne « Les Services · Porto-Novo » */}
            <motion.p
              className="mt-4 text-xs md:text-sm tracking-[0.35em] uppercase text-white/75"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.05, duration: 0.45 }}
            >
              Les Services · Porto-Novo
            </motion.p>

            {/* fil d'or qui se coud sous le mot */}
            <svg
              className="mt-6 w-56 md:w-72 h-[10px]"
              viewBox="0 0 240 10"
              fill="none"
              aria-hidden="true"
            >
              <motion.path
                d="M2 5 C 60 1, 120 9, 238 5"
                stroke="url(#splashGold)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6 7"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
              <defs>
                <linearGradient id="splashGold" x1="0" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#C9A87C" />
                  <stop offset="0.5" stopColor="#F4B860" />
                  <stop offset="1" stopColor="#C9A87C" />
                </linearGradient>
              </defs>
            </svg>

            {/* bouton passer */}
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                close();
              }}
              className="mt-10 px-5 py-2 rounded-full text-[11px] uppercase tracking-[0.25em] text-white/60 border border-white/15 hover:text-white hover:border-white/40 transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.4 }}
            >
              Passer
            </motion.button>
          </motion.div>

          {/* ================= LIGNE DE PROGRESSION ================= */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{ background: "rgba(255,255,255,0.08)" }}
            animate={opening ? { opacity: 0 } : { opacity: 1 }}
          >
            <motion.div
              className="h-full origin-left"
              style={{
                background: "linear-gradient(90deg, var(--color-citron), var(--color-gold-thread), var(--color-orange))",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: HOLD_MS / 1000, ease: "linear" }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
