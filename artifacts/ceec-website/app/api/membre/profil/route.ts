import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { getMemberChurchRole } from "@/lib/membre-role";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const headersList = await headers();
    const slug = headersList.get("x-eglise-slug");
    if (!slug) return NextResponse.json({ error: "Contexte d'église manquant" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const membre = await prisma.membre.findFirst({
      where: { clerkUserId: userId, egliseId: eglise.id },
      include: {
        participations: {
          include: {
            evenement: {
              select: { id: true, titre: true, dateDebut: true, lieu: true, imageUrl: true, statutContenu: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!membre) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });

    const roleNom = await getMemberChurchRole(userId, eglise.id);

    const maintenant = new Date();
    const evenementsInscrits = membre.participations
      .filter((p) => p.evenement.statutContenu === "publie")
      .map((p) => ({
        id: p.evenement.id,
        titre: p.evenement.titre,
        dateDebut: p.evenement.dateDebut,
        lieu: p.evenement.lieu,
        imageUrl: p.evenement.imageUrl,
        aVenir: new Date(p.evenement.dateDebut) >= maintenant,
      }));

    return NextResponse.json({
      id: membre.id,
      nom: membre.nom,
      prenom: membre.prenom,
      email: membre.email,
      telephone: membre.telephone,
      role: roleNom,
      statut: membre.statut,
      dateAdhesion: membre.dateAdhesion,
      createdAt: membre.createdAt,
      evenementsInscrits,
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const headersList = await headers();
    const slug = headersList.get("x-eglise-slug");
    if (!slug) return NextResponse.json({ error: "Contexte d'église manquant" }, { status: 400 });

    const eglise = await prisma.eglise.findUnique({ where: { slug }, select: { id: true } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    const body = await req.json().catch(() => ({}));

    const nom = typeof body.nom === "string" ? body.nom.trim() : undefined;
    const prenom = typeof body.prenom === "string" ? body.prenom.trim() : undefined;
    const telephone = typeof body.telephone === "string" ? body.telephone.trim() || null : undefined;

    if (!nom || !prenom) {
      return NextResponse.json({ error: "Nom et prénom requis" }, { status: 400 });
    }

    const membre = await prisma.membre.findFirst({
      where: { clerkUserId: userId, egliseId: eglise.id },
    });
    if (!membre) return NextResponse.json({ error: "Membre introuvable" }, { status: 404 });

    const updated = await prisma.membre.update({
      where: { id: membre.id },
      data: { nom, prenom, ...(telephone !== undefined ? { telephone } : {}) },
      select: { id: true, nom: true, prenom: true, email: true, telephone: true, statut: true },
    });

    const roleNom = await getMemberChurchRole(userId, eglise.id);

    return NextResponse.json({ ...updated, role: roleNom });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
