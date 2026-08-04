import { z } from "zod";

// =============================================================
// Schémas de validation partagés
// =============================================================

const requiredMessage = "Veuillez remplir cette section.";

function selectEnum<const T extends [string, ...string[]]>(values: T, message: string) {
  return z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    z.enum(values, {
      required_error: message,
      invalid_type_error: message,
    }),
  );
}

export const phoneSchema = z
  .string()
  .min(8, "Veuillez entrer un numéro de téléphone valide.")
  .regex(/^[0-9+\s()-]+$/, "Merci de vérifier le format du numéro");

export const emailSchema = z
  .string()
  .email("Veuillez entrer une adresse e-mail valide.")
  .optional()
  .or(z.literal(""));

export const nameSchema = z
  .string()
  .min(2, "Veuillez écrire au moins 2 caractères.")
  .max(80, "Le texte est trop long.");

// ----- Formation -----
export const formationSchema = z.object({
  nom: nameSchema,
  prenom: nameSchema,
  age: z.preprocess((value) => {
    if (value === "" || value == null) return undefined;
    if (typeof value === "number" && Number.isNaN(value)) return undefined;
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const parsed = Number(trimmed.replace(",", "."));
      return Number.isNaN(parsed) ? undefined : parsed;
    }
    return value;
  }, z.number({ required_error: "Veuillez indiquer votre âge.", invalid_type_error: "Veuillez indiquer votre âge." }).int().min(14, "L’âge minimum est de 14 ans.").max(80, "L’âge maximum est de 80 ans.")),
  telephone: phoneSchema,
  email: emailSchema,
  niveau_actuel: selectEnum(["debutant", "intermediaire"], "Veuillez choisir votre niveau."),
  formation_choisie: selectEnum(["courte", "specialisee", "indecis"], "Veuillez choisir une formation."),
  disponibilite: z
    .array(z.enum(["matin", "apresmidi", "soir", "weekend"]))
    .min(1, "Veuillez choisir au moins une disponibilité."),
  motivation: z.string().max(1000, "Votre message est trop long").optional(),
  motif_paiement: z.string().max(120).optional(),
});

export type FormationSchema = z.infer<typeof formationSchema>;

// ----- Pré-commande -----
export const precommandeSchema = z.object({
  nom: nameSchema,
  telephone: phoneSchema,
  email: emailSchema,
  type_tenue: z.string().min(2, "Veuillez préciser le type de tenue."),
  tenue_autre: z.string().max(120).optional(),
  couleur_preferee: z.string().max(60).optional(),
  taille: z.string().max(20).optional(),
  date_souhaitee: z.string().optional(),
  budget: z.string().max(40).optional(),
  description: z.string().max(1500, "Votre description est trop longue.").optional(),
  mesures: z.string().max(1500, "Votre texte est trop long.").optional(),
});

export type PrecommandeSchema = z.infer<typeof precommandeSchema>;

// ----- Contact -----
export const contactSchema = z.object({
  nom: nameSchema,
  email: emailSchema,
  telephone: phoneSchema.optional().or(z.literal("")),
  sujet: selectEnum(["question", "devis", "reclamation", "autre"], "Veuillez choisir un sujet."),
  message: z.string().min(10, "Veuillez écrire au moins 10 caractères.").max(2000, "Votre message est trop long."),
});

export type ContactSchema = z.infer<typeof contactSchema>;
