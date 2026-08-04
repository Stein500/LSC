/**
 * Stickers SVG inline — illustrations couture / atelier / pagne africain.
 *
 * PHASE 0 — extension :
 *  - 4 stickers culturels ajoutés : kente-pattern, caftan-silhouette, kimono-fold, pagne-tisse-large
 *  - 2 nouveaux exports : <Sticker3D> (wrapper perspective) et <StickerConfetti>
 *  - 1 nouveau type : StickerId = union de tous les noms
 *
 * API historique (back-compat) : <Sticker name="scissors" size={48} />
 * API culturelle (PHASE 0)     : <Sticker name="kente-pattern" size={48} />
 */

import { type CSSProperties, type ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export type StickerName =
  | "spool"
  | "pin"
  | "scissors"
  | "mannequin"
  | "pagne"
  | "fabric"
  | "button"
  | "thread"
  // === AJOUTS PHASE 0 — stickers culturels ===
  | "kente-pattern"
  | "caftan-silhouette"
  | "kimono-fold"
  | "pagne-tisse-large";

export type StickerId = StickerName;

type Props = {
  name: StickerName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  rotate?: number;
  title?: string;
};

export function Sticker({ name, size = 48, className, style, rotate = 0, title }: Props) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    xmlns: "http://www.w3.org/2000/svg",
    role: "img",
    "aria-label": title || `Sticker ${name}`,
    className: cn("select-none", className),
    style: { transform: rotate ? `rotate(${rotate}deg)` : undefined, ...style },
  };

  switch (name) {
    case "spool":
      return (
        <svg {...common}>
          <ellipse cx="32" cy="14" rx="18" ry="6" fill="currentColor" opacity="0.85" />
          <rect x="14" y="14" width="36" height="36" fill="currentColor" opacity="0.5" />
          <ellipse cx="32" cy="50" rx="18" ry="6" fill="currentColor" />
          <line x1="32" y1="14" x2="32" y2="50" stroke="white" strokeWidth="1" opacity="0.5" />
        </svg>
      );
    case "pin":
      return (
        <svg {...common}>
          <circle cx="32" cy="20" r="6" fill="currentColor" />
          <line x1="32" y1="26" x2="32" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "scissors":
      return (
        <svg {...common}>
          <circle cx="18" cy="40" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
          <circle cx="46" cy="40" r="7" fill="none" stroke="currentColor" strokeWidth="3" />
          <line x1="22" y1="36" x2="44" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          <line x1="42" y1="36" x2="20" y2="14" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case "mannequin":
      return (
        <svg {...common}>
          <path
            d="M32 6c-3 0-5 2-5 5s2 5 5 5 5-2 5-5-2-5-5-5zm-3 12c-4 1-9 4-9 8v6l4-2v18l4 4h2v8h4v-8h2l4-4V30l4 2v-6c0-4-5-7-9-8h-6z"
            fill="currentColor"
          />
        </svg>
      );
    case "pagne":
      return (
        <svg {...common}>
          <rect x="6" y="20" width="52" height="24" fill="currentColor" />
          <g fill="white" opacity="0.7">
            <rect x="10" y="24" width="4" height="4" />
            <rect x="22" y="24" width="4" height="4" />
            <rect x="34" y="24" width="4" height="4" />
            <rect x="46" y="24" width="4" height="4" />
            <rect x="16" y="36" width="4" height="4" />
            <rect x="28" y="36" width="4" height="4" />
            <rect x="40" y="36" width="4" height="4" />
            <rect x="52" y="36" width="2" height="4" />
          </g>
        </svg>
      );
    case "fabric":
      return (
        <svg {...common}>
          <path
            d="M8 16 Q20 8 32 16 T56 16 V48 Q44 56 32 48 T8 48 Z"
            fill="currentColor"
            opacity="0.85"
          />
          <path
            d="M8 16 Q20 8 32 16 T56 16"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
          <path
            d="M8 48 Q20 56 32 48 T56 48"
            stroke="white"
            strokeWidth="1.5"
            fill="none"
            opacity="0.5"
          />
        </svg>
      );
    case "button":
      return (
        <svg {...common}>
          <circle cx="32" cy="32" r="22" fill="currentColor" />
          <circle cx="32" cy="32" r="14" fill="white" opacity="0.4" />
          <circle cx="32" cy="22" r="2" fill="currentColor" />
          <circle cx="32" cy="42" r="2" fill="currentColor" />
          <circle cx="22" cy="32" r="2" fill="currentColor" />
          <circle cx="42" cy="32" r="2" fill="currentColor" />
        </svg>
      );
    case "thread":
      return (
        <svg {...common} viewBox="0 0 64 64">
          <path
            d="M8 20 Q32 0 56 20 T8 44 Q32 64 56 44"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      );

    // === STICKERS CULTURELS (PHASE 0) ===

    case "kente-pattern":
      return (
        <svg {...common}>
          <defs>
            <pattern id={`kente-${size}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
              <rect width="16" height="16" fill="currentColor" opacity="0.15" />
              <rect x="0" y="0" width="8" height="4" fill="currentColor" opacity="0.85" />
              <rect x="8" y="4" width="8" height="4" fill="currentColor" opacity="0.6" />
              <rect x="0" y="8" width="4" height="8" fill="currentColor" opacity="0.5" />
              <rect x="12" y="12" width="4" height="4" fill="currentColor" opacity="0.9" />
            </pattern>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="4" fill={`url(#kente-${size})`} stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );

    case "caftan-silhouette":
      return (
        <svg {...common}>
          {/* Silhouette de caftan marocain avec col mao */}
          <path
            d="M32 6 L26 10 L24 14 L20 18 L18 26 L16 38 L14 54 L50 54 L48 38 L46 26 L44 18 L40 14 L38 10 Z"
            fill="currentColor"
            opacity="0.85"
          />
          {/* Col mao */}
          <path
            d="M28 6 L32 12 L36 6 L36 14 L28 14 Z"
            fill="currentColor"
          />
          {/* Bouton central */}
          <circle cx="32" cy="20" r="1.5" fill="white" opacity="0.8" />
          <circle cx="32" cy="30" r="1.5" fill="white" opacity="0.8" />
          <circle cx="32" cy="40" r="1.5" fill="white" opacity="0.8" />
          {/* Ceinture */}
          <rect x="22" y="44" width="20" height="2" fill="currentColor" opacity="0.6" />
        </svg>
      );

    case "kimono-fold":
      return (
        <svg {...common}>
          {/* Plis de kimono avec ceinture obi */}
          <path
            d="M14 10 L18 8 L22 12 L26 8 L32 12 L38 8 L42 12 L46 8 L50 10 L48 30 L16 30 Z"
            fill="currentColor"
            opacity="0.85"
          />
          <path
            d="M16 30 L48 30 L46 56 L18 56 Z"
            fill="currentColor"
            opacity="0.65"
          />
          {/* Plis verticaux */}
          <line x1="22" y1="30" x2="22" y2="56" stroke="white" strokeWidth="0.5" opacity="0.5" />
          <line x1="28" y1="30" x2="28" y2="56" stroke="white" strokeWidth="0.5" opacity="0.5" />
          <line x1="34" y1="30" x2="34" y2="56" stroke="white" strokeWidth="0.5" opacity="0.5" />
          <line x1="40" y1="30" x2="40" y2="56" stroke="white" strokeWidth="0.5" opacity="0.5" />
          {/* Ceinture obi */}
          <rect x="14" y="36" width="36" height="6" fill="currentColor" />
          <rect x="14" y="38" width="36" height="1" fill="white" opacity="0.4" />
        </svg>
      );

    case "pagne-tisse-large":
      return (
        <svg {...common}>
          <defs>
            <pattern id={`pagne-${size}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <rect width="20" height="20" fill="currentColor" opacity="0.2" />
              <circle cx="10" cy="10" r="3" fill="currentColor" opacity="0.8" />
              <path d="M0 10 L5 5 L10 10 L5 15 Z" fill="currentColor" opacity="0.5" />
              <path d="M10 10 L15 5 L20 10 L15 15 Z" fill="currentColor" opacity="0.5" />
            </pattern>
          </defs>
          <rect x="2" y="8" width="60" height="48" rx="2" fill={`url(#pagne-${size})`} stroke="currentColor" strokeWidth="1.5" />
          {/* Bordure supérieure */}
          <rect x="2" y="8" width="60" height="3" fill="currentColor" />
          {/* Bordure inférieure */}
          <rect x="2" y="53" width="60" height="3" fill="currentColor" />
        </svg>
      );

    default:
      return null;
  }
}

// === WRAPPERS PHASE 0 ===

/**
 * Wrapper perspective + slow Y rotation (3D hover effect).
 */
export function Sticker3D({
  children,
  duration = 6,
}: {
  children: ReactNode;
  duration?: number;
}) {
  return (
    <div
      style={{
        perspective: "800px",
        display: "inline-block",
      }}
    >
      <div
        className="lsc-bob"
        style={{
          transformStyle: "preserve-3d",
          animation: `lsc-rotate3d ${duration}s ease-in-out infinite`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Confettis de stickers qui tombent — pour célébrer un envoi réussi.
 */
export function StickerConfetti({
  count = 6,
  onMount = false,
}: {
  count?: number;
  onMount?: boolean;
}) {
  const stickers = useMemo<StickerName[]>(() => {
    const list: StickerName[] = [
      "scissors",
      "spool",
      "kente-pattern",
      "caftan-silhouette",
      "kimono-fold",
      "pagne-tisse-large",
    ];
    return Array.from({ length: count }, (_, i) => list[i % list.length]);
  }, [count]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {stickers.map((id, i) => (
        <motion.div
          key={`${id}-${i}`}
          initial={{ y: -50, x: `${(i / count) * 100}vw`, rotate: 0, opacity: 0 }}
          animate={{ y: "110vh", rotate: 360, opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 2.5 + (i % 3),
            delay: onMount ? 0 : i * 0.15,
            ease: "easeOut",
          }}
          className="absolute"
        >
          <Sticker name={id} size={28} />
        </motion.div>
      ))}
    </div>
  );
}

export default Sticker;
