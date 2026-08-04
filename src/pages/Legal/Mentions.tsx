import { SEO } from "@/components/seo/SEO";
import { Card } from "@/components/ui/Card";
import { env } from "@/utils/env";

export default function Mentions() {
  return (
    <>
      <SEO title="Mentions légales" description="Mentions légales du site Les Services Colombes." path="/mentions-legales" />
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: "var(--font-display)" }}>
            Mentions légales
          </h1>
          <Card hover={false} className="prose prose-sm max-w-none space-y-5 text-sm text-[var(--color-ink-soft)]">
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Éditeur</h2>
              <p>{env.schoolName} — Atelier de couture à Porto-Novo, Bénin.</p>
              <p>Adresse : {env.schoolLocationFull || env.schoolLocation}</p>
              <p>Téléphone : {env.schoolPhone}</p>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Hébergement</h2>
              <p>Firebase Hosting — Google Cloud.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Propriété intellectuelle</h2>
              <p>L'ensemble du contenu de ce site (textes, images, logo) est protégé. Toute reproduction est interdite sans autorisation préalable.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Données personnelles</h2>
              <p>Les informations transmises via nos formulaires sont utilisées uniquement pour vous recontacter. Aucune donnée n'est cédée à des tiers.</p>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}