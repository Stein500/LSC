#!/usr/bin/env bash
#
# Génère un keystore + build l'APK release signé (v2.2.0).
# À lancer dans le Codespace, une seule fois (le keystore est créé s'il manque).
#
# ⚠️ GARDE précieusement : colombes.keystore ET le mot de passe.
#    Sans eux, aucune mise à jour ne sera possible.
#
set -e

cd "$(dirname "$0")"

KEYSTORE="colombes.keystore"
STORE_PASS="${COLOMBES_STORE_PASS:-}"
ALIAS="colombes"
KEY_PASS="${COLOMBES_KEY_PASS:-$STORE_PASS}"

# 1) Générer le keystore s'il n'existe pas
if [ ! -f "$KEYSTORE" ]; then
  echo "==> Création du keystore '$KEYSTORE'"
  echo "    (réponds aux questions; choisis un mot de passe fort et RETIENS-LE)"
  if [ -z "$STORE_PASS" ]; then
    keytool -genkeypair -v \
      -keystore "$KEYSTORE" \
      -alias "$ALIAS" \
      -keyalg RSA -keysize 2048 -validity 10000
  else
    keytool -genkeypair -v \
      -keystore "$KEYSTORE" \
      -alias "$ALIAS" \
      -keyalg RSA -keysize 2048 -validity 10000 \
      -storepass "$STORE_PASS" -keypass "$KEY_PASS" \
      -dname "CN=Les Services Colombes, OU=Colombes, O=Colombes, L=Porto-Novo, ST=Oueme, C=BJ"
  fi
else
  echo "==> Keystore déjà présent, on réutilise."
fi

# 2) Le keystore n'est jamais commité (gitignore). On l'ajoute au gitignore de sécurité.
grep -q "^colombes.keystore" .gitignore 2>/dev/null || echo "colombes.keystore" >> .gitignore
grep -q "^keystore.properties" .gitignore 2>/dev/null || echo "keystore.properties" >> .gitignore

# 3) Créer keystore.properties si absent
if [ ! -f keystore.properties ]; then
  echo "==> Création de keystore.properties"
  # Si le mot de passe est fourni, on l'écrit; sinon, on le demande
  if [ -z "$STORE_PASS" ]; then
    read -rsp "Mot de passe du keystore: " STORE_PASS; echo
    read -rsp "Mot de passe de la clé (Entrée = même que keystore): " KEY_PASS; echo
    KEY_PASS="${KEY_PASS:-$STORE_PASS}"
  fi
  cat > keystore.properties <<EOF
storeFile=$KEYSTORE
storePassword=$STORE_PASS
keyAlias=$ALIAS
keyPassword=$KEY_PASS
EOF
fi

echo "==> Build APK release signé..."
./gradlew :app:assembleRelease

echo ""
echo "✅ APK signé :"
ls -lh app/build/outputs/apk/release/*.apk
echo ""
echo "🔐 GARDE '$KEYSTORE' et le mot de passe EN LIEU SÛR (jamais sur GitHub)."
