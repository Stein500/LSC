# 🕊 LES SERVICES COLOMBES — Page « Télécharger l'app »

**Domaine officiel :** `https://lesservicescolombes.vercel.app`
*(l'ancien domaine `couturecolombe…` n'apparaît nulle part — c'est volontaire.)*

---

## 1. Ce qu'il y a dans ce dossier

```
landing/
├── index.html               → la page marketing (une seule page, ultra rapide)
├── app-release.json         → manifeste lu par la page (généré, ne pas éditer)
├── google345f448c750dcad8.html → JETON Search Console (conservé, déjà en ligne)
├── manifest.webmanifest     → identité "app" de la page
├── robots.txt               → SEO : laisse tout indexer
├── sitemap.xml              → SEO : la page + images
├── vercel.json              → config Vercel (anciennes versions d'APK, caches)
├── assets/                  → styles.css, app.js, favicons
├── images/                  → logo, hero, galerie, og-image.jpg (×2 variantes, WebP optimisés)
├── downloads/               → C'EST ICI QUE TU DÉPOSES L'APK
└── scripts/
    └── update-app-release.mjs → détecte la version de l'APK automatiquement
```

---

## 2. 📦 Publier l'APK — le flux officiel : **GitHub Releases**

**Le site n'héberge plus l'APK : il lit ta dernière release GitHub en direct.**
Publier une nouvelle version = créer la release, **sans toucher au site ni redéployer** :

```bash
# depuis n'importe où (Termux compris, si gh est installé)
gh release create v2.1.0 colombes-atelier-2.1.0.apk \
  --repo Stein500/LSC \
  --title "Colombes v2.1.0" \
  --notes "Nouveautés de la version 2.1.0"
```

ou via le web : github.com/Stein500/LSC → **Releases** → *Draft a new release* →
tag `v2.1.0` → glisse l'APK → *Publish release*.

La page affiche alors automatiquement, à chaque visite (API publique GitHub) :

> **« Télécharger l'app Colombes — v2.1.0 · 6,7 Mo · APK Android »**
> + pastille citron version/taille + date de mise en ligne + compteur de téléchargements

⚠️ Points clés :
- la release responsable est celle marquée **« Latest »** (la plus récente publiée) ;
- le fichier doit finir par **`.apk`** ; la version est lue dans le tag (`v2.1.0`) ou le nom ;
- le dépôt étant **public**, la page de release montre aussi le code — c'est assumé.
  Si un jour le code doit devenir privé → déplace les releases dans un dépôt
  public dédié (ex : `Stein500/colombes-app-releases`) et change `GH_REPO`
  en haut de `assets/app.js` ;
- si l'API GitHub est momentanément limitée (60 requêtes/h/IP), les boutons
  basculent proprement vers la page `releases/latest` — jamais de lien mort.

### Option miroir local (prioritaire si utilisée)
Un APK déposé dans `downloads/` + `node scripts/update-app-release.mjs`
prend le **dessus** sur GitHub (utile pour servir depuis ton domaine).
Sinon, laisse `downloads/` vide : c'est GitHub qui parle.
Tant qu'il n'y a ni miroir ni release, la page reste en mode « liste d'attente » WhatsApp.

---

## 3. 🚀 Déployer sur Vercel (la première fois)

### Option A — glisser-déposer (2 minutes)
1. Va sur <https://vercel.com/new> → onglet **“Deploy”** par drag & drop
   (ou `vercel deploy` depuis ce dossier).
2. Dépose **le contenu de `landing/`** (pas le dossier parent).
3. Nomme le projet **`lesservicescolombes`** → l'URL sera
   `https://lesservicescolombes.vercel.app`.

### Option B — dépôt Git
Connecte un dépôt contenant ce dossier ; dans les réglages du projet Vercel :
- **Framework Preset :** `Other` (site statique, pas de build nécessaire)
- **Build Command :** `node scripts/update-app-release.mjs || true` *(déjà dans vercel.json)*
- **Output Directory :** `.` *(la racine du dossier)*

> Si l'URL `lesservicescolombes.vercel.app` est déjà prise par un ancien projet
> qui hébergeait le site déplacé : supprime/redéploie ce projet avec CE contenu.

---

## 4. 🔍 Google Search Console — revalidation du site

C'est le point essentiel pour que Google « avale » le changement de nature du site.

### Étape 1 — Vérifier la propriété du NOUVEAU domaine
✅ **Le fichier de vérification de l'ancien site (`google345f448c750dcad8.html`)
est DÉJÀ INCLUS à la racine de cette landing** — le jeton de vérification HTML
est lié à ton compte Google, pas au domaine. Donc :
1. Ouvre <https://search.google.com/search-console> et ajoute une propriété
   **“Préfixe d'URL”** → `https://lesservicescolombes.vercel.app`.
2. Choisis la méthode **“Fichier HTML”** → clique directement **“Valider”** :
   le fichier étant déjà en ligne, la vérification passe **instantanément**.
   *(Si Google te propose un AUTRE jeton un jour, remplace simplement le fichier
   ou ajoute la balise meta dans le `<head>` de `index.html`, à l'endroit
   indiqué par le commentaire HTML prévu.)*

### Étape 2 — Soumettre le sitemap
Dans Search Console → **Sitemaps** → ajoute :
```
https://lesservicescolombes.vercel.app/sitemap.xml
```
Statut attendu : “Opération réussie”.

### Étape 3 — Demander l'indexation (la “revalidation”)
1. En haut, barre **“Inspection d'URL”** → colle `https://lesservicescolombes.vercel.app/`.
2. Clique **“Demander une indexation”**.
3. Google teste la page (1–2 min) puis la met en file d'attente.
   Le nouveau titre/description apparaissent en général sous **24 h à quelques jours**.

### Étape 4 — Nettoyer les restes de l'ANCIEN domaine
Sur la propriété de l'ancien domaine (si c'était lui qui pointait sur le site :
`couturecolombe.vercel.app`, ou sur la racine `vercel.app` selon le compte) :
- **Suppressions (Removals)** → “Nouvelle demande” → préfixe `https://couturecolombe.vercel.app/`
  → masque les anciens résultats ~6 mois pendant que Google réindexe.
