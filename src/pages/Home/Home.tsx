import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, MessageCircle, Phone, Ruler, Scissors, Gem, ShoppingBag } from "lucide-react";
import { SEO, SchemaBuilders } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useTheme } from "@/theme/ThemeContext";
import { Reveal, Stagger, RevealItem } from "@/components/ui/Reveal";
import { PageHeaderBand } from "@/components/ui/PageHeaderBand";
import { ResponsiveHeroBackground } from "@/components/ui/ResponsiveHeroBackground";
import { Aurora } from "@/components/ui/Aurora";
import { Magnetic } from "@/components/ui/Magnetic";
import { CONTACT } from "@/data/content";
import { GALLERY_ATELIER } from "@/data/galleries";
import { env } from "@/utils/env";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { trackCtaClick, trackPhone, trackWhatsapp } from "@/utils/api";

const PROCESS_STEPS = [
  { n: "01", icon: Ruler, title: "Mesures", desc: "Accueil, mesures, tissu choisi ensemble." },
  { n: "02", icon: Scissors, title: "Confection", desc: "Coupe, assemblage, essayages précis." },
  { n: "03", icon: Gem, title: "Finitions", desc: "Surfileuse, pressing — prête à briller." },
];

const MERCERIE_ITEMS = [
  { emoji: "🧵", label: "Fils & bobines" },
  { emoji: "🔘", label: "Boutons & fermoirs" },
  { emoji: "🎀", label: "Rubans & dentelles" },
  { emoji: "📏", label: "Wax & tissus au mètre" },
];

