// Background — relaie les messages du content script vers l'application native.
browser.runtime.onMessage.addListener(function (message, sender) {
  return browser.runtime.sendNativeMessage('colombesApp', message);
});
