import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Scissors, X } from "lucide-react";
import { SmartImage } from "./SmartImage";
import { downloadAtelierImage } from "@/utils/downloadImage";
import type { InspirationSection } from "@/data/galleries";
import type { GalleryImage } from "./ScissorGallery";

/**
 * ModelGallery — le show-room des modèles de l'atelier 👗
 * --------------------------------------------------------
 * Une page = des sections de galeries, rien d'autre.
 * Le visiteur touche un modèle → une fiche s'ouvre avec DEUX boutons :
 *
 *   1. « Télécharger le modèle » — la photo signée part chez lui ;
 *   2. « Commander ce modèle » — direction le formulaire de commande,
 *      le modèle (et sa photo) déjà joints à la demande.
 */

export function ModelGallery({ sections }: { sections: InspirationSection[] }) {
  const [open, setOpen] = useState<GalleryImage | null>(null);

  // Échap ferme la fiche ; la page ne défile pas pendant l'ouverture.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const close = useCallback(() => setOpen(null), []);

  return (
    <div className="bg-white">
      {sections.map((section) => (
        <section key={section.key} id={section.key} className="py-10 md:py-14 odd:bg-white even:bg-[var(--color-feuille-doux,#EFF7E3)]/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: "var(--color-feuille-f,#558B2F)" }}>
              {section.note}
            </p>
            <h2 className="text-2xl md:text-3xl mt-1 mb-6" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
              {section.titre}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {section.images.map((img) => (
                <motion.button
                  key={img.src}
                  type="button"
                  onClick={() => setOpen(img)}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="group text-left rounded-3xl overflow-hidden bg-white border border-[var(--color-line)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-feuille,#7CBA45)]/40"
                  aria-label={`Voir le modèle : ${img.caption ?? img.alt}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <SmartImage
                      src={img.src}
                      alt={img.alt}
                      width={1600}
                      height={1200}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" />
                    <span className="absolute bottom-3 left-4 right-4 text-white text-sm font-semibold drop-shadow-sm line-clamp-1">
                      {img.caption}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* ===================== FICHE MODÈLE (2 boutons) ===================== */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fiche-modele"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Modèle : ${open.caption ?? open.alt}`}
          >
            <div className="absolute inset-0 bg-[#0B0B12]/80 backdrop-blur-sm" onClick={close} />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-[var(--color-line)]"
            >
              <button
                type="button"
                onClick={close}
                aria-label="Fermer la fiche modèle"
                className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-white/90 border border-[var(--color-line)] shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="rounded-t-3xl overflow-hidden bg-[var(--color-cream)]">
                <SmartImage
                  src={open.src}
                  alt={open.alt}
                  width={1600}
                  height={1200}
                  loading="eager"
                  className="w-full max-h-[58vh] object-contain"
                />
              </div>

              <div className="p-5 md:p-6">
                <p className="text-lg md:text-xl font-bold mb-1" style={{ fontFamily: "var(--font-display)", color: "var(--color-ink)" }}>
                  {open.caption}
                </p>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed mb-5">
                  Ce modèle vous plaît ? Gardez la photo signée… ou confiez-nous l'aiguille.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <ModelDownloadButton img={open} />
                  <ModelOrderButton img={open} onDone={close} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Bouton 1 — la photo signée voyage chez le visiteur. */
function ModelDownloadButton({ img }: { img: GalleryImage }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await downloadAtelierImage(img.src);
        setBusy(false);
      }}
      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-semibold border-2 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
      style={{ borderColor: "var(--color-marron,#5C2E0C)", color: "var(--color-marron,#5C2E0C)", background: "white" }}
    >
      <Download className="w-4 h-4" />
      {busy ? "Téléchargement…" : "Télécharger le modèle"}
    </button>
  );
}

/** Bouton 2 — direction la commande, le modèle déjà joint. */
function ModelOrderButton({ img, onDone }: { img: GalleryImage; onDone: () => void }) {
  const navigate = useNavigate();
  const modele = img.caption ?? img.alt;
  return (
    <button
      type="button"
      onClick={() => {
        onDone();
        navigate(`/services?commande=1&modele=${encodeURIComponent(modele)}&photo=${encodeURIComponent(img.src)}`);
      }}
      className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-semibold text-white transition-all hover:-translate-y-0.5 active:translate-y-0 shadow-lg"
      style={{ background: "linear-gradient(135deg, #558B2F 0%, #7CBA45 45%, #E87414 100%)" }}
    >
      <Scissors className="w-4 h-4" />
      Commander ce modèle
    </button>
  );
}
