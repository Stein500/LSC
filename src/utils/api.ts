/**
 * API client — envoie tout vers /api/track (back-end partagé).
 *
 * Le back-end route automatiquement vers l'onglet Google Sheets
 * selon `sheet` (ou selon `event` si `sheet` absent) et envoie
 * un mail SMTP pour les events "_submit".
 *
 * Helpers exposés :
 *   - trackPageView / trackCtaClick / trackWhatsapp / trackPhone
 *   - trackFormStart / trackFormSubmit / trackFormError
 *   - trackInstall (install_pwa_*)
 *   - trackSessionStart / trackSessionEnd  → onglet Sessions
 *   - trackScrollDepth                      → onglet ScrollDepth
 *   - trackOutboundClick                    → onglet OutboundLinks
 *   - trackError                            → onglet Errors
 *   - trackPwa                             → onglet PWA
 *   - trackEngagement                       → onglet Engagement
 */

import { env } from "./env";

export type SubmissionPdfResponse = {
  ok: boolean;
  base64: string;
  filename: string;
  mimeType?: string;
};

export type SubmissionResponse = {
  ok: boolean;
  ref?: string;
  message?: string;
  pdf?: SubmissionPdfResponse;
  [key: string]: unknown;
};

export type SheetName =
  | "Events"
  | "PageViews"
  | "Clicks"
  | "Forms"
  | "Installs"
  | "Formations"
  | "Precommandes"
  | "Contacts"
  | "Sessions"
  | "Errors"
  | "PWA"
  | "ScrollDepth"
  | "OutboundLinks"
  | "Engagement";

export type TrackPayload = {
  event: string;
  sheet?: SheetName;
  source?: string;
  sessionId?: string;
  path?: string;
  ref?: string;
  status?: "ok" | "error" | number;
  [key: string]: any;
};

// =============================================================
// Session unique par onglet (sessionStorage)
// =============================================================
const SESSION_STORAGE_KEY = "clb_sid";
const SESSION_META_KEY = "clb_sid_meta";

let _sessionId: string | null = null;
let _sessionStartedAt: number | null = null;

