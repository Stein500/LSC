import type { GalleryImage } from "@/components/ui/ScissorGallery";

/**
 * Galeries du site — Les Services Colombes
 *
 * Toutes les images sont servies en WebP uniquement (chemin conservé :
 * `/images/gallery/...`). Le dossier /public/images/ doit être fourni
 * localement pour le dev et le déploiement. Voir GALERIE-IMAGES.md.
 *
 * Convention de nommage :
 *   - <theme>-NN.webp
 *
 * Le composant ScissorGallery s'adapte automatiquement au ratio
 * de chaque image (portrait, paysage, carré).
 */

// ======================= GALERIE 1 — L'ATELIER =======================
// Insérée sur la page d'accueil (Home), entre "Présentation" et "Services"
export const GALLERY_ATELIER: GalleryImage[] = [
  {
    src: "/images/gallery/atelier-01.webp",
    alt: "Vue d'ensemble de l'atelier Les Services Colombes à Porto-Novo",
    caption: "L'atelier — un espace dédié à la création",
  },
  {
    src: "/images/gallery/atelier-02.webp",
    alt: "Les machines à coudre professionnelles de l'atelier",
    caption: "Nos machines — un parc entretenu avec soin",
  },
  {
    src: "/images/gallery/atelier-03.webp",
    alt: "Détail d'un travail de couture en cours",
    caption: "Chaque détail compte",
  },
  {
    src: "/images/gallery/atelier-04.webp",
    alt: "La table de coupe et les patrons",
    caption: "La coupe — étape fondatrice du sur-mesure",
  },
  {
    src: "/images/gallery/atelier-05.webp",
    alt: "Vue de l'espace essayage",
    caption: "L'essayage — pour une tenue qui vous va",
  },
  {
    src: "/images/gallery/atelier-06.webp",
    alt: "Colombe au travail, en plein création",
    caption: "Plus de 35 ans de passion et de savoir-faire",
  },
];

// ======================= GALERIE 2 — LES CRÉATIONS =======================
// Insérée sur la page Services, après la grille des prestations
export const GALLERY_CREATIONS: GalleryImage[] = [
  {
    src: "/images/gallery/creation-afrique-01.webp",
    alt: "Tenue africaine béninoise sur mesure",
    caption: "Boubous et ensembles — l'élégance africaine",
  },
  {
    src: "/images/gallery/creation-afrique-02.webp",
    alt: "Robe moderne en pagne tissé",
    caption: "Pagne tissé — pour des cérémonies uniques",
  },
  {
    src: "/images/gallery/creation-afrique-03.webp",
    alt: "Création en bazin chic",
    caption: "Bazin chic — raffinement et prestance",
  },
  {
    src: "/images/gallery/creation-afrique-04.webp",
    alt: "Robe africaine moderne et fluide",
    caption: "Robes modernes — entre tradition et contemporain",
  },
  {
    src: "/images/gallery/creation-afrique-05.webp",
    alt: "Ensemble layette pour nouveau-né",
    caption: "Layette — la douceur pour les tout-petits",
  },
  {
    src: "/images/gallery/creation-afrique-06.webp",
    alt: "Finitions et détails d'une tenue sur mesure",
    caption: "Les finitions — la signature d'un travail bien fait",
  },
  // ======= LES TENUES DE LA SEMAINE (wax tendance, élégance mature) =======
  {
    src: "/images/gallery/tenue-semaine-01.jpg",
    alt: "Femme africaine élégante et mature en robe wax citron et bleu ciel, coupe moderne",
    caption: "Tenue de la semaine — la robe wax, prestance sourire",
  },
  {
    src: "/images/gallery/tenue-semaine-02.jpg",
    alt: "Femme africaine mature en ensemble wax jupe longue et haut assorti, tons marron et or",
    caption: "Jupe & haut wax — l'allure des grandes occasions",
  },
  {
    src: "/images/gallery/tenue-semaine-03.jpg",
    alt: "Femme africaine majestueuse en grande robe wax bleu ciel et citron près d'une fenêtre lumineuse",
    caption: "La grande robe wax — majesté au quotidien",
  },
];

