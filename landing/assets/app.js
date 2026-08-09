/* ============================================================
   LES SERVICES COLOMBES — Landing « Télécharger l'app »
   ------------------------------------------------------------
   Sources de téléchargement, par ordre de priorité :
     1. Miroir local          (app-release.json + downloads/*.apk)
     2. GitHub Releases en direct (API publique, auto à chaque release)
     3. Page « dernière release » GitHub (repli si l'API est limitée)
     4. Liste d'attente WhatsApp (s'il n'y a vraiment rien)
   Aucun code à toucher : publie une release sur GitHub et la
   page affiche la nouvelle version toute seule.
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

  /* ---------- 4. Téléchargement de l'APK ---------- */
  var GH_REPO = "Stein500/LSC";
  var GH_API = "https://api.github.com/repos/" + GH_REPO + "/releases/latest";
  var GH_PAGE = "https://github.com/" + GH_REPO + "/releases/latest";
  var WA_DEFAUT = "2290167409408";
  var MSG_DEFAUT =
    "Bonjour Les Services Colombes ! Je souhaite être informé·e dès que l'application Colombes est disponible.";

  function tailleLisible(octets) {
    if (!octets || octets <= 0) return null;
    var mo = octets / 1048576;
    if (mo < 1) return Math.round(octets / 1024) + " Ko";
    return mo.toFixed(1).replace(".", ",").replace(",0", "") + " Mo";
  }

  function dateLisible(iso) {
    try {
      return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        .format(new Date(iso));
    } catch (e) { return null; }
  }

  function versionPropre(tag) {
    if (!tag) return null;
    var m = String(tag).match(/(\d+(?:\.\d+){1,3})/);
    return m ? m[1] : null;
  }

  /**
   * Applique une « source » aux boutons/pastilles.
   * source = {
   *   mode: "fichier" | "page-github" | "attente",
   *   url, version, taille, date, nbTelechargements, wa
   * }
   */
  function appliquerSource(src) {
    var boutons = document.querySelectorAll("[data-download-btn]");
    var metas = document.querySelectorAll("[data-release-meta]");
    var note = document.querySelector("[data-release-note]");
    var puces = document.querySelectorAll("[data-version-chip]");

    boutons.forEach(function (btn) {
      var label = btn.querySelector("[data-btn-label]");
      var sub = btn.querySelector("[data-btn-sub]");
      var compact = btn.classList.contains("btn-header");
      btn.classList.remove("attente");
      btn.removeAttribute("download");

      if (src.mode === "fichier") {
        /* ===== Téléchargement direct =====
           - miroir local : vrai fichier + joli nom imposé (même origine)
           - GitHub : l'URL n'apparaît JAMAIS — on passe par notre
             adresse propre "/telecharger" (résolue côté serveur) */
        var nomPropre = src.version ? "Colombes-v" + src.version + ".apk" : "Colombes.apk";
        if (src.local) {
          btn.href = src.url;
          btn.setAttribute("download", nomPropre);
        } else {
          btn.href = "/telecharger";
          btn.removeAttribute("download");
        }
        btn.removeAttribute("target");
        btn.setAttribute("rel", "noopener");
        btn.setAttribute(
          "aria-label",
          "Télécharger l'app Colombes" + (src.version ? " version " + src.version : "") + (src.taille ? " (" + src.taille + ")" : "") + " — APK Android"
        );
        if (label) label.textContent = compact ? "Télécharger" : "Télécharger l'app Colombes";
        if (sub) {
          if (compact) {
            sub.textContent = src.version ? "v" + src.version : "APK";
          } else {
            var m = [];
            if (src.version) m.push("v" + src.version);
            if (src.taille) m.push(src.taille);
            m.push("APK Android");
            sub.textContent = m.join(" · ");
          }
        }
      } else if (src.mode === "page-github") {
        /* ===== Repli : page de la dernière release (API limitée) ===== */
        btn.href = GH_PAGE;
        btn.setAttribute("target", "_blank");
        btn.setAttribute("rel", "noopener");
        btn.setAttribute("aria-label", "Ouvrir la page GitHub de la dernière version de l'app Colombes");
        if (label) label.textContent = compact ? "Télécharger" : "Télécharger l'app Colombes";
        if (sub) sub.textContent = compact ? "GitHub" : "via la page officielle GitHub Releases";
      } else {
        /* ===== Liste d'attente ===== */
        btn.href = "https://wa.me/" + src.wa + "?text=" + encodeURIComponent(src.waMessage);
        btn.setAttribute("target", "_blank");
        btn.setAttribute("rel", "noopener");
        btn.setAttribute("aria-label", "Être informé·e du lancement de l'app Colombes via WhatsApp");
        btn.classList.add("attente");
        if (label) label.textContent = compact ? "Être notifié·e" : "Être informé·e du lancement";
        if (sub) sub.textContent = compact ? "Bientôt" : "Bientôt disponible — via WhatsApp";
      }
    });

    metas.forEach(function (el) {
      if (src.mode === "fichier") {
        var m = ["APK Android"];
        if (src.version) m.push("version " + src.version);
        if (src.taille) m.push(src.taille);
        if (src.date) m.push("mis en ligne le " + src.date);
        if (src.nbTelechargements) m.push(src.nbTelechargements + " téléchargements");
        el.textContent = m.join(" · ");
      } else if (src.mode === "page-github") {
        el.textContent = "APK Android · dernière version sur la page GitHub officielle";
      } else {
        el.textContent = "APK Android · version en cours de publication — lancement imminent";
      }
    });

    if (note) {
      if (src.mode === "fichier") {
        var infos = [];
        if (src.version) infos.push("Version " + src.version);
        if (src.taille) infos.push(src.taille);
        infos.push("APK signé, servi depuis la page GitHub officielle de l'atelier");
        note.textContent = infos.join(" · ");
      } else if (src.mode === "page-github") {
        note.textContent = "Téléchargement sur la page GitHub officielle des Services Colombes";
      } else {
        note.textContent = "Lancement imminent — l'APK arrivera ici, et nulle part ailleurs";
      }
    }

    puces.forEach(function (el) {
      if (src.mode === "fichier" && (src.version || src.taille)) {
        el.textContent = (src.version ? "v" + src.version : "APK") + (src.taille ? " · " + src.taille : "");
        el.removeAttribute("hidden");
      } else {
        el.setAttribute("hidden", "");
      }
    });
  }

  /* Étape A — miroir local */
  fetch("app-release.json", { cache: "no-store" })
    .then(function (res) { return res.ok ? res.json() : null; })
    .catch(function () { return null; })
    .then(function (local) {
      if (local && local.available && local.file) {
        appliquerSource({
          mode: "fichier",
          local: true,
          url: local.file,
          version: local.version || null,
          taille: tailleLisible(local.sizeBytes),
          date: dateLisible(local.updatedAt),
        });
        return;
      }
      var wa = (local && local.waitlist && local.waitlist.whatsapp) || WA_DEFAUT;
      var waMessage = (local && local.waitlist && local.waitlist.message) || MSG_DEFAUT;

      /* Étape B — dernière release GitHub publiée */
      fetch(GH_API, { cache: "no-store" })
        .then(function (res) {
          if (res.status === 404) return null;         /* aucune release publiée */
          if (!res.ok) throw new Error("api " + res.status); /* 403 = rate-limit → repli */
          return res.json();
        })
        .then(function (rel) {
          if (!rel) {
            appliquerSource({ mode: "attente", wa: wa, waMessage: waMessage });
            return;
          }
          /* Parmi les APK joints : préfère la variante arm64-v8a
             (la plus légère, compatible ~95 % des téléphones),
             sinon le premier APK disponible. */
          var apks = (rel.assets || []).filter(function (a) {
            return /\.apk$/i.test(a.name || "");
          });
          var apk =
            apks.find(function (a) { return /arm64/i.test(a.name); }) || apks[0];
          if (!apk) {
            /* Release sans APK joint → la page de la release reste utile */
            appliquerSource({ mode: "page-github" });
            return;
          }
          appliquerSource({
            mode: "fichier",
            url: apk.browser_download_url,
            version: versionPropre(rel.tag_name) || versionPropre(apk.name),
            taille: tailleLisible(apk.size),
            date: dateLisible(rel.published_at),
            nbTelechargements: apk.download_count || null,
          });
        })
        .catch(function () {
          /* Étape C — API injoignable/limitée : page GitHub directement */
          appliquerSource({ mode: "page-github" });
        });
    });

  /* ============================================================
     5. MISE À JOUR SILENCIEUSE — toutes les 30 s, sans perturber
     ------------------------------------------------------------
     La page surveille version.json (empreinte régénérée à chaque
     déploiement). Si elle change :
       - l'onglet en arrière-plan → rechargement IMMÉDIAT discret ;
       - l'onglet visible → on ATTEND que tu changes d'onglet,
         puis rechargement silencieux (position de lecture gardée).
     Jamais de rechargement pendant la lecture. Jamais de popup.
     ============================================================ */
  var MAJ_POLL_MS = 30000;
  var empreinte = null;
  var majPrete = false;

  function releverEmpreinte() {
    return fetch("version.json", { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("404");
        return res.json();
      })
      .then(function (j) { return String(j.stamp || ""); })
      .catch(function () {
        /* Repli : l'ETag de l'accueil (change à chaque redéploiement) */
        return fetch("/", { method: "HEAD", cache: "no-store" })
          .then(function (res) { return res.headers.get("etag") || null; })
          .catch(function () { return null; });
      });
  }

  function appliquerQuandDiscret() {
    if (!majPrete || document.visibilityState !== "hidden") return;
    try { sessionStorage.setItem("lsc_scroll", String(window.scrollY)); } catch (e) {}
    location.reload();
  }

  function verifierMiseAJour() {
    if (document.visibilityState === "hidden") return; /* économie de data au repos */
    releverEmpreinte().then(function (s) {
      if (s && empreinte && s !== empreinte) {
        majPrete = true;
        appliquerQuandDiscret();
      }
    });
  }

  document.addEventListener("visibilitychange", appliquerQuandDiscret);
  releverEmpreinte().then(function (s) { empreinte = s; });
  window.setInterval(verifierMiseAJour, MAJ_POLL_MS);

  /* Après un rechargement silencieux : rendre la place exacte de lecture */
  try {
    var retourY = sessionStorage.getItem("lsc_scroll");
    if (retourY) {
      sessionStorage.removeItem("lsc_scroll");
      window.scrollTo(0, parseInt(retourY, 10) || 0);
    }
  } catch (e) {}

  /* Crochets de test (inoffensifs en production) */
  window.__lscVerifier = verifierMiseAJour;
  Object.defineProperty(window, "__lscMajPrete", { get: function () { return majPrete; } });
})();
