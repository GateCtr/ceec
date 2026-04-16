import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import { sendInviteEmail } from "@/lib/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    if (!(await isSuperAdmin(userId))) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    const { slug } = await params;

    const eglise = await prisma.eglise.findUnique({
      where: { slug },
      include: {
        inviteTokens: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const lastToken = eglise.inviteTokens[0];
    if (!lastToken) return NextResponse.json({ error: "Aucun token d'invitation trouvé" }, { status: 404 });

    const adminRole = await prisma.role.findUnique({ where: { nom: "admin_eglise" } });
    if (!adminRole) return NextResponse.json({ error: "Rôle admin_eglise introuvable" }, { status: 500 });

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.inviteToken.updateMany({
      where: { egliseId: eglise.id, usedAt: null },
      data: { expiresAt: new Date(0) },
    });

    const newToken = await prisma.inviteToken.create({
      data: {
        egliseId: eglise.id,
        email: lastToken.email,
        roleId: adminRole.id,
        expiresAt,
      },
    });

    const emailResult = await sendInviteEmail(lastToken.email, newToken.token, eglise.nom);

    return NextResponse.json({
      success: true,
      emailEnvoye: emailResult.success,
      token: newToken.token,
      email: lastToken.email,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
