/**
 * NotificationItem.tsx
 *
 * Carte d'alerte avec swipe-to-dismiss, état lu/non lu et repli
 * pour garder une lecture chic et fluide.
 */

import { useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Info,
  AlertTriangle,
  AlertOctagon,
  Zap,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { Sticker, type StickerName } from "@/components/ui/Sticker";
import type { NotificationItem as Item } from "@/stores/notificationsStore";

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertOctagon,
  action: Zap,
} as const;

const COLORS = {
  success: "#10B981",
  info: "#3B82F6",
  warning: "#F59E0B",
  error: "#EF4444",
  action: "var(--color-orange, #FF6A00)",
} as const;

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function truncateText(text: string, max = 140): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function categoryLabel(item: Item): string {
  const raw = String(item.category || item.metadata?.source || item.metadata?.kind || "").toLowerCase();
  if (raw.includes("precommande")) return "Pré-commande";
  if (raw.includes("formation")) return "Formation";
  if (raw.includes("contact")) return "Contact";
  if (raw.includes("install")) return "Accueil";
  return "Atelier";
}

function stickerForItem(item: Item): { name: StickerName; label: string; rotate: number } {
  const raw = String(item.category || item.metadata?.source || item.metadata?.kind || item.type || "").toLowerCase();
  if (raw.includes("precommande")) return { name: "pagne", label: "Pré-commande", rotate: -6 };
  if (raw.includes("formation")) return { name: "mannequin", label: "Formation", rotate: 4 };
  if (raw.includes("contact")) return { name: "button", label: "Contact", rotate: -3 };
  if (raw.includes("install")) return { name: "thread", label: "Accueil", rotate: 8 };
  if (item.type === "success") return { name: "spool", label: "Bonne nouvelle", rotate: -4 };
  if (item.type === "warning") return { name: "pin", label: "Attention", rotate: 5 };
  if (item.type === "error") return { name: "scissors", label: "À corriger", rotate: 7 };
  return { name: "fabric", label: "Douceur", rotate: -5 };
}

export function NotificationItem({
  item,
  onClick,
  onMarkRead,
  onRemove,
}: {
  item: Item;
  onClick?: () => void;
  onMarkRead?: () => void;
  onRemove?: () => void;
}) {
  const Icon = ICONS[item.type] || Info;
  const color = COLORS[item.type] || COLORS.info;
  const [swipe, setSwipe] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const hasDetails = useMemo(() => Boolean(item.description || (item.actions?.length || 0) > 0 || item.metadata), [item.description, item.actions, item.metadata]);
  const sticker = useMemo(() => stickerForItem(item), [item]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }
  function onTouchMove(e: React.TouchEvent) {
    if (touchStartX.current == null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - (touchStartY.current || 0);
    if (Math.abs(dx) > Math.abs(dy)) {
      setSwipe(dx);
    }
  }
  function onTouchEnd() {
    if (swipe < -92 && onRemove) {
      onRemove();
    } else if (swipe > 92 && !item.read && onMarkRead) {
      onMarkRead();
    }
    setSwipe(0);
    touchStartX.current = null;
    touchStartY.current = null;
  }

  const clippedDescription = item.description ? truncateText(item.description, expanded ? 999 : 132) : "";

  return (
    <div
      className="relative overflow-hidden bg-white"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="absolute inset-y-0 right-0 w-28 bg-red-500/90 text-white flex items-center justify-center"
        style={{ opacity: Math.min(Math.abs(swipe) / 90, 1) }}
        aria-hidden="true"
      >
        <Trash2 className="w-4 h-4 mr-1" /> Retirer
      </div>
      <div
        className="absolute inset-y-0 left-0 w-28 bg-emerald-500/90 text-white flex items-center justify-center"
        style={{ opacity: Math.min(Math.max(swipe, 0) / 90, 1) }}
        aria-hidden="true"
      >
        <Check className="w-4 h-4 mr-1" /> Lu
      </div>

      <button
        type="button"
        onClick={() => {
          if (!item.read) onMarkRead?.();
          onClick?.();
          if (hasDetails) setExpanded((v) => !v);
        }}
        className={cn(
          "relative w-full text-left px-4 py-4 flex items-start gap-3 transition-transform min-w-0 pr-16",
          "border-b border-[var(--color-line)] last:border-b-0",
          !item.read && "bg-[var(--color-citron)]/8",
        )}
        style={{ transform: `translateX(${swipe}px)`, touchAction: "pan-y" }}
      >
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${color}1A`, color }}
          aria-hidden="true"
        >
          <Icon className="w-5 h-5" />
        </span>

        <Sticker
          name={sticker.name}
          size={30}
          rotate={sticker.rotate}
          title={sticker.label}
          className="absolute right-3 top-3 text-[var(--color-orange)] opacity-85 drop-shadow-sm pointer-events-none"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <p className={cn("text-sm break-words", !item.read ? "font-semibold" : "font-medium")}>{item.title}</p>
            {!item.read && <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: color }} aria-label="Non lu" />}
            <span className="rounded-full bg-[var(--color-cream)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-soft)]">
              {categoryLabel(item)}
            </span>
          </div>

          {clippedDescription && (
            <p className="text-sm text-[var(--color-ink-soft)] mt-1.5 leading-6 whitespace-pre-line break-words">
              {expanded ? item.description : clippedDescription}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 min-w-0">
            {(item.actions || []).slice(0, 2).map((a, i) => (
              <ActionChip key={i} action={a} />
            ))}
            {hasDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }}
                className="inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-white px-3 py-1.5 text-[11px] font-semibold text-[var(--color-ink)] hover:border-[var(--color-citron)]"
              >
                {expanded ? (
                  <><ChevronUp className="h-3.5 w-3.5" /> Voir moins</>
                ) : (
                  <><ChevronDown className="h-3.5 w-3.5" /> Voir plus</>
                )}
              </button>
            )}
          </div>

          <p className="text-[10px] uppercase tracking-wider text-[var(--color-muted)] mt-2">{timeAgo(item.createdAt)}</p>
        </div>
      </button>
    </div>
  );
}

function ActionChip({
  action,
}: {
  action: { label: string; href?: string; onClick?: () => void; variant?: "primary" | "ghost" };
}) {
  const className = cn(
    "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors",
    action.variant === "primary"
      ? "bg-[var(--color-citron)] text-[var(--color-ink)] hover:bg-[var(--color-citron-d)]"
      : "border border-[var(--color-line)] bg-white text-[var(--color-ink)] hover:border-[var(--color-citron)]",
  );
  if (action.href) {
    return (
      <a
        href={action.href}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          action.onClick?.();
        }}
      >
        {action.label}
        {action.href.startsWith("http") && <ExternalLink className="w-3 h-3" />}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.stopPropagation();
        action.onClick?.();
      }}
    >
      {action.label}
    </button>
  );
}
