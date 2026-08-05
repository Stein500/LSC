import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * PageTransition — fondu couture entre les routes : la page qui part
 * s'efface en douceur, celle qui arrive se dévoile par le bas avec un
 * léger voile flouté qui se lève. Rapide (0.35s) pour rester snappy.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const reduce = useReducedMotion();

  if (reduce) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        className="lsc-page"
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
