import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import AdminEglisesClient from "@/components/admin/AdminEglisesClient";

export const metadata = { title: "Gestion des Églises | CEEC Admin" };

export default async function AdminEglisesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isSuperAdmin(userId)) redirect("/sign-in");

  const eglises = await prisma.eglise.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { membres: true } },
      inviteTokens: {
        where: { usedAt: null, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const eglisesData = eglises.map((e) => ({
    id: e.id,
    nom: e.nom,
    slug: e.slug,
    ville: e.ville,
    statut: e.statut,
    createdAt: e.createdAt.toISOString(),
    membresCount: e._count.membres,
    hasInvitePending: e.inviteTokens.length > 0,
  }));

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
            Gestion des Églises
          </h1>
          <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
            {eglises.length} église{eglises.length !== 1 ? "s" : ""} enregistrée{eglises.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/eglises/nouveau"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#c59b2e", color: "white", padding: "10px 20px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 14 }}
        >
          + Ajouter une église
        </Link>
      </div>
      <AdminEglisesClient initialEglises={eglisesData} />
    </div>
  );
}
