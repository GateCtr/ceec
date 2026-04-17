import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { computeMarathonDays, toDateString, generateAccessCode } from "@/lib/marathon-utils";

function getEgliseId(req: NextRequest): number | null {
  const h = req.headers.get("x-eglise-id");
  if (h) { const id = parseInt(h, 10); return isNaN(id) ? null : id; }
  const qp = new URL(req.url).searchParams.get("egliseId");
  if (qp) { const id = parseInt(qp, 10); return isNaN(id) ? null : id; }
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const egliseId = getEgliseId(req);
  if (!egliseId) return NextResponse.json({ error: "Contexte manquant" }, { status: 400 });

  const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
  const allowed = superAdmin || (await hasPermission(userId, "eglise_creer_evenement", egliseId));
  if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const marathonId = parseInt(id, 10);

  const today = toDateString(new Date());
  const todayStart = new Date(today);
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const session = await prisma.marathonSession.findFirst({
    where: { marathonId, date: { gte: todayStart, lt: todayEnd } },
  });

  return NextResponse.json({ session: session ?? null, today });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const egliseId = getEgliseId(req);
  if (!egliseId) return NextResponse.json({ error: "Contexte manquant" }, { status: 400 });

  const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
  const allowed = superAdmin || (await hasPermission(userId, "eglise_creer_evenement", egliseId));
  if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const marathonId = parseInt(id, 10);

  const body = await req.json().catch(() => ({}));
  const { nomControleur } = body as { nomControleur?: string };

  const marathon = await prisma.marathon.findFirst({ where: { id: marathonId, ...(superAdmin ? {} : { egliseId }) } });
  if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });
  if (marathon.statut !== "ouvert") return NextResponse.json({ error: "Marathon clos" }, { status: 403 });

  const allDays = computeMarathonDays(marathon.dateDebut, marathon.nombreJours, marathon.joursExclus);
  const today = toDateString(new Date());
  const todayIdx = allDays.findIndex((d) => toDateString(d) === today);
  if (todayIdx === -1) return NextResponse.json({ error: "Pas de marathon aujourd'hui" }, { status: 400 });

  const numeroJour = todayIdx + 1;
  const todayDate = allDays[todayIdx];
  const todayStart = new Date(today);
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  const existingSession = await prisma.marathonSession.findFirst({
    where: { marathonId, date: { gte: todayStart, lt: todayEnd } },
  });

  if (existingSession) {
    return NextResponse.json({
      session: existingSession,
      numeroJour,
      date: today,
      alreadyExists: true,
    });
  }

  const codeAcces = generateAccessCode();
  const session = await prisma.marathonSession.create({
    data: { marathonId, date: todayDate, numeroJour, codeAcces, nomControleur: nomControleur ?? null },
  });

  return NextResponse.json({ session, numeroJour, date: today, alreadyExists: false });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const egliseId = getEgliseId(req);
  if (!egliseId) return NextResponse.json({ error: "Contexte manquant" }, { status: 400 });

  const superAdmin = (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
  const allowed = superAdmin || (await hasPermission(userId, "eglise_creer_evenement", egliseId));
  if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const { id } = await params;
  const marathonId = parseInt(id, 10);

  const today = toDateString(new Date());
  const todayStart = new Date(today);
  const todayEnd = new Date(todayStart.getTime() + 86400000);

  await prisma.marathonSession.deleteMany({
    where: { marathonId, date: { gte: todayStart, lt: todayEnd } },
  });

  return NextResponse.json({ ok: true });
}
