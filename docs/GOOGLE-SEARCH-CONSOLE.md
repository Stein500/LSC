# 🌐 Google Search Console — le guide pas-à-pas de Maman Colombe

> But : que Google **référence toutes les pages et toutes les images** du site
> `https://lesservicescolombes.vercel.app`.
> Tout se fait **depuis le téléphone**, dans le navigateur. Compte Google conseillé :
> `lesservicescolombes@gmail.com` (ou `techsteinsecureway@gmail.com` — les deux conviennent).

---

## Étape 1 — Ouvrir la console et retrouver la propriété 🏠

1. Ouvre : **https://search.google.com/search-console**
2. Connecte-toi avec ton compte Google.
3. En haut à gauche, ouvre le sélecteur de propriété :
   - si **`https://lesservicescolombes.vercel.app`** apparaît → choisis-la, c'est bon ✅
     *(le fichier `google345f448c750dcad8.html` est déjà posé sur le site — la
     vérification « fichier HTML » passe toute seule.)*
   - sinon → **« + Ajouter une propriété »** → à droite, **Préfixe d'URL** → colle
     `https://lesservicescolombes.vercel.app` → Continuer → choisis la méthode
     **« Fichier HTML »** → **Valider** (le fichier est déjà en ligne, pas besoin de l'y remettre).

## Étape 2 — Soumettre les deux plans du site 🗺️

1. Menu latéral gauche → **« Sitemaps »**.
2. Dans « Ajouter un sitemap », tape : **`sitemap.xml`** → **Envoyer**.
3. Recommence avec : **`image-sitemap.xml`** → **Envoyer**.
4. Statut « Réussite » ou « En attente » : les deux sont normaux —
   Google viendra lire les **6 pages et les 67 images** qu'ils contiennent. ✔

## Étape 3 — Demander l'indexation de chaque page 🔍

Dans la **grande barre bleue tout en haut** (« Inspecter n'importe quelle URL ») :

1. **Colle une adresse complète** (une par une) → touche **Entrée**.
2. Attends le verdict (10–30 s).
3. Touche **« DEMANDER UNE INDEXATION »** → attends le feu vert (1–2 min).
4. Passe à l'adresse suivante.

**Les 6 pages à inspecter** (à copier une par une) :

```
https://lesservicescolombes.vercel.app/
https://lesservicescolombes.vercel.app/services
https://lesservicescolombes.vercel.app/inspirations
https://lesservicescolombes.vercel.app/formation
https://lesservicescolombes.vercel.app/contact
https://lesservicescolombes.vercel.app/mentions-legales
```

> ⛔ Pas besoin d'inspecter `/merci`, `/tickets`, `/parametres`, `/notifications`,
> `/api/…` : ce sont des pages privées/techniques — `robots.txt` les écarte
> volontairement des résultats.

## Étape 4 — Suivre les images 📸

- Rien à soumettre image par image : les **67 photos sont déclarées** dans les
  deux sitemaps, chacune rangée sur sa page (accueil, inspirations, services,
  formation, contact) avec son joli titre.
- Après quelques jours à quelques semaines, elles apparaîtront dans
  **Google Images**. Pour suivre : Menu **« Performance »** → type d'apparence
  **« Images »** / filtre de recherche **« Image »**.
- Astuce : dans Google, cherche `site:lesservicescolombes.vercel.app` pour voir
  ce qui est déjà indexé.

## Étape 5 — Après chaque grande mise à jour du site 🔁

1. Redemande l'indexation de la page **d'accueil** (Étape 3).
2. Si de **nouvelles photos** ont été ajoutées : dis-le à chef — le plan des
   images se régénère d'un geste (`python3 scripts/make-sitemaps.py`), puis
   re-soumets `image-sitemap.xml` dans la console.

---

*Le site vit seul à son adresse — ce fil le remet en fleur.* 🧵
