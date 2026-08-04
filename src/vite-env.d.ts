/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly BASE_URL: string;
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly SSR: boolean;
  // === Identité (préfixe officiel) ===
  readonly VITE_ATELIER_NAME: string;
  readonly VITE_ATELIER_SHORT_NAME: string;
  readonly VITE_ATELIER_TAGLINE: string;
  readonly VITE_ATELIER_DESCRIPTION: string;
  readonly VITE_ATELIER_FOUNDED: string;
  readonly VITE_ATELIER_LOCATION: string;
  readonly VITE_ATELIER_LOCATION_FULL?: string;
  readonly VITE_ATELIER_PHONE: string;
  readonly VITE_ATELIER_PHONE_RAW: string;
  readonly VITE_ATELIER_PHONE_2: string;
  readonly VITE_ATELIER_PHONE_2_RAW: string;
  readonly VITE_ATELIER_EMAIL?: string;

  // === WhatsApp ===
  readonly VITE_WHATSAPP_GENERAL: string;
  readonly VITE_WHATSAPP_GENERAL_RAW: string;
  readonly VITE_WHATSAPP_SECRETARIAT: string;
  readonly VITE_WHATSAPP_SECRETARIAT_RAW: string;
  readonly VITE_WHATSAPP_DIRECTION: string;
  readonly VITE_WHATSAPP_DIRECTION_RAW: string;

  // === Adresse ===
  readonly VITE_MAPS_URL: string;
  readonly VITE_MAPS_EMBED: string;

  // === Réseaux (optionnels) ===
  readonly VITE_FACEBOOK_URL?: string;
  readonly VITE_INSTAGRAM_URL?: string;
  readonly VITE_TIKTOK_URL?: string;
  readonly VITE_PORTAL_URL?: string;

  // === SEO ===
  readonly VITE_SITE_URL: string;

  // === API ===
  readonly VITE_API_URL: string;
  readonly VITE_TRACK_TOKEN: string;
  readonly VITE_ATELIER_SOURCE_ID?: string;

  // === Aliases rétrocompat (lus par d'anciens modules) ===
  // Tu peux les ignorer dans le nouveau code, mais on les garde pour
  // ne pas casser la transpilation si jamais un fichier référence
  // encore les anciens noms.
  readonly VITE_SCHOOL_NAME?: string;
  readonly VITE_SCHOOL_SHORT_NAME?: string;
  readonly VITE_SCHOOL_TAGLINE?: string;
  readonly VITE_SCHOOL_DESCRIPTION?: string;
  readonly VITE_SCHOOL_FOUNDED?: string;
  readonly VITE_SCHOOL_LOCATION?: string;
  readonly VITE_SCHOOL_PHONE?: string;
  readonly VITE_SCHOOL_PHONE_RAW?: string;
  readonly VITE_SCHOOL_PHONE_2?: string;
  readonly VITE_SCHOOL_PHONE_2_RAW?: string;
  readonly VITE_SCHOOL_EMAIL?: string;
  readonly VITE_SCHOOL_SOURCE_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
