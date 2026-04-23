import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const ROLE_LABELS: Record<string, string> = {
  admin_plateforme: "Administrateur Plateforme",
  moderateur_plateforme: "Modérateur Plateforme",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      include: { role: true },
    });

    if (!invite || invite.egliseId !== null) {
      return NextResponse.json({ error: "Lien invalide ou introuvable" }, { status: 404 });
    }

    if (invite.usedAt) {
      return NextResponse.json({ error: "Ce lien a déjà été utilisé" }, { status: 410 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: "Ce lien d'invitation a expiré (7 jours)" }, { status: 410 });
    }

    return NextResponse.json({
      valid: true,
      email: invite.email,
      roleNom: invite.role?.nom ?? "",
      roleLabel: ROLE_LABELS[invite.role?.nom ?? ""] ?? invite.role?.nom ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
