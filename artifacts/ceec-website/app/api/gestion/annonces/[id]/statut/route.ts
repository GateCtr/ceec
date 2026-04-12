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

const VALID_ACTIONS = ["soumettre", "depublier", "publier"] as const;
type StatutAction = (typeof VALID_ACTIONS)[number];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || (await hasPermission(userId, "eglise_creer_annonce", egliseId));
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const annonceId = parseInt(id, 10);
    if (isNaN(annonceId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const existing = await prisma.annonce.findUnique({
      where: { id: annonceId },
      select: { egliseId: true, titre: true, statutContenu: true },
    });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
    }

    const body = await req.json();
    const action: StatutAction = body.action;
    if (!VALID_ACTIONS.includes(action)) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    if (action === "publier") {
      const canAutoPublish = await hasAutoPublishRole(userId, egliseId);
      if (!canAutoPublish) {
        return NextResponse.json({ error: "Vous n'avez pas le droit de publier directement." }, { status: 403 });
      }
    }

    const statutMap: Record<StatutAction, { statutContenu: "en_attente" | "brouillon" | "publie"; publie: boolean }> = {
      soumettre:  { statutContenu: "en_attente", publie: false },
      depublier:  { statutContenu: "brouillon",  publie: false },
      publier:    { statutContenu: "publie",      publie: true  },
    };

    const { statutContenu, publie } = statutMap[action];

    const annonce = await prisma.annonce.update({
      where: { id: annonceId },
      data: { statutContenu, publie, commentaireRejet: action === "publier" ? null : undefined },
    });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);

    const actionLog = action === "soumettre" ? "soumettre" : action === "depublier" ? "depublier" : "publier";
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: actionLog,
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
