import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
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
    const body = await req.json();
    const { numeroJour } = body;

    const marathon = await prisma.marathon.findFirst({
      where: { id: marathonId, ...(superAdmin || !egliseId ? {} : { egliseId }) },
    });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    if (!numeroJour || numeroJour < 1 || numeroJour > allDays.length) {
      return NextResponse.json({ error: "Numéro de jour invalide" }, { status: 400 });
    }

    const dayDate = allDays[numeroJour - 1];

    const participants = await prisma.marathonParticipant.findMany({
      where: { marathonId },
      select: { id: true },
    });

    let markedAbsent = 0;
    for (const p of participants) {
      const existing = await prisma.marathonPresence.findUnique({
        where: { participantId_numeroJour: { participantId: p.id, numeroJour } },
      });
      if (!existing) {
        await prisma.marathonPresence.create({
          data: {
            participantId: p.id,
            marathonId,
            numeroJour,
            date: dayDate,
            statut: "absent",
          },
        });
        markedAbsent++;
      } else if (existing.statut !== "present" && existing.statut !== "absent") {
        await prisma.marathonPresence.update({
          where: { participantId_numeroJour: { participantId: p.id, numeroJour } },
          data: { statut: "absent" },
        });
        markedAbsent++;
      }
    }

    return NextResponse.json({ ok: true, markedAbsent, numeroJour });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
