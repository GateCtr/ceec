import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSuperAdmin, hasAnyAdminRole } from "@/lib/auth/rbac";
import AdminMembresClient from "@/components/admin/AdminMembresClient";

async function isAdminUser(userId: string): Promise<boolean> {
  if (await isSuperAdmin(userId)) return true;
  return hasAnyAdminRole(userId);
}

export const metadata = { title: "Gestion des Membres | CEEC Admin" };

export default async function AdminMembresPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isAdminUser(userId)) redirect("/dashboard");

  const [membresList, eglisesList] = await Promise.all([
    prisma.membre.findMany({
      include: { eglise: true },
      orderBy: { nom: "asc" },
    }),
    prisma.eglise.findMany({ orderBy: { nom: "asc" } }),
  ]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Membres & Fidèles
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          {membresList.length} membre{membresList.length !== 1 ? "s" : ""} au total
        </p>
      </div>
      <AdminMembresClient initialMembres={membresList} paroissesList={eglisesList} />
    </div>
  );
}
