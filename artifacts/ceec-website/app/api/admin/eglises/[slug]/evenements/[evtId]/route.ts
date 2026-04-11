import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { isAdminPlatteforme } from "@/lib/auth/rbac";

type Params = { params: Promise<{ slug: string; evtId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isAdminPlatteforme(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, evtId } = await params;
    const eId = parseInt(evtId, 10);
    if (isNaN(eId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.evenement.findFirst({ where: { id: eId, egliseId: eglise.id } });
    if (!existing) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });

    const body = await req.json();
    const evt = await prisma.evenement.update({
      where: { id: eId },
      data: {
        ...(body.publie !== undefined && { publie: body.publie }),
        ...(body.titre !== undefined && { titre: body.titre }),
      },
    });
    return NextResponse.json(evt);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isAdminPlatteforme(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, evtId } = await params;
    const eId = parseInt(evtId, 10);
    if (isNaN(eId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.evenement.findFirst({ where: { id: eId, egliseId: eglise.id } });
    if (!existing) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });

    await prisma.evenement.delete({ where: { id: eId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
