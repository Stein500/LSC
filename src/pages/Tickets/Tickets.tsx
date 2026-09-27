import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Copy,
  MessageCircle,
  RotateCcw,
  Share2,
  Ticket,
  Trash2,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { CONTACT } from "@/data/content";
import { formatDateFR } from "@/utils/format";
import {
  clearTickets,
  deleteTicket,
  getTickets,
  getTicketLabel,
  getTicketStatusLabel,
  openTicketWhatsApp,
  ticketFieldsFr,
  ticketPerson,
  TICKET_SOURCE_EMOJI,
  type StoredTicket,
  type TicketStatus,
} from "@/utils/tickets";
import { syncTicket } from "@/utils/sync";
import { trackCtaClick } from "@/utils/api";
import { shareText } from "@/utils/share";
import { toast } from "sonner";

/**
 * Mes Tickets — le porte-tickets de la maison 🎟️
 * ------------------------------------------------
 * Chaque demande est un petit coupon cousu à la façon du ticket PDF :
 * bord pointillé or, perforations, statut lisible d'un coup d'œil —
 * même sans savoir lire, les couleurs parlent :
 *
 *   🟢  « Bien reçu »  — l'atelier tient votre demande (mail ou tableau)
 *   🟠  « En route »   — gardée en sûreté sur l'appareil, à relancer
 *   🔴  « À renvoyer » — l'envoi a glissé, on retente doucement
 */

const STATUS_STYLE: Record<
  TicketStatus,
  { chip: string; dot: string; icon: string; conseil: string }
> = {
  synced: {
    chip: "bg-[var(--color-feuille-doux,#EFF7E3)] text-[var(--color-feuille-f,#558B2F)] border border-[var(--color-feuille,#7CBA45)]/40",
    dot: "bg-[var(--color-feuille-f,#558B2F)]",
    icon: "✔",
    conseil: "L'atelier tient votre demande — réponse sous 48 h ouvrées.",
  },
  pending: {
    chip: "bg-[#FDF3E3] text-[#C75B12] border border-[#F4B860]/50",
    dot: "bg-[#F4B860]",
    icon: "…",
    conseil: "Gardée en sûreté ici — touchez « Relancer » quand la connexion sourit.",
  },
  error: {
    chip: "bg-[#FBE4E6] text-[#D1232A] border border-[#D1232A]/30",
    dot: "bg-[#D1232A]",
    icon: "!",
    conseil: "L'envoi a glissé — « Relancer » la renvoie à l'atelier, tout est prêt.",
  },
};

