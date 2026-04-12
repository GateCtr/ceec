import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const metadata = { title: "Administration Plateforme | CEEC" };

async function getDashboardData() {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  try {
    const [
      eglisesRaw,
      eglises,
      totalMembres,
      annoncesduMois,
      evenementsAVenir,
      recentLogs,
    ] = await Promise.all([
      prisma.eglise.groupBy({ by: ["statut"], _count: { _all: true } }),
      prisma.eglise.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, nom: true, slug: true, ville: true, statut: true, createdAt: true,
          _count: { select: { membres: true } },
        },
      }),
      prisma.membre.count(),
      prisma.annonce.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.evenement.count({ where: { dateDebut: { gte: now }, publie: true } }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true, acteurNom: true, action: true, entiteType: true,
          entiteLabel: true, egliseNom: true, createdAt: true,
        },
      }),
    ]);

    const eglisesByStatut = { actif: 0, en_attente: 0, suspendu: 0, total: 0 };
    for (const g of eglisesRaw) {
      const key = g.statut as keyof typeof eglisesByStatut;
      if (key in eglisesByStatut) eglisesByStatut[key] = g._count._all;
      eglisesByStatut.total += g._count._all;
    }

    return {
      stats: {
        eglises: eglisesByStatut,
        membres: totalMembres,
        annoncesduMois,
        evenementsAVenir,
      },
      eglises: eglises.map((e) => ({
        id: e.id,
        nom: e.nom,
        slug: e.slug ?? "",
        ville: e.ville,
        statut: e.statut,
        membres: e._count.membres,
        createdAt: e.createdAt.toISOString(),
      })),
      recentLogs: recentLogs.map((l) => ({
        id: l.id,
        acteurNom: l.acteurNom,
        action: l.action,
        entiteType: l.entiteType,
        entiteLabel: l.entiteLabel,
        egliseNom: l.egliseNom,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  } catch {
    return {
      stats: { eglises: { actif: 0, en_attente: 0, suspendu: 0, total: 0 }, membres: 0, annoncesduMois: 0, evenementsAVenir: 0 },
      eglises: [],
      recentLogs: [],
    };
  }
}

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isSuperAdmin(userId)) redirect("/sign-in");

  const { stats, eglises, recentLogs } = await getDashboardData();

  const statCards = [
    {
      label: "Églises (total)",
      value: stats.eglises.total,
      color: "#1e3a8a",
      sub: (
        <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ ...badge, background: "#dcfce7", color: "#15803d" }}>{stats.eglises.actif} actives</span>
          <span style={{ ...badge, background: "#fef3c7", color: "#b45309" }}>{stats.eglises.en_attente} en attente</span>
          <span style={{ ...badge, background: "#fee2e2", color: "#b91c1c" }}>{stats.eglises.suspendu} suspendues</span>
        </div>
      ),
      href: "/admin/eglises",
    },
    {
      label: "Membres inscrits",
      value: stats.membres,
      color: "#0891b2",
      icon: "👥",
      href: null,
    },
    {
      label: "Annonces ce mois",
      value: stats.annoncesduMois,
      color: "#16a34a",
      icon: "📢",
      href: null,
    },
    {
      label: "Événements à venir",
      value: stats.evenementsAVenir,
      color: "#d97706",
      icon: "🗓️",
      href: null,
    },
  ];

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

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 36 }}>
        {statCards.map((card) => (
          <div key={card.label} style={statCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>{card.label}</div>
              {card.icon && <span style={{ fontSize: 22, opacity: 0.6 }}>{card.icon}</span>}
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: card.color, lineHeight: 1.1, marginTop: 6 }}>
              {card.value.toLocaleString("fr-FR")}
            </div>
            {card.sub ?? null}
          </div>
        ))}
      </div>

      {/* Main grid: church list + recent activity */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>
        {/* Church list */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontWeight: 700, color: "#0f172a", fontSize: 16, margin: 0 }}>Toutes les églises</h2>
            <Link
              href="/admin/eglises/nouveau"
              style={{ padding: "8px 18px", borderRadius: 8, background: "#1e3a8a", color: "white", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
            >
              + Ajouter une église
            </Link>
          </div>
          <AdminDashboardClient eglises={eglises} />
        </div>

        {/* Recent activity sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: 0 }}>
                Activité récente
              </h2>
              <Link href="/admin/logs" style={{ fontSize: 12, color: "#1e3a8a", textDecoration: "none", fontWeight: 600 }}>
                Voir tout →
              </Link>
            </div>
            {recentLogs.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 13 }}>Aucune activité enregistrée.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {recentLogs.map((log) => {
                  const ENTITY_ICONS: Record<string, string> = { annonce: "📢", evenement: "🗓️", page: "📄", membre: "👤", eglise: "⛪", admin: "🔐", role: "🏷️" };
                  const ACTION_LABELS: Record<string, string> = { creer: "a créé", modifier: "a modifié", supprimer: "a supprimé", suspendre: "a suspendu", reactiver: "a réactivé", inviter: "a invité", revoquer: "a révoqué" };
                  const icon = ENTITY_ICONS[log.entiteType] ?? "📌";
                  return (
                    <div key={log.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                        background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14,
                      }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "#0f172a", lineHeight: 1.4 }}>
                          <strong>{log.acteurNom}</strong>{" "}
                          {ACTION_LABELS[log.action] ?? log.action}{" "}
                          {log.entiteLabel && <span style={{ color: "#1e3a8a", fontWeight: 600 }}>{log.entiteLabel}</span>}
                        </div>
                        {log.egliseNom && (
                          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{log.egliseNom}</div>
                        )}
                        <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>
                          {new Date(log.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                          {" · "}
                          {new Date(log.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: "0 0 14px" }}>
              Actions rapides
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link href="/admin/eglises/nouveau" style={quickLink}>
                + Ajouter une église
              </Link>
              <Link href="/admin/eglises" style={quickLink}>
                Voir toutes les églises →
              </Link>
              <Link href="/admin/annonces" style={quickLink}>
                Superviser les annonces →
              </Link>
              <Link href="/admin/logs" style={quickLink}>
                Journal d&apos;activité →
              </Link>
            </div>
          </div>
        </div>
      </div>
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

const quickLink: React.CSSProperties = {
  display: "block", padding: "9px 14px", borderRadius: 8,
  background: "#f8fafc", color: "#1e3a8a", fontSize: 13, fontWeight: 600,
  textDecoration: "none", border: "1px solid #e2e8f0",
};
