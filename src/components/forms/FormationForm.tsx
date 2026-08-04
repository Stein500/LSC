import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap } from "lucide-react";
import { formationSchema, type FormationSchema } from "@/utils/validation";
import { trackFormStart, trackFormStep, trackFormSubmit, trackFormError } from "@/utils/api";
import { generateTicketId } from "@/utils/format";
import { saveTicket, updateTicket } from "@/utils/tickets";
import { onSuccessSmartToast, onErrorSmartToast } from "@/hooks/useSmartToasts";
import { downloadSubmissionPdfFromResponse } from "@/utils/formFlow";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select, CheckboxGroup } from "@/components/ui/Field";
import { Stepper } from "@/components/ui/Stepper";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { useFormDraft } from "@/hooks/useFormDraft";
import { FORMULES } from "@/data/content";

const DISPO_OPTS = [
  { value: "matin", label: "Matin" },
  { value: "apresmidi", label: "Après-midi" },
  { value: "soir", label: "Soir" },
  { value: "weekend", label: "Week-end" },
];

const FORMATION_LABELS: Record<string, string> = {
  courte: "Formation Courte (3-6 mois)",
  specialisee: "Formation Spécialisée (12+ mois)",
  indecis: "Je ne sais pas encore",
};

const STEPS = [
  { key: "who", label: "Qui êtes-vous" },
  { key: "what", label: "Votre formation" },
  { key: "why", label: "Motivation" },
  { key: "send", label: "Envoi" },
];

/**
 * Formulaire de demande de formation — version multi-step :
 *   1. Identité (nom, prénom, âge, contact)
 *   2. Niveau + formule choisie + disponibilités
 *   3. Motivation + paiement
 *   4. Récap + envoi
 * Avec :
 *   - brouillon localStorage 24h
 *   - validation live au blur
 *   - stepper visible
 *   - résumés par étape
 *   - accessibilité
 */
