import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin, hasPermission } from "@/lib/auth/rbac";

function parseId(id: string) {
  const n = parseInt(id, 10);
  return isNaN(n) ? null : n;
}

async function canModifyEglise(userId: string, egliseId: number): Promise<boolean> {
  if (await isSuperAdmin(userId)) return true;
  return hasPermission(userId, "plateforme_gerer_eglises", egliseId);
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numId = parseId(id);
    if (!numId) return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
    const eglise = await prisma.eglise.findUnique({ where: { id: numId } });
    if (!eglise) return NextResponse.json({ error: "Non trouve" }, { status: 404 });
    return NextResponse.json(eglise);
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

    if (!await canModifyEglise(userId, numId)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.eglise.update({
      where: { id: numId },
      data: {
        nom: body.nom,
        slug: body.slug ?? undefined,
        sousDomaine: body.sousDomaine ?? body.sous_domaine ?? undefined,
        ville: body.ville,
        adresse: body.adresse ?? null,
        pasteur: body.pasteur ?? null,
        telephone: body.telephone ?? null,
        email: body.email ?? null,
        description: body.description ?? null,
        photoUrl: body.photoUrl ?? null,
        statut: body.statut ?? undefined,
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

    if (!await isSuperAdmin(userId)) {
      return NextResponse.json({ error: "Acces refuse - super admin requis" }, { status: 403 });
    }

    await prisma.eglise.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
