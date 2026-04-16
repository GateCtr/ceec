import React from "react";
import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import { Users, Megaphone, Calendar, FileText, User, Church, Lock, Tag, Pin, MapPin, ChevronRight } from "lucide-react";

function EntityIcon({ type, color, size = 16 }: { type: string; color: string; size?: number }) {
  const props = { size, color };
  switch (type) {
    case "annonce":   return <Megaphone {...props} />;
    case "evenement": return <Calendar {...props} />;
    case "page":      return <FileText {...props} />;
    case "membre":    return <User {...props} />;
    case "eglise":    return <Church {...props} />;
    case "admin":     return <Lock {...props} />;
    case "role":      return <Tag {...props} />;
    default:          return <Pin {...props} />;
  }
}

const ACTION_LABELS: Record<string, string> = { creer: "créé", modifier: "modifié", supprimer: "supprimé", suspendre: "suspendu", reactiver: "réactivé", inviter: "invité", revoquer: "révoqué" };
const ACTIVITY_COLORS: Record<string, { bg: string; color: string }> = {
  creer: { bg: "#dcfce7", color: "#15803d" },
  modifier: { bg: "#dbeafe", color: "#1d4ed8" },
  supprimer: { bg: "#fee2e2", color: "#b91c1c" },
  suspendre: { bg: "#fee2e2", color: "#b91c1c" },
  reactiver: { bg: "#dcfce7", color: "#15803d" },
  inviter: { bg: "#e0e7ff", color: "#4338ca" },
  revoquer: { bg: "#fef3c7", color: "#b45309" },
};

export const metadata = { title: "Tableau de bord | Gestion" };

