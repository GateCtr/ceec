import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionMarathonDetailClient from "@/components/gestion/GestionMarathonDetailClient";

export const metadata = { title: "Détail Marathon | Gestion" };

export default async function GestionMarathonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_creer_evenement", egliseId);
  if (!allowed) redirect("/c?error=acces-refuse");

  const { id } = await params;

  return <GestionMarathonDetailClient marathonId={parseInt(id, 10)} egliseId={egliseId} />;
}
