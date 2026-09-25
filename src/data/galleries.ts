import type { GalleryImage } from "@/components/ui/ScissorGallery";

/**
 * Galeries du site — Les Services Colombes
 *
 * ✂️ CHARTE 09/2026 (v2) — une seule silhouette pour toutes les photos :
 *   - gabarit unique **1600×1200 (4:3 paysage)**, WebP q78 ;
 *   - NOUVELLE palette maison : **bleu roi, marron, orange safran, rose
 *     poudré** + les couleurs du logo (rouge colombe, fil d'or, accent
 *     olive du rameau) ;
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
    alt: "Patron tracé à la craie, ciseaux dorés et mètre ruban sur la table de coupe",
    caption: "La coupe — étape fondatrice du sur-mesure",
  },
  {
    src: "/images/gallery/atelier-06.webp",
    alt: "Couturière ajustant une robe wax rouge et or sur mannequin de tailleur",
    caption: "Plus de 35 ans de passion et de savoir-faire",
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
    alt: "Robe wax rouge et or sur cintre, mur rose poudré de l'atelier",
    caption: "L'atelier — un lieu ouvert et coloré",
  },
  {
    src: "/images/gallery/contact-page-02.webp",
    alt: "Portant de tenues africaines : safran, boubou marron-or, wax rouge",
    caption: "Des modèles à essayer, des tissus à toucher",
  },
  {
    src: "/images/gallery/contact-page-03.webp",
    alt: "Carnet de patrons, nuancier de wax, ciseaux dorés et thé fumant",
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
    src: "/images/gallery/inspirations-page-02.webp",
    alt: "Éventails de pagnes wax rouge, safran et marron sur la table de l'atelier",
    caption: "Matières — wax, bazin, pagne, lin",
  },
  {
    src: "/images/gallery/inspirations-page-03.webp",
    alt: "Silhouette de dos en grand boubou terracotta brodé d'or, au coucher du soleil",
    caption: "Silhouette — heure dorée",
  },
  {
    src: "/images/gallery/inspirations-page-04.webp",
    alt: "Bobines de fil rouge et safran, ciseaux dorés et patrons, vus de dessus",
    caption: "Outils — le geste et la matière",
  },
];

// ======================= GALERIE 5 — L'ÉCOLE DE COUTURE (Formation) =======================
export const GALLERY_FORMATION: GalleryImage[] = [
  {
    src: "/images/gallery/formation-couture-01.webp",
    alt: "Salle de formation lumineuse : machines alignées et pagnes wax sur la table",
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
