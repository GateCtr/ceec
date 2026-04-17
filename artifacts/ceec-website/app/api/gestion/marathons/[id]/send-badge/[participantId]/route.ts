import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { sendMarathonBadgeEmail } from "@/lib/email";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

function getEgliseIdHeader(req: NextRequest): number | null {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
    const egliseId = getEgliseIdHeader(req);
    if (!egliseId && !superAdmin) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });
    if (!superAdmin && egliseId && !(await hasPermission(userId, "eglise_creer_evenement", egliseId))) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id, participantId } = await params;
    const marathonId = parseInt(id, 10);
    const pId = parseInt(participantId, 10);

    const participant = await prisma.marathonParticipant.findFirst({
      where: {
        id: pId,
        marathonId,
        ...(superAdmin ? {} : { marathon: { egliseId: egliseId! } }),
      },
      include: {
        marathon: { include: { eglise: { select: { nom: true } } } },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant introuvable" }, { status: 404 });
    }

    const email = participant.email;
    if (!email) {
      return NextResponse.json({ error: "Ce participant n'a pas d'adresse email" }, { status: 400 });
    }

    const marathon = participant.marathon;
    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const dateFin = allDays[allDays.length - 1] ?? marathon.dateDebut;
    const denomination = marathon.denomination ?? marathon.eglise.nom;
    const dateRange = `${toDateString(marathon.dateDebut)} – ${toDateString(dateFin)}`;

    const result = await sendMarathonBadgeEmail({
      to: email,
      participantPrenom: participant.prenom,
      participantNom: participant.nom,
      participantNumeroId: participant.numeroId,
      participantQrToken: participant.qrToken,
      marathonTitre: marathon.titre,
      marathonTheme: marathon.theme,
      marathonReferenceBiblique: marathon.referenceBiblique,
      marathonDenomination: denomination,
      marathonDateRange: dateRange,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error ?? "Erreur lors de l'envoi" }, { status: 500 });
    }

    return NextResponse.json({ success: true, sentTo: email });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
