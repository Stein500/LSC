# 🔐 Variables d'environnement — à copier **une par une** dans Vercel

> **Où ?** Dashboard Vercel → projet `couturecolombe` → **Settings → Environment Variables**
> Pour chaque ligne ci-dessous : champ **NAME** = le nom, champ **VALUE** = la valeur
> (copier sans les guillemets), **Environments** : cocher *Production*, *Preview* et *Development*.
> Puis bouton **Save**. Répéter pour chaque ligne.
> ⚠️ Après la dernière variable → **Redeploy** (Deployments → ⋯ → Redeploy) pour que tout soit pris en compte.

Le site cible : **https://couturecolombe.vercel.app**

---

## 🟦 PARTIE 1/2 — Variables PUBLIQUES du site (préfixe `VITE_`)

*Ces valeurs sont intégrées au site public — c'est normal, ce ne sont pas des secrets.*

### 1 — Identité de l'atelier

| # | NAME | VALUE |
|---|------|-------|
| 1 | `VITE_ATELIER_NAME` | `Les Services Colombes` |
| 2 | `VITE_ATELIER_SHORT_NAME` | `Colombes` |
| 3 | `VITE_ATELIER_TAGLINE` | `Atelier de Couture d'Exception` |
| 4 | `VITE_ATELIER_DESCRIPTION` | `Couture sur mesure, mercerie, layette & formations à Porto-Novo` |
| 5 | `VITE_ATELIER_FOUNDED` | `1990` |
| 6 | `VITE_ATELIER_HERO_HOOK` | `Trois décennies de savoir-faire, au service de votre élégance.` |

### 2 — Localisation

| # | NAME | VALUE |
|---|------|-------|
| 7 | `VITE_ATELIER_LOCATION` | `Les Services Colombes, Porto-Novo – Bénin` |
| 8 | `VITE_ATELIER_LOCATION_FULL` | `Les Services Colombes, Porto-Novo – Bénin` |
| 9 | `VITE_ATELIER_LAT` | `6.4922053` |
| 10 | `VITE_ATELIER_LNG` | `2.6004269` |
| 11 | `VITE_MAPS_URL` | `https://maps.app.goo.gl/A14pmkvWbbxpwS4J6` |
| 12 | `VITE_MAPS_EMBED` | `https://www.google.com/maps?q=Les+Services+Colombes&ll=6.4922053,2.6004269&output=embed` |

### 3 — Téléphones & email

| # | NAME | VALUE |
|---|------|-------|
| 13 | `VITE_ATELIER_PHONE` | `+229 01 67 40 94 08` |
| 14 | `VITE_ATELIER_PHONE_RAW` | `2290167409408` |
| 15 | `VITE_ATELIER_PHONE_2` | `+229 01 95 76 36 01` |
| 16 | `VITE_ATELIER_PHONE_2_RAW` | `2290195763601` |
| 17 | `VITE_ATELIER_EMAIL` | `lesservicescolombes@gmail.com` |

### 4 — WhatsApp

| # | NAME | VALUE |
|---|------|-------|
| 18 | `VITE_WHATSAPP_GENERAL` | `+229 01 67 40 94 08` |
| 19 | `VITE_WHATSAPP_GENERAL_RAW` | `2290167409408` |
| 20 | `VITE_WHATSAPP_SECRETARIAT` | `+229 01 67 40 94 08` |
| 21 | `VITE_WHATSAPP_SECRETARIAT_RAW` | `2290167409408` |
| 22 | `VITE_WHATSAPP_DIRECTION` | `+229 01 95 76 36 01` |
| 23 | `VITE_WHATSAPP_DIRECTION_RAW` | `2290195763601` |

### 5 — Réseaux sociaux (optionnels — laisser vide si inutilisés, ou ne pas les créer)

| # | NAME | VALUE |
|---|------|-------|
| 24 | `VITE_FACEBOOK_URL` | *(vide)* |
| 25 | `VITE_INSTAGRAM_URL` | *(vide)* |
| 26 | `VITE_TIKTOK_URL` | *(vide)* |
| 27 | `VITE_PORTAL_URL` | *(vide)* |

### 6 — SEO & API

