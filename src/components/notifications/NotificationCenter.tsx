import { useEffect } from "react";
import { NotificationHub } from "./NotificationHub";

export function NotificationCenter({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-2 py-2 sm:items-start sm:justify-end sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Centre d'alertes"
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
      />
      <div className="relative w-full sm:ml-auto sm:max-w-[640px] bg-[var(--color-cream)] shadow-2xl flex flex-col rounded-[2rem] sm:rounded-[2.2rem] overflow-hidden h-[calc(100dvh-1rem)] sm:h-[calc(100dvh-2rem)] max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)]">
        <NotificationHub variant="drawer" onRequestClose={onClose} />
      </div>
    </div>
  );
}
