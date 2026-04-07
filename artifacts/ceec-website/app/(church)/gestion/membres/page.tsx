import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionMembresClient from "@/components/gestion/GestionMembresClient";

export const metadata = { title: "Membres | Gestion" };

export default async function GestionMembresPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "membres:manage", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const membres = await prisma.membre.findMany({
    where: { egliseId },
    orderBy: { nom: "asc" },
  });

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Membres</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>
          {membres.length} membre{membres.length !== 1 ? "s" : ""} inscrit{membres.length !== 1 ? "s" : ""}
        </p>
      </div>
      <GestionMembresClient initialMembres={membres} />
    </div>
  );
}
