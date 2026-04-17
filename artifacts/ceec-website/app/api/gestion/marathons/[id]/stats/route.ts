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

    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const today = toDateString(new Date());
    const elapsedDays = allDays.filter((d) => toDateString(d) <= today);

    const [totalParticipants, presences] = await Promise.all([
      prisma.marathonParticipant.count({ where: { marathonId } }),
      prisma.marathonPresence.findMany({ where: { marathonId } }),
    ]);

    const byDay = allDays.map((date, idx) => {
      const dayNum = idx + 1;
      const dayPresences = presences.filter((p) => p.numeroJour === dayNum);
      const presentsCount = dayPresences.filter((p) => p.statut === "present").length;
      const isPast = toDateString(date) <= today;
      return {
        jour: dayNum,
        date: toDateString(date),
        presents: presentsCount,
        absents: isPast ? (totalParticipants - presentsCount) : 0,
        tauxPresence: totalParticipants > 0 ? Math.round((presentsCount / totalParticipants) * 100) : 0,
        isPast,
      };
    });

    const sansFaute = await prisma.marathonParticipant.findMany({
      where: { marathonId },
      include: { presences: { where: { statut: "absent" } } },
    });
    const sansFauteList = sansFaute
      .filter((p) => {
        const nbJoursEcoules = elapsedDays.length;
        const nbAbsences = p.presences.filter((pr) => pr.statut === "absent").length;
        return nbJoursEcoules > 0 && nbAbsences === 0;
      })
      .map((p) => ({ id: p.id, nom: p.nom, prenom: p.prenom, numeroId: p.numeroId }));

    const todayDayNum = allDays.findIndex((d) => toDateString(d) === today) + 1;

    const { searchParams } = new URL(req.url);
    const jourParam = searchParams.get("jour");
    const jourNum = jourParam ? parseInt(jourParam, 10) : null;

    let absentsDuJour: { id: number; nom: string; prenom: string; numeroId: string }[] = [];
    if (jourNum && jourNum >= 1 && jourNum <= allDays.length) {
      const presentIds = new Set(
        presences.filter((p) => p.numeroJour === jourNum && p.statut === "present").map((p) => p.participantId)
      );
      const allParticipants = await prisma.marathonParticipant.findMany({
        where: { marathonId },
        select: { id: true, nom: true, prenom: true, numeroId: true },
        orderBy: { numeroId: "asc" },
      });
      absentsDuJour = allParticipants.filter((p) => !presentIds.has(p.id));
    }

    return NextResponse.json({
      totalParticipants,
      joursTotal: marathon.nombreJours,
      joursEcoules: elapsedDays.length,
      joursRestants: allDays.length - elapsedDays.length,
      byDay,
      sansFaute: sansFauteList,
      todayDayNum: todayDayNum > 0 ? todayDayNum : null,
      ...(jourNum ? { absentsDuJour, jourNum } : {}),
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
