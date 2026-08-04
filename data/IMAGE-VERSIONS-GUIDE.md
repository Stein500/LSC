# 📸 Guide des images — pour bump rapide

> Ce fichier est **uniquement pour toi** (lisible / à imprimer).
> Le vrai fichier lu par l'API est `image-versions.json` (sans commentaires, format plat).
>
> Quand tu changes une image, tu édites `image-versions.json` (le fichier plat) et tu bumpes le numéro.

---

## 🏷️ Branding (logo, partage social, header)

```json
"/images/logo.webp":                        →  logo affiché partout (header, footer, splash)
"/images/og-share-preview.webp":            →  image quand on partage le site sur WhatsApp/Facebook
"/images/header-colombes.webp":             →  header SEO par défaut
```

## 📱 Icônes PWA / favicon

```json
"/images/favicon-32.webp":                  →  favicon 32×32 (onglet navigateur)
"/images/icon-192.webp":                    →  icône PWA Android
"/images/icon-512.webp":                    →  icône PWA iOS / splash screen
```

## 🎬 Bannières principales (1 par page)

```json
"/images/hero-services.webp":               →  bannière /services
"/images/hero-formation.webp":              →  bannière /formation
"/images/hero-contact.webp":                →  bannière /contact
"/images/hero-inspirations.webp":           →  bannière /inspirations
```

## 🖼️ Galerie 1 — L'Atelier (page d'accueil, entre "Présentation" et "Services")

```json
"/images/gallery/atelier-01.webp":          →  photo 1 atelier
"/images/gallery/atelier-02.webp":          →  photo 2 atelier
"/images/gallery/atelier-03.webp":          →  photo 3 atelier
"/images/gallery/atelier-04.webp":          →  photo 4 atelier
"/images/gallery/atelier-05.webp":          →  photo 5 atelier
"/images/gallery/atelier-06.webp":          →  photo 6 atelier
```

## 🌍 Galerie 2 — Création Afrique (galerie générique)

```json
"/images/gallery/creation-afrique-01.webp":  →  photo 1
"/images/gallery/creation-afrique-02.webp":  →  photo 2
"/images/gallery/creation-afrique-03.webp":  →  photo 3
"/images/gallery/creation-afrique-04.webp":  →  photo 4
"/images/gallery/creation-afrique-05.webp":  →  photo 5
"/images/gallery/creation-afrique-06.webp":  →  photo 6
```

## 👗 Galerie 3 — Formation Couture (page /formation)

```json
"/images/gallery/formation-couture-01.webp": →  photo 1 formation
"/images/gallery/formation-couture-02.webp": →  photo 2 formation
"/images/gallery/formation-couture-03.webp": →  photo 3 formation
"/images/gallery/formation-couture-04.webp": →  photo 4 formation
"/images/gallery/formation-couture-05.webp": →  photo 5 formation
"/images/gallery/formation-couture-06.webp": →  photo 6 formation
```

## 📞 Galerie page /contact

```json
"/images/gallery/contact-page-01.webp":     →  photo 1 contact
"/images/gallery/contact-page-02.webp":     →  photo 2 contact
"/images/gallery/contact-page-03.webp":     →  photo 3 contact
"/images/gallery/contact-page-04.webp":     →  photo 4 contact
```

## 💡 Galerie page /inspirations

```json
"/images/gallery/inspirations-page-01.webp":  →  photo 1 inspirations
"/images/gallery/inspirations-page-02.webp":  →  photo 2 inspirations
"/images/gallery/inspirations-page-03.webp":  →  photo 3 inspirations
"/images/gallery/inspirations-page-04.webp":  →  photo 4 inspirations
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

Si tu mets un nouveau fichier (ex: `atelier-07.webp`) et tu l'ajoutes dans le code, **tu dois aussi l'ajouter dans `image-versions.json`** avec version 1.

Le script `./scripts/bump-image.sh` le fait **automatiquement** : si l'image n'est pas dans le JSON, il l'ajoute avec version 1. 👌
