import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, hasAutoPublishRole } from "@/lib/auth/rbac";
import GestionEvenementsClient from "@/components/gestion/GestionEvenementsClient";

export const metadata = { title: "Événements | Gestion" };

export default async function GestionEvenementsPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
  if (!allowed) redirect("/c?error=acces-refuse");

  const [evenements, canAutoPublish] = await Promise.all([
    prisma.evenement.findMany({
      where: { egliseId },
      orderBy: { dateDebut: "asc" },
    }),
    hasAutoPublishRole(userId, egliseId),
  ]);

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Événements</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Gérez les événements de votre église</p>
      </div>
      <GestionEvenementsClient initialEvenements={evenements} canAutoPublish={canAutoPublish} />
    </div>
  );
}
