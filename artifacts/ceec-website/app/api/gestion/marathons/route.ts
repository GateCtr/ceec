import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";
import { generateQrToken, formatNumeroId, getElapsedDayNumbers, toDateString } from "@/lib/marathon-utils";

function getEgliseIdSync(req: NextRequest): number | null {
  const h = req.headers.get("x-eglise-id") ?? new URL(req.url).searchParams.get("egliseId");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
    const egliseId = getEgliseIdSync(req);
    if (!egliseId && !superAdmin) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    if (!superAdmin && egliseId && !(await hasPermission(userId, "eglise_creer_evenement", egliseId))) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const marathons = await prisma.marathon.findMany({
      where: egliseId ? { egliseId } : {},
      orderBy: { dateDebut: "desc" },
      include: { _count: { select: { participants: true } } },
    });

    return NextResponse.json(marathons);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
    const egliseId = getEgliseIdSync(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable — requis pour créer un marathon" }, { status: 400 });
    if (!superAdmin && !(await hasPermission(userId, "eglise_creer_evenement", egliseId))) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const body = await req.json();
    if (!body.titre || !body.dateDebut || !body.nombreJours) {
      return NextResponse.json({ error: "Titre, date de début et nombre de jours requis" }, { status: 400 });
    }

    const eglise = await prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } });

    const marathon = await prisma.marathon.create({
      data: {
        egliseId,
        titre: body.titre,
        theme: body.theme ?? null,
        referenceBiblique: body.referenceBiblique ?? null,
        dateDebut: new Date(body.dateDebut),
        nombreJours: parseInt(body.nombreJours),
        joursExclus: body.joursExclus ?? [],
        statut: "ouvert",
        logoUrl: body.logoUrl ?? null,
        denomination: body.denomination ?? null,
        createdByUserId: userId,
      },
    });

    const acteurNom = await getActeurNom(userId, egliseId);
    await logActivity({
      acteurId: userId, acteurNom, action: "creer",
      entiteType: "evenement", entiteId: marathon.id,
      entiteLabel: `Marathon: ${marathon.titre}`,
      egliseId, egliseNom: eglise?.nom,
    });

    return NextResponse.json(marathon, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
