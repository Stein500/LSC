
import { Link } from "react-router-dom";
import { Phone, MapPin, MessageCircle, Clock, Mail, Heart } from "lucide-react";
import { CONTACT, TESTIMONIALS } from "@/data/content";
import { env } from "@/utils/env";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { trackPhone, trackWhatsapp } from "@/utils/api";
import { SmartImage } from "@/components/ui/SmartImage";
import { WorldClock } from "@/components/ui/WorldClock";
import { Masonry } from "@/components/ui/Masonry";
import { PROFILES } from "@/data/profiles";

const SUPPORT_EMAIL = env.atelierEmail.trim();
const HAS_SUPPORT_EMAIL = SUPPORT_EMAIL.length > 0;

export function Footer() {
  return (
    <footer className="bg-[var(--app-footer-bg)] text-white mt-24">
      <div className="border-b border-[var(--app-footer-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p
            className="text-2xl md:text-3xl italic"
            style={{ fontFamily: "var(--font-display)", color: "var(--color-citron)" }}
          >
            "Style, Élégance, Excellence."
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-11 h-11 rounded-full bg-white flex items-center justify-center overflow-hidden"
                style={{ border: "2px solid var(--color-citron)" }}
              >
                <SmartImage src="/images/logo.webp" alt="" decorative className="w-full h-full object-contain p-1.5" />
              </div>
              <div>
                <p className="font-bold tracking-wide" style={{ fontFamily: "var(--font-display)" }}>{env.schoolName}</p>
                <p className="text-[10px] text-white/70">{env.schoolTagline}</p>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              Atelier de couture familiale à Porto-Novo, Bénin, Afrique depuis {env.schoolFounded}. Savoir-faire, élégance et proximité.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--color-citron)" }}>
              Navigation
            </h4>
            <ul className="space-y-2 text-sm text-white/80">
              <li><Link to="/" className="hover:text-[var(--color-citron)] transition-colors inline-flex items-center min-h-[44px]">Accueil</Link></li>
              <li><Link to="/services" className="hover:text-[var(--color-citron)] transition-colors inline-flex items-center min-h-[44px]">Services</Link></li>
              <li><Link to="/formation" className="hover:text-[var(--color-citron)] transition-colors inline-flex items-center min-h-[44px]">Formation</Link></li>
              <li><Link to="/inspirations" className="hover:text-[var(--color-citron)] transition-colors inline-flex items-center min-h-[44px]">Inspirations</Link></li>
              <li><Link to="/contact" className="hover:text-[var(--color-citron)] transition-colors inline-flex items-center min-h-[44px]">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--color-citron)" }}>
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: "var(--color-orange)" }} />
                <span>{CONTACT.location}</span>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phone1Raw}`}
                  onClick={() => trackPhone(CONTACT.phone1Raw)}
                  className="flex items-center gap-2 hover:text-[var(--color-citron)] transition-colors min-h-[44px]"
                >
                  <Phone className="w-4 h-4 shrink-0" style={{ color: "var(--color-orange)" }} />
                  {CONTACT.phone1}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${CONTACT.phone2Raw}`}
                  onClick={() => trackPhone(CONTACT.phone2Raw)}
                  className="flex items-center gap-2 hover:text-[var(--color-citron)] transition-colors min-h-[44px]"
                >
                  <Phone className="w-4 h-4 shrink-0" style={{ color: "var(--color-orange)" }} />
                  {CONTACT.phone2}
                </a>
              </li>
              {HAS_SUPPORT_EMAIL ? (
                <li className="flex items-center gap-2 break-all">
                  <Mail className="w-4 h-4 shrink-0" style={{ color: "var(--color-orange)" }} />
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("Demande d'information - Les Services Colombes")}&body=${encodeURIComponent(`Bonjour,

Je souhaite obtenir des informations supplémentaires.

Merci.`)}`}
                    className="hover:text-[var(--color-citron)] transition-colors"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </li>
              ) : null}
              <li>
                <a
                  href={buildWhatsAppUrl(CONTACT.whatsappRaw)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackWhatsapp("footer")}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#25D366] text-white hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp direct
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider" style={{ color: "var(--color-citron)" }}>
              Horaires
            </h4>
            <ul className="space-y-2 text-sm text-white/80 mb-5">
              {CONTACT.hours.map((h) => (
                <li key={h.label} className="flex items-start gap-2">
                  <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "var(--color-orange)" }} />
                  <span><strong className="text-white">{h.label}</strong><br />{h.value}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-white/70 italic" style={{ fontFamily: "var(--font-display)" }}>
              {TESTIMONIALS[0].content}
            </p>
            <p className="text-xs text-white/55 mt-1">— {TESTIMONIALS[0].name}, {TESTIMONIALS[0].role}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--app-footer-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 text-xs text-white/70">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} {env.schoolName}. Tous droits réservés.</p>
            <p className="flex items-center gap-1.5">
              fait avec amour à Porto-Novo, Bénin, Afrique <Heart className="w-3 h-3" style={{ color: "var(--color-orange)" }} fill="currentColor" />
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/85 font-semibold">Le monde nous porte</span>
            <WorldClock cities={["porto-novo", "benin", "afrique"]} compact />
          </div>
          <details className="rounded-2xl bg-white/5 border border-white/10 p-4">
            <summary className="cursor-pointer list-none text-white/90 font-semibold mb-2 flex items-center justify-between gap-3">
              <span>Inspirations du monde</span>
              <span className="text-xs text-white/55">ouvrir</span>
            </summary>
            <Masonry columns={{ sm: 2, md: 3 }} gap={8} className="text-[11px] text-white/80">
              {PROFILES.slice(0, 6).map((profile) => (
                <span key={profile.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2 py-1 mb-2">
                  {profile.city}
                </span>
              ))}
            </Masonry>
          </details>
        </div>
      </div>
    </footer>
  );
}
