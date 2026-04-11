import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionApparenceClient from "@/components/gestion/GestionApparenceClient";

export const metadata = { title: "Apparence | Gestion" };

export default async function GestionApparencePage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const config = await prisma.egliseConfig.findUnique({ where: { egliseId } });

  return (
    <div style={{ padding: "2rem", maxWidth: 800 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Apparence et branding</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Personnalisez les couleurs, le favicon et les réseaux sociaux de votre site</p>
      </div>
      <GestionApparenceClient initialConfig={config} />
    </div>
  );
}
