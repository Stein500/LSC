/* ==========================================================================
   static-bootstrap.js — v4 « SPA TAKEOVER »
   Script commun aux pages HTML statiques SEO (services, formation, contact,
   inspirations, merci, mentions-legales, 404).

   PHILOSOPHIE v4 :

     Sans JavaScript          → la page statique s'affiche, complète (SEO ✅).
     Avec JavaScript (humain) → la page statique s'affiche ~200 ms puis CÈDE
                                la place à la vraie SPA React, animée, sur la
                                MÊME URL (F5 sur /services recharge la SPA,
                                plus jamais la page statique).

   Les fichiers statiques ne sont PAS compromis : ils continuent d'exister,
   crawlabl—ables par les bots, affichables en noscript, et ils servent de
   fallback si le chargement de la SPA échoue (offline sans cache, etc.).

   Mécanique :
     1. fetch("/index.html") → le shell SPA (références hashées /assets/…)
     2. fondu sortant 220 ms
     3. body remplacé par <div id="root">
     4. injection des <link> CSS + <script type="module"> du shell
     5. history normalisé (/services.html → /services) puis React monte

   Sous-offres : filets anti-?spa=1 conservés, logo fallback, ancres douces
   (utiles si takeover échoue → on reste sur le statique).
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 0. Conditions de retrait : pas de takeover dans ces cas             *
   * ------------------------------------------------------------------ */
  function shouldTakeover() {
    try {
      // Escape hatch debug : /services?app=0 garde la page statique
      if (/[?&]app=0\b/.test(location.search)) return false;
      // file:// ou preview statique pure : pas de fetch cross
      if (location.protocol === "file:") return false;
      if (!("fetch" in window) || !("DOMParser" in window)) return false;
      // Le shell SPA exige les modules ES
      if (!("noModule" in HTMLScriptElement.prototype)) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ------------------------------------------------------------------ *
   * 1. Prise de contrôle par la SPA                                    *
   * ------------------------------------------------------------------ */
  function bootSPA() {
    if (!shouldTakeover()) return;

    var FADE_MS = 220;

    function normalizeUrl() {
      try {
        var clean = location.pathname.replace(/\.html?$/i, "") || "/";
        if (clean !== location.pathname) {
          history.replaceState(null, "", clean + location.search + location.hash);
        }
      } catch (e) {}
    }

    function takeover(indexHtml) {
      var parsed;
      try {
        parsed = new DOMParser().parseFromString(indexHtml, "text/html");
      } catch (e) {
        return;
      }
      if (!parsed || !parsed.body) return;

      // --- collecte du shell SPA --------------------------------------
      var inlineScripts = [];
      var cssLinks = [];
      var moduleScripts = [];

      Array.prototype.forEach.call(parsed.head.querySelectorAll("script"), function (s) {
        var type = (s.getAttribute("type") || "").toLowerCase();
        if (type === "application/ld+json") return;          // pas de doublon JSON-LD
        if (s.getAttribute("src")) {
          // Le shell Vite place l'entry + les modules dans le <head>
          moduleScripts.push({
            src: s.getAttribute("src"),
            type: s.getAttribute("type") || "module",
            crossorigin: s.getAttribute("crossorigin"),
          });
          return;
        }
        if (s.textContent && s.textContent.trim()) inlineScripts.push(s.textContent);
      });
      Array.prototype.forEach.call(
        parsed.head.querySelectorAll('link[rel="stylesheet"], link[rel="modulepreload"]'),
        function (l) {
          cssLinks.push({
            rel: l.getAttribute("rel"),
            href: l.getAttribute("href"),
            crossorigin: l.getAttribute("crossorigin"),
          });
        }
      );
      Array.prototype.forEach.call(parsed.body.querySelectorAll("script[src]"), function (s) {
        moduleScripts.push({
          src: s.getAttribute("src"),
          type: s.getAttribute("type") || "module",
          crossorigin: s.getAttribute("crossorigin"),
        });
      });

      if (moduleScripts.length === 0) return; // shell inattendu → on reste statique

      // --- fondu sortant de la page statique --------------------------
      document.documentElement.classList.add("spa-takeover");
      try {
        document.body.style.transition = "opacity " + FADE_MS + "ms ease";
        document.body.style.opacity = "0";
      } catch (e) {}

      window.setTimeout(function () {
        // --- scripts inline du shell (thème, etc.) --------------------
        for (var i = 0; i < inlineScripts.length; i++) {
          try {
            var si = document.createElement("script");
            si.textContent = inlineScripts[i];
            document.head.appendChild(si);
          } catch (e) {}
        }

        // --- body → socle SPA -----------------------------------------
        document.body.innerHTML = '<div id="root"></div>';
        document.body.removeAttribute("style");

        // --- feuilles de style SPA (après le CSS statique → priorité) --
        for (var j = 0; j < cssLinks.length; j++) {
          var lk = document.createElement("link");
          lk.rel = cssLinks[j].rel;
          lk.href = cssLinks[j].href;
          if (cssLinks[j].crossorigin !== null && cssLinks[j].crossorigin !== undefined) {
            lk.crossOrigin = cssLinks[j].crossorigin;
          }
          document.head.appendChild(lk);
        }

        // --- URL normalisée (dev : /services.html → /services) --------
        normalizeUrl();

        // --- modules SPA (l'entry monte React sur #root) --------------
        for (var k = 0; k < moduleScripts.length; k++) {
          var sm = document.createElement("script");
          sm.type = moduleScripts[k].type;
          sm.src = moduleScripts[k].src;
          if (moduleScripts[k].crossorigin !== null && moduleScripts[k].crossorigin !== undefined) {
            sm.crossOrigin = moduleScripts[k].crossorigin;
          }
          document.body.appendChild(sm);
        }
      }, FADE_MS);
    }

    fetch("/index.html", { credentials: "same-origin" })
      .then(function (r) { return r.ok ? r.text() : Promise.reject(r.status); })
      .then(takeover)
      .catch(function () {
        // Offline / shell indisponible → la page statique reste, c'est prévu.
      });
  }

  /* ------------------------------------------------------------------ *
   * 2. Filets de sécurité (utiles si takeover échoue)                  *
   * ------------------------------------------------------------------ */
  function neutralizeLegacyBanner() {
    var banner = document.getElementById("lsc-banner");
    if (banner) {
      banner.style.display = "none";
      banner.setAttribute("aria-hidden", "true");
    }
    var legacyButtons = document.querySelectorAll(
      '[data-lsc-enter], #lsc-enter, #lsc-enter-bottom, #lsc-enter-2, .lsc-enter'
    );
    for (var i = 0; i < legacyButtons.length; i++) {
      var b = legacyButtons[i];
      if (b.tagName === "BUTTON") {
        var a = document.createElement("a");
        a.href = "/";
        a.className = b.className;
        a.innerHTML = b.innerHTML;
        a.setAttribute("aria-label", "Entrer dans l'atelier");
        a.style.cssText = b.style.cssText;
        a.style.textDecoration = "none";
        a.style.display = "inline-flex";
        a.style.alignItems = "center";
        a.style.justifyContent = "center";
        b.parentNode.replaceChild(a, b);
      }
    }
    try {
      var origReplace = window.location.replace.bind(window.location);
      Object.defineProperty(window.location, "replace", {
        value: function (url) {
          try {
            var u = String(url);
            if (u.indexOf("?spa=1") !== -1 || u.indexOf("&spa=1") !== -1) {
              return origReplace("/");
            }
          } catch (e) {}
          return origReplace(url);
        },
        writable: false,
        configurable: true,
      });
    } catch (e) {}
  }

  /* ---------- Logos : vrai logo + fallback SVG inline ---------- */
  function setupLogos() {
    var imgs = document.querySelectorAll("[data-lsc-logo]");
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        img.addEventListener("error", function () {
          img.style.display = "none";
          var wrapper = img.closest("[data-logo-alt]");
          if (wrapper) wrapper.dataset.logoFailed = "1";
        });
      })(imgs[i]);
    }
  }

  /* ---------- Ancres douces (FAQ etc.) ---------- */
  function setupAnchors() {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var id = a.getAttribute("href").slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ------------------------------------------------------------------ *
   * 3. Démarrage                                                       *
   * ------------------------------------------------------------------ */
  neutralizeLegacyBanner();
  setupLogos();
  setupAnchors();

  // Takeover dès que le DOM est prêt (defer ⇒ déjà le cas au parsing ici,
  // mais on sécurise quand même l'ordre).
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootSPA);
  } else {
    bootSPA();
  }
})();
