import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = await isSuperAdmin(userId);
    if (!superAdmin) return NextResponse.json({ error: "Accès refusé — super admin requis" }, { status: 403 });

    const { slug, id } = await params;
    const userRoleId = parseInt(id, 10);

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const userRole = await prisma.userRole.findUnique({
      where: { id: userRoleId },
    });

    if (!userRole || userRole.egliseId !== eglise.id) {
      return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });
    }

    await prisma.userRole.delete({ where: { id: userRoleId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
