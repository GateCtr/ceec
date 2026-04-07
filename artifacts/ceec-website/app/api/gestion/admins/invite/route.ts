import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { hasPermission, isSuperAdmin } from "@/lib/auth/rbac";
import { sendInviteEmail } from "@/lib/email";

async function getEgliseId(req: NextRequest): Promise<number | null> {
  const h = req.headers.get("x-eglise-id");
  if (!h) return null;
  const id = parseInt(h, 10);
  return isNaN(id) ? null : id;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const egliseId = await getEgliseId(req);
    if (!egliseId) return NextResponse.json({ error: "Église introuvable" }, { status: 400 });

    const superAdmin = await isSuperAdmin(userId);
    const allowed = superAdmin || await hasPermission(userId, "admins:manage", egliseId);
    if (!allowed) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const body = await req.json();
    const { email, roleNom } = body;
    if (!email || !roleNom) return NextResponse.json({ error: "Email et rôle requis" }, { status: 400 });

    const allowedRoles = ["moderateur", "admin_eglise"];
    if (!allowedRoles.includes(roleNom)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    const [role, eglise] = await Promise.all([
      prisma.role.findUnique({ where: { nom: roleNom } }),
      prisma.eglise.findUnique({ where: { id: egliseId }, select: { nom: true } }),
    ]);

    if (!role) return NextResponse.json({ error: "Rôle introuvable" }, { status: 404 });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invite = await prisma.inviteToken.create({
      data: {
        email,
        egliseId,
        roleId: role.id,
        expiresAt,
      },
    });

    const emailResult = await sendInviteEmail(email, invite.token, eglise.nom);
    if (!emailResult.success) {
      console.warn("Email d'invitation non envoyé :", emailResult.error);
    }

    return NextResponse.json(
      { token: invite.token, email: invite.email, expiresAt: invite.expiresAt, emailEnvoye: emailResult.success },
      { status: 201 }
    );
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
