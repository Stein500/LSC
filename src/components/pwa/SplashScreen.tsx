import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Scissors, Sparkles, X } from "lucide-react";
import { env } from "@/utils/env";
import { LOGO_WEBP, LOGO_FALLBACK_SVG_DATA_URL, LOGO_ALT } from "@/utils/logo";
import { GALLERY_ATELIER, GALLERY_CREATIONS } from "@/data/galleries";
import { HeartPulse } from "@/components/ui/HeartPulse";
import { useSplashMemory } from "@/hooks/useSplashMemory";
import { useTheme } from "@/theme/ThemeContext";

// ============================================================================
// SPLASH PINTEREST — v5 (Phase 2.3)
// Wordmark fixe au centre (vrai logo) · cartes en couronne extérieure
// 11s mobile / 12s desktop · 3h de TTL
// ============================================================================

const SESSION_KEY = "lscolombes:splash-pinterest:v1";
const TTL_MS = 3 * 60 * 60 * 1000;            // 3h
const TOTAL_DURATION_DESKTOP = 12000;         // 12s desktop
const TOTAL_DURATION_MOBILE = 11000;          // 11s mobile
const SWEEP_DURATION = 900;                   // scissor sweep diagonal

type Tile = {
  src?: string;
  alt: string;
  title: string;
  subtitle: string;
  tone: string;
  region: string;
};

const FALLBACK_TILES: Tile[] = [
  {
    title: "Atelier",
    subtitle: "savoir-faire & précision",
    alt: "L'atelier Les Services Colombes",
    tone: "linear-gradient(135deg, rgba(255,228,230,0.95), rgba(251,228,230,0.86))",
    region: "BJ",
  },
  {
    title: "Matières",
    subtitle: "textures et finitions",
    alt: "Tissus et matières de l'atelier",
    tone: "linear-gradient(135deg, rgba(244,184,96,0.90), rgba(201,168,124,0.82))",
    region: "SN",
  },
  {
    title: "Couture",
    subtitle: "gestes calmes et nets",
    alt: "Couture à l'atelier",
    tone: "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,228,230,0.90))",
    region: "BF",
  },
];

const REGION_LABELS: Record<string, string> = {
  BJ: "Porto-Novo", SN: "Dakar", BF: "Ouagadougou", CI: "Abidjan",
  TN: "Tunis", JP: "Tokyo", FR: "Lyon", PT: "Lisbonne",
  CN: "Shanghai", ML: "Bamako", EG: "Le Caire", GH: "Accra",
  GN: "Conakry", DZ: "Alger", IT: "Naples", RW: "Kigali",
  NE: "Niamey", "MA-A": "Marrakech",
};

const TILE_LABELS = [
  { title: "Atelier", subtitle: "savoir-faire & précision" },
  { title: "Matières", subtitle: "textures et finitions" },
  { title: "Couture", subtitle: "gestes calmes et nets" },
  { title: "Création", subtitle: "silhouettes lumineuses" },
  { title: "Coupe", subtitle: "ligne propre, chute nette" },
  { title: "Héritage", subtitle: "couleurs et identité" },
  { title: "Inspiration", subtitle: "le monde dans l'atelier" },
  { title: "Finition", subtitle: "le détail qui change tout" },
];

const TONES = [
  "linear-gradient(135deg, rgba(255,228,230,0.95), rgba(251,228,230,0.86), rgba(245,239,230,0.92))",
  "linear-gradient(135deg, rgba(244,184,96,0.90), rgba(201,168,124,0.82), rgba(185,136,166,0.84))",
  "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,228,230,0.90))",
  "linear-gradient(135deg, rgba(245,239,230,0.95), rgba(244,184,96,0.78))",
  "linear-gradient(135deg, rgba(255,228,230,0.92), rgba(201,168,124,0.88))",
  "linear-gradient(135deg, rgba(251,228,230,0.90), rgba(185,136,166,0.85))",
  "linear-gradient(135deg, rgba(255,255,255,0.94), rgba(244,184,96,0.80))",
  "linear-gradient(135deg, rgba(245,239,230,0.96), rgba(185,136,166,0.82))",
];

const REGIONS = ["BJ", "SN", "BF", "CI", "TN", "JP", "FR", "PT"];

