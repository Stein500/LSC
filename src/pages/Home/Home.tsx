import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle, Sparkles, Heart, ChevronRight, MapPin, Navigation, Ruler, Scissors, Gem } from "lucide-react";
import { SEO, SchemaBuilders } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Counter } from "@/components/ui/Counter";
import { useTheme } from "@/theme/ThemeContext";
import { Reveal, Stagger, RevealItem } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { PageHeaderBand } from "@/components/ui/PageHeaderBand";
import { ResponsiveHeroBackground } from "@/components/ui/ResponsiveHeroBackground";
import { ResponsiveHeroPortrait } from "@/components/ui/ResponsiveHeroPortrait";
import { PressingText } from "@/components/ui/PressingText";
import { WallOfLove } from "@/components/sections/WallOfLove";
import { Marquee } from "@/components/ui/Marquee";
import { Aurora } from "@/components/ui/Aurora";
import { Magnetic } from "@/components/ui/Magnetic";
import { Spotlight } from "@/components/ui/Spotlight";
import { StitchDivider } from "@/components/ui/StitchDivider";
import { SERVICES, FORMULES, TESTIMONIALS, CONTACT } from "@/data/content";
import { GALLERY_ATELIER } from "@/data/galleries";
import { env } from "@/utils/env";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { trackCtaClick, trackPhone, trackWhatsapp } from "@/utils/api";
import { cn } from "@/utils/cn";

// Vocabulaire du ruban défilant — l'ADN de l'atelier en un mouvement
const MARQUEE_TERMS = [
  "Boubous élégants",
  "Layette bébé",
  "Bazin chic",
  "Pagne tissé",
  "Sur mesure",
  "Retouches fines",
  "Tenues de cérémonie",
  "Formations couture",
  "Porto-Novo",
];

const PROCESS_STEPS = [
  {
    n: "01",
    icon: Ruler,
    title: "Prise de mesures",
    desc: "Accueil à l'atelier, mesures précises et choix du tissu ensemble — le geste juste commence ici.",
  },
  {
    n: "02",
    icon: Scissors,
    title: "Confection minutieuse",
    desc: "Coupe, assemblage et essayages intermédiaires : chaque pièce est cousue comme une œuvre unique.",
  },
  {
    n: "03",
    icon: Gem,
    title: "Finitions d'exception",
    desc: "Surfileuse EMEL, boutons, pressing final — votre tenue sort impeccable, prête à briller.",
  },
];

