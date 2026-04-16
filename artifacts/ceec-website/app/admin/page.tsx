import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, Users, Megaphone, Calendar, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { isPlatformAdmin, getUserRoles, ROLES } from "@/lib/auth/rbac";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import AdminLogsClient from "@/components/admin/AdminLogsClient";
import AdminValidationQueue from "@/components/admin/AdminValidationQueue";
import { getDateFrom } from "@/lib/date-filter";

export const metadata = { title: "Administration Plateforme | CEEC" };

async function getDashboardData(
  egliseFilter?: string,
  actionFilter?: string,
  dateFilter?: string
) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const logWhere: {
    egliseId?: number;
    action?: string;
    createdAt?: { gte: Date };
  } = {};

  try {
    if (egliseFilter) {
      const eg = await prisma.eglise.findUnique({
        where: { slug: egliseFilter },
        select: { id: true },
      });
      logWhere.egliseId = eg?.id ?? -1;
    }
    if (actionFilter) logWhere.action = actionFilter;
    const dateFrom = getDateFrom(dateFilter ?? "");
    if (dateFrom) logWhere.createdAt = { gte: dateFrom };

    const platformAdminIds = await prisma.userRole.findMany({
      where: { egliseId: null },
      select: { clerkUserId: true },
    });
    const excludedClerkIds = platformAdminIds.map((r) => r.clerkUserId);

    const [
      eglisesRaw,
      eglises,
      totalMembres,
      annoncesduMois,
      annoncesLastMonth,
      evenementsAVenir,
      pendingEglises,
      logs,
      eglisesForFilter,
      annoncesEnAttente,
      evenementsEnAttente,
    ] = await Promise.all([
      prisma.eglise.groupBy({ by: ["statut"], _count: { _all: true } }),
      prisma.eglise.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          nom: true,
          slug: true,
          ville: true,
          statut: true,
          createdAt: true,
          _count: { select: { membres: true } },
        },
      }),
      prisma.membre.count({
        where: excludedClerkIds.length > 0
          ? { clerkUserId: { notIn: excludedClerkIds } }
          : undefined,
      }),
      prisma.annonce.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.annonce.count({
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      }),
      prisma.evenement.count({
        where: { dateDebut: { gte: now }, statutContenu: "publie" },
      }),
      prisma.eglise.count({ where: { statut: "en_attente" } }),
      prisma.activityLog.findMany({
        where: logWhere,
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          acteurNom: true,
          action: true,
          entiteType: true,
          entiteId: true,
          entiteLabel: true,
          egliseNom: true,
          createdAt: true,
        },
      }),
      prisma.eglise.findMany({
        orderBy: { nom: "asc" },
        select: { id: true, nom: true, slug: true },
      }),
      prisma.annonce.findMany({
        where: { statutContenu: "en_attente" },
        orderBy: { createdAt: "asc" },
        include: { eglise: { select: { nom: true } } },
      }),
      prisma.evenement.findMany({
        where: { statutContenu: "en_attente" },
        orderBy: { createdAt: "asc" },
        include: { eglise: { select: { nom: true } } },
      }),
    ]);

    const eglisesByStatut = { actif: 0, en_attente: 0, suspendu: 0, total: 0 };
    for (const g of eglisesRaw) {
      const key = g.statut as keyof typeof eglisesByStatut;
      if (key in eglisesByStatut) eglisesByStatut[key] = g._count._all;
      eglisesByStatut.total += g._count._all;
    }

    const annoncesTrend =
      annoncesLastMonth > 0
        ? Math.round(((annoncesduMois - annoncesLastMonth) / annoncesLastMonth) * 100)
        : 0;

    return {
      stats: {
        eglises: eglisesByStatut,
        membres: totalMembres,
        annoncesduMois,
        annoncesTrend,
        evenementsAVenir,
        pendingEglises,
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
      eglisesForFilter: eglisesForFilter.map((e) => ({
        id: e.id,
        nom: e.nom,
        slug: e.slug ?? "",
      })),
      validationQueue: [
        ...annoncesEnAttente.map((a) => ({
          id: a.id,
          type: "annonce" as const,
          titre: a.titre,
          egliseNom: a.eglise?.nom ?? null,
          createdAt: a.createdAt.toISOString(),
          contenu: a.contenu,
          dateDebut: null,
        })),
        ...evenementsEnAttente.map((e) => ({
          id: e.id,
          type: "evenement" as const,
          titre: e.titre,
          egliseNom: e.eglise?.nom ?? null,
          createdAt: e.createdAt.toISOString(),
          contenu: e.description,
          dateDebut: e.dateDebut.toISOString(),
        })),
      ].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      ),
    };
  } catch {
    return {
      stats: {
        eglises: { actif: 0, en_attente: 0, suspendu: 0, total: 0 },
        membres: 0,
        annoncesduMois: 0,
        annoncesTrend: 0,
        evenementsAVenir: 0,
        pendingEglises: 0,
      },
      eglises: [],
      logs: [],
      eglisesForFilter: [],
      validationQueue: [],
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
  if (!(await isPlatformAdmin(userId))) redirect("/sign-in");

  const userRoles = await getUserRoles(userId);
  const roleNames = userRoles.map((ur) => ur.role.nom);
  const isSuperAdmin = roleNames.includes(ROLES.SUPER_ADMIN);

  const sp = await searchParams;
  const { stats, eglises, logs, eglisesForFilter, validationQueue } =
    await getDashboardData(sp.eglise, sp.action, sp.date);

  const totalValidation = validationQueue.length;

  return (
    <div style={{ padding: "1.75rem 2rem", maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.01em" }}>
            Vue globale de la plateforme
          </h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 13.5 }}>
            Gestion centralisée de toutes les églises membres CEEC
          </p>
        </div>
        {isSuperAdmin && (
          <Link href="/admin/eglises/nouveau" style={primaryBtn}>
            + Inviter une église
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(195px, 1fr))", gap: 14, marginBottom: 28 }}>
        <StatCard
          label="Églises actives"
          value={stats.eglises.actif}
          total={stats.eglises.total}
          color="#1e3a8a"
          href="/admin/eglises"
          icon={<Building2 size={20} />}
          sub={
            <div style={{ marginTop: 8, display: "flex", gap: 5, flexWrap: "wrap" }}>
              {stats.eglises.en_attente > 0 && (
                <Badge bg="#fef3c7" color="#b45309">{stats.eglises.en_attente} en attente</Badge>
              )}
              {stats.eglises.suspendu > 0 && (
                <Badge bg="#fee2e2" color="#b91c1c">{stats.eglises.suspendu} suspendues</Badge>
              )}
            </div>
          }
        />
        <StatCard
          label="Membres inscrits"
          value={stats.membres}
          color="#0891b2"
          href="/admin/membres"
          icon={<Users size={20} />}
        />
        <StatCard
          label="Annonces ce mois"
          value={stats.annoncesduMois}
          color="#16a34a"
          trend={stats.annoncesTrend}
          href="/admin/annonces"
          icon={<Megaphone size={20} />}
        />
        <StatCard
          label="Événements à venir"
          value={stats.evenementsAVenir}
          color="#d97706"
          href="/admin/evenements"
          icon={<Calendar size={20} />}
        />
        {totalValidation > 0 && (
          <StatCard
            label="En attente de validation"
            value={totalValidation}
            color="#dc2626"
            urgent
            icon={<AlertCircle size={20} />}
          />
        )}
      </div>

      {/* 2-column desktop layout : main (2/3) + side panel (1/3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: totalValidation > 0 ? "1fr 340px" : "1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* Colonne principale */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Églises récentes */}
          <section>
            <SectionHeader
              title="Dernières églises enregistrées"
              action={
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href="/admin/eglises" style={secondaryBtn}>Toutes les églises →</Link>
                  {isSuperAdmin && (
                    <Link href="/admin/eglises/nouveau" style={primaryBtnSm}>+ Inviter</Link>
                  )}
                </div>
              }
            />
            <AdminDashboardClient eglises={eglises} />
          </section>

          {/* Journal d'activité */}
          <section>
            <SectionHeader
              title="Journal d'activité"
              description={`${logs.length} dernières actions — filtrez par église, type et période`}
              action={
                <Link href="/admin/annonces" style={secondaryBtn}>
                  Superviser annonces →
                </Link>
              }
            />
            <AdminLogsClient
              logs={logs}
              eglises={eglisesForFilter}
              selectedEglise={sp.eglise ?? ""}
              selectedAction={sp.action ?? ""}
              selectedDate={sp.date ?? ""}
            />
          </section>
        </div>

        {/* Panneau latéral — Validation en attente */}
        {totalValidation > 0 && (
          <aside>
            <div
              style={{
                background: "#fff5f5",
                border: "1.5px solid #fca5a5",
                borderRadius: 14,
                padding: "1.25rem",
                position: "sticky",
                top: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#dc2626",
                    flexShrink: 0,
                    boxShadow: "0 0 0 3px #fee2e2",
                  }}
                />
                <h2 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "#b91c1c" }}>
                  Validation du contenu
                </h2>
                <span
                  style={{
                    marginLeft: "auto",
                    padding: "2px 9px",
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 800,
                    background: "#fee2e2",
                    color: "#b91c1c",
                    border: "1px solid #fca5a5",
                  }}
                >
                  {totalValidation}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "#b91c1c", margin: "0 0 14px", opacity: 0.8 }}>
                Annonces et événements soumis par les gestionnaires d&apos;église
              </p>
              <AdminValidationQueue items={validationQueue} />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  color,
  trend,
  href,
  urgent,
  sub,
  icon,
}: {
  label: string;
  value: number;
  total?: number;
  color: string;
  trend?: number;
  href?: string;
  urgent?: boolean;
  sub?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const inner = (
    <div
      style={{
        background: "white",
        borderRadius: 14,
        padding: "1.15rem 1.35rem",
        border: urgent ? `1.5px solid #fca5a5` : "1px solid #e2e8f0",
        boxShadow: urgent
          ? "0 2px 12px rgba(220,38,38,0.08)"
          : "0 1px 4px rgba(0,0,0,0.04)",
        cursor: href ? "pointer" : "default",
        transition: "border-color 0.15s, box-shadow 0.15s",
        textDecoration: "none",
        display: "block",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11.5, color: urgent ? "#b91c1c" : "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </div>
        {icon && (
          <div style={{ color, opacity: 0.7, flexShrink: 0 }}>
            {icon}
          </div>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, marginTop: 6 }}>
        <div style={{ fontSize: 38, fontWeight: 900, color, lineHeight: 1.05 }}>
          {value.toLocaleString("fr-FR")}
        </div>
        {total != null && total !== value && (
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>
            / {total} total
          </div>
        )}
      </div>
      {trend != null && trend !== 0 && (
        <div style={{ marginTop: 5, fontSize: 12, color: trend > 0 ? "#15803d" : "#b91c1c", fontWeight: 600 }}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}% vs mois dernier
        </div>
      )}
      {sub}
    </div>
  );

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: "none" }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

function Badge({ children, bg, color }: { children: React.ReactNode; bg: string; color: string }) {
  return (
    <span style={{ padding: "2px 8px", borderRadius: 100, fontSize: 11, fontWeight: 600, background: bg, color }}>
      {children}
    </span>
  );
}

function SectionHeader({
  title,
  badge,
  badgeColor,
  description,
  action,
}: {
  title: string;
  badge?: string;
  badgeColor?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 14,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h2 style={{ fontWeight: 700, color: "#0f172a", fontSize: 15, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          {title}
          {badge && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 9px",
                borderRadius: 100,
                background: badgeColor ? `${badgeColor}18` : "#fef9c3",
                color: badgeColor ?? "#a16207",
                border: `1px solid ${badgeColor ? `${badgeColor}40` : "#fde68a"}`,
              }}
            >
              {badge}
            </span>
          )}
        </h2>
        {description && (
          <p style={{ color: "#64748b", fontSize: 13, marginTop: 2, marginBottom: 0 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  padding: "9px 20px",
  borderRadius: 9,
  background: "#1e3a8a",
  color: "white",
  fontWeight: 700,
  fontSize: 13.5,
  textDecoration: "none",
  display: "inline-block",
};

const primaryBtnSm: React.CSSProperties = {
  padding: "7px 14px",
  borderRadius: 8,
  background: "#1e3a8a",
  color: "white",
  fontWeight: 600,
  fontSize: 13,
  textDecoration: "none",
};

const secondaryBtn: React.CSSProperties = {
  padding: "7px 14px",
  borderRadius: 8,
  background: "white",
  color: "#1e3a8a",
  fontWeight: 600,
  fontSize: 13,
  textDecoration: "none",
  border: "1px solid #e2e8f0",
};
