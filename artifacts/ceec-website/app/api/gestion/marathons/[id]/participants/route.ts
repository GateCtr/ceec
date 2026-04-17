import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { generateQrToken, formatNumeroId, getElapsedDayNumbers, toDateString } from "@/lib/marathon-utils";

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
    });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const participants = await prisma.marathonParticipant.findMany({
      where: { marathonId },
      include: {
        presences: { orderBy: { numeroJour: "asc" } },
        membre: { select: { id: true, prenom: true, nom: true, email: true } },
      },
      orderBy: { dateInscription: "asc" },
    });

    return NextResponse.json(participants);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const body = await req.json();
    if (!body.nom || !body.prenom) return NextResponse.json({ error: "Nom et prénom requis" }, { status: 400 });

    const count = await prisma.marathonParticipant.count({ where: { marathonId } });
    const numeroId = formatNumeroId(marathonId, count + 1);
    const qrToken = generateQrToken();

    const participant = await prisma.marathonParticipant.create({
      data: {
        marathonId,
        membreId: body.membreId ?? null,
        nom: body.nom,
        prenom: body.prenom,
        email: body.email ?? null,
        numeroId,
        qrToken,
      },
    });

    const elapsedDays = getElapsedDayNumbers(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    if (elapsedDays.length > 0) {
      const { computeMarathonDays } = await import("@/lib/marathon-utils");
      const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
      await prisma.marathonPresence.createMany({
        data: elapsedDays.map((dayNum) => ({
          participantId: participant.id,
          marathonId,
          numeroJour: dayNum,
          date: allDays[dayNum - 1],
          statut: "absent",
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(participant, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("Unique constraint")) {
      return NextResponse.json({ error: "Ce membre est déjà inscrit à ce marathon" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
