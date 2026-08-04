import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Download, Info, Menu, Settings2, Tickets, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

type QuickMenuProps = {
  className?: string;
  triggerLabel?: string;
  align?: "bottom" | "top";
  buttonClassName?: string;
  triggerIcon?: LucideIcon;
};

export function QuickMenu({ className, triggerLabel = "Menu", align = "bottom", buttonClassName, triggerIcon: TriggerIcon = Menu }: QuickMenuProps) {
  const [open, setOpen] = useState(false);
  const { canInstall, promptInstall } = useInstallPrompt();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const items = useMemo(
    () => [
      canInstall
        ? {
            label: "Installer l'app",
            icon: Download,
            onClick: async () => {
              const ok = await promptInstall();
              if (ok) setOpen(false);
            },
          }
        : null,
      {
        label: "Mes notifications",
        icon: Bell,
        onClick: () => navigate("/notifications"),
      },
      {
        label: "Mes tickets",
        icon: Tickets,
        onClick: () => navigate("/tickets"),
      },
      {
        label: "Paramètres",
        icon: Settings2,
        onClick: () => navigate("/parametres"),
      },
      {
        label: "À propos",
        icon: Info,
        onClick: () => navigate("/parametres#about"),
      },
    ].filter(Boolean) as Array<{ label: string; icon: LucideIcon; onClick: () => void | Promise<void> }>,
    [canInstall, navigate, promptInstall],
  );

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border border-[var(--color-line)] bg-white/90 px-4 py-2.5 text-sm font-semibold text-[var(--color-ink)] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[var(--color-citron)] active:translate-y-0",
          open ? "bg-[var(--color-citron)]/18 border-[var(--color-citron)] shadow-md" : "",
          buttonClassName,
        )}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={triggerLabel}
      >
        <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-citron)]/20 text-[var(--color-ink)] transition-colors", open ? "bg-[var(--color-citron)] text-[var(--color-ink)]" : "")}>
          <TriggerIcon className="w-4 h-4" />
        </span>
        <span>{triggerLabel}</span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label={triggerLabel}
          className={cn(
            "absolute right-0 z-50 w-64 overflow-hidden rounded-3xl border border-[var(--color-line)] bg-white shadow-2xl",
            align === "top" ? "bottom-[calc(100%+12px)]" : "bottom-[calc(100%+12px)]",
          )}
        >
          <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">Accès rapide</p>
              <p className="text-sm font-semibold text-[var(--color-ink)]">Menu</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-2 text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-ink)]"
              aria-label="Fermer le menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2">
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={async () => {
                  await item.onClick();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-citron)]/15"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--color-citron)]/25">
                  <item.icon className="h-4 w-4" />
                </span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--color-line)] bg-[var(--color-cream)]/25 px-4 py-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-orange)] hover:underline"
              onClick={() => setOpen(false)}
            >
              Besoin d'aide ? Contactez-nous
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
