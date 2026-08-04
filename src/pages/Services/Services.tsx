import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Scissors } from "lucide-react";
import { SEO, SchemaBuilders } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Reveal, Stagger, RevealItem } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PrecommandeForm } from "@/components/forms/PrecommandeForm";
import { PageHeaderBand } from "@/components/ui/PageHeaderBand";
import { Aurora } from "@/components/ui/Aurora";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { SERVICES } from "@/data/content";
import { GALLERY_CREATIONS } from "@/data/galleries";

const FAQ = [
  { q: "Combien de temps pour une tenue ?", a: "Entre 1 et 4 semaines selon la complexité et la charge de l'atelier. Nous confirmons un délai à la pré-commande." },
  { q: "Travaillez-vous avec mon tissu ?", a: "Oui, vous pouvez apporter votre tissu ou nous le fournirons via nos partenaires mercerie." },
  { q: "Faites-vous les retouches ?", a: "Bien sûr — retouches, ajustements, transformations sont notre quotidien." },
  { q: "Comment se passe l'essayage ?", a: "Un essayage intermédiaire est prévu pour les pièces sur mesure, plus un essayage final avant livraison." },
];

export default function Services() {
  const [open, setOpen] = useState<number | null>(0);
  const [preset, setPreset] = useState<string | undefined>(undefined);
  const formAnchorRef = useRef<HTMLDivElement | null>(null);

  const handlePreset = (type: string) => {
    setPreset(type);
    window.setTimeout(() => {
      formAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <>
      <SEO
        title="Services de couture sur mesure"
        description="Confection sur mesure, finitions professionnelles, retouches et layette à Porto-Novo. Une collection élargie de modèles africains et béninois."
        path="/services"
        ogImage="/images/hero-services.webp"
        jsonLd={[
          SchemaBuilders.organization(),
          SchemaBuilders.localBusiness(),
          SchemaBuilders.breadcrumb([
            { name: "Accueil", url: "/" },
            { name: "Services", url: "/services" },
          ]),
          SchemaBuilders.service({
            name: "Couture sur mesure à Porto-Novo",
            description:
              "Confection sur mesure, finitions professionnelles, retouches, layette et tenues africaines béninoises pour femmes.",
            url: "/services",
            image: "/images/hero-services.webp",
          }),
          SchemaBuilders.faqPage(FAQ),
        ]}
      />

      {/* ===================== BIBLIOTHÈQUE GALERIE (juste après le header) ===================== */}
      <PageHeaderBand
        images={GALLERY_CREATIONS}
        introTitle="Les créations récentes"
        introSubtitle="Boubous, robes, bazin, layette… un aperçu de ce que nous façonnons chaque semaine à l'atelier."
        introLabel="Galerie Services"
        seamCaption="Les créations"
        maxHeight="min(54vh, 500px)"
      />

      {/* ===================== HERO ===================== */}
      <PageHero
        title="Faites confectionner vos tenues sur mesure"
        subtitle="Du patronage à la finition, un savoir-faire familial au service des tenues féminines africaines et béninoises."
        image="/images/hero-services.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Services" }]}
      />

      {/* Intro */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-lg md:text-xl text-[var(--color-ink-soft)] leading-relaxed">
              <span style={{ fontFamily: "var(--font-display)", color: "var(--color-orange)" }}>
                Chez Les Services Colombes,
              </span>{" "}
              chaque pièce est unique. Nous travaillons à partir de vos mesures, de vos envies et de votre morphologie
              pour créer des tenues féminines qui vous ressemblent — du quotidien aux modèles africains d'exception.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Grille services */}
      <section className="relative py-12 md:py-16 bg-[var(--color-cream)] overflow-hidden">
        <Aurora className="absolute inset-0" variant="sky" intensity="soft" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nos prestations"
            title={<>Des modèles <span className="lsc-text-silk">africains et béninois</span> à votre disposition</>}
          />

          <Stagger className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {SERVICES.map((s) => (
              <RevealItem key={s.title}>
                <button
                  onClick={() => handlePreset(s.title)}
                  className="text-left w-full group"
                  type="button"
                >
                  <Card className="h-full">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-citron)]/30 flex items-center justify-center text-2xl mb-3 transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-[var(--color-citron)]/50">
                      {s.emoji}
                    </div>
                    <h4 className="font-bold text-sm mb-1.5" style={{ fontFamily: "var(--font-display)" }}>
                      {s.title}
                    </h4>
                    <p className="text-xs text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
                    <span className="mt-3 inline-block text-xs font-semibold lsc-arrow-nudge transition-transform duration-300 group-hover:translate-x-1" style={{ color: "var(--color-orange)" }}>
                      Pré-commander →
                    </span>
                  </Card>
                </button>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Formulaire de pré-commande */}
      <section className="py-16 md:py-24 bg-white" id="precommande">
        <div ref={formAnchorRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-2">
              <SectionTitle
                align="left"
                eyebrow="Pré-commande"
                title={
                  <>
                    Lancez votre<br />
                    <span style={{ color: "var(--color-orange)" }}>projet sur mesure</span>
                  </>
                }
                subtitle="Décrivez votre besoin, nous revenons vers vous sous 48h avec un devis."
              />
              <ul className="space-y-3 text-sm text-[var(--color-ink-soft)]">
                {[
                  "Réponse sous 48h ouvrées",
                  "Devis gratuit & sans engagement",
                  "Essayage en atelier",
                  "Paiement à la livraison",
                ].map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[var(--color-citron)] flex items-center justify-center text-xs font-bold">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3">
              <Card hover={false} className="p-6 md:p-8">
                <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                  Formulaire de pré-commande
                </h3>
                <p className="text-sm text-[var(--color-muted)] mb-6">
                  {preset ? <>Type pré-rempli : <strong>{preset}</strong></> : "Tous les champs marqués * sont requis."}
                </p>
                <PrecommandeForm presetType={preset} />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 bg-[var(--color-cream)] overflow-hidden">
        <Aurora className="absolute inset-0" variant="warm" intensity="soft" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="FAQ"
            title={<><Scissors className="inline w-8 h-8 mr-2" />Vos questions</>}
          />
          <div className="space-y-2.5">
            {FAQ.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06}>
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="lsc-card-sheen lsc-hemline w-full text-left bg-white rounded-2xl border border-[var(--color-line)] px-5 py-4 hover:border-[var(--color-gold-thread)]/60 transition-colors shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-sm md:text-base">{f.q}</span>
                    <motion.span
                      animate={{ rotate: open === i ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      className="shrink-0 inline-flex"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </div>
                  <AnimatePresence initial={false}>
                    {open === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 210, damping: 26 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-sm text-[var(--color-ink-soft)] leading-relaxed">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <StitchDivider className="max-w-4xl mx-auto px-6 pb-8" accent label="Fait main, avec amour" />
    </>
  );
}
