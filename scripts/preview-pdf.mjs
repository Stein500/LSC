/**
 * Génère un PDF d'aperçu pour vérifier le rendu (1 page, ticket pro).
 * Usage : node scripts/preview-pdf.mjs
 */
import { writeFileSync } from "node:fs";
import { buildSubmissionPdf, buildSubmissionPdfBase64 } from "../api/lib/pdf.js";

const samples = {
  precommande: {
    ref: "CLB-PRECOM-002",
    nom: "Adjovi Kossou",
    telephone: "+229 01 67 40 94 08",
    email: "adjovi.kossou@example.bj",
    type_tenue: "Robe de mariée traditionnelle",
    tenue_autre: "",
    couleur_preferee: "Or et blanc cassé",
    taille: "M (38)",
    date_souhaitee: "15 décembre 2025",
    budget: "250 000 FCFA",
    description:
      "Robe de mariée avec corsage ajusté, jupe ample en bazin riche, " +
      "dentelleperlée sur le bustier, traîne courte. Volonté d'intégrer le pagne " +
      " traditionnel du Bénin en bordure.",
    mesures: "Tour de poitrine 88 cm, taille 70 cm, hanches 96 cm, hauteur 1m68",
  },
  formation: {
    ref: "CLB-FORM-014",
    nom: "Dossou",
    prenom: "Marie",
    age: 24,
    telephone: "+229 01 95 76 36 01",
    email: "marie.dossou@example.bj",
    niveau_actuel: "debutant",
    formation_choisie: "courte",
    disponibilite: ["matin", "weekend"],
    motivation:
      "Je souhaite apprendre la couture pour créer ma propre marque de vêtements " +
      "féminins à Porto-Novo. La mode africaine me passionne depuis l'enfance.",
    motif_paiement: "Mobile Money en 2 fois",
  },
  contact: {
    ref: "CLB-CONT-007",
    nom: "Yémima Adégnika",
    email: "yemima@example.bj",
    telephone: "+229 01 23 45 67 89",
    sujet: "devis",
    message:
      "Bonjour, je souhaiterais obtenir un devis pour la confection de 3 tenues " +
      "professionnelles (tailleurs) pour mon équipe. Possibilité de vous rencontrer " +
      "à l'atelier la semaine prochaine ? Cordialement.",
  },
};

async function main() {
  const type = process.argv[2] || "precommande";
  if (!samples[type]) {
    console.error("Type inconnu:", type, "— choisir: precommande, formation, contact");
    process.exit(1);
  }
  const buf = await buildSubmissionPdf(type, samples[type]);
  const out = `/tmp/preview-${type}.pdf`;
  writeFileSync(out, buf);
  const b64 = await buildSubmissionPdfBase64(type, samples[type]);
  console.log("✓ PDF généré :", out);
  console.log("  Taille :", buf.length, "octets");
  console.log("  Base64 :", b64.length, "caractères");
  console.log("  1ère ligne base64 :", b64.slice(0, 60) + "…");
}

main().catch((e) => {
  console.error("✗ Erreur :", e);
  process.exit(1);
});
