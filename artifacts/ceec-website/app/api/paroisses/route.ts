import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const all = await prisma.eglise.findMany({ orderBy: { nom: "asc" } });
    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    if (!await isSuperAdmin(userId)) return NextResponse.json({ error: "Acces refuse - super admin requis" }, { status: 403 });

    const body = await req.json();
    const eglise = await prisma.eglise.create({
      data: {
        nom: body.nom,
        slug: body.slug ?? null,
        ville: body.ville,
        adresse: body.adresse ?? null,
        pasteur: body.pasteur ?? null,
        telephone: body.telephone ?? null,
        email: body.email ?? null,
        description: body.description ?? null,
        photoUrl: body.photoUrl ?? null,
        statut: body.statut ?? "actif",
      },
    });
    return NextResponse.json(eglise, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
