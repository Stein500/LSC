import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCheck, Search, Sparkles, Inbox } from "lucide-react";
import { Sticker, type StickerName } from "@/components/ui/Sticker";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/cn";
import { useNotifications, type NotificationItem as Item } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";

export type NotificationHubVariant = "page" | "drawer";

type FilterKey = "all" | "unread" | "precommande" | "formation" | "contact" | "install" | "mood";

type MoodCard = {
  key: string;
  title: string;
  text: string;
  accent: "citron" | "orange" | "rose" | "nuit";
  sticker: StickerName;
  stamp: string;
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Tout" },
  { key: "unread", label: "À lire" },
  { key: "precommande", label: "Pré-commandes" },
  { key: "formation", label: "Formations" },
  { key: "contact", label: "Contacts" },
  { key: "mood", label: "Ambiance" },
];

const CATEGORY_LABELS: Record<string, string> = {
  precommande: "Pré-commande",
  formation: "Formation",
  contact: "Contact",
  install: "Accueil",
  system: "Atelier",
  mood: "Ambiance",
};

const MOOD_BY_HOUR = [
  {
    from: 5,
    to: 11,
    title: "Bonjour tout doux",
    text: "Les Services Colombes ouvre la journée avec une note claire, un petit mot tendre, et le bon rythme pour avancer avec grâce.",
    accent: "citron",
    sticker: "spool",
    stamp: "Matin",
  },
  {
    from: 11,
    to: 17,
    title: "Belle cadence",
    text: "Les Services Colombes garde le cap avec calme, précision et une touche de grâce.",
    accent: "orange",
    sticker: "fabric",
    stamp: "Midi",
  },
  {
    from: 17,
    to: 22,
    title: "Douce soirée",
    text: "Une ambiance plus feutrée pour relire vos messages, souffler un peu, puis reprendre la main quand il faut.",
    accent: "rose",
    sticker: "mannequin",
    stamp: "Soir",
  },
  {
    from: 22,
    to: 24,
    title: "Veillée tranquille",
    text: "Les alertes se font discrètes, mais vos demandes restent bien rangées pour la suite.",
    accent: "nuit",
    sticker: "thread",
    stamp: "Nuit",
  },
  {
    from: 0,
    to: 5,
    title: "Nuit paisible",
    text: "Les Services Colombes garde une atmosphère calme ici. Vos messages attendent sagement le prochain regard.",
    accent: "nuit",
    sticker: "button",
    stamp: "Nuit",
  },
] as const;

