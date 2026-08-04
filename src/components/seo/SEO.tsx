import { Helmet } from "react-helmet-async";
import { env } from "@/utils/env";

type JsonLd =
  | Record<string, unknown>
  | Record<string, unknown>[];

type Props = {
  title?: string;
  description?: string;
  image?: string;
  path?: string;
  type?: "website" | "article";
  noindex?: boolean;
  /**
   * Bloc JSON-LD Schema.org (LocalBusiness, Service, FAQPage, BreadcrumbList, etc.)
   * Tu peux passer un objet ou un tableau d'objets (sera sérialisé en @graph).
   */
  jsonLd?: JsonLd;
  /**
   * Si tu veux surcharger l'og:image par page (sinon fallback sur le hero).
   */
  ogImage?: string;
  /**
   * Liste de mots-clés spécifiques à la page (injectés dans une meta keywords).
   */
  keywords?: string[];
};

const DEFAULTS = {
  title: `${env.schoolName} | Atelier de Couture à Porto-Novo — Femmes, Filles & Layette`,
  description: `${env.schoolName}, atelier de couture à Porto-Novo : confection sur mesure, mercerie, layette et formations professionnelles.`,
};

const HERO_OG = "/images/header-colombes.webp";
const FALLBACK_OG = "/images/og-share-preview.webp";

/**
 * Construit le bloc JSON-LD final en s'assurant la compatibilité Schema.org.
 * Si on passe un tableau, on l'enveloppe dans un @graph.
 */
function buildJsonLd(input: JsonLd | undefined): Record<string, unknown> | null {
  if (!input) return null;
  if (Array.isArray(input)) {
    return { "@context": "https://schema.org", "@graph": input };
  }
  // Si l'utilisateur a déjà mis @context, on respecte, sinon on l'ajoute
  if (!(input as Record<string, unknown>)["@context"]) {
    return { "@context": "https://schema.org", ...(input as Record<string, unknown>) };
  }
  return input as Record<string, unknown>;
}

export function SEO({
  title,
  description,
  image,
  path,
  type = "website",
  noindex,
  jsonLd,
  ogImage,
  keywords,
}: Props) {
  const t = title ? `${title} — ${env.schoolName}` : DEFAULTS.title;
  const d = description || DEFAULTS.description;
  // og-image par page (override) → hero → fallback
  const img = ogImage || image || HERO_OG;
  const url = `${env.siteUrl}${path || ""}`;
  const ogImageFull = `${env.siteUrl}${img}`;
  const ogFallbackFull = `${env.siteUrl}${FALLBACK_OG}`;
  const hreflangFr = `${env.siteUrl}${path || ""}`;

  const ld = buildJsonLd(jsonLd);

  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={d} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      <meta name="author" content={env.schoolName} />
      <meta name="geo.region" content="BJ-OU" />
      <meta name="geo.placename" content="Porto-Novo" />
      <meta name="geo.position" content="6.4969;2.6289" />
      <meta name="ICBM" content="6.4969, 2.6289" />
      <meta name="theme-color" content="#BFFF00" />

      <link rel="canonical" href={url} />
      <link rel="alternate" hrefLang="fr" href={hreflangFr} />
      <link rel="alternate" hrefLang="x-default" href={hreflangFr} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="fr_FR" />
      <meta property="og:site_name" content={env.schoolName} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImageFull} />
      <meta property="og:image:secure_url" content={ogImageFull} />
      <meta property="og:image:url" content={ogImageFull} />
      <meta property="og:image:alt" content={`${env.schoolName} — Atelier de Couture à Porto-Novo`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/jpeg" />
      {/* Image de secours si le hero échoue au crawl */}
      <meta property="og:image" content={ogFallbackFull} />
      <meta property="og:image:secure_url" content={ogFallbackFull} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={ogImageFull} />

      {/* JSON-LD Schema.org */}
      {ld && (
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      )}
    </Helmet>
  );
}

/* =========================================================
 * Helpers pour construire les blocs JSON-LD récurrents.
 * Tu peux les importer depuis n'importe quelle page.
 * ========================================================= */

