import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Home, MessageCircle, ArrowRight, Share2 } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from "@/utils/whatsapp";
import { env } from "@/utils/env";
import { trackWhatsapp, trackCtaClick } from "@/utils/api";
import { track } from "@/utils/api";
import { shareText } from "@/utils/share";
import { notify } from "@/utils/notify";

const TYPE_LABEL: Record<string, string> = {
  formation: "demande d'apprentissage",
  precommande: "pré-commande",
  contact: "message",
};

export default function Merci() {
  const [params] = useSearchParams();
  const type = params.get("type") || "contact";
  const ref = params.get("ref") || "—";
  const nom = params.get("nom") || "cher visiteur";

  const whatsappMsg = WHATSAPP_TEMPLATES.relance(nom, ref);

  // 📤 Partage du résumé — Sharesheet Android en app, Web Share ailleurs.
  //    L'URL d'hébergement n'apparaît jamais dans le texte.
  const handleShare = async () => {
    trackCtaClick("merci_partage");
    const text = `🧵 Ma demande est entre de bonnes mains ! Ticket ${ref} — l'atelier Les Services Colombes (Porto-Novo) me répond sous 48 h ouvrées.`;
    const channel = await shareText(text);
    if (channel === "clipboard") notify.success("Résumé copié — partagez-le où vous voulez 🕊️");
  };

  return (
    <>
      <SEO title="Merci !" description="Votre demande a bien été enregistrée." noindex />
      <section className="min-h-[80vh] flex items-center justify-center py-32 px-4">
        <div className="max-w-2xl w-full text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "var(--color-citron)" }}
          >
            <CheckCircle2 className="w-12 h-12 text-white" strokeWidth={2.5} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Merci, <span style={{ color: "var(--color-orange)" }}>{nom}</span> !
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-lg text-[var(--color-ink-soft)] mb-2"
          >
            Votre {TYPE_LABEL[type] || "demande"} a bien été enregistrée.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-sm text-[var(--color-muted)] mb-8"
          >
            Référence : <code className="px-2 py-0.5 rounded bg-black/5 font-mono">{ref}</code>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white rounded-2xl border border-[var(--color-line)] p-6 mb-8 text-left"
          >
            <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Et maintenant ?
            </p>
            <ol className="space-y-2 text-sm text-[var(--color-ink-soft)]">
              <li className="flex gap-2"><span className="font-bold" style={{ color: "var(--color-citron-d)" }}>1.</span> Vous recevez un mail de confirmation.</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: "var(--color-citron-d)" }}>2.</span> Notre équipe vous recontacte sous 48h ouvrées.</li>
              <li className="flex gap-2"><span className="font-bold" style={{ color: "var(--color-citron-d)" }}>3.</span> Vous échangez, validez, puis nous lançons la production.</li>
            </ol>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            <a
              href={buildWhatsAppUrl(env.whatsappGeneralRaw, whatsappMsg)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                trackWhatsapp("merci_relance");
                trackCtaClick("merci_whatsapp");
                track({ event: "mail_stage", sheet: "Forms", stage: "second_followup", type, ref });
              }}
            >
              <Button size="lg" variant="secondary" icon={<MessageCircle className="w-4 h-4" />}>
                Envoyer via WhatsApp
              </Button>
            </a>
            <Link to="/" onClick={() => trackCtaClick("merci_accueil")}>
              <Button size="lg" variant="outline" icon={<Home className="w-4 h-4" />}>
                Retour à l'accueil
              </Button>
            </Link>
            <Button size="lg" variant="outline" icon={<Share2 className="w-4 h-4" />} onClick={handleShare}>
              Partager ma demande
            </Button>
          </motion.div>

          <p className="text-xs text-[var(--color-muted)] mt-8">
            Une erreur ? <Link to="/contact" className="underline hover:text-[var(--color-orange)]">Contactez-nous</Link>.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-12"
          >
            <Link
              to="/services"
              onClick={() => trackCtaClick("merci_voir_services")}
              className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-ink-soft)] hover:text-[var(--color-orange)] transition-colors"
            >
              Ou découvrez nos services <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}