import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/index";
import { isSuperAdmin } from "@/lib/auth/rbac";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { nom: true } });
  return { title: `Contenu — ${eglise?.nom ?? slug} | CEEC Admin` };
}

export default async function AdminEgliseContenuPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isSuperAdmin(userId)) redirect("/sign-in");

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
      take: 20,
    }),
    prisma.evenement.findMany({
      where: { egliseId: eglise.id },
      orderBy: { dateDebut: "asc" },
      take: 20,
    }),
    prisma.liveStream.findMany({
      where: { egliseId: eglise.id },
      orderBy: [{ epingle: "desc" }, { createdAt: "desc" }],
      take: 20,
    }),
  ]);

  const typeLabels: Record<string, string> = {
    accueil: "Accueil", about: "À propos", contact: "Contact", departements: "Ministères", custom: "Page libre",
  };

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
          Vue de lecture seule du contenu publié. Pour modifier, connectez-vous en tant qu&apos;admin de cette église.
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

      {/* Pages */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Pages du site</h2>
        {pages.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucune page configurée.</p>
        ) : (
          <div style={{ background: "white", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "#64748b", fontWeight: 600 }}>TITRE</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "#64748b", fontWeight: 600 }}>TYPE</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "#64748b", fontWeight: 600 }}>SECTIONS</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 12, color: "#64748b", fontWeight: 600 }}>STATUT</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{p.titre}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8" }}>/c/{p.slug}</div>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#64748b" }}>{typeLabels[p.type] ?? p.type}</td>
                    <td style={{ padding: "10px 16px", fontSize: 13, color: "#64748b" }}>{p._count.sections}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: p.publie ? "#dcfce7" : "#f1f5f9", color: p.publie ? "#15803d" : "#64748b" }}>
                        {p.publie ? "Publié" : "Brouillon"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Annonces */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
          Annonces récentes
          {annonces.length === 20 && <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>(20 dernières)</span>}
        </h2>
        {annonces.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucune annonce.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {annonces.map((a) => (
              <div key={a.id} style={{ background: "white", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{a.titre}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    {new Date(a.datePublication).toLocaleDateString("fr-FR")} — Priorité: {a.priorite}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: a.publie ? "#dcfce7" : "#f1f5f9", color: a.publie ? "#15803d" : "#64748b", flexShrink: 0, marginLeft: 12 }}>
                  {a.publie ? "Publié" : "Brouillon"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Événements */}
      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
          Événements
          {evenements.length === 20 && <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 8 }}>(20 prochains)</span>}
        </h2>
        {evenements.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucun événement.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {evenements.map((e) => (
              <div key={e.id} style={{ background: "white", borderRadius: 10, padding: "12px 16px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{e.titre}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    📅 {new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {e.lieu && ` — 📍 ${e.lieu}`}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 99, background: e.publie ? "#dcfce7" : "#f1f5f9", color: e.publie ? "#15803d" : "#64748b", flexShrink: 0, marginLeft: 12 }}>
                  {e.publie ? "Publié" : "Brouillon"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Vidéos */}
      <section>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>Vidéos YouTube</h2>
        {videos.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucune vidéo.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
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
                  <div style={{ padding: "10px 14px" }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                      {v.epingle && <span style={{ fontSize: 10, fontWeight: 700, background: "#fef3c7", color: "#b45309", padding: "2px 8px", borderRadius: 99 }}>📌 Épinglé</span>}
                      {v.estEnDirect && <span style={{ fontSize: 10, fontWeight: 700, background: "#fee2e2", color: "#b91c1c", padding: "2px 8px", borderRadius: 99 }}>🔴 En direct</span>}
                      {!v.publie && <span style={{ fontSize: 10, fontWeight: 700, background: "#f1f5f9", color: "#64748b", padding: "2px 8px", borderRadius: 99 }}>Brouillon</span>}
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{v.titre}</div>
                    {v.dateStream && (
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        {new Date(v.dateStream).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
