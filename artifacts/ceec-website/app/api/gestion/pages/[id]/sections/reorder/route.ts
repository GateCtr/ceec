import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseIdHeader = req.headers.get("x-eglise-id");
    if (!egliseIdHeader) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    const egliseId = parseInt(egliseIdHeader, 10);
    if (isNaN(egliseId)) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || (await hasPermission(userId, "eglise_gerer_config", egliseId));
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const page = await prisma.pageEglise.findFirst({ where: { id: pageId, egliseId } });
    if (!page) return NextResponse.json({ error: "Page introuvable" }, { status: 404 });

    const body = await req.json();
    const sectionIds: number[] = body.sectionIds;
    if (!Array.isArray(sectionIds) || sectionIds.some((id) => typeof id !== "number")) {
      return NextResponse.json({ error: "sectionIds requis (tableau de nombres)" }, { status: 400 });
    }

    await prisma.$transaction(
      sectionIds.map((sectionId, idx) =>
        prisma.sectionPage.updateMany({
          where: { id: sectionId, pageId },
          data: { ordre: idx + 1 },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