function StatusChip({ status }: { status: TicketStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold shrink-0 ${s.chip}`}
    >
      <span className={`w-2 h-2 rounded-full ${s.dot}`} aria-hidden="true" />
      {getTicketStatusLabel(status)}
    </span>
  );
}

export default function Tickets() {
  const [tickets, setTickets] = useState(() => getTickets());
  const [busyRef, setBusyRef] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c = { synced: 0, pending: 0, error: 0 };
    for (const t of tickets) c[t.status] += 1;
    return c;
  }, [tickets]);

  const refresh = () => setTickets(getTickets());

  const handleCopy = async (ticket: StoredTicket) => {
    await navigator.clipboard.writeText(ticket.ref);
    toast.success("Référence copiée 🎟️");
  };

  const handleShare = async (ticket: StoredTicket) => {
    trackCtaClick("ticket_partage");
    const text = `🧵 Suivi ${getTicketLabel(ticket.source)} — référence ${ticket.ref} · statut : ${getTicketStatusLabel(ticket.status)} · Couture Colombe et Merceries, Porto-Novo`;
    const channel = await shareText(text);
    if (channel === "clipboard") toast.success("Résumé copié — prêt à partager 🕊️");
  };

  const handleRetry = async (ticket: StoredTicket) => {
    setBusyRef(ticket.ref);
    const outcome = await syncTicket(ticket);
    setBusyRef(null);
    refresh();
    if (outcome === "synced") toast.success("Bien reçu à l'atelier ✔");
    else if (outcome === "pending") toast.info("Encore gardée en sûreté — l'atelier n'a pas reçu, retentez dans un instant.");
    else toast.error("L'envoi a glissé — on retente doucement plus tard.");
  };

  const handleRemove = (ticket: StoredTicket) => {
    if (!window.confirm(`Retirer la demande ${ticket.ref} de la liste ?`)) return;
    deleteTicket(ticket.ref);
    refresh();
    toast.success("Demande retirée de la liste");
  };

  const handleClearAll = () => {
    if (!window.confirm("Vider toute la liste des demandes ?")) return;
    clearTickets();
    refresh();
    toast.success("La liste est vide — tout est rangé");
  };

  return (
    <>
      <SEO title="Mes demandes" description="Vos demandes gardées en mémoire, façon porte-tickets de la maison." path="/tickets" />
      <PageHero
        title="Votre porte-tickets"
        subtitle="Chaque demande est cousue ici comme un petit coupon de la maison — le statut se lit d'un coup d'œil."
        image="/images/hero-contact.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Demandes" }]}
      />

      <section className="py-12 md:py-16 bg-[var(--color-cream,#FBE7EB)]/50 min-h-[40vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Porte-tickets"
            title={<>Vos <span style={{ color: "var(--color-orange)" }}>demandes cousues</span></>}
          />

          {/* Les trois voyants — les couleurs parlent avant les mots */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mb-8">
            <div className="rounded-2xl bg-white border border-[var(--color-feuille,#7CBA45)]/30 p-3.5 sm:p-5 text-center shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--color-feuille-f,#558B2F)" }}>{counts.synced}</p>
              <p className="text-[11px] sm:text-xs font-semibold text-[var(--color-muted)] mt-1">🟢 Bien reçues</p>
            </div>
            <div className="rounded-2xl bg-white border border-[#F4B860]/40 p-3.5 sm:p-5 text-center shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#C75B12]">{counts.pending}</p>
              <p className="text-[11px] sm:text-xs font-semibold text-[var(--color-muted)] mt-1">🟠 En route</p>
            </div>
            <div className="rounded-2xl bg-white border border-[#D1232A]/25 p-3.5 sm:p-5 text-center shadow-sm">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#D1232A]">{counts.error}</p>
              <p className="text-[11px] sm:text-xs font-semibold text-[var(--color-muted)] mt-1">🔴 À renvoyer</p>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[var(--color-line)] p-8 md:p-10 text-center shadow-sm">
              <span className="text-4xl block mb-3" aria-hidden="true">🎟️</span>
              <p className="font-bold text-lg mb-2" style={{ fontFamily: "var(--font-display)" }}>
                Le porte-tickets est encore vide
              </p>
              <p className="text-sm text-[var(--color-ink-soft)] mb-6 max-w-md mx-auto">
                Vos prochaines demandes — commande, formation, message — se coudront ici,
                chacune avec sa couleur de statut.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/services" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-md" style={{ background: "linear-gradient(135deg, #558B2F 0%, #7CBA45 45%, #E87414 100%)" }}>
                  👗 Commander une tenue
                </Link>
                <Link to="/formation" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold border-2 border-[var(--color-line)] bg-white">
                  🎓 Formation
                </Link>
                <Link to="/contact" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold border-2 border-[var(--color-line)] bg-white">
                  💌 Contact
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-muted)] hover:text-[#D1232A] transition-colors px-3 py-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Vider la liste
                </button>
              </div>

              <div className="space-y-5">
                {tickets.map((ticket) => (
                  <TicketCoupon
                    key={ticket.ref}
                    ticket={ticket}
                    busy={busyRef === ticket.ref}
                    onCopy={handleCopy}
                    onShare={handleShare}
                    onRetry={handleRetry}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

/* ============ 🎟️ Le coupon — cousu comme le ticket PDF ============ */
function TicketCoupon({
  ticket,
  busy,
  onCopy,
  onShare,
  onRetry,
  onRemove,
}: {
  ticket: StoredTicket;
  busy: boolean;
  onCopy: (t: StoredTicket) => void;
  onShare: (t: StoredTicket) => void;
  onRetry: (t: StoredTicket) => void;
  onRemove: (t: StoredTicket) => void;
}) {
  const style = STATUS_STYLE[ticket.status];
  const person = ticketPerson(ticket.data);
  const fields = ticketFieldsFr(ticket.data);
  const whatsapp = openTicketWhatsApp(ticket, CONTACT.whatsappRaw);
  const modele = String(ticket.data.modele || "").trim();

  return (
    <article className="relative rounded-3xl bg-white shadow-md hover:shadow-lg transition-shadow border-2 border-dashed border-[var(--color-gold-thread,#C9A87C)] overflow-hidden">
      {/* Perforations du talon — comme un vrai coupon à détacher */}
      <div
        className="absolute left-2.5 top-3 bottom-3 flex flex-col justify-between"
        aria-hidden="true"
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="w-2 h-2 rounded-full bg-[var(--color-cream,#FBE7EB)] border border-[var(--color-line)]" />
        ))}
      </div>

      <div className="pl-9 pr-4 sm:pr-5 py-5">
        {/* Tête du coupon : type + statut */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {TICKET_SOURCE_EMOJI[ticket.source]} {getTicketLabel(ticket.source)}
            </p>
            <h3 className="text-lg sm:text-xl font-bold mt-1 break-words" style={{ fontFamily: "var(--font-display)" }}>
              {person.name !== "—" ? person.name : ticket.title}
            </h3>
          </div>
          <StatusChip status={ticket.status} />
        </div>

        {/* La référence — bien grande, façon fil rouge */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="inline-flex items-center rounded-xl px-3.5 py-1.5 text-sm sm:text-base font-extrabold tracking-wide bg-[#FBE4E6]"
            style={{ color: "#A31322", fontFamily: "var(--font-display)" }}
          >
            {ticket.ref}
          </span>
          <span className="text-[11px] text-[var(--color-muted)]">
            {formatDateFR(ticket.createdAt)}
          </span>
        </div>

        {/* Les lignes qui parlent */}
        <div className="text-sm text-[var(--color-ink-soft)] space-y-1 mb-3">
          {person.phone && (
            <p className="flex items-center gap-2">
              <span aria-hidden="true">📞</span> {person.phone}
            </p>
          )}
          {modele && (
            <p className="flex items-center gap-2">
              <span aria-hidden="true">👗</span> Modèle : <strong className="font-semibold">{modele}</strong>
            </p>
          )}
          <p className="flex items-center gap-2">
            <span aria-hidden="true">{style.icon === "✔" ? "🧵" : "🪡"}</span> {style.conseil}
          </p>
        </div>

        {/* La note du fil — partielle ou brutale, toujours en douceur */}
        {ticket.lastError && (
          <p
            className="text-xs rounded-xl px-3.5 py-2.5 mb-4 border"
            style={
              ticket.status === "synced"
                ? { background: "#FDF8EC", borderColor: "#E9D8A6", color: "#8a6d1c" }
                : ticket.status === "error"
                  ? { background: "#FBE4E6", borderColor: "#D1232A33", color: "#A31322" }
                  : { background: "#FDF3E3", borderColor: "#F4B8604D", color: "#C75B12" }
            }
          >
            {ticket.lastError}
          </p>
        )}

        {/* Les grands gestes — 48 px minimum, des mots simples */}
        <div className="flex flex-wrap gap-2">
          <CouponAction onClick={() => onCopy(ticket)} label="Copier la réf." icon={<Copy className="w-4 h-4" />} />
          <a href={whatsapp} target="_blank" rel="noopener noreferrer">
            <CouponAction asSpan label="WhatsApp" icon={<MessageCircle className="w-4 h-4" />} />
          </a>
          <CouponAction onClick={() => onShare(ticket)} label="Partager" icon={<Share2 className="w-4 h-4" />} />
          {ticket.status !== "synced" && (
            <button
              type="button"
              onClick={() => onRetry(ticket)}
              disabled={busy}
              className="inline-flex items-center gap-1.5 min-h-[48px] rounded-2xl px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #558B2F 0%, #7CBA45 45%, #E87414 100%)" }}
            >
              <RotateCcw className={`w-4 h-4 ${busy ? "animate-spin" : ""}`} />
              {busy ? "Envoi…" : "Relancer"}
            </button>
          )}
          <button
            type="button"
            onClick={() => onRemove(ticket)}
            className="inline-flex items-center gap-1.5 min-h-[48px] rounded-2xl px-3.5 py-2.5 text-sm font-semibold text-[var(--color-muted)] hover:text-[#D1232A] transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Retirer
          </button>
        </div>

        {/* Le détail, en français de la maison */}
        {fields.length > 0 && (
          <details className="mt-4 rounded-2xl bg-[var(--color-cream,#FBE7EB)]/45 border border-[var(--color-line)] px-4 py-3 group">
            <summary className="cursor-pointer font-semibold text-sm select-none list-none flex items-center gap-2">
              <Ticket className="w-4 h-4 text-[var(--color-orange)]" aria-hidden="true" />
              Voir le détail de la demande
              <span className="ml-auto text-[var(--color-muted)] text-xs group-open:rotate-90 transition-transform">▶</span>
            </summary>
            <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2.5 text-sm pb-1">
              {fields.map((f) => (
                <div key={f.label} className="min-w-0">
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted)]">{f.label}</dt>
                  <dd className="break-words text-[var(--color-ink-soft)]">{f.value}</dd>
                </div>
              ))}
            </dl>
          </details>
        )}
      </div>
    </article>
  );
}

function CouponAction({
  onClick,
  label,
  icon,
  asSpan = false,
}: {
  onClick?: () => void;
  label: string;
  icon: React.ReactNode;
  asSpan?: boolean;
}) {
  const className =
    "inline-flex items-center gap-1.5 min-h-[48px] rounded-2xl px-4 py-2.5 text-sm font-semibold border-2 border-[var(--color-line)] bg-white text-[var(--color-ink)] transition-all hover:border-[var(--color-gold-thread,#C9A87C)] hover:-translate-y-0.5 active:translate-y-0";
  if (asSpan) {
    return <span className={className}>{icon}{label}</span>;
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {icon}
      {label}
    </button>
  );
}
