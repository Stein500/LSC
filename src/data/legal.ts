/**
 * legal.ts — IDENTITÉ OFFICIELLE de l'atelier 🧾
 * ==============================================
 * SOURCE UNIQUE. Quand les papiers d'État (RCCM, IFU…) donnent
 * une valeur, on la pose ICI — et elle s'affiche proprement
 * partout où la loi et la confiance la demandent :
 *
 *   - Mentions légales (src/pages/Legal/Mentions.tsx)
 *   - pied-de-page : micro-ligne « Atelier déclaré » (Footer)
 *   - JSON-LD Organization : legalName / taxID / identifier (SEO B2B)
 *
 * ⚠️ Ne jamais mettre ici de scan ni de données privées :
 *    seules les mentions destinées à être publiques vivent ici.
 *
 * 🪡 Champs vides = papier attendu. Une ligne remplie = affichée.
 */
export const LEGAL = {
  /** Nom commercial affiché partout (la vitrine). */
  displayName: "Les Services Colombes",
  /** Dénomination exacte de l'extrait RCCM (si différente). */
  legalName: "",
  /** Forme juridique : EI, SARL, SARL unipersonnelle… */
  formeJuridique: "",
  /** N° RCCM (Registre du Commerce et du Crédit Mobilier). */
  rccm: "",
  /** N° IFU (Identifiant Fiscal Unique — DGI Bénin). */
  ifu: "",
  /** N° d'immatriculation employeur (CNSS/AGSLC le cas échéant). */
  employeur: "",
  /** Adresse officielle du siège / de l'établissement. */
  siege: "",
  /** Année officielle de début d'activité (aligne le « depuis … » du site). */
  foundedYear: "1990",
} as const;

/** True dès qu'un identifiant officiel est connu → affiche la confiance. */
export const hasOfficialIds = Boolean(LEGAL.rccm || LEGAL.ifu || LEGAL.legalName);

/** Micro-ligne de confiance pour le pied-de-page (vide tant qu'aucun numéro). */
export function officialFooterLine(): string {
  const parts: string[] = [];
  if (LEGAL.rccm) parts.push(`RCCM ${LEGAL.rccm}`);
  if (LEGAL.ifu) parts.push(`IFU ${LEGAL.ifu}`);
  return parts.join(" · ");
}
