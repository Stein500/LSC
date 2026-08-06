# 🚀 PROMPT — Version 2.0 « Colombes » : 100% Autonome (GeckoView + Sync + Auto-update)

> À coller dans un agent de code / Copilot / Codespace, dans le repo `Stein500/LSC`,
> branche `arena/019fd2e7-lsc`, dossier `colombes-android`.

---

## ══════════════ LE PROMPT ══════════════

Tu es un développeur Android senior Kotlin. Fais évoluer l'application « Colombes »
(atelier de couture Les Services Colombes) de sa v1 (WebView système) vers une
**v2 « 100% autonome »** : **plus aucune dépendance au WebView système ni à Chrome**,
rendu **identique sur tous les téléphones**, **synchronisation automatique** du
contenu du site et **détection permanente des mises à jour**.

### 0. Principes absolus (conservés de la v1)

- **Package** : `com.colombes.atelier` · Nom : `Colombes` · Version : `2.0.0`
- **L'URL du site n'est JAMAIS affichée** (ni dans l'UI, ni erreurs, ni notifications, ni logs).
- Palette : bleu ciel `#87CEEB`, vert citron `#BFFF00`, marron `#8B4513`, fil d'or `#C9A87C`.
- Splash animé brandé (rideaux + logo + fil doré) ≤ 2 s, skip au tap.
- Boutons retour/pull-to-refresh/rotation fluides, écran hors connexion brandé.
- Contacts : **2 numéros** `+2290167409408` / `+2290195763601` (appels + WhatsApp, choix au tap).
- Notifications matin (08h00) / soir (19h00) + événements (formulaires, appels, tickets PDF) — jamais d'URL.
- Écran hors connexion avec « Réessayer » et reconnexion auto.

### 1. 🧩 ARCHITECTURE CŒUR : remplacement du WebView système

**Remplacer `android.webkit.WebView` par `org.mozilla.geckoview:geckoview` (GeckoView).**

- **Pourquoi** : le WebView Android = moteur système variable selon les téléphones
  (versions Chrome/WebView différentes → rendu incohérent). GeckoView est un moteur
  **embarqué dans l'APK** : rendu **identique partout**, indépendant des mises à jour
  système, pas besoin de Chrome. C'est le cœur du « 100% autonome ».
- **Dépendance** : `implementation("org.mozilla.geckoview:geckoview:115.x")` (ou dernière stable).
- **Initialisation** : dans une classe `ColombesEngine` (ou `ColombesGeckoView`), instancier
  un `GeckoView` + `GeckoSession`, activer le son, les médias, le stockage DOM.
- **Réseau** : forcer `GeckoSessionSettings` pour un chargement fluide ; gérer le cache
  offline-first (voir §4).
- **Rendu** : activer `LAYER_TYPE_HARDWARE`, favoriser le rendu GPU.
- **Permissions** : `GeckoPermissionRequest` → caméra/micro si besoin (formulaires).
- **Gestion des liens** : même logique que v1 mais via `GeckoNavigationDelegate`
  (`onLoadRequest` → navigation interne / `tel:` / `mailto:` / WhatsApp / Maps / navigateur externe).
- **Téléchargements** : `GeckoDownloadDelegate` → tickets PDF (DownloadManager + décodage
  base64 + FileProvider).
- **Pont JS** : conserver `ColombesApp` (`isApp()`, `getAppVersion()`, `downloadBase64Pdf()`, `share()`, `notify()`).

> **Migration** : garder un `interface WebViewBridge` (méthodes communes) pour que la v1
> (WebView) et la v2 (GeckoView) partagent le même code de pont, et permettre un basculement
> `WebEngine = GECKO` ou `WEBVIEW` dans `AppConfig`.

### 2. 🔍 DÉTECTION PERMANENTE DES MISES À JOUR du site

Objectif : **l'app sait constamment si le site a changé** et se met à jour seule.

- **Endpoint version** : ajouter côté site un manifest de version accessible sans secret :
  `https://couturecolombe.vercel.app/app-manifest.json` renvoyant :
  ```json
  {
    "content_version": "2026-08-06T19:00:00Z",
    "build_id": "abc123",
    "changelog": ["Galerie enrichie", "Nouveau formulaire formation"]
  }
  ```
- **Vérification** : `WorkManager` **PeriodicWorkRequest** toutes les **6 h** (et au
  lancement) qui `GET` le manifest et compare à la version locale (SharedPreferences).
- **Si mise à jour détectée** :
  1. Notification « ✨ Nouveautés Colombes » avec le changelog.
  2. Rechargement automatique du moteur (ou pull-to-refresh silencieux en arrière-plan).
  3. Mise à jour du cache offline (voir §4).
- **Fallback** : si le manifest est indisponible, l'app reste sur sa version locale, aucun crash.

### 3. 📥 SYNCHRONISATION & MODE OFFLINE-FIRST (autonomie réelle)

- **Cache local robuste** : tout le contenu consulté (pages, images) est mis en cache
  dans le stockage interne de l'app (pas dépendant du cache système). Gérez le cache
  manuellement avec GeckoView (ou un cache HTTP enveloppé).
- **Offline-first** : au démarrage, charger d'abord le contenu en cache, puis rafraîchir
  depuis le réseau quand dispo. Si aucun réseau → écran hors connexion brandé (avec
  les 2 numéros appel/WhatsApp).
- **Filet de sécurité** : si une page se charge mal, servir un **asset local** brandé
  (HTML embarqué dans l'APK) au lieu d'une erreur brute — jamais d'URL visible.
- **Nettoyage** : purge du cache au-delà d'un quota (ex. 150 Mo) pour ne pas gonfler l'app.

### 4. ✨ EXPÉRIENCE « TRUC DE OUF »

- **Préchargement** pendant le splash + **préchargement de la page suivante** après chargement (predictive).
- **Splash intelligent** : montre le logo + état (« Synchronisation… », « À jour ✓ »).
- **Barre de progression fine** dégradé citron→or→marron, fondu à 100%.
- **Gesture natifs** : retour (historique moteur), swipe (navigation avant/arrière),
  pull-to-refresh en haut de page uniquement.
- **Notifications programmées** matin/soir + **événements** (formulaire, appel, WhatsApp,
  ticket PDF) via le pont — jamais d'URL.
- **Mini-badge « Nouveautés »** si une mise à jour du site est en attente.

### 5. 🛡️ SÉCURITÉ

- `GeckoSessionSettings` : pas de cleartext, pas de mixed content, SafeBrowsing équivalent.
- Pont JS restreint aux méthodes listées (aucune donnée sensible).
- Pas de permission inutile : `INTERNET`, `ACCESS_NETWORK_STATE`, `POST_NOTIFICATIONS`,
  `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`.
- ProGuard : keep les classes `@JavascriptInterface` et le pont.

### 6. 📁 STRUCTURE cible

```
colombes-android/app/src/main/java/com/colombes/atelier/
├── AppConfig.kt              (URL unique, contacts, WebEngine selector)
├── engine/
│   ├── WebEngine.kt          (interface commune)
│   ├── GeckoEngine.kt        (GeckoView)
│   └── LegacyWebViewEngine.kt (optionnel, bascule v1)
├── sync/
│   ├── UpdateChecker.kt      (manifest + WorkManager 6h)
│   ├── UpdateWorker.kt
│   └── LocalContentCache.kt  (offline-first)
├── web/                      (pont JS, download, file chooser)
├── notifications/            (matin/soir + événements)
├── offline/                  (écran hors connexion + asset local)
├── SplashActivity.kt
└── MainActivity.kt
```

### 7. 🎯 Critères d'acceptation (à vérifier)

1. L'app **fonctionne sans Chrome et sans WebView système** : désactive les deux sur un
   device de test → l'app affiche toujours le site correctement (GeckoView embarqué).
2. Rendu **identique** sur 2 téléphones d'anciennes/nouvelles versions Android.
3. Après une modification du site, l'app **détecte la mise à jour en ≤ 6 h** (ou au
   lancement), notifie et met à jour le contenu + le cache.
4. Mode avion → écran hors connexion brandé ; le contenu **déjà consulté reste visible**.
5. Les tickets PDF, appels, WhatsApp, formulaires fonctionnent via GeckoView.
6. `./gradlew :app:assembleDebug` passe ; CI verte ; APK `colombes-atelier-2.0.0-debug.apk`.

Génère le code complet, adapte `setup-alpine.sh`/`.devcontainer` si besoin, mets à jour le
README et `BUILD.md`, et fournis les commandes pour compiler + refaire une Release GitHub `v2.0.0`.

## ══════════════ FIN DU PROMPT ══════════════
