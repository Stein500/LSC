import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import { SEO, SchemaBuilders } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Counter } from "@/components/ui/Counter";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Badge } from "@/components/ui/Badge";
import { FormationForm } from "@/components/forms/FormationForm";
import { PageHeaderBand } from "@/components/ui/PageHeaderBand";
import { Aurora } from "@/components/ui/Aurora";
import { FORMULES, FAQ_FORMATION, TESTIMONIALS } from "@/data/content";
import { SmartImage } from "@/components/ui/SmartImage";

/** Vrai visuel par formule — « toucher l'image, pas lire le texte ». */
const FORMULE_VISUELS: Record<string, { src: string; alt: string }> = {
  courte: { src: "/images/gallery/formation-couture-01.webp", alt: "Apprenantes en atelier — Formation Courte" },
  specialisee: { src: "/images/gallery/formation-couture-02.webp", alt: "Encadrement personnalisé — Formation Spécialisée" },
};
import { GALLERY_FORMATION } from "@/data/galleries";

export default function Formation() {
  const [openFormule, setOpenFormule] = useState<string | null>("specialisee");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [presetFormule, setPresetFormule] = useState<"courte" | "specialisee" | undefined>(undefined);
  const formAnchorRef = useRef<HTMLDivElement | null>(null);

  const handleChooseFormule = (id: "courte" | "specialisee") => {
    setPresetFormule(id);
    window.setTimeout(() => {
      formAnchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  return (
    <>
      <SEO
        title="Formation de couturière"
        description="Devenez Maîtresse Couturière avec une pro. Deux formules : Formation Courte ou Spécialisée à Porto-Novo."
        path="/formation"
        ogImage="/images/hero-formation.webp"
        jsonLd={[
          SchemaBuilders.organization(),
          SchemaBuilders.localBusiness(),
          SchemaBuilders.breadcrumb([
            { name: "Accueil", url: "/" },
            { name: "Formation", url: "/formation" },
          ]),
          SchemaBuilders.course({
            name: "Formation Couture Professionnelle à Porto-Novo",
            description:
              "Devenez Maîtresse Couturière à l'atelier Couture Colombe et Merceries. Deux formules : Formation Courte (6-12 mois) ou Spécialisée (3-5 ans).",
            url: "/formation",
          }),
          SchemaBuilders.faqPage(FAQ_FORMATION),
        ]}
      />

      {/* ===================== BIBLIOTHÈQUE GALERIE (juste après le header) ===================== */}
      <PageHeaderBand
        images={GALLERY_FORMATION}
        introTitle="Vie à l'école"
        introSubtitle="De la première prise de mesures au projet final — revivez les moments clés d'une formation chez nous."
        introLabel="Galerie Formation"
        seamCaption="Vie à l'école"
        maxHeight="min(54vh, 500px)"
      />

      {/* ===================== HERO ===================== */}
      <PageHero
        title="Devenez Maîtresse Couturière avec une Pro"
        subtitle="Une formation pratique, encadrée par l'équipe de l'atelier Couture Colombe et Merceries, pour transformer votre passion en métier."
        image="/images/hero-formation.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Formation" }]}
      />

      {/* Intro */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-lg md:text-xl text-[var(--color-ink-soft)] leading-relaxed italic" style={{ fontFamily: "var(--font-display)" }}>
              <strong style={{ color: "var(--color-orange)", fontFamily: "var(--font-display)" }}>Colombe</strong>
              , Maîtresse Couturière depuis 35 ans — encadrement personnalisé, machines fournies.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 bg-[var(--color-cream)]">
        <div className="max-w-3xl mx-auto px-4 grid grid-cols-2 gap-3">
          <Counter end={30} suffix="+" label="Apprenantes formées" icon="👩‍🎓" />
          <Counter end={100} suffix="%" label="Satisfaction" icon="💯" />
        </div>
      </section>

      {/* 2 Formules */}
      <section className="relative py-16 md:py-24 bg-white overflow-hidden">
        <Aurora className="absolute inset-0" variant="warm" intensity="soft" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Formules"
            title={<>Deux parcours <span style={{ color: "var(--color-orange)" }}>adaptés</span></>}
          />
          <div className="grid md:grid-cols-2 gap-5">
            {FORMULES.map((f, i) => {
              const visuel = FORMULE_VISUELS[f.id];
              return (
              <Reveal key={f.id} delay={i * 0.1}>
                <Card hover={false} className="h-full p-0 overflow-hidden relative">
                  {/* ✂️ D'abord l'image : la cliente voit, puis elle lit */}
                  {visuel && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <SmartImage
                        src={visuel.src}
                        alt={visuel.alt}
                        width={1600}
                        height={1200}
                        className="w-full h-full object-cover"
                      />
                      <Badge tone={f.badge.tone === "citron" ? "citron" : "neutral"} className="absolute top-3 right-3 shadow-md">
                        {f.badge.label}
                      </Badge>
                      <span className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                      <span className="absolute bottom-3 left-4 text-white font-bold text-lg md:text-xl drop-shadow" style={{ fontFamily: "var(--font-display)" }}>
                        {f.emoji} {f.title} — {f.subtitle}
                      </span>
                    </div>
                  )}
                  <div className="p-6 md:p-7">

                  <ul className="space-y-2.5 text-[15px] mb-6">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-[var(--color-ink-soft)]">
                        <span className="w-5 h-5 rounded-full bg-[var(--color-citron)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                        {b}
                      </li>
                    ))}
                  </ul>

                  {/* 🧵 Gros geste principal : je choisis → le formulaire se prépare */}
                  <button
                    onClick={() => handleChooseFormule(f.id as "courte" | "specialisee")}
                    className="w-full rounded-2xl px-5 py-3.5 mb-3 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
                    style={{ background: "linear-gradient(135deg, #558B2F 0%, #7CBA45 45%, #E87414 100%)" }}
                  >
                    ✂️ Je choisis cette formation
                  </button>

                  <button
                    onClick={() => setOpenFormule(openFormule === f.id ? null : f.id)}
                    className="w-full text-sm font-semibold flex items-center justify-center gap-2 py-3 rounded-full border border-[var(--color-citron)] text-[var(--color-ink)] hover:bg-[var(--color-citron)]/20 transition-colors"
                  >
                    Voir le programme détaillé
                    <motion.span
                      animate={{ rotate: openFormule === f.id ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      className="inline-flex"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {openFormule === f.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 210, damping: 26 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-5 space-y-4">
                          {f.programme.map((m) => (
                            <div key={m.title} className="border-l-2 pl-4" style={{ borderColor: "var(--color-citron)" }}>
                              <p className="font-semibold text-sm">{m.title}</p>
                              <ul className="mt-1.5 space-y-1 text-xs text-[var(--color-muted)]">
                                {m.points.map((p) => (
                                  <li key={p}>• {p}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  </div>
                </Card>
              </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Formulaire */}
      <section className="relative py-16 md:py-24 bg-[var(--color-cream)] overflow-hidden">
        <Aurora className="absolute inset-0" variant="sky" intensity="soft" />
        <div ref={formAnchorRef} className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-2">
              <SectionTitle
                align="left"
                eyebrow="Candidature"
                title={
                  <>
                    Demande<br />
                    <span style={{ color: "var(--color-orange)" }}>d'apprentissage</span>
                  </>
                }
                subtitle="Remplissez le formulaire, nous vous recontactons sous 48h pour planifier un entretien d'entrée."
              />
            </div>
            <div className="lg:col-span-3">
              <Card hover={false} className="p-6 md:p-8">
                <div className="mb-4">
                  {presetFormule && (
                    <p className="text-sm text-[var(--color-muted)]">
                      Formule choisie : <strong>{presetFormule === "courte" ? "Formation Courte" : "Formation Spécialisée"}</strong>
                    </p>
                  )}
                </div>
                <FormationForm presetFormule={presetFormule} />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Témoignages d'anciennes */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Anciennes apprenantes"
            title={<>Elles ont <span style={{ color: "var(--color-orange)" }}>franchi le pas</span></>}
          />
          <div className="grid md:grid-cols-2 gap-4">
            {TESTIMONIALS.slice(1).map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <Card hover={false}>
                  <div className="flex gap-3 items-start mb-3">
                    <div className="text-3xl">{t.emoji}</div>
                    <div>
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-[var(--color-ink-soft)] italic leading-relaxed">« {t.content} »</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-16 bg-[var(--color-cream)] overflow-hidden">
        <Aurora className="absolute inset-0" variant="warm" intensity="soft" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="FAQ"
            title={<><HelpCircle className="inline w-8 h-8 mr-2" />Questions fréquentes</>}
          />
          <div className="space-y-2">
            {FAQ_FORMATION.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.05}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left bg-white rounded-2xl border border-[var(--color-line)] px-5 py-4 hover:border-[var(--color-citron)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-sm md:text-base">{f.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 22 }}
                      className="shrink-0 inline-flex"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </motion.span>
                  </div>
                  <AnimatePresence initial={false}>
                    {openFaq === i && (
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
    </>
  );
}
