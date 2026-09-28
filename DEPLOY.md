# 🚀 Déploiement — Couture Colombe et Merceries (depuis Termux)

> 📁 **Ton dossier projet** : les flux ci-dessous écrivent `~/lsc2`, mais chez toi le projet vit dans **`~/cv2`** — même geste, remplace simplement le nom (et le caveau devient `~/cv2_caveau`). 💛

> **Trois livrables, trois gestes :**
> - 🧵 **`lsc-colombes-complet.zip`** (≈ 15 Mo) — TOUT le projet, vraies images comprises. **Le choix sûr.**
> - 🪶 **`lsc-colombes-complet-placeholder.zip`** (≈ 1,9 Mo) — TOUT le projet, mais les grandes photos sont des **marqueurs de pose** (logo et icônes réels). Pour la connexion plume : on repose ensuite les vraies photos par-dessus (lis `RESTAURER-IMAGES.txt` à sa racine — **jamais dézippé par-dessus un dossier qui a déjà les vraies photos !**).
> - 🕊️ **`lsc-colombes-leger.zip`** (≈ 45 Ko) — uniquement les fichiers modifiés de la dernière réparation, à écraser dans le projet existant à jour.

> 📦 **Archiver un paquet sans le dézipper** (ex. dans `/storage/emulated/0/Web+/cv2`) :
> ```bash
> mkdir -p "/storage/emulated/0/Web+/cv2"
> curl -L -o "/storage/emulated/0/Web+/cv2/lsc-colombes-complet-placeholder.zip" \
>   "https://raw.githubusercontent.com/Stein500/LSC/arena/019fce3a-lsc/lsc-colombes-complet-placeholder.zip"
> ```

---

## 📥 Procédure express — ZIP COMPLET (≈ 5 min, AUCUN Ctrl+C)

```bash
# 1. Télécharge le zip complet directement depuis GitHub
curl -L -o /sdcard/Download/lsc-colombes-complet.zip "https://raw.githubusercontent.com/Stein500/LSC/arena/019fce3a-lsc/lsc-colombes-complet.zip"

# (vérifie le poids — il doit dépasser 11 Mo)
ls -lh /sdcard/Download/lsc-colombes-complet.zip
```

```bash
# 2. Mise au caveau de l'ancien dossier (RIEN n'est jamais perdu 🕊️)
mv ~/lsc2 ~/lsc2_caveau
mkdir -p ~/lsc2

# 3. Dézippe le projet complet dedans
unzip -o /sdcard/Download/lsc-colombes-complet.zip -d ~/lsc2/
```

```bash
# 4. Déploie (PATIENCE — vercel rebuild tout côté serveur)
cd ~/lsc2
vercel --prod --force 2>&1 | tee /sdcard/vercel-final.log
```

> 🪆 Le zip ne contient ni `node_modules/` ni `dist/` (inutiles — Vercel les reconstruit sur ses serveurs).
> 🗃️ Au prochain déploiement, remplace le caveau : `mv ~/lsc2 ~/lsc2_caveau2`.

---

## 🕊️ Variante — ZIP LÉGER (uniquement les fichiers modifiés)

> À utiliser quand le projet `~/lsc2` existe déjà et qu'on a juste livré une réparation.

```bash
# 1. Télécharge le zip léger
curl -L -o /sdcard/Download/lsc-colombes-leger.zip "https://raw.githubusercontent.com/Stein500/LSC/arena/019fce3a-lsc/lsc-colombes-leger.zip"

# 2. Écrase les fichiers modifiés dans le projet EXISTANT (le reste reste en place)
unzip -o /sdcard/Download/lsc-colombes-leger.zip -d ~/lsc2/

# 3. (Recommandé) Lis le petit mot qui explique la réparation
cat ~/lsc2/LISEZMOI-LEGER.txt

# 4. Déploie
cd ~/lsc2
vercel --prod --force 2>&1 | tee /sdcard/vercel-final.log
```

> ⚠️ Le léger suppose que le COMPLET d'avant est déjà en place dans `~/lsc2`.
> En cas de doute → COMPLET, toujours gagnant.

---

## ⌛ Pendant le deploy, tu vas voir dans l'ordre

1. `Retrieving project…`
2. `Downloading N deployment files…`
3. `Running "vercel build"`
4. `npm install --legacy-peer-deps --no-audit --no-fund`…
5. `vite v7.x building client environment for production...`
6. `✓ built in ~45s`
7. `✅ Ready in ~1 min` ← **SUCCÈS** 🕊️

---

## ⛔ Ce qu'il NE FAUT PAS faire

- `Ctrl+C` → coupe le log avant l'erreur
- `Ctrl+Z` → suspend le processus
- `npm install` local → Vercel le fait déjà côté serveur (économise ton forfait)

---

## 🆘 En cas d'erreur

```bash
cat /sdcard/vercel-final.log
```
Garde les lignes commençant par `npm error` ou `Error:` — elles disent tout.

---

## TL;DR (à copier-coller tel quel)

```bash
curl -L -o /sdcard/Download/lsc-colombes-complet.zip "https://raw.githubusercontent.com/Stein500/LSC/arena/019fce3a-lsc/lsc-colombes-complet.zip"
mv ~/lsc2 ~/lsc2_caveau
mkdir -p ~/lsc2
unzip -o /sdcard/Download/lsc-colombes-complet.zip -d ~/lsc2/
cd ~/lsc2
vercel --prod --force 2>&1 | tee /sdcard/vercel-final.log
```

☕ Et on attend 4-5 min que la colombe se pose.
