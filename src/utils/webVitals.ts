/**
 * Monitoring Core Web Vitals en production.
 * Logge LCP, CLS, INP, FCP, TTFB dans la console avec attribution
 * de l'élément coupable (le tag, les classes) pour faciliter le debug.
 *
 * En prod, peut être branché sur Sentry/Analytics plus tard.
 */
import { onCLS, onINP, onLCP, onFCP, onTTFB, type Metric } from "web-vitals";

/**
 * Décrit un élément DOM de manière compacte pour les logs.
 * @param el élément DOM à décrire
 * @returns chaîne "tag.classname" (limitée à 50 caractères)
 */
function describeElement(el: Element | undefined | null): string {
  if (!el) return "";
  const tag = el.tagName ? el.tagName.toLowerCase() : "?";
  const cls = (el as HTMLElement).className?.toString().slice(0, 50) ?? "";
  return cls ? `${tag}.${cls}` : tag;
}

function logMetric(metric: Metric) {
  // Format lisible pour debug
  const rating = metric.rating; // 'good' | 'needs-improvement' | 'poor'
  const emoji = rating === "good" ? "✅" : rating === "needs-improvement" ? "⚠️" : "❌";

  // Attribution : identifier l'élément coupable
  let culprit = "";
  if (metric.name === "LCP") {
    const lastEntry = metric.entries[metric.entries.length - 1] as
      | (PerformanceEntry & { element?: Element })
      | undefined;
    if (lastEntry?.element) {
      culprit = ` → element: ${describeElement(lastEntry.element)}`;
    }
  } else if (metric.name === "CLS") {
    const clsMetric = metric as Metric & {
      attribution?: { largestShiftTarget?: Element };
    };
    if (clsMetric.attribution?.largestShiftTarget) {
      culprit = ` → shift: ${describeElement(clsMetric.attribution.largestShiftTarget)}`;
    }
  } else if (metric.name === "INP") {
    const inpMetric = metric as Metric & {
      attribution?: { eventTarget?: Element };
    };
    if (inpMetric.attribution?.eventTarget) {
      culprit = ` → target: ${describeElement(inpMetric.attribution.eventTarget)}`;
    }
  }

  const unit = metric.name === "CLS" ? "" : "ms";
  // eslint-disable-next-line no-console
  console.log(
    `${emoji} [Web Vitals] ${metric.name}: ${Math.round(metric.value)}${unit} (${rating})${culprit}`,
    metric
  );

  // En prod, hook ici : Sentry, Plausible, Vercel Analytics, etc.
  // if (import.meta.env.PROD) { sendToAnalytics(metric); }
}

/**
 * Initialise le monitoring des Core Web Vitals.
 * À appeler une seule fois au démarrage de l'application.
 */
export function initWebVitals() {
  // Cumul du CLS (sinon il peut être rapporté en plusieurs fois)
  onCLS(logMetric, { reportAllChanges: true });
  onINP(logMetric);
  onLCP(logMetric, { reportAllChanges: true });
  onFCP(logMetric);
  onTTFB(logMetric);
}
