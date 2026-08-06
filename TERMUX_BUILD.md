# 🔧 Commandes **Termux** — build de l'APK « Colombes » sur ton téléphone

> ⚠️ Ces commandes s'exécutent **sur ton téléphone** dans **Termux**
> (l'application Android). Elles sont indépendantes du Codespace.

---

## Étape 0 — Préparer Termux

**Commande 1**
```bash
pkg update -y
```

**Commande 2**
```bash
pkg upgrade -y
```

## Étape 1 — Installer les outils

**Commande 3**
```bash
pkg install -y openjdk-17 gradle git wget unzip
```

**Commande 4** — vérifier Java
```bash
java -version
```
> Tu dois voir `openjdk 17`. Sinon réinstalle : `pkg install -y openjdk-17`.

## Étape 2 — Installer l'Android SDK

**Commande 5** — créer le dossier SDK
```bash
mkdir -p $PREFIX/opt/android-sdk/cmdline-tools
```

**Commande 6** — aller dans ce dossier
```bash
cd $PREFIX/opt/android-sdk/cmdline-tools
```

**Commande 7** — télécharger les command-line tools
```bash
wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
```

**Commande 8** — décompresser
```bash
unzip -q commandlinetools-linux-11076708_latest.zip
```

**Commande 9** — supprimer l'archive
```bash
rm commandlinetools-linux-11076708_latest.zip
```

**Commande 10** — réorganiser le dossier
```bash
mkdir -p latest && mv cmdline-tools/* latest/ && rmdir cmdline-tools
```

**Commande 11** — enregistrer les variables d'environnement (une seule fois)
```bash
echo 'export ANDROID_HOME=$PREFIX/opt/android-sdk' >> ~/.bashrc
```

**Commande 12**
```bash
echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
```

**Commande 13** — recharger la config
```bash
source ~/.bashrc
```

**Commande 14** — accepter les licences
```bash
yes | sdkmanager --licenses
```

**Commande 15** — installer les composants SDK (API 35)
```bash
sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"
```
> ⏳ Gros téléchargement : 2-5 min selon le réseau.

## Étape 3 — Récupérer le code

**Commande 16** — cloner le repo
```bash
cd ~ && git clone https://github.com/Stein500/LSC.git
```

**Commande 17** — aller dans le dossier Android
```bash
cd ~/LSC/colombes-android
```

## Étape 4 — Générer le wrapper Gradle (le .jar n'est pas versionné)

**Commande 18**
```bash
gradle wrapper --gradle-version 8.11.1
```

**Commande 19** — vérifier
```bash
ls gradle/wrapper/
```
> Tu dois voir `gradle-wrapper.jar` + `gradle-wrapper.properties`.

## Étape 5 — Compiler l'APK debug

**Commande 20**
```bash
./gradlew :app:assembleDebug
```
> ⏳ La 1ʳᵉ compilation télécharge les dépendances : 2-6 min.

**Commande 21** — vérifier le résultat
```bash
ls -lh app/build/outputs/apk/debug/*.apk
```
> → `app/build/outputs/apk/debug/colombes-atelier-1.0.0-debug.apk`

## Étape 6 — Installer l'APK

**Commande 22** — ouvrir le fichier pour l'installer
```bash
termux-open app/build/outputs/apk/debug/colombes-atelier-1.0.0-debug.apk
```
> Puis toucher le fichier et autoriser « Installer des sources inconnues ».

---

## ✅ Alternative recommandée : Codespace (moins lourd que Termux)

Le code est déjà sur GitHub (branche `arena/019fd2e7-lsc`). Crée le Codespace
en 1 commande depuis **ton terminal (PC)** :

```bash
gh codespace create --repo Stein500/LSC --branch arena/019fd2e7-lsc
gh codespace code
```

Le `.devcontainer` installera Java + Android SDK tout seul. Puis :

```bash
cd colombes-android
./gradlew :app:assembleDebug
```

Et télécharge l'APK via l'Explorateur (clic droit → Download).
