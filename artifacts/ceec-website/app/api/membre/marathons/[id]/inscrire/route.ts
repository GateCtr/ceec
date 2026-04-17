import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { generateQrToken, formatNumeroId, getElapsedDayNumbers, computeMarathonDays } from "@/lib/marathon-utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const marathonId = parseInt(id, 10);

    const marathon = await prisma.marathon.findUnique({ where: { id: marathonId } });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });
    if (marathon.statut !== "ouvert") return NextResponse.json({ error: "Inscriptions closes" }, { status: 403 });

    const membre = await prisma.membre.findFirst({
      where: { clerkUserId: userId, egliseId: marathon.egliseId },
      select: { id: true, nom: true, prenom: true, email: true },
    });
    if (!membre) return NextResponse.json({ error: "Membre introuvable dans cette église" }, { status: 404 });

    const existing = await prisma.marathonParticipant.findFirst({
      where: { marathonId, membreId: membre.id },
    });
    if (existing) return NextResponse.json({ error: "Déjà inscrit", participant: existing }, { status: 409 });

    const count = await prisma.marathonParticipant.count({ where: { marathonId } });
    const numeroId = formatNumeroId(marathonId, count + 1);
    const qrToken = generateQrToken();

    const participant = await prisma.marathonParticipant.create({
      data: {
        marathonId,
        membreId: membre.id,
        nom: membre.nom,
        prenom: membre.prenom,
        email: membre.email,
        numeroId,
        qrToken,
      },
    });

    const elapsedDays = getElapsedDayNumbers(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    if (elapsedDays.length > 0) {
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
      return NextResponse.json({ error: "Déjà inscrit" }, { status: 409 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const { id } = await params;
    const marathonId = parseInt(id, 10);

    const marathon = await prisma.marathon.findUnique({ where: { id: marathonId } });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const membre = await prisma.membre.findFirst({
      where: { clerkUserId: userId, egliseId: marathon.egliseId },
      select: { id: true },
    });
    if (!membre) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });

    const participant = await prisma.marathonParticipant.findFirst({
      where: { marathonId, membreId: membre.id },
    });
    if (!participant) return NextResponse.json({ error: "Non inscrit" }, { status: 404 });

    await prisma.marathonParticipant.delete({ where: { id: participant.id } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
