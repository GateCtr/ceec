import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";
import { generateQrToken, formatNumeroId, getElapsedDayNumbers, computeMarathonDays } from "@/lib/marathon-utils";

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

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
    const allowed = superAdmin || await hasPermission(userId, "eglise_creer_evenement", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const marathonId = parseInt(id, 10);

    const marathon = await prisma.marathon.findFirst({ where: { id: marathonId, egliseId } });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const text = await req.text();
    const lines = text.split("\n").filter(Boolean);
    if (lines.length === 0) return NextResponse.json({ error: "Fichier vide" }, { status: 400 });

    const isHeader = (line: string) => line.toLowerCase().includes("nom") || line.toLowerCase().includes("prenom");
    const dataLines = isHeader(lines[0]) ? lines.slice(1) : lines;

    const elapsedDays = getElapsedDayNumbers(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
    const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);

    let added = 0;
    let skipped = 0;
    const acteurNom = await getActeurNom(userId, egliseId);
    const eglise = await prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } });

    for (const line of dataLines) {
      const parts = line.split(",").map((s) => s.trim().replace(/^"|"$/g, ""));
      const [nom, prenom, email] = parts;
      if (!nom || !prenom) { skipped++; continue; }

      try {
        const count = await prisma.marathonParticipant.count({ where: { marathonId } });
        const numeroId = formatNumeroId(marathonId, count + 1);
        const qrToken = generateQrToken();

        const participant = await prisma.marathonParticipant.create({
          data: { marathonId, nom, prenom, email: email || null, numeroId, qrToken },
        });

        if (elapsedDays.length > 0) {
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

        await logActivity({
          acteurId: userId, acteurNom, action: "creer",
          entiteType: "membre", entiteId: participant.id,
          entiteLabel: `Import CSV Marathon: ${prenom} ${nom}`,
          egliseId, egliseNom: eglise?.nom,
          metadata: { source: "csv_import", marathonId, participantId: participant.id },
        });

        added++;
      } catch {
        skipped++;
      }
    }

    return NextResponse.json({ added, skipped, total: dataLines.length });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
