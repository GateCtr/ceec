import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin, isPlatformAdmin } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = await isSuperAdmin(userId);
    const platformAdmin = superAdmin || (await isPlatformAdmin(userId));
    if (!platformAdmin) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const body = await req.json();
    const { type, action, commentaire } = body as {
      type: "annonce" | "evenement";
      action: "approuver" | "rejeter";
      commentaire?: string;
    };

    if (!type || !action) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }
    if (!["annonce", "evenement"].includes(type)) {
      return NextResponse.json({ error: "Type invalide" }, { status: 400 });
    }
    if (!["approuver", "rejeter"].includes(action)) {
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
    }

    const estApprouve = action === "approuver";
    const newStatut = estApprouve ? "publie" : "rejete";
    const newPublie = estApprouve;
    const newCommentaire = estApprouve ? null : (commentaire ?? "Rejeté par l'administration.");

    let egliseId: number | null = null;
    let egliseNom: string | undefined;
    let entiteLabel: string | undefined;

    if (type === "annonce") {
      const existing = await prisma.annonce.findUnique({ where: { id }, select: { statutContenu: true } });
      if (!existing) return NextResponse.json({ error: "Annonce introuvable" }, { status: 404 });
      if (existing.statutContenu !== "en_attente") {
        return NextResponse.json({ error: "Ce contenu n'est pas en attente de validation" }, { status: 409 });
      }
      const annonce = await prisma.annonce.update({
        where: { id },
        data: {
          statutContenu: newStatut,
          publie: newPublie,
          commentaireRejet: newCommentaire,
        },
      });
      egliseId = annonce.egliseId;
      entiteLabel = annonce.titre;
      if (egliseId) {
        const eg = await prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } });
        egliseNom = eg?.nom;
      }
    } else {
      const existing = await prisma.evenement.findUnique({ where: { id }, select: { statutContenu: true } });
      if (!existing) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
      if (existing.statutContenu !== "en_attente") {
        return NextResponse.json({ error: "Ce contenu n'est pas en attente de validation" }, { status: 409 });
      }
      const evt = await prisma.evenement.update({
        where: { id },
        data: {
          statutContenu: newStatut,
          publie: newPublie,
          commentaireRejet: newCommentaire,
        },
      });
      egliseId = evt.egliseId;
      entiteLabel = evt.titre;
      if (egliseId) {
        const eg = await prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } });
        egliseNom = eg?.nom;
      }
    }

    const acteurNom = await getActeurNom(userId);
    await logActivity({
      acteurId: userId,
      acteurNom,
      action: estApprouve ? "approuver" : "rejeter",
      entiteType: type,
      entiteId: id,
      entiteLabel,
      egliseId: egliseId ?? undefined,
      egliseNom,
    });

    return NextResponse.json({ ok: true, statut: newStatut });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