export default function Home() {
  const { resolvedTheme } = useTheme();
  const reduce = useReducedMotion();
  const heroOverlayTone =
    resolvedTheme === "light" ? "light" : resolvedTheme === "amoled" ? "amoled" : "dark";

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
        title="Atelier & Mercerie à Porto-Novo"
        description="Couture Colombe et Merceries — atelier & mercerie à Porto-Novo : robes sur mesure, wax, layette, formation, depuis 1990."
        path="/"
        ogImage="/images/header-colombes.webp"
        jsonLd={[
          SchemaBuilders.organization(),
          SchemaBuilders.localBusiness(),
          SchemaBuilders.website(),
        ]}
      />

      {/* ===================== HERO — LA MAISON, ROSE & FEUILLE ===================== */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #FBE7EB 0%, #FDF3F5 52%, #FFFFFF 100%)" }}
      >
        <Aurora className="absolute inset-0 z-0" variant="warm" intensity="soft" />
        <ResponsiveHeroBackground
          src="/images/header-colombes.webp"
          alt="Couture Colombe et Merceries — atelier de couture et mercerie à Porto-Novo"
          fallbackRatio={16 / 9}
          overlayTone={heroOverlayTone}
          steam
          grain
          halo
          minRatio={0.8}
          maxRatio={1.78}
          minHeight="min(72vh, 580px)"
          maxHeight="min(90vh, 780px)"
        >
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 w-full">
            {/* Orbes flottants — rouge colombe & feuille, la maison en deux couleurs */}
            {!reduce && (
              <>
                <div
                  className="absolute top-14 right-[8%] hidden lg:block w-24 h-24 rounded-full pointer-events-none lsc-drift"
                  style={{
                    background: "radial-gradient(circle at 30% 30%, rgba(209,35,42,0.5), rgba(209,35,42,0.08) 70%)",
                    filter: "blur(2px)",
                    animationDuration: "11s",
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute top-1/3 right-[3%] hidden lg:block w-40 h-40 rounded-full border border-dashed pointer-events-none lsc-spin-slow"
                  style={{ borderColor: "rgba(124,186,69,0.65)" }}
                  aria-hidden="true"
                />
              </>
            )}

            <motion.div variants={heroParent} initial="hidden" animate="show">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div variants={heroChild} className="flex flex-wrap items-center justify-center gap-2 mb-8">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-[0.16em] uppercase text-[var(--color-ink)] lsc-badge-breathe"
                    style={{ background: "var(--color-feuille-doux)", border: "1px solid rgba(85,139,47,0.35)" }}
                  >
                    <span className="relative flex w-1.5 h-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping" style={{ background: "var(--color-feuille-f)" }} />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: "var(--color-feuille-f)" }} />
                    </span>
                    Atelier · Mercerie · Formation — Porto-Novo
                  </div>
                </motion.div>

                <motion.h1
                  variants={heroChild}
                  className="font-bold leading-[1.06] mb-6 text-[clamp(2.4rem,7.5vw,4.6rem)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <span className="block text-[var(--color-ink)]">Couture Colombe</span>
                  <span className="block lsc-text-silk italic">et Merceries</span>
                </motion.h1>

                <motion.p
                  variants={heroChild}
                  className="text-lg md:text-xl italic font-semibold max-w-xl mx-auto text-[var(--color-ink-soft)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  La maison qui coud, vend et transmet — robes sur mesure, wax & bazin,
                  layette, mercerie. L'élégance béninoise cousue main depuis {env.atelierFounded}.
                </motion.p>

                <motion.div variants={heroChild} className="mt-9 flex flex-wrap justify-center gap-3">
                  <Magnetic strength={0.18}>
                    <Link to="/services" onClick={() => trackCtaClick("hero_commander")} className="inline-block">
                      <Button size="lg" icon={<ArrowRight className="w-4 h-4" />} shimmer>
                        Commander ma tenue
                      </Button>
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.18}>
                    <Link
                      to="/inspirations"
                      onClick={() => trackCtaClick("hero_modeles")}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-[linear-gradient(135deg,#7CBA45,#558B2F)] shadow-[0_12px_28px_-10px_rgba(85,139,47,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(85,139,47,0.72)] active:scale-[0.97]"
                    >
                      🌿 Explorer les modèles
                    </Link>
                  </Magnetic>
                  <Magnetic strength={0.18}>
                    <a
                      href={buildWhatsAppUrl(CONTACT.whatsappRaw)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackWhatsapp("hero")}
                      className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-base font-semibold text-white bg-[linear-gradient(135deg,#8B4515,#5C2E0C)] shadow-[0_12px_28px_-10px_rgba(92,46,12,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(92,46,12,0.7)] active:scale-[0.97]"
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

      {/* ===================== L'ATELIER EN IMAGES (signées, téléchargeables) ===================== */}
      <div style={{ background: "linear-gradient(180deg, #FFFFFF 0%, var(--color-rose-soft) 26%, #FFF3F5 60%, #FFFFFF 100%)" }}>
        <PageHeaderBand
          images={GALLERY_ATELIER}
          introLabel="Bienvenue à l'atelier"
          introTitle="L'atelier en images"
          introSubtitle="Cinq regards sur la maison — du fil aux finitions."
          seamCaption="L'atelier"
          maxHeight="min(58vh, 540px)"
        />
      </div>

      {/* ===================== LA MERCERIE — TOUT SE VEND ICI AUSSI ===================== */}
      <section
        className="relative py-14 md:py-20 overflow-hidden text-white"
        aria-label="La mercerie de la maison"
        style={{ background: "linear-gradient(135deg, #7CBA45 0%, #558B2F 58%, #3E6B1F 100%)" }}
      >
        <div className="absolute inset-0 pointer-events-none opacity-25" aria-hidden="true"
          style={{ background: "radial-gradient(60% 90% at 85% 10%, rgba(255,255,255,0.55), transparent 60%)" }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs uppercase tracking-[0.32em] text-white/85 mb-4">
              <ShoppingBag className="w-4 h-4" aria-hidden="true" /> La mercerie de la maison
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Ici, tout se vend aussi.
            </h2>
            <p className="text-white/85 text-base md:text-lg max-w-xl mx-auto mb-8">
              Fil, boutons, rubans, tissus au mètre — le comptoir de la mercerie est ouvert
              à toutes et à tous, au détail.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 mb-9">
              {MERCERIE_ITEMS.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/12 border border-white/25 text-white backdrop-blur-sm"
                >
                  <span aria-hidden="true">{item.emoji}</span> {item.label}
                </span>
              ))}
            </div>
            <Magnetic strength={0.16}>
              <Link
                to="/services"
                onClick={() => trackCtaClick("home_mercerie")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base font-bold bg-white text-[#3E6B1F] shadow-[0_14px_30px_-10px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-10px_rgba(0,0,0,0.45)] active:scale-[0.97]"
              >
                Voir la mercerie <ArrowRight className="w-4 h-4" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>
      </section>

      {/* ===================== PROCESS — LE GESTE DE LA MAISON ===================== */}
      <section className="relative py-16 md:py-24 overflow-hidden" aria-labelledby="process-title">
        <Aurora className="absolute inset-0" variant="warm" intensity="soft" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Le geste de la maison"
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
                  <svg className="hidden md:block absolute top-12 left-[calc(100%-1rem)] w-8 h-[2px] z-10" aria-hidden="true">
                    <line x1="0" y1="1" x2="40" y2="1" stroke="var(--color-gold-thread)" strokeWidth="1.6" strokeDasharray="5 6" className="lsc-stitch-line" />
                  </svg>
                )}
                <Card className="h-full relative overflow-hidden text-center p-6">
                  <span
                    className="absolute top-2 right-4 text-7xl font-bold select-none pointer-events-none leading-none"
                    style={{ fontFamily: "var(--font-display)", color: "var(--color-citron)", opacity: 0.4 }}
                    aria-hidden="true"
                  >
                    {step.n}
                  </span>
                  <div className="relative w-12 h-12 mx-auto rounded-2xl lsc-glass-strong flex items-center justify-center mb-4">
                    <step.icon className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>{step.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{step.desc}</p>
                </Card>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ===================== CTA FINAL — PARLONS DE VOTRE PROJET ===================== */}
      <section className="py-16 md:py-24 relative overflow-hidden cta-dark-section lsc-grain" aria-labelledby="cta-final-title">
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, #0B0B12 0%, #000000 50%, #0B0B12 100%)" }} />
        <Aurora className="absolute inset-0" variant="night" intensity="vivid" />
        <div className="absolute inset-0 pointer-events-none cta-dots" aria-hidden="true" />
        <div
          className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl lsc-drift"
          style={{ backgroundColor: "rgba(124, 186, 69, 0.22)", animationDuration: "16s", animationDelay: "-6s" }}
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
              <a
                href={buildWhatsAppUrl(CONTACT.whatsappRaw)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsapp("cta_final")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-[linear-gradient(135deg,#8B4515,#5C2E0C)] shadow-[0_12px_28px_-10px_rgba(92,46,12,0.6)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-10px_rgba(92,46,12,0.7)] active:scale-[0.97]"
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
