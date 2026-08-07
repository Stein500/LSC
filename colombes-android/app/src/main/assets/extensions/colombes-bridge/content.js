// Content script — définit window.ColombesApp (pont site <-> app GeckoView)
// et observe les grands événements (formulaires, appels, WhatsApp).
(function () {
  if (window.__colombesBridgeInjected) return;
  window.__colombesBridgeInjected = true;

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

  function notify(title, body) {
    try { window.ColombesApp.notify(title, body); } catch (e) {}
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
