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

    const videos = await prisma.liveStream.findMany({
      where: { egliseId: eglise.id },
      orderBy: [{ epingle: "desc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(videos);
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
    if (!body.urlYoutube?.trim()) return NextResponse.json({ error: "URL YouTube requise" }, { status: 400 });

    const video = await prisma.liveStream.create({
      data: {
        egliseId: eglise.id,
        titre: body.titre.trim(),
        urlYoutube: body.urlYoutube.trim(),
        description: body.description ?? null,
        publie: body.publie ?? false,
        epingle: body.epingle ?? false,
        estEnDirect: body.estEnDirect ?? false,
        dateStream: body.dateStream ? new Date(body.dateStream) : null,
      },
    });
    return NextResponse.json(video, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
