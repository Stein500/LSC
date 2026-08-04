import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; to?: string };

/**
 * PageHero — image de fond, toujours servie en WebP.
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
  /**
   * Chemin de l'image — toujours WebP.
   *   - "/images/hero-services.webp"       (recommandé)
   *   - "/images/hero-services"            (l'extension .webp sera ajoutée)
   */
  image: string;
  crumbs?: Crumb[];
}) {
  const finalImage = withWebp(image);

  return (
    <section className="relative pt-20 md:pt-24 pb-20 md:pb-28 overflow-hidden">
      {/* Image de fond — WebP */}
      <div className="absolute inset-0">
        <img
          src={finalImage}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-cream)]/85 via-[var(--color-cream)]/75 to-[var(--color-cream)]/95" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {crumbs.length > 0 && (
          <nav className="flex items-center justify-center gap-1.5 text-xs md:text-sm text-[var(--color-ink-soft)] mb-6">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.to ? (
                  <Link to={c.to} className="hover:text-[var(--color-orange-d)] transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-[var(--color-ink)] font-medium">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ))}
          </nav>
        )}
        <h1
          className="text-4xl md:text-6xl font-bold leading-tight mb-4"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-lg md:text-xl text-[var(--color-ink-soft)] max-w-2xl mx-auto">{subtitle}</p>}
      </div>
    </section>
  );
}