export function getSessionId(): string {
  if (_sessionId) return _sessionId;
  try {
    const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existing) {
      _sessionId = existing;
      const meta = Number(sessionStorage.getItem(SESSION_META_KEY));
      _sessionStartedAt = _sessionStartedAt ?? (Number.isFinite(meta) && meta > 0 ? meta : Date.now());
      return existing;
    }
  } catch {}
  const sid = `clb_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, sid);
    sessionStorage.setItem(SESSION_META_KEY, String(Date.now()));
  } catch {}
  _sessionId = sid;
  _sessionStartedAt = Date.now();
  return sid;
}

export function getSessionStartedAt(): number {
  if (_sessionStartedAt) return _sessionStartedAt;
  try {
    const v = Number(sessionStorage.getItem(SESSION_META_KEY));
    if (Number.isFinite(v) && v > 0) {
      _sessionStartedAt = v;
      return v;
    }
  } catch {}
  _sessionStartedAt = Date.now();
  return _sessionStartedAt;
}

// =============================================================
// Device / browser / language sniffing (une fois par session)
// =============================================================
function detectDevice() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  if (/Windows/i.test(ua)) return "windows";
  if (/Mac OS X/i.test(ua)) return "mac";
  if (/Linux/i.test(ua)) return "linux";
  return "other";
}

function detectBrowser() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/Edg\//.test(ua)) return "edge";
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return "chrome";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "safari";
  if (/OPR\//.test(ua)) return "opera";
  return "other";
}

function detectLang() {
  if (typeof navigator === "undefined") return "fr";
  return (navigator.language || "fr").slice(0, 5);
}

function detectPlatform() {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent || "";
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/CrOS/.test(ua)) return "chromeos";
  return "web";
}

// =============================================================
// Compteur de pages vues (par session)
// =============================================================
const PAGE_VIEW_COUNT_KEY = "clb_pageviews";
export function getSessionPageViews(): number {
  try {
    return Number(sessionStorage.getItem(PAGE_VIEW_COUNT_KEY) || "0");
  } catch {
    return 0;
  }
}
export function bumpSessionPageViews(): number {
  const next = getSessionPageViews() + 1;
  try {
    sessionStorage.setItem(PAGE_VIEW_COUNT_KEY, String(next));
  } catch {}
  return next;
}

// =============================================================
// Envoi générique
// =============================================================

/**
 * Envoi "fire and forget" vers le back-end. Ne lève jamais d'erreur
 * pour ne pas casser l'UX. Log en dev uniquement.
 */
export async function track(payload: TrackPayload): Promise<SubmissionResponse | null> {
  if (!env.apiUrl) {
    if (import.meta.env.DEV) console.warn("[track] no apiUrl", payload);
    return null;
  }

  const body = {
    ...payload,
    source: payload.source ?? env.sourceId,
    sessionId: payload.sessionId ?? getSessionId(),
    path: payload.path ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    timestamp: new Date().toISOString(),
    // Discriminant côté Sheets : on envoie `atelier`, le back accepte
    // aussi `school` en rétrocompat au cas où.
    atelier: env.sourceId,
  };

  try {
    // On privilégie fetch (qui permet les headers x-api-token),
    // sendBeacon ne les supporte pas — d'où des envois rejetés silencieusement.
    const response = await fetch(env.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-token": env.apiToken,
      },
      body: JSON.stringify(body),
      keepalive: true,
    });
    if (!response.ok) return null;
    return (await response.json()) as SubmissionResponse;
  } catch (err) {
    // Fallback sur sendBeacon uniquement si fetch échoue (rare)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(body)], { type: "application/json" });
        navigator.sendBeacon(env.apiUrl, blob);
      } catch {}
    }
    if (import.meta.env.DEV) console.warn("[track] failed", err, payload);
    return null;
  }
}

// =============================================================
// Helpers "courants" — exports de base
// =============================================================

export const trackPageView = (path: string) => {
  const pages = bumpSessionPageViews();
  return track({
    event: "page_view",
    sheet: "PageViews",
    path,
    pageViews: pages,
  });
};

export const trackCtaClick = (label: string, href?: string) =>
  track({ event: "cta_click", sheet: "Clicks", label, href });

export const trackWhatsapp = (context: string) =>
  track({ event: "whatsapp_click", sheet: "Clicks", context });

export const trackPhone = (number: string) =>
  track({ event: "phone_click", sheet: "Clicks", number });

export const trackFormStart = (form: string) =>
  track({ event: "form_start", sheet: "Forms", form });

export const trackFormStep = (form: string, step: string, value?: string) =>
  track({ event: "form_step", sheet: "Forms", form, stage: step, value });

export const trackFormSubmit = (
  form: "formation" | "precommande" | "contact",
  data: Record<string, any>,
  ref: string,
) =>
  track({
    event: `${form}_submit`,
    sheet: form === "formation" ? "Formations" : form === "precommande" ? "Precommandes" : "Contacts",
    status: "ok",
    ref,
    ...data,
  });

export const trackFormError = (form: string, error: string, stage?: string) =>
  track({ event: "form_api_error", sheet: "Forms", form, stage, error });

export const trackInstall = (stage: "prompt" | "accept" | "dismiss") =>
  track({ event: `install_pwa_${stage}`, sheet: "Installs", platform: detectPlatform() });

// =============================================================
// Sessions — durée, fin, page visible / cachée
// =============================================================

export const trackSessionStart = () => {
  const sid = getSessionId();
  return track({
    event: "session_start",
    sheet: "Sessions",
    sessionId: sid,
    device: detectDevice(),
    browser: detectBrowser(),
    lang: detectLang(),
    online: typeof navigator !== "undefined" ? navigator.onLine : true,
  });
};

export const trackSessionEnd = (extra: { exitPath?: string; pages?: number } = {}) => {
  const started = getSessionStartedAt();
  const durationSec = Math.max(0, Math.round((Date.now() - started) / 1000));
  return track({
    event: "session_end",
    sheet: "Sessions",
    duration: durationSec,
    duration_seconds: durationSec,
    exitPath: extra.exitPath ?? (typeof window !== "undefined" ? window.location.pathname : ""),
    pages: extra.pages ?? getSessionPageViews(),
  });
};

export const trackPageHidden = () => track({ event: "page_hidden", sheet: "Sessions" });
export const trackPageVisible = () => track({ event: "page_visible", sheet: "Sessions" });

// =============================================================
// Erreurs runtime (JS, API, React)
// =============================================================

export const trackJsError = (message: string, stack?: string, category: string = "runtime") =>
  track({
    event: "js_error",
    sheet: "Errors",
    category,
    message,
    stack: stack?.slice(0, 1800), // évite de saturer Sheets
  });

export const trackApiError = (url: string, message: string, status?: number) =>
  track({
    event: "api_error",
    sheet: "Errors",
    category: "api",
    message,
    url,
    status,
  });

// =============================================================
// Profondeur de scroll (par paliers)
// =============================================================
const SCROLL_KEY = "clb_scroll_max";
const SCROLL_MILESTONES = [25, 50, 75, 100];

export function trackScrollDepthOnce() {
  if (typeof window === "undefined") return;
  const started = getSessionStartedAt();
  let lastReported = 0;
  const stored = Number(sessionStorage.getItem(SCROLL_KEY) || "0");
  if (Number.isFinite(stored)) lastReported = stored;

  let raf: number | null = null;
  let maxDepth = lastReported;

  const report = (depth: number, milestone: number) => {
    track({
      event: "scroll_depth",
      sheet: "ScrollDepth",
      maxDepth: depth,
      percentage: depth,
      milestone,
    });
  };

  const compute = () => {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const viewport = window.innerHeight;
    const fullHeight = doc.scrollHeight;
    const scrollable = Math.max(1, fullHeight - viewport);
    const pct = Math.min(100, Math.max(0, Math.round((scrollTop / scrollable) * 100)));
    if (pct > maxDepth) {
      maxDepth = pct;
      try { sessionStorage.setItem(SCROLL_KEY, String(maxDepth)); } catch {}
      // Trouve le palier le plus haut franchi et le log s'il a changé
      const nextMilestone = SCROLL_MILESTONES.filter((m) => maxDepth >= m).pop() || 0;
      const lastMilestone = SCROLL_MILESTONES.filter((m) => lastReported >= m).pop() || 0;
      if (nextMilestone > lastMilestone) {
        report(maxDepth, nextMilestone);
      }
      lastReported = maxDepth;
    }
  };

  const onScroll = () => {
    if (raf != null) return;
    raf = requestAnimationFrame(() => {
      compute();
      raf = null;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  // Cleanup via AbortController exposé au hook
  return () => {
    window.removeEventListener("scroll", onScroll);
    if (raf != null) cancelAnimationFrame(raf);
  };
}

// =============================================================
// Liens sortants
// =============================================================
export const trackOutboundClick = (label: string, url: string, type: string = "external") =>
  track({ event: "outbound_click", sheet: "OutboundLinks", label, url, type });

// =============================================================
// PWA — événements runtime (install, update, etc.)
// =============================================================
export const trackPwa = (
  stage: string,
  options: { shown?: boolean; action?: string } = {},
) =>
  track({
    event: "pwa_event",
    sheet: "PWA",
    stage,
    platform: detectPlatform(),
    shown: options.shown ?? false,
    action: options.action ?? "",
  });

// =============================================================
// Engagement — vidéo, focus, copy, download
// =============================================================
export const trackEngagement = (
  type: "video_play" | "video_pause" | "video_complete" | "tab_focus" | "tab_blur" | "copy_clipboard" | "download_file",
  context: string,
  value?: string | number,
) =>
  track({ event: type, sheet: "Engagement", context, value: value ?? "" });

// =============================================================
// Installer global error listener — à appeler UNE FOIS au boot
// =============================================================
let _errorWired = false;
export function installGlobalErrorTracking() {
  if (_errorWired) return;
  if (typeof window === "undefined") return;
  _errorWired = true;

  window.addEventListener("error", (e) => {
    trackJsError(e.message || "Unknown error", e.error?.stack || "", "window.error");
  });
  window.addEventListener("unhandledrejection", (e) => {
    const reason: any = e.reason;
    const msg = (reason?.message as string) || String(reason || "Unknown rejection");
    trackJsError(msg, reason?.stack, "unhandledrejection");
  });
}