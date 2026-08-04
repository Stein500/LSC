#!/usr/bin/env bash
# =============================================================
# scripts/bump-image.sh
# -------------------------------------------------------------
# Workflow 1-commande pour propager une nouvelle image à tous
# les visiteurs du site.
#
# Usage :
#   ./scripts/bump-image.sh "/images/logo.webp"
#   ./scripts/bump-image.sh "/images/gallery/atelier-01.webp"
#
# Si l'image n'existe pas encore dans data/image-versions.json,
# elle est ajoutée avec la version 1.
#
# Le script :
#   1. Bump le numéro de version dans data/image-versions.json
#   2. Te demande si tu veux commit + push
#
# Tu peux enchaîner plusieurs bump :
#   ./scripts/bump-image.sh "/images/logo.webp"
#   ./scripts/bump-image.sh "/images/header-colombes.webp"
#   git add . && git commit -m "update images" && git push
# =============================================================

set -e

if [ -z "$1" ]; then
  echo "❌ Usage : $0 <chemin-image>"
  echo "   Exemple : $0 /images/logo.webp"
  exit 1
fi

IMG_PATH="$1"
JSON_FILE="data/image-versions.json"

# Vérif que le JSON existe
if [ ! -f "$JSON_FILE" ]; then
  echo "❌ Fichier $JSON_FILE introuvable"
  exit 1
fi

# Récupère la version actuelle (0 si absente)
CURRENT=$(node -e "
  const fs = require('fs');
  const data = JSON.parse(fs.readFileSync('$JSON_FILE', 'utf8'));
  console.log(data['$IMG_PATH'] || 0);
")

NEXT=$((CURRENT + 1))

echo "📸 Image : $IMG_PATH"
echo "🔢 Version actuelle : $CURRENT"
echo "🔢 Nouvelle version : $NEXT"
echo ""

# Bump via Node (JSON propre, pas de problèmes de quoting)
node -e "
  const fs = require('fs');
  const path = '$JSON_FILE';
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data['$IMG_PATH'] = $NEXT;
  // Tri alphabétique des clés pour un diff Git propre
  const sorted = {};
  Object.keys(data).sort().forEach(k => sorted[k] = data[k]);
  fs.writeFileSync(path, JSON.stringify(sorted, null, 2) + '\n');
  console.log('✅ Fichier mis à jour :');
  console.log(JSON.stringify(sorted, null, 2));
"

echo ""
echo "👉 Prochaines étapes :"
echo "   git add public${IMG_PATH} $JSON_FILE"
echo "   git commit -m \"chore: bump $IMG_PATH v$NEXT\""
echo "   git push"
echo ""
read -p "🚀 Commit + push maintenant ? (o/N) " ANSWER

if [[ "$ANSWER" =~ ^[oOyY]$ ]]; then
  git add "public${IMG_PATH}" "$JSON_FILE"
  git commit -m "chore: bump $IMG_PATH v$NEXT"
  git push
  echo ""
  echo "🎉 C'est parti ! Vercel va redéployer dans ~30s."
  echo "   Au prochain refresh, tous les visiteurs verront la nouvelle image."
else
  echo "👍 OK, le JSON est mis à jour. Tu commit quand tu veux."
fi
