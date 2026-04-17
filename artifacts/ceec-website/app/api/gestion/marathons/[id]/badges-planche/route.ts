import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import QRCode from "qrcode";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

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
    include: {
      eglise: { select: { nom: true } },
      participants: { orderBy: { numeroId: "asc" } },
    },
  });

  if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

  const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
  const dateFin = allDays[allDays.length - 1] ?? marathon.dateDebut;
  const denomination = marathon.denomination ?? marathon.eglise.nom;
  const dateRange = `${toDateString(marathon.dateDebut)} – ${toDateString(dateFin)}`;

  const PRIMARY = rgb(30 / 255, 58 / 255, 138 / 255);
  const GOLD = rgb(197 / 255, 155 / 255, 46 / 255);
  const WHITE = rgb(1, 1, 1);
  const WATERMARK = rgb(0.85, 0.85, 0.9);
  const mmToPt = (mm: number) => mm * 2.835;

  const badgeW = mmToPt(90);
  const badgeH = mmToPt(57);
  const colGap = mmToPt(5);
  const rowGap = mmToPt(5);
  const marginX = mmToPt(10);
  const marginY = mmToPt(15);
  const cols = 2;
  const rowsPerPage = 3;
  const pageW = mmToPt(210);
  const pageH = mmToPt(297);

  const pdfDoc = await PDFDocument.create();
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const truncate = (s: string, max: number) => (s.length > max ? s.slice(0, max) + "…" : s);

  const headerH = mmToPt(14);
  const qrSize = mmToPt(20);

  function addNewPage() {
    const p = pdfDoc.addPage([pageW, pageH]);
    p.drawText("ORIGINAL", {
      x: pageW / 2 - 60,
      y: pageH / 2 - 10,
      size: 60,
      font: fontBold,
      color: WATERMARK,
      opacity: 0.12,
      rotate: degrees(45),
    });
    return p;
  }

  let page = addNewPage();
  let col = 0;
  let row = 0;

  for (const p of marathon.participants) {
    if (col === cols) { col = 0; row++; }
    if (row === rowsPerPage) { page = addNewPage(); row = 0; col = 0; }

    const ox = marginX + col * (badgeW + colGap);
    const oy = pageH - marginY - (row + 1) * badgeH - row * rowGap;

    const qrDataUrl = await QRCode.toDataURL(p.qrToken, { width: 160, margin: 1, color: { dark: "#1e3a8a", light: "#ffffff" } });
    const qrPng = Buffer.from(qrDataUrl.split(",")[1], "base64");
    const qrImage = await pdfDoc.embedPng(qrPng);

    page.drawRectangle({ x: ox, y: oy, width: badgeW, height: badgeH, borderColor: GOLD, borderWidth: 1, color: WHITE });
    page.drawRectangle({ x: ox, y: oy + badgeH - headerH, width: badgeW, height: headerH, color: PRIMARY });
    page.drawText(truncate(denomination, 36), { x: ox + 5, y: oy + badgeH - 9, size: 6, font: fontBold, color: WHITE });
    page.drawText(truncate(marathon.titre, 44), { x: ox + 5, y: oy + badgeH - 16, size: 5, font: fontReg, color: rgb(0.8, 0.85, 1) });
    page.drawText(dateRange, { x: ox + 5, y: oy + badgeH - 22, size: 4, font: fontReg, color: rgb(0.65, 0.7, 0.9) });

    const qrX = ox + badgeW - qrSize - 5;
    const qrY = oy + 5;
    page.drawRectangle({ x: qrX - 2, y: qrY - 2, width: qrSize + 4, height: qrSize + 4, color: GOLD });
    page.drawImage(qrImage, { x: qrX, y: qrY, width: qrSize, height: qrSize });

    const nameY = oy + badgeH - headerH - 12;
    page.drawText(truncate(`${p.prenom} ${p.nom}`, 22), { x: ox + 5, y: nameY, size: 8, font: fontBold, color: PRIMARY });
    page.drawText(p.numeroId, { x: ox + 5, y: nameY - 12, size: 7, font: fontBold, color: GOLD });
    if (marathon.referenceBiblique) {
      page.drawText(truncate(marathon.referenceBiblique, 26), { x: ox + 5, y: nameY - 22, size: 5, font: fontReg, color: rgb(0.4, 0.4, 0.5) });
    }
    page.drawRectangle({ x: ox, y: oy, width: badgeW, height: 2, color: GOLD });

    col++;
  }

  const pdfBytes = await pdfDoc.save();
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="badges-${marathon.titre.replace(/\s+/g, "-")}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
