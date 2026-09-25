import { SEO } from "@/components/seo/SEO";
import { Card } from "@/components/ui/Card";
import { env } from "@/utils/env";
import { LEGAL, officialFooterLine } from "@/data/legal";

/**
 * Mentions légales — l'identité vient de src/data/legal.ts (source unique).
 * Chaque ligne officielle ne s'affiche que si le papier correspondant
 * a été enregistré : jamais de placeholder, jamais d'à-peu-près. 🧾
 */
export default function Mentions() {
  const officiels = officialFooterLine();

  return (
    <>
      <SEO title="Mentions légales" description="Mentions légales de l'atelier Les Services Colombes, Porto-Novo : éditeur, hébergement, données." path="/mentions-legales" />
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8" style={{ fontFamily: "var(--font-display)" }}>
            Mentions légales
          </h1>
          <Card hover={false} className="prose prose-sm max-w-none space-y-5 text-sm text-[var(--color-ink-soft)]">
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Éditrice</h2>
              {LEGAL.legalName ? (
                <p>
                  {LEGAL.legalName}
                  {LEGAL.formeJuridique ? ` (${LEGAL.formeJuridique})` : ""} — enseigne «&nbsp;{LEGAL.displayName}&nbsp;»,
                  atelier de couture à Porto-Novo, Bénin.
                </p>
              ) : (
                <p>{LEGAL.displayName} — Atelier de couture à Porto-Novo, Bénin.</p>
              )}
              <p>Adresse : {LEGAL.siege || env.schoolLocationFull || env.schoolLocation}</p>
              <p>Téléphone : {env.schoolPhone}</p>
              {LEGAL.rccm && (
                <p>
                  RCCM : {LEGAL.rccm}
                  {LEGAL.rccmDate ? ` — Tribunal de Commerce de Cotonou, le ${LEGAL.rccmDate}` : ""}
                </p>
              )}
              {LEGAL.ifu && <p>IFU : {LEGAL.ifu}</p>}
              {officiels && (
                <p className="text-[var(--color-muted)]">Atelier déclaré — {officiels}.</p>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Activité</h2>
              <p>
                Confection sur mesure, tenues africaines & wax, layette, mercerie et formations
                professionnelles — depuis {LEGAL.foundedYear}. Atelier déclaré, immatriculé au RCCM en 2026.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Hébergement</h2>
              <p>Vercel Inc. — cloud haute performance.</p>
            </div>
            <div>
              <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Propriété intellectuelle</h2>
              <p>L'ensemble du contenu de cette plateforme — site web et application — (textes, images, logo) est protégé. Toute reproduction est interdite sans autorisation préalable.</p>
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
