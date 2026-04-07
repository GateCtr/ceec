import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";

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
    const allowed = superAdmin || await hasPermission(userId, "membres:manage", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { id } = await params;
    const membreId = parseInt(id, 10);
    const body = await req.json();

    const existing = await prisma.membre.findUnique({ where: { id: membreId }, select: { egliseId: true } });
    if (!existing || existing.egliseId !== egliseId) {
      return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });
    }

    const VALID_STATUTS = ["actif", "inactif", "suspendu"];
    const VALID_ROLES_GESTION = ["fidele", "moderateur"];

    const data: Record<string, unknown> = {};
    if (body.statut !== undefined) {
      if (!VALID_STATUTS.includes(body.statut)) {
        return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
      }
      data.statut = body.statut;
    }
    if (body.role !== undefined) {
      if (!VALID_ROLES_GESTION.includes(body.role)) {
        return NextResponse.json({ error: "Rôle invalide — seuls fidele et moderateur sont modifiables depuis la gestion des membres" }, { status: 400 });
      }
      data.role = body.role;
    }

    const membre = await prisma.membre.update({
      where: { id: membreId },
      data,
    });
    return NextResponse.json(membre);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
