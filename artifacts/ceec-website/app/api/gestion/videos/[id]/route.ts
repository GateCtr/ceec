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
    const videoId = parseInt(id, 10);
    if (isNaN(videoId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_annonces", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const existing = await prisma.liveStream.findFirst({ where: { id: videoId, egliseId } });
    if (!existing) return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });

    const body = await req.json();
    const video = await prisma.liveStream.update({
      where: { id: videoId },
      data: {
        ...(body.titre !== undefined && { titre: body.titre }),
        ...(body.urlYoutube !== undefined && { urlYoutube: body.urlYoutube }),
        ...(body.description !== undefined && { description: body.description || null }),
        ...(body.dateStream !== undefined && { dateStream: body.dateStream ? new Date(body.dateStream) : null }),
        ...(body.estEnDirect !== undefined && { estEnDirect: body.estEnDirect }),
        ...(body.epingle !== undefined && { epingle: body.epingle }),
        ...(body.publie !== undefined && { publie: body.publie }),
      },
    });
    return NextResponse.json(video);
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
    const videoId = parseInt(id, 10);
    if (isNaN(videoId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_annonces", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const existing = await prisma.liveStream.findFirst({ where: { id: videoId, egliseId } });
    if (!existing) return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });

    await prisma.liveStream.delete({ where: { id: videoId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
