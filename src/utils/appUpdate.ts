/**
 * Veille des versions — le site contrôle EN DIRECT les releases « Colombes ».
 *
 * Les APK de l'app sont publiés en GitHub Releases **sur ce même dépôt**
 * (ex. « Colombes v4.2.6 » + asset `colombes-atelier-4.2.6-release.apk`).
 * Le site interroge `api.github.com` (public, sans jeton) et compare avec
 * la version installée, remontée par le pont `ColombesApp.getAppVersion()`.
 *
 * Décision de la maison :
 *   🌍 Navigateur → on propose le téléchargement dès qu'une release existe.
 *   📱 Dans l'app → on propose UNIQUEMENT si la release > version installée
 *      (sinon silence radio : l'app est à jour, rien à dire).
 *   📡 GitHub injoignable → navigateur : repli sur le lien habituel ;
 *      app : silence (on ne dérange pas pour rien).
 *
 * Budget : résultat mis en cache mémoire + sessionStorage (30 min) —
 * une seule requête réseau par visite, quoi qu'il arrive.
 */

import { env } from "./env";
import { colombesAppVersion, isColombesApp } from "./appBridge";

const REPO = env.appReleasesRepo;
const API_URL = `https://api.github.com/repos/${REPO}/releases/latest`;
const CACHE_KEY = "lsc_app_release_v1";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

export interface AppRelease {
  /** "4.2.6" (tag sans le « v ») */
  version: string;
  /** Page publique de la release */
  pageUrl: string;
  /** Lien direct de l'APK si un asset .apk est joint */
  apkUrl: string | null;
  /** Titre humain, ex. « Colombes v4.2.6 » */
  name: string;
}

export interface UpdateOffer {
  /** Destination du CTA — jamais affichée en clair */
  url: string;
  /** Version proposée ("4.2.6") ou null si inconnue */
  version: string | null;
}

let _memo: AppRelease | null | undefined;

/** Dernière release publiée (cache 30 min), ou null si injoignable. */
export async function getLatestAppRelease(): Promise<AppRelease | null> {
  if (_memo !== undefined) return _memo;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const { at, rel } = JSON.parse(raw) as { at: number; rel: AppRelease };
      if (Date.now() - at < CACHE_TTL_MS) {
        _memo = rel;
        return rel;
      }
    }
  } catch {
    /* cache illisible : tant pis, on va au réseau */
  }

  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 6000);
  try {
    const res = await fetch(API_URL, {
      signal: ctrl.signal,
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!res.ok) {
      _memo = null;
      return null;
    }
    const j = (await res.json()) as Record<string, unknown>;
    const tag = String(j.tag_name || "").trim();
    const version = tag.replace(/^v/i, "");
    const assets = Array.isArray(j.assets) ? (j.assets as Record<string, unknown>[]) : [];
    const apk = assets.find((a) => /\.apk$/i.test(String(a?.name || "")));
    const rel: AppRelease = {
      version,
      pageUrl: String(j.html_url || `https://github.com/${REPO}/releases/latest`),
      apkUrl: apk && apk.browser_download_url ? String(apk.browser_download_url) : null,
      name: String(j.name || tag),
    };
    _memo = rel;
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rel }));
    } catch {
      /* session pleine : on garde le mémo, c'est suffisant */
    }
    return rel;
  } catch {
    _memo = null;
    return null;
  } finally {
    window.clearTimeout(timer);
  }
}

/** Comparaison numérique laxiste : -1 si a<b · 0 égal · 1 si a>b. */
export function compareVersions(a: string, b: string): number {
  const parts = (v: string) =>
    v
      .replace(/^v/i, "")
      .split(/[.\-+]/)
      .map((x) => parseInt(x, 10) || 0);
  const pa = parts(a);
  const pb = parts(b);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

/**
 * La décision finale : faut-il proposer la mise à jour, et vers quoi ?
 * - `null` → silence total (app à jour, ou app + GitHub muet)
 * - sinon `{ url, version }` (apk direct si joint, sinon page release)
 */
export async function resolveUpdateOffer(): Promise<UpdateOffer | null> {
  const rel = await getLatestAppRelease();
  if (!rel) {
    // GitHub injoignable : en navigateur on vaut mieux qu'un silence
    return isColombesApp() ? null : { url: env.appUpdateUrl, version: null };
  }
  const url = rel.apkUrl || rel.pageUrl || env.appUpdateUrl;
  if (isColombesApp()) {
    const current = colombesAppVersion();
    return compareVersions(rel.version, current) > 0 ? { url, version: rel.version } : null;
  }
  return { url, version: rel.version };
}
