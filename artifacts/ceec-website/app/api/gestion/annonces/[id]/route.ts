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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const annonceId = parseInt(id, 10);

    const existing = await prisma.annonce.findUnique({ where: { id: annonceId }, select: { egliseId: true, titre: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    const body = await req.json();

    const VALID_PRIORITES = ["basse", "normale", "haute", "urgente"];
    if (body.priorite !== undefined && !VALID_PRIORITES.includes(body.priorite)) {
      return NextResponse.json({ error: "Priorité invalide" }, { status: 400 });
    }

    const canAutoPublish = superAdmin || await hasAutoPublishRole(userId, egliseId);
    let publishUpdate: { publie?: boolean; statutContenu?: "publie" | "brouillon" } = {};
    if (typeof body.publie === "boolean") {
      if (body.publie && canAutoPublish) {
        publishUpdate = { publie: true, statutContenu: "publie" };
      } else if (!body.publie) {
        publishUpdate = { publie: false, statutContenu: "brouillon" };
      }
    }

    const VALID_VISIBILITES = ["public", "communaute", "prive"];
    if (body.visibilite !== undefined && !VALID_VISIBILITES.includes(body.visibilite)) {
      return NextResponse.json({ error: "Visibilité invalide" }, { status: 400 });
    }
    const visibiliteUpdate = body.visibilite ? { visibilite: body.visibilite } : {};

    const annonce = await prisma.annonce.update({
      where: { id: annonceId },
      data: {
        titre: body.titre,
        contenu: body.contenu,
        priorite: body.priorite,
        ...publishUpdate,
        ...visibiliteUpdate,
        dateExpiration: body.dateExpiration ? new Date(body.dateExpiration) : null,
        imageUrl: body.imageUrl !== undefined ? (body.imageUrl || null) : undefined,
        videoUrl: body.videoUrl !== undefined ? (body.videoUrl || null) : undefined,
        categorie: body.categorie !== undefined ? (body.categorie || null) : undefined,
      },
    });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "modifier",
      entiteType: "annonce",
      entiteId: annonce.id,
      entiteLabel: annonce.titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json(annonce);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_creer_annonce", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const annonceId = parseInt(id, 10);

    const existing = await prisma.annonce.findUnique({ where: { id: annonceId }, select: { egliseId: true, titre: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    const titre = existing.titre;
    await prisma.annonce.delete({ where: { id: annonceId } });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: "supprimer",
      entiteType: "annonce",
      entiteId: annonceId,
      entiteLabel: titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
