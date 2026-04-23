import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      include: { eglise: true, role: true },
    });

    if (!invite) {
      return NextResponse.json(
        { error: "Lien d'invitation invalide ou introuvable" },
        { status: 404 }
      );
    }

    if (invite.usedAt) {
      return NextResponse.json(
        {
          error: "Ce lien d'invitation a déjà été utilisé",
          slug: invite.eglise?.slug ?? null,
          egliseNom: invite.eglise?.nom ?? null,
        },
        { status: 410 }
      );
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Ce lien d'invitation a expiré (7 jours)" },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      eglise: invite.eglise
        ? {
            id: invite.eglise.id,
            nom: invite.eglise.nom,
            slug: invite.eglise.slug,
            ville: invite.eglise.ville,
            statut: invite.eglise.statut,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
