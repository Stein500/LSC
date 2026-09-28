import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";

/**
 * CouponSection — la pièce maîtresse de « l'Écrin » 🎟️
 * ------------------------------------------------------------
 * Un coupon perforé fil d'or (comme les héros des pages), une
 * pastille numérotée dorée, une entrée en douceur. Partagé par
 * les trois formulaires de la maison : commande, contact, formation —
 * une seule voix, partout.
 */
export function CouponSection({
  numero,
  icon,
  title,
  sub,
  children,
}: {
  numero: string;
  icon: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white rounded-[1.75rem] border border-[var(--color-line)] shadow-sm overflow-hidden"
    >
      {/* Perforation fil d'or + petit ciseau */}
      <div className="relative h-4 bg-[var(--color-cream)]" aria-hidden="true">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] opacity-70 select-none">✂</span>
        <span
          className="absolute left-9 right-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed"
          style={{ borderColor: "var(--color-or,#C9A87C)" }}
        />
      </div>

      <div className="px-5 md:px-7 pb-6 md:pb-7 pt-4 space-y-5">
        <header className="flex items-start gap-3.5">
          <span
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #D3B68C 0%, #C9A87C 45%, #A9854F 100%)" }}
            aria-hidden="true"
          >
            {numero}
          </span>
          <div className="pt-0.5">
            <h3
              className="text-lg md:text-xl leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              {icon} {title}
            </h3>
            {sub && <p className="mt-1 text-xs md:text-[13px] text-[var(--color-muted)] leading-relaxed">{sub}</p>}
          </div>
        </header>
        {children}
      </div>
    </motion.section>
  );
}

/**
 * Champ oublié ? La page glisse doucement jusqu'au premier champ
 * entouré de rouge — jamais de visiteuse perdue dans un coupon.
 */
export function scrollToFirstInvalid(): void {
  requestAnimationFrame(() => {
    document
      .querySelector('[aria-invalid="true"]')
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

/** Le grand coupon d'envoi — perforé fil d'or, shimmer, plein de pep's. */
export function SubmitCoupon({
  note,
  loading,
  idleLabel,
  busyLabel,
}: {
  note: ReactNode;
  loading: boolean;
  idleLabel: string;
  busyLabel: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white rounded-[1.75rem] border-2 border-dashed p-5 md:p-7 text-center shadow-sm"
      style={{ borderColor: "var(--color-or,#C9A87C)" }}
    >
      <p className="text-xs md:text-sm text-[var(--color-muted)] leading-relaxed max-w-md mx-auto mb-5">
        {note}
      </p>
      <Button
        type="submit"
        loading={loading}
        size="lg"
        icon={<CheckCircle2 className="w-4 h-4" />}
        shimmer
        className="w-full sm:w-auto sm:min-w-[280px]"
      >
        {loading ? busyLabel : idleLabel}
      </Button>
    </motion.div>
  );
}
