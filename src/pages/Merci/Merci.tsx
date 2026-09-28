import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Home, MessageCircle, Share2 } from "lucide-react";
import { SEO } from "@/components/seo/SEO";
import { Button } from "@/components/ui/Button";
import { buildWhatsAppUrl, WHATSAPP_TEMPLATES } from "@/utils/whatsapp";
import { env } from "@/utils/env";
import { trackWhatsapp, trackCtaClick, track } from "@/utils/api";
import { shareText } from "@/utils/share";
import { notify } from "@/utils/notify";

const TYPE_LABEL: Record<string, string> = {
  formation: "demande d'apprentissage",
  precommande: "commande",
  contact: "message",
};

/**
 * Merci — « Le Ticket de la Colombe » 🎟️ (29/09/2026)
 * ------------------------------------------------------------
 * La page de remerciement devient un GRAND coupon perforé fil d'or,
 * comme l'Écrin des formulaires dont elle est la sortie :
 *   · médaille ✓, merci nominatif, grand TICKET lisible de loin ;
 *   · pour la commande : la photo du modèle s'envoie sur WhatsApp
 *     — le bouton ouvre la conversation PRÉ-REMPLIE du n° de ticket ;
 *   · la suite en trois points, simple comme un bonjour.
 */
export default function Merci() {
  const [params] = useSearchParams();
  const type = params.get("type") || "contact";
  const ref = params.get("ref") || "—";
  const nom = params.get("nom") || "cher visiteur";

  const isCommande = type === "precommande";

  // 📸 Commande → la conversation s'ouvre prête à recevoir la PHOTO
  //    du modèle, avec le n° de ticket déjà écrit. Sans ça, la photo
  //    arrivait sans passeport — on ne savait plus à qui elle était.
  const whatsappMsg = isCommande
    ? `Bonjour, je m'appelle ${nom}. Ma commande est bien envoyée (ticket ${ref}) — voici la photo de mon modèle 📸`
    : WHATSAPP_TEMPLATES.relance(nom, ref);

  // 📤 Partage du résumé — Sharesheet Android en app, Web Share ailleurs.
  //    L'URL d'hébergement n'apparaît jamais dans le texte.
  const handleShare = async () => {
    trackCtaClick("merci_partage");
    const text = `🧵 Ma demande est entre de bonnes mains ! Ticket ${ref} — l'atelier Couture Colombe et Merceries (Porto-Novo) me répond sous 48 h ouvrées.`;
    const channel = await shareText(text);
    if (channel === "clipboard") notify.success("Résumé copié — partagez-le où vous voulez 🕊️");
  };

  return (
    <>
      <SEO title="Merci !" description="Votre demande a bien été enregistrée." noindex />
      <section className="min-h-[80vh] flex items-center justify-center py-24 md:py-32 px-4">
        <div className="max-w-2xl w-full">
          {/* ════════ Le grand coupon-ticket ════════ */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-white rounded-[2rem] border border-[var(--color-line)] shadow-xl overflow-hidden"
          >
            {/* Perforation haute */}
            <div className="relative h-4 bg-[var(--color-cream)]" aria-hidden="true">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] opacity-70 select-none">✂</span>
              <span
                className="absolute left-9 right-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed"
                style={{ borderColor: "var(--color-or,#C9A87C)" }}
              />
            </div>

            <div className="px-6 md:px-10 py-8 md:py-10 text-center">
              {/* La médaille */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-5 flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "var(--color-citron)" }}
              >
                <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={2.5} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-3xl md:text-5xl font-bold mb-2.5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Merci, <span style={{ color: "var(--color-orange)" }}>{nom}</span> !
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-base md:text-lg text-[var(--color-ink-soft)]"
              >
                Votre {TYPE_LABEL[type] || "demande"} a bien été cousue dans notre registre —
                réponse sous <strong>48 h ouvrées</strong>.
              </motion.p>

              {/* 🎫 LE TICKET — bordure or pointillée, perforations latérales */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="relative my-7 rounded-2xl border-2 border-dashed px-5 py-5"
                style={{ borderColor: "var(--color-or,#C9A87C)", background: "var(--color-cream)" }}
              >
                {/* encoches latérales façon ticket */}
                <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[var(--color-line)]" aria-hidden="true" />
                <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border border-[var(--color-line)]" aria-hidden="true" />
                <p className="text-[10px] tracking-[0.32em] uppercase font-bold" style={{ color: "var(--color-marron,#5C2E0C)" }}>
                  🎫 Votre ticket
                </p>
                <p className="mt-1.5 font-mono text-2xl md:text-3xl font-bold tracking-wide text-[var(--color-ink)]">
                  {ref}
                </p>
                <p className="mt-2 text-xs text-[var(--color-muted)] italic">
                  Présentez ce numéro lors de votre passage à l'atelier — il est votre fil d'Ariane avec nous.
                </p>
              </motion.div>

              {/* 📸 La photo du modèle prend la route WhatsApp (commande) */}
              {isCommande && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="mb-7 rounded-2xl border-2 border-dashed p-4 text-left flex items-start gap-3"
                  style={{
                    borderColor: "var(--color-feuille,#7CBA45)",
                    background: "color-mix(in srgb, var(--color-feuille-doux,#EFF7E3) 50%, transparent)",
                  }}
                >
                  <span className="text-2xl shrink-0" aria-hidden="true">📸</span>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-feuille-f,#558B2F)" }}>
                    <strong>Il ne reste que la photo du modèle…</strong> Envoyez-la-nous sur
                    WhatsApp avec le bouton ci-dessous : votre n° de ticket est déjà écrit dans
                    le message — la photo arrive droit dans nos mains, bien adressée.
                  </p>
                </motion.div>
              )}

              {/* La suite, tout simplement */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-2xl bg-[var(--color-cream)] border border-[var(--color-line)] p-5 mb-8 text-left"
              >
                <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-display)" }}>
                  Et maintenant ?
                </p>
                <ol className="space-y-2 text-sm text-[var(--color-ink-soft)]">
                  <li className="flex gap-2"><span className="font-bold" style={{ color: "var(--color-citron-d)" }}>1.</span> Vous recevez un mail de confirmation (regardez aussi les indésirables).</li>
                  <li className="flex gap-2"><span className="font-bold" style={{ color: "var(--color-citron-d)" }}>2.</span> Notre équipe vous recontacte sous 48 h ouvrées.</li>
                  <li className="flex gap-2"><span className="font-bold" style={{ color: "var(--color-citron-d)" }}>3.</span> Vous échangez, validez, puis nous lançons la production.</li>
                </ol>
              </motion.div>

              {/* Les gestes proposés */}
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
                    trackWhatsapp(isCommande ? "merci_photo_modele" : "merci_relance");
                    trackCtaClick("merci_whatsapp");
                    track({ event: "mail_stage", sheet: "Forms", stage: isCommande ? "photo_whatsapp" : "second_followup", type, ref });
                  }}
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    icon={<MessageCircle className="w-4 h-4" />}
                    style={{ background: "linear-gradient(135deg,#558B2F 0%,#7CBA45 100%)", color: "#FFFFFF", border: "none" }}
                  >
                    {isCommande ? "Envoyer la photo sur WhatsApp" : "Continuer sur WhatsApp"}
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
            </div>

            {/* Perforation basse */}
            <div className="relative h-4 bg-[var(--color-cream)]" aria-hidden="true">
              <span
                className="absolute left-4 right-4 top-1/2 -translate-y-1/2 border-t-2 border-dashed"
                style={{ borderColor: "var(--color-or,#C9A87C)" }}
              />
            </div>
          </motion.div>

          {/* Sous le coupon */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.85 }}
            className="text-center mt-8 space-y-3"
          >
            <p className="text-xs text-[var(--color-muted)]">
              Une erreur ?{" "}
              <Link to="/contact" className="underline hover:text-[var(--color-orange)]">
                Contactez-nous
              </Link>
              .
            </p>
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
