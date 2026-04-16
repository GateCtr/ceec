import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdminPlatteforme } from "@/lib/auth/rbac";
import { enrichMembresWithRolesMultiChurch } from "@/lib/membre-role";
import AdminMembresClient from "@/components/admin/AdminMembresClient";

export const metadata = { title: "Gestion des Membres | CEEC Admin" };

export default async function AdminMembresPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isAdminPlatteforme(userId)) redirect("/admin");

  const platformAdminIds = await prisma.userRole.findMany({
    where: { egliseId: null },
    select: { clerkUserId: true },
  });
  const excludedClerkIds = platformAdminIds.map((r) => r.clerkUserId);

  const [membresList, eglisesList] = await Promise.all([
    prisma.membre.findMany({
      where: excludedClerkIds.length > 0
        ? { clerkUserId: { notIn: excludedClerkIds } }
        : undefined,
      include: { eglise: true },
      orderBy: { nom: "asc" },
    }),
    prisma.eglise.findMany({ orderBy: { nom: "asc" } }),
  ]);

  const membresEnrichis = await enrichMembresWithRolesMultiChurch(membresList);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Membres & Fidèles
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          {membresEnrichis.length} membre{membresEnrichis.length !== 1 ? "s" : ""} au total
        </p>
      </div>
      <AdminMembresClient initialMembres={membresEnrichis} paroissesList={eglisesList} />
    </div>
  );
}
