import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";

// ============================================================================
// SPLASH « OUVERTURE DE MAISON » — v8 (2026)
// À CHAQUE ouverture du site (plus de fenêtre de 2 h), mais PLUS COURT (~4,6 s)
// et PLUS RICHE : la maison se présente en 3 actes avant la sortie en rideaux.
//
//   Acte 1 — Bienvenue à l'atelier        (le lieu, la promesse)
//   Acte 2 — Tenues femmes                (le wax d'exception sur mesure)
//   Acte 3 — Filles · bébés · familles    (trois générations, un même fil)
//
// En permanence : médaillon colombe + nom + promesse de la maison, barre de
// progression fil d'or. Skippable (tap / « Passer › » / Échap).
// reduced-motion : jamais affiché · in-app Kotlin : muet (splash natif).
// ============================================================================

const ACT_MS = 1250; // durée d'un acte (3 actes → 3,75 s de présentation)
const OPEN_MS = 900; // rideaux
const EASE_RIDEAU = [0.76, 0, 0.24, 1] as const;

const TAGLINE = "atelier · mercerie · centre de formation";

// 🎬 Les 3 actes — uniquement des visuels SIGNÉS au cachet colombe.
const ACTES = [
  {
    src: "/images/gallery/splash-atelier-01.webp",
    kicker: "Bienvenue à l'atelier",
    caption: "Ici, l'élégance se coud depuis 1990",
  },
  {
    src: "/images/gallery/tenue-semaine-01.webp",
    kicker: "Tenues femmes",
    caption: "Le wax d'exception, coupé sur mesure",
  },
  {
    src: "/images/gallery/famille-trio-01.webp",
    kicker: "Jeunes filles · bébés · familles",
    caption: "Trois générations, un même fil",
  },
];

