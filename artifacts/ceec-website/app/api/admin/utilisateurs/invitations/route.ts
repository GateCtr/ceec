import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin, ROLES } from "@/lib/auth/rbac";

const ROLE_LABELS: Record<string, string> = {
  admin_plateforme: "Administrateur Plateforme",
  moderateur_plateforme: "Modérateur Plateforme",
};

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const invites = await prisma.inviteToken.findMany({
      where: {
        egliseId: null,
        usedAt: null,
        role: { nom: { in: [ROLES.ADMIN_PLATEFORME, ROLES.MODERATEUR_PLATEFORME] } },
      },
      include: { role: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      invites.map((inv) => ({
        id: inv.id,
        email: inv.email,
        roleNom: inv.role?.nom ?? "",
        roleLabel: ROLE_LABELS[inv.role?.nom ?? ""] ?? inv.role?.nom ?? "",
        expiresAt: inv.expiresAt.toISOString(),
        createdAt: inv.createdAt.toISOString(),
        expired: inv.expiresAt < new Date(),
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { inviteId } = await req.json();
    if (!inviteId) return NextResponse.json({ error: "inviteId requis" }, { status: 400 });

    const invite = await prisma.inviteToken.findUnique({ where: { id: inviteId } });
    if (!invite) return NextResponse.json({ error: "Invitation introuvable" }, { status: 404 });
    if (invite.egliseId !== null) {
      return NextResponse.json({ error: "Cette invitation concerne une église" }, { status: 403 });
    }

    await prisma.inviteToken.delete({ where: { id: inviteId } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
