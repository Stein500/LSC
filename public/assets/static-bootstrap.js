/* ==========================================================================
   static-bootstrap.js — v3 (sans ?spa=1)
   Script commun aux pages HTML statiques SEO (services, formation, contact,
   merci, mentions-legales, 404).

   Changements v3 :
   - SUPPRIMÉ : le compte à rebours de 8s.
   - SUPPRIMÉ : la redirection vers /index.html?spa=1&route=...
   - SUPPRIMÉ : le bandeau d'entrée "Version complète interactive disponible".
   - SUPPRIMÉ : la pose du cookie lsc-spa=1.
   - SUPPRIMÉ : la réécriture des liens internes en /route?spa=1.

   À la place :
   - On se contente de gérer les logos (vrai logo + fallback SVG inline)
     pour les pages où /images/logo* n'est pas dispo.
   - On initialise les liens d'ancrage (smooth scroll pour les FAQ).
   - On annule la redirection de la bannière legacy si elle existe encore
     (sécurité : si une page n'a pas été migrée, on évite quand même
     d'envoyer le user sur /index.html?spa=1).

   Comportement final côté user :
   - Sur /services : la page s'affiche instant. Tu scrolles, tu lis, tu
     appelles, tu cliques WhatsApp. Si tu cliques "Entrer dans l'atelier",
     tu vas à / (la SPA), pas de chaîne de redirection.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Filet de sécurité : annule la bannière legacy ---------- */
  // Si une page SEO a encore l'ancien bandeau #lsc-banner, on le masque.
  // Plus aucun countdown, plus de window.location.replace(/index.html?spa=1...).
  function neutralizeLegacyBanner() {
    var banner = document.getElementById("lsc-banner");
    if (banner) {
      banner.style.display = "none";
      banner.setAttribute("aria-hidden", "true");
    }
    // Le bouton "Entrer" devient un <a href="/"> côté HTML.
    // S'il a été oublié en <button>, on le rend inerte pour ne pas
    // déclencher la chaîne de redirection qui plante.
    var legacyButtons = document.querySelectorAll(
      '[data-lsc-enter], #lsc-enter, #lsc-enter-bottom, #lsc-enter-2, .lsc-enter'
    );
    for (var i = 0; i < legacyButtons.length; i++) {
      var b = legacyButtons[i];
      if (b.tagName === "BUTTON") {
        // On le transforme en <a href="/"> pour préserver le click user
        // (ne casse pas la navigation même si la page n'a pas été migrée).
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
    // Filet anti-redirection : si jamais un script externe tente de
    // faire window.location.replace(/index.html?spa=1...), on bloque.
    try {
      var origReplace = window.location.replace.bind(window.location);
      Object.defineProperty(window.location, "replace", {
        value: function (url) {
          try {
            var u = String(url);
            if (u.indexOf("?spa=1") !== -1 || u.indexOf("&spa=1") !== -1) {
              console.warn("[LSC] redirect ?spa=1 bloqué → /");
              return origReplace("/");
            }
          } catch (e) {}
          return origReplace(url);
        },
        writable: false,
        configurable: true,
      });
    } catch (e) {
      /* si defineProperty échoue (page non migrée, autre script a déjà
         patché), on laisse passer. */
    }
  }

  /* ---------- Logo : vrai logo + fallback inline ---------- */

  // SVG stylisé "ciseaux + monogramme SC" — affiché si /images/logo*
  // ne charge pas. Pas de dépendance réseau, rendu net.
  var LOGO_FALLBACK_SVG =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" ' +
    'role="img" aria-label="Les Services Colombes" ' +
    'style="width:70%;height:70%;display:block">' +
    '<circle cx="32" cy="32" r="30" fill="#ffffff" stroke="#000000" stroke-width="2.5"/>' +
    '<g stroke="#8B4513" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="22" cy="44" r="4" fill="#8B4513"/>' +
    '<circle cx="42" cy="44" r="4" fill="#8B4513"/>' +
    '<line x1="24.5" y1="40.5" x2="44" y2="18"/>' +
    '<line x1="39.5" y1="40.5" x2="20" y2="18"/>' +
    '<line x1="20" y1="18" x2="20" y2="22"/>' +
    '<line x1="44" y1="18" x2="44" y2="22"/>' +
    "</g>" +
    "</svg>";

  function injectLogoInto(container) {
    if (!container || container.dataset.lscLogoReady === "1") return;
    container.dataset.lscLogoReady = "1";

    var img = document.createElement("img");
    img.src = "/images/logo.webp";
    img.alt = container.getAttribute("data-logo-alt") || "Les Services Colombes";
    img.loading = "eager";
    img.decoding = "async";
    img.className = "lsc-logo-img";
    img.style.cssText = "width:100%;height:100%;object-fit:contain;display:block;";

    var fb = document.createElement("span");
    fb.className = "lsc-logo-fallback";
    fb.setAttribute("aria-hidden", "true");
    fb.innerHTML = LOGO_FALLBACK_SVG;
    fb.style.cssText =
      "position:absolute;inset:0;display:none;align-items:center;justify-content:center;";

    img.addEventListener("error", function () {
      img.style.display = "none";
      fb.style.display = "flex";
    });
    if (img.complete && img.naturalWidth === 0) {
      img.dispatchEvent(new Event("error"));
    }

    var original = container.innerHTML;
    container.innerHTML = "";
    container.style.position = "relative";
    container.appendChild(img);
    container.appendChild(fb);
    setTimeout(function () {
      var imgRect = img.getBoundingClientRect();
      var fbRect = fb.getBoundingClientRect();
      if (imgRect.width === 0 && fbRect.width === 0 && original) {
        container.innerHTML = original;
      }
    }, 600);
  }

  function setupLogos() {
    var headerMark = document.querySelector(".lsc-logo .lsc-logo-mark");
    if (headerMark) injectLogoInto(headerMark);
    var footerLogoSlot = document.querySelector(
      ".lsc-footer [data-lsc-footer-logo]"
    );
    if (footerLogoSlot) injectLogoInto(footerLogoSlot);
  }

  /* ---------- FAQ : smooth scroll + accessibilité ---------- */
  function setupFAQ() {
    var details = document.querySelectorAll("details");
    for (var i = 0; i < details.length; i++) {
      // Animation simple à l'ouverture
      details[i].addEventListener("toggle", function () {
        if (this.open) {
          this.style.transition = "background 0.2s ease";
          this.style.background = "rgba(191, 255, 0, 0.10)";
        } else {
          this.style.background = "";
        }
      });
    }
  }

  /* ---------- Init ---------- */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      neutralizeLegacyBanner();
      setupLogos();
      setupFAQ();
    });
  } else {
    neutralizeLegacyBanner();
    setupLogos();
    setupFAQ();
  }
})();
