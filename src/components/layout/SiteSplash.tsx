import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Scissors } from "lucide-react";
import { env } from "@/utils/env";
import { SmartImage } from "@/components/ui/SmartImage";

const SPLASH_KEY = "lsc_site_splash_seen_v1";

export function SiteSplash() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SPLASH_KEY)) return;

    sessionStorage.setItem(SPLASH_KEY, "1");
    setVisible(true);

    const hideTimer = window.setTimeout(() => setVisible(false), 1800);
    return () => window.clearTimeout(hideTimer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-cream)]/96 backdrop-blur-xl px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-16 left-1/2 h-40 w-[80vw] -translate-x-1/2 rounded-full bg-[var(--color-citron)]/20 blur-3xl"
              animate={{ y: [0, 18, 0], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-r from-transparent via-[var(--color-orange)]/10 to-transparent"
              animate={{ x: ["-20%", "20%", "-20%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <motion.div
            className="relative w-full max-w-xl text-center"
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.98 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <div className="mx-auto mb-6 flex items-center justify-center gap-3 text-[var(--color-orange)]">
              <Scissors className="h-6 w-6" />
              <motion.div
                className="h-1.5 w-28 rounded-full bg-[var(--color-citron)]/40 overflow-hidden"
                aria-hidden="true"
              >
                <motion.span
                  className="block h-full w-12 rounded-full bg-[var(--color-orange)]"
                  animate={{ x: ["-140%", "320%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.div>
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 px-6 py-8 shadow-[0_30px_80px_rgba(26,26,26,0.12)]">
              <div className="mx-auto mb-4 h-20 w-20 overflow-hidden rounded-3xl border-2 border-[var(--color-citron)] bg-white p-2 shadow-sm">
                <SmartImage src="/images/logo.webp" alt={env.schoolName} className="h-full w-full object-contain" />
              </div>

              <motion.p
                className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[var(--color-muted)]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.35 }}
              >
                Bienvenue chez
              </motion.p>

              <motion.h1
                className="mt-2 text-3xl md:text-5xl leading-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.4 }}
              >
                {env.schoolName}
              </motion.h1>

              <motion.p
                className="mt-4 text-base md:text-lg leading-relaxed text-[var(--color-ink-soft)]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                {env.schoolTagline || "Couture femme, élégance africaine et savoir-faire sur mesure."}
              </motion.p>

              <motion.p
                className="mt-4 text-sm font-medium uppercase tracking-[0.22em] text-[var(--color-orange)]"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.38, duration: 0.35 }}
              >
                Entrez dans un atelier de couture chaleureux et raffiné
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
