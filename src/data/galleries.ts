import type { GalleryImage } from "@/components/ui/ScissorGallery";

/**
 * Galeries du site — Les Services Colombes
 *
 * ✂️ CHARTE 09/2026 (v3 — FINALE) — une seule silhouette pour toutes :
 *   - gabarit unique **1600×1200 (4:3 paysage)**, WebP q78 ;
 *   - palette maison FINALE : **rose poudré dominante, orange/safran,
 *     marron, noir, blanc, vert citron feuille** + les couleurs du logo
 *     (rouge colombe, fil d'or, olive du rameau seulement) — **zéro bleu** ;
 *   - tenues des modèles : **robes, jupes, chemisiers uniquement —
 *     jamais de pantalon** (boubou = robe ✓, robes de mariage bienvenues) ;
 *   - filigrane signature **logo + « Couture Colombe & Merceries »** en
 *     bas à droite (cachet anti-fausse-utilisation, posé par
 *     scripts/stamp-signature.py) ;
 *   - **curées, pas exhaustives** : peu d'images par page, toutes utiles —
 *     le site reste léger et la lecture, limpide ;
 *   - chaque image est **téléchargeable** par le visiteur (bouton ⬇ de la
 *     galerie) et porte un beau nom de fichier.
 *
 * La version de chaque image vit dans data/image-versions.json
 * (cache-bust automatique côté SmartImage).
 */

// ======================= GALERIE 1 — L'ATELIER (Accueil) =======================
export const GALLERY_ATELIER: GalleryImage[] = [
  {
    src: "/images/gallery/atelier-01.webp",
    alt: "Couturières en robes colorées autour de la table de coupe, grande plante verte près de la fenêtre",
    caption: "L'atelier — un espace dédié à la création",
  },
  {
    src: "/images/gallery/atelier-03.webp",
    alt: "Mains de couturière cousant un ourlet de wax rouge et safran",
    caption: "Chaque détail compte",
  },
  {
    src: "/images/gallery/atelier-04.webp",
    alt: "Patron de robe tracé à la craie, ciseaux dorés, mètre safran et wax orange à motifs feuille",
    caption: "La coupe — étape fondatrice du sur-mesure",
  },
  {
    src: "/images/gallery/atelier-06.webp",
    alt: "Couturière en robe orange ajustant une robe wax rose à motifs feuille sur mannequin de tailleur",
    caption: "Plus de 35 ans de passion et de savoir-faire",
  },
  {
    src: "/images/gallery/mariage-robe-10.webp",
    alt: "Robe de mariée en finition sur mannequin de tailleur, vraies manches longues en dentelle, épingles et mètre safran",
    caption: "La robe de mariée — cousue ici, finie à la main",
  },
];

// ======================= GALERIE 2 — NOS CRÉATIONS (Services) =======================
export const GALLERY_SERVICES: GalleryImage[] = [
  {
    src: "/images/gallery/creation-afrique-01.webp",
    alt: "Grand boubou marron richement brodé de fil doré et de touches vert feuille, sur cintre",
    caption: "Boubous et ensembles — l'élégance africaine",
  },
  {
    src: "/images/gallery/mariage-robe-01.webp",
    alt: "Robe de mariée en bazin blanc cassé brodé de fil d'or, voile et bouquet rose-orange sur chaise bois",
    caption: "Le grand jour — la mariée cousue d'or",
  },
  {
    src: "/images/gallery/mariage-robe-03.webp",
    alt: "Mariée traditionnelle en pagne tissé rouge colombe et or, couronne dorée, colliers d'or et éventail tressé",
    caption: "Mariage coutumier — l'éclat de la tradition",
  },
  {
    src: "/images/gallery/mariage-robe-04.webp",
    alt: "Mariée souriante en robe sirène de dentelle ivoire brodée d'or, long voile, bouquet safran devant une arche fleurie rose",
    caption: "La mariée romantique — dentelle, voile et fil d'or",
  },
  {
    src: "/images/gallery/mariage-robe-08.webp",
    alt: "Mains de la mariée sur son bouquet : manche brodée de fil d'or et de perles, bague et bracelet dorés",
    caption: "Le détail qui fait la robe — broderie main",
  },
  {
    src: "/images/gallery/creation-afrique-03.webp",
    alt: "Ensemble jupe longue et chemisier à manches bouffantes en wax feuilles orange, marron et vert citron",
    caption: "Jupe & chemisier — le duo qui fait la silhouette",
  },
  {
    src: "/images/gallery/creation-afrique-04.webp",
    alt: "Robe moderne et fluide en wax rose poudré à motifs orange et feuilles vert citron, en mouvement",
    caption: "Robes modernes — entre tradition et contemporain",
  },
  {
    src: "/images/gallery/creation-afrique-05.webp",
    alt: "Layette blanc cassé : petite robe de cérémonie, bonnet, bavoir et chaussons bordés de rubans rose, safran et vert feuille",
    caption: "Layette — la douceur pour les tout-petits",
  },
];

