# 🔐 Configuration des variables d'environnement — Les Services Colombes

> **Site cible :** https://lesservicescolombes.vercel.app
> 🧭 **Double vie** : cette adresse sert **à la fois** les visiteurs web ET la WebView de l'app Colombes. Les mots de l'interface restent « atelier » — hybrides par nature.
> ⚠️ **Ce fichier ne contient AUCUNE valeur secrète** (le dépôt est public).
> Les vraies valeurs vivent **uniquement** dans : le dashboard Vercel + ton `.env` local (gitignoré).

---

## 🚀 Méthode express (recommandée) — 3 commandes

Si les variables existent déjà sur Vercel, récupère-les **automatiquement** dans ton `.env` local :

```bash
cd ~/lsc2           # ou le dossier du projet
vercel link         # UNE SEULE FOIS : choisir le projet lesservicescolombes
                    # (inutile si tu as déjà déployé depuis ce dossier : .vercel/ existe)
vercel env pull .env --environment=production
```

→ Le fichier `.env` est créé avec **toutes les vraies valeurs** (VITE_* + serveur).
Vite lit `.env` nativement : `npm run dev` / `npm run build` les utilisent directement.

Pour rafraîchir après un changement sur Vercel : relancer simplement la dernière commande.

---

## 📝 Méthode manuelle — une par une dans Vercel

> **Où ?** Dashboard Vercel → projet `lesservicescolombes` → **Settings → Environment Variables**
> Pour chaque variable : **NAME** = le nom, **VALUE** = la valeur (sans guillemets),
> **Environments** : cocher *Production*, *Preview* et *Development* → **Save**.
> ⚠️ Après la dernière : **Deployments → ⋯ → Redeploy**.

### 🟦 PARTIE 1/2 — Variables PUBLIQUES (préfixe `VITE_`)

*Intégrées au site public — ce ne sont pas des secrets (visibles sur le site de toute façon).*

**Identité**

| NAME | VALUE |
|------|-------|
| `VITE_ATELIER_NAME` | `Les Services Colombes` |
| `VITE_ATELIER_SHORT_NAME` | `Colombes` |
| `VITE_ATELIER_TAGLINE` | `Atelier de Couture d'Exception` |
| `VITE_ATELIER_DESCRIPTION` | `Couture sur mesure, mercerie, layette & formations à Porto-Novo` |
| `VITE_ATELIER_FOUNDED` | `1990` |
| `VITE_ATELIER_HERO_HOOK` | `Trois décennies de savoir-faire, au service de votre élégance.` |

**Localisation**

| NAME | VALUE |
|------|-------|
| `VITE_ATELIER_LOCATION` | `Les Services Colombes, Porto-Novo – Bénin` |
| `VITE_ATELIER_LOCATION_FULL` | `Les Services Colombes, Porto-Novo – Bénin` |
| `VITE_ATELIER_LAT` | `6.4922053` |
| `VITE_ATELIER_LNG` | `2.6004269` |
| `VITE_MAPS_URL` | `https://maps.app.goo.gl/A14pmkvWbbxpwS4J6` |
| `VITE_MAPS_EMBED` | `https://www.google.com/maps?q=Les+Services+Colombes&ll=6.4922053,2.6004269&output=embed` |

**Téléphones, email & WhatsApp**

| NAME | VALUE |
|------|-------|
| `VITE_ATELIER_PHONE` | `+229 01 67 40 94 08` |
| `VITE_ATELIER_PHONE_RAW` | `2290167409408` |
| `VITE_ATELIER_PHONE_2` | `+229 01 95 76 36 01` |
| `VITE_ATELIER_PHONE_2_RAW` | `2290195763601` |
| `VITE_ATELIER_EMAIL` | `lesservicescolombes@gmail.com` |
| `VITE_WHATSAPP_GENERAL` | `+229 01 67 40 94 08` |
| `VITE_WHATSAPP_GENERAL_RAW` | `2290167409408` |
| `VITE_WHATSAPP_SECRETARIAT` | `+229 01 67 40 94 08` |
| `VITE_WHATSAPP_SECRETARIAT_RAW` | `2290167409408` |
| `VITE_WHATSAPP_DIRECTION` | `+229 01 95 76 36 01` |
| `VITE_WHATSAPP_DIRECTION_RAW` | `2290195763601` |

