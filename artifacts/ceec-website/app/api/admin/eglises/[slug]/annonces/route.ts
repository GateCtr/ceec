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

    const annonces = await prisma.annonce.findMany({
      where: { egliseId: eglise.id },
      orderBy: [{ priorite: "asc" }, { datePublication: "desc" }],
    });
    return NextResponse.json(annonces);
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

    const annonce = await prisma.annonce.create({
      data: {
        egliseId: eglise.id,
        titre: body.titre.trim(),
        contenu: body.contenu ?? "",
        priorite: body.priorite ?? "normale",
        publie: body.publie ?? false,
        imageUrl: body.imageUrl ?? null,
        categorie: body.categorie ?? null,
        datePublication: body.datePublication ? new Date(body.datePublication) : new Date(),
      },
    });
    return NextResponse.json(annonce, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
