import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { GALLERY_SERVICES } from "@/data/galleries";
import { SmartImage } from "@/components/ui/SmartImage";

/**
 * Les prestations en IMAGES — plus de listes de catégories à lire :
 * le client (même non-lecteur) voit, touche, commande. Chaque carte
 * pré-remplit le formulaire avec le type de tenue correspondant.
 */
const PRESTATIONS_VISUELLES: { titre: string; preset: string; src: string; alt: string }[] = [
  { titre: "Boubous & ensembles", preset: "Tenues africaines béninoises pour femmes", src: "/images/gallery/creation-afrique-01.webp", alt: "Boubou élégant cousu à l'atelier" },
  { titre: "Robes modernes", preset: "Robes africaines modernes", src: "/images/gallery/creation-afrique-04.webp", alt: "Robe moderne entre tradition et contemporain" },
  { titre: "Jupe & chemisier", preset: "Tenues de bureau féminines", src: "/images/gallery/creation-afrique-03.webp", alt: "Jupe et chemisier cousues sur mesure" },
  { titre: "Cérémonies & mariage", preset: "Tenues de cérémonie femme", src: "/images/gallery/mariage-robe-01.webp", alt: "Tenue de cérémonie cousue d'or" },
  { titre: "Pagne tissé & bazin", preset: "Pagne tissé & bazin chic", src: "/images/gallery/inspirations-page-02.webp", alt: "Wax, bazin et pagnes nobles" },
  { titre: "Mère & fille assorties", preset: "Ensembles mère-fille", src: "/images/gallery/famille-trio-01.webp", alt: "Ensembles mère et fille assortis" },
  { titre: "Layette & bébé", preset: "Layette & trousseaux bébé fille", src: "/images/gallery/layette-bebe-01.webp", alt: "Layette cousue main pour les tout-petits" },
  { titre: "Retouches & finitions", preset: "Retouches & ajustements", src: "/images/gallery/contact-atelier-04.webp", alt: "Retouches et finitions au geste juste" },
];

const FAQ = [
  { q: "Combien de temps pour une tenue ?", a: "Entre 1 et 4 semaines selon la complexité et la charge de l'atelier. Nous confirmons un délai à la commande." },
  { q: "Travaillez-vous avec mon tissu ?", a: "Oui, vous pouvez apporter votre tissu ou nous le fournirons via nos partenaires mercerie." },
  { q: "Faites-vous les retouches ?", a: "Bien sûr — retouches, ajustements, transformations sont notre quotidien." },
  { q: "Comment se passe l'essayage ?", a: "Un essayage intermédiaire est prévu pour les pièces sur mesure, plus un essayage final avant livraison." },
];

export default function Services() {
  const [open, setOpen] = useState<number | null>(0);
  const [preset, setPreset] = useState<string | undefined>(undefined);
  const formAnchorRef = useRef<HTMLDivElement | null>(null);

  // Arrivée depuis la galerie Inspirations : modèle & photo déjà joints.
  const [params] = useSearchParams();
  const fromGallery = params.get("commande") === "1";
  const presetModele = fromGallery ? (params.get("modele") ?? undefined) : undefined;
  const presetPhoto = fromGallery ? (params.get("photo") ?? undefined) : undefined;

  useEffect(() => {
    if (!presetModele) return;
    const t = window.setTimeout(() => {
      formAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 450);
    return () => window.clearTimeout(t);
  }, [presetModele]);

  const handlePreset = (type: string) => {
    setPreset(type);
    window.setTimeout(() => {
      formAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <>
      <SEO
        title="Services couture sur mesure"
        description="Confection sur mesure, retouches et layette à Porto-Novo — modèles africains & béninois, finitions pro."
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
        images={GALLERY_SERVICES}
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
            <p className="text-lg md:text-xl text-[var(--color-ink-soft)] leading-relaxed italic" style={{ fontFamily: "var(--font-display)" }}>
              Vos mesures, vos envies, notre savoir-faire —
              <span style={{ fontFamily: "var(--font-display)", color: "var(--color-orange)" }}> du quotidien à l'exception.</span>
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
            title={<>Nos créations, <span className="lsc-text-silk">en images</span></>}
            subtitle="Touchez le modèle qui vous ressemble — le formulaire se prépare tout seul."
          />

          <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {PRESTATIONS_VISUELLES.map((v) => (
              <RevealItem key={v.titre}>
                <button
                  onClick={() => handlePreset(v.preset)}
                  className="text-left w-full group rounded-3xl overflow-hidden bg-white border border-[var(--color-line)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-orange)]/40"
                  type="button"
                  aria-label={`Commander : ${v.titre}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage
                      src={v.src}
                      alt={v.alt}
                      width={1600}
                      height={1200}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-3.5 md:p-4">
                    <p className="font-bold text-sm md:text-base leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                      {v.titre}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-transform duration-300 group-hover:translate-x-1" style={{ background: "var(--color-feuille-f,#558B2F)" }}>
                      ✂️ Commander ce modèle
                    </span>
                  </div>
                </button>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Formulaire de commande */}
      <section className="py-16 md:py-24 bg-white" id="commande">
        <div ref={formAnchorRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-2">
              <SectionTitle
                align="left"
                eyebrow="Commande"
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
                  Formulaire de commande
                </h3>
                <p className="text-sm text-[var(--color-muted)] mb-6">
                  {presetModele ? (
                    <>Modèle choisi : <strong>{presetModele}</strong> — sa photo est déjà jointe à votre demande.</>
                  ) : preset ? (
                    <>Type pré-rempli : <strong>{preset}</strong></>
                  ) : (
                    "Tous les champs marqués * sont requis."
                  )}
                </p>
                <PrecommandeForm presetType={preset} presetModele={presetModele} presetPhoto={presetPhoto} />
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
