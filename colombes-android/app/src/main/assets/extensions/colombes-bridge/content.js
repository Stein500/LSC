// Content script — définit window.ColombesApp (pont site <-> app GeckoView)
// et observe les grands événements (formulaires, appels, WhatsApp, PDF).
(function () {
  if (window.__colombesBridgeInjected) return;
  window.__colombesBridgeInjected = true;

  // --- Pont synchrone défini immédiatement (document_start) ---
  window.ColombesApp = {
    isApp: function () { return true; },
    getAppVersion: function () {
      return browser.runtime.sendMessage({ type: 'getAppVersion' });
    },
    downloadBase64Pdf: function (base64, filename) {
      browser.runtime.sendMessage({ type: 'downloadPdf', base64: base64, filename: filename });
    },
    share: function (text) {
      browser.runtime.sendMessage({ type: 'share', text: text });
    },
    notify: function (title, body) {
      browser.runtime.sendMessage({ type: 'notify', title: title, body: body });
    }
  };

  // --- Évite le "double splash" ---
  (function maskSiteSplash() {
    try {
      var style = document.createElement('style');
      style.id = 'colombes-mask-splash';
      style.textContent =
        'div[aria-modal="true"],' +
        'div[aria-label="Ouverture de l\'atelier"]' +
        '{ display:none !important; visibility:hidden !important; }';
      (document.head || document.documentElement).appendChild(style);
    } catch (e) {}
  })();

  function notify(title, body) {
    try { window.ColombesApp.notify(title, body); } catch (e) {}
  }

  // --- Téléchargement de PDF blob: → envoie au pont natif ---
  // Le site télécharge le ticket via un Blob + <a download>. GeckoView
  // n'intercepte pas les URL blob:, donc on capture le Blob à la création
  // (URL.createObjectURL) et on l'envoie (base64) à l'application native.
  var nativeCreateObjectURL = URL.createObjectURL;
  URL.createObjectURL = function (obj) {
    var url = nativeCreateObjectURL.call(URL, obj);
    if (obj && obj.type === 'application/pdf') {
      // Lire le Blob en base64 et l'envoyer à l'app
      try {
        var reader = new FileReader();
        reader.onload = function () {
          var b64 = String(reader.result).split(',')[1] || '';
          window.ColombesApp.downloadBase64Pdf(b64, 'ticket.pdf');
          notify('Ticket reçu', 'Ton ticket PDF est téléchargé.');
        };
        reader.readAsDataURL(obj);
      } catch (e) {}
    }
    return url;
  };

  // Clic sur un lien <a download> (cas où le blob n'a pas été intercepté)
  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document && el.tagName !== 'A') el = el.parentElement;
    if (!el || el.tagName !== 'A') return;
    var href = el.getAttribute('href') || '';
    if (el.hasAttribute('download')) {
      // Le blob PDF est géré via createObjectURL ci-dessus.
      // On empêche juste la navigation blob: native qui ne fait rien.
      if (href.indexOf('blob:') === 0) {
        e.preventDefault();
      }
    } else if (href.indexOf('tel:') === 0) {
      notify('Appel en cours', "Tu appelles l'atelier Colombes.");
    } else if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp') !== -1) {
      notify('WhatsApp', "Ouverture de la conversation WhatsApp de l'atelier.");
    }
  }, true);

  // Formulaire soumis
  document.addEventListener('submit', function () {
    notify('Formulaire envoyé', "Ton message a bien été transmis à l'atelier Colombes.");
  }, true);
})();
