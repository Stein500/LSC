/**
 * Centralise les chemins et un fallback SVG du logo pour tout le front.
 * Le fallback permet d'éviter un logo cassé si l'image a été retirée.
 *
 * Toutes les images du site sont en WebP — voir /public/images/.
 */
export const LOGO_WEBP = "/images/logo.webp";

function escAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Fallback vectoriel léger : suffisamment lisible si les fichiers image ne sont pas là.
 * Il garde la palette du site et affiche le nom de la marque.
 */
const LOGO_FALLBACK_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 341" role="img" aria-label="Les Services Colombes">
  <rect width="512" height="341" rx="28" fill="transparent"/>
  <circle cx="256" cy="114" r="58" fill="#FFFFFF" fill-opacity="0.92" stroke="#BFFF00" stroke-width="8"/>
  <g fill="none" stroke="#8B4513" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M214 114c16 16 37 31 64 48"/>
    <path d="M224 98l-16-16"/>
    <path d="M266 92c8 10 16 21 25 31"/>
    <path d="M236 126c-15 16-27 34-36 54"/>
    <path d="M287 89c6-6 14-6 20 0"/>
    <path d="M275 140c12 12 27 24 45 31"/>
  </g>
  <circle cx="256" cy="114" r="4.5" fill="#8B4513"/>
  <text x="256" y="214" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700" fill="#000000" letter-spacing="1.8">
    LES SERVICES
  </text>
  <text x="256" y="258" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="42" font-weight="700" fill="#5C2E0C" letter-spacing="1.4">
    COLOMBES
  </text>
  <text x="256" y="292" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="#5C2E0C" letter-spacing="4.4">
    ATELIER DE COUTURE &amp; MERCERIE
  </text>
</svg>`.trim();

export const LOGO_FALLBACK_SVG_DATA_URL =
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(LOGO_FALLBACK_SVG)}`;

export const LOGO_ALT = "Les Services Colombes";
