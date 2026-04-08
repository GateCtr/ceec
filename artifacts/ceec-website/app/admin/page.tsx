import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const metadata = { title: "Administration Plateforme | CEEC" };

async function getDashboardData() {
  try {
    const [eglisesRaw, eglises, totalMembres, totalAnnonces, totalEvenements] = await Promise.all([
      prisma.eglise.groupBy({ by: ["statut"], _count: { _all: true } }),
      prisma.eglise.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, nom: true, slug: true, ville: true, statut: true, createdAt: true,
          _count: { select: { membres: true } },
        },
      }),
      prisma.membre.count(),
      prisma.annonce.count(),
      prisma.evenement.count(),
    ]);

    const eglisesByStatut = { actif: 0, en_attente: 0, suspendu: 0, total: 0 };
    for (const g of eglisesRaw) {
      const key = g.statut as keyof typeof eglisesByStatut;
      if (key in eglisesByStatut) eglisesByStatut[key] = g._count._all;
      eglisesByStatut.total += g._count._all;
    }

    return {
      stats: { eglises: eglisesByStatut, membres: totalMembres, annonces: totalAnnonces, evenements: totalEvenements },
      eglises: eglises.map((e) => ({
        id: e.id,
        nom: e.nom,
        slug: e.slug ?? "",
        ville: e.ville,
        statut: e.statut,
        membres: e._count.membres,
        createdAt: e.createdAt.toISOString(),
      })),
    };
  } catch {
    return {
      stats: { eglises: { actif: 0, en_attente: 0, suspendu: 0, total: 0 }, membres: 0, annonces: 0, evenements: 0 },
      eglises: [],
    };
  }
}

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isSuperAdmin(userId)) redirect("/dashboard?error=acces-refuse");

  const { stats, eglises } = await getDashboardData();

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Vue globale de la plateforme CEEC
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Statistiques et gestion centralisée de toutes les églises membres
        </p>
      </div>

      <h2 style={{ fontWeight: 700, color: "#1e3a8a", marginBottom: 16, fontSize: 16 }}>
        Statistiques globales
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
        <div style={statCard}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Églises (total)</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#1e3a8a" }}>{stats.eglises.total}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <span style={{ ...badge, background: "#dcfce7", color: "#15803d" }}>{stats.eglises.actif} actives</span>
            <span style={{ ...badge, background: "#fef3c7", color: "#b45309" }}>{stats.eglises.en_attente} en attente</span>
            <span style={{ ...badge, background: "#fee2e2", color: "#b91c1c" }}>{stats.eglises.suspendu} suspendues</span>
          </div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Membres</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#0891b2" }}>{stats.membres}</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Annonces</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#16a34a" }}>{stats.annonces}</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 12, color: "#64748b" }}>Événements</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#d97706" }}>{stats.evenements}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontWeight: 700, color: "#1e3a8a", fontSize: 16, margin: 0 }}>Toutes les églises</h2>
        <Link
          href="/admin/eglises/nouveau"
          style={{ padding: "8px 18px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
        >
          + Ajouter une église
        </Link>
      </div>

      <AdminDashboardClient eglises={eglises} />
    </div>
  );
}

const statCard: React.CSSProperties = {
  background: "white", borderRadius: 14, padding: "1.25rem 1.5rem",
  border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
};

const badge: React.CSSProperties = {
  padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600,
};
