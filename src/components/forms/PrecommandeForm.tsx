import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { precommandeSchema, type PrecommandeSchema } from "@/utils/validation";
import { trackFormStart, trackFormSubmit, trackFormError } from "@/utils/api";
import { generateTicketId } from "@/utils/format";
import { saveTicket, updateTicket, applySubmissionResult, markTicketKept } from "@/utils/tickets";
import { onSuccessSmartToast, onErrorSmartToast } from "@/hooks/useSmartToasts";
import { downloadSubmissionPdfFromResponse } from "@/utils/formFlow";
import { urlToJpegDataUrl, fileToJpegDataUrl } from "@/utils/imageEmbed";
import { SERVICES } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { DraftBanner } from "@/components/ui/DraftBanner";
import { useFormDraft } from "@/hooks/useFormDraft";

/**
 * PrecommandeForm — « L'Écrin de Commande » 🎟️ (28/09/2026)
 * ------------------------------------------------------------
 * Demande de la cheffe : un formulaire UNIQUE (plus d'étapes !),
 * simple comme un bonjour, waooh comme les héros des pages.
 *
 *   · Trois coupons numérotés, perforés fil d'or comme les héros :
 *       ① Dites-nous qui vous êtes   (2 champs obligatoires : nom + tél)
 *       ② La tenue de vos rêves      (tout est optionnel)
 *       ③ Montrez-nous, dites-nous   (photo + quelques mots)
 *   · SUPPRIMÉ, car inutile pour passer commande : Budget, Mesures
 *     (l'essayage à l'atelier s'en charge), récap d'étape (le ticket
 *     PDF et la page merci le racontent déjà), et le stepper.
 *   · La photo jointe est compressée maison (~100-300 Ko, orientation
 *     EXIF respectée) avant de voyager — envoi propre et léger.
 */

