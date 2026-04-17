import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import QRCode from "qrcode";
import { computeMarathonDays, toDateString } from "@/lib/marathon-utils";

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

  const marathon = await prisma.marathon.findUnique({
    where: { id: marathonId },
    include: {
      eglise: { select: { nom: true, logoUrl: true } },
      participants: { orderBy: { numeroId: "asc" } },
    },
  });

  if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

  const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
  const dateFin = allDays[allDays.length - 1] ?? marathon.dateDebut;
  const denomination = marathon.denomination ?? marathon.eglise.nom;
  const titre = marathon.titre;
  const dateRange = `${toDateString(marathon.dateDebut)} – ${toDateString(dateFin)}`;

  const badgeCards = await Promise.all(
    marathon.participants.map(async (p) => {
      const qrDataUrl = await QRCode.toDataURL(p.qrToken, {
        width: 150,
        margin: 1,
        color: { dark: "#1e3a8a", light: "#ffffff" },
      });
      return `
      <div class="badge">
        <div class="badge-header">
          <div class="badge-title">${denomination}</div>
          <div class="badge-subtitle">${titre}</div>
        </div>
        <div class="badge-body">
          <img src="${qrDataUrl}" alt="QR" class="qr-img" />
          <div class="badge-info">
            <div class="participant-name">${p.prenom} ${p.nom}</div>
            <div class="participant-id">${p.numeroId}</div>
            <div class="participant-dates">${dateRange}</div>
          </div>
        </div>
      </div>`;
    })
  );

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<title>Planche de badges – ${titre}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; background: #f5f5f5; }
  @media print {
    body { background: white; }
    .no-print { display: none !important; }
    .grid { gap: 4mm; padding: 5mm; }
    .badge { break-inside: avoid; page-break-inside: avoid; }
  }
  .no-print {
    background: #1e3a8a;
    color: white;
    padding: 12px 20px;
    text-align: center;
    font-size: 14px;
  }
  .no-print button {
    margin-left: 16px;
    padding: 8px 20px;
    background: #c59b2e;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8mm;
    padding: 10mm;
    max-width: 210mm;
    margin: 0 auto;
  }
  .badge {
    border: 2px solid #1e3a8a;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    page-break-inside: avoid;
  }
  .badge-header {
    background: #1e3a8a;
    color: white;
    padding: 6px 10px;
    text-align: center;
  }
  .badge-title { font-weight: bold; font-size: 11px; }
  .badge-subtitle { font-size: 9px; opacity: 0.8; margin-top: 2px; }
  .badge-body {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
  }
  .qr-img { width: 70px; height: 70px; flex-shrink: 0; }
  .badge-info { flex: 1; min-width: 0; }
  .participant-name { font-weight: bold; font-size: 11px; color: #1e3a8a; line-height: 1.2; }
  .participant-id { font-size: 10px; color: #c59b2e; font-weight: 600; margin-top: 3px; }
  .participant-dates { font-size: 8px; color: #666; margin-top: 3px; }
</style>
</head>
<body>
<div class="no-print">
  Planche de badges — ${marathon.participants.length} participant(s)
  <button onclick="window.print()">Imprimer / Enregistrer en PDF</button>
</div>
<div class="grid">
  ${badgeCards.join("\n")}
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
