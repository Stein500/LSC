import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { formationSchema, type FormationSchema } from "@/utils/validation";
import { trackFormStart, trackFormSubmit, trackFormError } from "@/utils/api";
import { generateTicketId } from "@/utils/format";
import { saveTicket, updateTicket, applySubmissionResult, markTicketKept } from "@/utils/tickets";
import { onSuccessSmartToast, onErrorSmartToast } from "@/hooks/useSmartToasts";
import { downloadSubmissionPdfFromResponse } from "@/utils/formFlow";
import { Field, Input, Textarea, CheckboxGroup } from "@/components/ui/Field";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { useFormDraft } from "@/hooks/useFormDraft";
import { CouponSection, SubmitCoupon, scrollToFirstInvalid } from "./CouponSection";
import { FORMULES } from "@/data/content";

const DISPO_OPTS = [
  { value: "matin", label: "☀️ Matin" },
  { value: "apresmidi", label: "🌤️ Après-midi" },
  { value: "soir", label: "🌙 Soir" },
  { value: "weekend", label: "🎉 Week-end" },
];

/**
 * FormationForm — « L'Écrin de l'Apprentissage » 🎟️ (29/09/2026)
 * ------------------------------------------------------------
 * Même étoffe que les autres formulaires de la maison : UNE page,
 * trois coupons perforés fil d'or — ① Présentez-vous ② Votre
 * apprentissage ③ Et votre cœur ? — puis le grand coupon d'envoi.
 * Confidentialité : tout reste entre nos mains, réponse sous 48 h.
 */
export function FormationForm({
  presetFormule,
}: { presetFormule?: "courte" | "specialisee" } = {}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<FormationSchema | null>(null);
  const startedRef = useRef(false);
  const draftApi = useFormDraft<FormationSchema>("formation");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
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

  // ----- Formule choisie depuis la carte visuelle de la page -----
  // On PRÉ-COCHE la formule, un point — elle attend, cochée, plus bas
  // dans le formulaire (plus d'étapes : tout est visible d'un coup).
  useEffect(() => {
    if (!presetFormule) return;
    setValue("formation_choisie", presetFormule, { shouldValidate: true });
    toast.info(
      presetFormule === "courte"
        ? "Formation Courte présélectionnée ✂️"
        : "Formation Spécialisée présélectionnée ✂️",
      { description: "Elle est déjà cochée pour vous, un peu plus bas dans le formulaire." },
    );
  }, [presetFormule, setValue]);

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
      const outcome = response ? applySubmissionResult(ref, response) : markTicketKept(ref);
      if (response) downloadSubmissionPdfFromResponse(response, ref);
      onSuccessSmartToast({ kind: "formation", ref, payload, formData: data, synced: outcome === "synced" });
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

  const onInvalid = () => {
    toast.error("Il manque un petit fil 🧵", {
      description: "Regardez les champs entourés de rouge — la page vous y mène en glissant.",
    });
    scrollToFirstInvalid();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} onFocus={onFocusFirst} className="space-y-6">
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

      {/* ① ════════ PRÉSENTEZ-VOUS ════════ */}
      <CouponSection
        numero="01"
        icon="🎓"
        title="Présentez-vous"
        sub="Bienvenue ! Quelques infos pour vous connaître — tout reste confidentiel, réponse sous 48 h ouvrées."
      >
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
      </CouponSection>

      {/* ② ════════ VOTRE APPRENTISSAGE ════════ */}
      <CouponSection
        numero="02"
        icon="✂️"
        title="Votre apprentissage"
        sub="Touchez pour choisir — rien n'est figé, on en reparle ensemble à l'atelier."
      >
        {/* ✂️ Niveau — gros boutons à toucher */}
        <Field label="Votre niveau ?" required error={errors.niveau_actuel?.message}>
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="Votre niveau">
            {[
              { v: "debutant" as const, emoji: "🌱", titre: "Je débute", info: "Jamais cousu (ou presque)" },
              { v: "intermediaire" as const, emoji: "🧵", titre: "Je sais déjà un peu", info: "J'ai déjà cousu" },
            ].map((n) => {
              const selected = watch("niveau_actuel") === n.v;
              return (
                <button
                  key={n.v}
                  type="button"
                  onClick={() => setValue("niveau_actuel", n.v, { shouldValidate: true })}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-3 py-4 text-center transition-all min-h-[72px] ${
                    selected
                      ? "border-[var(--color-orange)] bg-[var(--color-orange)]/5 shadow-md"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]"
                  }`}
                >
                  <span className="text-3xl leading-none">{n.emoji}</span>
                  <span className="font-bold text-sm leading-tight">{n.titre}</span>
                  <span className="text-[11px] text-[var(--color-muted)] leading-tight">{n.info}</span>
                </button>
              );
            })}
          </div>
        </Field>

        {/* 🪡 Formule — on touche la photo mentale */}
        <Field label="Quelle formation ?" required error={errors.formation_choisie?.message}>
          <div className="grid sm:grid-cols-2 gap-3">
            {FORMULES.map((f) => {
              const id = f.id === "courte" ? "courte" : f.id === "specialisee" ? "specialisee" : null;
              if (!id) return null;
              const selected = watch("formation_choisie") === id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setValue("formation_choisie", id as any, { shouldValidate: true })}
                  aria-pressed={selected}
                  className={`text-left rounded-2xl border-2 p-4 transition-all min-h-[72px] ${
                    selected
                      ? "border-[var(--color-orange)] bg-[var(--color-orange)]/5 shadow-md"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-3xl">{f.emoji}</span>
                    {selected && <CheckCircle2 className="w-5 h-5" style={{ color: "var(--color-orange)" }} />}
                  </div>
                  <p className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                    {f.title}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">{f.subtitle}</p>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setValue("formation_choisie", "indecis" as any, { shouldValidate: true })}
              aria-pressed={watch("formation_choisie") === "indecis"}
              className={`sm:col-span-2 rounded-2xl border-2 px-4 py-3.5 text-sm font-semibold transition-all min-h-[56px] ${
                watch("formation_choisie") === "indecis"
                  ? "border-[var(--color-orange)] bg-[var(--color-orange)]/5 shadow-md"
                  : "border-dashed border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]"
              }`}
            >
              🤔 Je ne sais pas encore — conseillez-moi à la visite
            </button>
          </div>
        </Field>

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
      </CouponSection>

      {/* ③ ════════ ET VOTRE CŒUR ? ════════ */}
      <CouponSection
        numero="03"
        icon="💛"
        title="Et votre cœur ?"
        sub="Tout est optionnel dans ce coupon — mais quelques mots nous aident à bien vous accueillir."
      >
        <Field
          label="Motivation"
          hint="Optionnel — quelques lignes : pourquoi souhaitez-vous apprendre la couture ?"
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
      </CouponSection>

      {/* 🎟️ ════════ L'ENVOI ════════ */}
      <SubmitCoupon
        loading={isSubmitting}
        idleLabel="Envoyer ma demande"
        busyLabel="Couture en cours…"
        note={
          <>
            En envoyant ce formulaire, vous acceptez d'être recontacté(e) par notre équipe
            sous <strong className="text-[var(--color-ink)]">48 h ouvrées</strong>. Ticket PDF à l'arrivée. 🎫
          </>
        }
      />
    </form>
  );
}
