import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { sendParticipationConfirmationEmail } from "@/lib/email";

type Props = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Props) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const headersList = await headers();
    const slug = headersList.get("x-eglise-slug");
    if (!slug) return NextResponse.json({ error: "Contexte d'église manquant" }, { status: 400 });

    const { id } = await params;
    const evenementId = parseInt(id, 10);
    if (isNaN(evenementId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const membre = await prisma.membre.findFirst({
      where: { clerkUserId: userId, egliseId: eglise.id },
    });
    if (!membre) return NextResponse.json({ error: "Vous devez être membre de cette église pour vous inscrire" }, { status: 403 });

    const evt = await prisma.evenement.findFirst({
      where: { id: evenementId, egliseId: eglise.id, statutContenu: "publie" },
    });
    if (!evt) return NextResponse.json({ error: "Événement introuvable" }, { status: 404 });
    if (new Date(evt.dateDebut) < new Date()) {
      return NextResponse.json({ error: "Impossible de s'inscrire à un événement passé" }, { status: 400 });
    }

    const participation = await prisma.participation.upsert({
      where: { membreId_evenementId: { membreId: membre.id, evenementId } },
      update: {},
      create: { membreId: membre.id, evenementId },
    });

    // Confirmation email to member (fire and forget)
    if (membre.email) {
      const egliseNom = (await prisma.eglise.findUnique({ where: { id: eglise.id }, select: { nom: true } }))?.nom;
      void sendParticipationConfirmationEmail(
        membre.email,
        membre.prenom,
        evt.titre,
        evt.dateDebut,
        evt.lieu,
        egliseNom
      ).catch((err) => console.error("Email confirmation error:", err));
    }

    return NextResponse.json({ success: true, participationId: participation.id });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const headersList = await headers();
    const slug = headersList.get("x-eglise-slug");
    if (!slug) return NextResponse.json({ error: "Contexte d'église manquant" }, { status: 400 });

    const { id } = await params;
    const evenementId = parseInt(id, 10);
    if (isNaN(evenementId)) return NextResponse.json({ error: "ID invalide" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const membre = await prisma.membre.findFirst({
      where: { clerkUserId: userId, egliseId: eglise.id },
    });
    if (!membre) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });

    await prisma.participation.deleteMany({
      where: { membreId: membre.id, evenementId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
