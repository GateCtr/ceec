import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { canManageMembres, isSuperAdmin } from "@/lib/auth/rbac";

function parseId(id: string) {
  const n = parseInt(id, 10);
  return isNaN(n) ? null : n;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const { id } = await params;
    const numId = parseId(id);
    if (!numId) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });

    const membre = await prisma.membre.findUnique({ where: { id: numId } });
    if (!membre) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

    if (!await canManageMembres(userId, membre.egliseId ?? undefined)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }
    return NextResponse.json(membre);
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

    const existing = await prisma.membre.findUnique({ where: { id: numId } });
    if (!existing) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

    if (!await canManageMembres(userId, existing.egliseId ?? undefined)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const body = await req.json();
    const targetEgliseId = body.egliseId ?? body.paroisseId ?? existing.egliseId;

    if (targetEgliseId !== existing.egliseId) {
      if (!await isSuperAdmin(userId)) {
        return NextResponse.json({ error: "Seul un super admin peut deplacer un membre vers une autre eglise" }, { status: 403 });
      }
    }

    const updated = await prisma.membre.update({
      where: { id: numId },
      data: {
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        telephone: body.telephone ?? null,
        egliseId: targetEgliseId,
        role: body.role,
        statut: body.statut,
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

    const existing = await prisma.membre.findUnique({ where: { id: numId } });
    if (!existing) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

    if (!await canManageMembres(userId, existing.egliseId ?? undefined)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    await prisma.membre.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
