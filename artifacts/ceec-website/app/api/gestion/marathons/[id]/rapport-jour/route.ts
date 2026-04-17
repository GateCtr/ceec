import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  computeMarathonDays,
  getMarathonDayNumber,
  toDateString,
} from "@/lib/marathon-utils";

function getEgliseId(req: NextRequest): number | null {
  const h = req.headers.get("x-eglise-id");
  if (h) { const id = parseInt(h, 10); return isNaN(id) ? null : id; }
  const qp = new URL(req.url).searchParams.get("egliseId");
  if (qp) { const id = parseInt(qp, 10); return isNaN(id) ? null : id; }
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

  const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
  let egliseId: number | null = null;

  if (!superAdmin) {
    egliseId = getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Contexte manquant" }, { status: 400 });
    const allowed = await hasPermission(userId, "eglise_creer_evenement", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const jourParam = searchParams.get("jour");

  const marathon = await prisma.marathon.findFirst({
    where: { id: marathonId, ...(superAdmin ? {} : { egliseId: egliseId! }) },
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
    const computed = getMarathonDayNumber(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus, targetDate);
    targetJour = computed ?? allDays.length;
    targetDate = allDays[(targetJour ?? 1) - 1] ?? allDays[0];
  }

  const dateStart = new Date(targetDate); dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(targetDate); dateEnd.setHours(23, 59, 59, 999);

  const presences = await prisma.marathonPresence.findMany({
    where: { marathonId, date: { gte: dateStart, lte: dateEnd } },
  });
  const session = await prisma.marathonSession.findFirst({
    where: { marathonId, date: { gte: dateStart, lte: dateEnd } },
  });

  const presenceMap = new Map<number, { statut: string; scanneParNom: string | null; scannedAt: Date | null }>();
  for (const p of presences) presenceMap.set(p.participantId, { statut: p.statut, scanneParNom: p.scanneParNom, scannedAt: p.scannedAt });

  const denomination = marathon.denomination ?? marathon.eglise.nom;
  const presents = presences.filter((p) => p.statut === "present").length;
  const total = marathon.participants.length;

  const mmToPt = (mm: number) => mm * 2.835;
  const PRIMARY = rgb(30 / 255, 58 / 255, 138 / 255);
  const GOLD = rgb(197 / 255, 155 / 255, 46 / 255);
  const GREEN = rgb(21 / 255, 128 / 255, 61 / 255);
  const RED = rgb(220 / 255, 38 / 255, 38 / 255);
  const GRAY = rgb(0.6, 0.6, 0.6);
  const LIGHTGRAY = rgb(0.96, 0.96, 0.97);
  const WHITE = rgb(1, 1, 1);

  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pageW = mmToPt(210);
  const pageH = mmToPt(297);
  const mg = mmToPt(15);

  const newPage = () => {
    const p = pdfDoc.addPage([pageW, pageH]);
    return { p, y: pageH - mg };
  };

  let { p: page, y } = newPage();

  const drawHeader = () => {
    page.drawRectangle({ x: 0, y: pageH - mmToPt(25), width: pageW, height: mmToPt(25), color: PRIMARY });
    page.drawText(`Rapport de présences — Jour ${targetJour}`, { x: mg, y: pageH - 18, size: 12, font: fontBold, color: WHITE });
    page.drawText(`${denomination} · ${marathon.titre}`, { x: mg, y: pageH - 30, size: 8, font: fontReg, color: rgb(0.8, 0.85, 1) });
    page.drawText(`${toDateString(targetDate)}${session?.nomControleur ? " · Contrôleur : " + session.nomControleur : ""}`, { x: mg, y: pageH - 42, size: 7, font: fontReg, color: GOLD });
  };
  drawHeader();
  y = pageH - mmToPt(35);

  page.drawRectangle({ x: mg, y: y - 40, width: (pageW - 2 * mg) / 3 - 4, height: 40, color: LIGHTGRAY, borderColor: rgb(0.88, 0.88, 0.9), borderWidth: 0.5 });
  page.drawText(`${total}`, { x: mg + 10, y: y - 16, size: 18, font: fontBold, color: PRIMARY });
  page.drawText("Inscrits", { x: mg + 10, y: y - 30, size: 7, font: fontReg, color: GRAY });

  const statW = (pageW - 2 * mg) / 3 - 4;
  page.drawRectangle({ x: mg + statW + 4, y: y - 40, width: statW, height: 40, color: rgb(0.94, 0.99, 0.96), borderColor: rgb(0.8, 0.92, 0.84), borderWidth: 0.5 });
  page.drawText(`${presents}`, { x: mg + statW + 14, y: y - 16, size: 18, font: fontBold, color: GREEN });
  page.drawText("Présents", { x: mg + statW + 14, y: y - 30, size: 7, font: fontReg, color: GRAY });

  page.drawRectangle({ x: mg + 2 * (statW + 4), y: y - 40, width: statW, height: 40, color: rgb(0.99, 0.94, 0.94), borderColor: rgb(0.92, 0.8, 0.8), borderWidth: 0.5 });
  page.drawText(`${total - presents}`, { x: mg + 2 * (statW + 4) + 10, y: y - 16, size: 18, font: fontBold, color: RED });
  page.drawText("Absents / Non scannés", { x: mg + 2 * (statW + 4) + 10, y: y - 30, size: 7, font: fontReg, color: GRAY });

  y -= 55;

  const rowH = 16;
  const colWidths = [40, 140, 60, 60, 80];
  const colLabels = ["N° ID", "Participant", "Statut", "Heure", "Contrôleur"];
  const tableW = pageW - 2 * mg;

  const drawTableHeader = () => {
    page.drawRectangle({ x: mg, y: y - rowH, width: tableW, height: rowH, color: PRIMARY });
    let cx = mg + 4;
    for (let i = 0; i < colLabels.length; i++) {
      page.drawText(colLabels[i], { x: cx, y: y - rowH + 5, size: 6.5, font: fontBold, color: WHITE });
      cx += colWidths[i];
    }
    y -= rowH;
  };
  drawTableHeader();

  let rowIdx = 0;
  for (const participant of marathon.participants) {
    if (y < mg + rowH + 10) {
      ({ p: page, y } = newPage());
      drawHeader();
      y = pageH - mmToPt(35);
      drawTableHeader();
    }
    const presence = presenceMap.get(participant.id);
    const statut = presence?.statut ?? "non_scanne";
    const statutLabel = statut === "present" ? "Présent" : statut === "absent" ? "Absent" : "Non scanné";
    const statutColor = statut === "present" ? GREEN : statut === "absent" ? RED : GRAY;
    const heure = presence?.scannedAt
      ? new Date(presence.scannedAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      : "—";
    const controleur = presence?.scanneParNom ?? "—";
    const rowBg = rowIdx % 2 === 0 ? WHITE : LIGHTGRAY;
    page.drawRectangle({ x: mg, y: y - rowH, width: tableW, height: rowH, color: rowBg });
    let cx = mg + 4;
    const cells = [participant.numeroId, `${participant.prenom} ${participant.nom}`, statutLabel, heure, controleur];
    for (let i = 0; i < cells.length; i++) {
      const color = i === 2 ? statutColor : rgb(0.15, 0.15, 0.2);
      const font = i === 2 ? fontBold : fontReg;
      const truncated = cells[i].length > (colWidths[i] / 4.5) ? cells[i].slice(0, Math.floor(colWidths[i] / 4.5)) + "…" : cells[i];
      page.drawText(truncated, { x: cx, y: y - rowH + 5, size: 6.5, font, color });
      cx += colWidths[i];
    }
    page.drawLine({ start: { x: mg, y: y - rowH }, end: { x: mg + tableW, y: y - rowH }, thickness: 0.3, color: rgb(0.88, 0.88, 0.9) });
    y -= rowH;
    rowIdx++;
  }

  page.drawText(
    `Généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}`,
    { x: mg, y: mg, size: 6, font: fontReg, color: GRAY }
  );

  const pdfBytes = await pdfDoc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="rapport-j${targetJour}-${marathon.titre.replace(/\s+/g, "-")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