export function FormationForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<FormationSchema | null>(null);
  const startedRef = useRef(false);
  const draftApi = useFormDraft<FormationSchema>("formation");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger,
    reset,
    getValues,
  } = useForm<FormationSchema>({
    resolver: zodResolver(formationSchema),
    mode: "onBlur",
    defaultValues: {
      nom: "",
      prenom: "",
      age: undefined as any,
      telephone: "",
      email: "",
      niveau_actuel: undefined,
      formation_choisie: undefined,
      disponibilite: [],
      motivation: "",
      motif_paiement: "",
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
      draftApi.saveDraft(values as FormationSchema);
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const dispo = watch("disponibilite") || [];

  const onFocusFirst = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackFormStart("formation");
    }
  };

  const next = async () => {
    const fieldsMap: Record<number, (keyof FormationSchema)[]> = {
      0: ["nom", "prenom", "age", "telephone"],
      1: ["niveau_actuel", "formation_choisie", "disponibilite"],
      2: [],
    };
    const fields = fieldsMap[step] || [];
    if (fields.length) {
      const ok = await trigger(fields as any);
      if (!ok) return;
    }
    trackFormStep("formation", STEPS[step].key, "next");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    trackFormStep("formation", STEPS[step].key, "back");
    setStep((s) => Math.max(0, s - 1));
  };

  const onSubmit = async (data: FormationSchema) => {
    const ref = generateTicketId();
    const payload = { ...data, ref };
    saveTicket({
      ref,
      source: "formation",
      title: `Demande de ${data.prenom} ${data.nom}`,
      status: "pending",
      data: payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    try {
      const response = await trackFormSubmit("formation", payload, ref);
      if (response) {
        downloadSubmissionPdfFromResponse(response, ref);
        updateTicket(ref, { status: "synced", syncedAt: new Date().toISOString(), lastError: undefined });
        onSuccessSmartToast({ kind: "formation", ref, payload, formData: data, synced: true });
      } else {
        updateTicket(ref, { status: "pending", lastError: "Synchronisation à reprendre" });
        onSuccessSmartToast({ kind: "formation", ref, payload, formData: data, synced: false });
      }
      draftApi.clearDraft();
      navigate(`/merci?type=formation&ref=${ref}&nom=${encodeURIComponent(data.prenom)}`);
    } catch (e) {
      trackFormError("formation", String(e), "submit");
      updateTicket(ref, { status: "error", lastError: String(e) });
      draftApi.clearDraft();
      onErrorSmartToast({ kind: "formation", ref, error: e });
      navigate(`/merci?type=formation&ref=${ref}&nom=${encodeURIComponent(data.prenom)}`);
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
          toast.info("Brouillon restauré", { description: "Vous pouvez continuer votre demande." });
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
            <GraduationCap className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "var(--color-orange)" }} />
            <p>
              Bienvenue ! Quelques infos pour vous connaître — on garde tout
              confidentiel et on revient vers vous sous 48h.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nom" required error={errors.nom?.message}>
              <Input {...register("nom")} invalid={!!errors.nom} placeholder="Votre nom" autoComplete="family-name" />
            </Field>
            <Field label="Prénom" required error={errors.prenom?.message}>
              <Input {...register("prenom")} invalid={!!errors.prenom} placeholder="Votre prénom" autoComplete="given-name" />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Âge" required error={errors.age?.message}>
              <Input
                type="number"
                min={14}
                max={80}
                {...register("age", { setValueAs: (v) => {
                  if (v === "" || v == null) return undefined;
                  const n = typeof v === "string" ? Number(v) : Number(v);
                  return Number.isNaN(n) ? undefined : n;
                } })}
                invalid={!!errors.age}
                placeholder="25"
                inputMode="numeric"
              />
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

      {/* ===== Étape 2 : formation ===== */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Niveau actuel" required error={errors.niveau_actuel?.message}>
              <Select {...register("niveau_actuel")} invalid={!!errors.niveau_actuel}>
                <option value="">— Choisir —</option>
                <option value="debutant">Débutant(e)</option>
                <option value="intermediaire">Intermédiaire</option>
              </Select>
            </Field>
            <Field label="Formation choisie" required error={errors.formation_choisie?.message}>
              <Select {...register("formation_choisie")} invalid={!!errors.formation_choisie}>
                <option value="">— Choisir —</option>
                <option value="courte">Formation Courte</option>
                <option value="specialisee">Formation Spécialisée</option>
                <option value="indecis">Je ne sais pas encore</option>
              </Select>
            </Field>
          </div>

          {/* Récap visuel des 2 formules */}
          <div className="grid sm:grid-cols-2 gap-3">
            {FORMULES.map((f) => {
              const id =
                f.id === "courte" ? "courte" : f.id === "specialisee" ? "specialisee" : null;
              if (!id) return null;
              const selected = watch("formation_choisie") === id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setValue("formation_choisie", id as any, { shouldValidate: true })}
                  className={`text-left rounded-2xl border-2 p-4 transition-all ${
                    selected
                      ? "border-[var(--color-orange)] bg-[var(--color-orange)]/5 shadow-md"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{f.emoji}</span>
                    {selected && <CheckCircle2 className="w-5 h-5" style={{ color: "var(--color-orange)" }} />}
                  </div>
                  <p className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                    {f.title}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{f.subtitle}</p>
                </button>
              );
            })}
          </div>

          <Field label="Disponibilités" required error={errors.disponibilite?.message}>
            <CheckboxGroup
              options={DISPO_OPTS}
              value={dispo}
              onChange={(v) => setValue("disponibilite", v as any, { shouldValidate: true })}
              describedBy="dispo-hint"
            />
          </Field>
          <span id="dispo-hint" className="sr-only">
            Sélectionnez au moins une disponibilité.
          </span>

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

      {/* ===== Étape 3 : motivation ===== */}
      {step === 2 && (
        <div className="space-y-5 animate-fade-in">
          <Field
            label="Motivation"
            hint="Quelques lignes — pourquoi souhaitez-vous apprendre la couture ?"
            error={errors.motivation?.message}
          >
            <Textarea
              rows={5}
              {...register("motivation")}
              invalid={!!errors.motivation}
              placeholder="Votre projet, vos envies, votre objectif..."
            />
          </Field>

          <Field
            label="Mode de paiement souhaité"
            hint="Optionnel — nous vous proposerons un échéancier adapté"
            error={errors.motif_paiement?.message}
          >
            <Input {...register("motif_paiement")} placeholder="Comptant, 2x, 3x..." />
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
              Récapitulatif de votre demande
            </p>
            <Row label="Identité" value={`${getValues("prenom")} ${getValues("nom")} (${getValues("age")} ans)`} />
            <Row label="Contact" value={`${getValues("telephone")}${getValues("email") ? ` · ${getValues("email")}` : ""}`} />
            <Row
              label="Niveau"
              value={getValues("niveau_actuel") === "debutant" ? "Débutant(e)" : "Intermédiaire"}
            />
            <Row label="Formation" value={FORMATION_LABELS[getValues("formation_choisie") as string] || "—"} />
            <Row
              label="Disponibilités"
              value={(getValues("disponibilite") || [])
                .map((d) => DISPO_OPTS.find((o) => o.value === d)?.label || d)
                .join(", ")}
            />
            {getValues("motivation") && <Row label="Motivation" value={getValues("motivation") || ""} />}
            {getValues("motif_paiement") && <Row label="Paiement" value={getValues("motif_paiement") || ""} />}
          </div>

          <p className="text-xs text-[var(--color-muted)] leading-relaxed">
            En envoyant ce formulaire, vous acceptez d'être recontacté(e) par notre équipe.
            Vous recevrez un ticket PDF en confirmation.
          </p>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-2 pt-2">
            <Button type="button" onClick={back} variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Modifier
            </Button>
            <Button type="submit" loading={isSubmitting} size="lg" icon={<CheckCircle2 className="w-4 h-4" />} shimmer>
              Envoyer ma demande
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