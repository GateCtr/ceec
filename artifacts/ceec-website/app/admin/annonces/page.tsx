import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isSuperAdmin, hasAnyAdminRole } from "@/lib/auth/rbac";
import AdminAnnoncesClient from "@/components/admin/AdminAnnoncesClient";

async function isAdminUser(userId: string): Promise<boolean> {
  if (await isSuperAdmin(userId)) return true;
  return hasAnyAdminRole(userId);
}

export const metadata = { title: "Gestion des Annonces | CEEC Admin" };

export default async function AdminAnnoncesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  if (!await isAdminUser(userId)) redirect("/sign-in");

  const [annoncesList, eglisesList] = await Promise.all([
    prisma.annonce.findMany({ orderBy: { datePublication: "desc" } }),
    prisma.eglise.findMany({ orderBy: { nom: "asc" } }),
  ]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
          Gestion des Annonces
        </h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          {annoncesList.length} annonce{annoncesList.length !== 1 ? "s" : ""} au total
        </p>
      </div>
      <AdminAnnoncesClient initialAnnonces={annoncesList} paroissesList={eglisesList} />
    </div>
  );
}
