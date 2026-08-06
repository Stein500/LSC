import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Copy, RotateCcw, Trash2, MessageCircle } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CONTACT } from "@/data/content";
import { formatDateFR } from "@/utils/format";
import {
  clearTickets,
  deleteTicket,
  getTickets,
  getTicketLabel,
  getTicketStatusLabel,
  getTicketStatusTone,
  openTicketWhatsApp,
  updateTicket,
  type StoredTicket,
} from "@/utils/tickets";
import { trackFormSubmit } from "@/utils/api";
import { toast } from "sonner";

function summarize(ticket: StoredTicket) {
  const entries = Object.entries(ticket.data).filter(([, value]) => value !== undefined && value !== "");
  if (!entries.length) return "Aucune donnée enregistrée.";
  return entries
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
    .join(" · ");
}

export default function Tickets() {
  const [tickets, setTickets] = useState(() => getTickets());
  const pending = useMemo(() => tickets.filter((ticket) => ticket.status === "pending" || ticket.status === "error").length, [tickets]);
  const synced = useMemo(() => tickets.filter((ticket) => ticket.status === "synced").length, [tickets]);

  const refresh = () => setTickets(getTickets());

  const handleCopy = async (ticket: StoredTicket) => {
    await navigator.clipboard.writeText(ticket.ref);
    toast.success("Référence copiée");
  };

  const handleRetry = async (ticket: StoredTicket) => {
    try {
      const response = await trackFormSubmit(ticket.source, { ...ticket.data, ref: ticket.ref }, ticket.ref);
      if (response) {
        updateTicket(ticket.ref, { status: "synced", syncedAt: new Date().toISOString(), lastError: undefined });
        toast.success("Demande mise à jour");
      } else {
        updateTicket(ticket.ref, { status: "pending", lastError: "Réponse vide au retour" });
        toast.info("Nouvel envoi impossible pour le moment");
      }
      refresh();
    } catch (error) {
      updateTicket(ticket.ref, { status: "error", lastError: String(error) });
      refresh();
      toast.error("Mise à jour échouée");
    }
  };

  return (
    <>
      <SEO title="Mes demandes" description="Vos demandes gardées en mémoire et faciles à retrouver." path="/tickets" />
      <PageHero
        title="Mes demandes"
        subtitle="Vos demandes gardées en mémoire, avec renvoi WhatsApp et mise à jour quand il le faut."
        image="/images/hero-contact.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Demandes" }]}
      />

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Suivi"
            title={<>Vos <span style={{ color: "var(--color-orange)" }}>demandes gardées</span></>}
          />

          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <Card className="p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">Total</p>
              <p className="text-3xl font-bold">{tickets.length}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">En attente</p>
              <p className="text-3xl font-bold">{pending}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] mb-2">Mises à jour</p>
              <p className="text-3xl font-bold">{synced}</p>
            </Card>
          </div>

          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              variant="ghost"
              icon={<Trash2 className="w-4 h-4" />}
              onClick={() => {
                clearTickets();
                refresh();
                toast.success("Demandes retirées");
              }}
            >
              Vider la liste
            </Button>
            <Link to="/parametres" className="inline-flex">
              <Button variant="secondary" icon={<CheckCircle2 className="w-4 h-4" />}>Ouvrir les paramètres</Button>
            </Link>
          </div>

          {tickets.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="font-semibold mb-2">Aucune demande pour le moment.</p>
              <p className="text-sm text-[var(--color-ink-soft)] mb-5">
                Les demandes envoyées depuis les formulaires apparaîtront ici, bien rangées.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/contact"><Button>Contact</Button></Link>
                <Link to="/formation"><Button variant="outline">Formation</Button></Link>
                <Link to="/services"><Button variant="outline">Services</Button></Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {tickets.map((ticket) => {
                const statusTone = getTicketStatusTone(ticket.status);
                const whatsapp = openTicketWhatsApp(ticket, CONTACT.whatsappRaw);
                return (
                  <Card key={ticket.ref} className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge tone={statusTone}>{getTicketStatusLabel(ticket.status)}</Badge>
                          <Badge tone="neutral">{getTicketLabel(ticket.source)}</Badge>
                          <span className="text-xs text-[var(--color-muted)]">{ticket.ref}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)" }}>{ticket.title}</h3>
                        <p className="text-sm text-[var(--color-ink-soft)] mb-3">{summarize(ticket)}</p>
                        <p className="text-xs text-[var(--color-muted)]">
                          Créé le {formatDateFR(ticket.createdAt)} · Mis à jour le {formatDateFR(ticket.updatedAt)}
                        </p>
                        {ticket.lastError ? (
                          <p className="text-xs mt-2 text-[var(--color-orange)]">Erreur : {ticket.lastError}</p>
                        ) : null}
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Button size="sm" variant="outline" icon={<Copy className="w-4 h-4" />} onClick={() => handleCopy(ticket)}>
                          Copier
                        </Button>
                        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex">
                          <Button size="sm" variant="secondary" icon={<MessageCircle className="w-4 h-4" />}>
                            WhatsApp
                          </Button>
                        </a>
                        <Button size="sm" icon={<RotateCcw className="w-4 h-4" />} onClick={() => handleRetry(ticket)}>
                          Relancer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => {
                            deleteTicket(ticket.ref);
                            refresh();
                          }}
                        >
                          Retirer
                        </Button>
                      </div>
                    </div>

                    <details className="mt-4 rounded-2xl bg-[var(--color-cream)]/30 border border-[var(--color-line)] p-4">
                      <summary className="cursor-pointer font-semibold text-sm">Voir le détail</summary>
                      <pre className="mt-3 overflow-auto text-xs whitespace-pre-wrap break-words text-[var(--color-ink-soft)]">
{JSON.stringify(ticket.data, null, 2)}
                      </pre>
                    </details>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
