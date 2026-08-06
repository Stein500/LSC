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
            // Formulaire soumis
            document.addEventListener('submit', function () {
                notify('Formulaire envoyé', "Ton message a bien été transmis à l'atelier Colombes.");
            }, true);
            // Clic sur un lien d'action
            document.addEventListener('click', function (e) {
                var el = e.target;
                while (el && el !== document && el.tagName !== 'A') el = el.parentElement;
                if (!el || el.tagName !== 'A') return;
                var href = el.getAttribute('href') || '';
                if (href.indexOf('tel:') === 0) {
                    notify('Appel en cours', "Tu appelles l'atelier Colombes.");
                } else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) {
                    notify('WhatsApp', "Ouverture de la conversation WhatsApp de l'atelier.");
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
