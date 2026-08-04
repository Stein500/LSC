// PHASE 0 — Messages de remerciement localisés
//
// Rotation horaire pour rendre le "merci" chaleureux et varié d'une visite à
// l'autre. Utilisé par `useLocalizedThankYou` après envoi d'un formulaire.

export type ThankYou = {
  lang: 'fr' | 'ar' | 'zh' | 'en' | 'wo' | 'ff';
  text: string;
  region: string;
};

export const THANK_YOU: ThankYou[] = [
  { lang: 'fr', text: 'Merci, votre message est bien arrivé aux Services Colombes 🤍', region: 'BJ' },
  { lang: 'ar', text: 'شكراً، تم استلام رسالتكم في Les Services Colombes 🤍', region: 'MA' },
  { lang: 'zh', text: '谢谢，您的留言已收到 — Les Services Colombes 工作室', region: 'CN' },
  { lang: 'en', text: 'Thank you, your message reached Les Services Colombes 🤍', region: 'FR' },
  { lang: 'wo', text: 'Jërëjëf, sa xibaar bi dellu ci Les Services Colombes 🤍', region: 'SN' },
  { lang: 'ff', text: 'A jaaraama, kaɓirgal maaɓe heɓii Les Services Colombes 🤍', region: 'BF' },
];
