import { CSSProperties, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { useImageRatio } from "@/hooks/useImageRatio";

type OverlayTone = "light" | "dark" | "amoled" | "auto";

type ResponsiveHeroBackgroundProps = {
  src: string;
  alt?: string;
  /** Ratio de repli tant que l'image n'a pas chargé (par ex. 16/9, 21/9). */
  fallbackRatio?: number;
  /** Contenu (texte, CTA) superposé à l'image. */
  children?: React.ReactNode;
  /** Style d'overlay (dégradé) appliqué par-dessus l'image. */
  overlayTone?: OverlayTone;
  /** Active les particules de vapeur animées. */
  steam?: boolean;
  /** Active un grain fin pour la finition cinéma. */
  grain?: boolean;
  /** Active un halo lumineux doux derrière l'image. */
  halo?: boolean;
  className?: string;
  /** Style inline additionnel passé au conteneur. */
  style?: CSSProperties;

  /**
   * Ratio minimal autorisé pour le container (par défaut 0.8 — équivalent
   * à une image "à peine plus haute que large"). En dessous, on plafonne
   * pour éviter un hero démesuré avec une image très portrait.
   *  - 1.0 = carré
   *  - 0.8 = 4:5 (un peu portrait)
   *  - 0.5 = 1:2 (très portrait — on clamp)
   */
  minRatio?: number;
  /**
   * Ratio maximal autorisé (par défaut 1.78 — équivalent 16:9). Au-dessus,
   * on plafonne pour éviter un hero écrasé en mode bannière.
   */
  maxRatio?: number;
  /**
   * Hauteur max du hero en CSS (par défaut `min(85vh, 720px)`).
   * Garantit qu'on ne déborde pas même si l'image est très portrait ET
   * que la largeur du container est grande.
   */
  maxHeight?: string;
  /**
   * Hauteur min du hero en CSS (par défaut `min(70vh, 520px)`).
   * Garantit que le hero reste lisible même si l'image est très paysage.
   */
  minHeight?: string;
};

/**
 * <ResponsiveHeroBackground>
 *
 * Hero qui **suit vraiment le ratio de l'image** (paysage ou portrait) :
 *  - À la première peinture, on réserve déjà un espace via `fallbackRatio`
 *    pour éviter tout CLS.
 *  - Dès que l'image est chargée, on bascule sur le ratio exact
 *    `naturalWidth / naturalHeight`, **clampé** entre `minRatio` et `maxRatio`
 *    pour rester dans des proportions saines.
 *  - L'image est en `object-cover`, donc l'image remplit le container,
 *    rognée si nécessaire, jamais déformée.
 *  - Hauteur bornée par `minHeight` et `maxHeight` (en `min(XXvh, YYpx)`).
 *
 * Ajoute une finition "atelier" : overlay dégradé, halo coloré, grain cinéma,
 * et particules de vapeur (l'esprit fer à repasser / pressing).
 */
export function ResponsiveHeroBackground({
  src,
  alt = "",
  fallbackRatio = 16 / 9,
  children,
  overlayTone = "auto",
  steam = true,
  grain = true,
  halo = true,
  className,
  style,
  minRatio = 0.8,
  maxRatio = 1.78,
  minHeight = "min(70vh, 520px)",
  maxHeight = "min(85vh, 720px)",
}: ResponsiveHeroBackgroundProps) {
  const { ratio, ready, naturalWidth, naturalHeight } = useImageRatio(src, fallbackRatio);

  // Ratio effectif : clampé entre minRatio et maxRatio. Cela garantit :
  //  - une image en mode portrait extrême (9:16, ratio 0.56) ne donnera pas
  //    un hero de 1000px de haut → on plafonne à 0.8 (4:5).
  //  - une image en mode bannière (21:9, ratio 2.33) ne donnera pas un
  //    hero écrasé → on plafonne à 1.78 (16:9).
  const effectiveRatio = useMemo<number>(() => {
    if (ratio === null) return fallbackRatio;
    return Math.min(Math.max(ratio, minRatio), maxRatio);
  }, [ratio, fallbackRatio, minRatio, maxRatio]);

  // Style du container : on suit le ratio clampé + bornes min/max en CSS.
  // L'image en `object-cover` se charge de remplir correctement.
  const containerStyle: CSSProperties = {
    aspectRatio: String(effectiveRatio),
    minHeight,
    maxHeight,
    ...style,
  };

  const overlayGradient = useMemo<string>(() => {
    switch (overlayTone) {
      case "light":
        return "linear-gradient(180deg, rgba(250,247,242,0.92) 0%, rgba(250,247,242,0.74) 48%, rgba(250,247,242,0.96) 100%)";
      case "dark":
        return "linear-gradient(180deg, rgba(9,16,24,0.84) 0%, rgba(16,27,36,0.68) 52%, rgba(9,16,24,0.92) 100%)";
      case "amoled":
        return "linear-gradient(180deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.78) 52%, rgba(0,0,0,0.94) 100%)";
      case "auto":
      default:
        return "linear-gradient(180deg, rgba(9,16,24,0.78) 0%, rgba(16,27,36,0.62) 48%, rgba(9,16,24,0.88) 100%)";
    }
  }, [overlayTone]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[var(--color-cream)] isolate",
        className,
      )}
      style={containerStyle}
      data-image-ready={ready ? "true" : "false"}
      data-nat-w={naturalWidth ?? undefined}
      data-nat-h={naturalHeight ?? undefined}
      data-eff-ratio={effectiveRatio.toFixed(2)}
    >
      {/* Halo coloré doux (citron / orange) pour la profondeur */}
      {halo && (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-24 w-[60%] aspect-square rounded-full blur-3xl opacity-40"
            style={{ backgroundColor: "var(--color-citron)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-32 -right-20 w-[55%] aspect-square rounded-full blur-3xl opacity-50"
            style={{ backgroundColor: "var(--color-orange)" }}
          />
        </>
      )}

      {/* L'image elle-même : object-cover, le container suit le ratio clampé.
          L'image remplit TOUT le container, rognée si nécessaire. */}
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

      {/* Vignette douce pour la lisibilité des textes */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: overlayGradient }}
      />

      {/* Grain fin — finition cinéma (mix-blend) */}
      {grain && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.18]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.95  0 0 0 0 0.95  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: "180px 180px",
          }}
        />
      )}

      {/* Vapeur animée — clin d'œil au fer à repasser / pressing */}
      {steam && <SteamField />}

      {/* Contenu (CTA, titres…) — pleine hauteur du container, centré verticalement */}
      <div className="relative z-10 w-full h-full flex items-center">
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  SteamField — particules de vapeur subtiles, animées en CSS.               */
/* -------------------------------------------------------------------------- */
function SteamField() {
  // 6 volutes de vapeur, dérive lente vers le haut, opacité douce.
  const puffs = [
    { left: "12%", delay: 0, scale: 1.0, dur: 14 },
    { left: "28%", delay: 2, scale: 0.8, dur: 16 },
    { left: "44%", delay: 4, scale: 1.2, dur: 18 },
    { left: "61%", delay: 1, scale: 0.9, dur: 15 },
    { left: "76%", delay: 3, scale: 1.1, dur: 17 },
    { left: "88%", delay: 5, scale: 0.7, dur: 13 },
  ];
  return (
    <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
      {puffs.map((p, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-40px] w-24 h-24 rounded-full"
          style={{
            left: p.left,
            background:
              "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.10) 55%, rgba(255,255,255,0) 75%)",
            filter: "blur(8px)",
            transform: `scale(${p.scale})`,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: ["0%", "-120%"], opacity: [0, 0.55, 0] }}
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