**Réseaux sociaux (optionnels — laisser vide ou ne pas créer)**

| NAME | VALUE |
|------|-------|
| `VITE_FACEBOOK_URL` | *(vide)* |
| `VITE_INSTAGRAM_URL` | *(vide)* |
| `VITE_TIKTOK_URL` | *(vide)* |
| `VITE_PORTAL_URL` | *(vide)* |

**SEO & API**

| NAME | VALUE |
|------|-------|
| `VITE_SITE_URL` | `https://lesservicescolombes.vercel.app` |
| `VITE_API_URL` | `/api/track` |
| `VITE_TRACK_TOKEN` | 🔑 **SECRET — voir note tokens ci-dessous** |
| `VITE_ATELIER_SOURCE_ID` | `atelier-colombes` |

> 📝 `VITE_API_URL` reste **relatif** (`/api/track`) : le même build tourne en prod,
> en preview Vercel et en local sans rien changer.

### 🟥 PARTIE 2/2 — Variables SERVEUR (jamais préfixées `VITE_`)

**🔑 Tokens (les 3 seuls secrets « valeur à recopier »)**

| NAME | Rôle |
|------|------|
| `VITE_TRACK_TOKEN` | token public côté front — **doit être IDENTIQUE à `TRACK_PUBLIC_TOKEN`** |
| `TRACK_PUBLIC_TOKEN` | même valeur — côté serveur |
| `TRACK_TOKEN` | token **admin** — opérations sensibles (export/csv, purge). Ne jamais l'exposer. |

> 🔄 **Générer des tokens neufs** (dans Termux ou tout shell) :
> ```bash
> openssl rand -hex 20   # → VITE_TRACK_TOKEN = TRACK_PUBLIC_TOKEN
> openssl rand -hex 32   # → TRACK_TOKEN (admin)
> ```
> Après tout changement de token : mettre à jour les 3 lignes sur Vercel → **Redeploy**
> → puis `vercel env pull .env --environment=production` en local.

**Google Sheets (compte de service)**

| NAME | VALUE |
|------|-------|
| `GOOGLE_SHEET_ID` | l'ID dans l'URL de ta feuille : `docs.google.com/spreadsheets/d/`**« cet ID »**`/edit` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | `xxxxx@ton-projet.iam.gserviceaccount.com` (depuis le JSON du compte de service) |
| `GOOGLE_PRIVATE_KEY` | clé privée complète du JSON, avec `-----BEGIN/END PRIVATE KEY-----` et les `\n` littéraux, en **une seule ligne** |
| `GOOGLE_SHEET_RANGE` | `Events!A:K` |

> ⚠️ Sans ces 4 variables, le site marche mais rien ne s'écrit dans Google Sheets.
> 📌 Penser à **partager la feuille Google** avec l'adresse du compte de service (droits Éditeur).

**Emails SMTP Gmail (notifications des formulaires)**

| NAME | VALUE |
|------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` |
| `SMTP_SECURE` | `true` |
| `SMTP_USER` | ton adresse Gmail d'envoi |
| `SMTP_PASS` | **mot de passe d'application** Google (Compte Google → Sécurité → Validation en 2 étapes → Mots de passe d'application) — PAS le mot de passe Gmail |
| `MAIL_TO` | destinataire(s) des notifications — plusieurs : `a@x.com,b@x.com` |
| `MAIL_FROM` | `Les Services Colombes <ton-adresse@gmail.com>` |
| `ATELIER_LOGO_URL` | `https://lesservicescolombes.vercel.app/images/logo.webp` |

> ⚠️ Sans le SMTP, les formulaires fonctionnent mais aucun email n'est envoyé.

---

## ✅ Vérification finale

1. https://lesservicescolombes.vercel.app/api/ping → réponse **204** (page vide = OK)
2. https://lesservicescolombes.vercel.app/api/track → `{"ok":true,"service":"colombes-track"…}`
3. Soumettre un formulaire test → email reçu + ligne ajoutée dans Google Sheets

## 🗂️ Rappel sécurité

- `.env` est **gitignoré** — il ne sera jamais commité. Ne le colle dans aucun fichier `.md`.
- Ne jamais prefixer un secret serveur avec `VITE_` (sauf les tokens prévus pour : `VITE_TRACK_TOKEN`).
- Un secret publié par erreur = **le régénérer immédiatement** (voir « Générer des tokens neufs »).
