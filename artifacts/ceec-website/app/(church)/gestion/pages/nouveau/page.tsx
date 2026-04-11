import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionNouvellePageClient from "@/components/gestion/GestionNouvellePageClient";

export const metadata = { title: "Nouvelle page | Gestion" };

export default async function GestionNouvellePagePage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  return (
    <div style={{ padding: "2rem", maxWidth: 700 }}>
      <GestionNouvellePageClient />
    </div>
  );
}
