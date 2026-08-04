import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from "@/utils/whatsapp";
import { env } from "@/utils/env";
import { trackWhatsapp, trackCtaClick } from "@/utils/api";
import { cn } from "@/utils/cn";

export function WhatsAppFAB() {
  const [hover, setHover] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const open = (template?: string) => {
    trackWhatsapp("fab");
    if (template) trackCtaClick(`whatsapp_${template}`);
    window.open(buildWhatsAppUrl(env.whatsappGeneralRaw, template ? WHATSAPP_TEMPLATES[template]("") : undefined), "_blank", "noopener,noreferrer");
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
        className="fixed bottom-24 md:bottom-7 right-5 z-30 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl flex items-center justify-center hover:scale-110 transition-transform animate-pulse-citron"
        aria-label="WhatsApp"
      >
        {expanded ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
      </button>

      {expanded && (
        <div className={cn(
          "fixed z-30 right-5 bottom-40 md:bottom-24",
          "bg-white rounded-2xl shadow-2xl border border-[var(--color-line)] p-3 w-72",
          "animate-fade-in"
        )}>
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
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}