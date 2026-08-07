# 📱 Colombes — Application Android (Kotlin + WebView premium)

Application Android native **Kotlin** « **Colombes** » pour l'atelier de couture
**Les Services Colombes**. Elle embarque le site dans une WebView plein écran,
**invisible et premium** : l'utilisateur ne voit **jamais l'URL** d'hébergement.

- **Package** : `com.colombes.atelier`
- **Nom affiché** : `Colombes`
- **Slogan** : « Atelier de Couture d'Exception — Porto-Novo »
- **Palette** : bleu ciel `#87CEEB`, vert citron `#BFFF00`, marron `#8B4513`, fil d'or `#C9A87C`

---

## 🧱 Structure

```
colombes-android/
├── settings.gradle.kts / build.gradle.kts / gradle.properties
├── gradlew / gradle/wrapper/gradle-wrapper.properties
├── .github/workflows/android.yml        → CI qui compile l'APK
└── app/
    ├── build.gradle.kts
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/colombes/atelier/
        │   ├── AppConfig.kt              ← URL définie UNE seule fois
        │   ├── MainActivity.kt            ← activité unique (splash synchro + moteur + hors-ligne)
        │   ├── engine/ColombesGeckoView.kt ← moteur GeckoView embarqué (autonome)
        │   ├── engine/GeckoRuntimeHolder.kt
        │   ├── engine/GeckoJsBridge.kt     ← pont "ColombesApp"
        │   ├── engine/BridgeInstaller.kt   ← WebExtension (bridge)
        │   ├── sync/UpdateChecker.kt      ← détection auto des mises à jour
        │   ├── sync/UpdateWorker.kt       ← WorkManager (toutes les 6 h)
        │   ├── web/DownloadHelper.kt      ← tickets PDF
        │   ├── web/StitchingLineView.kt
        │   └── offline/OfflineFragment.kt
        └── assets/extensions/colombes-bridge/  ← WebExtension (content + background)
        └── res/                           ← layouts, palette, icônes, logo
```

## ⚙️ Configuration

Toute l'URL vit dans **`AppConfig.kt`** :

```kotlin
object AppConfig {
    const val HOME_URL = "https://couturecolombe.vercel.app/"
    const val CONTACT_PHONE = "+22900000000"   // ← remplace par le vrai numéro
}
```

## 🚀 Compiler l'APK

La compilation se fait **dans GitHub Codespaces** (recommandé) ou **via la CI**
(onglet *Actions* → `Build APK`). Voir le guide complet : **`../BUILD.md`**.

```bash
# Dans le terminal du Codespace
cd colombes-android
./gradlew :app:assembleDebug
```

APK produit : `app/build/outputs/apk/debug/colombes-atelier-2.1.0-debug.apk`
(et `-release.apk` pour une version signée).

### Installer sur un téléphone

- **Envoi de fichier** : télécharger l'APK depuis le Codespace puis l'ouvrir
  sur le téléphone (autoriser « Sources inconnues »).
- **Via USB + adb** : `adb install app/build/outputs/apk/debug/colombes-atelier-2.1.0-debug.apk`

## 🎬 Splash synchronisé

L'app est **une seule activité** sur **GeckoView** (moteur embarqué, autonome,
indépendant du WebView/Chrome système → rendu identique sur tous les téléphones).
Le splash cinématique (rideaux + wordmark + fil doré) reste affiché **jusqu'à ce
que la page d'accueil soit réellement rendue**, puis ouvre les rideaux en fondu.

## 🔔 Notifications

- **Programmées** : matin 08h00 et soir 19h00 (heure locale) via AlarmManager.
- **Événements du site** captés par la WebView (formulaires, appels, WhatsApp,
  tickets PDF) → notification locale élégante.
- **Mises à jour auto** : WorkManager vérifie `app-manifest.json` toutes les 6 h
  et notifie « ✨ Nouveautés » quand le site change.
- **Jamais** d'URL du site dans une notification.
- Permission demandée au 1er lancement ; alarme exacte si accordée, sinon repli.

## 📌 Rappel d'acceptation

Splash animé ≤ 2 s sans URL visible · navigation interne fluide ·
WhatsApp/tél/mail/Maps ouvrent les apps natives · les tickets PDF se téléchargent
et s'ouvrent · pull-to-refresh en haut de page · mode avion → écran hors connexion
avec « Réessayer » · rotation sans rechargement.
