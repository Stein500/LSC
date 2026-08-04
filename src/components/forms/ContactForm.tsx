import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Phone } from "lucide-react";
import { contactSchema, type ContactSchema } from "@/utils/validation";
import { trackFormStart, trackFormStep, trackFormSubmit, trackFormError } from "@/utils/api";
import { generateTicketId } from "@/utils/format";
import { saveTicket, updateTicket } from "@/utils/tickets";
import { onSuccessSmartToast, onErrorSmartToast } from "@/hooks/useSmartToasts";
import { downloadSubmissionPdfFromResponse } from "@/utils/formFlow";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Stepper } from "@/components/ui/Stepper";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { useFormDraft } from "@/hooks/useFormDraft";
import { CONTACT } from "@/data/content";
import { buildWhatsAppUrl } from "@/utils/whatsapp";

const STEPS = [
  { key: "who", label: "Vos coordonnées" },
  { key: "msg", label: "Votre message" },
  { key: "send", label: "Envoi" },
];

/**
 * Formulaire de contact — version améliorée :
 *   - Multi-step (2 étapes) + écran de confirmation
 *   - Brouillon auto-sauvegardé en localStorage (24h)
 *   - Validation live (zod) au blur
 *   - Compteur de caractères sur le message
 *   - Raccourcis canaux directs (WhatsApp / appel)
 *   - Bouton retour, indicateurs d'étape, accessibilité
 */
export function ContactForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ContactSchema | null>(null);
  const startedRef = useRef(false);
  const draftApi = useFormDraft<ContactSchema>("contact");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    watch,
    setValue,
    reset,
    getValues,
  } = useForm<ContactSchema>({
    resolver: zodResolver(contactSchema),
    mode: "onBlur",
    defaultValues: {
      nom: "",
      email: "",
      telephone: "",
      sujet: undefined,
      message: "",
    },
  });

  // ----- Brouillon : propose la reprise au mount -----
  useEffect(() => {
    const d = draftApi.loadDraft();
    if (d) setDraft(d);
  }, []);

  // ----- Auto-save (debounced) -----
  useEffect(() => {
    const sub = watch((values) => {
      draftApi.saveDraft(values as ContactSchema);
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const onFocusFirst = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackFormStart("contact");
    }
  };

  const next = async () => {
    const fields: (keyof ContactSchema)[] =
      step === 0 ? ["nom", "email", "sujet"] : ["message"];
    const ok = await trigger(fields as any);
    if (!ok) return;
    trackFormStep("contact", STEPS[step].key, "next");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    trackFormStep("contact", STEPS[step].key, "back");
    setStep((s) => Math.max(0, s - 1));
  };

  const onSubmit = async (data: ContactSchema) => {
    const ref = generateTicketId();
    const payload = { ...data, ref };
    saveTicket({
      ref,
      source: "contact",
      title: `Message de ${data.nom}`,
      status: "pending",
      data: payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    try {
      const response = await trackFormSubmit("contact", payload, ref);
      if (response) {
        downloadSubmissionPdfFromResponse(response, ref);
        updateTicket(ref, { status: "synced", syncedAt: new Date().toISOString(), lastError: undefined });
        onSuccessSmartToast({ kind: "contact", ref, payload, formData: data, synced: true });
      } else {
        updateTicket(ref, { status: "pending", lastError: "Synchronisation à reprendre" });
        onSuccessSmartToast({ kind: "contact", ref, payload, formData: data, synced: false });
      }
      draftApi.clearDraft();
      navigate(`/merci?type=contact&ref=${ref}&nom=${encodeURIComponent(data.nom)}`);
    } catch (e) {
      trackFormError("contact", String(e), "submit");
      updateTicket(ref, { status: "error", lastError: String(e) });
      draftApi.clearDraft();
      onErrorSmartToast({ kind: "contact", ref, error: e });
      navigate(`/merci?type=contact&ref=${ref}&nom=${encodeURIComponent(data.nom)}`);
    }
  };

  const message = watch("message") || "";
  const subjectLabel: Record<string, string> = {
    question: "Question générale",
    devis: "Demande de devis",
    reclamation: "Réclamation",
    autre: "Autre",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} onFocus={onFocusFirst} className="space-y-6">
      <Stepper steps={STEPS} current={step} />

      <DraftBanner
        draft={draft}
        onApply={(d) => {
          reset(d);
          setDraft(null);
          toast.info("Brouillon restauré", { description: "Vous pouvez continuer votre message." });
        }}
        onDiscard={() => {
          draftApi.clearDraft();
          setDraft(null);
        }}
      />

      {/* ===== Étape 1 : identité ===== */}
      {step === 0 && (
        <div className="space-y-5 animate-fade-in">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nom complet" required error={errors.nom?.message}>
              <Input
                {...register("nom")}
                invalid={!!errors.nom}
                placeholder="Votre nom"
                autoComplete="name"
                aria-required="true"
              />
            </Field>
            <Field label="Téléphone" hint="Optionnel" error={errors.telephone?.message}>
              <Input
                type="tel"
                {...register("telephone")}
                placeholder="+229 01 ..."
                autoComplete="tel"
                inputMode="tel"
              />
            </Field>
          </div>

          <Field label="Email" required error={errors.email?.message}>
            <Input
              type="email"
              {...register("email")}
              invalid={!!errors.email}
              placeholder="vous@exemple.com"
              autoComplete="email"
              inputMode="email"
              aria-required="true"
            />
          </Field>

          <Field label="Sujet" required error={errors.sujet?.message}>
            <Select {...register("sujet")} invalid={!!errors.sujet} aria-required="true">
              <option value="">— Choisir —</option>
              <option value="question">Question générale</option>
              <option value="devis">Demande de devis</option>
              <option value="reclamation">Réclamation</option>
              <option value="autre">Autre</option>
            </Select>
          </Field>

          <div className="flex justify-end pt-2">
            <Button type="button" onClick={next} icon={<ArrowRight className="w-4 h-4" />} size="lg">
              Continuer
            </Button>
          </div>
        </div>
      )}

      {/* ===== Étape 2 : message ===== */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <Field
            label="Votre message"
            required
            hint={`${message.length} / 2000 caractères — soyez précis(e), on vous répond sous 48h`}
            error={errors.message?.message}
          >
            <Textarea
              rows={6}
              {...register("message")}
              invalid={!!errors.message}
              placeholder="Décrivez votre besoin, votre projet ou votre question..."
              aria-required="true"
            />
          </Field>

          <div className="rounded-2xl bg-[var(--color-cream)] border border-[var(--color-line)] p-4 text-xs text-[var(--color-muted)] leading-relaxed">
            <p className="font-semibold text-[var(--color-ink)] mb-1">Résumé :</p>
            <p>
              <strong>{getValues("nom") || "—"}</strong> · {getValues("email") || "—"}
              {getValues("telephone") ? ` · ${getValues("telephone")}` : ""}
            </p>
            <p>Sujet : {subjectLabel[getValues("sujet") as string] || "—"}</p>
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" onClick={back} variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Retour
            </Button>
            <Button type="submit" loading={isSubmitting} size="lg" icon={<CheckCircle2 className="w-4 h-4" />}>
              Envoyer le message
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}