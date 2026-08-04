import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GALLERY_CREATIONS } from "@/data/galleries";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Button } from "@/components/ui/Button";
import { trackCtaClick } from "@/utils/api";

/**
 * CreationStrip — galerie cinéma plein écran :
 *   - fond nuit (marron/noir) pour contraster avec le ciel du site
 *   - ruban d'images en auto-scroll infini (pause au survol)
 *   - grand texte fantôme « CRÉATIONS » qui glisse en sens inverse
 *   - zéro texte long : on regarde, on clique.
 *
 * Les images viennent de GALLERY_CREATIONS (6 visuels WebP).
 */
export function CreationStrip() {
  const images = GALLERY_CREATIONS;

  return (
    <section
      className="relative py-16 md:py-20 overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0E0A08 0%, #150D08 50%, #0E0A08 100%)" }}
      aria-label="Les créations récentes de l'atelier"
    >
      {/* texte fantôme géant en fond (marquee inverse) */}
      <div className="absolute inset-0 flex items-center pointer-events-none select-none" aria-hidden="true">
        <div
          className="lsc-marquee-track lsc-marquee-track--reverse whitespace-nowrap"
          style={{ ["--marquee-duration" as string]: "48s", opacity: 0.05 }}
        >
          {[0, 1].map((n) => (
            <span
              key={n}
              className="text-[19vw] leading-none font-bold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "#F4B860" }}
            >
              CRÉATIONS · CRÉATIONS · CRÉATIONS ·&nbsp;
            </span>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="En ce moment à l'atelier"
          title={<span style={{ color: "#F7F0E6" }}>Les créations récentes</span>}
          subtitle={<span className="text-[#CDBDA8]">Boubous, robes, bazin, layette — cousus cette semaine.</span>}
          tone="orange"
          className="!mb-8"
        />

        {/* ruban d'images */}
        <div className="lsc-marquee relative -mx-4 sm:-mx-6 lg:-mx-8" aria-hidden="false">
          {/* voiles de bord */}
          <div className="absolute inset-y-0 left-0 w-16 md:w-28 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #0E0A08, transparent)" }} />
          <div className="absolute inset-y-0 right-0 w-16 md:w-28 z-10 pointer-events-none"
            style={{ background: "linear-gradient(-90deg, #0E0A08, transparent)" }} />

          <div
            className="lsc-marquee-track items-stretch"
            style={{ ["--marquee-duration" as string]: "38s" }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-stretch shrink-0 gap-4 pr-4">
                {images.map((img, i) => (
                  <figure
                    key={`${copy}-${img.src}`}
                    className="group relative shrink-0 w-[240px] h-[320px] md:w-[280px] md:h-[380px] rounded-[1.75rem] overflow-hidden"
                    style={{
                      boxShadow: "0 24px 48px -20px rgba(0,0,0,0.7)",
                      transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 1.2}deg)`,
                    }}
                  >
                    <img
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                    />
                    {/* dégradé bas pour légende */}
                    <div
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(180deg, transparent 55%, rgba(11,9,7,0.82) 100%)" }}
                    />
                    {/* anneau doré au survol */}
                    <div
                      className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-[rgba(244,184,96,0.28)] group-hover:ring-2 group-hover:ring-[rgba(191,255,0,0.55)] transition-shadow duration-500 pointer-events-none"
                    />
                    <figcaption className="absolute bottom-4 left-4 right-4">
                      <p className="text-sm font-semibold text-[#F7F0E6] leading-snug drop-shadow">
                        {img.caption ?? img.alt}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* CTA unique */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 90, damping: 15, delay: 0.1 }}
        >
          <Link to="/services" onClick={() => trackCtaClick("strip_commander")} className="inline-block">
            <Button size="lg" shimmer icon={<ArrowRight className="w-4 h-4" />}>
              Commander ma tenue
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
