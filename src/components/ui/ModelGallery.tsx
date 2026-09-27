import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Scissors, Share2 } from "lucide-react";
import { SmartImage } from "./SmartImage";
import { downloadAtelierImage } from "@/utils/downloadImage";
import { shareAtelierImage } from "@/utils/shareAtelier";
import type { InspirationSection } from "@/data/galleries";
import type { GalleryImage } from "./ScissorGallery";

/**
 * ModelGallery — le show-room des modèles de l'atelier 👗
 * --------------------------------------------------------
 * Plus de fiche, plus de flou : chaque modèle porte SES boutons
 * directement dessous, toujours visibles, gros comme il faut 🤍
 *
 *   ⬇  « Télécharger » — la photo signée part chez le visiteur ;
 *   ✂  « Commander »   — direction le formulaire, modèle déjà joint ;
 *   📤 « Partager »    — le modèle voyage (WhatsApp…) AVEC le lien du site.
 */
export function ModelGallery({ sections }: { sections: InspirationSection[] }) {
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
                <ModelTile key={img.src} img={img} sectionKey={section.key} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

/** Une tuile = la photo signée + ses 3 boutons (rien d'autre à apprendre). */
function ModelTile({ img, sectionKey }: { img: GalleryImage; sectionKey: string }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<"dl" | "share" | null>(null);
  const caption = img.caption ?? img.alt;

  const doDownload = async () => {
    setBusy("dl");
    await downloadAtelierImage(img.src);
    setBusy(null);
  };

  const doShare = async () => {
    setBusy("share");
    await shareAtelierImage({ caption, path: "/inspirations", hash: sectionKey });
    setBusy(null);
  };

  const doOrder = () => {
    navigate(`/services?commande=1&modele=${encodeURIComponent(caption)}&photo=${encodeURIComponent(img.src)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="group rounded-3xl overflow-hidden bg-white border border-[var(--color-line)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={img.src}
          alt={img.alt}
          width={1600}
          height={1200}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <span className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent pointer-events-none" aria-hidden="true" />
        <span className="absolute bottom-3 left-4 right-4 text-white text-sm font-semibold drop-shadow-sm line-clamp-1">
          {caption}
        </span>
        {/* 📤 Partager — toujours visible, un seul doigt suffit */}
        <button
          type="button"
          onClick={doShare}
          disabled={busy !== null}
          aria-label={`Partager le modèle : ${caption} (le lien du site voyage avec)`}
          title="Partager — le lien du site voyage avec"
          className="absolute top-3 right-3 w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-white/90 text-[var(--color-marron,#5C2E0C)] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-60"
        >
          <Share2 className="w-4.5 h-4.5" aria-hidden="true" />
        </button>
      </div>

      {/* Les deux gestes, gros et lisibles 🤍 */}
      <div className="flex gap-2 p-3">
        <button
          type="button"
          onClick={doDownload}
          disabled={busy !== null}
          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] rounded-2xl px-3 py-2.5 text-sm font-bold border-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-60"
          style={{ borderColor: "var(--color-marron,#5C2E0C)", color: "var(--color-marron,#5C2E0C)", background: "white" }}
        >
          <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          {busy === "dl" ? "En route…" : "Télécharger"}
        </button>
        <button
          type="button"
          onClick={doOrder}
          className="flex-1 inline-flex items-center justify-center gap-1.5 min-h-[48px] rounded-2xl px-3 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, #558B2F 0%, #7CBA45 45%, #E87414 100%)" }}
        >
          <Scissors className="w-4 h-4 shrink-0" aria-hidden="true" />
          Commander
        </button>
      </div>
    </motion.div>
  );
}
