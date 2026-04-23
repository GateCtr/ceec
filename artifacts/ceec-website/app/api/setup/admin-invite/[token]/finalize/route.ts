import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Vous devez être connecté pour accepter cette invitation" },
        { status: 401 }
      );
    }

    const { token } = await params;

    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      include: { role: true },
    });

    if (!invite || invite.egliseId !== null) {
      return NextResponse.json({ error: "Token invalide ou introuvable" }, { status: 404 });
    }

    if (invite.usedAt) {
      return NextResponse.json({ error: "Ce lien a déjà été utilisé" }, { status: 410 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ce lien a expiré" }, { status: 410 });
    }

    if (!invite.roleId) {
      return NextResponse.json({ error: "Token sans rôle configuré" }, { status: 400 });
    }

    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const verifiedEmails = clerkUser.emailAddresses
      .filter((ea) => ea.verification?.status === "verified")
      .map((ea) => ea.emailAddress.toLowerCase());

    if (!verifiedEmails.includes(invite.email.toLowerCase())) {
      return NextResponse.json(
        {
          error: `Ce lien est destiné à ${invite.email}. Connectez-vous avec cette adresse email.`,
        },
        { status: 403 }
      );
    }

    const existingRole = await prisma.userRole.findFirst({
      where: { clerkUserId: userId, roleId: invite.roleId, egliseId: null },
    });

    await prisma.$transaction(async (tx) => {
      await tx.inviteToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });

      if (!existingRole) {
        await tx.userRole.create({
          data: { clerkUserId: userId, roleId: invite.roleId!, egliseId: null },
        });
      }
    });

    return NextResponse.json({ success: true, redirectUrl: "/admin" });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
