import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeMarathonDays, toDateString, generateAccessCode } from "@/lib/marathon-utils";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const marathonId = parseInt(id, 10);
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    const marathon = await prisma.marathon.findUnique({
      where: { id: marathonId },
      include: { eglise: { select: { nom: true, logoUrl: true } } },
    });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });
    if (marathon.statut !== "ouvert") return NextResponse.json({ error: "Marathon clos" }, { status: 403 });

    const today = toDateString(new Date());
    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const todayIdx = allDays.findIndex((d) => toDateString(d) === today);

    if (todayIdx === -1) {
      return NextResponse.json({ error: "Pas de session de marathon aujourd'hui" }, { status: 400 });
    }
    const numeroJour = todayIdx + 1;

    let session = await prisma.marathonSession.findFirst({
      where: { marathonId, date: { gte: new Date(today), lt: new Date(new Date(today).getTime() + 86400000) } },
    });

    if (!session) {
      return NextResponse.json({
        requiresSetup: true,
        marathon: {
          id: marathon.id,
          titre: marathon.titre,
          denomination: marathon.denomination ?? marathon.eglise.nom,
          logoUrl: marathon.logoUrl ?? marathon.eglise.logoUrl,
        },
        numeroJour,
        date: today,
      });
    }

    if (code && code !== session.codeAcces) {
      return NextResponse.json({ error: "Code d'accès incorrect" }, { status: 403 });
    }

    const presents = await prisma.marathonPresence.count({ where: { marathonId, numeroJour, statut: "present" } });
    const total = await prisma.marathonParticipant.count({ where: { marathonId } });

    return NextResponse.json({
      valid: true,
      session: { id: session.id, codeAcces: code ? session.codeAcces : undefined, nomControleur: session.nomControleur },
      marathon: {
        id: marathon.id,
        titre: marathon.titre,
        denomination: marathon.denomination ?? marathon.eglise.nom,
        logoUrl: marathon.logoUrl ?? marathon.eglise.logoUrl,
      },
      numeroJour,
      date: today,
      presents,
      total,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const marathonId = parseInt(id, 10);
    const body = await req.json();
    const { nomControleur, codeAcces } = body;

    const marathon = await prisma.marathon.findUnique({ where: { id: marathonId } });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });
    if (marathon.statut !== "ouvert") return NextResponse.json({ error: "Marathon clos" }, { status: 403 });

    const today = toDateString(new Date());
    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const todayIdx = allDays.findIndex((d) => toDateString(d) === today);

    if (todayIdx === -1) return NextResponse.json({ error: "Pas de marathon aujourd'hui" }, { status: 400 });
    const numeroJour = todayIdx + 1;
    const todayDate = allDays[todayIdx];

    const todayStart = new Date(today);
    const todayEnd = new Date(todayStart.getTime() + 86400000);
    const existingSession = await prisma.marathonSession.findFirst({
      where: { marathonId, date: { gte: todayStart, lt: todayEnd } },
    });

    if (existingSession) {
      if (!codeAcces || codeAcces !== existingSession.codeAcces) {
        return NextResponse.json(
          { error: "Une session existe déjà aujourd'hui. Fournissez le code d'accès actuel pour rejoindre.", requiresCode: true },
          { status: 409 }
        );
      }
      const updated = await prisma.marathonSession.update({
        where: { id: existingSession.id },
        data: { nomControleur: nomControleur ?? existingSession.nomControleur },
      });
      return NextResponse.json({ session: { ...updated, codeAcces: existingSession.codeAcces }, numeroJour, date: today });
    }

    const newCode = generateAccessCode();
    const session = await prisma.marathonSession.create({
      data: { marathonId, date: todayDate, numeroJour, codeAcces: newCode, nomControleur: nomControleur ?? null },
    });

    return NextResponse.json({ session: { ...session, codeAcces: newCode }, numeroJour, date: today });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
