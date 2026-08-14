# 🤝 PASSERELLE SITE ↔ APP COLOMBES — CONTRAT DE SYNCHRONISATION

> **À coller tel quel dans le chat de l'agent qui gère le site** (branche `arena/019fce3a-lsc`).
> Ce document définit le **contrat** entre l'application Android « Colombes » (branche `arena/019fd2e7-lsc`)
> et le site web. Respecte strictement ces conventions pour que **le site et l'app restent synchronisés**.

---

## 1. Le pont JavaScript `ColombesApp` (interface entre le site et l'app)

L'app injecte un objet global `window.ColombesApp` dans la WebView. **Le site peut et doit l'utiliser** pour détecter qu'il est dans l'app et déclencher des actions natives.

### 1.1 Détection in-app (OBLIGATOIRE)
Le site doit vérifier `window.ColombesApp?.isApp?.()` pour savoir s'il tourne dans l'app.

```ts
const IS_APP = typeof window !== "undefined" && (window as any).ColombesApp?.isApp?.();
```

**Règle d'or** : quand `IS_APP === true`, le site doit **masquer ses propres splash et messages de mise à jour**, car l'app gère déjà ces expériences de façon native.

### 1.2 Méthodes exposées par l'app (disponibles dans l'app uniquement)
- `ColombesApp.isApp(): boolean` → toujours `true` dans l'app
- `ColombesApp.getAppVersion(): string` → version de l'app (ex. `"4.2.6"`)
- `ColombesApp.downloadBase64Pdf(base64, filename)` → télécharge/ouvre un PDF côté natif
- `ColombesApp.share(text)` → ouvre le panneau de partage Android
- `ColombesApp.notify(title, body)` → affiche une notification locale de l'app

---

## 2. CHANGEMENTS À APPLIQUER CÔTÉ SITE (pour rester synchronisé avec l'app)

### 2.1 Le splash du site DOIT rester masqué dans l'app (déjà fait)
Le splash cinéma (`SplashScreen`) et le voile de boot (`SiteSplash`) doivent **ne PAS s'afficher** dans l'app.
- `SplashScreen.tsx` : **ne pas** retirer le garde `isApp()` — garder ce comportement.
- `SiteSplash.tsx` : garder le garde `isApp()` (déjà présent à la ligne ~16).

> ⚠️ **Ne change PAS ces guards** — ils évitent le double splash.

### 2.2 Le messager « Mettre à jour l'App » DOIT rester masqué in-app (déjà fait)
`AppUpdateMessenger.tsx` (toast + bulle + footer) : garder le garde `isApp()` (ligne ~46).
**L'app fait sa PROPRE veille de mise à jour** (Option B : elle vérifie les Releases GitHub et propose un téléchargement automatique + installation). Le messager du site ne doit **jamais** apparaître dans l'app, pour éviter le double affichage.

### 2.3 Le splash du site utilise `aria-label="Ouverture de l'atelier"` (CONTRAT)
L'app masque le splash du site via ce sélecteur CSS :
```css
div[aria-label="Ouverture de l'atelier"] { display: none !important; visibility: hidden !important; }
```
**Si tu changes l'`aria-label` du splash**, tu casses la synchronisation → garde `aria-label="Ouverture de l'atelier"` sur l'overlay principal du splash.

### 2.4 NE PAS utiliser `aria-modal="true"` pour cacher quoi que ce soit côté app
⚠️ L'app **ne masque plus** les éléments `aria-modal="true"` (c'était la cause d'un bug : le tiroir de notifications disparaissait). Donc :
- Le **tiroir de notifications** et tout drawer/modale **fonctionnent normalement** dans l'app. ✅
- Ne rien casser là-dessus.

---

## 3. IMPORTANT — app-manifest.json (détection des mises à jour du site)

L'app vérifie périodiquement `https://couturecolombe.vercel.app/app-manifest.json` pour détecter si le **contenu du site** a changé, et notifier l'utilisateur.

**Ce fichier doit exister à la racine du site** et être maintenu à jour à chaque déploiement :
```json
{
  "app": "colombes",
  "content_version": "2026-08-10T00:00:00Z",
  "build_id": "xxx",
  "changelog": ["Description courte du changement"]
}
```
- `content_version` doit être **bumpé** à chaque modification du contenu du site (l'app compare cette valeur).
- `changelog` : 1-3 phrases courtes en français, affichées dans la notification « ✨ Nouveautés ».

> Vérifie que ce fichier est bien déployé sur Vercel et accessible.

---

## 4. Les pages / routes que l'app utilise (ne pas les renommer)

L'app (hub natif) ouvre le site sur ces chemins. **Ne pas les changer** :
- `/` (accueil)
- `/services`
- `/formation`
- `/contact`
- `/inspirations`

---

## 5. Palette OFFICIELLE (synchronisée app ↔ site — NE PAS réintroduire bleu/vert)

L'app reprend fidèlement la palette du site. **Le bleu (`#87CEEB`) et le vert citron (`#BFFF00`) sont BANNIS** — remplacés par rose poudré + rouge colombe.
| Rôle | Valeur |
|---|---|
| Fond dominant | `#FBE7EB` (rose poudré) |
| Accent signature | `#D1232A` (rouge colombe), foncé `#A31322` |
| Secondaire | `#8B4513` / `#5C2E0C` (marron) |
| Finitions | `#C9A87C` fil d'or, `#0B0B12` noir, `#FFFFFF` blanc |

---

## 6. Résumé des actions pour l'agent du site

1. ✅ **Ne pas retirer** les guards `isApp()` de `SiteSplash`, `SplashScreen`, `AppUpdateMessenger`.
2. ✅ **Garder** `aria-label="Ouverture de l'atelier"` sur le splash.
3. ✅ **Ne pas casser** les modales/drawers (notifications) — l'app ne les masque plus.
4. ✅ **Maintenir** `public/app-manifest.json` à jour (bump `content_version` à chaque changement).
5. ✅ **Garder** les routes `/`, `/services`, `/formation`, `/contact`, `/inspirations`.
6. ✅ **Respecter** la palette (rose poudré, rouge colombe, marron, or) — **sans bleu ni vert**.

**Si tu respectes ces 6 points, le site et l'app resteront parfaitement synchronisés.**

---

## 7. WebView premium (l'app sublime le site SANS le modifier)

L'app injecte un habillage CSS/JS par-dessus le site (polices Playfair/Poppins, coins arrondis, couleurs harmonisées, scrollbar masqué, fond rose poudré). **Ne rien casser** : ne pas ajouter de fond/bordures durs qui bloqueraient ce surcouche. Le site reste inchangé dans son code.
