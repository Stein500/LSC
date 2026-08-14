# 📱 PROMPT — REFONTE COMPLÈTE de l'App « Colombes » (de A à Z)

> À coller tel quel dans un agent de code, dans le repo `Stein500/LSC`,
> branche `arena/019fd2e7-lsc`, dossier `colombes-android`.

---

## ══════════════ LE PROMPT ══════════════

Tu es un designer + développeur Android senior. **Refonds l'application Android « Colombes »
(l'atelier de couture Les Services Colombes) de A à Z**, pour une expérience **premium,
élégante et féminine**, digne d'une app iOS/Samsung/Oppo. Tu couvres TOUT le parcours :
de l'icône sur le bureau à la fermeture de l'app, en passant par le splash, le hub natif,
le WebView sublimé, les notifications et la mise à jour automatique.

### 0. Cadre & contraintes (à respecter strictement)

- **Package** : `com.colombes.atelier` · **Nom affiché** : `Colombes`
- **Slogan** : « Atelier de Couture d'Exception — Porto-Novo »
- **Version** : `4.3.0` (versionCode 15)
- **Stack** : Kotlin, Gradle KTS, Material 3, ViewBinding, **WebView système** (léger).
- **L'URL d'hébergement du site n'est JAMAIS affichée** (ni UI, ni erreurs, ni notifications, ni logs).
- **Le site n'est PAS modifié** : tout le design premium se fait par **injection CSS/JS** dans la WebView.
- **Signé** avec le keystore existant (`colombes.keystore`) — jamais commité.
- **Palette OFFICIELLE** (bleu et vert BANNIS) :
  | Rôle | Hex |
  |---|---|
  | Fond dominant | `#FBE7EB` (rose poudré) |
  | Accent signature | `#D1232A` (rouge colombe), foncé `#A31322` |
  | Secondaire | `#8B4513` / `#5C2E0C` (marron) |
  | Finitions | `#C9A87C` fil d'or, `#0B0B12` noir, `#FFFFFF` blanc |
- **Polices embarquées** : Playfair Display (titres serif), Poppins (corps) — déjà dans `res/font`.

---

### 1. 🏗️ ARCHITECTURE (à garder propre)

```
colombes-android/
├── settings.gradle.kts / build.gradle.kts / gradle.properties
├── app/
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/colombes/atelier/
│       │   ├── AppConfig.kt          ← URL + contacts + palette centralisés
│       │   ├── HomeActivity.kt       ← hub natif élégant (launcher)
│       │   ├── MainActivity.kt       ← WebView premium + splash synchronisé
│       │   ├── notifications/        ← matin/soir bienveillantes + événements
│       │   ├── offline/              ← écran hors connexion brandé
│       │   ├── sync/UpdateChecker.kt ← détection des nouveautés du site (app-manifest)
│       │   ├── sync/AppUpdateChecker.kt ← veille des versions + MAJ auto (Option B)
│       │   └── web/                  ← ColombesWebView, WebViewClient, JsInjector, bridge
│       └── res/
│           ├── font/                 ← playfair_display.ttf, poppins.ttf
│           ├── drawable/             ← logo, icônes, backgrounds, gradients
│           ├── drawable-nodpi/       ← images de créations (splash, galerie)
│           ├── layout/               ← home, home_splash, main, splash_overlay, offline
│           ├── menu/ color/ values/ mipmap-*/  ← icône adaptive
└── .github/workflows/android.yml      ← CI build APK
```

---

### 2. 🎨 ICÔNE de l'app (le premier contact)

- **Icône adaptive** (`mipmap-anydpi-v26/ic_launcher.xml`) :
  - **Fond** : dégradé rose poudré `#FBE7EB` → blanc, avec un **halo** rouge colombe `#D1232A` discret.
  - **Monogramme** : la lettre « **C** » en **Playfair Display** serif, couleur rouge colombe,
    avec un **fil d'or** `#C9A87C` qui l'enroule (symbole couture) — ou le **logo blason** centré à ~70%.
  - Bordure fine or `#C9A87C` autour.
- **Icônes legacy** (mipmap-mdpi → xxxhdpi) : générées depuis la version HD.
- **Icône de notification** (`ic_stat_colombes`) : petite bobine/ciseaux blanche sur fond rouge colombe.
- **Écran de chargement système** (`windowBackground` splash) : fond rose poudré avec logo centré,
  pour éviter le flash blanc au lancement.

---

### 3. 🚪 SPLASH (l'ouverture spectaculaire)

`HomeActivity` (ou `SplashActivity`) affiche un **splash cinématique premium ~2,5 s** :
1. **Fond** : dégradé animé rose poudré `#FBE7EB` → blanc, avec des **particules dorées** flottantes.
2. **Diaporama Ken Burns** : les images de créations défilent en **zoom lent + fondu** (au moins 8 images).
3. **Logo** : scale 0.8→1 + fade, entouré d'un **fil doré** qui se coud en pointillés.
4. **Wordmark « Colombes »** : lettres qui montent une par une (spring), en **Playfair Display**
   avec un **dégradé or → rouge colombe**.
5. **Sous-titre** : slogan en italic, fondu.
6. **Barre de progression** : dégradé `or → rouge colombe → marron`, remplissage fluide.
7. **Skippable au tap** (ouverture immédiate).
8. S'affiche **à chaque démarrage à froid** (pas au retour de background).

---

### 4. 🏠 HUB NATIF (la page d'accueil « digne de nous »)

`HomeActivity` affiche un **accueil natif élégant** (scrollable) avec :
- **En-tête** : logo HD + « Colombes » (Playfair) + slogan, sur fond rose poudré dégradé,
  avec une **barre de statut** rose (icônes foncées).
- **Bienvenue** : titre + courte présentation chaleureuse.
- **Image héro** : une grande image de création, pleine largeur, en `fitCenter`, coins arrondis.
- **Galerie « Nos réalisations »** : scroll horizontal de 5+ photos (coins arrondis, ombre douce).
- **Cartes services** (Services, Formation, Inspirations, Contact) : chaque carte = icône or +
  titre serif + description + pilule « Voir » dorée. Coins très arrondis, bordure or clair,
  **effet appuyé** au tap (scale).
- **Boutons actions** : « Ouvrir l'atelier » (rouge colombe), « WhatsApp » (vert WhatsApp),
  « Appeler l'atelier » (contour or). Coins pilules, `backgroundTint="@null"`.
- **Barre de navigation basse** : Accueil · Services · Contact (icônes, sélection rouge colombe).

---

### 5. 🌐 WEBVIEW PREMIUM (sublimer le site SANS le toucher)

`MainActivity` charge le site dans une WebView sublimée :
- **Fond rose poudré** pendant le chargement (pas de blanc "navigateur").
- **Splash natif synchronisé** : le splash reste affiché jusqu'à ce que la page d'accueil
  soit réellement rendue (`onPageFinished`), puis ouvre les rideaux en fondu — aucune
  impression de "site qui charge".
- **Injection CSS premium** (`JsInjector`) qui sublime le site sans le modifier :
  - Masque le scrollbar système (rendu application).
  - Polices Playfair (titres) + Poppins (corps).
  - Boutons/liens coins arrondis, rouge colombe, ombres douces.
  - Transitions et animations au tap (effet premium).
  - Images coins arrondis.
- **Gestes natifs** : retour (historique), pull-to-refresh (en haut de page), rotation sans rechargement.
- **Liens externes** (tel:, mailto:, WhatsApp, Google Maps, navigateur) → apps natives.
- **Téléchargement des tickets PDF** via le pont JS (blob → base64 → natif).

---

### 6. 🔔 NOTIFICATIONS (élégantes, bienveillantes, utiles)

- **Matin (08h00) / Soir (19h00)** : messages **variés** (4+ chacun) qui tournent selon le jour,
  bienveillants — rappellent aux femmes qu'elles sont **belles**, et de **contacter l'atelier**.
- **Événements du site** (formulaire envoyé, appel, WhatsApp, ticket PDF) → notifications variées.
- **Nouveautés du site** : détection via `app-manifest.json` (WorkManager toutes les 6 h) →
  notification « ✨ Nouveautés » avec le changelog.
- **Permission** demandée au 1er lancement ; alarme exacte avec repli si refusée.
- **Aucune URL** dans les notifications.

---

### 7. 📥 MISE À JOUR AUTOMATIQUE (Option B)

- L'app vérifie les **Releases GitHub** (`Stein500/LSC`) au lancement.
- Si une version **strictement supérieure** existe → dialogue élégant « ✨ Nouvelle version
  disponible » → **téléchargement automatique** → ouverture de l'installateur (l'utilisateur valide « Installer »).
