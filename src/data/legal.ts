/**
 * legal.ts — IDENTITÉ OFFICIELLE de l'atelier 🧾
 * ==============================================
 * SOURCE UNIQUE. Les valeurs ci-dessous viennent des papiers
 * d'État reçus le 23-09-2026 (extrait RCCM, attestation IFU,
 * déclaration d'établissement, immatriculation CNSS, annonce
 * légale, carte professionnelle APIEx) et s'affichent partout
 * où la loi et la confiance la demandent :
 *
 *   - Mentions légales (src/pages/Legal/Mentions.tsx)
 *   - pied-de-page : micro-ligne « Atelier déclaré » (Footer)
 *   - JSON-LD Organization : legalName / taxID / identifier (SEO B2B)
 *
 * ⚠️ Ne jamais mettre ici de scan ni de données privées
 *    (naissance, domicile personnel…) : seules les mentions
 *    destinées à être publiques vivent ici.
 */
export const LEGAL = {
  /** Nom commercial affiché partout (la vitrine). */
  displayName: "Les Services Colombes",
  /** Dénomination exacte de l'extrait RCCM. */
  legalName: "Couture Colombe et Merceries",
  /** Forme juridique. */
  formeJuridique: "Établissement — entreprise individuelle",
  /** Cheffe d'entreprise & directrice de la publication. */
  dirigeante: "Mme Sewe Vihoutou Colombe Prisca Koukoui",
  /** N° RCCM du 23-09-2026 (Tribunal de Commerce de Cotonou — PNO). */
  rccm: "RB/PNO/26 A 129215",
  /** Date de l'immatriculation principale au RCCM. */
  rccmDate: "23 septembre 2026",
  /** N° IFU (attestation DGI du 23-09-2026 — CIPE 1 Porto-Novo). */
  ifu: "0202394907200",
  /** N° d'immatriculation employeur CNSS (à compter du 23-09-2026). */
  employeur: "02023949072001",
  /** N° de déclaration d'établissement (Min. du Travail — DGT). */
  declaration: "0068642-PNO",
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
