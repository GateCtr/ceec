import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionParametresClient from "@/components/gestion/GestionParametresClient";

export const metadata = { title: "Paramètres | Gestion" };

export default async function GestionParametresPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const eglise = await prisma.eglise.findUnique({
    where: { id: egliseId },
    select: {
      id: true, nom: true, description: true, ville: true, adresse: true,
      telephone: true, email: true, pasteur: true, logoUrl: true, slug: true,
    },
  });

  if (!eglise) redirect("/c");

  return (
    <div style={{ padding: "2rem", maxWidth: 700 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Paramètres de l&apos;église</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Modifiez les informations publiques de votre église</p>
      </div>
      <GestionParametresClient eglise={eglise} />
    </div>
  );
}
