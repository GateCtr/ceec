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

    const evenements = await prisma.evenement.findMany({
      where: { egliseId: eglise.id },
      orderBy: { dateDebut: "asc" },
    });
    return NextResponse.json(evenements);
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
    if (!body.dateDebut) return NextResponse.json({ error: "Date de début requise" }, { status: 400 });

    const evt = await prisma.evenement.create({
      data: {
        egliseId: eglise.id,
        titre: body.titre.trim(),
        description: body.description ?? null,
        dateDebut: new Date(body.dateDebut),
        dateFin: body.dateFin ? new Date(body.dateFin) : null,
        lieu: body.lieu ?? null,
        publie: body.publie ?? false,
        imageUrl: body.imageUrl ?? null,
        categorie: body.categorie ?? null,
        lienInscription: body.lienInscription ?? null,
      },
    });
    return NextResponse.json(evt, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
