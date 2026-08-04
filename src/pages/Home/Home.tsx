import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle, Ruler, Scissors, Gem, GraduationCap, Clock4, Sparkles } from "lucide-react";
import { SEO, SchemaBuilders } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Counter } from "@/components/ui/Counter";
import { useTheme } from "@/theme/ThemeContext";
import { Reveal, Stagger, RevealItem } from "@/components/ui/Reveal";
import { PageHeaderBand } from "@/components/ui/PageHeaderBand";
import { ResponsiveHeroBackground } from "@/components/ui/ResponsiveHeroBackground";
import { PressingText } from "@/components/ui/PressingText";
import { WallOfLove } from "@/components/sections/WallOfLove";
import { CreationStrip } from "@/components/sections/CreationStrip";
import { Marquee } from "@/components/ui/Marquee";
import { Aurora } from "@/components/ui/Aurora";
import { Magnetic } from "@/components/ui/Magnetic";
import { Spotlight } from "@/components/ui/Spotlight";
import { SERVICES, CONTACT } from "@/data/content";
import { GALLERY_ATELIER } from "@/data/galleries";
import { env } from "@/utils/env";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { trackCtaClick, trackPhone, trackWhatsapp } from "@/utils/api";

// Vocabulaire du ruban défilant — l'ADN de l'atelier en un mouvement
const MARQUEE_TERMS = [
  "Boubous élégants",
  "Layette bébé",
  "Bazin chic",
  "Pagne tissé",
  "Sur mesure",
  "Retouches fines",
  "Cérémonies",
  "Formations",
  "Porto-Novo",
];

const PROCESS_STEPS = [
  { n: "01", icon: Ruler, title: "Mesures", desc: "Accueil, mesures, tissu choisi ensemble." },
  { n: "02", icon: Scissors, title: "Confection", desc: "Coupe, assemblage, essayages précis." },
  { n: "03", icon: Gem, title: "Finitions", desc: "Surfileuse, pressing — prête à briller." },
];