export function NotificationHub({
  variant = "page",
  onRequestClose,
}: {
  variant?: NotificationHubVariant;
  onRequestClose?: () => void;
}) {
  const navigate = useNavigate();
  const { items, unread, markRead, markAllRead, remove, clear } = useNotifications();
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((v) => v + 1), 15 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const moodCards = useMemo(() => buildMoodCards(new Date(), 3), [tick]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const key = inferCategory(item);
      const matchesFilter = filter === "all" ? true : filter === "unread" ? !item.read : key === filter;
      if (!matchesFilter) return false;
      if (!q) return true;
      const haystack = [item.title, item.description, item.category, item.icon, key, item.metadata ? JSON.stringify(item.metadata) : ""]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, filter, query]);

  const sectionTitle = variant === "drawer" ? "Alertes" : "Mes notifications";
  const subtitle = unread > 0 ? `${unread} alerte${unread > 1 ? "s" : ""} à lire` : "Tout est calme et bien rangé";

  if (variant === "drawer") {
    return (
      <div className="flex h-full min-h-0 flex-col gap-3 p-2 sm:p-3">
        <div className="shrink-0 rounded-[2rem] border border-[var(--color-line)] bg-white shadow-sm min-w-0 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)] mb-2">Carnet doux</p>
              <h2 className="text-2xl sm:text-3xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                {sectionTitle}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">{subtitle}</p>
            </div>

            <div className="flex items-center gap-2 self-start">
              <button
                type="button"
                onClick={markAllRead}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-citron)]"
              >
                <CheckCheck className="h-4 w-4" /> Tout lire
              </button>
              <button
                type="button"
                onClick={onRequestClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:border-[var(--color-citron)]"
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col rounded-[2rem] border border-[var(--color-line)] bg-white shadow-sm overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth">
            {visible.length === 0 ? (
              <EmptyState onClear={items.length > 0 ? clear : undefined} onClose={onRequestClose} />
            ) : (
              <div className="divide-y divide-[var(--color-line)] min-w-0">
                {visible.map((item) => (
                  <NotificationItem
                    key={item.id}
                    item={item}
                    onMarkRead={() => markRead(item.id)}
                    onRemove={() => remove(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-1 pb-1 pt-0">
          <button
            type="button"
            onClick={() => clear()}
            className="text-xs font-medium text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Tout effacer
          </button>
          <p className="text-xs text-[var(--color-muted)]">Glissez verticalement pour lire vos alertes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-6")}>
      <div className="rounded-[2rem] border border-[var(--color-line)] bg-white shadow-sm min-w-0 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)] mb-2">Carnet doux</p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              {sectionTitle}
            </h2>
            <p className="mt-2 text-sm md:text-base text-[var(--color-ink-soft)]">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 self-start">
            <button
              type="button"
              onClick={markAllRead}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] bg-white px-3.5 py-2 text-xs font-semibold text-[var(--color-ink)] hover:border-[var(--color-citron)]"
            >
              <CheckCheck className="h-4 w-4" /> Tout lire
            </button>
          </div>
        </div>

        {variant === "page" ? (
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {moodCards.map((mood) => (
                <MoodCard key={mood.key} mood={mood} />
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                    filter === f.key
                      ? "bg-[var(--color-ink)] text-white"
                      : "border border-[var(--color-line)] bg-[var(--color-cream)]/40 text-[var(--color-ink)] hover:border-[var(--color-citron)] hover:bg-white",
                  )}
                >
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="rounded-full px-4 py-2 text-xs font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              >
                Réinitialiser
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <label className="relative block flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher une notification..."
                  className="w-full rounded-full border border-[var(--color-line)] bg-white py-3 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-[var(--color-muted)] focus:border-[var(--color-citron)]"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--color-muted)]">
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-citron)]/15 px-3 py-1.5 text-[var(--color-ink)]">
                  <Sparkles className="h-3.5 w-3.5" /> {items.length} au total
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-orange)]/10 px-3 py-1.5 text-[var(--color-ink)]">
                  {unread} à lire
                </span>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <div className={cn("rounded-[2rem] border border-[var(--color-line)] bg-white shadow-sm overflow-hidden min-w-0 flex-1 min-h-0")}>
        {visible.length === 0 ? (
          <EmptyState onClear={items.length > 0 ? clear : undefined} onClose={onRequestClose} />
        ) : (
          <div className="divide-y divide-[var(--color-line)] min-w-0">
            {visible.map((item) => (
              <NotificationItem
                key={item.id}
                item={item}
                onMarkRead={() => markRead(item.id)}
                onRemove={() => remove(item.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
        <p className="min-w-0">Les alertes restent ici tant que vous les gardez.</p>
        <button
          type="button"
          onClick={() => navigate("/parametres")}
          className="inline-flex items-center gap-1 font-semibold text-[var(--color-orange)] hover:underline whitespace-nowrap"
        >
          Aller aux paramètres <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function inferCategory(item: Item): FilterKey {
  const raw = String(item.category || item.metadata?.source || item.metadata?.kind || "").toLowerCase();
  if (raw.includes("precommande")) return "precommande";
  if (raw.includes("formation")) return "formation";
  if (raw.includes("contact")) return "contact";
  if (raw.includes("install")) return "install";
  if (raw.includes("mood")) return "mood";
  if (item.title.toLowerCase().includes("pré-commande")) return "precommande";
  if (item.title.toLowerCase().includes("formation")) return "formation";
  if (item.title.toLowerCase().includes("message")) return "contact";
  return "mood";
}


function buildMoodCards(now: Date, count = 3): MoodCard[] {
  const hour = now.getHours();
  const base = MOOD_BY_HOUR.find((m) => hour >= m.from && hour < m.to) || MOOD_BY_HOUR[0];
  const today = now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const variants: MoodCard[] = [
    {
      key: `${base.stamp}-1`,
      title: base.title,
      text: base.text,
      accent: base.accent,
      sticker: base.sticker,
      stamp: today,
    },
    {
      key: `${base.stamp}-2`,
      title: hour < 12 ? "Petit mot chic" : hour < 18 ? "Belle respiration" : "Douce finition",
      text: hour < 12
        ? "Un ton tendre pour accueillir les demandes sans brusquerie, avec une belle lisibilité sur mobile."
        : hour < 18
          ? "Les Services Colombes garde le fil des messages, puis ajuste avec calme quand il faut."
          : "Les alertes se rangent gentiment pour laisser la place à une soirée légère.",
      accent: base.accent === "orange" ? "citron" : "orange",
      sticker: hour < 12 ? "button" : hour < 18 ? "pagne" : "thread",
      stamp: "Rafraîchissement",
    },
    {
      key: `${base.stamp}-3`,
      title: "Rappel tendre",
      text: "Les Services Colombes revient avec une présentation simple, féminine et très claire.",
      accent: "rose",
      sticker: "mannequin",
      stamp: "Tonalité",
    },
  ];
  return variants.slice(0, count);
}

function MoodCard({ mood }: { mood: MoodCard }) {
  const palette = {
    citron: "bg-[var(--color-citron)]/20 text-[var(--color-ink)] border-[var(--color-citron)]/30",
    orange: "bg-[var(--color-orange)]/12 text-[var(--color-ink)] border-[var(--color-orange)]/25",
    rose: "bg-pink-100 text-[var(--color-ink)] border-pink-200",
    nuit: "bg-[var(--color-rose-soft)] text-[var(--color-ink)] border-[var(--color-line)]",
  } as const;

  return (
    <div className={cn("rounded-[1.75rem] border p-4 shadow-sm", palette[mood.accent])}>
      <div className="flex items-start gap-3">
        <Sticker name={mood.sticker} size={46} className="shrink-0 text-[var(--color-orange)]" title={mood.title} />
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-[0.22em] opacity-70">{mood.stamp}</p>
          <h3 className="mt-1 text-base font-bold" style={{ fontFamily: "var(--font-display)" }}>{mood.title}</h3>
          <p className="mt-1.5 text-sm leading-6 opacity-90">{mood.text}</p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onClear, onClose }: { onClear?: () => void; onClose?: () => void }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-citron)]/20">
        <Inbox className="h-9 w-9 text-[var(--color-orange)]" />
      </div>
      <p className="text-lg font-bold" style={{ fontFamily: "var(--font-display)" }}>Aucune alerte pour le moment</p>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--color-ink-soft)] break-words">
        Vos messages s’affichent ici avec douceur. Dès qu’une demande ou une réponse arrive, elle prend sa place dans ce petit carnet.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        {onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-[var(--color-line)] bg-white px-4 py-2 text-sm font-semibold hover:border-[var(--color-citron)]"
          >
            Vider la liste
          </button>
        ) : null}
        {onClose ? (
          <Button variant="secondary" onClick={onClose}>
            Fermer
          </Button>
        ) : null}
      </div>
    </div>
  );
}
