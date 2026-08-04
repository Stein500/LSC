import { SEO } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Sticker } from "@/components/ui/Sticker";
import { CONTACT } from "@/data/content";
import { Link } from "react-router-dom";

export default function OfflinePage() {
  return (
    <>
      <SEO
        title="Hors ligne"
        description="Une page hors ligne douce et utile pour continuer à joindre Les Services Colombes même sans réseau."
        path="/offline"
      />
      <PageHero
        title="Vous êtes hors ligne"
        subtitle="Pas de panique. Les Services Colombes vous attend dès que la connexion revient, avec toujours la même douceur."
        image="/images/hero-contact.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Hors ligne" }]}
      />

      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-6 md:p-8 overflow-hidden relative">
            <div className="absolute right-5 top-5 flex gap-2 pointer-events-none" aria-hidden="true">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-citron)]/25">✦</span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">🌸</span>
            </div>
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)] mb-3">Mode hors ligne</p>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                La connexion s’est reposée, vos repères restent là.
              </h2>
              <p className="mt-4 text-base md:text-lg text-[var(--color-ink-soft)] leading-8">
                Vous pouvez revenir à l’accueil, ouvrir WhatsApp ou appeler l’atelier.
                Dès que le réseau revient, la page se remet à jour toute seule.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 mt-8">
              <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-cream)]/30 p-5">
                <Sticker name="button" size={44} className="text-[var(--color-orange)]" title="Doux rappel" />
                <h3 className="mt-3 font-bold" style={{ fontFamily: "var(--font-display)" }}>Garder le lien</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">Un appel, un message WhatsApp ou un retour par mail restent possibles.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-cream)]/30 p-5">
                <Sticker name="fabric" size={44} className="text-[var(--color-orange)]" title="Douce trame" />
                <h3 className="mt-3 font-bold" style={{ fontFamily: "var(--font-display)" }}>Tout reste rangé</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">Vos demandes ne se perdent pas. Elles reprennent leur place dès le retour du réseau.</p>
              </div>
              <div className="rounded-[1.5rem] border border-[var(--color-line)] bg-[var(--color-cream)]/30 p-5">
                <Sticker name="mannequin" size={44} className="text-[var(--color-orange)]" title="Signature chic" />
                <h3 className="mt-3 font-bold" style={{ fontFamily: "var(--font-display)" }}>Retour tout doux</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-ink-soft)]">La page se recharge à nouveau, sans geste compliqué et sans perte de repère.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`tel:${CONTACT.phone1Raw}`} className="inline-flex">
                <Button variant="secondary">Appeler Les Services Colombes</Button>
              </a>
              <a href={CONTACT.whatsappRaw.startsWith("http") ? CONTACT.whatsappRaw : `https://wa.me/${CONTACT.whatsappRaw}`} target="_blank" rel="noopener noreferrer" className="inline-flex">
                <Button variant="outline">Ouvrir WhatsApp</Button>
              </a>
              <Link to="/" className="inline-flex">
                <Button variant="ghost">Retour à l’accueil</Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}
