// PHASE 0 — LoveLetter : modale "lettre d'amour" avec glass + confettis.
// Pour célébrer un envoi réussi (contact, formation, précommande).

import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart } from 'lucide-react';
import { Handwritten } from './Handwritten';
import { HeartPulse } from './HeartPulse';
import { StickerConfetti } from './Sticker';

type Props = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  onClose?: () => void;
  showConfetti?: boolean;
};

export function LoveLetter({
  title,
  subtitle,
  children,
  onClose,
  showConfetti = false,
}: Props) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {showConfetti && <StickerConfetti count={6} onMount />}
        <motion.div
          className="lsc-glass relative w-[min(96vw,520px)] rounded-[2rem] p-6 sm:p-8 shadow-2xl"
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full bg-white/80 p-1.5 shadow-sm hover:scale-110 transition"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center gap-2 mb-2">
            <HeartPulse size={20} color="blush" />
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </h2>
          </div>
          {subtitle && (
            <Handwritten as="p" color="var(--color-orange-d, #5C2E0C)" className="mb-4">
              {subtitle}
            </Handwritten>
          )}
          <div className="text-sm sm:text-base text-[var(--color-ink-soft)]">
            {children}
          </div>
          <div className="mt-6 flex justify-center text-[var(--color-orange, #8B4513)]">
            <Heart className="h-5 w-5" fill="currentColor" />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default LoveLetter;
