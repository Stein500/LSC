import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { contactSchema, type ContactSchema } from "@/utils/validation";
import { trackFormStart, trackFormSubmit, trackFormError } from "@/utils/api";
import { generateTicketId } from "@/utils/format";
import { saveTicket, updateTicket, applySubmissionResult, markTicketKept } from "@/utils/tickets";
import { onSuccessSmartToast, onErrorSmartToast } from "@/hooks/useSmartToasts";
import { downloadSubmissionPdfFromResponse } from "@/utils/formFlow";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { useFormDraft } from "@/hooks/useFormDraft";
import { CouponSection, SubmitCoupon, scrollToFirstInvalid } from "./CouponSection";

const SUJETS = [
  { value: "question", emoji: "❓", label: "Question générale" },
  { value: "devis", emoji: "💰", label: "Demande de devis" },
  { value: "reclamation", emoji: "🧷", label: "Réclamation" },
  { value: "autre", emoji: "✨", label: "Autre" },
] as const;

/**
 * ContactForm — « L'Écrin du Message » 🎟️ (29/09/2026)
 * ------------------------------------------------------------
 * Même étoffe que le formulaire de commande : UNE page, deux coupons
 * perforés fil d'or, le sujet en tuiles à toucher, et le grand coupon
 * d'envoi. La réponse arrive sous 48 h ouvrées.
 */
export function ContactForm() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<ContactSchema | null>(null);
  const startedRef = useRef(false);
  const draftApi = useFormDraft<ContactSchema>("contact");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
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

  // ----- Auto-save -----
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
      const outcome = response ? applySubmissionResult(ref, response) : markTicketKept(ref);
      if (response) downloadSubmissionPdfFromResponse(response, ref);
      onSuccessSmartToast({ kind: "contact", ref, payload, formData: data, synced: outcome === "synced" });
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

  const onInvalid = () => {
    toast.error("Il manque un petit fil 🧵", {
      description: "Regardez les champs entourés de rouge — la page vous y mène en glissant.",
    });
    scrollToFirstInvalid();
  };

  const sujet = watch("sujet");
  const message = watch("message") || "";

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} onFocus={onFocusFirst} className="space-y-6">
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

      {/* ① ════════ VOUS ════════ */}
      <CouponSection
        numero="01"
        icon="🧵"
        title="Dites-nous qui vous êtes"
        sub="Pour que la colombe vous réponde sous 48 h ouvrées : un nom et une adresse suffisent."
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom complet" required error={errors.nom?.message}>
            <Input {...register("nom")} invalid={!!errors.nom} placeholder="Votre nom" autoComplete="name" />
          </Field>
          <Field label="Téléphone" hint="Optionnel — si vous préférez qu'on vous rappelle" error={errors.telephone?.message}>
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

        <Field label="Email" required error={errors.email?.message} hint="Pour recevoir la réponse et votre ticket PDF">
          <Input
            type="email"
            {...register("email")}
            invalid={!!errors.email}
            placeholder="vous@exemple.com"
            autoComplete="email"
            inputMode="email"
          />
        </Field>

        {/* 🏷️ Le sujet — petites tuiles à toucher, plus de menu déroulant */}
        <Field label="Votre sujet" required error={errors.sujet?.message}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Votre sujet">
            {SUJETS.map((s) => {
              const selected = sujet === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setValue("sujet", s.value, { shouldValidate: true })}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2.5 py-3.5 text-center transition-all min-h-[76px] ${
                    selected
                      ? "border-[var(--color-orange)] bg-[var(--color-orange)]/5 shadow-md"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]"
                  }`}
                >
                  <span className="text-2xl leading-none">{s.emoji}</span>
                  <span className="font-semibold text-[11px] leading-tight">{s.label}</span>
                </button>
              );
            })}
          </div>
        </Field>
      </CouponSection>

      {/* ② ════════ VOTRE MESSAGE ════════ */}
      <CouponSection
        numero="02"
        icon="💌"
        title="Votre message"
        sub="Racontez-nous simplement — c'est lu avec attention, promis."
      >
        <Field
          label="Votre message"
          required
          hint={`${message.length} / 2000 caractères — soyez précis(e), on vous répond sous 48 h`}
          error={errors.message?.message}
        >
          <Textarea
            rows={6}
            {...register("message")}
            invalid={!!errors.message}
            placeholder="Décrivez votre besoin, votre projet ou votre question..."
          />
        </Field>
      </CouponSection>

      {/* 🎟️ ════════ L'ENVOI ════════ */}
      <SubmitCoupon
        loading={isSubmitting}
        idleLabel="Envoyer le message"
        busyLabel="La colombe s'envole…"
        note={
          <>
            Réponse sous <strong className="text-[var(--color-ink)]">48 h ouvrées</strong>.
            Votre ticket PDF arrive aussitôt — gardez-le précieusement. 🎫
          </>
        }
      />
    </form>
  );
}
