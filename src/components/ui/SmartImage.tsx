import { ImgHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { useImageVersions } from "@/hooks/useImageVersions";

type SmartImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  /** Chemin WebP (toutes les images du site sont servies en WebP). */
  src: string;
  /** Set to true if the image is decorative (alt="", aria-hidden) */
  decorative?: boolean;
  /** Largeur intrinsèque de l'image (px) — permet de réserver l'espace et éviter le CLS. */
  width?: number;
  /** Hauteur intrinsèque de l'image (px) — permet de réserver l'espace et éviter le CLS. */
  height?: number;
};

/**
 * <SmartImage> rend un <picture> avec une source WebP et un fallback.
 * Toutes les images du projet sont en WebP (chemins `/images/...webp`).
 *
 * CLS (Cumulative Layout Shift) : si les props `width` et `height`
 * sont fournies, on réserve l'espace via `aspect-ratio` + attributs
 * HTML pour empêcher tout saut de mise en page pendant le chargement.
 */
export function SmartImage({
  src,
  alt,
  className,
  decorative = false,
  loading = "lazy",
  decoding = "async",
  width,
  height,
  ...rest
}: SmartImageProps) {
  const v = useImageVersions();
  const versionedSrc = v(src);
  const finalAlt = decorative ? "" : alt;

  // Détection : la classe CSS fournit-elle déjà un ratio d'aspect ?
  const classNameStr = (className ?? "").toString();
  const hasAspectClass =
    /\baspect-(video|square|auto)\b/.test(classNameStr) ||
    /\b\[\s*aspect-ratio\s*:/i.test(classNameStr);

  // Avertissement dev si l'image risque de provoquer un CLS
  if (
    import.meta.env.DEV &&
    width === undefined &&
    height === undefined &&
    !hasAspectClass
  ) {
    // eslint-disable-next-line no-console
    console.warn(
      "[SmartImage] CLS risk: pas de width/height ni aspect-ratio class sur",
      src
    );
  }

  // Construction du style inline pour réserver l'espace (anti-CLS)
  const aspectStyle =
    width !== undefined && height !== undefined
      ? { aspectRatio: `${width}/${height}` }
      : undefined;

  return (
    <picture>
      <source srcSet={versionedSrc} type="image/webp" />
      <img
        src={versionedSrc}
        alt={finalAlt}
        className={cn(className)}
        loading={loading}
        decoding={decoding}
        aria-hidden={decorative || undefined}
        width={width}
        height={height}
        style={aspectStyle}
        {...rest}
      />
    </picture>
  );
}
