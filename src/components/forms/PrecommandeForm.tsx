import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { precommandeSchema, type PrecommandeSchema } from "@/utils/validation";
import { trackFormStart, trackFormSubmit, trackFormError } from "@/utils/api";
import { generateTicketId } from "@/utils/format";
import { saveTicket, updateTicket, applySubmissionResult, markTicketKept } from "@/utils/tickets";
import { onSuccessSmartToast, onErrorSmartToast } from "@/hooks/useSmartToasts";
import { downloadSubmissionPdfFromResponse } from "@/utils/formFlow";
import { SERVICES } from "@/data/content";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { useFormDraft } from "@/hooks/useFormDraft";
import { CouponSection, SubmitCoupon, scrollToFirstInvalid } from "./CouponSection";
import { buildWhatsAppUrl } from "@/utils/whatsapp";

/**
 * PrecommandeForm — « L'Écrin de Commande » 🎟️ (29/09/2026)
 * ------------------------------------------------------------
 * Un formulaire UNIQUE, simple comme un bonjour, waooh comme les héros :
 *
 *   ①  Dites-nous qui vous êtes  — 2 champs obligatoires (nom + tél)
 *   ②  La tenue de vos rêves     — tout est optionnel
 *   ③  Dites-nous tout           — quelques mots suffisent
 *
 * 📸 LA PHOTO NE VOYAGE PLUS PAR LE FORMULAIRE (décision de la cheffe) :
 *    joindre une image faisait tout casser et compliquait la vie des
 *    clientes. On les invite plutôt à l'envoyer sur WhatsApp après
 *    l'envoi — le bouton est prêt ici et sur la page Merci.
 */

