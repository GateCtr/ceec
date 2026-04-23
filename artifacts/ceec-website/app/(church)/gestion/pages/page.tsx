import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionPagesClient from "@/components/gestion/GestionPagesClient";

export const metadata = { title: "Pages | Gestion" };

export default async function GestionPagesPage() {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const allPages = await prisma.pageEglise.findMany({
    where: { egliseId },
    orderBy: { ordre: "asc" },
    include: { _count: { select: { sections: true } } },
  });

  const homePage = allPages.find((p) => p.type === "accueil") ?? null;
  const otherPages = allPages.filter((p) => p.type !== "accueil");

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>Pages du site</h1>
        <p style={{ color: "#64748b", marginTop: 4, fontSize: 14 }}>Gérez la page d&apos;accueil et les pages personnalisées de votre site public</p>
      </div>
      <GestionPagesClient
        initialPages={otherPages.map((p) => ({ ...p, sectionsCount: p._count.sections }))}
        homePage={homePage ? { ...homePage, sectionsCount: homePage._count.sections } : null}
      />
    </div>
  );
}
