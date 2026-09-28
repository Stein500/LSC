import { Link } from "react-router-dom";
import { ChevronRight, Download, Scissors } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { downloadAtelierImage } from "@/utils/downloadImage";

type Crumb = { label: string; to?: string };

/**
 * PageHero — « L'Écrin du chapitre » ✨ (28/09/2026)
 *
 * Mise en page de vitrine pour toutes les pages — grand titre de
 * rédaction à gauche, coupon-cadre doré à droite, aiguille qui coud
 * sous le titre. Mêmes écrits, nouvelle étoffe.
 *
 * ⚠️ LISIBILITÉ GARANTIE DANS TOUS LES THÈMES : la toile du héros
 * est une rose poudré FIXE — les textes posés dessus utilisent donc
 * des teintes marron FIXES (#241118 / #5C2E0C), jamais les jetons
 * qui s'inversent en thème sombre. Le coupon, lui, suit le thème
 * (surface claire ou sombre) avec grâce : ses libellés restent sur
 * les jetons qui s'adaptent et son code-barres est en currentColor.
 *
 * Toutes les animations respectent `prefers-reduced-motion`.
 */

function withWebp(image: string): string {
  if (/\.(avif|webp|png|jpe?g)$/i.test(image)) {
    return image.replace(/\.(avif|png|jpe?g)$/i, ".webp");
  }
  return `${image}.webp`;
}

