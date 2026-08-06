#!/usr/bin/env bash
#
# Configuration automatique de l'environnement Android dans le Codespace.
# S'exécute automatiquement à la création du Codespace (postCreateCommand).
# Ré-exécutable sans risque : ré-installe uniquement ce qui manque.
#
set -euo pipefail

echo "==> Configuration Android SDK + Gradle pour la build 'Colombes'"

export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export GRADLE_HOME="$HOME/gradle-8.11.1"

# Persiste les variables d'environnement pour tous les nouveaux terminaux
if ! grep -q "ANDROID_HOME=" "$HOME/.bashrc" 2>/dev/null; then
  cat >> "$HOME/.bashrc" <<'EOF'

# --- Environnement Android (Colombes) ---
export ANDROID_HOME="$HOME/android-sdk"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$HOME/gradle-8.11.1/bin"
EOF
fi
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$GRADLE_HOME/bin"

# --- Gradle 8.11.1 ---
if [ ! -x "$GRADLE_HOME/bin/gradle" ]; then
  echo "==> Installation de Gradle 8.11.1"
  cd "$HOME"
  wget -q https://services.gradle.org/distributions/gradle-8.11.1-bin.zip
  unzip -q gradle-8.11.1-bin.zip
  rm gradle-8.11.1-bin.zip
fi

# --- Android cmdline-tools ---
if [ ! -x "$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "==> Installation des Android command-line tools"
  mkdir -p "$ANDROID_HOME/cmdline-tools"
  cd "$ANDROID_HOME/cmdline-tools"
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q commandlinetools-linux-11076708_latest.zip
  rm commandlinetools-linux-11076708_latest.zip
  mkdir -p latest
  mv cmdline-tools/* latest/
  rmdir cmdline-tools
fi

# --- Licences + composants SDK ---
echo "==> Acceptation des licences Android"
yes | sdkmanager --licenses >/dev/null || true
echo "==> Installation de platform-tools, platforms;android-35, build-tools;35.0.0"
sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"

# --- local.properties + wrapper Gradle ---
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
echo "sdk.dir=$ANDROID_HOME" > "$PROJECT_DIR/colombes-android/local.properties"
chmod +x "$PROJECT_DIR/colombes-android/gradlew" 2>/dev/null || true

if [ ! -f "$PROJECT_DIR/colombes-android/gradle/wrapper/gradle-wrapper.jar" ]; then
  echo "==> Génération du wrapper Gradle"
  cd "$PROJECT_DIR/colombes-android"
  "$GRADLE_HOME/bin/gradle" wrapper --gradle-version 8.11.1
fi

echo ""
echo "==> Setup terminé ✅"
echo "    Pour compiler l'APK, lance :"
echo "        cd colombes-android"
echo "        ./gradlew :app:assembleDebug"
echo ""
