import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Bell,
  Download,
  LaptopMinimal,
  MessageCircle,
  Moon,
  RotateCw,
  Settings2,
  Smartphone,
  Sun,
  Ticket,
} from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CONTACT } from "@/data/content";
import { env } from "@/utils/env";
import {
  countPendingTickets,
  clearTickets,
  deleteTicket,
  getTicketLabel,
  getTicketStatusLabel,
  getTickets,
  openTicketWhatsApp,
  TICKET_SOURCE_EMOJI,
  type StoredTicket,
  type TicketStatus,
} from "@/utils/tickets";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useTheme, type ThemeMode } from "@/hooks/useTheme";
import { useNotifications } from "@/hooks/useNotifications";
import { syncPendingTickets } from "@/utils/sync";
import { notify } from "@/utils/notify";
import { formatDateFR } from "@/utils/format";
import { isColombesApp, colombesAppVersion } from "@/utils/appBridge";
import { resolveUpdateOffer, type UpdateOffer } from "@/utils/appUpdate";
import { useInstallPrompt, isAppleTouch } from "@/hooks/useInstallPrompt";
import { installAtelier } from "@/utils/install";

/**
 * Paramètres — le comptoir des réglages de la maison 🪡
 * ------------------------------------------------------
 * Refondu pour être lu d'un coup d'œil :
 *   🩺 « Mon atelier en pleine forme » — trois voyants qui vérifient
 *        EN DIRECT la boutique (mails, tableau Google, réglages) ;
 *   🌗 le thème, 🧵 les demandes à renvoyer, 📮 les alertes,
 *   📍 les repères utiles. Toujours la palette de la maison.
 */

const STATUS_DOT: Record<TicketStatus, string> = {
  synced: "bg-[var(--color-feuille-f,#558B2F)]",
  pending: "bg-[#F4B860]",
  error: "bg-[#D1232A]",
};

