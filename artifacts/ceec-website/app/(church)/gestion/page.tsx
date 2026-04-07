import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const metadata = { title: "Gestion | Espace Admin" };

export default async function GestionDashboardPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const now = new Date();
  const [membresCount, annoncesCount, evenementsCount, recentAnnonces, prochainEvenements] =
    await Promise.all([
      prisma.membre.count({ where: { egliseId, statut: "actif" } }),
      prisma.annonce.count({ where: { egliseId, publie: true } }),
      prisma.evenement.count({ where: { egliseId, publie: true, dateDebut: { gte: now } } }),
      prisma.annonce.findMany({
        where: { egliseId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, titre: true, publie: true, createdAt: true },
      }),
      prisma.evenement.findMany({
        where: { egliseId, dateDebut: { gte: new Date() } },
        orderBy: { dateDebut: "asc" },
        take: 3,
        select: { id: true, titre: true, dateDebut: true, lieu: true },
      }),
    ]);

  const stats = [
    { label: "Membres actifs", count: membresCount, icon: "👥", color: "#1e3a8a", href: "/gestion/membres" },
    { label: "Annonces publiées", count: annoncesCount, icon: "📢", color: "#0891b2", href: "/gestion/annonces" },
    { label: "Événements à venir", count: evenementsCount, icon: "🗓️", color: "#c59b2e", href: "/gestion/evenements" },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: 1000 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Tableau de bord</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Vue d&apos;ensemble de votre espace de gestion</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
            <div style={{
              background: "white", borderRadius: 14, padding: "1.5rem",
              border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              cursor: "pointer",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6 }}>{s.label}</div>
                  <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.count}</div>
                </div>
                <span style={{ fontSize: 28 }}>{s.icon}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: 0 }}>Annonces récentes</h2>
            <Link href="/gestion/annonces" style={{ fontSize: 13, color: "#1e3a8a", textDecoration: "none", fontWeight: 600 }}>Voir tout →</Link>
          </div>
          {recentAnnonces.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucune annonce pour l&apos;instant.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {recentAnnonces.map((a) => (
                <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 14, color: "#0f172a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.titre}</span>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 100, marginLeft: 8, flexShrink: 0,
                    background: a.publie ? "#dcfce7" : "#f1f5f9",
                    color: a.publie ? "#15803d" : "#64748b",
                    fontWeight: 600,
                  }}>
                    {a.publie ? "Publiée" : "Brouillon"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", margin: 0 }}>Prochains événements</h2>
            <Link href="/gestion/evenements" style={{ fontSize: 13, color: "#1e3a8a", textDecoration: "none", fontWeight: 600 }}>Voir tout →</Link>
          </div>
          {prochainEvenements.length === 0 ? (
            <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucun événement à venir.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {prochainEvenements.map((e) => (
                <div key={e.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{e.titre}</div>
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                    📅 {new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    {e.lieu && <> — 📍 {e.lieu}</>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
