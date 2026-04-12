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
    const [pGerer, pCreerEvt, pCreerAnnonce] = await Promise.all([
      hasPermission(userId, "eglise_gerer_evenements", egliseId),
      hasPermission(userId, "eglise_creer_evenement", egliseId),
      hasPermission(userId, "eglise_creer_annonce", egliseId),
    ]);
    const allowed = superAdmin || pGerer || pCreerEvt || pCreerAnnonce;
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const evtId = parseInt(id, 10);

    const existing = await prisma.evenement.findUnique({ where: { id: evtId }, select: { egliseId: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const evt = await prisma.evenement.update({
      where: { id: evtId },
      data: {
        titre: body.titre,
        description: body.description ?? null,
        dateDebut: new Date(body.dateDebut),
        dateFin: body.dateFin ? new Date(body.dateFin) : null,
        lieu: body.lieu ?? null,
        publie: body.publie,
        imageUrl: body.imageUrl ?? null,
        categorie: body.categorie !== undefined ? (body.categorie || null) : undefined,
        lienInscription: body.lienInscription !== undefined ? (body.lienInscription || null) : undefined,
      },
    });
    return NextResponse.json(evt);
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
    const [pGerer2, pCreerEvt2, pCreerAnnonce2] = await Promise.all([
      hasPermission(userId, "eglise_gerer_evenements", egliseId),
      hasPermission(userId, "eglise_creer_evenement", egliseId),
      hasPermission(userId, "eglise_creer_annonce", egliseId),
    ]);
    const allowed = superAdmin || pGerer2 || pCreerEvt2 || pCreerAnnonce2;
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const evtId = parseInt(id, 10);

    const existing = await prisma.evenement.findUnique({ where: { id: evtId }, select: { egliseId: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    await prisma.evenement.delete({ where: { id: evtId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
