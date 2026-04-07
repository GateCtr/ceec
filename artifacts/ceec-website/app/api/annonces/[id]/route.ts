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
    const annonce = await prisma.annonce.findUnique({ where: { id: numId } });
    if (!annonce) return NextResponse.json({ error: "Non trouve" }, { status: 404 });
    return NextResponse.json(annonce);
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

    const existing = await prisma.annonce.findUnique({ where: { id: numId } });
    if (!existing) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

    if (!await canManageContent(userId, existing.egliseId ?? undefined)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const body = await req.json();
    const targetEgliseId = body.egliseId ?? body.paroisseId ?? existing.egliseId;

    if (targetEgliseId !== existing.egliseId) {
      if (!await isSuperAdmin(userId)) {
        return NextResponse.json({ error: "Seul un super admin peut deplacer une annonce vers une autre eglise" }, { status: 403 });
      }
    }

    const updated = await prisma.annonce.update({
      where: { id: numId },
      data: {
        titre: body.titre,
        contenu: body.contenu,
        egliseId: targetEgliseId,
        priorite: body.priorite ?? existing.priorite,
        publie: body.publie ?? existing.publie,
        dateExpiration: body.dateExpiration ? new Date(body.dateExpiration) : null,
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

    const existing = await prisma.annonce.findUnique({ where: { id: numId } });
    if (!existing) return NextResponse.json({ error: "Non trouve" }, { status: 404 });

    if (!await canManageContent(userId, existing.egliseId ?? undefined)) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    await prisma.annonce.delete({ where: { id: numId } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