export function SplashScreen() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const [acte, setActe] = useState(0);
  const timers = useRef<number[]>([]);

  const inApp = typeof window !== "undefined" && (window as any).ColombesApp?.isApp?.();
  const skip = reduceMotion || inApp;

  const close = useCallback(() => setOpening(true), []);

  // 🎟️ À CHAQUE ouverture du site : pré-chauffe + lever de rideau immédiate
  useEffect(() => {
    if (skip) return;
    for (const a of ACTES) {
      const img = new window.Image();
      img.src = a.src;
    }
    setVisible(true);
  }, [skip]);

  // 🕰️ La partition : actes qui défilent, puis sortie une fois TOUT présenté
  useEffect(() => {
    if (!visible) return;
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    later(() => setActe(1), ACT_MS);
    later(() => setActe(2), ACT_MS * 2);
    later(close, ACT_MS * 3); // sortie seulement après le 3e acte
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [visible, close]);

  // Précharge → premier acte déjà en place (évite un blanc au 1er fondu)
  useEffect(() => {
    if (!visible) return;
    setActe(0);
  }, [visible]);

  // Échap pour passer
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [visible, close]);

  if (skip) return null;

  const current = ACTES[acte];

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed inset-0 z-[70] overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Ouverture de l'atelier Les Services Colombes"
          onClick={close}
        >
          {/* ================= RIDEAUX (identité noire & fil d'or) ================= */}
          {(["left", "right"] as const).map((side) => (
            <motion.div
              key={side}
              className="absolute top-0 bottom-0 w-1/2"
              style={{
                left: side === "left" ? 0 : undefined,
                right: side === "right" ? 0 : undefined,
                background:
                  side === "left"
                    ? "linear-gradient(225deg, #131318 0%, #0B0B12 60%, #08080C 100%)"
                    : "linear-gradient(135deg, #131318 0%, #0B0B12 60%, #08080C 100%)",
                [side === "left" ? "borderRight" : "borderLeft"]: "1px solid rgba(201,168,124,0.35)",
              }}
              initial={{ x: 0 }}
              animate={opening ? { x: side === "left" ? "-100%" : "100%" } : { x: 0 }}
              exit={{ x: side === "left" ? "-100%" : "100%" }}
              transition={{ duration: OPEN_MS / 1000, ease: EASE_RIDEAU }}
              onAnimationComplete={() => {
                if (opening) setVisible(false);
              }}
            >
              <div
                className="absolute top-0 bottom-0 w-[3px]"
                style={{
                  [side === "left" ? "right" : "left"]: 0,
                  background:
                    "linear-gradient(180deg, transparent, rgba(201,168,124,0.6) 30%, rgba(201,168,124,0.6) 70%, transparent)",
                }}
              />
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{ background: "repeating-linear-gradient(90deg, transparent 0 34px, rgba(255,255,255,0.5) 34px 36px)" }}
              />
            </motion.div>
          ))}

          {/* ================= SCÈNE — fondus enchaînés + zoom lent ================= */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={opening ? { opacity: 0, scale: 1.03 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="popLayout">
              <motion.img
                key={current.src}
                src={current.src}
                alt=""
                draggable={false}
                loading="eager"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1.13 }}
                exit={{ opacity: 0 }}
                transition={{
                  opacity: { duration: 0.55, ease: "easeInOut" },
                  scale: { duration: 4.6, ease: "linear" },
                }}
              />
            </AnimatePresence>
            {/* Voile cinéma : lisibilité haut (marque) & bas (légende) */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(11,11,18,0.62) 0%, rgba(11,11,18,0.10) 30%, rgba(11,11,18,0.04) 55%, rgba(11,11,18,0.62) 100%)",
              }}
            />
          </motion.div>

          {/* ================= MARQUE — présente du début à la sortie ================= */}
          <motion.div
            className="absolute top-14 inset-x-0 flex flex-col items-center gap-2.5 pointer-events-none"
            animate={opening ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="w-16 h-16 rounded-full overflow-hidden bg-white"
              style={{ border: "3px solid var(--color-citron)", boxShadow: "0 8px 26px rgba(0,0,0,0.5), 0 0 0 3px rgba(201,168,124,0.55)" }}
            >
              <img src="/images/logo.webp" alt="" aria-hidden="true" className="w-full h-full object-cover" loading="eager" />
            </span>
            <span
              className="text-white font-bold text-xl sm:text-2xl tracking-wide"
              style={{ fontFamily: "var(--font-display)", textShadow: "0 2px 18px rgba(0,0,0,0.65)" }}
            >
              Les Services Colombes
            </span>
            <span
              className="text-[11px] sm:text-xs uppercase tracking-[0.28em]"
              style={{ color: "var(--color-citron)", textShadow: "0 1px 10px rgba(0,0,0,0.7)" }}
            >
              {TAGLINE}
            </span>
            {/* Fil d'or qui se coud sous la promesse */}
            <motion.span
              className="block h-[2px] rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, var(--color-gold-thread), var(--color-citron), transparent)" }}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 150, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.div>

          {/* ================= L'ACTE EN COURS — kicker + légende ================= */}
          <motion.div
            className="absolute bottom-24 inset-x-0 flex flex-col items-center gap-1.5 px-6 pointer-events-none"
            animate={opening ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={acte}
                className="flex flex-col items-center gap-1.5"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.34em]"
                  style={{ color: "var(--color-citron)", textShadow: "0 1px 10px rgba(0,0,0,0.75)" }}
                >
                  {current.kicker}
                </span>
                <span
                  className="text-white text-lg sm:text-2xl text-center"
                  style={{ fontFamily: "var(--font-display)", fontStyle: "italic", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
                >
                  « {current.caption} »
                </span>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* ================= PROGRESSION — le fil d'or des 3 actes ================= */}
          <motion.div
            className="absolute bottom-14 inset-x-0 flex justify-center pointer-events-none"
            animate={opening ? { opacity: 0 } : { opacity: 1 }}
          >
            <div className="flex items-center gap-2.5">
              {ACTES.map((a, i) => (
                <span
                  key={a.src}
                  className="relative h-[5px] w-12 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.22)" }}
                >
                  {i < acte && <span className="absolute inset-0" style={{ background: "var(--color-citron)" }} />}
                  {i === acte && (
                    <motion.span
                      className="absolute inset-0 origin-left"
                      style={{ background: "linear-gradient(90deg, var(--color-citron), var(--color-gold-thread))" }}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: ACT_MS / 1000, ease: "linear" }}
                    />
                  )}
                </span>
              ))}
            </div>
          </motion.div>

          {/* ================= PASSER ================= */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-4 right-4 flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-white/85"
            style={{
              background: "rgba(11,11,18,0.45)",
              border: "1px solid rgba(201,168,124,0.45)",
              backdropFilter: "blur(6px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opening ? 0 : 1 }}
            transition={{ delay: 0.4 }}
            aria-label="Passer l'introduction"
          >
            Passer
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}
