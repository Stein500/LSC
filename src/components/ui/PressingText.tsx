import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/utils/cn";

type PressingTextProps = {
  /** Mots qui cyclent à l'écran — chacun évoque l'univers du repassage. */
  words?: string[];
  /** Préfixe affiché avant le mot (par ex. "un"). */
  prefix?: string;
  /** Suffixe affiché après le mot (par ex. "parfait"). */
  suffix?: string;
  /** Délai entre deux mots (ms). */
  interval?: number;
  className?: string;
  /** Couleur du mot qui change (par défaut la couleur orange de la marque). */
  wordClassName?: string;
};

/**
 * <PressingText> — fait cycler en douceur des mots évoquant le fer à repasser :
 * "pli", "lisse", "vapeur", "soin", "finition", "éclat", "tendu"…
 *
 * L'effet est volontairement **soft** : fondu + léger décalage vertical, sans
 * agressivité. Le mot apparaît dans la couleur d'accent (orange par défaut).
 */
export function PressingText({
  words = ["pli", "lisse", "vapeur", "soin", "finition", "éclat", "tendu"],
  prefix,
  suffix,
  interval = 2400,
  className,
  wordClassName,
}: PressingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [words, interval]);

  const current = words[index];

  return (
    <span className={cn("inline-flex items-baseline", className)}>
      {prefix && <span className="mr-2">{prefix}</span>}
      <span className="relative inline-block overflow-hidden align-baseline">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={current}
            initial={{ y: "60%", opacity: 0, filter: "blur(6px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-60%", opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "inline-block italic font-semibold",
              wordClassName,
            )}
            style={{
              color: "var(--color-orange)",
              fontFamily: "var(--font-display)",
            }}
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </span>
      {suffix && <span className="ml-2">{suffix}</span>}
    </span>
  );
}
