# 🚀 Procédure de déploiement Vercel depuis Termux

## Ce qui a été corrigé dans ce zip v2

| Fichier | Modification | Pourquoi |
|---|---|---|
| `.nvmrc` | **créé** avec `22.11.0` | Force Vercel à considérer Node 22.11.0 (npm 10.x, pas le 11.x buggé) |
| `package.json` → `engines.node` | `"22.x"` → `"22.11.0"` (pinné) | Élimine le warning `EBADENGINE`, Vercel respecte la version exacte |
| `package.json` → `engines.npm` | ajouté `"10.9.4"` | Verrouille npm 10, pas le 11 cassé |
| `package.json` → `dependencies` | **viré `puppeteer-core`** | Cause probable du crash npm ("Exit handler never called"). Tu n'en as plus besoin (capture.cjs supprimé) |
| `package-lock.json` | régénéré, **sans puppeteer-core + @puppeteer/browsers** | Lockfile cohérent avec le nouveau package.json, plus léger de 30 Mo |
| `capture.cjs` | **supprimé** | Plus de captures d'écran locales, fichier obsolète |
| `vercel.json` | `installCommand` : `npm ci` → `npm install` | `npm install` est plus tolérant, reconstruit le tree si besoin |
| `.npmrc` | + `ignore-scripts=true` + `engine-strict=false` | Évite les postinstalls (esbuild, etc.) qui pendent sur le serveur Vercel |

---

## Procédure de déploiement (3-4 min, AUCUN Ctrl+C)

```bash
# 1. Vide lsc2 et recopie le dossier patché
cd ~/lsc2
find . -maxdepth 1 ! -name "node_modules" ! -name "." ! -name ".." -exec rm -rf {} + 2>/dev/null
unzip -o /sdcard/Download/lesservicescolombes-patched-v2.zip -d /sdcard/Web+/
cp -r /sdcard/Web+/patch/. ~/lsc2/
cd ~/lsc2

# 2. V\u00e9rifie que tout est OK
cat .nvmrc                         # 22.11.0
grep -A3 '"engines"' package.json  # node 22.11.0, npm 10.9.4
grep installCommand vercel.json    # npm install --legacy-peer-deps --no-audit --no-fund
cat .npmrc                         # ignore-scripts=true
ls capture.cjs 2>&1                # "No such file" = OK
grep -c puppeteer package.json     # 0 = OK

# 3. Deploy (PATIENCE, AUCUN Ctrl+C)
vercel --prod --force 2>&1 | tee /sdcard/vercel-final.log
```

---

## Pendant le deploy

Tu vas voir dans l'ordre :
1. `Retrieving project…`
2. `Downloading N deployment files…`
3. `Running "vercel build"`
4. `Running "install" command: \`npm install --legacy-peer-deps --no-audit --no-fund\`...`
5. `npm warn EBADENGINE ... current: { node: 'v22.x.x', npm: '10.x.x' }` (normal, c'est le pin engines)
6. `vite v7.3.2 building client environment for production...`
7. `✓ built in ~45s`
8. `✅ Ready in 41s` ← SUCCÈS

---

## ⛔ Ce qu'il NE FAUT PAS faire

- `Ctrl+C` → coupe le log avant l'erreur, on revient à la case départ
- `Ctrl+Z` → suspend, le fichier reste vide
- `npm install` local → gaspille du forfait pour rien (Vercel le fait côté serveur)

---

## Si tu vois encore une erreur

```bash
cat /sdcard/vercel-final.log
```

Envoie-moi tout le contenu, en particulier les lignes qui commencent par `npm error` ou `Error:`.

---

## Workflow futur

Pour tes prochains patchs :

```bash
cd ~/lsc2
# édite tes fichiers
vercel --prod --force
```

Si tu ajoutes une nouvelle dep, **fais-le dans le dossier cv2/ original** puis recopie. Si tu touches `package.json`, régénère le lockfile :
```bash
cd /storage/emulated/0/Web+/cv2/
rm -f package-lock.json
npm install
# puis recopie tout dans lsc2 comme d'habitude
```

---

## TL;DR

```bash
cd ~/lsc2
find . -maxdepth 1 ! -name "node_modules" ! -name "." ! -name ".." -exec rm -rf {} + 2>/dev/null
unzip -o /sdcard/Download/lesservicescolombes-patched-v2.zip -d /sdcard/Web+/
cp -r /sdcard/Web+/patch/. ~/lsc2/
cd ~/lsc2
vercel --prod --force 2>&1 | tee /sdcard/vercel-final.log
```

☕ Et on attend 4 min.
