import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Phone, MessageCircle, Sparkles, Heart, ChevronRight, MapPin, Navigation } from "lucide-react";
import { SEO, SchemaBuilders } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Counter } from "@/components/ui/Counter";
import { useTheme } from "@/theme/ThemeContext";
import { Reveal } from "@/components/ui/Reveal";
import { Badge } from "@/components/ui/Badge";
import { PageHeaderBand } from "@/components/ui/PageHeaderBand";
import { ResponsiveHeroBackground } from "@/components/ui/ResponsiveHeroBackground";
import { ResponsiveHeroPortrait } from "@/components/ui/ResponsiveHeroPortrait";
import { PressingText } from "@/components/ui/PressingText";
import { WallOfLove } from "@/components/sections/WallOfLove";
import { SERVICES, FORMULES, TESTIMONIALS, CONTACT } from "@/data/content";
import { GALLERY_ATELIER } from "@/data/galleries";
import { env } from "@/utils/env";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { trackCtaClick, trackPhone, trackWhatsapp } from "@/utils/api";
import { cn } from "@/utils/cn";

export default function Home() {
  const { resolvedTheme } = useTheme();
  const heroOverlayTone =
    resolvedTheme === "light" ? "light" : resolvedTheme === "amoled" ? "amoled" : "dark";
  const heroTextShadow =
    resolvedTheme === "light" ? undefined : { textShadow: "0 2px 18px rgba(0,0,0,0.35)" };

  // Source unique de vérité pour l'image hero : on s'adapte automatiquement
  // au ratio réel de l'image servie. Le hero suit ce ratio (clampé pour rester
  // dans des proportions saines) via `ResponsiveHeroBackground`.
  //
  // Pas de doublon : on n'affiche pas de "portrait" séparé si on n'a qu'une
  // seule image (ça ferait 2× la même photo dans la même section, ce qui
  // est moche et lourd). Si tu veux un portrait dédié, crée un fichier
  // distinct (ex. `/images/atelier-portrait.webp`) et passe-le à
  // `portraitSrc` ci-dessous.
  const heroSrc = "/images/header-colombes.webp";
  const portraitSrc: string | null = null; // null = pas de portrait dans le hero

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
      {/* Hero 100% responsive : le container **suit le ratio réel de l'image**
          (clampé entre 0.8 et 1.78 pour rester dans des proportions saines).
          L'image de fond est en `object-cover` dans ce container, le contenu
          est centré verticalement via `flex items-center` interne.
          Aucun débordement, aucun placeholder visible, aucun CLS. */}
      <section className="relative">
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
            {/* Petits pois décoratifs */}
            <div className="absolute top-6 right-6 hidden md:block opacity-70">
              <div className="flex gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: "var(--color-orange)" }}
                  />
                ))}
              </div>
            </div>

            <div
              className={cn(
                "grid items-center",
                portraitSrc ? "lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10" : "grid-cols-1",
              )}
            >
              {/* Texte — premier sur mobile, à gauche sur desktop */}
              <motion.div
                className={cn(
                  "order-1",
                  portraitSrc ? "lg:col-span-7 lg:order-1" : "max-w-3xl mx-auto text-center",
                )}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              >
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.18em] uppercase bg-[var(--color-citron)]/30 text-[var(--color-ink)] backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-orange)] animate-pulse" />
                    Atelier de Couture · Porto-Novo
                  </div>
                  <a
                    href={env.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Voir l'atelier sur Google Maps"
                    className="group inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-white/80 backdrop-blur-sm border border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-orange)] hover:bg-white transition-colors"
                  >
                    <span className="relative inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-orange)]/15">
                      <MapPin className="w-3 h-3" style={{ color: "var(--color-orange)" }} />
                      <Navigation className="w-2 h-2 absolute -bottom-0.5 -right-0.5 text-white bg-[var(--color-orange)] rounded-full p-0.5" strokeWidth={3} />
                    </span>
                    <span className="hidden sm:inline">Les Services Colombes, Porto-Novo</span>
                    <span className="sm:hidden">Nous trouver</span>
                  </a>
                </div>

                <h1
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
                </h1>

                <p
                  className="text-lg md:text-xl mb-3 italic font-semibold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)", ...(heroTextShadow || {}) }}
                >
                  Atelier de Couture & Formation d'Exception
                </p>
                <p
                  className="text-base md:text-lg leading-relaxed mb-8 max-w-xl"
                  style={{ color: "var(--color-ink)", ...(heroTextShadow || {}) }}
                >
                  Confection sur mesure pour <strong>les jeunes filles</strong>, <strong>les bébés</strong> et les femmes.
                </p>

                <div className="flex flex-wrap gap-3">
                  <Link to="/services" onClick={() => trackCtaClick("hero_découvrir")}>
                    <Button size="lg" icon={<ArrowRight className="w-4 h-4" />} shimmer>
                      Découvrir nos services
                    </Button>
                  </Link>
                  <a href={`tel:${CONTACT.phone1Raw}`} onClick={() => trackPhone(CONTACT.phone1Raw)}>
                    <Button size="lg" variant="outline" icon={<Phone className="w-4 h-4" />}>
                      {CONTACT.phone1}
                    </Button>
                  </a>
                </div>
              </motion.div>

              {/* Portrait Hero — affiché UNIQUEMENT si `portraitSrc` est fournie
                  (et différente de `heroSrc`). Sinon, on évite le doublon visuel. */}
              {portraitSrc && portraitSrc !== heroSrc && (
                <motion.div
                  className="order-2 lg:col-span-5 lg:order-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
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
                    {/* Petit badge "Pressing d'auteur" — clin d'œil au thème */}
                    <div
                      className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[11px] font-semibold tracking-[0.2em] uppercase backdrop-blur-md bg-white/85 text-[var(--color-ink)] border border-[var(--color-line)] shadow-lg whitespace-nowrap"
                      aria-hidden
                    >
                      ✦ Pressing d'auteur
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

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

      {/* ===================== ACCROCHE "DEPUIS…" =====================
          Remplace les 4 cartes stats : on garde uniquement la date de
          création (depuis `env.atelierFounded`) et on affiche la super
          accroche (`env.atelierHeroHook`) en grand, pour donner tout de
          suite le ton juste après le hero. */}
      <section
        className="py-14 md:py-20 bg-white"
        aria-labelledby="home-hook-title"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p
              className="text-xs sm:text-sm uppercase tracking-[0.35em] text-[var(--color-muted)] mb-5"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Depuis {env.atelierFounded}
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
              className="mx-auto mt-8 h-1 w-16 rounded-full"
              style={{ backgroundColor: "var(--color-citron)" }}
              aria-hidden
            />
          </Reveal>
        </div>
      </section>

      {/* ===================== PRESENTATION ===================== */}
      <section className="py-16 md:py-24 bg-[var(--color-cream)] scroll-mt-header" id="about">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <Card hover={false} className="p-8 md:p-12 grid md:grid-cols-5 gap-8 items-center">
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
          </Reveal>
        </div>
      </section>


      <WallOfLove />

      {/* ===================== SERVICES APERÇU ===================== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nos Services"
            title={
              <>
                Faites confectionner<br />
                <span style={{ color: "var(--color-orange)" }}>vos tenues africaines sur mesure</span>
              </>
            }
            subtitle="Confection & finitions professionnelles avec une forte mise en avant des modèles africains béninois."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {SERVICES.slice(0, 4).map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <Card className="text-center h-full">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-citron)]/30 flex items-center justify-center text-2xl mb-4 mx-auto">
                    {s.emoji}
                  </div>
                  <h4 className="font-bold text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>
                    {s.title}
                  </h4>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{s.desc}</p>
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="text-center">
            <Link to="/services" onClick={() => trackCtaClick("home_services_voir_tout")}>
              <Button size="lg" variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
                Voir tous les services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== FORMATION APERÇU ===================== */}
      <section className="py-16 md:py-24 bg-[var(--color-cream)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Formation"
            title={
              <>
                Devenez Maîtresse Couturière<br />
                <span style={{ color: "var(--color-citron-d)" }}>avec une Pro</span>
              </>
            }
            subtitle="Deux formules adaptées à votre niveau, avec une progression claire sur plusieurs mois ou années."
            tone="citron"
          />

          <div className="grid md:grid-cols-2 gap-5 mb-10">
            {FORMULES.map((f, i) => (
              <Reveal key={f.id} delay={i * 0.1}>
                <Card hover={false} className="h-full p-8 relative">
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
              </Reveal>
            ))}
          </div>

          <div className="text-center">
            <Link to="/formation" onClick={() => trackCtaClick("home_formation_découvrir")}>
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Découvrir les formations
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ===================== TÉMOIGNAGES ===================== */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Témoignages"
            title={<>Elles en parlent <span style={{ color: "var(--color-orange)" }}>mieux que nous</span></>}
          />
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <Card hover={false} className="h-full">
                  <div className="text-3xl mb-3">{t.emoji}</div>
                  <p className="text-sm md:text-base text-[var(--color-ink-soft)] leading-relaxed mb-4 italic">
                    « {t.content} »
                  </p>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-[var(--color-muted)]">{t.role}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA FINAL ===================== */}
      <section
        className="py-16 md:py-24 relative overflow-hidden cta-dark-section"
        aria-labelledby="cta-final-title"
      >
        {/* Halo dégradé doux (au lieu d'un noir brut) pour lisibilité */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #0B0B12 0%, #000000 50%, #0B0B12 100%)",
          }}
        />
        {/* Grille pointillée décorative (lisibilité des éléments d'arrière-plan) */}
        <div
          className="absolute inset-0 pointer-events-none cta-dots"
          aria-hidden="true"
        />
        {/* Cercles décoratifs — plus visibles qu'avant (aident l'œil) */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(191, 255, 0, 0.22)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl"
          style={{ backgroundColor: "rgba(139, 69, 19, 0.35)" }}
        />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ color: "#ffffff" }}>
          <span className="text-5xl mb-6 block drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]" aria-hidden="true">🧵</span>
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
            <a href={`tel:${CONTACT.phone1Raw}`} onClick={() => trackPhone(CONTACT.phone1Raw)}>
              <Button size="lg" icon={<Phone className="w-4 h-4" />} className="!bg-[var(--color-citron)] hover:!bg-[var(--color-citron-d)]">
                {CONTACT.phone1}
              </Button>
            </a>
            <a href={`tel:${CONTACT.phone2Raw}`} onClick={() => trackPhone(CONTACT.phone2Raw)}>
              <Button size="lg" variant="outline" className="!border-white/40 !text-white hover:!bg-white/10" icon={<Phone className="w-4 h-4" />}>
                {CONTACT.phone2}
              </Button>
            </a>
            <a
              href={buildWhatsAppUrl(CONTACT.whatsappRaw)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsapp("cta_final")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[#25D366] hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" /> WhatsApp
            </a>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white/70 bg-white/5 border border-white/10">
            <span className="text-lg">📍</span> {CONTACT.location}
          </div>
        </div>
      </section>
    </>
  );
}
