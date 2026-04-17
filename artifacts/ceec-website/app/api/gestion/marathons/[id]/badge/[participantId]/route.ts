import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import QRCode from "qrcode";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { id, participantId } = await params;
    const marathonId = parseInt(id, 10);
    const pId = parseInt(participantId, 10);

    const superAdmin = await isSuperAdmin(userId);
    if (!superAdmin) {
      const egliseId = await getEgliseId(req);
      if (!egliseId) {
        return NextResponse.json({ error: "Contexte église manquant" }, { status: 400 });
      }
      const allowed = await hasPermission(userId, "eglise_creer_evenement", egliseId);
      if (!allowed) {
        const membre = await prisma.membre.findFirst({
          where: { clerkUserId: userId, egliseId },
        });
        if (!membre) {
          return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }
        const participantCheck = await prisma.marathonParticipant.findFirst({
          where: { id: pId, marathonId, membreId: membre.id },
        });
        if (!participantCheck) {
          return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
        }
      }
    }

    const participant = await prisma.marathonParticipant.findFirst({
      where: { id: pId, marathonId },
      include: {
        marathon: { include: { eglise: { select: { nom: true, logoUrl: true } } } },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant introuvable" }, { status: 404 });
    }

    const marathon = participant.marathon;
    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const dateFin = allDays[allDays.length - 1] ?? marathon.dateDebut;

    const qrDataUrl = await QRCode.toDataURL(participant.qrToken, {
      width: 200,
      margin: 1,
      color: { dark: "#1e3a8a", light: "#ffffff" },
    });

    return NextResponse.json({
      participant: {
        id: participant.id,
        nom: participant.nom,
        prenom: participant.prenom,
        numeroId: participant.numeroId,
        qrDataUrl,
      },
      marathon: {
        id: marathon.id,
        titre: marathon.titre,
        theme: marathon.theme,
        referenceBiblique: marathon.referenceBiblique,
        dateDebut: toDateString(marathon.dateDebut),
        dateFin: toDateString(dateFin),
        denomination: marathon.denomination ?? marathon.eglise.nom,
        logoUrl: marathon.logoUrl ?? marathon.eglise.logoUrl,
      },
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
