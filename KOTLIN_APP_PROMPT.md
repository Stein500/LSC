# 📱 PROMPT COMPLET — Application Android « Colombes » (Kotlin + WebView premium)

> À copier-coller tel quel dans Arena Agent / GitHub Copilot Workspace / n'importe quel agent de code, dans un repo Android neuf (ou depuis GitHub Codespaces).

---

## ══════════════ LE PROMPT ══════════════

Tu es un développeur Android senior Kotlin. Crée une application Android **native Kotlin** nommée **« Colombes »** qui embarque le site de l'atelier de couture **Les Services Colombes** dans une WebView **invisible et premium** : l'utilisateur vit une expérience 100% application, et ne doit **JAMAIS voir ou deviner l'URL d'hébergement** (pas de barre d'adresse, pas de toast avec l'URL, pas d'URL dans les écrans d'erreur, l'À-propos, ou les logs visibles).

### 1. Contexte produit

- L'application = le site existant servi dans une WebView plein écran, avec un **splash natif animé**, une navigation fluide, des gestes natifs (retour, pull-to-refresh, partage), le téléchargement des **tickets PDF**, et une page « hors connexion » brandée.
- **Package** : `com.colombes.atelier`
- **Nom affiché** : `Colombes`
- **URL cible (constante unique, jamais affichée)** : la définir UNE SEULE FOIS dans `app/src/main/java/com/colombes/atelier/AppConfig.kt` :
  ```kotlin
  object AppConfig {
      const val HOME_URL = "https://couturecolombe.vercel.app/"
  }
  ```
  Partout ailleurs dans le code, utiliser `AppConfig.HOME_URL`. **Interdit** de l'afficher dans l'UI. Les écrans d'erreur affichent « La connexion a été interrompue » — jamais l'URL.
- **Slogan** : « Atelier de Couture d'Exception — Porto-Novo »

### 2. Identité visuelle (LA MÊME que le site — respect strict)

Palette exacte :
| Rôle | Hex |
|---|---|
| Rose poudré (fond dominant) | `#FBE7EB` |
| rouge colombe (accent, boutons) | `#D1232A` |
| rouge colombe foncé (hover) | `#A31322` |
| Marron (accent secondaire) | `#8B4513` |
| Marron foncé | `#5C2E0C` |
| Fil d'or (finitions) | `#C9A87C` |
| Noir encre (texte) | `#000000` |
| Blanc | `#FFFFFF` |

- Typographie système ok, mais les titres du splash utilisent une police *serif* élégante ; si tu en embarques une, prends **Playfair Display** (`res/font`).
- Le **logo** est fourni dans le repo du site : `public/images/logo.webp` (télécharge-le depuis GitHub `Stein500/LSC`, branche `arena/019fce3a-lsc`, et mets-le dans `res/drawable`). Génère aussi l'**icône adaptive** de l'app à partir de ce logo (`mipmap`) : fond blanc `#FFFFFF` avec le logo centré à ~60%, monogramme rond avec bordure rouge colombe.

### 3. Stack technique obligatoire

- **Kotlin**, **Gradle KTS** (`build.gradle.kts`), AGP récent, **Kotlin 2.x**, `minSdk 24`, `targetSdk 35`, `compileSdk 35`
- **Material 3** (`com.google.android.material:material`), **ViewBinding** activé, pas de Compose (léger et rapide à compiler)
- **AndroidX** : `appcompat`, `core-ktx`, `webkit`, `swiperefreshlayout`, `splashscreen` (`androidx.core:core-splashscreen`) si utile, **lifecycle**
- **Une seule Activity** (single-activity) : `MainActivity` héberge la WebView ; pas de navigation multi-écran — le site est une SPA, il gère ses routes.
- `AndroidManifest.xml` : `android:hardwareAccelerated="true"`, `android:usesCleartextTraffic="false"`, `android:configChanges="orientation|screenSize|keyboardHidden|uiMode"` sur l'Activity (pas de rechargement à la rotation), `android:label="Colombes"`, icône adaptive.
- Permissions demandées : `INTERNET`, `ACCESS_NETWORK_STATE` (détection offline). **Pas** de permission inutile.

### 4. Splash natif animé (LA signature de l'app)

Crée `SplashActivity` (ou `SplashFragment`) affiché ~1,8 seconde max, puis transition `crossfade` vers `MainActivity` **uniquement quand la première page est chargée** (onPageFinished) — sinon le splash reste mais avec un indicateur de progression.

Animation du splash (reproduire l'esprit du site) :
1. Fond sombre `#0B0B12` avec un léger dégradé, **deux panneaux rideaux** (deux View noires/bord doré) qui vont s'écarter.
2. Au centre : le logo Colombes qui **scale depuis 0,8 → 1 avec fade**, sous le logo le mot **« Colombes »** en lettres qui montent une par une (fade+translate, spring, ~60 ms d'intervalle), en dégradé **fil d'or** (`#F4E3C9 → #C9A87C → #F4B860`) via `LinearGradient` sur le TextPaint (ou Spannable).
3. Un **fil doré pointillé** (View custom ou ligne animée) qui se « coud » sous le mot (dashGap animé de gauche à droite), symbole ✂ optionnel qui glisse le long du fil.
4. En bas : une **fine barre de progression** dégradé `#D1232A → #C9A87C → #8B4513` qui remplit sur la durée.
5. Ouverture : les deux rideaux partent `translationX → ±100%` avec easing `FastOutSlowIn`, crossfade 300 ms vers la WebView.
6. **Skippable au tap** (tap = ouverture immédiate).
7. Montrer le splash **à chaque cold start**, mais **jamais** au retour de background (state sauvegardée).

### 5. La WebView « ultra » — réglages et comportements

`ColombesWebView` (sous-classe WebView + setup centralisé) :

- **Settings** :
  - `javaScriptEnabled = true`, `domStorageEnabled = true`, `databaseEnabled = true`
  - `loadWithOverviewMode = true`, `useWideViewPort = true`
  - `mediaPlaybackRequiresUserGesture = false`
  - `cacheMode = LOAD_DEFAULT` (et `LOAD_CACHE_ELSE_NETWORK` si offline au démarrage — voir §7)
  - `setSupportZoom(false)`, `builtInZoomControls = false`, `displayZoomControls = false`
  - `settings.safeBrowsingEnabled = true`, `mixedContentMode = MIXED_CONTENT_NEVER_ALLOW`
  - ChromeClient : `webContentsDebuggingEnabled = false` en release
- **User-Agent** : garder le UA WebView standard (ne pas le bricoler pour cacher que c'est une WebView — la détection côté site reste possible via le bridge §10).
- **User openings** : `setSupportMultipleWindows(false)` (target=_blank → ouverture dans le navigateur externe via `shouldOverrideUrlLoading` sur `WebViewClient` + `WebChromeClient.onCreateWindow` renvoyant un transfert d'URL).

**Gestion des liens (`shouldOverrideUrlLoading`)** :
- URL interne sous `${AppConfig.HOME_URL}` (schéma https, même host) → **charger dans la WebView**.
- `tel:` → `Intent.ACTION_DIAL`
- `mailto:` → `Intent.ACTION_SENDTO` (mail app)
- `sms:` → SMS intent
- `https://wa.me/...`, `https://api.whatsapp.com/...`, `whatsapp://` → **ouvrir WhatsApp** (si installé = ACTION_VIEW, sinon Play Store / navigateur)
- `intent://` → parser avec `Intent.parseUri(..., Intent.URI_INTENT_SCHEME)` + fallback `getFallbackUrl` / Play Store (`market://`)
- `geo:`, `https://maps.google...`, `https://maps.app.goo.gl/...` → ouvrir Google Maps si installé
- Tout le reste (https externe) → **Custom Tab / navigateur externe** (ou modal in-app sans barre d'adresse si tu préfères — mais le but est : le site reste le seul objet visible)
- **Téléchargement** : `setDownloadListener` → si le content type est `application/pdf` (ou URL contient `.pdf` ou `data:application/pdf;base64`) : déclencher **DownloadManager** vers `Environment.DIRECTORY_DOWNLOADS` + notification « Ticket reçu » ; pour les PDF base64 (le site renvoie parfois du base64) : décoder **côté app** le base64 en fichier temporaire (`cacheDir`) puis l'ouvrir via `FileProvider` dans le lecteur PDF — implémente le bridge JS §10.

**WebChromeClient** :
- `onShowFileChooser` : sélecteur de fichiers (photos comprises) pour `input[type=file]` (le site a des formulaires).
- `onProgressChanged` : mettre à jour la barre de progression fine (§6).
- `onPermissionRequest` (caméra/micro d'une page web) : demander la permission runtime Android équivalente (`CAMERA`, `RECORD_AUDIO` via `ActivityResultContracts`), sinon refuser poliment.

**Gestes natifs** :
- Bouton **retour** : `webView.canGoBack() → goBack()` sinon `finish()`.
- **Pull-to-refresh** : `SwipeRefreshLayout` autour de la WebView, teinté en `#8B4513`, désactivé automatiquement quand `scrollY > 0` (via `webView.setOnScrollChangedCallback` → `swipeRefresh.isEnabled = scrollY == 0`), et **déclenché seulement en haut de page**.
- Barre de progression **fine (3 dp)** en haut, dégradé `#D1232A → #C9A87C → #8B4513`, avec animation de fondu à 100%.
- **Status bar** : couleur `#FBE7EB` (rose poudré) en mode clair avec icônes foncées (`isAppearanceLightStatusBars = true`) ; barre de navigation blanche.

### 6. État réseau & hors-connexion

- À chaque lancement/chargement : si pas de réseau (`ConnectivityManager`) → **afficher l'écran offline brandé** au lieu de charger.
- Écran offline = fragment avec asset HTML local OU layout natif brandé : logo Colombes, titre « Hors connexion », texte « Vérifie ta connexion et réessaie. » bouton **« Réessayer »** (citron, coins ronds 999) + bouton secondaire « Appeler l'atelier » (ouvre `tel:`). **AUCUNE URL affichée.**
- Quand le réseau revient (`NetworkCallback`), si l'écran offline est visible → recharger `AppConfig.HOME_URL` automatiquement.
- Erreurs SSL / `onReceivedError` sur la page principale → même écran offline (ne jamais afficher l'erreur brute Android avec l'URL).

### 7. Téléchargements & tickets

- Les **tickets PDF** générés par le site doivent se télécharger proprement. Le déclenchement `vercel` renvoie parfois le PDF en **base64** : expose dans le bridge JS une méthode `downloadBase64Pdf(base64: String, filename: String)` qui décode, écrit dans `getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)`, notifie et propose d'ouvrir (FileProvider + `application/pdf`).
- Ajoute `<provider>` FileProvider dans le manifest + `res/xml/file_paths.xml`.

### 8. Pont JavaScript (détérioré ↔ app)

`class ColombesJsBridge(private val activity: Activity)` ajouté avec `addJavascriptInterface(bridge, "ColombesApp")` :
- `@JavascriptInterface fun isApp(): Boolean = true` — le site pourra personnaliser son rendu in-app.
- `@JavascriptInterface fun getAppVersion(): String` — « 1.0.0 ».
- `@JavascriptInterface fun downloadBase64Pdf(base64: String, filename: String)` — voir §7.
- `@JavascriptInterface fun share(text: String)` — ouvre `Intent.ACTION_SEND` (Android Sharesheet) **sans** l'URL.
- ⚠️ Sécurité : n'expose **que** ces méthodes, jamais d'infos sensibles.

### 9. UX & fluidité

- Précharge la WebView **pendant** le splash (instancie + `loadUrl(HOME_URL)` dès le splash, tu gagnes 300-600 ms).
- `webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)` et `rendererPriority = RENDERER_PRIORITY_IMPORTANT`.
- Évite toute animation de transition système moche : `overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out)`.
- Le thème Material 3 hérite de `Theme.Material3.Light.NoActionBar` — **pas de toolbar, pas de titre, pas d'URL**. Immersion totale.
- Fonts : Poppins pour les labels natifs (via `res/font` si tu l'embarques, sinon système).

### 10. Icône & branding

- Icône adaptive : `res/mipmap-anydpi-v26/ic_launcher.xml` → `<background android:drawable="@color/colombes_paper"/> <foreground android:drawable="@drawable/ic_colombes_foreground"/>` avec le logo vectorisé ou PNG haute définition.
- Nom de l'APK buildée : `colombes-atelier-1.0.0-debug.apk` / `-release.apk`.

### 11. Structure du projet attendue

```
colombes-android/
├── settings.gradle.kts
├── build.gradle.kts
├── gradle.properties
├── .gitignore  (ne JAMAIS commit de keystore)
├── app/
│   ├── build.gradle.kts
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/colombes/atelier/
│       │   ├── AppConfig.kt
│       │   ├── MainActivity.kt
│       │   ├── SplashActivity.kt
│       │   ├── web/ColombesWebView.kt
│       │   ├── web/ColombesWebViewClient.kt
│       │   ├── web/ColombesWebChromeClient.kt
│       │   ├── web/ColombesJsBridge.kt
│       │   ├── web/DownloadHelper.kt
│       │   └── offline/OfflineFragment.kt
│       └── res/
│           ├── layout/activity_main.xml
│           ├── layout/activity_splash.xml
│           ├── layout/fragment_offline.xml
│           ├── values/colors.xml  (palette §2)
│           ├── values/themes.xml  (Material 3 custom)
│           ├── drawable/  (logo.webp, backgrounds, dégradés)
│           ├── font/      (optionnel)
│           ├── xml/file_paths.xml
│           └── mipmap-*/  (icône adaptive)
└── .github/workflows/android.yml  (CI build APK)
```

### 12. CI GitHub (build dans Codespaces)

`./.github/workflows/android.yml` : sur `push`/`workflow_dispatch` →
`ubuntu-latest` + `actions/setup-java@v4` (temurin 17) + `gradle/actions/setup-gradle@v4` +
`./gradlew :app:assembleDebug` + upload artifact APK. Le workflow doit aussi
tourner **manuellement** pour que je récupère l'APK depuis l'onglet Actions.

### 13. Critères d'acceptation (à vérifier toi-même)

1. L'app affiche le splash animé brandé ≤ 2s puis la WebView — **aucune URL visible nulle part** (écran d'accueil Android récent = nom « Colombes » sans barre).
2. Navigation interne (Accueil/Services/Formation/Contact/Inspirations/Formulaires) 100% in-app, fluide, sans rechargement.
3. Boutons WhatsApp/téléphone/mail/Google Maps des pages ouvrent les bonnes apps natives.
4. Soumission d'un formulaire → le **ticket PDF se télécharge** et s'ouvre dans un lecteur PDF.
5. Pull-to-refresh en haut de page uniquement ; retour Android = page précédente du site.
6. Mode avion → écran offline brandé avec « Réessayer », qui recharge dès le retour réseau.
7. Rotation de l'écran **sans** rechargement de page.
8. `gradlew :app:assembleDebug` passe sans warning bloquant ; CI GitHub verte.

Génère le projet complet, prêt à compiler dans Codespaces, avec un court README d'utilisation (comment builder l'APK et l'installer sur un téléphone Android via `adb install` ou envoi du fichier).

### 14. Le Messager « Mettre à jour l'App » — 3 visages, ouverture externe

Le site invite à télécharger la **version corrigée de l'app** quand l'application actuelle pose problème, via un messager à trois visages (composant `AppUpdateMessenger`) :

1. **🪡 Carte toast parchemin** — glisse du bas de l'écran quand le visiteur est en haut de page ; visible ~12 s, bouton « Mettre à jour », croix = silence pour la session.
2. **🫧 Bulle flottante** — pastille or/citron au-dessus du bouton WhatsApp quand le visiteur est descendu dans la page (en lecture) ; visible ~60 s.
3. **📱 Icône « App » permanente** — dans le rail d'icônes du footer, toujours disponible.

Rythme : première apparition 2 min après l'arrivée, puis toutes les 5 minutes. Le logo du header ne permute PAS avec ce messager — le header reste stable.

**Règles strictes pour l'app Android :**

1. **Ne jamais masquer ni détourner ce messager** — c'est le système de secours de la maison.
2. **Ouverture en navigateur EXTERNE obligatoire** (Chrome, Firefox…) pour ce lien et tout `target="_blank"` / `window.open` du site :
   - `WebChromeClient.onCreateWindow()` : WebView temporaire dont le `WebViewClient` capture l'URL dans `shouldOverrideUrlLoading`, lance immédiatement `Intent(Intent.ACTION_VIEW, uri)`, se détruit, et retourner `true`.
   - `WebViewClient.shouldOverrideUrlLoading()` : tout hôte différent de l'hébergement courant, ou schémas `tel:`, `mailto:`, `whatsapp:`, `https://wa.me`, `geo:`, `intent:` → `Intent(ACTION_VIEW)` externe avec `try/catch` + fallback silencieux.
3. **L'URL de mise à jour ne s'affiche JAMAIS en clair** — ni dans l'UI, ni dans un Toast/Snackbar/dialogue, ni dans la barre de titre. Elle vit uniquement dans la configuration (`VITE_APP_UPDATE_URL` côté web, constante privée côté app).
4. Même **depuis l'app installée**, le clic ouvre le navigateur externe : c'est le but (récupérer l'APK corrigé hors de l'app défaillante).

### 15. « Mode App » côté site — l'app prend le relais (contrat web, déjà implémenté)

Quand `ColombesApp.isApp()` renvoie `true`, le site s'allège et **délègue au natif** (couche `src/utils/appBridge.ts`, activée dès le boot — `html[data-colombes-app="true"]`, avant le premier paint) :

| Domaine | Comportement web en Mode App |
|---|---|
| 📥 **Ticket PDF** | `window.ColombesApp.downloadBase64Pdf(base64, filename)` remplace le `<a download>` (inefficace en WebView) — DownloadManager + notification « Ticket reçu » |
| 📊 **Barre de progression** | la barre web (`ScrollProgress`) **s'efface** — la barre native 3 dp règne |
| 🎬 **Splash** | le splash web reste **muet** (le splash natif a déjà joué) |
| 🍃 **Animations framer-motion** | `MotionConfig reducedMotion="always"` → plus de transforms/layouts JS ; fondus seulement ; transitions de page instantanées |
| 🌫 **Aurora & halos flous** | retirés (GPU du téléphone épargné) — le rose poudré reste souverain |
| ✨ **Animations CSS ambiantes** | `lsc-drift/bob/breathe/sheen/twinkle…` suspendues ; `backdrop-filter` → surfaces franches ; spotlight tactile désactivé |
| 📜 **Scroll** | `scroll-behavior: auto` — l'élan natif du téléphone fait la loi |
| 📣 **Partage** | `ColombesApp.share(text)` = Sharesheet Android quand utilisé |
| 🪡 **Messager §14** | **inchangé** — jamais masqué, lien externe obligatoire |
| 🧭 WhatsApp / tel / mail / maps | gérés par `shouldOverrideUrlLoading` (§5) — le site ne change rien |

**Impératifs côté Kotlin :** injecter le bridge **avant** `loadUrl()` (`addJavascriptInterface` dans l'init de la WebView, jamais après), garder les 4 méthodes du §8 stables (le site teste leur présence une par une — une méthode absente = repli web silencieux, rien ne casse), et laisser `hardwareAccelerated="true"` pour que le CSS reste fluide.

## ══════════════ FIN DU PROMPT ══════════════
