import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db/index";
import { isAdminPlatteforme } from "@/lib/auth/rbac";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isAdminPlatteforme(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug } = await params;
    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const pages = await prisma.pageEglise.findMany({
      where: { egliseId: eglise.id },
      orderBy: { ordre: "asc" },
      include: { _count: { select: { sections: true } } },
    });
    return NextResponse.json(pages);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!await isAdminPlatteforme(userId)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug } = await params;
    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const body = await req.json();
    if (!body.titre?.trim()) return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    if (!body.slug?.trim()) return NextResponse.json({ error: "Slug requis" }, { status: 400 });

    const maxOrdre = await prisma.pageEglise.aggregate({ where: { egliseId: eglise.id }, _max: { ordre: true } });

    const page = await prisma.pageEglise.create({
      data: {
        egliseId: eglise.id,
        titre: body.titre.trim(),
        slug: body.slug.trim(),
        type: body.type ?? "custom",
        publie: body.publie ?? false,
        ordre: (maxOrdre._max.ordre ?? -1) + 1,
      },
    });
    return NextResponse.json(page, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
