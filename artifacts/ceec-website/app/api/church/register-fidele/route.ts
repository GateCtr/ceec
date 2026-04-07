import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const headersList = await headers();
    const slug = headersList.get("x-eglise-slug");

    if (!slug) {
      return NextResponse.json(
        { error: "Contexte d'église introuvable" },
        { status: 400 }
      );
    }

    const eglise = await prisma.eglise.findUnique({
      where: { slug },
      select: { id: true, statut: true },
    });

    if (!eglise || eglise.statut !== "actif") {
      return NextResponse.json(
        { error: "Église introuvable ou inactive" },
        { status: 404 }
      );
    }

    const egliseId = eglise.id;
    const body = await req.json();

    const fideleRole = await prisma.role.findFirst({
      where: { nom: "fidele" },
    });

    await prisma.$transaction(async (tx) => {
      await tx.membre.upsert({
        where: {
          membre_clerk_eglise_unique: { clerkUserId: userId, egliseId },
        },
        update: {},
        create: {
          clerkUserId: userId,
          nom: body.nom ?? "",
          prenom: body.prenom ?? "",
          email: body.email ?? "",
          egliseId,
          role: "fidele",
          statut: "actif",
        },
      });

      if (fideleRole) {
        await tx.userRole.upsert({
          where: {
            user_role_unique: {
              clerkUserId: userId,
              roleId: fideleRole.id,
              egliseId,
            },
          },
          update: {},
          create: {
            clerkUserId: userId,
            roleId: fideleRole.id,
            egliseId,
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
