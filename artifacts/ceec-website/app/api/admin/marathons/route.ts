import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdminPlatteforme, isSuperAdmin } from "@/lib/auth/rbac";

async function checkAccess(userId: string) {
  return (await isSuperAdmin(userId)) || (await isAdminPlatteforme(userId));
}

export async function GET() {
  const { userId } = await auth();
  if (!userId || !(await checkAccess(userId))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const marathons = await prisma.marathon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      eglise: { select: { id: true, nom: true, slug: true, ville: true } },
      _count: { select: { participants: true } },
    },
  });

  return NextResponse.json(marathons);
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId || !(await checkAccess(userId))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { egliseId, titre, theme, referenceBiblique, dateDebut, nombreJours, denomination, joursExclus } = body;

  if (!egliseId || !titre || !dateDebut || !nombreJours) {
    return NextResponse.json({ error: "egliseId, titre, dateDebut et nombreJours sont requis" }, { status: 400 });
  }

  const eglise = await prisma.eglise.findUnique({ where: { id: Number(egliseId) } });
  if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

  const marathon = await prisma.marathon.create({
    data: {
      egliseId: Number(egliseId),
      titre,
      theme: theme || null,
      referenceBiblique: referenceBiblique || null,
      dateDebut: new Date(dateDebut),
      nombreJours: Number(nombreJours),
      denomination: denomination || null,
      joursExclus: joursExclus ?? [],
      statut: "ouvert",
      createdByUserId: userId,
    },
  });

  return NextResponse.json(marathon, { status: 201 });
}
