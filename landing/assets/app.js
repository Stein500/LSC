/* ============================================================
   LES SERVICES COLOMBES — Landing page « Télécharger l'app »
   - Détecte la version de l'APK via app-release.json
     (régénéré automatiquement à chaque nouvel APK — voir
     scripts/update-app-release.mjs)
   - Header au scroll, révélations, année auto
   ============================================================ */
(function () {
  "use strict";

  /* ---------- 1. Header ombré + barre de progression citron ---------- */
  var header = document.querySelector(".site-header");
  var barre = document.createElement("div");
  barre.className = "progress-lecture";
  barre.setAttribute("aria-hidden", "true");
  document.body.prepend(barre);

  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 12);
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    barre.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 2. Révélations au scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- 3. Année automatique ---------- */
  var annee = document.getElementById("annee");
  if (annee) annee.textContent = String(new Date().getFullYear());

  /* ---------- 4. Version de l'APK ---------- */
  var WA_DEFAUT = "2290167409408";
  var MSG_DEFAUT =
    "Bonjour Les Services Colombes ! Je souhaite être informé(e) dès que l'application Colombes est disponible.";

  /** Formatte les octets en Mo lisibles ("24,6 Mo") */
  function tailleLisible(octets) {
    if (!octets || octets <= 0) return null;
    var mo = octets / 1048576;
    if (mo < 1) return Math.round(octets / 1024) + " Ko";
    return mo.toFixed(1).replace(".", ",").replace(",0", "") + " Mo";
  }

  /** Date ISO → "7 août 2026" */
  function dateLisible(iso) {
    try {
      return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        .format(new Date(iso));
    } catch (e) { return null; }
  }

  function appliquerRelease(data) {
    var boutons = document.querySelectorAll("[data-download-btn]");
    var meta = document.querySelectorAll("[data-release-meta]");
    var note = document.querySelector("[data-release-note]");

    var dispo = data && data.available && data.file;
    var version = dispo && data.version ? String(data.version) : null;
    var taille = dispo ? tailleLisible(data.sizeBytes) : null;
    var dateMaj = dispo && data.updatedAt ? dateLisible(data.updatedAt) : null;

    boutons.forEach(function (btn) {
      var label = btn.querySelector("[data-btn-label]");
      var sub = btn.querySelector("[data-btn-sub]");
      var compact = btn.classList.contains("btn-header"); /* bouton d'en-tête : libellé court */
      btn.classList.remove("attente");

      if (dispo) {
        /* ===== Mode TÉLÉCHARGEMENT DIRECT ===== */
        btn.href = data.file;
        btn.removeAttribute("target");
        btn.setAttribute("download", "");
        btn.setAttribute("rel", "noopener");
        if (label) label.textContent = compact ? "Télécharger" : "Télécharger l'app Colombes";
        if (sub) {
          var morceaux = [];
          if (version) morceaux.push("v" + version);
          if (taille) morceaux.push(taille);
          morceaux.push("APK Android");
          sub.textContent = morceaux.join(" · ");
        }
      } else {
        /* ===== Mode LISTE D'ATTENTE (pas encore d'APK en ligne) ===== */
        var wa = (data && data.waitlist && data.waitlist.whatsapp) || WA_DEFAUT;
        var msg = (data && data.waitlist && data.waitlist.message) || MSG_DEFAUT;
        btn.href = "https://wa.me/" + wa + "?text=" + encodeURIComponent(msg);
        btn.setAttribute("target", "_blank");
        btn.removeAttribute("download");
        btn.classList.add("attente");
        if (label) label.textContent = compact ? "Être notifié·e" : "Être informé·e du lancement";
        if (sub) sub.textContent = "Bientôt disponible — via WhatsApp";
      }
    });

    meta.forEach(function (el) {
      if (dispo) {
        var morceaux = ["APK Android"];
        if (version) morceaux.push("version " + version);
        if (taille) morceaux.push(taille);
        if (dateMaj) morceaux.push("mis en ligne le " + dateMaj);
        el.textContent = morceaux.join(" · ");
      } else {
        el.textContent = "APK Android · version en cours de publication — lancement imminent";
      }
    });

    if (note) {
      note.textContent = dispo
        ? "APK signé · téléchargement direct depuis notre domaine officiel"
        : "Lancement imminent — l'APK arrivera ici, sur le domaine officiel, et nulle part ailleurs";
    }
  }

  /* Lecture du manifeste de version (régénéré à chaque nouvel APK) */
  fetch("app-release.json", { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("app-release.json introuvable");
      return res.json();
    })
    .then(appliquerRelease)
    .catch(function () {
      /* Fallback : pas de manifeste = pas encore d'APK public */
      appliquerRelease(null);
    });
})();