- Si l'ancien domaine affiche toujours le vieux site, idéalement mets en place
  des redirections **301** vers `https://lesservicescolombes.vercel.app/`
  (dans le projet Vercel de l'ancien domaine) — l'outil
  **“Changement d'adresse”** de Search Console accélère alors le transfert.
- Les anciennes pages (`/services`, `/formation`, `/contact`…) disparaîtront
  d'elles-mêmes si elles renvoient 404/410 ou redirigent.

### Étape 5 — Suivre
- **Rapport “Pages”** (ex-Couverture) : la page doit passer à “Indexée”.
- **Performances** : surveille les requêtes “application colombes”,
  “robe de mariée porto-novo”, etc.

---

## 5. 🖼 Valider l'aperçu de partage (og:image)

La page publie **2 images OG** (1200×630) — la noire & blanche (`og-image.jpg`,
générée par IA à partir de tes photos) est prioritaire, la version collage
couleur (`og-image-collage.jpg`, 100 % vraies photos) est en seconde position.
Pour inverser : réordonne les balises `og:image` dans `index.html`.

Teste avec :
- **Facebook / Meta** : <https://developers.facebook.com/tools/debug/>
  (colle l'URL → “Gratter à nouveau” pour vider le cache)
- **LinkedIn** : <https://www.linkedin.com/post-inspector/>
- **X / Twitter** : <https://cards-dev.twitter.com/validator>
- **Outil générique** : <https://www.opengraph.xyz/url/https%3A%2F%2Flesservicescolombes.vercel.app>

⚠️ WhatsApp/Facebook gardent l'aperçu en cache : après tout changement
d'og:image, repasse par le debugger Facebook pour “re-gratter”.

---

## 6. ✅ Checklist finale

- [ ] Domaine Vercel = `lesservicescolombes` (vérifier l'URL)
- [x] Fichier de vérification Search Console en ligne *(déjà inclus)*
- [ ] Propriété GSC validée (clique « Valider » → instantané)
- [ ] Sitemap soumis + statut “Opération réussie”
- [ ] “Demander une indexation” faite sur l'accueil
- [ ] Ancien domaine : redirections 301 ou Removals
- [ ] APK déposé + `app-release.json` régénéré (état “téléchargement”)
- [ ] og:image validé sur le debugger Facebook
- [ ] Un partage WhatsApp de test affiche la belle carte 🕊