// ============================================================================
// POSITIONS DES CARTES — posées comme des cartes à jouer
// Coordonnées en % (x, y) + rotation (deg) + scale
// Distribuées en couronne autour du centre, sans masquer le wordmark
// ============================================================================
type CardLayout = {
  x: string;          // left %
  y: string;          // top %
  rotate: number;     // degrees
  scale: number;      // 0.85 - 1.05
  zIndex: number;     // ordre d'empilement
  delay: number;      // entrée delay (s)
  mobileX?: string;   // override mobile
  mobileY?: string;
  mobileRotate?: number;
};

const DESKTOP_LAYOUT: CardLayout[] = [
  // Carte 1 — haut gauche
  { x: "3%",  y: "4%",  rotate: -12, scale: 0.92, zIndex: 2, delay: 0.10,
    mobileX: "1%", mobileY: "3%", mobileRotate: -10 },
  // Carte 2 — haut droite
  { x: "70%", y: "2%",  rotate: 9,   scale: 0.95, zIndex: 3, delay: 0.22,
    mobileX: "60%", mobileY: "1%", mobileRotate: 12 },
  // Carte 3 — milieu gauche (très loin du centre)
  { x: "0%",  y: "32%", rotate: 6,   scale: 0.90, zIndex: 1, delay: 0.34,
    mobileX: "-2%", mobileY: "30%", mobileRotate: 8 },
  // Carte 4 — milieu droite (très loin du centre)
  { x: "74%", y: "38%", rotate: -8,  scale: 0.92, zIndex: 1, delay: 0.46,
    mobileX: "65%", mobileY: "36%", mobileRotate: -10 },
  // Carte 5 — milieu gauche-bas
  { x: "0%",  y: "62%", rotate: 11,  scale: 0.94, zIndex: 2, delay: 0.58,
    mobileX: "-2%", mobileY: "60%", mobileRotate: 9 },
  // Carte 6 — milieu droite-bas
  { x: "72%", y: "68%", rotate: -7,  scale: 0.96, zIndex: 3, delay: 0.70,
    mobileX: "62%", mobileY: "66%", mobileRotate: -8 },
  // Carte 7 — bas gauche
  { x: "6%",  y: "84%", rotate: 4,   scale: 0.86, zIndex: 1, delay: 0.82,
    mobileX: "3%", mobileY: "86%", mobileRotate: 5 },
  // Carte 8 — bas droite
  { x: "68%", y: "86%", rotate: -5,  scale: 0.86, zIndex: 1, delay: 0.94,
    mobileX: "58%", mobileY: "88%", mobileRotate: -6 },
];

