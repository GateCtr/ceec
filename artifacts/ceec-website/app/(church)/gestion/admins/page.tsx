import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionAdminsClient from "@/components/gestion/GestionAdminsClient";

export const metadata = { title: "Admins | Gestion" };

export default async function GestionAdminsPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_roles", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const churchStaffRoles = ["admin_eglise", "pasteur", "diacre", "secretaire", "tresorier"];

  const [userRoles, pendingInvites] = await Promise.all([
    prisma.userRole.findMany({
      where: {
        egliseId,
        role: { nom: { in: churchStaffRoles } },
      },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.inviteToken.findMany({
      where: {
        egliseId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Admins de l&apos;église</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          Gérez les accès administrateurs et membres du personnel
        </p>
      </div>
      <GestionAdminsClient
        initialUserRoles={userRoles.map((ur) => ({
          id: ur.id,
          clerkUserId: ur.clerkUserId,
          roleNom: ur.role.nom,
          createdAt: ur.createdAt.toISOString(),
        }))}
        pendingInvites={pendingInvites.map((inv) => ({
          id: inv.id,
          email: inv.email,
          token: inv.token,
          roleNom: inv.role?.nom ?? "fidele",
          expiresAt: inv.expiresAt.toISOString(),
        }))}
        currentUserId={userId}
      />
    </div>
  );
}
