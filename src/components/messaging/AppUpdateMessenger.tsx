import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Smartphone, X } from "lucide-react";
import { trackCtaClick } from "@/utils/api";
import { resolveUpdateOffer, type UpdateOffer } from "@/utils/appUpdate";

/**
 * AppUpdateMessenger — le messager à trois visages 🕊️
 * ---------------------------------------------------
 * Invite à télécharger l'application mise à jour (correctifs) lorsque
 * l'application actuelle pose problème. Le messager choisit son visage
 * selon le « niveau » du visiteur — sans jamais envahir :
 *
 *   🪡 CARTE TOAST parchemin — visiteur en haut de page : la carte glisse
 *      du bas, s'explique clairement (bouton « Mettre à jour », croix),
 *      puis repart seule (~12 s).
 *   🫧 BULLE FLOTTANTE premium — visiteur descendu dans la page (en
 *      lecture : on ne couvre jamais le contenu) — pastille or/citron
 *      au-dessus du bouton WhatsApp (~60 s).
 *   📱 ICÔNE FOOTER permanente — dans le rail d'icônes (voir Footer.tsx) :
 *      toujours disponible, zéro cycle.
 *
 * Rythme : 1re apparition 2 min après l'arrivée, puis toutes les 5 min.
 * Si le visiteur ferme la carte, le messager se tait pour la session.
 * Destination : navigateur EXTERNE uniquement — l'URL n'est JAMAIS
 * affichée en clair (ni libellé, ni infobulle).
 *
 * 📱 CONTRAT app (passerelle site↔app) et VEILLE DES VERSIONS :
 *    le site interroge EN DIRECT les GitHub Releases « Colombes » —
 *    · navigateur : proposer dès qu'une release existe (lien APK direct) ;
 *    · dans l'app : proposer UNIQUEMENT si la release dépasse la version
 *      installée (ColombesApp.getAppVersion) — sinon silence radio ;
 *    · GitHub injoignable : navigateur → lien habituel ; app → silence.
 */
const FIRST_MS = 120_000; // 2 minutes
const EVERY_MS = 300_000; // 5 minutes
const TOAST_MS = 12_000; // carte visible ~12 s
const BUBBLE_MS = 60_000; // bulle visible ~60 s

type Channel = "toast" | "bubble" | null;

const EASE_COUTURE = [0.22, 1, 0.36, 1] as const;

