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
    const allowed = superAdmin || await hasPermission(userId, "eglise_voir_annonces", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const annonces = await prisma.annonce.findMany({
      where: { egliseId },
      orderBy: { datePublication: "desc" },
    });
    return NextResponse.json(annonces);
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

    if (!body.titre || !body.contenu) {
      return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
    }

    const VALID_PRIORITES = ["basse", "normale", "haute", "urgente"];
    const priorite = body.priorite ?? "normale";
    if (!VALID_PRIORITES.includes(priorite)) {
      return NextResponse.json({ error: "Priorité invalide" }, { status: 400 });
    }

    const [membre, eglise, canAutoPublish] = await Promise.all([
      prisma.membre.findFirst({ where: { clerkUserId: userId, egliseId } }),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
      hasAutoPublishRole(userId, egliseId),
    ]);

    const wantsPublished = typeof body.publie === "boolean" ? body.publie : true;
    const statutContenu = canAutoPublish && wantsPublished ? "publie" : "brouillon";
    const publie = statutContenu === "publie";

    const VALID_VISIBILITES = ["public", "communaute", "prive"];
    const visibilite = body.visibilite && VALID_VISIBILITES.includes(body.visibilite) ? body.visibilite : "public";

    const annonce = await prisma.annonce.create({
      data: {
        titre: body.titre,
        contenu: body.contenu,
        egliseId,
        auteurId: membre?.id ?? null,
        priorite,
        publie,
        statutContenu,
        dateExpiration: body.dateExpiration ? new Date(body.dateExpiration) : null,
        imageUrl: body.imageUrl ?? null,
        videoUrl: body.videoUrl ?? null,
        categorie: body.categorie ?? null,
        visibilite,
      },
    });

    const acteurNom = membre ? `${membre.prenom} ${membre.nom}` : await getActeurNom(userId, egliseId);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "creer",
      entiteType: "annonce",
      entiteId: annonce.id,
      entiteLabel: annonce.titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json(annonce, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
