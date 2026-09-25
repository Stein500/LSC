import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { isColombesApp } from "@/utils/appBridge";
import { LEGAL } from "@/data/legal";

// ============================================================================
// SPLASH « OUVERTURE DE MAISON » — v9 (09/2026) ✨
// À CHAQUE ouverture du site, la maison se présente en 4 temps, tout
// doucement, avant la sortie en rideaux :
//
//   Actes 1-3 — l'atelier, les tenues, les familles (photos signées)
//   Acte 4    — 🕊️ L'ANNONCE : « Les Services Colombes devient…
//               Couture Colombe & Merceries » (le nouveau nom légal)
//
// Gestes de douceur : fondus longs, montées courtes, fil wax qui se tend.
// Déjà vue dans la session → seule l'annonce est rejouée (~2,8 s).
// Skippable (tap / « Passer › » / Échap) · reduced-motion : jamais affiché ·
// in-app Kotlin : muet (splash natif).
// ============================================================================

const ACT_MS = 1250; // durée d'un acte photo (3 actes → 3,75 s)
const ANNOUNCE_MS = 2800; // durée de l'annonce du nouveau nom
const OPEN_MS = 900; // rideaux
const EASE_RIDEAU = [0.76, 0, 0.24, 1] as const;
const EASE_DOUX = [0.22, 1, 0.36, 1] as const;
const SEEN_KEY = "lsc_splash_v9_seen";

const TAGLINE = "atelier · mercerie · centre de formation";

// 🎬 Les 3 actes photo — uniquement des visuels SIGNÉS au cachet colombe.
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

const ANNOUNCE_INDEX = ACTES.length; // l'acte d'annonce = le dernier temps

