/**
 * NotificationBell.tsx
 *
 * Icône cloche + pastille de non-lus, présente dans la barre de
 * navigation. Tap → ouvre le NotificationCenter.
 */

import { useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationCenter } from "./NotificationCenter";
import { cn } from "@/utils/cn";

export function NotificationBell({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const { unread } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full border border-[var(--color-line)] bg-white/85 hover:border-[var(--color-citron)] transition-colors",
          size === "sm" ? "min-h-[44px] min-w-[44px]" : "min-h-[40px] min-w-[40px]",
          className,
        )}
        aria-label={unread > 0 ? `Alertes (${unread} non lues)` : "Alertes"}
      >
        <Bell className={size === "sm" ? "w-5 h-5" : "w-4 h-4"} />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-citron)] text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white"
            aria-hidden="true"
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      <NotificationCenter open={open} onClose={() => setOpen(false)} />
    </>
  );
}
