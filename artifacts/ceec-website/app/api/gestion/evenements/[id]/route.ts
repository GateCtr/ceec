import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, hasAutoPublishRole } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";

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
    const allowed = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const evtId = parseInt(id, 10);

    const existing = await prisma.evenement.findUnique({ where: { id: evtId }, select: { egliseId: true, titre: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const canAutoPublish = superAdmin || await hasAutoPublishRole(userId, egliseId);
    let publishUpdate: { publie?: boolean; statutContenu?: "publie" | "brouillon" } = {};
    if (typeof body.publie === "boolean") {
      if (body.publie && canAutoPublish) {
        publishUpdate = { publie: true, statutContenu: "publie" };
      } else if (!body.publie) {
        publishUpdate = { publie: false, statutContenu: "brouillon" };
      }
    }

    const evt = await prisma.evenement.update({
      where: { id: evtId },
      data: {
        titre: body.titre,
        description: body.description ?? null,
        dateDebut: new Date(body.dateDebut),
        dateFin: body.dateFin ? new Date(body.dateFin) : null,
        lieu: body.lieu ?? null,
        ...publishUpdate,
        imageUrl: body.imageUrl ?? null,
        categorie: body.categorie !== undefined ? (body.categorie || null) : undefined,
        lienInscription: body.lienInscription !== undefined ? (body.lienInscription || null) : undefined,
      },
    });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "modifier",
      entiteType: "evenement",
      entiteId: evt.id,
      entiteLabel: evt.titre,
      egliseId,
      egliseNom: eglise?.nom,
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
    const allowed = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const evtId = parseInt(id, 10);

    const existing = await prisma.evenement.findUnique({ where: { id: evtId }, select: { egliseId: true, titre: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    }

    const titre = existing.titre;
    await prisma.evenement.delete({ where: { id: evtId } });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "supprimer",
      entiteType: "evenement",
      entiteId: evtId,
      entiteLabel: titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
