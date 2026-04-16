import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSuperAdmin, PLATFORM_ROLES, ROLES } from "@/lib/auth/rbac";
import AdminUtilisateursClient from "@/components/admin/AdminUtilisateursClient";
import { Info } from "lucide-react";

export const metadata = { title: "Utilisateurs Admin | CEEC" };

export default async function AdminUtilisateursPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!(await isSuperAdmin(userId))) redirect("/admin");

  const platformUserRoles = await prisma.userRole.findMany({
    where: { role: { nom: { in: Array.from(PLATFORM_ROLES) } } },
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });

  const clerkIds = [...new Set(platformUserRoles.map((ur) => ur.clerkUserId))];
  const membresMap = await prisma.membre.findMany({
    where: { clerkUserId: { in: clerkIds } },
    select: { id: true, nom: true, prenom: true, email: true, clerkUserId: true },
  });
  const membreByClerk = Object.fromEntries(membresMap.map((m) => [m.clerkUserId, m]));

  const allMembres = await prisma.membre.findMany({
    select: { id: true, nom: true, prenom: true, email: true, clerkUserId: true },
    orderBy: { nom: "asc" },
  });

  const users = platformUserRoles.map((ur) => {
    const m = membreByClerk[ur.clerkUserId];
    return {
      id: ur.id,
      clerkUserId: ur.clerkUserId,
      roleNom: ur.role.nom,
      roleLabel:
        ur.role.nom === ROLES.SUPER_ADMIN
          ? "Super Administrateur"
          : ur.role.nom === ROLES.ADMIN_PLATEFORME
          ? "Administrateur Plateforme"
          : "Modérateur Plateforme",
      nom: m?.nom ?? null,
      prenom: m?.prenom ?? null,
      email: m?.email ?? null,
      assignedAt: ur.createdAt?.toISOString() ?? null,
    };
  });

  const membresOptions = allMembres.map((m) => ({
    id: m.id,
    clerkUserId: m.clerkUserId,
    nom: m.nom,
    prenom: m.prenom,
    email: m.email ?? "",
  }));

  return (
    <div style={{ padding: "2rem", maxWidth: 920, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Utilisateurs administrateurs
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Gérez les rôles d&apos;administration de la plateforme CEEC
        </p>
      </div>

      <div
        style={{
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 12,
          padding: "14px 18px",
          marginBottom: 28,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <span style={{ flexShrink: 0, color: "#1e40af" }}><Info size={18} /></span>
        <div style={{ fontSize: 13, color: "#1e40af", lineHeight: 1.55 }}>
          <strong>Admin Plateforme</strong> — accès complet (églises, membres, contenu, invitations) sans pouvoir modifier la configuration système.
          <br />
          <strong>Modérateur Plateforme</strong> — accès limité : modération du contenu (annonces, événements) et journal d&apos;activité uniquement.
        </div>
      </div>

      <AdminUtilisateursClient initialUsers={users} membres={membresOptions} />
    </div>
  );
}
