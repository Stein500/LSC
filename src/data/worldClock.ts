// PHASE 0 — Mapping des villes monde (pour WorldClock étendu + stickers culturels)
//
// Source canonique des villes affichées dans la barre "Horloges du monde" et
// pour les `stickerId` / `timezone` des profiles.

export const WORLD_CLOCK_CITIES: Record<string, { city: string; timezone: string; flag: string; region: string }> = {
  'porto-novo': { city: 'Porto-Novo', timezone: 'Africa/Porto-Novo', flag: '🇧🇯', region: 'BJ' },
  'casablanca': { city: 'Casablanca', timezone: 'Africa/Casablanca', flag: '🇲🇦', region: 'MA' },
  'tokyo': { city: 'Tokyo', timezone: 'Asia/Tokyo', flag: '🇯🇵', region: 'JP' },
  'lyon': { city: 'Lyon', timezone: 'Europe/Paris', flag: '🇫🇷', region: 'FR' },
  'abidjan': { city: 'Abidjan', timezone: 'Africa/Abidjan', flag: '🇨🇮', region: 'CI' },
  'dakar': { city: 'Dakar', timezone: 'Africa/Dakar', flag: '🇸🇳', region: 'SN' },
  'tunis': { city: 'Tunis', timezone: 'Africa/Tunis', flag: '🇹🇳', region: 'TN' },
  'shanghai': { city: 'Shanghai', timezone: 'Asia/Shanghai', flag: '🇨🇳', region: 'CN' },
  'alger': { city: 'Alger', timezone: 'Africa/Algiers', flag: '🇩🇿', region: 'DZ' },
};
