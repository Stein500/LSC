/**
 * Helpers typés pour lire les variables d'env Vite.
 * Centralise les accès pour pouvoir mocker en dev facilement.
 *
 * Notes :
 * - Préfixe officiel : VITE_ATELIER_*  (cohérent avec .env et Vercel).
 * - Des accesseurs "rétrocompat" exposent aussi `schoolX` pour ne rien
 *   casser dans le code historique. On pourra les retirer plus tard.
 */
export const env = {
  // Identité
  atelierName: import.meta.env.VITE_ATELIER_NAME as string,
  atelierShortName: import.meta.env.VITE_ATELIER_SHORT_NAME as string,
  atelierTagline: import.meta.env.VITE_ATELIER_TAGLINE as string,
  atelierDescription: import.meta.env.VITE_ATELIER_DESCRIPTION as string,
  atelierFounded: (import.meta.env.VITE_ATELIER_FOUNDED as string) || "1990",
  // Super accroche affichée juste après le hero (à la place des anciennes
  // cartes stats). Défaut pensé pour être percutant même sans valeur custom.
  atelierHeroHook: (import.meta.env.VITE_ATELIER_HERO_HOOK as string)
    || "Trois décennies de savoir-faire, au service de votre élégance.",
  atelierLocation: (import.meta.env.VITE_ATELIER_LOCATION as string) || "Les Services Colombes, Porto-Novo, Bénin, Afrique",
  atelierLocationFull: (import.meta.env.VITE_ATELIER_LOCATION_FULL as string) || (import.meta.env.VITE_ATELIER_LOCATION as string) || "Les Services Colombes, Porto-Novo, Bénin, Afrique",

  // Téléphones
  atelierPhone: import.meta.env.VITE_ATELIER_PHONE as string,
  atelierPhoneRaw: import.meta.env.VITE_ATELIER_PHONE_RAW as string,
  atelierPhone2: import.meta.env.VITE_ATELIER_PHONE_2 as string,
  atelierPhone2Raw: import.meta.env.VITE_ATELIER_PHONE_2_RAW as string,
  atelierEmail: (import.meta.env.VITE_ATELIER_EMAIL as string) || "",

  // WhatsApp
  whatsappGeneral: import.meta.env.VITE_WHATSAPP_GENERAL as string,
  whatsappGeneralRaw: import.meta.env.VITE_WHATSAPP_GENERAL_RAW as string,
  whatsappSecretariat: import.meta.env.VITE_WHATSAPP_SECRETARIAT as string,
  whatsappSecretariatRaw: import.meta.env.VITE_WHATSAPP_SECRETARIAT_RAW as string,
  whatsappDirection: import.meta.env.VITE_WHATSAPP_DIRECTION as string,
  whatsappDirectionRaw: import.meta.env.VITE_WHATSAPP_DIRECTION_RAW as string,

  // Adresse / Maps
  mapsUrl: (import.meta.env.VITE_MAPS_URL as string) || "https://maps.app.goo.gl/A14pmkvWbbxpwS4J6",
  mapsEmbed: (import.meta.env.VITE_MAPS_EMBED as string) || "https://www.google.com/maps?q=Les+Services+Colombes&ll=6.4922053,2.6004269&output=embed",

  // Réseaux
  facebookUrl: (import.meta.env.VITE_FACEBOOK_URL as string) || "",
  instagramUrl: (import.meta.env.VITE_INSTAGRAM_URL as string) || "",
  tiktokUrl: (import.meta.env.VITE_TIKTOK_URL as string) || "",
  portalUrl: (import.meta.env.VITE_PORTAL_URL as string) || "",

  // SEO
  siteUrl: import.meta.env.VITE_SITE_URL as string,

  // API back
  apiUrl: import.meta.env.VITE_API_URL as string,
  apiToken: import.meta.env.VITE_TRACK_TOKEN as string,
  sourceId: (import.meta.env.VITE_ATELIER_SOURCE_ID as string) || "atelier-colombes",

  // --- Aliases rétrocompat (utilisés dans certains composants) ---
  // Pour ne rien casser durant la transition, on expose aussi les anciens
  // noms "schoolX" qui pointent vers les valeurs "atelierX".
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
