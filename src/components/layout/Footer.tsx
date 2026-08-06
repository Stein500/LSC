import { Link } from "react-router-dom";
import { Phone, MapPin, MessageCircle, Mail, Clock, Heart, Facebook, Instagram, Music2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CONTACT } from "@/data/content";
import { env } from "@/utils/env";
import { buildWhatsAppUrl } from "@/utils/whatsapp";
import { trackPhone, trackWhatsapp } from "@/utils/api";
import { SmartImage } from "@/components/ui/SmartImage";

const SUPPORT_EMAIL = env.atelierEmail.trim();

type FooterAction = {
  label: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  onClick?: () => void;
};

const MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Demande d'information - Les Services Colombes"
)}&body=${encodeURIComponent("Bonjour,\n\nJe souhaite obtenir des informations supplémentaires.\n\nMerci.")}`;

export function Footer() {
  const year = new Date().getFullYear();

  const actions: FooterAction[] = [
    { label: "Appeler", href: `tel:${CONTACT.phone1Raw}`, icon: Phone, onClick: () => trackPhone(CONTACT.phone1Raw) },
    {
      label: "WhatsApp",
      href: buildWhatsAppUrl(CONTACT.whatsappRaw),
      icon: MessageCircle,
      external: true,
      onClick: () => trackWhatsapp("footer"),
    },
    ...(SUPPORT_EMAIL ? [{ label: "Email", href: MAILTO, icon: Mail as LucideIcon }] : []),
    { label: "Itinéraire", href: env.mapsUrl, icon: MapPin, external: true },
    ...(env.facebookUrl ? [{ label: "Facebook", href: env.facebookUrl, icon: Facebook as LucideIcon, external: true }] : []),
    ...(env.instagramUrl ? [{ label: "Instagram", href: env.instagramUrl, icon: Instagram as LucideIcon, external: true }] : []),
    ...(env.tiktokUrl ? [{ label: "TikTok", href: env.tiktokUrl, icon: Music2 as LucideIcon, external: true }] : []),
  ];

  const nav = [
    { to: "/", label: "Accueil" },
    { to: "/services", label: "Services" },
    { to: "/formation", label: "Formation" },
    { to: "/inspirations", label: "Inspirations" },
    { to: "/contact", label: "Contact" },
  ];

  const hours = CONTACT.hours.map((h) => `${h.label} · ${h.value}`).join(" — ");

  return (
    <footer className="relative bg-[var(--app-footer-bg)] text-white mt-24 overflow-hidden">
      {/* Orbes aurora de nuit — discrètes */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute -top-32 left-[8%] w-72 h-72 rounded-full blur-[110px] lsc-drift"
          style={{ backgroundColor: "rgba(191,255,0,0.09)", animationDuration: "18s" }}
        />
        <div
          className="absolute -bottom-24 right-[12%] w-80 h-80 rounded-full blur-[120px] lsc-drift"
          style={{ backgroundColor: "rgba(139,69,19,0.20)", animationDuration: "22s", animationDelay: "-8s" }}
        />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 pt-16 pb-10 md:pt-20 md:pb-12 text-center">
        {/* Signature */}
        <p
          className="italic text-lg md:text-xl mb-10"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-citron)" }}
        >
          "Style, Élégance, Excellence."
        </p>

        {/* Marque */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full overflow-hidden shadow-lg shadow-black/40"
            style={{ border: "3px solid var(--color-citron)", boxShadow: "0 8px 22px rgba(0,0,0,0.45), 0 0 0 3px rgba(201,168,124,0.35)" }}
          >
            <SmartImage src="/images/logo.webp" alt="" decorative className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-bold tracking-wide text-lg" style={{ fontFamily: "var(--font-display)" }}>
              {env.schoolName}
            </p>
            <p className="text-[11px] uppercase tracking-[0.28em] text-white/55 mt-1">{env.schoolTagline}</p>
          </div>
          <p className="text-sm text-white/65 leading-relaxed max-w-md">
            Atelier de couture familiale à Porto-Novo depuis {env.schoolFounded}. Savoir-faire, élégance et proximité.
          </p>
        </div>

        {/* Rail d'icônes d'action — chaque icône dirige */}
        <div className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-5">
          {actions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              onClick={a.onClick}
              {...(a.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="group flex flex-col items-center gap-2"
              aria-label={a.label}
            >
              <span className="w-14 h-14 rounded-full grid place-items-center border border-white/15 bg-white/5 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[var(--color-or)] group-hover:bg-white/10 group-hover:shadow-[0_10px_30px_-10px_rgba(201,168,124,0.45)]">
                <a.icon className="w-5 h-5 text-white/85 transition-colors duration-300 group-hover:text-[var(--color-citron)]" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 transition-colors duration-300 group-hover:text-white/85">
                {a.label}
              </span>
            </a>
          ))}
        </div>

        {/* Navigation condensée */}
        <nav className="mt-10 flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-xs uppercase tracking-[0.2em]">
          {nav.map((item, i) => (
            <span key={item.to} className="flex items-center gap-5">
              {i > 0 && <span className="text-[var(--color-or)]/60">·</span>}
              <Link to={item.to} className="text-white/60 hover:text-[var(--color-citron)] transition-colors py-2">
                {item.label}
              </Link>
            </span>
          ))}
        </nav>

        {/* Horaires + lieu en une ligne */}
        <div className="mt-8 flex flex-col items-center gap-1.5 text-xs text-white/50">
          <p className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" style={{ color: "var(--color-orange)" }} />
            {hours}
          </p>
          <p className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" style={{ color: "var(--color-orange)" }} />
            {CONTACT.location}
          </p>
        </div>

        {/* Fil d'or */}
        <div className="mt-10 h-px w-44 mx-auto bg-gradient-to-r from-transparent via-[var(--color-or)]/50 to-transparent" />
      </div>

      {/* Barre finale minimale */}
      <div className="relative border-t border-[var(--app-footer-border)]">
        <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-[11px] text-white/50">
          <p>© {year} {env.schoolName}. Tous droits réservés.</p>
          <Link to="/mentions-legales" className="hover:text-[var(--color-citron)] transition-colors">
            Mentions légales
          </Link>
          <p className="flex items-center gap-1.5">
            fait avec amour à Porto-Novo <Heart className="w-3 h-3" style={{ color: "var(--color-orange)" }} fill="currentColor" />
          </p>
        </div>
      </div>
    </footer>
  );
}
