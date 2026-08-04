import { SEO } from "@/components/seo/SEO";
import { PageHero } from "@/components/ui/PageHero";
import { Card } from "@/components/ui/Card";
import { NotificationHub } from "@/components/notifications/NotificationHub";

export default function NotificationsPage() {
  return (
    <>
      <SEO
        title="Mes notifications"
        description="Vos alertes, vos demandes et vos petits repères du jour, dans un espace clair et chic."
        path="/notifications"
      />
      <PageHero
        title="Mes notifications"
        subtitle="Un petit carnet élégant pour suivre vos pré-commandes, vos demandes de formation et vos messages sans rien perdre, avec des alertes claires et douces."
        image="/images/hero-contact.webp"
        crumbs={[{ label: "Accueil", to: "/" }, { label: "Notifications" }]}
      />
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-0 overflow-hidden">
            <NotificationHub variant="page" />
          </Card>
        </div>
      </section>
    </>
  );
}
