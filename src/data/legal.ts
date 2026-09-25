/**
 * legal.ts — IDENTITÉ OFFICIELLE de l'atelier 🧾
 * ==============================================
 * SOURCE UNIQUE. Les valeurs ci-dessous viennent des papiers
 * d'État reçus le 23-09-2026 (extrait RCCM, attestation IFU)
 * et s'affichent partout où la loi et la confiance la demandent :
 *
 *   - Mentions légales (src/pages/Legal/Mentions.tsx)
 *   - pied-de-page : micro-ligne « Atelier déclaré » (Footer)
 *   - JSON-LD Organization : legalName / taxID / identifier (SEO B2B)
 *
 * ✂️ Volonté de la maison (09/2026) : l'essentiel suffit —
 *    RCCM + IFU. Pas de nom de personne, pas de numéro CNSS,
 *    pas de carte professionnelle sur la voie publique.
 *
 * ⚠️ Ne jamais mettre ici de scan ni de données privées
 *    (naissance, domicile personnel…) : seules les mentions
 *    destinées à être publiques vivent ici.
 */
export const LEGAL = {
  /** Nom commercial historique affiché partout (la vitrine). */
  displayName: "Les Services Colombes",
  /** Dénomination exacte de l'extrait RCCM — la nouvelle enseigne. */
  legalName: "Couture Colombe et Merceries",
  /** Forme juridique. */
  formeJuridique: "Établissement — entreprise individuelle",
  /** N° RCCM du 23-09-2026 (Tribunal de Commerce de Cotonou — PNO). */
  rccm: "RB/PNO/26 A 129215",
  /** Date de l'immatriculation principale au RCCM. */
  rccmDate: "23 septembre 2026",
  /** N° IFU (attestation DGI du 23-09-2026 — CIPE 1 Porto-Novo). */
  ifu: "0202394907200",
  /** Siège social officiel (adresse de l'établissement). */
  siege: "Tokpota Davo, 5ᵉ arrondissement, Porto-Novo, Bénin",
  /** Activité exercée depuis 1990 — immatriculée officiellement en 2026. */
  foundedYear: "1990",
} as const;

/** True dès qu'un identifiant officiel est connu → affiche la confiance. */
export const hasOfficialIds = Boolean(LEGAL.rccm || LEGAL.ifu || LEGAL.legalName);

/** Micro-ligne de confiance pour le pied-de-page. */
export function officialFooterLine(): string {
  const parts: string[] = [];
  if (LEGAL.rccm) parts.push(`RCCM ${LEGAL.rccm}`);
  if (LEGAL.ifu) parts.push(`IFU ${LEGAL.ifu}`);
  return parts.join(" · ");
}
