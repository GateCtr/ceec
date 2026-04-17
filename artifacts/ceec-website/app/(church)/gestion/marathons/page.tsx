import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionMarathonsClient from "@/components/gestion/GestionMarathonsClient";

export const metadata = { title: "Marathons | Gestion" };

export default async function GestionMarathonsPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_creer_evenement", egliseId);
  if (!allowed) redirect("/c?error=acces-refuse");

  return <GestionMarathonsClient egliseId={egliseId} />;
}