| # | NAME | VALUE |
|---|------|-------|
| 28 | `VITE_SITE_URL` | `https://couturecolombe.vercel.app` |
| 29 | `VITE_API_URL` | `/api/track` |
| 30 | `VITE_TRACK_TOKEN` | `4b8c53b0837e0482b0ba392a8fab1b0c5c09` |
| 31 | `VITE_ATELIER_SOURCE_ID` | `atelier-colombes` |

> 📝 **#29** : rester en relatif `/api/track` — ainsi le même site fonctionne sur
> couturecolombe.vercel.app, sur toutes les URLs de preview Vercel et en local.
> 📝 **#30** : ce token public permet au front d'envoyer les statistiques de
> visite. **Il doit être IDENTIQUE à `TRACK_PUBLIC_TOKEN` (ligne 33).**

---

## 🟥 PARTIE 2/2 — Variables SERVEUR (secrets — jamais préfixées `VITE_`)

*Elles alimentent le backend serverless (`api/track.js`) : statistiques → Google Sheets,*
*emails de notification (SMTP Gmail), tickets PDF.*

### 7 — Tokens backend

| # | NAME | VALUE |
|---|------|-------|
| 32 | `TRACK_TOKEN` | `8b50ffa77b70da326c87354cec26385d5359051ac99cf4da2f47e3fe10380325` |
| 33 | `TRACK_PUBLIC_TOKEN` | `4b8c53b0837e0482b0ba392a8fab1b0c5c09` |

> 📝 **#33 = #30 EXACTEMENT** (même valeur). C'est le pont entre le front et le back.
> 📝 **#32** est le token **admin secret** — ne le partage dans aucun code, ticket ou capture.

### 8 — Google Sheets (compte de service)

| # | NAME | VALUE |
|---|------|-------|
| 34 | `GOOGLE_SHEET_ID` | `COLLE_ICI_TON_GOOGLE_SHEET_ID` |
| 35 | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `tracking-service@VOTRE_PROJET.iam.gserviceaccount.com` |
| 36 | `GOOGLE_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nCOLLE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n` |
| 37 | `GOOGLE_SHEET_RANGE` | `Events!A:K` |

> 📝 **#34** : l'ID est dans l'URL de ta feuille : `docs.google.com/spreadsheets/d/`**« cet ID »**`/edit`
> 📝 **#36** : colle la clé privée complète depuis le JSON du compte de service, en gardant
> les `\n` (Vercel : coller en une seule ligne avec les `\n` littéraux).
> ⚠️ Sans ces 3 variables, les statistiques ne partent qu'en mémoire locale — le site marche
> quand même, mais rien ne s'écrit dans Google Sheets.

### 9 — Emails SMTP Gmail (notifications des formulaires)

| # | NAME | VALUE |
|---|------|-------|
| 38 | `SMTP_HOST` | `smtp.gmail.com` |
| 39 | `SMTP_PORT` | `465` |
| 40 | `SMTP_SECURE` | `true` |
| 41 | `SMTP_USER` | `ton-compte-gmail@gmail.com` |
| 42 | `SMTP_PASS` | `abcd efgh ijkl mnop` |
| 43 | `MAIL_TO` | `destinataire1@exemple.com` |
| 44 | `MAIL_FROM` | `Les Services Colombes <ton-compte-gmail@gmail.com>` |
| 45 | `ATELIER_LOGO_URL` | `https://couturecolombe.vercel.app/images/logo.webp` |

> 📝 **#42** : c'est un **mot de passe d'application** Google (Compte Google → Sécurité →
> Validation en 2 étapes → Mots de passe d'application), PAS ton mot de passe Gmail.
> 📝 **#43** : adresse(s) qui reçoivent les notifications de formulaires — plusieurs
> adresses séparées par des virgules : `a@x.com,b@x.com`
> ⚠️ Sans le SMTP, les formulaires fonctionnent mais tu ne reçois pas d'email.

---

## ✅ Appliquer

1. Toutes les variables créées → **Deployments → ⋯ (dernier) → Redeploy**
2. Ouvrir https://couturecolombe.vercel.app/api/ping → doit répondre **204** (page vide = OK)
3. Ouvrir https://couturecolombe.vercel.app/api/track → `{"ok":true,"service":"colombes-track"…}`
4. Tester un formulaire → un mail arrive + une ligne apparaît dans Google Sheets
