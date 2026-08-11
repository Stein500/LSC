import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Aurora } from "@/components/ui/Aurora";

type Crumb = { label: string; to?: string };

/**
 * PageHero — image de fond, toujours servie en WebP.
 *
 * Version « atelier d'exception » :
 *   - zoom lent façon Ken Burns sur l'image (respecte reduced-motion)
 *   - rideau doré qui balaie le titre à l'arrivée
 *   - orbes aurora + grain + liseré de couture en bas
 *
 * Tu peux passer :
 *   - "/images/hero-services.webp"     (extension WebP)
 *   - "/images/hero-services"          (sans extension → on ajoute .webp)
 *   - "/images/hero-services.png"      (autre extension → convertie en .webp)
 */
function withWebp(image: string): string {
  if (/\.(avif|webp|png|jpe?g)$/i.test(image)) {
    return image.replace(/\.(avif|png|jpe?g)$/i, ".webp");
  }
  return `${image}.webp`;
}

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

  return (
    <section className="relative pt-32 md:pt-28 pb-20 md:pb-28 overflow-hidden lsc-grain">
      {/* Image de fond — WebP + zoom lent */}
      <div className="absolute inset-0">
        <motion.img
          src={finalImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          initial={reduce ? undefined : { scale: 1.12 }}
          animate={reduce ? undefined : { scale: 1.02 }}
          transition={{ duration: 8, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cream)]/92 via-[var(--color-cream)]/88 to-[var(--color-cream)]/98" />
        {/* ☀️ Halo de lecture : zone claire garantie derrière titre & sous-titre,
            quel que soit le navigateur ou la complexité de la photo. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 78% 60% at 50% 55%, rgba(251,231,235,0.94) 0%, rgba(251,231,235,0.72) 42%, rgba(251,231,235,0) 78%)",
          }}
          aria-hidden="true"
        />
        <Aurora className="absolute inset-0" variant="sky" intensity="soft" />
      </div>

      {/* Liseré de couture en bas du hero */}
      <svg
        className="absolute bottom-3 inset-x-0 w-full h-[2px] opacity-50"
        preserveAspectRatio="none"
        viewBox="0 0 100 2"
        aria-hidden="true"
      >
        <line
          x1="0" y1="1" x2="100" y2="1"
          stroke="var(--color-gold-thread)"
          strokeWidth="1.6"
          strokeDasharray="6 8"
          className="lsc-stitch-line"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {crumbs.length > 0 && (
          <motion.nav
            className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-[var(--color-ink-soft)] mb-7"
            initial={reduce ? undefined : { opacity: 0, y: -10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
          >
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.to ? (
                  <Link to={c.to} className="lsc-link-underline hover:text-[var(--color-orange-d)] transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-[var(--color-ink)] font-medium px-3 py-1 rounded-full lsc-glass-strong">
                    {c.label}
                  </span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ))}
          </motion.nav>
        )}

        {/* Titre révélé par rideau : chaque ligne masquée monte d'un coup */}
        <div className="overflow-hidden mb-4">
          <motion.h1
            className="text-4xl md:text-6xl font-bold leading-[1.08]"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--color-ink)",
              textShadow: "0 2px 26px rgba(253,236,239,0.95), 0 0 8px rgba(253,236,239,0.85)",
            }}
            initial={reduce ? undefined : { y: "108%" }}
            animate={reduce ? undefined : { y: 0 }}
            transition={{ type: "spring", stiffness: 62, damping: 15, mass: 0.9, delay: 0.25 }}
          >
            {title}
          </motion.h1>
        </div>

        {subtitle && (
          <motion.p
            className="text-lg md:text-xl font-medium text-[var(--color-ink)] max-w-2xl mx-auto"
            style={{ textShadow: "0 1px 16px rgba(253,236,239,0.95), 0 0 6px rgba(253,236,239,0.8)" }}
            initial={reduce ? undefined : { opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={reduce ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {subtitle}
          </motion.p>
        )}

        {/* Double liseré citron→doré sous le sous-titre */}
        <motion.div
          className="mx-auto mt-7 h-[3px] rounded-full"
          style={{
            width: 96,
            background: "linear-gradient(90deg, var(--color-citron), var(--color-gold-thread), transparent)",
          }}
          initial={reduce ? undefined : { scaleX: 0, opacity: 0 }}
          animate={reduce ? undefined : { scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </section>
  );
}
