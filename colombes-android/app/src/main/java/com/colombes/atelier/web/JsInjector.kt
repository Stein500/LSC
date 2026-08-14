package com.colombes.atelier.web

import android.webkit.WebView

/**
 * Injecte à l'exécution (dans la WebView) un petit script qui observe les
 * « grands événements » du site — sans jamais modifier le code source du site.
 *
 * Le script appelle le pont JavaScript `ColombesApp.notify(...)`, ce qui
 * déclenche une notification locale élégante. Aucun texte affiché ne contient
 * l'URL d'hébergement.
 */
object JsInjector {

    private const val BRIDGE_SCRIPT =
        """
        (function () {
            if (window.__colombesInjector) return;
            window.__colombesInjector = true;
            function notify(title, body) {
                try {
                    if (window.ColombesApp) window.ColombesApp.notify(title, body);
                } catch (e) {}
            }

            // --- Injection CSS PREMIUM (sublime le site sans le modifier) ---
            // Applique un habillage élégant par-dessus le site : polices,
            // couleurs harmonisées, boutons arrondis, ombres douces.
            (function injectPremiumCss() {
                try {
                    var style = document.createElement('style');
                    style.id = 'colombes-premium';
                    style.textContent =
                        ':root {' +
                        '  --colombes-rose: #FBE7EB;' +
                        '  --colombes-rouge: #D1232A;' +
                        '  --colombes-rouge-dark: #A31322;' +
                        '  --colombes-marron: #5C2E0C;' +
                        '  --colombes-or: #C9A87C;' +
                        '}' +
                        // Masque le scrollbar système (rendu "application")
                        '::-webkit-scrollbar { width: 0 !important; height: 0 !important; }' +
                        'html { scrollbar-width: none !important; }' +
                        // Corps : fond doux + police moderne
                        'body { font-family: "Poppins", system-ui, sans-serif !important; ' +
                        '  background: #FBE7EB !important; -webkit-font-smoothing: antialiased; }' +
                        // Titres en serif élégante
                        'h1, h2, h3, .hero-title, [class*="title"] { ' +
                        '  font-family: "Playfair Display", Georgia, serif !important; }' +
                        // Boutons arrondis + ombre douce
                        'button, [role="button"], a[href] { ' +
                        '  border-radius: 999px !important; ' +
                        '  -webkit-tap-highlight-color: transparent; }' +
                        // Liens en rouge colombe
                        'a { color: #A31322 !important; }' +
                        // Transitions douces (effet premium)
                        '* { transition: background-color .25s ease, transform .2s ease; }' +
                        // Boutons au survol/tap léger
                        'button:active, [role="button"]:active, a:active { ' +
                        '  transform: scale(0.97); opacity: 0.92; }' +
                        // Harmonise les images avec coins doux
                        'img { border-radius: 16px; }' +
                        '';
                    (document.head || document.documentElement).appendChild(style);
                } catch (e) {}
            })();

            // --- Masque le splash du SITE dans l'app ---
            // C'est le splash NATIF de l'app qui s'exécute (fidèle au site).
            // On cache SEULEMENT le splash du site (via son aria-label), pas les
            // autres fenêtres modales (tiroir de notifications, menus, etc.).
            (function maskSiteSplash() {
                try {
                    var style = document.createElement('style');
                    style.id = 'colombes-mask-splash';
                    style.textContent =
                        'div[aria-label="Ouverture de l\'atelier"]' +
                        '{ display:none !important; visibility:hidden !important; }';
                    (document.head || document.documentElement).appendChild(style);
                } catch (e) {}
            })();

            // --- Capture des téléchargements PDF (blob) → pont natif ---
            // Le site génère le ticket en Blob + <a download>. On intercepte
            // URL.createObjectURL pour envoyer le base64 à l'application.
            var origCreateObjectURL = URL.createObjectURL;
            URL.createObjectURL = function (obj) {
                var url = origCreateObjectURL.call(URL, obj);
                try {
                    if (obj && obj.type === 'application/pdf') {
                        var reader = new FileReader();
                        reader.onload = function () {
                            var b64 = String(reader.result).split(',')[1] || '';
                            if (b64 && window.ColombesApp) {
                                window.ColombesApp.downloadBase64Pdf(b64, 'ticket.pdf');
                                notify('Ticket reçu', 'Ton ticket PDF est téléchargé.');
                            }
                        };
                        reader.readAsDataURL(obj);
                    }
                } catch (e) {}
                return url;
            };

            // Bloque la navigation blob: native (qui ne fait rien dans la WebView)
            document.addEventListener('click', function (e) {
                var el = e.target;
                while (el && el !== document && el.tagName !== 'A') el = el.parentElement;
                if (!el || el.tagName !== 'A') return;
                var href = el.getAttribute('href') || '';
                if (el.hasAttribute('download') && href.indexOf('blob:') === 0) {
                    e.preventDefault();
                }
            }, true);

            // --- Notifications variées ---
            var notifs = {
                formulaire: [
                    ['Formulaire envoyé', "Ton message a bien été transmis à l'atelier Colombes."],
                    ['Merci 💌', "Ta demande est bien reçue. L'atelier te répondra bientôt."],
                    ['Reçu ✓', "Nous avons bien enregistré ta demande."]
                ],
                appel: [
                    ['Appel en cours', "Tu appelles l'atelier Colombes."],
                    ['Contact', "Ouverture du numéro de l'atelier."]
                ],
                whatsapp: [
                    ['WhatsApp', "Ouverture de la conversation WhatsApp de l'atelier."],
                    ['Message', "Discussion WhatsApp avec l'atelier Colombes."]
                ]
            };
            function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

            // Formulaire soumis
            document.addEventListener('submit', function () {
                var n = pick(notifs.formulaire);
                notify(n[0], n[1]);
            }, true);

            // Clic sur un lien d'action
            document.addEventListener('click', function (e) {
                var el = e.target;
                while (el && el !== document && el.tagName !== 'A') el = el.parentElement;
                if (!el || el.tagName !== 'A') return;
                var href = el.getAttribute('href') || '';
                if (href.indexOf('tel:') === 0) {
                    var n = pick(notifs.appel);
                    notify(n[0], n[1]);
                } else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) {
                    var n = pick(notifs.whatsapp);
                    notify(n[0], n[1]);
                }
            }, true);
        })();
        """

    /** Injecte le script si la page a bien été chargée (frame principal uniquement). */
    fun inject(view: WebView, url: String?) {
        if (url.isNullOrBlank() || url.startsWith("about:") || url.startsWith("data:")) return
        runCatching {
            view.evaluateJavascript(BRIDGE_SCRIPT, null)
        }
    }
}