// ======================= GALERIE 4 — CONTACT (mini galerie) =======================
// Insérée sur la page Contact, juste après le PageHero.
// 4 photos (format "mini") pour conserver un rythme léger sur cette page.
export const GALLERY_CONTACT: GalleryImage[] = [
  {
    src: "/images/gallery/atelier-01.webp",
    alt: "L'atelier des Services Colombes à Porto-Novo",
    caption: "L'atelier — un lieu chaleureux, à découvrir",
  },
  {
    src: "/images/gallery/atelier-02.webp",
    alt: "Les machines à coudre professionnelles de l'atelier",
    caption: "Du matériel entretenu avec soin",
  },
  {
    src: "/images/gallery/atelier-05.webp",
    alt: "Espace d'essayage et d'accueil de l'atelier",
    caption: "Un espace d'accueil et d'essayage",
  },
  {
    src: "/images/gallery/atelier-06.webp",
    alt: "Colombe, votre interlocutrice à l'atelier",
    caption: "À très vite à l'atelier !",
  },
];

// ============================================================================
// GALERIES DÉDIÉES AUX PAGES (Contact & Inspirations)
// 4 images par page — photoréalistes, ambiance atelier Porto-Novo
// Fichiers à déposer dans public/images/gallery/
// ============================================================================

export const GALLERY_CONTACT_PAGES: GalleryImage[] = [
  {
    src: "/images/gallery/contact-page-01.webp",
    alt: "Façade de l'atelier Les Services Colombes à Porto-Novo, ambiance accueillante et professionnelle",
    caption: "L'atelier — un lieu ouvert et coloré",
  },
  {
    src: "/images/gallery/contact-page-02.webp",
    alt: "Mains d'une couturière tenant un téléphone portable lors d'une consultation client",
    caption: "À votre écoute — par tous les canaux",
  },
  {
    src: "/images/gallery/contact-page-03.webp",
    alt: "Table de travail avec carnet ouvert, mètre ruban enroulé et tasse de thé fumante",
    caption: "Un espace calme pour parler de votre projet",
  },
  {
    src: "/images/gallery/contact-page-04.webp",
    alt: "Espace d'accueil de l'atelier avec chaise en rotin, présentoir de tissus et fleurs séchées",
    caption: "Bienvenue — on vous attend",
  },
];

export const GALLERY_INSPIRATIONS_PAGES: GalleryImage[] = [
  {
    src: "/images/gallery/inspirations-page-01.webp",
    alt: "Pièce de wax multicolore drapée sur mannequin invisible, lumière studio douce",
    caption: "Wax — la pièce signature",
  },
  {
    src: "/images/gallery/inspirations-page-02.webp",
    alt: "Macro d'un mélange de tissus africains et européens, textures révélées par lumière rasante",
    caption: "Matières — wax, bazin, pagne, lin",
  },
  {
    src: "/images/gallery/inspirations-page-03.webp",
    alt: "Silhouette éditoriale de dos en bazin bleu nuit richement brodé de fils dorés",
    caption: "Silhouette — heure dorée",
  },
  {
    src: "/images/gallery/inspirations-page-04.webp",
    alt: "Flat lay couture vue du dessus : bobines de fils, ciseaux dorés, patrons et craie tailleur",
    caption: "Outils — le geste et la matière",
  },
];

// ======================= GALERIE 3 — L'ÉCOLE DE COUTURE =======================
// Insérée sur la page Formation, après les deux formules
export const GALLERY_FORMATION: GalleryImage[] = [
  {
    src: "/images/gallery/formation-couture-01.webp",
    alt: "Salle de formation en couture",
    caption: "La salle de formation — un cadre propice à l'apprentissage",
  },
  {
    src: "/images/gallery/formation-couture-02.webp",
    alt: "Apprenante en cours de couture",
    caption: "Encadrement personnalisé à chaque étape",
  },
  {
    src: "/images/gallery/formation-couture-03.webp",
    alt: "Apprentissage de la prise de mesures",
    caption: "Les bases — de la mesure à la coupe",
  },
  {
    src: "/images/gallery/formation-couture-04.webp",
    alt: "Démonstration sur machine à coudre",
    caption: "Les techniques — expliquées et pratiquées",
  },
  {
    src: "/images/gallery/formation-couture-05.webp",
    alt: "Groupe d'apprenantes en pleine séance",
    caption: "Une progression ensemble, dans la bonne humeur",
  },
  {
    src: "/images/gallery/formation-couture-06.webp",
    alt: "Présentation d'un projet de fin de formation",
    caption: "Le résultat — des créations qui leur ressemblent",
  },
];
