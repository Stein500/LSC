// PHASE 0 — Mood slots selon l'heure (UTC+1 Porto-Novo)
//
// 5 ambiances par créneau, chacune avec un sticker culturel référencé et un
// message de l'atelier. Utilisé par `useMoodCards` pour animer les MoodCards
// du Splash / Hero / page d'accueil.

export type Mood = {
  id: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night';
  label: string;        // ex: "Bien commencer la journée"
  emoji: string;        // ex: "🌅"
  stickerId: string;    // ex: "kente-pattern" — référence vers Sticker.tsx
  region: string;       // ex: "BJ"
  message: string;      // ex: "Bonjour depuis l'atelier Les Services Colombes"
  bgGradient: string;   // ex: "linear-gradient(...)"
};

export const MOODS: Mood[] = [
  {
    id: 'morning',
    label: 'Bien commencer la journée',
    emoji: '🌅',
    stickerId: 'kente-pattern',
    region: 'BJ',
    message: 'Bonjour, l\'atelier Les Services Colombes ouvre ses portes ✨',
    bgGradient: 'linear-gradient(135deg, rgba(255,228,230,0.95), rgba(244,184,96,0.85))',
  },
  {
    id: 'noon',
    label: 'Pause couture',
    emoji: '🧵',
    stickerId: 'scissors',
    region: 'SN',
    message: 'Le temps d\'une pause, on en profite pour vous montrer nos avancées 🤍',
    bgGradient: 'linear-gradient(135deg, rgba(245,239,230,0.95), rgba(201,168,124,0.85))',
  },
  {
    id: 'afternoon',
    label: 'On s\'active',
    emoji: '✂️',
    stickerId: 'thread',
    region: 'BF',
    message: 'Les ciseaux chantent, les tissus s\'assemblent ✂️',
    bgGradient: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(185,136,166,0.85))',
  },
  {
    id: 'evening',
    label: 'Douceur du soir',
    emoji: '🌙',
    stickerId: 'mannequin',
    region: 'MA',
    message: 'La lumière du soir sur les pièces du jour 🌙',
    bgGradient: 'linear-gradient(135deg, rgba(251,228,230,0.95), rgba(185,136,166,0.88))',
  },
  {
    id: 'night',
    label: 'On veille',
    emoji: '🪡',
    stickerId: 'pin',
    region: 'JP',
    message: 'Quelques finitions à la lueur de la lampe 🪡',
    bgGradient: 'linear-gradient(135deg, rgba(27,40,69,0.95), rgba(185,136,166,0.85))',
  },
];
