import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, X } from "lucide-react";

/**
 * Bannière discrète qui s'affiche quand un brouillon est restauré,
 * avec actions "Reprendre" / "Recommencer".
 */
export function DraftBanner<T>({
  draft,
  onApply,
  onDiscard,
}: {
  draft: T | null;
  onApply: (d: T) => void;
  onDiscard: () => void;
}) {
  const [closed, setClosed] = useState(false);
  if (!draft || closed) return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-4 flex items-start gap-3 rounded-2xl border border-[var(--color-citron)]/60 bg-[var(--color-citron)]/15 p-3.5 text-sm"
      >
        <RotateCcw className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-orange)" }} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold mb-1">Brouillon retrouvé</p>
          <p className="text-xs text-[var(--color-muted)]">
            Vous aviez commencé à remplir ce formulaire. Voulez-vous reprendre ?
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                onApply(draft);
                setClosed(true);
              }}
              className="px-3 py-1.5 rounded-full bg-[var(--color-orange)] text-white text-xs font-semibold hover:opacity-90"
            >
              Reprendre
            </button>
            <button
              type="button"
              onClick={() => {
                onDiscard();
                setClosed(true);
              }}
              className="px-3 py-1.5 rounded-full bg-white border border-[var(--color-line)] text-xs font-medium hover:bg-black/5"
            >
              Recommencer
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setClosed(true)}
          className="text-[var(--color-muted)] hover:text-[var(--color-ink)] p-1"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}