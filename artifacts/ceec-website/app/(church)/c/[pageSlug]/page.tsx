import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/db/index";
import SectionRenderer from "@/components/church/sections/SectionRenderer";

type Props = { params: Promise<{ pageSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug") ?? "";
  const { pageSlug } = await params;
  if (!slug) return {};
  try {
    const [page, eglise] = await Promise.all([
      prisma.pageEglise.findFirst({
        where: { slug: pageSlug, eglise: { slug }, publie: true },
        select: { titre: true, sections: true },
      }),
      prisma.eglise.findUnique({
        where: { slug },
        select: { nom: true, logoUrl: true, photoUrl: true },
      }),
    ]);
    if (!page || !eglise) return {};
    const ogImage = eglise.photoUrl ?? eglise.logoUrl ?? null;
    return {
      title: page.titre,
      openGraph: {
        title: `${page.titre} | ${eglise.nom}`,
        type: "website",
        ...(ogImage ? { images: [{ url: ogImage, alt: eglise.nom }] } : {}),
      },
      twitter: {
        card: ogImage ? ("summary_large_image" as const) : ("summary" as const),
        title: `${page.titre} | ${eglise.nom}`,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch { return {}; }
}

export default async function ChurchCustomPage({ params }: Props) {
  const headersList = await headers();
  const egliseSlug = headersList.get("x-eglise-slug");
  if (!egliseSlug) redirect("/");

  const { pageSlug } = await params;

  const eglise = await prisma.eglise.findUnique({ where: { slug: egliseSlug } });
  if (!eglise) notFound();

  const page = await prisma.pageEglise.findFirst({
    where: { egliseId: eglise.id, slug: pageSlug, publie: true },
    include: { sections: { orderBy: { ordre: "asc" } } },
  });

  if (!page) notFound();

  const [liveStreams, annonces, evenements, egliseConfig] = await Promise.all([
    prisma.liveStream.findMany({
      where: { egliseId: eglise.id, publie: true },
      orderBy: [{ epingle: "desc" }, { createdAt: "desc" }],
      take: 6,
    }),
    prisma.annonce.findMany({
      where: { egliseId: eglise.id, statutContenu: "publie" },
      orderBy: [{ priorite: "asc" }, { datePublication: "desc" }],
      take: 6,
    }),
    prisma.evenement.findMany({
      where: { egliseId: eglise.id, statutContenu: "publie", dateDebut: { gte: new Date() } },
      orderBy: { dateDebut: "asc" },
      take: 6,
    }),
    prisma.egliseConfig.findUnique({
      where: { egliseId: eglise.id },
      select: { contactChampsActifs: true, contactMessageConfirmation: true },
    }),
  ]);

  const contactConfig = {
    champsActifs: (egliseConfig?.contactChampsActifs as { telephone?: boolean; sujet?: boolean } | null) ?? { telephone: false, sujet: true },
    messageConfirmation: egliseConfig?.contactMessageConfirmation ?? undefined,
  };

  return (
    <>
      {page.sections.length === 0 ? (
        <section style={{ padding: "5rem 1rem", textAlign: "center", background: "#f8fafc" }}>
          <h1 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 800, fontSize: "2rem", marginBottom: 12 }}>
            {page.titre}
          </h1>
          <p style={{ color: "#64748b" }}>Cette page est en cours de préparation.</p>
        </section>
      ) : (
        <>
          {page.sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={{
                id: section.id,
                type: section.type,
                ordre: section.ordre,
                config: (section.config ?? {}) as Record<string, unknown>,
              }}
              eglise={eglise}
              egliseId={eglise.id}
              contactConfig={contactConfig}
              liveStreams={liveStreams}
              annonces={annonces}
              evenements={evenements}
            />
          ))}
        </>
      )}
    </>
  );
}