export default function Home() {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const heroOverlayTone =
    resolvedTheme === "light" ? "light" : resolvedTheme === "amoled" ? "amoled" : "dark";
  const heroTextShadow =
    resolvedTheme === "light" ? undefined : { textShadow: "0 2px 18px rgba(0,0,0,0.35)" };

  const heroSrc = "/images/header-colombes.webp";
  const portraitSrc: string | null = null;

  // Chorégraphie d'entrée du hero (cascade maîtrisée)
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

      {/* ===================== BIBLIOTHÈQUE GALERIE (juste après le header) ===================== */}
      <PageHeaderBand
        images={GALLERY_ATELIER}
        introTitle="L'atelier en images"
        introSubtitle="Plongez dans l'univers des Services Colombes — du fil aux finitions, l'attention portée à chaque pièce."
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
          minHeight="min(70vh, 520px)"
          maxHeight="min(85vh, 720px)"
        >
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20 w-full">
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
                  className="absolute bottom-16 right-[22%] hidden lg:block w-12 h-12 rounded-full pointer-events-none lsc-drift"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(201,168,124,0.65), rgba(139,69,19,0.12) 72%)",
                    filter: "blur(2px)",
                    animationDuration: "14s",
                    animationDelay: "-5s",
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

            {/* Petits pois décoratifs */}
            <div className="absolute top-6 right-6 hidden md:block opacity-70">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--color-orange)" }}
                    animate={reduce ? undefined : { y: [0, -6, 0] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
                  />
                ))}
              </div>
            </div>

            <motion.div
              className={cn(
                "grid items-center",
                portraitSrc ? "lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10" : "grid-cols-1",
              )}
              variants={heroParent}
              initial="hidden"
              animate="show"
            >
              {/* Texte — premier sur mobile, à gauche sur desktop */}
              <div
                className={cn(
                  "order-1",
                  portraitSrc ? "lg:col-span-7 lg:order-1" : "max-w-3xl mx-auto text-center",
                )}
              >
                <motion.div variants={heroChild} className="flex flex-wrap items-center justify-center gap-2 mb-7">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.18em] uppercase lsc-glass-strong text-[var(--color-ink)] lsc-badge-breathe">
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-orange)] opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--color-orange)]" />
                    </span>
                    Atelier de Couture · Porto-Novo
                  </div>
                  <a
                    href={env.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Voir l'atelier sur Google Maps"
                    className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide lsc-glass-strong text-[var(--color-ink)] transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-orange)]/15">
                      <MapPin className="w-3 h-3" style={{ color: "var(--color-orange)" }} />
                      <Navigation className="w-2 h-2 absolute -bottom-0.5 -right-0.5 text-white bg-[var(--color-orange)] rounded-full p-0.5" strokeWidth={3} />
                    </span>
                    <span className="hidden sm:inline">Les Services Colombes, Porto-Novo</span>
                    <span className="sm:hidden">Nous trouver</span>
                  </a>
                </motion.div>

                <motion.h1
                  variants={heroChild}
                  className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-6"
                  style={{ fontFamily: "var(--font-display)", ...heroTextShadow }}
                >
                  <span className="block text-[var(--color-ink)]">Un rendu</span>
                  <span className="block">
                    <PressingText
                      words={["pli parfait", "lisse", "vapeur douce", "soin du tissu", "finition soignée", "éclat", "tendu"]}
                      className="italic"
                      wordClassName="!text-[var(--color-orange)]"
                    />
                  </span>
                </motion.h1>

                <motion.p
                  variants={heroChild}
                  className="text-lg md:text-xl mb-3 italic font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)", ...(heroTextShadow || {}) }}
                >
                  Atelier de Couture & Formation d'Exception
                </motion.p>
                <motion.p
                  variants={heroChild}
                  className="text-base md:text-lg leading-relaxed mb-9 max-w-xl mx-auto"
                  style={{ color: "var(--color-ink)", ...(heroTextShadow || {}) }}
                >
                  Confection sur mesure pour <strong>les jeunes filles</strong>, <strong>les bébés</strong> et les femmes.
                </motion.p>

                <motion.div variants={heroChild} className="flex flex-wrap justify-center gap-3">
                  <Magnetic strength={0.18}>
                    <Link to="/services" onClick={() => trackCtaClick("hero_découvrir")} className="inline-block">
                      <Button size="lg" icon={<ArrowRight className="w-4 h-4" />} shimmer>
                        Découvrir nos services
                      </Button>
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.18}>
                    <a href={`tel:${CONTACT.phone1Raw}`} onClick={() => trackPhone(CONTACT.phone1Raw)} className="inline-block">
                      <Button size="lg" variant="outline" icon={<Phone className="w-4 h-4" />}>
                        {CONTACT.phone1}
                      </Button>
                    </a>
                  </Magnetic>
                </motion.div>
              </div>

              {/* Portrait Hero — affiché uniquement si fournie (évite le doublon) */}
              {portraitSrc && portraitSrc !== heroSrc && (
                <motion.div
                  className="order-2 lg:col-span-5 lg:order-2"
                  initial={{ opacity: 0, scale: 0.92, rotate: 2 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 60, damping: 14, delay: 0.5 }}
                >
                  <div className="relative mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-none">
                    <ResponsiveHeroPortrait
                      src={portraitSrc}
                      alt={`${env.atelierName} — Atelier`}
                      fallbackRatio={3 / 4}
                      minRatio={0.6}
                      maxRatio={1.0}
                      maxWidth="min(100%, 22rem)"
                      maxHeight="min(60vh, 480px)"
                      float
                      aura
                      grain
                      steam
                    />
                    <div
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.2em] uppercase lsc-glass-strong text-[var(--color-ink)] shadow-lg whitespace-nowrap"
                      aria-hidden
                    >
                      ✦ Pressing d'auteur
                    </div>
                  </div>
                </motion.div>
              )}
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

      {/* ===================== ACCROCHE "DEPUIS…" ===================== */}
      <section
        className="relative py-16 md:py-24 bg-white overflow-hidden"
        aria-labelledby="home-hook-title"
      >
        <Aurora className="absolute inset-0" variant="warm" intensity="soft" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p
              className="lsc-section-kicker justify-center text-xs sm:text-sm uppercase tracking-[0.35em] text-[var(--color-muted)] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="px-3 py-1 rounded-full lsc-glass-strong">Depuis {env.atelierFounded}</span>
            </p>
            <h2
              id="home-hook-title"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              <span className="block">
                <PressingText
                  words={[
                    "l'élégance",
                    "le sur-mesure",
                    "le geste juste",
                    "le détail",
                    "la tradition",
                    "l'audace",
                    "la finesse",
                  ]}
                  className="italic"
                  wordClassName="!text-[var(--color-orange)]"
                />
              </span>
              <span className="block mt-2">
                {env.atelierHeroHook}
              </span>
            </h2>
            <div
              className="mx-auto mt-8 h-1 w-20 rounded-full"
              style={{ background: "linear-gradient(90deg, var(--color-citron), var(--color-gold-thread))" }}
              aria-hidden
            />
          </Reveal>
        </div>
      </section>

      <StitchDivider className="max-w-5xl mx-auto px-6" label="L'atelier, fil à fil" />

      {/* ===================== PRESENTATION ===================== */}
      <section className="py-16 md:py-24 scroll-mt-header" id="about">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Spotlight className="rounded-[2rem]">
              <Card hover={false} className="lsc-glass-strong p-8 md:p-12 grid md:grid-cols-5 gap-8 items-center rounded-[2rem] border-[var(--color-line)]">
                <div className="md:col-span-3">
                  <Badge tone="orange">L'atelier</Badge>
                  <h3 className="text-3xl md:text-4xl font-bold mt-4 mb-4" style={{ fontFamily: "var(--font-display)" }}>
                    Colombe
                  </h3>
                  <p className="text-sm uppercase tracking-wider text-[var(--color-muted)] mb-6">
                    Atelier Les Services Colombes · Maîtresse Couturière
                  </p>
                  <p className="text-base md:text-lg text-[var(--color-ink-soft)] leading-relaxed mb-6">
                    Colombe réalise pour vous des créations uniques alliant tradition et modernité. Un savoir-faire
                    transmis et perpétué depuis plus de 35 ans, au service de votre élégance.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Badge tone="citron" className="gap-1.5"><Sparkles className="w-3 h-3" /> Savoir-faire familial</Badge>
                    <Badge tone="citron" className="gap-1.5"><Heart className="w-3 h-3" /> Confection sur mesure</Badge>
                    <Badge tone="orange">Formations pro</Badge>
                  </div>
                </div>
                <div className="md:col-span-2 grid grid-cols-2 gap-3">
                  <Counter end={35} suffix="+" label="Années" icon="⭐" />
                  <Counter end={500} suffix="+" label="Créations" icon="✂️" />
                  <Counter end={30} suffix="+" label="Apprenantes" icon="🎓" />
                  <Counter end={100} suffix="%" label="Satisfaction" icon="💯" />
                </div>
              </Card>
            </Spotlight>
          </Reveal>
        </div>
      </section>

      <WallOfLove />

      {/* ===================== SERVICES APERÇU ===================== */}
      <section className="relative py-16 md:py-24 bg-white overflow-hidden">
        <Aurora className="absolute inset-0" variant="sky" intensity="soft" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nos Services"
            title={
              <>
                Faites confectionner<br />
                <span className="lsc-text-silk">vos tenues africaines sur mesure</span>
              </>
            }
            subtitle="Confection & finitions professionnelles avec une forte mise en avant des modèles africains béninois."
          />

          <Stagger className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {SERVICES.slice(0, 4).map((s) => (
              <RevealItem key={s.title}>
                <Card className="text-center h-full group">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-citron)]/30 flex items-center justify-center text-2xl mb-4 mx-auto transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 group-hover:bg-[var(--color-citron)]/50">
                    {s.emoji}
                  </div>
                  <h4 className="font-bold text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {s.title}
                  </h4>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
                </Card>
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

      {/* ===================== PROCESS — LE GESTE COLOMBES ===================== */}
      <section className="relative py-16 md:py-24 overflow-hidden" aria-labelledby="process-title">
        <Aurora className="absolute inset-0" variant="warm" intensity="soft" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Le geste Colombes"
            title={
              <>
                De votre idée…<br />
                <span className="lsc-text-silk">à votre tenue d'exception</span>
              </>
            }
            subtitle="Trois temps, un savoir-faire : voici comment chaque commande prend vie à l'atelier."
          />

          <Stagger className="grid md:grid-cols-3 gap-5">
            {PROCESS_STEPS.map((step, idx) => (
              <RevealItem key={step.n} className="relative">
                {/* Fil qui relie les étapes (desktop) */}
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

      {/* ===================== FORMATION APERÇU ===================== */}
      <section className="relative py-16 md:py-24 bg-white overflow-hidden">
        <Aurora className="absolute inset-0" variant="sky" intensity="soft" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Formation"
            title={
              <>
                Devenez Maîtresse Couturière<br />
                <span className="lsc-text-silk">avec une Pro</span>
              </>
            }
            subtitle="Deux formules adaptées à votre niveau, avec une progression claire sur plusieurs mois ou années."
            tone="citron"
          />

          <Stagger className="grid md:grid-cols-2 gap-5 mb-10">
            {FORMULES.map((f) => (
              <RevealItem key={f.id}>
                <Card hover={false} className="lsc-card-sheen lsc-hemline h-full p-8 relative">
                  <Badge tone={f.badge.tone === "citron" ? "citron" : "neutral"} className="absolute top-5 right-5">
                    {f.badge.label}
                  </Badge>
                  <div className="text-4xl mb-4">{f.emoji}</div>
                  <h3 className="text-2xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>
                    {f.title}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)] mb-5">{f.subtitle}</p>
                  <ul className="space-y-2 text-sm text-[var(--color-ink-soft)]">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-citron-d)" }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </Card>
              </RevealItem>
            ))}
          </Stagger>

          <div className="text-center">
            <Magnetic strength={0.16}>
              <Link to="/formation" onClick={() => trackCtaClick("home_formation_découvrir")} className="inline-block">
                <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                  Découvrir les formations
                </Button>
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* ===================== TÉMOIGNAGES ===================== */}
      <section className="relative py-16 md:py-24 overflow-hidden" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.2))" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Témoignages"
            title={<>Elles en parlent <span className="lsc-text-silk">mieux que nous</span></>}
          />
          <Stagger className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <RevealItem key={t.name}>
                <Card hover={false} className="lsc-card-sheen lsc-hemline h-full">
                  <div className="text-3xl mb-3" aria-hidden="true">{t.emoji}</div>
                  <p className="text-sm md:text-base text-[var(--color-ink-soft)] leading-relaxed mb-4 italic">
                    « {t.content} »
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{t.role}</p>
                  </div>
                </Card>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section
        className="py-16 md:py-24 relative overflow-hidden cta-dark-section lsc-grain"
        aria-labelledby="cta-final-title"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #0B0B12 0%, #000000 50%, #0B0B12 100%)",
          }}
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
            className="text-3xl md:text-5xl font-bold mb-5 drop-shadow-[0_2px_14px_rgba(0,0,0,0.45)]"
            style={{ fontFamily: "var(--font-display)", color: "#ffffff" }}
          >
            Prête à donner vie à votre projet ?
          </h2>
          <p className="mb-10 max-w-xl mx-auto text-base md:text-lg drop-shadow-[0_1px_8px_rgba(0,0,0,0.35)]" style={{ color: "rgba(255,255,255,0.95)" }}>
            Contactez-nous pour un devis, un essayage ou une commande sur mesure. Réponse rapide garantie.
          </p>

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
