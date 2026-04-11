import { headers } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import GestionPageDetailClient from "@/components/gestion/GestionPageDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  try {
    const page = await prisma.pageEglise.findUnique({ where: { id: parseInt(id, 10) }, select: { titre: true } });
    return { title: `Sections — ${page?.titre ?? "Page"} | Gestion` };
  } catch { return { title: "Sections | Gestion" }; }
}

export default async function GestionPageSectionsPage({ params }: Props) {
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

  const page = await prisma.pageEglise.findFirst({
    where: { id: pageId, egliseId },
    include: { sections: { orderBy: { ordre: "asc" } } },
  });
  if (!page) notFound();

  return (
    <div style={{ padding: "2rem", maxWidth: 900 }}>
      <Link
        href="/gestion/pages"
        style={{ color: "#64748b", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 20 }}
      >
        ← Retour aux pages
      </Link>
      <GestionPageDetailClient
        page={{
          ...page,
          sections: page.sections.map((s) => ({
            ...s,
            config: (s.config ?? {}) as Record<string, unknown>,
          })),
        }}
      />
    </div>
  );
}
