import { useRef, type ReactNode, type CSSProperties } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/utils/cn";

/**
 * Magnetic — effet « aimant » : l'élément suit doucement le curseur puis
 * revient à sa place avec un ressort. Désactivé sur tactile et quand
 * l'utilisateur préfère réduire les animations.
 */
export function Magnetic({
  children,
  strength = 0.28,
  className,
  style,
}: {
  children: ReactNode;
  /** 0 → aucun mouvement, 0.5 → suit à 50% du déplacement du curseur */
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 14, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 180, damping: 14, mass: 0.4 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || !ref.current || e.pointerType === "touch") return;
    const rect = ref.current.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    x.set(relX * strength);
    y.set(relY * strength);
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ x: sx, y: sy, display: "inline-block", ...style }}
      className={cn("will-change-transform", className)}
    >
      {children}
    </motion.div>
  );
}
