import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-orange)] text-white text-xs text-center py-1.5 px-3 flex items-center justify-center gap-2 safe-top">
      <WifiOff className="w-3.5 h-3.5" />
      Vous êtes hors-ligne. Certaines fonctions sont limitées.
    </div>
  );
}