export default async function GestionDashboardPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const canContenus = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
  const canMembres = superAdmin || await hasPermission(userId, "eglise_gerer_membres", egliseId);
  const canPages = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);

  const now = new Date();
  const [
    membresCount,
    annoncesCount,
    evenementsCount,
    pagesCount,
    recentAnnonces,
    prochainEvenements,
    recentActivity,
  ] = await Promise.all([
    canMembres ? prisma.membre.count({ where: { egliseId, statut: "actif" } }) : Promise.resolve(null),
    canContenus ? prisma.annonce.count({ where: { egliseId, statutContenu: "publie" } }) : Promise.resolve(null),
    canContenus ? prisma.evenement.count({ where: { egliseId, statutContenu: "publie", dateDebut: { gte: now } } }) : Promise.resolve(null),
    canPages ? prisma.pageEglise.count({ where: { egliseId, publie: true } }) : Promise.resolve(null),
    canContenus
      ? prisma.annonce.findMany({
          where: { egliseId },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: { id: true, titre: true, publie: true, statutContenu: true, createdAt: true },
        })
      : Promise.resolve([]),
    canContenus
      ? prisma.evenement.findMany({
          where: { egliseId, dateDebut: { gte: now } },
          orderBy: { dateDebut: "asc" },
          take: 3,
          select: { id: true, titre: true, dateDebut: true, lieu: true },
        })
      : Promise.resolve([]),
    prisma.activityLog.findMany({
      where: { egliseId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: { id: true, acteurNom: true, action: true, entiteType: true, entiteLabel: true, createdAt: true },
    }),
  ]);

  type StatCard = {
    label: string;
    count: number;
    icon: React.ReactElement;
    color: string;
    href: string;
  };

  const stats: StatCard[] = [
    ...(canMembres && membresCount !== null
      ? [{ label: "Membres actifs", count: membresCount, icon: <Users size={22} color="#1e3a8a" />, color: "#1e3a8a", href: "/gestion/membres" }]
      : []),
    ...(canContenus && annoncesCount !== null
      ? [{ label: "Annonces publiées", count: annoncesCount, icon: <Megaphone size={22} color="#0891b2" />, color: "#0891b2", href: "/gestion/annonces" }]
      : []),
    ...(canContenus && evenementsCount !== null
      ? [{ label: "Événements à venir", count: evenementsCount, icon: <Calendar size={22} color="#c59b2e" />, color: "#c59b2e", href: "/gestion/evenements" }]
      : []),
    ...(canPages && pagesCount !== null
      ? [{ label: "Pages publiées", count: pagesCount, icon: <FileText size={22} color="#7c3aed" />, color: "#7c3aed", href: "/gestion/pages" }]
      : []),
  ];

  const quickActions = [
    ...(canContenus ? [
      { label: "Créer une annonce", href: "/gestion/annonces?action=nouveau", color: "#0891b2", bg: "#eff6ff" },
      { label: "Ajouter un événement", href: "/gestion/evenements?action=nouveau", color: "#c59b2e", bg: "#fffbeb" },
    ] : []),
    ...(canMembres ? [
      { label: "Gérer les membres", href: "/gestion/membres", color: "#1e3a8a", bg: "#f0f9ff" },
    ] : []),
    ...(canPages ? [
      { label: "Modifier les pages", href: "/gestion/pages", color: "#7c3aed", bg: "#faf5ff" },
      { label: "Paramètres du site", href: "/gestion/apparence", color: "#64748b", bg: "#f8fafc" },
    ] : []),
  ].slice(0, 4);

  return (
    <div style={{ padding: "2rem", maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Tableau de bord
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Vue d&apos;ensemble de votre espace de gestion
        </p>
      </div>

      {/* Stat cards */}
      {stats.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 36 }}>
          {stats.map((s) => (
            <Link key={s.label} href={s.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "white", borderRadius: 14, padding: "1.5rem",
                border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                cursor: "pointer", transition: "box-shadow 0.15s",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 13, color: "#64748b", marginBottom: 6, fontWeight: 500 }}>{s.label}</div>
                    <div style={{ fontSize: 40, fontWeight: 900, color: s.color, lineHeight: 1.1 }}>
                      {s.count.toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <div style={{ opacity: 0.7 }}>{s.icon}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Main grid: recent content + quick actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Recent annonces */}
        {canContenus && (
          <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: 0 }}>Annonces récentes</h2>
              <Link href="/gestion/annonces" style={{ fontSize: 12, color: "#1e3a8a", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                Voir tout <ChevronRight size={13} />
              </Link>
            </div>
            {recentAnnonces.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucune annonce pour l&apos;instant.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {recentAnnonces.map((a) => (
                  <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <span style={{ fontSize: 13, color: "#0f172a", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 }}>
                      {a.titre}
                    </span>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 100, flexShrink: 0,
                      background: (a as { statutContenu?: string }).statutContenu === "publie" ? "#dcfce7"
                        : (a as { statutContenu?: string }).statutContenu === "en_attente" ? "#fef9c3"
                        : (a as { statutContenu?: string }).statutContenu === "rejete" ? "#fee2e2"
                        : "#f1f5f9",
                      color: (a as { statutContenu?: string }).statutContenu === "publie" ? "#15803d"
                        : (a as { statutContenu?: string }).statutContenu === "en_attente" ? "#a16207"
                        : (a as { statutContenu?: string }).statutContenu === "rejete" ? "#b91c1c"
                        : "#64748b",
                      fontWeight: 600,
                    }}>
                      {{
                        publie: "Publiée",
                        en_attente: "En attente",
                        rejete: "Rejetée",
                        brouillon: "Brouillon",
                      }[(a as { statutContenu?: string }).statutContenu ?? "brouillon"] ?? "Brouillon"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upcoming events */}
        {canContenus && (
          <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: 0 }}>Prochains événements</h2>
              <Link href="/gestion/evenements" style={{ fontSize: 12, color: "#1e3a8a", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                Voir tout <ChevronRight size={13} />
              </Link>
            </div>
            {prochainEvenements.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: 14 }}>Aucun événement à venir.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {prochainEvenements.map((e) => (
                  <div key={e.id} style={{ padding: "8px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{e.titre}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                      <Calendar size={11} color="#94a3b8" />
                      {new Date(e.dateDebut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                      {e.lieu && <><span style={{ color: "#cbd5e1" }}>—</span><MapPin size={11} color="#94a3b8" />{e.lieu}</>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Quick actions */}
        {quickActions.length > 0 && (
          <div style={{ background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0", gridColumn: canContenus ? "1 / -1" : "auto" }}>
            <h2 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: "0 0 16px" }}>
              Actions rapides
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: "14px 16px", borderRadius: 10,
                    background: action.bg, color: action.color,
                    fontSize: 13, fontWeight: 700, textDecoration: "none",
                    border: `1.5px solid ${action.color}22`,
                    textAlign: "center",
                  }}
                >
                  {action.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent activity section */}
      <div style={{ marginTop: 24, background: "white", borderRadius: 14, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", margin: 0 }}>
            Activité récente
          </h2>
          <Link href="/gestion/journal" style={{ fontSize: 12, color: "#1e3a8a", textDecoration: "none", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
            Voir le journal complet <ChevronRight size={13} />
          </Link>
        </div>
        {recentActivity.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14 }}>
            Aucune activité enregistrée. Les actions importantes apparaîtront ici.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
            {recentActivity.map((log) => {
              const ac = ACTIVITY_COLORS[log.action] ?? { bg: "#f1f5f9", color: "#64748b" };
              return (
                <div key={log.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: ac.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <EntityIcon type={log.entiteType} color={ac.color} size={14} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: "#0f172a", lineHeight: 1.4 }}>
                      <strong>{log.acteurNom}</strong>{" "}
                      <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: 99, fontSize: 10, fontWeight: 700, background: ac.bg, color: ac.color }}>
                        {ACTION_LABELS[log.action] ?? log.action}
                      </span>
                      {log.entiteLabel && (
                        <span style={{ color: "#1e3a8a", fontWeight: 600 }}> {log.entiteLabel}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>
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
    </div>
  );
}
