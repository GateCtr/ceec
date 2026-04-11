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

    const sections = await prisma.sectionPage.findMany({
      where: { page: { egliseId: eglise.id } },
      include: { page: { select: { id: true, titre: true, slug: true } } },
      orderBy: [{ page: { ordre: "asc" } }, { ordre: "asc" }],
    });
    return NextResponse.json(sections);
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
    if (!body.pageId) return NextResponse.json({ error: "pageId requis" }, { status: 400 });
    if (!body.type?.trim()) return NextResponse.json({ error: "Type de section requis" }, { status: 400 });

    const page = await prisma.pageEglise.findFirst({ where: { id: body.pageId, egliseId: eglise.id } });
    if (!page) return NextResponse.json({ error: "Page introuvable" }, { status: 404 });

    const maxOrdre = await prisma.sectionPage.aggregate({ where: { pageId: body.pageId }, _max: { ordre: true } });

    const section = await prisma.sectionPage.create({
      data: {
        pageId: body.pageId,
        type: body.type.trim(),
        ordre: (maxOrdre._max.ordre ?? -1) + 1,
        config: body.config ?? {},
      },
      include: { page: { select: { id: true, titre: true, slug: true } } },
    });
    return NextResponse.json(section, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
