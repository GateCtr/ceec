import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin, ROLES } from "@/lib/auth/rbac";
import { sendAdminPlatformInviteEmail } from "@/lib/email";

const ASSIGNABLE_ROLES = [ROLES.ADMIN_PLATEFORME, ROLES.MODERATEUR_PLATEFORME];
const ROLE_LABELS: Record<string, string> = {
  admin_plateforme: "Administrateur Plateforme",
  moderateur_plateforme: "Modérateur Plateforme",
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { email, roleNom } = await req.json();

    if (!email || !roleNom) {
      return NextResponse.json({ error: "email et roleNom sont requis" }, { status: 400 });
    }

    const emailNorm = email.toLowerCase().trim();

    if (!ASSIGNABLE_ROLES.includes(roleNom)) {
      return NextResponse.json({ error: "Rôle non invitable via cette interface" }, { status: 400 });
    }

    const role = await prisma.role.findUnique({ where: { nom: roleNom } });
    if (!role) return NextResponse.json({ error: "Rôle introuvable en base" }, { status: 404 });

    const existing = await prisma.inviteToken.findFirst({
      where: {
        email: emailNorm,
        roleId: role.id,
        egliseId: null,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Une invitation active existe déjà pour cet email et ce rôle." },
        { status: 409 }
      );
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const invite = await prisma.inviteToken.create({
      data: { email: emailNorm, roleId: role.id, egliseId: null, expiresAt },
    });

    const roleLabel = ROLE_LABELS[roleNom] ?? roleNom;
    await sendAdminPlatformInviteEmail(emailNorm, invite.token, roleLabel);

    return NextResponse.json(
      {
        id: invite.id,
        email: invite.email,
        roleNom,
        roleLabel,
        expiresAt: invite.expiresAt.toISOString(),
        createdAt: invite.createdAt.toISOString(),
        expired: false,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