export function PrecommandeForm({
  presetType,
  presetModele,
}: { presetType?: string; presetModele?: string; presetPhoto?: string } = {}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PrecommandeSchema | null>(null);
  const startedRef = useRef(false);
  const draftApi = useFormDraft<PrecommandeSchema>("precommande");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
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
      description: "",
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

  // ----- Type pré-rempli depuis une carte prestation -----
  useEffect(() => {
    if (!presetType) return;
    setValue("type_tenue", presetType, { shouldValidate: true });
  }, [presetType, setValue]);

  const onFocusFirst = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackFormStart("precommande");
    }
  };

  const onSubmit = async (data: PrecommandeSchema) => {
    const ref = generateTicketId();
    // 👗 Le modèle de la galerie voyage en clair (son nom) — la photo,
    // elle, prendra la route WhatsApp, droite et sans encombre.
    const payload = {
      ...data,
      ref,
      modele: presetModele ?? "",
    };
    saveTicket({
      ref,
      source: "precommande",
      title: `Commande de ${data.nom}`,
      status: "pending",
      data: payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    try {
      const response = await trackFormSubmit("precommande", payload, ref);
      // 🧭 Logique de statut UNIQUE : « Bien reçu » dès que l'atelier
      // tient la demande (mail OU tableau) — plus de faux rouge.
      const outcome = response ? applySubmissionResult(ref, response) : markTicketKept(ref);
      if (response) downloadSubmissionPdfFromResponse(response, ref);
      onSuccessSmartToast({ kind: "precommande", ref, payload, formData: data, synced: outcome === "synced" });
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

  /** Champ oublié ? On prévient doucement, puis on glisse jusqu'à lui. */
  const onInvalid = () => {
    toast.error("Il manque un petit fil 🧵", {
      description: "Votre nom et votre téléphone suffisent pour partir — regardez les champs entourés de rouge.",
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
          toast.info("Brouillon restauré", { description: "Vous pouvez continuer votre commande." });
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
        sub="Deux champs suffisent pour partir : votre nom et un numéro où vous rappeler sous 48 h ouvrées."
      >
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

        <Field label="Email" hint="Optionnel — pour recevoir votre ticket PDF par la poste des colombes" error={errors.email?.message}>
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

      {/* ② ════════ LA TENUE ════════ */}
      <CouponSection
        numero="02"
        icon="✂️"
        title="La tenue de vos rêves"
        sub="Tout est optionnel dans ce coupon — touchez, ou laissez : on choisira ensemble à l'atelier."
      >
        {/* 🧵 Venant d'un modèle de la galerie ? Il est déjà joint —
            rien à refaire, rien à redire. */}
        {presetModele && (
          <p
            className="text-sm rounded-2xl border px-3.5 py-2.5 flex items-start gap-2"
            style={{
              background: "var(--color-feuille-doux,#EFF7E3)",
              borderColor: "color-mix(in srgb, var(--color-feuille,#7CBA45) 40%, transparent)",
              color: "var(--color-feuille-f,#558B2F)",
            }}
          >
            <span aria-hidden="true">🧵</span>
            <span>
              Modèle choisi dans la galerie : <strong>{presetModele}</strong> — il rejoint
              votre commande tel quel, rien à refaire.
            </span>
          </p>
        )}

        {/* 👗 Type de tenue — grandes tuiles, OPTIONNELLES */}
        <Field
          label="Quel type de tenue ?"
          hint="Optionnel — touchez une tuile si vous le savez déjà."
          error={errors.type_tenue?.message}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="group" aria-label="Type de tenue">
            {SERVICES.map((s) => {
              const selected = type === s.title;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => setValue("type_tenue", selected ? "" : s.title, { shouldValidate: true })}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2.5 py-4 text-center transition-all min-h-[92px] ${
                    selected
                      ? "border-[var(--color-orange)] bg-[var(--color-orange)]/5 shadow-md"
                      : "border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]"
                  }`}
                >
                  <span className="text-3xl leading-none">{s.emoji}</span>
                  <span className="font-semibold text-xs leading-tight">{s.title}</span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setValue("type_tenue", type === "autre" ? "" : "autre", { shouldValidate: true })}
              aria-pressed={type === "autre"}
              className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 border-dashed px-2.5 py-4 text-center transition-all min-h-[92px] ${
                type === "autre"
                  ? "border-[var(--color-orange)] bg-[var(--color-orange)]/5 shadow-md"
                  : "border-[var(--color-line)] bg-white hover:border-[var(--color-citron)]"
              }`}
            >
              <span className="text-3xl leading-none">✨</span>
              <span className="font-semibold text-xs leading-tight">Autre — je décris</span>
            </button>
          </div>
        </Field>

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
      </CouponSection>

      {/* ③ ════════ DITES-NOUS TOUT ════════ */}
      <CouponSection
        numero="03"
        icon="💬"
        title="Dites-nous tout"
        sub="Quelques mots suffisent à nous lancer — tout est optionnel, tout se complètera à l'essayage."
      >
        <Field
          label="Votre projet"
          hint="Style, occasion, couleurs, mesures, budget, délai… Plus c'est précis, mieux c'est."
          error={errors.description?.message}
        >
          <Textarea
            rows={5}
            {...register("description")}
            placeholder="Décrivez votre tenue idéale..."
          />
        </Field>

        {/* 📸 La photo prend la route WhatsApp — celle qu'elles connaissent déjà 🤍 */}
        <div
          className="rounded-3xl border-2 border-dashed p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5"
          style={{
            borderColor: "var(--color-feuille,#7CBA45)",
            background: "color-mix(in srgb, var(--color-feuille-doux,#EFF7E3) 45%, transparent)",
          }}
        >
          <span className="text-3xl shrink-0" aria-hidden="true">📸</span>
          <div className="flex-1 text-sm leading-relaxed" style={{ color: "var(--color-feuille-f,#558B2F)" }}>
            <p className="font-bold">Une photo du modèle ? Envoyez-la sur WhatsApp !</p>
            <p className="mt-0.5 text-xs opacity-90">
              Après l'envoi de votre commande, un bouton WhatsApp tout prêt vous attend
              sur la page Merci — la photo arrivera droit dans nos mains, sans faire
              capoter votre commande.
            </p>
          </div>
          <a
            href={buildWhatsAppUrl(undefined, "Bonjour, je viens de passer commande en ligne — voici la photo de mon modèle 📸")}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #558B2F 0%, #7CBA45 100%)" }}
          >
            💬 WhatsApp
          </a>
        </div>
      </CouponSection>

      {/* 🎟️ ════════ L'ENVOI ════════ */}
      <SubmitCoupon
        loading={isSubmitting}
        idleLabel="Envoyer ma commande"
        busyLabel="Couture en cours…"
        note={
          <>
            Réponse sous <strong className="text-[var(--color-ink)]">48 h ouvrées</strong>.
            Votre ticket PDF arrive aussitôt — gardez-le, c'est votre fil d'Ariane avec l'atelier. 🎫
          </>
        }
      />
    </form>
  );
}
