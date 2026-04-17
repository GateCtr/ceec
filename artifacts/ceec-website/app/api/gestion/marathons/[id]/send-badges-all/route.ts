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
  { params }: { params: Promise<{ id: string }> }
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

    const { id } = await params;
    const marathonId = parseInt(id, 10);

    const marathon = await prisma.marathon.findFirst({
      where: { id: marathonId, ...(superAdmin || !egliseId ? {} : { egliseId }) },
      include: { eglise: { select: { nom: true } } },
    });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const participants = await prisma.marathonParticipant.findMany({
      where: { marathonId, email: { not: null } },
      select: {
        id: true, prenom: true, nom: true, email: true, numeroId: true, qrToken: true,
      },
    });

    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const dateFin = allDays[allDays.length - 1] ?? marathon.dateDebut;
    const denomination = marathon.denomination ?? marathon.eglise.nom;
    const dateRange = `${toDateString(marathon.dateDebut)} – ${toDateString(dateFin)}`;

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const p of participants) {
      if (!p.email) continue;
      const result = await sendMarathonBadgeEmail({
        to: p.email,
        participantPrenom: p.prenom,
        participantNom: p.nom,
        participantNumeroId: p.numeroId,
        participantQrToken: p.qrToken,
        marathonTitre: marathon.titre,
        marathonTheme: marathon.theme,
        marathonReferenceBiblique: marathon.referenceBiblique,
        marathonDenomination: denomination,
        marathonDateRange: dateRange,
      });
      if (result.success) {
        sent++;
      } else {
        failed++;
        errors.push(`${p.prenom} ${p.nom}: ${result.error}`);
      }
    }

    const withEmail = participants.length;
    const total = await prisma.marathonParticipant.count({ where: { marathonId } });
    const noEmail = total - withEmail;

    return NextResponse.json({ success: true, sent, failed, noEmail, errors });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
