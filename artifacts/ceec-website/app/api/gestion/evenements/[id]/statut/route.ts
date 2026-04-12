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
    const evtId = parseInt(id, 10);
    if (isNaN(evtId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const existing = await prisma.evenement.findUnique({
      where: { id: evtId },
      select: { egliseId: true, titre: true, statutContenu: true },
    });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
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

    const statutMap: Record<StatutAction, { statutContenu: string; publie: boolean }> = {
      soumettre:  { statutContenu: "en_attente", publie: false },
      depublier:  { statutContenu: "brouillon",  publie: false },
      publier:    { statutContenu: "publie",      publie: true  },
    };

    const { statutContenu, publie } = statutMap[action];

    const evt = await prisma.evenement.update({
      where: { id: evtId },
      data: { statutContenu, publie, commentaireRejet: action === "publier" ? null : undefined },
    });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);

    await logActivity({
      acteurId: userId,
      acteurNom,
      action: action === "soumettre" ? "soumettre" : action === "depublier" ? "depublier" : "publier",
      entiteType: "evenement",
      entiteId: evt.id,
      entiteLabel: evt.titre,
      egliseId,
      egliseNom: eglise?.nom,
    });

    return NextResponse.json(evt);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
