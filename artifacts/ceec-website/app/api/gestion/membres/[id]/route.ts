import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";
import { setMemberChurchRole, getMemberChurchRole } from "@/lib/membre-role";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_membres", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const membreId = parseInt(id, 10);
    const body = await req.json();

    const existing = await prisma.membre.findUnique({
      where: { id: membreId },
      select: { egliseId: true, nom: true, prenom: true, statut: true, clerkUserId: true },
    });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
    }

    const VALID_STATUTS = ["actif", "inactif", "suspendu"];
    const VALID_ROLES_GESTION = ["fidele", "diacre", "secretaire", "tresorier"];

    const membreData: Record<string, unknown> = {};
    let newRoleNom: string | undefined;

    if (body.statut !== undefined) {
      if (!VALID_STATUTS.includes(body.statut)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      membreData.statut = body.statut;
    }

    if (body.role !== undefined) {
      if (!VALID_ROLES_GESTION.includes(body.role)) {
        return NextResponse.json({
          error: "Rôle invalide — utilisez la page Admins pour les rôles supérieurs",
        }, { status: 400 });
      }
      newRoleNom = body.role as string;
    }

    const membre = await prisma.membre.update({
      where: { id: membreId },
      data: membreData,
    });

    if (newRoleNom) {
      await setMemberChurchRole(existing.clerkUserId, egliseId, newRoleNom);
    }

    const roleNom = newRoleNom ?? await getMemberChurchRole(existing.clerkUserId, egliseId);

    const membreLabel = `${existing.prenom} ${existing.nom}`;
    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);

    const action = body.statut === "suspendu" ? "suspendre"
      : body.statut === "actif" && existing.statut === "suspendu" ? "reactiver"
      : "modifier";

    await logActivity({
      acteurId: userId,
      acteurNom,
      action,
      entiteType: "membre",
      entiteId: membreId,
      entiteLabel: membreLabel,
      egliseId,
      egliseNom: eglise?.nom,
      metadata: { changes: { ...membreData, ...(newRoleNom ? { role: newRoleNom } : {}) } },
    });

    return NextResponse.json({ ...membre, roleNom });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
