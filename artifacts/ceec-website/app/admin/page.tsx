import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import AdminLogsClient from "@/components/admin/AdminLogsClient";
import { getDateFrom } from "@/lib/date-filter";

export const metadata = { title: "Administration Plateforme | CEEC" };

async function getDashboardData(egliseFilter?: string, actionFilter?: string, dateFilter?: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const logWhere: {
    egliseId?: number;
    action?: string;
    createdAt?: { gte: Date };
  } = {};

  try {
    if (egliseFilter) {
      const eg = await prisma.eglise.findUnique({ where: { slug: egliseFilter }, select: { id: true } });
      logWhere.egliseId = eg?.id ?? -1;
    }
    if (actionFilter) logWhere.action = actionFilter;
    const dateFrom = getDateFrom(dateFilter ?? "");
    if (dateFrom) logWhere.createdAt = { gte: dateFrom };

    const [
      eglisesRaw,
      eglises,
      totalMembres,
      annoncesduMois,
      evenementsAVenir,
      logs,
      eglisesForFilter,
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
        where: logWhere,
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true, acteurNom: true, action: true, entiteType: true,
          entiteId: true, entiteLabel: true, egliseNom: true, createdAt: true,
        },
      }),
      prisma.eglise.findMany({
        orderBy: { nom: "asc" },
        select: { id: true, nom: true, slug: true },
      }),
    ]);

    const eglisesByStatut = { actif: 0, en_attente: 0, suspendu: 0, total: 0 };
    for (const g of eglisesRaw) {
      const key = g.statut as keyof typeof eglisesByStatut;
      if (key in eglisesByStatut) eglisesByStatut[key] = g._count._all;
      eglisesByStatut.total += g._count._all;
    }

    return {
      stats: { eglises: eglisesByStatut, membres: totalMembres, annoncesduMois, evenementsAVenir },
      eglises: eglises.map((e) => ({
        id: e.id,
        nom: e.nom,
        slug: e.slug ?? "",
        ville: e.ville,
        statut: e.statut,
        membres: e._count.membres,
        createdAt: e.createdAt.toISOString(),
      })),
      logs: logs.map((l) => ({
        id: l.id,
        acteurNom: l.acteurNom,
        action: l.action,
        entiteType: l.entiteType,
        entiteId: l.entiteId,
        entiteLabel: l.entiteLabel,
        egliseNom: l.egliseNom,
        createdAt: l.createdAt.toISOString(),
      })),
      eglisesForFilter: eglisesForFilter.map((e) => ({ id: e.id, nom: e.nom, slug: e.slug ?? "" })),
    };
  } catch {
    return {
      stats: { eglises: { actif: 0, en_attente: 0, suspendu: 0, total: 0 }, membres: 0, annoncesduMois: 0, evenementsAVenir: 0 },
      eglises: [],
      logs: [],
      eglisesForFilter: [],
    };
  }
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ eglise?: string; action?: string; date?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isSuperAdmin(userId)) redirect("/sign-in");

  const sp = await searchParams;
  const { stats, eglises, logs, eglisesForFilter } = await getDashboardData(sp.eglise, sp.action, sp.date);

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
    { label: "Membres inscrits", value: stats.membres, color: "#0891b2", icon: "👥", href: null },
    { label: "Annonces ce mois", value: stats.annoncesduMois, color: "#16a34a", icon: "📢", href: null },
    { label: "Événements à venir", value: stats.evenementsAVenir, color: "#d97706", icon: "🗓️", href: null },
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
              {"icon" in card && card.icon && <span style={{ fontSize: 22, opacity: 0.6 }}>{card.icon}</span>}
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: card.color, lineHeight: 1.1, marginTop: 6 }}>
              {card.value.toLocaleString("fr-FR")}
            </div>
            {"sub" in card && card.sub ? card.sub : null}
          </div>
        ))}
      </div>

      {/* Church list */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, color: "#0f172a", fontSize: 16, margin: 0 }}>Toutes les églises</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/eglises" style={secondaryBtn}>Gérer les églises →</Link>
            <Link href="/admin/eglises/nouveau" style={primaryBtn}>+ Ajouter une église</Link>
          </div>
        </div>
        <AdminDashboardClient eglises={eglises} />
      </div>

      {/* Activity log — full filterable view directly in /admin */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ fontWeight: 700, color: "#0f172a", fontSize: 16, margin: 0 }}>
              Journal d&apos;activité global
            </h2>
            <p style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>
              50 dernières actions de toutes les églises — filtrez par église, action et période
            </p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/admin/annonces" style={secondaryBtn}>Superviser annonces →</Link>
          </div>
        </div>
        <AdminLogsClient
          logs={logs}
          eglises={eglisesForFilter}
          selectedEglise={sp.eglise ?? ""}
          selectedAction={sp.action ?? ""}
          selectedDate={sp.date ?? ""}
        />
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

const primaryBtn: React.CSSProperties = {
  padding: "8px 18px", borderRadius: 8, background: "#1e3a8a", color: "white",
  fontWeight: 600, fontSize: 13, textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  padding: "8px 16px", borderRadius: 8, background: "white", color: "#1e3a8a",
  fontWeight: 600, fontSize: 13, textDecoration: "none", border: "1px solid #e2e8f0",
};
