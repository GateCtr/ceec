import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "eglise_gerer_roles", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const userRoleId = parseInt(id, 10);

    const userRole = await prisma.userRole.findUnique({
      where: { id: userRoleId },
      include: { role: true },
    });

    if (!userRole || userRole.egliseId !== egliseId) {
      return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });
    }

    if (userRole.clerkUserId === userId) {
      return NextResponse.json({ error: "Vous ne pouvez pas révoquer votre propre accès" }, { status: 400 });
    }

    await prisma.userRole.delete({ where: { id: userRoleId } });

    const [acteurNom, eglise] = await Promise.all([
      getActeurNom(userId, egliseId),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);
    void logActivity({
      acteurId: userId,
      acteurNom,
      action: "revoquer",
      entiteType: "role",
      entiteLabel: userRole.role.nom,
      egliseId,
      egliseNom: eglise?.nom,
      metadata: { revokedClerkUserId: userRole.clerkUserId, roleNom: userRole.role.nom },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
