import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionPageDetailClient from "@/components/gestion/GestionPageDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const page = await prisma.pageEglise.findUnique({ where: { id: parseInt(id, 10) }, select: { titre: true } });
    return { title: `${page?.titre ?? "Page"} | Gestion` };
  } catch { return { title: "Page | Gestion" }; }
}

export default async function GestionPageDetailPage({ params }: Props) {
  const headersList = await headers();
  const egliseIdHeader = headersList.get("x-eglise-id");
  if (!egliseIdHeader) redirect("/c");
  const egliseId = parseInt(egliseIdHeader, 10);

  const { userId } = await auth();
  if (!userId) redirect("/c/connexion");

  const superAdmin = await isSuperAdmin(userId);
  const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
  if (!allowed) redirect("/gestion?error=acces-refuse");

  const { id } = await params;
  const pageId = parseInt(id, 10);
  if (isNaN(pageId)) notFound();

  const [page, eglise] = await Promise.all([
    prisma.pageEglise.findFirst({
      where: { id: pageId, egliseId },
      include: { sections: { orderBy: { ordre: "asc" } } },
    }),
    prisma.eglise.findUnique({ where: { id: egliseId }, select: { slug: true } }),
  ]);
  if (!page) notFound();

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <GestionPageDetailClient
        egliseSlug={eglise?.slug ?? ""}
        page={{
          ...page,
          sections: page.sections.map(s => ({
            ...s,
            config: (s.config ?? {}) as Record<string, unknown>,
          })),
        }}
      />
    </div>
  );
}
