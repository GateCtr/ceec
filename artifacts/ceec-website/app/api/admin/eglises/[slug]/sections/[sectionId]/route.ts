import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { isAdminPlatteforme } from "@/lib/auth/rbac";

type Params = { params: Promise<{ slug: string; sectionId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isAdminPlatteforme(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, sectionId } = await params;
    const sId = parseInt(sectionId, 10);
    if (isNaN(sId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.sectionPage.findFirst({
      where: { id: sId, page: { egliseId: eglise.id } },
    });
    if (!existing) return NextResponse.json({ error: "Section introuvable" }, { status: 404 });

    const body = await req.json();
    const section = await prisma.sectionPage.update({
      where: { id: sId },
      data: {
        ...(body.ordre !== undefined && { ordre: body.ordre }),
        ...(body.config !== undefined && { config: body.config }),
      },
    });
    return NextResponse.json(section);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isAdminPlatteforme(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, sectionId } = await params;
    const sId = parseInt(sectionId, 10);
    if (isNaN(sId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.sectionPage.findFirst({
      where: { id: sId, page: { egliseId: eglise.id } },
    });
    if (!existing) return NextResponse.json({ error: "Section introuvable" }, { status: 404 });

    await prisma.sectionPage.delete({ where: { id: sId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
