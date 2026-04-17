import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
    const egliseId = await getEgliseId(req);
    if (!egliseId && !superAdmin) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    if (!superAdmin && egliseId && !(await hasPermission(userId, "eglise_creer_evenement", egliseId))) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const marathonId = parseInt(id, 10);

    const marathon = await prisma.marathon.findFirst({
      where: { id: marathonId, ...(superAdmin || !egliseId ? {} : { egliseId }) },
      include: {
        eglise: { select: { nom: true, logoUrl: true } },
        _count: { select: { participants: true, presences: true } },
      },
    });

    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    return NextResponse.json(marathon);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
    const egliseId = await getEgliseId(req);
    if (!egliseId && !superAdmin) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    if (!superAdmin && egliseId && !(await hasPermission(userId, "eglise_creer_evenement", egliseId))) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const marathonId = parseInt(id, 10);

    const existing = await prisma.marathon.findFirst({
      where: { id: marathonId, ...(superAdmin || !egliseId ? {} : { egliseId }) },
    });
    if (!existing) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const resolvedEgliseId = egliseId ?? existing.egliseId;
    const body = await req.json();
    const eglise = await prisma.eglise.findUnique({ where: { id: resolvedEgliseId }, select: { nom: true } });

    const marathon = await prisma.marathon.update({
      where: { id: marathonId },
      data: {
        titre: body.titre ?? existing.titre,
        theme: body.theme !== undefined ? (body.theme || null) : existing.theme,
        referenceBiblique: body.referenceBiblique !== undefined ? (body.referenceBiblique || null) : existing.referenceBiblique,
        dateDebut: body.dateDebut ? new Date(body.dateDebut) : existing.dateDebut,
        nombreJours: body.nombreJours ? parseInt(body.nombreJours) : existing.nombreJours,
        joursExclus: body.joursExclus !== undefined ? body.joursExclus : existing.joursExclus,
        statut: body.statut ?? existing.statut,
        alerteSeuil: body.alerteSeuil !== undefined ? Math.min(100, Math.max(0, parseInt(body.alerteSeuil))) : existing.alerteSeuil,
        alerteHeure: body.alerteHeure !== undefined ? (body.alerteHeure || null) : existing.alerteHeure,
        logoUrl: body.logoUrl !== undefined ? (body.logoUrl || null) : existing.logoUrl,
        denomination: body.denomination !== undefined ? (body.denomination || null) : existing.denomination,
      },
    });

    const acteurNom = await getActeurNom(userId, resolvedEgliseId);
    await logActivity({
      acteurId: userId, acteurNom, action: "modifier",
      entiteType: "evenement", entiteId: marathon.id,
      entiteLabel: `Marathon: ${marathon.titre}`,
      egliseId: resolvedEgliseId, egliseNom: eglise?.nom,
    });

    return NextResponse.json(marathon);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
    const egliseId = await getEgliseId(req);
    if (!egliseId && !superAdmin) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    if (!superAdmin && egliseId && !(await hasPermission(userId, "eglise_creer_evenement", egliseId))) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;
    const marathonId = parseInt(id, 10);

    const existing = await prisma.marathon.findFirst({
      where: { id: marathonId, ...(superAdmin || !egliseId ? {} : { egliseId }) },
      select: { titre: true, egliseId: true },
    });
    if (!existing) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    await prisma.marathon.delete({ where: { id: marathonId } });

    const resolvedEgliseId = egliseId ?? existing.egliseId;
    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, resolvedEgliseId),
      prisma.eglise.findUnique({ where: { id: resolvedEgliseId }, select: { nom: true } }),
    ]);
    await logActivity({
      acteurId: userId, acteurNom, action: "supprimer",
      entiteType: "evenement", entiteId: marathonId,
      entiteLabel: `Marathon: ${existing.titre}`,
      egliseId: resolvedEgliseId, egliseNom: eglise?.nom,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