- Options : « Plus tard » / « Ignorer cette version ».
- **Pas de message si à jour** (même version).
- Permission `REQUEST_INSTALL_PACKAGES` + FileProvider.

---

### 8. 📵 HORS CONNEXION (élégant)

- Écran hors connexion brandé : logo, « Hors connexion », « Vérifie ta connexion et réessaie. »,
  bouton **« Réessayer »** (rouge colombe, pilule) + **« Appeler l'atelier »** + **« WhatsApp »**.
- Reconnexion auto dès que le réseau revient (NetworkCallback) → recharge le site.
- **Aucune URL** affichée.

---

### 9. 📌 FIN DE VIE DE L'APP (fermeture propre)

- **Retour arrière** : navigue dans l'historique du site → au premier écran → **ferme l'app**
  avec une transition en fondu (pas de crash, pas d'écran noir).
- **OnDestroy** : libère proprement (déconnecte le NetworkCallback, retire le pont JS, annule les handlers).
- **Sauvegarde d'état** : la position/la page courante est conservée à la rotation.

---

### 10. 🧪 Critères d'acceptation (à vérifier)

1. L'icône est magnifique (fond rose + « C » rouge colombe + fil or), visible sur tous les lanceurs.
2. Le splash est spectaculaire (diaporama + wordmark + fil doré) et ne dure pas trop (~2,5 s).
3. Le hub natif est élégant, complet, fluide au scroll et au tap.
4. Le WebView n'a **aucun aspect "navigateur"** (pas de barre, pas de blanc, pas de scrollbar système).
5. Les notifications matin/soir sont bienveillantes et variées ; les événements notifient.
6. La mise à jour auto fonctionne : propose quand une version > existe, silence si à jour.
7. Le mode avion → écran hors connexion élégant, reconnexion auto.
8. La fermeture est propre (fondu, pas de crash).
9. `./gradlew :app:assembleRelease` passe ; APK `colombes-atelier-4.3.0-release.apk`.

Génère le code complet, améliore tous les composants existants, ajoute ce qui manque,
et fournis les commandes pour compiler + publier la Release GitHub `v4.3.0`.

## ══════════════ FIN DU PROMPT ══════════════
