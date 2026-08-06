#!/usr/bin/env sh
#
# Configuration complète de l'environnement Android dans un Codespace Alpine.
# À lancer SI le .devcontainer n'a pas tourné (image Alpine) :
#
#     bash colombes-android/setup-alpine.sh
#
# Idempotent : peut être relancé sans risque.
#
set -e

echo "==> Setup Android (Alpine) — Colombes"

# 1) Packages système
sudo apk add openjdk17-jdk openjdk17-jre gradle git wget unzip 2>/dev/null \
  || apk add openjdk17-jdk openjdk17-jre gradle git wget unzip

# 2) JAVA_HOME auto-détection (on accepte 17 ou 21, les deux compilent vers 17)
JAVA_BIN="$(readlink -f "$(command -v java)" 2>/dev/null || true)"
JAVA_HOME="${JAVA_BIN%/bin/java}"
[ -n "$JAVA_HOME" ] || JAVA_HOME=/usr/lib/jvm/java-21-openjdk
export JAVA_HOME
export PATH="$JAVA_HOME/bin:$PATH"

grep -q "JAVA_HOME=" ~/.bashrc 2>/dev/null || {
  echo "export JAVA_HOME=$JAVA_HOME" >> ~/.bashrc
  echo 'export PATH=$PATH:$JAVA_HOME/bin' >> ~/.bashrc
}

# 3) Android SDK (si absent)
SDK="$HOME/android-sdk"
if [ ! -x "$SDK/cmdline-tools/latest/bin/sdkmanager" ]; then
  echo "==> Installation de l'Android SDK"
  rm -rf "$SDK" && mkdir -p "$SDK/cmdline-tools"
  cd /tmp
  wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
  unzip -q commandlinetools-linux-11076708_latest.zip -d /tmp/ct
  mkdir -p "$SDK/cmdline-tools/latest"
  mv /tmp/ct/cmdline-tools/* "$SDK/cmdline-tools/latest/"
  rm -rf /tmp/ct commandlinetools-linux-11076708_latest.zip
  cd - >/dev/null 2>&1 || true
fi

grep -q "ANDROID_HOME=" ~/.bashrc 2>/dev/null || {
  echo "export ANDROID_HOME=$SDK" >> ~/.bashrc
  echo 'export ANDROID_SDK_ROOT=$ANDROID_HOME' >> ~/.bashrc
  echo 'export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools' >> ~/.bashrc
}
export ANDROID_HOME="$SDK"
export ANDROID_SDK_ROOT="$SDK"
export PATH="$PATH:$SDK/cmdline-tools/latest/bin:$SDK/platform-tools"

# 4) Licences + composants SDK
echo "==> Acceptation des licences + composants"
yes | sdkmanager --licenses >/dev/null 2>&1 || true
sdkmanager "platforms;android-35" "build-tools;35.0.0" "platform-tools"

# 5) local.properties + wrapper Gradle
PROJ="$(cd "$(dirname "$0")" && pwd)"
echo "sdk.dir=$SDK" > "$PROJ/local.properties"
chmod +x "$PROJ/gradlew" 2>/dev/null || true
if [ ! -f "$PROJ/gradle/wrapper/gradle-wrapper.jar" ]; then
  echo "==> Génération du wrapper Gradle"
  (cd "$PROJ" && gradle wrapper --gradle-version 8.11.1)
fi

echo ""
echo "==> Setup terminé ✅"
echo "    Compilation :  cd $PROJ && ./gradlew :app:assembleDebug"
echo ""
