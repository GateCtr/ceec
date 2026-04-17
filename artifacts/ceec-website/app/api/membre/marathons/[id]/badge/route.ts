import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const egliseHeader = req.headers.get("x-eglise-id");
  if (!egliseHeader) return NextResponse.json({ error: "Contexte manquant" }, { status: 400 });
  const egliseId = parseInt(egliseHeader, 10);

  const { id } = await params;
  const marathonId = parseInt(id, 10);

  const membre = await prisma.membre.findFirst({
    where: { clerkUserId: userId, egliseId },
    select: { id: true },
  });
  if (!membre) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const participant = await prisma.marathonParticipant.findFirst({
    where: { marathonId, membreId: membre.id, marathon: { egliseId } },
    include: {
      marathon: { include: { eglise: { select: { nom: true, logoUrl: true } } } },
    },
  });
  if (!participant) {
    return NextResponse.json({ error: "Vous n'êtes pas inscrit à ce marathon" }, { status: 404 });
  }

  const marathon = participant.marathon;
  const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
  const dateFin = allDays[allDays.length - 1] ?? marathon.dateDebut;
  const denomination = marathon.denomination ?? marathon.eglise.nom;
  const dateRange = `${toDateString(marathon.dateDebut)} – ${toDateString(dateFin)}`;

  const qrDataUrl = await QRCode.toDataURL(participant.qrToken, {
    width: 200,
    margin: 1,
    color: { dark: "#1e3a8a", light: "#ffffff" },
  });
  const qrPngBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  const PRIMARY = rgb(30 / 255, 58 / 255, 138 / 255);
  const GOLD = rgb(197 / 255, 155 / 255, 46 / 255);
  const WHITE = rgb(1, 1, 1);
  const mmToPt = (mm: number) => mm * 2.835;
  const W = mmToPt(86);
  const H = mmToPt(54);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([W, H]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const qrImage = await pdfDoc.embedPng(qrPngBuffer);
  const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, max) + "…" : s);

  const headerH = mmToPt(16);
  page.drawRectangle({ x: 0, y: H - headerH, width: W, height: headerH, color: PRIMARY });
  page.drawText(truncate(denomination, 38), { x: 6, y: H - 10, size: 6.5, font: fontBold, color: WHITE });
  page.drawText(truncate(marathon.titre, 42), { x: 6, y: H - 18, size: 5.5, font: fontReg, color: rgb(0.8, 0.85, 1) });
  page.drawText(dateRange, { x: 6, y: H - 25, size: 4.5, font: fontReg, color: rgb(0.65, 0.7, 0.9) });

  const qrSize = mmToPt(22);
  const qrX = W - qrSize - 6;
  const qrY = H - headerH - qrSize - 4;
  page.drawRectangle({ x: qrX - 2, y: qrY - 2, width: qrSize + 4, height: qrSize + 4, color: GOLD });
  page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

  const nameY = qrY + qrSize - 4;
  page.drawText(truncate(`${participant.prenom} ${participant.nom}`, 22), { x: 6, y: nameY, size: 9, font: fontBold, color: PRIMARY });
  page.drawText(participant.numeroId, { x: 6, y: nameY - 13, size: 8, font: fontBold, color: GOLD });
  if (marathon.referenceBiblique) {
    page.drawText(truncate(marathon.referenceBiblique, 28), { x: 6, y: nameY - 24, size: 5.5, font: fontReg, color: rgb(0.4, 0.4, 0.5) });
  }
  if (marathon.theme) {
    page.drawText(truncate(marathon.theme, 30), { x: 6, y: nameY - 34, size: 5, font: fontReg, color: rgb(0.5, 0.5, 0.6) });
  }

  page.drawRectangle({ x: 0, y: 0, width: W, height: 2, color: GOLD });
  page.drawRectangle({ x: 0, y: H - 1, width: W, height: 1, color: GOLD });

  const pdfBytes = await pdfDoc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ma-carte-marathon-${participant.numeroId}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
