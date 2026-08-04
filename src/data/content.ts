import { env } from "@/utils/env";

// =============================================================
// Contenu statique — SERVICES
// =============================================================

export type Service = {
  emoji: string;
  title: string;
  desc: string;
  category: "confection" | "finition";
};

export const SERVICES: Service[] = [
  {
    emoji: "🌺",
    title: "Tenues africaines béninoises pour femmes",
    desc: "Boubous, ensembles modernes et coupes élégantes inspirées des codes vestimentaires béninois.",
    category: "confection",
  },
  {
    emoji: "🧶",
    title: "Pagne tissé & bazin chic",
    desc: "Créations raffinées pour cérémonies, cultes, fêtes et événements de prestige.",
    category: "confection",
  },
  {
    emoji: "👗",
    title: "Robes africaines modernes",
    desc: "Robes fluides, cintrées ou structurées, toujours féminines et contemporaines.",
    category: "confection",
  },
  {
    emoji: "💐",
    title: "Tenues de cérémonie femme",
    desc: "Mariage, fiançailles, baptême, réception : des pièces pensées pour briller.",
    category: "confection",
  },
  {
    emoji: "✨",
    title: "Boubous élégants & grands boubous",
    desc: "Volumes harmonieux, finitions propres et tombé impeccable.",
    category: "confection",
  },
  {
    emoji: "🤎",
    title: "Ensembles mère-fille",
    desc: "Looks coordonnés pour une présence forte et élégante en famille.",
    category: "confection",
  },
  {
    emoji: "💼",
    title: "Tenues de bureau féminines",
    desc: "Chemisiers, jupes, tailleurs et robes sobres pour le quotidien professionnel.",
    category: "confection",
  },
  {
    emoji: "🪡",
    title: "Retouches & ajustements",
    desc: "Reprises, modernisations et petites transformations pour faire durer vos pièces.",
    category: "finition",
  },
  {
    emoji: "⚙️",
    title: "Finitions surfileuse EMEL",
    desc: "Surjet net, solide et durable pour une tenue professionnelle.",
    category: "finition",
  },
  {
    emoji: "🔘",
    title: "Pose boutons / pressions",
    desc: "Service rapide pour des fermetures propres et résistantes.",
    category: "finition",
  },
  {
    emoji: "🌸",
    title: "Layette & trousseaux bébé fille",
    desc: "Habits doux et soignés pour nouveau-née et jeune enfant.",
    category: "confection",
  },
  {
    emoji: "🧵",
    title: "Modernisation de tenues traditionnelles",
    desc: "Relecture contemporaine de vos tenues africaines avec respect du style d’origine.",
    category: "confection",
  },
];

// =============================================================
// Formations
// =============================================================

export type Formule = {
  id: "courte" | "specialisee";
  badge: { label: string; tone: "neutral" | "citron" };
  title: string;
  subtitle: string;
  emoji: string;
  bullets: string[];
  programme: { title: string; points: string[] }[];
};

export const FORMULES: Formule[] = [
  {
    id: "courte",
    badge: { label: "RAPIDE", tone: "neutral" },
    title: "Formation Courte",
    subtitle: "6 à 12 mois",
    emoji: "⚡",
    bullets: [
      "Bases solides en couture pour démarrer rapidement",
      "À raison de plusieurs séances par semaine selon l’emploi du temps",
      "Idéale pour apprendre les gestes essentiels et être autonome",
    ],
    programme: [
      {
        title: "Module 1 — Mesures & patrons de base",
        points: ["Prise de mesures", "Patronage de base femme", "Coupe du tissu"],
      },
      {
        title: "Module 2 — Techniques fondamentales",
        points: ["Assemblages", "Ourlets", "Finitions manuelles"],
      },
      {
        title: "Module 3 — Premières réalisations",
        points: ["Blouse", "Jupe", "Boubou simple", "Essayage & retouches"],
      },
    ],
  },
  {
    id: "specialisee",
    badge: { label: "★ RECOMMANDÉE", tone: "citron" },
    title: "Formation Spécialisée",
    subtitle: "3 à 5 ans",
    emoji: "🏆",
    bullets: [
      "Maîtrise complète du métier et gestion d’atelier",
      "Patronage avancé féminin, coupes africaines et finitions haut niveau",
      "Accompagnement vers l’installation professionnelle",
    ],
    programme: [
      {
        title: "Module 1 — Patronage avancé femme",
        points: ["Corsage", "Manches", "Jupes", "Robes", "Moulage"],
      },
      {
        title: "Module 2 — Techniques pro",
        points: ["Surfileuse EMEL", "Pose zip invisible", "Doublures", "Finitions premium"],
      },
      {
        title: "Module 3 — Spécialisation africaine",
        points: ["Tenues béninoises", "Pagne tissé", "Bazin riche", "Boubous modernes"],
      },
      {
        title: "Module 4 — Gestion d’atelier",
        points: ["Devis & tarifs", "Relation cliente", "Organisation", "Suivi des commandes"],
      },
    ],
  },
];

// =============================================================
// Témoignages
// =============================================================

export type Testimonial = {
  name: string;
  role: string;
  content: string;
  emoji: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aimée D.",
    role: "Cliente fidèle",
    emoji: "👗",
    content: "Une maîtrise exceptionnelle. Ma robe de mariage a été confectionnée avec un soin incroyable, dans les délais.",
  },
  {
    name: "Bénédicte K.",
    role: "Ancienne apprentie",
    emoji: "🧵",
    content: "J'ai tout appris avec Maman Colombe. Aujourd'hui j'ai mon propre atelier grâce à sa formation.",
  },
  {
    name: "Florence A.",
    role: "Cliente — tenues de bureau",
    emoji: "💼",
    content: "Mes tenues de bureau sont toujours impeccables. Coupe parfaite et finitions professionnelles.",
  },
];

// =============================================================
// FAQ Formation
// =============================================================

export const FAQ_FORMATION: { q: string; a: string }[] = [
  { q: "Faut-il avoir une machine à coudre ?", a: "Non. L'atelier met à disposition toutes les machines et outils nécessaires pendant la formation." },
  { q: "Combien de temps dure la formation ?", a: "La formation courte dure entre 6 et 12 mois. La formation spécialisée dure entre 3 et 5 ans, à raison de plusieurs séances par semaine." },
  { q: "Peut-on payer en plusieurs fois ?", a: "Oui, un échelonnement est possible. Précisez votre préférence dans le formulaire, nous reviendrons vers vous." },
  { q: "Y a-t-il une attestation à la fin ?", a: "Une attestation de fin de formation est remise à chaque participante, valorisant les compétences acquises en atelier." },
];

// =============================================================
// Coordonnées (issues de env pour avoir une seule source)
// =============================================================

export const CONTACT = {
  phone1: env.schoolPhone,
  phone1Raw: env.schoolPhoneRaw,
  phone2: env.schoolPhone2,
  phone2Raw: env.schoolPhone2Raw,
  email: env.schoolEmail,
  whatsappRaw: env.whatsappGeneralRaw,
  location: env.schoolLocation,
  founded: env.schoolFounded,
  hours: [
    { label: "Lundi – Samedi", value: "8h – 21h" },
    { label: "Dimanche", value: "8h – 20h" },
  ],
};
