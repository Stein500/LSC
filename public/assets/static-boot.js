/* ==========================================================================
   static-boot.js — v5 « VEILED SPA TAKEOVER »

   Chargé en <head> (bloquant) par les pages HTML statiques SEO.

     Sans JavaScript          → le script ne tourne pas : la page statique
                                s'affiche complète (SEO / Google ✅, rien
                                n'est caché — le voile n'existe que si JS
                                s'exécute).
     Avec JavaScript (humain) → un VOILE noir fil d'or est peint AVANT le
                                premier rendu : la page statique n'apparaît
                                JAMAIS à l'écran, plus aucun « flash » au
                                rafraîchissement. La SPA React prend la main
                                sur la même URL, le voile fond ensuite.

   Filets de sécurité :
     - ?app=0                  → aucun voile, aucune prise de contrôle (debug)
     - fetch /index.html ko    → voile retiré, la page statique reste (fallback)
     - garde-fou 4,5 s         → quoi qu'il arrive, le voile se retire
     - fichier non hashé       → servi en Cache-Control: no-cache (vercel.json)
   ========================================================================== */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * 0. Éligibilité — décision synchrone prise dans le <head>           *
   * ------------------------------------------------------------------ */
  function canTakeover() {
    try {
      // Escape hatch debug : /services?app=0 garde la page statique, sans voile
      if (/[?&]app=0\b/.test(location.search)) return false;
      if (location.protocol === "file:") return false;
      if (!("fetch" in window) || !("DOMParser" in window)) return false;
      // Le shell SPA exige les modules ES
      if (!("noModule" in HTMLScriptElement.prototype)) return false;
      return true;
    } catch (e) {
      return false;
    }
  }

  var TAKEOVER = canTakeover();
  var VEIL_FAILSAFE_MS = 4500;
  var veilActive = false;

  /* ------------------------------------------------------------------ *
   * 1. Voile de boot — CSS injecté, peint avant le premier frame       *
   *    (noir atelier + anneau fil d'or tournant, façon sablier couture) *
   * ------------------------------------------------------------------ */
  function veilOn() {
    if (!TAKEOVER || veilActive) return;
    veilActive = true;
    try {
      var st = document.createElement("style");
      st.id = "lsc-boot-veil";
      st.textContent =
        "html.lsc-booting::before{content:'';position:fixed;inset:0;z-index:2147483646;" +
        "background:radial-gradient(130% 100% at 50% 0%,#221206 0%,#000000 58%);" +
        "opacity:1;transition:opacity .38s ease .05s}" +
        "html.lsc-booting::after{content:'';position:fixed;left:50%;top:44%;" +
        "z-index:2147483647;width:44px;height:44px;margin:-22px 0 0 -22px;" +
        "border-radius:50%;border:2px solid rgba(201,168,124,.25);" +
        "border-top-color:#C9A87C;animation:lscBootSpin .85s linear infinite;" +
        "transition:opacity .38s ease .05s}" +
        "@keyframes lscBootSpin{to{transform:rotate(360deg)}}" +
        "html.lsc-boot-out::before,html.lsc-boot-out::after{opacity:0}";
      (document.head || document.documentElement).appendChild(st);
      document.documentElement.classList.add("lsc-booting");
      // Garde-fou : le voile se retire toujours, même si tout échoue
      window.setTimeout(veilOff, VEIL_FAILSAFE_MS);
    } catch (e) {}
  }

  function veilOff() {
    if (!veilActive) return;
    veilActive = false;
    try {
      var de = document.documentElement;
      de.classList.add("lsc-boot-out");
      window.setTimeout(function () {
        de.classList.remove("lsc-booting");
        de.classList.remove("lsc-boot-out");
        var st = document.getElementById("lsc-boot-veil");
        if (st && st.parentNode) st.parentNode.removeChild(st);
      }, 460);
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ *
   * 2. Le fetch du shell SPA démarre TOUT DE SUITE (dans le <head>)    *
   *    — il n'a pas besoin du DOM, on gagne le temps de parsing.       *
   * ------------------------------------------------------------------ */
  var shellPromise = null;
  if (TAKEOVER) {
    veilOn();
    try {
      shellPromise = fetch("/index.html", { credentials: "same-origin" }).then(
        function (r) {
          return r.ok ? r.text() : Promise.reject(r.status);
        }
      );
    } catch (e) {
      shellPromise = null;
    }
  }

  /* ------------------------------------------------------------------ *
   * 3. Prise de contrôle                                               *
   * ------------------------------------------------------------------ */
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
      return veilOff();
    }
    if (!parsed || !parsed.body) return veilOff();

    /* --- collecte du shell SPA -------------------------------------- */
    var inlineScripts = [];
    var cssLinks = [];
    var moduleScripts = [];

    Array.prototype.forEach.call(parsed.head.querySelectorAll("script"), function (s) {
      var type = (s.getAttribute("type") || "").toLowerCase();
      if (type === "application/ld+json") return; // pas de doublon JSON-LD
      if (s.getAttribute("src")) {
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

    if (moduleScripts.length === 0) return veilOff(); // shell inattendu → statique

    document.documentElement.classList.add("spa-takeover");

    /* --- scripts inline du shell (thème, etc.) ---------------------- */
    for (var i = 0; i < inlineScripts.length; i++) {
      try {
        var si = document.createElement("script");
        si.textContent = inlineScripts[i];
        document.head.appendChild(si);
      } catch (e) {}
    }

    /* --- body → socle SPA ------------------------------------------- */
    document.body.innerHTML = '<div id="root"></div>';
    document.body.removeAttribute("style");

    /* --- feuilles de style SPA -------------------------------------- */
    for (var j = 0; j < cssLinks.length; j++) {
      var lk = document.createElement("link");
      lk.rel = cssLinks[j].rel;
      lk.href = cssLinks[j].href;
      if (cssLinks[j].crossorigin !== null && cssLinks[j].crossorigin !== undefined) {
        lk.crossOrigin = cssLinks[j].crossorigin;
      }
      document.head.appendChild(lk);
    }

    /* --- URL normalisée (/services.html → /services) ----------------- */
    normalizeUrl();

    /* --- modules SPA (l'entry monte React sur #root) ----------------- */
    for (var k = 0; k < moduleScripts.length; k++) {
      var sm = document.createElement("script");
      sm.type = moduleScripts[k].type;
      sm.src = moduleScripts[k].src;
      if (moduleScripts[k].crossorigin !== null && moduleScripts[k].crossorigin !== undefined) {
        sm.crossOrigin = moduleScripts[k].crossorigin;
      }
      document.body.appendChild(sm);
    }

    /* --- le voile fond quand deux frames se sont écoulées ------------ */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(veilOff);
    });
  }

  function bootSPA() {
    if (!TAKEOVER) return;
    if (!shellPromise) return veilOff();
    shellPromise.then(takeover).catch(function () {
      // Offline / shell indisponible → voile retiré, la page statique reste.
      veilOff();
    });
  }

  /* ------------------------------------------------------------------ *
   * 4. Filets de sécurité (utiles si takeover échoue)                  *
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
   * 5. Démarrage — les opérations DOM attendent le DOM ; le fetch, lui, *
   *    est déjà parti depuis le <head>.                                 *
   * ------------------------------------------------------------------ */
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  onReady(function () {
    neutralizeLegacyBanner();
    setupLogos();
    setupAnchors();
    bootSPA();
  });
})();
