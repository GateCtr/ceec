import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { canManageContent, isSuperAdmin } from "@/lib/auth/rbac";

function parseId(id: string) {
  const n = parseInt(id, 10);
  return isNaN(n) ? null : n;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = parseId(id);
    if (!numId) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    const evt = await prisma.evenement.findUnique({
      where: { id: numId, statutContenu: "publie" as const },
    });
    if (!evt) return NextResponse.json({ error: "Non trouve" }, { status: 404 });
    return NextResponse.json(evt);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { id } = await params;
    const numId = parseId(id);
    if (!numId) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

    const existing = await prisma.evenement.findUnique({ where: { id: numId } });
    if (!existing) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

    if (!await canManageContent(userId, existing.egliseId ?? undefined)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const body = await req.json();
    const targetEgliseId = body.egliseId ?? body.paroisseId ?? existing.egliseId;

    if (targetEgliseId !== existing.egliseId) {
      if (!await isSuperAdmin(userId)) {
        return NextResponse.json({ error: "Seul un super admin peut deplacer un evenement vers une autre eglise" }, { status: 403 });
      }
    }

    const publie = body.publie ?? existing.publie;
    const updated = await prisma.evenement.update({
      where: { id: numId },
      data: {
        titre: body.titre,
        description: body.description ?? null,
        dateDebut: new Date(body.dateDebut),
        dateFin: body.dateFin ? new Date(body.dateFin) : null,
        lieu: body.lieu ?? null,
        egliseId: targetEgliseId,
        publie,
        statutContenu: publie ? "publie" as const : "brouillon" as const,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl,
        videoUrl: body.videoUrl !== undefined ? body.videoUrl : existing.videoUrl,
        visibilite: body.visibilite ?? existing.visibilite,
        categorie: body.categorie !== undefined ? body.categorie : existing.categorie,
        lienInscription: body.lienInscription !== undefined ? body.lienInscription : existing.lienInscription,
      },
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { id } = await params;
    const numId = parseId(id);
    if (!numId) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

    const existing = await prisma.evenement.findUnique({ where: { id: numId } });
    if (!existing) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

    if (!await canManageContent(userId, existing.egliseId ?? undefined)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    await prisma.evenement.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
