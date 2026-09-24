# 📸 Guide des images — pour bump rapide

> Ce fichier est **uniquement pour toi** (lisible / à imprimer).
> Le vrai fichier lu par l'API est `image-versions.json` (sans commentaires, format plat).
>
> Quand tu changes une image, tu édites `image-versions.json` (le fichier plat) et tu bumpes le numéro.

---

## ✂️ Charte 09/2026 — une seule silhouette

- **Gabarit unique : 1600×1200 (4:3 paysage), WebP q78** pour toutes les photos de galerie
  (sauf OG 1200×630, logo et bannière — sacrés, jamais régénérés).
- **Palette maison** : rouge colombe, safran, marron, fil d'or sur rose poudré — **zéro bleu, zéro vert**.
- **Filigrane colombe** en bas à droite de chaque photo.
- **Galeries curées** : peu d'images par page, toutes utiles — le site reste léger.

---

## 🏷️ Branding (logo, partage social, header)

```json
"/images/logo.webp":                        →  logo affiché partout (header, footer, splash)
"/images/og-share-preview.webp":            →  image quand on partage le site sur WhatsApp/Facebook
"/images/header-colombes.webp":             →  header SEO par défaut (1600×1200)
```

## 📱 Icônes PWA / favicon

```json
"/images/favicon-32.webp":                  →  favicon 32×32 (onglet navigateur)
"/images/icon-192.webp":                    →  icône PWA Android
"/images/icon-512.webp":                    →  icône PWA iOS / splash screen
```

## 🎬 Bannières principales (1 par page, 1600×1200)

```json
"/images/hero-services.webp":               →  bannière /services
"/images/hero-formation.webp":              →  bannière /formation
"/images/hero-contact.webp":                →  bannière /contact
"/images/hero-inspirations.webp":           →  bannière /inspirations
```

## 🖼️ Galerie 1 — L'Atelier (accueil, 4 photos)

```json
"/images/gallery/atelier-01.webp":          →  l'équipe autour de la table de coupe
"/images/gallery/atelier-03.webp":          →  mains cousant un ourlet de wax (détail)
"/images/gallery/atelier-04.webp":          →  patron, ciseaux dorés, mètre ruban (coupe)
"/images/gallery/atelier-06.webp":          →  robe wax ajustée sur mannequin de tailleur
```

## 🌍 Galerie 2 — Nos Créations (page /services, 4 photos)

```json
"/images/gallery/creation-afrique-01.webp":  →  grand boubou marron brodé d'or
"/images/gallery/creation-afrique-03.webp":  →  ensemble veste-pantalon wax bordeaux
"/images/gallery/creation-afrique-04.webp":  →  robe moderne wax rouge et safran
"/images/gallery/creation-afrique-05.webp":  →  layette blanc cassé cousue main
```

## 👗 Galerie 3 — Créations Signature (accueil, 5 photos)

```json
"/images/gallery/tenue-semaine-01.webp":    →  tenue de la semaine (robe wax rouge et or)
"/images/gallery/jeune-fille-01.webp":      →  fillette en robe wax safran qui tourne
"/images/gallery/jeune-fille-02.webp":      →  adolescente en wax marron et or
"/images/gallery/layette-bebe-01.webp":     →  bébé en layette brodée safran
"/images/gallery/famille-trio-01.webp":     →  trois générations en tenues assorties
```

## 📞 Galerie page /contact (3 photos)

```json
"/images/gallery/contact-page-01.webp":     →  robe wax sur cintre, mur rose poudré
"/images/gallery/contact-page-02.webp":     →  portant de tenues africaines
"/images/gallery/contact-page-03.webp":     →  carnet de patrons, nuancier, thé fumant
```

## 💡 Galerie page /inspirations (4 photos)

```json
"/images/gallery/inspirations-page-01.webp":  →  robe wax à volants (pièce signature)
"/images/gallery/inspirations-page-02.webp":  →  éventails de pagnes (matières)
"/images/gallery/inspirations-page-03.webp":  →  silhouette boubou terracotta (heure dorée)
"/images/gallery/inspirations-page-04.webp":  →  bobines, ciseaux, patrons (outils)
```

## 🎓 Galerie Formation (page /formation, 4 photos)

```json
"/images/gallery/formation-couture-01.webp": →  salle de formation lumineuse
"/images/gallery/formation-couture-02.webp": →  apprenante à la machine (encadrement)
"/images/gallery/formation-couture-04.webp": →  mains guidant le wax sous l'aiguille
"/images/gallery/formation-couture-05.webp": →  groupe d'apprenantes en séance
```

## 🎬 Divers

```json
"/images/gallery/splash-atelier-01.webp":   →  visuel d'ambiance (splash / transition)
```

---

## 🚀 Workflow express (1 commande)

```bash
./scripts/bump-image.sh "/images/logo.webp"
```

Le script :
1. Trouve la ligne dans `image-versions.json`
2. Bump le numéro (1 → 2 → 3 → ...)
3. Te propose `git commit + git push` automatiquement

---

## 🆘 Si tu ajoutes une nouvelle image dans le site

Si tu mets un nouveau fichier (ex: `atelier-07.webp`) et tu l'ajoutes dans le code,
**tu dois aussi l'ajouter dans `image-versions.json`** avec version 1.

Le script `./scripts/bump-image.sh` le fait **automatiquement** : si l'image n'est pas
dans le JSON, il l'ajoute avec version 1. 👌

> 🧺 **Images retirées au grand tri de 09/2026** (ne plus référencer) :
> atelier-02, atelier-05, contact-page-04, creation-afrique-02, creation-afrique-06,
> formation-couture-03, formation-couture-06, layette-bebe-02,
> tenue-semaine-02, tenue-semaine-03, splash-atelier-02.