export default function Home() {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const heroOverlayTone =
    resolvedTheme === "light" ? "light" : resolvedTheme === "amoled" ? "amoled" : "dark";
  const heroTextShadow =
    resolvedTheme === "light" ? undefined : { textShadow: "0 2px 18px rgba(0,0,0,0.35)" };

  const heroSrc = "/images/header-colombes.webp";

  const heroParent = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  };
  const heroChild = {
    hidden: { opacity: 0, y: 34, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { type: "spring" as const, stiffness: 70, damping: 15, mass: 0.9 },
    },
  };

  return (
    <>
      <SEO
        title="Atelier de Couture à Porto-Novo"
        description="Couture sur mesure, mercerie, layette et formations professionnelles à Porto-Novo. 35+ années d'expérience au service de votre style."
        path="/"
        ogImage="/images/header-colombes.webp"
        jsonLd={[
          SchemaBuilders.organization(),
          SchemaBuilders.localBusiness(),
          SchemaBuilders.website(),
        ]}
      />

      {/* ===================== GALERIE D'OUVERTURE ===================== */}
      <PageHeaderBand
        images={GALLERY_ATELIER}
        introTitle="L'atelier en images"
        introSubtitle="Plongez dans l'univers des Services Colombes — du fil aux finitions."
        introLabel="Ouverture du site"
        seamCaption="L'atelier"
        maxHeight="min(58vh, 540px)"
      />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden">
        <Aurora className="absolute inset-0 z-0" variant="sky" intensity="soft" />
        <ResponsiveHeroBackground
          src={heroSrc}
          alt={`${env.atelierName} — Atelier de Couture à Porto-Novo`}
          fallbackRatio={16 / 9}
          overlayTone={heroOverlayTone}
          steam
          grain
          halo
          minRatio={0.8}
          maxRatio={1.78}
          minHeight="min(70vh, 560px)"
          maxHeight="min(88vh, 760px)"
        >
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
            {/* Orbes flottants décoratifs (desktop) */}
            {!reduce && (
              <>
                <div
                  className="absolute top-14 right-[8%] hidden lg:block w-24 h-24 rounded-full pointer-events-none lsc-drift"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(191,255,0,0.5), rgba(191,255,0,0.08) 70%)",
                    filter: "blur(2px)",
                    animationDuration: "11s",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute top-1/3 right-[3%] hidden lg:block w-40 h-40 rounded-full border border-dashed pointer-events-none lsc-spin-slow"
                  style={{ borderColor: "rgba(201,168,124,0.5)" }}
                  aria-hidden="true"
                />
              </>
            )}

            <motion.div
              className="grid grid-cols-1 items-center"
              variants={heroParent}
              initial="hidden"
              animate="show"
            >
              <div className="max-w-3xl mx-auto text-center">
                <motion.div variants={heroChild} className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.18em] uppercase lsc-glass-strong text-[var(--color-ink)] lsc-badge-breathe">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-orange)] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-orange)]" />
                    </span>
                    Atelier de Couture · Porto-Novo
                  </div>
                </motion.div>

                <motion.h1
                  variants={heroChild}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
                  style={{ fontFamily: "var(--font-display)", ...heroTextShadow }}
                >
                  <span className="block text-[var(--color-ink)]">Un rendu</span>
                  <span className="block">
                    <PressingText
                      words={["pli parfait", "lisse", "impeccable", "soyeux", "finition soignée", "éclat", "tendu"]}
                      className="italic"
                      wordClassName="!text-[var(--color-orange)]"
                    />
                  </span>
                </motion.h1>

                <motion.p
                  variants={heroChild}
                  className="text-lg md:text-xl italic font-semibold max-w-xl mx-auto"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)", ...(heroTextShadow || {}) }}
                >
                  Couture d'exception pour femmes, filles & bébés.
                </motion.p>

                {/* CTA — on regarde, on clique. Pas un mot de trop. */}
                <motion.div variants={heroChild} className="mt-9 flex flex-wrap justify-center gap-3">
                  <Magnetic strength={0.18}>
                    <Link to="/services" onClick={() => trackCtaClick("hero_commander")} className="inline-block">
                      <Button size="lg" icon={<ArrowRight className="w-4 h-4" />} shimmer>
                        Commander ma tenue
                      </Button>
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.18}>
                    <a
                      href={buildWhatsAppUrl(CONTACT.whatsappRaw)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsapp("hero")}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-[#25D366] shadow-[0_12px_28px_-10px_rgba(37,211,102,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(37,211,102,0.7)] active:scale-[0.97]"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  </Magnetic>
                </motion.div>
              </div>
            </motion.div>

            {/* Indicateur scroll */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-[var(--color-ink)]/80">
              <span className="text-[10px] uppercase tracking-[0.3em]">Découvrir</span>
              <div className="w-6 h-10 rounded-full border-2 flex justify-center pt-2 border-current">
                <motion.div
                  className="w-1 h-2 rounded-full bg-current"
                  animate={{ y: [0, 8, 0], opacity: [1, 0, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                />
              </div>
            </div>
          </div>
        </ResponsiveHeroBackground>
      </section>

      {/* ===================== RUBAN DÉFILANT ===================== */}
      <section
        className="relative py-5 border-y backdrop-blur-sm overflow-hidden"
        style={{
          borderColor: "var(--color-line)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.45))",
        }}
        aria-label="Spécialités de l'atelier"
      >
        <Marquee duration={30}>
          {MARQUEE_TERMS.map((term) => (
            <span key={term} className="flex items-center shrink-0">
              <span
                className="mx-6 text-2xl md:text-3xl italic font-bold whitespace-nowrap"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
              >
                {term}
              </span>
              <span className="text-[var(--color-orange)] text-sm" aria-hidden="true">✦</span>
            </span>
          ))}
        </Marquee>
      </section>

      {/* ===================== ACCROCHE — UNE SEULE PHRASE, GÉANTE ===================== */}
      <section className="relative py-20 md:py-28 bg-white overflow-hidden" aria-label="Notre promesse">
        <Aurora className="absolute inset-0" variant="warm" intensity="soft" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-xs sm:text-sm uppercase tracking-[0.4em] text-[var(--color-muted)] mb-6"
              style={{ fontFamily: "var(--font-display)" }}>
              Depuis {env.atelierFounded}
            </p>
            <h2
              className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.12] italic"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              Trois décennies de savoir-faire,{" "}
              <span className="lsc-text-silk not-italic">au service de votre élégance.</span>
            </h2>
            <div
              className="mx-auto mt-10 h-1 w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-citron), var(--color-gold-thread))" }}
              aria-hidden
            />
          </Reveal>
        </div>
      </section>

      {/* ===================== GALERIE CINÉMA ===================== */}
      <CreationStrip />

      {/* ===================== L'ATELIER EN 1 REGARD ===================== */}
      <section className="py-16 md:py-24 scroll-mt-header" id="about">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Spotlight className="rounded-[2rem]">
              <Card hover={false} className="lsc-glass-strong p-8 md:p-10 rounded-[2rem] border-[var(--color-line)]">
                <div className="grid md:grid-cols-5 gap-8 items-center">
                  <div className="md:col-span-3 text-center md:text-left">
                    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)] mb-2">L'atelier · Maîtresse Couturière</p>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
                      Colombe
                    </h3>
                    <p className="text-base md:text-lg text-[var(--color-ink-soft)] leading-relaxed">
                      Créations uniques, tradition et modernité — depuis plus de 35 ans.
                    </p>
                  </div>
                  <div className="md:col-span-2 grid grid-cols-2 gap-3">
                    <Counter end={35} suffix="+" label="Années" icon="⭐" />
                    <Counter end={500} suffix="+" label="Créations" icon="✂️" />
                    <Counter end={30} suffix="+" label="Apprenantes" icon="🎓" />
                    <Counter end={100} suffix="%" label="Satisfaction" icon="💯" />
                  </div>
                </div>
              </Card>
            </Spotlight>
          </Reveal>
        </div>
      </section>

      {/* ===================== PROCESS — LE GESTE COLOMBES ===================== */}
      <section className="relative py-16 md:py-24 overflow-hidden" aria-labelledby="process-title">
        <Aurora className="absolute inset-0" variant="warm" intensity="soft" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Le geste Colombes"
            title={
              <>
                De votre idée…<br />
                <span className="lsc-text-silk">à votre tenue</span>
              </>
            }
          />

          <Stagger className="grid md:grid-cols-3 gap-5">
            {PROCESS_STEPS.map((step, idx) => (
              <RevealItem key={step.n} className="relative">
                {idx < PROCESS_STEPS.length - 1 && (
                  <svg
                    className="hidden md:block absolute top-12 left-[calc(100%-1rem)] w-8 h-[2px] z-10"
                    aria-hidden="true"
                  >
                    <line x1="0" y1="1" x2="40" y2="1" stroke="var(--color-gold-thread)" strokeWidth="1.6" strokeDasharray="5 6" className="lsc-stitch-line" />
                  </svg>
                )}
                <Card className="h-full relative overflow-hidden text-center pt-9">
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-6xl font-bold select-none pointer-events-none"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-citron)", opacity: 0.85 }}
                    aria-hidden="true"
                  >
                    {step.n}
                  </span>
                  <div className="relative w-12 h-12 mx-auto rounded-2xl lsc-glass-strong flex items-center justify-center mb-4 mt-4">
                    <step.icon className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{step.desc}</p>
                </Card>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===================== SERVICES — ICONIQUES, SANS BAVARDAGE ===================== */}
      <section className="relative py-16 md:py-24 bg-white overflow-hidden">
        <Aurora className="absolute inset-0" variant="sky" intensity="soft" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nos Services"
            title={
              <>
                Vos tenues africaines<br />
                <span className="lsc-text-silk">sur mesure</span>
              </>
            }
          />

          <Stagger className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
            {SERVICES.slice(0, 6).map((s) => (
              <RevealItem key={s.title}>
                <Link
                  to="/services"
                  onClick={() => trackCtaClick(`home_service_${s.title.slice(0, 12)}`)}
                  className="block group h-full"
                >
                  <Card className="h-full text-center !p-5">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-citron)]/30 flex items-center justify-center text-2xl mb-3 mx-auto transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-[var(--color-citron)]/50">
                      {s.emoji}
                    </div>
                    <h4 className="font-bold text-sm md:text-base leading-snug" style={{ fontFamily: "var(--font-display)" }}>
                      {s.title}
                    </h4>
                  </Card>
                </Link>
              </RevealItem>
            ))}
          </Stagger>

          <div className="text-center">
            <Magnetic strength={0.16}>
              <Link to="/services" onClick={() => trackCtaClick("home_services_voir_tout")} className="inline-block">
                <Button size="lg" variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
                  Voir tous les services
                </Button>
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* ===================== FORMATION — BLOC VISUEL (plus de listes) ===================== */}
      <section className="relative py-16 md:py-24 overflow-hidden" aria-label="Formations couture">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Visuel */}
            <Reveal>
              <div className="relative">
                <div
                  className="absolute -inset-3 rounded-[2.25rem] pointer-events-none"
                  style={{ border: "2px dashed var(--color-gold-thread)", opacity: 0.5, transform: "rotate(-1.5deg)" }}
                  aria-hidden="true"
                />
                <motion.div
                  className="relative rounded-[2rem] overflow-hidden lsc-grain"
                  style={{ boxShadow: "0 32px 64px -24px rgba(60,38,20,0.45)" }}
                  whileHover={reduce ? undefined : { scale: 1.02, rotate: 0.5 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                >
                  <img
                    src="/images/hero-formation.webp"
                    alt="Formation couture à l'atelier Les Services Colombes"
                    className="w-full h-[320px] md:h-[420px] object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, transparent 55%, rgba(11,9,7,0.75) 100%)" }}
                  />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/70 mb-1">Deviens pro</p>
                      <p className="text-xl md:text-2xl font-bold text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                        Maîtresse Couturière
                      </p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl lsc-glass-strong flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                    </div>
                  </div>
                </motion.div>
              </div>
            </Reveal>

            {/* Contenu — trois puces, un bouton. C'est tout. */}
            <div className="text-center md:text-left">
              <Reveal delay={0.08}>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)] mb-4">Formation Couture</p>
                <h2 className="text-3xl md:text-5xl font-bold leading-[1.12] mb-6" style={{ fontFamily: "var(--font-display)" }}>
                  Apprends avec<br />
                  <span className="lsc-text-silk">une vraie Pro</span>
                </h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-2.5 mb-8">
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold lsc-glass-strong text-[var(--color-ink)]">
                    <Clock4 className="w-3.5 h-3.5" style={{ color: "var(--color-orange)" }} /> 6–12 mois · Rapide
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold lsc-glass-strong text-[var(--color-ink)]">
                    <GraduationCap className="w-3.5 h-3.5" style={{ color: "var(--color-orange)" }} /> 3–5 ans · Complète
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold lsc-glass-strong text-[var(--color-ink)]">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: "var(--color-orange)" }} /> Machines fournies
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  <Magnetic strength={0.16}>
                    <Link to="/formation" onClick={() => trackCtaClick("home_formation_bloc")} className="inline-block">
                      <Button size="lg" icon={<ArrowRight className="w-4 h-4" />} shimmer>
                        Voir les formations
                      </Button>
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <WallOfLove />

      {/* ===================== CTA FINAL ===================== */}
      <section
        className="py-16 md:py-24 relative overflow-hidden cta-dark-section lsc-grain"
        aria-labelledby="cta-final-title"
      >
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, #0B0B12 0%, #000000 50%, #0B0B12 100%)" }}
        />
        <Aurora className="absolute inset-0" variant="night" intensity="vivid" />
        <div className="absolute inset-0 pointer-events-none cta-dots" aria-hidden="true" />
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl lsc-drift"
          style={{ backgroundColor: "rgba(191, 255, 0, 0.22)", animationDuration: "12s" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl lsc-drift"
          style={{ backgroundColor: "rgba(139, 69, 19, 0.35)", animationDuration: "16s", animationDelay: "-6s" }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ color: "#ffffff" }}>
          <motion.span
            className="text-5xl mb-6 block drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]"
            aria-hidden="true"
            animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, -4, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            🧵
          </motion.span>
          <h2
            id="cta-final-title"
            className="text-3xl md:text-5xl font-bold mb-8 drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
            style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}
          >
            Prête à donner vie à votre projet ?
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            <Magnetic strength={0.2}>
              <a href={`tel:${CONTACT.phone1Raw}`} onClick={() => trackPhone(CONTACT.phone1Raw)} className="inline-block">
                <Button size="lg" icon={<Phone className="w-4 h-4" />} shimmer>
                  {CONTACT.phone1}
                </Button>
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a href={`tel:${CONTACT.phone2Raw}`} onClick={() => trackPhone(CONTACT.phone2Raw)} className="inline-block">
                <Button size="lg" variant="outline" className="!border-white/40 !text-white hover:!bg-white/10" icon={<Phone className="w-4 h-4" />}>
                  {CONTACT.phone2}
                </Button>
              </a>
            </Magnetic>
            <Magnetic strength={0.2}>
              <a
                href={buildWhatsAppUrl(CONTACT.whatsappRaw)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsapp("cta_final")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#25D366] shadow-[0_12px_28px_-10px_rgba(37,211,102,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(37,211,102,0.7)] active:scale-[0.97]"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </Magnetic>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white/70 bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="text-lg">📍</span> {CONTACT.location}
          </div>
        </div>
      </section>
    </>
  );
}