// ============== GALERIE 3 — CRÉATIONS SIGNATURE (Accueil) ==============
export const GALLERY_CREATIONS: GalleryImage[] = [
  {
    src: "/images/gallery/tenue-semaine-01.webp",
    alt: "Femme élégante en robe wax orange safran à motifs marron et vert feuille, en boutique",
    caption: "Tenue de la semaine — la prestance, souriante",
  },
  {
    src: "/images/gallery/jeune-fille-01.webp",
    alt: "Fillette joyeuse faisant tournoyer sa robe wax orange safran à motifs rose et vert feuille",
    caption: "Petites princesses — le wax qui fait danser",
  },
  {
    src: "/images/gallery/mariage-robe-05.webp",
    alt: "Petite demoiselle d'honneur rayonnante en robe safran à manches bouffantes, ceinture rose, panier de pétales",
    caption: "Demoiselles d'honneur — la joie en safran",
  },
  {
    src: "/images/gallery/jeune-fille-02.webp",
    alt: "Adolescente en robe wax marron et or à ceinture vert feuille, près de la fenêtre de l’atelier",
    caption: "Jeunes filles — la tendance wax bien coupée",
  },
  {
    src: "/images/gallery/layette-bebe-01.webp",
    alt: "Bébé souriant en petite robe de layette blanc cassé brodée de fil safran et vert feuille",
    caption: "Layette — la douceur dès le premier âge",
  },
  {
    src: "/images/gallery/famille-trio-01.webp",
    alt: "Trois générations — grand-mère, maman et bébé — en robes wax assorties orange, rose et vert feuille",
    caption: "Trois générations, un même fil — les ensembles assortis",
  },
];

// ======================= GALERIE 4 — CONTACT (mini galerie) =======================
export const GALLERY_CONTACT: GalleryImage[] = [
  {
    src: "/images/gallery/atelier-01.webp",
    alt: "L'équipe de l'atelier Les Services Colombes autour de la table de coupe",
    caption: "L'atelier — un lieu chaleureux, à découvrir",
  },
  {
    src: "/images/gallery/atelier-04.webp",
    alt: "Table de coupe avec patron, ciseaux dorés et mètre ruban",
    caption: "Un savoir-faire précis, du croquis à la coupe",
  },
  {
    src: "/images/gallery/atelier-06.webp",
    alt: "Robe wax ajustée sur mannequin de tailleur dans l'atelier",
    caption: "À très vite à l'atelier !",
  },
];

// ==================================================================
// GALERIES DÉDIÉES AUX PAGES (Contact & Inspirations)
// ==================================================================

