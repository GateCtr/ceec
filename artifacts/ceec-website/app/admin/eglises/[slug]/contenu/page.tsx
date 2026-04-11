import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/index";
import { isPlatformAdmin } from "@/lib/auth/rbac";
import AdminContenuClient from "@/components/admin/AdminContenuClient";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { nom: true } });
  return { title: `Contenu — ${eglise?.nom ?? slug} | CEEC Admin` };
}

export default async function AdminEgliseContenuPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isPlatformAdmin(userId)) redirect("/sign-in");

  const { slug } = await params;

  const eglise = await prisma.eglise.findUnique({
    where: { slug },
    select: { id: true, nom: true, slug: true },
  });
  if (!eglise) notFound();

  const [pages, annonces, evenements, videos] = await Promise.all([
    prisma.pageEglise.findMany({
      where: { egliseId: eglise.id },
      orderBy: { ordre: "asc" },
      include: { _count: { select: { sections: true } } },
    }),
    prisma.annonce.findMany({
      where: { egliseId: eglise.id },
      orderBy: { datePublication: "desc" },
      take: 50,
    }),
    prisma.evenement.findMany({
      where: { egliseId: eglise.id },
      orderBy: { dateDebut: "asc" },
      take: 50,
    }),
    prisma.liveStream.findMany({
      where: { egliseId: eglise.id },
      orderBy: [{ epingle: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>
      <Link
        href={`/admin/eglises/${slug}`}
        style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}
      >
        ← Retour à {eglise.nom}
      </Link>

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Supervision du contenu — {eglise.nom}
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Modérez le contenu publié par cette église (publication / suppression).
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Pages", count: pages.length, color: "#1e3a8a", bg: "#eff6ff", icon: "📄" },
          { label: "Annonces", count: annonces.length, color: "#15803d", bg: "#f0fdf4", icon: "📢" },
          { label: "Événements", count: evenements.length, color: "#b45309", bg: "#fef3c7", icon: "🗓️" },
          { label: "Vidéos", count: videos.length, color: "#7c3aed", bg: "#f5f3ff", icon: "▶️" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: stat.bg, borderRadius: 12, padding: "1.25rem 1.5rem" }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 900, color: stat.color }}>{stat.count}</div>
            <div style={{ fontSize: 13, color: stat.color, fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <AdminContenuClient
        egliseSlug={eglise.slug ?? slug}
        initialPages={pages.map((p) => ({
          id: p.id,
          titre: p.titre,
          slug: p.slug,
          type: p.type,
          publie: p.publie,
          sectionsCount: p._count.sections,
        }))}
        initialAnnonces={annonces.map((a) => ({
          id: a.id,
          titre: a.titre,
          priorite: a.priorite,
          publie: a.publie,
          datePublication: a.datePublication.toISOString(),
          categorie: a.categorie,
        }))}
        initialEvenements={evenements.map((e) => ({
          id: e.id,
          titre: e.titre,
          publie: e.publie,
          dateDebut: e.dateDebut.toISOString(),
          lieu: e.lieu,
          categorie: e.categorie,
        }))}
      />

      {/* Vidéos — read-only overview */}
      {videos.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
            Vidéos YouTube ({videos.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {videos.map((v) => {
              let ytId: string | null = null;
              try {
                const u = new URL(v.urlYoutube);
                ytId = u.hostname.includes("youtu.be") ? u.pathname.slice(1) : u.searchParams.get("v");
              } catch { /* ignore */ }
              return (
                <div key={v.id} style={{ background: "white", borderRadius: 10, border: "1px solid #e2e8f0", overflow: "hidden" }}>
                  {ytId && (
                    <div style={{ aspectRatio: "16/9", overflow: "hidden" }}>
                      <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={v.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                  <div style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 6 }}>
                      {v.epingle && <span style={{ fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "2px 7px", borderRadius: 99 }}>📌 Épinglé</span>}
                      {v.estEnDirect && <span style={{ fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#b91c1c", padding: "2px 7px", borderRadius: 99 }}>🔴 Direct</span>}
                      {!v.publie && <span style={{ fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: "#64748b", padding: "2px 7px", borderRadius: 99 }}>Brouillon</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#0f172a" }}>{v.titre}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
