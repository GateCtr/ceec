import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth/rbac";
import { logActivity, getActeurNom } from "@/lib/activity-log";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

    const superAdmin = await isSuperAdmin(userId);
    if (!superAdmin) return NextResponse.json({ error: "Accès refusé — super admin requis" }, { status: 403 });

    const { slug } = await params;
    const eglise = await prisma.eglise.findUnique({ where: { slug } });
    if (!eglise) return NextResponse.json({ error: "Église introuvable" }, { status: 404 });

    if (eglise.statut === "actif") {
      return NextResponse.json({ error: "Déjà active" }, { status: 400 });
    }

    await prisma.$transaction([
      prisma.eglise.update({
        where: { slug },
        data: { statut: "actif" },
      }),
      prisma.membre.updateMany({
        where: { egliseId: eglise.id, statut: "suspendu", suspendedByChurch: true },
        data: { statut: "actif", suspendedByChurch: false },
      }),
    ]);

    const acteurNom = await getActeurNom(userId);
    void logActivity({
      acteurId: userId,
      acteurNom,
      action: "reactiver",
      entiteType: "eglise",
      entiteId: eglise.id,
      entiteLabel: eglise.nom,
      egliseId: eglise.id,
      egliseNom: eglise.nom,
    });

    return NextResponse.json({ ok: true, statut: "actif" });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