export const GALLERY_CONTACT_PAGES: GalleryImage[] = [
  {
    src: "/images/gallery/contact-page-01.webp",
    alt: "Robe wax orange safran à motifs feuille sur cintre bois, mur rose poudré de l'atelier",
    caption: "L'atelier — un lieu ouvert et coloré",
  },
  {
    src: "/images/gallery/contact-page-02.webp",
    alt: "Portant de tenues africaines : safran, boubou marron-or, wax rouge",
    caption: "Des modèles à essayer, des tissus à toucher",
  },
  {
    src: "/images/gallery/contact-page-03.webp",
    alt: "Carnet de patrons, nuancier wax rose-orange et vert feuille, thé fumant et branche fraîche",
    caption: "Un espace calme pour parler de votre projet",
  },
];

export const GALLERY_INSPIRATIONS_PAGES: GalleryImage[] = [
  {
    src: "/images/gallery/inspirations-page-01.webp",
    alt: "Robe wax à volants superposés orange grenadine et or, touches de feuilles vert citron",
    caption: "Wax — la pièce signature",
  },
  {
    src: "/images/gallery/mariage-robe-02.webp",
    alt: "Cortège de mariage africain : trois demoiselles d'honneur en robes wax assorties rose, orange et vert feuille",
    caption: "Le cortège — des robes assorties, cousues d'un même fil",
  },
  {
    src: "/images/gallery/mariage-robe-07.webp",
    alt: "Trois invitées élégantes en tenues aso-ebi assorties : robes wax rose poudré, orange et feuilles, turbans assortis",
    caption: "L'aso-ebi — la famille habillée d'un même pagne",
  },
  {
    src: "/images/gallery/mariage-robe-09.webp",
    alt: "Jeune mariée en robe corolle wax orange et feuille vert citron qui tourne sous une pluie de pétales, devant la mairie rose",
    caption: "Mariage civil — la robe qui danse",
  },
  {
    src: "/images/gallery/mariage-accessoires-01.webp",
    alt: "Accessoires de la mariée sur soie rose poudré : voile, gants de dentelle, escarpins dorés, bijoux, bouquet et mètre-ruban",
    caption: "La trousse de la mariée — tout, jusqu'au dernier détail",
  },
  {
    src: "/images/gallery/inspirations-page-02.webp",
    alt: "Éventails de pagnes wax orange, rose, marron et vert citron feuille en cascade sur la table",
    caption: "Matières — wax, bazin, pagne, lin",
  },
  {
    src: "/images/gallery/inspirations-page-03.webp",
    alt: "Silhouette de dos en grand boubou terracotta brodé d'or et de touches vert feuille, au coucher du soleil",
    caption: "Silhouette — heure dorée",
  },
  {
    src: "/images/gallery/inspirations-page-04.webp",
    alt: "Bobines de fil orange, rouge colombe et fil d’or, ciseaux dorés et bords de pagnes feuille, vus de dessus",
    caption: "Outils — le geste et la matière",
  },
];

// ======================= GALERIE 5 — L'ÉCOLE DE COUTURE (Formation) =======================
export const GALLERY_FORMATION: GalleryImage[] = [
  {
    src: "/images/gallery/formation-couture-01.webp",
    alt: "Salle de formation lumineuse : machines alignées, pagnes wax orange-rose-feuille et plante verte près de la fenêtre",
    caption: "La salle de formation — un cadre propice à l'apprentissage",
  },
  {
    src: "/images/gallery/formation-couture-02.webp",
    alt: "Apprenante en robe wax rose et orange cousant à la machine, vue de dos dans l'atelier",
    caption: "Encadrement personnalisé à chaque étape",
  },
  {
    src: "/images/gallery/formation-couture-04.webp",
    alt: "Mains guidant un wax orange à motifs feuilles sous l'aiguille de la machine à coudre",
    caption: "Les techniques — expliquées et pratiquées",
  },
  {
    src: "/images/gallery/formation-couture-05.webp",
    alt: "Groupe d'apprenantes en robes wax colorées, en pleine séance autour des tissus",
    caption: "Une progression ensemble, dans la bonne humeur",
  },
];
