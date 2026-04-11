import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { isSuperAdmin, getUserEglises, hasPermission } from "@/lib/auth/rbac";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Non autorise" }, { status: 401 });

    if (await isSuperAdmin(userId)) {
      const all = await prisma.membre.findMany({
        include: { eglise: true },
        orderBy: { nom: "asc" },
      });
      return NextResponse.json(all);
    }

    const userEglises = await getUserEglises(userId);
    if (userEglises.length === 0) {
      return NextResponse.json({ error: "Acces refuse" }, { status: 403 });
    }

    const managedEglises: number[] = [];
    for (const eglise of userEglises) {
      if (await hasPermission(userId, "eglise_gerer_membres", eglise.id)) {
        managedEglises.push(eglise.id);
      }
    }

    if (managedEglises.length === 0) {
      return NextResponse.json({ error: "Acces refuse - permission eglise_gerer_membres requise" }, { status: 403 });
    }

    const membres = await prisma.membre.findMany({
      where: { egliseId: { in: managedEglises } },
      include: { eglise: true },
      orderBy: { nom: "asc" },
    });
    return NextResponse.json(membres);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
