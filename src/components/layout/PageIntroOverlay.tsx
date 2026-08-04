import { AnimatePresence, motion } from "framer-motion";
import { Scissors } from "lucide-react";

export type PageIntroConfig = {
  title: string;
  subtitle?: string;
};

export function PageIntroOverlay({
  open,
  title,
  subtitle,
}: PageIntroConfig & { open: boolean }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-x-0 top-0 z-40 pointer-events-none flex justify-center px-4 pt-24 md:pt-28"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/85 px-5 py-4 shadow-[0_18px_60px_rgba(26,26,26,0.14)] backdrop-blur-xl"
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.98 }}
            transition={{ duration: 0.22 }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--color-citron)]/35 text-[var(--color-orange)]"
                animate={{ rotate: [0, -12, 0], x: [0, 6, 0] }}
                transition={{ duration: 0.75, ease: "easeInOut" }}
              >
                <Scissors className="h-5 w-5" />
              </motion.div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-citron)]/30">
                <motion.span
                  className="block h-full w-16 rounded-full bg-[var(--color-orange)]"
                  animate={{ x: ["-130%", "320%"] }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
            </div>

            <motion.p
              className="mt-3 text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-[var(--color-muted)]"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.2 }}
            >
              Ouverture de page
            </motion.p>
            <motion.h2
              className="mt-1 text-xl md:text-2xl"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.22 }}
            >
              {title}
            </motion.h2>
            {subtitle && (
              <motion.p
                className="mt-2 text-sm md:text-[0.95rem] leading-relaxed text-[var(--color-ink-soft)]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14, duration: 0.22 }}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