export const SchemaBuilders = {
  organization() {
    return {
      "@type": "Organization",
      "@id": `${env.siteUrl}#organization`,
      name: env.schoolName,
      url: env.siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${env.siteUrl}/images/logo.webp`,
      },
      sameAs: [
        env.facebookUrl,
        env.instagramUrl,
        env.tiktokUrl,
      ].filter(Boolean),
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: env.schoolPhoneRaw,
          contactType: "customer service",
          areaServed: "BJ",
          availableLanguage: ["fr"],
        },
      ],
    };
  },

  localBusiness() {
    return {
      "@type": "LocalBusiness",
      "@id": `${env.siteUrl}#localbusiness`,
      name: env.schoolName,
      image: `${env.siteUrl}/images/og-share-preview.webp`,
      url: env.siteUrl,
      telephone: env.schoolPhoneRaw,
      email: env.schoolEmail || undefined,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: env.schoolLocationFull || env.schoolLocation,
        addressLocality: "Porto-Novo",
        addressRegion: "Ouémé",
        postalCode: "BP — Porto-Novo",
        addressCountry: "BJ",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 6.4969,
        longitude: 2.6289,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "08:00",
          closes: "21:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Sunday"],
          opens: "08:00",
          closes: "20:00",
        },
      ],
      parentOrganization: { "@id": `${env.siteUrl}#organization` },
    };
  },

  /** Service de couture sur mesure (page /services) */
  service(opts: { name: string; description: string; url: string; image?: string }) {
    return {
      "@type": "Service",
      name: opts.name,
      description: opts.description,
      url: opts.url,
      image: opts.image ? `${env.siteUrl}${opts.image}` : `${env.siteUrl}/images/hero-services.webp`,
      provider: { "@id": `${env.siteUrl}#localbusiness` },
      areaServed: { "@type": "City", name: "Porto-Novo" },
      serviceType: "Couture sur mesure",
    };
  },

  /** Cours de couture (page /formation) */
  course(opts: { name: string; description: string; url: string }) {
    return {
      "@type": "Course",
      name: opts.name,
      description: opts.description,
      url: opts.url,
      provider: { "@id": `${env.siteUrl}#organization` },
      educationalCredentialAwarded: "Attestation de fin de formation",
      inLanguage: "fr",
      availableLanguage: ["fr"],
      offers: {
        "@type": "Offer",
        category: "Formation professionnelle",
        priceCurrency: "XOF",
        availability: "https://schema.org/InStock",
      },
    };
  },

  /** FAQ Schema.org */
  faqPage(items: { q: string; a: string }[]) {
    return {
      "@type": "FAQPage",
      mainEntity: items.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    };
  },

  /** Fil d'Ariane */
  breadcrumb(items: { name: string; url: string }[]) {
    return {
      "@type": "BreadcrumbList",
      itemListElement: items.map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: b.name,
        item: b.url.startsWith("http") ? b.url : `${env.siteUrl}${b.url}`,
      })),
    };
  },

  /** Site Web avec SearchAction (utile dans index.html via injection) */
  website() {
    return {
      "@type": "WebSite",
      "@id": `${env.siteUrl}#website`,
      url: env.siteUrl,
      name: env.schoolName,
      inLanguage: "fr-FR",
      publisher: { "@id": `${env.siteUrl}#organization` },
    };
  },

  /** Page collection (utile pour /inspirations, /galerie, etc.) */
  collectionPage: ({
    name,
    description,
    url,
    hasPart,
  }: {
    name: string;
    description: string;
    url: string;
    hasPart: Array<{ name: string; url: string; image?: string }>;
  }) => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url,
    isPartOf: {
      "@type": "WebSite",
      name: "Les Services Colombes",
      url: "https://lesservicescolombes.vercel.app/",
    },
    inLanguage: "fr-FR",
    hasPart: hasPart.map((item) => ({
      "@type": "ItemPage",
      name: item.name,
      url: item.url,
      image: item.image,
    })),
  }),
};
