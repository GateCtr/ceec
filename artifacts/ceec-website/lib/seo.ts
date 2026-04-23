const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "ceec-rdc.org";
export const SITE_URL = `https://${ROOT_DOMAIN}`;
export const SITE_NAME = "CEEC";
export const SITE_FULL_NAME = "Communauté des Églises Évangéliques au Congo";
export const SITE_DESCRIPTION =
  "Site officiel de la Communauté des Églises Évangéliques au Congo (CEEC). Découvrez nos paroisses, nos événements et notre communauté de foi.";

export function churchBaseUrl(slug: string) {
  return `https://${slug}.${ROOT_DOMAIN}`;
}

export function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_FULL_NAME,
    alternateName: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/icon.png`,
    description: SITE_DESCRIPTION,
    address: {
      "@type": "PostalAddress",
      addressCountry: "CD",
      addressLocality: "République Démocratique du Congo",
    },
  };
}

export function churchJsonLd(eglise: {
  nom: string;
  ville?: string | null;
  adresse?: string | null;
  telephone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  photoUrl?: string | null;
  slug: string;
  description?: string | null;
  pasteur?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Church",
    name: eglise.nom,
    description:
      eglise.description ??
      `Paroisse ${eglise.nom} de la CEEC${eglise.ville ? ` à ${eglise.ville}` : ""}.`,
    url: churchBaseUrl(eglise.slug),
    image: eglise.photoUrl ?? eglise.logoUrl ?? undefined,
    ...(eglise.adresse || eglise.ville
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: eglise.adresse ?? undefined,
            addressLocality: eglise.ville ?? undefined,
            addressCountry: "CD",
          },
        }
      : {}),
    ...(eglise.telephone ? { telephone: eglise.telephone } : {}),
    ...(eglise.email ? { email: eglise.email } : {}),
    ...(eglise.pasteur ? { employee: { "@type": "Person", name: eglise.pasteur, jobTitle: "Pasteur" } } : {}),
    parentOrganization: {
      "@type": "Organization",
      name: SITE_FULL_NAME,
      url: SITE_URL,
    },
  };
}

export function eventJsonLd(event: {
  titre: string;
  description?: string | null;
  dateDebut: string | Date;
  dateFin?: string | Date | null;
  lieu?: string | null;
  imageUrl?: string | null;
  organizerName: string;
  url: string;
}) {
  const start =
    typeof event.dateDebut === "string" ? event.dateDebut : event.dateDebut.toISOString();
  const end = event.dateFin
    ? typeof event.dateFin === "string"
      ? event.dateFin
      : event.dateFin.toISOString()
    : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.titre,
    ...(event.description ? { description: event.description } : {}),
    startDate: start,
    ...(end ? { endDate: end } : {}),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    ...(event.lieu ? { location: { "@type": "Place", name: event.lieu } } : {}),
    ...(event.imageUrl ? { image: event.imageUrl } : {}),
    organizer: { "@type": "Organization", name: event.organizerName },
    url: event.url,
  };
}

export function articleJsonLd(article: {
  titre: string;
  description?: string | null;
  datePublication: string | Date;
  imageUrl?: string | null;
  organizerName: string;
  url: string;
}) {
  const date =
    typeof article.datePublication === "string"
      ? article.datePublication
      : article.datePublication.toISOString();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.titre,
    ...(article.description ? { description: article.description } : {}),
    datePublished: date,
    ...(article.imageUrl ? { image: article.imageUrl } : {}),
    publisher: { "@type": "Organization", name: article.organizerName },
    url: article.url,
  };
}
