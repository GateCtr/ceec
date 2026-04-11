import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

type Params = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const { id } = await params;
    const sectionId = parseInt(id, 10);
    if (isNaN(sectionId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    // Verify section belongs to a page of this church
    const section = await prisma.sectionPage.findFirst({
      where: { id: sectionId, page: { egliseId } },
    });
    if (!section) return NextResponse.json({ error: "Section introuvable" }, { status: 404 });

    const body = await req.json();
    const updated = await prisma.sectionPage.update({
      where: { id: sectionId },
      data: {
        ...(body.config !== undefined && { config: body.config }),
        ...(body.ordre !== undefined && { ordre: body.ordre }),
        ...(body.type !== undefined && { type: body.type }),
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const { id } = await params;
    const sectionId = parseInt(id, 10);
    if (isNaN(sectionId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const section = await prisma.sectionPage.findFirst({
      where: { id: sectionId, page: { egliseId } },
    });
    if (!section) return NextResponse.json({ error: "Section introuvable" }, { status: 404 });

    await prisma.sectionPage.delete({ where: { id: sectionId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
