import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, isAdminPlatteforme } from "@/lib/auth/rbac";
import { checkAndSendMarathonAlert } from "@/lib/marathon-alert";

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
      select: { id: true },
    });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const forceOverride = body.force === true;

    const result = await checkAndSendMarathonAlert(marathonId, forceOverride);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
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
      select: { id: true },
    });
    if (!marathon) return NextResponse.json({ error: "Marathon introuvable" }, { status: 404 });

    const alertes = await prisma.marathonAlerte.findMany({
      where: { marathonId },
      orderBy: { envoyeAt: "desc" },
    });

    return NextResponse.json({ alertes });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
