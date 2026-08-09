/**
 * WhatsAppFab.tsx
 *
 * Bouton flottant WhatsApp (FAB) — refonte UX :
 *   - Pulse discret toutes les 8s (pas agressif)
 *   - Tooltip desktop
 *   - Mini menu au tap avec 3 canaux : infos / précommande / formation
 *   - Adapté au mode sombre via tokens CSS
 *
 * Remplace l'ancien WhatsAppFAB (src/components/chat/WhatsAppFAB.tsx) :
 *   on garde exactement la même logique de tracking, juste un
 *   habillage plus soigné.
 */

import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from "@/utils/whatsapp";
import { env } from "@/utils/env";
import { trackWhatsapp, trackCtaClick } from "@/utils/api";
import { cn } from "@/utils/cn";

const PULSE_INTERVAL_MS = 8000;

export function WhatsAppFab() {
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [pulseOn, setPulseOn] = useState(false);

  // Pulse discret, toutes les 8 secondes
  useEffect(() => {
    const id = setInterval(() => {
      setPulseOn(true);
      const off = setTimeout(() => setPulseOn(false), 1200);
      return () => clearTimeout(off);
    }, PULSE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  const open = (template?: string) => {
    trackWhatsapp("fab");
    if (template) trackCtaClick(`whatsapp_${template}`);
    window.open(
      buildWhatsAppUrl(env.whatsappGeneralRaw, template ? WHATSAPP_TEMPLATES[template]("") : undefined),
      "_blank",
      "noopener,noreferrer",
    );
    setExpanded(false);
  };

  return (
    <>
      {/* Tooltip desktop */}
      <div
        className="hidden md:block fixed right-24 bottom-7 z-30 pointer-events-none"
        style={{ opacity: hover ? 1 : 0, transition: "opacity 0.2s" }}
      >
        <div className="bg-[var(--color-ink)] text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
          Discuter sur WhatsApp
        </div>
      </div>

      <button
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "fixed bottom-24 md:bottom-7 right-5 z-30 w-14 h-14 rounded-full",
          "bg-[linear-gradient(135deg,#8B4515,#5C2E0C)] text-white shadow-xl flex items-center justify-center",
          "hover:scale-110 transition-transform",
          pulseOn && "animate-pulse-citron",
        )}
        aria-label={expanded ? "Fermer le menu WhatsApp" : "Ouvrir WhatsApp"}
        aria-expanded={expanded}
      >
        {expanded ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {expanded && (
        <div
          className={cn(
            "fixed z-30 right-5 bottom-40 md:bottom-24",
            "bg-white rounded-2xl shadow-2xl border border-[var(--color-line)] p-3 w-72",
            "animate-fade-in",
          )}
          role="menu"
        >
          <p className="text-sm font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            Comment pouvons-nous vous aider ?
          </p>
          {[
            { key: "general", label: "Infos générales", emoji: "💬" },
            { key: "precommande", label: "Suivre ma pré-commande", emoji: "📦" },
            { key: "formation", label: "Inscription formation", emoji: "🎓" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => open(opt.key)}
              className="w-full text-left text-sm px-3 py-2.5 rounded-lg hover:bg-[var(--color-citron)]/20 transition-colors flex items-center gap-2 min-h-[44px]"
              role="menuitem"
            >
              <span aria-hidden="true">{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
