/**
 * Lien d'évitement pour utilisateurs clavier / screen readers.
 * Appuyer sur Tab en haut de page le fait apparaître.
 * Permet de sauter directement au contenu principal.
 */
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-6 focus:py-3 focus:bg-[var(--color-orange)] focus:text-white focus:rounded-lg focus:shadow-2xl focus:font-semibold focus:outline-none focus:ring-4 focus:ring-[var(--color-citron)]/50"
    >
      Aller au contenu principal
    </a>
  );
}
