import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/index";
import SectionRenderer from "@/components/church/sections/SectionRenderer";
import SectionHero from "@/components/church/sections/SectionHero";
import SectionAnnoncesRecentes from "@/components/church/sections/SectionAnnoncesRecentes";
import SectionEvenementsAVenir from "@/components/church/sections/SectionEvenementsAVenir";
import SectionContact from "@/components/church/sections/SectionContact";

export default async function ChurchHomePage() {
  const headersList = await headers();
  const slug = headersList.get("x-eglise-slug");
  if (!slug) redirect("/");

  const eglise = await prisma.eglise.findUnique({ where: { slug } });
  if (!eglise) notFound();

  // Fetch homepage sections + live streams + recent content in parallel
  const [homePageData, liveStreams, annonces, evenements] = await Promise.all([
    prisma.pageEglise.findFirst({
      where: { egliseId: eglise.id, type: "accueil", publie: true },
      include: {
        sections: { orderBy: { ordre: "asc" } },
      },
    }),
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
  ]);

  // Dynamic sections from configured page
  if (homePageData && homePageData.sections.length > 0) {
    return (
      <>
        {homePageData.sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={{
              id: section.id,
              type: section.type,
              ordre: section.ordre,
              config: (section.config ?? {}) as Record<string, unknown>,
            }}
            eglise={eglise}
            liveStreams={liveStreams}
            annonces={annonces}
            evenements={evenements}
          />
        ))}
      </>
    );
  }

  // Default layout (fallback when no homepage is configured)
  return (
    <>
      <SectionHero config={{}} eglise={eglise} />

      {annonces.length > 0 && (
        <SectionAnnoncesRecentes
          config={{ bgColor: "#f8fafc" }}
          annonces={annonces.slice(0, 3)}
        />
      )}

      {evenements.length > 0 && (
        <SectionEvenementsAVenir
          config={{ bgColor: annonces.length > 0 ? "#ffffff" : "#f8fafc" }}
          evenements={evenements.slice(0, 3)}
        />
      )}

      {liveStreams.length > 0 && (
        <SectionRenderer
          section={{ id: 0, type: "live", ordre: 0, config: {} }}
          eglise={eglise}
          liveStreams={liveStreams}
        />
      )}

      {annonces.length === 0 && evenements.length === 0 && liveStreams.length === 0 && (
        <section style={{ padding: "5rem 1rem", background: "#f8fafc", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⛪</div>
          <h2 style={{ color: "var(--church-primary, #1e3a8a)", fontWeight: 800, fontSize: "1.75rem", marginBottom: 12 }}>
            Bienvenue à {eglise.nom}
          </h2>
          <p style={{ color: "#64748b", fontSize: 16, maxWidth: 500, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Cette église vient de rejoindre la CEEC. Les annonces et événements seront publiés prochainement.
          </p>
          <a
            href="/c/inscription"
            style={{
              padding: "13px 30px", borderRadius: 10, background: "var(--church-primary, #1e3a8a)",
              color: "white", fontWeight: 700, fontSize: 15, textDecoration: "none",
            }}
          >
            Rejoindre la communauté
          </a>
        </section>
      )}

      <SectionContact config={{}} eglise={eglise} />
    </>
  );
}