/* ═══════════════ L'aiguille qui coud — signature sous les titres ═══════════════ */
export function NeedleStitch({ className = "", delay = 0.55 }: { className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 200 30"
      className={`h-[26px] w-[168px] md:w-[196px] ${className}`}
      fill="none"
      aria-hidden="true"
      initial={reduce ? undefined : { opacity: 0, scaleX: 0, originX: 0 }}
      animate={reduce ? undefined : { opacity: 1, scaleX: 1 }}
      transition={{ delay, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <path
        d="M2 22 C 34 8, 62 28, 96 16 S 156 8, 178 18"
        stroke="var(--color-gold-thread)"
        strokeWidth="2.4"
        strokeDasharray="7 6"
        strokeLinecap="round"
      />
      <g transform="translate(176 14) rotate(28)">
        <line x1="0" y1="0" x2="22" y2="0" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
        <circle cx="2.4" cy="0" r="2.6" stroke="#8B4513" strokeWidth="1.8" />
      </g>
    </motion.svg>
  );
}

/* ═══════════════ LE COUPON — la vitrine photo des héros ═══════════════ */
export function HeroCoupon({
  image,
  alt = "",
  aspectClassName = "aspect-[4/5]",
  className = "",
}: {
  image: string;
  alt?: string;
  aspectClassName?: string;
  className?: string;
}) {
  const finalImage = withWebp(image);
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`relative max-w-[340px] mx-auto lg:max-w-none ${className}`}
      initial={reduce ? undefined : { opacity: 0, y: 42, rotate: -6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0, rotate: -2 }}
      transition={{ type: "spring", stiffness: 55, damping: 13, mass: 1, delay: 0.4 }}
    >
      {/* Coupon d'ombre derrière — la pile de coupons de l'atelier */}
      <div
        className="absolute inset-0 rounded-[22px] border-2 border-dashed border-[var(--color-gold-thread)]/60 bg-white/40"
        style={{ transform: "rotate(3.5deg) translate(6px, 8px)" }}
        aria-hidden="true"
      />

      {/* Le coupon flotte doucement */}
      <motion.div
        className="relative rounded-[22px] bg-white/90 backdrop-blur border border-[var(--color-gold-thread)] p-3 shadow-[0_28px_56px_-20px_rgba(92,46,12,0.4)]"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Perforations poinçonnées (teinte = toile de fond des héros) */}
        <span
          className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FBE7EB] shadow-[inset_0_2px_4px_rgba(92,46,12,0.35)]"
          aria-hidden="true"
        />
        <span
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#FBE7EB] shadow-[inset_0_2px_4px_rgba(92,46,12,0.35)]"
          aria-hidden="true"
        />

        {/* Tampon de la maison */}
        <div className="flex items-center justify-between gap-3 px-1 pb-2.5">
          <span className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-ink-soft)]">
            COUTURE COLOMBE ET MERCERIES
          </span>
          <Scissors className="w-3.5 h-3.5 shrink-0 text-[var(--color-gold-thread)]" aria-hidden="true" />
        </div>
        <div className="border-t border-dashed border-[var(--color-gold-thread)]/70 mx-1" aria-hidden="true" />

        {/* La photo respire (Ken Burns lent) + reflet doré */}
        <div className={`relative mt-2.5 rounded-2xl overflow-hidden ${aspectClassName}`}>
          <motion.img
            src={finalImage}
            alt={alt}
            className="w-full h-full object-cover"
            loading="eager"
            decoding="async"
            animate={reduce ? undefined : { scale: [1.05, 1.13, 1.05] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(115deg, transparent 35%, rgba(255,244,230,0.32) 48%, transparent 62%)",
            }}
            aria-hidden="true"
            animate={reduce ? undefined : { x: ["-140%", "140%"] }}
            transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 4.2, ease: "easeInOut" }}
          />
        </div>

        {/* Pied du coupon : adresse + faux code-barres (currentColor : suit le thème) */}
        <div className="border-t border-dashed border-[var(--color-gold-thread)]/70 mx-1 mt-3" aria-hidden="true" />
        <div className="flex items-end justify-between gap-3 px-1 pt-2 text-[var(--color-ink)]">
          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-[var(--color-ink-soft)]">Porto-Novo · Bénin</p>
            <p className="text-xs font-semibold text-[var(--color-ink)]">Atelier · Mercerie · Formation</p>
          </div>
          <div
            className="h-7 w-24 opacity-80"
            style={{
              background:
                "repeating-linear-gradient(90deg, currentColor 0 2px, transparent 2px 5px, currentColor 5px 6px, transparent 6px 10px)",
              color: "inherit",
            }}
            aria-hidden="true"
          />
        </div>
      </motion.div>

      {/* 📥 Télécharger la bannière — posé sur le coupon */}
      <button
        type="button"
        onClick={() => void downloadAtelierImage(finalImage)}
        className="absolute -top-2.5 -right-2.5 z-10 w-9 h-9 rounded-full bg-[#241118]/85 hover:bg-[#241118] backdrop-blur-sm text-white flex items-center justify-center transition-colors shadow-lg"
        aria-label="Télécharger cette bannière (signée Couture Colombe et Merceries)"
        title="Télécharger l'image"
      >
        <Download className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

