import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin, hasAutoPublishRole } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_voir_evenements", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const evenements = await prisma.evenement.findMany({
      where: { egliseId },
      orderBy: { dateDebut: "asc" },
    });
    return NextResponse.json(evenements);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();
    const [eglise, canAutoPublish] = await Promise.all([
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
      hasAutoPublishRole(userId, egliseId),
    ]);

    const wantsPublished = typeof body.publie === "boolean" ? body.publie : true;
    const statutContenu = canAutoPublish && wantsPublished ? "publie" : "brouillon";
    const publie = statutContenu === "publie";

    const VALID_VISIBILITES = ["public", "communaute", "prive"];
    const visibilite = body.visibilite && VALID_VISIBILITES.includes(body.visibilite) ? body.visibilite : "public";

    const evt = await prisma.evenement.create({
      data: {
        titre: body.titre,
        description: body.description ?? null,
        dateDebut: new Date(body.dateDebut),
        dateFin: body.dateFin ? new Date(body.dateFin) : null,
        lieu: body.lieu ?? null,
        egliseId,
        publie,
        statutContenu,
        imageUrl: body.imageUrl ?? null,
        categorie: body.categorie ?? null,
        lienInscription: body.lienInscription ?? null,
        visibilite,
      },
    });

    const acteurNom = await getActeurNom(userId, egliseId);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "creer",
      entiteType: "evenement",
      entiteId: evt.id,
      entiteLabel: evt.titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json(evt, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
