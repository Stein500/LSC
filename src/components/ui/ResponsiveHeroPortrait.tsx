import { CSSProperties, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useImageRatio } from "@/hooks/useImageRatio";

type ResponsiveHeroPortraitProps = {
  src: string;
  alt?: string;
  /** Ratio de repli si l'image n'a pas chargé (par ex. 3/4). */
  fallbackRatio?: number;
  /** Active l'animation "flottement doux" du portrait. */
  float?: boolean;
  /** Active l'aura lumineuse autour du portrait. */
  aura?: boolean;
  /** Active le grain fin sur l'image. */
  grain?: boolean;
  /** Active un effet de buée/vapeur sur les bords (évoque le repassage). */
  steam?: boolean;
  className?: string;
  style?: CSSProperties;
  /**
   * Ratio minimal du cadre (par défaut 0.6 — équivalent 3:5).
   * Une image en mode très portrait (9:16, ratio 0.56) sera clampée à 0.6.
   */
  minRatio?: number;
  /**
   * Ratio maximal du cadre (par défaut 1.0 — carré).
   * Une image en mode paysage (16:9, ratio 1.78) sera clampée à 1.0.
   */
  maxRatio?: number;
  /**
   * Si fourni, force une largeur max au wrapper externe (ex: `min(100%, 22rem)`).
   * Pratique pour éviter un portrait trop large sur grand écran.
   */
  maxWidth?: string;
  /**
   * Si fourni, force une hauteur max au wrapper externe (ex: `min(60vh, 480px)`).
   * Garantit qu'un portrait ne déborde pas de la zone hero.
   */
  maxHeight?: string;
};

/**
 * <ResponsiveHeroPortrait>
 *
 * Carte "portrait" qui suit le ratio naturel de l'image (clampé entre
 * `minRatio` et `maxRatio`) et rend l'image en `object-cover` (donc l'image
 * remplit TOUT le cadre, sans placeholder visible). Aucun rognage bizarre,
 * aucune déformation : le cadre suit la proportion et l'image s'adapte.
 *
 * La finition visuelle empile :
 *  - une aura colorée (citron / orange) en arrière-plan,
 *  - un cadre blanc épais,
 *  - un grain cinéma mix-blend,
 *  - une buée de vapeur subtile sur les bords,
 *  - un flottement doux (optionnel).
 */
export function ResponsiveHeroPortrait({
  src,
  alt = "",
  fallbackRatio = 3 / 4,
  float = true,
  aura = true,
  grain = true,
  steam = true,
  className,
  style,
  minRatio = 0.6,
  maxRatio = 1.0,
  maxWidth,
  maxHeight,
}: ResponsiveHeroPortraitProps) {
  const { ratio, ready, naturalWidth, naturalHeight } = useImageRatio(src, fallbackRatio);

  // Ratio effectif : clampé entre minRatio et maxRatio. Garantit qu'on a
  // toujours un cadre "portrait" lisible, peu importe l'image source.
  const effectiveRatio = useMemo<number>(() => {
    if (ratio === null) return fallbackRatio;
    return Math.min(Math.max(ratio, minRatio), maxRatio);
  }, [ratio, fallbackRatio, minRatio, maxRatio]);

  const aspectStyle = useMemo<CSSProperties>(
    () => ({ aspectRatio: String(effectiveRatio) }),
    [effectiveRatio],
  );

  // Le wrapper externe peut avoir une taille max pour borner sur grand écran.
  const wrapperStyle: CSSProperties = {
    ...(maxWidth ? { maxWidth } : {}),
    ...(maxHeight ? { maxHeight } : {}),
  };

  return (
    <div
      className={cn("relative inline-block w-full", className)}
      style={{ ...wrapperStyle, ...style }}
      data-image-ready={ready ? "true" : "false"}
      data-nat-w={naturalWidth ?? undefined}
      data-nat-h={naturalHeight ?? undefined}
      data-eff-ratio={effectiveRatio.toFixed(2)}
    >
      {/* Aura lumineuse — double halo citron / orange */}
      {aura && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-8 rounded-[2.5rem] blur-3xl opacity-50"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, var(--color-citron) 0%, transparent 60%)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-6 rounded-[2.5rem] blur-2xl opacity-40"
            style={{
              background:
                "radial-gradient(circle at 70% 70%, var(--color-orange) 0%, transparent 60%)",
            }}
          />
        </>
      )}

      {/* Conteneur du cadre : suit le ratio clampé. L'image en object-cover
          remplit TOUT le cadre, sans placeholder visible. */}
      <motion.div
        className={cn(
          "relative overflow-hidden border-4 border-white shadow-2xl rounded-3xl bg-[var(--color-cream)] w-full",
        )}
        style={aspectStyle}
        animate={float ? { y: [0, -6, 0] } : undefined}
        transition={
          float
            ? { duration: 6, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
      >
        <img
          src={src}
          alt={alt}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className={cn(
            "absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
        />

        {/* Voile chaud subtil (ambre) pour la finition "fer chaud" */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-soft-light opacity-60"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,200,120,0.18) 0%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.18) 100%)",
          }}
        />

        {/* Grain fin — texture papier / tissu */}
        {grain && (
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.16]"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.95  0 0 0 0 0.95  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
              backgroundSize: "180px 180px",
            }}
          />
        )}

        {/* Buée de vapeur sur les bords — clin d'œil repassage */}
        {steam && <SteamEdge />}
      </motion.div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  SteamEdge — buée qui s'échappe des bords supérieurs du portrait.          */
/* -------------------------------------------------------------------------- */
function SteamEdge() {
  const puffs = [
    { left: "18%", delay: 0, dur: 8, scale: 0.9 },
    { left: "40%", delay: 1.4, dur: 9, scale: 1.1 },
    { left: "62%", delay: 2.8, dur: 10, scale: 0.8 },
    { left: "82%", delay: 0.7, dur: 8.5, scale: 1.0 },
  ];
  return (
    <div
      aria-hidden
      className="absolute inset-x-0 -top-2 h-24 pointer-events-none overflow-visible"
    >
      {puffs.map((p, i) => (
        <motion.span
          key={i}
          className="absolute -top-6 w-20 h-20 rounded-full"
          style={{
            left: p.left,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.12) 55%, rgba(255,255,255,0) 75%)",
            filter: "blur(6px)",
            transform: `scale(${p.scale})`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: ["0%", "-180%"], opacity: [0, 0.7, 0] }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
