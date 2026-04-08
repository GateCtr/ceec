import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import AdminEgliseDetailClient from "@/components/admin/AdminEgliseDetailClient";

export const metadata = { title: "Détail Église | CEEC Admin" };

const statutLabels: Record<string, { label: string; color: string; bg: string }> = {
  actif: { label: "Actif", color: "#15803d", bg: "#dcfce7" },
  en_attente: { label: "En attente", color: "#b45309", bg: "#fef3c7" },
  suspendu: { label: "Suspendu", color: "#b91c1c", bg: "#fee2e2" },
};

export default async function AdminEgliseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isSuperAdmin(userId)) redirect("/dashboard?error=acces-refuse");

  const { slug } = await params;

  const [eglise, membres] = await Promise.all([
    prisma.eglise.findUnique({
      where: { slug },
      include: {
        _count: { select: { membres: true, annonces: true, evenements: true } },
        userRoles: {
          include: { role: true },
          where: { role: { nom: { in: ["admin_eglise", "moderateur"] } } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.membre.findMany({
      where: { eglise: { slug } },
      orderBy: { nom: "asc" },
      select: { id: true, nom: true, prenom: true, email: true, role: true, statut: true, dateAdhesion: true },
    }),
  ]);

  if (!eglise) notFound();

  const statut = statutLabels[eglise.statut] ?? statutLabels.en_attente;

  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
      <Link
        href="/admin/eglises"
        style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}
      >
        ← Toutes les églises
      </Link>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>{eglise.nom}</h1>
            <span style={{ background: statut.bg, color: statut.color, padding: "3px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700 }}>
              {statut.label}
            </span>
          </div>
          <div style={{ color: "#64748b", fontSize: 14, display: "flex", gap: 20, flexWrap: "wrap" }}>
            <span>📍 {eglise.ville}</span>
            {eglise.slug && <span>🔗 {eglise.slug}</span>}
            {eglise.pasteur && <span>👤 {eglise.pasteur}</span>}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Membres", count: eglise._count.membres, icon: "👥", color: "#1e3a8a" },
          { label: "Annonces", count: eglise._count.annonces, icon: "📢", color: "#0891b2" },
          { label: "Événements", count: eglise._count.evenements, icon: "🗓️", color: "#c59b2e" },
        ].map((s) => (
          <div key={s.label} style={{ background: "white", borderRadius: 12, padding: "1.25rem", border: "1px solid #e2e8f0", boxShadow: "0 2px 6px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{s.label}</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.count}</div>
              </div>
              <span style={{ fontSize: 24 }}>{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <AdminEgliseDetailClient
        eglise={{
          id: eglise.id,
          nom: eglise.nom,
          slug: eglise.slug ?? "",
          statut: eglise.statut,
          email: eglise.email,
          telephone: eglise.telephone,
          description: eglise.description,
          adresse: eglise.adresse,
        }}
        admins={eglise.userRoles.map((ur) => ({
          id: ur.id,
          clerkUserId: ur.clerkUserId,
          roleNom: ur.role.nom,
          createdAt: ur.createdAt.toISOString(),
        }))}
        membres={membres.map((m) => ({
          id: m.id,
          nom: m.nom,
          prenom: m.prenom,
          email: m.email,
          role: m.role,
          statut: m.statut,
          dateAdhesion: m.dateAdhesion ? m.dateAdhesion.toISOString() : null,
        }))}
      />
    </div>
  );
}
