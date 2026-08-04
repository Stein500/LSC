import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const KEY_PREFIX = "lscolombes:scroll:";

/**
 * Mémorise la position de scroll par route (pathname + search).
 *
 * Cas couverts :
 *  - Navigation SPA (React Router) → cleanup du useEffect → on save
 *  - Navigation vers une page SEO statique (= full reload) →
 *    `pagehide` + `beforeunload` + `visibilitychange` se déclenchent
 *    AVANT que le navigateur ne démonte la page, donc on a le temps
 *    d'écrire dans sessionStorage.
 *  - Retour sur la même route plus tard → on lit la valeur et on
 *    scroll en `auto` (instantané, pas d'animation qui fight avec
 *    un éventuel scroll programmatique).
 *
 * Avant ce fix, le bouton "Retourner dans l'atelier" des pages SEO
 * statiques ramenait l'utilisateur en bas de la home (footer) au
 * lieu de la position qu'il avait avant de partir — parce que la
 * sauvegarde n'avait jamais le temps de tourner avant le unload.
 */
export function useScrollMemory() {
  const location = useLocation();
  const key = `${location.pathname}${location.search}`;

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const storageKey = `${KEY_PREFIX}${key}`;
    const saved = sessionStorage.getItem(storageKey);
    const targetY = saved ? Number(saved) : 0;

    // Restaure après le paint pour ne pas se battre avec le layout
    const restore = window.setTimeout(() => {
      window.scrollTo({
        top: Number.isFinite(targetY) ? targetY : 0,
        left: 0,
        behavior: "auto",
      });
    }, 0);

    // Fonction de sauvegarde — utilisée par tous les listeners ci-dessous
    const saveScroll = () => {
      try {
        sessionStorage.setItem(storageKey, String(window.scrollY));
      } catch {
        /* sessionStorage plein ou désactivé — on n'insiste pas */
      }
    };

    // 1) pagehide — le plus fiable, déclenché aussi sur mobile / bfcache
    const onPageHide = () => saveScroll();
    // 2) beforeunload — filet de sécurité pour les navigateurs anciens
    const onBeforeUnload = () => saveScroll();
    // 3) visibilitychange — quand l'onglet passe en arrière-plan
    //    (sur iOS c'est l'événement le plus fiable avant un swap d'onglet)
    const onVisChange = () => {
      if (document.visibilityState === "hidden") saveScroll();
    };

    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("visibilitychange", onVisChange);

    return () => {
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("visibilitychange", onVisChange);
      // Cleanup React : changement de route dans la SPA
      saveScroll();
      window.clearTimeout(restore);
    };
  }, [key]);
}
