import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const [pGerer, pCreer] = await Promise.all([
      hasPermission(userId, "eglise_gerer_annonces", egliseId),
      hasPermission(userId, "eglise_creer_annonce", egliseId),
    ]);
    const allowed = superAdmin || pGerer || pCreer;
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const annonceId = parseInt(id, 10);

    const existing = await prisma.annonce.findUnique({ where: { id: annonceId }, select: { egliseId: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    const body = await req.json();

    const VALID_PRIORITES = ["basse", "normale", "haute", "urgente"];
    if (body.priorite !== undefined && !VALID_PRIORITES.includes(body.priorite)) {
      return NextResponse.json({ error: "Priorité invalide" }, { status: 400 });
    }

    const annonce = await prisma.annonce.update({
      where: { id: annonceId },
      data: {
        titre: body.titre,
        contenu: body.contenu,
        priorite: body.priorite,
        publie: typeof body.publie === "boolean" ? body.publie : undefined,
        dateExpiration: body.dateExpiration ? new Date(body.dateExpiration) : null,
        imageUrl: body.imageUrl !== undefined ? (body.imageUrl || null) : undefined,
        categorie: body.categorie !== undefined ? (body.categorie || null) : undefined,
      },
    });
    return NextResponse.json(annonce);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const [pGerer, pCreer] = await Promise.all([
      hasPermission(userId, "eglise_gerer_annonces", egliseId),
      hasPermission(userId, "eglise_creer_annonce", egliseId),
    ]);
    const allowed = superAdmin || pGerer || pCreer;
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const annonceId = parseInt(id, 10);

    const existing = await prisma.annonce.findUnique({ where: { id: annonceId }, select: { egliseId: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    await prisma.annonce.delete({ where: { id: annonceId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
