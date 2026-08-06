# 🔧 Compiler l'APK « Colombes » dans **GitHub Codespaces**

Guide pas-à-pas pour produire l'APK **uniquement dans le Codespace** du projet.
L'environnement est **reproductible** grâce au `.devcontainer` commité : rien
n'est perdu après `gh codespace stop`, et un Codespace neuf est prêt tout seul.

> ⚠️ **Termux** n'est PAS utilisé ici : un Codespace tourne sous Ubuntu. On
> utilise son terminal intégré (commandes `apt`/`bash`).

---

## 1) Créer le Codespace (1 clic)

Sur GitHub, dans **Stein500/LSC** :

1. Bouton **`<> Code`** → onglet **Codespaces** → **`+` (Create codespace on …)**.
   Choisis la branche `arena/019fd2e7-lsc`.
2. Le Codespace démarre **et installe tout automatiquement**
   (Java 17 + Android SDK + Gradle) grâce à `.devcontainer/devcontainer.json`
   + `setup-android-sdk.sh`. ~2-4 min la 1ʳᵉ fois.

## 2) (Vérif) Les commandes de base

Dans le **terminal** du Codespace :

```bash
java -version          # → openjdk 17
echo $ANDROID_HOME     # → /home/vscode/android-sdk
sdkmanager --version   # → doit répondre
```

Si une de ces commandes échoue (terminal ouvert avant la fin du setup),
ferme puis rouvre un terminal, ou relance le setup :

```bash
bash .devcontainer/setup-android-sdk.sh
```

## 3) Compiler l'APK **debug**

```bash
cd colombes-android
./gradlew :app:assembleDebug
```

> ⏳ La 1ʳᵉ compilation télécharge les dépendances AndroidX : ~2-5 min.
> Les suivantes sont rapides.

Résultat :

```bash
ls -lh app/build/outputs/apk/debug/*.apk
# → app/build/outputs/apk/debug/colombes-atelier-2.0.0-debug.apk
```

## 4) Récupérer l'APK

Dans l'**Explorateur** de fichiers du Codespace :

- Clic droit sur `colombes-android/app/build/outputs/apk/debug/colombes-atelier-2.0.0-debug.apk`
- → **Download**.
- Puis envoie/installe ce fichier sur ton téléphone (autoriser « Sources inconnues »).

## 5) (Optionnel) APK **release**

```bash
./gradlew :app:assembleRelease
```
L'APK est dans `app/build/outputs/apk/release/` (non signé ; pour la
production il faudra le signer avec un keystore — l'APK **debug** suffit
pour un usage personnel).

---

## 🐧 Codespace sur Alpine (si le setup auto ne tourne pas)

Parfois le Codespace démarre sur l'image **Alpine** (au lieu de mon `.devcontainer`
Ubuntu), donc Java + SDK ne sont pas installés automatiquement. Dans ce cas,
**une seule commande** reconfigure tout :

```bash
bash colombes-android/setup-alpine.sh
```

Puis compile :

```bash
cd colombes-android && ./gradlew :app:assembleDebug
```

Le script est idempotent : après `gh codespace stop` (disque conservé), il ne
réinstalle que ce qui manque.

## ♻️ Persistance & arrêt (point 3)

- **`gh codespace stop`** **arrête** le Codespace : le disque (SDK + Gradle +
  fichiers) est **conservé**. Pour relancer : le bouton **Codespaces** → *Open*.
- Même si le Codespace est **reconstruit/recréé**, `.devcontainer` + le script
  réinstallent l'environnement **automatiquement** : aucun risque de tout perdre.
- Les commandes et fichiers de config **sont commités dans le repo**, donc
  disponibles à chaque fois.

### Commandes utiles (depuis ton PC) :

```bash
# créer / ouvrir le codespace
gh codespace create --repo Stein500/LSC --branch arena/019fd2e7-lsc
gh codespace code

# arrêter (conserve le disque)
gh codespace stop

# liste / supprimer (⚠️ supprime le disque, pas le repo)
gh codespace list
gh codespace delete -c <nom>
```

---

## 🔔 Rappel des fonctionnalités

- Splash animé ≤ 2 s, aucune URL visible.
- Navigation interne fluide + liens natives (WhatsApp/tél/mail/Maps).
- **Notifications matin (08h00) et soir (19h00)** programmées.
- **Événements du site → notifications élégantes** (formulaires, appels,
  WhatsApp, tickets PDF), **sans jamais afficher l'URL**.
- Permission notif demandée au 1er lancement ; alarme exacte avec repli.
- Mode avion → écran hors connexion avec « Réessayer ».