export function AppUpdateMessenger() {
  const [channel, setChannel] = useState<Channel>(null);
  const snoozed = useRef(false); // × pressé → silence pour la session
  const timers = useRef<number[]>([]);
  const reduceMotion = useReducedMotion();
  // 🏷️ L'offre de mise à jour — undefined = vérification GitHub en cours
  const [offer, setOffer] = useState<UpdateOffer | null | undefined>(undefined);

  // 🔎 Veille live : dernière release GitHub vs version installée
  useEffect(() => {
    let live = true;
    void resolveUpdateOffer().then((o) => {
      if (live) setOffer(o);
    });
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (!offer) return; // à jour (app) ou rien à proposer → silence
    const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));
    const hide = (ms: number) => later(() => setChannel(null), ms);

    const cycle = () => {
      if (snoozed.current) return;
      // 🧭 Le visage dépend du niveau de lecture du visiteur
      const reading = window.scrollY > window.innerHeight * 0.55;
      if (reading) {
        setChannel("bubble");
        hide(BUBBLE_MS);
      } else {
        setChannel("toast");
        hide(TOAST_MS);
      }
      later(cycle, EVERY_MS);
    };

    later(cycle, FIRST_MS);
    return () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [offer]);

  /** Navigateur externe uniquement ; URL jamais affichée. */
  const openExternally = (origin: string, url: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    trackCtaClick(origin);
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) {
      e.preventDefault();
      w.opener = null;
    }
    setChannel(null);
  };

  const dismissToast = () => {
    snoozed.current = true; // on a compris, on ne dérange plus 🕊️
    setChannel(null);
  };

  // 🕊️ Silence : vérification en cours, app à jour, ou rien à proposer
  if (!offer) return null;

  return (
    <AnimatePresence>
      {/* 🪡 Visage 1 — la carte parchemin (haut de page) */}
      {channel === "toast" && (
        <motion.div
          key="app-toast"
          role="status"
          initial={reduceMotion ? { opacity: 0 } : { y: 90, opacity: 0, scale: 0.96 }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 70, opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.55, ease: EASE_COUTURE }}
          className="fixed bottom-36 md:bottom-8 inset-x-0 z-[55] flex justify-center px-4 pointer-events-none"
        >
          <div
            className="pointer-events-auto w-full max-w-sm sm:max-w-md rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_18px_50px_-12px_rgba(60,38,20,0.45)]"
            style={{
              background: "linear-gradient(135deg, #FDF8EF 0%, #F6EDD9 100%)",
              border: "2px dashed var(--color-gold-thread, #C9A87C)",
            }}
          >
            {/* Médaillon colombe */}
            <span className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-white"
              style={{ border: "2.5px solid var(--color-citron)", boxShadow: "0 4px 14px rgba(92,46,12,0.30)" }}>
              <img src="/images/logo.webp" alt="" aria-hidden="true" className="w-full h-full object-cover" loading="lazy" />
            </span>

            <span className="min-w-0 flex-1">
              <span
                className="block text-sm font-bold truncate"
                style={{ fontFamily: "var(--font-display)", color: "var(--color-marron-d, #5C2E0C)" }}
              >
                {offer.version ? `Nouvelle version v${offer.version} ✨` : "Nouvelle version de l'app ✨"}
              </span>
              <span className="block text-[11px] leading-snug" style={{ color: "#7A5F3F" }}>
                Un souci avec l'app actuelle ? La version corrigée t'attend.
              </span>
              <a
                href={offer.url}
                target="_blank"
                rel="noopener noreferrer external"
                onClick={openExternally("app_update_toast", offer.url)}
                aria-label="Mettre à jour l'application Colombes — s'ouvre dans un navigateur externe"
                className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95"
                style={{ background: "var(--color-citron)", color: "#FFFFFF", boxShadow: "0 3px 10px rgba(209,35,42,0.45)" }}
              >
                <Smartphone className="w-3.5 h-3.5" strokeWidth={2.4} aria-hidden="true" />
                {offer.version ? `Mettre à jour · v${offer.version}` : "Mettre à jour"}
              </a>
            </span>

            <button
              type="button"
              onClick={dismissToast}
              aria-label="Ne plus rappeler pour cette visite"
              className="shrink-0 self-start rounded-full p-1 transition-colors hover:bg-black/5"
              style={{ color: "#8A7355" }}
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 🫧 Visage 2 — la bulle flottante (visiteur en lecture) */}
      {channel === "bubble" && (
        <motion.a
          key="app-bubble"
          href={offer.url}
          target="_blank"
          rel="noopener noreferrer external"
          onClick={openExternally("app_update_bubble", offer.url)}
          initial={reduceMotion ? { opacity: 0 } : { y: 26, opacity: 0, scale: 0.72 }}
          animate={reduceMotion ? { opacity: 1 } : { y: 0, opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { y: 16, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 380, damping: 22 }}
          aria-label="Mettre à jour l'application Colombes — s'ouvre dans un navigateur externe"
          className="fixed right-5 bottom-40 md:bottom-24 z-30 flex items-center gap-2 rounded-full pl-3 pr-2 py-2.5"
          style={{
            background: "radial-gradient(circle at 30% 25%, #2A2A36 0%, #0B0B12 70%)",
            border: "2px solid var(--color-citron)",
            boxShadow: "0 10px 28px rgba(11,11,18,0.45), 0 0 0 2px rgba(201,168,124,0.55)",
          }}
        >
          {/* Appel doux — une seule ondulation */}
          {!reduceMotion && (
            <motion.span
              className="absolute inset-0 rounded-full"
              style={{ border: "2px solid var(--color-citron)" }}
              initial={{ opacity: 0.6, scale: 1 }}
              animate={{ opacity: 0, scale: 1.35 }}
              transition={{ duration: 1.6, repeat: 1, ease: "easeOut" }}
              aria-hidden="true"
            />
          )}
          <Smartphone className="w-5 h-5 shrink-0" strokeWidth={2.2} style={{ color: "#FF9E9E" }} aria-hidden="true" />
          <span className="text-[11px] font-extrabold tracking-wide text-white" style={{ fontFamily: "var(--font-display)" }}>
            {offer.version ? `Mise à jour v${offer.version}` : "Mettre à jour l'app"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dismissToast();
            }}
            aria-label="Fermer — ne plus rappeler pour cette visite"
            className="shrink-0 rounded-full p-1 text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </motion.a>
      )}
    </AnimatePresence>
  );
}