export default function Parametres() {
  const { items: notifications, unread, clear: clearAll } = useNotifications();
  const online = useOnlineStatus();
  const { mode, setMode } = useTheme();
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const pending = useMemo(() => countPendingTickets(), [refreshKey]);
  const tickets = useMemo(() => getTickets(), [refreshKey]);

  // 📱 Pastille version — visible uniquement dans l'app Colombes.
  const inApp = isColombesApp();
  const [appUpdate, setAppUpdate] = useState<UpdateOffer | null | undefined>(undefined);
  useEffect(() => {
    if (!inApp) return;
    let live = true;
    void resolveUpdateOffer().then((o) => {
      if (live) setAppUpdate(o);
    });
    return () => {
      live = false;
    };
  }, [inApp]);

  const handleResync = async () => {
    if (!online) {
      notify.error("Connexion requise pour renvoyer les demandes en route");
      return;
    }
    setSyncing(true);
    try {
      const result = await syncPendingTickets();
      setRefreshKey((v) => v + 1);
      if (result.synced > 0) {
        notify.success(
          `${result.synced} demande${result.synced > 1 ? "s" : ""} bien reçue${result.synced > 1 ? "s" : ""} à l'atelier ✔`,
        );
      } else if (result.total === 0) {
        notify.info("Tout est déjà cousu — rien à renvoyer");
      } else {
        notify.error("Certaines demandes attendent encore un meilleur fil (connexion ou réglages)");
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <>
      <SEO title="Paramètres" description="Réglages de l'atelier, santé de la boutique en direct, alertes et repères utiles." path="/parametres" />
      <PageHero
        title="Paramètres"
        subtitle="Le comptoir des réglages — la santé de la boutique vérifiée en direct, les demandes sous la main, les alertes en douceur."
        image="/images/hero-contact.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Paramètres" }]}
      />

      <section className="py-12 md:py-16 bg-[var(--color-cream,#FBE7EB)]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionTitle
            eyebrow="Votre atelier"
            title={<>Réglages <span style={{ color: "var(--color-orange)" }}>de la maison</span></>}
          />

          {/* 🩺 LA SANTÉ DE LA BOUTIQUE — EN DIRECT */}
          <SanteCard />

          <div className="grid lg:grid-cols-2 gap-4">
            <Card className="p-6 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Apparence</p>
                  <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Thème d'affichage</h3>
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
                          ? "border-[var(--color-feuille,#7CBA45)] bg-[var(--color-feuille-doux,#EFF7E3)] shadow-sm"
                          : "border-[var(--color-line)] bg-white hover:border-[var(--color-gold-thread,#C9A87C)]")
                      )}
                      aria-pressed={active}
                    >
                      <span className={(
                        "flex h-10 w-10 items-center justify-center rounded-2xl " +
                        (active ? "bg-[var(--color-feuille,#7CBA45)]/25" : "bg-black/5")
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

            {/* 📱 Carte version — rendue uniquement dans l'app Colombes */}
            {inApp && (
              <Card className="p-6 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Application</p>
                    <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>Version Colombes</h3>
                  </div>
                  <Smartphone className="w-6 h-6 text-[var(--color-orange)]" />
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="inline-flex items-center rounded-full px-4 py-2 text-sm font-extrabold tracking-wide text-white shadow-sm"
                    style={{ fontFamily: "var(--font-display)", background: "linear-gradient(135deg, #558B2F, #7CBA45)" }}
                  >
                    v{colombesAppVersion()}
                  </span>
                  <span className="text-sm text-[var(--color-ink-soft)]">
                    {appUpdate === undefined
                      ? "Vérification des nouveautés…"
                      : appUpdate?.version
                      ? <>Nouvelle version <strong style={{ color: "var(--color-feuille-f,#558B2F)" }}>v{appUpdate.version}</strong> disponible ✨</>
                      : "Votre app est à jour — cousue main 🕊️"}
                  </span>
                </div>
              </Card>
            )}

            {!inApp && <InstallAtelierCard />}
          </div>

          {/* 🧵 Les demandes — porte-tickets miniature */}
          <Card className="p-6 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3 min-w-0">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Mes demandes</p>
                <h3 className="text-2xl font-bold break-words" style={{ fontFamily: "var(--font-display)" }}>
                  Le porte-tickets en poche
                </h3>
              </div>
              <Ticket className="w-6 h-6 text-[var(--color-orange)]" />
            </div>
            <p className="text-sm text-[var(--color-ink-soft)] mb-4 break-words">
              {pending === 0
                ? "Tout est cousu : aucune demande n'attend de fil."
                : `${pending} demande${pending > 1 ? "s" : ""} attend${pending > 1 ? "ent" : ""} son fil — ${online ? "un geste et c'est reparti." : "dès que la connexion sourit."}`}
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
              <Link to="/tickets" className="inline-flex">
                <Button variant="secondary" size="sm" icon={<Ticket className="w-3.5 h-3.5" />}>
                  Ouvrir le porte-tickets
                </Button>
              </Link>
              {tickets.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm("Vider toute la liste des demandes ?")) return;
                    clearTickets();
                    setRefreshKey((v) => v + 1);
                    notify.success("La liste est vide — tout est rangé");
                  }}
                  className="text-xs font-semibold text-[var(--color-muted)] hover:text-[#D1232A] px-3 py-2 transition-colors"
                >
                  Vider
                </button>
              )}
            </div>

            {tickets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--color-line)] p-5 text-center text-sm text-[var(--color-muted)] break-words">
                Aucune demande pour l'instant. Vos prochains messages se coudront ici. 🎟️
              </div>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto pr-1 min-w-0">
                {tickets.slice(0, 6).map((ticket) => (
                  <MiniTicketRow
                    key={ticket.ref}
                    ticket={ticket}
                    onWhatsApp={(t) => {
                      const url = openTicketWhatsApp(t, env.whatsappGeneralRaw);
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    onDelete={(t) => {
                      if (!window.confirm(`Retirer la demande ${t.ref} ?`)) return;
                      deleteTicket(t.ref);
                      setRefreshKey((v) => v + 1);
                      notify.success("Demande retirée");
                    }}
                  />
                ))}
              </ul>
            )}
          </Card>

          {/* 📮 Alertes */}
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
                    style={{ backgroundColor: n.read ? "var(--color-muted)" : "var(--color-feuille-f,#558B2F)" }}
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
                  Aucun message pour le moment. Vos alertes s'afficheront ici avec douceur.
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-3 justify-between items-center">
              <Link to="/notifications" className="inline-flex">
                <Button variant="secondary" className="max-w-full">Voir toutes les alertes</Button>
              </Link>
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => { clearAll(); notify.info("Alertes retirées"); }}>
                  Effacer
                </Button>
              )}
            </div>
          </Card>

          {/* 📍 Repères */}
          <Card className="p-6 min-w-0" id="about">
            <SectionTitle
              align="left"
              eyebrow="Coordonnées"
              title={<>Vos <span style={{ color: "var(--color-orange)" }}>repères utiles</span></>}
            />
            <div className="grid md:grid-cols-2 gap-4 min-w-0">
              <a href={env.mapsUrl} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[var(--color-line)] p-4 hover:border-[var(--color-gold-thread,#C9A87C)] transition-colors min-w-0 bg-white">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">📍 Adresse</p>
                <p className="font-semibold">{CONTACT.location}</p>
              </a>
              <a href={`tel:${CONTACT.phone1Raw}`} className="rounded-2xl border border-[var(--color-line)] p-4 hover:border-[var(--color-gold-thread,#C9A87C)] transition-colors min-w-0 bg-white">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">📞 Téléphone</p>
                <p className="font-semibold">{CONTACT.phone1}</p>
              </a>
              <a href={`tel:${CONTACT.phone2Raw}`} className="rounded-2xl border border-[var(--color-line)] p-4 hover:border-[var(--color-gold-thread,#C9A87C)] transition-colors min-w-0 bg-white">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">📞 Téléphone 2</p>
                <p className="font-semibold">{CONTACT.phone2}</p>
              </a>
              <a href={`https://wa.me/${env.whatsappGeneralRaw}`} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-[var(--color-line)] p-4 hover:border-[var(--color-gold-thread,#C9A87C)] transition-colors min-w-0 bg-white">
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">💬 WhatsApp</p>
                <p className="font-semibold">{env.whatsappGeneral}</p>
              </a>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}

/* ============ 🩺 Mon atelier en pleine forme ============ */
type HealthChecks = {
  ok: boolean;
  checks?: {
    env?: Record<string, boolean>;
    sheets?: { ok: boolean; error?: string | null };
    smtp?: { ok: boolean; error?: string | null };
  };
};

type Voyant = {
  key: string;
  emoji: string;
  nom: string;
  ok: boolean | null;
  conseil: string;
};

function SanteCard() {
  const [voyants, setVoyants] = useState<Voyant[] | null>(null);
  const [checking, setChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const check = async (silent = false) => {
    setChecking(true);
    try {
      const res = await fetch("/api/system/health", { cache: "no-store" });
      const data = (await res.json()) as HealthChecks;
      const envOk = data.checks?.env ? Object.values(data.checks.env).every(Boolean) : false;
      const sheetsOk = !!data.checks?.sheets?.ok;
      const smtpOk = !!data.checks?.smtp?.ok;
      setVoyants([
        {
          key: "mail",
          emoji: "📮",
          nom: "Les mails de la boutique",
          ok: smtpOk,
          conseil: "Le mot de passe mail doit être refait sur Vercel — guide VERCEL_ENV, réparation B.",
        },
        {
          key: "sheets",
          emoji: "📗",
          nom: "Le tableau Google (demandes)",
          ok: sheetsOk,
          conseil: "La clé Google a glissé de son ourlet — guide VERCEL_ENV, réparation A.",
        },
        {
          key: "reglages",
          emoji: "🔐",
          nom: "Les réglages du serveur",
          ok: envOk,
          conseil: "Une variable du serveur manque à l'appel — le guide VERCEL_ENV la retrouve.",
        },
      ]);
      setLastCheck(new Date());
      if (!silent) {
        if (smtpOk && sheetsOk && envOk) notify.success("Tout file parfaitement 🕊️");
        else notify.error("Un fil demande votre attention — voyants ci-dessous.");
      }
    } catch {
      setVoyants(null);
      if (!silent) notify.error("La vérification n'a pas abouti — connexion capricieuse ?");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    void check(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allOk = voyants?.every((v) => v.ok === true) ?? false;

  return (
    <Card className="p-6 min-w-0 border-2" style={{ borderColor: allOk ? "rgba(124,186,69,0.35)" : "rgba(244,184,96,0.45)" } as React.CSSProperties}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4 min-w-0">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Santé de la boutique</p>
          <h3 className="text-2xl font-bold break-words" style={{ fontFamily: "var(--font-display)" }}>
            Mon atelier en pleine forme
          </h3>
        </div>
        <Activity className="w-6 h-6 text-[var(--color-orange)]" />
      </div>

      <p className="text-sm text-[var(--color-ink-soft)] mb-5">
        Trois fils tiennent la boutique. La vérification se fait <strong>en direct</strong>, sans rien déranger.
      </p>

      {voyants === null ? (
        <div className="rounded-2xl border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-muted)]">
          {checking ? "Vérification des fils en cours…" : "Vérification impossible pour l'instant — la connexion se recoud."}
        </div>
      ) : (
        <div className="space-y-2.5">
          {voyants.map((v) => (
            <div
              key={v.key}
              className="flex items-start gap-3 rounded-2xl border p-3.5 bg-white"
              style={{ borderColor: v.ok ? "rgba(124,186,69,0.35)" : "rgba(209,35,42,0.28)" }}
            >
              <span
                className="mt-1 w-3 h-3 rounded-full shrink-0"
                style={{ background: v.ok ? "var(--color-feuille-f,#558B2F)" : "#D1232A" }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {v.emoji} {v.nom}
                  <span className="ml-2 text-xs font-bold" style={{ color: v.ok ? "var(--color-feuille-f,#558B2F)" : "#A31322" }}>
                    {v.ok ? "parfait ✔" : "à recoudre"}
                  </span>
                </p>
                {!v.ok && (
                  <p className="text-xs text-[var(--color-muted)] mt-1">{v.conseil}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void check()}
          disabled={checking}
          className="inline-flex items-center gap-2 min-h-[44px] rounded-2xl px-4 py-2.5 text-sm font-bold border-2 border-[var(--color-line)] bg-white transition-all hover:border-[var(--color-gold-thread,#C9A87C)] disabled:opacity-60"
        >
          <RotateCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} aria-hidden="true" />
          {checking ? "Vérification…" : "Revérifier"}
        </button>
        {lastCheck && (
          <span className="text-xs text-[var(--color-muted)]">
            Dernière vérification : {lastCheck.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
      </div>
    </Card>
  );
}

/* ============ 🎟️ Ligne miniature d'un ticket ============ */
function MiniTicketRow({
  ticket,
  onWhatsApp,
  onDelete,
}: {
  ticket: StoredTicket;
  onWhatsApp: (t: StoredTicket) => void;
  onDelete: (t: StoredTicket) => void;
}) {
  return (
    <li className="rounded-2xl border border-[var(--color-line)] bg-white p-3 flex flex-wrap items-center gap-3 min-w-0">
      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[ticket.status]}`} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="font-semibold text-sm text-[var(--color-ink)] break-words">
            {TICKET_SOURCE_EMOJI[ticket.source]} {ticket.title || "Demande"}
          </span>
          <span className="text-[11px] font-bold" style={{ color: ticket.status === "synced" ? "var(--color-feuille-f,#558B2F)" : ticket.status === "error" ? "#A31322" : "#C75B12" }}>
            {getTicketStatusLabel(ticket.status)}
          </span>
        </div>
        <p className="text-xs text-[var(--color-muted)] mt-0.5 break-words">
          {getTicketLabel(ticket.source)} · Réf. {ticket.ref} · {formatDateFR(ticket.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => onWhatsApp(ticket)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-white hover:brightness-110 whitespace-nowrap"
          style={{ background: "linear-gradient(135deg,#558B2F,#7CBA45)" }}
          title="Renvoyer sur WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          WhatsApp
        </button>
        <button
          type="button"
          onClick={() => onDelete(ticket)}
          className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-[var(--color-line)] hover:border-[#D1232A] hover:text-[#D1232A] bg-white text-[var(--color-ink-soft)] shrink-0 transition-colors"
          title="Retirer de la liste"
          aria-label="Supprimer"
        >
          ×
        </button>
      </div>
    </li>
  );
}

/* ============ 🪡 Installation (web) ============ */
function InstallAtelierCard() {
  const { canInstall, isInstalled } = useInstallPrompt();

  return (
    <Card className="p-6 min-w-0">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)] mb-2">Installation</p>
          <h3 className="text-2xl font-bold" style={{ fontFamily: "var(--font-display)" }}>L'atelier dans votre poche</h3>
        </div>
        <Download className="w-6 h-6 text-[var(--color-orange)]" />
      </div>
      {isInstalled ? (
        <p className="text-sm text-[var(--color-ink-soft)]">
          Couture Colombe et Merceries est déjà installée ici — cousue main 🕊️
        </p>
      ) : (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => void installAtelier("parametres_install_card")}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.03] active:scale-95"
            style={{ background: "linear-gradient(135deg,#558B2F,#7CBA45)" }}
          >
            <Download className="w-4 h-4" strokeWidth={2.4} aria-hidden="true" />
            Installer l'atelier
          </button>
          <p className="text-sm text-[var(--color-ink-soft)]">
            {canInstall
              ? "Un geste, et l'atelier rejoint l'écran d'accueil — sans passer par un store."
              : isAppleTouch()
              ? "Bouton Partager ↑ → « Sur l'écran d'accueil » → Ajouter."
              : "Menu ⋮ du navigateur → « Installer l'application »."}
          </p>
        </div>
      )}
    </Card>
  );
}
