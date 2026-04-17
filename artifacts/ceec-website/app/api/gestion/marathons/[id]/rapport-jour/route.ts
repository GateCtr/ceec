import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import {
  computeMarathonDays,
  getMarathonDayNumber,
  toDateString,
} from "@/lib/marathon-utils";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (h) {
    const id = parseInt(h, 10);
    return isNaN(id) ? null : id;
  }
  const qp = new URL(req.url).searchParams.get("egliseId");
  if (qp) {
    const id = parseInt(qp, 10);
    return isNaN(id) ? null : id;
  }
  return null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { id } = await params;
  const marathonId = parseInt(id, 10);

  const superAdmin = await isSuperAdmin(userId);
  if (!superAdmin) {
    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Contexte manquant" }, { status: 400 });
    const allowed = await hasPermission(userId, "eglise_creer_evenement", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const jourParam = searchParams.get("jour");

  const marathon = await prisma.marathon.findUnique({
    where: { id: marathonId },
    include: {
      eglise: { select: { nom: true } },
      participants: { orderBy: { numeroId: "asc" } },
    },
  });

  if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

  const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);

  let targetDate = new Date();
  let targetJour: number;

  if (jourParam) {
    const jourNum = parseInt(jourParam, 10);
    if (!isNaN(jourNum) && jourNum >= 1 && jourNum <= allDays.length) {
      targetDate = allDays[jourNum - 1];
      targetJour = jourNum;
    } else {
      return NextResponse.json({ error: "Numéro de jour invalide" }, { status: 400 });
    }
  } else {
    const computed = getMarathonDayNumber(
      marathon.dateDebut,
      marathon.nombreJours,
      marathon.joursExclus,
      targetDate
    );
    targetJour = computed ?? allDays.length;
    targetDate = allDays[(targetJour ?? 1) - 1] ?? allDays[0];
  }

  const targetDateStart = new Date(targetDate);
  targetDateStart.setHours(0, 0, 0, 0);
  const targetDateEnd = new Date(targetDate);
  targetDateEnd.setHours(23, 59, 59, 999);

  const presences = await prisma.marathonPresence.findMany({
    where: { marathonId, date: { gte: targetDateStart, lte: targetDateEnd } },
  });

  const presenceMap = new Map<number, { statut: string; scanneParNom: string | null; scannedAt: Date | null }>();
  for (const p of presences) {
    presenceMap.set(p.participantId, {
      statut: p.statut,
      scanneParNom: p.scanneParNom,
      scannedAt: p.scannedAt,
    });
  }

  const session = await prisma.marathonSession.findFirst({
    where: { marathonId, date: { gte: targetDateStart, lte: targetDateEnd } },
  });

  const denomination = marathon.denomination ?? marathon.eglise.nom;
  const dateStr = toDateString(targetDate);
  const presents = presences.filter((p) => p.statut === "present").length;
  const absents = marathon.participants.length - presents;

  const rows = marathon.participants.map((p) => {
    const presence = presenceMap.get(p.id);
    const statut = presence?.statut ?? "non_scanne";
    const statutLabel =
      statut === "present" ? "Présent" : statut === "absent" ? "Absent" : "Non scanné";
    const statutColor =
      statut === "present" ? "#15803d" : statut === "absent" ? "#dc2626" : "#9ca3af";
    const heure = presence?.scannedAt
      ? new Date(presence.scannedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : "—";
    const controleur = presence?.scanneParNom ?? "—";
    return `<tr>
      <td>${p.numeroId}</td>
      <td>${p.prenom} ${p.nom}</td>
      <td style="color:${statutColor};font-weight:600">${statutLabel}</td>
      <td>${heure}</td>
      <td>${controleur}</td>
    </tr>`;
  });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Rapport Jour ${targetJour} – ${marathon.titre}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; color: #111; padding: 20px; max-width: 900px; margin: 0 auto; }
  @media print {
    .no-print { display: none !important; }
    body { padding: 8mm; }
  }
  .no-print {
    background: #1e3a8a; color: white; padding: 10px 16px;
    border-radius: 6px; margin-bottom: 20px; display: flex;
    align-items: center; justify-content: space-between;
  }
  .no-print button {
    padding: 7px 18px; background: #c59b2e; color: white; border: none;
    border-radius: 6px; font-weight: bold; cursor: pointer; font-size: 13px;
  }
  .header { text-align: center; margin-bottom: 24px; border-bottom: 3px solid #1e3a8a; padding-bottom: 16px; }
  .header h1 { font-size: 20px; color: #1e3a8a; }
  .header h2 { font-size: 15px; color: #555; font-weight: normal; margin-top: 4px; }
  .header .meta { font-size: 13px; color: #777; margin-top: 8px; }
  .stats {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px;
  }
  .stat-box {
    text-align: center; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;
  }
  .stat-box .value { font-size: 26px; font-weight: bold; }
  .stat-box .label { font-size: 12px; color: #777; margin-top: 2px; }
  .stat-total .value { color: #1e3a8a; }
  .stat-present .value { color: #15803d; }
  .stat-absent .value { color: #dc2626; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #1e3a8a; color: white; padding: 8px 10px; text-align: left; }
  td { padding: 7px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) td { background: #f9fafb; }
  .footer { margin-top: 24px; font-size: 11px; color: #999; text-align: center; }
</style>
</head>
<body>
<div class="no-print">
  Rapport Jour ${targetJour} — ${denomination}
  <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
</div>
<div class="header">
  <h1>${marathon.titre}</h1>
  <h2>${denomination}</h2>
  <div class="meta">
    Rapport de présences — Jour ${targetJour} — ${dateStr}
    ${session ? `| Contrôleur : ${session.nomControleur ?? "N/A"}` : ""}
  </div>
</div>
<div class="stats">
  <div class="stat-box stat-total">
    <div class="value">${marathon.participants.length}</div>
    <div class="label">Participants inscrits</div>
  </div>
  <div class="stat-box stat-present">
    <div class="value">${presents}</div>
    <div class="label">Présents</div>
  </div>
  <div class="stat-box stat-absent">
    <div class="value">${absents}</div>
    <div class="label">Absents / Non scannés</div>
  </div>
</div>
<table>
  <thead>
    <tr>
      <th>N° ID</th>
      <th>Participant</th>
      <th>Statut</th>
      <th>Heure de scan</th>
      <th>Contrôleur</th>
    </tr>
  </thead>
  <tbody>
    ${rows.join("\n")}
  </tbody>
</table>
<div class="footer">
  Généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
