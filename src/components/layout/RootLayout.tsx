import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { MobileBottomNav } from "./MobileBottomNav";
import { WhatsAppFab } from "@/components/notifications/WhatsAppFab";
import { SmartInstallPrompt } from "@/components/notifications/SmartInstallPrompt";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { useRouteTracking } from "@/hooks/useTrack";
import { useSessionTracking } from "@/hooks/useSession";
import { useScrollMemory } from "@/hooks/useScrollMemory";
import { SplashScreen } from "@/components/pwa/SplashScreen";
import { Toaster } from "sonner";
import { SkipToContent } from "@/components/a11y/SkipToContent";
import { A11yAnnouncer } from "@/components/a11y/A11yAnnouncer";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { getPendingTickets, updateTicket } from "@/utils/tickets";
import { trackFormSubmit } from "@/utils/api";
import { onSuccessSmartToast } from "@/hooks/useSmartToasts";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { PageTransition } from "@/components/motion/PageTransition";

/**
 * Layout racine — structure globale :
 *
 *   ┌──────────────────────────────────────────┐
 *   │ SplashScreen (z-60, au-dessus de tout)    │
 *   ├──────────────────────────────────────────┤
 *   │ Nav (fixed top-0, z-40, ~64-72px)        │  ← bandeau header
 *   ├──────────────────────────────────────────┤
 *   │ OfflineBanner                            │
 *   ├──────────────────────────────────────────┤
 *   │ <main> padding-top: 80px (mobile)        │  ← ne cache RIEN
 *   │          padding-top: 88px (desktop)     │
 *   │   <Outlet/>                              │
 *   ├──────────────────────────────────────────┤
 *   │ Footer                                   │
 *   └──────────────────────────────────────────┘
 *   MobileBottomNav (fixed bottom-0)
 *   WhatsAppFAB + PWAInstallPrompt
 *
 * L'idée-clé : la Nav est `fixed` mais ne doit JAMAIS masquer le contenu
 * quand on scrolle.
 */
const NAV_PADDING = "pt-[72px] md:pt-[88px]";

export function RootLayout() {
  useRouteTracking();
  useSessionTracking();
  useScrollMemory();
  const retryingRef = useRef(false);

  useEffect(() => {
    const retryPending = async () => {
      if (retryingRef.current) return;
      if (typeof navigator !== "undefined" && !navigator.onLine) return;

      const pendingTickets = getPendingTickets();
      if (!pendingTickets.length) return;

      retryingRef.current = true;
      try {
        for (const ticket of pendingTickets) {
          try {
            const response = await trackFormSubmit(ticket.source, { ...ticket.data, ref: ticket.ref }, ticket.ref);
            if (response) {
              updateTicket(ticket.ref, { status: "synced", syncedAt: new Date().toISOString(), lastError: undefined });
              onSuccessSmartToast({
                kind: (ticket.source === "formation" || ticket.source === "precommande" || ticket.source === "contact") ? ticket.source : "contact",
                ref: ticket.ref,
                payload: ticket.data,
                formData: ticket.data as Record<string, unknown>,
                synced: true,
              });
            }
          } catch (error) {
            updateTicket(ticket.ref, { status: "error", lastError: String(error) });
          }
        }
      } finally {
        retryingRef.current = false;
      }
    };

    void retryPending();
    const onOnline = () => void retryPending();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col has-bottom-nav"
      style={{ backgroundColor: "var(--color-cream)" }}
    >
      <SkipToContent />
      <SplashScreen />
      <ScrollProgress />
      <Nav />
      <OfflineBanner />
      <main id="main-content" tabIndex={-1} className={`flex-1 ${NAV_PADDING}`}>
        <ErrorBoundary>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileBottomNav />
      <WhatsAppFab />
      <SmartInstallPrompt />
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: "16px",
            backdropFilter: "blur(8px)",
            background: "rgba(255,255,255,0.97)",
            color: "var(--color-ink, #111827)",
            fontSize: "13px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
          },
          classNames: {
            toast: "lsc-toast",
          },
        }}
      />
      <A11yAnnouncer />
    </div>
  );
}
