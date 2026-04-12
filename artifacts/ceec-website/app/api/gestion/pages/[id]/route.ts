import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const { id } = await params;
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const page = await prisma.pageEglise.findFirst({
      where: { id: pageId, egliseId },
      include: { sections: { orderBy: { ordre: "asc" } } },
    });
    if (!page) return NextResponse.json({ error: "Page introuvable" }, { status: 404 });
    return NextResponse.json(page);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const { id } = await params;
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const existing = await prisma.pageEglise.findFirst({ where: { id: pageId, egliseId } });
    if (!existing) return NextResponse.json({ error: "Page introuvable" }, { status: 404 });

    const body = await req.json();
    const page = await prisma.pageEglise.update({
      where: { id: pageId },
      data: {
        ...(body.titre !== undefined && { titre: body.titre }),
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.publie !== undefined && { publie: body.publie }),
        ...(body.ordre !== undefined && { ordre: body.ordre }),
      },
    });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "modifier",
      entiteType: "page",
      entiteId: page.id,
      entiteLabel: page.titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json(page);
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
    const pageId = parseInt(id, 10);
    if (isNaN(pageId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_config", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const existing = await prisma.pageEglise.findFirst({ where: { id: pageId, egliseId } });
    if (!existing) return NextResponse.json({ error: "Page introuvable" }, { status: 404 });

    const titre = existing.titre;
    await prisma.pageEglise.delete({ where: { id: pageId } });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "supprimer",
      entiteType: "page",
      entiteId: pageId,
      entiteLabel: titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
