import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, LaptopMinimal, MessageCircle, Moon, RotateCw, Settings2, Sun, Tickets } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CONTACT } from "@/data/content";
import { env } from "@/utils/env";
import {
  countPendingTickets,
  clearTickets,
  deleteTicket,
  getTicketLabel,
  getTicketStatusLabel,
  getTicketStatusTone,
  getTickets,
  openTicketWhatsApp,
  type StoredTicket,
} from "@/utils/tickets";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { syncPendingTickets } from "@/utils/sync";
import { notify } from "@/utils/notify";
import { formatDateFR } from "@/utils/format";

export default function Parametres() {
  const { items: notifications, unread, clear: clearAll } = useNotifications();
  const online = useOnlineStatus();
  const { mode, setMode } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const pending = useMemo(() => countPendingTickets(), [refreshKey]);
  const tickets = useMemo(() => getTickets(), [refreshKey]);

  const handleResync = async () => {
    if (!online) {
      notify.error("Connexion requise pour envoyer la mise à jour");
      return;
    }
    setSyncing(true);
    try {
      const result = await syncPendingTickets();
      setRefreshKey((v) => v + 1);
      if (result.synced > 0) {
        notify.success(`${result.synced} demande${result.synced > 1 ? "s" : ""} envoyée${result.synced > 1 ? "s" : ""}` , {
          announce: `${result.synced} demande${result.synced > 1 ? "s" : ""} bien envoyée${result.synced > 1 ? "s" : ""}. Les Services Colombes vous reviennent.`,
        });
      } else if (result.total === 0) {
        notify.info("Rien à envoyer pour l’instant — tout est déjà à jour");
      } else {
        notify.error(`La mise à jour n’a pas pu partir (${result.failed}/${result.total})`);
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <SEO title="Paramètres" description="Réglages du site, messages et repères utiles." path="/parametres" />
      <PageHero
        title="Paramètres"
        subtitle="Réglages du site, messages et repères utiles, tout en gardant une lecture simple et propre."
        image="/images/hero-contact.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Paramètres" }]}
      />

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionTitle
            eyebrow="Application"
            title={<>Réglages <span style={{ color: "var(--color-orange)" }}>du site</span></>}
          />

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-6 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Apparence</p>
                  <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Thème du site</h3>
                </div>
                <Settings2 className="w-6 h-6 text-[var(--color-orange)]" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: "auto", label: "Auto", icon: LaptopMinimal },
                  { key: "light", label: "Clair", icon: Sun },
                  { key: "dark", label: "Sombre", icon: Moon },
                  { key: "amoled", label: "AMOLED", icon: Moon },
                ] as const).map((item) => {
                  const active = mode === item.key;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setMode(item.key as ThemeMode)}
                      className={(
                        "flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all min-h-[56px] " +
                        (active
                          ? "border-[var(--color-citron)] bg-[var(--color-citron)]/15 shadow-sm"
                          : "border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]")
                      )}
                      aria-pressed={active}
                    >
                      <span className={(
                        "flex h-10 w-10 items-center justify-center rounded-2xl " +
                        (active ? "bg-[var(--color-citron)]/30" : "bg-black/5")
                      )}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-[var(--color-ink)]">{item.label}</span>
                        <span className="block text-xs text-[var(--color-muted)]">
                          {item.key === "auto" ? "Suit le système" : item.key === "amoled" ? "Noir profond" : item.key === "dark" ? "Fond sombre" : "Fond clair"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

          </div>

          {/* === Section notifications refondue === */}
          <Card className="p-6 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5 min-w-0">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Alertes</p>
                <h3 className="text-2xl font-bold break-words" style={{ fontFamily: "var(--font-display)" }}>Vos alertes en douceur</h3>
              </div>
              <Bell className="w-6 h-6 text-[var(--color-orange)]" />
            </div>

            <p className="text-sm text-[var(--color-ink-soft)] mb-4 break-words">
              {unread > 0 ? `Vous avez ${unread} alerte${unread > 1 ? "s" : ""} à découvrir.` : "Vos alertes restent rangées ici, simplement."}
            </p>

            <div className="rounded-2xl border border-[var(--color-line)] divide-y divide-[var(--color-line)] overflow-hidden min-w-0">
              {notifications.slice(0, 5).map((n) => (
                <div key={n.id} className="p-3 flex items-start gap-3 bg-white">
                  <span
                    className="mt-0.5 inline-block w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: n.read ? "var(--color-muted)" : "var(--color-citron-d)",
                    }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${n.read ? "font-normal" : "font-semibold"} truncate`}>{n.title}</p>
                    {n.description && (
                      <p className="text-xs text-[var(--color-muted)] truncate mt-0.5">{n.description}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--color-muted)] uppercase tracking-wider shrink-0 whitespace-nowrap">
                    {formatDateFR(new Date(n.createdAt).toISOString())}
                  </span>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-6 text-center text-sm text-[var(--color-muted)]">
                  Aucun message pour le moment. Vos alertes s’afficheront ici avec douceur.
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 justify-between items-center">
              <Link to="/notifications" className="inline-flex">
                <Button variant="secondary" className="max-w-full">Voir toutes les alertes</Button>
              </Link>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearAll();
                    notify.info("Alertes retirées");
                  }}
                >
                  Effacer
                </Button>
              )}
            </div>
          </Card>

          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="p-6 min-w-0">
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Connexion</p>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                {online ? "En ligne" : "Hors-ligne"}
              </h3>
              <p className="text-sm text-[var(--color-ink-soft)] break-words">
                {online && pending === 0
                  ? "Tout fonctionne normalement, vos demandes sont bien à jour."
                  : online && pending > 0
                  ? `${pending} demande${pending > 1 ? "s" : ""} attend${pending > 1 ? "ent" : ""} d'être envoyée${pending > 1 ? "s" : ""}.`
                  : pending > 0
                  ? `${pending} demande${pending > 1 ? "s" : ""} en attente, prête${pending > 1 ? "s" : ""} à partir dès que la connexion revient.`
                  : "Les demandes en attente seront renvoyées dès que la connexion revient."}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full shrink-0 ${online ? (pending > 0 ? "bg-amber-500" : "bg-[var(--color-citron)]") : "bg-red-500"}`} />
                <span className="text-sm font-medium break-words">
                  {online ? (pending > 0 ? `Statut : ${pending} à envoyer` : "Statut : actif") : "Statut : hors-ligne"}
                </span>
              </div>
              {pending > 0 ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge tone="orange">{pending} en attente</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<RotateCw className="w-3.5 h-3.5" />}
                    loading={syncing}
                    onClick={handleResync}
                    disabled={!online}
                  >
                    Actualiser
                  </Button>
                </div>
              ) : null}
            </Card>

            <Card className="p-6 lg:col-span-2 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3 min-w-0">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Mes demandes</p>
                  <h3 className="text-2xl font-bold break-words" style={{ fontFamily: "var(--font-display)" }}>Suivi de vos demandes</h3>
                </div>
                <Tickets className="w-6 h-6 text-[var(--color-orange)]" />
              </div>
              <p className="text-sm text-[var(--color-ink-soft)] mb-4 break-words">
                Vos demandes restent à portée de main, même sans connexion.
              </p>

              <div className="flex flex-wrap gap-2 mb-4 min-w-0">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<RotateCw className="w-3.5 h-3.5" />}
                  onClick={handleResync}
                  loading={syncing}
                  disabled={!online || pending === 0}
                >
                  Renvoyer tout
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Tickets className="w-3.5 h-3.5" />}
                  onClick={() => {
                    clearTickets();
                    setRefreshKey((v) => v + 1);
                    notify.success("La liste a été nettoyée", { announce: "La liste a été nettoyée." });
                  }}
                  disabled={tickets.length === 0}
                >
                  Effacer
                </Button>
              </div>

              {tickets.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[var(--color-line)] p-5 text-center text-sm text-[var(--color-muted)] break-words">
                  Aucune demande pour l’instant. Vos prochains messages apparaîtront ici.
                </div>
              ) : (
                <ul className="space-y-2 max-h-80 overflow-y-auto pr-1 min-w-0">
                  {tickets.map((ticket) => (
                    <TicketRow
                      key={ticket.ref}
                      ticket={ticket}
                      onResend={(t) => {
                        if (!online) {
                          notify.error("Connexion requise pour envoyer cette demande");
                          return;
                        }
                        void handleResync();
                      }}
                      onWhatsApp={(t) => {
                        const url = openTicketWhatsApp(t, env.whatsappGeneralRaw);
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      onDelete={(t) => {
                        deleteTicket(t.ref);
                        setRefreshKey((v) => v + 1);
                        notify.success("Demande retirée", { announce: "Demande retirée." });
                      }}
                    />
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Card className="p-6 min-w-0" id="about">
            <SectionTitle
              align="left"
              eyebrow="Coordonnées"
              title={<>Vos <span style={{ color: "var(--color-orange)" }}>repères utiles</span></>}
            />
            <div className="grid md:grid-cols-2 gap-4 min-w-0">
              <a href={env.mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[var(--color-line)] p-4 hover:border-[var(--color-citron)] transition-colors min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Adresse</p>
                <p className="font-semibold">{CONTACT.location}</p>
              </a>
              <a href={`tel:${CONTACT.phone2Raw}`} className="rounded-2xl border border-[var(--color-line)] p-4 hover:border-[var(--color-citron)] transition-colors min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Téléphone 2</p>
                <p className="font-semibold">{CONTACT.phone2}</p>
              </a>
            </div>
          </Card>

        </div>
      </section>
    </>
  );
}

function TicketRow({
  ticket,
  onResend,
  onWhatsApp,
  onDelete,
}: {
  ticket: StoredTicket;
  onResend: (t: StoredTicket) => void;
  onWhatsApp: (t: StoredTicket) => void;
  onDelete: (t: StoredTicket) => void;
}) {
  return (
    <li className="rounded-2xl border border-[var(--color-line)] p-3 flex flex-wrap items-start gap-3 min-w-0">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-[var(--color-ink)] break-words">{ticket.title || "Demande"}</span>
          <Badge tone={getTicketStatusTone(ticket.status)}>{getTicketStatusLabel(ticket.status)}</Badge>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-0.5 break-words">
          {getTicketLabel(ticket.source)} · Réf. {ticket.ref} · {formatDateFR(ticket.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onResend(ticket)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold border border-[var(--color-line)] hover:border-[var(--color-citron)] bg-white text-[var(--color-ink)] whitespace-nowrap"
          title="Envoyer à nouveau"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Renvoyer
        </button>
        <button
          type="button"
          onClick={() => onWhatsApp(ticket)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-[linear-gradient(135deg,#8B4515,#5C2E0C)] text-white hover:brightness-110 whitespace-nowrap"
          title="Renvoyer sur WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => onDelete(ticket)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--color-line)] hover:border-red-300 bg-white text-[var(--color-ink-soft)] shrink-0"
          title="Retirer de la liste"
          aria-label="Supprimer"
        >
          ×
        </button>
      </div>
    </li>
  );
}
