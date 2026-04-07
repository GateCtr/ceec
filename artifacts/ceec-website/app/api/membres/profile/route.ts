import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const body = await req.json();
    const egliseId = body.egliseId ?? body.paroisseId ?? null;

    const existing = await prisma.membre.findFirst({
      where: { clerkUserId: userId, egliseId: egliseId ?? undefined },
    });
    if (existing) {
      return NextResponse.json({ error: "Profil deja existant pour cette eglise" }, { status: 409 });
    }

    const newMembre = await prisma.membre.create({
      data: {
        clerkUserId: userId,
        nom: body.nom,
        prenom: body.prenom,
        email: body.email,
        telephone: body.telephone ?? null,
        egliseId,
        role: "fidele",
        statut: "actif",
      },
    });
    return NextResponse.json(newMembre, { status: 201 });
  } catch (error) {
    console.error("Error creating membre:", error);
    return NextResponse.json({ error: "Erreur lors de la creation du profil" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    const body = await req.json();
    const egliseId = body.egliseId ?? body.paroisseId ?? null;

    const existing = await prisma.membre.findFirst({
      where: { clerkUserId: userId, egliseId: egliseId ?? undefined },
    });

    if (existing) {
      const updated = await prisma.membre.update({
        where: { id: existing.id },
        data: {
          nom: body.nom,
          prenom: body.prenom,
          email: body.email,
          telephone: body.telephone ?? null,
          egliseId,
        },
      });
      return NextResponse.json(updated);
    } else {
      const created = await prisma.membre.create({
        data: {
          clerkUserId: userId,
          nom: body.nom,
          prenom: body.prenom,
          email: body.email,
          telephone: body.telephone ?? null,
          egliseId,
          role: "fidele",
          statut: "actif",
        },
      });
      return NextResponse.json(created, { status: 201 });
    }
  } catch (error) {
    console.error("Error updating membre:", error);
    return NextResponse.json({ error: "Erreur lors de la mise a jour du profil" }, { status: 500 });
  }
}
