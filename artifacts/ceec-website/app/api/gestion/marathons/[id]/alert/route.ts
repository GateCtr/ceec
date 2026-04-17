import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { sendMarathonAlertEmail, getChurchStaffEmails } from "@/lib/email";
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

    const marathon = await prisma.marathon.findFirst({
      where: { id: marathonId, ...(superAdmin || !egliseId ? {} : { egliseId }) },
      select: { id: true, titre: true, egliseId: true, alerteSeuil: true, dateDebut: true, nombreJours: true, joursExclus: true, statut: true },
    });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const days = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const todayStr = toDateString(new Date());
    const todayIdx = days.findIndex((d) => toDateString(d) === todayStr);

    if (todayIdx === -1) {
      return NextResponse.json({ error: "Aucune session active aujourd'hui" }, { status: 400 });
    }

    const numeroJour = todayIdx + 1;
    const totalParticipants = await prisma.marathonParticipant.count({ where: { marathonId } });
    const scanned = await prisma.marathonPresence.count({
      where: { marathonId, numeroJour, statut: "present" },
    });

    const expected = totalParticipants;
    const taux = expected > 0 ? Math.round((scanned / expected) * 100) : 0;

    if (taux >= marathon.alerteSeuil) {
      return NextResponse.json({
        sent: false,
        reason: `Taux de présence (${taux}%) au-dessus du seuil configuré (${marathon.alerteSeuil}%). Aucune alerte envoyée.`,
        scanned,
        expected,
        taux,
        seuil: marathon.alerteSeuil,
        numeroJour,
      });
    }

    const recipients = await getChurchStaffEmails(marathon.egliseId);

    if (recipients.length === 0) {
      return NextResponse.json({
        sent: false,
        reason: "Aucun destinataire trouvé pour cette église",
        scanned,
        expected,
        taux,
        seuil: marathon.alerteSeuil,
        numeroJour,
      });
    }

    const result = await sendMarathonAlertEmail({
      to: recipients,
      marathonTitre: marathon.titre,
      numeroJour,
      scanned,
      expected,
      taux,
      seuil: marathon.alerteSeuil,
      marathonId: marathon.id,
    });

    return NextResponse.json({
      sent: result.success,
      recipients: recipients.length,
      scanned,
      expected,
      taux,
      numeroJour,
      error: result.error,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
