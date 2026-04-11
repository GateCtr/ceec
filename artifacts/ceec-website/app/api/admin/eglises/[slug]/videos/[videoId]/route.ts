import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { isAdminPlatteforme } from "@/lib/auth/rbac";

type Params = { params: Promise<{ slug: string; videoId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isAdminPlatteforme(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, videoId } = await params;
    const vId = parseInt(videoId, 10);
    if (isNaN(vId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.liveStream.findFirst({ where: { id: vId, egliseId: eglise.id } });
    if (!existing) return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });

    const body = await req.json();
    const video = await prisma.liveStream.update({
      where: { id: vId },
      data: {
        ...(body.publie !== undefined && { publie: body.publie }),
        ...(body.epingle !== undefined && { epingle: body.epingle }),
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
    if (!await isAdminPlatteforme(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, videoId } = await params;
    const vId = parseInt(videoId, 10);
    if (isNaN(vId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.liveStream.findFirst({ where: { id: vId, egliseId: eglise.id } });
    if (!existing) return NextResponse.json({ error: "Vidéo introuvable" }, { status: 404 });

    await prisma.liveStream.delete({ where: { id: vId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
