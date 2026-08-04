// PHASE 0 — Profils des clientes (18 villes, 5 continents)
//
// Chaque profil a été étendu avec 4 nouveaux champs (additif, aucune casse) :
//   - region   : code ISO pays (BJ, SN, BF, ...)
//   - flag     : emoji drapeau
//   - stickerId: référence vers un sticker culturel (cf. Sticker.tsx)
//   - timezone : fuseau horaire IANA
//   - lang     : langue principale du profil
//
// Le mapping stickerId par pays (cf. plan Phase 0) :
//   BJ/CI/Autres  → 'pagne'        SN/BF            → 'fabric' (kente-like)
//   MA/TN/DZ/EG   → 'mannequin'    JP/CN            → 'fabric' (kimono-fold)

export type Profile = {
  id: string;
  name: string;
  city: string;
  country: string;
  textile: string;
  story: string;
  // === AJOUTS PHASE 0 ===
  region: string;
  flag: string;
  stickerId: string;
  timezone: string;
  lang: 'fr' | 'ar' | 'zh' | 'en' | 'wo' | 'ff';
};

export const PROFILES: Profile[] = [
  { id: 'porto-novo', name: 'Aïcha S.', city: 'Porto-Novo', country: 'BJ', textile: 'pagne tissé béninois', story: 'Une allure douce, des matières locales et une finition pleine de tendresse ✨', region: 'BJ', flag: '🇧🇯', stickerId: 'pagne', timezone: 'Africa/Porto-Novo', lang: 'fr' },
  { id: 'cotonou', name: 'Mariam K.', city: 'Cotonou', country: 'BJ', textile: 'robe contemporaine', story: 'Une silhouette vive, pensée pour bouger avec aisance et élégance 🤍', region: 'BJ', flag: '🇧🇯', stickerId: 'pagne', timezone: 'Africa/Porto-Novo', lang: 'fr' },
  { id: 'parakou', name: 'Grâce T.', city: 'Parakou', country: 'BJ', textile: 'ensemble cérémonial', story: 'Une présence lumineuse, avec une coupe nette et des détails très soignés 🌷', region: 'BJ', flag: '🇧🇯', stickerId: 'pagne', timezone: 'Africa/Porto-Novo', lang: 'fr' },
  { id: 'ouidah', name: 'Nadine A.', city: 'Ouidah', country: 'BJ', textile: 'tenue de fête', story: 'Une pièce joyeuse, équilibrée entre tradition et modernité 🌸', region: 'BJ', flag: '🇧🇯', stickerId: 'pagne', timezone: 'Africa/Porto-Novo', lang: 'fr' },
  { id: 'abomey', name: 'Sandrine D.', city: 'Abomey', country: 'BJ', textile: 'bazin élégant', story: 'Un rendu riche, structuré et pensé pour les grands moments 🧵', region: 'BJ', flag: '🇧🇯', stickerId: 'pagne', timezone: 'Africa/Porto-Novo', lang: 'fr' },
  { id: 'bohicon', name: 'Rita Z.', city: 'Bohicon', country: 'BJ', textile: 'tenue de cérémonie', story: 'Une coupe calme, précise et pleine de noblesse textile ✨', region: 'BJ', flag: '🇧🇯', stickerId: 'pagne', timezone: 'Africa/Porto-Novo', lang: 'fr' },
  { id: 'ouagadougou', name: 'Fatou D.', city: 'Ouagadougou', country: 'BF', textile: 'Faso danfani', story: 'Un hommage à la matière locale avec une allure moderne et affirmée 🤍', region: 'BF', flag: '🇧🇫', stickerId: 'fabric', timezone: 'Africa/Ouagadougou', lang: 'fr' },
  { id: 'bobo-dioulasso', name: 'Aminata T.', city: 'Bobo-Dioulasso', country: 'BF', textile: 'tenue tissée', story: 'Des lignes amples, des textures fortes et une vraie douceur visuelle 🌿', region: 'BF', flag: '🇧🇫', stickerId: 'fabric', timezone: 'Africa/Ouagadougou', lang: 'fr' },
  { id: 'dakar', name: 'Léonie K.', city: 'Dakar', country: 'SN', textile: 'boubou sénégalais', story: 'Une énergie festive, des contrastes nets et des finitions pleines d’élan ✨', region: 'SN', flag: '🇸🇳', stickerId: 'fabric', timezone: 'Africa/Dakar', lang: 'wo' },
  { id: 'casablanca', name: 'Naïma E.', city: 'Casablanca', country: 'MA', textile: 'caftan marocain', story: 'Une silhouette raffinée, pensée pour les cérémonies et les détails précieux 🌙', region: 'MA', flag: '🇲🇦', stickerId: 'mannequin', timezone: 'Africa/Casablanca', lang: 'ar' },
  { id: 'tunis', name: 'Yasmine R.', city: 'Tunis', country: 'TN', textile: 'robe orientale', story: 'Une élégance douce, structurée par des plis et des volumes délicats 🌸', region: 'TN', flag: '🇹🇳', stickerId: 'mannequin', timezone: 'Africa/Tunis', lang: 'ar' },
  { id: 'tokyo', name: 'Hina Y.', city: 'Tokyo', country: 'JP', textile: 'kimono revisité', story: 'Une lecture contemporaine de la tradition, légère et très précise 🪡', region: 'JP', flag: '🇯🇵', stickerId: 'fabric', timezone: 'Asia/Tokyo', lang: 'en' },
  { id: 'abidjan', name: 'Lydie M.', city: 'Abidjan', country: 'CI', textile: 'pagne moderne ivoirien', story: 'Un style solaire, rythmé par une coupe claire et des finitions nettes ☀️', region: 'CI', flag: '🇨🇮', stickerId: 'pagne', timezone: 'Africa/Abidjan', lang: 'fr' },
  { id: 'kigali', name: 'Espérance N.', city: 'Kigali', country: 'RW', textile: 'tenue rwandaise revisitée', story: 'Une tenue claire, soignée et pleine de fraîcheur contemporaine 🤍', region: 'RW', flag: '🇷🇼', stickerId: 'pagne', timezone: 'Africa/Kigali', lang: 'fr' },
  { id: 'lyon', name: 'Camille R.', city: 'Lyon', country: 'FR', textile: 'robe de cérémonie', story: 'Une pièce nette, lumineuse et pensée pour un rendu très couture ✨', region: 'FR', flag: '🇫🇷', stickerId: 'mannequin', timezone: 'Europe/Paris', lang: 'fr' },
  { id: 'lisbonne', name: 'Inès O.', city: 'Lisbonne', country: 'PT', textile: 'robe de soirée', story: 'Un style fluide, chic et facile à porter pour des moments précieux 🌷', region: 'PT', flag: '🇵🇹', stickerId: 'mannequin', timezone: 'Europe/Lisbon', lang: 'en' },
  { id: 'alger', name: 'Khadija F.', city: 'Alger', country: 'DZ', textile: 'karakou', story: 'Une pièce de caractère, travaillée dans les lignes et les finitions 🤍', region: 'DZ', flag: '🇩🇿', stickerId: 'mannequin', timezone: 'Africa/Algiers', lang: 'ar' },
  { id: 'naples', name: 'Rosa M.', city: 'Naples', country: 'IT', textile: 'robe italienne', story: 'Un style très féminin, sobre et sensuel dans ses volumes 🌸', region: 'IT', flag: '🇮🇹', stickerId: 'mannequin', timezone: 'Europe/Rome', lang: 'en' },
];
