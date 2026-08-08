import { useEffect, useRef, useState } from "react";

/* =============================================================
   useOnlineStatus — Stratégie v4 (tolérante)
   --------------------------------------------------------
   Problème résolu : sur certains WiFi (captifs, hôteliers,
   d'entreprise, derrière un proxy/firewall qui bloque Google),
   le probe `clients3.google.com/generate_204` échoue alors que
   le user a du réseau → le bandeau "hors-ligne" s'affiche à tort.

   Solution : on combine
   1) `navigator.onLine` (signal natif du navigateur)
   2) Un probe "first-party" vers NOTRE domaine (le plus fiable :
      on interroge `/api/ping` qui existe déjà sur le site, et
      `/favicon.ico` en fallback si pas d'API ping).
   3) Un probe cross-domain tolérant : on essaie plusieurs
      endpoints (Apple, Cloudflare, Mozilla, Google) avec un
      timeout court, et un seul succès → online.

   Si le probe échoue, on NE met PAS immédiatement offline :
   on conserve le dernier état positif et on ré-essaie. C'est
   seulement si 2-3 essais consécutifs échouent ET que
   navigator.onLine est passé à false qu'on bascule offline.

   Cela évite les faux positifs sur les réseaux restrictifs.
   ============================================================= */

const FIRST_PARTY_PROBES = ["/api/ping", "/favicon.ico"];
const CROSS_PROBES: ReadonlyArray<{ url: string; mode: RequestMode }> = [
  // generate_204 : Apple/Cloudflare
  { url: "https://captive.apple.com/generate_204", mode: "no-cors" },
  // Mozilla
  { url: "https://detectportal.firefox.com/success.txt", mode: "no-cors" },
  // Google — gardé en dernier recours
  { url: "https://clients3.google.com/generate_204", mode: "no-cors" },
  // Cloudflare
  { url: "https://cp.cloudflare.com/generate_204", mode: "no-cors" },
];

const PROBE_TIMEOUT_MS = 2500;
const RECHECK_INTERVAL_MS = 30_000;
const MIN_RECHECK_GAP_MS = 1500;
const CONSECUTIVE_FAILS_TO_OFFLINE = 3; // tolérance anti-faux-positif

async function probeUrl(url: string, mode: RequestMode, signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      mode,
      cache: "no-store",
      credentials: "omit",
      // redirect: "manual" évite que les portails captifs qui
      // répondent par une 302 vers leur login soient comptés
      // comme un succès de connectivité.
      redirect: "manual",
      signal,
    });
    // En no-cors, res.type === "opaque" et res.status === 0 :
    // c'est OK, ça veut dire qu'on a reçu une réponse.
    if (res.type === "opaque") return true;
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Le user est "online" dès qu'UNE de ces conditions est vraie :
 * - navigator.onLine === true ET au moins un probe répond
 * - ou un probe first-party (notre domaine) répond OK
 *
 * On essaie d'abord nos propres URLs (1ère partie = fiable),
 * puis on tente les sondes cross-domain. Un seul succès suffit.
 */
async function hasInternet(): Promise<"online" | "offline" | "unknown"> {
  // 1) First-party : on interroge le site lui-même
  for (const path of FIRST_PARTY_PROBES) {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
    const ok = await probeUrl(path, "cors", controller.signal);
    clearTimeout(t);
    if (ok) return "online";
  }

  // 2) Cross-domain : un seul succès parmi la liste suffit
  const results = await Promise.all(
    CROSS_PROBES.map(async ({ url, mode }) => {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
      const ok = await probeUrl(url, mode, controller.signal);
      clearTimeout(t);
      return ok;
    })
  );
  if (results.some(Boolean)) return "online";

  return "offline";
}

export function useOnlineStatus() {
  const [online, setOnline] = useState<boolean>(() => {
    if (typeof navigator === "undefined") return true;
    return navigator.onLine;
  });

  const lastProbeRef = useRef(0);
  const failStreakRef = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;
    let timer: number | undefined;

    const refresh = async () => {
      if (cancelled) return;

      // 1) Si le navigateur dit "offline" on lui fait confiance
      //    tout de suite, pas la peine de sonder.
      const navigatorOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
      if (!navigatorOnline) {
        failStreakRef.current = CONSECUTIVE_FAILS_TO_OFFLINE;
        setOnline(false);
        lastProbeRef.current = Date.now();
        return;
      }

      // Anti-flood : on ne sonde pas plus d'une fois toutes les
      // 1.5s, sauf si c'est un événement offline.
      const now = Date.now();
      if (now - lastProbeRef.current < MIN_RECHECK_GAP_MS) return;
      lastProbeRef.current = now;

      const verdict = await hasInternet();
      if (cancelled) return;

      if (verdict === "online") {
        failStreakRef.current = 0;
        setOnline(true);
        return;
      }

      // verdict === "offline" : on incrémente le compteur d'échecs
      // consécutifs. Tant qu'on n'a pas atteint le seuil, on garde
      // le dernier état connu (souvent "online") pour éviter les
      // faux positifs sur les WiFi restrictifs.
      failStreakRef.current += 1;
      if (failStreakRef.current >= CONSECUTIVE_FAILS_TO_OFFLINE) {
        setOnline(false);
      }
    };

    const markOnline = () => {
      // Événement natif "online" → on bascule en online sans
      // attendre le probe, mais on lance quand même un refresh
      // pour confirmer.
      failStreakRef.current = 0;
      setOnline(true);
      void refresh();
    };

    const markOffline = () => {
      // Événement natif "offline" → on lui fait confiance
      // immédiatement.
      lastProbeRef.current = Date.now();
      failStreakRef.current = CONSECUTIVE_FAILS_TO_OFFLINE;
      setOnline(false);
    };

    // Premier check au montage
    void refresh();

    window.addEventListener("online", markOnline);
    window.addEventListener("offline", markOffline);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    timer = window.setInterval(refresh, RECHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (timer) window.clearInterval(timer);
      window.removeEventListener("online", markOnline);
      window.removeEventListener("offline", markOffline);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return online;
}
