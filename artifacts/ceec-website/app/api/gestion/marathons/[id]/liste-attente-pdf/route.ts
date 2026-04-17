import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { getMarathonDayNumber, toDateString } from "@/lib/marathon-utils";

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

  const marathon = await prisma.marathon.findFirst({
    where: { id: marathonId, ...(superAdmin ? {} : { egliseId: egliseId! }) },
    include: { eglise: { select: { nom: true } } },
  });

  if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

  const today = new Date();
  const todayStr = toDateString(today);

  const todayDayNum = getMarathonDayNumber(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus, today);

  const [allParticipants, todayPresences] = await Promise.all([
    prisma.marathonParticipant.findMany({
      where: { marathonId },
      select: { id: true, nom: true, prenom: true, numeroId: true },
      orderBy: { numeroId: "asc" },
    }),
    todayDayNum
      ? prisma.marathonPresence.findMany({
          where: { marathonId, statut: "present", numeroJour: todayDayNum },
          select: { participantId: true },
        })
      : Promise.resolve([]),
  ]);

  const scannedIds = new Set(todayPresences.map((p) => p.participantId));
  const notYetScanned = allParticipants.filter((p) => !scannedIds.has(p.id));

  const denomination = marathon.denomination ?? marathon.eglise.nom;
  const jourLabel = todayDayNum ? `Jour ${todayDayNum}` : "Aujourd'hui";
  const dateLabel = todayStr;

  const mmToPt = (mm: number) => mm * 2.835;
  const PRIMARY = rgb(30 / 255, 58 / 255, 138 / 255);
  const GOLD = rgb(197 / 255, 155 / 255, 46 / 255);
  const RED = rgb(220 / 255, 38 / 255, 38 / 255);
  const GRAY = rgb(0.6, 0.6, 0.6);
  const LIGHTGRAY = rgb(0.96, 0.96, 0.97);
  const WHITE = rgb(1, 1, 1);
  const DARKTEXT = rgb(0.1, 0.1, 0.15);

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
    page.drawText(`Liste d'attente — ${jourLabel}`, { x: mg, y: pageH - 18, size: 12, font: fontBold, color: WHITE });
    page.drawText(`${denomination} · ${marathon.titre}`, { x: mg, y: pageH - 30, size: 8, font: fontReg, color: rgb(0.8, 0.85, 1) });
    page.drawText(`${dateLabel} · Participants non encore scannés`, { x: mg, y: pageH - 42, size: 7, font: fontReg, color: GOLD });
  };

  drawHeader();
  y = pageH - mmToPt(35);

  const statW = (pageW - 2 * mg) / 2 - 4;
  page.drawRectangle({ x: mg, y: y - 40, width: statW, height: 40, color: LIGHTGRAY, borderColor: rgb(0.88, 0.88, 0.9), borderWidth: 0.5 });
  page.drawText(`${allParticipants.length}`, { x: mg + 10, y: y - 16, size: 18, font: fontBold, color: PRIMARY });
  page.drawText("Participants au total", { x: mg + 10, y: y - 30, size: 7, font: fontReg, color: GRAY });

  page.drawRectangle({ x: mg + statW + 4, y: y - 40, width: statW, height: 40, color: rgb(0.99, 0.94, 0.94), borderColor: rgb(0.92, 0.8, 0.8), borderWidth: 0.5 });
  page.drawText(`${notYetScanned.length}`, { x: mg + statW + 14, y: y - 16, size: 18, font: fontBold, color: RED });
  page.drawText("Non encore scannés", { x: mg + statW + 14, y: y - 30, size: 7, font: fontReg, color: GRAY });

  y -= 55;

  const rowH = 18;
  const checkW = 22;
  const idW = 55;
  const nameW = pageW - 2 * mg - checkW - idW;
  const tableW = pageW - 2 * mg;

  const drawTableHeader = () => {
    page.drawRectangle({ x: mg, y: y - rowH, width: tableW, height: rowH, color: PRIMARY });
    page.drawText("✓", { x: mg + 5, y: y - rowH + 6, size: 7, font: fontBold, color: WHITE });
    page.drawText("N° ID", { x: mg + checkW + 4, y: y - rowH + 6, size: 6.5, font: fontBold, color: WHITE });
    page.drawText("Participant", { x: mg + checkW + idW + 4, y: y - rowH + 6, size: 6.5, font: fontBold, color: WHITE });
    y -= rowH;
  };

  drawTableHeader();

  let rowIdx = 0;
  for (const participant of notYetScanned) {
    if (y < mg + rowH + 10) {
      ({ p: page, y } = newPage());
      drawHeader();
      y = pageH - mmToPt(35);
      drawTableHeader();
    }

    const rowBg = rowIdx % 2 === 0 ? WHITE : LIGHTGRAY;
    page.drawRectangle({ x: mg, y: y - rowH, width: tableW, height: rowH, color: rowBg });

    page.drawRectangle({
      x: mg + 5,
      y: y - rowH + 4,
      width: 10,
      height: 10,
      borderColor: rgb(0.55, 0.55, 0.65),
      borderWidth: 0.8,
    });

    const truncatedId = participant.numeroId.length > 10 ? participant.numeroId.slice(0, 10) + "…" : participant.numeroId;
    page.drawText(truncatedId, { x: mg + checkW + 4, y: y - rowH + 6, size: 7, font: fontReg, color: DARKTEXT });

    const fullName = `${participant.prenom} ${participant.nom}`;
    const maxChars = Math.floor(nameW / 4.2);
    const truncatedName = fullName.length > maxChars ? fullName.slice(0, maxChars) + "…" : fullName;
    page.drawText(truncatedName, { x: mg + checkW + idW + 4, y: y - rowH + 6, size: 7.5, font: fontBold, color: DARKTEXT });

    page.drawLine({
      start: { x: mg, y: y - rowH },
      end: { x: mg + tableW, y: y - rowH },
      thickness: 0.3,
      color: rgb(0.88, 0.88, 0.9),
    });

    y -= rowH;
    rowIdx++;
  }

  if (notYetScanned.length === 0) {
    page.drawText("Tous les participants ont été scannés aujourd'hui.", {
      x: mg,
      y: y - 20,
      size: 9,
      font: fontReg,
      color: rgb(0.1, 0.5, 0.2),
    });
  }

  page.drawText(
    `Généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })} · ${notYetScanned.length} participant(s) en attente`,
    { x: mg, y: mg, size: 6, font: fontReg, color: GRAY }
  );

  const pdfBytes = await pdfDoc.save();
  const safeTitle = marathon.titre.replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="liste-attente-${jourLabel.replace(/\s+/g, "-")}-${safeTitle}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
