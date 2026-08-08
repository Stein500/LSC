/**
 * Helpers typés pour lire les variables d'env Vite.
 *
 * Philosophie : **le site ne doit JAMAIS afficher "undefined" ou casser**
 * parce qu'une variable manque. Chaque lecture passe par `v(key, fallback)`
 * avec une valeur par défaut cohérente avec l'identité de l'atelier.
 *
 * - Les valeurs publiques (préfixe VITE_) sont embarquées dans le bundle :
 *   c'est normal, elles ne sont pas secrètes (téléphones, adresse, tokens
 *   publics de tracking).
 * - Les secrets serveur (TRACK_TOKEN, SMTP_*, GOOGLE_*) ne passent JAMAIS ici.
 *
 * Les accesseurs `schoolX` sont conservés en rétrocompat avec le code
 * historique — ils délèguent aux valeurs `atelierX`.
 */

/** Lecture robuste d'une variable Vite avec fallback. */
function v(key: keyof ImportMetaEnv, fallback: string): string {
  const raw = import.meta.env[key] as unknown;
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export const env = {
  // Identité
  atelierName: v("VITE_ATELIER_NAME", "Les Services Colombes"),
  atelierShortName: v("VITE_ATELIER_SHORT_NAME", "Colombes"),
  atelierTagline: v("VITE_ATELIER_TAGLINE", "Atelier de Couture d'Exception"),
  atelierDescription: v(
    "VITE_ATELIER_DESCRIPTION",
    "Couture sur mesure, mercerie, layette & formations à Porto-Novo",
  ),
  atelierFounded: v("VITE_ATELIER_FOUNDED", "1990"),
  // Super accroche affichée juste après le hero (à la place des anciennes
  // cartes stats). Défaut pensé pour être percutant même sans valeur custom.
  atelierHeroHook: v(
    "VITE_ATELIER_HERO_HOOK",
    "Trois décennies de savoir-faire, au service de votre élégance.",
  ),
  atelierLocation: v("VITE_ATELIER_LOCATION", "Les Services Colombes, Porto-Novo – Bénin"),
  atelierLocationFull: v(
    "VITE_ATELIER_LOCATION_FULL",
    v("VITE_ATELIER_LOCATION", "Les Services Colombes, Porto-Novo – Bénin"),
  ),

  // Téléphones
  atelierPhone: v("VITE_ATELIER_PHONE", "+229 01 67 40 94 08"),
  atelierPhoneRaw: v("VITE_ATELIER_PHONE_RAW", "2290167409408"),
  atelierPhone2: v("VITE_ATELIER_PHONE_2", "+229 01 95 76 36 01"),
  atelierPhone2Raw: v("VITE_ATELIER_PHONE_2_RAW", "2290195763601"),
  atelierEmail: v("VITE_ATELIER_EMAIL", "lesservicescolombes@gmail.com"),

  // WhatsApp
  whatsappGeneral: v("VITE_WHATSAPP_GENERAL", "+229 01 67 40 94 08"),
  whatsappGeneralRaw: v("VITE_WHATSAPP_GENERAL_RAW", "2290167409408"),
  whatsappSecretariat: v("VITE_WHATSAPP_SECRETARIAT", "+229 01 67 40 94 08"),
  whatsappSecretariatRaw: v("VITE_WHATSAPP_SECRETARIAT_RAW", "2290167409408"),
  whatsappDirection: v("VITE_WHATSAPP_DIRECTION", "+229 01 95 76 36 01"),
  whatsappDirectionRaw: v("VITE_WHATSAPP_DIRECTION_RAW", "2290195763601"),

  // Adresse / Maps
  mapsUrl: v("VITE_MAPS_URL", "https://maps.app.goo.gl/A14pmkvWbbxpwS4J6"),
  mapsEmbed: v(
    "VITE_MAPS_EMBED",
    "https://www.google.com/maps?q=Les+Services+Colombes&ll=6.4922053,2.6004269&output=embed",
  ),

  // Réseaux
  facebookUrl: v("VITE_FACEBOOK_URL", ""),
  instagramUrl: v("VITE_INSTAGRAM_URL", ""),
  tiktokUrl: v("VITE_TIKTOK_URL", ""),
  portalUrl: v("VITE_PORTAL_URL", ""),

  // SEO
  siteUrl: v("VITE_SITE_URL", "https://couturecolombe.vercel.app"),

  // 📱 Destination du badge « Mettre à jour l'App » (header).
  // ⚠️ Ne JAMAIS afficher cette URL en clair dans l'interface —
  // elle ne vit que dans le href du badge (cf. HeaderAppBadge).
  appUpdateUrl: v("VITE_APP_UPDATE_URL", "https://lesservicescolombes.vercel.app"),

  // API back — **relatif par défaut** : le même build fonctionne sur
  // couturecolombe.vercel.app, sur les URLs de preview Vercel et en
  // dev local sans reconfiguration. Le token public ne protège que le
  // tracking (le vrai secret TRACK_TOKEN reste côté serveur).
  apiUrl: v("VITE_API_URL", "/api/track"),
  apiToken: v("VITE_TRACK_TOKEN", ""),
  sourceId: v("VITE_ATELIER_SOURCE_ID", "atelier-colombes"),

  // --- Aliases rétrocompat (utilisés dans certains composants) ---
  get schoolName() { return this.atelierName; },
  get schoolShortName() { return this.atelierShortName; },
  get schoolTagline() { return this.atelierTagline; },
  get schoolDescription() { return this.atelierDescription; },
  get schoolFounded() { return this.atelierFounded; },
  get schoolLocation() { return this.atelierLocation; },
  get schoolLocationFull() { return this.atelierLocationFull; },
  get schoolPhone() { return this.atelierPhone; },
  get schoolPhoneRaw() { return this.atelierPhoneRaw; },
  get schoolPhone2() { return this.atelierPhone2; },
  get schoolPhone2Raw() { return this.atelierPhone2Raw; },
  get schoolEmail() { return this.atelierEmail; },
  get schoolWhatsapp() { return this.whatsappGeneral; },
  get schoolWhatsappRaw() { return this.whatsappGeneralRaw; },
} as const;
