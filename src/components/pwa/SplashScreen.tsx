import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { isColombesApp } from "@/utils/appBridge";
import { LEGAL } from "@/data/legal";

/**
 * SplashScreen v10 — « LE THÉÂTRE À DEUX RIDEAUX » 🎭
 * ====================================================
 * La maison a grandi, son écrin aussi. Deux rideaux seulement,
 * rien de superflu :
 *
 *   Rideau 1 — 🕊️ LA NAISSANCE (5 s pour bien le lire) :
 *     « Les Services Colombes » devient… **Couture Colombe et Merceries**.
 *     Le seul endroit du site où l'ancien nom est encore prononcé.
 *
 *   Rideau 2 — 🧵 LA MERCERIE (~4 s) :
 *     bobines, boutons, aiguilles, rubans, tissus au mètre —
 *     « tout se vend ici aussi », la preuve en six pastilles.
 *
 * Puis le rideau SE LÈVE (glissement vers le haut) et le site apparaît.
 *
 * Contrats respectés :
 *   - aria-label « Ouverture de l'atelier » (pont app historique) ;
 *   - dans l'app Colombes ou en reduced-motion : pas de rideau du tout ;
 *   - Échap / « Passer › » / appui : le rideau se lève aussitôt ;
 *   - déjà vu dans la session → on ne rejoue que le rideau mercerie.
 */

const SEEN_KEY = "lsc_splash_v10_seen";
const ACT1_MS = 5000; // la naissance — le temps de bien la lire
const ACT2_MS = 4200; // la mercerie
const ACT2_SEEN_MS = 3400; // retour dans la session : salut court
const LIFT_MS = 750; // le rideau se lève

const EASE_DOUX = [0.22, 1, 0.36, 1] as const;

/** Les 7 fils de la cire maison — rose, orange, marron, or, rouge, feuille. */
const WAX = ["#E87414", "#F4B860", "#FBE7EB", "#5C2E0C", "#C9A87C", "#D1232A", "#7CBA45"];

const MERCERIE = [
  { emoji: "🧵", label: "Fils & bobines" },
  { emoji: "🔘", label: "Boutons & fermoirs" },
  { emoji: "🪡", label: "Aiguilles & épingles" },
  { emoji: "🎀", label: "Rubans & dentelles" },
  { emoji: "📏", label: "Tissus au mètre" },
  { emoji: "✂️", label: "Ciseaux & outils" },
];

type Phase = "act1" | "act2" | "exit" | null;