/* ═══════════════ L'Écrin du chapitre — héros commun des pages ═══════════════ */
export function PageHero({
  title,
  subtitle,
  image,
  crumbs = [],
}: {
  title: string;
  subtitle?: string;
  image: string;
  crumbs?: Crumb[];
}) {
  const finalImage = withWebp(image);
  const reduce = useReducedMotion();
  const watermark = (title.trim()[0] || "✂").toUpperCase();

  return (
    <section className="relative pt-32 md:pt-36 pb-16 md:pb-24 overflow-hidden lsc-grain">
      {/* ——— Étoffe de fond : rose poudré fixe + poches de lumière ——— */}
      <div className="absolute inset-0" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(158deg, #FDF0F3 0%, var(--color-blush) 42%, #F9E7DC 78%, #FDF3EC 100%)",
          }}
        />
        <div className="absolute -top-16 -left-16 w-72 h-72 rounded-full blur-3xl opacity-80 bg-[var(--color-feuille-doux)]" />
        <div className="absolute top-10 right-[8%] w-56 h-56 rounded-full blur-3xl opacity-60 bg-[#F6E3C4]" />
        <div className="absolute -bottom-20 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-70 bg-[#F9E0D2]" />
      </div>

      {/* Lettre-filigrane géante, façon page de magazine */}
      <div
        className="absolute -bottom-8 -right-3 md:-bottom-14 md:right-4 select-none pointer-events-none font-bold"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(10rem, 26vw, 22rem)",
          lineHeight: 0.85,
          color: "#241118",
          opacity: 0.05,
        }}
        aria-hidden="true"
      >
        {watermark}
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* ——— Colonne rédaction ——— */}
          <div className="lg:col-span-7">
            {crumbs.length > 0 && (
              <motion.nav
                className="flex flex-wrap items-center gap-2 text-[11px] md:text-xs font-semibold uppercase tracking-[0.16em] mb-6"
                style={{ color: "rgba(92,46,12,0.75)" }}
                initial={reduce ? undefined : { opacity: 0, y: -10 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
              >
                {crumbs.map((c, i) => (
                  <span key={i} className="flex items-center gap-2">
                    {c.to ? (
                      <Link
                        to={c.to}
                        className="lsc-link-underline hover:text-[var(--color-orange-d)] transition-colors"
                        style={{ color: "inherit" }}
                      >
                        {c.label}
                      </Link>
                    ) : (
                      <span className="text-[var(--color-ink)] bg-white/70 border border-dashed border-[var(--color-gold-thread)] rounded-full px-3 py-1">
                        {c.label}
                      </span>
                    )}
                    {i < crumbs.length - 1 && (
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--color-gold-thread)]" strokeWidth={2.5} />
                    )}
                  </span>
                ))}
              </motion.nav>
            )}

            {/* Grand titre de vitrine — révélé comme un rideau qu'on lève
                (teinte FIXE #241118 : la toile dessous est une rose fixe,
                 lisible en thème clair comme en thème sombre) */}
            <div className="overflow-hidden mb-3">
              <motion.h1
                className="text-[2.65rem] leading-[1.03] sm:text-6xl lg:text-[4.4rem] font-bold"
                style={{ fontFamily: "var(--font-display)", color: "#241118" }}
                initial={reduce ? undefined : { y: "108%" }}
                animate={reduce ? undefined : { y: 0 }}
                transition={{ type: "spring", stiffness: 62, damping: 15, mass: 0.9, delay: 0.25 }}
              >
                {title}
              </motion.h1>
            </div>

            <NeedleStitch className="mb-5" />

            {subtitle && (
              <motion.p
                className="text-lg md:text-xl font-medium max-w-xl"
                style={{ color: "rgba(92,46,12,0.85)" }}
                initial={reduce ? undefined : { opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Liseré citron→doré — la goutte d'or sous le sous-titre */}
            <motion.div
              className="mt-7 h-[3px] rounded-full"
              style={{
                width: 96,
                background: "linear-gradient(90deg, var(--color-citron), var(--color-gold-thread), transparent)",
              }}
              initial={reduce ? undefined : { scaleX: 0, opacity: 0 }}
              animate={reduce ? undefined : { scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* ——— Colonne vitrine : LE COUPON ——— */}
          <div className="lg:col-span-5">
            <HeroCoupon image={finalImage} />
          </div>
        </div>
      </div>

      {/* Liseré de couture au bas du héros */}
      <svg
        className="absolute bottom-3 inset-x-0 w-full h-[2px] opacity-50"
        preserveAspectRatio="none"
        viewBox="0 0 100 2"
        aria-hidden="true"
      >
        <line
          x1="0"
          y1="1"
          x2="100"
          y2="1"
          stroke="var(--color-gold-thread)"
          strokeWidth="1.6"
          strokeDasharray="6 8"
          className="lsc-stitch-line"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Ourlet wax — la signature des pagnes sous chaque tête de page */}
      <div className="lsc-wax-bande lsc-wax-bande--soft absolute bottom-0 inset-x-0" aria-hidden="true" />
    </section>
  );
}
