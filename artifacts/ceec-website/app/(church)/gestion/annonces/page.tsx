import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionAnnoncesClient from "@/components/gestion/GestionAnnoncesClient";

export const metadata = { title: "Annonces | Gestion" };

export default async function GestionAnnoncesPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const annonces = await prisma.annonce.findMany({
    where: { egliseId },
    orderBy: { datePublication: "desc" },
  });

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Annonces</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Gérez les annonces de votre église</p>
      </div>
      <GestionAnnoncesClient initialAnnonces={annonces} />
    </div>
  );
}