export function PrecommandeForm({
  presetType,
  presetModele,
  presetPhoto,
}: { presetType?: string; presetModele?: string; presetPhoto?: string } = {}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<PrecommandeSchema | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(presetPhoto ?? null);
  const [photoName, setPhotoName] = useState<string | null>(
    presetPhoto ? (presetPhoto.split("/").pop() ?? "modele.webp") : null,
  );
  // 📎 La photo prête à EMBARQUER dans le ticket PDF (JPEG dataURL ~100-300 Ko)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const photoObjectUrlRef = useRef<string | null>(null);
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

  // ----- Photo jointe (modèle galerie ou photo de la cliente) -----
  // Convertie d'office en JPEG embarquable : elle sera cousue dans le
  // ticket PDF, pas seulement nommée.
  useEffect(() => {
    let alive = true;
    if (presetPhoto) {
      urlToJpegDataUrl(presetPhoto).then((d) => {
        if (alive && d) setPhotoDataUrl(d);
      });
    }
    return () => {
      alive = false;
    };
  }, [presetPhoto]);

  useEffect(
    () => () => {
      if (photoObjectUrlRef.current) URL.revokeObjectURL(photoObjectUrlRef.current);
    },
    [],
  );

  const onPickPhoto = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (photoObjectUrlRef.current) URL.revokeObjectURL(photoObjectUrlRef.current);
    const url = URL.createObjectURL(f);
    photoObjectUrlRef.current = url;
    setPhotoPreview(url);
    setPhotoName(f.name);
    setPhotoDataUrl(await fileToJpegDataUrl(f));
  };

  const removePhoto = () => {
    if (photoObjectUrlRef.current) {
      URL.revokeObjectURL(photoObjectUrlRef.current);
      photoObjectUrlRef.current = null;
    }
    setPhotoPreview(null);
    setPhotoName(null);
    setPhotoDataUrl(null);
  };

  const onFocusFirst = () => {
    if (!startedRef.current) {
      startedRef.current = true;
      trackFormStart("precommande");
    }
  };

  const onSubmit = async (data: PrecommandeSchema) => {
    const ref = generateTicketId();
    // 👗 Le modèle et sa photo voyagent comme de VRAIES données :
    // nom du modèle en clair + photo JPEG embarquée (cousue dans le
    // ticket PDF — pas un simple nom de fichier perdu).
    const payload = {
      ...data,
      ref,
      modele: presetModele ?? "",
      photo_nom: photoName ?? "",
      photo_jpeg: photoDataUrl ?? "",
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

  /** Champ oublié ? On glisse jusqu'à lui, avec douceur. */
  const onInvalid = () => {
    toast.error("Il manque un petit fil 🧵", {
      description: "Votre nom et votre téléphone suffisent pour partir — regardez les champs entourés de rouge.",
    });
    requestAnimationFrame(() => {
      document
        .querySelector('[aria-invalid="true"]')
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
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
            className="mb-5 text-sm rounded-2xl border px-3.5 py-2.5 flex items-start gap-2"
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

      {/* ③ ════════ MONTREZ-NOUS ════════ */}
      <CouponSection
        numero="03"
        icon="📸"
        title="Montrez-nous, dites-nous tout"
        sub="Une photo ou quelques mots suffisent à nous lancer — tout est optionnel."
      >
        <Field
          label="Photo de votre tenue"
          hint={
            presetModele
              ? "La photo du modèle choisi est jointe — remplacez-la si vous préférez la vôtre."
              : "Optionnel — montrez-nous le modèle exact (photo, capture, image sauvegardée)."
          }
        >
          {photoPreview ? (
            <div
              className="flex items-center gap-3 rounded-3xl border-2 border-dashed p-3"
              style={{ borderColor: "var(--color-or,#C9A87C)" }}
            >
              <img
                src={photoPreview}
                alt={`Photo jointe — ${photoName ?? "modèle"}`}
                className="w-20 h-20 object-cover rounded-2xl border border-[var(--color-line)] shadow-sm shrink-0"
              />
              <div className="text-xs text-[var(--color-muted)] min-w-0 flex-1">
                <p className="font-semibold text-sm text-[var(--color-ink)] break-all">{photoName}</p>
                <p className="mt-0.5">{photoDataUrl ? "✓ recadrée maison et cousue dans votre ticket PDF" : "jointe à votre demande"}</p>
                <div className="flex gap-3 mt-2">
                  <label className="font-semibold cursor-pointer underline underline-offset-2 decoration-dotted" style={{ color: "var(--color-feuille-f,#558B2F)" }}>
                    Changer
                    <input type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
                  </label>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <label
              className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-4 py-7 text-center cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                borderColor: "var(--color-feuille,#7CBA45)",
                background: "color-mix(in srgb, var(--color-feuille-doux,#EFF7E3) 45%, transparent)",
              }}
            >
              <span className="text-3xl" aria-hidden="true">📷</span>
              <span className="text-sm font-bold" style={{ color: "var(--color-feuille-f,#558B2F)" }}>
                Ajouter une photo
              </span>
              <span className="text-xs text-[var(--color-muted)]">
                Elle sera allégée maison avant le voyage — envoi propre et léger.
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={onPickPhoto} />
            </label>
          )}
        </Field>

        <Field
          label="Dites-nous tout"
          hint="Style, occasion, couleurs, mesures, budget, délai… Plus c'est précis, mieux c'est — et tout se complètera à l'essayage."
          error={errors.description?.message}
        >
          <Textarea
            rows={5}
            {...register("description")}
            placeholder="Décrivez votre tenue idéale..."
          />
        </Field>
      </CouponSection>

      {/* 🎟️ ════════ L'ENVOI — grand coupon perforé ════════ */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-30px" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-[1.75rem] border-2 border-dashed p-5 md:p-7 text-center shadow-sm"
        style={{ borderColor: "var(--color-or,#C9A87C)" }}
      >
        <p className="text-xs md:text-sm text-[var(--color-muted)] leading-relaxed max-w-md mx-auto mb-5">
          Réponse sous <strong className="text-[var(--color-ink)]">48 h ouvrées</strong>.
          Votre ticket PDF arrive aussitôt — gardez-le, c'est votre fil d'Ariane avec l'atelier. 🎫
        </p>
        <Button
          type="submit"
          loading={isSubmitting}
          size="lg"
          icon={<CheckCircle2 className="w-4 h-4" />}
          shimmer
          className="w-full sm:w-auto sm:min-w-[280px]"
        >
          {isSubmitting ? "Couture en cours…" : "Envoyer ma commande"}
        </Button>
      </motion.div>
    </form>
  );
}

/**
 * Un coupon de l'écrin — perforation fil d'or en tête (comme les coupons
 * des héros), pastille numérotée dorée, entrée en douceur. 🎟️
 */
function CouponSection({
  numero,
  icon,
  title,
  sub,
  children,
}: {
  numero: string;
  icon: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative bg-white rounded-[1.75rem] border border-[var(--color-line)] shadow-sm overflow-hidden"
    >
      {/* Perforation fil d'or + petit ciseau */}
      <div className="relative h-4 bg-[var(--color-cream)]" aria-hidden="true">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] opacity-70 select-none">✂</span>
        <span
          className="absolute left-9 right-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed"
          style={{ borderColor: "var(--color-or,#C9A87C)" }}
        />
      </div>

      <div className="px-5 md:px-7 pb-6 md:pb-7 pt-4 space-y-5">
        <header className="flex items-start gap-3.5">
          <span
            className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-extrabold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #D3B68C 0%, #C9A87C 45%, #A9854F 100%)" }}
            aria-hidden="true"
          >
            {numero}
          </span>
          <div className="pt-0.5">
            <h3
              className="text-lg md:text-xl leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}
            >
              {icon} {title}
            </h3>
            {sub && <p className="mt-1 text-xs md:text-[13px] text-[var(--color-muted)] leading-relaxed">{sub}</p>}
          </div>
        </header>
        {children}
      </div>
    </motion.section>
  );
}