export function SplashScreen() {
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [opening, setOpening] = useState(false);
  const [acte, setActe] = useState(0);
  const timers = useRef<number[]>([]);

  // 📱 Dans l'app Colombes, le SPLASH NATIF a déjà fait le spectacle —
  //    le splash web reste muet (double rideau = mauvais théâtre).
  const inApp = isColombesApp();
  const skip = reduceMotion || inApp;

  const close = useCallback(() => setOpening(true), []);

  // 🎟️ À CHAQUE ouverture du site : pré-chauffe + lever de rideau immédiat.
  //    La session se souvient de la première visite → annonce courte ensuite.
  useEffect(() => {
    if (skip) return;
    for (const a of ACTES) {
      const img = new window.Image();
      img.src = a.src;
    }
    setVisible(true);
  }, [skip]);

  // 🕰️ La partition : actes qui défilent tout doucement, puis L'ANNONCE,
  //    puis sortie une fois TOUT présenté. (Session vue → annonce seule.)
  useEffect(() => {
    if (!visible) return;
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    const alreadySeen = (() => {
      try {
        return sessionStorage.getItem(SEEN_KEY) === "1";
      } catch {
        return false;
      }
    })();

    if (alreadySeen) {
      setActe(ANNOUNCE_INDEX);
      later(close, ANNOUNCE_MS);
    } else {
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* mode privé : sans mémoire, tant pis */
      }
      later(() => setActe(1), ACT_MS);
      later(() => setActe(2), ACT_MS * 2);
      later(() => setActe(ANNOUNCE_INDEX), ACT_MS * 3);
      later(close, ACT_MS * 3 + ANNOUNCE_MS);
    }
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
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

  if (skip) return null;

  const isAnnounce = acte === ANNOUNCE_INDEX;
  const current = isAnnounce ? null : ACTES[acte];
  const stepCount = ACTES.length + 1;

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed inset-0 z-[70] overflow-hidden"
          role="dialog"
          aria-modal="true"
          // 🤝 CONTRAT passerelle app — ce libellé EXACT sert de sélecteur CSS
          //    côté app pour masquer le splash web. Ne JAMAIS le modifier.
          aria-label="Ouverture de l'atelier"
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

          {/* ================= SCÈNE — 3 actes photo, puis la Nuit cacao de l'annonce ================= */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={opening ? { opacity: 0, scale: 1.03 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence mode="popLayout">
              {isAnnounce ? (
                // 🕊️ Nuit cacao — l'écrin de la nouvelle enseigne
                <motion.div
                  key="annonce"
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(120% 90% at 50% 38%, #2A1B22 0%, #1D1318 46%, #150D11 100%)",
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  {/* trame pagne très douce */}
                  <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                      background:
                        "repeating-linear-gradient(45deg, transparent 0 22px, rgba(233,163,25,0.9) 22px 24px), repeating-linear-gradient(-45deg, transparent 0 22px, rgba(201,168,124,0.9) 22px 24px)",
                    }}
                  />
                </motion.div>
              ) : (
                <motion.img
                  key={current!.src}
                  src={current!.src}
                  alt=""
                  draggable={false}
                  loading="eager"
                  className="absolute inset-0 w-full h-full object-cover"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1.13 }}
                  exit={{ opacity: 0, transition: { duration: 0.65, ease: "easeInOut" } }}
                  transition={{
                    opacity: { duration: 0.75, ease: "easeInOut" },
                    scale: { duration: 4.6, ease: "linear" },
                  }}
                />
              )}
            </AnimatePresence>
            {/* Voile cinéma : lisibilité haut (marque) & bas (légende) */}
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: isAnnounce ? 0 : 1,
                background:
                  "linear-gradient(180deg, rgba(11,11,18,0.62) 0%, rgba(11,11,18,0.10) 30%, rgba(11,11,18,0.04) 55%, rgba(11,11,18,0.62) 100%)",
              }}
            />
          </motion.div>

          {/* ================= MARQUE — présente pendant les actes photo ================= */}
          <motion.div
            className="absolute top-14 inset-x-0 flex flex-col items-center gap-2.5 pointer-events-none"
            animate={opening || isAnnounce ? { opacity: 0, y: -18 } : { opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: EASE_DOUX }}
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
              {LEGAL.displayName}
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
              transition={{ delay: 0.5, duration: 0.9, ease: EASE_DOUX }}
            />
          </motion.div>

          {/* ================= ACTE PHOTO — kicker + légende ================= */}
          {!isAnnounce && (
            <motion.div
              className="absolute bottom-24 inset-x-0 flex flex-col items-center gap-1.5 px-6 pointer-events-none"
              animate={opening ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={acte}
                  className="flex flex-col items-center gap-1.5"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease: EASE_DOUX }}
                >
                  <span
                    className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.34em]"
                    style={{ color: "var(--color-citron)", textShadow: "0 1px 10px rgba(0,0,0,0.75)" }}
                  >
                    {current!.kicker}
                  </span>
                  <span
                    className="text-white text-lg sm:text-2xl text-center"
                    style={{ fontFamily: "var(--font-display)", fontStyle: "italic", textShadow: "0 2px 16px rgba(0,0,0,0.7)" }}
                  >
                    « {current!.caption} »
                  </span>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* ================= 🕊️ L'ANNONCE — le changement de nom, en 4 battements doux ================= */}
          <AnimatePresence>
            {isAnnounce && (
              <motion.div
                key="annonce-texte"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: opening ? 0 : 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Battement 1 — l'ancien nom s'efface doucement en mémoire */}
                <motion.span
                  className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.38em] text-[var(--color-gold-thread)]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.6, ease: EASE_DOUX }}
                >
                  {LEGAL.displayName}
                </motion.span>

                {/* Battement 2 — « devient… », le souffle */}
                <motion.span
                  className="text-lg sm:text-xl italic text-white/75"
                  style={{ fontFamily: "var(--font-display)" }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.65, ease: EASE_DOUX }}
                >
                  devient…
                </motion.span>

                {/* Battement 3 — la NOUVELLE ENSEIGNE, en grandes lettres d'or */}
                <motion.span
                  className="mt-1 text-center text-3xl sm:text-4xl md:text-5xl font-bold leading-tight"
                  style={{
                    fontFamily: "var(--font-display)",
                    background: "linear-gradient(120deg, #F4E7CE 0%, #E9A319 45%, #C9A87C 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    textShadow: "none",
                    padding: "0 0.2em",
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.25, duration: 0.8, ease: EASE_DOUX }}
                >
                  Couture Colombe
                  <br />
                  <span className="text-2xl sm:text-3xl md:text-4xl">&amp; Merceries</span>
                </motion.span>

                {/* Battement 4 — le fil wax se tend sous le nouveau nom */}
                <motion.span
                  className="lsc-wax-bande lsc-wax-bande--soft mt-2 block w-48 sm:w-64 max-w-full rounded-full"
                  style={{ transformOrigin: "center" }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 1.7, duration: 0.9, ease: EASE_DOUX }}
                  aria-hidden="true"
                />

                {/* Le petit mot de la maison */}
                <motion.span
                  className="text-[11px] sm:text-xs text-white/55 italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.05, duration: 0.6, ease: EASE_DOUX }}
                >
                  Le même fil, le même cœur — un nom d'officialité.
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ================= PROGRESSION — le fil d'or des 4 temps ================= */}
          <motion.div
            className="absolute bottom-14 inset-x-0 flex justify-center pointer-events-none"
            animate={opening ? { opacity: 0 } : { opacity: 1 }}
          >
            <div className="flex items-center gap-2.5">
              {Array.from({ length: stepCount }, (_, i) => (
                <span
                  key={i}
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
                      transition={{ duration: (i === ANNOUNCE_INDEX ? ANNOUNCE_MS : ACT_MS) / 1000, ease: "linear" }}
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