export function SplashScreen() {
  const { resolvedTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const { shouldShow, markSeen } = useSplashMemory(SESSION_KEY, TTL_MS);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Détection mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const totalDuration = reduceMotion ? 0 : (isMobile ? TOTAL_DURATION_MOBILE : TOTAL_DURATION_DESKTOP);

  // ============== CONSTRUCTION DES TUILES ==============
  const tiles = useMemo<Tile[]>(() => {
    const source = [...GALLERY_ATELIER, ...GALLERY_CREATIONS];
    if (source.length === 0) return FALLBACK_TILES;

    const sliced = source.slice(0, 8);

    return sliced.map((img, index) => ({
      src: img.src,
      alt: img.alt,
      title: TILE_LABELS[index]?.title ?? "Création",
      subtitle: TILE_LABELS[index]?.subtitle ?? "",
      tone: TONES[index % TONES.length],
      region: REGIONS[index % REGIONS.length],
    }));
  }, []);

  // ============== SKIP ==============
  const skip = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    setVisible(false);
  }, []);

  // ============== OUVERTURE AU MONTAGE ==============
  useEffect(() => {
    if (!shouldShow) return;
    markSeen();
    if (reduceMotion || totalDuration === 0) return;
    setVisible(true);
  }, [markSeen, reduceMotion, shouldShow, totalDuration]);

  // ============== ANIMATION PRINCIPALE ==============
  useEffect(() => {
    if (!visible || totalDuration === 0) return;

    // Démarre le "shuffle" à mi-parcours : on inverse l'ordre + rotation des cartes
    const shuffleTimer = window.setTimeout(() => setIsShuffling(true), totalDuration * 0.45);

    // Fermeture automatique
    const hideTimer = window.setTimeout(() => setVisible(false), totalDuration);

    // Barre de stitching
    startRef.current = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const p = Math.min(1, elapsed / totalDuration);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.clearTimeout(shuffleTimer);
      window.clearTimeout(hideTimer);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [totalDuration, visible]);

  // ============== A11Y (Esc, focus trap, body lock) ==============
  useEffect(() => {
    if (!visible) return;

    const focusTimer = window.setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 80);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [skip, visible]);

  const isDarkLike = resolvedTheme !== "light";

  if (!visible || totalDuration === 0) return null;

  // ============== RENDER ==============
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32, ease: "easeOut" }}
        className="fixed inset-0 z-[60] overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(245,239,230,0.98)_100%)]"
        onClick={skip}
        role="dialog"
        aria-modal="true"
        aria-label="Splash d'introduction — Les Services Colombes"
      >
        {/* ====== FOND DÉCORATIF (pois, halos) ====== */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.8)_1px,transparent_0)] bg-[size:14px_14px]" />
          <motion.div
            className="absolute -top-16 left-1/2 h-64 w-[88vw] -translate-x-1/2 rounded-full blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(244,184,96,0.35), transparent 72%)" }}
            animate={{ y: [0, 18, 0], opacity: [0.65, 0.9, 0.65] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-0 right-0 h-72 w-[80vw] rounded-full blur-3xl"
            style={{ background: "radial-gradient(closest-side, rgba(185,136,166,0.28), transparent 72%)" }}
            animate={{ y: [0, -16, 0], opacity: [0.55, 0.85, 0.55] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* ====== BOUTON PASSER ====== */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            skip();
          }}
          className="absolute top-3 right-3 sm:top-5 sm:right-5 z-[80] inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 sm:px-3.5 py-2 text-[11px] sm:text-xs font-semibold text-[var(--color-ink)] shadow-md border border-white/70 hover:bg-white hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
          aria-label="Passer l'introduction"
        >
          Passer
          <X className="w-3.5 h-3.5" />
        </button>

        {/* ====== BARRE DE STITCHING (progression) ====== */}
        <div className="absolute top-0 left-0 right-0 z-[70] h-1 bg-[var(--color-line)]/50">
          <motion.div
            className="h-full origin-left"
            style={{
              scaleX: progress,
              background: "linear-gradient(90deg, var(--color-gold-thread) 0%, var(--color-saffron) 100%)",
            }}
            transition={{ ease: "linear", duration: 0 }}
          />
        </div>

        {/* ====== SCÈNE — Cartes posées en absolute autour du wordmark ====== */}
        <div className="absolute inset-0 z-10">
          {/* Scissor sweep diagonal — passe en travers de la scène */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[60]">
            <motion.div
              className="h-[2px] w-[86%] md:w-[78%] rounded-full origin-left bg-[linear-gradient(90deg,transparent_0%,rgba(244,184,96,0.95)_50%,transparent_100%)]"
              style={{ rotate: -22, boxShadow: "0 0 18px rgba(244,184,96,0.25)" }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: SWEEP_DURATION / 1000, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            />
          </div>

          {/* ====== CARTES EN JEU DE CARTES MÉLANGÉ ====== */}
          {tiles.map((tile, index) => {
            const layout = DESKTOP_LAYOUT[index % DESKTOP_LAYOUT.length];
            const x = isMobile && layout.mobileX ? layout.mobileX : layout.x;
            const y = isMobile && layout.mobileY ? layout.mobileY : layout.y;
            const baseRotate = isMobile && layout.mobileRotate != null ? layout.mobileRotate : layout.rotate;

            // Pendant le shuffle, on inverse l'ordre Z + on inverse la rotation
            const shuffleRotate = -baseRotate * 1.2;
            const shuffleScale = layout.scale * 0.95;
            const z = isShuffling ? 50 - layout.zIndex : layout.zIndex;

            return (
              <motion.article
                key={`${tile.title}-${index}`}
                className="absolute w-[42vw] sm:w-[260px] md:w-[280px] rounded-[1.5rem] border border-white/80 bg-white shadow-[0_18px_50px_rgba(26,26,26,0.18)] overflow-hidden"
                style={{
                  left: x,
                  top: y,
                  zIndex: z,
                }}
                initial={{
                  opacity: 0,
                  scale: 0.4,
                  rotate: baseRotate - 25,
                  x: "-50%",
                  y: "-50%",
                }}
                animate={
                  isShuffling
                    ? {
                        opacity: 1,
                        scale: shuffleScale,
                        rotate: shuffleRotate,
                        x: "-50%",
                        y: "-50%",
                      }
                    : {
                        opacity: 1,
                        scale: layout.scale,
                        rotate: baseRotate,
                        x: "-50%",
                        y: "-50%",
                      }
                }
                transition={{
                  opacity: { duration: 0.6, delay: layout.delay, ease: "easeOut" },
                  scale: { duration: 0.7, delay: layout.delay, ease: [0.22, 1, 0.36, 1] },
                  rotate: { duration: 0.7, delay: layout.delay, ease: [0.22, 1, 0.36, 1] },
                }}
              >
                {/* Image (si dispo) */}
                {tile.src ? (
                  <div className="relative h-32 sm:h-36 w-full overflow-hidden">
                    <div className="absolute inset-0" style={{ background: tile.tone }} />
                    <img
                      src={tile.src}
                      alt={tile.alt}
                      className="relative h-full w-full object-cover"
                      loading="eager"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative h-32 sm:h-36 w-full" style={{ background: tile.tone }} />
                )}

                {/* BANDEAU TEXTE — opaque, toujours lisible */}
                <div className="bg-white p-3 sm:p-3.5">
                  <p className="text-[9px] uppercase tracking-[0.28em] text-[var(--color-orange-d)]/80 font-semibold">
                    {REGION_LABELS[tile.region] ?? "Atelier"}
                  </p>
                  <h3 className="mt-1 text-base sm:text-lg font-semibold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                    {tile.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <HeartPulse size={12} color="blush" />
                    <p className="text-[11px] sm:text-xs leading-snug text-[var(--color-ink-soft)]">
                      {tile.subtitle}
                    </p>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* ====== WORDMARK — FIXE AU CENTRE, AU-DESSUS DE TOUT ====== */}
        <div
          className="absolute left-1/2 top-1/2 z-[100] w-[min(78vw,360px)] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
          >
            <div
              className="rounded-[2rem] px-6 py-6 text-center shadow-[0_30px_80px_rgba(26,26,26,0.30)] pointer-events-auto border"
              style={{
                background: isDarkLike ? "rgba(8,8,8,0.90)" : "rgba(255,255,255,0.98)",
                borderColor: isDarkLike ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.90)",
                color: isDarkLike ? "var(--color-ink)" : "var(--color-ink)",
              }}
            >
              <div
                className="mx-auto mb-3 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[1.4rem] border shadow-md overflow-hidden"
                style={{
                  background: isDarkLike ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.98)",
                  borderColor: isDarkLike ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.80)",
                }}
                aria-hidden="true"
              >
                <img
                  src={LOGO_WEBP}
                  alt={LOGO_ALT}
                  className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src !== LOGO_FALLBACK_SVG_DATA_URL) {
                      img.src = LOGO_FALLBACK_SVG_DATA_URL;
                    }
                  }}
                />
              </div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--color-orange)]">
                Bienvenue chez
              </p>
              <h1
                className="mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-ink)] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Les Services Colombes
              </h1>
              <p className="mt-1.5 text-[11px] sm:text-xs font-medium" style={{ color: isDarkLike ? "var(--color-ink-soft)" : "var(--color-ink-soft)" }}>
                atelier · mercerie · centre de formation
              </p>
              <p className="mt-2 text-[12px] sm:text-[13px] italic font-semibold" style={{ color: isDarkLike ? "var(--color-ink)" : "var(--color-orange-d)" }}>
                Avec amour, {env.atelierTagline}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 sm:gap-3 text-[var(--color-orange)]">
                <Scissors className="h-4 w-4 sm:h-5 sm:w-5 rotate-12" strokeWidth={2.25} />
                <span className="h-px w-12 sm:w-20 bg-gradient-to-r from-transparent via-[var(--color-orange)] to-transparent" />
                <Scissors className="h-4 w-4 sm:h-5 sm:w-5 -rotate-12" strokeWidth={2.25} />
              </div>
              <div
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{
                  background: isDarkLike ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.86)",
                  borderColor: isDarkLike ? "rgba(255,255,255,0.14)" : "rgba(201,168,124,0.35)",
                  color: isDarkLike ? "var(--color-ink)" : "var(--color-ink)",
                }}
              >
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[var(--color-saffron)]" />
                {env.atelierShortName || "Colombes"} · couture sur mesure
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