export function SplashScreen() {
  const reduce = useReducedMotion();
  const inApp = useMemo(() => isColombesApp(), []);
  const alreadySeen = useMemo(() => {
    try { return sessionStorage.getItem(SEEN_KEY) === "1"; } catch { return false; }
  }, []);

  const [phase, setPhase] = useState<Phase>(() => {
    if (reduce || inApp) return null;
    return alreadySeen ? "act2" : "act1";
  });

  // La partition : act1 (5 s) → act2 (~4 s) → le rideau se lève → fin.
  useEffect(() => {
    if (phase === null) return;
    if (inApp || reduce) return;
    const markSeen = () => { try { sessionStorage.setItem(SEEN_KEY, "1"); } catch { /* private mode */ } };
    if (phase === "act1") {
      markSeen();
      const t = window.setTimeout(() => setPhase("act2"), ACT1_MS);
      return () => window.clearTimeout(t);
    }
    if (phase === "act2") {
      markSeen();
      const t = window.setTimeout(() => setPhase("exit"), alreadySeen ? ACT2_SEEN_MS : ACT2_MS);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setPhase(null), LIFT_MS);
    return () => window.clearTimeout(t);
  }, [phase, inApp, reduce, alreadySeen]);

  // Échap lève le rideau.
  useEffect(() => {
    if (phase === null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPhase("exit"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  if (phase === null) return null;

  const exiting = phase === "exit";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Ouverture de l'atelier"
      className="fixed inset-0 z-[60] overflow-hidden select-none"
      initial={{ y: 0 }}
      animate={exiting ? { y: "-100%" } : { y: 0 }}
      transition={{ duration: LIFT_MS / 1000, ease: EASE_DOUX }}
      onClick={() => !exiting && setPhase("exit")}
      style={{ boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}
    >
      {/* ============ LES DEUX DÉCORS (nuit cacao ⇄ aube rose) ============ */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: phase === "act2" ? 0 : 1 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(120% 90% at 50% 34%, #2A1B22 0%, #1B1116 48%, #100A0D 100%)",
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "act2" ? 1 : 0 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
        style={{
          background: "linear-gradient(165deg, #FBE7EB 0%, #FDF6F0 46%, #EFF7E3 100%)",
        }}
        aria-hidden="true"
      />

      {/* Fronceaux du rideau — plis de velours en haut, fil d'or */}
      <div
        className="absolute top-0 left-0 right-0 h-16 sm:h-20 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "repeating-linear-gradient(90deg, rgba(163,19,34,0.96) 0 34px, rgba(209,35,42,0.96) 34px 68px)",
          maskImage: "radial-gradient(34px 30px at 34px 0px, transparent 96%, black 100%)",
          WebkitMaskImage: "radial-gradient(34px 30px at 34px 0px, transparent 96%, black 100%)",
          maskSize: "68px 100%",
          WebkitMaskSize: "68px 100%",
          filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.35))",
        }}
      />
      <div
        className="absolute top-14 sm:top-[4.5rem] left-0 right-0 h-[3px] pointer-events-none"
        aria-hidden="true"
        style={{ background: "linear-gradient(90deg, transparent, #C9A87C 18%, #F4E7CE 50%, #C9A87C 82%, transparent)" }}
      />

      {/* Bouton passe */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setPhase("exit"); }}
        aria-label="Passer l'introduction"
        className={`absolute top-5 right-5 z-20 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all hover:scale-105 active:scale-95 ${
          phase === "act2" ? "text-[var(--color-ink-soft)] bg-white/70 border border-[#EFC9D1]" : "text-white/85 bg-white/10 border border-white/20"
        } backdrop-blur-sm`}
      >
        Passer ›
      </button>

      {/* ============================ LES ACTES ============================ */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          {phase === "act1" && (
            <motion.div
              key="acte-naissance"
              className="text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
              transition={{ duration: 0.9, ease: EASE_DOUX }}
            >
              <motion.p
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.38em] text-[var(--color-gold-thread)] mb-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: EASE_DOUX }}
              >
                {LEGAL.oldName}
              </motion.p>

              <motion.p
                className="text-lg sm:text-xl italic text-white/75 mb-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8, ease: EASE_DOUX }}
              >
                devient…
              </motion.p>

              <motion.h1
                className="font-bold leading-[1.06]"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, scale: 0.94, filter: "blur(10px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 1.6, duration: 1.1, ease: EASE_DOUX }}
              >
                <span className="block text-[clamp(2.5rem,9vw,4.4rem)] lsc-text-silk">
                  Couture Colombe
                </span>
                <span className="block mt-1 text-[clamp(1.4rem,5vw,2.3rem)] italic text-[#F4E7CE]">
                  et Merceries
                </span>
              </motion.h1>

              {/* Le ruban de cire se tisse */}
              <motion.div
                className="mx-auto mt-7 flex h-[10px] w-56 sm:w-72 overflow-hidden rounded-full"
                aria-hidden="true"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.4, duration: 0.5 }}
              >
                {WAX.map((c, i) => (
                  <motion.span
                    key={c}
                    className="h-full flex-1"
                    style={{ background: c }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: 2.45 + i * 0.09, duration: 0.45, ease: EASE_DOUX }}
                  />
                ))}
              </motion.div>

              <motion.p
                className="mt-6 text-xs sm:text-sm text-white/60 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3.1, duration: 0.9 }}
              >
                — le même fil, le même cœur, un nom d'officialité —
              </motion.p>
            </motion.div>
          )}

          {phase === "act2" && (
            <motion.div
              key="acte-mercerie"
              className="text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 26, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -18, filter: "blur(6px)" }}
              transition={{ duration: 0.9, ease: EASE_DOUX }}
            >
              <motion.p
                className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.38em] mb-5"
                style={{ color: "var(--color-feuille-f)" }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.7, ease: EASE_DOUX }}
              >
                Et derrière le comptoir…
              </motion.p>

              <motion.h2
                className="font-bold leading-[1.08] text-[clamp(2.1rem,7.5vw,3.6rem)]"
                style={{ fontFamily: "var(--font-display)" }}
                initial={{ opacity: 0, scale: 0.95, filter: "blur(8px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{ delay: 0.5, duration: 0.9, ease: EASE_DOUX }}
              >
                <span className="block text-[var(--color-ink)]">La mercerie,</span>
                <span className="block italic" style={{ color: "var(--color-feuille-f)" }}>
                  tout s'y vend aussi
                </span>
              </motion.h2>

              {/* Les six pastilles du comptoir */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-w-lg mx-auto">
                {MERCERIE.map((item, i) => (
                  <motion.span
                    key={item.label}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl text-[13px] font-semibold text-[var(--color-ink-soft)] bg-white/75 border border-[#EFC9D1] backdrop-blur-sm shadow-sm"
                    initial={{ opacity: 0, y: 18, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.9 + i * 0.16, duration: 0.55, ease: EASE_DOUX }}
                  >
                    <span aria-hidden="true" className="text-lg">{item.emoji}</span>
                    {item.label}
                  </motion.span>
                ))}
              </div>

              <motion.p
                className="mt-6 text-xs sm:text-sm text-[var(--color-muted)] italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.1, duration: 0.8 }}
              >
                wax, bazin, pagne — au mètre, comptant, avec le sourire.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Les deux points d'acte */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2.5" aria-hidden="true">
        {(["act1", "act2"] as const).map((a) => (
          <span
            key={a}
            className="w-2 h-2 rounded-full transition-all duration-500"
            style={{
              background:
                phase === a
                  ? (a === "act1" ? "#C9A87C" : "#558B2F")
                  : phase === "act2"
                    ? "rgba(92,64,48,0.3)"
                    : "rgba(255,255,255,0.3)",
              transform: phase === a ? "scale(1.35)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
