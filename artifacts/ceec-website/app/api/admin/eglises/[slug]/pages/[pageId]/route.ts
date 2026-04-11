import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { isPlatformAdmin } from "@/lib/auth/rbac";

type Params = { params: Promise<{ slug: string; pageId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isPlatformAdmin(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, pageId } = await params;
    const pId = parseInt(pageId, 10);
    if (isNaN(pId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.pageEglise.findFirst({ where: { id: pId, egliseId: eglise.id } });
    if (!existing) return NextResponse.json({ error: "Page introuvable" }, { status: 404 });

    const body = await req.json();
    const page = await prisma.pageEglise.update({
      where: { id: pId },
      data: { ...(body.publie !== undefined && { publie: body.publie }) },
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
    if (!await isPlatformAdmin(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug, pageId } = await params;
    const pId = parseInt(pageId, 10);
    if (isNaN(pId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const existing = await prisma.pageEglise.findFirst({ where: { id: pId, egliseId: eglise.id } });
    if (!existing) return NextResponse.json({ error: "Page introuvable" }, { status: 404 });

    await prisma.pageEglise.delete({ where: { id: pId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
