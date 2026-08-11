import { useEffect, useState } from "react";
import { CloudOff, RefreshCcw, Wifi } from "lucide-react";
import { cn } from "@/utils/cn";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { countPendingTickets } from "@/utils/tickets";
import { syncPendingTickets } from "@/utils/sync";

type Size = "sm" | "md";

type Props = {
  /** taille visuelle de l'icône (sm = header mobile, md = header desktop) */
  size?: Size;
  /** affiche aussi le libellé texte à côté de l'icône */
  withLabel?: boolean;
  className?: string;
};

/**
 * Pastille de statut de connexion, affichée dans le header.
 * - Pastille verte + icône Wifi quand on est en ligne et tout est synchronisé.
 * - Pastille orange + icône Wifi + badge "pending" quand on est en ligne mais
 *   qu'il reste des demandes locales à renvoyer vers le serveur.
 * - Pastille rouge + icône CloudOff + badge "pending" quand on est hors-ligne.
 *
 * Un clic déclenche une resynchronisation immédiate (utile quand on revient
 * d'un mode hors-ligne).
 */
export function ConnectionStatusIcon({ size = "md", withLabel = true, className }: Props) {
  const online = useOnlineStatus();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const refresh = () => setPending(countPendingTickets());
    refresh();
    const id = window.setInterval(refresh, 4000);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const isStale = online && pending > 0;
  const tone: "online" | "stale" | "offline" = !online ? "offline" : isStale ? "stale" : "online";

  const toneStyles: Record<typeof tone, { dot: string; icon: string; label: string }> = {
    online: {
      dot: "bg-[var(--color-citron)]",
      icon: "text-[var(--color-citron)]",
      label: "Connecté — tout est prêt",
    },
    stale: {
      dot: "bg-[var(--color-saffron)]",
      icon: "text-[var(--color-orange)]",
      label: `Connecté — ${pending} demande${pending > 1 ? "s" : ""} à envoyer`,
    },
    offline: {
      dot: "bg-[var(--color-citron)]",
      icon: "text-[var(--color-citron)]",
      label: pending > 0
        ? `Hors-ligne — ${pending} demande${pending > 1 ? "s" : ""} en attente`
        : "Hors-ligne",
    },
  };

  const style = toneStyles[tone];
  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = size === "sm" ? "w-4 h-4" : "w-[18px] h-[18px]";

  const onClick = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await syncPendingTickets();
      setPending(countPendingTickets());
      if (result.synced > 0 || result.failed > 0) {
        // micro-feedback visuel : le label change déjà, le rafraichira tout seul
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={style.label}
      aria-label={style.label}
      className={cn(
        "group relative inline-flex items-center justify-center rounded-full border border-[var(--color-line)] bg-white/85 hover:border-[var(--color-citron)] hover:bg-white transition-all",
        dim,
        className,
      )}
    >
      <span className="relative flex items-center justify-center">
        {tone === "offline" ? (
          <CloudOff className={cn(iconSize, style.icon)} aria-hidden="true" />
        ) : syncing ? (
          <RefreshCcw className={cn(iconSize, "animate-spin text-[var(--color-ink-soft)]")} aria-hidden="true" />
        ) : (
          <Wifi className={cn(iconSize, style.icon)} aria-hidden="true" />
        )}
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white",
            style.dot,
          )}
          aria-hidden="true"
        />
      </span>
      {withLabel ? (
        <span
          className={cn(
            "ml-2 pr-2 text-[12px] font-semibold",
            tone === "offline" ? "text-[var(--color-citron)]" : tone === "stale" ? "text-[var(--color-orange)]" : "text-[var(--color-ink)]",
          )}
        >
          {tone === "offline" ? "Hors-ligne" : tone === "stale" ? `À envoyer (${pending})` : "En ligne"}
        </span>
      ) : null}
      {pending > 0 ? (
        <span
          className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-orange)] text-white text-[10px] font-bold inline-flex items-center justify-center"
          aria-hidden="true"
        >
          {pending}
        </span>
      ) : null}
    </button>
  );
}
