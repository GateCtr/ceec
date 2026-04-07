import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = await isSuperAdmin(userId);
    if (!superAdmin) return NextResponse.json({ error: "Accès refusé — super admin requis" }, { status: 403 });

    const { slug } = await params;
    const eglise = await prisma.eglise.findUnique({ where: { slug } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    if (eglise.statut === "suspendu") {
      return NextResponse.json({ error: "Déjà suspendue" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.eglise.update({
        where: { slug },
        data: { statut: "suspendu" },
      }),
      prisma.membre.updateMany({
        where: { egliseId: eglise.id, statut: "actif", suspendedByChurch: false },
        data: { statut: "suspendu", suspendedByChurch: true },
      }),
    ]);

    return NextResponse.json({ ok: true, statut: "suspendu" });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
