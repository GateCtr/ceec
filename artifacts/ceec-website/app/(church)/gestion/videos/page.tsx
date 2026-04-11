import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionVideosClient from "@/components/gestion/GestionVideosClient";

export const metadata = { title: "Vidéos | Gestion" };

export default async function GestionVideosPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_annonces", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const videos = await prisma.liveStream.findMany({
    where: { egliseId },
    orderBy: [{ epingle: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Vidéos YouTube</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Gérez les lives et replays YouTube affichés sur votre site</p>
      </div>
      <GestionVideosClient initialVideos={videos} />
    </div>
  );
}
