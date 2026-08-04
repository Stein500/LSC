import { Phone, MessageCircle, MapPin, Clock, Mail, Navigation } from "lucide-react";
import { SEO, SchemaBuilders } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ContactForm } from "@/components/forms/ContactForm";
import { PageHeaderBand } from "@/components/ui/PageHeaderBand";
import { CONTACT } from "@/data/content";
import { GALLERY_CONTACT_PAGES } from "@/data/galleries";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { env } from "@/utils/env";
import { trackPhone, trackWhatsapp } from "@/utils/api";

const SUPPORT_EMAIL = env.atelierEmail.trim();
const HAS_SUPPORT_EMAIL = SUPPORT_EMAIL.length > 0;

export default function Contact() {
  return (
    <>
      <SEO
        title="Contact"
        description="Contactez l'atelier Les Services Colombes à Porto-Novo : téléphone, WhatsApp, email. Atelier de couture et centre de formation, Les Services Colombes, Porto-Novo – Bénin."
        path="/contact"
        ogImage="/images/hero-contact.webp"
        jsonLd={[
          SchemaBuilders.organization(),
          SchemaBuilders.localBusiness(),
          SchemaBuilders.breadcrumb([
            { name: "Accueil", url: "/" },
            { name: "Contact", url: "/contact" },
          ]),
        ]}
      />

      {/* ===================== BIBLIOTHÈQUE GALERIE (juste après le header) ===================== */}
      <PageHeaderBand
        images={GALLERY_CONTACT_PAGES}
        introTitle="Des images qui vous accueillent"
        introSubtitle="Quelques images du lieu pour entrer tout de suite dans l’ambiance 🤍"
        introLabel="Galerie Contact"
        seamCaption="L'atelier"
        autoPlayInterval={5500}
        maxHeight="min(46vh, 420px)"
      />

      {/* ===================== HERO ===================== */}
      <PageHero
        title="Restons en contact"
        subtitle="Par téléphone, WhatsApp ou via le formulaire — on vous répond vite."
        image="/images/hero-contact.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Contact" }]}
      />

      {/* 3 canaux */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Nous joindre"
            title={<>3 canaux <span style={{ color: "var(--color-orange)" }}>directs</span></>}
          />
          <div className="grid md:grid-cols-3 gap-4">
            <Reveal>
              <a href={`tel:${CONTACT.phone1Raw}`} onClick={() => trackPhone(CONTACT.phone1Raw)} className="block">
                <Card hover={false} className="text-center h-full hover:!border-[var(--color-citron)] transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-citron)]/30 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6" style={{ color: "var(--color-ink)" }} />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">Téléphone 1</p>
                  <p className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {CONTACT.phone1}
                  </p>
                </Card>
              </a>
            </Reveal>
            <Reveal delay={0.08}>
              <a href={`tel:${CONTACT.phone2Raw}`} onClick={() => trackPhone(CONTACT.phone2Raw)} className="block">
                <Card hover={false} className="text-center h-full hover:!border-[var(--color-citron)] transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-[var(--color-citron)]/30 flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-6 h-6" style={{ color: "var(--color-ink)" }} />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">Téléphone 2</p>
                  <p className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    {CONTACT.phone2}
                  </p>
                </Card>
              </a>
            </Reveal>
            <Reveal delay={0.16}>
              <a
                href={buildWhatsAppUrl(CONTACT.whatsappRaw)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsapp("contact_page")}
                className="block"
              >
                <Card hover={false} className="text-center h-full hover:!border-[#25D366] transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-6 h-6 text-[#25D366]" />
                  </div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-1">WhatsApp</p>
                  <p className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
                    Discuter →
                  </p>
                </Card>
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Adresse + horaires + map */}
      <section className="py-12 md:py-16 bg-[var(--color-cream)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="L'atelier"
            title={<>Venez <span style={{ color: "var(--color-orange)" }}>nous rendre visite</span></>}
            subtitle="Les Services Colombes, Porto-Novo — facile à trouver sur Google Maps."
          />

          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
            {/* Bloc infos + adresse mise en valeur */}
            <Reveal>
              <Card hover={false} className="h-full p-6 md:p-8">
                {/* Position mise en valeur */}
                <a
                  href={env.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 p-4 rounded-2xl bg-[var(--color-citron)]/15 border-2 border-[var(--color-citron)] hover:border-[var(--color-orange)] transition-colors mb-6"
                  aria-label="Ouvrir l'adresse dans Google Maps"
                >
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MapPin className="w-6 h-6" style={{ color: "var(--color-orange)" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm uppercase tracking-wider text-[var(--color-orange)] mb-1">
                      Notre adresse
                    </p>
                    <p className="text-base md:text-lg font-semibold leading-snug mb-1" style={{ fontFamily: "var(--font-display)" }}>
                      {CONTACT.location}
                    </p>
                    <p className="text-xs text-[var(--color-muted)] inline-flex items-center gap-1 group-hover:text-[var(--color-orange)] transition-colors">
                      Ouvrir dans Google Maps
                      <Navigation className="w-3 h-3" />
                    </p>
                  </div>
                </a>

                <div className="space-y-5">
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Horaires</p>
                      <ul className="text-sm text-[var(--color-ink-soft)] space-y-1">
                        {CONTACT.hours.map((h) => (
                          <li key={h.label}><strong className="text-[var(--color-ink)]">{h.label}</strong> — {h.value}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5" style={{ color: "var(--color-orange)" }} />
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Email</p>
                      {HAS_SUPPORT_EMAIL ? (
                        <a
                          href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Demande d'information - Les Services Colombes")}&body=${encodeURIComponent(`Bonjour,

Je souhaite obtenir des informations supplémentaires.

Merci.`)}`}
                          className="text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-orange)] transition-colors break-all"
                        >
                          {SUPPORT_EMAIL}
                        </a>
                      ) : (
                        <p className="text-sm text-[var(--color-ink-soft)]">Adresse email disponible sur demande</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Reveal>

            {/* Carte Google Maps visible */}
            <Reveal delay={0.1}>
              <Card hover={false} className="h-full p-2 md:p-3 overflow-hidden">
                <div className="relative w-full h-full min-h-[320px] rounded-xl overflow-hidden border border-[var(--color-line)]">
                  {env.mapsEmbed ? (
                    <iframe
                      src={env.mapsEmbed}
                      title="Carte — Les Services Colombes à Porto-Novo"
                      className="absolute inset-0 w-full h-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[var(--color-cream)]">
                      <MapPin className="w-10 h-10 mb-3" style={{ color: "var(--color-orange)" }} />
                      <p className="text-sm font-semibold mb-2">{CONTACT.location}</p>
                      <a
                        href={env.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.location)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-orange)] underline"
                      >
                        Ouvrir dans Google Maps →
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Formulaire libre */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Écrire un message"
            title={<>Ou <span style={{ color: "var(--color-orange)" }}>envoyez-nous</span> un message</>}
            subtitle="Nous lisons tout et répondons sous 48h."
          />
          <Card hover={false} className="p-6 md:p-8">
            <ContactForm />
          </Card>
        </div>
      </section>
    </>
  );
}
