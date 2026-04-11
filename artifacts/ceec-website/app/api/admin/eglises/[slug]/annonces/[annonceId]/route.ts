import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { isPlatformAdmin } from "@/lib/auth/rbac";

type Params = { params: Promise<{ slug: string; annonceId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isPlatformAdmin(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, annonceId } = await params;
    const aId = parseInt(annonceId, 10);
    if (isNaN(aId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.annonce.findFirst({ where: { id: aId, egliseId: eglise.id } });
    if (!existing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });

    const body = await req.json();
    const annonce = await prisma.annonce.update({
      where: { id: aId },
      data: {
        ...(body.publie !== undefined && { publie: body.publie }),
        ...(body.titre !== undefined && { titre: body.titre }),
        ...(body.contenu !== undefined && { contenu: body.contenu }),
        ...(body.priorite !== undefined && { priorite: body.priorite }),
      },
    });
    return NextResponse.json(annonce);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isPlatformAdmin(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, annonceId } = await params;
    const aId = parseInt(annonceId, 10);
    if (isNaN(aId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.annonce.findFirst({ where: { id: aId, egliseId: eglise.id } });
    if (!existing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });

    await prisma.annonce.delete({ where: { id: aId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
