import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * Reveal — voile qui se lève : montée en ressort + disparition d'un
 * léger flou. Résultat nettement plus « premium » qu'un fade linéaire.
 *
 * <Reveal delay={0.08}><Card/></Reveal>
 *
 * `Stagger` + `RevealItem` pour les groupes :
 * <Stagger>{items.map(i => <RevealItem key={i.id}>…</RevealItem>)}</Stagger>
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  blur = true,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const reduce = useReducedMotion();
  const C = motion[as] as any;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <C
      className={className}
      initial={{ opacity: 0, y, scale: 0.985, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={{
        type: "spring",
        stiffness: 90,
        damping: 16,
        mass: 0.9,
        delay,
      }}
    >
      {children}
    </C>
  );
}

// =============================================================
// Stagger : conteneur + items en cascade
// =============================================================

const staggerParent = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const staggerChild = {
  hidden: { opacity: 0, y: 26, scale: 0.97, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 90, damping: 15, mass: 0.85 },
  },
};

export function Stagger({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "article";
}) {
  const reduce = useReducedMotion();
  const C = motion[as] as any;

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <C
      className={className}
      variants={staggerParent}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
    >
      {children}
    </C>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const C = motion[as] as any;
  return (
    <C className={className} variants={staggerChild}>
      {children}
    </C>
  );
}
