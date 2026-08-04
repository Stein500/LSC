import { motion, useScroll, useSpring, useReducedMotion } from "framer-motion";

/**
 * ScrollProgress — le « fil de couture » de la page : une fine ligne
 * citron→doré qui se déroule sous la nav au fil du scroll, lissée par
 * un ressort physique. Posée en fixed top, sous la navigation (z-30).
 */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  if (reduce) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left pointer-events-none"
      style={{
        scaleX,
        background:
          "linear-gradient(90deg, var(--color-citron) 0%, var(--color-gold-thread) 55%, var(--color-orange) 100%)",
        boxShadow: "0 0 10px rgba(191, 255, 0, 0.45)",
      }}
      aria-hidden="true"
    />
  );
}
