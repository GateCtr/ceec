import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const marathonId = parseInt(id, 10);
    const body = await req.json();
    const { qrToken, codeAcces, nomControleur } = body;

    if (!qrToken || !codeAcces) {
      return NextResponse.json({ error: "QR token et code d'accès requis" }, { status: 400 });
    }

    const marathon = await prisma.marathon.findUnique({ where: { id: marathonId } });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });
    if (marathon.statut !== "ouvert") return NextResponse.json({ error: "Marathon clos" }, { status: 403 });

    const today = toDateString(new Date());
    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const todayIdx = allDays.findIndex((d) => toDateString(d) === today);

    if (todayIdx === -1) return NextResponse.json({ error: "Pas de marathon aujourd'hui" }, { status: 400 });
    const numeroJour = todayIdx + 1;

    const session = await prisma.marathonSession.findFirst({
      where: { marathonId, date: { gte: new Date(today), lt: new Date(new Date(today).getTime() + 86400000) } },
    });

    if (!session) return NextResponse.json({ error: "Aucune session ouverte aujourd'hui" }, { status: 400 });
    if (session.codeAcces !== codeAcces) return NextResponse.json({ error: "Code d'accès incorrect" }, { status: 403 });

    const participant = await prisma.marathonParticipant.findUnique({
      where: { qrToken },
      include: { presences: { where: { numeroJour } } },
    });

    if (!participant) return NextResponse.json({ error: "Participant introuvable" }, { status: 404 });
    if (participant.marathonId !== marathonId) return NextResponse.json({ error: "QR invalide pour ce marathon" }, { status: 400 });

    const alreadyPresent = participant.presences.some((p) => p.statut === "present");
    if (alreadyPresent) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        participant: { nom: participant.nom, prenom: participant.prenom, numeroId: participant.numeroId },
        message: `${participant.prenom} ${participant.nom} est déjà enregistré aujourd'hui`,
      });
    }

    const dayDate = allDays[todayIdx];

    await prisma.marathonPresence.upsert({
      where: { participantId_numeroJour: { participantId: participant.id, numeroJour } },
      create: {
        participantId: participant.id,
        marathonId,
        numeroJour,
        date: dayDate,
        statut: "present",
        scanneParNom: nomControleur ?? session.nomControleur ?? null,
        scannedAt: new Date(),
      },
      update: {
        statut: "present",
        scanneParNom: nomControleur ?? session.nomControleur ?? null,
        scannedAt: new Date(),
      },
    });

    const presents = await prisma.marathonPresence.count({ where: { marathonId, numeroJour, statut: "present" } });

    return NextResponse.json({
      ok: true,
      duplicate: false,
      participant: { nom: participant.nom, prenom: participant.prenom, numeroId: participant.numeroId },
      presents,
      message: `${participant.prenom} ${participant.nom} marqué présent`,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const marathonId = parseInt(id, 10);
    const { searchParams } = new URL(req.url);
    const codeAcces = searchParams.get("code");
    const jourStr = searchParams.get("jour");

    if (!codeAcces) return NextResponse.json({ error: "Code d'accès requis" }, { status: 400 });

    const today = toDateString(new Date());
    const session = await prisma.marathonSession.findFirst({
      where: { marathonId, date: { gte: new Date(today), lt: new Date(new Date(today).getTime() + 86400000) } },
    });
    if (!session || session.codeAcces !== codeAcces) {
      return NextResponse.json({ error: "Code invalide" }, { status: 403 });
    }

    const numeroJour = jourStr ? parseInt(jourStr, 10) : session.numeroJour;
    const presences = await prisma.marathonPresence.findMany({
      where: { marathonId, numeroJour, statut: "present" },
      include: { participant: { select: { nom: true, prenom: true, numeroId: true } } },
      orderBy: { scannedAt: "desc" },
    });

    return NextResponse.json({ presences, count: presences.length, numeroJour });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
