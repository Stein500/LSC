import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { precommandeSchema, type PrecommandeSchema } from "@/utils/validation";
import { trackFormStart, trackFormStep, trackFormSubmit, trackFormError } from "@/utils/api";
import { generateTicketId } from "@/utils/format";
import { saveTicket, updateTicket } from "@/utils/tickets";
import { onSuccessSmartToast, onErrorSmartToast } from "@/hooks/useSmartToasts";
import { downloadSubmissionPdfFromResponse } from "@/utils/formFlow";
import { SERVICES } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Stepper } from "@/components/ui/Stepper";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { useFormDraft } from "@/hooks/useFormDraft";

const STEPS = [
  { key: "who", label: "Qui êtes-vous" },
  { key: "what", label: "Le modèle" },
  { key: "details", label: "Détails & mesures" },
  { key: "send", label: "Envoi" },
];

/**
 * Formulaire de pré-commande — version multi-step :
 *   1. Identité (nom, téléphone, email)
 *   2. Type de tenue + couleur / taille / date
 *   3. Description projet + mesures + budget
 *   4. Récap + envoi
 */
export function PrecommandeForm({ presetType }: { presetType?: string } = {}) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<PrecommandeSchema | null>(null);
  const startedRef = useRef(false);
  const draftApi = useFormDraft<PrecommandeSchema>("precommande");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
    reset,
    getValues,
  } = useForm<PrecommandeSchema>({
    resolver: zodResolver(precommandeSchema),
    mode: "onBlur",
    defaultValues: {
      nom: "",
      telephone: "",
      email: "",
      type_tenue: presetType || "",
      tenue_autre: "",
      couleur_preferee: "",
      taille: "",
      date_souhaitee: "",
      budget: "",
      description: "",
      mesures: "",
    },
  });

  // ----- Brouillon : propose la reprise au mount -----
  useEffect(() => {
    const d = draftApi.loadDraft();
    if (d) setDraft(d);
  }, []);

  // ----- Auto-save -----
  useEffect(() => {
    const sub = watch((values) => {
      draftApi.saveDraft(values as PrecommandeSchema);
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const type = watch("type_tenue");

  const onFocusFirst = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackFormStart("precommande");
    }
  };

  const next = async () => {
    const fieldsMap: Record<number, (keyof PrecommandeSchema)[]> = {
      0: ["nom", "telephone"],
      1: ["type_tenue"],
      2: [],
    };
    const fields = fieldsMap[step] || [];
    if (fields.length) {
      const ok = await trigger(fields as any);
      if (!ok) return;
    }
    trackFormStep("precommande", STEPS[step].key, "next");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    trackFormStep("precommande", STEPS[step].key, "back");
    setStep((s) => Math.max(0, s - 1));
  };

  const onSubmit = async (data: PrecommandeSchema) => {
    const ref = generateTicketId();
    const payload = { ...data, ref };
    saveTicket({
      ref,
      source: "precommande",
      title: `Pré-commande de ${data.nom}`,
      status: "pending",
      data: payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    try {
      const response = await trackFormSubmit("precommande", payload, ref);
      if (response) {
        downloadSubmissionPdfFromResponse(response, ref);
        updateTicket(ref, { status: "synced", syncedAt: new Date().toISOString(), lastError: undefined });
        onSuccessSmartToast({ kind: "precommande", ref, payload, formData: data, synced: true });
      } else {
        updateTicket(ref, { status: "pending", lastError: "Synchronisation à reprendre" });
        onSuccessSmartToast({ kind: "precommande", ref, payload, formData: data, synced: false });
      }
      draftApi.clearDraft();
      navigate(`/merci?type=precommande&ref=${ref}&nom=${encodeURIComponent(data.nom)}`);
    } catch (e) {
      trackFormError("precommande", String(e), "submit");
      updateTicket(ref, { status: "error", lastError: String(e) });
      draftApi.clearDraft();
      onErrorSmartToast({ kind: "precommande", ref, error: e });
      navigate(`/merci?type=precommande&ref=${ref}&nom=${encodeURIComponent(data.nom)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} onFocus={onFocusFirst} className="space-y-6">
      <Stepper steps={STEPS} current={step} />

      <DraftBanner
        draft={draft}
        onApply={(d) => {
          reset(d);
          setDraft(null);
          toast.info("Brouillon restauré", { description: "Vous pouvez continuer votre commande." });
        }}
        onDiscard={() => {
          draftApi.clearDraft();
          setDraft(null);
        }}
      />

      {/* ===== Étape 1 : identité ===== */}
      {step === 0 && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl bg-[var(--color-citron)]/15 border border-[var(--color-citron)]/40 p-3.5 text-sm text-[var(--color-ink-soft)] flex items-start gap-3">
            <Sparkles className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-orange)" }} />
            <p>
              Indiquez-nous vos coordonnées — on revient vers vous sous 48h ouvrées
              pour confirmer et planifier l'essayage.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nom complet" required error={errors.nom?.message}>
              <Input {...register("nom")} invalid={!!errors.nom} placeholder="Votre nom" autoComplete="name" />
            </Field>
            <Field label="Téléphone" required error={errors.telephone?.message}>
              <Input
                type="tel"
                {...register("telephone")}
                invalid={!!errors.telephone}
                placeholder="+229 01 ..."
                autoComplete="tel"
                inputMode="tel"
              />
            </Field>
          </div>

          <Field label="Email" hint="Optionnel — pour recevoir votre ticket PDF" error={errors.email?.message}>
            <Input
              type="email"
              {...register("email")}
              invalid={!!errors.email}
              placeholder="vous@exemple.com"
              autoComplete="email"
              inputMode="email"
            />
          </Field>

          <div className="flex justify-end pt-2">
            <Button type="button" onClick={next} icon={<ArrowRight className="w-4 h-4" />} size="lg">
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* ===== Étape 2 : modèle ===== */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <Field label="Type de tenue" required error={errors.type_tenue?.message}>
            <Select {...register("type_tenue")} invalid={!!errors.type_tenue}>
              <option value="">— Choisir —</option>
              {SERVICES.map((s) => (
                <option key={s.title} value={s.title}>
                  {s.emoji} {s.title}
                </option>
              ))}
              <option value="autre">Autre (précisez ci-dessous)</option>
            </Select>
          </Field>

          {/* Cards services cliquables */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SERVICES.slice(0, 6).map((s) => {
              const selected = watch("type_tenue") === s.title;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setValue("type_tenue", s.title, { shouldValidate: true })}
                  className={`text-left rounded-2xl border-2 p-3 transition-all ${
                    selected
                      ? "border-[var(--color-orange)] bg-[var(--color-orange)]/5 shadow-md"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-2xl">{s.emoji}</span>
                    {selected && <CheckCircle2 className="w-4 h-4" style={{ color: "var(--color-orange)" }} />}
                  </div>
                  <p className="font-semibold text-xs leading-tight">{s.title}</p>
                </button>
              );
            })}
          </div>

          {type === "autre" && (
            <Field label="Précisez votre besoin" error={errors.tenue_autre?.message}>
              <Input
                {...register("tenue_autre")}
                placeholder="Décrivez le type de tenue souhaité"
                autoFocus
              />
            </Field>
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Couleur préférée" hint="Optionnel" error={errors.couleur_preferee?.message}>
              <Input {...register("couleur_preferee")} placeholder="Bordeaux, beige..." />
            </Field>
            <Field label="Taille" hint="Optionnel" error={errors.taille?.message}>
              <Input {...register("taille")} placeholder="S / M / 38..." />
            </Field>
            <Field label="Date souhaitée" hint="Optionnel" error={errors.date_souhaitee?.message}>
              <Input type="date" {...register("date_souhaitee")} />
            </Field>
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" onClick={back} variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Retour
            </Button>
            <Button type="button" onClick={next} icon={<ArrowRight className="w-4 h-4" />} size="lg">
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* ===== Étape 3 : description + mesures ===== */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <Field
            label="Description du projet"
            hint="Style, occasion, particularités... Plus c'est précis, mieux c'est."
            error={errors.description?.message}
          >
            <Textarea
              rows={5}
              {...register("description")}
              placeholder="Décrivez votre tenue idéale..."
            />
          </Field>

          <Field
            label="Mesures"
            hint="Optionnel — vous pourrez les compléter lors de l'essayage"
            error={errors.mesures?.message}
          >
            <Textarea
              rows={4}
              {...register("mesures")}
              placeholder="Tour de poitrine, taille, hanches, longueur... (en cm)"
            />
          </Field>

          <Field label="Budget estimé" hint="Optionnel — pour calibrer nos propositions" error={errors.budget?.message}>
            <Input {...register("budget")} placeholder="Ex : 25 000 FCFA" />
          </Field>

          <div className="flex justify-between pt-2">
            <Button type="button" onClick={back} variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Retour
            </Button>
            <Button type="button" onClick={next} icon={<ArrowRight className="w-4 h-4" />} size="lg">
              Voir le récap
            </Button>
          </div>
        </div>
      )}

      {/* ===== Étape 4 : récap + envoi ===== */}
      {step === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-cream)] p-5 space-y-3 text-sm">
            <p className="font-bold text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Récapitulatif de votre commande
            </p>
            <Row label="Identité" value={`${getValues("nom")} · ${getValues("telephone")}`} />
            <Row label="Email" value={getValues("email") || "—"} />
            <Row label="Type" value={type === "autre" ? `Autre (${getValues("tenue_autre") || "—"})` : type || "—"} />
            <Row label="Couleur" value={getValues("couleur_preferee") || "—"} />
            <Row label="Taille" value={getValues("taille") || "—"} />
            <Row label="Date souhaitée" value={getValues("date_souhaitee") || "—"} />
            <Row label="Budget" value={getValues("budget") || "—"} />
            {getValues("description") && <Row label="Description" value={getValues("description") || ""} />}
          </div>

          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
            Réponse sous 48h ouvrées. Paiement à convenir après confirmation du modèle et de la taille.
          </p>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-2">
            <Button type="button" onClick={back} variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Modifier
            </Button>
            <Button type="submit" loading={isSubmitting} size="lg" icon={<CheckCircle2 className="w-4 h-4" />} shimmer>
              Envoyer ma pré-commande
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3">
      <span className="font-semibold text-[var(--color-muted)] sm:w-40 shrink-0">{label}</span>
      <span className="text-[var(--color-ink)] flex-1 break-words">{value || "—"}</span>
    </div>
  );
}